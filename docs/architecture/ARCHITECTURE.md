# WhatToEatNext Architecture Overview

Alchm.kitchen (WhatToEatNext) uses a federated architectural model spanning multiple repositories and technologies to deliver a real-time, astrologically grounded culinary experience.

## The Three-Project Loop

The system is logically split into three cooperating services:

1. **alchm.kitchen (WTEN)**
   - **Role**: The main user-facing application (this repository). Handles user authentication, UI, recipe catalog browsing, the alchemical recommendation engine, and billing.
   - **Tech**: Next.js 15 (App Router), React 19, Tailwind, Bun toolchain.
   - **Hosting**: Vercel (Frontend) & Railway (Legacy Python API + PostgreSQL Database).

2. **api.agents.alchm.kitchen (Planetary Agents Backend)**
   - **Role**: The cognitive layer. Owns the LLM prompts, agent personas (e.g., Hildegard of Bingen), group chat orchestrations, and structured recipe generation (`/api/generate-recipe`).
   - **Tech**: Python FastAPI.
   - **Hosting**: Railway.
   - **Interop**: Communicates with WTEN via authenticated server-to-server calls using `INTERNAL_API_SECRET` and `X-Sync-Secret`.

3. **agents.alchm.kitchen (Planetary Agents UI)**
   - **Role**: The agentic UI. Renders agent profile pages, the council feed, and individual agent chats.
   - **Tech**: Next.js.
   - **Hosting**: Vercel.

## Real-Time Layer (SpacetimeDB)

To support multiplayer-like interactions and real-time state synchronization, WTEN incorporates a **SpacetimeDB v4.x Live Layer**.

- **Implementation**: A Rust-based `spacetime-module` deployed to `maincloud.spacetimedb.com`.
- **Responsibilities**:
  - **Meal Plans**: Synchronizes meal planner slots across user devices instantly.
  - **Commensal Lobbies**: Handles real-time dinner party matching and group state.
  - **Grocery Carts**: Collaborative grocery lists.
- **Resilience**: The frontend connects via WebSockets (`NEXT_PUBLIC_SPACETIME_URI`). If the connection drops or is blocked, the application silently and gracefully falls back to legacy REST / localStorage paths.

## Database Strategy

- **Primary DB**: Railway PostgreSQL (`postgres.railway.internal`).
- **Read Models**: The `recipes` table uses a denormalized `read_model` JSONB column. This pre-computes complex JOINs (ingredients, steps, nutrition, elemental mapping), reducing recipe load latency to sub-1ms.
- **Device Sessions**: JWT `jti` bindings paired with a `device_sessions` table allow secure, multi-device login management and revocation.

## Telemetry & Instrumentation (MCP)

- **Model Context Protocol (MCP)**: An integrated Bun-powered MCP server allows external tools (like Claude Desktop or Cursor) to interact with the culinary engine.
- **Monitoring**: 
  - A `mcp_invocations` table tracks every LLM operation, tool call, latency, and success rate. 
  - Synthetic probes run via cron (`*/30`) to continuously exercise AI tool handlers in-process, ensuring high availability.
  - An Admin Console (`/admin`) surfaces these metrics alongside DB/calc health in real-time.

## Culinary Data Hierarchy

The recommendation engine evaluates food across three tiers:
1. **Tier 1 - Ingredients**: Scored primarily on Elemental resonance (Fire, Earth, Air, Water).
2. **Tier 2 - Recipes**: Computed using Full Alchemical mechanics (Thermodynamic resonance + Elemental makeup).
3. **Tier 3 - Cuisines**: Aggregated statistical grouping of flavor profiles and methods.

For **Elemental Signatures**, the system uses an adaptive co-dominance model (e.g., "leans water & earth") instead of blindly picking a single dominant element, preserving the nuanced reality of astrological transits.