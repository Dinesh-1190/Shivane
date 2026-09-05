/**
 * Deployment target configuration.
 *
 * The site is statically exported and published to GitHub Pages as a
 * *project* page (github.com/Dinesh-1190/Shivane, not a user/org page), which
 * GitHub serves under a `/Shivane` sub-path rather than at the domain root —
 * every absolute URL the app emits (metadata, JSON-LD, sitemap, robots.txt)
 * has to include that sub-path or it silently points at the wrong place.
 *
 * `next.config.mjs` reads the same `NEXT_PUBLIC_GITHUB_PAGES` flag to set `basePath` /
 * `assetPrefix`, so this file and that config agree by construction rather
 * than by two people remembering to update both.
 *
 * The `NEXT_PUBLIC_` prefix is load-bearing, not decorative: `withBasePath`
 * below runs inside `'use client'` components (Hero, MediaPlaceholder), which
 * execute in the browser as well as at build time. Next.js only inlines
 * `NEXT_PUBLIC_*` env vars into the client bundle — a plain `GITHUB_PAGES`
 * reads correctly during the server-side export (producing correct SSR HTML)
 * but silently evaluates to `undefined` in the browser, so client-side
 * re-renders recompute `BASE_PATH` as `''`. That mismatch was caught by a real
 * symptom: an extra, wrongly-unprefixed `<link rel="preload">` appeared after
 * hydration even though the actual rendered `<img src>` was correct.
 */
const GITHUB_PAGES = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';

export const BASE_PATH = GITHUB_PAGES ? '/Shivane' : '';

const ORIGIN = GITHUB_PAGES ? 'https://dinesh-1190.github.io' : 'https://shivaneaugustus.com';

/** Full site URL including the sub-path, no trailing slash. */
export const SITE_URL = `${ORIGIN}${BASE_PATH}`;

/**
 * Builds a fully-qualified URL for a root-relative path (e.g. "/media/x.jpg").
 *
 * Metadata fields (`openGraph.images`, `alternates.canonical`, JSON-LD `url`)
 * need real absolute URLs here rather than paths resolved against
 * `metadataBase` — a leading-slash path resolved against a `new URL(base)`
 * replaces the base's own path, which would silently drop `/Shivane` and
 * point crawlers at the wrong host path entirely.
 */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/**
 * Prefixes a root-relative asset path (e.g. "/media/x.jpg") with `BASE_PATH`.
 *
 * Next's `basePath` config auto-prefixes JS/CSS chunks and its own file-based
 * metadata routes, but does *not* rewrite plain string `src` values passed to
 * `next/image` — verified against this project's own `output: 'export'`
 * build, where chunk URLs came out as `/Shivane/_next/...` while a literal
 * `<Image src="/media/x.jpg">` stayed `/media/x.jpg` and 404'd once deployed
 * under the `/Shivane` sub-path. Anything not starting with "/" is treated as
 * already-absolute (an external URL) and passed through untouched.
 */
export function withBasePath(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${BASE_PATH}${path}`;
}
