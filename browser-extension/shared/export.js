// The raw data, as handed to any consumer (game or otherwise). No ranking,
// categorising or filtering here - each consumer applies its own rules.
import { CONFIG, collectionStatus } from './config.js';
import { registrableDomain } from './domains.js';

export const SCHEMA = 'personalization-profile.browsing';
export const SCHEMA_VERSION = 1;

// Totals for one host's daily records.
export function totals(record) {
  const days = Object.values(record.daily);
  return {
    visits: days.reduce((n, d) => n + d.visits, 0),
    activeSeconds: days.reduce((n, d) => n + d.activeSec, 0),
    daysActive: days.length,
  };
}

// One row per host with its totals, most visited first - for display.
export function summarizeSites(sites = {}) {
  return Object.entries(sites)
    .map(([host, record]) => ({ host, firstSeen: record.firstSeen, lastSeen: record.lastSeen, ...totals(record) }))
    .sort((a, b) => b.visits - a.visits || b.activeSeconds - a.activeSeconds);
}

const iso = ts => (ts ? new Date(ts).toISOString() : null);

export function buildExport(state, now = Date.now()) {
  const { status, day } = collectionStatus(state.collection, now);
  const p = state.profile || {};

  return {
    schema: SCHEMA,
    version: SCHEMA_VERSION,
    exportedAt: iso(now),
    profile: {
      employeeId: p.employeeId || '',
      designation: p.designation || '',
      age: p.age || '',
      region: p.region || '',
    },
    collection: {
      status,
      day,
      minDays: CONFIG.MIN_DAYS,
      maxDays: CONFIG.MAX_DAYS,
      startedAt: iso(state.collection?.startedAt),
      paused: Boolean(state.collection?.paused),
    },
    sites: Object.entries(state.sites || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([host, record]) => ({
        host,
        domain: registrableDomain(host),
        firstSeen: iso(record.firstSeen),
        lastSeen: iso(record.lastSeen),
        totals: totals(record),
        daily: Object.fromEntries(Object.entries(record.daily).sort()
          .map(([date, d]) => [date, { visits: d.visits, activeSeconds: d.activeSec }])),
      })),
  };
}
