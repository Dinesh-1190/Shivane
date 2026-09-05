'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CITIES } from '@/lib/content';
import { latLngToVector3 } from '@/lib/geo';

/**
 * City anchors: a solid brass point with a slow expanding ring, one per city.
 *
 * Both are drawn as camera-facing sprites in a single instanced pass. Rings
 * expand and fade on a staggered loop so the four cities breathe independently
 * rather than blinking together.
 */

const MARKER_VERT = /* glsl */ `
  attribute vec3 aOrigin;
  attribute float aPhase;

  uniform float uTime;
  uniform float uRingScale;

  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    // Ring life cycle: 0 -> 1, restarting per marker at a staggered phase.
    float life = fract(uTime * 0.32 + aPhase);
    float scale = mix(0.012, uRingScale, life);
    // Fade in quickly, out slowly — a sonar ping, not a strobe.
    vAlpha = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.15, 1.0, life));

    // Billboard: build the quad in view space so it always faces the camera.
    vec4 originView = modelViewMatrix * vec4(aOrigin, 1.0);
    originView.xy += position.xy * scale;

    gl_Position = projectionMatrix * originView;
  }
`;

const MARKER_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    // Annulus: bright at the circumference, hollow inside.
    float d = length(vUv - 0.5) * 2.0;
    float ring = smoothstep(0.75, 0.98, d) * (1.0 - smoothstep(0.98, 1.0, d));
    float alpha = ring * vAlpha * uOpacity;
    if (alpha < 0.001) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

type CityMarkersProps = {
  radius?: number;
};

export function CityMarkers({ radius = 1 }: CityMarkersProps) {
  const ringMaterial = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(
    () => CITIES.map((city) => latLngToVector3(city.lat, city.lng, radius * 1.002)),
    [radius],
  );

  // Instanced ring geometry: one unit quad, one instance per city.
  const ringGeometry = useMemo(() => {
    const geometry = new THREE.InstancedBufferGeometry();
    const quad = new THREE.PlaneGeometry(1, 1);

    geometry.index = quad.index;
    geometry.attributes.position = quad.attributes.position;
    geometry.attributes.uv = quad.attributes.uv;

    const origins = new Float32Array(positions.length * 3);
    const phases = new Float32Array(positions.length);
    positions.forEach((point, index) => {
      origins.set([point.x, point.y, point.z], index * 3);
      phases[index] = index / positions.length;
    });

    geometry.setAttribute('aOrigin', new THREE.InstancedBufferAttribute(origins, 3));
    geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
    geometry.instanceCount = positions.length;

    return geometry;
  }, [positions]);

  useFrame((state) => {
    if (ringMaterial.current) {
      ringMaterial.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* Solid anchor points. Four spheres is cheaper than instancing here and
          keeps the markers crisp at any zoom. */}
      {positions.map((point, index) => (
        <mesh key={CITIES[index].name} position={point}>
          <sphereGeometry args={[0.0115, 12, 12]} />
          <meshBasicMaterial
            color="#E8C56B"
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh geometry={ringGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={ringMaterial}
          vertexShader={MARKER_VERT}
          fragmentShader={MARKER_FRAG}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#D4AF37') },
            uRingScale: { value: 0.13 },
            uOpacity: { value: 1 },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
