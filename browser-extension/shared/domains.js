// Turns a page URL into the host the extension records, e.g. "docs.github.com".
// Paths, query strings and page titles are never kept.

// Second-level labels under country TLDs, so "bbc.co.uk" isn't shortened to "co.uk".
const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu', 'nic', 'gob', 'mil', 'or', 'ne', 'go']);

function isIp(host) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');
}

// The host for a URL, or null for anything that isn't a public website
// (browser pages, files, localhost, IP addresses, intranet names).
export function hostFromUrl(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.toLowerCase().replace(/\.$/, '').replace(/^www\d?\./, '');
  if (!host.includes('.') || isIp(host) || /\.(local|localhost|internal|lan|test)$/.test(host)) return null;
  return host;
}

// Best-effort registrable domain, e.g. "docs.github.com" -> "github.com",
// "news.bbc.co.uk" -> "bbc.co.uk". Exported alongside the host for convenience.
export function registrableDomain(host) {
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const tld = labels[labels.length - 1];
  const sld = labels[labels.length - 2];
  const take = tld.length === 2 && SECOND_LEVEL.has(sld) ? 3 : 2;
  return labels.slice(-take).join('.');
}
