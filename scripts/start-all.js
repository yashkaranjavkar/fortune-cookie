// `npm start` - runs everything the game needs, together, in one terminal:
//
//   backend     the analytics API          http://localhost:4318   (npm run backend)
//   dashboard   the analytics dashboard    http://localhost:4400   (npm run dashboard)
//   game        the game (dev server)      http://localhost:3000   (npm run start:game)
//
// Anything already running on its port (say, in another terminal) is used as it is,
// not started twice. Their output is shown here, each line tagged with where it's from.
// Ctrl + C stops all of them; so does closing the game's dev server.
const { spawn, execSync } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SERVICES = [
  { name: 'backend', port: 4318, path: '/api/v1/health', script: 'backend', color: 36 }, // cyan
  { name: 'dashboard', port: 4400, path: '/', script: 'dashboard', color: 35 },         // magenta
  { name: 'game', port: 3000, path: '/', script: 'start:game', color: 33 },             // yellow
];

const tag = (s) => `\x1b[${s.color}m[${s.name}]\x1b[0m`;
const children = [];
let stopping = false;

// Is this service already up? Asks it over HTTP on localhost (IPv4 or IPv6) - a port
// that's merely taken by something that doesn't answer doesn't count.
function isUp(s) {
  return new Promise((resolve) => {
    const req = http.get({ host: 'localhost', port: s.port, path: s.path, timeout: 1500 }, (res) => {
      res.resume();
      resolve(res.statusCode < 500);
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

function pipe(stream, s) {
  let rest = '';
  stream.on('data', (chunk) => {
    const lines = (rest + chunk.toString()).split(/\r?\n/);
    rest = lines.pop();
    lines.forEach((line) => process.stdout.write(`${tag(s)} ${line}\n`));
  });
}

function start(s) {
  const child = spawn(`npm run ${s.script}`, {
    cwd: ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  pipe(child.stdout, s);
  pipe(child.stderr, s);
  child.on('exit', (code) => {
    if (stopping) return;
    console.log(`${tag(s)} stopped${code ? ` (exit code ${code})` : ''}`);
    // without the game there's nothing to collect - stop the rest too
    if (s.name === 'game') stopAll();
  });
  children.push(child);
}

// Stops every process this script started (and everything they started in turn)
function stopAll() {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => {
    try {
      if (process.platform === 'win32') execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
      else process.kill(-child.pid, 'SIGTERM');
    } catch (e) { /* already gone */ }
  });
  process.exit(0);
}
process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

(async () => {
  for (const s of SERVICES) {
    if (await isUp(s)) console.log(`${tag(s)} already running on port ${s.port} - using that one`);
    else start(s);
  }
  console.log('\nGame       http://localhost:3000');
  console.log('Backend    http://localhost:4318/api/v1');
  console.log('Dashboard  http://localhost:4400   (updates by itself while open)');
  console.log('Ctrl + C stops everything started here.\n');
})();
