import {
  commonWebsites,
  designationGroups,
  ageWebsites,
  regionWebsites,
  interestWebsites
} from '../data/websiteData';
import { CATEGORIES, classifyDomain } from '../data/websiteCategories';

const OPTIONS_PER_CATEGORY = 9;

// How strongly each signal suggests a website is familiar to this person.
const WEIGHT = { interest: 3, designation: 2.5, region: 2, age: 2, common: 1 };

// Interests typed by the user may not be in the catalogue. Match them to the
// closest known interest, e.g. "Street food" -> "Food", "Rock music" -> "Music".
function resolveInterest(interest) {
  const text = interest.toLowerCase();
  if (interestWebsites[interest]) return interest;
  return Object.keys(interestWebsites).find(known => {
    const k = known.toLowerCase();
    return text === k || text.includes(k) || (text.length > 3 && k.includes(text));
  });
}

// The full catalogue, regardless of this user's answers - every category is seeded
// from this so a category can never come up short just because an answer didn't
// happen to touch it (e.g. no interest maps to "Travel & Lifestyle").
const FULL_CATALOGUE = new Set([
  ...commonWebsites,
  ...designationGroups.flatMap(g => g.sites),
  ...Object.values(ageWebsites).flat(),
  ...Object.values(regionWebsites).flat(),
  ...Object.values(interestWebsites).flat()
]);

// Scores every catalogued site against the user's answers - unchanged from the
// original flat-list logic, just no longer sliced/shuffled itself. Sites with no
// matching signal simply score 0 and rank behind personalized ones.
function scoreAll({ designation, age, region, interests = [] }) {
  const scores = new Map();
  const add = (sites, weight) => {
    sites.forEach(site => {
      scores.set(site, (scores.get(site) || 0) + weight);
    });
  };

  add(commonWebsites, WEIGHT.common);

  const role = (designation || '').toLowerCase();
  designationGroups.forEach(group => {
    if (group.pattern.test(role)) add(group.sites, WEIGHT.designation);
  });

  if (ageWebsites[age]) add(ageWebsites[age], WEIGHT.age);
  if (regionWebsites[region]) add(regionWebsites[region], WEIGHT.region);

  interests.forEach(interest => {
    const known = resolveInterest(interest);
    if (known) add(interestWebsites[known], WEIGHT.interest);
  });

  return scores;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Buckets the catalogue into the high-level categories, ranks each bucket by
// relevance to the user's answers, and returns the top options per category -
// e.g. { work: [...9 sites], social: [...9 sites], ... }. Sites the user has no
// particular signal for still appear (score 0 + jitter), so every category stays
// full even when an answer doesn't touch it.
export function generateWebsiteCategories(userData) {
  const scores = scoreAll(userData);

  const buckets = {};
  CATEGORIES.forEach(c => { buckets[c.key] = []; });

  FULL_CATALOGUE.forEach(site => {
    const key = classifyDomain(site);
    const score = (scores.get(site) || 0) + Math.random() * 1.5;
    buckets[key].push({ site, score });
  });

  const result = {};
  CATEGORIES.forEach(({ key }) => {
    const top = buckets[key]
      .sort((a, b) => b.score - a.score)
      .slice(0, OPTIONS_PER_CATEGORY)
      .map(entry => entry.site);
    result[key] = shuffle(top);
  });
  return result;
}
