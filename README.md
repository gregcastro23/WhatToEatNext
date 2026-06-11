# Alchm.kitchen — v3.2.0

[![Bun](https://img.shields.io/badge/Bun-v1.3.13-black?logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-v15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-v19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Railway](https://img.shields.io/badge/Backend-Railway-6962e0)](https://railway.app)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000)](https://vercel.com)

**The world's first astrological meal-planning system.** Alchm.kitchen bridges ancient alchemical wisdom with modern AI to deliver personalized food recommendations based on natal charts, live planetary positions, elemental harmony, and thermodynamic resonance.

Production: **[alchm.kitchen](https://alchm.kitchen)**

---

## What's new in 3.2 — Planetary Agents & Live State

- **Planetary Agents Integration**: End-to-end telemetry and integration with `agents.alchm.kitchen`. Unified agent profiles featuring live natal chart overlays, viewer↔agent synastry, and consciousness sigils. Agents actively publish weekly menus and share activities (chat, recipe generation) directly into the public `feed_events` via authenticated internal bridges.
- **Cosmic Recipe Generation Offload**: Full decoupling of LLM-generated recipes to the PA Python backend via a first-class `/api/generate-recipe` endpoint, ensuring strictly structured JSON responses via the shared `CosmicRecipe` schema.
- **SpacetimeDB v4 Live Layer**: Complete websocket-driven synchronization for meal plans, commensal lobbies, and grocery carts. Fallbacks gracefully if the connection drops.
- **Elemental Signatures**: Introduced adaptive co-dominant framing ("leans water & earth" or "balanced") across the entire display layer, replacing the inconsistent single-dominant element reduction.
- **Automated Image Generation**: Scripts powered by Cloudflare Workers AI SDXL pipeline to backfill and regenerate beautiful dish and ingredient images to R2 storage.

---

## What's new in 3.1 — MCP release

- **MCP server**: a Bun-powered Model Context Protocol tool surface — connect Claude Desktop / Cursor / Cline, mint a per-user API key at `/profile/api-keys`, and buy ESMS top-ups via Stripe. Tier-aware per-key rate limiting + full telemetry.
- **Operational admin console** at `/admin`: per-flow system status, live activity stream, onboarding funnel watch, today's highlights, and API-route health — all from existing signals, each panel degrading independently. Hourly health snapshots + Slack/email/DB alerting, plus 5 synthetic probes.
- **Tracked, auto-applied migrations**: a `_migrations` table + `scripts/migrate.ts` run on every Railway deploy, closing the schema-drift gap that caused prior signup/dashboard outages.
- **Production-readiness hardening**: PgBouncer transaction-mode compatibility ([ADR-007](docs/adr/007-database-connection-pooling.md)), internal-URL centralization (`src/lib/serviceUrls.ts`), and DB/calc/security guards.
- **Calc observability**: a `degraded` flag surfaces silent astronomy fallbacks and degenerate calculations on `/quantities` instead of letting them masquerade as live data.

See [CHANGELOG.md](CHANGELOG.md) for the full 3.1 detail.

---

## What's new in 3.0 — The Modern Alchemist

- **New navigation IA**: 5-slot primary nav (Kitchen / Discover / Plan / Commensal / Lab) with mega-menus and ⌘K Command Palette
- **New auth flows**: AuthHandshake 6-step checklist, WelcomeBack, two-tier UpgradeGate, device session management
- **Dark alchm chrome**: all app-surface pages now live inside the `(alchm)` route group with the dark `#07060B` shell
- **MenuPlannerContext split**: 2182-line monolith → 5 focused modules in `src/contexts/menu-planner/`
- **Onboarding skip**: "Skip for now" CTA with `?prompt=natal` soft-prompt banner
- **Vercel Analytics funnel events**: CommandPalette, UpgradeGate, AuthHandshake tracked
- **Production bug fix**: `_aspects` array no longer contaminates planet positions dict (three-layer defense)

See [CHANGELOG.md](CHANGELOG.md) for the full history.

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion |
| **Toolchain** | **Bun 1.3.13** (package manager + runtime) |
| **Backend** | Python FastAPI + `pyswisseph` (Swiss Ephemeris) on Railway |
| **Database** | PostgreSQL on Railway (internal: `postgres.railway.internal`) |
| **Auth** | NextAuth.js v5 (Auth.js) — Google OAuth, JWT, device sessions |
| **Payments** | Stripe (checkout + webhook) |
| **Email** | Resend |
| **Analytics** | Vercel Analytics + OpenTelemetry |
| **Frontend hosting** | Vercel (`alchm-kitchen-pro` project) |
| **Backend hosting** | Railway |

---

## Quick start

> **Requirement**: [Bun 1.3.13+](https://bun.sh). Never use `npm` or `yarn` in this repo.

```bash
# 1. Clone
git clone https://github.com/gregcastro23/WhatToEatNext.git
cd WhatToEatNext

# 2. Install (fast — Bun lockfile committed)
bun install

# 3. Copy env template and fill in values
cp .env.example .env.local

# 4. Start dev server
bun run dev
# → http://localhost:3000

# 5. Run tests
bun run test

# 6. Build for production (must pass before every PR)
bun run build

# 7. Lint (must be zero warnings)
bun run lint
```

---

## Project structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── (alchm)/                 # Dark-shell app pages (auth-gated)
│   │   ├── layout.tsx           # Dark #07060B chrome, hides public header
│   │   ├── page.tsx             # Home feed (/)
│   │   ├── lab/                 # /lab — Alchemical Laboratory
│   │   ├── ingredients/[id]/    # /ingredients/:id — ingredient detail
│   │   ├── profile/             # /profile/* — all profile sub-pages
│   │   ├── commensal/           # /commensal — group recommendations
│   │   ├── feed/                # /feed — activity feed
│   │   ├── birth-chart/         # /birth-chart
│   │   ├── current-chart/       # /current-chart
│   │   ├── recipe-generator/    # /recipe-generator
│   │   ├── planetary-chart/     # /planetary-chart
│   │   ├── restaurant-creator/  # /restaurant-creator
│   │   ├── cosmic-recipe/       # /cosmic-recipe
│   │   ├── generated-recipe/    # /generated-recipe + /generated-recipe/[id]
│   │   └── food-tracking/       # /food-tracking
│   ├── api/                     # API route handlers
│   ├── login/                   # /login (chromeless)
│   ├── upgrade/                 # /upgrade (chromeless)
│   ├── onboarding/              # /onboarding (chromeless)
│   ├── auth/                    # /auth/* — NextAuth callbacks + establishing
│   ├── premium/                 # /premium — marketing pricing page
│   └── layout.tsx               # Root layout: RedesignedHeader + AppChrome
│
├── components/
│   ├── nav/
│   │   ├── AppChrome.tsx        # AppChromeFooter + AppChromeTabBar gates
│   │   ├── CommandPalette.tsx   # ⌘K global palette
│   │   ├── RedesignedHeader.tsx # 5-slot primary nav with mega-menus
│   │   ├── MobileGlassTabBar.tsx
│   │   └── RedesignedFooter.tsx
│   └── auth/
│       └── AuthFollowups.tsx    # AuthHandshake, WelcomeBack, UpgradeGate, AccountSessions
│
├── config/
│   └── navigation.ts            # NAV_IA — single source of truth for all nav surfaces
│
├── contexts/
│   ├── MenuPlannerContext.tsx   # Barrel re-export (28 lines)
│   └── menu-planner/            # Split modules
│       ├── types.ts             # All interfaces (244 lines)
│       ├── useMealSlots.ts      # Slot CRUD hook (498 lines)
│       ├── useWeekNavigation.ts # Week cursor hook (65 lines)
│       └── MenuPlannerProvider.tsx # Composes above (1280 lines)
│
├── lib/
│   ├── auth/
│   │   ├── auth.ts              # NextAuth v5 full config (Node.js runtime)
│   │   └── auth.config.ts       # Edge-safe auth config (middleware)
│   ├── validation/
│   │   └── railway.ts           # Zod schemas for Railway API responses
│   └── rateLimit.ts             # Sliding-window rate limiter
│
├── services/
│   ├── subscriptionService.ts   # Tier management, feature gates
│   ├── TokenEconomyService.ts   # Spirit/Essence/Matter/Substance economy
│   ├── HistoricalStatsService.ts
│   └── ...
│
├── types/
│   ├── subscription.ts          # TIER_LIMITS, SubscriptionTier
│   └── next-auth.d.ts           # JWT augmentation (sessionId, deviceSessionId)
│
└── database/
    └── init/                    # SQL migrations (01 – 33)
        └── 33-device-sessions.sql
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values. All secrets are in Vercel (frontend) and Railway (backend).

```bash
# Database (Railway internal — used in production, not local dev)
DATABASE_URL=postgresql://postgres:<pw>@postgres.railway.internal:5432/railway

# Auth
AUTH_SECRET=<32-char-random>
AUTH_GOOGLE_ID=<google-oauth-client-id>
AUTH_GOOGLE_SECRET=<google-oauth-client-secret>
AUTH_ADMIN_EMAIL=<your-email>
AUTH_URL=https://alchm.kitchen        # production
AUTH_TRUST_HOST=true

# APIs
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
INTERNAL_API_SECRET=<shared-secret-with-fastapi>
GALILEO_API_KEY=<galileo-key>

# Payments & Email
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
```

---

### SpacetimeDB live layer (v4.0, optional)

The `spacetime-module/` Rust module owns the live culinary catalog plus
per-user real-time state (meal plans, grocery carts, feed events, commensal
sessions). The frontend connects through `SpacetimeProvider`
(`src/contexts/SpacetimeContext.tsx`) only when `NEXT_PUBLIC_SPACETIME_URI`
is set; five `NEXT_PUBLIC_SPACETIME_LIVE_*` flags gate each consumer surface
(see `.env.example`). Every surface falls back silently to its legacy
localStorage/REST path when the flag is off or the connection drops. Seed the
culinary catalog with `bun scripts/spacetime/seedCulinary.ts`; regenerate TS
bindings after module changes with
`spacetime generate --lang typescript --module-path spacetime-module --out-dir src/lib/spacetime/generated`.

## Key architecture decisions

See [docs/adr/](docs/adr/) for full Architecture Decision Records.

| ADR | Decision |
|---|---|
| [ADR-001](docs/adr/001-five-slot-nav-ia.md) | 5-slot primary nav IA |
| [ADR-002](docs/adr/002-two-tier-pricing.md) | Two-tier pricing (Apprentice / Alchemist) |
| [ADR-003](docs/adr/003-token-economy-throttle.md) | Token economy as the primary AI throttle |
| [ADR-004](docs/adr/004-device-sessions.md) | Device sessions via DB + JWT `jti` |
| [ADR-005](docs/adr/005-denormalized-read-model.md) | Denormalized `read_model` JSONB for sub-100ms recipe loads |
| [ADR-008](docs/adr/008-spacetimedb-live-state.md) | SpacetimeDB live-state layer (flag-gated, silent legacy fallback) |

---

## Deployment

### Frontend (Vercel)

Automatic on merge to `master`. Project: `alchm-kitchen-pro`, team: `cookingwithcastro-llc`.

```bash
# Manual deploy (if needed)
vercel --prod
```

### Backend (Railway)

Auto-deploys from `master` if Railway is connected. Manual:

```bash
cd backend
railway login
railway up
```

### Database migrations

Migrations live in `database/init/`. Apply in sequence (01 → 33). Railway runs them on first boot via the `db_init.py` script.

---

## Scripts

```bash
bun run dev          # Start dev server (localhost:3000)
bun run build        # Production build (must pass before PR)
bun run lint         # ESLint (must be zero warnings)
bun run typecheck    # TypeScript typecheck
bun run test         # Jest unit tests
bun run storybook    # Component dev (dev only, excluded from prod build)
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Branch off `master`; never target `main` (stale). Always use Bun.

---

## License

MIT — see [LICENSE](LICENSE).

**[alchm.kitchen](https://alchm.kitchen)** 🌙
