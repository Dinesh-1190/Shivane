import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Reading `SITE_URL` (which is itself derived from `process.env.NEXT_PUBLIC_GITHUB_PAGES`)
// makes Next treat this route as environment-dependent and refuse to
// prerender it for `output: 'export'` unless told explicitly that the result
// is static for the whole build.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
