// Player analytics client.
//
//   track(type, data)        record an event (types: backend/src/catalog.js)
//   identify(traits)         attach player traits (designation, region...) to the profile
//   setContext(partial)      update the section/phase every later event is tagged with
//   enterScreen(name, meta)  start timing a screen (ends + reports the previous one)
//   useScreen(name, meta)    React hook form of enterScreen
//   startTimer() -> () => ms  measure how long a decision took
//
// Events are batched and POSTed to the analytics backend's REST API (backend/, address
// in src/config/analytics.js). Unsent events are kept in an outbox in localStorage
// until the backend confirms it has them, so a backend outage or a closed tab loses
// nothing - the backend ignores any it already has (same event_id).
import { useEffect } from 'react';
import { ANALYTICS } from '../config/analytics';

const EVENTS_URL = `${ANALYTICS.apiUrl}/api/v1/events`;
const OUTBOX_KEY = 'fortunery.analytics.outbox';
const MAX_PER_REQUEST = 200;
const BEACON_LIMIT_BYTES = 60000; // browsers cap a closing-tab beacon at ~64 KB

const PLAYER_KEY = 'fortunery.analytics.player_id';
const SESSIONS_KEY = 'fortunery.analytics.session_count';

const uid = () =>
  (window.crypto && window.crypto.randomUUID)
    ? window.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function readStorage(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
}

let playerId = readStorage(PLAYER_KEY);
const returningPlayer = Boolean(playerId);
if (!playerId) {
  playerId = uid();
  writeStorage(PLAYER_KEY, playerId);
}
const sessionsBefore = Number(readStorage(SESSIONS_KEY) || 0);
writeStorage(SESSIONS_KEY, String(sessionsBefore + 1));

const sessionId = uid();
const sessionStart = performance.now();
let seq = 0;
let sent = 0;
let flushTimer = null;
let inFlight = false;
let retryDelay = 0;

// Events not yet confirmed by the backend, oldest first. Persisted so they survive a
// reload or a backend outage.
function loadOutbox() {
  try { return JSON.parse(readStorage(OUTBOX_KEY) || '[]'); } catch (e) { return []; }
}
let queue = loadOutbox();
function saveOutbox() {
  if (queue.length > ANALYTICS.maxStoredEvents) queue = queue.slice(-ANALYTICS.maxStoredEvents);
  writeStorage(OUTBOX_KEY, JSON.stringify(queue));
}
let context = { section: null, screen: null, phase: null };

/* ---------------- Active-time tracking ---------------- */
// "Active" = tab visible and the player did something in the last ANALYTICS.idleAfterMs.
let lastInput = performance.now();
let hiddenSince = document.hidden ? performance.now() : null;
let activeTotal = 0;
let activeMark = performance.now();

function accrueActive() {
  const now = performance.now();
  if (hiddenSince === null) {
    // Count time since the last mark, but only up to when the player went idle
    const idleCutoff = lastInput + ANALYTICS.idleAfterMs;
    activeTotal += Math.max(0, Math.min(now, idleCutoff) - activeMark);
  }
  activeMark = now;
}

/* ---------------- Screen timing ---------------- */
let screen = null; // { name, start, activeAtStart, hiddenMs, clicks, hiddenSince }

function closeScreen(nextName) {
  if (!screen) return;
  accrueActive();
  const now = performance.now();
  const hiddenMs = screen.hiddenMs + (hiddenSince !== null ? now - Math.max(hiddenSince, screen.start) : 0);
  const durationMs = Math.round(now - screen.start);
  const activeMs = Math.round(activeTotal - screen.activeAtStart);
  track('screen_exit', {
    screen: screen.name,
    duration_ms: durationMs,
    active_ms: activeMs,
    hidden_ms: Math.round(hiddenMs),
    idle_ms: Math.max(0, durationMs - activeMs - Math.round(hiddenMs)),
    clicks: screen.clicks,
    next_screen: nextName || null,
  });
  screen = null;
}

export function enterScreen(name, meta) {
  if (!ANALYTICS.enabled || !name) return;
  // Step names repeat across levels ("marking" in every level), so a screen is the
  // pair of section + name
  if (screen && screen.name === name && screen.section === context.section) return;
  const previous = screen ? screen.name : null;
  closeScreen(name);
  accrueActive();
  screen = { name, section: context.section, start: performance.now(), activeAtStart: activeTotal, hiddenMs: 0, clicks: 0 };
  context = { ...context, screen: name };
  track('screen_view', { screen: name, previous_screen: previous, meta: meta || null });
}

export function useScreen(name, meta) {
  useEffect(() => { enterScreen(name, meta); }, [name]); // eslint-disable-line
}

export function currentScreen() {
  return screen ? screen.name : null;
}

/* ---------------- Core ---------------- */

export function setContext(partial) {
  context = { ...context, ...partial };
}

export function track(type, data = {}) {
  if (!ANALYTICS.enabled) return;
  const event = {
    event_id: uid(),
    type,
    ts: new Date().toISOString(),
    t_ms: Math.round(performance.now() - sessionStart),
    seq: seq++,
    player_id: playerId,
    session_id: sessionId,
    context: { ...context },
    data,
  };
  if (ANALYTICS.debug) console.log('[analytics]', type, data); // eslint-disable-line no-console
  queue.push(event);
  saveOutbox();
  if (queue.length >= ANALYTICS.batchSize && !retryDelay) flush();
  else scheduleFlush(ANALYTICS.flushIntervalMs);
}

export function identify(traits) {
  track('player_identified', { traits });
}

