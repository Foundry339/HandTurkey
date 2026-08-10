function comedianCardHTML(c) {
  return `
    <div class="comedian-card">
      <a class="comedian-card-link" href="guest.html?id=${c.id}">
        ${avatarHTML(c)}
        <p class="contestant-name">${c.name}</p>
        <p class="contestant-record">Record: <strong>${c.wins}-${c.losses}</strong></p>
      </a>
      ${instagramLink(c.instagram)}
    </div>
  `;
}

const GUESTS_PER_PAGE = 25;
let guestPage = 1;
let guestFilter = "all";

function matchesGuestFilter(c) {
  const total = c.wins + c.losses;
  if (guestFilter === "winners") return c.wins >= 1;
  if (guestFilter === "multi-winners") return c.wins >= 2;
  if (guestFilter === "one-appearance") return total === 1;
  return true;
}

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
  return COMEDIANS.filter(
    (c) => (!q || c.name.toLowerCase().includes(q)) && matchesGuestFilter(c)
  );
}

function initComedianSearch() {
  const input = document.getElementById("comedian-search");
  input.addEventListener("input", () => {
    guestPage = 1;
    renderComedianGrid(filterComedians(input.value));
  });
}

function initGuestFilterPills() {
  const container = document.getElementById("guest-filter-pills");
  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".filter-pill");
    if (!btn) return;
    guestFilter = btn.dataset.filter;
    container.querySelectorAll(".filter-pill").forEach((p) => p.classList.toggle("active", p === btn));
    guestPage = 1;
    renderComedianGrid(filterComedians(document.getElementById("comedian-search").value));
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
  initGuestFilterPills();
  initComedianPagination();
}

loadSiteData()
  .then(renderComedians)
  .catch((err) => {
    console.error(err);
    document.getElementById("comedian-grid").innerHTML =
      '<p class="no-results">Couldn\'t load comedian data. Check the CSV URLs in data/data.js.</p>';
  });
