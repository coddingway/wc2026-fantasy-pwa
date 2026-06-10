# 🔑 Manual Setup — Everything YOU Need To Do (~25 min total)

All code is shipped. These keys activate the real-data features.
Each feature degrades gracefully until its key exists — nothing breaks.

---

## 1. Firebase — Phone Login + Cloud Save + Leagues (10 min) — REQUIRED FIRST

Follow `SETUP_FIREBASE.md` for project creation, phone auth, and env vars.

⚠️ **Updated Firestore rules** (leagues added) — paste these in
Firestore → Rules and publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /leagues/{leagueId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.ownerUid;
      match /members/{uid} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

Unlocks: phone login, cloud save, **real crew leagues with live leaderboards**.

---

## 2. football-data.org — Live Scores & Fixtures (5 min, FREE)

1. Go to https://www.football-data.org/client/register
2. Register with your email → API token arrives by email instantly
3. Add it to Vercel:
```bash
cd wc2026-fantasy-pwa
npx vercel env add FOOTBALL_DATA_API_KEY production
# paste the token when prompted
```

Unlocks: **real World Cup fixtures, live scores, minute-by-minute updates**
on the Live page (auto-refreshes every 60s), squad player match status.

Free tier = 10 requests/min. Our server caches responses for 60s, so even
the whole crew using the app stays well under the limit.

---

## 3. Anthropic API — Real AI Advisor (5 min, pay-per-use)

1. Go to https://console.anthropic.com → API Keys → Create Key
2. Add billing (a few dollars covers the whole tournament — each analysis
   costs ~$0.01-0.03, and there's a built-in 10/hour per-person limit)
3. Add to Vercel:
```bash
npx vercel env add ANTHROPIC_API_KEY production
```

Unlocks: **Grove Street AI Advisor** on the AI page — real Claude analysis
of your actual squad: captain advice, transfer plans, wildcard strategy.

---

## 4. Redeploy (1 min) — after adding any env vars

```bash
npx vercel deploy --prod --yes
```

(Env vars only load into new deployments.)

---

## Feature → Key map

| Feature | Needs | Without it |
|---------|-------|-----------|
| Phone login + cloud save | Firebase (6 vars) | Local-only mode, login shows "not configured" |
| Crew leagues + leaderboards | Firebase + updated rules | Login prompt shown |
| Live scores & fixtures | FOOTBALL_DATA_API_KEY | Live page shows "not connected" notice |
| AI Advisor | ANTHROPIC_API_KEY | Advisor card shows "not connected" notice |
| Everything else (27 features) | Nothing | Works today |
