'use client';

import { motion } from 'framer-motion';
import { Counter } from '@/components/ui/Counter';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { INVESTING } from '@/lib/content';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * Angel investing — the section the globe recentres behind.
 *
 * Layout is deliberately open down the middle so the 3D motif reads through
 * the content rather than being covered by it: copy sits left, the expertise
 * list right, and the stat row spans beneath.
 */
export function Investing() {
  return (
    <section id="investing" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeader
          index={4}
          eyebrow={INVESTING.eyebrow}
          lines={[...INVESTING.headingLines]}
        />

      {/* Columns 5–8 are deliberately left empty on desktop: that gap is where
          the globe recentres. The copy and the expertise list are pushed to
          the outer thirds so the motif reads through the middle of the page
          rather than sitting behind text. */}
      <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-7 lg:col-span-4">
            {INVESTING.body.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 32)} delay={index * 0.08}>
                <p className="font-sans text-base leading-[1.85] text-bone-muted">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <Reveal>
              <p className="eyebrow">{INVESTING.expertiseLabel}</p>
            </Reveal>

            <ul className="mt-8 border-t border-ink-line">
              {INVESTING.expertise.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.6, ease: EASE.entrance, delay: index * 0.055 }}
                  className="group border-b border-ink-line"
                >
                  <div className="relative flex items-baseline gap-5 py-5">
                    {/* Hover wash, contained to the row. */}
                    <span
                      aria-hidden
                      className="absolute inset-y-0 -inset-x-4 -z-10 origin-left scale-x-0 bg-gradient-to-r from-brass/[0.07] to-transparent transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                    />
                    <span className="font-sans text-[0.6rem] tabular-nums tracking-[0.2em] text-brass/60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[0.95rem] leading-snug text-bone-muted transition-colors duration-400 group-hover:text-bone">
                      {item}
                    </span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Figures derived from the client copy. Additional confirmed metrics
            can be appended in lib/content.ts — this row renders whatever the
            array holds. */}
        <Reveal delay={0.15}>
          <dl className="mt-20 grid grid-cols-3 gap-8 border-t border-ink-line pt-10 md:mt-28">
            {INVESTING.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-4xl text-brass md:text-6xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </dd>
                <p className="mt-3 font-sans text-[0.6rem] uppercase leading-relaxed tracking-[0.18em] text-bone-faint">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
