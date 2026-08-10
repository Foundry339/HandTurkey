const HOST_APPEARANCE_THRESHOLD = 0.9;
const MIN_APPEARANCES_FOR_WIN_PCT = 3;
const MIN_MATCHUPS_FOR_RIVALRY = 2;

function statRowHTML(rank, comedian, value) {
  return `
    <li class="stat-row">
      <span class="stat-rank">${rank}</span>
      ${avatarHTML(comedian, "", "avatar-sm")}
      <span class="stat-name">${comedian.name}</span>
      <span class="stat-value">${value}</span>
    </li>
  `;
}

function topGuestsHTML(guests, getValue) {
  const ranked = [...guests]
    .sort((a, b) => getValue(b) - getValue(a) || a.name.localeCompare(b.name))
    .slice(0, 5);

  if (!ranked.length) return '<li class="no-results">No data yet.</li>';
  return ranked.map((c, i) => statRowHTML(i + 1, c, getValue(c))).join("");
}

function topWinPercentageHTML(guests) {
  const eligible = guests.filter((c) => c.wins + c.losses >= MIN_APPEARANCES_FOR_WIN_PCT);
  const winPct = (c) => c.wins / (c.wins + c.losses);
  const ranked = eligible
    .sort((a, b) => winPct(b) - winPct(a) || a.name.localeCompare(b.name))
    .slice(0, 5);

  if (!ranked.length) return '<li class="no-results">Not enough data yet.</li>';
  return ranked.map((c, i) => statRowHTML(i + 1, c, `${Math.round(winPct(c) * 100)}%`)).join("");
}

// Hosts are inferred as whoever appears in nearly every tracked episode,
// rather than hardcoded, so the site keeps working if the show's hosts change.
function detectHosts(episodes) {
  if (!episodes.length) return [];
  const appearances = {};
  episodes.forEach((ep) => {
    ep.contestantIds.forEach((id) => {
      appearances[id] = (appearances[id] || 0) + 1;
    });
  });
  return COMEDIANS.filter((c) => (appearances[c.id] || 0) / episodes.length >= HOST_APPEARANCE_THRESHOLD).sort(
    (a, b) => (appearances[b.id] || 0) - (appearances[a.id] || 0)
  );
}

function hostRecordHTML(hosts) {
  if (!hosts.length) return '<li class="no-results">No hosts detected yet.</li>';
  return hosts
    .map(
      (c) => `
        <li class="stat-row">
          ${avatarHTML(c, "", "avatar-sm")}
          <span class="stat-name">${c.name}</span>
          <span class="stat-value">${c.wins}-${c.losses}</span>
        </li>
      `
    )
    .join("");
}

// Counts how often each pair of non-host guests has shared an episode,
// to surface the pairing that's faced off the most.
function biggestRivalry(episodes, hostIds) {
  const counts = {};
  episodes.forEach((ep) => {
    const ids = ep.contestantIds.filter((id) => !hostIds.has(id));
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join("|");
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  });

  let bestKey = null;
  let bestCount = 0;
  Object.entries(counts).forEach(([key, count]) => {
    if (count > bestCount) {
      bestCount = count;
      bestKey = key;
    }
  });

  if (!bestKey || bestCount < MIN_MATCHUPS_FOR_RIVALRY) return null;
  const [idA, idB] = bestKey.split("|");
  return { guestA: getComedian(idA), guestB: getComedian(idB), count: bestCount };
}

function rivalryHTML(rivalry) {
  if (!rivalry) return '<p class="no-results">No repeat matchups yet.</p>';
  return `
    <div class="rivalry-display">
      <div class="rivalry-guest">
        ${avatarHTML(rivalry.guestA, "", "avatar-sm")}
        <span class="stat-name">${rivalry.guestA.name}</span>
      </div>
      <span class="rivalry-vs">VS</span>
      <div class="rivalry-guest">
        ${avatarHTML(rivalry.guestB, "", "avatar-sm")}
        <span class="stat-name">${rivalry.guestB.name}</span>
      </div>
    </div>
    <p class="rivalry-count">Faced off ${rivalry.count} times</p>
  `;
}

function renderStats() {
  document.getElementById("stat-total-episodes").textContent = EPISODES.length;
  document.getElementById("stat-total-guests").textContent = COMEDIANS.length;

  const hosts = detectHosts(EPISODES);
  const hostIds = new Set(hosts.map((c) => c.id));
  const nonHostComedians = COMEDIANS.filter((c) => !hostIds.has(c.id));

  document.getElementById("stat-most-wins").innerHTML = topGuestsHTML(nonHostComedians, (c) => c.wins);
  document.getElementById("stat-most-losses").innerHTML = topGuestsHTML(nonHostComedians, (c) => c.losses);
  document.getElementById("stat-most-appearances").innerHTML = topGuestsHTML(
    nonHostComedians,
    (c) => c.wins + c.losses
  );
  document.getElementById("stat-win-percentage").innerHTML = topWinPercentageHTML(COMEDIANS);

  document.getElementById("stat-host-record").innerHTML = hostRecordHTML(hosts);
  document.getElementById("stat-biggest-rivalry").innerHTML = rivalryHTML(
    biggestRivalry(EPISODES, hostIds)
  );
}

loadSiteData()
  .then(renderStats)
  .catch((err) => {
    console.error(err);
    [
      "stat-most-wins",
      "stat-most-losses",
      "stat-most-appearances",
      "stat-win-percentage",
      "stat-host-record",
    ].forEach((id) => {
      document.getElementById(id).innerHTML = '<li class="no-results">Couldn\'t load data.</li>';
    });
    document.getElementById("stat-biggest-rivalry").innerHTML =
      '<p class="no-results">Couldn\'t load data.</p>';
  });
