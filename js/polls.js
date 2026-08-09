const VOTED_POLLS_KEY = "handturkey_voted_polls";

function getVotedPolls() {
  try {
    return JSON.parse(localStorage.getItem(VOTED_POLLS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveVotedPoll(pollId, optionKey) {
  const voted = getVotedPolls();
  voted[pollId] = optionKey;
  localStorage.setItem(VOTED_POLLS_KEY, JSON.stringify(voted));
}

async function fetchTallies(pollId) {
  const response = await fetch(`${POLLS_WORKER_URL}/tallies?poll=${encodeURIComponent(pollId)}`);
  if (!response.ok) throw new Error(`Failed to fetch tallies: ${response.status}`);
  return response.json();
}

async function submitVote(pollId, optionKey) {
  const response = await fetch(`${POLLS_WORKER_URL}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poll: pollId, option: optionKey }),
  });
  if (!response.ok) throw new Error(`Failed to submit vote: ${response.status}`);
  return response.json();
}

function pollVoteHTML(poll) {
  const optionsHTML = poll.options
    .map(
      (opt, i) =>
        `<button class="poll-option" data-poll="${poll.id}" data-option="option_${i + 1}">${opt}</button>`
    )
    .join("");

  return `
    <div class="poll-card" data-poll-id="${poll.id}">
      <h3 class="poll-question">${poll.question}</h3>
      <div class="poll-options">${optionsHTML}</div>
    </div>
  `;
}

function pollResultsHTML(poll, tallies, selectedOption) {
  const total = Object.values(tallies).reduce((sum, n) => sum + n, 0);

  const rows = poll.options
    .map((opt, i) => {
      const key = `option_${i + 1}`;
      const count = tallies[key] || 0;
      const pct = total ? Math.round((count / total) * 100) : 0;
      const isSelected = key === selectedOption;
      return `
        <div class="poll-result-row${isSelected ? " is-selected" : ""}">
          <div class="poll-result-label">
            <span>${opt}${isSelected ? ' <span class="poll-your-vote">Your vote</span>' : ""}</span>
            <span>${pct}% (${count})</span>
          </div>
          <div class="poll-bar-track"><div class="poll-bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="poll-card" data-poll-id="${poll.id}">
      <h3 class="poll-question">${poll.question}</h3>
      <div class="poll-results">${rows}</div>
      <p class="poll-total">${total} vote${total === 1 ? "" : "s"} total</p>
    </div>
  `;
}

async function handlePollOptionClick(event) {
  const btn = event.target.closest(".poll-option");
  if (!btn) return;

  const pollId = btn.dataset.poll;
  const optionKey = btn.dataset.option;
  const poll = POLLS.find((p) => p.id === pollId);
  const card = btn.closest(".poll-card");

  card.querySelectorAll(".poll-option").forEach((b) => (b.disabled = true));
  btn.classList.add("is-submitting");

  try {
    const tallies = await submitVote(pollId, optionKey);
    saveVotedPoll(pollId, optionKey);
    card.outerHTML = pollResultsHTML(poll, tallies, optionKey);
  } catch (err) {
    console.error(`Failed to submit vote for poll ${pollId}`, err);
    card.querySelectorAll(".poll-option").forEach((b) => (b.disabled = false));
    btn.classList.remove("is-submitting");
    let errorEl = card.querySelector(".poll-error");
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className = "poll-error";
      card.appendChild(errorEl);
    }
    errorEl.textContent = "Couldn't submit your vote. Please try again.";
  }
}

async function renderPolls() {
  const container = document.getElementById("polls-list");

  if (!POLLS.length) {
    container.innerHTML = '<p class="no-results">No polls yet. Check back soon.</p>';
    return;
  }

  const voted = getVotedPolls();

  container.innerHTML = POLLS.map((poll) => {
    if (poll.status === "closed" || voted[poll.id]) {
      return `<div class="poll-card-slot" data-poll-id="${poll.id}"><p class="poll-loading">Loading results…</p></div>`;
    }
    return pollVoteHTML(poll);
  }).join("");

  container.addEventListener("click", handlePollOptionClick);

  await Promise.all(
    POLLS.filter((poll) => poll.status === "closed" || voted[poll.id]).map(async (poll) => {
      const slot = container.querySelector(`.poll-card-slot[data-poll-id="${poll.id}"]`);
      try {
        const tallies = await fetchTallies(poll.id);
        if (slot) slot.outerHTML = pollResultsHTML(poll, tallies, voted[poll.id]);
      } catch (err) {
        console.error(`Failed to load results for poll ${poll.id}`, err);
        if (slot) slot.innerHTML = '<p class="no-results">Couldn\'t load results for this poll.</p>';
      }
    })
  );
}

loadPolls()
  .then(renderPolls)
  .catch((err) => {
    console.error(err);
    document.getElementById("polls-list").innerHTML =
      '<p class="no-results">Couldn\'t load polls. Check the CSV URL in data/data.js.</p>';
  });
