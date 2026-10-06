// All settings come from environment variables (see .env.example), so the same code
// runs locally and when deployed.
const path = require('path');

// Minimal .env loader (no dependency): KEY=value lines, # comments
function loadDotEnv() {
  const fs = require('fs');
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return;
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}
loadDotEnv();

const env = process.env;

module.exports = {
  port: Number(env.PORT || 4318),
  host: env.HOST || '0.0.0.0',
  dbPath: env.DB_PATH || path.join(__dirname, '..', 'data', 'analytics.sqlite'),

  // Origins allowed to call the API from a browser, comma separated ("*" = any)
  corsOrigins: (env.CORS_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean),

  // If set, reading data (dashboard, exports) and deleting it require this token
  // ("Authorization: Bearer <token>" or ?token=<token>). Sending events never does,
  // since every player's game has to be able to send.
  adminToken: env.ADMIN_TOKEN || '',

  maxBodyBytes: Number(env.MAX_BODY_BYTES || 1024 * 1024),
  maxEventsPerBatch: Number(env.MAX_EVENTS_PER_BATCH || 500),
};
