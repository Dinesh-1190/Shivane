'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/lib/useDeviceTier';

/**
 * The cross-market moment: an abstracted Toronto skyline dissolves into the
 * Kandy hill country as the About section passes through the viewport.
 *
 * Both are hand-authored line art on a shared 1200×260 viewBox so their
 * horizons align exactly — the two drawings share a ground line, which is what
 * makes the dissolve read as one continuous place rather than two images
 * swapping. Depth comes from stroke weight and opacity rather than motion: the
 * far ridge and distant towers are drawn thinner and dimmer, so the band reads
 * as atmosphere without any 3D. The whole band drifts as a single plane
 * against the text column.
 *
 * Scroll mapping (section progress 0 → 1):
 *   0.00 – 0.35  Toronto holds
 *   0.35 – 0.65  cross-fade
 *   0.65 – 1.00  Kandy holds
 */
export function SkylineDissolve() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const torontoOpacity = useTransform(scrollYProgress, [0.3, 0.62], [1, 0]);
  const kandyOpacity = useTransform(scrollYProgress, [0.38, 0.7], [0, 1]);

  // Counter-drift: the outgoing city eases left as the incoming one settles in
  // from the right. Small distances — this is a transition, not a slideshow.
  const torontoX = useTransform(scrollYProgress, [0.3, 0.7], ['0%', '-6%']);
  const kandyX = useTransform(scrollYProgress, [0.3, 0.7], ['6%', '0%']);

  // Parallax on the whole band, so it drifts against the text column.
  const bandY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%']);

  // Under reduced motion the band holds a single static composition: the two
  // skylines at equal weight, no drift, no fade.
  const staticStyle = { opacity: 0.55, x: '0%' } as const;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none relative h-[220px] w-full overflow-hidden sm:h-[260px]"
    >
      {/* inset-0, not bottom-0: the drawings size themselves with `h-full`, so
          this wrapper has to carry the band's full height or they collapse to
          nothing. */}
      <motion.div
        className="absolute inset-0"
        style={reducedMotion ? undefined : { y: bandY }}
      >
        {/* Toronto */}
        <motion.svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYEnd meet"
          className="absolute inset-x-0 bottom-0 h-full w-full"
          style={reducedMotion ? staticStyle : { opacity: torontoOpacity, x: torontoX }}
        >
          <TorontoSkyline />
        </motion.svg>

        {/* Kandy hill country */}
        <motion.svg
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYEnd meet"
          className="absolute inset-x-0 bottom-0 h-full w-full"
          style={reducedMotion ? staticStyle : { opacity: kandyOpacity, x: kandyX }}
        >
          <KandyHills />
        </motion.svg>
      </motion.div>

      {/* Ground haze so the drawings sit in atmosphere rather than on a hard
          edge, and the band bleeds into the section background. */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
    </div>
  );
}

