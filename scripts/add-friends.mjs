import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const sql = neon("postgresql://neondb_owner:npg_6mnTIyEJ3evj@ep-twilight-lake-aonduhnf-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");
const LEAGUE_ID = "83a9d64d-a4ab-4aed-b083-ea9d0b582fda";
const FRIENDS = ["+918584988862", "+919123387370", "+919836312505"];

const NAT = {
  1:["ALG","🇩🇿"],2:["ARG","🇦🇷"],3:["AUS","🇦🇺"],4:["AUT","🇦🇹"],5:["BEL","🇧🇪"],6:["BIH","🇧🇦"],7:["BRA","🇧🇷"],8:["CPV","🇨🇻"],9:["CAN","🇨🇦"],10:["COL","🇨🇴"],11:["COD","🇨🇩"],12:["CIV","🇨🇮"],13:["CRO","🇭🇷"],14:["CUW","🇨🇼"],15:["CZE","🇨🇿"],16:["ECU","🇪🇨"],17:["EGY","🇪🇬"],18:["ENG","🏴󠁧󠁢󠁥󠁮󠁧󠁿"],19:["FRA","🇫🇷"],20:["GER","🇩🇪"],21:["GHA","🇬🇭"],22:["HAI","🇭🇹"],23:["IRN","🇮🇷"],24:["IRQ","🇮🇶"],25:["JPN","🇯🇵"],26:["JOR","🇯🇴"],27:["KOR","🇰🇷"],28:["MEX","🇲🇽"],29:["MAR","🇲🇦"],30:["NED","🇳🇱"],31:["NZL","🇳🇿"],32:["NOR","🇳🇴"],33:["PAN","🇵🇦"],34:["PAR","🇵🇾"],35:["POR","🇵🇹"],36:["QAT","🇶🇦"],37:["KSA","🇸🇦"],38:["SCO","🏴󠁧󠁢󠁳󠁣󠁴󠁿"],39:["SEN","🇸🇳"],40:["RSA","🇿🇦"],41:["ESP","🇪🇸"],42:["SWE","🇸🇪"],43:["SUI","🇨🇭"],44:["TUN","🇹🇳"],45:["TUR","🇹🇷"],46:["URU","🇺🇾"],47:["USA","🇺🇸"],48:["UZB","🇺🇿"],
};
const QUOTA = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const STARTING = { GK: 1, DEF: 4, MID: 4, FWD: 2 };

const players = JSON.parse(readFileSync("public/players.json", "utf8"))
  .filter((p) => p.status === "playing");
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

function toSquadPlayer(p) {
  const [code, flag] = NAT[p.squadId] ?? ["UNK", "🏳️"];
  return {
    id: p.id, firstName: p.firstName, lastName: p.lastName, knownName: p.knownName,
    squadId: p.squadId, position: p.position, price: p.price, status: "playing",
    percentSelected: p.percentSelected, stats: { totalPoints: 0, avgPoints: 0, form: 0, lastRoundPoints: 0 },
    oneToWatch: false, isStarting: false, isCaptain: false, isViceCaptain: false, nation: code, flag,
  };
}

function completeSquad(existing) {
  const squad = existing.map((p) => ({ ...p }));
  const haveIds = new Set(squad.map((p) => p.id));
  const natCount = {};
  let cost = 0;
  for (const p of squad) { natCount[p.nation] = (natCount[p.nation] || 0) + 1; cost += p.price; }
  const posCount = (pos) => squad.filter((p) => p.position === pos).length;

  for (const pos of ["GK", "DEF", "MID", "FWD"]) {
    while (posCount(pos) < QUOTA[pos]) {
      const slotsLeft = ["GK","DEF","MID","FWD"].reduce((s, q) => s + Math.max(0, QUOTA[q] - posCount(q)), 0);
      const reserve = (slotsLeft - 1) * 3.5;
      const maxSpend = 100 - cost - reserve;
      const cands = shuffle(players.filter((p) => {
        if (p.position !== pos || haveIds.has(p.id)) return false;
        const [code] = NAT[p.squadId] ?? ["UNK"];
        if ((natCount[code] || 0) >= 3) return false;
        return p.price <= maxSpend;
      }));
      const pick = cands[0] ?? shuffle(players.filter((p) => p.position === pos && !haveIds.has(p.id) && (natCount[(NAT[p.squadId]??["UNK"])[0]]||0) < 3)).sort((a,b)=>a.price-b.price)[0];
      if (!pick) throw new Error(`no candidate for ${pos}`);
      const sp = toSquadPlayer(pick);
      squad.push(sp); haveIds.add(sp.id);
      natCount[sp.nation] = (natCount[sp.nation] || 0) + 1; cost += sp.price;
    }
  }

  // formation 4-4-2 starters, captain = most expensive
  const startCount = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of squad) { p.isStarting = false; p.isCaptain = false; p.isViceCaptain = false; }
  for (const p of squad) {
    if (startCount[p.position] < STARTING[p.position]) { p.isStarting = true; startCount[p.position]++; }
  }
  const byPrice = [...squad].sort((a, b) => b.price - a.price);
  byPrice[0].isCaptain = true; byPrice[1].isViceCaptain = true;
  return squad;
}

for (const phone of FRIENDS) {
  const rows = await sql`SELECT state FROM users WHERE phone = ${phone}`;
  if (!rows.length) { console.log(`${phone}: no account, skip`); continue; }
  const state = rows[0].state || {};
  const existing = Array.isArray(state.squad) ? state.squad : [];
  const built = existing.length === 15 ? existing : completeSquad(existing);
  state.squad = built;
  if (!state.favoriteTeam) state.favoriteTeam = (NAT[built.find((p)=>p.isCaptain)?.squadId]??["ARG"])[0];
  if (!state.budget) state.budget = 100;
  if (!state.boosters) state.boosters = [];
  state.leagueIds = Array.from(new Set([...(state.leagueIds || []), LEAGUE_ID]));

  // compute points via deployed engine
  let total = 0, byRound = {}, playerPoints = {};
  try {
    const res = await fetch("https://fantasy.amritpodder.dev/api/points", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ squad: built }),
    });
    const d = await res.json();
    total = d.total || 0; byRound = d.byRound || {};
    for (const [id, b] of Object.entries(d.perPlayer || {})) playerPoints[Number(id)] = b.total;
  } catch {}
  state.totalPoints = total; state.roundPoints = byRound; state.playerPoints = playerPoints;

  await sql`UPDATE users SET state = ${JSON.stringify(state)}::jsonb, updated_at = now() WHERE phone = ${phone}`;
  await sql`INSERT INTO league_members (league_id, phone, team_name, favorite_team, points)
    VALUES (${LEAGUE_ID}, ${phone}, ${state.teamName || "My Team"}, ${state.favoriteTeam}, ${total})
    ON CONFLICT (league_id, phone) DO UPDATE SET team_name = EXCLUDED.team_name, favorite_team = EXCLUDED.favorite_team, points = EXCLUDED.points`;

  const cost = built.reduce((s, p) => s + p.price, 0);
  console.log(`${state.ownerName}: squad=${built.length} ($${cost.toFixed(1)}M) nation=${state.favoriteTeam} pts=${total} -> added to league ✓`);
}

console.log("\n=== Final league standings ===");
console.table(await sql`SELECT m.team_name, u.state->>'ownerName' AS name, m.favorite_team, m.points
  FROM league_members m JOIN users u ON u.phone = m.phone WHERE m.league_id = ${LEAGUE_ID} ORDER BY m.points DESC`);
