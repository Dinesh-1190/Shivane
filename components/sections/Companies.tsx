'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Spotlight } from '@/components/ui/Spotlight';
import { COMPANIES, COMPANIES_SECTION, type Company } from '@/lib/content';
import { EASE, VIEWPORT } from '@/lib/motion';
import { withBasePath } from '@/lib/site';

/**
 * The four ventures.
 *
 * A two-column grid on desktop that collapses to a single stack on mobile —
 * chosen over a pinned horizontal gallery because horizontal scroll inside a
 * vertical page is a liability on touch, and the brief asks for the more
 * restrained option whenever there is a choice.
 */
export function Companies() {
  return (
    <section id="companies" className="relative py-28 md:py-40">
      <div className="shell">
        <SectionHeader
          index={3}
          eyebrow={COMPANIES_SECTION.eyebrow}
          lines={[...COMPANIES_SECTION.headingLines]}
        />

        <div className="mt-16 grid gap-px border border-ink-line bg-ink-line md:mt-20 md:grid-cols-2">
          {COMPANIES.map((company, index) => (
            <CompanyCard key={company.name} company={company} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanyCard({ company, index }: { company: Company; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.8, ease: EASE.entrance, delay: (index % 2) * 0.08 }}
      className="relative bg-ink"
    >
      {/* The whole card is the link: hovering anywhere on it previews the same
          affordances (top hairline, elevation, tag borders) that signalled
          interactivity before, so nothing about the resting design changes —
          it just now goes somewhere. */}
      <a
        href={company.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${company.name} — opens in a new tab`}
        className="group block h-full outline-none"
      >
        <Spotlight className="h-full">
          <div className="relative flex h-full flex-col p-8 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:p-11 lg:group-hover:-translate-y-1">
            {/* Brass hairline that draws itself along the top edge on hover. */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-brass via-brass/60 to-transparent transition-transform duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            />

            <header className="flex items-start justify-between gap-6">
              {/* Sized larger than a typical icon badge: Lake Villas' mark is
                  fine line-art with a lot of white space, and at a smaller
                  size it reads as a pale, empty square rather than a logo. */}
              <span
                aria-hidden
                className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden border border-ink-line bg-bone/[0.04] transition-colors duration-500 group-hover:border-brass/45"
              >
                <Image
                  src={withBasePath(company.logo)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </span>
              <span className="font-sans text-[0.6rem] tracking-[0.24em] text-bone-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
            </header>

            <h3 className="mt-8 font-display text-display-sm leading-tight text-bone md:text-[1.75rem]">
              {company.name}
            </h3>

            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.68rem] uppercase tracking-[0.18em]">
              <span className="text-brass">{company.role}</span>
              <span aria-hidden className="h-3 w-px bg-ink-line" />
              <span className="text-bone-faint">{company.location}</span>
            </p>

            <p className="mt-6 max-w-prose font-sans text-[0.95rem] leading-[1.8] text-bone-muted">
              {company.description}
            </p>

            <ul className="mt-auto flex flex-wrap gap-2 pt-9">
              {company.tags.map((tag) => (
                <li
                  key={tag}
                  className="border border-ink-line px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-bone-faint transition-colors duration-500 group-hover:border-bone/15 group-hover:text-bone-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Spotlight>
      </a>
    </motion.article>
  );
}
