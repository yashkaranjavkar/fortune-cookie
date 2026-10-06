// Fortunery Analytics - an aggregate view across all players, read from the analytics
// backend's REST API (GET /api/v1/insights). Plain browser JavaScript, no build step.
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const API_URL = (params.get('api') || (window.FORTUNERY_ANALYTICS || {}).apiUrl || 'http://localhost:4318').replace(/\/+$/, '');
  const API = `${API_URL}/api/v1`;
  const TOKEN_KEY = 'fortunery.dashboard.admin_token';
  const FILTER_KEY = 'fortunery.dashboard.filters';

  const SECTION_LABELS = {
    opening: 'Title screen',
    job: 'Job application',
    training: 'Training',
    level1: 'Level 1',
    level2: 'Level 2',
    level3: 'Level 3',
    supervisor: 'Supervisor',
    finalTrays: 'Final trays',
  };

  const $ = (sel) => document.querySelector(sel);
  const main = $('#main');
  const filtersForm = $('#filters');

  /* ---------------- storage (per-viewer conveniences only) ---------------- */

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* unavailable */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* unavailable */ } },
  };

  /* ---------------- formatting ---------------- */

  const esc = (v) => String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sectionName = (key) => SECTION_LABELS[key] || prettyName(key);
  function prettyName(key) {
    if (!key || key === '-') return '-';
    const words = String(key).replace(/_/g, ' ').replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase().trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  function duration(ms) {
    if (ms === null || ms === undefined) return '-';
    if (ms < 1000) return `${Math.round(ms)} ms`;
    const s = ms / 1000;
    if (s < 60) return `${s.toFixed(1)} s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${Math.round(s % 60)}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  const pct = (x) => (x === null || x === undefined ? '-' : `${Math.round(x * 100)}%`);
  const num = (x) => (x === null || x === undefined ? '-' : Number(x).toLocaleString());
  const clip = (t, n = 80) => (t && t.length > n ? `${t.slice(0, n - 1)}…` : t || '');
  const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

  /* ---------------- building blocks (return HTML strings) ---------------- */

  const card = (label, value, hint) => `
    <div class="card">
      <div class="card-label">${esc(label)}</div>
      <div class="card-value">${esc(value)}</div>
      ${hint ? `<div class="card-hint">${esc(hint)}</div>` : ''}
    </div>`;

  const section = (title, help, body) => `
    <section class="panel">
      <h2>${esc(title)}</h2>
      ${help ? `<p class="help">${esc(help)}</p>` : ''}
      ${body}
    </section>`;

  const emptyLine = (text = 'Nothing recorded yet.') => `<p class="empty-line">${esc(text)}</p>`;

  // Horizontal bars: rows of { label, value, text, color }
  function bars(rows, { empty, color } = {}) {
    if (!rows.length) return emptyLine(empty);
    const max = Math.max(...rows.map(r => r.value || 0), 1);
    return `<div class="bars">${rows.map(r => `
      <div class="bar-row">
        <div class="bar-label" title="${esc(r.label)}">${esc(r.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(1.5, ((r.value || 0) / max) * 100)}%;background:${r.color || color || 'var(--maroon)'}"></div></div>
        <div class="bar-value">${esc(r.text)}</div>
      </div>`).join('')}</div>`;
  }

  // One bar split into parts: { label, value, color }
  function stacked(parts) {
    const total = parts.reduce((n, p) => n + p.value, 0);
    if (!total) return emptyLine();
    return `
      <div class="stack">${parts.filter(p => p.value).map(p => `
        <div style="width:${(p.value / total) * 100}%;background:${p.color}" title="${esc(p.label)}: ${p.value}">${p.value}</div>`).join('')}
      </div>
      <div class="legend">${parts.map(p => `
        <span><i style="background:${p.color}"></i>${esc(p.label)}: <b>${p.value}</b> (${Math.round((p.value / total) * 100)}%)</span>`).join('')}
      </div>`;
  }

  // cells may be { html } for pre-built markup; everything else is escaped
  function table(head, rows, { empty, numeric = [] } = {}) {
    if (!rows.length) return emptyLine(empty);
    const cls = (j) => (numeric.includes(j) ? ' class="num"' : '');
    const cell = (c) => (c && typeof c === 'object' && 'html' in c ? c.html : esc(c));
    return `<div class="table-wrap"><table>
      <thead><tr>${head.map((h, j) => `<th${cls(j)}>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${r.map((c, j) => `<td${cls(j)}>${cell(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }

  const meter = (x, color = 'var(--maroon)') => ({
    html: x === null || x === undefined ? '-'
      : `<span class="meter"><span style="width:${Math.round(x * 100)}%;background:${color}"></span></span> ${pct(x)}`,
  });

  // Vertical columns per day
  function columns(days) {
    if (!days.length) return emptyLine('No play sessions in this period.');
    const max = Math.max(...days.map(d => d.players), 1);
    const labelEvery = Math.ceil(days.length / 12);
    return `<div class="cols">${days.map((d, i) => `
      <div class="col" title="${esc(shortDate(d.date))}: ${d.players} players, ${d.sessions} sessions, ${d.new_players} new">
        <div class="col-value">${d.players}</div>
        <div class="col-bar" style="height:${Math.max(3, (d.players / max) * 100)}%">
          <div class="col-new" style="height:${d.players ? (Math.min(d.new_players, d.players) / d.players) * 100 : 0}%"></div>
        </div>
        <div class="col-label">${i % labelEvery === 0 ? esc(shortDate(d.date)) : ''}</div>
      </div>`).join('')}</div>
      <div class="legend"><span><i style="background:var(--gold)"></i>New players</span><span><i style="background:var(--maroon)"></i>Returning players</span></div>`;
  }

  const tallyBars = (list, opts) => bars(list.map(x => ({ label: x.value, value: x.count, text: num(x.count) })), opts);

  /* ---------------- API ---------------- */

  async function api(path, { raw = false } = {}) {
    const token = store.get(TOKEN_KEY);
    let res;
    try {
      res = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch (e) {
      throw Object.assign(new Error('unreachable'), { status: 0 });
    }
    if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
    return raw ? res : res.json();
  }

  function showError(e) {
    if (e.status === 401) { showLogin(); return; }
    main.innerHTML = `<div class="panel empty error">
      <h2>${e.status === 0 ? "Can't reach the analytics backend" : 'The analytics backend returned an error'}</h2>
      <p>${e.status === 0
        ? `Nothing answered at <code>${esc(API_URL)}</code>. Make sure the backend is running (in the <code>backend</code> folder: <code>npm start</code>).`
        : esc(e.message)}</p>
      <button type="button" class="btn" id="retry">Try again</button>
    </div>`;
    $('#retry').addEventListener('click', load);
  }

  function showLogin() {
    main.innerHTML = `<form class="panel empty login" id="login">
      <h2>Admin token needed</h2>
      <p>This analytics backend is protected. Enter its admin token (the <code>ADMIN_TOKEN</code> it was started with).</p>
      <input type="password" name="token" placeholder="Admin token" autocomplete="current-password" required>
      <button type="submit" class="btn">Unlock</button>
    </form>`;
    const form = $('#login');
    form.token.focus();
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      store.set(TOKEN_KEY, form.token.value.trim());
      load();
    });
  }

  /* ---------------- filters ---------------- */

  function readFilters() {
    const f = new FormData(filtersForm);
    return { period: f.get('period'), designation: f.get('designation') || '', region: f.get('region') || '' };
  }

  function filterQuery({ period, designation, region }) {
    const q = new URLSearchParams();
    if (period && period !== 'all') {
      const since = new Date();
      since.setDate(since.getDate() - (Number(period) - 1));
      q.set('since', since.toISOString().slice(0, 10));
    }
    if (designation) q.set('designation', designation);
    if (region) q.set('region', region);
    const s = q.toString();
    return s ? `?${s}` : '';
  }

  function fillSelect(select, values, keep) {
    const first = select.options[0].outerHTML;
    const all = keep && !values.includes(keep) ? [...values, keep] : values;
    select.innerHTML = first + all.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
    select.value = keep || '';
  }

  /* ---------------- the report ---------------- */

  let loading = 0;
  async function load() {
    const ticket = ++loading;
    const filters = readFilters();
    store.set(FILTER_KEY, JSON.stringify(filters));
    main.classList.add('busy');
    try {
      const data = await api(`/insights${filterQuery(filters)}`);
      if (ticket !== loading) return;
      fillSelect(filtersForm.designation, data.filter_options.designations, filters.designation);
      fillSelect(filtersForm.region, data.filter_options.regions, filters.region);
      $('#signout').hidden = !store.get(TOKEN_KEY);
      $('#download').disabled = false;
      render(data);
    } catch (e) {
      if (ticket === loading) showError(e);
    } finally {
      if (ticket === loading) main.classList.remove('busy');
    }
  }

  function render(d) {
    const o = d.overview;
    $('#sub').textContent = `Across all players · data from ${API_URL} · updated ${new Date(d.generated_at).toLocaleTimeString()}`;

    if (!o.players) {
      const filtered = d.filters.since || d.filters.designation || d.filters.region;
      main.innerHTML = `<div class="panel empty">
        <h2>${filtered ? 'No players match these filters' : 'No one has played yet'}</h2>
        <p>${filtered ? 'Try a longer period, or set Designation / Region back to everyone.'
          : 'Play the game with the backend running - results appear here once players start.'}</p>
      </div>`;
      return;
    }

    const s = d.sorting.overall;
    const out = [];

    out.push(`<div class="cards">
      ${card('Players', num(o.players), `${num(o.new_players)} new in this period`)}
      ${card('Finished the game', pct(o.completion_rate), `${num(o.finished_players)} of ${num(o.players)} players`)}
      ${card('Play sessions', num(o.sessions), o.returning_players ? `${num(o.returning_players)} players came back` : '')}
      ${card('Typical session', duration(o.median_session_ms), `average ${duration(o.avg_session_ms)}`)}
      ${card('Total play time', duration(o.total_play_ms), `${duration(o.avg_play_per_player_ms)} per player`)}
      ${card('Phishing caught', pct(s.phishing_catch_rate), 'share of phishing fortunes put in the faulty tray')}
    </div>`);

    out.push(section('Players over time', 'How many people played each day.', columns(d.activity)));

    // Progress through the game
    const top = d.progress.length ? d.progress[0].started || o.players : o.players;
    out.push(section('How far players get',
      'Each part of the game, in order: how many players reached it, and how long it took them.',
      bars(d.progress.map(p => ({
        label: sectionName(p.section),
        value: p.started,
        text: `${num(p.started)} (${pct(top ? p.started / top : null)})`,
      })))
      + table(['Part of the game', 'Reached', 'Finished', 'Finish rate', 'Typical time', 'Average time'],
        d.progress.map(p => [sectionName(p.section), num(p.started), num(p.completed), meter(p.completion_rate, 'var(--green)'),
          duration(p.median_duration_ms), duration(p.avg_duration_ms)]),
        { numeric: [1, 2, 4, 5] })));

    out.push(section('Where players stop',
      'For players who haven\'t finished: the last screen they were on.',
      bars(d.drop_off.map(x => ({
        label: `${sectionName(x.section)} › ${prettyName(x.screen)}`,
        value: x.players,
        text: `${num(x.players)} player${x.players === 1 ? '' : 's'}`,
        color: 'var(--red)',
      })), { empty: 'Everyone who started has finished.' })));

    // Time per screen
    const maxMedian = Math.max(...d.screens.map(x => x.median_ms || 0), 1);
    out.push(section('Time on each screen',
      '"Typical" is the median - half the players were quicker, half slower. Active time leaves out moments when nobody touched anything.',
      table(['Part', 'Screen', 'Players', 'Typical time', '', 'Average', 'Active', 'Clicks'],
        d.screens.map(x => [
          sectionName(x.section), prettyName(x.screen), num(x.players), duration(x.median_ms),
          { html: `<span class="meter wide"><span style="width:${((x.median_ms || 0) / maxMedian) * 100}%"></span></span>` },
          duration(x.avg_ms), duration(x.avg_active_ms), x.avg_clicks,
        ]),
        { numeric: [2, 3, 5, 6, 7] })));

    // Phishing skill
    out.push(section('Spotting phishing',
      'How well players sorted fortunes into the right tray.',
      `<div class="cards small">
        ${card('Sorted correctly', pct(s.accuracy), `${num(s.sorted)} fortunes sorted`)}
        ${card('Phishing caught', pct(s.phishing_catch_rate))}
        ${card('False alarms', pct(s.false_alarm_rate), 'safe fortunes wrongly flagged')}
        ${card('Typical decision', duration(s.median_decision_ms))}
        ${card('Ran out of time', num(s.timeouts), 'fortunes left unsorted')}
        ${card('Rules help opened', num(s.help_opened))}
      </div>`
      + (d.sorting.by_level.length > 1 ? `<h3>By level</h3>${table(
        ['Level', 'Players', 'Sorted', 'Correct', 'Phishing caught', 'False alarms', 'Typical decision', 'Timed out'],
        d.sorting.by_level.map(l => [sectionName(l.level), num(l.players), num(l.sorted), meter(l.accuracy, 'var(--green)'),
          meter(l.phishing_catch_rate, 'var(--green)'), meter(l.false_alarm_rate, 'var(--red)'), duration(l.median_decision_ms), num(l.timeouts)]),
        { numeric: [1, 2, 6, 7] })}` : '')
      + `<div class="grid2">
        <div><h3>Players by accuracy</h3>${bars(d.skill.accuracy.map(b => ({ label: b.label, value: b.players, text: num(b.players) })), { color: 'var(--gold)' })}</div>
        <div>
          <h3>Decision speed</h3>${stacked([
            { label: 'Fast (<3.5 s)', value: d.skill.pace.fast, color: '#D29A2E' },
            { label: 'Steady', value: d.skill.pace.steady, color: '#7A9A5C' },
            { label: 'Careful (>7 s)', value: d.skill.pace.careful, color: '#5B7A99' },
          ])}
          <h3>Suggested difficulty</h3>${stacked([
            { label: 'Ready for harder', value: d.skill.suggested_difficulty.harder, color: '#7A2632' },
            { label: 'Keep the same', value: d.skill.suggested_difficulty.same, color: '#C9A66B' },
            { label: 'Make it easier', value: d.skill.suggested_difficulty.easier, color: '#5B7A99' },
          ])}
        </div>
      </div>`));

    out.push(section('Trickiest fortunes',
      'The fortunes players got wrong (or ran out of time on) most often.',
      table(['Fortune', 'Really is', 'Shown', 'Got wrong', 'Typical decision'],
        d.hardest_fortunes.map(f => [
          clip(f.fortune, 90),
          { html: f.is_phishy === null ? '-' : f.is_phishy ? '<span class="tag bad">Phishing</span>' : '<span class="tag good">Safe</span>' },
          num(f.shown), meter(f.miss_rate, 'var(--red)'), duration(f.avg_decision_ms),
        ]),
        { numeric: [2, 4] })));

    const m = d.marking;
    out.push(section('Marking & inspection',
      'After sorting, players mark the suspicious part of each fortune; inspection grades each mark.',
      `<div class="cards small">
        ${card('Marking rounds', num(m.submissions))}
        ${card('Ran out of time', pct(m.ran_out_of_time_rate), `${num(m.ran_out_of_time)} rounds auto-submitted`)}
        ${card('Fortunes marked', pct(m.marked_share), 'of the fortunes they were given')}
      </div>
      <h3>Inspection results</h3>
      ${stacked([
        { label: 'Correct', value: m.tiers.correct, color: '#5E8C4A' },
        { label: 'Partly right', value: m.tiers.partial, color: '#D29A2E' },
        { label: 'Wrong', value: m.tiers.wrong, color: '#B03A2E' },
      ])}`));

    if (d.scores.length) {
      out.push(section('Scores', 'The incentive players earned at the end of each level.',
        table(['Level', 'Players', 'Typical', 'Average', 'Lowest', 'Highest', 'Share sorted'],
          d.scores.map(x => [sectionName(x.level), num(x.players), num(x.median_incentive), num(x.avg_incentive),
            num(x.min_incentive), num(x.max_incentive), meter(x.avg_sorted_share, 'var(--gold)')]),
          { numeric: [1, 2, 3, 4, 5] })));
    }

    if (d.supervisor.rows.length) {
      out.push(section('Supervisor checklist', 'Whether players kept or overturned each earlier decision.',
        table(['#', 'Fortune', 'Original decision', 'Players', 'Kept', 'Overturned'],
          d.supervisor.rows.map(r => {
            const kept = r.choices.stay || 0;
            const revoked = r.choices.revoke || 0;
            return [r.row + 1, clip(r.fortune, 70), prettyName(r.original), num(r.players),
              meter(r.players ? kept / r.players : null, 'var(--green)'), meter(r.players ? revoked / r.players : null, 'var(--red)')];
          }), { numeric: [0, 3] })
        + (d.supervisor.revoke_reasons.length ? `<h3>Reasons given for overturning</h3>${tallyBars(d.supervisor.revoke_reasons)}` : '')));
    }

    if (d.training_picks.length) {
      out.push(section('Training picks', 'The fortunes players picked most often while practising on the trays.',
        tallyBars(d.training_picks.map(x => ({ ...x, value: clip(x.value, 70) })), { color: 'var(--gold)' })));
    }

    const a = d.audience;
    const block = (title, list, color) => `<div><h3>${esc(title)}</h3>${tallyBars(list, { color })}</div>`;
    out.push(section('Who is playing', 'From what players entered when they clocked in and applied.',
      `<div class="grid2">
        ${block('Designation', a.designations)}
        ${block('Region', a.regions, 'var(--gold)')}
        ${block('Age group', a.age_groups, 'var(--blue)')}
        ${block('Device', a.devices, 'var(--green)')}
        ${block('Top interests', a.interests, 'var(--gold)')}
        ${block('Websites they use', a.familiar_websites)}
      </div>`));

    if (o.client_errors) {
      out.push(section('Technical problems', '', `<p>${num(o.client_errors)} error${o.client_errors === 1 ? '' : 's'} were reported by players' browsers in this period.</p>`));
    }

    main.innerHTML = out.join('');
  }

  /* ---------------- downloads ---------------- */

  async function download(path) {
    try {
      const res = await api(path, { raw: true });
      const name = ((res.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/) || [])[1] || 'fortunery-export';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) {
      showError(e);
    }
  }

  const menuBtn = $('#download');
  const menu = $('#download-menu');
  const setMenu = (open) => { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden); });
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-path]');
    if (!btn) return;
    setMenu(false);
    download(btn.dataset.path);
  });
  document.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- start ---------------- */

  $('#refresh').addEventListener('click', load);
  $('#signout').addEventListener('click', () => { store.remove(TOKEN_KEY); load(); });
  filtersForm.addEventListener('change', load);
  menuBtn.disabled = true;

  try {
    const saved = JSON.parse(store.get(FILTER_KEY) || 'null');
    if (saved) {
      filtersForm.period.value = saved.period || 'all';
      // designation/region options arrive with the first load; fillSelect keeps these
      if (saved.designation) fillSelect(filtersForm.designation, [], saved.designation);
      if (saved.region) fillSelect(filtersForm.region, [], saved.region);
    }
  } catch (e) { /* ignore */ }

  load();
}());
