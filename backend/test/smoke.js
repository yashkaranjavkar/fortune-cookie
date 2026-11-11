// End-to-end check of the API against an in-memory database:  npm test
const assert = require('assert');
const { open } = require('../src/db');
const { createServer } = require('../src/server');

const TOKEN = 'test-token';
const cfg = { corsOrigins: ['*'], adminToken: TOKEN, maxBodyBytes: 1024 * 1024, maxEventsPerBatch: 500 };

function event(seq, type, data, extra = {}) {
  return {
    event_id: `ev-${seq}`, type, ts: new Date(Date.UTC(2026, 9, 6, 10, 0, seq)).toISOString(), t_ms: seq * 1000, seq,
    player_id: 'player-1', session_id: 'session-1', context: { section: 'level1', screen: 'game', phase: 'section' }, data, ...extra,
  };
}

(async () => {
  const store = open(':memory:');
  const server = createServer(store, cfg);
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}/api/v1`;
  const admin = { Authorization: `Bearer ${TOKEN}` };
  const get = async (path, headers = admin) => {
    const res = await fetch(base + path, { headers });
    return { status: res.status, body: res.headers.get('content-type').includes('json') ? await res.json() : await res.text() };
  };

  const batch = [
    event(1, 'session_start', { language: 'en', returning_player: false }),
    event(2, 'player_clock_in', { employee_id: '975211', designation: 'Engineer' }),
    event(3, 'player_identified', { traits: { employee_id: '975211', designation: 'Engineer' } }),
    event(4, 'fortune_sorted', { level: 'level1', tray: 'faulty', is_phishy: true, correct: true, decision_ms: 3000, fortune: 'a, "quoted" fortune' }),
    event(5, 'fortune_sorted', { level: 'level1', tray: 'approved', is_phishy: true, correct: false, decision_ms: 5000 }),
    event(6, 'made_up_type', {}),
    { type: 'broken' },
  ];

  // Ingest (no token needed) - text/plain like the game's sendBeacon
  let res = await fetch(`${base}/events`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ events: batch }) });
  let body = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(body.accepted, 6);
  assert.strictEqual(body.rejected.length, 1);
  assert.deepStrictEqual(body.unknown_types, { made_up_type: 1 });

  // Same batch again: all duplicates
  res = await fetch(`${base}/events`, { method: 'POST', body: JSON.stringify({ events: batch.slice(0, 6) }) });
  body = await res.json();
  assert.strictEqual(body.accepted, 0);
  assert.strictEqual(body.duplicates, 6);

  // Reading needs the token
  assert.strictEqual((await get('/players', {})).status, 401);

  const players = (await get('/players')).body;
  assert.strictEqual(players.length, 1);
  assert.strictEqual(players[0].traits.employee_id, '975211');
  assert.strictEqual(players[0].derived.sort_accuracy, 0.5);

  const events = (await get('/players/player-1/events?type=fortune_sorted')).body;
  assert.strictEqual(events.length, 2);
  assert.ok(events[0].description.startsWith('Sorted'));

  const sessions = (await get('/players/player-1/sessions')).body;
  assert.strictEqual(sessions[0].event_count, 6);

  const summary = (await get('/summary')).body;
  assert.strictEqual(summary.events, 6);
  assert.strictEqual(summary.unknown_type_events, 1);

  const insights = (await get('/insights')).body;
  assert.strictEqual(insights.overview.players, 1);
  assert.strictEqual(insights.sorting.overall.sorted, 2);
  assert.strictEqual(insights.sorting.overall.accuracy, 0.5);
  assert.strictEqual((await get('/insights?designation=Nobody')).body.overview.players, 0);
  assert.strictEqual((await get('/insights', {})).status, 401);

  const csv = (await get('/export/events.csv')).body;
  assert.ok(csv.includes('"a, ""quoted"" fortune"'), 'CSV escapes commas and quotes');
  const playersCsv = (await get(`/export/players.csv?token=${TOKEN}`, {})).body;
  assert.ok(playersCsv.includes('975211'));

  // The fortunes a player was dealt, joined with their answers
  const fortune = (text, url, type, textType, urlType, verdict) => ({ text, url, domain: 'x.com', type, text_type: textType, url_type: urlType, verdict, attack: urlType === 'suspicious' ? 'tld_swap' : null, familiar: true });
  const planBatch = [
    event(10, 'fortune_plan_built', {
      part: 'part1', interests: ['Society & Lifestyle'], familiar_domains: ['x.com'],
      pretest: [[['f-a', 'f-b']]], posttest: [[['f-c']]], level: ['f-d'], shortfalls: [],
      fortunes: {
        'f-a': fortune('Wit on x.net', 'x.net', 'sus_related', 'related', 'suspicious', 'faulty'),
        'f-b': fortune('Share on x.com', 'x.com', 'legit_related', 'related', 'legitimate', 'valid'),
        'f-c': fortune('Bake x.com', 'x.com', 'legit_unrelated', 'unrelated', 'legitimate', 'faulty'),
        'f-d': fortune('Avoid x-login.com', 'x-login.com', 'sus_warned', 'warning', 'suspicious', 'valid'),
      },
    }),
    event(11, 'tray_fortunes_selected', { test: 'pretest', shown: [{ id: 'f-a' }, { id: 'f-b' }], selected_ids: ['f-a', 'f-b'], decision_ms: 9000 }),
    event(12, 'fortune_sorted', { level: 'level2', fortune_id: 'f-d', tray: 'approved', correct: true, decision_ms: 2000 }),
    event(13, 'tray_test_complete', { test: 'pretest', answered: 2, correct: 1, accuracy: 0.5 }),
  ];
  await fetch(`${base}/events`, { method: 'POST', body: JSON.stringify({ events: planBatch }) });
  const dealt = (await get('/players/player-1/fortunes')).body;
  assert.strictEqual(dealt.parts.length, 1);
  const [pre, level, post] = dealt.parts[0].stages;
  assert.deepStrictEqual(pre.fortunes.map(r => [r.fortune_id, r.answer, r.correct]), [['f-a', 'faulty', true], ['f-b', 'faulty', false]]);
  assert.strictEqual(pre.tally.verdict.faulty, 1);
  assert.strictEqual(level.fortunes[0].answer, 'valid');
  assert.strictEqual(level.fortunes[0].text_type, 'warning');
  assert.strictEqual(post.fortunes[0].answer, null);
  assert.strictEqual(dealt.parts[0].test_results.pretest.accuracy, 0.5);
  assert.strictEqual((await get('/players/nobody/fortunes')).status, 404);
  const fortunesCsv = (await get('/export/fortunes.csv?player_id=player-1')).body;
  assert.ok(fortunesCsv.includes('Avoid x-login.com') && fortunesCsv.split('\r\n').length === 5, 'one CSV row per fortune dealt');

  assert.strictEqual((await fetch(`${base}/data`, { method: 'DELETE', headers: admin })).status, 400);
  assert.strictEqual((await fetch(`${base}/data?confirm=yes`, { method: 'DELETE', headers: admin })).status, 200);
  assert.strictEqual((await get('/summary')).body.events, 0);

  server.close();
  store.close();
  console.log('All API checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
