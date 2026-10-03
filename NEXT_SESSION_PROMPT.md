# Next session — post-Phase 43 reliability and type-safety targets

Phase 43 is complete in [PR #933](https://github.com/gregcastro23/WhatToEatNext/pull/933). Read `docs/PHASE_43_CLOSEOUT.md` and check the PR's latest status before beginning. Work from an updated `master` after the PR merges, or explicitly state why a follow-up must branch from the PR. Do not repeat the completed optionality, cast, assertion, or scripts campaigns.

The committed Phase 43 ceilings are 106 domain loose-optionality sites, 89 wire sites, 85 production bare JSON casts (94 total), zero scripts typecheck errors, 2,827 single assertion sites, and 1,293 tracked lint warnings. Re-measure against the actual starting tree before changing a baseline; these numbers are context, not permission to spend headroom.

## 1. First implementation target: make agent creation truly idempotent

`src/app/api/agents/unified/route.ts` now scopes `clientRequestId` lookup to `createdByUserId`, but the lookup and the three inserts (`users`, `user_profiles`, `token_balances`) are separate operations. Two concurrent requests can both miss the lookup and create agents; failure after the first insert can leave a partial agent that a retry cannot find through the current join. This is the highest-value follow-up because a lost 2xx response already causes the client to retry with the same ID.

Design a database-enforced uniqueness boundary for `(creator, clientRequestId)` and make the creation writes atomic. Inspect the migration runner and existing rows before choosing a partial unique index on `users.profile` or a dedicated idempotency table. Plan the rollout so the constraint exists before code relies on it. On a uniqueness conflict, read and return the completed original agent rather than surfacing a generic 500. Decide and document what a replay with the same ID but different input means. Preserve behavior for requests without a client ID.

Acceptance evidence: two simultaneous requests by one creator return one agent ID and leave one complete set of rows; replay after a lost response returns that ID; the same request ID from another creator is independent; an injected failure rolls back all related writes; malformed input cannot retrieve a previous agent. Prefer a database-backed concurrency test over a mock that only checks SQL strings. If a database test cannot run locally, keep the migration and concurrency claim explicitly unverified.

## 2. Next type-safety target: replace opaque response validation with real contracts

Five predicate-less `z.custom<T>()` sites still act as casts at response boundaries: `PremiumContext.tsx` (subscription), `useFoodDiary.ts` (entries and entry), and `useTables.ts` (list and detail). Start with one coherent producer-to-consumer slice, read every success, degraded, and error response, and validate only fields that the consumer actually needs. Add compile-time producer/reader compatibility checks where an authoritative server type exists, plus runtime tests for real response shapes and malformed 2xx payloads. Preserve prior good read state and uncertain mutation handling; do not replace the casts with `z.unknown()`, a permissive `z.custom`, or an unchecked assertion.

The subscription route currently emits `tier: "standard"`, which is outside the existing union. Audit the product meaning of that tier before changing entitlement behavior or narrowing the schema. For food diary, inspect stored `food_source`, `meal_type`, and serving-unit values before using enums. For tables, inspect `composite_snapshot` and the fields each reader consumes. If a contract needs a product or data decision, leave that site deferred with evidence and complete a safe slice instead.

## 3. Investigate the unresolved Monica chat endpoint

`src/app/(alchm)/philosophers-stone/page.tsx` still calls `/api/monica-agent`, while Phase 43 found no local Next route or documented rewrite for that path. Trace the actual deployed request and intended provider before changing code. If the endpoint is absent, make its user-facing failure explicit and propose or implement the smallest supported route/consumer repair with a verified response contract. Do not invent a schema from the old cast or silently redirect it to `/api/agents/unified` without checking semantics.

## Working rules and completion

Keep the first session focused on target 1; take target 2 or 3 only if the primary change is complete and verified. Treat the house-stellium `"Fire"`/`fire` mismatch as a separate scoring decision, not a type-only cleanup. For response work, distinguish a server rejection from an unreadable 2xx mutation result. Run focused tests, `bun run verify:static`, and the relevant build/integration checks. Ratchet baselines only after measuring the final merged tree. Record remaining risks and actual gate deltas in a closeout note.
