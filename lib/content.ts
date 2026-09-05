/**
 * Single source of truth for all site copy.
 *
 * Every string here is taken verbatim (or lightly tightened for web
 * readability) from the client document "Shivane Augustus — website content".
 * Do not invent facts, titles, company descriptions or expertise areas here —
 * if new copy is needed, it comes from the client first.
 */

export const PERSON = {
  name: 'Shivane Augustus',
  /*
   * NOTE: the legal surname "Theverapperuma" appears exactly once on the whole
   * site — inside the first ABOUT paragraph below. Per the client's SEO notes
   * it must never enter titles, headings, alt text or meta tags.
   */
  roles: ['Entrepreneur', 'Founder', 'Angel Investor'] as const,
  tagline: 'Building brands and businesses across Canada and Sri Lanka.',
  location: 'Toronto, Ontario, Canada',
  linkedin: 'https://www.linkedin.com/in/shivane-augustus-1590b31bb/',
  phone: '+1 (437) 259-4867',
  phoneHref: 'tel:+14372594867',
} as const;

export const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Companies', href: '#companies' },
  { label: 'Investing', href: '#investing' },
  { label: 'Creative Work', href: '#creative-work' },
  { label: 'Contact', href: '#contact' },
] as const;

export const ABOUT = {
  eyebrow: 'About',
  /**
   * Headings are authored as explicit lines, not one string.
   * KineticHeading masks each line separately, so the line breaks have to be
   * decided here rather than left to the browser — a line that rewraps is a
   * line whose mask no longer matches it.
   */
  headingLines: ['A career built', 'across two', 'coastlines.'],
  body: [
    'Shivane Augustus (Theverapperuma) is a Toronto based entrepreneur and director with an active portfolio across media, hospitality, travel and marketing.',
    'He currently serves as President of Creative Touch Media Inc. and is a Director of Premium Global Expeditions Inc. in Canada, and holds marketing leadership roles with Lake Villas Premium in Kandy, Sri Lanka, and Hershley Group Pvt Ltd.',
    'Alongside his operating roles, he is an active angel investor, backing early-stage businesses where his international network and marketing expertise can accelerate growth.',
    'Born and raised in Colombo, Sri Lanka, and now based in Toronto, Canada, Shivane brings a cross-market perspective shaped by experience building brands in both the Canadian and South Asian business landscapes.',
  ],
} as const;

export const EDUCATION = {
  eyebrow: 'Early Life & Education',
  headingLines: ['Three countries,', 'one perspective.'],
  // Ordered latest-first: University of London, then Humber, then Stafford.
  milestones: [
    {
      institution: 'University of London',
      place: 'United Kingdom',
      note: 'Further study in the United Kingdom, completing an international academic foundation.',
    },
    {
      institution: 'Humber Polytechnic',
      place: 'Toronto, Canada',
      note: 'Continued his studies in Canada, where he is now based.',
    },
    {
      institution: 'Stafford International School',
      place: 'Colombo 7, Sri Lanka',
      note: 'Educated in Colombo before relocating to Canada to continue his studies.',
    },
  ],
} as const;

export type Company = {
  /** Two-letter monogram shown until a real logo asset is supplied. */
  monogram: string;
  name: string;
  role: string;
  location: string;
  description: string;
  /** External site the company card links out to. */
  url: string;
  /** Short capability tags derived from the company description. */
  tags: readonly string[];
  /** Structured address, consumed by the schema.org Person `worksFor` entries. */
  address: {
    '@type': 'PostalAddress';
    addressLocality?: string;
    addressRegion?: string;
    addressCountry: string;
  };
};

export const COMPANIES: readonly Company[] = [
  {
    monogram: 'CT',
    name: 'Creative Touch Media Inc.',
    role: 'Director',
    location: 'Toronto, Ontario, Canada',
    description:
      'A creative agency specializing in real estate media, business branding, web development, and social media marketing, built to turn a brand into a growth engine. Creative Touch Media works with realtors, businesses, and individuals to build a professional identity that performs.',
    url: 'https://www.creativetouchmedia.ca/',
    tags: ['Real Estate Media', 'Branding', 'Web Development', 'Social Media'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toronto',
      addressRegion: 'Ontario',
      addressCountry: 'CA',
    },
  },
  {
    monogram: 'PG',
    name: 'Premium Global Expeditions Inc.',
    role: 'Director',
    location: 'Canada',
    description:
      'A global travel company creating exceptional journeys, from bespoke holidays and international tours to flights, cruises, and premium accommodations. Premium Global Expeditions brings together global reach and trusted local expertise to make every journey seamless and memorable.',
    url: 'https://www.premiumglobalexp.ca/',
    tags: ['Bespoke Travel', 'International Tours', 'Cruises', 'Accommodation'],
    address: { '@type': 'PostalAddress', addressCountry: 'CA' },
  },
  {
    monogram: 'LV',
    name: 'Lake Villas Premium',
    role: 'Marketing Director',
    location: 'Kandy, Sri Lanka',
    description:
      'A property management company overseeing a collection of luxury villas, where luxury meets tranquility. A peaceful retreat from the everyday, framed by tranquil waters or mountainous greenery.',
    url: 'https://lakevillaskandy.com/',
    tags: ['Luxury Villas', 'Property Management', 'Hospitality'],
    address: { '@type': 'PostalAddress', addressLocality: 'Kandy', addressCountry: 'LK' },
  },
  {
    monogram: 'HG',
    name: 'Hershley Group Pvt Ltd',
    role: 'Marketing Director',
    location: 'Sri Lanka',
    description:
      'A parent company managing multiple business arms, including Hershley’s Cloud Kitchen, alongside operations in hospitality and property management, travel, and DMC (destination management) services.',
    url: 'https://www.hershley.com/',
    tags: ['Cloud Kitchen', 'Hospitality', 'Property', 'DMC Services'],
    address: { '@type': 'PostalAddress', addressCountry: 'LK' },
  },
] as const;

