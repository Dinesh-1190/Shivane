'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAnchorScroll, useScrollState } from '@/components/providers/SmoothScroll';
import { NAV_ITEMS, PERSON } from '@/lib/content';
import { EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Persistent header.
 *
 * Desktop mirrors the reference composition: navigation split either side of a
 * centred wordmark. Over the photographic hero the bar is transparent so the
 * image runs edge to edge; once past it, a blurred charcoal panel fades in to
 * keep the links legible against arbitrary content.
 */
export function Nav() {
  const { scrolled } = useScrollState();
  const onAnchorClick = useAnchorScroll();
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock the page behind the mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close on Escape — the panel is a modal surface and must behave like one.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const [left, right] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)];

  const linkClass =
    'relative py-2 text-[0.68rem] uppercase tracking-[0.2em] text-bone/70 transition-colors duration-300 hover:text-bone';

  const underline = (
    <span
      aria-hidden
      className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brass transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
    />
  );

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE.entrance, delay: 0.15 }}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500',
          scrolled
            ? 'border-b border-ink-line/80 bg-ink/72 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav
          aria-label="Primary"
          className="shell flex h-[4.5rem] items-center justify-between gap-8 md:h-20"
        >
          {/* Desktop: two links, wordmark, three links. */}
          {/* Both groups justify toward the middle so the five links read as
              one composition around the wordmark rather than two clusters
              pinned to opposite edges. */}
          <ul className="hidden flex-1 items-center justify-end gap-9 lg:flex">
            {left.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(event) => onAnchorClick(event, item.href)}
                  className={cn('group', linkClass)}
                >
                  {item.label}
                  {underline}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#top"
            onClick={(event) => onAnchorClick(event, '#top')}
            className="shrink-0 whitespace-nowrap px-0 font-sans text-[0.72rem] uppercase tracking-[0.34em] text-bone transition-colors duration-300 hover:text-brass lg:mx-10 lg:text-[0.78rem]"
          >
            {PERSON.name}
          </a>

          <ul className="hidden flex-1 items-center justify-start gap-9 lg:flex">
            {right.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(event) => onAnchorClick(event, item.href)}
                  className={cn('group', linkClass)}
                >
                  {item.label}
                  {underline}
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.4, ease: EASE.precise }}
              className="block h-px w-6 bg-bone"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.4, ease: EASE.precise }}
              className="block h-px w-6 bg-bone"
            />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE.precise }}
            className="fixed inset-0 z-40 bg-ink/97 backdrop-blur-2xl lg:hidden"
          >
            <ul className="shell flex h-full flex-col justify-center gap-2">
              {NAV_ITEMS.map((item, index) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE.entrance, delay: 0.06 * index + 0.1 }}
                  className="border-b border-ink-line"
                >
                  <a
                    href={item.href}
                    onClick={(event) => {
                      setMenuOpen(false);
                      onAnchorClick(event, item.href);
                    }}
                    className="flex items-baseline gap-4 py-5 font-display text-3xl text-bone"
                  >
                    <span className="font-sans text-[0.6rem] tracking-[0.2em] text-brass">
                      0{index + 1}
                    </span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
