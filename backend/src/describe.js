// Turns events into plain English, for the dashboard's activity log and the CSV export.

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

const clip = (text, n = 70) => (text && text.length > n ? `${text.slice(0, n - 1)}…` : text || '');

function describe(ev) {
  const d = ev.data || {};
  switch (ev.type) {
    case 'session_start': return d.returning_player ? 'Came back to the game' : 'Opened the game for the first time';
    case 'session_end': return `Left the game after ${duration(d.duration_ms)}`;
    case 'section_start': return `Started "${sectionName(d.section)}"`;
    case 'section_complete': return `Finished "${sectionName(d.section)}" in ${duration(d.duration_ms)}`;
    case 'screen_view': return `Opened "${prettyName(d.screen)}"`;
    case 'screen_exit': return `Spent ${duration(d.duration_ms)} on "${prettyName(d.screen)}"`;
    case 'opening_start_pressed': return `Pressed Start after ${duration(d.time_on_title_ms)} on the title screen`;
    case 'player_clock_in': return `Clocked in as "${d.designation}" (ID ${d.employee_id})`;
    case 'player_identified': return 'Profile details updated';
    case 'application_submitted': return `Applied: age ${d.age_group}, ${d.region}, interests: ${(d.interests || []).join(', ')}`;
    case 'interest_suggestion_added': return `Added suggested interest "${d.interest}"`;
    case 'website_toggled': return `${d.selected ? 'Picked' : 'Unpicked'} ${d.site}`;
    case 'websites_submitted': return `Submitted familiar websites (${d.toggle_count} clicks, ${duration(d.decision_ms)})`;
    case 'tray_bunch_opened': return `Opened bunch ${d.bunch + 1} on tray ${d.tray + 1}`;
    case 'tray_fortunes_selected': return `Picked ${d.selected_count} fortune(s) from tray ${d.tray + 1} in ${duration(d.decision_ms)}`;
    case 'demo_fortune_sorted': return `Demo: sorted a fortune into ${d.tray} in ${duration(d.decision_ms)}`;
    case 'rules_help_opened': return `Popped a balloon to re-read the rules (${d.uses_left} left)`;
    case 'fortune_revealed': return `Revealed "${clip(d.fortune, 50)}"`;
    case 'fortune_sorted': {
      const verdict = d.correct === true ? 'correct' : d.correct === false ? 'WRONG' : 'unchecked';
      return `Sorted "${clip(d.fortune, 50)}" into ${d.tray} - ${verdict} - ${duration(d.decision_ms)}`;
    }
    case 'fortune_timed_out': return `Ran out of time on "${clip(d.fortune, 50)}"`;
    case 'sorting_round_complete': return `Finished sorting: ${d.correct} right, ${d.wrong} wrong, ${d.timed_out} timed out`;
    case 'marking_intro_skipped': return 'Skipped the marking instructions';
    case 'fortune_marked': return `Marked "${d.marked_text}"`;
    case 'fortune_mark_removed': return 'Removed a mark';
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

module.exports = { describe, sectionName, prettyName, duration };
