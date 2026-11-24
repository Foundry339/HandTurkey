const MIN_APPEARANCES_FOR_WIN_PCT = 3;
const MIN_MATCHUPS_FOR_RIVALRY = 2;
const MIN_WINS_FOR_MOST_WINS = 2;
const MIN_LOSSES_FOR_MOST_LOSSES = 4;
const MIN_APPEARANCES_FOR_MOST_APPEARANCES = 4;

function statRowHTML(rank, comedian, value) {
  return `
    <li class="stat-row">
      <a class="stat-row-link" href="guest.html?id=${comedian.id}">
        <span class="stat-rank">${rank}</span>
        ${avatarHTML(comedian, "", "avatar-sm")}
        <span class="stat-name">${comedian.name}</span>
        <span class="stat-value">${value}</span>
      </a>
    </li>
  `;
}

function topGuestsHTML(guests, getValue) {
  const ranked = [...guests].sort(
    (a, b) => getValue(b) - getValue(a) || a.name.localeCompare(b.name)
  );

  if (!ranked.length) return '<li class="no-results">No data yet.</li>';
  return ranked.map((c, i) => statRowHTML(i + 1, c, getValue(c))).join("");
}

function topWinPercentageHTML(guests) {
  const eligible = guests.filter((c) => c.wins + c.losses >= MIN_APPEARANCES_FOR_WIN_PCT);
  const winPct = (c) => c.wins / (c.wins + c.losses);
  const ranked = eligible.sort(
    (a, b) => winPct(b) - winPct(a) || a.name.localeCompare(b.name)
  );

  if (!ranked.length) return '<li class="no-results">Not enough data yet.</li>';
  return ranked.map((c, i) => statRowHTML(i + 1, c, `${Math.round(winPct(c) * 100)}%`)).join("");
}

function hostRecordHTML(hosts) {
  if (!hosts.length) return '<li class="no-results">No hosts detected yet.</li>';
  return hosts
    .map(
      (c) => `
        <li class="stat-row">
          <a class="stat-row-link" href="guest.html?id=${c.id}">
            ${avatarHTML(c, "", "avatar-sm")}
            <span class="stat-name">${c.name}</span>
            <span class="stat-value">${c.wins}-${c.losses}</span>
          </a>
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
      <a class="rivalry-guest" href="guest.html?id=${rivalry.guestA.id}">
        ${avatarHTML(rivalry.guestA, "", "avatar-sm")}
        <span class="stat-name">${rivalry.guestA.name}</span>
      </a>
      <span class="rivalry-vs">VS</span>
      <a class="rivalry-guest" href="guest.html?id=${rivalry.guestB.id}">
        ${avatarHTML(rivalry.guestB, "", "avatar-sm")}
        <span class="stat-name">${rivalry.guestB.name}</span>
      </a>
    </div>
    <p class="rivalry-count">Faced off ${rivalry.count} times</p>
  `;
}

// Scores aren't tracked in the sheets, so these records are set by hand.
const LOWEST_SCORE_RECORD = { guestId: "big-jay-oakerson", points: 0 };
const HIGHEST_REGULATION_SCORE_RECORD = { guestId: "dru-montana", points: 26 };

function scoreRecordHTML(record) {
  const guest = getComedian(record.guestId);
  if (!guest) return '<p class="no-results">No data yet.</p>';
  return `
    <a class="record-display" href="guest.html?id=${guest.id}">
      ${avatarHTML(guest, "", "avatar-sm")}
      <span class="stat-name">${guest.name}</span>
    </a>
    <p class="record-score"><span class="record-score-value">${record.points}</span> points</p>
  `;
}

function renderStats() {
  document.getElementById("stat-total-episodes").textContent = EPISODES.length;
  document.getElementById("stat-total-guests").textContent = COMEDIANS.length;

  const hosts = detectHosts(EPISODES);
  const hostIds = new Set(hosts.map((c) => c.id));
  const nonHostComedians = COMEDIANS.filter((c) => !hostIds.has(c.id));

  document.getElementById("stat-most-wins").innerHTML = topGuestsHTML(
    nonHostComedians.filter((c) => c.wins >= MIN_WINS_FOR_MOST_WINS),
    (c) => c.wins
  );
  document.getElementById("stat-most-losses").innerHTML = topGuestsHTML(
    nonHostComedians.filter((c) => c.losses >= MIN_LOSSES_FOR_MOST_LOSSES),
    (c) => c.losses
  );
  document.getElementById("stat-most-appearances").innerHTML = topGuestsHTML(
    nonHostComedians.filter((c) => c.wins + c.losses >= MIN_APPEARANCES_FOR_MOST_APPEARANCES),
    (c) => c.wins + c.losses
  );
  document.getElementById("stat-win-percentage").innerHTML = topWinPercentageHTML(COMEDIANS);

  document.getElementById("stat-host-record").innerHTML = hostRecordHTML(hosts);
  document.getElementById("stat-biggest-rivalry").innerHTML = rivalryHTML(
    biggestRivalry(EPISODES, hostIds)
  );
  document.getElementById("stat-lowest-score").innerHTML = scoreRecordHTML(LOWEST_SCORE_RECORD);
  document.getElementById("stat-highest-regulation-score").innerHTML = scoreRecordHTML(
    HIGHEST_REGULATION_SCORE_RECORD
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
    ["stat-biggest-rivalry", "stat-lowest-score", "stat-highest-regulation-score"].forEach((id) => {
      document.getElementById(id).innerHTML = '<p class="no-results">Couldn\'t load data.</p>';
    });
  });
