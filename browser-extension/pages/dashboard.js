import { CONFIG, DAY_MS } from '../shared/config.js';
import { summarizeSites, buildExport } from '../shared/export.js';
import { send, getState, onDataChange, h, describeCollection, progressBar, formatDate, formatMinutes } from './ui.js';

const $ = id => document.getElementById(id);
let state = {};

function renderDetails() {
  const p = state.profile;
  $('details').replaceChildren(...[
    ['Employee ID', p.employeeId],
    ['Designation', p.designation],
    ['Age', p.age],
    ['Region', p.region],
  ].flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
}

function renderCollection(info) {
  const start = state.collection.startedAt;
  $('collection-sub').textContent = `Started ${formatDate(start)}. Enough data from ${formatDate(start + CONFIG.MIN_DAYS * DAY_MS)}, ends ${formatDate(start + CONFIG.MAX_DAYS * DAY_MS)}.`;
  $('progress').replaceChildren(progressBar(info.progress, info.status));
  $('status').textContent = info.text;
}

function renderTable() {
  const all = summarizeSites(state.sites);
  const q = $('filter').value.trim().toLowerCase();
  const rows = q ? all.filter(r => r.host.includes(q)) : all;
  $('count').textContent = all.length;
  $('rows').replaceChildren(...(rows.length ? rows.map(r =>
    h('tr', {},
      h('td', { class: 'host' }, r.host),
      h('td', { class: 'num' }, r.visits),
      h('td', { class: 'num' }, formatMinutes(Math.round(r.activeSeconds / 60))),
      h('td', { class: 'num' }, r.daysActive),
      h('td', {}, formatDate(r.firstSeen)),
      h('td', {}, formatDate(r.lastSeen)),
      h('td', {}, h('button', { class: 'btn link small', onClick: () => removeHost(r.host) }, 'Remove'))
    )
  ) : [h('tr', {}, h('td', { colspan: 7, class: 'muted' }, q ? 'No websites match.' : 'Nothing recorded yet.'))]));
}

function renderExcluded() {
  const excluded = state.excluded || [];
  $('excluded-panel').hidden = excluded.length === 0;
  $('excluded').replaceChildren(...excluded.map(host =>
    h('span', {}, host, ' ', h('button', { class: 'btn link small', onClick: () => send('unexcludeHost', { host }) }, 'Allow again'))
  ));
}

async function render() {
  state = await getState();
  const info = describeCollection(state.collection);
  $('pill').textContent = info.label;
  $('pill').className = `pill ${info.pillClass}`;

  const ready = Boolean(state.profile && state.collection?.startedAt);
  $('setup').hidden = ready;
  $('overview').hidden = !ready;
  $('pause').hidden = !ready || info.status === 'complete';
  $('pause').textContent = info.paused ? 'Resume recording' : 'Pause recording';
  $('export').disabled = !ready;

  if (ready) {
    renderDetails();
    renderCollection(info);
  }
  renderTable();
  renderExcluded();
}

async function removeHost(host) {
  if (!confirm(`Delete everything recorded for ${host} (and its subdomains) and stop recording it?`)) return;
  await send('excludeHost', { host });
}

$('pause').addEventListener('click', () => send('setPaused', { paused: !state.collection?.paused }));
$('filter').addEventListener('input', renderTable);

$('export').addEventListener('click', () => {
  const data = buildExport(state);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `browsing-profile-${data.profile.employeeId || 'user'}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$('reset').addEventListener('click', async () => {
  if (!confirm('Delete your details and all browsing data? Recording will stop.')) return;
  await send('resetAll');
  render();
});

onDataChange(render);
render();
