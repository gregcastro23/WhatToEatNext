# WhatToEatNext - Claude AI Assistant Guide

_Version: 3.0.0 — "Modern Alchemist" | Last Updated: May 18, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **3.0 "MODERN ALCHEMIST" — SHIPPED**

- **Version**: ✅ **3.0.0** (PRs #402–#406 merged; tag `v3.0.0` pending on master)
- **Build**: ✅ **0 TS errors, 0 lint warnings** before every PR
- **Toolchain**: ✅ **BUN v1.3.13** (Yarn fully retired)
- **Database**: ✅ **RAILWAY POSTGRES** (Internal: `postgres.railway.internal`)
- **Read Model**: ✅ **DENORMALIZED** (Sub-100ms recipe loads via `read_model` JSONB column)
- **Latency**: ✅ **SUB-1MS** DB response times via Railway internal networking
- **Backend hardening**: ✅ `_aspects` schema fix deployed; `SafePositionsRecord` Zod transform live

### Toolchain — always use `bun`, never `npm` or `yarn`

```bash
bun install          # install dependencies
bun run dev          # start dev server
bun run build        # production build (must pass 0 errors / 0 warnings before PR)
bun run test         # run tests
bun <script.ts>      # run TypeScript scripts directly (no ts-node/tsx needed)
```

`packageManager` is pinned to `bun@1.3.13` in `package.json`. The lockfile is `bun.lock`.

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
- **Device sessions** — `database/init/33-device-sessions.sql`; `GET/DELETE /api/auth/sessions`
- **Onboarding skip** — "Skip for now" → `PATCH /api/onboarding { skipNatal: true }` → `/?prompt=natal`; `NatalPromptBanner` ribbon dismissable via localStorage

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
- `NEXT_SESSION_PROMPT.md` — post-3.0 backlog and known technical debt

---

_Updated May 18, 2026 — Alchm.kitchen 3.0 "Modern Alchemist" shipped. Bun 1.3.13. Sub-1ms DB latency via Railway internal networking._
