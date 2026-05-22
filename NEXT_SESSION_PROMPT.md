# NEXT_SESSION_PROMPT — Dashboard & Telemetry Operations

Welcome to the next engineering session for **Alchm.kitchen (WhatToEatNext)**! 
The local development environment has been equipped with a NextAuth admin bypass and a live-wired Railway PostgreSQL telemetry dashboard. Use this document as your direct instruction set to drive pending feature work and enforce codebase robustness.

---

## 🚀 Active Development Environment

1. **Development Runtime**: Always use **Bun v1.3.13**. Execute server instances using `bun --bun run dev`.
2. **Process & Port Hygiene**: Dev server runs on **Port 3002**. Always ensure no zombie processes are listening on this port before starting:
   ```bash
   lsof -ti:3002 | xargs kill -9 2>/dev/null || true
   ```
3. **Live Database Access**: Connects directly to the live Railway PostgreSQL database.
   - Connection URL: `postgresql://postgres:<password>@tramway.proxy.rlwy.net:35670/railway` — the password is supplied via `.env.local` / Railway env, never committed
   - *Note*: Always verify that env variables are loaded correctly by Bun modules without hoisting interference.

---

## 🔑 Administrative Development Bypass

To enable rapid local testing of admin surfaces without OAuth loops:
- **Mock Account**: `gregcastro23@gmail.com`
- **Role**: `admin`
- **Tier**: `premium`
- **Behavior**: When running locally (`NODE_ENV !== "production"`), the authentication layer automatically injects this admin session. You can navigate directly to protected routes such as `/admin` and `/admin/dashboard` to verify live updates.

---

## 📊 Newly Wired Live Telemetry Status

The **High Alchemist Dashboard (`/admin/dashboard`)** has been wired directly to the Railway PostgreSQL database, displaying real-time metrics instead of hardcoded placeholder stats:
- **Total Users**: ~106 registered users (natal charts completed & onboarding states)
- **Recipes**: 579 denormalized recipes live in the catalog (`recipes` table)
- **Ingredients**: 401 elemental ingredients (`ingredients` table)
- **Active Subscriptions**: 100 active premium tiers (`user_subscriptions` table)
- **Transactions**: 772 token ledger entries (`token_transactions` table)

---

## 🎯 High-Priority Next Tasks

Use the new live telemetry and developer bypass to build out the following pending robust database integrations:

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
*   **Current State**: OAuth bypass mock data exists, but checkout state syncing needs verification.
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
