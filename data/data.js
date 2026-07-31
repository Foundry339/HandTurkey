/*
  PLACEHOLDER DATA
  ----------------
  This file is the shell's stand-in for the CSV that will eventually
  drive the site. Swap COMEDIANS / EPISODES below with data parsed
  from the published CSV — the rendering code in js/episodes.js and
  js/comedians.js doesn't need to change as long as the shape matches.
*/

const COMEDIANS = [
  { id: "buddy-turkerson", name: "Buddy Turkerson", instagram: "buddyturkerson", wins: 1, losses: 2 },
  { id: "gobbles-mcgee",   name: "Gobbles McGee",    instagram: "gobblesmcgee",   wins: 0, losses: 3 },
  { id: "ricky-stanza",    name: "Ricky Stanza",     instagram: "rickystanza",    wins: 0, losses: 2 },
  { id: "nadia-cross",     name: "Nadia Cross",      instagram: "nadiacross",     wins: 1, losses: 1 },
  { id: "trevor-lang",     name: "Trevor Lang",      instagram: "trevorlang",     wins: 0, losses: 3 },
  { id: "sunny-okafor",    name: "Sunny Okafor",     instagram: "sunnyokafor",    wins: 1, losses: 1 },
  { id: "marco-diaz",      name: "Marco Diaz",       instagram: "marcodiaz",      wins: 0, losses: 2 },
  { id: "priya-anand",     name: "Priya Anand",      instagram: "priyaanand",     wins: 0, losses: 3 },
  { id: "jake-holloway",   name: "Jake Holloway",    instagram: "jakeholloway",   wins: 1, losses: 1 },
  { id: "lila-chen",       name: "Lila Chen",        instagram: "lilachen",       wins: 1, losses: 2 },
];

const EPISODES = [
  {
    id: 101,
    title: "Turkey Day",
    date: "2026-05-07",
    youtubeUrl: "https://www.youtube.com/watch?v=placeholder101",
    contestantIds: ["buddy-turkerson", "gobbles-mcgee", "ricky-stanza", "nadia-cross", "trevor-lang"],
    winnerId: "buddy-turkerson",
  },
  {
    id: 102,
    title: "The Long Con",
    date: "2026-05-14",
    youtubeUrl: "https://www.youtube.com/watch?v=placeholder102",
    contestantIds: ["gobbles-mcgee", "sunny-okafor", "marco-diaz", "priya-anand", "jake-holloway"],
    winnerId: "sunny-okafor",
  },
  {
    id: 103,
    title: "Feathers Flying",
    date: "2026-05-21",
    youtubeUrl: "https://www.youtube.com/watch?v=placeholder103",
    contestantIds: ["buddy-turkerson", "nadia-cross", "lila-chen", "trevor-lang", "marco-diaz"],
    winnerId: "nadia-cross",
  },
  {
    id: 104,
    title: "Cold Feet",
    date: "2026-05-28",
    youtubeUrl: "https://www.youtube.com/watch?v=placeholder104",
    contestantIds: ["ricky-stanza", "priya-anand", "jake-holloway", "lila-chen", "sunny-okafor"],
    winnerId: "jake-holloway",
  },
  {
    id: 105,
    title: "Guilt",
    date: "2026-06-04",
    youtubeUrl: "https://www.youtube.com/watch?v=placeholder105",
    contestantIds: ["buddy-turkerson", "gobbles-mcgee", "priya-anand", "lila-chen", "trevor-lang"],
    winnerId: "lila-chen",
  },
];
