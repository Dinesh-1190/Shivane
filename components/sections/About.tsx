'use client';

import { motion } from 'framer-motion';
import { RevealGroup, useRevealChild } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkylineDissolve } from '@/components/ui/SkylineDissolve';
import { ABOUT, COMPANIES } from '@/lib/content';

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
 * About.
 *
 * The skyline band closes the section, visualizing the Toronto/Colombo
 * duality named in the bio's final line. Early Life & Education is its own
 * section (see EarlyLifeEducation.tsx) — the two used to share this
 * component when they sat next to each other in the page order; they no
 * longer do.
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
    </section>
  );
}
