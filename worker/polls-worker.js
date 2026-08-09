// Cloudflare Worker backing the Polls page.
// Requires a KV namespace bound to this Worker as `POLLS_KV`
// (Worker settings -> Variables -> KV Namespace Bindings).
//
// GET  /tallies?poll=<pollId>          -> { "<optionKey>": <count>, ... }
// POST /vote  { poll, option }         -> increments the count, returns updated tallies

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

async function getTallies(env, pollId) {
  const prefix = `vote:${pollId}:`;
  const list = await env.POLLS_KV.list({ prefix });
  const tallies = {};
  for (const key of list.keys) {
    const optionKey = key.name.slice(prefix.length);
    tallies[optionKey] = parseInt((await env.POLLS_KV.get(key.name)) || "0", 10);
  }
  return tallies;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/tallies" && request.method === "GET") {
      const pollId = url.searchParams.get("poll");
      if (!pollId) return json({ error: "Missing poll id" }, 400);
      return json(await getTallies(env, pollId));
    }

    if (url.pathname === "/vote" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      const { poll, option } = body || {};
      if (!poll || !option) return json({ error: "Missing poll or option" }, 400);

      const key = `vote:${poll}:${option}`;
      const current = parseInt((await env.POLLS_KV.get(key)) || "0", 10);
      await env.POLLS_KV.put(key, String(current + 1));

      return json(await getTallies(env, poll));
    }

    return json({ error: "Not found" }, 404);
  },
};
