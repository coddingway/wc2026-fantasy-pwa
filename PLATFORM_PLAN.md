# FIFA Fantasy Intelligence Platform — Implementation Plan

> Transforming the WC2026 Fantasy Hub PWA into a complete, production-ready
> FIFA World Cup Fantasy companion platform.
> Version 1.0 — June 2026

---

## 1. Current State Audit

### What exists today (v1 PWA)

| Module | Status | Limitation |
|--------|--------|------------|
| Dashboard | ✅ Built | All data local, no live updates |
| Squad pitch view | ✅ Built | Hardcoded 15-player squad in `lib/squad-data.ts` |
| Transfers | ✅ Built | UI only — transfers don't validate vs FIFA rules engine |
| Captain picker | ✅ Built | Static fixture-difficulty table, not live |
| Analytics | ✅ Built | Mock round data (`MOCK_ROUND_DATA`) |
| Live mode | ✅ Built | Mock matches (`MOCK_MATCHES`), no real feed |
| AI tools | ✅ Built | Heuristics + `Math.random()` — not real predictions |
| Auto-squad builder | ✅ Built | Real algorithm, but value model is price+ownership only |
| Formation optimizer | ✅ Built | Works locally |
| Multi-team manager | ✅ Built | In-memory only, lost on refresh (not in persisted store) |
| Leagues | ✅ Built | Mock leagues, no backend |
| Community/badges/roast | ✅ Built | Mock data, no real users |
| Predictions game | ✅ Built | No settlement (results never come in) |
| Education | ✅ Built | Static content — fine as-is |
| Notifications | ✅ Built | Browser `Notification` API only; nothing actually fires server-side |
| Content creator | ✅ Built | Text-only share; no image card generation |
| Player database | ✅ Built | Static `players.json` snapshot (1,481 players, June 4 prices) |
| AR view / Telegram bot / Draft | ⚠️ Stubs | "Coming Soon" placeholders |
| Auth / user accounts | ❌ Missing | Everything is anonymous localStorage |
| FIFA sync | ❌ Missing | No connection to play.fifa.com |
| Backend / database | ❌ Missing | 100% client-side |
| Payments | ❌ Missing | N/A |

### Core architectural gap
The entire app is a static client-side PWA. Every "multiplayer" or "live" feature
is mocked. To become a real platform, we need: **backend, database, auth,
data-ingestion pipeline, and a sync layer with the official game.**

---

## 2. FIFA Fantasy Account Integration & Live Team Sync

### Reality check (important)
FIFA does **not** publish a public Fantasy API. The official game at
`play.fifa.com/fantasy` is an SPA backed by undocumented JSON endpoints
(our `players.json` is one of those payloads). Integration options, in order
of preference:

| Option | How | Risk |
|--------|-----|------|
| **A. Token-based sync (recommended)** | User logs into play.fifa.com, we capture their session bearer token via a guided flow (paste token / bookmarklet / browser extension). Backend calls the same endpoints the official SPA calls: squad, transfers, points, leagues. | Token expiry; FIFA ToS gray area; endpoint changes |
| B. Headless scrape | Server-side Playwright session per user | Heavy, fragile, likely ToS violation at scale |
| C. Manual import | User pastes their team ID / screenshots; OCR or public team-ID endpoint (FIFA fantasy team pages are publicly viewable by ID, like FPL) | Read-only, but zero auth risk |
| D. Mirror mode (fallback) | No sync — our platform is the source of truth, user mirrors moves manually into the official game | Zero risk, worse UX |

**Plan: ship C (team-ID import, read-only) first — lowest risk, immediate value.
Layer A on top for power users behind a "Connect FIFA Account" advanced flow.
Keep D as the always-works fallback.**

### Sync features
- **Import team by FIFA team ID** → pulls squad, captain, points, rank
- **Scheduled re-sync** (cron, every 15 min during live rounds; hourly otherwise)
- **Diff detection** → "Your official team changed: Kane → Watkins. Update mirror?"
- **Write-back (Option A users only):** make transfers / captain changes from our
  UI that execute against the official game
- **Conflict resolution screen** when local plan ≠ official team

### New screens
1. Onboarding: "Connect your FIFA team" (3 paths: team ID / token / skip)
2. Sync status panel (last synced, diffs, re-sync button)
3. Conflict resolution modal

---

