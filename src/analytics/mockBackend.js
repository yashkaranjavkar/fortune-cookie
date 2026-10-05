// Dummy analytics backend that lives in the browser - a stand-in until a real one is
// connected. It behaves like an ingestion API:
//   - accepts event batches (with a little simulated network latency)
//   - validates each event against EVENT_CATALOG and de-duplicates by event_id
//   - stores the raw events (localStorage, newest MAX_EVENTS kept)
//   - keeps a running profile per player: traits, time spent, decision quality and
//     derived personalization signals (accuracy, pace, help reliance, suggested
//     difficulty...)
//
// Inspect it from the browser console:
//   fortuneryAnalytics.summary()          overview of everything stored
//   fortuneryAnalytics.profile()          this player's profile (or pass a player_id)
//   fortuneryAnalytics.events({ type })   raw events, optionally filtered
//   fortuneryAnalytics.sessions()         one line per session
//   fortuneryAnalytics.exportJSON()       download everything as a JSON file
//   fortuneryAnalytics.clear()            wipe the stored data
import { EVENT_CATALOG } from './events';

const EVENTS_KEY = 'fortunery.analytics.db.events';
const PROFILES_KEY = 'fortunery.analytics.db.profiles';
const MAX_EVENTS = 10000;
const LATENCY_MS = [40, 160];

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage full: drop the oldest half of the events and try once more
    if (key === EVENTS_KEY && Array.isArray(value)) {
      try { localStorage.setItem(key, JSON.stringify(value.slice(Math.floor(value.length / 2)))); } catch (e2) { /* give up */ }
    }
  }
}

/* ---------------- Player profiles ---------------- */

function emptyProfile(playerId) {
  return {
    player_id: playerId,
    first_seen: null,
    last_seen: null,
    sessions: [],
    traits: {},
    time: { total_ms: 0, active_ms: 0, by_screen: {}, by_section: {} },
    sorting: { by_level: {}, help_opened: 0 },
    marking: { submissions: 0, auto_submitted: 0, items: 0, marked: 0, tiers: { correct: 0, partial: 0, wrong: 0 } },
    scores: {},
    websites: {},
    supervisor: { decisions: {}, revoke_reasons: [] },
    progress: { sections_started: [], sections_completed: [] },
    engagement: { clicks: 0, nav_back: 0, replays: 0, help_opened: 0, errors: 0 },
    derived: {},
  };
}

