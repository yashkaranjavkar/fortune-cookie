import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ANALYTICS } from '../config/analytics';
import { buildProfiles, getStoredEvents, clearStoredData } from '../analytics/mockBackend';
import './AnalyticsDashboard.css';

// The Analytics page (open http://localhost:3000/#analytics): everything the game has
// recorded about its players, as plain tables and charts. Reads the same data the
// dummy backend stores - this browser's storage, or the Node server when
// transport is 'http' in src/config/analytics.js.

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

/* ---------------- Formatting helpers ---------------- */

const sectionName = (key) => SECTION_LABELS[key] || key || '-';

// "walkToMarking" / "room_intro_line1" -> "Walk to marking" / "Room intro line1"
function prettyName(key) {
  if (!key) return '-';
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

const percent = (x) => (x === null || x === undefined ? '-' : `${Math.round(x * 100)}%`);
const dateTime = (iso) => (iso ? new Date(iso).toLocaleString() : '-');
const clip = (text, n = 70) => (text && text.length > n ? `${text.slice(0, n - 1)}…` : text || '');

// One line of plain English per event, for the activity list
function describe(ev) {
  const d = ev.data || {};
  switch (ev.type) {
    case 'session_start': return d.returning_player ? 'Came back to the game' : 'Opened the game for the first time';
    case 'session_end': return `Left the game after ${duration(d.duration_ms)}`;
    case 'section_start': return `Started "${sectionName(d.section)}"`;
    case 'section_complete': return `Finished "${sectionName(d.section)}" in ${duration(d.duration_ms)}`;
    case 'screen_exit': return `Spent ${duration(d.duration_ms)} on "${prettyName(d.screen)}"`;
    case 'opening_start_pressed': return `Pressed Start after ${duration(d.time_on_title_ms)} on the title screen`;
    case 'player_clock_in': return `Clocked in as "${d.designation}" (ID ${d.employee_id})`;
    case 'application_submitted': return `Applied: age ${d.age_group}, ${d.region}, interests: ${(d.interests || []).join(', ')}`;
    case 'interest_suggestion_added': return `Added suggested interest "${d.interest}"`;
    case 'website_toggled': return `${d.selected ? 'Picked' : 'Unpicked'} ${d.site}`;
    case 'websites_submitted': return `Submitted familiar websites (${d.toggle_count} clicks, ${duration(d.decision_ms)})`;
    case 'tray_bunch_opened': return `Opened bunch ${d.bunch + 1} on tray ${d.tray + 1}`;
    case 'tray_fortunes_selected': return `Picked ${d.selected_count} fortune(s) from tray ${d.tray + 1} in ${duration(d.decision_ms)}`;
    case 'demo_fortune_sorted': return `Demo: sorted a fortune into ${d.tray} in ${duration(d.decision_ms)}`;
    case 'rules_help_opened': return `Popped a balloon to re-read the rules (${d.uses_left} left)`;
    case 'fortune_sorted': {
      const verdict = d.correct === true ? 'correct' : d.correct === false ? 'WRONG' : 'unchecked';
      return `Sorted "${clip(d.fortune, 50)}" into ${d.tray} - ${verdict} - ${duration(d.decision_ms)}`;
    }
    case 'fortune_timed_out': return `Ran out of time on "${clip(d.fortune, 50)}"`;
    case 'sorting_round_complete': return `Finished sorting: ${d.correct} right, ${d.wrong} wrong, ${d.timed_out} timed out`;
    case 'fortune_marked': return `Marked "${d.marked_text}"`;
    case 'fortune_mark_removed': return `Removed a mark`;
    case 'marking_submitted': return `Sent ${d.marked_count}/${d.item_count} marked fortunes${d.auto_submitted ? ' (time ran out)' : ''}`;
    case 'inspection_revealed': return `Inspection: ${d.tier} (${d.points >= 0 ? '+' : ''}${d.points})`;
    case 'inspection_complete': return `Inspection total: ${d.total_points}`;
    case 'sorting_scored': return `Sorting payment: ${d.total_points}`;
    case 'level_complete': return `Completed ${d.batch} - incentive ${d.incentive}`;
    case 'level_replay': return 'Replayed the level';
    case 'nav_back': return `Went back from "${prettyName(d.from)}" to "${prettyName(d.to)}"`;
    case 'nav_jump': return `Jumped to "${prettyName(d.to)}" (${d.reason})`;
    case 'supervisor_decision': return `Supervisor: chose to ${d.choice} on "${clip(d.fortune, 45)}"`;
    case 'supervisor_revoke_reason': return `Reason given: ${d.reason}`;
    case 'supervisor_checklist_submitted': return 'Submitted the supervisor checklist';
    case 'sound_toggled': return d.muted ? 'Muted the sound' : 'Turned sound on';
    case 'ui_click': return `Clicked "${d.label || d.element}"`;
    case 'field_change': return `Changed ${d.field}`;
    case 'app_hidden': return 'Switched away from the game';
    case 'app_visible': return `Came back to the game after ${duration(d.hidden_ms)}`;
    case 'client_error': return `Error: ${d.message}`;
    default: return prettyName(ev.type);
  }
}

/* ---------------- CSV export ---------------- */

// One CSV cell: objects/arrays as JSON, quoted when needed
function csvCell(value) {
  if (value === null || value === undefined) return '';
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(columns, rows) {
  const lines = [columns.map(c => csvCell(c.label)).join(',')];
  rows.forEach(row => lines.push(columns.map(c => csvCell(c.get(row))).join(',')));
  // The BOM makes Excel read it as UTF-8 (so ₹, emoji and accents show correctly)
  return `﻿${lines.join('\r\n')}`;
}

function saveFile(content, type, name) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Activity CSV: one row per event. Each event's own fields become columns named
// after them (e.g. "tray", "correct", "decision_ms"), so it's easy to filter in Excel.
function eventsCsv(events) {
  const dataKeys = [];
  events.forEach(e => Object.keys(e.data || {}).forEach(k => { if (!dataKeys.includes(k)) dataKeys.push(k); }));
  const columns = [
    { label: 'time', get: e => e.ts },
    { label: 'player_id', get: e => e.player_id },
    { label: 'session_id', get: e => e.session_id },
    { label: 'order', get: e => e.seq },
    { label: 'event', get: e => e.type },
    { label: 'what_happened', get: e => describe(e) },
    { label: 'game_section', get: e => e.context && e.context.section },
    { label: 'game_screen', get: e => e.context && e.context.screen },
    ...dataKeys.map(k => ({ label: k, get: e => (e.data || {})[k] })),
  ];
  return toCsv(columns, events);
}

// Players CSV: one row per player with their answers and headline numbers
function playersCsv(players) {
  const levels = [];
  players.forEach(p => Object.keys(p.scores).forEach(k => { if (!levels.includes(k)) levels.push(k); }));
  const seconds = (ms) => (ms ? Math.round(ms / 1000) : 0);
  const screenSum = (p, key) => Object.values(p.time.by_screen).reduce((n, s) => n + s[key], 0);
  const columns = [
    { label: 'player_id', get: p => p.player_id },
    { label: 'employee_id', get: p => p.traits.employee_id },
    { label: 'designation', get: p => p.traits.designation },
    { label: 'age_group', get: p => p.traits.age_group },
    { label: 'region', get: p => p.traits.region },
    { label: 'interests', get: p => (p.traits.interests || []).join('; ') },
    { label: 'first_played', get: p => p.first_seen },
    { label: 'last_played', get: p => p.last_seen },
    { label: 'times_played', get: p => p.sessions.length },
    { label: 'play_time_seconds', get: p => seconds(Math.max(p.time.total_ms, screenSum(p, 'total_ms'))) },
    { label: 'active_time_seconds', get: p => seconds(Math.max(p.time.active_ms, screenSum(p, 'active_ms'))) },
    { label: 'got_as_far_as', get: p => sectionName(p.progress.sections_started[p.progress.sections_started.length - 1]) },
    { label: 'sections_finished', get: p => p.progress.sections_completed.map(sectionName).join('; ') },
    { label: 'sort_accuracy', get: p => p.derived.sort_accuracy },
    { label: 'phishing_caught_rate', get: p => p.derived.phishing_catch_rate },
    { label: 'false_alarm_rate', get: p => p.derived.false_alarm_rate },
    { label: 'marking_precision', get: p => p.derived.marking_precision },
    { label: 'avg_decision_seconds', get: p => (p.derived.avg_decision_ms ? (p.derived.avg_decision_ms / 1000).toFixed(1) : '') },
    { label: 'pace', get: p => p.derived.pace },
    { label: 'timed_out', get: p => p.derived.timeouts },
    { label: 'rules_reread', get: p => p.derived.help_reliance },
    { label: 'marking_ran_out_of_time', get: p => p.derived.marking_ran_out_of_time },
    { label: 'suggested_difficulty', get: p => p.derived.suggested_difficulty },
    ...levels.map(l => ({ label: `${sectionName(l)} incentive`, get: p => (p.scores[l] ? p.scores[l].incentive : '') })),
    { label: 'familiar_websites', get: p => Object.entries(p.websites).map(([c, s]) => `${c}: ${s.join(', ')}`).join(' | ') },
    { label: 'sound_muted', get: p => p.traits.sound_muted },
  ];
  return toCsv(columns, players);
}

const NOISY_TYPES = ['ui_click', 'field_change', 'screen_view', 'player_identified', 'website_toggled', 'fortune_revealed'];

/* ---------------- Small building blocks ---------------- */

function Card({ label, value, hint }) {
  return (
    <div className="ad-card">
      <div className="ad-card-label">{label}</div>
      <div className="ad-card-value">{value}</div>
      {hint && <div className="ad-card-hint">{hint}</div>}
    </div>
  );
}

function Section({ title, help, children }) {
  return (
    <section className="ad-section">
      <h2>{title}</h2>
      {help && <p className="ad-help">{help}</p>}
      {children}
    </section>
  );
}

// Horizontal bar chart: rows of { label, value, text }
function BarChart({ rows, color = 'var(--ad-maroon)', empty = 'Nothing recorded yet.' }) {
  if (!rows.length) return <p className="ad-empty-line">{empty}</p>;
  const max = Math.max(...rows.map(r => r.value), 1);
  return (
    <div className="ad-bars">
      {rows.map((r, i) => (
        <div className="ad-bar-row" key={i}>
          <div className="ad-bar-label" title={r.label}>{r.label}</div>
          <div className="ad-bar-track">
            <div className="ad-bar-fill" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: r.color || color }} />
          </div>
          <div className="ad-bar-value">{r.text}</div>
        </div>
      ))}
    </div>
  );
}

