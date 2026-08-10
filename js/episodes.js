const EPISODES_PER_PAGE = 10;
let episodePage = 1;
let episodeSortOrder = "newest";

function renderEpisodeList(episodes) {
  const list = document.getElementById("episode-list");
  const paginationEl = document.getElementById("episode-pagination");
  const sorted = [...episodes].sort((a, b) =>
    episodeSortOrder === "newest" ? b.id - a.id : a.id - b.id
  );

  if (!sorted.length) {
    list.innerHTML = '<p class="no-results">No episodes match your search.</p>';
    paginationEl.innerHTML = "";
    return;
  }

  const { items, page, totalPages } = paginate(sorted, episodePage, EPISODES_PER_PAGE);
  episodePage = page;
  list.innerHTML = items.map((ep) => episodeTileHTML(ep)).join("");
  paginationEl.innerHTML = paginationControlsHTML(page, totalPages);
}

function filterEpisodes(query) {
  const q = query.trim().toLowerCase();
  if (!q) return EPISODES;
  return EPISODES.filter(
    (ep) =>
      String(ep.id).includes(q) ||
      ep.title.toLowerCase().includes(q) ||
      ep.contestantIds.some((id) => getComedian(id)?.name.toLowerCase().includes(q))
  );
}

function initEpisodeSearch() {
  const input = document.getElementById("episode-search");
  input.addEventListener("input", () => {
    episodePage = 1;
    renderEpisodeList(filterEpisodes(input.value));
  });
}

function initEpisodeSort() {
  const select = document.getElementById("episode-sort");
  select.addEventListener("change", () => {
    episodeSortOrder = select.value;
    episodePage = 1;
    renderEpisodeList(filterEpisodes(document.getElementById("episode-search").value));
  });
}

function initEpisodePagination() {
  document.getElementById("episode-pagination").addEventListener("click", (event) => {
    const btn = event.target.closest(".pagination-btn");
    if (!btn || btn.disabled) return;
    episodePage = Number(btn.dataset.page);
    renderEpisodeList(filterEpisodes(document.getElementById("episode-search").value));
  });
}

function renderEpisodes() {
  const list = document.getElementById("episode-list");
  renderEpisodeList(EPISODES);
  initEpisodeSearch();
  initEpisodeSort();
  initEpisodePagination();
  initEpisodeTileInteractions(list);
}

loadSiteData()
  .then(renderEpisodes)
  .catch((err) => {
    console.error(err);
    document.getElementById("episode-list").innerHTML =
      '<p class="no-results">Couldn\'t load episode data. Check the CSV URLs in data/data.js.</p>';
  });
