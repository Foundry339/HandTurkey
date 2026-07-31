function comedianCardHTML(c) {
  return `
    <div class="comedian-card">
      ${avatarHTML(c)}
      <p class="contestant-name">${c.name}</p>
      <p class="contestant-record">Record: <strong>${c.wins}-${c.losses}</strong></p>
      ${instagramLink(c.instagram)}
    </div>
  `;
}

function renderComedianGrid(comedians) {
  const grid = document.getElementById("comedian-grid");
  const sorted = [...comedians].sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = sorted.length
    ? sorted.map(comedianCardHTML).join("")
    : '<p class="no-results">No comedians match your search.</p>';
}

function filterComedians(query) {
  const q = query.trim().toLowerCase();
  if (!q) return COMEDIANS;
  return COMEDIANS.filter((c) => c.name.toLowerCase().includes(q));
}

function initComedianSearch() {
  const input = document.getElementById("comedian-search");
  input.addEventListener("input", () => {
    renderComedianGrid(filterComedians(input.value));
  });
}

function renderComedians() {
  renderComedianGrid(COMEDIANS);
  initComedianSearch();
}

loadSiteData()
  .then(renderComedians)
  .catch((err) => {
    console.error(err);
    document.getElementById("comedian-grid").innerHTML =
      '<p class="no-results">Couldn\'t load comedian data. Check the CSV URLs in data/data.js.</p>';
  });
