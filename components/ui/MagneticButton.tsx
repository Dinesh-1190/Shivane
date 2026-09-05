'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/useDeviceTier';
import { cn } from '@/lib/utils';

type MagneticProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  variant?: 'primary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

/**
 * Magnetic hover: the control drifts a few pixels toward the cursor while it
 * is inside the element, then returns.
 *
 * The pull is capped at 8px and uses a stiff, low-bounce spring — enough to
 * feel responsive under the hand, not enough to look like a toy. Disabled
 * outright for reduced-motion users and never applied on touch (there is no
 * hover state to drive it).
 */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled,
}: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 26, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 26, mass: 0.4 });

  const handleMove = (event: React.MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    const strength = 0.28;
    x.set(Math.max(-8, Math.min(8, offsetX * strength)));
    y.set(Math.max(-6, Math.min(6, offsetY * strength)));
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const styles = cn(
    'group relative inline-flex items-center justify-center gap-3 overflow-hidden',
    'px-7 py-3.5 text-[0.8rem] uppercase tracking-[0.18em] font-medium',
    'transition-colors duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variant === 'primary'
      ? 'border border-brass/70 text-brass hover:text-ink'
      : 'border border-bone/20 text-bone-muted hover:text-bone hover:border-bone/45',
    className,
  );

  const content = (
    <>
      {/* Fill wipes up from the bottom edge on hover — a single directional
          gesture rather than a fade, which reads as more deliberate. */}
      {variant === 'primary' && (
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-brass transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100"
        />
      )}
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </>
  );

  const motionProps = {
    style: { x: springX, y: springY },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    className: styles,
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
