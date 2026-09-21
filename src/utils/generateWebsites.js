import {
  commonWebsites,
  designationGroups,
  ageWebsites,
  regionWebsites,
  interestWebsites
} from '../data/websiteData';

const TOTAL_WEBSITES = 30;

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

export function generateWebsites({ designation, age, region, interests = [] }) {
  const scores = new Map();
  const add = (sites, weight) => {
    sites.forEach(site => {
      // Each signal contributes once per site, with a slight bonus for repeats
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

  // Highest relevance first, with jitter so ties (and near-ties) vary between users.
  // Then shuffle the top picks so the screen doesn't read as a ranked list.
  const top = Array.from(scores.entries())
    .map(([site, score]) => ({ site, rank: score + Math.random() * 1.5 }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, TOTAL_WEBSITES)
    .map(entry => entry.site);

  for (let i = top.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [top[i], top[j]] = [top[j], top[i]];
  }
  return top;
}
