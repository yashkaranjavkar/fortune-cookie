// The fortunes each player was dealt, and how they answered each one.
//
// Every time a part starts, the game sends one `fortune_plan_built` event: the fortune
// ids of its pre-test (Training trays), level round and post-test (Final trays), plus
// each fortune's text and types. The player's answers arrive afterwards:
//   tray_fortunes_selected  one bunch of a tray test - which fortunes they picked as faulty
//   fortune_sorted          one level dome - which tray they dropped it in
//   fortune_timed_out       one level dome left unsorted
// Here those are joined back onto the plan, one row per fortune dealt.

const STAGES = [
  { key: 'pretest', label: 'Pre-test (Training trays)' },
  { key: 'level', label: 'Level round' },
  { key: 'posttest', label: 'Post-test (Final trays)' },
];

const ANSWER_TYPES = ['fortune_plan_built', 'tray_fortunes_selected', 'fortune_sorted', 'fortune_timed_out', 'tray_test_complete', 'part_complete'];

function countUp(counts, key) {
  if (key === null || key === undefined) return;
  counts[key] = (counts[key] || 0) + 1;
}

// The plan's fortunes as rows - stage, where it sat, and what the fortune is
function planRows(data) {
  const info = data.fortunes || {};
  const rows = [];
  const add = (stage, id, place) => {
    const f = info[id] || {};
    rows.push({
      stage,
      ...place,
      fortune_id: id,
      text: f.text || null,
      url: f.url || null,
      domain: f.domain || null,
      type: f.type || null,
      text_type: f.text_type || null,
      url_type: f.url_type || null,
      verdict: f.verdict || null,
      attack: f.attack || null,
      familiar: f.familiar === undefined ? null : Boolean(f.familiar),
      answer: null,       // 'faulty' | 'valid' | 'timed out' - null until answered
      correct: null,
      decision_ms: null,
    });
  };
  ['pretest', 'posttest'].forEach((stage) => {
    (data[stage] || []).forEach((tray, t) => (tray || []).forEach((bunch, b) => (bunch || []).forEach((id) => add(stage, id, { tray: t + 1, bunch: b + 1, dome: null }))));
  });
  (data.level || []).forEach((id, i) => add('level', id, { tray: null, bunch: null, dome: i + 1 }));
  const order = STAGES.map(s => s.key);
  return rows.sort((x, y) => order.indexOf(x.stage) - order.indexOf(y.stage));
}

// Fills in the player's answers from the events that followed the plan
function applyAnswers(rows, events) {
  const find = (stage, id) => rows.find(r => r.stage === stage && r.fortune_id === id && r.answer === null)
    || rows.find(r => r.stage === stage && r.fortune_id === id);
  const results = {};
  events.forEach((ev) => {
    const d = ev.data || {};
    if (ev.type === 'tray_fortunes_selected' && (d.test === 'pretest' || d.test === 'posttest')) {
      const picked = new Set(d.selected_ids || []);
      (d.shown || []).forEach((s) => {
        const row = s && s.id && find(d.test, s.id);
        if (!row) return;
        row.answer = picked.has(s.id) ? 'faulty' : 'valid';
        row.correct = row.verdict ? row.answer === row.verdict : null;
        row.decision_ms = d.decision_ms ?? null; // time for the whole bunch
      });
    } else if (ev.type === 'fortune_sorted' && d.fortune_id) {
      const row = find('level', d.fortune_id);
      if (!row) return;
      row.answer = d.tray === 'faulty' ? 'faulty' : 'valid';
      row.correct = typeof d.correct === 'boolean' ? d.correct : (row.verdict ? row.answer === row.verdict : null);
      row.decision_ms = d.decision_ms ?? null;
    } else if (ev.type === 'fortune_timed_out' && d.fortune_id) {
      const row = find('level', d.fortune_id);
      if (!row || row.answer) return;
      row.answer = 'timed out';
      row.correct = false;
    } else if (ev.type === 'tray_test_complete' && d.test) {
      results[d.test] = { answered: d.answered, correct: d.correct, accuracy: d.accuracy };
    } else if (ev.type === 'part_complete') {
      results.part_complete = true;
    }
  });
  return results;
}

// Counts of a set of rows: how many of each type / text type / URL type / verdict /
// attack / website, and how many were answered and answered correctly
function tally(rows) {
  const out = { total: rows.length, answered: 0, correct: 0, accuracy: null, familiar: 0, type: {}, text_type: {}, url_type: {}, verdict: {}, attack: {}, domain: {} };
  rows.forEach((r) => {
    countUp(out.type, r.type);
    countUp(out.text_type, r.text_type);
    countUp(out.url_type, r.url_type);
    countUp(out.verdict, r.verdict);
    countUp(out.attack, r.attack);
    countUp(out.domain, r.domain);
    if (r.familiar) out.familiar += 1;
    if (r.answer !== null) out.answered += 1;
    if (r.correct === true) out.correct += 1;
  });
  out.accuracy = out.answered ? out.correct / out.answered : null;
  return out;
}

// Every part a player started, oldest first: { part, dealt_at, session_id, interests,
// familiar_domains, shortfalls, finished, test_results, stages: [{ key, label, tally,
// fortunes: [rows] }] }
function playerFortunes(store, playerId) {
  const events = store.listEvents({ playerId, limit: 50000 }).filter(e => ANSWER_TYPES.includes(e.type));
  const plans = [];
  events.forEach((ev) => {
    if (ev.type === 'fortune_plan_built') plans.push({ plan: ev, after: [] });
    else if (plans.length) plans[plans.length - 1].after.push(ev);
  });
  return plans.map(({ plan, after }) => {
    const d = plan.data || {};
    const rows = planRows(d);
    // answers only count from the same play session as the plan
    const results = applyAnswers(rows, after.filter(e => e.session_id === plan.session_id));
    return {
      part: d.part || null,
      dealt_at: plan.ts,
      session_id: plan.session_id,
      interests: d.interests || [],
      familiar_domains: d.familiar_domains || [],
      shortfalls: d.shortfalls || [],
      has_fortune_details: Boolean(d.fortunes),
      finished: Boolean(results.part_complete),
      test_results: { pretest: results.pretest || null, posttest: results.posttest || null },
      stages: STAGES.map(s => {
        const list = rows.filter(r => r.stage === s.key);
        return { key: s.key, label: s.label, tally: tally(list), fortunes: list };
      }),
    };
  });
}

// One row per fortune dealt, for every player (or one) - for the CSV export
function fortuneRows(store, { playerId } = {}) {
  const players = playerId ? [store.getPlayer(playerId)].filter(Boolean) : store.listPlayers();
  const out = [];
  players.forEach((p) => {
    playerFortunes(store, p.player_id).forEach((part, i) => {
      part.stages.forEach(stage => stage.fortunes.forEach((r) => {
        out.push({
          player_id: p.player_id,
          employee_id: p.traits.employee_id || null,
          designation: p.traits.designation || null,
          region: p.traits.region || null,
          interests: part.interests,
          part: part.part,
          play: i + 1,
          dealt_at: part.dealt_at,
          ...r,
        });
      }));
    });
  });
  return out;
}

module.exports = { playerFortunes, fortuneRows };
