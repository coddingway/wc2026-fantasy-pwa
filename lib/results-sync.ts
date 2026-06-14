import { sql, ensureSchema } from "./db";
import { codeFromName } from "./nation-names";

// Pull per-match goals/assists/cards from TheSportsDB and cache in Neon.
// Each finished match is fetched exactly once, then served from our DB forever.

const KEY = process.env.THESPORTSDB_KEY || "3";
const WC_LEAGUE = "4429"; // TheSportsDB FIFA World Cup
const tsdb = (path: string) => `https://www.thesportsdb.com/api/v1/json/${KEY}/${path}`;

export interface CachedEvent {
  type: "goal" | "yellow" | "red";
  player: string;
  assist: string | null;
  code: string | null;
  minute: number;
  penalty: boolean;
  ownGoal: boolean;
}

let lastSync = 0;
const SYNC_THROTTLE = 5 * 60 * 1000;

export async function syncResults(force = false): Promise<void> {
  if (!sql) return;
  if (!force && Date.now() - lastSync < SYNC_THROTTLE) return;
  lastSync = Date.now();
  await ensureSchema();

  let data: any;
  try {
    const res = await fetch(tsdb(`eventsseason.php?id=${WC_LEAGUE}&s=2026`), { next: { revalidate: 300 } });
    data = await res.json();
  } catch { return; }
  const events = data?.events ?? [];

  for (const e of events) {
    const status = e.strStatus ?? e.strProgress ?? "";
    const finished = status === "FT" || status === "Match Finished" || status === "AET" || status === "FT/AET";
    if (!finished) continue;
    const id = String(e.idEvent);

    const existing = await sql`SELECT event_id FROM match_cache WHERE event_id = ${id}`;
    if (existing.length) continue; // fetch-once

    let tl: any[] = [];
    try {
      const r = await fetch(tsdb(`lookuptimeline.php?id=${id}`));
      const j = await r.json();
      tl = j?.timeline ?? [];
    } catch { /* keep score-only */ }

    const parsed: CachedEvent[] = [];
    for (const t of tl) {
      const code = t.strTeam ? codeFromName(t.strTeam) : null;
      const minute = parseInt(t.intTime) || 0;
      const kind = String(t.strTimeline ?? "").toLowerCase();
      const detail = String(t.strTimelineDetail ?? "").toLowerCase();
      if (kind === "goal") {
        parsed.push({ type: "goal", player: t.strPlayer ?? "", assist: t.strAssist || null, code, minute, penalty: detail.includes("pen"), ownGoal: detail.includes("own") });
      } else if (kind === "card") {
        parsed.push({ type: detail.includes("red") ? "red" : "yellow", player: t.strPlayer ?? "", assist: null, code, minute, penalty: false, ownGoal: false });
      }
    }

    await sql`INSERT INTO match_cache (event_id, home_code, away_code, home_score, away_score, status, events)
      VALUES (${id}, ${codeFromName(e.strHomeTeam ?? "")}, ${codeFromName(e.strAwayTeam ?? "")},
              ${parseInt(e.intHomeScore) || 0}, ${parseInt(e.intAwayScore) || 0}, ${status},
              ${JSON.stringify(parsed)}::jsonb)
      ON CONFLICT (event_id) DO NOTHING`;
  }
}

export interface PlayerAgg {
  name: string; code: string | null;
  goals: number; assists: number; yellows: number; reds: number; ownGoals: number;
}

export async function getPlayerAggregates(): Promise<PlayerAgg[]> {
  if (!sql) return [];
  await ensureSchema();
  const rows = await sql`SELECT events FROM match_cache`;
  const map = new Map<string, PlayerAgg>();
  const bump = (name: string, code: string | null, f: (a: PlayerAgg) => void) => {
    if (!name) return;
    const k = `${(code ?? "")}|${name.toLowerCase()}`;
    let a = map.get(k);
    if (!a) { a = { name, code, goals: 0, assists: 0, yellows: 0, reds: 0, ownGoals: 0 }; map.set(k, a); }
    f(a);
  };
  for (const r of rows) {
    for (const ev of (r.events as CachedEvent[]) ?? []) {
      if (ev.type === "goal") {
        if (ev.ownGoal) bump(ev.player, ev.code, (a) => a.ownGoals++);
        else { bump(ev.player, ev.code, (a) => a.goals++); if (ev.assist) bump(ev.assist, ev.code, (a) => a.assists++); }
      } else if (ev.type === "yellow") bump(ev.player, ev.code, (a) => a.yellows++);
      else if (ev.type === "red") bump(ev.player, ev.code, (a) => a.reds++);
    }
  }
  return [...map.values()];
}
