function contestantCardHTML(comedianId, isWinnerRevealed) {
  const c = getComedian(comedianId);
  const winnerClass = isWinnerRevealed ? " is-winner" : "";
  const badge = isWinnerRevealed
    ? '<span class="winner-badge" title="Winner">&#127942;</span>'
    : "";
  return `
    <div class="contestant-card${winnerClass}" data-comedian="${c.id}">
      ${avatarHTML(c, badge)}
      <p class="contestant-name">${c.name}</p>
      <p class="contestant-record">Record: <strong>${c.wins}-${c.losses}</strong></p>
      ${instagramLink(c.instagram)}
    </div>
  `;
}

function episodeTileHTML(ep) {
  const contestantsHTML = ep.contestantIds
    .map((id) => contestantCardHTML(id, false))
    .join("");

  return `
    <article class="episode-tile" data-episode="${ep.id}">
      <button class="episode-toggle" aria-expanded="false">
        <span class="episode-toggle-left">
          <span class="episode-number">Episode ${ep.id}</span>
          <span class="episode-title">${ep.title}</span>
          <span class="episode-date">${formatDate(ep.date)}</span>
        </span>
        <span class="episode-chevron">&#9660;</span>
      </button>
      <div class="episode-body">
        <div class="episode-body-inner">
          <div class="episode-body-content">
            <div class="contestant-grid">${contestantsHTML}</div>
            <div class="episode-actions">
              <a class="btn btn-outline" href="${ep.youtubeUrl}" target="_blank" rel="noopener">
                &#9654; Watch on YouTube
              </a>
              <button class="btn btn-reveal" data-winner="${ep.winnerId}">Reveal Winner</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

const EPISODES_PER_PAGE = 10;
let episodePage = 1;

function renderEpisodeList(episodes) {
  const list = document.getElementById("episode-list");
  const paginationEl = document.getElementById("episode-pagination");
  const sorted = [...episodes].sort((a, b) => b.id - a.id);

  if (!sorted.length) {
    list.innerHTML = '<p class="no-results">No episodes match your search.</p>';
    paginationEl.innerHTML = "";
    return;
  }

  const { items, page, totalPages } = paginate(sorted, episodePage, EPISODES_PER_PAGE);
  episodePage = page;
  list.innerHTML = items.map(episodeTileHTML).join("");
  paginationEl.innerHTML = paginationControlsHTML(page, totalPages);
}

function filterEpisodes(query) {
  const q = query.trim().toLowerCase();
  if (!q) return EPISODES;
  return EPISODES.filter(
    (ep) => String(ep.id).includes(q) || ep.title.toLowerCase().includes(q)
  );
}

function initEpisodeSearch() {
  const input = document.getElementById("episode-search");
  input.addEventListener("input", () => {
    episodePage = 1;
    renderEpisodeList(filterEpisodes(input.value));
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
  initEpisodePagination();

  list.addEventListener("click", (event) => {
    const toggle = event.target.closest(".episode-toggle");
    if (toggle) {
      const tile = toggle.closest(".episode-tile");
      const isOpen = tile.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      return;
    }

    const revealBtn = event.target.closest(".btn-reveal");
    if (revealBtn) {
      const tile = revealBtn.closest(".episode-tile");
      const winnerId = revealBtn.dataset.winner;
      const isRevealed = tile.classList.toggle("winner-revealed");

      const winnerCard = tile.querySelector(`.contestant-card[data-comedian="${winnerId}"]`);
      winnerCard.classList.toggle("is-winner", isRevealed);
      const badge = winnerCard.querySelector(".winner-badge");
      if (isRevealed && !badge) {
        winnerCard.querySelector(".avatar").insertAdjacentHTML(
          "beforeend",
          '<span class="winner-badge" title="Winner">&#127942;</span>'
        );
      } else if (!isRevealed && badge) {
        badge.remove();
      }

      revealBtn.textContent = isRevealed ? "Hide Winner" : "Reveal Winner";
      revealBtn.classList.toggle("is-revealed", isRevealed);
    }
  });
}

loadSiteData()
  .then(renderEpisodes)
  .catch((err) => {
    console.error(err);
    document.getElementById("episode-list").innerHTML =
      '<p class="no-results">Couldn\'t load episode data. Check the CSV URLs in data/data.js.</p>';
  });
