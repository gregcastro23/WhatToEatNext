# WhatToEatNext - Codex AI Assistant Guide

_Version: 3.3.0 | Last Updated: June 29, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (June 2026 - v3.3.0)

### 🎉 **INFRASTRUCTURE & TOOLCHAIN OPTIMIZED**

- **Doc version**: ✅ **3.3.0** (guide convention; `package.json` is still pinned at `3.1.0` — `git tag v3.1.0` cut 2026-05-29, so this bump is not a `package.json` bump)
- **Toolchain**: ✅ **BUN v1.3.13** (Migrated from Yarn — 10x faster installs/builds)
- **Stack**: ✅ **Next.js 15 / React 19 / TypeScript 5.7**
- **Database**: ✅ **RAILWAY POSTGRES** (Internal: `postgres.railway.internal`); schema current through **migration 54**. Neon is deprecated on the WTEN side (still used only inside the PA Python backend).
- **Read Model**: ✅ **DENORMALIZED** (Sub-100ms recipe loads via `read_model` JSONB column)
- **Assets**: ✅ **OPTIMIZED** (Logo/Hero images shrunk by 90%+)
- **Latency**: ✅ **SUB-1MS** DB response times via Railway internal networking.

### 🧪 Shipped in 3.3 / since 3.1

Data authenticity campaign drives the catalog to real values — no fabricated nutrition, no placeholder/default templates, no hollow recipes: ingredients (#559–#566), recipes (#555–#558, #564), dashboard honesty (#552–#554). New **Agent Daily Cosmic Yield** cron at `/api/cron/agents-daily-yield` (`30 0 * * *`, CRON_SECRET-gated; `src/services/agentDailyYield.ts`) mints each active chart-bearing agent's daily yield to keep the token ledger / Live Network economy surfaces live. On the 3.2.x baseline: Planetary Agents are first-class users; SpacetimeDB v4.0 live layer; unified ElementalSignature model (#505); MCP telemetry + `*/30` probe; Cloudflare SDXL→R2 image pipeline.

### Toolchain — always use `bun`, never `npm` or `yarn`

```bash
bun install          # install dependencies
bun run dev          # start dev server
bun run build        # production build
bun run test         # run tests
bun <script.ts>      # run TypeScript scripts directly (no ts-node/tsx needed)
```

`packageManager` is pinned to `bun@1.3.13` in `package.json`. The lockfile is `bun.lock`.

---

## Environment Variables (Production)

```bash
# Database (Railway internal network)
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# APIs & Secrets
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
INTERNAL_API_SECRET=<internal-api-secret>
ALCHM_KITCHEN_SYNC_SECRET=<sync-secret-with-planetary-agents>
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

- **Three-Tier Hierarchical Data**: Ingredients → Recipes → Cuisines.
- **NextAuth.js v5**: Google OAuth with Server/Edge split config.
- **Denormalized Recipes**: `read_model` JSONB column for high-speed delivery; eliminates N+1 queries.
- **Frontend**: Next.js on Vercel with Bun build pipeline (`bun.lock` committed).
- **Backend**: Python service on Railway (standalone).

---

_Updated June 29, 2026 (v3.3.0) — data authenticity campaign drives the catalog to real values (ingredients #559–#566, recipes #555–#558, #564, dashboard honesty #552–#554); Agent Daily Cosmic Yield cron (`/api/cron/agents-daily-yield`, `30 0 * * *`) keeps the token economy feed live. Schema through migration 54, Railway-primary DB. Bun 1.3.13 toolchain; Next.js 15 / React 19 / TypeScript 5.7._
