'use client';

import { useRef } from 'react';
import { useReducedMotion } from '@/lib/useDeviceTier';
import { cn } from '@/lib/utils';

/**
 * Cursor-aware surface used by the company cards and expertise tiles.
 *
 * A soft brass radial follows the pointer inside the element. Position is
 * written to CSS custom properties on the node directly — going through React
 * state here would re-render a card on every mousemove.
 */
export function Spotlight({
  children,
  className,
  radius = 380,
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    ref.current.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn('group/spot relative isolate overflow-hidden', className)}
      style={{ ['--spot-r' as string]: `${radius}px` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(var(--spot-r) circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(var(--brass) / 0.10), transparent 65%)',
        }}
      />
      {children}
    </div>
  );
}
