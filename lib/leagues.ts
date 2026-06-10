import {
  collection, doc, getDoc, getDocs, setDoc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

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

function genCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "LEAGUE";
  return base + Math.floor(100 + Math.random() * 900);
}

export async function createLeague(
  phone: string, name: string, type: "public" | "private",
  member: { teamName: string; favoriteTeam: string | null; points: number }
): Promise<LeagueDoc> {
  if (!db) throw new Error("Cloud not configured");
  const code = genCode(name);
  const ref = doc(collection(db, "leagues"));
  const league: LeagueDoc = { id: ref.id, name, code, type, ownerUid: phone, ownerName: member.teamName };
  await setDoc(ref, { ...league, createdAt: serverTimestamp() });
  await setDoc(doc(db, "leagues", ref.id, "members", phone), { uid: phone, ...member, joinedAt: serverTimestamp() });
  await rememberLeague(phone, ref.id);
  return league;
}

export async function joinLeagueByCode(
  phone: string, code: string,
  member: { teamName: string; favoriteTeam: string | null; points: number }
): Promise<LeagueDoc> {
  if (!db) throw new Error("Cloud not configured");
  const q = query(collection(db, "leagues"), where("code", "==", code.trim().toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No league found with that code");
  const league = snap.docs[0].data() as LeagueDoc;
  await setDoc(doc(db, "leagues", league.id, "members", phone), { uid: phone, ...member, joinedAt: serverTimestamp() });
  await rememberLeague(phone, league.id);
  return league;
}

async function rememberLeague(uid: string, leagueId: string) {
  if (!db) return;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const existing: string[] = snap.exists() ? snap.data().leagueIds ?? [] : [];
  if (!existing.includes(leagueId)) {
    await setDoc(userRef, { leagueIds: [...existing, leagueId] }, { merge: true });
  }
}

export async function getMyLeagues(uid: string): Promise<{ league: LeagueDoc; members: MemberDoc[] }[]> {
  if (!db) return [];
  const userSnap = await getDoc(doc(db, "users", uid));
  const ids: string[] = userSnap.exists() ? userSnap.data().leagueIds ?? [] : [];
  const out: { league: LeagueDoc; members: MemberDoc[] }[] = [];
  for (const id of ids) {
    const lSnap = await getDoc(doc(db, "leagues", id));
    if (!lSnap.exists()) continue;
    const mSnap = await getDocs(collection(db, "leagues", id, "members"));
    const members = mSnap.docs
      .map((d) => d.data() as MemberDoc)
      .sort((a, b) => b.points - a.points);
    out.push({ league: lSnap.data() as LeagueDoc, members });
  }
  return out;
}

// Push my latest points/team into every league I'm a member of.
export async function refreshMyMembership(
  phone: string,
  member: { teamName: string; favoriteTeam: string | null; points: number }
) {
  if (!db) return;
  const userSnap = await getDoc(doc(db, "users", phone));
  const ids: string[] = userSnap.exists() ? userSnap.data().leagueIds ?? [] : [];
  await Promise.all(
    ids.map((id) =>
      setDoc(doc(db!, "leagues", id, "members", phone), { uid: phone, ...member }, { merge: true })
    )
  );
}
