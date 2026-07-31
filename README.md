# HandTurkey

Unofficial fan tracker for the *Story Warz* podcast. Static HTML/CSS/JS, no build step.

## Structure

- `index.html` — Episodes page (tile list, most recent first, expand for details)
- `comedians.html` — Comedians directory (every contestant + all-time record)
- `css/style.css` — Theme (black/grey/red/white, pulled from the show art)
- `data/data.js` — **All content lives here.** `COMEDIANS` and `EPISODES` arrays.
- `data/comedians_template.csv` / `data/episodes_template.csv` — Column layout to match when you export your real CSV.
- `js/common.js` — Shared helpers (avatar initials, Instagram icon/link, date formatting)
- `js/episodes.js` — Renders episode tiles, handles expand/collapse and the Reveal Winner button
- `js/comedians.js` — Renders the comedians grid

## Plugging in real data

Right now `data/data.js` has placeholder comedians and 5 placeholder episodes. When your CSV is ready:

1. Match the columns in `data/comedians_template.csv` and `data/episodes_template.csv`.
2. Convert each CSV row into an object in the `COMEDIANS` / `EPISODES` arrays in `data/data.js` (any spreadsheet-to-JSON tool, or ask Claude to do the conversion for you).
3. `id` values must match between an episode's `contestantIds`/`winnerId` and a comedian's `id`.
4. Everything else (tiles, records, reveal button, comedians grid) updates automatically — no HTML/CSS/JS changes needed.

If you'd rather the site fetch the CSV directly at runtime instead of hand-editing `data.js`, that's a small follow-up (needs a tiny local server since browsers block `fetch()` on local files) — just ask.

## Running locally

Open `index.html` directly in a browser, or serve the folder (e.g. `npx serve .`) if you later add CSV fetching.
