// Shared helpers used across the site's pages.

const HOST_APPEARANCE_THRESHOLD = 0.9;

function getComedian(id) {
  return COMEDIANS.find((c) => c.id === id);
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

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(rawDate) {
  const parts = rawDate.includes("-")
    ? rawDate.split("-").map(Number)
    : rawDate.split("/").map(Number);
  const [y, m, d] = rawDate.includes("-") ? parts : [parts[2], parts[0], parts[1]];
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function avatarHTML(comedian, extraHTML = "", extraClass = "") {
  const classes = `avatar ${extraClass}`.trim();
  if (comedian.photoUrl) {
    return `<div class="${classes} avatar-photo" style="background-image:url('${comedian.photoUrl}')">${extraHTML}</div>`;
  }
  return `<div class="${classes}">${getInitials(comedian.name)}${extraHTML}</div>`;
}

const IG_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>
</svg>`;

function instagramLink(handle) {
  return `<a class="ig-link" href="https://instagram.com/${handle}" target="_blank" rel="noopener" aria-label="Instagram">${IG_ICON}</a>`;
}

function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const start = (clampedPage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: clampedPage, totalPages };
}

function paginationControlsHTML(page, totalPages) {
  if (totalPages <= 1) return "";
  return `
    <div class="pagination">
      <button class="pagination-btn" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>&larr; Prev</button>
      <span class="pagination-status">Page ${page} of ${totalPages}</span>
      <button class="pagination-btn" data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""}>Next &rarr;</button>
    </div>
  `;
}

function contestantCardHTML(comedianId, isWinnerRevealed) {
  const c = getComedian(comedianId);
  const winnerClass = isWinnerRevealed ? " is-winner" : "";
  const badge = isWinnerRevealed
    ? '<span class="winner-badge" title="Winner">&#127942;</span>'
    : "";
  return `
    <div class="contestant-card${winnerClass}" data-comedian="${c.id}">
      <a class="contestant-card-link" href="guest.html?id=${c.id}">
        ${avatarHTML(c, badge)}
        <p class="contestant-name">${c.name}</p>
        <p class="contestant-record">Record: <strong>${c.wins}-${c.losses}</strong></p>
      </a>
      ${instagramLink(c.instagram)}
    </div>
  `;
}

function gasDigitalBadgeHTML(value) {
  const v = (value || "").trim();
  if (!v || /^(false|no|n|0)$/i.test(v)) return "";
  const label = "&#128274; GaS Digital Exclusive";
  return v.toLowerCase().startsWith("http")
    ? `<a href="${v}" target="_blank" rel="noopener" class="gas-badge">${label}</a>`
    : `<span class="gas-badge">${label}</span>`;
}

function prizeBookBadgeHTML(value) {
  const v = (value || "").trim();
  if (!v) return "";
  return `<span class="book-badge">&#128214; ${v}</span>`;
}

// highlightGuestId is optional — when set (e.g. from a guest's own page),
// a Won/Lost pill for that specific guest shows in the collapsed header.
function episodeTileHTML(ep, highlightGuestId) {
  const contestantsHTML = ep.contestantIds
    .map((id) => contestantCardHTML(id, false))
    .join("");

  const resultBadge = highlightGuestId
    ? (() => {
        const isWin = ep.winnerId === highlightGuestId;
        return `<span class="history-result ${isWin ? "is-win" : "is-loss"}">${isWin ? "Won" : "Lost"}</span>`;
      })()
    : "";

  return `
    <article class="episode-tile" id="episode-${ep.id}" data-episode="${ep.id}">
      <button class="episode-toggle" aria-expanded="false">
        <span class="episode-toggle-left">
          <span class="episode-number">Episode ${ep.id}</span>
          <span class="episode-title">${ep.title}</span>
          <span class="episode-date">${formatDate(ep.date)}</span>
          ${resultBadge}
        </span>
        <span class="episode-chevron">&#9660;</span>
      </button>
      <div class="episode-body">
        <div class="episode-body-inner">
          <div class="episode-body-content">
            ${gasDigitalBadgeHTML(ep.gasDigital)}
            ${prizeBookBadgeHTML(ep.prizeBook)}
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

function initEpisodeTileInteractions(container) {
  container.addEventListener("click", (event) => {
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

function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("mobile-nav");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.tagName !== "A") return;
    menu.classList.remove("open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

initMobileNav();
