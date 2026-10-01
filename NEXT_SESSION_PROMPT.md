# Next session — post-Phase 43 reliability and architectural boundary targets

Phase 43 is complete in [PR #933](https://github.com/gregcastro23/WhatToEatNext/pull/933). Read `docs/PHASE_43_CLOSEOUT.md` and check the PR's latest status before beginning. Work from an updated `master` after the PR merges.

The committed Phase 43 ceilings are 106 domain loose-optionality sites, 89 wire sites, 85 production bare JSON casts (94 total), zero scripts typecheck errors, 2,827 single assertion sites, and 1,293 tracked lint warnings.

---

## Architectural Boundary Rule: Avoid Scope Creep into ASOL

We operate a strict multi-project boundary:
1. **WTEN (`alchm.kitchen`)**: Core culinary recommendation engine, meal planning, Celestial Lab, Commensal Dining tables, food diary, token economy, and static ingredient/recipe catalogs.
2. **ASOL (`agents.alchm.kitchen` / `api.agents.alchm.kitchen`)**: Planetary Agents UI and backend. **Agent creation, Monica Agent, and the Philosopher's Stone are canonical features of ASOL.**

**Avoid Scope Creep:**
Do **not** re-architect or inflate agent creation schemas, atomic multi-table transactions, or database migrations in WTEN for features that canonically belong to ASOL. Any overlap between WTEN and ASOL must use distinct, well-defined interaction points (e.g. `NEXT_PUBLIC_AGENTS_UI_URL`, server-to-server sync with `INTERNAL_API_SECRET`, public synastry/profile endpoints), rather than duplicating ASOL systems in WTEN.

---

## 1. First implementation target: replace opaque response validation with real contracts

Five predicate-less `z.custom<T>()` sites still act as casts at response boundaries in WTEN: `PremiumContext.tsx` (subscription), `useFoodDiary.ts` (entries and entry), and `useTables.ts` (list and detail).

- Start with one coherent producer-to-consumer slice, read every success, degraded, and error response, and validate only fields that the consumer actually needs.
- Add compile-time producer/reader compatibility checks where an authoritative server type exists, plus runtime tests for real response shapes and malformed 2xx payloads.
- Preserve prior good read state and uncertain mutation handling; do not replace the casts with `z.unknown()`, a permissive `z.custom`, or an unchecked assertion.
- **Context details:**
  - Subscription route currently emits `tier: "standard"`, which is outside the existing union. Audit the product meaning of that tier before changing entitlement behavior or narrowing the schema.
  - For food diary, inspect stored `food_source`, `meal_type`, and serving-unit values before using enums.
  - For tables, inspect `composite_snapshot` and the fields each reader consumes.

---

## 2. Second implementation target: clarify WTEN ↔ ASOL boundaries for Philosopher's Stone & Monica

In WTEN, `src/app/(alchm)/philosophers-stone/page.tsx` calls `/api/monica-agent` (which has no local route in WTEN). Both Monica Agent and Philosopher's Stone are features belonging to ASOL (`agents.alchm.kitchen`).

- Audit the Philosopher's Stone and Monica touchpoints in WTEN.
- Ensure the boundary between the two sites is clean and distinct:
  - If Philosopher's Stone is hosted on ASOL, WTEN should delegate or hand off to `NEXT_PUBLIC_AGENTS_UI_URL/philosophers-stone`.
  - If WTEN maintains an embedded consumer view, ensure it talks directly to the canonical ASOL API (`NEXT_PUBLIC_AGENTS_UI_URL` / PA service) rather than calling nonexistent local endpoints or maintaining redundant local agent-forging logic.
- Avoid building orphan local routes or speculative schemas in WTEN for ASOL-owned features.

---

## 3. Working rules and completion

Keep the session focused on target 1 first; proceed to target 2 once target 1 is verified. For response work, distinguish a server rejection from an unreadable 2xx mutation result. Run focused tests, `bun run verify:static`, and the relevant build/integration checks. Ratchet baselines only after measuring the final merged tree.
