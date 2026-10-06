# Personalization Profile – browser extension

A Chrome/Edge (Manifest V3) extension that sits in a person's browser for 2–3 weeks and
records **raw** browsing data, together with a few profile details (employee ID, designation,
age, region). Any game or app can use the data for personalisation.

The extension does not interpret the data. It has no categories, rankings, scoring or
game-specific rules. Each consumer applies its own logic to the export.

## Install (unpacked)

1. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
2. Click **Load unpacked** and pick this `browser-extension/` folder.
3. A setup tab opens. The person reads what is collected, agrees, and fills in their details.
   Recording starts at that moment.

## What it records

Per **host** (e.g. `docs.github.com`; the leading `www.` is dropped), per local calendar day:

| Field | Meaning |
|---|---|
| `visits` | Times the host was opened in a tab. Moving around inside the same host is one visit until a 30-minute gap. |
| `activeSeconds` | Sampled once a minute: the host in the focused tab while the person is active (or the tab plays audio). |

It never records full URLs, paths, query strings, titles or page content.
It never runs in Incognito, and it skips non-web pages, `localhost`, IP addresses and intranet names.
Everything stays in `chrome.storage.local`. Nothing is sent anywhere.
The person can pause, remove any host (which also blocks it and its subdomains), or delete everything
from the dashboard. Uninstalling deletes all of it.

## Timeline

Settings are in `shared/config.js`.

- **Day 1–13**: `collecting`
- **Day 14–21**: `ready`. There is enough data to use, and recording continues.
- **After day 21**: `complete`. Recording stops by itself.

The toolbar badge shows `!` (not set up), `II` (paused) or `✓` (ready/complete).

## Export format

Dashboard → **Export data (.json)**:

```json
{
  "schema": "personalization-profile.browsing",
  "version": 1,
  "exportedAt": "2026-10-28T09:00:00.000Z",
  "profile": { "employeeId": "975211", "designation": "Data Engineer", "age": "18-30 years", "region": "India" },
  "collection": { "status": "complete", "day": 21, "minDays": 14, "maxDays": 21, "startedAt": "2026-10-07T08:12:00.000Z", "paused": false },
  "sites": [
    {
      "host": "github.com",
      "domain": "github.com",
      "firstSeen": "2026-10-07T08:30:11.000Z",
      "lastSeen": "2026-10-27T17:02:45.000Z",
      "totals": { "visits": 41, "activeSeconds": 22800, "daysActive": 12 },
      "daily": {
        "2026-10-07": { "visits": 3, "activeSeconds": 1200 },
        "2026-10-08": { "visits": 5, "activeSeconds": 2400 }
      }
    }
  ]
}
```

- `daily` is the raw data. `totals` simply sums it, for convenience.
- `domain` is the registrable domain (`gist.github.com` → `github.com`, `news.bbc.co.uk` → `bbc.co.uk`),
  so consumers can group subdomains if they want to.
- Consumers should check `schema` and `version` before reading.

## Tests

```
npm --prefix browser-extension test
```
