import { NextRequest, NextResponse } from "next/server";
import { sql, dbConfigured, ensureSchema, verifyPin } from "@/lib/db";

// Crew leagues. GET ?phone= -> my leagues + member standings.
// POST {action: create|join|refresh, ...} -> mutations.

function genCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "LEAGUE";
  return base + Math.floor(100 + Math.random() * 900);
}

const leagueShape = (r: Record<string, unknown>) => ({
  id: r.id, name: r.name, code: r.code, type: r.type,
  ownerUid: r.owner_phone, ownerName: r.owner_name,
});

const memberShape = (r: Record<string, unknown>) => ({
  uid: r.phone, teamName: r.team_name, favoriteTeam: r.favorite_team, points: r.points,
});

export async function GET(req: NextRequest) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false, leagues: [] });
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });
  try {
    await ensureSchema();
    const myLeagues = await sql`
      SELECT l.* FROM leagues l
      JOIN league_members m ON m.league_id = l.id
      WHERE m.phone = ${phone}
      ORDER BY l.created_at DESC
    `;
    const result = [];
    for (const l of myLeagues) {
      const members = await sql`
        SELECT * FROM league_members WHERE league_id = ${l.id}
        ORDER BY points DESC, joined_at ASC
      `;
      result.push({ league: leagueShape(l), members: members.map(memberShape) });
    }
    return NextResponse.json({ configured: true, leagues: result });
  } catch {
    return NextResponse.json({ error: "db_error", leagues: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false }, { status: 503 });
  try {
    const body = await req.json();
    const { action, phone, member } = body;
    if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });
    await ensureSchema();

    // League mutations act as the user — require their PIN
    const check = await verifyPin(phone, req.headers.get("x-pin"));
    if (check === "bad" || check === "missing") {
      return NextResponse.json({ error: "pin_required" }, { status: 401 });
    }

    if (action === "create") {
      const { name, type } = body;
      if (!name?.trim()) return NextResponse.json({ error: "name_required" }, { status: 400 });
      const id = crypto.randomUUID();
      const code = genCode(name);
      await sql`INSERT INTO leagues (id, name, code, type, owner_phone, owner_name)
        VALUES (${id}, ${name.trim()}, ${code}, ${type === "public" ? "public" : "private"}, ${phone}, ${member?.teamName ?? ""})`;
      await sql`INSERT INTO league_members (league_id, phone, team_name, favorite_team, points)
        VALUES (${id}, ${phone}, ${member?.teamName ?? ""}, ${member?.favoriteTeam ?? null}, ${member?.points ?? 0})`;
      return NextResponse.json({ league: { id, name: name.trim(), code, type, ownerUid: phone, ownerName: member?.teamName ?? "" } });
    }

    if (action === "join") {
      const code = String(body.code ?? "").trim().toUpperCase();
      const rows = await sql`SELECT * FROM leagues WHERE code = ${code}`;
      if (!rows.length) return NextResponse.json({ error: "No league found with that code" }, { status: 404 });
      const l = rows[0];
      await sql`INSERT INTO league_members (league_id, phone, team_name, favorite_team, points)
        VALUES (${l.id}, ${phone}, ${member?.teamName ?? ""}, ${member?.favoriteTeam ?? null}, ${member?.points ?? 0})
        ON CONFLICT (league_id, phone) DO UPDATE SET
          team_name = EXCLUDED.team_name, favorite_team = EXCLUDED.favorite_team, points = EXCLUDED.points`;
      return NextResponse.json({ league: leagueShape(l) });
    }

    if (action === "refresh") {
      await sql`UPDATE league_members SET
          team_name = ${member?.teamName ?? ""},
          favorite_team = ${member?.favoriteTeam ?? null},
          points = ${member?.points ?? 0}
        WHERE phone = ${phone}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
