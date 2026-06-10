import { NextRequest, NextResponse } from "next/server";
import { sql, dbConfigured, ensureSchema, hashPin, verifyPin } from "@/lib/db";

// Signup: name + phone + 4-digit PIN. Login: phone + PIN.
// Legacy accounts (created before PINs): first login sets their PIN.
// Rate-limited to stop PIN brute-forcing.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 12;
const attempts = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const e = attempts.get(ip);
  if (!e || now > e.reset) {
    attempts.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  e.count++;
  return e.count > MAX_ATTEMPTS;
}

const validPin = (pin: unknown): pin is string => typeof pin === "string" && /^\d{4}$/.test(pin);

export async function POST(req: NextRequest) {
  if (!dbConfigured || !sql) return NextResponse.json({ configured: false, ok: true }); // local-only fallback

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }

  try {
    const { action, phone, name, pin } = await req.json();
    if (!phone) return NextResponse.json({ error: "phone_required" }, { status: 400 });
    if (!validPin(pin)) return NextResponse.json({ error: "PIN must be exactly 4 digits." }, { status: 400 });
    await ensureSchema();

    if (action === "signup") {
      if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });
      const existing = await sql`SELECT state->>'ownerName' AS name FROM users WHERE phone = ${phone}`;
      if (existing.length) {
        const who = existing[0].name;
        return NextResponse.json(
          { error: `This number already has an account${who ? ` (${who})` : ""}. Please use Login.` },
          { status: 409 }
        );
      }
      await sql`INSERT INTO users (phone, state, pin_hash) VALUES (${phone}, '{}'::jsonb, ${hashPin(phone, pin)})`;
      return NextResponse.json({ ok: true });
    }

    if (action === "login") {
      const check = await verifyPin(phone, pin);
      if (check === "missing") {
        return NextResponse.json({ error: "This number isn't registered yet. Please Sign Up first." }, { status: 404 });
      }
      if (check === "bad") {
        return NextResponse.json({ error: "Wrong PIN. Try again." }, { status: 401 });
      }
      let pinSet = false;
      if (check === "nopin") {
        // Legacy account — this first login sets their PIN
        await sql`UPDATE users SET pin_hash = ${hashPin(phone, pin)} WHERE phone = ${phone}`;
        pinSet = true;
      }
      const rows = await sql`SELECT state->>'ownerName' AS name FROM users WHERE phone = ${phone}`;
      return NextResponse.json({ ok: true, name: rows[0]?.name ?? null, pinSet });
    }

    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
