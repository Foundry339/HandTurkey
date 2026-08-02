/*
  LIVE DATA LOADER
  ----------------
  Fetches COMEDIANS and EPISODES from your published Google Sheets CSVs.
  Paste the two "Publish to web" CSV links below, then serve the site
  over http:// (browsers block fetch() on file:// pages) — e.g. `npx serve .`.
*/

const COMEDIANS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6teP_DRbakj2-DrVRtF1iUtcakbJcrX20IkbAiz6uCin5qiRukmDpP5PD4UFzaUrpIMHbGwp6mlmK/pub?gid=1221586162&single=true&output=csv";
const EPISODES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6teP_DRbakj2-DrVRtF1iUtcakbJcrX20IkbAiz6uCin5qiRukmDpP5PD4UFzaUrpIMHbGwp6mlmK/pub?gid=0&single=true&output=csv";

let COMEDIANS = [];
let EPISODES = [];

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift().map((h) => h.trim());
  return rows
    .filter((r) => r.some((cell) => cell.trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] || "").trim();
      });
      return obj;
    });
}

function rowToComedian(row) {
  return {
    id: row.id,
    name: row.name,
    instagram: row.instagram || "",
    wins: Number(row.wins) || 0,
    losses: Number(row.losses) || 0,
    photoUrl: row.photo_url || row.photoUrl || "",
  };
}

function rowToEpisode(row) {
  const contestantIds = Object.keys(row)
    .filter((key) => /contestant_\d+/i.test(key))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))
    .map((key) => row[key])
    .filter(Boolean);

  return {
    id: Number(row.episode_id),
    title: row.episode_title || row.episode_name || "",
    date: row.date || row.episode_date || "",
    youtubeUrl: row.youtube_url || row.URL || row.url || "",
    contestantIds,
    winnerId: row.winner_id,
  };
}

async function fetchCSV(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return parseCSV(await response.text());
}

async function loadSiteData() {
  COMEDIANS = (await fetchCSV(COMEDIANS_CSV_URL)).map(rowToComedian);
  const knownIds = new Set(COMEDIANS.map((c) => c.id));

  EPISODES = (await fetchCSV(EPISODES_CSV_URL)).map(rowToEpisode).filter((ep) => {
    const unknownIds = [...ep.contestantIds, ep.winnerId].filter((id) => !knownIds.has(id));
    if (unknownIds.length) {
      console.warn(
        `Skipping episode ${ep.id} ("${ep.title}") — unknown guest id(s): ${unknownIds.join(", ")}. ` +
          `Check spelling against the "id" column in the Guests sheet.`
      );
      return false;
    }
    return true;
  });
}
