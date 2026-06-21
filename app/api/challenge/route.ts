import { NextRequest, NextResponse } from "next/server";
import { sql, dbConfigured, ensureSchema } from "@/lib/db";

// Leaderboard: best penalty score among the user's league co-members.
export async function GET(req: NextRequest) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false, board: [] });
  const phone = req.nextUrl.searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT DISTINCT u.phone,
        COALESCE(u.state->>'ownerName','') AS name,
        COALESCE(u.state->>'teamName','') AS team,
        COALESCE((u.state->>'favoriteTeam'), '') AS nation,
        COALESCE((u.state->>'challengeBest')::int, 0) AS best
      FROM league_members m
      JOIN users u ON u.phone = m.phone
      WHERE m.league_id IN (SELECT league_id FROM league_members WHERE phone = ${phone})
      ORDER BY best DESC`;
    return NextResponse.json({ configured: true, board: rows });
  } catch {
    return NextResponse.json({ error: "db_error", board: [] }, { status: 500 });
  }
}
