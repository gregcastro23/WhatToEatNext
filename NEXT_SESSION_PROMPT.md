# NEXT_SESSION_PROMPT — Dashboard & Telemetry Operations

Welcome to the next engineering session for **Alchm.kitchen (WhatToEatNext)**!
The High Alchemist dashboard is live-wired to the Railway PostgreSQL database.
Use this document as your direct instruction set to drive pending feature work
and enforce codebase robustness.

---

## 🚀 Active Development Environment

1. **Development Runtime**: Always use **Bun v1.3.13**. Execute server instances using `bun --bun run dev`.
2. **Process & Port Hygiene**: Dev server runs on **Port 3002**. Always ensure no zombie processes are listening on this port before starting:
   ```bash
   lsof -ti:3002 | xargs kill -9 2>/dev/null || true
   ```
3. **Live Database Access**: Production connects to Railway PostgreSQL via internal networking (`postgres.railway.internal`). For local dev, use the Railway public proxy URL from your `.env.local` — passwords are never committed.

---

## 🔑 Authentication

Local and production auth are identical: sign in via Google OAuth at `/auth/signin`. No dev-mode bypass exists or should exist — admin gating is enforced by `validateAdminRequest` server-side and the email allowlist in `src/lib/auth/adminEmails.ts`.

---

## 📊 Live Telemetry

The **High Alchemist Dashboard (`/admin/dashboard`)** is wired to the Railway PostgreSQL database. Counts (users, recipes, ingredients, subscriptions, transactions) are queried live on each load — check the dashboard itself for current values rather than relying on point-in-time numbers in docs.

---

## 🎯 High-Priority Next Tasks

Use the live telemetry surface to build out the following pending robust database integrations:

### 1. 🌌 Astrological Transit Data Dynamic Integration
*   **Current State**: Astro/Ephemeris widgets in the admin control room and recommendation engine currently use static seed formulas.
*   **Goal**: Wire these components to query live ephemeris/transit data from `/api/transit` and the Railway python backend service.
*   **Verification**: Ensure metrics like `agentHarmony` degrade gracefully to `live: false` if network calls fail.

### 2. 🐢 Slow Query & Telemetry Tracking
*   **Current State**: Database metrics are queried in real time, but performance metrics are not indexed.
*   **Goal**: 
    1. Query the `system_metrics` table for query execution logs.
    2. Dynamically extract and display queries exceeding a **200ms latency threshold** within the admin panel's database observability view.
    3. Monitor database connection pool usage (max 5 connections per dyno to preserve Railway limits).

### 3. 🌀 WTEN UI Component Migration (5/11 Sessions Done)
*   **Current State**: Migrating Next.js UI pages from `planetary_agents-main` sibling directory. Foundation libraries, leaf modules, and alchemy core are successfully ported.
*   **Goal**: Pick up at **Session 6** of the migration checklist outlined in [WTEN_MIGRATION_PLAN.md](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/WTEN_MIGRATION_PLAN.md).
*   **Key Constraint**: Keep newly ported UI components in the excluded staging directory (`wten-migration-ui-components/`) until the final type-checking integration phase.

### 4. 💳 Local Webhook & Stripe Event Verification
*   **Current State**: Checkout state syncing needs end-to-end verification against live Stripe events.
*   **Goal**: Set up local Webhook endpoints using the Stripe CLI to sync real-time user subscriptions and verify that token transactions write properly to `token_transactions` on checkout events.

---

## 🛠️ Essential Verification Commands

Always run these verification checks before staging or committing code changes:

- **Local Build Check** (Must pass with 0 errors):
  ```bash
  bun run build
  ```
- **Type-Check and Lint**:
  ```bash
  bun run verify
  ```
- **Port Release One-Liner**:
  ```bash
  lsof -ti:3002 | xargs kill -9 2>/dev/null || true
  ```

Let's maintain the stunning dark glassmorphic styling cues and leverage live dashboard telemetry to build a robust, state-of-the-art alchemical culinary recommendations engine!
