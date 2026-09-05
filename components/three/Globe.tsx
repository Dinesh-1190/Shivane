'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * The globe body: three concentric layers that together read as a machined
 * glass object rather than a planet.
 *
 *   1. Core      — a dark, near-opaque sphere so the far side of the wireframe
 *                  reads as "behind glass" instead of floating.
 *   2. Graticule — the latitude/longitude wireframe. Line brightness is driven
 *                  by how much each segment faces the camera, which is what
 *                  gives the object its volume.
 *   3. Atmosphere— a back-side fresnel shell providing the cool rim light.
 *
 * There are no scene lights: every layer is a hand-written shader. That keeps
 * the whole object at a handful of draw calls and makes its look completely
 * deterministic across devices.
 */

const CORE_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  uniform float uOpacity;

  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    // Fresnel: 0 facing the camera, 1 at the silhouette.
    float fresnel = 1.0 - clamp(dot(vNormalW, vViewDir), 0.0, 1.0);
    fresnel = pow(fresnel, 2.6);

    // A soft top-left key so the sphere is not perfectly flat.
    float key = clamp(dot(vNormalW, normalize(vec3(-0.4, 0.8, 0.6))), 0.0, 1.0);

    vec3 color = uCore + uRim * fresnel * 0.85 + uCore * key * 0.35;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

const GRATICULE_VERT = /* glsl */ `
  varying float vFacing;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    // On a sphere centred at the origin the position doubles as the normal.
    vec3 normalW = normalize(mat3(modelMatrix) * normalize(position));
    vec3 viewDir = normalize(cameraPosition - worldPosition.xyz);
    vFacing = dot(normalW, viewDir);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const GRATICULE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uFrontAlpha;
  uniform float uBackAlpha;
  uniform float uOpacity;

  varying float vFacing;

  void main() {
    // Segments pointing away from the camera drop back but stay faintly
    // visible — that read-through is what sells the object as glass.
    float front = smoothstep(-0.2, 0.6, vFacing);
    float alpha = mix(uBackAlpha, uFrontAlpha, front);

    // Segments near the silhouette (facing ~ 0) get a lift so the outer edge
    // of the sphere stays crisply drawn.
    float rim = 1.0 - abs(vFacing);
    alpha += pow(rim, 3.0) * 0.5;

    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`;

const ATMOSPHERE_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const ATMOSPHERE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uOpacity;

  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    // Rendered on the back faces, so the normal points away from the camera.
    float fresnel = clamp(dot(vNormalW, vViewDir), 0.0, 1.0);

    // A high exponent keeps the glow pinned to the silhouette. At lower
    // exponents it spreads across the whole disc and the object stops reading
    // as machined glass and starts reading as a planet with an atmosphere.
    float glow = pow(1.0 - fresnel, 7.0);

    // Clip the inner falloff so no wash survives across the face of the sphere.
    glow *= smoothstep(0.0, 0.22, glow);

    gl_FragColor = vec4(uColor, glow * uIntensity * uOpacity);
  }
`;

/**
 * Builds the wireframe as a single LineSegments buffer.
 *
 * `parallels` rings run east–west, `meridians` run pole to pole. One buffer
 * means one draw call for the entire wireframe.
 */
function useGraticuleGeometry(radius: number, parallels: number, meridians: number, segments: number) {
  return useMemo(() => {
    const points: number[] = [];

    const pushSegment = (a: THREE.Vector3, b: THREE.Vector3) => {
      points.push(a.x, a.y, a.z, b.x, b.y, b.z);
    };

    // Parallels — skipped at the poles where they collapse to a point.
    for (let i = 1; i < parallels; i += 1) {
      const phi = (i / parallels) * Math.PI;
      const y = Math.cos(phi) * radius;
      const ringRadius = Math.sin(phi) * radius;

      let previous: THREE.Vector3 | null = null;
      for (let j = 0; j <= segments; j += 1) {
        const theta = (j / segments) * Math.PI * 2;
        const current = new THREE.Vector3(
          Math.cos(theta) * ringRadius,
          y,
          Math.sin(theta) * ringRadius,
        );
        if (previous) pushSegment(previous, current);
        previous = current;
      }
    }

    // Meridians.
    for (let i = 0; i < meridians; i += 1) {
      const theta = (i / meridians) * Math.PI * 2;
      let previous: THREE.Vector3 | null = null;
      for (let j = 0; j <= segments; j += 1) {
        const phi = (j / segments) * Math.PI;
        const current = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * radius,
          Math.cos(phi) * radius,
          Math.sin(phi) * Math.sin(theta) * radius,
        );
        if (previous) pushSegment(previous, current);
        previous = current;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return geometry;
  }, [radius, parallels, meridians, segments]);
}

export type GlobeProps = {
  radius?: number;
  /** Ring/meridian resolution, lowered on weaker devices. */
  segments?: number;
};

export function Globe({ radius = 1, segments = 64 }: GlobeProps) {
  const graticule = useGraticuleGeometry(radius, 12, 18, Math.max(24, segments));

  const coreUniforms = useMemo(
    () => ({
      uCore: { value: new THREE.Color('#080c11') },
      uRim: { value: new THREE.Color('#2f4a61') },
      uOpacity: { value: 0.94 },
    }),
    [],
  );

  const graticuleUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#7d98ad') },
      uFrontAlpha: { value: 0.42 },
      uBackAlpha: { value: 0.07 },
      uOpacity: { value: 1 },
    }),
    [],
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color('#5b7f9e') },
      uIntensity: { value: 0.32 },
      uOpacity: { value: 1 },
    }),
    [],
  );

  return (
    <group>
      {/* 1. Core — drawn first, writes depth so the far wireframe is occluded
          only partially (the material is slightly transparent). */}
      <mesh>
        <sphereGeometry args={[radius * 0.995, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={coreUniforms}
          transparent
        />
      </mesh>

      {/* 2. Graticule — additive so overlapping lines build brightness at the
          poles, exactly like a drafted engineering globe. */}
      <lineSegments geometry={graticule}>
        <shaderMaterial
          vertexShader={GRATICULE_VERT}
          fragmentShader={GRATICULE_FRAG}
          uniforms={graticuleUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Atmosphere — back faces only, giving a rim that reads as light
          wrapping around the object rather than an outline stroke. */}
      <mesh scale={1.022}>
        <sphereGeometry args={[radius, segments, segments / 2]} />
        <shaderMaterial
          vertexShader={ATMOSPHERE_VERT}
          fragmentShader={ATMOSPHERE_FRAG}
          uniforms={atmosphereUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
