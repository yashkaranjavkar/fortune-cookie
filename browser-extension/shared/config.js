// Collection settings. Everything else reads from here.
export const CONFIG = {
  // Data is considered sufficient after MIN_DAYS and collection stops for good
  // after MAX_DAYS (the "2-3 week" window).
  MIN_DAYS: 14,
  MAX_DAYS: 21,

  // A return to the same host in the same tab counts as a new visit after this gap.
  REVISIT_GAP_MIN: 30,

  // Active time: sampled once a minute while the browser is focused and the person
  // has touched mouse/keyboard within IDLE_SECONDS (or the tab is playing audio).
  IDLE_SECONDS: 120,
};

export const DAY_MS = 24 * 60 * 60 * 1000;

// Local calendar day, e.g. "2026-10-07".
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 'not_started' -> 'collecting' (before MIN_DAYS) -> 'ready' (enough data, still collecting)
// -> 'complete' (MAX_DAYS reached, collection stopped)
export function collectionStatus(collection, now = Date.now()) {
  if (!collection || !collection.startedAt) return { status: 'not_started', day: 0 };
  const elapsedDays = (now - collection.startedAt) / DAY_MS;
  const day = Math.min(CONFIG.MAX_DAYS, Math.floor(elapsedDays) + 1);
  if (elapsedDays >= CONFIG.MAX_DAYS) return { status: 'complete', day: CONFIG.MAX_DAYS };
  if (elapsedDays >= CONFIG.MIN_DAYS) return { status: 'ready', day };
  return { status: 'collecting', day };
}
