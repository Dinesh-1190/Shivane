import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { COMPANIES, PERSON } from '@/lib/content';
import './globals.css';

/**
 * Type pairing.
 *
 * Playfair Display carries the editorial, high-contrast register the brief
 * asks for — the annual-report serif — and is the face the hero name depends
 * on. Inter handles body copy, UI labels and all tabular figures.
 *
 * Both are self-hosted by next/font: no render-blocking request to Google, no
 * layout shift, and `display: swap` so text is never invisible.
 */
const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = 'https://shivaneaugustus.com';
const DESCRIPTION =
  'Shivane Augustus is a Toronto based entrepreneur, director and angel investor with an active portfolio across media, hospitality, travel and marketing in Canada and Sri Lanka.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Exactly as specified in the client's SEO notes.
  title: 'Shivane Augustus | Entrepreneur, Director & Angel Investor — Toronto',
  description: DESCRIPTION,
  keywords: [
    'Shivane Augustus',
    'Toronto entrepreneur',
    'angel investor Toronto',
    'Creative Touch Media',
    'Premium Global Expeditions',
    'Lake Villas Premium',
    'Hershley Group',
  ],
  authors: [{ name: PERSON.name }],
  creator: PERSON.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    siteName: PERSON.name,
    title: 'Shivane Augustus | Entrepreneur, Director & Angel Investor — Toronto',
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_CA',
    images: [
      {
        url: '/media/hero-shivane.jpg',
        width: 1600,
        height: 773,
        alt: `${PERSON.name} — Entrepreneur, Director & Angel Investor`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shivane Augustus | Entrepreneur, Director & Angel Investor',
    description: DESCRIPTION,
    images: ['/media/hero-shivane.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0B0E',
  colorScheme: 'dark',
};

/**
 * schema.org/Person, per the client's technical notes: name, jobTitle, a
 * `worksFor` entry per company, and `sameAs` pointing at LinkedIn.
 * "Theverapperuma" is deliberately absent — it appears only in About body copy.
 */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PERSON.name,
  jobTitle: 'Entrepreneur, Director & Angel Investor',
  description: DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/media/hero-shivane.jpg`,
  telephone: PERSON.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Toronto',
    addressRegion: 'Ontario',
    addressCountry: 'CA',
  },
  nationality: { '@type': 'Country', name: 'Sri Lanka' },
  alumniOf: [
    { '@type': 'EducationalOrganization', name: 'Stafford International School' },
    { '@type': 'EducationalOrganization', name: 'Humber Polytechnic' },
    { '@type': 'EducationalOrganization', name: 'University of London' },
  ],
  worksFor: COMPANIES.map((company) => ({
    '@type': 'Organization',
    name: company.name,
    address: company.address,
  })),
  knowsAbout: [
    'Travel, Tourism & Hospitality',
    'International Business Development & Market Entry',
    'Digital Marketing & Social Media Strategy',
    'Branding & Brand Development',
    'Media, Content & Communications',
    'Franchise & Partnership Facilitation',
    'Market Expansion & Strategic Partnerships',
    'Supporting Early-Stage and Growing Businesses',
  ],
  sameAs: [PERSON.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Content is authored in lib/content.ts, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
