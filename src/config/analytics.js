// Player analytics settings (client: src/analytics/index.js).
//
// transport - where tracked events go:
//   'mock'    the in-browser dummy backend (src/analytics/mockBackend.js). Needs no
//             server: it stores events + per-player profiles in this browser's
//             localStorage. Inspect from the browser console with
//             `fortuneryAnalytics.summary()`, `.events()`, `.profile()`, `.exportJSON()`.
//   'http'    POSTs batches to `endpoint` - e.g. the dummy Node server in
//             analytics-server/ (`npm run analytics-server`), or a real backend later.
//   'console' just logs each batch.
export const ANALYTICS = {
  enabled: true,
  transport: 'mock',
  endpoint: 'http://localhost:4318/v1/events',

  batchSize: 20,          // send once this many events are queued...
  flushIntervalMs: 5000,  // ...or this often, whichever comes first
  idleAfterMs: 30000,     // no input for this long = idle (excluded from "active time")
  debug: false,           // log every event to the console as it's tracked

  // The Analytics page: open http://localhost:3000/#analytics (or the 📊 button)
  showDashboardButton: true, // small 📊 button in the game's top-right corner
};
