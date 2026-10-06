// Fortunery analytics REST API - plain Node, no dependencies.
//
//   npm start            (or: node src/server.js)
//
// All routes live under /api/v1 - see README.md for the full list.
const http = require('http');
const crypto = require('crypto');
const config = require('./config');
const { open } = require('./db');
const { EVENT_CATALOG } = require('./catalog');
const { describe } = require('./describe');
const { eventsCsv, playersCsv } = require('./csv');
const { buildInsights } = require('./insights');

function createServer(store, cfg = config) {
  /* ---------------- helpers ---------------- */

  function corsHeaders(req) {
    const origin = req.headers.origin;
    let allow = null;
    if (cfg.corsOrigins.includes('*')) allow = '*';
    else if (origin && cfg.corsOrigins.includes(origin)) allow = origin;
    return allow ? {
      'Access-Control-Allow-Origin': allow,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    } : {};
  }

  function send(req, res, status, body, headers = {}) {
    const isText = typeof body === 'string';
    res.writeHead(status, {
      'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
      ...corsHeaders(req),
      ...headers,
    });
    res.end(isText ? body : JSON.stringify(body, null, 2));
  }

  function download(req, res, content, type, filename) {
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...corsHeaders(req),
    });
    res.end(content);
  }

  function isAdmin(req, url) {
    if (!cfg.adminToken) return true;
    const header = req.headers.authorization || '';
    const given = header.startsWith('Bearer ') ? header.slice(7) : url.searchParams.get('token') || '';
    const a = Buffer.from(given);
    const b = Buffer.from(cfg.adminToken);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > cfg.maxBodyBytes) {
          reject(Object.assign(new Error(`Body larger than ${cfg.maxBodyBytes} bytes`), { status: 413 }));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  const today = () => new Date().toISOString().slice(0, 10);
  const withDescription = (events) => events.map(e => ({ ...e, description: describe(e) }));
  const eventQuery = (q) => ({
    playerId: q.get('player_id') || undefined,
    sessionId: q.get('session_id') || undefined,
    type: q.get('type') || undefined,
    since: q.get('since') || undefined,
    until: q.get('until') || undefined,
    limit: q.get('limit') || undefined,
    offset: q.get('offset') || undefined,
    order: q.get('order') || undefined,
  });

  /* ---------------- routes ---------------- */
  // [method, path pattern, admin only?, handler(req, res, url, params)]
  const routes = [
    ['GET', '/api/v1/health', false, (req, res) => send(req, res, 200, { status: 'ok', time: new Date().toISOString() })],

    ['GET', '/api/v1', false, (req, res) => send(req, res, 200, {
      name: 'Fortunery analytics API',
      version: 1,
      auth: cfg.adminToken ? 'Reading/deleting needs "Authorization: Bearer <token>" or ?token=' : 'open (no ADMIN_TOKEN set)',
      endpoints: routes.map(r => `${r[0]} ${r[1]}${r[2] ? '  (admin)' : ''}`),
    })],

    ['GET', '/api/v1/catalog', false, (req, res) => send(req, res, 200, EVENT_CATALOG)],

    // The game sends its events here, in batches
    ['POST', '/api/v1/events', false, async (req, res) => {
      let payload;
      try {
        payload = JSON.parse(await readBody(req));
      } catch (e) {
        send(req, res, e.status || 400, { error: e.status ? e.message : 'Body must be JSON' });
        return;
      }
      const events = Array.isArray(payload) ? payload : payload && payload.events;
      if (!Array.isArray(events)) { send(req, res, 400, { error: 'Expected { "events": [...] }' }); return; }
      if (events.length > cfg.maxEventsPerBatch) {
        send(req, res, 413, { error: `At most ${cfg.maxEventsPerBatch} events per request` });
        return;
      }
      const result = store.ingest(events);
      send(req, res, 200, { status: 'ok', ...result });
    }],

    ['GET', '/api/v1/events', true, (req, res, url) => {
      send(req, res, 200, withDescription(store.listEvents(eventQuery(url.searchParams))));
    }],

    ['GET', '/api/v1/players', true, (req, res) => send(req, res, 200, store.listPlayers())],

    ['GET', '/api/v1/players/:id', true, (req, res, url, p) => {
      const profile = store.getPlayer(p.id);
      if (!profile) send(req, res, 404, { error: 'No such player' });
      else send(req, res, 200, profile);
    }],

    ['GET', '/api/v1/players/:id/events', true, (req, res, url, p) => {
      send(req, res, 200, withDescription(store.listEvents({ ...eventQuery(url.searchParams), playerId: p.id })));
    }],

    ['GET', '/api/v1/players/:id/sessions', true, (req, res, url, p) => {
      send(req, res, 200, store.listSessions({ playerId: p.id }));
    }],

    ['DELETE', '/api/v1/players/:id', true, (req, res, url, p) => {
      send(req, res, 200, { status: 'ok', deleted_events: store.deletePlayer(p.id) });
    }],

    ['GET', '/api/v1/sessions', true, (req, res, url) => {
      send(req, res, 200, store.listSessions({ playerId: url.searchParams.get('player_id') || undefined }));
    }],

    ['GET', '/api/v1/summary', true, (req, res) => send(req, res, 200, store.summary())],

    // Aggregate report across all players (what the Analytics dashboard shows).
    // Optional filters: ?since=YYYY-MM-DD&until=YYYY-MM-DD&designation=...&region=...
    ['GET', '/api/v1/insights', true, (req, res, url) => {
      const q = url.searchParams;
      send(req, res, 200, buildInsights(store.db, {
        since: q.get('since') || undefined,
        until: q.get('until') || undefined,
        designation: q.get('designation') || undefined,
        region: q.get('region') || undefined,
      }));
    }],

    ['GET', '/api/v1/export/events.csv', true, (req, res, url) => {
      const events = store.listEvents({ ...eventQuery(url.searchParams), limit: url.searchParams.get('limit') || 50000 });
      download(req, res, eventsCsv(events), 'text/csv; charset=utf-8', `fortunery-activity-${today()}.csv`);
    }],

    ['GET', '/api/v1/export/players.csv', true, (req, res) => {
      download(req, res, playersCsv(store.listPlayers()), 'text/csv; charset=utf-8', `fortunery-players-${today()}.csv`);
    }],

    ['GET', '/api/v1/export/all.json', true, (req, res) => {
      const body = {
        exported_at: new Date().toISOString(),
        summary: store.summary(),
        players: store.listPlayers(),
        sessions: store.listSessions(),
        events: store.listEvents({ limit: 50000 }),
      };
      download(req, res, JSON.stringify(body, null, 2), 'application/json; charset=utf-8', `fortunery-analytics-${today()}.json`);
    }],

    // Wipes everything - needs ?confirm=yes so it can't happen by accident
    ['DELETE', '/api/v1/data', true, (req, res, url) => {
      if (url.searchParams.get('confirm') !== 'yes') {
        send(req, res, 400, { error: 'Add ?confirm=yes to delete all analytics data' });
        return;
      }
      store.deleteAll();
      send(req, res, 200, { status: 'ok', deleted: 'all' });
    }],
  ];

  // "/api/v1/players/:id" -> regex with a named group
  const compiled = routes.map(([method, pattern, admin, handler]) => ({
    method,
    admin,
    handler,
    regex: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}/?$`),
  }));

  return http.createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url, 'http://localhost');
    res.on('finish', () => {
      if (url.pathname !== '/api/v1/health') {
        console.log(`${new Date().toISOString()} ${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
      }
    });

    if (req.method === 'OPTIONS') {
      res.writeHead(204, corsHeaders(req));
      res.end();
      return;
    }

    const pathMatches = compiled.filter(r => r.regex.test(url.pathname));
    if (!pathMatches.length) { send(req, res, 404, { error: 'Not found - see GET /api/v1 for the list of endpoints' }); return; }
    const route = pathMatches.find(r => r.method === req.method);
    if (!route) { send(req, res, 405, { error: `Method ${req.method} not allowed here` }); return; }
    if (route.admin && !isAdmin(req, url)) { send(req, res, 401, { error: 'Admin token required' }); return; }

    try {
      const params = Object.fromEntries(
        Object.entries(url.pathname.match(route.regex).groups || {}).map(([k, v]) => [k, decodeURIComponent(v)])
      );
      await route.handler(req, res, url, params);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) send(req, res, 500, { error: 'Internal error' });
    }
  });
}

module.exports = { createServer };

// Started directly (npm start) rather than required by a test
if (require.main === module) {
  const store = open(config.dbPath);
  const server = createServer(store);
  server.listen(config.port, config.host, () => {
    console.log(`Fortunery analytics API listening on http://localhost:${config.port}/api/v1`);
    console.log(`Database: ${config.dbPath}`);
    console.log(`Admin token: ${config.adminToken ? 'required for reading data' : 'NOT set - anyone can read the data'}`);
    console.log(`CORS origins: ${config.corsOrigins.join(', ')}`);
  });
  const shutdown = () => {
    server.close(() => { store.close(); process.exit(0); });
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
