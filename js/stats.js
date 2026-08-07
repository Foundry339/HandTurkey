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

function renderStats() {
  document.getElementById("stat-most-wins").innerHTML = topGuestsHTML(COMEDIANS, (c) => c.wins);
  document.getElementById("stat-most-losses").innerHTML = topGuestsHTML(COMEDIANS, (c) => c.losses);
  document.getElementById("stat-most-appearances").innerHTML = topGuestsHTML(
    COMEDIANS,
    (c) => c.wins + c.losses
  );
}

loadSiteData()
  .then(renderStats)
  .catch((err) => {
    console.error(err);
    ["stat-most-wins", "stat-most-losses", "stat-most-appearances"].forEach((id) => {
      document.getElementById(id).innerHTML = '<li class="no-results">Couldn\'t load data.</li>';
    });
  });
