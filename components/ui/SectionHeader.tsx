'use client';

import { motion } from 'framer-motion';
import { EASE, VIEWPORT } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { KineticHeading } from './KineticHeading';

/**
 * Shared section opener: numbered eyebrow, a rule that draws itself, and a
 * mask-revealed headline. Using one component for every section is what keeps
 * the vertical rhythm identical down the whole page.
 */
export function SectionHeader({
  index,
  eyebrow,
  lines,
  className,
  align = 'left',
  width = 'column',
}: {
  /** 1-based section number, rendered as 01, 02, … */
  index: number;
  eyebrow: string;
  /** Headline split into explicit mask lines. */
  lines: string[];
  className?: string;
  align?: 'left' | 'center';
  /**
   * 'column' sizes the headline to fit a ~5-of-12 grid column; 'wide' is for
   * headings that own the full shell. Getting this wrong makes an authored
   * mask line wrap onto two visual lines, which breaks the reveal.
   */
  width?: 'column' | 'wide';
}) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        className={cn('flex items-center gap-4', align === 'center' && 'justify-center')}
      >
        <motion.span
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.entrance } },
          }}
          className="font-sans text-[0.6rem] tracking-[0.24em] text-brass/70"
        >
          {String(index).padStart(2, '0')}
        </motion.span>

        <motion.span
          variants={{
            hidden: { scaleX: 0 },
            visible: {
              scaleX: 1,
              transition: { duration: 0.9, ease: EASE.entrance, delay: 0.05 },
            },
          }}
          className="h-px w-10 origin-left bg-brass/45"
        />

        <motion.span
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: EASE.entrance, delay: 0.1 },
            },
          }}
          className="eyebrow"
        >
          {eyebrow}
        </motion.span>
      </motion.div>

      <KineticHeading
        lines={lines}
        as="h2"
        delay={0.12}
        className={cn(
          'mt-6 max-w-[20ch] text-bone',
          width === 'wide' ? 'text-display-md md:text-display-lg' : 'text-display-md',
          align === 'center' && 'mx-auto',
        )}
      />
    </div>
  );
}
