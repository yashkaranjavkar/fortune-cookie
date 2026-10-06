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

  assert.strictEqual((await fetch(`${base}/data`, { method: 'DELETE', headers: admin })).status, 400);
  assert.strictEqual((await fetch(`${base}/data?confirm=yes`, { method: 'DELETE', headers: admin })).status, 200);
  assert.strictEqual((await get('/summary')).body.events, 0);

  server.close();
  store.close();
  console.log('All API checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
