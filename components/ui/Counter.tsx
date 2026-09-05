'use client';

import { animate, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { EASE } from '@/lib/motion';
import { useReducedMotion } from '@/lib/useDeviceTier';

/**
 * Count-up figure for the investing stat row.
 *
 * Values are padded to two digits, which is what makes a row of statistics
 * read as a considered set rather than three loose numbers. The count runs
 * once, when the element first enters the viewport.
 *
 * Wire real client-confirmed figures through `lib/content.ts` — this component
 * renders whatever it is given.
 */
export function Counter({
  value,
  suffix = '',
  duration = 1.6,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const format = (n: number) => {
      const rounded = Math.round(n);
      return (rounded < 10 ? `0${rounded}` : String(rounded)) + suffix;
    };

    if (!inView) {
      node.textContent = format(0);
      return;
    }

    if (reducedMotion) {
      node.textContent = format(value);
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: EASE.entrance,
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });

    return () => controls.stop();
  }, [inView, value, suffix, duration, reducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      00{suffix}
    </span>
  );
}
