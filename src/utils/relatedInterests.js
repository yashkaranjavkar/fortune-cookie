import { relatedInterestsMap } from '../data/constants';

// Make the relation two-way: if A lists B, then B is also related to A.
const graph = {};
Object.entries(relatedInterestsMap).forEach(([interest, related]) => {
  graph[interest] = graph[interest] || new Set();
  related.forEach(r => {
    graph[interest].add(r);
    graph[r] = graph[r] || new Set();
    graph[r].add(interest);
  });
});

const lookup = {};
Object.keys(graph).forEach(k => { lookup[k.toLowerCase()] = k; });

// Interests related to the current selection, ranked by how many of the selected
// interests point to them (closest match first). Selected interests are excluded.
export function getRelatedInterests(selected, limit = 12) {
  const chosen = new Set(selected.map(s => s.toLowerCase()));
  const score = new Map();

  selected.forEach(interest => {
    const key = lookup[interest.toLowerCase()];
    if (!key) return; // custom interest with no known relations
    graph[key].forEach(r => {
      if (chosen.has(r.toLowerCase())) return;
      score.set(r, (score.get(r) || 0) + 1);
    });
  });

  return Array.from(score.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}
