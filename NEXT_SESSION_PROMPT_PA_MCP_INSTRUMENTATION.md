# PA MCP Server — Mirror the WTEN Instrumentation Pass

**Where to run this:** `/Users/cookingwithcastro/Desktop/planetary_agents-main`
**Sibling reference:** WTEN PR [#455](https://github.com/gregcastro23/WhatToEatNext/pull/455) — same six-item shape, applied to the Python/FastAPI side.

---

## Why

The WTEN side just shipped six-part instrumentation around the **Alchm MCP server** (TypeScript/Bun): invocation telemetry, synthetic probe, token gate, live-state enrichment, test harness, public connector manifest. The dashboard now treats external-LLM traffic as a first-class operational surface alongside in-app traffic.

The **PA MCP server** (`backend/planetary_agents_mcp_server.py`) is still uninstrumented. It exposes three tools (`chat_with_planetary_agent`, `get_agent_feed_discussion`, `synthesize_culinary_debate`) that bridge into PA's FastAPI chat pipeline and the Alchm MCP. When a Claude Desktop / Cursor user hits one of those tools — or when the WTEN-side bridge calls them — we have **zero visibility** into:
- How often they're called, by whom
- Which personas are hot
- Failure rate, latency, model-tier mix
- Whether the synthesize-culinary-debate bridge into Alchm MCP is actually firing

This session mirrors the WTEN pattern on the PA side so the two MCP surfaces have symmetric operational tooling.

---

## What I already did in WTEN that you should NOT redo

WTEN PR #455 added (these are already merged and live):
1. `mcp_invocations` table in **WTEN's** Postgres with full call history
2. Synthetic MCP probe (`/api/cron/synthetic-mcp`, `*/30`) exercising Alchm tool handlers in-process
3. Token gate at the Alchm MCP boundary (per-tool ESMS debit via `_meta.apiKey`)
4. **PA's `chat_with_planetary_agent` + `synthesize_culinary_debate` now enrich every persona call with `liveSkyState` from Alchm MCP** — this change is **already on disk in `backend/planetary_agents_mcp_server.py` but uncommitted in the PA repo**. First step in this session: `git status` and `git diff` that file to see what's pending; commit it (or revise it) before adding new work on top.
5. Test harness for Alchm MCP (`src/lib/mcp/__tests__/tools.test.ts` + opt-in stdio integration test)
6. Public connector manifest for Alchm MCP (`mcp-server/README.md`, `claude-desktop.config.example.json`, `cursor.mcp.example.json`)

Two MCP servers, two databases. The WTEN telemetry table lives in WTEN Postgres; the PA telemetry table should live in **PA Postgres** (cognitive layer — see PA's `ARCHITECTURE.md` for the separation rationale).

---

## The Six-Item Mirror

Each item below maps 1:1 to the WTEN PR. File paths are PA-side.

### 1. PA MCP invocation telemetry

- Add `mcp_invocations` table to **PA's Postgres** (via Prisma migration — PA uses `prisma/schema.prisma`). Same shape as WTEN's `database/init/46-mcp-invocations.sql`, columns to keep:
  - `id`, `tool_name`, `called_at`, `completed_at`, `latency_ms`, `success`, `caller`, `arguments JSONB`, `result_summary JSONB`, `error_message`
  - Add a PA-specific column: `agent_id TEXT` (set when `tool_name = 'chat_with_planetary_agent'` or `'synthesize_culinary_debate'` — captures which persona was invoked)
  - Add `model_tier TEXT` so we can see free vs. primary vs. reflective mix
- Foreign keys: PA Postgres has a `User` and likely an `Agent` table — bind `user_id` and `agent_id` if those tables exist; otherwise leave free-form TEXT.
- Indexes: `(tool_name, called_at DESC)`, `(agent_id, called_at DESC) WHERE agent_id IS NOT NULL`, `(called_at DESC) WHERE success = false`
- Write a Python helper `backend/mcp_invocation_log.py` exposing `async def record_invocation(...)`. Match the fire-and-forget pattern (use `asyncio.create_task` so DB failures never break a tool call).
- Refactor `planetary_agents_mcp_server.py`'s `handle_request` to wrap every `tools/call` dispatch with `record_invocation`. **Do not add it inside the individual handlers** — wrap once at the dispatch layer so the three handlers stay narrow.

### 2. PA MCP synthetic probe

- WTEN's pattern: in-process call via `invokeTool()` from a Vercel cron. PA's pattern should mirror — a FastAPI route at `POST /api/cron/synthetic-mcp-probe` (auth: `X-Cron-Secret` matching `PA_CRON_SECRET` env) that:
  - Calls `chat_with_planetary_agent` with a no-op message ("ping" or similar) targeted at a low-cost persona (`socrates`), `modelTier="free"`
  - Calls `get_agent_feed_discussion` with a known-good thread ID (seed one)
  - Skips `synthesize_culinary_debate` from the probe — it spends real model budget. (Optional hourly version like WTEN's `synthetic-cosmic-recipe` cron if you want.)
  - Records each call's status + latency to `mcp_invocations` (caller=`synthetic-probe`)
- Schedule via Railway cron service (PA hosts on Railway — see `backend/` Dockerfile + Railway config). 30-minute cadence to match WTEN's `*/30`.
- Surface in PA's admin/observability dashboard if one exists; otherwise expose a `GET /api/admin/mcp-status` that returns latest-per-probe.

### 3. Quota / model-tier gate at PA MCP boundary

- PA's existing pattern uses `modelTier` ("free" | "cheap_fast" | "primary" | "reflective") — see `DEFAULT_MODEL_TIER` in `planetary_agents_mcp_server.py`.
- Add a per-API-key model-tier ceiling: free-tier keys can only invoke `modelTier="free"` or `"cheap_fast"`. Primary/reflective requires a paid key.
- Auth shape mirrors WTEN's: `_meta.apiKey` on the tool arguments, resolved against PA's `ApiKey` table (Prisma model — check `prisma/schema.prisma`; create the model if it doesn't exist).
- Anonymous callers (no `_meta.apiKey`) get `modelTier="free"` forced regardless of what they request; record the original-vs-applied tier on the invocation row.
- `synthesize_culinary_debate` is the expensive one — gate it harder: anonymous callers get a single-persona response instead of the full multi-agent debate; full debate requires an authenticated key with `tier=alchemist` or equivalent.

### 4. Reverse-direction enrichment

- WTEN side enriches PA persona calls with `liveSkyState`. The reverse should also exist: when the Alchm MCP's `generate_cosmic_recipe` is invoked **and** the caller is identified as a PA persona (via `_meta.caller="pa-mcp"`), the Alchm MCP could log it to PA's `mcp_invocations` too, so the PA dashboard shows when its personas used Alchm tools.
- **Skip this for v1.** It requires cross-DB writes, which violates the dual-database boundary. Better path: a periodic reconciliation cron that reads Alchm `mcp_invocations` rows with `caller='pa-mcp'` (via Alchm's internal API) and mirrors a summary into PA. Park it as a follow-up — note it in the PR description.

### 5. Test harness for PA MCP

- `backend/tests/test_mcp_server.py` (pytest) — unit tests for each tool handler with the FastAPI backend mocked:
  - `chat_with_planetary_agent` happy path + missing-agentName + backend-500
  - `get_agent_feed_discussion` happy path + threadId-not-found + frontend-500
  - `synthesize_culinary_debate` happy path with mocked `alchm_mcp.alchemize_ingredients` / `alchm_mcp.generate_cosmic_recipe` / `_live_sky_context`
  - Tier-gate behavior: anonymous caller forced to `modelTier="free"`
- Stdio integration test (opt-in via `PA_MCP_E2E=1` env): spawn `python -m planetary_agents_mcp_server` as subprocess, speak JSON-RPC, assert `initialize` + `tools/list` + a real `chat_with_planetary_agent` round-trip (against a local FastAPI mock).
- Hook into PA's existing pytest CI step. Don't add a new CI workflow — extend whatever's already running.

### 6. Public connector manifest

- `backend/README_MCP.md` — analog to WTEN's `mcp-server/README.md`. Cover:
  - Three tools + costs (free vs. tiered)
  - Per-call `_meta.apiKey` + `_meta.caller`
  - `PA_USER_API_KEY` env var for single-user Claude Desktop installs
  - Telemetry surfaces (the new `mcp_invocations` table + admin endpoint)
- `backend/claude-desktop.pa.example.json` + `backend/cursor.pa.mcp.example.json` — copy WTEN's templates but for the PA MCP (`command: python`, `args: ["-m", "planetary_agents_mcp_server"]`).
- Update PA's main `README.md` to link both.
- Update PA's `ARCHITECTURE.md` (the file that pairs with WTEN's `mcp-server/ARCHITECTURE.md`) so the topology diagram shows the new telemetry flow.

---

## How to start

```bash
cd /Users/cookingwithcastro/Desktop/planetary_agents-main
git status                              # see the uncommitted _live_sky_context edits
git diff backend/planetary_agents_mcp_server.py
git checkout -b feat/mcp-instrumentation
```

First commit should be **just the existing uncommitted edits** to `planetary_agents_mcp_server.py` (the `_live_sky_context()` helper + `chat_with_planetary_agent` / `synthesize_culinary_debate` sky enrichment). Title: `feat(mcp): ground personas in live sky state from Alchm MCP`. Then build the six items on top in subsequent commits.

## Verification before opening the PR

- `pytest backend/tests/test_mcp_server.py` — green
- `PA_MCP_E2E=1 pytest backend/tests/test_mcp_stdio.py` — green when run locally
- Migration applied to PA Postgres (use Railway MCP or the existing PA migration tooling — check `backend/` for an `apply_migration_*.py` or similar pattern, mirror it for the new migration)
- Hit the synthetic probe route manually with the cron secret, verify one row lands in `mcp_invocations`
- Type-check / lint per PA's `pre-commit` config

## PR shape

Single PR, title pattern: `feat(mcp): instrument PA MCP surface with telemetry, synthetic probes, and tier gate`. Body sections: Summary / What changed / Why / Operational state / Test plan — same layout as WTEN PR #455 for parity.

## Things to flag in the PR if you discover them

- Whether PA's `ApiKey` model exists or needs to be created (and whether it should share auth with WTEN's `api_keys` via a unified-auth service, or stay independent)
- Whether PA's Postgres already has an analog to WTEN's `prune_observability_logs` function — if not, add one alongside the new migration
- Anything in the existing PA MCP code that drifted from WTEN's pattern (e.g., the JSON-RPC dispatch loop is hand-rolled in Python instead of using the MCP SDK — fine, but worth noting)

## Out of scope for this PR

- The cross-DB reconciliation cron (item #4) — park as follow-up
- Public MCP connector listing on a marketplace
- Token billing wired to Stripe — that's a separate WTEN-side change once auth is unified
