// Aggregate analytics across all players - what the Analytics dashboard shows.
// Nothing here is about one person: every figure is a count, rate, average or median
// over the players matching the filters.
//
// Filters (all optional):
//   since, until   ISO dates (YYYY-MM-DD, inclusive) - only activity in this window
//   designation    only players who clocked in with this designation
//   region         only players who chose this region on the job application

const AGG_TYPES = [
  'session_start', 'session_end', 'client_error', 'nav_back', 'level_replay',
  'player_clock_in', 'player_details_submitted', 'player_identified', 'application_submitted', 'websites_submitted',
  'section_start', 'section_complete', 'screen_exit',
  'tray_fortunes_selected', 'fortune_sorted', 'fortune_timed_out', 'rules_help_opened',
  'marking_submitted', 'inspection_revealed', 'level_complete',
  'supervisor_decision', 'supervisor_revoke_reason',
];
const TRAIT_TYPES = ['player_clock_in', 'player_details_submitted', 'player_identified', 'application_submitted'];

/* ---------------- small helpers ---------------- */

const round = (x, places = 2) => (x === null || x === undefined || Number.isNaN(x) ? null : Math.round(x * 10 ** places) / 10 ** places);
const ratio = (a, b) => (b ? round(a / b) : null);
const avg = (list) => (list.length ? Math.round(list.reduce((n, x) => n + x, 0) / list.length) : null);
function median(list) {
  if (!list.length) return null;
  const s = [...list].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return Math.round(s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2);
}
const nums = (list) => list.filter(x => typeof x === 'number' && Number.isFinite(x));

// { value -> count } tallies, returned as [{ value, count }] most common first
function tally() {
  const m = new Map();
  return {
    add(value, n = 1) {
      if (value === null || value === undefined || value === '') return;
      const key = String(value).trim();
      if (key) m.set(key, (m.get(key) || 0) + n);
    },
    list(limit = Infinity) {
      return [...m.entries()].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count).slice(0, limit);
    },
  };
}

// Map with a default value per key
function groups(make) {
  const m = new Map();
  return {
    get(key) { if (!m.has(key)) m.set(key, make(key)); return m.get(key); },
    has(key) { return m.has(key); },
    keys() { return [...m.keys()]; },
    values() { return [...m.values()]; },
    entries() { return [...m.entries()]; },
  };
}

function deviceClass(viewport) {
  const w = Number(String(viewport || '').split('x')[0]);
  if (!w) return null;
  return w < 700 ? 'Phone' : w < 1100 ? 'Tablet / small laptop' : 'Desktop';
}

function dateRange({ since, until }) {
  const valid = (d) => d && !Number.isNaN(Date.parse(d));
  let from = null;
  let to = null;
  if (valid(since)) from = new Date(since).toISOString();
  if (valid(until)) {
    const end = new Date(until);
    // A bare date means "up to the end of that day"
    if (/^\d{4}-\d{2}-\d{2}$/.test(until)) end.setUTCDate(end.getUTCDate() + 1);
    to = end.toISOString();
  }
  return { from, to };
}

/* ---------------- the report ---------------- */

