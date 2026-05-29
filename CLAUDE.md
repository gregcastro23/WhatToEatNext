# WhatToEatNext - Claude AI Assistant Guide

_Version: 3.1.0 — "Modern Alchemist" · MCP release | Last Updated: May 29, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **3.1 — "MODERN ALCHEMIST" · MCP RELEASE — SHIPPED**

3.0 (PRs #402–#406, `git tag v3.0.0` cut) shipped the redesigned surface; **3.1 layers a published MCP server, production-readiness hardening, and a schema-drift cleanup on top.** A 3.1 tag is not yet cut.

- **Version**: ✅ **3.1.0** (`git tag v3.0.0` is cut; 3.1 tag pending)
- **Build**: ✅ **0 TS errors, 0 lint warnings** before every PR (husky pre-commit runs `typecheck && lint`)
- **Toolchain**: ✅ **BUN v1.3.13** (Yarn fully retired)
- **Stack**: Next.js 15 · React 19 · TypeScript 5.7
- **Database**: ✅ **RAILWAY POSTGRES** (`postgres.railway.internal`) + transaction-mode PgBouncer compat (ADR-007, #466)
- **Read Model**: ✅ **DENORMALIZED** (sub-100ms recipe loads via `read_model` JSONB)
- **Migrations**: ✅ **TRACKED + AUTO-APPLIED** — `_migrations` table + `scripts/migrate.ts` (TS) / `backend/scripts/run_init_migrations.py` run on Railway deploy before uvicorn (#448)

### 🚀 Shipped in 3.1 (on top of 3.0)

- **MCP server** — bun-powered MCP tool surface: end-user API keys, Stripe ESMS top-ups, synastry tool, telemetry + synthetic-probe + token-economy instrumentation, cross-server admin panel (#454, #455, #457, #459; migrations 44–47)
- **Production-readiness hardening** — security, DB resilience, calc guards (#465); PgBouncer transaction-mode compat + connection hardening (#466); internal-URL centralization via `src/lib/serviceUrls.ts` (`getServiceUrl`/`getServiceUrlSafe`, fail-loud — #467)
- **Schema-drift cleanup + migration runner** — restored lost column defaults, applied skipped migrations (incl. 31), tracking table + runner wired into the deploy (#448)
- **Calc observability** — additive `degraded` flag (`src/types/degraded.ts`) threaded from the positions layer (`astronomy-engine-fallback` / `stale-positions`) and `alchemize` (`monica-degenerate`) through `/api/alchm-quantities` to a badge on `/quantities` _(committed on `feat/calc-degraded-flag`, PR pending)_
- **DB module hygiene** — raw pool extracted to `src/lib/database/rawPool.ts`, breaking the `connection.ts ↔ slowQueryLog` import cycle _(committed, PR pending)_

### 🛠 In flight

- **WTEN migration** — porting the `planetary_agents-main` UI into `src/` (5 of 11 sessions done — see `WTEN_MIGRATION_PLAN.md`)
- **Real recommendations** — real planetary alchemy replacing mock fallbacks in recommendation/cuisine services

### Toolchain — always use `bun`, never `npm` or `yarn`

```bash
bun install          # install dependencies
bun run dev          # start dev server
bun run build        # production build (must pass 0 errors / 0 warnings before PR)
bun run verify       # typecheck + lint (does NOT run next build — see gotcha below)
bun run test         # run tests
bun <script.ts>      # run TypeScript scripts directly (no ts-node/tsx needed)
```

`packageManager` is pinned to `bun@1.3.13` in `package.json`. The lockfile is `bun.lock`.

> **Build gotchas (Next.js 15):** `bun run verify` does NOT exercise the production `next build` — always `bun run build` before pushing route-handler changes. The husky pre-commit hook runs `typecheck && lint`. Next.js 15 route type-check rejects generic context typings like `Record<string, unknown>` — use rest-tuple generics for dynamic routes. CSS Modules reject bare `:global(.foo)` without a local class.

### Repo conventions

- **`master`** is production. **`main`** is stale — do not target it.
- New work branches off `master`. PRs target `master`.
- Vercel auto-deploys frontend on `master` merge. Railway auto-deploys Python backend.

---

## Environment Variables (Production)

```bash
# Database (Railway internal network)
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# APIs & Secrets
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
INTERNAL_API_SECRET=<internal-api-secret>
GALILEO_API_KEY=<galileo-api-key>

# Planetary Agents (PA) — cross-project integration
PLANETARY_AGENTS_API_URL=https://api.agents.alchm.kitchen        # PA Python/FastAPI backend
NEXT_PUBLIC_PLANETARY_AGENTS_URL=https://api.agents.alchm.kitchen
NEXT_PUBLIC_AGENTS_UI_URL=https://agents.alchm.kitchen           # PA Next.js UI (agent chat)

# Cron / synthetic monitoring
CRON_SECRET=<random-32-char-secret>                              # Vercel cron header (all /api/cron/* routes)
SYNTHETIC_PROBE_TOKEN=<jwt-for-synthetic-user>                   # bearer for synthetic-probe calls (onboarding, recipe, recommendations, auth)
SYNTHETIC_PROBE_BASE_URL=https://alchm.kitchen                   # optional override; defaults to VERCEL_URL

# Alerting (system-health snapshot cron uses these — all optional, each sink degrades independently)
ALERT_SLACK_WEBHOOK_URL=<slack-incoming-webhook-url>             # optional; alerts skip Slack when unset
ALERT_COOLDOWN_MINUTES=60                                         # per (component, current_status) cooldown; 0 disables dedupe
SLOW_QUERY_THRESHOLD_MS=200                                       # tunable threshold for slow_query_log

# Auth (NextAuth.js v5)
AUTH_SECRET=<auth-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_ADMIN_EMAIL=<admin-email>
AUTH_URL=https://alchm.kitchen
AUTH_TRUST_HOST=true

# Payment & Messaging
STRIPE_SECRET_KEY=<stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-pub-key>
RESEND_API_KEY=<resend-api-key>
SMTP_PASS=<smtp-pass>
SMTP_USER=<smtp-user>
```

---

## Core Architecture

- **Three-Tier Hierarchical Data**: Ingredients → Recipes → Cuisines
- **NextAuth.js v5**: Google OAuth with Server/Edge split config; JWT carries `sessionId` + `deviceSessionId`
- **Denormalized Recipes**: `read_model` JSONB column for high-speed delivery; eliminates N+1 queries
- **Frontend**: Next.js on Vercel with Bun build pipeline (`bun.lock` committed)
- **Backend**: Python service on Railway (standalone), with `SafePositionsRecord` Zod transform
- **Agent network**: planetary agents are first-class users (`is_agent = true`, `@agentic.alchm.kitchen` emails), cross-synced with the PA project via `/api/admin/*-sync` → PA `/api/internal/agent-sync`

---

## 3.0 Surface Map

### Navigation & chrome

- **5-slot nav IA** (`src/config/navigation.ts`): Kitchen / Discover / Plan / Commensal / Lab
- **`RedesignedHeader`** — desktop nav with mega-menus + ⌘K affordance
- **`MobileGlassTabBar`** — 5-slot bottom nav (mobile)
- **`AppChromeFooter` / `AppChromeTabBar`** — gate chrome on chromeless paths
- **`CommandPalette`** (`src/components/nav/CommandPalette.tsx`) — ⌘K global palette: routes + actions + recent
- **Route group `(alchm)`** — dark chrome for auth-gated + app-surface pages (birth-chart, current-chart, recipe-generator, planetary-chart, restaurant-creator, commensal, feed, cosmic-recipe, generated-recipe, food-tracking, profile/*)

### Auth flows

- **`AuthHandshake`** — 6-step checklist at `/auth/establishing`
- **`WelcomeBack`** — returning-user splash
- **`UpgradeGate`** — two-tier (Apprentice / Alchemist) at `/upgrade`
- **`AccountSessions`** — device session log + revoke at `/profile/security`
- **`AuthScreens`** (`src/components/auth/AuthScreens.tsx`) — `SignInScreen`, `AuthErrorScreen`, `OnboardingFlow`
- **Device sessions** — `database/init/33-device-sessions.sql`; `GET/DELETE /api/auth/sessions`
- **Auth-event log** — `database/init/34-auth-events.sql` — structured sign-in/sign-out/failure events
- **Onboarding skip** — "Skip for now" → `PATCH /api/onboarding { skipNatal: true }` → `/?prompt=natal`; `NatalPromptBanner` ribbon dismissable via localStorage

### Admin operator console

Admin-gated to `gregcastro23@gmail.com` with `role === "admin"` (`src/app/admin/layout.tsx`).

- **`/admin`** — Operational dashboard. Top-to-bottom:
  - `TodaysHighlightsPanel` — 8 tiles, 24h vs prior-24h deltas (signups, active users, onboardings, recipe activity, diary entries, token txns, agent events, sign-in failures). 5 min polling.
  - `LiveActivityPanel` — merged chronological feed from 6 sources (`users`, `auth_events`, `user_profiles`, `feed_events`, `token_transactions`, `user_interactions`) with per-category filter chips. 30s polling.
  - `SystemStatusPanel` — per-flow health for 8 critical flows (auth, onboarding, recommendations, AI generation, economy, payments, agents, database) + external dependency strip (PA, Stripe, Google OAuth). 60s polling.
  - `OnboardingFunnelPanel` — 24h funnel (signups → birth data → natal chart → complete), stuck-user table (>1h, not onboarded), `/api/onboarding` health, recent completions. 2 min polling.
  - `ApiRouteHealthPanel` — top endpoints by traffic with per-route 4xx/5xx + p95. 30s polling.
  - `AdvancedMetricsPanel` + Planetary Agents card + Recent Users — existing.
- **`/admin/dashboard`** — High Alchemist dashboard (✦): full-bleed dark operator console. Agent topology + role distribution + dispatch stream + leaderboard now wired to live data via `/api/admin/agents/network`. Deep role-specific panels (sous-chef, galileo, substitution, pantry, procurement, lineage) + reasoning trace have been removed; rebuild per-role panels when there's real role-specific telemetry to surface.
- **`/admin/users`** — user list with **User Type tabs** (All / Humans / Agents) and counts; ⚹ badge + purple-tinted rows for agents; agent profile (Monica constant, bio, 24h feed-event count) shown in row + detail modal; per-user status toggle + token grants.
- **`/admin/settings`** — admin settings
- **Admin API** — `/api/admin/{dashboard,users,users/stats,users/[userId],abuse,observability,digest,agent-sync,planetary-sync,send-test-email,system-status,onboarding-health,live-activity,todays-highlights,agents/network}`; all behind `validateAdminRequest`. The five panel endpoints share a 5s in-memory cache (`src/lib/cache/memoryCache.ts`).
- **`AdvancedMetricsPanel`** — renders sign-up/activity rollups + auth events, abuse detection (suspicious IPs/emails), in-memory request + slow-query rings, digest preview, and a Grant Tokens control

### Operational health services

All compute from existing signals — no new instrumentation required. Each service degrades independently to `live: false` on source failure so a single broken source can't take down the panel.

- **`src/services/systemStatusService.ts`** — `getSystemStatus()` runs 8 flow probes + 3 dependency probes in parallel. Status taxonomy: `OK | DEGRADED | INCIDENT | UNKNOWN`. Exported helpers `worst()` and `statusFromPathHealth()` are unit-tested.
- **`src/services/onboardingHealthService.ts`** — `getOnboardingHealth()` returns 24h funnel, stuck users (>1h not onboarded), `/api/onboarding` request-log slice, recent completions, skip rate. Exported `diagnose()` (pure function) is unit-tested.
- **`src/services/liveActivityService.ts`** — `getLiveActivity()` merges 6 sources via `Promise.allSettled`, normalizes to a common `ActivityEvent`, sorts by timestamp DESC, caps at 50. Each source has per-query LIMIT 25, 6h window.
- **`src/services/todaysHighlightsService.ts`** — `getTodaysHighlights()` runs 8 pair-count queries (today vs prior-24h) in parallel. Sign-in-failures is the only "less is better" metric (inverted delta tone).
- **`src/services/userTimelineService.ts`** — `getUserTimeline(userId)` backs the `/admin/users/[id]` deep-dive page. Identity + token balances + subscription + lifetime stats + chronological event timeline (auth/feed/token/interaction events) for one user.
- **`src/services/syntheticProbeService.ts`** — 5 cron-driven probes exercise critical flows so we catch breakage at low traffic:
  - `runOnboardingSkipProbe()` — `PATCH /api/onboarding`, every 15 min.
  - `runCosmicRecipeProbe()` — `POST /api/generate-cosmic-recipe`, hourly (sparse — spends tokens).
  - `runRecommendationsProbe()` — `POST /api/personalized-recommendations`, every 15 min.
  - `runStripeWebhookProbe()` — `POST /api/stripe/webhook` (unsigned, expects 4xx from sig validator), every 15 min. Never injects real events.
  - `runAuthHandshakeProbe()` — `GET /api/auth/sessions`, every 15 min.

  All results land in `synthetic_probe_results` keyed by `probe_name`. `systemStatusService` reads latest-per-name via `evaluateSyntheticProbe()` and downgrades each flow to INCIDENT on fresh failure, DEGRADED on stale probe (cron broken). Requires `CRON_SECRET` + `SYNTHETIC_PROBE_TOKEN` env vars. Shared auth helper at `src/app/api/cron/_lib/cronAuth.ts`.
- **`src/services/healthSnapshotService.ts`** — `writeSnapshot()` persists hourly captures of the full `SystemStatusPayload` to `system_health_snapshots` (JSONB). `getLatestSnapshot()` powers transition detection; `getRecentSnapshotOverall()` powers drift / week-over-week views.
- **`src/services/alertService.ts`** — fires operator alerts on status transitions. Pure `classifyTransition()` + `diffPayloadsForAlerts()` + `shouldSuppressAlert()` (all unit-tested). `dispatchAlert()` writes to three sinks in parallel: DB (`alert_events` table) + Slack webhook (`ALERT_SLACK_WEBHOOK_URL`) + email via Resend (to `ADMIN_EMAILS`). Each sink dispatches independently; one broken webhook never blocks the others. UNKNOWN transitions don't alert (monitoring loss, not health). Recoveries to OK alert as `info`. **Cooldown** (`ALERT_COOLDOWN_MINUTES`, default 60): a repeat alert for the same `(component, current_status)` pair within the window records to DB with `dispatch.suppressed = true` but skips Slack + email. Prevents flapping from spamming operators while preserving the audit trail.
- **`src/lib/observability/requestLog.ts`** — extended with `summarizePath()` (per-prefix health) and `summarizeAllPaths()` (per-distinct-path stats). Writes are mirrored to `request_log_entries` via fire-and-forget; on cold start the in-memory ring hydrates from the last 500 DB rows on first read.
- **`src/lib/observability/slowQueryLog.ts`** — same persistence pattern against `slow_query_log_entries` (uses raw pool to avoid recursion). Threshold tunable via `SLOW_QUERY_THRESHOLD_MS`.
- **`src/lib/observability/alertLog.ts`** — in-memory ring of the last 100 dispatched alerts, hydrated from `alert_events` on cold start (`hydrateAlertRingFromDb()`). Backs the recent-alerts admin panel without paying a DB round-trip per poll.

### Cron registry (vercel.json)

| Path | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/synthetic-onboarding` | `*/15 * * * *` | onboarding-skip probe |
| `/api/cron/synthetic-recommendations` | `*/15 * * * *` | recommendations probe |
| `/api/cron/synthetic-stripe-webhook` | `*/15 * * * *` | stripe-webhook reachability probe |
| `/api/cron/synthetic-auth-handshake` | `*/15 * * * *` | auth-handshake probe |
| `/api/cron/synthetic-cosmic-recipe` | `0 * * * *` | cosmic-recipe gen probe (hourly — spends tokens) |
| `/api/cron/system-health-snapshot` | `0 * * * *` | hourly status snapshot + transition-based alert dispatch |
| `/api/cron/observability-prune` | `0 3 * * *` | daily prune of `request_log_entries` + `slow_query_log_entries` older than 7 days (override via `?retain=N`) |

### Planetary Agents (PA) integration

Three-project loop: **alchm.kitchen** (this repo) ↔ **PA** ↔ **WTEN backend**.

- **Endpoint registry** — `alchm.kitchen` (Next app) · `agents.alchm.kitchen` (PA UI — agent profiles + chat) · `api.agents.alchm.kitchen` (PA Python backend) · `whattoeatnext-production.up.railway.app` (WTEN legacy backend). NOTE: `agents.` and `api.agents.` are different hosts.
- **Agents are users** — `is_agent = true`, `@agentic.alchm.kitchen` emails (`database/init/23-agentic-users-schema.sql`, `31-agent-profile-columns.sql`)
- **Sync** — `POST /api/admin/{agent-sync,planetary-sync}` proxy to PA's `/api/internal/agent-sync` with `INTERNAL_API_SECRET`; supports sync-all and sync-one
- **Feed ↔ chat** — agent actors in `/feed` deep-link to PA chat (`src/lib/agents/agentChatUrl.ts` → `/gallery/chat/[id]`)
- **Helpers** — `src/lib/agents/` (`agentChatUrl`, `fetchAgentProfile`, `craftedAgentTypes`, `kinetic-profiles`)

### Agent telemetry (live)

- **`src/services/agentTelemetryService.ts`** — `getAgentNetworkTelemetry()` computes 3 metrics from real sources, replacing the old `mockedTelemetry` fixture:
  - `transmutationRate` — agent `feed_events` recorded in the last hour (DB)
  - `spiritualEntropy` — normalized Shannon entropy of the trailing-24h event-type mix (DB)
  - `agentHarmony` — elemental balance of the live sky (ephemeris)
  - Each metric degrades independently to a neutral `live: false` fallback — the dashboard never hard-fails.
- **`src/hooks/useHardenedPolling.ts`** — visibility-aware polling with error backoff + no-overlap; the standard for live admin/operator surfaces (prefer hardened polling over SSE — Vercel serverless kills long-lived connections).

### MenuPlannerContext (refactored)

2182-line monolith split into 7 modules in `src/contexts/menu-planner/`:

- `types.ts`
- `useWeekNavigation.ts`
- `useMealSlots.ts`
- `useCostEstimation.ts`
- `useGenerationPreferences.ts`
- `MenuPlannerProvider.tsx` (composes the four hooks above)
- `MenuPlannerContext.tsx` barrel

Public API unchanged — no consumers touched.

### Analytics events (3.0)

- `track("command_palette_open")`
- `track("upgrade_gate_shown", { tier, from })`
- `track("upgrade_gate_converted", { plan: "alchemist" })`
- `track("auth_handshake_completed", { stepsCompleted: 6 })`

### Reference docs

- `CHANGELOG.md` — keep-a-changelog from v1.0.0 → 3.0.0
- `README.md` — rewritten for v3.0
- `docs/API_REFERENCE.md` — all `/api/*` routes
- `docs/adr/001–006` — Architecture Decision Records (006 = operational admin dashboard)
- `WTEN_MIGRATION_PLAN.md` — multi-session plan for the `planetary_agents-main` UI port
- `NEXT_SESSION_PROMPT.md` — post-3.0 backlog and known technical debt

---

## WTEN Migration (in progress)

Porting the `planetary_agents-main` Next.js UI surface into this repo's `src/`. Tracked in **`WTEN_MIGRATION_PLAN.md`** — ~54 files / ~22k LOC across 11 sessions; **5 done** (foundation libs, leaf modules, astronomy/ephemeris, planetary-config-helper, monica + alchemy core).

- **Source repo** — `/Users/cookingwithcastro/Desktop/planetary_agents-main` (sibling on disk; read-only — all ports copy FROM it)
- **Staging dir** — `wten-migration-ui-components/` at repo root: untracked, excluded from `tsconfig.json` so it doesn't poison typecheck/lint. The final session removes the exclusion.
- New deps added en route: `date-fns@2` + 6 shadcn components (`dialog`, `separator`, `switch`, `alert`, `textarea`, `alert-dialog`).

---

_Updated May 29, 2026 (v3.1) — MCP server: end-user API keys, Stripe ESMS top-ups, synastry tool, cross-server admin panel, telemetry/probe/economy instrumentation (#454/#455/#457/#459). Production-readiness hardening (#465) + PgBouncer transaction-mode compat (ADR-007, #466) + serviceUrls centralization (#467). Schema-drift cleanup + tracked, auto-applied migration runner — `_migrations` table, `scripts/migrate.ts`, Railway-deploy hook (#448). Calc observability: additive `degraded` flag from the positions layer and monica through `/api/alchm-quantities` to a `/quantities` badge. DB raw-pool extraction breaks the `connection ↔ slowQueryLog` cycle. Bun 1.3.13._
