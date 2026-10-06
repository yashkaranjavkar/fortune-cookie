// SQLite storage, using the SQLite engine built into Node (node:sqlite) - one file on
// disk, nothing to install or run separately.
//
// Tables:
//   events    every event exactly as the game sent it (raw history; event_id is the key,
//             so a batch sent twice is stored once)
//   sessions  one row per play session (when it started/ended, where it got to)
//   players   one row per player, with their running profile as JSON
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { EVENT_CATALOG } = require('./catalog');
const { emptyProfile, applyEvent, derive } = require('./profiles');

function open(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;

    CREATE TABLE IF NOT EXISTS events (
      event_id    TEXT PRIMARY KEY,
      player_id   TEXT NOT NULL,
      session_id  TEXT NOT NULL,
      seq         INTEGER,
      type        TEXT NOT NULL,
      ts          TEXT NOT NULL,
      t_ms        INTEGER,
      section     TEXT,
      screen      TEXT,
      phase       TEXT,
      data        TEXT NOT NULL,      -- JSON
      known_type  INTEGER NOT NULL,   -- 1 if listed in the event catalogue
      received_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_player  ON events (player_id, ts);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events (session_id, seq);
    CREATE INDEX IF NOT EXISTS idx_events_type    ON events (type, ts);

    CREATE TABLE IF NOT EXISTS sessions (
      session_id   TEXT PRIMARY KEY,
      player_id    TEXT NOT NULL,
      started_at   TEXT NOT NULL,
      ended_at     TEXT NOT NULL,
      event_count  INTEGER NOT NULL DEFAULT 0,
      duration_ms  INTEGER,             -- from session_end, when the game reported one
      last_section TEXT,
      last_screen  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_player ON sessions (player_id, started_at);

    CREATE TABLE IF NOT EXISTS players (
      player_id   TEXT PRIMARY KEY,
      first_seen  TEXT,
      last_seen   TEXT,
      employee_id TEXT,
      designation TEXT,
      profile     TEXT NOT NULL,        -- JSON (see profiles.js)
      updated_at  TEXT NOT NULL
    );
  `);
  return new Store(db);
}

const parseEvent = (row) => ({
  event_id: row.event_id,
  type: row.type,
  ts: row.ts,
  t_ms: row.t_ms,
  seq: row.seq,
  player_id: row.player_id,
  session_id: row.session_id,
  context: { section: row.section, screen: row.screen, phase: row.phase },
  data: JSON.parse(row.data),
  received_at: row.received_at,
});

class Store {
  constructor(db) {
    this.db = db;
    this.stmt = {
      insertEvent: db.prepare(`
        INSERT OR IGNORE INTO events
          (event_id, player_id, session_id, seq, type, ts, t_ms, section, screen, phase, data, known_type, received_at)
        VALUES
          ($event_id, $player_id, $session_id, $seq, $type, $ts, $t_ms, $section, $screen, $phase, $data, $known_type, $received_at)`),
      upsertSession: db.prepare(`
        INSERT INTO sessions (session_id, player_id, started_at, ended_at, event_count, duration_ms, last_section, last_screen)
        VALUES ($session_id, $player_id, $ts, $ts, 1, $duration_ms, $section, $screen)
        ON CONFLICT (session_id) DO UPDATE SET
          started_at   = MIN(started_at, excluded.started_at),
          ended_at     = MAX(ended_at, excluded.ended_at),
          event_count  = event_count + 1,
          duration_ms  = COALESCE(excluded.duration_ms, duration_ms),
          last_section = CASE WHEN excluded.ended_at >= ended_at THEN COALESCE(excluded.last_section, last_section) ELSE last_section END,
          last_screen  = CASE WHEN excluded.ended_at >= ended_at THEN COALESCE(excluded.last_screen, last_screen) ELSE last_screen END`),
      getProfile: db.prepare('SELECT profile FROM players WHERE player_id = ?'),
      savePlayer: db.prepare(`
        INSERT INTO players (player_id, first_seen, last_seen, employee_id, designation, profile, updated_at)
        VALUES ($player_id, $first_seen, $last_seen, $employee_id, $designation, $profile, $updated_at)
        ON CONFLICT (player_id) DO UPDATE SET
          first_seen = excluded.first_seen, last_seen = excluded.last_seen,
          employee_id = excluded.employee_id, designation = excluded.designation,
          profile = excluded.profile, updated_at = excluded.updated_at`),
    };
  }

  // Stores a batch of events and updates the affected sessions + player profiles,
  // all in one transaction. Returns what was accepted.
  ingest(events) {
    const result = { accepted: 0, duplicates: 0, rejected: [], unknown_types: {} };
    const touched = new Map(); // player_id -> profile
    const now = new Date().toISOString();

    this.db.exec('BEGIN');
    try {
      events.forEach((ev, i) => {
        const problem = validate(ev);
        if (problem) { result.rejected.push({ index: i, event_id: ev && ev.event_id, reason: problem }); return; }

        const known = Boolean(EVENT_CATALOG[ev.type]);
        if (!known) result.unknown_types[ev.type] = (result.unknown_types[ev.type] || 0) + 1;
        const ctx = ev.context || {};
        const inserted = this.stmt.insertEvent.run({
          $event_id: ev.event_id,
          $player_id: ev.player_id,
          $session_id: ev.session_id,
          $seq: Number.isFinite(ev.seq) ? ev.seq : null,
          $type: ev.type,
          $ts: ev.ts,
          $t_ms: Number.isFinite(ev.t_ms) ? ev.t_ms : null,
          $section: ctx.section || null,
          $screen: ctx.screen || null,
          $phase: ctx.phase || null,
          $data: JSON.stringify(ev.data || {}),
          $known_type: known ? 1 : 0,
          $received_at: now,
        });
        if (inserted.changes === 0) { result.duplicates += 1; return; }
        result.accepted += 1;

        this.stmt.upsertSession.run({
          $session_id: ev.session_id,
          $player_id: ev.player_id,
          $ts: ev.ts,
          $duration_ms: ev.type === 'session_end' && ev.data ? ev.data.duration_ms || null : null,
          $section: ctx.section || null,
          $screen: ctx.screen || null,
        });

        let profile = touched.get(ev.player_id);
        if (!profile) {
          const row = this.stmt.getProfile.get(ev.player_id);
          profile = row ? JSON.parse(row.profile) : emptyProfile(ev.player_id);
          touched.set(ev.player_id, profile);
        }
        applyEvent(profile, { ...ev, context: ctx, data: ev.data || {} });
      });

      touched.forEach(profile => {
        derive(profile);
        this.stmt.savePlayer.run({
          $player_id: profile.player_id,
          $first_seen: profile.first_seen,
          $last_seen: profile.last_seen,
          $employee_id: profile.traits.employee_id || null,
          $designation: profile.traits.designation || null,
          $profile: JSON.stringify(profile),
          $updated_at: now,
        });
      });
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
    return result;
  }

  listEvents({ playerId, sessionId, type, since, until, limit = 1000, offset = 0, order = 'asc' } = {}) {
    const where = [];
    const params = {};
    if (playerId) { where.push('player_id = $player_id'); params.$player_id = playerId; }
    if (sessionId) { where.push('session_id = $session_id'); params.$session_id = sessionId; }
    if (type) { where.push('type = $type'); params.$type = type; }
    if (since) { where.push('ts >= $since'); params.$since = since; }
    if (until) { where.push('ts <= $until'); params.$until = until; }
    const dir = order === 'desc' ? 'DESC' : 'ASC';
    const sql = `SELECT * FROM events ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY ts ${dir}, seq ${dir} LIMIT $limit OFFSET $offset`;
    params.$limit = Math.min(Math.max(1, Number(limit) || 1000), 50000);
    params.$offset = Math.max(0, Number(offset) || 0);
    return this.db.prepare(sql).all(params).map(parseEvent);
  }

  countEvents() {
    return this.db.prepare('SELECT COUNT(*) AS n FROM events').get().n;
  }

  listPlayers() {
    return this.db.prepare('SELECT profile FROM players ORDER BY last_seen DESC').all().map(r => JSON.parse(r.profile));
  }

  getPlayer(playerId) {
    const row = this.stmt.getProfile.get(playerId);
    return row ? JSON.parse(row.profile) : null;
  }

  listSessions({ playerId } = {}) {
    return playerId
      ? this.db.prepare('SELECT * FROM sessions WHERE player_id = ? ORDER BY started_at DESC').all(playerId)
      : this.db.prepare('SELECT * FROM sessions ORDER BY started_at DESC').all();
  }

  summary() {
    const one = (sql) => this.db.prepare(sql).get().n;
    return {
      events: one('SELECT COUNT(*) AS n FROM events'),
      players: one('SELECT COUNT(*) AS n FROM players'),
      sessions: one('SELECT COUNT(*) AS n FROM sessions'),
      unknown_type_events: one('SELECT COUNT(*) AS n FROM events WHERE known_type = 0'),
      first_event: this.db.prepare('SELECT MIN(ts) AS t FROM events').get().t,
      last_event: this.db.prepare('SELECT MAX(ts) AS t FROM events').get().t,
      by_type: Object.fromEntries(
        this.db.prepare('SELECT type, COUNT(*) AS n FROM events GROUP BY type ORDER BY n DESC').all().map(r => [r.type, r.n])
      ),
    };
  }

  deletePlayer(playerId) {
    this.db.exec('BEGIN');
    try {
      const n = this.db.prepare('DELETE FROM events WHERE player_id = ?').run(playerId).changes;
      this.db.prepare('DELETE FROM sessions WHERE player_id = ?').run(playerId);
      this.db.prepare('DELETE FROM players WHERE player_id = ?').run(playerId);
      this.db.exec('COMMIT');
      return n;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  deleteAll() {
    this.db.exec('DELETE FROM events; DELETE FROM sessions; DELETE FROM players;');
  }

  close() {
    this.db.close();
  }
}

// Minimal envelope check - an event must at least say what it is, who sent it and when
function validate(ev) {
  if (!ev || typeof ev !== 'object') return 'not an object';
  for (const key of ['event_id', 'type', 'player_id', 'session_id', 'ts']) {
    if (typeof ev[key] !== 'string' || !ev[key]) return `missing "${key}"`;
  }
  if (ev.event_id.length > 100 || ev.type.length > 100) return 'id/type too long';
  if (Number.isNaN(Date.parse(ev.ts))) return 'invalid "ts"';
  return null;
}

module.exports = { open };
