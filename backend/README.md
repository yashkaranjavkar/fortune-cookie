# Fortunery analytics backend

A small REST API that collects player analytics from the Fortunery game and stores them
in SQLite. It is its own project: deploy this folder on its own, separately from the game.

- **No dependencies.** Plain Node.js; the database is SQLite through Node's built-in
  `node:sqlite`, stored in a single file. Nothing to `npm install`.
- **Needs Node.js 22.13 or newer.**

## Run it locally

```bash
cd backend
npm start
```

The API is then at `http://localhost:4318/api/v1`. Open that address in a browser to
see every endpoint. The game (`npm start` in the main project) sends to this address by
default.

`npm test` runs an end-to-end check against a throwaway in-memory database.

## Settings

Set them as environment variables, or copy `.env.example` to `.env`:

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `4318` | Port to listen on |
| `DB_PATH` | `./data/analytics.sqlite` | Database file |
| `ADMIN_TOKEN` | *(empty)* | Password for reading and deleting data. **Set this when deployed** - without it anyone can read player data |
| `CORS_ORIGINS` | `*` | Websites allowed to call the API from a browser, comma separated. In production, set it to the game's address |
| `MAX_BODY_BYTES` | `1048576` | Largest request accepted |
| `MAX_EVENTS_PER_BATCH` | `500` | Most events per request |

## Endpoints

Sending events is open, since every player's game must be able to send. Everything
marked *admin* needs the `ADMIN_TOKEN`, as `Authorization: Bearer <token>` or
`?token=<token>` (handy for download links).

| Method | Path | |
|---|---|---|
| GET | `/api/v1` | List of endpoints |
| GET | `/api/v1/health` | Liveness check |
| GET | `/api/v1/catalog` | Every event type the game sends, and its fields |
| POST | `/api/v1/events` | Send a batch: `{ "events": [ ... ] }` |
| GET | `/api/v1/players` | *admin* - all player profiles |
| GET | `/api/v1/players/:id` | *admin* - one player's profile |
| GET | `/api/v1/players/:id/events` | *admin* - that player's events, each with a plain-English `description` |
| GET | `/api/v1/players/:id/sessions` | *admin* - that player's play sessions |
| DELETE | `/api/v1/players/:id` | *admin* - delete one player and all their data |
| GET | `/api/v1/events` | *admin* - events; filter with `player_id`, `session_id`, `type`, `since`, `until`, `limit`, `offset`, `order=desc` |
| GET | `/api/v1/sessions` | *admin* - all sessions (`?player_id=` to filter) |
| GET | `/api/v1/summary` | *admin* - totals and counts by event type |
| GET | `/api/v1/insights` | *admin* - aggregate report across all players (used by the Analytics dashboard, `../analytics-dashboard`). Filters: `since`, `until` (YYYY-MM-DD), `designation`, `region` |
| GET | `/api/v1/export/events.csv` | *admin* - activity, one row per event (same filters as `/events`) |
| GET | `/api/v1/export/players.csv` | *admin* - one row per player |
| GET | `/api/v1/export/all.json` | *admin* - everything |
| DELETE | `/api/v1/data?confirm=yes` | *admin* - delete all analytics data |

### Sending events

```http
POST /api/v1/events
Content-Type: application/json

{ "events": [ {
    "event_id": "7b0c...", "type": "fortune_sorted", "ts": "2026-10-06T10:02:51Z",
    "player_id": "a547...", "session_id": "2eb7...", "seq": 20, "t_ms": 51200,
    "context": { "section": "level1", "screen": "game", "phase": "section" },
    "data": { "tray": "faulty", "correct": true, "decision_ms": 4200 }
} ] }
```

The response says how many were `accepted`, which were `duplicates` (already stored -
sending the same batch twice is safe), which were `rejected` and why, and any
`unknown_types` (stored anyway, but not in the catalogue). `text/plain` bodies are
accepted too, which is how browsers send events while a tab is closing.

## Database

One SQLite file with three tables:

- `events`: every event as received, keyed by `event_id`.
- `sessions`: one row per play session (start, end, event count, last screen reached).
- `players`: one row per player with their running profile as JSON. The profile holds
  their answers, time per screen, sorting and marking stats, scores, and derived signals
  such as accuracy, pace and suggested difficulty (see `src/profiles.js`).

To back it up, copy the `.sqlite` file (plus `-wal` / `-shm` if present), or use
`GET /api/v1/export/all.json`. You can also open it with any SQLite tool.

## Deploy

**Docker:**

```bash
docker build -t fortunery-backend .
docker run -d -p 4318:4318 -v fortunery-data:/data \
  -e ADMIN_TOKEN=change-me -e CORS_ORIGINS=https://your-game-address \
  fortunery-backend
```

**Any Node host** (a VM, Render, Railway...): upload this folder, set the environment
variables, and run `npm start`. Keep `DB_PATH` on persistent storage. Some hosts wipe
the disk on every deploy unless you attach a volume.

Then build the game pointing at it:

```bash
REACT_APP_ANALYTICS_API=https://your-api-address npm run build
```
