import test from 'node:test';
import assert from 'node:assert/strict';
import { hostFromUrl, registrableDomain } from '../shared/domains.js';
import { collectionStatus, DAY_MS } from '../shared/config.js';
import { summarizeSites, buildExport } from '../shared/export.js';

test('hostFromUrl keeps only the host', () => {
  assert.equal(hostFromUrl('https://www.github.com/org/repo?tab=1#x'), 'github.com');
  assert.equal(hostFromUrl('https://gist.github.com/abc'), 'gist.github.com');
  assert.equal(hostFromUrl('https://mail.google.com/mail/u/0'), 'mail.google.com');
  assert.equal(hostFromUrl('https://WWW.BBC.CO.UK/news'), 'bbc.co.uk');
});

test('hostFromUrl ignores anything that is not a public website', () => {
  for (const url of [
    'chrome://extensions', 'file:///C:/a.txt', 'about:blank', 'http://localhost:3000',
    'http://192.168.1.1/', 'http://[::1]/', 'http://intranet/', 'not a url',
  ]) assert.equal(hostFromUrl(url), null, url);
});

test('registrableDomain handles country second-level domains', () => {
  assert.equal(registrableDomain('gist.github.com'), 'github.com');
  assert.equal(registrableDomain('news.bbc.co.uk'), 'bbc.co.uk');
  assert.equal(registrableDomain('onlinesbi.sbi.co.in'), 'sbi.co.in');
  assert.equal(registrableDomain('github.com'), 'github.com');
});

test('collectionStatus moves through the 2-3 week window', () => {
  const start = Date.now();
  assert.equal(collectionStatus(null).status, 'not_started');
  assert.deepEqual(collectionStatus({ startedAt: start }, start), { status: 'collecting', day: 1 });
  assert.equal(collectionStatus({ startedAt: start }, start + 14 * DAY_MS).status, 'ready');
  assert.equal(collectionStatus({ startedAt: start }, start + 21 * DAY_MS).status, 'complete');
});

const record = daily => ({ firstSeen: 1000, lastSeen: 2000, daily });

test('export is the raw per-host, per-day data plus the profile', () => {
  const state = {
    profile: { employeeId: '975211', designation: 'Data Engineer', age: '18-30 years', region: 'India', consentedAt: 1 },
    collection: { startedAt: Date.now() },
    sites: {
      'gist.github.com': record({ '2026-10-08': { visits: 1, activeSec: 60 } }),
      'github.com': record({ '2026-10-08': { visits: 3, activeSec: 120 }, '2026-10-07': { visits: 2, activeSec: 0 } }),
    },
  };
  const out = buildExport(state);
  assert.equal(out.schema, 'personalization-profile.browsing');
  assert.deepEqual(out.profile, { employeeId: '975211', designation: 'Data Engineer', age: '18-30 years', region: 'India' });
  assert.deepEqual(out.sites.map(s => s.host), ['gist.github.com', 'github.com']);
  const gh = out.sites[1];
  assert.equal(gh.domain, 'github.com');
  assert.deepEqual(gh.totals, { visits: 5, activeSeconds: 120, daysActive: 2 });
  assert.deepEqual(Object.keys(gh.daily), ['2026-10-07', '2026-10-08']);
  assert.deepEqual(gh.daily['2026-10-08'], { visits: 3, activeSeconds: 120 });
  // No interpretation: no categories, scores or picks
  assert.ok(!('category' in gh) && !('score' in gh) && !('familiarWebsites' in out));
});

test('summarizeSites sorts by visits for display', () => {
  const rows = summarizeSites({
    'a.com': record({ d1: { visits: 1, activeSec: 0 } }),
    'b.com': record({ d1: { visits: 4, activeSec: 0 } }),
  });
  assert.deepEqual(rows.map(r => r.host), ['b.com', 'a.com']);
});
