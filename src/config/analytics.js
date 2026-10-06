// Player analytics settings (client: src/analytics/index.js).
//
// Events are sent to the analytics backend - a separate project in backend/ (start it
// with `npm start` inside backend/, or `npm run backend` from here). Its address is
// set when the game is built:
//   REACT_APP_ANALYTICS_API=https://analytics.example.com npm run build
// and defaults to the local backend below. If the backend can't be reached, events
// wait in the browser and are re-sent once it's back - nothing is lost.
export const ANALYTICS = {
  enabled: true,
  apiUrl: (process.env.REACT_APP_ANALYTICS_API || 'http://localhost:4318').replace(/\/+$/, ''),

  batchSize: 20,          // send once this many events are queued...
  flushIntervalMs: 5000,  // ...or this often, whichever comes first
  idleAfterMs: 30000,     // no input for this long = idle (excluded from "active time")
  maxStoredEvents: 5000,  // most unsent events kept in the browser while the backend is down
  debug: false,           // log every event to the console as it's tracked
};

// The results are viewed in the separate Analytics dashboard (analytics-dashboard/),
// not in the game.
