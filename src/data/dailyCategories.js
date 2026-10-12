import domainData from './countryDomains.json';

// The options for "What do you use the internet for most?" (player details): the
// broad Cloudflare categories ("super categories") of the player's own country's most
// popular domains, as ranked by Cloudflare Radar (src/data/countryDomains.json, from
// scripts/fetch-cloudflare-domains.js).

export const MAX_OPTIONS = 12; // categories offered
export const MAX_PICKS = 5;    // categories a player can choose

// Radar gives each domain Cloudflare's detailed categories. This is Cloudflare's own
// table of which broad category each belongs to, from
// https://developers.cloudflare.com/cloudflare-one/policies/gateway/domain-categories/
const SUPER_CATEGORIES = {
  'Business & Economy': ['Brokerage & Investing', 'Business', 'Economy & Finance', 'Cryptocurrency', 'Personal Finance'],
  'Education': ['Education', 'Educational Institutions', 'Reference', 'Science', 'Space & Astronomy'],
  'Entertainment': ['Arts', 'Audio Streaming', 'Cartoons & Anime', 'Comic Books', 'Entertainment', 'Fine Art', 'Gaming',
    'Home Video/DVD', 'Humor', 'Magazines', 'Movies', 'Music', 'News & Media', 'Paranormal', 'Radio', 'Television', 'Video Streaming'],
  'Government & Politics': ['Charity and Non-profit', 'Government/Legal', 'Politics, Advocacy, and Government-Related'],
  'Health': ['Health & Fitness', 'Sex Education'],
  'Internet Communication': ['Chat', 'Forums', 'Information Security', 'Instant Messengers', 'Internet Phone & VOIP',
    'Messaging', 'P2P', 'Personal Blogs', 'Webmail', 'Photo Sharing'],
  'Job Search & Careers': ['Job Search & Careers'],
  'Real Estate': ['Real Estate'],
  'Religion': ['Religion & Spirituality'],
  'Shopping & Auctions': ['Auctions & Marketplaces', 'Coupons', 'Ecommerce', 'Shopping'],
  'Society & Lifestyle': ['Arts & Crafts', 'Astrology', 'Clothing', 'Dating & Relationships', 'Digital Postcards', 'Parenting',
    'Fashion', 'Food & Drink', 'Hobbies & Interests', 'Home & Garden', 'Lifestyle', 'Pets', 'Photography',
    'Professional Networking', 'Social Networks'],
  'Sports': ['Sports'],
  'Technology': ['File Sharing', 'Information Technology', 'News, Portal & Search', 'Search Engines', 'Technology',
    'Translator', 'Artificial Intelligence', 'Remote Access', 'Shareware/Freeware'],
  'Travel': ['Travel'],
  'Vehicles': ['Vehicles'],
  'Weather': ['Weather'],
};
// Left out on purpose: the plumbing devices talk to in the background (content
// servers, APIs, ads, trackers, login screens...), security labels, and adult or
// questionable content - none of them is something a player "uses the internet for".

const SUPER_OF = new Map(
  Object.entries(SUPER_CATEGORIES).flatMap(([group, subs]) => subs.map(sub => [sub, group]))
);

// Until the Cloudflare data has been fetched (or for a country Radar has no ranking
// for, with no worldwide list either): the broad categories themselves, without
// example sites, since none would be from Cloudflare
const FALLBACK = Object.keys(SUPER_CATEGORIES).slice(0, MAX_OPTIONS).map(name => ({ name, examples: [] }));

// [{ name, examples: [up to 3 of the country's top domains in it] }], most popular
// first, plus where the list came from ('country' | 'global' | 'fallback')
export function categoryOptions(countryCode) {
  const own = countryCode && domainData.countries[countryCode];
  const list = own || domainData.global;
  if (!list || !list.length) return { options: FALLBACK, source: 'fallback' };

  // A broad category scores more the more of the top domains are in it, and the
  // higher those domains rank (each domain counts once per broad category)
  const score = new Map();
  const examples = new Map();
  list.forEach(({ d, c }, i) => {
    const weight = list.length - i;
    const groups = new Set(c.map(sub => SUPER_OF.get(sub)).filter(Boolean));
    groups.forEach((group) => {
      score.set(group, (score.get(group) || 0) + weight);
      const ex = examples.get(group) || [];
      if (ex.length < 3) ex.push(d);
      examples.set(group, ex);
    });
  });

  const options = [...score.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_OPTIONS)
    .map(([name]) => ({ name, examples: examples.get(name) }));
  if (!options.length) return { options: FALLBACK, source: 'fallback' };
  return { options, source: own ? 'country' : 'global' };
}

export const domainDataInfo = { source: domainData.source, fetchedAt: domainData.fetchedAt };
