// Dummy analytics backend over HTTP - no dependencies, just Node.
//
//   npm run analytics-server        (listens on http://localhost:4318)
//
// Then set transport: 'http' in src/config/analytics.js. Endpoints:
//   POST /v1/events           ingest a batch { sent_at, player_id, session_id, events: [...] }
//   GET  /v1/events           stored events  (?type= &session_id= &player_id= &limit=)
//   GET  /v1/sessions         one row per session
//   GET  /v1/summary          counts by event type, players, sessions
//   GET  /v1/health           liveness check
//
// Events are appended to analytics-server/data/events.ndjson (one JSON event per line),
// which is easy to load into any real pipeline later.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.ANALYTICS_PORT || 4318);
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'events.ndjson');

fs.mkdirSync(DATA_DIR, { recursive: true });

function readEvents() {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  return fs.readFileSync(EVENTS_FILE, 'utf8').split('\n').filter(Boolean).map(line => {
    try { return JSON.parse(line); } catch (e) { return null; }
  }).filter(Boolean);
}

const seenIds = new Set(readEvents().slice(-5000).map(e => e.event_id));

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  });
  res.end(JSON.stringify(body, null, 2));
}

function ingest(payload) {
  const lines = [];
  let accepted = 0;
  let duplicates = 0;
  (payload.events || []).forEach(ev => {
    if (!ev || !ev.event_id || !ev.type) return;
    if (seenIds.has(ev.event_id)) { duplicates += 1; return; }
    seenIds.add(ev.event_id);
    lines.push(JSON.stringify({ ...ev, received_at: new Date().toISOString() }));
    accepted += 1;
  });
  if (lines.length) fs.appendFileSync(EVENTS_FILE, lines.join('\n') + '\n');
  return { accepted, duplicates };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === 'OPTIONS') return sendJson(res, 204, {});

  if (req.method === 'POST' && url.pathname === '/v1/events') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 5e6) req.destroy(); });
    req.on('end', () => {
      try {
        const result = ingest(JSON.parse(body));
        console.log(`[analytics] +${result.accepted} events (${result.duplicates} dup)`);
        sendJson(res, 200, { status: 'ok', ...result });
      } catch (e) {
        sendJson(res, 400, { status: 'error', message: 'invalid JSON' });
      }
    });
    return undefined;
  }

  if (req.method === 'GET' && url.pathname === '/v1/events') {
    const q = Object.fromEntries(url.searchParams);
    let events = readEvents().filter(e =>
      (!q.type || e.type === q.type)
      && (!q.session_id || e.session_id === q.session_id)
      && (!q.player_id || e.player_id === q.player_id));
    if (q.limit) events = events.slice(-Number(q.limit));
    return sendJson(res, 200, events);
  }

  if (req.method === 'GET' && url.pathname === '/v1/sessions') {
    const sessions = {};
    readEvents().forEach(e => {
      const s = sessions[e.session_id] || (sessions[e.session_id] = {
        session_id: e.session_id, player_id: e.player_id, started: e.ts, ended: e.ts, events: 0, last_screen: null,
      });
      s.ended = e.ts;
      s.events += 1;
      if (e.context && e.context.screen) s.last_screen = e.context.screen;
    });
    return sendJson(res, 200, Object.values(sessions));
  }

  if (req.method === 'GET' && url.pathname === '/v1/summary') {
    const events = readEvents();
    const byType = {};
    events.forEach(e => { byType[e.type] = (byType[e.type] || 0) + 1; });
    return sendJson(res, 200, {
      events: events.length,
      players: new Set(events.map(e => e.player_id)).size,
      sessions: new Set(events.map(e => e.session_id)).size,
      by_type: byType,
    });
  }

  if (url.pathname === '/v1/health') return sendJson(res, 200, { status: 'ok' });
  return sendJson(res, 404, { status: 'not found' });
});

server.listen(PORT, () => {
  console.log(`Fortunery dummy analytics backend on http://localhost:${PORT}`);
  console.log(`Storing events in ${EVENTS_FILE}`);
});
