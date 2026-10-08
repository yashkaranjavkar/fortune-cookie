// Player profiles: one running summary per player, updated as their events arrive.
// Holds what they told the game, where their time went, how well they sorted and
// marked, and derived signals a personalization layer can act on (accuracy, pace,
// help reliance, suggested difficulty...).

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
      // play time counts from the Start button when the game reported it
      profile.time.total_ms += (d.game_ms ?? d.duration_ms) || 0;
      profile.time.active_ms += d.active_ms || 0;
      break;
    case 'game_started':
      profile.time.pre_game_ms = (profile.time.pre_game_ms || 0) + (d.pre_game_ms || 0);
      break;
    case 'player_details_submitted':
      profile.traits.employee_id = d.employee_id;
      profile.traits.designation = d.designation;
      profile.traits.region = d.region;
      break;
    case 'player_identified':
      Object.assign(profile.traits, d.traits);
      break;
    case 'application_submitted':
      profile.traits.age_group = d.age_group;
      profile.traits.region = d.region;
      profile.traits.interests = d.interests;
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

module.exports = { emptyProfile, applyEvent, derive };
