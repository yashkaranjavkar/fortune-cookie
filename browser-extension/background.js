// Background collector. Records raw counts per host (e.g. "docs.github.com"),
// per calendar day:
//   visits     - times the person opened the host in a tab
//   activeSec  - time it was the focused tab while the person was active
// No full URLs, titles or page content are kept.
// Nothing is recorded before the person has agreed and filled in their details,
// while paused, in incognito, or after the collection window ends.
import { CONFIG, dayKey, collectionStatus } from './shared/config.js';
import { hostFromUrl } from './shared/domains.js';

const TICK = 'active-time-tick';
const KEYS = ['profile', 'collection', 'sites', 'excluded'];

// Storage updates are read-modify-write, so run them one at a time.
let queue = Promise.resolve();
function serial(fn) {
  const run = queue.then(fn);
  queue = run.catch(err => console.error('[collector]', err));
  return run;
}

const getState = () => chrome.storage.local.get(KEYS);

function canCollect(state) {
  if (!state.profile || !state.collection?.startedAt || state.collection.paused) return false;
  return collectionStatus(state.collection).status !== 'complete';
}

// A removed host also covers its subdomains (removing "github.com" covers "gist.github.com").
function isExcluded(state, host) {
  return (state.excluded || []).some(e => host === e || host.endsWith('.' + e));
}

// sites: { [host]: { firstSeen, lastSeen, daily: { 'YYYY-MM-DD': { visits, activeSec } } } }
function bump(sites, host, { visits = 0, activeSec = 0 }) {
  const now = Date.now();
  const record = sites[host] || (sites[host] = { firstSeen: now, lastSeen: now, daily: {} });
  const day = record.daily[dayKey()] || (record.daily[dayKey()] = { visits: 0, activeSec: 0 });
  day.visits += visits;
  day.activeSec += activeSec;
  record.lastSeen = now;
}

function recordVisit(tabId, url) {
  const host = hostFromUrl(url);
  if (!host) return;
  return serial(async () => {
    const state = await getState();
    if (!canCollect(state) || isExcluded(state, host)) return;

    // Moving around within a host in the same tab is one visit, until a long gap.
    const { tabVisits = {} } = await chrome.storage.session.get('tabVisits');
    const last = tabVisits[tabId];
    const now = Date.now();
    const isNewVisit = !last || last.host !== host || now - last.at > CONFIG.REVISIT_GAP_MIN * 60000;
    tabVisits[tabId] = { host, at: now };
    await chrome.storage.session.set({ tabVisits });
    if (!isNewVisit) return;

    const sites = state.sites || {};
    bump(sites, host, { visits: 1 });
    await chrome.storage.local.set({ sites });
  });
}

// Once a minute: credit a minute to the host in the focused tab, if the person is there.
function sampleActiveTab() {
  return serial(async () => {
    const state = await getState();
    await updateBadge(state);
    if (!canCollect(state)) return;

    const idle = await chrome.idle.queryState(CONFIG.IDLE_SECONDS);
    if (idle === 'locked') return;
    let win;
    try { win = await chrome.windows.getLastFocused(); } catch { return; }
    if (!win?.focused || win.incognito) return;
    const [tab] = await chrome.tabs.query({ active: true, windowId: win.id });
    if (!tab?.url || (idle === 'idle' && !tab.audible)) return;

    const host = hostFromUrl(tab.url);
    if (!host || isExcluded(state, host)) return;
    const sites = state.sites || {};
    bump(sites, host, { activeSec: 60 });
    await chrome.storage.local.set({ sites });
  });
}

async function updateBadge(state) {
  const { status } = collectionStatus(state.collection);
  let text = '';
  let color = '#B91C1C';
  if (!state.profile) text = '!';
  else if (state.collection?.paused) text = 'II';
  else if (status === 'ready' || status === 'complete') { text = '✓'; color = '#15803D'; }
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
}

function ensureAlarm() {
  chrome.alarms.get(TICK, alarm => {
    if (!alarm) chrome.alarms.create(TICK, { periodInMinutes: 1 });
  });
}

// ---- Messages from the extension's own pages ----

const handlers = {
  async getState() {
    return getState();
  },

  // First save starts the collection window; later saves just edit the details.
  async saveProfile({ profile }) {
    const { employeeId, designation, age, region } = profile || {};
    if (![employeeId, designation, age, region].every(v => typeof v === 'string' && v.trim())) {
      throw new Error('All details are required');
    }
    const state = await getState();
    const collection = state.collection?.startedAt
      ? state.collection
      : { startedAt: Date.now(), paused: false };
    await chrome.storage.local.set({
      profile: {
        employeeId: employeeId.trim(),
        designation: designation.trim(),
        age,
        region,
        consentedAt: state.profile?.consentedAt || Date.now(),
      },
      collection,
    });
  },

  async setPaused({ paused }) {
    const { collection } = await getState();
    if (!collection) return;
    await chrome.storage.local.set({ collection: { ...collection, paused: Boolean(paused) } });
  },

  // Forget a host (and its subdomains) and stop recording it.
  async excludeHost({ host }) {
    const { sites = {}, excluded = [] } = await getState();
    for (const h of Object.keys(sites)) {
      if (h === host || h.endsWith('.' + host)) delete sites[h];
    }
    await chrome.storage.local.set({ sites, excluded: [...new Set([...excluded, host])] });
  },

  async unexcludeHost({ host }) {
    const { excluded = [] } = await getState();
    await chrome.storage.local.set({ excluded: excluded.filter(e => e !== host) });
  },

  async resetAll() {
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
  },
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const handler = handlers[msg?.type];
  if (!handler || sender.id !== chrome.runtime.id) return false;
  serial(() => handler(msg))
    .then(result => sendResponse({ ok: true, result }))
    .catch(err => sendResponse({ ok: false, error: err.message }))
    .finally(() => getState().then(updateBadge));
  return true;
});

// ---- Browser events ----

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && !tab.incognito) recordVisit(tabId, changeInfo.url);
});

chrome.tabs.onRemoved.addListener(tabId => {
  serial(async () => {
    const { tabVisits = {} } = await chrome.storage.session.get('tabVisits');
    if (!tabVisits[tabId]) return;
    delete tabVisits[tabId];
    await chrome.storage.session.set({ tabVisits });
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === TICK) sampleActiveTab();
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  ensureAlarm();
  getState().then(updateBadge);
  if (reason === 'install') chrome.tabs.create({ url: 'pages/onboarding.html' });
});

chrome.runtime.onStartup.addListener(() => {
  ensureAlarm();
  getState().then(updateBadge);
});