## 3. Team Builder & Squad Management (upgrade path)

Current builder is good. Production gaps:

- **Server-validated rules engine** — one shared TypeScript package
  (`packages/rules-engine`) implementing: budget ($100M → $105M at R32),
  position quotas (2 GK / 5 DEF / 5 MID / 3 FWD), per-country limits by stage
  (3/3/4/5/6/8), formation validity (7 legal formations), transfer allocations
  per window, -3pt hit calculation. Used by web client AND backend so they
  can never disagree.
- **Draft/published states** — edit freely in a draft, publish to lock
- **Squad versioning** — every change snapshotted; powers the Decision Analyser
- **Price/ownership refresh pipeline** — replace static `players.json` with
  nightly-ingested data (see §12 pipeline)
- **Multi-team** moves from in-memory to DB (each team a row, shareable by link)

---

## 4. Transfers, Captaincy & Budget Management

- **Transfer windows as server state** — windows open/close by cron against the
  official schedule (Jun 17, Jun 22, Jul 1 unlimited+$5M, Jul 8, Jul 14, Jul 18, Jul 21);
  client reads window state from API, never hardcodes dates
- **Transfer basket** — queue multiple moves, see net budget + point-hit before confirm
- **Free-transfer ledger** per user per window, with carry-over logic (1 carries in groups)
- **Booster state machine** — wildcard/12th man/max captain/qualification/mystery:
  one-use enforcement, activation windows, reversal rules (all reversible pre-lockout except wildcard)
- **Captaincy planner** — plan C/VC for future rounds; alerts if captain's match starts and they're benched in real life
- **What-if ledger** — every transfer records projected vs actual points gained (powers Decision Analyser)

---

## 5. Live Scores, Fixtures & Points Tracking

### Data sources (pick one primary + one fallback)
| Provider | Coverage | Cost |
|----------|----------|------|
| API-Football (api-sports.io) | Full WC fixtures, lineups, events, live | ~$39/mo tier sufficient |
| Sportmonks | Same + xG | ~€39/mo |
| football-data.org | Free tier, slower updates | Free/cheap fallback |

### Pipeline
```
Provider webhook/poll (30s during matches)
  → ingestion worker (normalize events)
  → Postgres (events, lineups, scores)
  → points calculator (apply FIFA scoring matrix from rules engine)
  → Redis pub/sub → WebSocket/SSE fan-out to clients
  → push notification triggers
```

