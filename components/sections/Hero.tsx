'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAnchorScroll } from '@/components/providers/SmoothScroll';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { PERSON } from '@/lib/content';
import { EASE } from '@/lib/motion';
import { useReducedMotion } from '@/lib/useDeviceTier';

/**
 * The landing frame.
 *
 * A single full-bleed photograph with the name set across it. The type uses
 * `mix-blend-mode: overlay`, so each letter takes its brightness from the
 * pixels underneath: luminous against the sky, and dropping back to a smoky
 * grey where it crosses the figure. The photograph's own texture reads through
 * the letterforms, which is what stops the name from looking like a caption
 * pasted on top of an image.
 *
 * Because the effect depends on the image beneath it, `.hero-name` in
 * globals.css carries an `@supports not (mix-blend-mode: overlay)` fallback to
 * plain light type, so the name stays legible if a browser drops the blend
 * mode. The accessible name comes from the `sr-only` span, not this layer.
 *
 * Scroll behaviour: the photograph rises slightly slower than the page while
 * the name rises faster and fades, so the two separate as the visitor leaves.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const onAnchorClick = useAnchorScroll();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const nameY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  /**
   * Hold the parallax back until after the first paint.
   *
   * `useScroll` cannot report a meaningful progress until it has measured the
   * target, and until then it reads 1 — which would slam the photograph 18%
   * down the frame and leave a black band under the header for one frame on
   * load. Gating on a post-mount frame costs nothing and removes the flash.
   */
  const [measured, setMeasured] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMeasured(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const parallax = reducedMotion || !measured;
  const still = parallax ? undefined : { y: imageY, scale: imageScale };

  return (
    <section
      ref={ref}
      id="top"
      className="relative h-[100svh] min-h-[34rem] w-full overflow-hidden"
    >
      {/* ── Photograph ─────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0" style={still}>
        <Image
          src="/media/hero-shivane.jpg"
          alt={`${PERSON.name} at the shoreline at sunrise`}
          fill
          priority
          sizes="100vw"
          quality={90}
          /* object-position keeps the figure centred and the horizon in the
             lower third as the frame narrows toward mobile. */
          className="object-cover object-[50%_42%]"
        />
      </motion.div>

      {/* ── Grade ──────────────────────────────────────────────────────────
          Four passes that pull a warm holiday snapshot toward the site's
          charcoal-and-brass register: a cool charcoal wash, a top scrim for
          nav legibility, a corner vignette, and a bottom ramp that hands off
          into the page background with no visible seam. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[rgb(var(--ink))]/36 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[rgb(var(--ink))]/85 via-[rgb(var(--ink))]/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(115% 82% at 50% 42%, transparent 30%, rgb(var(--ink) / 0.68) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[rgb(var(--ink))] via-[rgb(var(--ink))]/70 to-transparent"
      />

      {/* Fine grain. Keeps the large flat sky from banding on wide gamut
          displays and gives the frame a photographic surface. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── The name ───────────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={parallax ? undefined : { y: nameY }}
      >
        <h1 className="w-full px-[3vw] text-center">
          <span className="sr-only">{PERSON.name}</span>

          {/* Desktop: one line. Mobile: stacked, so the type stays large
              rather than shrinking to fit a narrow frame. */}
          <span aria-hidden className="hero-name">
            <NameWord word="Shivane" delay={0.15} />
            <br className="md:hidden" />
            <span className="hidden md:inline">&nbsp;</span>
            <NameWord word="Augustus" delay={0.28} />
          </span>
        </h1>
      </motion.div>

      {/* ── Supporting copy ────────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-x-0 bottom-0 pb-14 sm:pb-16"
        style={parallax ? undefined : { opacity: contentOpacity }}
      >
        <div className="shell flex flex-col items-center gap-7 text-center">
          {/* Rendered as a wrapping list rather than one joined string: at
              360px the three roles plus their tracking exceed the line box,
              and a single <p> would either overflow the frame or break at an
              arbitrary point mid-word. */}
          <motion.ul
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE.entrance, delay: 0.75 }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[0.6rem] uppercase tracking-[0.26em] text-bone/80 sm:text-[0.7rem] sm:tracking-[0.36em]"
          >
            {PERSON.roles.map((role, index) => (
              <li key={role} className="flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden className="text-brass/60">
                    ·
                  </span>
                )}
                {role}
              </li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE.entrance, delay: 0.88 }}
            className="max-w-md text-balance font-sans text-sm leading-relaxed text-bone/70"
          >
            {PERSON.tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE.entrance, delay: 1 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton
              href="#companies"
              onClick={(event) =>
                onAnchorClick(event as React.MouseEvent<HTMLAnchorElement>, '#companies')
              }
            >
              The companies
            </MagneticButton>
            <MagneticButton
              href="#contact"
              variant="ghost"
              onClick={(event) =>
                onAnchorClick(event as React.MouseEvent<HTMLAnchorElement>, '#contact')
              }
            >
              Contact
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      <ScrollCue reducedMotion={reducedMotion} />
    </section>
  );
}

/**
 * One word of the name, mask-revealed from below.
 *
 * `inline-block` on both wrapper and inner span is what lets the transform
 * apply while the words still lay out as text on one line.
 */
function NameWord({ word, delay }: { word: string; delay: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <span className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: '0.06em' }}>
      <motion.span
        className="inline-block"
        initial={reducedMotion ? { opacity: 0 } : { y: '108%' }}
        animate={{ y: '0%', opacity: 1 }}
        transition={{ duration: reducedMotion ? 0.4 : 1.35, ease: EASE.entrance, delay }}
      >
        {word}
      </motion.span>
    </span>
  );
}

/** Thin animated rule under the fold. A cue, not a gimmick. */
function ScrollCue({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: EASE.entrance, delay: 1.3 }}
      className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 sm:block"
    >
      <div className="relative h-10 w-px overflow-hidden bg-bone/15">
        {!reducedMotion && (
          <motion.div
            className="absolute inset-x-0 h-4 bg-brass"
            animate={{ y: ['-100%', '250%'] }}
            transition={{ duration: 2.4, ease: EASE.precise, repeat: Infinity, repeatDelay: 0.35 }}
          />
        )}
      </div>
    </motion.div>
  );
}
