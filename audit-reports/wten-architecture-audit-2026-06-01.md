# WTEN Architecture & Integration Audit Report
**Date**: June 1, 2026  
**Branding**: [Alchm.kitchen](https://alchm.kitchen) (WhatToEatNext)  
**Status**: Version 3.1.0 (MCP Release) — Hardened  

---

## WTEN Architecture Overview

Alchm.kitchen (WhatToEatNext) is designed around a three-project topology, split into distinct layers for high-performance astrological, alchemical, and culinary workflows. The primary components are:

1. **WTEN Next.js Frontend (Vercel)**:
   - Built on **Next.js 15**, **React 19**, and **TypeScript 5.9**.
   - Switched to the **Bun v1.3.13** runtime and toolchain for ultra-fast builds and native TS execution.
   - Houses the core user interface, including the **5-slot app chrome** (Kitchen, Discover, Plan, Commensal, Lab), admin panels, shop, quests, and food diary.
   - Communicates with the standalone Python service for specialized heavy astrological and culinary math.

2. **WTEN Standalone FastAPI Backend (Railway)**:
   - Written in Python, running as a standalone container on Railway.
   - Integrates **Swiss Ephemeris (`pyswisseph`)** to compute celestial kinetic alignments, planetary signs/degrees, and zodiac coordinates.
   - Provides high-precision scoring engines (`PlanetaryScoringService`) that map real-time planetary aspects to culinary profiles.

3. **Database & Caching Layer**:
   - Powered by a standalone **Railway Postgres database** (`postgres.railway.internal:5432/railway`), recently migrated from Neon DB.
   - Utilizes transaction-mode **PgBouncer** connection pooling to survive serverless invocation spikes.
   - Incorporates a **denormalized read model** (`read_model` JSONB column in `recipes` table), dropping recipe load times to sub-100ms and eliminating N+1 DB bottlenecks.
   - Employs **Upstash Redis** for device-session JWT denylists, negative caching, and rate limiting.

4. **Integration Layer (The Sibling Loop)**:
   - Interfaces server-to-server with the **Planetary Agents (PA)** sibling project (`api.agents.alchm.kitchen` and `agents.alchm.kitchen`).
   - Syncs the ESMS token economy (Spirit, Essence, Matter, Substance) and coordinates agent-authored recipes and planetary aspects chat sessions.

---

## Planetary Agents (PA) ↔ WhatToEatNext (WTEN) Contract Diagram

This diagram visualizes the server-to-server integrations, sync mechanisms, proxies, and authentication boundaries between the sibling repos.

```mermaid
graph TD
    %% Styling
    classDef wten fill:#12101e,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef pa fill:#1a0f2e,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#3b82f6,stroke-width:1px,color:#fff;

    %% Nodes
    subgraph WTEN [WhatToEatNext / Alchm.kitchen]
        W_UI["WTEN Next.js UI<br/>(alchm.kitchen on Vercel)"]:::wten
        W_API["WTEN Next.js API<br/>(/api/* on Vercel)"]:::wten
        W_PY["WTEN Python Backend<br/>(Railway Standalone FastAPI)"]:::wten
    end

    subgraph PA_Project [Planetary Agents Project]
        PA_UI["Planetary Agents UI<br/>(agents.alchm.kitchen)"]:::pa
        PA_PY["PA Python Backend<br/>(api.agents.alchm.kitchen)"]:::pa
    end

    subgraph Database_Layer [Database Topology]
        W_DB[("WTEN Railway Postgres<br/>(postgres.railway.internal)")]:::db
        W_CACHE[("Upstash Redis Cache")]:::db
        PA_DB[("PA Neon Database")]:::db
    end

    %% Connections - WTEN Internal
    W_UI -->|Fetches /api/*| W_API
    W_API -->|Direct DB Queries| W_DB
    W_API -->|Cache Reads/Writes| W_CACHE
    W_API -->|Astrology/Ephemeris HTTP| W_PY
    W_PY -->|Read Model Access| W_DB

    %% Connections - PA Internal
    PA_UI -->|GraphQL/JSON APIs| PA_PY
    PA_PY -->|Direct DB queries| PA_DB

    %% Cross-Service Server-to-Server Contracts
    W_API -->|1. Aspect Clicks Proxy<br/>POST /api/internal/group-chat<br/>Header: X-Sync-Secret| PA_UI
    PA_UI -->|2. ESMS Airdrops & Quests<br/>POST /api/economy/sync-credit<br/>Header: X-Sync-Secret| W_API
    PA_PY -->|3. Agent Profile Mirroring<br/>POST /api/internal/agent-sync<br/>Header: X-Sync-Secret| W_PY
    W_API -->|4. Agent-Authored Recipes<br/>POST /api/internal/agent-recipes<br/>Header: Bearer Secret| W_API
    W_API -->|5. LLM Recipe Generation<br/>POST /api/generate-recipe<br/>Header: JSON payload| PA_PY
    PA_PY -->|6. Durable Recipe Catalog<br/>GET /api/recipes/[id]| W_API

    %% DB Separability
    W_DB -.-|Fully Decoupled - No shared database link| PA_DB
```

---

## Model Context Protocol (MCP) Server Architecture & Telemetry

WTEN exposes a robust, production-ready **stdio Model Context Protocol (MCP)** server under `/mcp-server` to feed its alchemical calculations, ephemeris data, and recipe catalogs into external LLMs (such as Cursor, Claude Desktop, and Antigravity).

### 1. Dual-Database Architectural Isolation
To support advanced cognitive agents without degrading operational user performance, our architecture maintains a strict database separation:
* **WTEN Postgres Database** acts as the transactional anchor: storing user profiles, Stripe subscriptions, birth charts, daily invocation logs, and ESMS token balances.
* **PA Postgres Database** acts as the cognitive/conversational anchor: isolating large agent memories, chat threads, and vector logs from transactional tables to avoid performance bloat.

### 2. Exposed Tool Registry
The WTEN MCP server (`@alchm/mcp-server`, version `1.1.2`) registers five powerful alchemical tools:
* `get_live_sky_transits` (Free): Computes active planetary degrees, placements, and elements (Fire, Water, Earth, Air) under the current sky.
* `alchemize_ingredients` (Free): Evaluates lists of raw foods and translates them into alchemical ESMS weights and thermodynamic reactivity indices.
* `generate_cosmic_recipe` (7.5 ESMS per axis / 30 total): Searches the curated 579-recipe catalog. Costs tokens only when called with a validated `_meta.apiKey`.
* `compute_synastry_overlay` (Free): Calculates the inter-aspect dynamics between two charts (conjunctions, squares, trines, orbs) to output Recommended Stance (clash, absorb, mirror).
* `get_transit_natal_overlay` (Free): Computes sky × natal charts to measure continuous element boost magnitudes.

### 3. Integrated Telemetry & Observability
Every MCP tool execution is highly instrumented:
* Invocation data writes atomically to the `mcp_invocations` table.
* The `/admin` System Status dashboard monitors invocation rate, error rate, p95 latency, and synthetic health.
* The High Alchemist dashboard tracks `mcpInvocationRate` as a live cognitive operational metric.
* The synthetic cron probe (`/api/cron/synthetic-mcp` every 30 minutes) exercises the stdio handlers in-process and triggers automated operator alerts via Resend (email) and Slack upon failures.

---

## Prioritized Findings: P0/P1/P2

### 🔴 P0 — Integration Surface Gaps (Action Required)

#### 1. Missing `group_chat_quest` in Transaction Source Whitelist
* **File Reference**: [src/types/economy.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/types/economy.ts#L19-L45)
* **Finding**: The TypeScript union `TransactionSourceType` strictly whitelists valid token transaction sources (e.g., `daily_yield`, `quest_reward`, `transit_attunement`). However, `group_chat_quest` (the source identifier transmitted by Planetary Agents when a user completes a group chat quest) is **absent** from the whitelist.
* **Risk**: Although the Postgres database ledger table `token_transactions` stores `source_type` as a generic `VARCHAR(50)` without an SQL-level `CHECK` constraint (see [17-token-economy-schema.sql](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/database/init/17-token-economy-schema.sql#L15)), sending `group_chat_quest` will trigger TypeScript compiler warnings, could crash downstream data visualization pipelines, and will cause bugs on type-cast runtime checks.
* **Resolution Plan**: Append `"group_chat_quest"` to the `TransactionSourceType` union in `src/types/economy.ts`.

#### 2. Documentation Omission of `ALCHM_KITCHEN_SYNC_SECRET`
* **File Reference**: [AGENTS.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/AGENTS.md), [GEMINI.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/GEMINI.md)
* **Finding**: The environment variable checklist for production deploys in both codex manuals completely omits `ALCHM_KITCHEN_SYNC_SECRET`. This explains why the variable was historically left **unset** in deployment platforms, causing all transit-attunement and quest airdrops to fail with `401 Unauthorized` at the sync edge.
* **Risk**: High. Any system operator following `AGENTS.md` or `GEMINI.md` to spin up a staging or mirror deployment will silently break the alchemical token economy sync mechanism.
* **Resolution Plan**: Update both guides' Environment Variables block to clearly include `ALCHM_KITCHEN_SYNC_SECRET` alongside the other shared secrets.

#### 3. Parity Discrepancy on Sync Authorization Headers
* **File Reference**: [src/app/api/internal/agent-recipes/route.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/internal/agent-recipes/route.ts#L45-L48), [src/app/api/economy/sync-credit/route.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/economy/sync-credit/route.ts#L51-L59)
* **Finding**: 
  - The credit, debit, and session sync endpoints (/api/economy/sync-*) authorize calls by validating a custom header: `X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>`.
  - Conversely, the agent-authored recipe saving endpoint (/api/internal/agent-recipes) authorizes calls using standard Bearer authorization: `Authorization: Bearer <INTERNAL_API_SECRET>`.
* **Risk**: Confusing secret structures make it highly likely that integration scripts in Planetary Agents will send the wrong header format or reference the wrong secret (e.g. attempting to call `agent-recipes` using `X-Sync-Secret" or the sync secret instead of `INTERNAL_API_SECRET`), causing silent 401 failures in production.
* **Resolution Plan**: Add fallback header support to the `/api/internal/agent-recipes` endpoint to accept *either* `Authorization: Bearer <INTERNAL_API_SECRET>` *or* `X-Sync-Secret: <ALCHM_KITCHEN_SYNC_SECRET>`, standardizing integration paths.

---

### 🟡 P1 — Infrastructure & Configuration Risks

#### 1. Database Configuration Drift on Vercel Env
* **File Reference**: [.env.production](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.env.production#L6), [.env.production.local](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.env.production.local#L98)
* **Finding**: The Vercel CLI-generated `.env.production` file points to an **external Neon PostgreSQL cluster** (`ep-patient-bread-...pooler.c-5.us-east-1.aws.neon.tech`), while the project has been fully migrated to **Railway Postgres** (`postgres.railway.internal`). However, `.env.production.local` stores a public TCP proxy URL (`tramway.proxy.rlwy.net:35670`).
* **Risk**: If the Vercel dashboard variables are not strictly set to the Railway TCP proxy URL, the frontend will connect to a stale, unmigrated Neon database. This will lead to silent database drift where users, tokens, and custom recipes exist in two completely separated clusters.
* **Resolution Plan**: Ensure `DATABASE_URL` in the Vercel production environment matches the Railway TCP proxy domain listed in `.env.production.local`, and run a validation script comparing table counts in Neon vs Railway.

#### 2. Stale public domain synonym reference (`api.alchm.kitchen`)
* **File Reference**: [CLAUDE.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/CLAUDE.md#L199), [src/lib/serviceUrls.ts](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/serviceUrls.ts#L33-L38)
* **Finding**: References to `api.alchm.kitchen` exist in documentation to represent the public endpoint of WTEN. However, `api.alchm.kitchen` **does not resolve publicly**. The true public host is `whattoeatnext-production.up.railway.app` (FastAPI backend) and `alchm.kitchen` (Next.js App).
* **Risk**: Sibling projects attempting to hit `/api/` subdomains under `api.alchm.kitchen` instead of the public Vercel/Railway endpoints will experience network failures.
* **Resolution Plan**: Clean up stale domain references from codex files, ensuring only `alchm.kitchen` and the correct Railway service domains are listed.

---

### 🔵 P2 — Code Health & Cron Hygiene

#### 1. Infrastructure dispersion of Scheduled Cron Jobs
* **File Reference**: [vercel.json](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/vercel.json#L13-L50), [docs/deployment/CRON_JOBS.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/deployment/CRON_JOBS.md)
* **Finding**: Scheduled routines are split across two completely different orchestrators:
  - **Vercel native crons** run the five synthetic monitoring probes, system health snapshots, and database pruning.
  - **Railway cron services** (containers spun up daily) run the `device-sessions-cleanup` and `daily-digest-cron`.
* **Risk**: High dispersion. Monitoring, debugging, and alerting are fragmented. A failure in a Railway cron is invisible to Vercel's console, and vice versa.
* **Resolution Plan**: Migrate standard Node cron scripts into Next.js edge/API routes, keeping all scheduler definitions in `vercel.json` where Vercel native alerting can monitor execution status.

#### 2. Root-Level Cache & Workspace Clutter
* **File Reference**: WTEN Root Directory
* **Finding**: The workspace root contains a large amount of build artifacts, legacy caches, and backup scripts. For example:
  - Four different ESLint cache files: `.eslintcache`, `.eslintcache 2`, `.eslintcache 3`, `.eslintcache 4`.
  - Duplicate migration scripts: `apply_migration_45 2.cjs`, `apply_migration_46 2.cjs`.
  - Duplicate astronomical files: `recipes_database 3.json`, `HSCA_Recipes 3.pdf`.
* **Risk**: Clutters the workspace, slows down IDE indexing engines (increasing memory overhead typical of Node.js on standard Apple Silicon workstations), and risks developers modifying the wrong copy of a migration.
* **Resolution Plan**: Run a root hygiene script to delete duplicate finding files (`* 2.cjs`, `* 3.json`) and run `bun run lint:cache-clear` to purge multiple ESLint caches.

---

## PA ↔ WTEN Integration-Risk Matrix

The primary surfaces where the two repositories can silently drift out of sync are detailed below:

| Integration Surface | Contract Mechanic | Failure Mode | Mitigation Status |
| :--- | :--- | :--- | :--- |
| **Transit to Group Chat** | Click Aspect → resolve IDs → proxy WTEN `/api/agents/group-chat` → POST PA `/api/internal/group-chat` | If PA does not have the degree-agent seeded, or if `INTERNAL_API_SECRET` mismatch occurs, the request fails. | **Robust**: The proxy degrades gracefully to a standard single-agent chat link so user click never dead-ends. |
| **Token Economy Sync** | PA triggers `POST /api/economy/sync-credit` | If `ALCHM_KITCHEN_SYNC_SECRET` is mismatched or unset on Vercel, credits fail. If `source` is not in whitelist, TS types mismatch. | **Vulnerable**: Whitelist is missing `group_chat_quest`. Secret was historically unset due to documentation omission. |
| **Durable Recipe Catalog** | PA deep-links to `/recipes/[id]` | If WTEN deletes a recipe from the database or changes the routing structure, links from PA chat threads break. | **Robust**: `LocalRecipeService` handles fallbacks to static cuisine files when Postgres is degraded. |
| **Agent Profile Sync** | PA triggers `POST /api/internal/agent-sync` | If `is_agent` is not flagged or email is invalid, feed events reject the synchronized agent. | **Robust**: Auto-provisions agentic users on the fly if email domain matches `@agentic.alchm.kitchen`. |
| **Cosmic Recipe Generation** | WTEN proxies to PA `/api/generate-recipe` | Zod schema drift. If PA updates its Pydantic output schema, the Next.js edge Zod parse fails, yielding a 502. | **Instrumented**: Synthetic probes check this hourly to catch drift immediately. |