function buildInsights(db, filters = {}) {
  const { from, to } = dateRange(filters);
  const designationFilter = filters.designation || null;
  const regionFilter = filters.region || null;

  // Who each player is (latest answer wins), from their whole history - so filtering
  // by designation still works for activity after the job application
  const traits = new Map();
  db.prepare(`SELECT player_id, type, data FROM events WHERE type IN (${TRAIT_TYPES.map(() => '?').join(',')}) ORDER BY ts`)
    .all(...TRAIT_TYPES)
    .forEach(row => {
      const d = JSON.parse(row.data);
      const t = traits.get(row.player_id) || {};
      if (row.type === 'player_clock_in') { t.designation = d.designation; t.employee_id = d.employee_id; }
      if (row.type === 'player_details_submitted') { t.designation = d.designation; t.employee_id = d.employee_id; t.region = d.region; }
      if (row.type === 'player_identified' && d.traits && d.traits.designation) t.designation = d.traits.designation;
      if (row.type === 'player_identified' && d.traits && d.traits.region) t.region = d.traits.region;
      if (row.type === 'application_submitted') { t.region = d.region; t.age_group = d.age_group; t.interests = d.interests; }
      traits.set(row.player_id, t);
    });

  // Everything that drives the report, within the date window
  const where = [`type IN (${AGG_TYPES.map(() => '?').join(',')})`];
  const params = [...AGG_TYPES];
  if (from) { where.push('ts >= ?'); params.push(from); }
  if (to) { where.push('ts < ?'); params.push(to); }
  const rows = db.prepare(`SELECT player_id, session_id, type, ts, t_ms, section, screen, data FROM events WHERE ${where.join(' AND ')} ORDER BY ts, seq`).all(...params);

  const matches = (pid) => {
    const t = traits.get(pid) || {};
    if (designationFilter && t.designation !== designationFilter) return false;
    if (regionFilter && t.region !== regionFilter) return false;
    return true;
  };
  const events = rows.filter(r => matches(r.player_id)).map(r => ({ ...r, data: JSON.parse(r.data) }));
  const playerIds = new Set(events.map(e => e.player_id));

  // Sessions in the window, from the sessions table (exact start/end even when the
  // session_end event never arrived)
  const sWhere = [];
  const sParams = [];
  if (from) { sWhere.push('ended_at >= ?'); sParams.push(from); }
  if (to) { sWhere.push('started_at < ?'); sParams.push(to); }
  const sessions = db.prepare(`SELECT * FROM sessions ${sWhere.length ? `WHERE ${sWhere.join(' AND ')}` : ''}`)
    .all(...sParams)
    .filter(s => playerIds.has(s.player_id));
  const firstSeen = new Map(db.prepare('SELECT player_id, first_seen FROM players').all().map(r => [r.player_id, r.first_seen]));

  /* ----- one pass over the events ----- */
  const sessionLengths = new Map(); // session_id -> duration from session_end
  const flows = new Map();          // player -> last game_flow they played
  const sectionOrder = new Map();   // section -> position in the flow
  const devices = tally();
  const languages = tally();
  const returning = new Set();
  let errors = 0;
  let backNav = 0;
  let replays = 0;

  const funnel = groups(() => ({ started: new Set(), completed: new Set(), durations: [] }));
  const screens = groups(() => ({ views: 0, players: new Set(), total: [], active: [], idle: [], hidden: [], clicks: [], at: [] }));
  const levels = groups(() => ({
    players: new Set(), sorted: 0, correct: 0, wrong: 0, timed_out: 0, help: 0,
    phishy_seen: 0, phishy_caught: 0, legit_seen: 0, legit_flagged: 0, decision: [],
  }));
  const fortunes = groups(() => ({ shown: 0, wrong: 0, timed_out: 0, decision: [], is_phishy: null, levels: new Set() }));
  const trayPicks = tally();
  const marking = { submissions: 0, auto: 0, items: 0, marked: 0, decision: [], tiers: { correct: 0, partial: 0, wrong: 0 } };
  const scores = groups(() => ({ players: new Set(), incentive: [], sortedRatio: [] }));
  const supervisorRows = groups((row) => ({ row, fortune: null, original: null, choices: new Map() }));
  const revokeReasons = tally();
  const websites = tally();
  const perPlayer = groups(() => ({ sorted: 0, correct: 0, graded: 0, decision: [] }));

  events.forEach(ev => {
    const d = ev.data || {};
    switch (ev.type) {
      case 'session_start': {
        if (Array.isArray(d.game_flow)) {
          flows.set(ev.player_id, d.game_flow);
          d.game_flow.forEach((s, i) => { if (!sectionOrder.has(s)) sectionOrder.set(s, i); });
        }
        if (d.returning_player) returning.add(ev.player_id);
        devices.add(deviceClass(d.viewport));
        languages.add(d.language);
        break;
      }
      // play time from the Start button when reported, else from page load
      case 'session_end': if (d.game_ms ?? d.duration_ms) sessionLengths.set(ev.session_id, d.game_ms ?? d.duration_ms); break;
      case 'client_error': errors += 1; break;
      case 'nav_back': backNav += 1; break;
      case 'level_replay': replays += 1; break;
      case 'websites_submitted': {
        const sel = d.selected || {};
        const list = Array.isArray(sel) ? sel : Object.values(sel).flat();
        list.forEach(site => websites.add(typeof site === 'string' ? site : site && (site.name || site.label)));
        break;
      }
      case 'section_start':
        funnel.get(d.section).started.add(ev.player_id);
        if (Number.isFinite(d.index) && !sectionOrder.has(d.section)) sectionOrder.set(d.section, d.index);
        break;
      case 'section_complete': {
        const f = funnel.get(d.section);
        f.completed.add(ev.player_id);
        if (d.duration_ms) f.durations.push(d.duration_ms);
        break;
      }
      case 'screen_exit': {
        const s = screens.get(`${ev.section || '-'}\u0000${d.screen}`);
        s.section = ev.section || null;
        s.screen = d.screen;
        s.views += 1;
        s.players.add(ev.player_id);
        s.total.push(d.duration_ms);
        s.active.push(d.active_ms);
        s.idle.push(d.idle_ms);
        s.hidden.push(d.hidden_ms);
        s.clicks.push(d.clicks);
        s.at.push(ev.t_ms);
        break;
      }
      case 'tray_fortunes_selected':
        (d.selected || []).forEach(f => trayPicks.add(typeof f === 'string' ? f : f && (f.text || f.fortune)));
        break;
      case 'fortune_sorted': {
        const l = levels.get(d.level || ev.section || 'unknown');
        l.players.add(ev.player_id);
        l.sorted += 1;
        if (d.correct === true) l.correct += 1;
        if (d.correct === false) l.wrong += 1;
        if (d.is_phishy === true) { l.phishy_seen += 1; if (d.tray === 'faulty') l.phishy_caught += 1; }
        if (d.is_phishy === false) { l.legit_seen += 1; if (d.tray === 'faulty') l.legit_flagged += 1; }
        if (Number.isFinite(d.decision_ms)) l.decision.push(d.decision_ms);

        const text = typeof d.fortune === 'string' ? d.fortune : d.fortune && (d.fortune.text || d.fortune.fortune);
        if (text) {
          const f = fortunes.get(text);
          f.shown += 1;
          if (d.correct === false) f.wrong += 1;
          if (typeof d.is_phishy === 'boolean') f.is_phishy = d.is_phishy;
          if (Number.isFinite(d.decision_ms)) f.decision.push(d.decision_ms);
          f.levels.add(d.level || ev.section);
        }

        const p = perPlayer.get(ev.player_id);
        p.sorted += 1;
        if (typeof d.correct === 'boolean') { p.graded += 1; if (d.correct) p.correct += 1; }
        if (Number.isFinite(d.decision_ms)) p.decision.push(d.decision_ms);
        break;
      }
      case 'fortune_timed_out': {
        levels.get(d.level || ev.section || 'unknown').timed_out += 1;
        const text = typeof d.fortune === 'string' ? d.fortune : d.fortune && d.fortune.text;
        if (text) {
          const f = fortunes.get(text);
          f.shown += 1;
          f.timed_out += 1;
          if (typeof d.is_phishy === 'boolean') f.is_phishy = d.is_phishy;
        }
        break;
      }
      case 'rules_help_opened': levels.get(d.level || ev.section || 'unknown').help += 1; break;
      case 'marking_submitted':
        marking.submissions += 1;
        if (d.auto_submitted) marking.auto += 1;
        marking.items += d.item_count || 0;
        marking.marked += d.marked_count || 0;
        if (Number.isFinite(d.decision_ms)) marking.decision.push(d.decision_ms);
        break;
      case 'inspection_revealed':
        if (marking.tiers[d.tier] !== undefined) marking.tiers[d.tier] += 1;
        break;
      case 'level_complete': {
        const s = scores.get(ev.section || d.batch || 'unknown');
        s.players.add(ev.player_id);
        if (Number.isFinite(d.incentive)) s.incentive.push(d.incentive);
        if (d.total) s.sortedRatio.push(d.sorted / d.total);
        break;
      }
      case 'supervisor_decision': {
        const r = supervisorRows.get(d.row);
        r.fortune = d.fortune || r.fortune;
        r.original = d.original || r.original;
        // Latest choice per player counts (they can change their mind)
        r.choices.set(ev.player_id, d.choice);
        break;
      }
      case 'supervisor_revoke_reason': revokeReasons.add(d.reason); break;
      default: break;
    }
  });

  /* ----- overview ----- */
  const sessionDurations = sessions.map(s => s.duration_ms || sessionLengths.get(s.session_id)
    || Math.max(0, new Date(s.ended_at) - new Date(s.started_at)));
  const totalPlay = sessionDurations.reduce((n, x) => n + x, 0);
  const inWindow = (iso) => iso && (!from || iso >= from) && (!to || iso < to);
  const newPlayers = [...playerIds].filter(pid => inWindow(firstSeen.get(pid)));

  // A player finished if they completed the last section of the flow they played
  const finished = [...playerIds].filter(pid => {
    const flow = flows.get(pid);
    const last = flow && flow[flow.length - 1];
    return last && funnel.get(last).completed.has(pid);
  });

  const overview = {
    players: playerIds.size,
    new_players: newPlayers.length,
    returning_players: returning.size,
    sessions: sessions.length,
    events: events.length,
    total_play_ms: totalPlay,
    avg_session_ms: avg(sessionDurations),
    median_session_ms: median(sessionDurations),
    avg_play_per_player_ms: playerIds.size ? Math.round(totalPlay / playerIds.size) : null,
    finished_players: finished.length,
    completion_rate: ratio(finished.length, playerIds.size),
    client_errors: errors,
    back_navigations: backNav,
    level_replays: replays,
  };

  /* ----- activity over time ----- */
  const byDay = groups((date) => ({ date, players: new Set(), sessions: 0, new_players: 0 }));
  sessions.forEach(s => {
    const day = byDay.get(s.started_at.slice(0, 10));
    day.sessions += 1;
    day.players.add(s.player_id);
  });
  newPlayers.forEach(pid => { byDay.get(firstSeen.get(pid).slice(0, 10)).new_players += 1; });
  const activity = byDay.values()
    .map(d => ({ date: d.date, players: d.players.size, sessions: d.sessions, new_players: d.new_players }))
    .sort((a, b) => a.date.localeCompare(b.date));

  /* ----- progress through the game ----- */
  const order = (section) => (sectionOrder.has(section) ? sectionOrder.get(section) : 99);
  // Every section in a recorded flow, plus any played that isn't in one
  const progress = [...new Set([...sectionOrder.keys(), ...funnel.keys()])]
    .filter(Boolean)
    .sort((a, b) => order(a) - order(b))
    .map(section => {
      const f = funnel.get(section);
      return {
        section,
        started: f.started.size,
        completed: f.completed.size,
        completion_rate: ratio(f.completed.size, f.started.size),
        avg_duration_ms: avg(nums(f.durations)),
        median_duration_ms: median(nums(f.durations)),
      };
    })
    .filter(r => r.started || r.completed);

  // Where players who didn't finish stopped: the last screen of their latest session
  const latest = new Map();
  sessions.forEach(s => {
    const cur = latest.get(s.player_id);
    if (!cur || s.ended_at > cur.ended_at) latest.set(s.player_id, s);
  });
  const stopped = tally();
  const finishedSet = new Set(finished);
  latest.forEach((s, pid) => {
    if (!finishedSet.has(pid)) stopped.add(`${s.last_section || '-'}\u0000${s.last_screen || '-'}`);
  });
  const dropOff = stopped.list(15).map(({ value, count }) => {
    const [section, screen] = value.split('\u0000');
    return { section, screen, players: count };
  });

  /* ----- time per screen ----- */
  const screenRows = screens.values()
    .map(s => ({
      section: s.section,
      screen: s.screen,
      views: s.views,
      players: s.players.size,
      avg_ms: avg(nums(s.total)),
      median_ms: median(nums(s.total)),
      avg_active_ms: avg(nums(s.active)),
      avg_idle_ms: avg(nums(s.idle)),
      avg_hidden_ms: avg(nums(s.hidden)),
      avg_clicks: round(nums(s.clicks).reduce((n, x) => n + x, 0) / (nums(s.clicks).length || 1), 1),
      _at: median(nums(s.at)) || 0,
    }))
    .sort((a, b) => order(a.section) - order(b.section) || a._at - b._at)
    .map(({ _at, ...r }) => r);

  /* ----- sorting skill ----- */
  const sortingLevels = levels.values();
  const levelRow = (key, l) => ({
    level: key,
    players: l.players.size,
    sorted: l.sorted,
    accuracy: ratio(l.correct, l.correct + l.wrong),
    phishing_catch_rate: ratio(l.phishy_caught, l.phishy_seen),
    false_alarm_rate: ratio(l.legit_flagged, l.legit_seen),
    avg_decision_ms: avg(l.decision),
    median_decision_ms: median(l.decision),
    timeouts: l.timed_out,
    help_opened: l.help,
  });
  const sum = (k) => sortingLevels.reduce((n, l) => n + l[k], 0);
  const allDecisions = sortingLevels.flatMap(l => l.decision);
  const sorting = {
    overall: {
      sorted: sum('sorted'),
      accuracy: ratio(sum('correct'), sum('correct') + sum('wrong')),
      phishing_catch_rate: ratio(sum('phishy_caught'), sum('phishy_seen')),
      false_alarm_rate: ratio(sum('legit_flagged'), sum('legit_seen')),
      avg_decision_ms: avg(allDecisions),
      median_decision_ms: median(allDecisions),
      timeouts: sum('timed_out'),
      help_opened: sum('help'),
    },
    by_level: levels.entries().map(([k, l]) => levelRow(k, l)),
  };

  const hardest = fortunes.entries().map(([text, f]) => ({
    fortune: text,
    is_phishy: f.is_phishy,
    shown: f.shown,
    missed: f.wrong + f.timed_out,
    miss_rate: ratio(f.wrong + f.timed_out, f.shown),
    timeouts: f.timed_out,
    avg_decision_ms: avg(f.decision),
  }));
  hardest.sort((a, b) => (b.miss_rate || 0) - (a.miss_rate || 0) || b.shown - a.shown);

  /* ----- how good players are, as a distribution ----- */
  const accBuckets = [
    { label: 'Under 40%', min: 0, max: 0.4 },
    { label: '40-59%', min: 0.4, max: 0.6 },
    { label: '60-79%', min: 0.6, max: 0.8 },
    { label: '80-89%', min: 0.8, max: 0.9 },
    { label: '90-100%', min: 0.9, max: 1.01 },
  ].map(b => ({ ...b, players: 0 }));
  const pace = { fast: 0, steady: 0, careful: 0 };
  const difficulty = { harder: 0, same: 0, easier: 0 };
  perPlayer.values().forEach(p => {
    const acc = p.graded ? p.correct / p.graded : null;
    if (acc !== null) accBuckets.find(b => acc >= b.min && acc < b.max).players += 1;
    const ms = avg(p.decision);
    const pc = ms === null ? null : ms < 3500 ? 'fast' : ms < 7000 ? 'steady' : 'careful';
    if (pc) pace[pc] += 1;
    if (acc !== null && p.graded >= 4) {
      if (acc >= 0.85 && pc !== 'careful') difficulty.harder += 1;
      else if (acc < 0.6) difficulty.easier += 1;
      else difficulty.same += 1;
    }
  });

  /* ----- scores ----- */
  const scoreRows = scores.entries().sort(([a], [b]) => order(a) - order(b)).map(([k, s]) => {
    const inc = nums(s.incentive);
    return {
      level: k,
      players: s.players.size,
      avg_incentive: inc.length ? round(inc.reduce((n, x) => n + x, 0) / inc.length, 1) : null,
      median_incentive: median(inc),
      min_incentive: inc.length ? Math.min(...inc) : null,
      max_incentive: inc.length ? Math.max(...inc) : null,
      avg_sorted_share: s.sortedRatio.length ? round(s.sortedRatio.reduce((n, x) => n + x, 0) / s.sortedRatio.length) : null,
    };
  });

  /* ----- supervisor ----- */
  const supervisor = {
    rows: supervisorRows.values()
      .sort((a, b) => a.row - b.row)
      .map(r => {
        const counts = {};
        r.choices.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
        return { row: r.row, fortune: r.fortune, original: r.original, players: r.choices.size, choices: counts };
      }),
    revoke_reasons: revokeReasons.list(),
  };

  /* ----- who plays ----- */
  const designations = tally();
  const regions = tally();
  const ageGroups = tally();
  const interests = tally();
  playerIds.forEach(pid => {
    const t = traits.get(pid) || {};
    designations.add(t.designation);
    regions.add(t.region);
    ageGroups.add(t.age_group);
    (t.interests || []).forEach(i => interests.add(i));
  });

  // Choices for the filter drop-downs come from everyone, not just the filtered set
  const allDesignations = tally();
  const allRegions = tally();
  traits.forEach(t => { allDesignations.add(t.designation); allRegions.add(t.region); });

  return {
    generated_at: new Date().toISOString(),
    filters: { since: filters.since || null, until: filters.until || null, designation: designationFilter, region: regionFilter },
    filter_options: {
      designations: allDesignations.list().map(x => x.value).sort(),
      regions: allRegions.list().map(x => x.value).sort(),
    },
    overview,
    activity,
    progress,
    drop_off: dropOff,
    screens: screenRows,
    sorting,
    hardest_fortunes: hardest.slice(0, 15),
    skill: {
      accuracy: accBuckets.map(({ label, players }) => ({ label, players })),
      pace,
      suggested_difficulty: difficulty,
    },
    marking: {
      submissions: marking.submissions,
      ran_out_of_time: marking.auto,
      ran_out_of_time_rate: ratio(marking.auto, marking.submissions),
      marked_share: ratio(marking.marked, marking.items),
      avg_decision_ms: avg(marking.decision),
      tiers: marking.tiers,
    },
    scores: scoreRows,
    supervisor,
    training_picks: trayPicks.list(10),
    audience: {
      designations: designations.list(),
      regions: regions.list(),
      age_groups: ageGroups.list(),
      interests: interests.list(15),
      familiar_websites: websites.list(15),
      devices: devices.list(),
      languages: languages.list(10),
    },
  };
}

module.exports = { buildInsights };
