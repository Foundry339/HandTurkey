function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function guestNotFoundHTML() {
  return `<p class="no-results">Guest not found. <a href="comedians.html">Back to all guests</a>.</p>`;
}

function statTileHTML(value, label) {
  return `
    <div class="summary-tile">
      <span class="summary-value">${value}</span>
      <span class="summary-label">${label}</span>
    </div>
  `;
}

function presenceTimelineHTML(comedian, episodes) {
  const sorted = [...episodes].sort((a, b) => a.id - b.id);
  const dots = sorted
    .map((ep) => {
      if (!ep.contestantIds.includes(comedian.id)) {
        return `<span class="presence-dot" title="Episode ${ep.id}: ${ep.title}"></span>`;
      }
      const isWin = ep.winnerId === comedian.id;
      const cls = isWin ? "presence-dot is-win" : "presence-dot is-loss";
      const title = `Episode ${ep.id}: ${ep.title} (${isWin ? "Won" : "Lost"})`;
      return `<span class="${cls}" title="${title}"></span>`;
    })
    .join("");
  return `<div class="presence-timeline">${dots}</div>`;
}

function themeTagsHTML(guestEpisodes) {
  const counts = {};
  guestEpisodes.forEach((ep) => {
    if (!ep.title) return;
    counts[ep.title] = (counts[ep.title] || 0) + 1;
  });
  const themes = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  if (!themes.length) return '<p class="no-results">No themes recorded yet.</p>';
  return themes.map((t) => `<span class="theme-tag">${t}</span>`).join("");
}

function renderGuestPage() {
  const container = document.getElementById("guest-content");
  const guestId = getQueryParam("id");
  const comedian = COMEDIANS.find((c) => c.id === guestId);

  if (!comedian) {
    container.innerHTML = guestNotFoundHTML();
    return;
  }

  document.title = `HandTurkey — ${comedian.name}`;

  const hosts = detectHosts(EPISODES);
  const isHost = hosts.some((h) => h.id === comedian.id);
  const guestEpisodes = EPISODES.filter((ep) => ep.contestantIds.includes(comedian.id)).sort(
    (a, b) => b.id - a.id
  );
  const total = comedian.wins + comedian.losses;
  const winPct = total ? Math.round((comedian.wins / total) * 100) : 0;

  container.innerHTML = `
    <div class="guest-header">
      ${avatarHTML(comedian, "", "guest-avatar")}
      <div>
        <h1 class="guest-name">${comedian.name}${isHost ? '<span class="host-badge">Host</span>' : ""}</h1>
        ${comedian.instagram ? instagramLink(comedian.instagram) : ""}
      </div>
    </div>

    <div class="stats-summary guest-stats">
      ${statTileHTML(comedian.wins, "Wins")}
      ${statTileHTML(comedian.losses, "Losses")}
      ${statTileHTML(total, "Appearances")}
      ${statTileHTML(winPct + "%", "Win Rate")}
    </div>

    <h2 class="section-title">Episode Presence</h2>
    ${presenceTimelineHTML(comedian, EPISODES)}

    <h2 class="section-title">Themes Played</h2>
    <div class="theme-tags">${themeTagsHTML(guestEpisodes)}</div>

    <h2 class="section-title">Episode History</h2>
    <div class="episode-list" id="guest-episode-list">
      ${guestEpisodes.map((ep) => episodeTileHTML(ep, comedian.id)).join("")}
    </div>
  `;

  initEpisodeTileInteractions(document.getElementById("guest-episode-list"));
}

loadSiteData()
  .then(renderGuestPage)
  .catch((err) => {
    console.error(err);
    document.getElementById("guest-content").innerHTML =
      '<p class="no-results">Couldn\'t load guest data. Check the CSV URLs in data/data.js.</p>';
  });