function levelStats(profile, level) {
  const key = level || 'unknown';
  if (!profile.sorting.by_level[key]) {
    profile.sorting.by_level[key] = {
      sorted: 0, correct: 0, wrong: 0, timed_out: 0,
      phishy_seen: 0, phishy_caught: 0, legit_seen: 0, legit_flagged: 0,
      decision_ms_total: 0,
    };
  }
  return profile.sorting.by_level[key];
}

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function applyEvent(profile, ev) {
  const d = ev.data || {};
  if (!profile.first_seen) profile.first_seen = ev.ts;
  profile.last_seen = ev.ts;
  addUnique(profile.sessions, ev.session_id);

  switch (ev.type) {
    case 'session_start':
      profile.traits.language = d.language;
      profile.traits.timezone = d.timezone;
      profile.traits.viewport = d.viewport;
      profile.traits.reduced_motion = d.reduced_motion;
      profile.traits.sound_muted = d.sound_muted;
      break;
    case 'session_end':
      profile.time.total_ms += d.duration_ms || 0;
      profile.time.active_ms += d.active_ms || 0;
      break;
    case 'player_identified':
      Object.assign(profile.traits, d.traits);
      break;
    case 'sound_toggled':
      profile.traits.sound_muted = d.muted;
      break;
    case 'section_start':
      addUnique(profile.progress.sections_started, d.section);
      break;
    case 'section_complete':
      addUnique(profile.progress.sections_completed, d.section);
      profile.time.by_section[d.section] = (profile.time.by_section[d.section] || 0) + (d.duration_ms || 0);
      break;
    case 'screen_exit': {
      const key = `${ev.context.section || '-'}/${d.screen}`;
      const s = profile.time.by_screen[key] || { views: 0, total_ms: 0, active_ms: 0 };
      s.views += 1;
      s.total_ms += d.duration_ms || 0;
      s.active_ms += d.active_ms || 0;
      profile.time.by_screen[key] = s;
      break;
    }
    case 'ui_click': profile.engagement.clicks += 1; break;
    case 'nav_back': profile.engagement.nav_back += 1; break;
    case 'level_replay': profile.engagement.replays += 1; break;
    case 'client_error': profile.engagement.errors += 1; break;
    case 'rules_help_opened':
      profile.sorting.help_opened += 1;
      profile.engagement.help_opened += 1;
      break;
    case 'websites_submitted':
      profile.websites = d.selected || {};
      break;
    case 'fortune_sorted': {
      const s = levelStats(profile, d.level);
      s.sorted += 1;
      s.decision_ms_total += d.decision_ms || 0;
      if (d.correct === true) s.correct += 1;
      if (d.correct === false) s.wrong += 1;
      if (d.is_phishy === true) { s.phishy_seen += 1; if (d.tray === 'faulty') s.phishy_caught += 1; }
      if (d.is_phishy === false) { s.legit_seen += 1; if (d.tray === 'faulty') s.legit_flagged += 1; }
      break;
    }
    case 'fortune_timed_out':
      levelStats(profile, d.level).timed_out += 1;
      break;
    case 'marking_submitted':
      profile.marking.submissions += 1;
      if (d.auto_submitted) profile.marking.auto_submitted += 1;
      profile.marking.items += d.item_count || 0;
      profile.marking.marked += d.marked_count || 0;
      break;
    case 'inspection_revealed':
      if (profile.marking.tiers[d.tier] !== undefined) profile.marking.tiers[d.tier] += 1;
      break;
    case 'level_complete':
      profile.scores[ev.context.section || d.batch] = {
        incentive: d.incentive, sorted: d.sorted, total: d.total, at: ev.ts,
      };
      break;
    case 'supervisor_decision':
      profile.supervisor.decisions[d.row] = d.choice;
      break;
    case 'supervisor_revoke_reason':
      profile.supervisor.revoke_reasons.push({ row: d.row, reason: d.reason });
      break;
    default:
      break;
  }
}

// Signals a personalization layer could act on, recomputed after every batch
function derive(profile) {
  const levels = Object.values(profile.sorting.by_level);
  const sum = (k) => levels.reduce((n, l) => n + l[k], 0);
  const sorted = sum('sorted');
  const graded = sum('correct') + sum('wrong');
  const phishySeen = sum('phishy_seen');
  const legitSeen = sum('legit_seen');
  const tiers = profile.marking.tiers;
  const inspected = tiers.correct + tiers.partial + tiers.wrong;

  const accuracy = graded ? sum('correct') / graded : null;
  const avgDecisionMs = sorted ? Math.round(sum('decision_ms_total') / sorted) : null;
  const pace = avgDecisionMs === null ? null : avgDecisionMs < 3500 ? 'fast' : avgDecisionMs < 7000 ? 'steady' : 'careful';

  let suggestedDifficulty = null;
  if (accuracy !== null && graded >= 4) {
    if (accuracy >= 0.85 && pace !== 'careful') suggestedDifficulty = 'harder';
    else if (accuracy < 0.6) suggestedDifficulty = 'easier';
    else suggestedDifficulty = 'same';
  }

  const round = (x) => (x === null ? null : Math.round(x * 100) / 100);
  profile.derived = {
    sort_accuracy: round(accuracy),
    phishing_catch_rate: phishySeen ? round(sum('phishy_caught') / phishySeen) : null,
    false_alarm_rate: legitSeen ? round(sum('legit_flagged') / legitSeen) : null,
    marking_precision: inspected ? round(tiers.correct / inspected) : null,
    avg_decision_ms: avgDecisionMs,
    pace,
    timeouts: sum('timed_out'),
    help_reliance: profile.sorting.help_opened,
    marking_ran_out_of_time: profile.marking.auto_submitted,
    suggested_difficulty: suggestedDifficulty,
    sessions: profile.sessions.length,
    total_play_minutes: Math.round(profile.time.total_ms / 6000) / 10,
  };
}

// Builds player profiles from scratch out of a list of raw events (used by the
// Analytics page, so it works the same whether events came from this browser or the
// Node server)
export function buildProfiles(events) {
  const profiles = {};
  events.forEach(ev => {
    if (!ev || !ev.player_id) return;
    const profile = profiles[ev.player_id] || emptyProfile(ev.player_id);
    applyEvent(profile, ev);
    profiles[ev.player_id] = profile;
  });
  Object.values(profiles).forEach(derive);
  return profiles;
}

