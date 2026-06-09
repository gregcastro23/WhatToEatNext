# ADR-008: SpacetimeDB live-state layer

**Status:** Accepted (v4.0)
**Date:** 2026-06-09

## Context

Multi-user and cross-device surfaces (weekly meal planner, grocery cart,
community feed, commensal dinner parties) ran on HTTP polling (30–60s) or
purely local state (localStorage). Vercel's serverless runtime kills
long-lived connections our functions hold open, which is why the codebase
standardized on hardened polling rather than SSE/WebSockets — at the cost of
latency and per-user request volume.

## Decision

Adopt SpacetimeDB (Rust module `spacetime-module/`, `alchm_culinary`,
SDK + CLI pinned to 2.4.1) as an **optional, flag-gated live-state layer**:

1. **One module, two schema families.** The culinary catalog
   (`ingredient`/`recipe`/`recipe_ingredient`/`cuisine`/`cuisine_recipe`,
   write-time alchemical aggregation) and per-user live state
   (`meal_plan_slot`, `grocery_cart_item`, `feed_event`,
   `commensal_session` + `commensal_member`) live in the same module so
   reducers stay atomic across both (e.g. a meal slot fails closed on a
   dangling in-module `recipe_id`) and clients hold a single connection.
2. **Ownership via `ctx.sender()`.** Every live-state row carries an
   `Identity` owner that reducers derive from the caller — never from
   arguments — so a client can only mutate its own rows. Tables are public
   for reads; row-level visibility filters are a follow-up.
3. **Browser ↔ SpacetimeDB WebSockets are the sanctioned exception to the
   polling rule.** The socket goes directly from the browser to the
   SpacetimeDB instance; no serverless function holds it open, so platform
   idle timeouts don't apply. HTTP polling remains in place wherever it
   already existed, as the degraded fallback.

### Frontend integration pattern

`SpacetimeProvider` (`src/contexts/SpacetimeContext.tsx`) exposes
`{ connection, status: disabled|connecting|connected|degraded, identityHex }`
with token persistence and capped-backoff reconnect. Each consumer is gated
by its own env flag and goes inert unless `status === "connected"`:

| Surface | Flag (`NEXT_PUBLIC_SPACETIME_LIVE_*`) | Mechanism |
| --- | --- | --- |
| Recipe browse | `CULINARY` | `useSpacetimeLiveRecipes` merges unseen live recipes into the static list |
| Meal planner | `PLANNER` | `useSpacetimePlannerSync` write-mirror (below) |
| Grocery cart | `CART` | Two-way sync inside `GroceryCartContext` |
| Feed | `FEED` | `useLiveFeedEvents` prepends pushed events; 30s poll stays as fallback |
| Commensal | `COMMENSAL` | `LiveCommensalLobby` — sessions + live presence |

### Sync semantics (and their deliberate limits)

- **Planner — one-way write-mirror with scoped deletes.** Local plan diffs
  converge the user's remote rows (upsert/lock/clear). Deletes are only
  issued for slots *the current session previously pushed*, so a fresh
  device with an empty local plan can never wipe rows written elsewhere.
  Remote→local application needs the recipe catalog to rehydrate full
  recipe objects from `recipe_ref` and is a documented follow-up.
- **Cart — two-way.** Rows carry the full item payload, so remote
  inserts/updates are adopted into local state and local changes push
  through reducers. Echo-loops are prevented by comparing value signatures
  against the last-pushed snapshot; deletes are scoped like the planner's.
  Re-running a device that was offline can resurrect items another device
  deleted (no tombstones in v1) — acceptable for a grocery cart.
- **Feed — append-only union.** Live `feed_event` rows come from a separate
  store than the Postgres `/api/feed` rows, so a plain prepend cannot
  duplicate; the long-term plan is to dual-write or migrate fully.
- **Commensal — authoritative live state.** Sessions/membership only exist
  in SpacetimeDB; host-only status changes and host-leave-closes-session are
  enforced in the reducers, not the UI.

### Fallback strategy

No `NEXT_PUBLIC_SPACETIME_URI` → provider stays `disabled`; flags off →
hooks return inert values; connection drops → consumers revert to legacy
behavior automatically (state clears, polling continues, lobby unmounts).
The live layer is an enhancement, never a dependency: nothing blocks render
and no user data is lost when it is absent.

## Consequences

- Real-time multi-device sync lands without touching the Railway/Postgres
  backend, and each surface can be enabled independently in production.
- Two sources of truth exist per surface while flags roll out; the sync
  semantics above bound the divergence and the ADR'd follow-ups
  (remote→local planner application, cart tombstones, feed dual-write,
  RLS visibility filters) close it.
- The module schema is the contract: changing `spacetime-module/` requires
  regenerating `src/lib/spacetime/generated/` (`spacetime generate
  --lang typescript --module-path spacetime-module --out-dir
  src/lib/spacetime/generated`) in the same PR.
