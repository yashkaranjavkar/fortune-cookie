// Options typed in by users are remembered in localStorage so they show up in
// the dropdown the next time.
const PREFIX = 'fortune-cookie:custom:';

export function loadCustomOptions(key) {
  if (!key) return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFIX + key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomOption(key, item) {
  const list = loadCustomOptions(key);
  if (!list.some(o => o.toLowerCase() === item.toLowerCase())) {
    list.push(item);
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(list));
    } catch { /* storage unavailable - keep it for this session only */ }
  }
  return list;
}

// Base options first, then custom ones, without case-insensitive duplicates.
export function mergeOptions(base, custom) {
  const seen = new Set();
  return [...base, ...custom].filter(o => {
    const k = o.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Tidy user input: collapse spaces and capitalise the first letter.
export function normalizeOption(text) {
  const t = text.trim().replace(/\s+/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
}