// One bar split into coloured parts: { label, value, color }
function StackedBar({ parts }) {
  const total = parts.reduce((n, p) => n + p.value, 0);
  if (!total) return <p className="ad-empty-line">Nothing recorded yet.</p>;
  return (
    <>
      <div className="ad-stack">
        {parts.filter(p => p.value).map(p => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${p.value}`}>
            {p.value}
          </div>
        ))}
      </div>
      <div className="ad-legend">
        {parts.map(p => (
          <span key={p.label}><i style={{ background: p.color }} />{p.label}: <b>{p.value}</b> ({Math.round((p.value / total) * 100)}%)</span>
        ))}
      </div>
    </>
  );
}

function Table({ head, rows, empty = 'Nothing recorded yet.' }) {
  if (!rows.length) return <p className="ad-empty-line">{empty}</p>;
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- The page ---------------- */

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [showAllActivity, setShowAllActivity] = useState(false);

  const source = ANALYTICS.transport === 'http' ? 'server' : 'browser';

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      let list;
      if (source === 'server') {
        const res = await fetch(ANALYTICS.endpoint);
        list = await res.json();
      } else {
        list = getStoredEvents();
      }
      setEvents(Array.isArray(list) ? list : []);
      setStatus('ready');
    } catch (e) {
      setError(`Couldn't reach the analytics server at ${ANALYTICS.endpoint}. Is it running? (npm run analytics-server)`);
      setStatus('error');
    }
  }, [source]);

  useEffect(() => { load(); }, [load]);

  const profiles = useMemo(() => buildProfiles(events), [events]);
  const players = useMemo(
    () => Object.values(profiles).sort((a, b) => String(b.last_seen).localeCompare(String(a.last_seen))),
    [profiles]
  );

  // Default to the most recently active player
  useEffect(() => {
    if (players.length && (!playerId || !profiles[playerId])) setPlayerId(players[0].player_id);
  }, [players, playerId, profiles]);

  const profile = playerId ? profiles[playerId] : null;

  // Session totals only exist once a session has ended cleanly (tab closed) - until
  // then, add up the time on each screen instead
  const screenTotals = profile
    ? Object.values(profile.time.by_screen).reduce((t, s) => ({ total: t.total + s.total_ms, active: t.active + s.active_ms }), { total: 0, active: 0 })
    : { total: 0, active: 0 };
  const playTime = profile ? Math.max(profile.time.total_ms, screenTotals.total) : 0;
  const activeTime = profile ? Math.max(profile.time.active_ms, screenTotals.active) : 0;
  const playerEvents = useMemo(() => events.filter(e => e.player_id === playerId), [events, playerId]);

  const [menuOpen, setMenuOpen] = useState(false);
  const stamp = new Date().toISOString().slice(0, 10);
  const downloads = [
    {
      label: 'All data (JSON)',
      hint: 'Everything - for developers and backends',
      run: () => saveFile(JSON.stringify({ exported_at: new Date().toISOString(), profiles, events }, null, 2), 'application/json', `fortunery-analytics-${stamp}.json`),
    },
    {
      label: 'Activity (CSV)',
      hint: 'One row per action - opens in Excel / Sheets',
      run: () => saveFile(eventsCsv(events), 'text/csv;charset=utf-8', `fortunery-activity-${stamp}.csv`),
    },
    {
      label: 'Players (CSV)',
      hint: 'One row per player - answers, time and scores',
      run: () => saveFile(playersCsv(players), 'text/csv;charset=utf-8', `fortunery-players-${stamp}.csv`),
    },
  ];

  const clearAll = () => {
    if (source === 'server') {
      window.alert('The data lives on the analytics server - delete analytics-server/data/events.ndjson to clear it.');
      return;
    }
    if (window.confirm('Delete ALL recorded play data from this browser? This cannot be undone.')) {
      clearStoredData();
      load();
    }
  };

  const backToGame = () => {
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <div className="ad-page">
      <header className="ad-top">
        <div>
          <h1>Player Analytics</h1>
          <p className="ad-sub">
            {source === 'server'
              ? `Data from the analytics server (${ANALYTICS.endpoint})`
              : 'Data recorded while the game was played in this browser'}
          </p>
        </div>
        <div className="ad-actions">
          <button type="button" onClick={load}>↻ Refresh</button>
          <div className="ad-menu">
            <button type="button" onClick={() => setMenuOpen(o => !o)} disabled={!events.length} aria-expanded={menuOpen}>
              ⬇ Download ▾
            </button>
            {menuOpen && (
              <div className="ad-menu-list" role="menu">
                {downloads.map(d => (
                  <button
                    key={d.label}
                    type="button"
                    role="menuitem"
                    onClick={() => { d.run(); setMenuOpen(false); }}
                  >
                    <b>{d.label}</b>
                    <span>{d.hint}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="danger" onClick={clearAll} disabled={!events.length}>🗑 Clear data</button>
          <button type="button" className="primary" onClick={backToGame}>← Back to game</button>
        </div>
      </header>

      {status === 'loading' && <p className="ad-empty">Loading…</p>}
      {status === 'error' && <p className="ad-empty error">{error}</p>}

      {status === 'ready' && !events.length && (
        <div className="ad-empty">
          <h2>No play data yet</h2>
          <p>Play the game for a bit, then come back to this page and press <b>Refresh</b>.</p>
          <p className="ad-help">Recordings are saved every few seconds while playing.</p>
        </div>
      )}

      {status === 'ready' && profile && (
        <>
          <Section title="Player">
            <div className="ad-player-pick">
              <label htmlFor="ad-player">Showing:</label>
              <select id="ad-player" value={playerId} onChange={(e) => setPlayerId(e.target.value)}>
                {players.map(p => (
                  <option key={p.player_id} value={p.player_id}>
                    {p.traits.designation || 'Unnamed player'}
                    {p.traits.employee_id ? ` · ID ${p.traits.employee_id}` : ''}
                    {` · last played ${dateTime(p.last_seen)}`}
                  </option>
                ))}
              </select>
              <span className="ad-help">{players.length} player{players.length === 1 ? '' : 's'} recorded</span>
            </div>

            <div className="ad-cards">
              <Card label="Total play time" value={duration(playTime || null)} hint={`Actively playing: ${duration(activeTime || null)}`} />
              <Card label="Times played" value={profile.sessions.length} hint={`First: ${dateTime(profile.first_seen)}`} />
              <Card label="Got as far as" value={sectionName(profile.progress.sections_started[profile.progress.sections_started.length - 1])} hint={`${profile.progress.sections_completed.length} section(s) finished`} />
              <Card label="Sorting accuracy" value={percent(profile.derived.sort_accuracy)} hint="Fortunes put in the right tray" />
              <Card label="Average decision time" value={duration(profile.derived.avg_decision_ms)} hint={profile.derived.pace ? `Pace: ${profile.derived.pace}` : 'Per fortune sorted'} />
              <Card label="Suggested difficulty" value={profile.derived.suggested_difficulty ? prettyName(profile.derived.suggested_difficulty) : '-'} hint="Based on accuracy and pace" />
            </div>
          </Section>

          <Section title="About this player" help="What the player told the game during onboarding.">
            <Table
              head={['Detail', 'Answer']}
              rows={[
                ['Employee ID', profile.traits.employee_id || '-'],
                ['Designation', profile.traits.designation || '-'],
                ['Age group', profile.traits.age_group || '-'],
                ['Region', profile.traits.region || '-'],
                ['Interests', (profile.traits.interests || []).join(', ') || '-'],
                ['Language / time zone', [profile.traits.language, profile.traits.timezone].filter(Boolean).join(' · ') || '-'],
                ['Screen size', profile.traits.viewport || '-'],
                ['Sound', profile.traits.sound_muted ? 'Muted' : 'On'],
              ]}
            />
          </Section>

          <Section title="Where the time went" help="How long the player spent in each part of the game, and on each individual screen (longest first).">
            <h3>By part of the game</h3>
            <BarChart
              rows={Object.entries(profile.time.by_section)
                .sort((a, b) => b[1] - a[1])
                .map(([k, ms]) => ({ label: sectionName(k), value: ms, text: duration(ms) }))}
              color="var(--ad-gold)"
              empty="No part of the game finished yet."
            />
            <h3>By screen</h3>
            <BarChart
              rows={Object.entries(profile.time.by_screen)
                .sort((a, b) => b[1].total_ms - a[1].total_ms)
                .slice(0, 20)
                .map(([k, s]) => {
                  const [sec, screen] = k.split('/');
                  return {
                    label: `${sectionName(sec)} › ${prettyName(screen)}`,
                    value: s.total_ms,
                    text: `${duration(s.total_ms)}${s.views > 1 ? ` (${s.views} visits)` : ''}`,
                  };
                })}
            />
          </Section>

          <Section title="Sorting fortunes" help="Each level's dome game: how many fortunes went into the right tray, and how fast.">
            <Table
              head={['Level', 'Sorted', 'Right', 'Wrong', 'Ran out of time', 'Accuracy', 'Avg. decision time']}
              rows={Object.entries(profile.sorting.by_level).map(([lvl, s]) => [
                sectionName(lvl),
                s.sorted,
                s.correct,
                s.wrong,
                s.timed_out,
                s.correct + s.wrong ? percent(s.correct / (s.correct + s.wrong)) : '-',
                s.sorted ? duration(s.decision_ms_total / s.sorted) : '-',
              ])}
            />
            <div className="ad-cards small">
              <Card label="Phishing caught" value={percent(profile.derived.phishing_catch_rate)} hint="Faulty fortunes correctly sent to the Faulty tray" />
              <Card label="False alarms" value={percent(profile.derived.false_alarm_rate)} hint="Good fortunes wrongly sent to the Faulty tray" />
              <Card label="Rules re-read" value={profile.derived.help_reliance} hint="Balloons popped for help" />
              <Card label="Timed out" value={profile.derived.timeouts} hint="Fortunes left until the timer ran out" />
            </div>
          </Section>

          <Section title="Marking & inspection" help="How accurately the player highlighted the faulty part of each fortune, as judged under the torch.">
            <StackedBar
              parts={[
                { label: 'Correct', value: profile.marking.tiers.correct, color: '#4F7A3F' },
                { label: 'Partly correct', value: profile.marking.tiers.partial, color: '#D29A2E' },
                { label: 'Wrong', value: profile.marking.tiers.wrong, color: '#8E2A37' },
              ]}
            />
            <p className="ad-help">
              Marking rounds: <b>{profile.marking.submissions}</b> · timer ran out in <b>{profile.marking.auto_submitted}</b>
            </p>
          </Section>

          <Section title="Scores" help="The incentive earned at the end of each level.">
            <BarChart
              rows={Object.entries(profile.scores).map(([lvl, s]) => ({
                label: sectionName(lvl),
                value: Math.max(0, s.incentive || 0),
                text: `${s.incentive} (${s.sorted}/${s.total} sorted)`,
                color: (s.incentive || 0) >= 0 ? '#4F7A3F' : '#8E2A37',
              }))}
              empty="No level finished yet."
            />
          </Section>

          <Section title="Familiar websites picked" help="The websites the player said they know, by category.">
            {Object.keys(profile.websites).length ? (
              <div className="ad-sites">
                {Object.entries(profile.websites).map(([cat, sites]) => (
                  <div key={cat} className="ad-site-row">
                    <span className="ad-site-cat">{prettyName(cat)}</span>
                    {sites.map(s => <span key={s} className="ad-chip">{s}</span>)}
                  </div>
                ))}
              </div>
            ) : <p className="ad-empty-line">Not reached yet.</p>}
          </Section>

          <Section title="Supervisor review" help="Each fortune the player reviewed as supervisor: kept the original call, or overturned it.">
            {(() => {
              const sub = [...playerEvents].reverse().find(e => e.type === 'supervisor_checklist_submitted');
              return (
                <Table
                  head={['Fortune', 'Original call', 'Player chose', 'Reason']}
                  rows={sub ? sub.data.decisions.map(d => [clip(d.fortune, 80), d.original || '-', d.choice === 'revoke' ? 'Overturn' : 'Keep', d.reason || '-']) : []}
                  empty="Not reached yet."
                />
              );
            })()}
          </Section>

          <Section title="Play sessions" help="Each time the game was opened.">
            <Table
              head={['Started', 'Length', 'Actions recorded', 'Last screen']}
              rows={profile.sessions.map(sid => {
                const evs = playerEvents.filter(e => e.session_id === sid);
                const end = evs.find(e => e.type === 'session_end');
                const first = evs[0];
                const last = evs[evs.length - 1];
                const length = end ? end.data.duration_ms : (last && first ? new Date(last.ts) - new Date(first.ts) : null);
                return [
                  dateTime(first && first.ts),
                  duration(length),
                  evs.length,
                  last && last.context ? `${sectionName(last.context.section)} › ${prettyName(last.context.screen)}` : '-',
                ];
              }).reverse()}
            />
          </Section>

          <Section title="Activity log" help="Everything the player did, newest first.">
            <label className="ad-toggle">
              <input type="checkbox" checked={showAllActivity} onChange={(e) => setShowAllActivity(e.target.checked)} />
              Include every click and screen change
            </label>
            <ol className="ad-log">
              {[...playerEvents]
                .reverse()
                .filter(e => showAllActivity || !NOISY_TYPES.includes(e.type))
                .slice(0, 150)
                .map(e => (
                  <li key={e.event_id} className={`t-${e.type}`}>
                    <time>{new Date(e.ts).toLocaleTimeString()}</time>
                    <span className="ad-log-where">{sectionName(e.context && e.context.section)}</span>
                    <span>{describe(e)}</span>
                  </li>
                ))}
            </ol>
          </Section>
        </>
      )}
    </div>
  );
}
