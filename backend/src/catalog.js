// The catalogue of every analytics event the game sends - the API contract between
// the game (client) and this backend. Incoming events are checked against it; types
// that aren't listed are still stored, but counted as unknown in the ingest response.
//
// Every event is wrapped in the same envelope (added by the game client, src/analytics/index.js):
//   event_id     unique id of this event
//   type         one of the keys below
//   ts           ISO timestamp (client clock)
//   t_ms         ms since this session started
//   seq          running number within the session (detects gaps / ordering)
//   player_id    anonymous id, persisted in this browser across sessions
//   session_id   one per page load
//   context      { section, screen, phase } at the moment of the event
//   data         the event-specific fields described below
//
// `use` says what each event is for: insight (understand behaviour), difficulty
// (tune the game), personalization (adapt the game to this player).

const EVENT_CATALOG = {
  /* ---------- Session & app ---------- */
  session_start: {
    use: 'insight',
    fields: ['viewport', 'screen', 'device_pixel_ratio', 'user_agent', 'language', 'timezone', 'reduced_motion', 'sound_muted', 'referrer', 'game_flow', 'returning_player', 'sessions_before'],
  },
  session_end: { use: 'insight', fields: ['duration_ms', 'active_ms', 'events_sent', 'last_screen', 'reason'] },
  app_hidden: { use: 'insight', fields: ['screen'] },
  app_visible: { use: 'insight', fields: ['screen', 'hidden_ms'] },
  client_error: { use: 'insight', fields: ['message', 'source', 'line'] },
  player_identified: { use: 'personalization', fields: ['traits'] },

  /* ---------- Navigation & time on screen ---------- */
  section_start: { use: 'insight', fields: ['section', 'index'] },
  section_complete: { use: 'difficulty', fields: ['section', 'duration_ms'] },
  screen_view: { use: 'insight', fields: ['screen', 'previous_screen', 'meta'] },
  screen_exit: {
    use: 'difficulty',
    fields: ['screen', 'duration_ms', 'active_ms', 'hidden_ms', 'idle_ms', 'clicks', 'next_screen'],
  },
  nav_back: { use: 'difficulty', fields: ['from', 'to'] },
  nav_jump: { use: 'difficulty', fields: ['from', 'to', 'reason'] },
  ui_click: { use: 'insight', fields: ['label', 'element', 'classes', 'analytics_id'] },
  field_change: { use: 'insight', fields: ['field', 'kind', 'value'] },
  sound_toggled: { use: 'personalization', fields: ['muted'] },

  /* ---------- Onboarding ---------- */
  opening_start_pressed: { use: 'insight', fields: ['time_on_title_ms', 'via'] },
  player_clock_in: { use: 'personalization', fields: ['employee_id', 'designation', 'designation_is_custom', 'decision_ms'] },
  application_submitted: {
    use: 'personalization',
    fields: ['age_group', 'region', 'interests', 'interest_count', 'custom_interests', 'suggestions_added', 'decision_ms'],
  },
  interest_suggestion_added: { use: 'personalization', fields: ['interest', 'from_picks'] },
  website_toggled: { use: 'personalization', fields: ['category', 'site', 'selected', 'position', 'picked_in_category'] },
  websites_submitted: { use: 'personalization', fields: ['selected', 'offered', 'toggle_count', 'decision_ms'] },

  /* ---------- Training ---------- */
  tray_bunch_opened: { use: 'insight', fields: ['tray', 'bunch', 'bunches_opened'] },
  tray_fortunes_selected: { use: 'difficulty', fields: ['tray', 'bunch', 'selected', 'selected_count', 'decision_ms'] },
  demo_fortune_sorted: { use: 'difficulty', fields: ['tray', 'fortune', 'attempt', 'decision_ms'] },

  /* ---------- Levels: sorting ---------- */
  rules_help_opened: { use: 'difficulty', fields: ['level', 'balloon', 'uses_left'] },
  fortune_revealed: { use: 'difficulty', fields: ['level', 'dome', 'fortune', 'is_phishy'] },
  fortune_sorted: {
    use: 'difficulty',
    fields: ['level', 'dome', 'fortune', 'is_phishy', 'tray', 'correct', 'decision_ms', 'time_left_s'],
  },
  fortune_timed_out: { use: 'difficulty', fields: ['level', 'dome', 'fortune', 'is_phishy', 'reason'] },
  sorting_round_complete: {
    use: 'difficulty',
    fields: ['level', 'faulty', 'approved', 'correct', 'wrong', 'timed_out', 'help_used'],
  },
  marking_intro_skipped: { use: 'insight', fields: ['level'] },

  /* ---------- Levels: marking & inspection ---------- */
  fortune_marked: { use: 'difficulty', fields: ['index', 'fortune', 'marked_text', 'replaced', 'time_into_marking_ms'] },
  fortune_mark_removed: { use: 'difficulty', fields: ['index', 'fortune', 'removed_text'] },
  marking_submitted: {
    use: 'difficulty',
    fields: ['items', 'marked_count', 'item_count', 'auto_submitted', 'time_left_s', 'decision_ms'],
  },
  inspection_revealed: { use: 'difficulty', fields: ['index', 'fortune', 'marked_text', 'invalid_part', 'tier', 'points'] },
  inspection_complete: { use: 'difficulty', fields: ['total_points', 'tiers'] },
  sorting_scored: { use: 'difficulty', fields: ['total_points', 'tiers'] },
  level_complete: { use: 'personalization', fields: ['batch', 'sorted', 'total', 'incentive'] },
  level_replay: { use: 'difficulty', fields: ['batch'] },

  /* ---------- Supervisor ---------- */
  supervisor_decision: { use: 'personalization', fields: ['row', 'fortune', 'original', 'choice'] },
  supervisor_revoke_reason: { use: 'personalization', fields: ['row', 'fortune', 'reason'] },
  supervisor_checklist_submitted: { use: 'personalization', fields: ['decisions', 'revoke_reasons', 'decision_ms'] },
};

module.exports = { EVENT_CATALOG };
