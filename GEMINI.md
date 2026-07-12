# WhatToEatNext - AI Assistant Guide (Alchm.kitchen)

_Version: 3.4.0 | Last Updated: July 12, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**. 

We operate a three-project loop:
1. **alchm.kitchen (WTEN)**: The core Next.js user-facing platform, deployed on Vercel.
2. **api.agents.alchm.kitchen (PA Backend)**: The Planetary Agents Python service owning agent personas, orchestration, and LLM recipe generation.
3. **agents.alchm.kitchen (PA UI)**: The Planetary Agents Next.js UI.

## Current Project Status (July 2026 - v3.4.0)

### 🔮 **PHILOSOPHER'S STONE AGENT FORGING & DYNAMIC CHAT**
- **End-to-End Forging**: Created a user interface at `/philosophers-stone` enabling users to forge custom agents dynamically using birth details, name, and dominant elements.
- **Agent Ignition & Persona Generation**: Implemented a dynamic API route at `/api/agent-forge/ignite` to initialize custom personas and compute Sacred 7 stats using exact alchemical properties. The route writes the natal chart directly to the canonical `user_profiles.natal_chart` column to align with the core database schema.
- **Context-Aware Vector Chat**: Integrated OpenAI embeddings (`src/lib/embeddings/openaiEmbeddings.ts`) and database migrations (`database/init/59-recipe-embeddings.sql`) to enable dynamic chat sessions with forged agents, complete with a recipe embedding backfill script.
- **Sacred 7 Stats Engine**: Hardened alignment calculations (`src/lib/sacred-7-stats.ts`) and derived attributes (diurnal balance, planetary aspects, dignity) to drive agent conversational behavior.

### 🧪 **LAB PAGE ALCHEMICAL STATS FIXES**
- **Lab page stats panel "AWAITING BACKEND"**: Resolved the issue where the `/lab` page showed missing natal stats for onboarded users by implementing a robust fallback in `rowToUserWithProfile` to load natal charts from the legacy `users.profile` JSONB column if the column-level data is null.
- **Sign Case Mismatch**: Corrected `calculateAlchemicalState` where sign properties lookup failed due to casing mismatches, restoring accurate alchemical and elemental calculation.
- **Onboarding CTA**: Updated the lab page's login prompt to guide logged-in users with empty birth details to complete onboarding.

### 🧹 **COMPREHENSIVE TYPE SAFETY CLEANUP**
- **Explicit-Any Reduction**: Performed massive waves of refactoring across the `src/data` directory and various service layers (Token, Quest, Streak, FoodDiary, Commensal) to reduce ESLint warnings and enforce strict type safety.

