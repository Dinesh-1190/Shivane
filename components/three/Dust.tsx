'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * A slow field of particles sitting behind and around the globe.
 *
 * Its only job is to give the empty space depth so the globe does not read as
 * a flat cutout on a black rectangle. Motion is a gentle vertical drift — no
 * swirling, no twinkle, nothing that draws attention to itself.
 */

const DUST_VERT = /* glsl */ `
  attribute float aScale;
  attribute float aSpeed;

  uniform float uTime;
  uniform float uSize;

  varying float vFade;

  void main() {
    vec3 transformed = position;

    // Drift upward and wrap. aSpeed varies per particle so the field never
    // moves as a single sheet.
    float span = 9.0;
    transformed.y = mod(transformed.y + uTime * aSpeed + span * 0.5, span) - span * 0.5;

    vec4 viewPosition = modelViewMatrix * vec4(transformed, 1.0);

    // Particles fade out as they approach the camera, avoiding large blurry
    // sprites drifting across the foreground.
    vFade = smoothstep(0.0, -3.0, viewPosition.z) * smoothstep(-24.0, -8.0, viewPosition.z);

    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uSize * aScale * (10.0 / -viewPosition.z);
  }
`;

const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vFade;

  void main() {
    // Soft round falloff; gl_PointCoord is 0..1 across the sprite.
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = (1.0 - smoothstep(0.0, 1.0, d)) * vFade * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function Dust({ count = 900 }: { count?: number }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      // Distributed in a slab around the globe, biased away from dead centre
      // so particles do not pile up in front of the object.
      const radius = 1.6 + Math.random() * 6;
      const angle = Math.random() * Math.PI * 2;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 2;

      scales[i] = 0.35 + Math.random() * 0.9;
      speeds[i] = 0.035 + Math.random() * 0.07;
    }

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    result.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    return result;
  }, [count]);

  useFrame((state) => {
    if (material.current) {
      material.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        vertexShader={DUST_VERT}
        fragmentShader={DUST_FRAG}
        uniforms={{
          uTime: { value: 0 },
          uSize: { value: 2.6 },
          uColor: { value: new THREE.Color('#8fa8bd') },
          uOpacity: { value: 0.5 },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
