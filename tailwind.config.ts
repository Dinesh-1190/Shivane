import type { Config } from 'tailwindcss';

/**
 * "Two Coasts" design system.
 *
 * Every colour is declared once as a CSS custom property in globals.css and
 * consumed here, so the palette can be retuned in one place without touching
 * component code.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          raised: 'rgb(var(--ink-raised) / <alpha-value>)',
          line: 'rgb(var(--ink-line) / <alpha-value>)',
        },
        brass: {
          DEFAULT: 'rgb(var(--brass) / <alpha-value>)',
          bright: 'rgb(var(--brass-bright) / <alpha-value>)',
          deep: 'rgb(var(--brass-deep) / <alpha-value>)',
        },
        steel: {
          DEFAULT: 'rgb(var(--steel) / <alpha-value>)',
          light: 'rgb(var(--steel-light) / <alpha-value>)',
        },
        bone: {
          DEFAULT: 'rgb(var(--bone) / <alpha-value>)',
          muted: 'rgb(var(--bone-muted) / <alpha-value>)',
          faint: 'rgb(var(--bone-faint) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Fluid display sizes — clamp() keeps the editorial scale intact from
        // 360px phones through ultrawide without per-breakpoint overrides.
        'display-xl': ['clamp(2.75rem, 9vw, 8.5rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3.6vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-sm': ['clamp(1.375rem, 2.2vw, 1.875rem)', { lineHeight: '1.2', letterSpacing: '-0.005em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.22em' }],
      },
      maxWidth: {
        shell: '84rem',
        prose: '38rem',
      },
      transitionTimingFunction: {
        // House easing curves. Expo-out for entrances, a tight symmetric curve
        // for state changes. Deliberately no overshoot anywhere.
        entrance: 'cubic-bezier(0.16, 1, 0.3, 1)',
        precise: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 48s) linear infinite',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