export function startTimer() {
  const t0 = performance.now();
  return () => Math.round(performance.now() - t0);
}

function scheduleFlush(ms) {
  if (!flushTimer) flushTimer = setTimeout(flush, ms);
}

// POSTs the oldest waiting events; on success drops them from the outbox, on failure
// keeps them and tries again later (backing off up to a minute while the backend is down)
export async function flush() {
  clearTimeout(flushTimer);
  flushTimer = null;
  if (inFlight || !queue.length) return;
  inFlight = true;
  const batch = queue.slice(0, MAX_PER_REQUEST);
  try {
    const res = await fetch(EVENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // a simple request: no CORS preflight needed
      body: JSON.stringify({ sent_at: new Date().toISOString(), player_id: playerId, session_id: sessionId, events: batch }),
      keepalive: true,
    });
    // 4xx other than 429 means the batch itself is bad - retrying won't help
    if (!res.ok && (res.status >= 500 || res.status === 429)) throw new Error(`HTTP ${res.status}`);
    const sentIds = new Set(batch.map(e => e.event_id));
    queue = queue.filter(e => !sentIds.has(e.event_id));
    saveOutbox();
    sent += batch.length;
    retryDelay = 0;
    if (queue.length) scheduleFlush(50);
  } catch (e) {
    retryDelay = Math.min(60000, retryDelay ? retryDelay * 2 : 5000);
    if (ANALYTICS.debug) console.warn('[analytics] backend unreachable, retrying in', retryDelay, 'ms'); // eslint-disable-line no-console
    scheduleFlush(retryDelay);
  } finally {
    inFlight = false;
  }
}

// When the tab is closing there's no time to wait for a response - hand everything to
// sendBeacon. The events stay in the outbox; if they did arrive, the backend simply
// ignores them when they're sent again next time.
function flushOnExit() {
  if (!queue.length || !navigator.sendBeacon) return;
  let chunk = [];
  let size = 0;
  const post = () => {
    if (!chunk.length) return;
    navigator.sendBeacon(EVENTS_URL, new Blob([JSON.stringify({ events: chunk })], { type: 'text/plain' }));
    chunk = [];
    size = 0;
  };
  queue.forEach(ev => {
    const evSize = JSON.stringify(ev).length + 1;
    if (size + evSize > BEACON_LIMIT_BYTES) post();
    chunk.push(ev);
    size += evSize;
  });
  post();
}

/* ---------------- Automatic tracking ---------------- */

function onInput() {
  accrueActive();
  lastInput = performance.now();
}

function describeElement(el) {
  const text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 60);
}

function onClick(e) {
  onInput();
  const el = e.target.closest('button, a, [role="button"], [data-analytics]');
  if (!el) return;
  if (screen) screen.clicks += 1;
  track('ui_click', {
    label: describeElement(el),
    element: el.tagName.toLowerCase(),
    classes: (el.getAttribute('class') || '').slice(0, 80),
    analytics_id: el.getAttribute('data-analytics') || null,
  });
}

function onChange(e) {
  const el = e.target;
  if (!el || !['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return;
  const kind = el.type || el.tagName.toLowerCase();
  // Choices are recorded as values; free-typed text only by length (the screens that
  // need the actual text report it in their own decision events).
  const isChoice = ['radio', 'checkbox', 'select-one'].includes(kind);
  track('field_change', {
    field: el.name || el.id || el.getAttribute('placeholder') || 'field',
    kind,
    value: isChoice ? (kind === 'checkbox' ? el.checked : el.value) : `${(el.value || '').length} chars`,
  });
}

let hiddenAt = null;
function onVisibility() {
  accrueActive();
  if (document.hidden) {
    hiddenSince = performance.now();
    hiddenAt = performance.now();
    track('app_hidden', { screen: currentScreen() });
    flushOnExit();
  } else {
    const hiddenMs = hiddenAt ? Math.round(performance.now() - hiddenAt) : 0;
    if (screen && hiddenSince !== null) screen.hiddenMs += performance.now() - Math.max(hiddenSince, screen.start);
    hiddenSince = null;
    lastInput = performance.now();
    track('app_visible', { screen: currentScreen(), hidden_ms: hiddenMs });
  }
}

let ended = false;
function endSession(reason) {
  if (ended) return;
  ended = true;
  closeScreen(null);
  accrueActive();
  track('session_end', {
    duration_ms: Math.round(performance.now() - sessionStart),
    active_ms: Math.round(activeTotal),
    events_sent: sent + queue.length + 1,
    last_screen: context.screen,
    reason,
  });
  flushOnExit();
}

let started = false;
export function initAnalytics({ gameFlow } = {}) {
  if (started || !ANALYTICS.enabled) return;
  started = true;
  // Anything left unsent from a previous visit goes out first
  if (queue.length) scheduleFlush(1000);

  track('session_start', {
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    device_pixel_ratio: window.devicePixelRatio,
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    reduced_motion: Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
    sound_muted: readStorage('wisecrack-muted') === 'true',
    referrer: document.referrer || null,
    game_flow: gameFlow || null,
    returning_player: returningPlayer,
    sessions_before: sessionsBefore,
  });

  document.addEventListener('click', onClick, true);
  document.addEventListener('change', onChange, true);
  ['keydown', 'pointermove', 'pointerdown', 'wheel', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, onInput, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', () => endSession('pagehide'));
  window.addEventListener('error', (e) => track('client_error', { message: String(e.message), source: e.filename || null, line: e.lineno || null }));
}

export const ids = { playerId, sessionId };
