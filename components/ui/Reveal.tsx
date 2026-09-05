'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { useReducedMotion } from '@/lib/useDeviceTier';

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  /** Travel distance in pixels. Kept short — long travel reads as decoration. */
  distance?: number;
};

/**
 * The workhorse scroll entrance: a short rise with an expo-out curve.
 *
 * Under `prefers-reduced-motion` the transform is dropped and only the opacity
 * fade remains, so the composition is identical and nothing moves.
 */
export function Reveal({ children, delay = 0, distance = 16, ...rest }: RevealProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: { opacity: 0, y: reducedMotion ? 0 : distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reducedMotion ? 0.3 : 0.75, ease: EASE.entrance, delay },
        },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container. Children should use the `revealChild` variants below.
 */
export function RevealGroup({
  children,
  stagger = 0.07,
  delay = 0,
  ...rest
}: HTMLMotionProps<'div'> & { stagger?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function useRevealChild() {
  const reducedMotion = useReducedMotion();
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reducedMotion ? 0.3 : 0.7, ease: EASE.entrance },
    },
  };
}
