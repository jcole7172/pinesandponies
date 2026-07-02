// Directory data for all properties. SEO fields are DERIVED so a property
// created in the CMS needs only the human fields (name, slug, rate, ...).
export default {
  tags: ['property'],
  layout: 'property.njk',
  permalink: '/{{ slug }}.html',
  navBack: true,
  pageScript: 'assets/property-booking.js',
  eleventyComputed: {
    canonical: (data) => data.canonical || `/${data.slug}`,
    pageTitle: (data) => data.pageTitle || `${data.name} | Pines & Ponies Vacation Rental`,
    title: (data) => data.title || data.name,
    summary: (data) => data.summary || data.tagline || data.name,
    heroType: (data) => data.heroType || 'Private Retreat',
    description: (data) =>
      data.description ||
      `Book ${data.name} direct: ${String(data.tagline || '').toLowerCase() || 'a private Upstate New York retreat'}. Sleeps ${data.sleeps}, no platform service fees.`,
  },
};
