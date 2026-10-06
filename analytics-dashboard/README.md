# Fortunery Analytics dashboard

A standalone web page with charts and tables that cover all players together:
- how many people play, and how far they get through the game;
- where they stop, and how long each screen takes;
- how well they spot phishing, and which fortunes trip them up most;
- scores and supervisor decisions;
- who the players are, by designation, region and device.

It is **separate from the game**. It only reads from the analytics backend
(`../backend`) over its REST API, through `GET /api/v1/insights` and the export
endpoints, so it can live on a different server from both the game and the backend.

```
  game  ──POST events──▶  backend (API + SQLite)  ◀──GET insights──  this dashboard
```

## Run it locally

You need Node.js 18 or newer. There is nothing to install.

```bash
# 1. the backend must be running (in ../backend)
npm start

# 2. then, in this folder
npm start            # → http://localhost:4400
```

From the game's root folder, you can run `npm run dashboard` instead.

## Settings

| Setting         | Default                 | What it does                            |
|-----------------|-------------------------|-----------------------------------------|
| `ANALYTICS_API` | `http://localhost:4318` | Address of the analytics backend        |
| `PORT`          | `4400`                  | Port the dashboard is served on         |

Other ways to change the backend address:
- Edit `public/config.js` when you host the files yourself.
- Add `?api=https://...` to the dashboard's address.

## Access

If the backend was started with an `ADMIN_TOKEN`, the dashboard asks for the token
once. It then keeps the token in that browser until someone presses **Sign out**.
Without the token, the dashboard shows no data.

## Filters

- **Period**: last 7, 30 or 90 days, or all time.
- **Designation** and **Region**: taken from what players entered in the game.

Every figure on the page follows the filters.

## Deploy

The dashboard is only static files, so you can use either option:

- **Any static host** (Netlify, S3, nginx, GitHub Pages and so on): upload the
  `public/` folder after setting `apiUrl` in `public/config.js`.
- **Docker**:
  ```bash
  docker build -t fortunery-dashboard .
  docker run -p 4400:4400 -e ANALYTICS_API=https://analytics-api.example.com fortunery-dashboard
  ```

The backend must accept requests from the dashboard's address. Leave `CORS_ORIGINS`
as `*`, or add the dashboard's address to it.
