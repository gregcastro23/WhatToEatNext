# WhatToEatNext - Gemini AI Assistant Guide

_Version: 2.0.0 | Last Updated: April 24, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**.

## Current Project Status (April 2026)

### 🎉 **ALCHEMICAL INFRASTRUCTURE UPGRADE COMPLETE**

- **Backend Hosting**: ✅ **MIGRATED TO RAILWAY** (Standalone Service)
- **Frontend Hosting**: ✅ **VERCEL** (Next.js)
- **Database**: ✅ **NEON POSTGRESQL** (High-availability)
- **Recipe Catalog**: ✅ **100% UPGRADED (351 total)**
- **Build Status**: ✅ **BUILDING ON RAILWAY** (93s build time)
- **Latest Milestone**: Backend decoupled from Vercel for better performance and reliability.

### 🚀 **MAJOR CHANGES (Version 2.0.0)**

#### **Railway Backend Migration**
- ✅ **Decoupling**: Backend moved from Vercel to a standalone Railway service.
- ✅ **Railway Config**: Added `Dockerfile.railway` and `railway.json` for monorepo deployments.
- ✅ **Dynamic CORS**: Updated `main.py` with `CORS_ALLOWED_ORIGINS` for flexible frontend linking.
- ✅ **Optimized Uploads**: Added `.railwayignore` to exclude `node_modules` and speed up deployment.

#### **Deployment Optimizations (March 27)**
- ✅ **Standalone Railway Backend**: Builds in < 60s.
- ✅ **Lazy DB Startup**: Database connectivity test is now non-blocking (backgrounded) to ensure the FastAPI server binds to `$PORT` immediately, passing Railway health checks even during initial DB latency.
- ✅ **Health Monitoring**: `/health` endpoint updated with explicit metadata.
- ✅ **Startup Diagnostics**: Added robust logging and database connectivity tests in `main.py`.

#### **Alchemical Recipe Overhaul**
- ✅ **Schema Migration**: All recipes migrated to strict `AlchemicalRecipe` interface.
- ✅ **Nutritional Payloads**: Full macros, sodium, sugar, vitamins, and minerals for all 351 recipes.
- ✅ **Authentic Procedures**: Replaced all placeholder instructions with culturally rigorous step-by-step guides.
- ✅ **Elemental Balancing**: Every recipe now has mathematically balanced Fire/Water/Earth/Air properties summing to 1.0.
- ✅ **Expansion**: Added 40+ new authentic recipes to balance underpopulated cuisine files.

#### **Authentication Migration: Privy → NextAuth.js v5**

- ❌ **Removed**: Privy auth provider (all artifacts cleaned up, 1400+ stale files removed)
- ✅ **Added**: NextAuth.js v5 (Auth.js v5) with Google OAuth only
- ✅ **Edge Runtime**: Auth split into two files:
  - `src/lib/auth/auth.config.ts` — Edge-safe config (used by middleware)
  - `src/lib/auth/auth.ts` — Server-only config (DB lookups via dynamic import)
- ✅ **JWT Strategy**: 30-day sessions, updated once per day
- ✅ **Admin Detection**: First user or `AUTH_ADMIN_EMAIL` gets `ADMIN` role

#### **UI / UX Overhaul**
- ✅ **Alchemical Dark Theme**: Upgraded the entire application interface to a cohesive, glassmorphism-based dark theme (`bg-[#08080e]`) with ambient glowing orbs, creating a rich, premium aesthetic.
- ✅ **Unified Styling**: Standardized cards, headers, buttons, and layouts across all feature pages (Recipes, Premium, Profile, Quantities, Birth Chart, etc.) to match the new "deep space" look.

---

## 🌟 Version 2.0.0 Completed Features

The 2.0 vision outline has been 100% realized and verified as of April 2026:

- ✅ **Enhanced Personalization Engine**: Live planetary ephemeris transits actively modify user ESMS token yields via `DailyYieldService` multipliers.
- ✅ **Economy Integration**: The `QuestService` provides immutable double-entry ledger daily, weekly, and achievement quests.
- ✅ **Additional Cuisines & Cultural Rigor**: 351 curated authentic recipes are fully balanced with precise thermodynamic ESMS properties.
- ✅ **Menu Planning & Posso Integration**: Fully functional Menu Pipeline utilizing Match Percentages over naive price sorting, synced directly to the global pantry.
- ✅ **Performance & Testing**: Validated 2,464/2464 Jest unit/integration tests successfully, accompanied by strict-mode Zero TypeScript Errors.

---

## Core Architecture

### **Hierarchical Culinary Data System**

**Three-Tier Architecture:**

1.  **Tier 1 - Ingredients** (Elemental Only)
    -   Store ONLY elemental properties: Fire, Water, Earth, Air (normalized to 1.0)
    -   NO alchemical properties at ingredient level
    -   Rationale: Ingredients lack astrological context for ESMS

2.  **Tier 2 - Recipes** (Computed - Full Alchemical)
    -   Alchemical properties from planetary positions via `calculateAlchemicalFromPlanets()`
    -   Elemental properties: 70% ingredients + 30% zodiac signs
    -   Thermodynamic metrics from ESMS + elementals
    -   Kinetic properties (P=IV circuit model)
    -   Planetary mass-weight constants applied to alchemical scoring

