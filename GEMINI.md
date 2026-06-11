# WhatToEatNext - AI Assistant Guide (Alchm.kitchen)

_Version: 3.2.0 | Last Updated: June 11, 2026_

## Project Overview

WhatToEatNext is a sophisticated culinary recommendation system that combines alchemical principles, astrological data, and elemental harmony to provide personalized food recommendations. The site is branded as **Alchm.kitchen**. 

We operate a three-project loop:
1. **alchm.kitchen (WTEN)**: The core Next.js user-facing platform, deployed on Vercel.
2. **api.agents.alchm.kitchen (PA Backend)**: The Planetary Agents Python service owning agent personas, orchestration, and LLM recipe generation.
3. **agents.alchm.kitchen (PA UI)**: The Planetary Agents Next.js UI.

## Current Project Status (June 2026 - v3.2.0)

### 🪐 **PLANETARY AGENTS INTEGRATION**
- **Unified Agent Profiles**: Agents are first-class users (`@agentic.alchm.kitchen`). Their rich profiles include bio, dominant elements, live natal chart overlays, viewer↔agent synastry, and consciousness sigils (fetched via public endpoints from WTEN).
- **Transit-Driven Group Chats**: Clicking active transits in WTEN opens a group chat on the PA side involving the planetary-degree agents involved.
- **Agent Weekly Menus & Feed**: Agents publish weekly menus and share activities (chat, recipe generation, insights) directly to WTEN's `feed_events` via authenticated server-to-server endpoints (using `X-Sync-Secret` / `INTERNAL_API_SECRET`).
- **Cosmic Recipe Generation**: Offloaded LLM generation of recipes entirely to PA's `/api/generate-recipe` backend endpoint to ensure strict structured JSON outputs (`CosmicRecipe` schema) without prompt hijacking.

### ⚡ **SPACETIMEDB LIVE LAYER (v4.0)**
- **Real-Time Sync**: Using `spacetime-module` (Rust) for live synchronization of meal plans, commensal lobbies, and grocery carts.
- **Gated & Fallback**: Activated via `NEXT_PUBLIC_SPACETIME_URI=wss://maincloud.spacetimedb.com`. Falls back silently to legacy localStorage/REST if the websocket drops or flags are disabled.
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

# Database
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/railway

# Auth
AUTH_SECRET=<auth-secret>
AUTH_GOOGLE_ID=<google-client-id>
AUTH_GOOGLE_SECRET=<google-client-secret>
AUTH_ADMIN_EMAIL=<admin-email>
AUTH_URL=https://alchm.kitchen
AUTH_TRUST_HOST=true

# SpacetimeDB Live Layer
NEXT_PUBLIC_SPACETIME_URI=wss://maincloud.spacetimedb.com
NEXT_PUBLIC_SPACETIME_LIVE_PLANNER=true
NEXT_PUBLIC_SPACETIME_LIVE_COMMENSAL=true
NEXT_PUBLIC_SPACETIME_LIVE_CART=true
NEXT_PUBLIC_SPACETIME_LIVE_RECIPES=true
NEXT_PUBLIC_SPACETIME_LIVE_FEED=true
```

## AI Assistant Operational MO
- **Bun Only**: `bun run dev|build|test|verify`. Never use npm/yarn.
- **Verify Before Push**: `bun run build` must have 0 errors and 0 warnings. `husky` pre-commit handles typecheck & lint.
- **FIX > REMOVE**: Complete/wire orphaned-but-real features; only delete true duplicates or genuinely dead stubs (confirm 0 importers + green build).
- **No Oppositions**: Elemental logic NEVER uses opposing mechanics (e.g. Fire vs Water). Elements are additive and self-reinforcing.
