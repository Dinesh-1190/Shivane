'use client';

import dynamic from 'next/dynamic';

/**
 * Client boundary for the WebGL stage.
 *
 * `ssr: false` is only permitted inside a Client Component, so the split lives
 * here rather than in `app/page.tsx`. The payoff is that three.js and the
 * postprocessing chain — the heaviest code on the site — stay out of the
 * initial bundle, letting the hero photograph, name and navigation paint
 * before any WebGL work begins.
 *
 * There is no loading fallback on purpose: the stage is purely decorative and
 * sits behind the content, so it should fade in when ready rather than
 * reserving space or flashing a placeholder.
 */
const GlobeStage = dynamic(() => import('./GlobeStage'), { ssr: false });

export function GlobeStageLoader() {
  return <GlobeStage />;
}
