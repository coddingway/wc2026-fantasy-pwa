import { neon } from "@neondatabase/serverless";
import crypto from "node:crypto";

// Neon Postgres via Vercel Storage. DATABASE_URL is auto-injected when the
// database is attached to the Vercel project.
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export const dbConfigured = Boolean(url);
export const sql = url ? neon(url) : null;

let ready: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!sql) return Promise.reject(new Error("db_not_configured"));
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS users (
      phone text PRIMARY KEY,
      state jsonb NOT NULL DEFAULT '{}'::jsonb,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS leagues (
      id text PRIMARY KEY,
      name text NOT NULL,
      code text UNIQUE NOT NULL,
      type text NOT NULL DEFAULT 'private',
      owner_phone text NOT NULL,
      owner_name text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS league_members (
      league_id text NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
      phone text NOT NULL,
      team_name text NOT NULL DEFAULT '',
      favorite_team text,
      points integer NOT NULL DEFAULT 0,
      joined_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (league_id, phone)
    )`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_hash text`;
    // Per-match player events cached from TheSportsDB (fetch-once, store forever)
    await sql`CREATE TABLE IF NOT EXISTS match_cache (
      event_id text PRIMARY KEY,
      home_code text, away_code text,
      home_score int, away_score int,
      status text,
      events jsonb NOT NULL DEFAULT '[]'::jsonb,
      synced_at timestamptz NOT NULL DEFAULT now()
    )`;
  })();
  return ready;
}

// ---- PIN auth (4-digit, salted hash) ----

export function hashPin(phone: string, pin: string): string {
  return crypto.createHash("sha256").update(`${phone}:${pin}:gs2026`).digest("hex");
}

export type PinCheck = "ok" | "nopin" | "bad" | "missing";

// missing = no account, nopin = legacy account without a PIN yet
export async function verifyPin(phone: string, pin: string | null): Promise<PinCheck> {
  if (!sql) return "missing";
  await ensureSchema();
  const rows = await sql`SELECT pin_hash FROM users WHERE phone = ${phone}`;
  if (!rows.length) return "missing";
  if (!rows[0].pin_hash) return "nopin";
  if (!pin) return "bad";
  return rows[0].pin_hash === hashPin(phone, pin) ? "ok" : "bad";
}
