// Shared helpers used by both the episodes page and the comedians page.

function getComedian(id) {
  return COMEDIANS.find((c) => c.id === id);
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

function avatarHTML(comedian, extraHTML = "") {
  if (comedian.photoUrl) {
    return `<div class="avatar avatar-photo" style="background-image:url('${comedian.photoUrl}')">${extraHTML}</div>`;
  }
  return `<div class="avatar">${getInitials(comedian.name)}${extraHTML}</div>`;
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