3.  **Tier 3 - Cuisines** (Aggregated - Statistical)
    -   Weighted average properties across recipes
    -   Cultural signatures (z-score > 1.5σ)
    -   Statistical variance and diversity metrics

**Key Modules:**

-   `src/utils/planetaryAlchemyMapping.ts` — Authoritative ESMS calculation
-   `src/utils/hierarchicalRecipeCalculations.ts` — Recipe computation
-   `src/utils/cuisineAggregations.ts` — Statistical signatures
-   `src/types/celestial.ts` — Core type definitions

### **Authentication System (NextAuth.js v5)**

**Architecture:**

```
Edge Runtime (middleware.ts)
  └─→ auth.config.ts (Google OAuth provider, JWT session, route protection)
      └─→ NO Node.js imports (no pg, jsonwebtoken, bcryptjs)

Server Runtime (API routes, server components)
  └─→ auth.ts (extends auth.config.ts)
      └─→ signIn callback: dynamic import of userDatabaseService (pg)
      └─→ Creates/updates user in PostgreSQL on first login
      └─→ Assigns ADMIN role to first user or AUTH_ADMIN_EMAIL
```

**Key Files:**

-   `src/lib/auth/auth.config.ts` — Edge-safe config (middleware uses this)
-   `src/lib/auth/auth.ts` — Full server config (API route uses this)
-   `src/lib/auth/roles.ts` — UserRole enum (ADMIN, USER)
-   `src/lib/auth/validateRequest.ts` — Server-side session validation
-   `src/app/api/auth/[...nextauth]/route.ts` — NextAuth catch-all route
-   `src/middleware.ts` — Route protection (/profile, /onboarding, /admin)

---

## Backend Architecture (Python FastAPI)

```
Next.js Frontend (Vercel)
  └─→ /api/astrologize/route.ts
      ├─→ Primary: Call Railway Backend /api/planetary/positions
      │   └─→ URL: https://whattoeatnext-production.up.railway.app
      └─→ Fallback: astronomy-engine (local)

Python Backend (Railway)
  └─→ /api/planetary/positions
      ├─→ Primary: pyswisseph (Swiss Ephemeris)
      └─→ Fallback: pyephem
```

- **Backend Code**: `/backend/alchm_kitchen/main.py`
- **Railway Domain**: `https://whattoeatnext-production.up.railway.app`
- **Config Tokens**: `INTERNAL_API_SECRET` must match between Vercel and Railway.
- **Optional**: Set `API_BASE_URL` in Railway to the domain above for health check diagnostics.
- **Manual Start**: `cd backend && ./dev_start.sh`

---

## Development Guidelines

### **Casing Conventions (CRITICAL)**

```typescript
// Elements - Capitalized
type Element = "Fire" | "Water" | "Earth" | "Air";

// Planets - Capitalized
type Planet = "Sun" | "Moon" | "Mercury" | "Venus";

// Zodiac Signs - Lowercase
type ZodiacSign = "aries" | "taurus" | "gemini";

// Alchemical Properties - Capitalized
type AlchemicalProperty = "Spirit" | "Essence" | "Matter" | "Substance";

// Cuisine Types - Capitalized with hyphens
type CuisineType = "Italian" | "Mexican" | "Middle-Eastern";
```

### **Alchemical Calculation Rules**

**The ONLY Correct Way to Calculate ESMS:**

```typescript
// ✅ CORRECT - Planetary Alchemy Mapping
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

const alchemical = calculateAlchemicalFromPlanets({
  Sun: "Gemini",
  Moon: "Leo",
  Mercury: "Taurus",
  // ... other planets
});
// Result: { Spirit: 4, Essence: 7, Matter: 6, Substance: 2 }
```

### **Edge Runtime Constraints**

The middleware runs in Edge Runtime. **Never import** these in `auth.config.ts` or `middleware.ts`:
- `pg` / database modules
- `jsonwebtoken`
- `bcryptjs`
- `nodemailer`
- Any module using Node.js built-ins

---

## Environment Variables Reference

```bash
# Backend (Python)
BACKEND_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://alchm.kitchen,http://localhost:3000
INTERNAL_API_SECRET=882133EA-3D06-4DF2-A63C-F4114AB4EFBC

# Database
DATABASE_URL=postgresql://neondb_owner:npg_kHLuO2D3wZEg@ep-patient-bread-amcjoqiw-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Auth (NextAuth.js v5) — ALL REQUIRED for auth to work
AUTH_SECRET=<random-secret-min-32-chars>
AUTH_GOOGLE_ID=<google-oauth-client-id>
AUTH_GOOGLE_SECRET=<google-oauth-client-secret>
```

---

_Updated April 24, 2026 — Phase 5 Completed. 2.0.0 Officially Released. Menu Pipeline rebuilt, Posso Widget perfected, Economy mechanics integrated, and Zero TypeScript errors verified across 2,464 successful tests._
