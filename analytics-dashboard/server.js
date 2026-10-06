// Serves the Analytics dashboard (the files in public/) - plain Node, no dependencies.
//
//   npm start                                   http://localhost:4400
//   ANALYTICS_API=https://api.example.com npm start
//
// The dashboard is only static files, so any static host works too (copy public/ and
// edit public/config.js). This server just adds the ANALYTICS_API setting.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 4400);
const HOST = process.env.HOST || '0.0.0.0';
const API = (process.env.ANALYTICS_API || '').replace(/\/+$/, '');
const ROOT = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405).end();
    return;
  }

  if (url.pathname === '/config.js' && API) {
    res.writeHead(200, { 'Content-Type': TYPES['.js'], 'Cache-Control': 'no-cache' });
    res.end(`window.FORTUNERY_ANALYTICS = { apiUrl: ${JSON.stringify(API)} };\n`);
    return;
  }

  const rel = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, body) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Fortunery Analytics dashboard: http://localhost:${PORT}`);
  console.log(`Reading from: ${API || 'the address in public/config.js'}`);
});
const shutdown = () => server.close(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
