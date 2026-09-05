'use client';

import { Marquee } from '@/components/ui/Marquee';
import { BrandMark } from '@/components/ui/MediaPlaceholder';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BRANDS } from '@/lib/content';

/**
 * Trust bar.
 *
 * A single row carrying every brand. Splitting the list across two
 * counter-scrolling rows looked richer in the abstract, but half the list is
 * narrower than the viewport, so each row visibly repeated itself on screen —
 * a trust bar showing the same logo twice reads as padding. One full-width row
 * never repeats within a viewport. It pauses on hover so a name can be read.
 *
 * Names currently render as typographic wordmarks; supplying a `src` to
 * `BrandMark` swaps in a real logo with no other change.
 */
export function Brands() {
  return (
    <section id="brands" className="relative border-y border-ink-line py-24 md:py-32">
      <div className="shell">
        <SectionHeader
          index={2}
          eyebrow={BRANDS.eyebrow}
          lines={[...BRANDS.headingLines]}
          align="center"
          width="wide"
          className="mx-auto max-w-3xl"
        />
      </div>

      <Reveal delay={0.15} className="mt-14 md:mt-20">
        <Marquee speed={58}>
          {BRANDS.logos.map((name) => (
            <BrandMark key={name} name={name} />
          ))}
        </Marquee>
      </Reveal>
    </section>
  );
}
