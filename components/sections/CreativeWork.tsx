'use client';

import { motion } from 'framer-motion';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CREATIVE_WORK } from '@/lib/content';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * Creative work — framed as supporting craft, not the headline identity.
 *
 * The four delivered photographs are all portrait behind-the-scenes frames
 * from one shoot, so the gallery is a single disciplined 4-up row at a shared
 * ratio (4 in a line on desktop, 2×2 on tablet, stacked on mobile) rather than
 * the mixed portrait/landscape/square layout drafted before real assets
 * existed — a uniform contact-sheet reads as one considered set, where forcing
 * these frames into different shapes would have cropped the actual subjects.
 * Every slot is still a `MediaPlaceholder`, so a future reshoot or a fifth
 * discipline is a content-only change in lib/content.ts.
 */
export function CreativeWork() {
  return (
    <section id="creative-work" className="relative py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              index={6}
              eyebrow={CREATIVE_WORK.eyebrow}
              lines={[...CREATIVE_WORK.headingLines]}
            />
          </div>

          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <p className="max-w-prose font-sans text-base leading-[1.85] text-bone-muted">
              {CREATIVE_WORK.body}
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-24 lg:grid-cols-4 lg:gap-x-8">
          {CREATIVE_WORK.disciplines.map((discipline, index) => (
            <motion.figure
              key={discipline.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT}
              transition={{ duration: 0.85, ease: EASE.entrance, delay: index * 0.08 }}
              className="group"
            >
              <div className="overflow-hidden">
                <MediaPlaceholder
                  src={discipline.image}
                  alt={discipline.alt}
                  ratio={discipline.ratio}
                  position={'position' in discipline ? discipline.position : undefined}
                  label={discipline.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 23vw"
                />
              </div>

              <figcaption className="mt-5 border-t border-ink-line pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg text-bone">{discipline.title}</h3>
                  <span className="font-sans text-[0.6rem] tabular-nums tracking-[0.2em] text-brass/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-1.5 font-sans text-sm leading-relaxed text-bone-muted">
                  {discipline.detail}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
