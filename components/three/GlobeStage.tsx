'use client';

import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useCallback, useRef, useState } from 'react';
import { useDeviceTier, useReducedMotion } from '@/lib/useDeviceTier';
import { GlobeScene } from './GlobeScene';

/**
 * Fixed, full-viewport WebGL stage sitting behind all page content.
 *
 * One canvas for the whole site: mounting a second one per section would cost
 * another WebGL context and another shader compile, and would break the "one
 * recurring motif" idea the design depends on.
 *
 * The canvas is `pointer-events: none` throughout — the globe reacts to the
 * cursor but never intercepts it, so text selection and links behave normally.
 */
export function GlobeStage() {
  const quality = useDeviceTier();
  const reducedMotion = useReducedMotion();

  // Presence drives two optimisations: bloom is the most expensive pass on the
  // page and is pointless while the globe is barely visible, and hiding the
  // canvas entirely lets the compositor skip it during the photographic hero.
  const [presence, setPresence] = useState(0);
  const container = useRef<HTMLDivElement>(null);

  const handlePresence = useCallback((dim: number) => setPresence(dim), []);

  const bloomEnabled = quality.postProcessing && !reducedMotion && presence > 0.25;

  return (
    <div
      ref={container}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        // Fade the whole layer rather than only its contents: at zero presence
        // the browser skips compositing it altogether.
        opacity: presence > 0.005 ? 1 : 0,
        transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        visibility: presence > 0.005 ? 'visible' : 'hidden',
      }}
    >
      <Canvas
        dpr={quality.dpr}
        gl={{
          antialias: quality.tier === 'high',
          alpha: true,
          powerPreference: 'high-performance',
          // The scene is authored in sRGB-ish values directly; tone mapping
          // would desaturate the brass.
          toneMapping: 0,
        }}
        camera={{ position: [0, 0, 3.4], fov: 38, near: 0.1, far: 60 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <GlobeScene
            quality={quality}
            reducedMotion={reducedMotion}
            onPresenceChange={handlePresence}
          />
          {bloomEnabled ? (
            <EffectComposer enableNormalPass={false}>
              {/* Threshold is high on purpose: only the brass arcs and city
                  markers bloom. The wireframe stays crisp. */}
              <Bloom
                intensity={0.85}
                luminanceThreshold={0.55}
                luminanceSmoothing={0.3}
                mipmapBlur
              />
            </EffectComposer>
          ) : (
            <></>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

export default GlobeStage;
