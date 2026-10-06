// CSV exports - open in Excel / Google Sheets.
const { describe, sectionName } = require('./describe');

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

// Activity: one row per event. Each event's own fields become columns named after
// them (e.g. "tray", "correct", "decision_ms"), so it's easy to filter.
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

// Players: one row per player with their answers and headline numbers
function playersCsv(profiles) {
  const levels = [];
  profiles.forEach(p => Object.keys(p.scores).forEach(k => { if (!levels.includes(k)) levels.push(k); }));
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
  return toCsv(columns, profiles);
}

module.exports = { eventsCsv, playersCsv };
