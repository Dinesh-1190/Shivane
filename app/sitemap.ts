import type { MetadataRoute } from 'next';

const SITE_URL = 'https://shivaneaugustus.com';

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