### Features
- Live fixture list with minute-by-minute events
- **Live fantasy points per player** (computed by us from events — appearance,
  goals by position, assists, clean sheets after 60', cards, saves/3, etc.)
- Bonus detection: direct free-kick goals (+1), scouting bonus (>4pts & <5% owned → +2)
- Auto-sub simulation at round close (respecting "manual change cancels auto-subs")
- League-wide live rank movement
- Prediction game settlement (finally settles the predictions users already make)

---

## 6. Player Statistics, Form Analysis & Performance Predictions

- **Stats warehouse:** per-player per-match rows (minutes, goals, assists, shots,
  chances created, tackles, saves, cards) from the data provider — both WC matches
  and pre-tournament club form (we already researched 2025-26 club seasons; seed DB with it)
- **Form engine:** rolling 5-match weighted form score; minutes-security score
  (started vs subbed); set-piece role registry (we built this table already)
- **Expected points model (xPts):**
  - v1: transparent heuristic — `xPts = f(fixture difficulty, form, position scoring rates, set-piece role, minutes security, clean-sheet probability)`
  - v2: gradient-boosted model trained on round results as the tournament progresses
- **Fixture difficulty ratings** — Elo-style team ratings updated after every match
- **Player comparison screen** — head-to-head any two players
- **Ownership trends** — daily snapshot of `percentSelected` → "transfer market momentum" charts (feature #52, currently impossible with static data)

---

## 7. AI-Powered Recommendations (replace the heuristics)

Powered by Claude API (`claude-sonnet-4-6` for cost/quality balance) + the stats warehouse:

| Feature | Input | Output |
|---------|-------|--------|
| Transfer advisor | User squad + window state + xPts + injuries | Ranked transfer pairs w/ reasoning |
| Captain advisor | Starters + fixtures + xPts | C/VC pick + confidence + reasoning |
| Wildcard architect | Full player pool + budget + remaining fixtures | Complete 15-man rebuild |
| Natural-language scout | Free-text query ("attacking fullback under 6M from a QF team") | Filtered player list (LLM → structured filter, runs against DB) |
| Daily briefing | Overnight events + user squad | Personalized morning summary (push + in-app) |
| Injury watch | News ingestion (RSS/news API) classified by LLM | Player risk flags with sources |

Implementation notes:
- All LLM calls server-side with **prompt caching** (player pool context is large and stable per day)
- Cache recommendations per (squad-hash, round) — most users share popular squads
- Rate-limit free tier; uncapped for premium

---

## 8. League Management & Leaderboards

- Real leagues in Postgres: create/join (invite code), public/private, admin controls (kick, rename, lock)
- **Scoring sources:** (a) our mirror points, or (b) official synced points for connected users — league setting chooses
- Leaderboards: global, per-country-supported, per-league, weekly round winners
- League features from idea list: head-to-head mode, cup brackets within leagues, trash-talk board (with moderation), league chat
- **Materialized leaderboard views** refreshed after each points recalc (don't rank 100k users on every request)

---

## 9. Notifications & Alerts

| Channel | Tech |
|---------|------|
| Web push | Web Push API + VAPID, service worker already in place via next-pwa |
| Email | Resend/Postmark — weekly digest + lockout reminders |
| Telegram bot | grammY bot (finally un-stub `/bot`) — /squad /captain /points commands + push alerts |

Server-side triggers (all currently impossible client-only):
- T-2h lockout reminder (only if user has unused free transfers)
- Your player scored / assisted / red card — during live matches
- Captain DNP → VC activated
- Injury news flag on owned player
- League overtake ("Sweet's XI just passed you")
- Booster suggestion windows

Notification preferences per channel per event type (UI already built — wire it to backend).

---

## 10. User Profiles & Authentication

- **Auth:** NextAuth.js (Auth.js v5) — Google + Apple OAuth, magic-link email fallback. No passwords.
- **Profile:** display name, avatar, country supported (drives country leaderboards), favorite club
- **Migration path:** on first sign-in, lift existing localStorage state (squad, predictions, badges) into the DB — current anonymous users lose nothing
- **Roles:** user / league-admin / moderator / admin
- **Privacy:** public profile = team name + points only; GDPR delete-my-account flow

---

## 11. Pricing: 100% Free — No Monetization

**Owner decision (firm): the entire platform is free. No subscriptions, no premium
tiers, no ads, no paywalls. Every feature ships to every user.**

This simplifies the build significantly:
- ❌ No Stripe integration, no `subscriptions` table, no tier-gating middleware
- ❌ No billing router, no checkout/portal screens
- ✅ One code path for all users

### Cost control (since there's no revenue, keep running costs near zero)
| Cost center | Strategy |
|-------------|----------|
| Database | Neon free tier (0.5GB) is enough for a personal/community deployment |
| Redis | Upstash free tier (10k commands/day) + aggressive response caching |
| Football data | football-data.org free tier as primary; API-Football cheap tier ($39/mo for the 6-week tournament) only if free tier proves too slow |
| Claude API | Cache AI recommendations per (squad-hash, round) — popular squads share results; daily briefing generated once per squad-archetype, not per user; soft rate-limit of N AI calls/user/day purely for cost protection (not a paywall — limit applies equally to everyone) |
| Hosting | Vercel hobby tier covers a personal deployment; upgrade only if usage demands |

---

## 12. Technical Architecture

### Target stack
```
┌─────────────────────────────────────────────────────────┐
│  Next.js 16 App (Vercel) — existing PWA, keeps domain   │
│  fantasy.amritpodder.dev                                │
│  + API routes (tRPC or REST) + Server Components        │
└──────────────┬──────────────────────────────────────────┘
               │
   ┌───────────┼───────────────┬─────────────────┐
   ▼           ▼               ▼                 ▼
 Postgres    Redis          Workers           Claude API
 (Neon)      (Upstash)      (Inngest or       (AI recs,
 core data   cache, pub/sub, Vercel Cron +    briefings,
 + pgvector  rate limits,   QStash)           news classify)
 for search  live fan-out   - data ingestion
                            - points calc
                            - sync jobs
                            - notifications
   ▲
   │
 Football data provider (API-Football primary, football-data.org fallback)
 FIFA fantasy endpoints (sync service, isolated module — easy to disable)
```

Everything serverless/managed — no servers to babysit, scales to zero between rounds,
fits Vercel deployment we already have.

### Database schema (core tables)
```sql
users            (id, email, name, avatar, country_supported, tier, created_at)
fifa_links       (user_id, fifa_team_id, token_encrypted?, last_sync, sync_mode)
players          (id, fifa_id, name, position, squad_id, price, percent_selected, status)
player_stats     (player_id, match_id, minutes, goals, assists, ..., fantasy_pts)
teams            (id, user_id, name, is_primary, created_at)          -- multi-team
team_snapshots   (team_id, round_id, squad_jsonb, formation, captain_id, vc_id)
transfers        (id, team_id, round_id, out_id, in_id, points_hit, created_at)
boosters         (team_id, booster_type, round_used, activated_at)
rounds           (id, name, lock_at, free_transfers, budget_boost, country_limit)
fixtures         (id, round_id, home, away, kickoff, status, score_h, score_a)
match_events     (fixture_id, player_id, type, minute, payload_jsonb)
leagues          (id, name, code, type, owner_id, settings_jsonb)
league_members   (league_id, user_id, joined_at)
leaderboard_mv   (materialized view: scope, user_id, rank, points)
predictions      (user_id, fixture_id, home, away, settled, points)
badges           (user_id, badge_id, earned_at)
notifications    (user_id, type, channel, payload, sent_at, read_at)
```

### API surface (tRPC routers)
`auth` · `team` (CRUD, validate, publish) · `transfers` (window, basket, confirm) ·
`players` (search, stats, compare, xPts) · `live` (fixtures, events SSE) ·
`leagues` · `ai` (recommend, scout, briefing) · `sync` (link, import, diff, writeback) ·
`notifications` (prefs, register-push)

### Scalability notes
- Tournament traffic is extremely spiky (lockout hours, match minutes). Serverless + Redis caching of hot reads (live points, leaderboards) handles this; pre-compute everything possible.
- Points calc is idempotent and event-sourced from `match_events` — recompute anytime a feed correction arrives.
- All FIFA-sync code in one isolated module with a kill-switch flag, so the platform never goes down if FIFA changes endpoints.

---

## 13. Phased Roadmap

| Phase | Scope | Effort |
|-------|-------|--------|
| **P0 — Backend foundation** | Neon Postgres + Auth.js + migrate localStorage state + players ingestion job (replaces static players.json) | 1–2 wks |
| **P1 — Live data** | API-Football integration, fixtures/events ingestion, points calculator, live page on real data, prediction settlement | 1–2 wks |
| **P2 — FIFA sync (read)** | Team-ID import, scheduled re-sync, diff screen | 1 wk |
| **P3 — Real leagues + notifications** | Leagues backend, leaderboard MVs, web push + Telegram bot, lockout reminders | 1–2 wks |
| **P4 — AI layer** | Claude-powered advisor endpoints replacing heuristics, daily briefing, NL scout | 1 wk |
| **P5 — FIFA sync (write)** | Token flow + write-back transfers/captain (behind feature flag) | 1 wk, high-risk |
| **P6 — Polish** | Decision analyser, ownership trends, player compare, share-card image generation (Vercel OG), un-stub AR/draft or cut them | ongoing |

P0–P3 = a real product. P4 = the intelligence. P5 = the moonshot differentiator.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| FIFA changes/blocks endpoints | Isolated sync module + kill switch; mirror-mode always works |
| FIFA ToS objection to write-back | Ship read-only first; write-back opt-in, clearly user-initiated |
| Data provider lag/cost spike | Dual-provider abstraction layer |
| 6-week event = short lifespan | Architecture is competition-agnostic (`rounds`, `fixtures` are generic) — relaunch free for Euro 2028 / WC 2030 |
| No revenue but real running costs | Free-tier infra everywhere (Neon, Upstash, Vercel hobby, football-data.org); aggressive caching on AI calls; only paid item if needed is ~$39/mo match data for 6 weeks |
| Solo-dev scope creep | Phases are strictly ordered; P0–P1 before anything shiny |

---

## 15. Production Operations (the unglamorous must-haves)

Items every production platform needs that feature plans usually forget:

### Quality & delivery
- **Testing:** Vitest unit tests for the rules engine (the one place a bug = wrong
  points = angry users) and points calculator; Playwright smoke tests for the
  5 critical flows (build team, transfer, captain change, join league, live view).
  Rules engine targets ~100% coverage — it's pure functions, cheap to test.
- **CI/CD:** GitHub Actions — typecheck + lint + test on every PR; Vercel preview
  deployments already exist per-branch; protect `main`.
- **Database migrations:** Drizzle ORM with versioned migrations (pairs perfectly
  with Neon branching — preview deploys get a DB branch).

### Observability
- **Error tracking:** Sentry (free tier) — client + server.
- **Uptime & cron monitoring:** healthcheck endpoint + Better Stack/UptimeRobot free
  tier; every Inngest/cron job reports success-failure (a silently dead ingestion
  job during a live round is the worst failure mode this platform has).
- **Product analytics:** PostHog free tier (self-serve funnels: onboarding
  completion, sync adoption, feature usage) — privacy-friendly config, EU hosting.

### Security
- Rate limiting on all mutating endpoints (Upstash Ratelimit).
- FIFA tokens (if Option A ships) encrypted at rest (AES-256-GCM, key in env),
  never logged, purge on disconnect.
- Standard headers (CSP, HSTS) via Next middleware; dependency audit in CI.
- Input validation with Zod at every API boundary (tRPC gives this nearly free).

### Compliance & legal
- Privacy policy + terms pages (required by OAuth providers and app stores).
- GDPR: export-my-data + delete-my-account flows (delete already noted in §10).
- Cookie/consent banner only if analytics requires it (PostHog cookieless mode avoids it).
- Clear "not affiliated with FIFA" disclaimer — naming/branding must avoid
  implying official status (consider product name without "FIFA" in it).

### Internationalization & accessibility
- **i18n:** next-intl with English at launch; Spanish + Portuguese next (WC audience);
  all strings externalized from day one — retrofitting i18n is brutal.
- **Time zones:** all kickoff/lockout times stored UTC, rendered in user's locale —
  a wrong lockout reminder is a catastrophic bug for a fantasy app.
- **Accessibility:** WCAG AA pass on the 5 core flows; the current dark theme needs
  a contrast audit (slate-400 on slate-900 body text is borderline).

### Admin & moderation
- Internal admin panel (simple protected route): user lookup, league moderation
  (rename/remove offensive content), feature flags, kill switches (FIFA sync,
  AI endpoints), manual points-correction tool for feed errors.
- Profanity filter on team names, league names, and trash-talk board.

### Data lifecycle
- Neon point-in-time recovery covers backups (verify retention on free tier).
- Post-tournament: archive mode — leaderboards/history become read-only static
  pages; expensive infra (Redis, data feeds, crons) shuts down.

---

## 16. Deliberately Deferred (from the 65-idea list)

Explicitly **not** in this plan, with reasons — so nothing is silently missing:

| Idea | Status | Reason |
|------|--------|--------|
| Voice assistant / Alexa skill | Deferred | Niche; Web Speech API can come post-P6 |
| Jersey scanner (computer vision) | Deferred | High effort, gimmick-level value |
| AR pitch view | Cut or P6 | WebXR support too patchy on iOS Safari |
| Live watch party | Deferred | Realtime video-sync infra ≫ value for v1 |
| Podcast generator | Deferred | TTS cost with zero revenue; written briefing covers it |
| Auto highlight reels / YouTube clipper | Deferred | Rights/copyright minefield |
| Kids mode | Deferred | Separate UX track; revisit if audience appears |
| Apple Watch / home-screen widgets | Deferred | Requires native app, not PWA |
| Chrome extension / Discord bot | Deferred | Telegram bot covers the bot need first |
| Fantasy GM simulation mode | Deferred | Separate game, not companion-platform scope |
| Metaverse stadium / NFTs / biometrics | Cut | Not aligned with a free community product |
| Cross-sport platform | Future | Architecture supports it; not this tournament |
| Mentor system / fantasy school expansion | Partial | Education page ships as-is; mentoring needs critical user mass |
| Daily challenges | P6 candidate | Fun but needs the leagues backend first (P3) |
| Historical WC fantasy database | Deferred | 2018/2022 fantasy data not publicly available |
| Calendar (Google/Apple) integration | P6 candidate | Easy win post-launch; .ics export is trivial |
```
