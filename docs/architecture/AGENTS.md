# WhatToEatNext - Codex AI Assistant Guide

_Version: 2.3.0 | Last Updated: May 9, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (May 2026)

### 🎉 **INFRASTRUCTURE & TOOLCHAIN OPTIMIZED**

- **Toolchain**: ✅ **BUN v1.3.13** (Migrated from Yarn — 10x faster installs/builds)
- **Database**: ✅ **RAILWAY POSTGRES** (Internal: `postgres.railway.internal`)
- **Read Model**: ✅ **DENORMALIZED** (Sub-100ms recipe loads via `read_model` JSONB column)
- **Assets**: ✅ **OPTIMIZED** (Logo/Hero images shrunk by 90%+)
- **Latency**: ✅ **SUB-1MS** DB response times via Railway internal networking.

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

_Updated May 9, 2026 — Bun toolchain migration complete. Sub-1ms latency via Railway internal networking._
