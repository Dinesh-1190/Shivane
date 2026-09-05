'use client';

import { useEffect, useRef } from 'react';

/**
 * Where the globe sits while a given section owns the screen.
 *
 * `x`/`y` are in viewport-relative units (roughly -2 … 2, where 0 is centre),
 * `scale` is a multiplier on the responsive base size, and `dim` is presence:
 * 0 is absent, 1 is the object's full moment.
 */
export type StageDirection = {
  x: number;
  y: number;
  scale: number;
  dim: number;
  /** Extra Y rotation in radians, layered on the idle spin. */
  spin: number;
};

export type StageKeyframe = StageDirection & {
  /** Scroll progress (0–1) at which this direction is reached. */
  at: number;
};

/**
 * Stage directions keyed by section id.
 *
 * The globe is one object travelling through the page, not a new toy per
 * section. Sections where content must stay perfectly legible push it far off
 * to one side and dim it almost to nothing; Investing recentres it and brings
 * it forward — that is its moment.
 */
export const STAGE_DIRECTIONS: Record<string, StageDirection> = {
  // The photographic hero owns the screen outright.
  top: { x: 1.6, y: 0.1, scale: 0.85, dim: 0, spin: 0 },
  // Sits out past the right edge, so only a limb of the sphere and the arcs
  // that swing off it are on screen, framing the biography rather than
  // sitting behind it.
  about: { x: 1.75, y: 0.05, scale: 0.95, dim: 0.2, spin: 0.5 },
  // Further out and dimmer still while the four cards hold the screen.
  //
  // Both of these stay on the right on purpose. An earlier pass sent the globe
  // left here, which read well in isolation but meant it swept straight across
  // the middle of About on the way — parking it on top of the education
  // timeline. Keeping consecutive directions on the same side means the object
  // only crosses the page at section boundaries, where nothing is being read.
  companies: { x: 2.15, y: -0.1, scale: 0.85, dim: 0.08, spin: 1.0 },
  // Recentred and forward, in the column the layout leaves open for it.
  investing: { x: 0, y: 0.04, scale: 0.62, dim: 0.95, spin: 1.6 },
  // Clears the stage entirely: the logo strip must read as a trust bar.
  brands: { x: 2.1, y: 0.3, scale: 0.7, dim: 0.05, spin: 2.1 },
  // Out of the gallery's way.
  'creative-work': { x: -2.1, y: 0.1, scale: 0.7, dim: 0.06, spin: 2.4 },
  // Settles low and well right of both columns as a quiet closing mark. It
  // must clear the contact details entirely — a phone number and a LinkedIn
  // link are the two things on this page a visitor actually needs to read.
  contact: { x: 1.55, y: -0.95, scale: 0.5, dim: 0.3, spin: 2.9 },
};

/** Order the directions are laid along the page. */
const SECTION_ORDER = [
  'top',
  'about',
  'companies',
  'investing',
  'brands',
  'creative-work',
  'contact',
] as const;

/**
 * Measures where each section actually sits and converts the stage directions
 * into a scroll-progress track.
 *
 * Hardcoding progress values would mean re-tuning the choreography every time
 * a paragraph is edited or the viewport changes — and getting it silently
 * wrong when it drifted, which is exactly how a globe ends up parked on top of
 * a headline. Measuring instead makes the timing correct by construction.
 *
 * Each keyframe is placed where its section's centre meets the viewport's
 * centre, so the globe arrives at a position as that section takes the screen.
 *
 * Returns a ref (not state) because the consumer samples it inside a render
 * loop; re-rendering the 3D tree on every measurement would be wasteful.
 */
export function useStageTrack() {
  const track = useRef<StageKeyframe[]>(
    // Fallback used for the first frames, before measurement: an even spread.
    SECTION_ORDER.map((id, index) => ({
      ...STAGE_DIRECTIONS[id],
      at: index / (SECTION_ORDER.length - 1),
    })),
  );

  useEffect(() => {
    const measure = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      if (limit <= 0) return;

      const next: StageKeyframe[] = [];

      for (const id of SECTION_ORDER) {
        const element = document.getElementById(id);
        const direction = STAGE_DIRECTIONS[id];
        if (!element || !direction) continue;

        const top = element.offsetTop;
        const centre = top + element.offsetHeight / 2 - window.innerHeight / 2;
        next.push({ ...direction, at: Math.min(1, Math.max(0, centre / limit)) });
      }

      if (next.length < 2) return;

      // Guarantee a strictly increasing track — the sampler relies on it, and
      // a very short section could otherwise produce a duplicate stop.
      next.sort((a, b) => a.at - b.at);
      for (let i = 1; i < next.length; i += 1) {
        if (next[i].at <= next[i - 1].at) next[i].at = next[i - 1].at + 0.0001;
      }

      // Anchor both ends so scrolling to the very top or bottom always lands
      // on a real direction rather than extrapolating past the last keyframe.
      next[0].at = 0;
      next[next.length - 1].at = 1;

      track.current = next;
    };

    measure();

    // Re-measure when the document reflows: fonts landing, images decoding and
    // viewport changes all move section boundaries.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
    };
  }, []);

  return track;
}

/** Samples the track at a scroll progress, easing between keyframes. */
export function sampleTrack(track: StageKeyframe[], progress: number): StageDirection {
  const p = Math.min(1, Math.max(0, progress));

  let lower = track[0];
  let upper = track[track.length - 1];

  for (let i = 0; i < track.length - 1; i += 1) {
    if (p >= track[i].at && p <= track[i + 1].at) {
      lower = track[i];
      upper = track[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const raw = span > 0 ? (p - lower.at) / span : 0;
  // Smoothstep, so the globe eases into each position rather than tracking the
  // scrollbar linearly. This is what makes the movement feel directed.
  const t = raw * raw * (3 - 2 * raw);

  const mix = (a: number, b: number) => a + (b - a) * t;

  return {
    x: mix(lower.x, upper.x),
    y: mix(lower.y, upper.y),
    scale: mix(lower.scale, upper.scale),
    dim: mix(lower.dim, upper.dim),
    spin: mix(lower.spin, upper.spin),
  };
}
