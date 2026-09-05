'use client';

import { useEffect, useRef, useState } from 'react';
import { useScrollState } from '@/components/providers/SmoothScroll';
import { NAV_ITEMS } from '@/lib/content';

/**
 * Slim desktop scroll indicator: a vertical rule with a brass fill and the
 * current section's name.
 *
 * Deliberately not a gamified progress meter — it is a reading position cue.
 * The fill is written straight to the DOM node each frame rather than through
 * React state, so scrolling never triggers a re-render.
 */
export function ScrollProgress() {
  const { state } = useScrollState();
  const fill = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<string>('');

  useEffect(() => {
    let frame = 0;

    const tick = () => {
      if (fill.current) {
        fill.current.style.transform = `scaleY(${state.current.progress})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [state]);

  // Section tracking is a separate, cheap observer — it only fires on
  // intersection changes rather than every frame.
  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.querySelector(item.href)).filter(
      (element): element is Element => Boolean(element),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = NAV_ITEMS.find((item) => item.href === `#${visible.target.id}`);
        setSection(match?.label ?? '');
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[max(1.25rem,3vw)] top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 xl:flex"
    >
      <span
        className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-bone-faint transition-opacity duration-500"
        style={{
          writingMode: 'vertical-rl',
          opacity: section ? 1 : 0,
        }}
      >
        {section}
      </span>
      <div className="relative h-28 w-px overflow-hidden bg-ink-line">
        <div
          ref={fill}
          className="absolute inset-0 origin-top bg-brass"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>
    </div>
  );
}
