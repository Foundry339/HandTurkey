function contestantCardHTML(comedianId, isWinnerRevealed) {
  const c = getComedian(comedianId);
  const winnerClass = isWinnerRevealed ? " is-winner" : "";
  const badge = isWinnerRevealed
    ? '<span class="winner-badge" title="Winner">&#127942;</span>'
    : "";
  return `
    <div class="contestant-card${winnerClass}" data-comedian="${c.id}">
      <div class="avatar">${getInitials(c.name)}${badge}</div>
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

function renderEpisodes() {
  const list = document.getElementById("episode-list");
  const sorted = [...EPISODES].sort((a, b) => b.id - a.id);
  list.innerHTML = sorted.map(episodeTileHTML).join("");

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
      const winner = getComedian(winnerId);

      tile.querySelectorAll(".contestant-card").forEach((card) => {
        if (card.dataset.comedian === winnerId) {
          card.classList.add("is-winner");
          card.querySelector(".avatar").insertAdjacentHTML(
            "beforeend",
            '<span class="winner-badge" title="Winner">&#127942;</span>'
          );
        }
      });

      revealBtn.outerHTML = `
        <div class="winner-reveal">
          <span class="label">Winner</span>
          <span class="name">${winner.name}</span>
        </div>
      `;
    }
  });
}

renderEpisodes();
