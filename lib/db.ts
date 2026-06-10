import { neon } from "@neondatabase/serverless";

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
  })();
  return ready;
}
