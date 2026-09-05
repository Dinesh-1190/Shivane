/**
 * House motion language.
 *
 * Two curves only, both without overshoot:
 *  - `entrance` (expo-out) for anything arriving on screen
 *  - `precise`  (symmetric) for state changes and exits
 *
 * Nothing here uses spring physics with bounce. The brief is explicit:
 * precision over playfulness. Springs appear in exactly one place —
 * MagneticButton's cursor pull — where the damping is set high enough that it
 * settles without overshooting.
 *
 * These two constants are the whole system. Components compose their own
 * variants from them rather than importing shared variant objects, because
 * every entrance on this site differs slightly in distance and delay, and a
 * one-size variant would have been overridden at nearly every call site.
 */
export const EASE = {
  entrance: [0.16, 1, 0.3, 1],
  precise: [0.65, 0, 0.35, 1],
} as const;

/**
 * Viewport config shared by every scroll-triggered section: reveal once, when
 * a quarter of the element is on screen.
 */
export const VIEWPORT = { once: true, amount: 0.25 } as const;
