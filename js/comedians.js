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

const GUESTS_PER_PAGE = 25;
let guestPage = 1;

function renderComedianGrid(comedians) {
  const grid = document.getElementById("comedian-grid");
  const paginationEl = document.getElementById("comedian-pagination");
  const sorted = [...comedians].sort((a, b) => a.name.localeCompare(b.name));

  if (!sorted.length) {
    grid.innerHTML = '<p class="no-results">No guests match your search.</p>';
    paginationEl.innerHTML = "";
    return;
  }

  const { items, page, totalPages } = paginate(sorted, guestPage, GUESTS_PER_PAGE);
  guestPage = page;
  grid.innerHTML = items.map(comedianCardHTML).join("");
  paginationEl.innerHTML = paginationControlsHTML(page, totalPages);
}

function filterComedians(query) {
  const q = query.trim().toLowerCase();
  if (!q) return COMEDIANS;
  return COMEDIANS.filter((c) => c.name.toLowerCase().includes(q));
}

function initComedianSearch() {
  const input = document.getElementById("comedian-search");
  input.addEventListener("input", () => {
    guestPage = 1;
    renderComedianGrid(filterComedians(input.value));
  });
}

function initComedianPagination() {
  document.getElementById("comedian-pagination").addEventListener("click", (event) => {
    const btn = event.target.closest(".pagination-btn");
    if (!btn || btn.disabled) return;
    guestPage = Number(btn.dataset.page);
    renderComedianGrid(filterComedians(document.getElementById("comedian-search").value));
  });
}

function renderComedians() {
  renderComedianGrid(COMEDIANS);
  initComedianSearch();
  initComedianPagination();
}

loadSiteData()
  .then(renderComedians)
  .catch((err) => {
    console.error(err);
    document.getElementById("comedian-grid").innerHTML =
      '<p class="no-results">Couldn\'t load comedian data. Check the CSV URLs in data/data.js.</p>';
  });
