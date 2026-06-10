// Crew leagues — thin client over our Vercel API routes (Neon Postgres).
import { getStoredPin } from "./auth-context";

export interface LeagueDoc {
  id: string;
  name: string;
  code: string;
  type: "public" | "private";
  ownerUid: string;
  ownerName: string;
}

export interface MemberDoc {
  uid: string;
  teamName: string;
  favoriteTeam: string | null;
  points: number;
}

type Member = { teamName: string; favoriteTeam: string | null; points: number };

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/leagues", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-pin": getStoredPin() ?? "" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  if (data.configured === false) throw new Error("Cloud database not connected yet (see SETUP_KEYS.md)");
  return data;
}

export async function createLeague(
  phone: string, name: string, type: "public" | "private", member: Member
): Promise<LeagueDoc> {
  const data = await post({ action: "create", phone, name, type, member });
  return data.league;
}

export async function joinLeagueByCode(
  phone: string, code: string, member: Member
): Promise<LeagueDoc> {
  const data = await post({ action: "join", phone, code, member });
  return data.league;
}

export async function refreshMyMembership(phone: string, member: Member): Promise<void> {
  try {
    await post({ action: "refresh", phone, member });
  } catch {
    // non-fatal — standings just show last known points
  }
}

export async function getMyLeagues(phone: string): Promise<{ league: LeagueDoc; members: MemberDoc[] }[]> {
  const res = await fetch(`/api/leagues?phone=${encodeURIComponent(phone)}`);
  const data = await res.json();
  if (data.configured === false) throw new Error("Cloud database not connected yet (see SETUP_KEYS.md)");
  return data.leagues ?? [];
}
