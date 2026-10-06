import { summarizeSites } from '../shared/export.js';
import { send, getState, onDataChange, h, describeCollection, progressBar, formatMinutes } from './ui.js';

const $ = id => document.getElementById(id);
const openPage = path => { chrome.tabs.create({ url: chrome.runtime.getURL(path) }); window.close(); };

async function render() {
  const state = await getState();
  const info = describeCollection(state.collection);
  $('pill').textContent = info.label;
  $('pill').className = `pill ${info.pillClass}`;

  $('setup').hidden = Boolean(state.profile);
  $('main').hidden = !state.profile;
  if (!state.profile) return;

  $('progress').replaceChildren(progressBar(info.progress, info.status));
  $('status').textContent = info.text;

  const rows = summarizeSites(state.sites);
  $('host-count').textContent = rows.length;
  $('visit-count').textContent = rows.reduce((n, r) => n + r.visits, 0);
  $('top').replaceChildren(...(rows.length
    ? rows.slice(0, 5).map(r => h('li', {}, r.host, ' ', h('small', {}, `· ${r.visits} visits · ${formatMinutes(Math.round(r.activeSeconds / 60))}`)))
    : [h('li', { class: 'muted' }, 'Nothing yet. Keep browsing as usual.')]));

  $('pause').hidden = info.status === 'complete';
  $('pause').textContent = info.paused ? 'Resume' : 'Pause';
  $('pause').onclick = async () => { await send('setPaused', { paused: !info.paused }); render(); };
}

$('open-setup').addEventListener('click', () => openPage('pages/onboarding.html'));
$('open-dashboard').addEventListener('click', () => openPage('pages/dashboard.html'));
onDataChange(render);
render();
