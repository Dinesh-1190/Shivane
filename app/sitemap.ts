import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// See app/robots.ts — reading SITE_URL makes this route look
// environment-dependent, so `output: 'export'` needs this to prerender it.
export const dynamic = 'force-static';

/**
 * Single-page site, so the sitemap has one entry. When the Photography /
 * Graphic Design / Web Development pages referenced in the client brief are
 * built, add them here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
