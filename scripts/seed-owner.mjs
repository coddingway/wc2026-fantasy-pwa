// One-time seed: load the owner's researched 15-nation squad into his
// account and reset every other number. Run: node scripts/seed-owner.mjs
import { neon } from "@neondatabase/serverless";

const OWNER = "+917003893998";
const sql = neon(process.env.DATABASE_URL ?? "postgresql://neondb_owner:npg_6mnTIyEJ3evj@ep-twilight-lake-aonduhnf-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");

const P = (id, firstName, lastName, knownName, squadId, position, price, percentSelected, nation, flag, isStarting, isCaptain = false, isViceCaptain = false) => ({
  id, firstName, lastName, knownName, squadId, position, price,
  status: "playing", percentSelected,
  stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 },
  oneToWatch: false, isStarting, isCaptain, isViceCaptain, nation, flag,
});

const squad = [
  // Starting XI — 4-4-2, $100.0M, 15 nations
  P(1,  "Thibaut",  "Courtois",  "Courtois",        5,  "GK",  4.9, 11.9, "BEL", "🇧🇪", true),
  P(2,  "Joshua",   "Kimmich",   "Kimmich",         20, "DEF", 5.5, 27.7, "GER", "🇩🇪", true),
  P(3,  "Virgil",   "van Dijk",  "Van Dijk",        30, "DEF", 5.5, 20.7, "NED", "🇳🇱", true),
  P(4,  "William",  "Saliba",    "Saliba",          19, "DEF", 5.3, 15.8, "FRA", "🇫🇷", true),
  P(5,  "Gabriel",  "Magalhães", "Gabriel",         7,  "DEF", 5.5, 25.2, "BRA", "🇧🇷", true),
  P(6,  "Lamine",   "Yamal",     "Lamine Yamal",    41, "MID", 10.0, 44.3, "ESP", "🇪🇸", true, false, true),
  P(7,  "Bruno",    "Fernandes", "Bruno Fernandes", 35, "MID", 8.5, 48.8, "POR", "🇵🇹", true),
  P(8,  "Luis",     "Díaz",      "Luis Díaz",       10, "MID", 8.1, 18.8, "COL", "🇨🇴", true),
  P(9,  "Arda",     "Güler",     "Arda Güler",      45, "MID", 7.0, 8.6,  "TUR", "🇹🇷", true),
  P(10, "Harry",    "Kane",      "Harry Kane",      18, "FWD", 10.5, 37.9, "ENG", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", true, true, false),
  P(11, "Julián",   "Álvarez",   "Julián Álvarez",  2,  "FWD", 8.6, 16.2, "ARG", "🇦🇷", true),
  // Bench
  P(12, "Guillermo","Ochoa",     "Ochoa",           28, "GK",  4.2, 2.0,  "MEX", "🇲🇽", false),
  P(13, "Achraf",   "Hakimi",    "Hakimi",          29, "DEF", 6.0, 21.1, "MAR", "🇲🇦", false),
  P(14, "Daizen",   "Maeda",     "Daizen Maeda",    25, "MID", 5.0, 1.2,  "JPN", "🇯🇵", false),
  P(15, "Ivan",     "Perišić",   "Ivan Perišić",    13, "FWD", 5.4, 0.5,  "CRO", "🇭🇷", false),
];

const state = {
  squad,
  budget: 100, totalBudget: 100, totalPoints: 0, roundPoints: {},
  transfers: [], freeTransfersRemaining: 2,
  boosters: [
    { id: "wildcard", name: "Wildcard", icon: "🃏", description: "Unlimited transfers for one round", used: false, recommended: "Round of 32" },
    { id: "12thman", name: "12th Man", icon: "👤", description: "Add 1 extra player outside budget", used: false, recommended: "Semi-Finals" },
    { id: "maxcaptain", name: "Max Captain", icon: "⭐", description: "Auto-captain your top scorer", used: false, recommended: "Quarter-Finals" },
    { id: "qualification", name: "Qualification Booster", icon: "🏅", description: "+2pts per starter who advances", used: false, recommended: "Round of 16" },
    { id: "mystery", name: "Mystery Booster", icon: "❓", description: "Revealed at Round of 32", used: false, recommended: "TBD" },
  ],
  predictions: [], badges: [],
  teamName: "Grove Street FC",
  favoriteTeam: null, // owner picks his nation on first login
  notifications: true, darkMode: true,
};

const total = squad.reduce((s, p) => s + p.price, 0);
console.log(`Squad: ${squad.length} players, $${total.toFixed(1)}M, ${new Set(squad.map(p => p.nation)).size} nations`);

// Reset everyone else
const delUsers = await sql`DELETE FROM users WHERE phone != ${OWNER} RETURNING phone`;
await sql`DELETE FROM league_members WHERE true`;
await sql`DELETE FROM leagues WHERE true`;
console.log(`Reset: ${delUsers.length} other user(s) removed, all leagues cleared`);

// Seed the owner
await sql`
  INSERT INTO users (phone, state, updated_at)
  VALUES (${OWNER}, ${JSON.stringify(state)}::jsonb, now())
  ON CONFLICT (phone) DO UPDATE SET state = EXCLUDED.state, updated_at = now()
`;
const check = await sql`SELECT state->>'teamName' AS name, jsonb_array_length(state->'squad') AS players FROM users WHERE phone = ${OWNER}`;
console.log(`Seeded ${OWNER}: team "${check[0].name}" with ${check[0].players} players ✓`);
