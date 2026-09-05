'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PERSON } from '@/lib/content';
import { EASE } from '@/lib/motion';

/**
 * Branded preloader: the wordmark mask-reveals over a thin brass progress
 * line, then the whole panel lifts away.
 *
 * It waits for the window `load` event (fonts and the hero image) but is also
 * capped, so a slow third-party asset can never hold the site hostage. The
 * progress figure is an eased approach to 100% rather than a fake linear
 * timer — it reaches the end when the page actually does.
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let frame = 0;
    let released = false;
    const start = performance.now();
    const HARD_CAP = 2600; // ms — never hold the page longer than this.

    /**
     * Jumps straight to 100 and stops the loop.
     *
     * The release must not depend on the animation frame loop: a backgrounded
     * tab throttles rAF to roughly 1Hz, and an eased approach would leave the
     * panel sitting there for many seconds after the page was actually ready.
     * Timers keep running, so readiness is driven by them instead.
     */
    const release = () => {
      if (released) return;
      released = true;
      cancelAnimationFrame(frame);
      setProgress(100);
    };

    const onLoad = () => {
      // A short hold so the bar is seen completing rather than snapping.
      window.setTimeout(release, 260);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    const cap = window.setTimeout(release, HARD_CAP);

    // Visual easing toward 90% while the page is still loading.
    const tick = () => {
      if (released) return;
      setProgress((current) => current + (90 - current) * 0.07);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(cap);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  useEffect(() => {
    if (progress < 100) return;
    const timeout = setTimeout(() => setDone(true), 420);
    return () => clearTimeout(timeout);
  }, [progress]);

  // Release scroll only once the panel is gone.
  useEffect(() => {
    document.body.style.overflow = done ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
          exit={{ y: '-100%' }}
          transition={{ duration: 1.05, ease: EASE.entrance }}
        >
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, ease: EASE.entrance, delay: 0.1 }}
              className="font-display text-2xl tracking-[0.16em] text-bone sm:text-3xl"
            >
              {PERSON.name}
            </motion.p>
          </div>

          <div className="mt-8 flex w-[min(20rem,60vw)] items-center gap-4">
            <div className="relative h-px flex-1 bg-ink-line">
              <motion.div
                className="absolute inset-y-0 left-0 bg-brass"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 text-right font-sans text-[0.6rem] tabular-nums tracking-[0.16em] text-bone-faint">
              {Math.round(progress)}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
