function comedianCardHTML(c) {
  return `
    <div class="comedian-card">
      <div class="avatar">${getInitials(c.name)}</div>
      <p class="contestant-name">${c.name}</p>
      <p class="contestant-record">Record: <strong>${c.wins}-${c.losses}</strong></p>
      ${instagramLink(c.instagram)}
    </div>
  `;
}

function renderComedians() {
  const grid = document.getElementById("comedian-grid");
  const sorted = [...COMEDIANS].sort((a, b) => a.name.localeCompare(b.name));
  grid.innerHTML = sorted.map(comedianCardHTML).join("");
}

renderComedians();
