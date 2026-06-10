import { NextRequest, NextResponse } from "next/server";
import { sql, dbConfigured, ensureSchema, verifyPin } from "@/lib/db";

// Per-user cloud save, keyed by phone number.
// GET  -> latest saved state (cloud-first load on login)
// PUT  -> upsert full state (debounced autosave from client)

type Params = { params: Promise<{ phone: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false, state: null });
  const { phone } = await params;
  try {
    await ensureSchema();
    const rows = await sql`SELECT state FROM users WHERE phone = ${decodeURIComponent(phone)}`;
    return NextResponse.json({ configured: true, state: rows[0]?.state ?? null });
  } catch {
    return NextResponse.json({ configured: true, state: null, error: "db_error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false }, { status: 503 });
  const { phone: rawPhone } = await params;
  const phone = decodeURIComponent(rawPhone);
  try {
    // Writes require the account PIN — viewing stays open, editing doesn't.
    const pin = req.headers.get("x-pin");
    const check = await verifyPin(phone, pin);
    if (check === "bad" || check === "missing") {
      return NextResponse.json({ error: "pin_required" }, { status: 401 });
    }
    const { state } = await req.json();
    if (!state || typeof state !== "object") {
      return NextResponse.json({ error: "invalid_state" }, { status: 400 });
    }
    await ensureSchema();
    await sql`
      INSERT INTO users (phone, state, updated_at)
      VALUES (${decodeURIComponent(phone)}, ${JSON.stringify(state)}::jsonb, now())
      ON CONFLICT (phone) DO UPDATE SET state = EXCLUDED.state, updated_at = now()
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}
