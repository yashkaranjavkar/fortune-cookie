// Helpers shared by the extension's pages.
import { CONFIG, DAY_MS, collectionStatus } from '../shared/config.js';

// All reads and changes go through the background worker so they never race its writes.
export async function send(type, payload = {}) {
  const res = await chrome.runtime.sendMessage({ type, ...payload });
  if (!res?.ok) throw new Error(res?.error || 'The extension did not respond');
  return res.result;
}

export const getState = () => send('getState');

// Re-run `fn` whenever stored data changes (e.g. the collector records a visit).
export function onDataChange(fn) {
  let timer;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    clearTimeout(timer);
    timer = setTimeout(fn, 200);
  });
}

// Tiny element builder - all text goes in via textContent, never as HTML.
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c != null && c !== false) el.append(c instanceof Node ? c : String(c));
  }
  return el;
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function formatMinutes(min) {
  if (min < 60) return `${min} min`;
  const hrs = Math.floor(min / 60);
  return `${hrs} h ${min % 60} min`;
}

// Status label, sentence and progress fraction for the popup and dashboard.
export function describeCollection(collection) {
  const { status, day } = collectionStatus(collection);
  const paused = Boolean(collection?.paused) && status !== 'complete';
  const start = collection?.startedAt;
  const readyOn = start && formatDate(start + CONFIG.MIN_DAYS * DAY_MS);
  const endsOn = start && formatDate(start + CONFIG.MAX_DAYS * DAY_MS);

  const text = {
    not_started: 'Not set up yet. Add your details to start.',
    collecting: `Day ${day} of ${CONFIG.MAX_DAYS}. Enough data to use from ${readyOn}.`,
    ready: `Day ${day} of ${CONFIG.MAX_DAYS}. Enough data to use. Collection continues until ${endsOn}.`,
    complete: `Finished. ${CONFIG.MAX_DAYS} days collected, nothing more is being recorded.`,
  }[status];

  const label = paused ? 'Paused' : { not_started: 'Not set up', collecting: 'Collecting', ready: 'Ready', complete: 'Complete' }[status];
  const progress = start ? Math.min(1, (Date.now() - start) / (CONFIG.MAX_DAYS * DAY_MS)) : 0;
  return { status, paused, label, text: paused ? `Paused. ${text}` : text, progress, pillClass: paused ? 'paused' : status };
}

export function progressBar(progress, status) {
  return h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': Math.round(progress * 100), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('div', { class: `progress-fill ${status === 'ready' || status === 'complete' ? 'ready' : ''}`, style: `width:${progress * 100}%` }),
    h('div', { class: 'progress-mark', style: `left:${(CONFIG.MIN_DAYS / CONFIG.MAX_DAYS) * 100}%`, title: `Enough data from day ${CONFIG.MIN_DAYS}` })
  );
}
