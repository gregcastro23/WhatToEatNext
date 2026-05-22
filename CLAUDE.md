# WhatToEatNext - Claude AI Assistant Guide

_Version: 3.0.0 — "Modern Alchemist" | Last Updated: May 22, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **3.0 "MODERN ALCHEMIST" — SHIPPED**

- **Version**: ✅ **3.0.0** (PRs #402–#406 merged; `git tag v3.0.0` still pending on master)
- **Build**: ✅ **0 TS errors, 0 lint warnings** before every PR
- **Toolchain**: ✅ **BUN v1.3.13** (Yarn fully retired)
- **Stack**: Next.js 15 · React 19 · TypeScript 5.7
- **Database**: ✅ **RAILWAY POSTGRES** (Internal: `postgres.railway.internal`)
- **Read Model**: ✅ **DENORMALIZED** (Sub-100ms recipe loads via `read_model` JSONB column)
- **Latency**: ✅ **SUB-1MS** DB response times via Railway internal networking
- **Backend hardening**: ✅ `_aspects` schema fix deployed; `SafePositionsRecord` Zod transform live

### 🛠 Post-3.0 — in flight (May 19–22)

- **Admin operator console** — `/admin/*`: overview, High Alchemist dashboard, user management, advanced metrics
- **Planetary Agents (PA) integration** — `alchm.kitchen ↔ PA ↔ WTEN` three-project loop wired
- **Live agent telemetry** — `agentTelemetryService` replaces simulated fixtures with DB + ephemeris sources
- **WTEN migration** — porting the `planetary_agents-main` UI into `src/` (5 of 11 sessions done — see `WTEN_MIGRATION_PLAN.md`)
- **Real recommendations** — real planetary alchemy replaces mock fallbacks in recommendation/cuisine services

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

- **`/admin`** — Overview: user stats, `AdvancedMetricsPanel`, Planetary Agents Integration card (endpoint registry, agent sync controls, webhook observability, live telemetry), recent users. Live-polled via `useHardenedPolling`.
- **`/admin/dashboard`** — High Alchemist dashboard (✦): full-bleed dark operator console, ~25 panels in `src/app/admin/_dashboard/`. Mix of live data and seeded prototype panels.
- **`/admin/users`** — user list + per-user status toggle and token grants
- **`/admin/settings`** — admin settings
- **Admin API** — `/api/admin/{dashboard,users,users/stats,users/[userId],abuse,observability,digest,agent-sync,planetary-sync,send-test-email}`; all behind `validateAdminRequest`
- **`AdvancedMetricsPanel`** — renders sign-up/activity rollups + auth events, abuse detection (suspicious IPs/emails), in-memory request + slow-query rings, digest preview, and a Grant Tokens control

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

2182-line monolith split into 5 modules in `src/contexts/menu-planner/`:

- `types.ts` (244 lines)
- `useWeekNavigation.ts` (65)
- `useMealSlots.ts` (498)
- `MenuPlannerProvider.tsx` (1280 — still a candidate for further extraction: `useCostEstimation`, `useGenerationPreferences`)
- `MenuPlannerContext.tsx` barrel (28)

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
- `docs/adr/001–005` — Architecture Decision Records
- `WTEN_MIGRATION_PLAN.md` — multi-session plan for the `planetary_agents-main` UI port
- `NEXT_SESSION_PROMPT.md` — post-3.0 backlog and known technical debt

---

## WTEN Migration (in progress)

Porting the `planetary_agents-main` Next.js UI surface into this repo's `src/`. Tracked in **`WTEN_MIGRATION_PLAN.md`** — ~54 files / ~22k LOC across 11 sessions; **5 done** (foundation libs, leaf modules, astronomy/ephemeris, planetary-config-helper, monica + alchemy core).

- **Source repo** — `/Users/cookingwithcastro/Desktop/planetary_agents-main` (sibling on disk; read-only — all ports copy FROM it)
- **Staging dir** — `wten-migration-ui-components/` at repo root: untracked, excluded from `tsconfig.json` so it doesn't poison typecheck/lint. The final session removes the exclusion.
- New deps added en route: `date-fns@2` + 6 shadcn components (`dialog`, `separator`, `switch`, `alert`, `textarea`, `alert-dialog`).

---

_Updated May 22, 2026 — Post-3.0: admin operator console, Planetary Agents integration, live agent telemetry, and the WTEN migration in progress. Bun 1.3.13. Sub-1ms DB latency via Railway internal networking._