export const COMPANIES_SECTION = {
  eyebrow: 'Company Portfolio',
  headingLines: ['Four ventures.', 'Two markets.'],
} as const;

export const INVESTING = {
  eyebrow: 'Angel Investing',
  headingLines: ['Capital is the', 'entry point. The', 'network is the', 'advantage.'],
  body: [
    'Beyond his operating roles, Shivane is an active angel investor. An important part of the value he brings as an investor beyond capital is his international network. Through his professional and business activities, he has built relationships with businesses, brands, and professionals across multiple markets.',
    'He is particularly interested in opportunities where these international connections, combined with his experience in marketing, travel, and business development, can help promising businesses expand their reach and enter new markets.',
  ],
  expertiseLabel: 'Principal areas of expertise',
  expertise: [
    'Travel, Tourism & Hospitality',
    'International Business Development & Market Entry',
    'Digital Marketing & Social Media Strategy',
    'Branding & Brand Development',
    'Media, Content & Communications',
    'Franchise & Partnership Facilitation',
    'Market Expansion & Strategic Partnerships',
    'Supporting Early-Stage and Growing Businesses',
  ],
  /**
   * Only figures derivable from the client copy are shown. If the client later
   * confirms additional metrics (years active, deals closed), add them here —
   * the component renders whatever this array contains.
   */
  stats: [
    { value: 4, label: 'Companies', suffix: '' },
    { value: 3, label: 'Markets', suffix: '' },
    { value: 8, label: 'Areas of expertise', suffix: '' },
  ],
} as const;

export const BRANDS = {
  eyebrow: 'Brands Worked With',
  headingLines: ['Trusted across categories', 'and continents.'],
  logos: [
    'Apple',
    'Hilton',
    'Royal LePage',
    'RE/MAX',
    'The Depanneur',
    'FAB Restaurants',
    'TBCL',
    'Sports Check',
    'Gardner Galleries',
  ],
  note: 'Additional brand partners to be added.',
} as const;

export const CREATIVE_WORK = {
  eyebrow: 'Creative Work',
  headingLines: ['The craft behind', 'the ventures.'],
  body: 'Alongside his business roles, Shivane brings hands-on creative execution to his ventures — photography, videography, cinematography, graphic design, and web development. This is the same skill set behind Creative Touch Media’s client work, and it shows up in his own brand-building across every company he’s part of.',
  /**
   * Delivered assets are all portrait frames from the same behind-the-scenes
   * set, so the gallery renders them as one disciplined 4-up grid at a shared
   * ratio rather than the mixed portrait/landscape/square layout drafted
   * before real photos existed. `ratio` is set to the grid's target shape;
   * `position` (a CSS object-position value) is only set where the source
   * frame needs a deliberate crop bias to keep its real subject in frame.
   */
  disciplines: [
    {
      title: 'Photography',
      detail: 'Portraiture, events, real estate & product photography',
      image: '/media/creative/photography.jpg',
      alt: 'Behind-the-scenes portrait shoot: a Nikon camera on a tripod, its LCD showing the black-and-white portrait in progress, with the model posing in soft studio light behind it.',
      ratio: '4 / 5' as const,
    },
    {
      title: 'Cinematography',
      detail: 'Cinematography & drone production',
      image: '/media/creative/cinematography.jpg',
      alt: 'A gimbal-mounted camera framing a modern living room interior at dusk, city skyline visible through floor-to-ceiling windows beyond.',
      ratio: '4 / 5' as const,
    },
    {
      title: 'Graphic & Brand Design',
      detail: 'Graphic & brand design',
      image: '/media/creative/graphic-design.jpg',
      alt: 'A brand identity project for "VYRO" open in Photoshop on a desktop monitor, showing a moodboard, logo mark, and product packaging mockup.',
      ratio: '4 / 5' as const,
    },
    {
      title: 'Web Development',
      detail: 'Web development',
      image: '/media/creative/web-development.jpg',
      alt: 'A developer building a website across two screens beneath the illuminated Creative Touch Media logo, code open alongside a live preview of the site.',
      // Frame is narrower than the shared 4:5 grid, so the crop trims mostly
      // from the desk/hands at the bottom rather than the logo or monitor.
      ratio: '4 / 5' as const,
      position: '50% 38%',
    },
  ],
} as const;

export const CONTACT = {
  eyebrow: 'Contact',
  headingLines: ['Let’s begin a', 'conversation.'],
  body: 'Let’s connect for business inquiries, partnerships, investment opportunities, or creative projects.',
} as const;

/** Cities that anchor the globe's arc network, in the order they are drawn. */
export const CITIES = [
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612 },
  { name: 'Kandy', country: 'Sri Lanka', lat: 7.2906, lng: 80.6337 },
] as const;

/** Great-circle routes drawn between the cities above, by index. */
export const ROUTES: readonly [number, number][] = [
  [0, 1], // Toronto → London
  [1, 2], // London → Colombo
  [0, 2], // Toronto → Colombo
  [2, 3], // Colombo → Kandy
];