### 🧪 **DATA AUTHENTICITY CAMPAIGN (Ingredients + Recipes)**
- **Mission**: Drive catalog data to *real* values — no fabricated nutrition, no placeholder/default templates, no hollow recipes. `src/data` is the authoritative source for ingredient recommendations (static); recipes read from a denormalized DB JSONB read model.
- **Ingredient side (shipped)**: Lifted free-text matching into a shared resolver adopted by `UnifiedIngredientService` (#559); removed the fabricated nutrition template from the static catalog (#560); stopped placeholder coverage entries leaking into recommendations (#562); purged non-ingredient junk from the coverage set (#561); added missing cooking staples — stocks, broths, fish sauce, etc. (#563); shipped real nutrition for the 21 specialty oils as nutrition batch 1 (#566); added a real-vs-default scoring pass to the ingredient audit (#565).
- **Recipe side (shipped)**: Backfilled real per-serving nutrition that was 100% empty (#555); upgraded the ESMS ingredient matcher (matchRate 0.56 → 0.64, #556); cleaned junk parenthetical descriptions and recovered real seasons (#557); de-published 14 fully-fabricated hollow recipes (#558); reconciled nutrition and recomputed degenerate elemental signatures after the staples landed (#564).
- **Dashboard honesty**: Practitioner Cohorts now read canonical sources instead of vestigial JSONB (#552); replaced the fabricated Cost Burndown with a real Railway resource-usage panel (#553/#554).


### 🪐 **PLANETARY AGENTS INTEGRATION**
- **Unified Agent Profiles**: Agents are first-class users (`@agentic.alchm.kitchen`). Their rich profiles include bio, dominant elements, live natal chart overlays, viewer↔agent synastry, and consciousness sigils (fetched via public endpoints from WTEN).
- **Transit-Driven Group Chats**: Clicking active transits in WTEN opens a group chat on the PA side involving the planetary-degree agents involved.
- **Agent Weekly Menus & Feed**: Agents publish weekly menus and share activities (chat, recipe generation, insights) directly to WTEN's `feed_events` via authenticated server-to-server endpoints (using `X-Sync-Secret` / `INTERNAL_API_SECRET`).
- **Cosmic Recipe Generation**: Offloaded LLM generation of recipes entirely to PA's `/api/generate-recipe` backend endpoint to ensure strict structured JSON outputs (`CosmicRecipe` schema) without prompt hijacking.
- **Agent Daily Cosmic Yield Cron**: Added a daily cron service (`/api/cron/agents-daily-yield` scheduled at `30 0 * * *` via Vercel) that automatically mints personalized daily Cosmic Yield for active, chart-bearing agents (source_type `"agents_yield"`) using the core `DailyYieldService` yield engine. This ensures the live token economy feed stays active and demonstrates the loop to visitors.


### ⚡ **SPACETIMEDB LIVE LAYER (v4.0)**
- **Real-Time Sync**: Using `spacetime-module` (Rust) for live synchronization of meal plans, commensal lobbies, and grocery carts.
- **Gated & Fallback**: Activated via `NEXT_PUBLIC_SPACETIME_URI=wss://maincloud.spacetimedb.com`. Falls back silently to legacy localStorage/REST if the websocket drops or flags are disabled.
- **Connection Optimizations**:
  - **CSP Compatibility**: Upgraded `next.config.js` to whitelist `wss://` origins in the Content Security Policy, preventing browser blocking in production.
  - **Auto-Reconnection**: The connection provider now listens to browser `online` and window `focus` events to immediately re-establish connections after transient drops (e.g. lid close or network changes) rather than permanently giving up after 8 retries.
  - **Defensive Normalization**: Automatically strips leading `@` prefixes from `NEXT_PUBLIC_SPACETIME_MODULE` to prevent connection errors when copy-pasting the console namespace.
- **Fixes Shipped**: Addressed echo races, remote plan wipes on reload, and DOM click-dead issues caused by decorative `.regmarks`.

### 🌍 **ELEMENTAL SIGNATURE MODEL**
- **Adaptive Co-Dominance**: Deprecated the scattered single "dominant element" calculation. Replaced with a unified `ElementalSignature` model (`src/utils/elemental/signature.ts`).
- **Tie-Breaks & Ranking**: Correctly handles ties ("leans water & earth") and balanced states without overriding the full 4-vector dot products used for backend recommendations (ingredients, recipes).

### 🛠️ **MCP INSTRUMENTATION & TELEMETRY**
- **Model Context Protocol**: Alchm MCP server provides endpoints for Claude Desktop/Cursor to interact with the culinary engine.
- **Telemetry**: Full visibility via `mcp_invocations` table, tracking latencies, tool calls, and model tiers. A synthetic cron probe (`*/30`) exercises the Alchm tool handlers in-process for continuous monitoring.

### 🖼️ **IMAGE GENERATION PIPELINE**
- **Automated Generation**: Script `scripts/generate-recipe-images.ts` uses Cloudflare Workers AI SDXL -> R2 bucket to populate `image_url` for recipes and ingredients.
- **CLI Commands**: Supports `--force` for regeneration and `--id <uuid>` for one-offs.

---

## Core Architecture

### **Hierarchical Culinary Data System**
1. **Tier 1 - Ingredients** (Elemental Only)
2. **Tier 2 - Recipes** (Computed - Full Alchemical + Denormalized JSONB Read Model)
3. **Tier 3 - Cuisines** (Aggregated - Statistical)

### **Authentication & Device Sessions**
- **Provider**: NextAuth.js v5 (Google OAuth only).
- **Device Sessions**: Tracked via `database/init/33-device-sessions.sql`, supporting multi-device login states.
- **Primary Database**: Core WTEN is fully migrated to **Railway PostgreSQL** (with schema tables fully up-to-date through Migration 54). Neon DB is deprecated on the WTEN frontend side and remains active only as a separate datastore inside the Planetary Agents (PA) Python backend.

---

## Environment Variables Reference (Production)

```bash
# Backend / Legacy API
API_BASE_URL=https://whattoeatnext-production.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://whattoeatnext-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://alchm.kitchen,http://localhost:3000

# Planetary Agents Interop
INTERNAL_API_SECRET=<internal-api-secret>
ALCHM_KITCHEN_SYNC_SECRET=<sync-secret-with-planetary-agents>
NEXT_PUBLIC_AGENTS_UI_URL=https://agents.alchm.kitchen

# Database (Railway Postgres)
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# Auth
AUTH_SECRET=<auth-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_ADMIN_EMAIL=<admin-email>
AUTH_URL=https://alchm.kitchen
AUTH_TRUST_HOST=true

# SpacetimeDB Live Layer (Note: Live flags must be "1", not "true", to resolve correctly in code)
NEXT_PUBLIC_SPACETIME_URI=wss://maincloud.spacetimedb.com
NEXT_PUBLIC_SPACETIME_MODULE=cookingwithcastrollc/alchm-culinary
NEXT_PUBLIC_SPACETIME_LIVE_CULINARY=1
NEXT_PUBLIC_SPACETIME_LIVE_PLANNER=1
NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL=1
NEXT_PUBLIC_SPACETIME_LIVE_CART=1
NEXT_PUBLIC_SPACETIME_LIVE_FEED=1
```

## AI Assistant Operational MO
- **Bun Only**: `bun run dev|build|test|verify`. Never use npm/yarn.
- **Verify Before Push**: `bun run build` must have 0 errors and 0 warnings. `husky` pre-commit handles typecheck & lint.
- **FIX > REMOVE**: Complete/wire orphaned-but-real features; only delete true duplicates or genuinely dead stubs (confirm 0 importers + green build).
- **No Oppositions**: Elemental logic NEVER uses opposing mechanics (e.g. Fire vs Water). Elements are additive and self-reinforcing.
