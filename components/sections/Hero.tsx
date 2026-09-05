'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAnchorScroll } from '@/components/providers/SmoothScroll';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { PERSON } from '@/lib/content';
import { EASE } from '@/lib/motion';
import { withBasePath } from '@/lib/site';
import { useReducedMotion } from '@/lib/useDeviceTier';

/**
 * A tiny (16×8) JPEG of the actual hero photo, inlined as a blur placeholder.
 *
 * On a slow connection `next/image` has nothing to paint until the full file
 * arrives — with no placeholder that gap renders as flat black, because the
 * grade layers below (all semi-transparent dark gradients) sit on top of
 * *nothing* and composite straight onto the page's own near-black background.
 * A blurred preview fills that gap with the photo's real tones immediately,
 * and doubles as a fallback that stays on screen if the full image never
 * loads at all.
 */
const HERO_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAIABADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwB5vF8h/Lfc204U4wT2pyXEBt08wbZMZZQw4bvRRXLKKOtSZ//Z';

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
 *
 * Below `md`, the name and the roles/tagline/CTA block render as one flex
 * column in real document flow instead of desktop's two independently
 * absolutely-positioned pieces (name vertically centred, copy pinned to the
 * bottom). That split works on desktop's tall, wide frame, but on a phone
 * viewport short enough — and plenty are — the vertically-centred name's
 * lower edge and the bottom-pinned copy's upper edge land in the same space
 * and print on top of each other. Two siblings in one flow container can't
 * do that regardless of exact viewport height, which is what the mobile
 * block below is for. Desktop's markup is untouched.
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
      style={{
        // A static warm-to-charcoal gradient sitting under the photo layer.
        // Invisible once the photo is in — `object-cover` fully occludes it —
        // but on a slow connection or an outright failed request it keeps the
        // frame looking art-directed instead of a flat black rectangle while
        // the blur placeholder (or nothing, in the worst case) is all that's
        // painted above it.
        background: 'linear-gradient(160deg, #3a2c1e 0%, #1c1712 45%, #0A0B0E 100%)',
      }}
    >
      {/* ── Photograph ─────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0" style={still}>
        <Image
          src={withBasePath('/media/hero-shivane.jpg')}
          alt={`${PERSON.name} at the shoreline at sunrise`}
          fill
          priority
          sizes="100vw"
          quality={90}
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
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

      {/* ── Mobile (below md): one flow column, bottom-anchored ──────────
          Name, roles, tagline and CTAs stack as real siblings with `gap`, so
          there is no independent vertical-centring math that can push the
          name down into the copy below it — the two blocks physically cannot
          overlap regardless of the exact viewport height a given phone
          reports. This is the only structural difference from desktop. */}
      <motion.div
        className="absolute inset-0 flex flex-col justify-end px-[3vw] pb-8 md:hidden"
        style={parallax ? undefined : { opacity: contentOpacity }}
      >
        <h1 className="text-center">
          <span className="sr-only">{PERSON.name}</span>
          <span aria-hidden className="hero-name">
            <NameWord word="Shivane" delay={0.15} />
            <br />
            <NameWord word="Augustus" delay={0.28} />
          </span>
        </h1>

        {/* No tagline here (desktop keeps it): the roles line already carries
            the essentials, and on the shortest phone viewports every extra
            line is real risk of pushing the name itself off the top of the
            frame — the one thing on this screen that must never happen. */}
        <div className="mt-4 flex flex-col items-center gap-4 text-center">
          <HeroRoles />
          <HeroActions onAnchorClick={onAnchorClick} />
        </div>
      </motion.div>

      {/* ── Desktop (md and up): name centred, copy pinned to the bottom ── */}
      <motion.div
        className="absolute inset-0 hidden items-center justify-center md:flex"
        style={parallax ? undefined : { y: nameY }}
      >
        <h1 className="w-full px-[3vw] text-center">
          <span className="sr-only">{PERSON.name}</span>
          <span aria-hidden className="hero-name">
            <NameWord word="Shivane" delay={0.15} />
            <span>&nbsp;</span>
            <NameWord word="Augustus" delay={0.28} />
          </span>
        </h1>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-0 hidden pb-16 md:block"
        style={parallax ? undefined : { opacity: contentOpacity }}
      >
        <div className="shell flex flex-col items-center gap-7 text-center">
          <HeroRoles />
          <HeroTagline />
          <HeroActions onAnchorClick={onAnchorClick} />
        </div>
      </motion.div>

      <ScrollCue reducedMotion={reducedMotion} />
    </section>
  );
}

/**
 * Roles, tagline and CTAs — shared by both the mobile (in-flow) and desktop
 * (bottom-pinned) hero layouts so the copy and its entrance animation are
 * defined once. Rendered as a wrapping list rather than one joined string:
 * at 360px the three roles plus their tracking exceed the line box, and a
 * single <p> would either overflow the frame or break at an arbitrary point
 * mid-word.
 */
function HeroRoles() {
  return (
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
  );
}

function HeroTagline() {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: EASE.entrance, delay: 0.88 }}
      className="max-w-md text-balance font-sans text-sm leading-relaxed text-bone/70"
    >
      {PERSON.tagline}
    </motion.p>
  );
}

function HeroActions({
  onAnchorClick,
}: {
  onAnchorClick: ReturnType<typeof useAnchorScroll>;
}) {
  return (
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
