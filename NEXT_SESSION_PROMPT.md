# Next session — post-Phase 43 response contracts and the WTEN ↔ ASOL boundary

## Starting state (verified 2026-10-01)

- Phase 43 is merged: [PR #933](https://github.com/gregcastro23/WhatToEatNext/pull/933) merged 2026-09-30, and `bfa1cde` is the head of `master`. Branch from `master`; there is nothing to wait for. Read `docs/PHASE_43_CLOSEOUT.md`, `CONTEXT.md`, and ADRs 013 and 014 (the existing cross-site contracts) before touching code.
- Phase 43 ceilings: 106 domain loose-optionality sites, 89 wire sites, 85 production bare JSON casts (94 total), 0 scripts typecheck errors, 2,827 single assertion sites, 1,293 tracked lint warnings. These are context, not headroom. Re-measure on the starting tree before changing any baseline.
- Do not repeat the completed optionality, cast, assertion, or scripts campaigns. The house-stellium `"Fire"`/`fire` mismatch is a scoring decision, not a type cleanup; leave it alone.

## Boundary rule: do not grow WTEN into ASOL

- **WTEN** (`alchm.kitchen`) owns recommendations, meal planning, Celestial Lab, Commensal Dining tables, the food diary, the token economy, and the static ingredient/recipe catalogs.
- **ASOL** (`agents.alchm.kitchen` UI, `api.agents.alchm.kitchen` API) owns the Planetary Agents UI and backend. Agent creation, Monica Agent, and the Philosopher's Stone are canonical ASOL features.
- Cross-site interaction goes through defined points only: `NEXT_PUBLIC_AGENTS_UI_URL` and `PLANETARY_AGENTS_API_URL` via `src/lib/serviceUrls.ts`, and server-to-server calls authenticated with `INTERNAL_API_SECRET`. Reuse the `agentChatUrl.ts` pattern for links; never hard-code the host.
- **Allowed** in WTEN-resident, ASOL-adjacent code (`src/app/api/agents/unified`, `src/app/api/agent-forge/ignite`, `src/app/api/philosophers-stone/positions`, `src/app/api/planetary-agents/diet`, the Philosopher's Stone page): audit, correctness and security fixes, and removing dead calls.
- **Not allowed** without an explicit owner decision: new agent-creation schemas, new tables or migrations, atomic multi-table transactions, new local routes standing in for ASOL endpoints, or deleting the existing WTEN-resident creation paths. If the audit concludes something should move to ASOL, write it up as a decision for the owner (a candidate ADR) and stop there.

## 1. First target: replace opaque response validation with real contracts

Four predicate-less `z.custom<T>()` sites remain (every other `z.custom` in `src` carries a predicate):

- `src/hooks/useFoodDiary.ts:155` (`entries`) and `:267` (`entry`)
- `src/hooks/useTables.ts:16` (`tables`) and `:20` (`table`)

The earlier prompt listed a fifth, a subscription site in `PremiumContext.tsx`. It no longer exists: the premium tier was retired in #919 (owner ruling 2026-09-28), so the `tier: "standard"` audit is moot. The `rate_limit_tier: "standard"` in the account schemas is the API-key tier and unrelated.

The cast is not the only defect. All four sites do `parsed.success ? parsed.data : {}`, so a malformed 2xx silently becomes empty state:

- `useMyTables` calls `setTables([])` and wipes prior good state with no error.
- `useFoodDiary.loadCoreData` renders an empty diary.
- `addEntry` after a 2xx POST with an unreadable body returns `null`. That reads as a plain failure and invites a duplicate submit although the row may exist.

Fix those behaviors, not just the types.

- **Scope**: take one coherent producer-to-consumer slice (producers under `src/app/api/food-diary` or `src/app/api/tables`). Food diary is the cheaper start: list and create share one `FoodDiaryEntry` type. Read every success, degraded, and error response the producer can emit, and validate only the fields the consumer actually reads.
- **Compile-time**: where an authoritative server type exists (`FoodDiaryEntry`, `TableRecord`, `TableDetail`), add a drift guard against it, following the pattern in `src/lib/admin/schemas/`.
- **Runtime**: invoke the real route handler and parse its real output with the schema, as `phase43ConsumerRecovery.test.ts` does. Add malformed-2xx cases for each site. Show the new tests failing on the starting tree, then passing.
- **Behavior**:
  - An unreadable 2xx read keeps prior good state and surfaces an explicit unavailable/error state (the Phase 43 `economyError` and `companionsUnavailable` pattern).
  - An unreadable 2xx mutation reconciles with a refetch and tells the user the outcome is uncertain.
  - A non-2xx stays an ordinary failure.
  - Use `safeReadJson(..., { parse })` so `check:read-json` stays at 0.
- **Data inspection**: for `food_source`, `meal_type`, and serving units, read the migrations, every writer, and the fixtures before choosing enums. If production values cannot be read, do not enumerate from code alone: validate as a constrained string, or defer with evidence. For tables, inspect `composite_snapshot` and the fields each reader consumes.
- **Never** replace a cast with `z.unknown()`, a permissive `z.custom`, or an unchecked assertion. If a site needs a product or data decision, leave it deferred with evidence and finish a safe slice instead.

Done when: the predicate-less count drops (or each remainder is deferred with evidence), `check:bare-json` does not rise, and the behavior above is covered by tests that fail without the change.

## 2. Second target (only after 1 is verified): the Monica / Philosopher's Stone boundary

Facts to confirm first, not assume:

- `src/app/(alchm)/philosophers-stone/page.tsx:292` calls `fetch('/api/monica-agent')`. There is no such route under `src/app/api`, and `next.config` has removed its proxy rewrites, so on `alchm.kitchen` it most likely 404s on the WTEN origin. Trace or curl it to confirm.
- `docs/physics/SYNTHESIS_MODEL.md` (§16a) records `/api/monica-agent` as a Planetary Agents route called by PA's `MonicaChatBubble`. That points to ASOL ownership, but it is a docs claim and may be stale.
- The call has no `response.ok` check and uses a bare cast. It is the one cast Phase 43 deferred, so resolving it should move production casts 85 → 84. Ratchet only after measuring.
- The same page also calls local `/api/agents/unified` for creation and chat (Phase 43 added `clientRequestId` and creator-scoped dedupe there). That route and `/api/agent-forge/ignite` are WTEN-resident creation paths today.

Steps:

1. **Inventory** every Monica and Philosopher's Stone touchpoint in WTEN: file, call, target origin, owner, live or dead. Put the table in the closeout note, not in new code.
2. **Locate** the real `/api/monica-agent` and the `/philosophers-stone` page. Try `list_repos` / `add_repo` for the ASOL repo, or probe `agents.alchm.kitchen`. Mark anything you cannot reach as unverified.
3. **Make the smallest repair**:
   - If ASOL hosts the Philosopher's Stone, hand off to `${agentsUi}/philosophers-stone` via `getServiceUrlSafe("agentsUi")`.
   - If WTEN keeps an embedded view, remove or gate the dead Monica call with an explicit user-facing unavailable state. Call ASOL directly from the browser only if you have verified its CORS and auth support that.
   - If neither works without a new proxy or schema, stop and ask for the decision.
4. **Do not** invent a schema from the old cast, add a local stand-in route, or silently redirect the call to `/api/agents/unified`.

## Deliberately deferred

The previous prompt's first target (atomic, database-enforced agent-creation idempotency) is dropped under the boundary rule above. The Phase 43 limitation stands: the `clientRequestId` lookup in `/api/agents/unified` is non-atomic, and concurrent identical requests can both insert. Carry it into the closeout as an open owner decision (does creation belong in ASOL?). Do not fix it here.

## Working rules and completion

- Target 1 first. Start target 2 only when target 1 has passing focused tests and a green `bun run verify:static`.
- Run focused jest suites, `bun run verify:static`, and `bun run build`.
- Ratchet baselines only after measuring the final tree, and only counts that went down.
- Write `docs/PHASE_44_CLOSEOUT.md` with measured gate deltas, the touchpoint inventory, deferred sites with evidence, and anything left unverified. Say plainly what you could not check.
