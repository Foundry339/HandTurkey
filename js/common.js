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

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const IG_ICON = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/>
  <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor"/>
</svg>`;

function instagramLink(handle) {
  return `<a class="ig-link" href="https://instagram.com/${handle}" target="_blank" rel="noopener" aria-label="Instagram">${IG_ICON}</a>`;
}
