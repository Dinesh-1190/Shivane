'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CITIES, ROUTES } from '@/lib/content';
import { greatCircleArc, latLngToVector3 } from '@/lib/geo';

/**
 * Brass great-circle routes between Toronto, London, Colombo and Kandy.
 *
 * Each arc is a tube carrying two signals in one shader pass:
 *   - a dim constant filament so the network is always legible, and
 *   - a travelling pulse that runs the length of the route.
 *
 * Pulses are staggered per route (`uOffset`) so the network never flashes in
 * unison, which would read as a loading animation rather than movement.
 */

const ARC_VERT = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ARC_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOffset;
  uniform float uSpeed;
  uniform float uOpacity;

  varying vec2 vUv;

  void main() {
    // uv.x runs 0 -> 1 along the tube.
    float t = vUv.x;

    // Ends taper to nothing so arcs appear to grow out of the city markers
    // instead of being clipped by the sphere.
    float taper = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.94, t);

    // Base filament.
    float filament = 0.22;

    // Travelling pulse: a narrow gaussian sliding along the arc, with a longer
    // dark gap than lit span so the movement reads as deliberate.
    float head = fract(uTime * uSpeed + uOffset);
    float d = abs(t - head);
    d = min(d, 1.0 - d); // wrap-around distance
    float pulse = exp(-d * d * 420.0);

    // A short comet tail behind the head.
    float behind = head - t;
    behind = behind < 0.0 ? behind + 1.0 : behind;
    float tail = exp(-behind * 22.0) * 0.5;

    float intensity = (filament + pulse * 1.6 + tail) * taper;
    gl_FragColor = vec4(uColor * intensity, intensity * uOpacity);
  }
`;

type ArcsProps = {
  radius?: number;
  /** Samples along each curve; lowered on weaker devices. */
  segments?: number;
};

export function Arcs({ radius = 1, segments = 96 }: ArcsProps) {
  const materials = useRef<THREE.ShaderMaterial[]>([]);

  const arcs = useMemo(() => {
    return ROUTES.map(([fromIndex, toIndex], index) => {
      const from = CITIES[fromIndex];
      const to = CITIES[toIndex];
      const curve = greatCircleArc(
        latLngToVector3(from.lat, from.lng, radius),
        latLngToVector3(to.lat, to.lng, radius),
        radius,
        segments,
      );

      // Short hops get a thinner tube so Colombo → Kandy does not read as
      // heavily as an intercontinental route.
      const angle = latLngToVector3(from.lat, from.lng, 1).angleTo(
        latLngToVector3(to.lat, to.lng, 1),
      );
      const thickness = THREE.MathUtils.mapLinear(
        Math.min(angle, Math.PI),
        0,
        Math.PI,
        0.0026,
        0.0052,
      );

      return {
        key: `${from.name}-${to.name}`,
        geometry: new THREE.TubeGeometry(curve, segments, thickness, 6, false),
        // Deterministic, irregular stagger — avoids a visible rhythm.
        offset: (index * 0.37) % 1,
        speed: 0.11 + index * 0.014,
      };
    });
  }, [radius, segments]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    for (const material of materials.current) {
      if (material) material.uniforms.uTime.value = time;
    }
  });

  return (
    <group>
      {arcs.map((arc, index) => (
        <mesh key={arc.key} geometry={arc.geometry}>
          <shaderMaterial
            ref={(instance) => {
              if (instance) materials.current[index] = instance;
            }}
            vertexShader={ARC_VERT}
            fragmentShader={ARC_FRAG}
            uniforms={{
              uColor: { value: new THREE.Color('#D4AF37') },
              uTime: { value: 0 },
              uOffset: { value: arc.offset },
              uSpeed: { value: arc.speed },
              uOpacity: { value: 1 },
            }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
