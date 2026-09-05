# Shivane Augustus — portfolio site

"Two Coasts": a formal, animation-forward one-page site for a Toronto-based
entrepreneur, director and angel investor with ventures across Canada and Sri
Lanka.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind · Framer Motion ·
React Three Fiber + drei + postprocessing · Lenis

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

---

## The two ideas the design rests on

**1. The hero name is set *into* the photograph.** The name uses
`mix-blend-mode: overlay` on white type, so every letter takes its brightness
from the pixels beneath it — luminous against the sky, dropping to smoke where
it crosses the figure, with the photo's own texture reading through the
letterforms. `.hero-name` in `app/globals.css` owns this, including a
`@supports` fallback to plain light type for browsers without blend modes.

**2. One 3D motif travels the whole page.** A single wireframe globe with brass
great-circle arcs between Toronto, London, Colombo and Kandy. It is not
re-created per section — it moves, rescales and dims as you scroll, from absent
behind the hero to fully centred in Angel Investing.

---

## Layout of the code

```
app/
  layout.tsx          fonts, metadata, schema.org/Person JSON-LD
  page.tsx            section assembly
  globals.css         design tokens, .hero-name, reduced-motion rules
components/
  sections/           one file per page section
  three/              the globe: Globe, Arcs, CityMarkers, Dust, scene, canvas
  ui/                 nav, preloader, buttons, form, placeholders, skyline
  providers/          Lenis + the shared scroll-progress channel
lib/
  content.ts          ← all site copy lives here
  useStageTrack.ts    globe choreography
  useDeviceTier.ts    quality tiers + prefers-reduced-motion
  geo.ts              lat/lng → sphere, great-circle arcs
  motion.ts           the two easing curves and the shared viewport config
content/
  source-copy.txt     text extracted from the client PDF, for reference
```

---

## Content is a single source of truth

**All copy lives in `lib/content.ts`.** Nothing is hardcoded in components.
Headings are stored as explicit line arrays (`headingLines`) rather than
sentences, because `KineticHeading` masks each line separately — a line that
rewraps is a line whose mask no longer matches it. If you change a heading,
change the line breaks with it and check it at 1280px and 1440px.

Two rules carried over from the client's SEO notes:

- Titles, headings, alt text and meta always say **"Shivane Augustus"**.
- **"Theverapperuma"** appears exactly once on the entire site, in the first
  About paragraph, as "Shivane Augustus (Theverapperuma)". It is deliberately
  absent from the JSON-LD and all metadata.

---

## Dropping in real media

Every image slot is already a typed placeholder that owns its aspect ratio and
alt text, so **adding a real asset is a one-prop change and shifts no layout**.

```tsx
// components/ui/MediaPlaceholder.tsx
<MediaPlaceholder alt="…" ratio="4 / 5" />              // empty slot
<MediaPlaceholder alt="…" ratio="4 / 5" src="/media/x.jpg" />  // real asset
```

- **Creative work gallery** — `CREATIVE_WORK.disciplines` in `lib/content.ts`.
  Add a `src` per discipline and pass it through in `sections/CreativeWork.tsx`.
- **Company logos** — the cards currently show a two-letter monogram
  (`Company.monogram`). Swap the monogram block in `sections/Companies.tsx` for
  a `MediaPlaceholder` once logos arrive.
- **Brand strip** — `BrandMark` renders a typographic wordmark until given a
  `src`; pass one and it becomes a greyscale→colour logo on hover.

Put files in `public/media/`.

---

## Wiring up the contact form

`components/ui/ContactForm.tsx` validates, shows submitting/sent/error states
and announces the result to screen readers — but **nothing is sent yet**. There
is one integration point, marked in the file:

```ts
// ── Integration point ──
await fetch('/api/contact', { method: 'POST', … });
```

Drop in an API route, Resend, Formspree — whatever the client chooses. The
surrounding UI states already handle it.

---

## Tuning the globe

`lib/useStageTrack.ts` holds `STAGE_DIRECTIONS`: one entry per section id giving
the globe's position, scale, presence (`dim`) and rotation while that section
owns the screen.

The track is **measured from real section geometry at runtime**, not hardcoded
to scroll percentages. That matters: with fixed percentages, editing a
paragraph silently shifts the choreography, and the globe ends up parked on top
of a headline. Each keyframe lands where its section's centre meets the
viewport's centre.

Two things to know when editing:

- **Keep consecutive directions on the same side of the screen** unless you
  want the globe crossing the page between them. It only crosses at section
  boundaries, where nothing is being read.
- **`dim` is the master control.** Sections where copy must stay perfectly
  legible sit at 0.05–0.2; Investing is the one section at ~1.

The Investing section's grid deliberately leaves columns 5–8 empty on desktop.
That gap is the globe's home — don't fill it.

---

## Performance and accessibility

- **The 3D canvas is code-split and never server-rendered**
  (`components/three/GlobeStageLoader.tsx`). The hero photo, name and nav paint
  before any WebGL work starts. First Load JS for the page is ~181 kB; three.js
  streams in behind it.
- **Quality tiers** (`lib/useDeviceTier.ts`) scale DPR, geometry resolution and
  particle counts. Bloom — the most expensive pass — runs only on high-tier
  devices *and* only while the globe is actually prominent. On narrow screens
  the globe fades rather than being dragged to centre behind the copy.
- **Scroll state is published through a ref, not React state.** The scene
  samples it every frame; routing 60fps through React would re-render the tree
  continuously. Same reasoning in `ScrollProgress` and `Spotlight`, which write
  to the DOM directly.
- **`prefers-reduced-motion`** gives a calmer design, not a broken one: Lenis
  hands scrolling back to the browser, entrances become opacity fades, the
  globe holds a fixed three-quarter view, and the skyline band shows a single
  static composition.
- Semantic headings, keyboard-navigable nav and form, `aria-invalid` /
  `aria-describedby` on fields, a live region for submit status, and a visible
  brass focus ring against the near-black background.

---

## Known follow-ups

- Contact form transport (above).
- Real photography, company logos and brand logos.
- The client brief mentions separate Photography / Graphic Design / Web
  Development pages. If they are built, add them to `app/sitemap.ts` and link
  them from the Creative Work section.
- `SITE_URL` in `app/layout.tsx`, `app/robots.ts` and `app/sitemap.ts` is a
  placeholder — set it to the real domain before launch.
- Investing stats show only figures derivable from the supplied copy
  (4 companies, 3 markets, 8 areas of expertise). If the client confirms
  further metrics, add them to `INVESTING.stats`; the row renders whatever the
  array holds.
