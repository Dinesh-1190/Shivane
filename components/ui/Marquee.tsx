'use client';

import { cn } from '@/lib/utils';

/**
 * Infinite logo marquee.
 *
 * The track holds the item list twice and translates by exactly -50%, so the
 * loop point is seamless. The animation is pure CSS (see the `marquee`
 * keyframe in tailwind.config.ts) — a JS-driven transform here would compete
 * with Lenis for the main thread on every frame.
 *
 * It pauses on hover so a visitor can actually read a name, and stops entirely
 * under `prefers-reduced-motion` via the global media query in globals.css.
 */
export function Marquee({
  children,
  speed = 48,
  direction = 'left',
  className,
}: {
  children: React.ReactNode;
  /** Seconds for one full pass. */
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div className={cn('fade-x group relative w-full overflow-hidden', className)}>
      <div
        className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{
          ['--marquee-duration' as string]: `${speed}s`,
          animationDirection: direction === 'right' ? 'reverse' : 'normal',
        }}
      >
        {/* Duplicate is aria-hidden so screen readers announce the list once. */}
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
