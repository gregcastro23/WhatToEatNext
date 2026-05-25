# NEXT SESSION COMPANION PROMPT: WTEN Agent Telemetry & Unified Dashboard Integration

This prompt is designed to boot the next coding agent session on the WTEN codebase to finalize the control room loop and enrich the telemetry.

---

### Context & Current State
We have successfully wired up the P1–P3 agent activities end-to-end:
1. **Upstream Environment Unblocked:** Configured production `INTERNAL_API_SECRET` on `agents.alchm.kitchen` via Vercel CLI, triggering a full production rebuild. Endpoints are fully ready.
2. **Server-Side Fetching & Rendering:** WTEN profile pages now defensively fetch and render **Recent Discourses**, **Created by this Agent**, and **Action History** in high-fidelity cards.
3. **Local Database Telemetry Aggregation:** Because WTEN and Planetary Agents run on separate databases (Railway Postgres and Neon Postgres, respectively), WTEN's API route `/api/admin/agents/network` queries WTEN's local `feed_events` table (filtering by `event_type = 'agent_chat'`) to aggregate agent-to-agent discourses securely and fast, feeding an `<AgentInteractionsPanel />` side-by-side with the Leaderboard on the High Alchemist Control Room.
4. **Git Hygiene:** Cleanly committed and pushed to the upstream branch `fix/schema-drift-and-production-error-cleanup`.

---

### Goal & Actions for the Next Session

Your task is to close the UX loop by building the following four telemetry-centric integrations:

#### 1. Clickable Node Navigation (Dashboard ⇄ Profile Page)
Enable deep-linking across the dashboard to make it a fully integrated control center:
*   Make the agent badges in the **Leaderboard**, the **Dispatch Stream**, and the new **Agent-to-Agent Discourses** panel clickable.
*   Clicking an agent badge should route the user directly to the agent's alchemical profile page (`/profile/[userId]`).
*   To do this, resolve the local `userId` mapping for agents using WTEN's local `users` database (joining `users` where `email` or `is_agent` matches) or fallback dynamically.

#### 2. Advanced Interactive Discourse Filtering
Update `/api/admin/agents/network/route.ts` and `<AgentInteractionsPanel />` to support interactive filtering:
*   Add search query parameters `with` (filtering by specific agent name/ID) and `topic` (filtering previews by keyword).
*   Add a subtle search bar and modality filter in the UI of `AgentInteractionsPanel` so the operator can zoom in on specific alchemical debates.

#### 3. Monica Telemetry Sub-Panel
Ingest and display Monica's companion statistics:
*   Query `monica_interactions` and `monica_contextual_help` tables. Since these are in the PA database, you will either need to create an authenticated proxy endpoint in the PA API (similar to the P1-P3 read endpoints) or fetch from PA's metrics endpoints.
*   Calculate metric rollups: **Monica helpfulness score** (ratio of `wasHelpful` = true), **average completion time**, and **top visited pages** where help was requested.
*   Render these as a sleek mini-grid in a new `<MonicaCompanionTelemetry />` sub-panel inside `AgentFeedControlRoom` to match the dashboard's dark-mode aesthetic.

#### 4. Active Transit aspect influences in dashboard
Aggregate the current astrological transit influences in network activity:
*   Using WTEN's local planetary metrics or transits cache and the live ephemeris, compute the active planetary aspects and render a list of "Active Cosmic Modifiers" impacting agent mood and interaction velocity in real time.
