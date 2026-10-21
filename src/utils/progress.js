import { GAME_PARTS, PART_ORDER, UNLOCK_ALL_PARTS } from '../config/gameFlow';

// The player's progress through the parts of the game, kept in the browser between
// visits: which parts they've finished (and how well they did in each part's final
// trays, which can unlock the next part), plus the country they gave, so a later part
// played on another day keeps the same currency.
const KEY = 'fortunery-progress';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && typeof saved === 'object') return { completed: {}, ...saved };
  } catch (e) { /* nothing saved, or storage unavailable */ }
  return { completed: {}, region: '' };
}

function save(progress) {
  try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch (e) { /* storage unavailable */ }
  return progress;
}

export function rememberRegion(progress, region) {
  return save({ ...progress, region });
}

// posttestAccuracy: share of the part's final-tray fortunes answered correctly (0-1)
export function markPartComplete(progress, partKey, posttestAccuracy) {
  const best = progress.completed[partKey];
  const keep = best && best.posttestAccuracy > posttestAccuracy ? best.posttestAccuracy : posttestAccuracy;
  return save({
    ...progress,
    completed: { ...progress.completed, [partKey]: { posttestAccuracy: keep, at: new Date().toISOString() } },
  });
}

// Whether a part can be played: the first part always; later ones once their unlock
// rule is met (or always, while UNLOCK_ALL_PARTS is on for testing)
export function isPartUnlocked(partKey, progress) {
  const part = GAME_PARTS[partKey];
  if (!part) return false;
  if (UNLOCK_ALL_PARTS || !part.unlock) return true;
  const done = progress.completed[part.unlock.after];
  return Boolean(done && done.posttestAccuracy >= (part.unlock.minPosttestAccuracy || 0));
}

// Open the stage screen first when there's more than one part to choose from;
// otherwise go straight into the first part
export function shouldStartAtStages(progress) {
  return PART_ORDER.filter(k => isPartUnlocked(k, progress)).length > 1;
}