export function getStoredEvents() {
  return load(EVENTS_KEY, []);
}

export function clearStoredData() {
  try {
    localStorage.removeItem(EVENTS_KEY);
    localStorage.removeItem(PROFILES_KEY);
  } catch (e) { /* ignore */ }
}

/* ---------------- Ingestion API ---------------- */

const stats = { batches: 0, accepted: 0, duplicates: 0, unknown_types: {} };

function handleBatch(payload) {
  const events = load(EVENTS_KEY, []);
  const seen = new Set(events.slice(-2000).map(e => e.event_id));
  const profiles = load(PROFILES_KEY, {});
  const rejected = [];

  (payload.events || []).forEach(ev => {
    if (!ev || !ev.type || !ev.event_id) { rejected.push({ reason: 'malformed', ev }); return; }
    if (seen.has(ev.event_id)) { stats.duplicates += 1; return; }
    if (!EVENT_CATALOG[ev.type]) {
      stats.unknown_types[ev.type] = (stats.unknown_types[ev.type] || 0) + 1;
      console.warn(`[analytics mock backend] unknown event type "${ev.type}" - add it to src/analytics/events.js`); // eslint-disable-line no-console
    }
    seen.add(ev.event_id);
    events.push({ ...ev, received_at: new Date().toISOString() });
    const profile = profiles[ev.player_id] || emptyProfile(ev.player_id);
    applyEvent(profile, ev);
    profiles[ev.player_id] = profile;
    stats.accepted += 1;
  });

  Object.values(profiles).forEach(derive);
  save(EVENTS_KEY, events.slice(-MAX_EVENTS));
  save(PROFILES_KEY, profiles);
  stats.batches += 1;
  return { status: 200, accepted: (payload.events || []).length - rejected.length, rejected };
}

// Same shape as an HTTP call: resolves with a response after a little "network" delay
export function ingest(payload) {
  const delay = LATENCY_MS[0] + Math.random() * (LATENCY_MS[1] - LATENCY_MS[0]);
  return new Promise(resolve => setTimeout(() => resolve(handleBatch(payload)), delay));
}

/* ---------------- Console helpers ---------------- */

function currentPlayerId() {
  try { return localStorage.getItem('fortunery.analytics.player_id'); } catch (e) { return null; }
}

const api = {
  events(filter = {}) {
    return load(EVENTS_KEY, []).filter(e =>
      (!filter.type || e.type === filter.type)
      && (!filter.session_id || e.session_id === filter.session_id)
      && (!filter.player_id || e.player_id === filter.player_id));
  },
  profile(playerId = currentPlayerId()) {
    return load(PROFILES_KEY, {})[playerId] || null;
  },
  profiles() {
    return load(PROFILES_KEY, {});
  },
  sessions() {
    const bySession = {};
    load(EVENTS_KEY, []).forEach(e => {
      const s = bySession[e.session_id] || (bySession[e.session_id] = {
        session_id: e.session_id, player_id: e.player_id, started: e.ts, ended: e.ts, events: 0, last_screen: null,
      });
      s.ended = e.ts;
      s.events += 1;
      if (e.context && e.context.screen) s.last_screen = e.context.screen;
    });
    const list = Object.values(bySession);
    console.table(list); // eslint-disable-line no-console
    return list;
  },
  summary() {
    const events = load(EVENTS_KEY, []);
    const counts = {};
    events.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
    const result = {
      stored_events: events.length,
      players: Object.keys(load(PROFILES_KEY, {})).length,
      sessions: new Set(events.map(e => e.session_id)).size,
      this_session_ingest: { ...stats },
      events_by_type: counts,
      my_profile: api.profile(),
    };
    console.log(result); // eslint-disable-line no-console
    return result;
  },
  exportJSON() {
    const data = { exported_at: new Date().toISOString(), catalog: EVENT_CATALOG, profiles: api.profiles(), events: api.events() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fortunery-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    return data;
  },
  clear() {
    try {
      localStorage.removeItem(EVENTS_KEY);
      localStorage.removeItem(PROFILES_KEY);
    } catch (e) { /* ignore */ }
    return 'cleared';
  },
  catalog: EVENT_CATALOG,
};

if (typeof window !== 'undefined') window.fortuneryAnalytics = api;
