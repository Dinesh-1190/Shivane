'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export type MediaPlaceholderProps = {
  /** Supply once the real asset exists; until then the slot renders empty. */
  src?: string;
  /** Required even while empty — it is the alt text the real asset will use. */
  alt: string;
  /** CSS aspect-ratio string, e.g. "4 / 5". */
  ratio?: string;
  /**
   * CSS object-position, e.g. "50% 30%". Use when the source frame's aspect
   * ratio doesn't match `ratio` and a center crop would cut into the subject —
   * cheaper than re-cropping the file, and the layout never has to change to
   * accommodate it.
   */
  position?: string;
  /** Short label shown in the empty state, e.g. "Portrait". */
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Typed slot for client media that has not been delivered yet.
 *
 * The point is that swapping in a real photo is a one-prop change: the slot
 * already owns its aspect ratio, alt text and sizing, so layout never shifts
 * when assets land. The "asset pending" treatment is deliberately quiet —
 * a hairline frame and a small label — so a work-in-progress build still
 * screenshots well for the client.
 */
export function MediaPlaceholder({
  src,
  alt,
  ratio = '4 / 5',
  position,
  label,
  className,
  sizes = '(max-width: 768px) 100vw, 40vw',
  priority = false,
}: MediaPlaceholderProps) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-ink-raised',
        'ring-1 ring-inset ring-bone/[0.07]',
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          style={position ? { objectPosition: position } : undefined}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          {/* Faint diagonal hatch marks the slot as intentionally empty
              rather than a broken image. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgb(var(--ink-line)) 0 1px, transparent 1px 11px)',
            }}
          />
          <div className="relative flex flex-col items-center gap-2 text-center">
            <span className="h-px w-8 bg-brass/40" />
            <span className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-bone-faint">
              {label ?? 'Asset pending'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Logo slot for the brand strip. Falls back to a letter-spaced wordmark, which
 * reads as a deliberate typographic treatment rather than a missing image.
 */
export function BrandMark({ name, src }: { name: string; src?: string }) {
  return (
    <div className="group flex h-12 min-w-[9.5rem] items-center justify-center px-6">
      {src ? (
        <Image
          src={src}
          alt={`${name} logo`}
          width={140}
          height={40}
          className="h-8 w-auto object-contain opacity-45 grayscale transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:grayscale-0"
        />
      ) : (
        <span className="whitespace-nowrap font-display text-lg tracking-[0.06em] text-bone/40 transition-colors duration-500 group-hover:text-brass">
          {name}
        </span>
      )}
    </div>
  );
}
