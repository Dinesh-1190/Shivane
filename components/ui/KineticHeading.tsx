'use client';

import { motion } from 'framer-motion';
import { createElement } from 'react';
import { EASE, VIEWPORT } from '@/lib/motion';
import { useReducedMotion } from '@/lib/useDeviceTier';
import { cn } from '@/lib/utils';

type KineticHeadingProps = {
  /** Each entry becomes one masked line. */
  lines: string[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  /** Seconds before the first line starts. */
  delay?: number;
  /** Reveal on mount rather than on scroll into view (used by the hero). */
  immediate?: boolean;
};

/**
 * Headline reveal: each line is clipped by its own `overflow: hidden` wrapper
 * and slides up from below its baseline.
 *
 * Lines are authored explicitly by the caller rather than word-wrapped
 * automatically — a mask reveal only reads correctly when the mask matches the
 * real line boxes, and letting the browser reflow mid-animation is what makes
 * this effect look cheap.
 */
export function KineticHeading({
  lines,
  as = 'h2',
  className,
  delay = 0,
  immediate = false,
}: KineticHeadingProps) {
  const reducedMotion = useReducedMotion();

  const animationProps = immediate
    ? { initial: 'hidden' as const, animate: 'visible' as const }
    : { initial: 'hidden' as const, whileInView: 'visible' as const, viewport: VIEWPORT };

  return createElement(
    as,
    { className: cn('font-display', className) },
    lines.map((line, index) => (
      <motion.span
        key={line + index}
        className="block overflow-hidden"
        // A hair of vertical padding keeps descenders (g, y, p) from being
        // shaved by the mask.
        style={{ paddingBottom: '0.08em', marginBottom: '-0.08em' }}
        {...animationProps}
      >
        <motion.span
          className="block"
          variants={{
            hidden: reducedMotion ? { opacity: 0 } : { y: '115%' },
            visible: {
              y: '0%',
              opacity: 1,
              transition: {
                duration: reducedMotion ? 0.3 : 1.05,
                ease: EASE.entrance,
                delay: delay + index * 0.09,
              },
            },
          }}
        >
          {line}
        </motion.span>
      </motion.span>
    )),
  );
}