/** Shared stroke treatment for both drawings. */
const strokeProps = {
  fill: 'none',
  stroke: 'rgb(var(--steel-light))',
  strokeWidth: 1.15,
  vectorEffect: 'non-scaling-stroke' as const,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

function TorontoSkyline() {
  return (
    <g opacity="0.85">
      {/* Far towers — thinner and dimmer to sit back in the haze. */}
      <g {...strokeProps} strokeWidth={0.9} opacity="0.42">
        <path d="M60 260V176h34v84M120 260V196h26v64M180 260V162h30v98M420 260V186h40v74M900 260V172h32v88M1010 260V200h28v60M1080 260V184h34v76" />
      </g>

      {/* CN Tower — the single recognisable silhouette, kept plain. */}
      <g {...strokeProps}>
        <path d="M600 260V128" />
        <path d="M592 128h16" />
        {/* Observation pod */}
        <path d="M584 128q16-13 32 0v14q-16 12-32 0z" />
        <path d="M596 114V62" />
        <path d="M604 114V62" />
        {/* Sky pod + mast */}
        <path d="M592 62h16v10h-16z" />
        <path d="M600 62V16" />
      </g>

      {/* Mid-ground bank towers. */}
      <g {...strokeProps}>
        <path d="M250 260V150h54v110" />
        <path d="M264 150v-16h26v16" />
        <path d="M330 260V178h44v82" />
        <path d="M480 260V142h48v118" />
        <path d="M494 142v-14h20v14" />
        <path d="M660 260V158h50v102" />
        <path d="M730 260V190h38v70" />
        <path d="M790 260V166h46v94" />
        <path d="M806 166v-12h14v12" />
      </g>

      {/* Window mullions — a few verticals only; enough to read as buildings. */}
      <g {...strokeProps} strokeWidth={0.7} opacity="0.35">
        <path d="M268 260V150M286 260V150M348 260V178M362 260V178M496 260V142M512 260V142M676 260V158M694 260V158M806 260V166M822 260V166" />
      </g>

      {/* Lake edge. */}
      <path d="M0 260h1200" {...strokeProps} opacity="0.5" />
    </g>
  );
}

function KandyHills() {
  return (
    <g opacity="0.85">
      {/*
        Two ridge lines, authored so the far ridge stays above the near one
        across the full width. Written as explicit quadratic segments rather
        than smooth-continuation (`t`) commands: those carry the previous
        control point forward, which made the two ridges overshoot and cross,
        and a crossed ridge reads as a waveform rather than hill country.

        Far ridge holds y ≈ 148–208, near ridge y ≈ 196–234, ground at 236 —
        an amplitude comparable to the Toronto towers opposite, so neither
        drawing looks slighter than the other during the cross-fade.
      */}
      <g {...strokeProps} strokeWidth={0.9} opacity="0.4">
        <path d="M0 200 Q90 158 180 188 Q270 206 360 172 Q450 148 540 182 Q640 205 730 176 Q820 152 910 190 Q1010 208 1100 170 Q1150 156 1200 178" />
      </g>

      {/* Near ridge — the dominant hill mass the town sits against. */}
      <g {...strokeProps}>
        <path d="M0 230 Q100 200 200 220 Q300 234 400 208 Q500 196 600 218 Q700 234 800 214 Q900 198 1000 222 Q1100 234 1200 216" />
      </g>

      {/* Temple of the Tooth: stacked hipped roofs, reduced to a silhouette
          and seated on the ground line rather than floating on a ridge. */}
      <g {...strokeProps}>
        <path d="M532 236v-46" />
        <path d="M488 190h88l-44-26z" />
        <path d="M500 164h64l-32-22z" />
        <path d="M532 142v-12" />
        {/* Octagonal pavilion (Paththirippuwa) beside it. */}
        <path d="M446 236v-30" />
        <path d="M428 206h36l-18-16z" />
      </g>

      {/* Palms — three, at different scales, to set the register as tropical
          without turning into a scene. */}
      <g {...strokeProps} strokeWidth={0.95}>
        <path d="M236 236v-56" />
        <path d="M236 180q-24-16-40-7M236 180q24-16 40-7M236 180q-16-24-12-40M236 180q16-24 12-40" />
        <path d="M300 236v-38" />
        <path d="M300 198q-18-12-30-5M300 198q18-12 30-5M300 198q-12-18-8-30" />
        <path d="M960 236v-48" />
        <path d="M960 188q-21-14-35-6M960 188q21-14 35-6M960 188q-14-20-10-35M960 188q14-20 10-35" />
      </g>

      {/* Kandy Lake edge with its distinctive parapet wall. */}
      <path d="M0 236h1200" {...strokeProps} opacity="0.55" />
      <g {...strokeProps} strokeWidth={0.7} opacity="0.4">
        <path d="M0 248h1200" />
        <path d="M40 248v-8M100 248v-8M160 248v-8M220 248v-8M280 248v-8M340 248v-8M400 248v-8M460 248v-8M520 248v-8M580 248v-8M640 248v-8M700 248v-8M760 248v-8M820 248v-8M880 248v-8M940 248v-8M1000 248v-8M1060 248v-8M1120 248v-8M1180 248v-8" />
      </g>
    </g>
  );
}
