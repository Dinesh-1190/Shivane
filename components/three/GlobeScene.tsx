'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useScrollState } from '@/components/providers/SmoothScroll';
import type { QualitySettings } from '@/lib/useDeviceTier';
import { sampleTrack, useStageTrack } from '@/lib/useStageTrack';
import { clamp, lerp } from '@/lib/utils';
import { Arcs } from './Arcs';
import { CityMarkers } from './CityMarkers';
import { Dust } from './Dust';
import { Globe } from './Globe';

/**
 * Composes the travelling globe.
 *
 * Where it goes and how present it is at any point in the page is defined by
 * `STAGE_DIRECTIONS` in lib/useStageTrack.ts, which measures the real section
 * geometry rather than assuming fixed scroll percentages.
 */
type GlobeSceneProps = {
  quality: QualitySettings;
  reducedMotion: boolean;
  /** Reports presence back up so the canvas can be hidden when unused. */
  onPresenceChange?: (dim: number) => void;
};

export function GlobeScene({ quality, reducedMotion, onPresenceChange }: GlobeSceneProps) {
  const group = useRef<THREE.Group>(null);
  const { state } = useScrollState();
  const { viewport, size } = useThree();
  const track = useStageTrack();

  // Smoothed values, so a flicked scroll wheel never snaps the object.
  const smoothed = useRef({ x: 1.6, y: 0.1, scale: 0.85, dim: 0, spin: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const lastReported = useRef(-1);

  // Below ~900px the layout is a single column, so there is no empty gutter for
  // the globe to occupy. Rather than dragging it to centre — straight behind
  // the copy — it stays out at the edge and drops to a faint atmospheric
  // presence.
  const narrow = size.width < 900;
  const horizontalScale = useMemo(() => (narrow ? 0.62 : 1), [narrow]);
  const dimScale = useMemo(() => (narrow ? 0.45 : 1), [narrow]);

  useFrame((frameState, delta) => {
    if (!group.current) return;

    const target = sampleTrack(track.current, state.current.progress);
    // Frame-rate independent damping.
    const k = 1 - Math.exp(-6 * delta);

    smoothed.current.x = lerp(smoothed.current.x, target.x * horizontalScale, k);
    smoothed.current.y = lerp(smoothed.current.y, target.y, k);
    smoothed.current.scale = lerp(smoothed.current.scale, target.scale, k);
    smoothed.current.dim = lerp(smoothed.current.dim, target.dim * dimScale, k);
    smoothed.current.spin = lerp(smoothed.current.spin, target.spin, k);

    // Position is expressed in viewport units so the composition holds from
    // 360px phones through ultrawide.
    const unit = Math.min(viewport.width, viewport.height) * 0.5;
    group.current.position.x = smoothed.current.x * unit * 0.6;
    group.current.position.y = smoothed.current.y * unit;

    const responsiveScale = clamp(Math.min(viewport.width, viewport.height) * 0.34, 0.55, 1.5);
    group.current.scale.setScalar(smoothed.current.scale * responsiveScale);

    if (reducedMotion) {
      // Static presentation: fixed, flattering three-quarter view.
      group.current.rotation.y = 0.6;
      group.current.rotation.x = 0.16;
    } else {
      const time = frameState.clock.getElapsedTime();
      // Idle rotation plus the scroll-driven offset. Slow enough that the
      // motion is felt rather than watched.
      group.current.rotation.y = time * 0.055 + smoothed.current.spin;

      // Cursor parallax: a few degrees of tilt, damped hard.
      pointer.current.x = lerp(pointer.current.x, frameState.pointer.x, 1 - Math.exp(-2.5 * delta));
      pointer.current.y = lerp(pointer.current.y, frameState.pointer.y, 1 - Math.exp(-2.5 * delta));
      group.current.rotation.x = 0.16 + pointer.current.y * -0.09;
      group.current.position.x += pointer.current.x * 0.06;
    }

    // Push presence into every material in the group. Shader materials expose
    // a `uOpacity` uniform; the plain city-marker meshes fade through the
    // standard `opacity` channel instead, so both paths are handled.
    const dim = smoothed.current.dim;
    group.current.traverse((child) => {
      const material = (child as THREE.Mesh).material as
        | THREE.ShaderMaterial
        | THREE.MeshBasicMaterial
        | undefined;
      if (!material) return;

      if ('uniforms' in material && material.uniforms?.uOpacity) {
        material.uniforms.uOpacity.value = dim;
      } else if ('opacity' in material) {
        material.opacity = dim;
      }
    });
    group.current.visible = dim > 0.005;

    // Report presence in coarse steps — the parent only needs to know when to
    // toggle bloom and canvas visibility, not every frame.
    const bucket = Math.round(dim * 10) / 10;
    if (bucket !== lastReported.current) {
      lastReported.current = bucket;
      onPresenceChange?.(bucket);
    }
  });

  return (
    <>
      {/* Dust sits outside the travelling group so it stays anchored to the
          viewport rather than sliding with the globe. */}
      <Dust count={quality.dustCount} />

      <group ref={group}>
        <Globe segments={quality.globeSegments} />
        <Arcs segments={quality.arcSegments} />
        <CityMarkers />
      </group>
    </>
  );
}
