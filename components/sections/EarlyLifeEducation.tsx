'use client';

import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EDUCATION } from '@/lib/content';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * Early Life & Education.
 *
 * Split out from About.tsx so the two can sit in different positions in the
 * page order — the timeline used to render directly after the bio, sharing
 * one component, when the two sections were adjacent.
 */
export function EarlyLifeEducation() {
  return (
    <section id="education" className="relative py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              index={5}
              eyebrow={EDUCATION.eyebrow}
              lines={[...EDUCATION.headingLines]}
            />
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <ol className="relative">
              {/* The connector deliberately echoes the globe's arc lines: same
                  brass, same hairline weight, drawn rather than static. */}
              <motion.span
                aria-hidden
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 1.4, ease: EASE.entrance }}
                className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-brass/70 via-brass/25 to-transparent"
              />

              {EDUCATION.milestones.map((milestone, index) => (
                <motion.li
                  key={milestone.institution}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{
                    duration: 0.75,
                    ease: EASE.entrance,
                    delay: 0.16 + index * 0.14,
                  }}
                  className="relative pb-12 pl-10 last:pb-0"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-[7px] block h-[11px] w-[11px] rounded-full border border-brass/70 bg-ink"
                  />
                  <span
                    aria-hidden
                    className="absolute left-[3.5px] top-[10.5px] block h-1 w-1 rounded-full bg-brass"
                  />

                  <h3 className="font-display text-display-sm text-bone">
                    {milestone.institution}
                  </h3>
                  <p className="mt-1.5 font-sans text-[0.68rem] uppercase tracking-[0.2em] text-brass/80">
                    {milestone.place}
                  </p>
                  <p className="mt-3 max-w-prose font-sans text-sm leading-[1.8] text-bone-muted">
                    {milestone.note}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
