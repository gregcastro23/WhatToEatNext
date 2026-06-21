# WhatToEatNext - Claude AI Assistant Guide

_Version: 3.2.1 | Last Updated: June 17, 2026_

> Sibling guide: **`GEMINI.md`** (repo root) is the concise, actively-maintained status summary. This file is the deeper engineering reference (admin console, observability, cron, surface map). Keep both in sync when project status changes.

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

We operate a three-project loop:
1. **alchm.kitchen (WTEN)** — the core Next.js user-facing platform, deployed on Vercel (this repo).
2. **api.agents.alchm.kitchen (PA Backend)** — the Planetary Agents Python service owning agent personas, orchestration, and LLM recipe generation.
3. **agents.alchm.kitchen (PA UI)** — the Planetary Agents Next.js UI.

## Current Project Status (June 2026 — v3.2.1)

- **Doc version**: **3.2.1** (guide convention; `package.json` is still pinned at `3.1.0` — `git tag v3.1.0` cut 2026-05-29)
- **Build**: ✅ **0 TS errors, 0 lint warnings** before every PR (husky pre-commit runs `typecheck && lint`)
- **Toolchain**: ✅ **BUN v1.3.13** (Yarn fully retired)
- **Stack**: Next.js 15 · React 19 · TypeScript 5.7
- **Database**: ✅ **RAILWAY POSTGRES** (`postgres.railway.internal`) + transaction-mode PgBouncer compat (ADR-007, #466); schema current through **migration 54**. Neon is deprecated on the WTEN side (still used only inside the PA Python backend).
- **Read Model**: ✅ **DENORMALIZED** (sub-100ms recipe loads via `read_model` JSONB)
- **Migrations**: ✅ **TRACKED + AUTO-APPLIED** — `_migrations` table + `scripts/migrate.ts` (TS) / `backend/scripts/run_init_migrations.py` run on Railway deploy before uvicorn (#448)

### 🚀 Shipped since 3.1 (the 3.2.x line)

- **Planetary Agents integration** — agents are first-class users (`is_agent = true`, `@agentic.alchm.kitchen`) with rich profiles (bio, dominant elements, live natal overlays, viewer↔agent synastry, consciousness sigils). Transit clicks open PA group chats; agents publish weekly menus + activity to WTEN `feed_events` via server-to-server endpoints (`X-Sync-Secret` / `INTERNAL_API_SECRET`). Cosmic recipe generation is offloaded entirely to PA's `/api/generate-recipe` (strict `CosmicRecipe` JSON).
- **SpacetimeDB live layer (v4.0)** — Rust `spacetime-module` for live sync of meal plans, commensal lobbies, and grocery carts. Gated via `NEXT_PUBLIC_SPACETIME_URI`; silently falls back to localStorage/REST when the websocket drops or flags are off. Connection hardening: CSP whitelists `wss://` origins, the provider re-establishes on browser `online`/`focus`, and `config.ts` strips `@` and `owner/` prefixes from `NEXT_PUBLIC_SPACETIME_MODULE` (the slash-form module name was itself the prod reconnect-loop bug — fixed to bare `alchm-culinary` in #534). Admin-only `GET /api/admin/diagnostics/spacetime` (#536) surfaces the build-time URI/module/flags for verification.
- **Elemental Signature model** — unified `ElementalSignature` (`src/utils/elemental/signature.ts`) replaces the scattered single-"dominant element" calc. Handles ties ("leans water & earth") without overriding the full 4-vector dot products used for backend recommendations (#505).
- **MCP server + telemetry** — bun-powered MCP tool surface (end-user API keys, Stripe ESMS top-ups, synastry tool). Full visibility via `mcp_invocations` (latencies, tool calls, model tiers); a `*/30` synthetic cron probe exercises the tool handlers in-process (#454, #455, #457, #459; migrations 44–47).
- **Image generation pipeline** — `scripts/generate-recipe-images.ts` uses Cloudflare Workers AI SDXL → R2 bucket to populate `image_url` for recipes/ingredients (`--force` regen, `--id <uuid>` one-offs).
- **Production-readiness hardening** — security, DB resilience, calc guards (#465); PgBouncer transaction-mode compat (#466); internal-URL centralization via `src/lib/serviceUrls.ts` (`getServiceUrl`/`getServiceUrlSafe`, fail-loud — #467).
- **Live-site audit ("emergence from the rubble")** — multi-session production QA cleanup (#526–#536): planetary-chart rebuilt off the engine, natal-chart alchemy backfill (`scripts/backfillNatalChartAlchemy.ts`), coverage-ingredient description + nutrition curation (#535, #536), de-doubled `<title>`s, CSP `wss://` fix, dashboard-honesty pass.

### 🔧 Pre-tech-week hardening (2026-05-31, `audit-reports/site-audit-2026-05-31/`)

- **Version source of truth** — `package.json` is now `3.1.0`; `next.config.js` inlines it as `APP_VERSION` (build-time), which `/api/health` + the structured logger read. Don't reintroduce `process.env.npm_package_version` as a primary source — it's unset in Vercel's runtime (that's what made prod report a stale `2.1.0`).
- **Dashboard honesty** — `/admin/dashboard` no longer fabricates `live`-labelled data; `dashboardPanelsService` returns real zeros (no `mrr || 1612` / `|| 2743` / `84210` floors) and panels show honest "○ STALE / not wired" states. Don't re-add seeded placeholders to the live path.
- **Heavy-route bundle pattern** — `/ingredients` (558 → 180 kB) was split into a **server component** (`page.tsx`) that projects the catalog via `src/lib/ingredients/slimIngredients.ts` (`server-only`) + a `"use client"` island (`IngredientsExplorer.tsx`) fed by props. Use this shape for any heavy-static-data page instead of importing the dataset into a `"use client"` module. The slim field allowlist must track the island's reads **including type-cast reads** (`(ingredient as {...}).image_url`, `getCulinaryDetails`'s `root.*`). `/profile` (268 → 215 kB) code-split its non-default-tab panels via `next/dynamic`.

### 🛠 In flight

- **Web3 go-live** — on-chain ESMS (Base) + StarVault (Arc) + Bazaar spend side; both chains undeployed, pre-launch controls pending.
- **PA-side counterparts** — transit→group-chat (`/api/internal/group-chat`) and a few sync endpoints still pending on the Planetary Agents backend; WTEN falls back gracefully until they ship.

_Done since 3.1:_ the WTEN UI migration from `planetary_agents-main` (all 11 sessions complete — plan file retired) and real planetary-alchemy recommendations (mock fallbacks replaced in the live recommendation/cuisine path).

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
ALCHM_KITCHEN_SYNC_SECRET=<sync-secret-with-planetary-agents>    # X-Sync-Secret for agent→feed_events writes

# SpacetimeDB live layer — NEXT_PUBLIC_* are build-time inlined (changing them needs a redeploy)
# Live flags must be "1", NOT "true", to resolve in code. Module must be the BARE name (no owner/ or @ prefix).
NEXT_PUBLIC_SPACETIME_URI=wss://maincloud.spacetimedb.com
NEXT_PUBLIC_SPACETIME_MODULE=alchm-culinary
NEXT_PUBLIC_SPACETIME_LIVE_CULINARY=1
NEXT_PUBLIC_SPACETIME_LIVE_PLANNER=1
NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL=1
NEXT_PUBLIC_SPACETIME_LIVE_CART=1
NEXT_PUBLIC_SPACETIME_LIVE_FEED=1

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
| `/api/cron/synthetic-mcp` | `*/30 * * * *` | in-process Alchm MCP tool-handler probe |
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

- `GEMINI.md` (repo root) — concise, actively-maintained status summary (sibling to this guide)
- `CHANGELOG.md` — keep-a-changelog from v1.0.0
- `README.md` — project overview
- `docs/API_REFERENCE.md` — all `/api/*` routes
- `docs/adr/001–007` — Architecture Decision Records (006 = operational admin dashboard, 007 = PgBouncer transaction mode)

---

## WTEN Migration (complete)

The `planetary_agents-main` Next.js UI surface (~54 files / ~22k LOC across 11 sessions) has been **fully ported** into this repo's `src/` — `WTEN_MIGRATION_PLAN.md` and the `wten-migration-ui-components/` staging dir have been retired. The PA source repo (`/Users/cookingwithcastro/Desktop/planetary_agents-main`) remains read-only on disk for reference. Deps that landed en route: `date-fns@2` + shadcn (`dialog`, `separator`, `switch`, `alert`, `textarea`, `alert-dialog`).

---

_Updated June 17, 2026 (v3.2.1) — synced from the 3.1 baseline: Planetary Agents are first-class users (profiles, synastry, transit group chats, agent feed + cosmic recipe offload); SpacetimeDB v4.0 live layer (meal plans / commensal / carts) with CSP `wss://` + reconnect + bare-module-name hardening (#534) and admin diagnostics (#536); unified Elemental Signature model (#505); MCP telemetry (`mcp_invocations`) + `*/30` probe; Cloudflare SDXL→R2 image pipeline. WTEN UI migration complete; real planetary-alchemy recommendations live. Live-site "emergence" audit cleanup (#526–#536) incl. natal-chart + coverage-ingredient backfills. Schema through migration 54, Railway-primary DB. Bun 1.3.13._
