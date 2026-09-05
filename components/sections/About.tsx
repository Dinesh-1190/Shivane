'use client';

import { motion } from 'framer-motion';
import { RevealGroup, useRevealChild } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkylineDissolve } from '@/components/ui/SkylineDissolve';
import { ABOUT, COMPANIES, EDUCATION } from '@/lib/content';
import { EASE, VIEWPORT } from '@/lib/motion';

/**
 * Company names get an exact-match lookup against `COMPANIES` so any prose
 * paragraph mentioning "Creative Touch Media Inc." (etc.) automatically turns
 * that mention into a link to the company's own site — no manual markup
 * inside `lib/content.ts`, so the copy there stays plain, editable prose.
 */
const COMPANY_URL_BY_NAME = new Map(COMPANIES.map((company) => [company.name, company.url]));
const COMPANY_NAME_PATTERN = new RegExp(
  `(${COMPANIES.map((company) => company.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'g',
);

function withCompanyLinks(text: string) {
  return text.split(COMPANY_NAME_PATTERN).map((part, index) => {
    const url = COMPANY_URL_BY_NAME.get(part);
    if (!url) return part;
    return (
      <a
        key={`${part}-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brass underline decoration-brass/30 underline-offset-4 transition-colors duration-300 hover:decoration-brass"
      >
        {part}
      </a>
    );
  });
}

/**
 * About + Early Life.
 *
 * The skyline band sits between the biography and the education timeline so
 * the Toronto → Kandy dissolve happens at the exact point the copy moves from
 * "based in Toronto" to "born in Colombo".
 */
export function About() {
  const child = useRevealChild();

  return (
    <section id="about" className="relative py-28 md:py-40">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              index={1}
              eyebrow={ABOUT.eyebrow}
              lines={[...ABOUT.headingLines]}
            />
          </div>

          <RevealGroup className="space-y-7 lg:col-span-6 lg:col-start-7" stagger={0.09}>
            {ABOUT.body.map((paragraph, index) => (
              <motion.p
                key={paragraph.slice(0, 32)}
                variants={child}
                className={
                  index === 0
                    ? 'font-sans text-lg leading-[1.75] text-bone/90 md:text-xl'
                    : 'font-sans text-base leading-[1.85] text-bone-muted'
                }
              >
                {withCompanyLinks(paragraph)}
              </motion.p>
            ))}
          </RevealGroup>
        </div>
      </div>

      {/* Toronto dissolving into the Kandy hill country. */}
      <div className="mt-24 md:mt-32">
        <SkylineDissolve />
      </div>

      {/* ── Early life & education ─────────────────────────────────────── */}
      <div className="shell mt-20 md:mt-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <SectionHeader
              index={2}
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
