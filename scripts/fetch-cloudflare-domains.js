// Fetches the most popular domains in every country from Cloudflare Radar, with the
// content categories Cloudflare puts each domain in, and saves them for the game in
// src/data/countryDomains.json. The player details form then offers each player the
// categories of their own country's top domains ("which do you use most?").
//
//   CLOUDFLARE_API_TOKEN=<token> node scripts/fetch-cloudflare-domains.js
//
// The token needs Cloudflare's free "Radar: Read" permission (Cloudflare dashboard ->
// My Profile -> API Tokens -> Create Token -> Custom token -> Account / Radar / Read).
// Countries Radar has no ranking for are left out; the game falls back to the
// worldwide list for those. Run it again any time to refresh the data.
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const API = 'https://api.cloudflare.com/client/v4/radar/ranking/top';
const LIMIT = 100;      // top domains per country
const PARALLEL = 4;     // requests at a time (Radar allows plenty; this stays polite)
const OUT = path.join(__dirname, '..', 'src', 'data', 'countryDomains.json');
const COUNTRIES_FILE = path.join(__dirname, '..', 'src', 'data', 'countries.js');

if (!TOKEN) {
  console.error('Set CLOUDFLARE_API_TOKEN first (a token with Radar: Read permission). See the top of this file.');
  process.exit(1);
}

// The country codes, read straight out of src/data/countries.js
const codes = [...fs.readFileSync(COUNTRIES_FILE, 'utf8').matchAll(/code: '([A-Z]{2})'/g)].map(m => m[1]);

const wait = (ms) => new Promise(r => setTimeout(r, ms));

// One ranking list: [{ d: domain, c: [category names] }] in rank order, or null if
// Radar has none for this location
async function topDomains(location) {
  const url = `${API}?limit=${LIMIT}&format=json&name=top${location ? `&location=${location}` : ''}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (res.status === 429 || res.status >= 500) { await wait(2000 * (attempt + 1)); continue; }
    const body = await res.json().catch(() => null);
    if (!res.ok || !body || !body.success) {
      const why = body && body.errors && body.errors.length ? body.errors.map(e => e.message).join('; ') : `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403) throw new Error(`Cloudflare refused the token: ${why}`);
      return null; // e.g. no ranking for this location
    }
    const list = body.result.top || Object.values(body.result).find(Array.isArray) || [];
    return list
      .sort((a, b) => a.rank - b.rank)
      .map(row => ({ d: row.domain, c: (row.categories || []).map(cat => cat.name) }));
  }
  return null;
}

(async () => {
  const data = {
    source: 'Cloudflare Radar - top domains by location (api.cloudflare.com/client/v4/radar/ranking/top)',
    fetchedAt: new Date().toISOString(),
    limit: LIMIT,
    global: await topDomains(null),
    countries: {},
  };
  console.log(`worldwide: ${data.global ? data.global.length : 0} domains`);

  let next = 0;
  let missing = 0;
  const worker = async () => {
    while (next < codes.length) {
      const code = codes[next++];
      const list = await topDomains(code);
      if (list && list.length) data.countries[code] = list;
      else missing++;
      process.stdout.write(`\r${Object.keys(data.countries).length + missing}/${codes.length} countries`);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));

  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log(`\nSaved ${Object.keys(data.countries).length} countries (${missing} without a Radar ranking) to ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => { console.error(`\n${e.message}`); process.exit(1); });
