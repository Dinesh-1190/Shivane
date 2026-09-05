'use client';

import { ContactForm } from '@/components/ui/ContactForm';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CONTACT, PERSON } from '@/lib/content';

/**
 * Closing section.
 *
 * The form sits left with the direct channels (LinkedIn, location) right, so
 * a partner has both routes without scrolling past one to find the other.
 */
export function Contact() {
  return (
    <section id="contact" className="relative pt-28 md:pt-40">
      <div className="shell">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <SectionHeader
              index={7}
              eyebrow={CONTACT.eyebrow}
              lines={[...CONTACT.headingLines]}
            />

            <Reveal delay={0.12}>
              <p className="mt-8 max-w-prose font-sans text-lg leading-[1.75] text-bone/85">
                {CONTACT.body}
              </p>
            </Reveal>

            <Reveal delay={0.2} className="mt-12">
              <ContactForm />
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <Reveal delay={0.16}>
              <dl className="space-y-10">
                <ContactRow label="LinkedIn">
                  <a
                    href={PERSON.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 font-sans text-lg text-bone transition-colors duration-300 hover:text-brass"
                  >
                    <LinkedInIcon />
                    {PERSON.name}
                    <span
                      aria-hidden
                      className="text-brass/70 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </a>
                </ContactRow>

                <ContactRow label="Based in">
                  <p className="font-sans text-lg text-bone">{PERSON.location}</p>
                </ContactRow>
              </dl>
            </Reveal>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-ink-line pt-6">
      <dt className="eyebrow mb-3">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Footer() {
  return (
    <footer className="shell mt-28 border-t border-ink-line py-10 md:mt-40">
      <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-bone-faint">
          © {new Date().getFullYear()} {PERSON.name}
        </p>
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-bone-faint">
          Toronto · Colombo
        </p>
      </div>
    </footer>
  );
}

/* Inline icon — one glyph does not justify an icon dependency, and inlining
   keeps it themeable with `currentColor`. */

function LinkedInIcon() {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-brass/80"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
