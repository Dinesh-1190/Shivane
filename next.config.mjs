const isGithubPages = process.env.NEXT_PUBLIC_GITHUB_PAGES === 'true';
const basePath = isGithubPages ? '/Shivane' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM; Next handles it, but transpiling the R3F
  // ecosystem avoids occasional interop breakage on the server render pass.
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
  eslint: { ignoreDuringBuilds: true },

  // ── Static export, for GitHub Pages ────────────────────────────────────
  // Every route on this site is already static (no API routes, no
  // server actions), so `output: 'export'` produces a plain `out/` directory
  // of HTML/CSS/JS that GitHub Pages — which can only serve files, never run
  // a Node server — can host as-is.
  output: 'export',
  // GitHub Pages has no image-optimization endpoint to call; ship the
  // originals directly. `lib/site.ts` carries the matching basePath logic so
  // metadata URLs and this build config can't drift apart.
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  // Static export writes `route/index.html` for every page; matching that
  // with a trailing slash on generated links is what keeps GitHub Pages
  // resolving them to the right file instead of a 404.
  trailingSlash: true,
};

export default nextConfig;
