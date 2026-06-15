import { NextRequest, NextResponse } from "next/server";
import { syncResults } from "@/lib/results-sync";
import { sql, dbConfigured } from "@/lib/db";

// Manual sync trigger. /api/sync?full=1 backfills every tournament day.
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false });
  const full = req.nextUrl.searchParams.get("full") === "1";
  try {
    await syncResults(true, full);
    const rows = await sql`SELECT count(*)::int AS n, sum(jsonb_array_length(events))::int AS events FROM match_cache`;
    return NextResponse.json({ ok: true, cachedMatches: rows[0]?.n ?? 0, totalEvents: rows[0]?.events ?? 0 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "sync_failed" }, { status: 500 });
  }
}
