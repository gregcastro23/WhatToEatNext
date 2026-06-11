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

## Update (2026-06-10) — v1.1 sync upgrades

Three of the v1 limits above are now closed; one is blocked upstream:

- **Planner remote→local application (partial) — shipped.** Slot *removals*,
  *servings* changes, and *lock* changes made on other devices now apply to
  local state (for slots whose `recipe_ref` matches). Remote *additions and
  dish replacements* still require rehydrating a full recipe object from
  `recipe_ref`; they are surfaced honestly as an "N elsewhere" count on the
  sync badge rather than guessed at. Full materialization via catalog lookup
  remains the follow-up.
- **Durable push-state (tombstone-equivalent) — shipped.** The planner and
  cart "what this device pushed" maps now persist to localStorage per
  SpacetimeDB identity (`src/lib/spacetime/pushedState.ts`), so deletions
  made elsewhere while a device was offline are recognized on its next
  session instead of being resurrected. A grace window (10s) prevents an
  in-flight or rejected push from being misread as a remote deletion.
- **Feed dual-write — shipped, client-side.** User shares now publish to the
  live `feed_event` table in addition to the Postgres write
  (`src/lib/spacetime/liveFeedPublish.ts`, wired into the planner's
  share-to-feed flow). Client-side is deliberate: the module stamps
  `actor = ctx.sender`, so events must travel over the user's own connection
  for attribution to be correct. Agent/server-originated events remain
  poll-only until a server-identity strategy exists.
- **Row-level visibility filters — blocked upstream, deliberately not
  shipped.** SpacetimeDB 2.4.1's `client_visibility_filter` is feature-gated
  `unstable` and documented by the SDK itself as "currently unimplemented,
  and not enforced". Shipping it would compile but protect nothing.
  Owner-private reads stay a tracked follow-up for a SpacetimeDB upgrade;
  clients filter by identity in the meantime and no sensitive data lives in
  these rows.

## Update (2026-06-11) — planner sync guards (#517) + remote-slot materialization

Verification against an isolated local instance (#517) surfaced three races
in the planner mirror, and the headline v1.1 follow-up — materializing
remote additions — has now shipped. The planner's sync semantics as they
stand:

- **Echo guard (#517).** Remote→local application of servings/locks is
  skipped while the local slot is *ahead of what this device last pushed*
  (its value-signature differs from the durable pushed entry). Without
  this, the debounced write-mirror lost local edits to their own stale
  remote echo: a `+1 servings` click was reverted by the not-yet-updated
  remote row before the push ever fired.
- **Session-scoped remote deletes vs durable tombstone recognition (#517).**
  The durable pushed map and the delete scope are now distinct concepts.
  `clearMealPlanSlot` is only issued for keys that existed in the local plan
  *this session* — the durable map alone must not drive deletes, because the
  local plan does not survive a reload (guests are in-memory) while the
  durable map does; a reload's empty plan was wiping every remote row the
  device had ever pushed. The durable map still serves remote-deletion
  recognition (tombstone-equivalent) and the echo guard.
- **Week-scoped session keys (this update).** Session keys are cleared
  whenever the local menu changes weeks. Week navigation swaps the entire
  plan object, so without this the vacated week's keys read as "present in
  session, missing from plan" — i.e. deletions — and navigating away from a
  planned week wiped its remote rows.
- **Remote-slot materialization — shipped.** The "N elsewhere" count is now
  a transient state, not a terminal one. Remote *additions* and *dish
  replacements* are rehydrated into real local meals by resolving
  `recipe_ref` against the static catalog (by id, then exact name) and the
  live `recipe` table (`stdb-{id}` refs) via `useRecipeRefResolver`. Both
  sources load lazily — first time a planner session actually has remote
  slots to rehydrate — so ordinary visits pay neither the catalog fetch nor
  the live-table subscription. Materialization seeds the durable pushed
  entry with the exact signature the local slot will have once the insert
  lands, so the echo guard reads it as in-sync and the write-mirror has
  nothing to push back (no ping-pong). Replacements only materialize when
  the local slot has no pending edit of its own; otherwise local wins and
  the write-mirror converges remote to local, preserving last-writer-wins.
  Guest reloads now fully restore the plan from the module instead of
  parking it in the "elsewhere" count. Unresolvable refs stay surfaced
  honestly as `unappliedRemoteSlots`, which is now scoped to the *current
  week* — rows for other weeks are out of view, not pending, and
  materialize when the planner navigates to their week.

Verified end-to-end against a local SpacetimeDB 2.4.1 instance (real Chrome
over CDP, shared identity with a driver client): static-ref and stdb-ref
additions, a live replacement, a remote deletion, and a week-navigation
round-trip — remote rows byte-stable throughout (no unintended writes), and
locks/servings preserved across materialization.
