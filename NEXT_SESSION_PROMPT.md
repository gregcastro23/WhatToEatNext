# Phase 43: Domain Loose Optionality (≤115), Bare JSON Casts (≤85), Assertion Sites (≤2,850), Scripts Typecheck (≤3)

Implement this campaign in the existing WhatToEatNext repository. Start by presenting a clear, evidence-based plan and pause for review. Do not proceed to implementation until the plan has been reviewed and approved, allowing for potential improvements to be incorporated. Once approved, use judgment for routine reversible decisions, and ask only when a missing requirement or permission genuinely blocks dependent work.

---

## 1. Starting State (Phase 42, measured on `master` @ `b20e3baf` + the Phase 42 diff, September 25, 2026)

Phase 42's full report is `docs/PHASE_42_CLOSEOUT.md`. Branch from `master` after Phase 42 merges, not from the Phase 42 branch. Check `git log master..HEAD` on the new branch before measuring: Phase 42's branch was first cut with two unmerged #890 commits on it, and they pushed a gate over its baseline.

| Gate | Measured | Baseline file |
|---|---:|---|
| Domain loose optionality | **133** (89 wire, allowlisted) | `.lint-debt-baseline.json` → `looseOptionality` |
| Bare JSON casts (`check:bare-json`) | **97 prod / 106 total**: 92 `res.json()` casts + 5 predicate-less `z.custom<T>()` | `.bare-json-casts-baseline.json` |
| Scripts typecheck errors (`check:scripts`) | **9 across 6 files** | `.scripts-typecheck-baseline.json` |
| Single assertion sites | **2,889** (3,053 total) | `.lint-debt-baseline.json` → `assertionSites` |
| Non-null assertions | **599** | `.lint-debt-baseline.json` → `assertionSites.nonNull` |
| Tracked lint debt | **1,304** | `.lint-debt-baseline.json` |

---

## 2. Rules Phases 41–42 learned the hard way

1. **A schema that checks nothing is still a cast.** `z.custom<T>()` with no
   predicate accepts every value, and `check:bare-json` counts it.
2. **Drift-guard every response schema against a named server type.** Use
   `type _X = AssertTrue<ServerSatisfies<ServerType, z.infer<typeof Schema>>>`
   (`src/lib/admin/schemas/drift.ts`).
   - If the route builds its payload inline, name the type (in `src/types/` or
     the service) and annotate `NextResponse.json<T>(…)`.
   - When the schema covers the whole payload, guard both directions. The
     reader can then keep the domain type with no cast.
3. **Match the wire, not the type.** Read every return path of the route,
   including degrade paths that send `null`.
   - A cast can hide a type that lies. `/api/food-diary` sent four totals where
     the hook claimed a full summary, and the dashboard crashed on it.
   - The subscription route sends `tier: "standard"`, which is outside its own
     union.
   - Stored enums can be wider than the TypeScript union. Audit before writing
     `z.enum`.
4. **A failed parse must not degrade silently.** Log with `_logger.error`
   (`warn` is silent in prod) and keep what the screen already showed.
   - For writes, a 2xx you cannot read is **not** a failure: the order may
     have settled, or the comment may have posted. Say so.
   - An absent count is unknown (`null`), never `0`.
5. **Optionality fixes.**
   - If a type is annotated `z.ZodType<T>` and every parse site reads JSON,
     pair `?: T` with `.exactOptional()`.
   - If every constructor always sets the key, write `key: T | undefined` and
     drop the `?`.
   - Never win the count by renaming to `*Wire`, adding to `wireAllowlist`, or
     moving files into `src/lib/validation/`.
6. **`check:diff-assertions` scans `src/` only.** Grep the `scripts/` diff for
   `as` and `!` by hand. Test files count toward `single`: use
   `installFetchMock` (`src/__tests__/helpers/fetchMock.ts`), not `as Response`.
7. **Prove each type-only edit.** Diff the emitted JavaScript
   (`ts.transpileModule`) with a real `diff -u`, and read every file that differs.
8. **Measure and ratchet on the merged tree.** CI checks the PR merged into
   master, so merge `origin/master` first, then run the three `:ratchet` scripts.

---

## 3. Recommended Scope for Phase 43

1. **Workstream A: Domain loose optionality (133 → ≤ 115).** Densest remaining
   files:
   - `src/app/api/planetary-positions/route.ts` (8)
   - `src/contexts/GroceryCartContext.tsx` (7)
   - `src/app/api/ingredients/[name]/route.ts` (7)
   - `src/hooks/useUserLocation.ts` (7)
   - `src/server/hono-api.ts` (6)
   - `src/hooks/useChartData.ts`, `src/lib/order/orderList.ts` and
     `src/services/AlchemicalApiClient.ts` (5 each)
2. **Workstream B: Bare JSON (97 → ≤ 85).** The 92 `res.json()` casts,
   densest first:
   - `philosophers-stone/page.tsx` (3), `celestial-lab/alchm/page.tsx` (3),
     `useAgentRelationalData.ts` (3), `tables/InvitePanel.tsx` (3)
   - then the 2-cast files
3. **The five deferred `z.custom` sites need decisions first (closeout §4).**
   Do not convert them blind.
   - `PremiumContext`: owner ruling on the `"standard"` tier (entitlement).
   - `useFoodDiary` entries: audit stored `food_source` / `meal_type` /
     `serving.unit` values against the unions.
   - `useTables`: view types per reader, or a `composite_snapshot` audit.
4. **Workstream C: Assertion sites (2,889 → ≤ 2,850).** Typed accumulators and
   type-guarded unions across `src/data/` and `src/utils/`, in production code
   first.
5. **Workstream D: Scripts typecheck (9 → ≤ 3).**
   - `backfillHscaElementalProperties` (2), `backfillMonicaPerConstruction` (2)
     and `checkNoStrayKalchmFormula` (2)
   - then `auditIngredients`, `generate-cuisine-images` and
     `generate-esms-baseline` (1 each)
6. **Open finding (needs a ruling, not a type fix).** The house-stellium bonus
   in `calculateEnhancedStelliumEffects` never applies (`"Fire"` vs `fire`
   keys). Enabling it changes scores.
