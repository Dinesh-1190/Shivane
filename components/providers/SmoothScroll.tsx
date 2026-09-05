'use client';

import Lenis from 'lenis';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/useDeviceTier';

type ScrollState = {
  /** Normalised page progress, 0 at the top, 1 at the bottom. */
  progress: number;
  /** Pixels scrolled. */
  y: number;
  /** Instantaneous velocity, used for subtle velocity-reactive motion. */
  velocity: number;
};

/**
 * Scroll state is published through a ref rather than React state.
 *
 * The 3D scene samples it every frame inside `useFrame`; routing that through
 * React state would re-render the whole tree 60 times a second. Components
 * that genuinely need to re-render (the nav's scrolled state) subscribe to a
 * coarse boolean instead.
 */
const ScrollContext = createContext<{
  state: React.MutableRefObject<ScrollState>;
  lenis: React.MutableRefObject<Lenis | null>;
  scrolled: boolean;
}>({
  state: { current: { progress: 0, y: 0, velocity: 0 } },
  lenis: { current: null },
  scrolled: false,
});

export const useScrollState = () => useContext(ScrollContext);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const state = useRef<ScrollState>({ progress: 0, y: 0, velocity: 0 });
  const lenis = useRef<Lenis | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // With reduced motion we hand scrolling back to the browser entirely —
    // inertia smoothing is itself a motion effect.
    if (reducedMotion) {
      const onNativeScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        state.current = {
          progress: max > 0 ? window.scrollY / max : 0,
          y: window.scrollY,
          velocity: 0,
        };
        setScrolled(window.scrollY > 24);
      };
      onNativeScroll();
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      return () => window.removeEventListener('scroll', onNativeScroll);
    }

    const instance = new Lenis({
      // Slightly longer than default: the site's motion language is unhurried,
      // but not so long that the page feels like it is resisting the user.
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      // Touch devices keep native scrolling — smoothing it fights the platform
      // and is the usual source of "scroll feels broken on mobile".
      syncTouch: false,
      wheelMultiplier: 1,
    });
    lenis.current = instance;

    instance.on('scroll', ({ scroll, limit, velocity }: Lenis) => {
      state.current = {
        progress: limit > 0 ? scroll / limit : 0,
        y: scroll,
        velocity,
      };
      setScrolled(scroll > 24);
    });

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      instance.destroy();
      lenis.current = null;
    };
  }, [reducedMotion]);

  return (
    <ScrollContext.Provider value={{ state, lenis, scrolled }}>
      {children}
    </ScrollContext.Provider>
  );
}

/**
 * Anchor navigation that respects whichever scroll engine is active.
 * Returns a click handler for `#section` links.
 */
export function useAnchorScroll() {
  const { lenis } = useScrollState();

  return (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    if (lenis.current) {
      lenis.current.scrollTo(target as HTMLElement, { offset: 0, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Keep the URL shareable without triggering a second, instant jump.
    window.history.replaceState(null, '', href);
  };
}
