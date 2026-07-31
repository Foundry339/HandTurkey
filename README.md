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

`data/data.js` fetches live from two Google Sheets tabs (Comedians + Episodes), each published to the web as CSV:

1. Build out your sheet with columns matching `data/comedians_template.csv` and `data/episodes_template.csv` (the loader is tolerant of a few common header variants, e.g. `date` or `episode_date`, `youtube_url` or `URL`).
2. In Google Sheets: File → Share → Publish to web → pick the tab → CSV → Publish. Do this for both the Comedians and Episodes tabs.
3. Paste the two published CSV links into `COMEDIANS_CSV_URL` and `EPISODES_CSV_URL` at the top of `data/data.js`.
4. `id` values must match between an episode's `contestant_*`/`winner_id` and a comedian's `id`.
5. From then on, adding a row to either sheet tab updates the live site — no code changes needed.

## Running locally

Browsers block `fetch()` on files opened directly (`file://`), so serve the folder instead:

```
npx serve .
```

then open the printed `http://localhost:...` URL.
