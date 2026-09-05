'use client';

import { useEffect, useState } from 'react';

export type DeviceTier = 'high' | 'mid' | 'low';

export type QualitySettings = {
  tier: DeviceTier;
  /** Device pixel ratio ceiling handed to the R3F canvas. */
  dpr: [number, number];
  /** Post-processing (bloom) is high-tier only — it is the costliest pass. */
  postProcessing: boolean;
  /** Segment count for the globe's graticule lines. */
  globeSegments: number;
  /** Points in the ambient dust field behind the globe. */
  dustCount: number;
  /** Samples along each great-circle arc tube. */
  arcSegments: number;
};

const PRESETS: Record<DeviceTier, Omit<QualitySettings, 'tier'>> = {
  high: { dpr: [1, 1.75], postProcessing: true, globeSegments: 64, dustCount: 900, arcSegments: 96 },
  mid: { dpr: [1, 1.5], postProcessing: false, globeSegments: 48, dustCount: 450, arcSegments: 64 },
  low: { dpr: [1, 1], postProcessing: false, globeSegments: 32, dustCount: 180, arcSegments: 40 },
};

/**
 * Classifies the device once on mount so the 3D scene can scale its fidelity
 * without ever changing the composition. We deliberately avoid a runtime FPS
 * probe: it causes a visible quality "pop" a second into the experience, which
 * reads worse than simply starting at the right tier.
 */
function detectTier(): DeviceTier {
  if (typeof window === 'undefined') return 'mid';

  const cores = navigator.hardwareConcurrency ?? 4;
  // `deviceMemory` is Chromium-only; absence is treated as "unknown, assume ok".
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 768;

  if (cores <= 4 || memory <= 4) return 'low';
  if (coarsePointer || narrow || cores <= 6) return 'mid';
  return 'high';
}

export function useDeviceTier(): QualitySettings {
  // Start at 'mid' so server and first client render agree; upgrade after mount.
  const [tier, setTier] = useState<DeviceTier>('mid');

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return { tier, ...PRESETS[tier] };
}

/** Live `prefers-reduced-motion` state, kept in sync if the user changes it. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
