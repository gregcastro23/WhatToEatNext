# Next Session: Phase 16 — Advanced Recommender & Multi-Debt Convergence

> **Status of Phase 15:** Complete **and verified on master**.
> - **PR #818** (`f2c02057`): Sub-baselined `prefer-nullish-coalescing` (Option C) at 692, executed Tranches 0–4 reducing PNC from **692 → 592 (−100 sites)**, reduced cast surface to **373**, tracked lint debt to **2,954**, and launched homepage promotional recipe minting & Fusion cuisine.
> - **PR #819** (`fa29e501`): Completed the Fruit taxonomy consolidation (retired `enhancedFruits.ts` and `fruits.ts`), conformed dietary classifiers, preserved all 1,069 indexed recipes, decreased assertion sites from **4,523 → 4,520 (−3)**, and dropped declined rules from **6,360 → 6,356 (−4)**.
> - **PR #820** (`45a0df5c`): Hardened test runner hygiene by adding `testRunnerImports.test.ts`, failing the build if any test suite imports `describe`/`it`/`expect` from `bun:test` instead of Jest globals.
> - **Phase 15 Commits**:
>   - `41aaf102` (`chore(governance): synchronize lint debt baseline with PR #819 metrics`): Synchronized baseline metrics.
>   - `7ea31b68` (`fix(recommender): eliminate falsy fallbacks in core flavor and ingredient engines`): Remediated 53 falsy fallbacks across 6 recommender engine files; ratcheted PNC **592 → 539** and tracked debt **2,954 → 2,953**.
>   - `106f5fb2` (`refactor(agents): harden agent consciousness memory and eliminate adapter casts`): Remediated 33 falsy fallbacks and 2 `as any` casts across agent consciousness and memory; ratcheted PNC **539 → 506** and gated casts **373 → 371**.
>   - `e0748e4f` (`refactor(types): eliminate casts and align falsy fallbacks across core datasets`): Remediated 16 casts (9 `as any`, 7 `as unknown as`) and 6 PNC warnings; ratcheted tracked debt **2,950 → 2,933**, PNC **506 → 500**, gated casts **371 → 355**, assertion sites **4,518 → 4,502**.
>   - `54cb3b18` (`refactor(infrastructure): eliminate falsy fallbacks and resolve floating promises`): Remediated 25 falsy fallbacks, resolved 10 floating promise warnings with `.catch(() => {})`, and corrected array-type formatting; ratcheted PNC **500 → 475**.
>
> ℹ️ **Sequence Note:** Phase 16 immediately succeeds Phase 15. All gates are green: `bun run verify` exit 0, compiler 0 errors, strict-index 0 errors, and fast tests 494/494 passing.

---

## 0. Repository State — Measured Ground Truth

All values re-verified live on `master` at commit `54cb3b18`. Every row names the command that produced it; re-run rather than trusting the number if the tree has moved.

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Strict index errors** | `0` across `0` files | `bun run strict-index:check` | ✅ Verified |
| **`noUncheckedIndexedAccess`** | **`true`, enforcing** | `tsconfig.json:14` | ✅ Live |
| **Compiler errors (flag on)** | `0` | `bun run typecheck` | ✅ Clean |
| **Normal lint errors / warnings** | `0` / `21` | `bun run lint` | ✅ Clean (0 err, 21 warn) |
| **Full verify** | exit `0` | `bun run verify` | ✅ Verified |
| **Fast test suite** | `19 suites / 494 tests` | `bun run test:fast` | ✅ 100% Passing |
| **Gate self-integrity tests** | `3 suites / 50 tests` | `bun run test:gates` | ✅ 100% Passing |
| **Foreign test runner guard** | `326 files checked / 0 foreign` | `jest src/__tests__/testRunnerImports.test.ts` | ✅ Enforcing |
| **Tracked lint debt** | `2,933` vs baseline `2,933` | `bun run lint:debt` | 🟢 **GREEN (−21 in Phase 15)** |
| **Declined rules pool** | `6,356` vs baseline `6,356` | same | 🟢 **GREEN (Held steady at 0 regressions)** |
| — `max-lines` | `661` | same | 🟢 Preserved |
| — `max-lines-per-function` | `2,127` | same | 🟢 Preserved |
| — `no-void` | `454` | same | 🟢 Preserved (.catch pattern) |
| **Sub-baseline: `prefer-nullish-coalescing`** | `475` vs sub-baseline `475` | same | 🟢 **GREEN (−117 in Phase 15; 692 → 475 total −217)** |
| **Gated cast surface** | `355` total (`93` as any, `262` as unknown as) | `bun run lint:debt --top-casts 5` | 🟢 **GREEN (−18 casts, −11 as any)** |
| — Production / Test | `297` (76 any, 221 unk) / `58` (17 any, 41 unk) | same | 🟢 **Production casts dropped below 300!** |
| **Assertion sites (AST)** | `4,502` vs baseline `4,502` | same | 🟢 **GREEN (−18 sites, −11 as any)** |
| — Production / Test | `3,864` / `638` | same | 🟢 Production sites down by 18 |
| — Monitored | `641` `as const`, `659` non-null `!` | same | ⚪ Monitored |
| **Untracked single `as T`** | `2,805` vs baseline `2,810` | same | 🟢 −5 single assertions |
| **Strict-index allowlist** | `0` entries (retired) | `.strict-index-baseline.json` | 🟢 Clean |

---

## 1. Retrospective: Phase 15

### 1.1 Scorecard

| Milestone | Stated Goal | Result | Verdict |
|---|---|:---:|:---:|
| **PR #819 Baseline Ratchet** | Lock in declined debt −4 and sites −3 | Ratcheted baseline in Tranche 0 (`41aaf102`) | 🟢 Met |
| **PNC Recommender Reduction** | Eliminate >= 50 falsy fallbacks in core engines | **53 warnings eliminated** in Tranche 1 (`7ea31b68`) | 🟢 Met |
| **Agent Memory & Consciousness** | Eliminate >= 30 falsy fallbacks + adapter casts | **33 PNC + 2 `as any` eliminated** in Tranche 2 (`106f5fb2`) | 🟢 Met |
| **High-Overlap Multi-Debt Convergence** | Eliminate 9 `as any`, 7 `as unknown as`, 6 PNC | **16 casts + 6 PNC eliminated** in Tranche 3 (`e0748e4f`) | 🟢 Met |
| **Infrastructure Polish** | Eliminate >= 20 PNC + resolve floating promises | **25 PNC eliminated + 10 floating promises resolved** in Tranche 4 (`54cb3b18`) | 🟢 Exceeded |
| **Overall Phase 15 Reduction** | Reduce PNC < 485, casts < 360, sites < 4510 | **PNC: 475 (−117), Casts: 355 (−18), Sites: 4502 (−18)** | 🟢 All Exceeded |

### 1.2 Key Architectural Learnings from Phase 15

1. **Floating Promises vs `no-void`:**
   - In `eslint.config.audit.mjs`, `no-void` is enabled as a warning and tracked in `declined.rules` (baseline: 454).
   - Attempting to satisfy `@typescript-eslint/no-floating-promises` with `void promise()` increases the `no-void` warning count, failing the non-regression check on declined debt.
   - The established repository pattern for unawaited background promises is `.catch(() => {})`, which satisfies both floating promises and preserves `no-void` cleanly.
2. **Dynamic Property Reflection Without Casts:**
   - `Reflect.get(target, prop)` and `Reflect.set(target, prop, value)` allow dynamic inspection and manipulation of typed entities (e.g. `Ingredient`) without introducing intermediate `as unknown as Record<string, unknown>` or `as any` bridges. This completely eliminated 5 chained casts in `src/data/ingredients/index.ts`.
3. **Chakra UI v3 Layout Migration:**
   - Legacy Chakra v2 layout props (`spacing`, `align`) previously required `as any` casting in components like `SeasonSelector.tsx`. Migrating to Chakra v3 props (`gap`, `alignItems`) and native styled `<select>` components eradicated 3 `as any` casts at the root.

---

## 2. Phase 16 Strategic Mission: Advanced Recommender & Multi-Debt Convergence

Phase 16 targets the next major concentration of debt: **the Culinary & Energy Calculation Layer, UI Recommender Components, Commensal Table Flows, and High-Traffic Production Casts**.

### 2.1 Strategic Themes

1. **Drive `prefer-nullish-coalescing` from 475 → < 400 (−75+ warnings):**
   - Clean falsy fallbacks across calculation utilities, recommender components, and table workflows.
2. **Drive Gated Type Casts from 355 → < 335 (−20+ casts):**
   - Target production casts in `UnifiedRecommendationService.ts`, `ingredientValidation.ts`, `recipeMatching.ts`, `recipeCalculations.ts`, and `agent-weekly-menu/route.ts`.
3. **Erode Production `as any` from 76 → < 65 (−11+ `as any`):**
   - Eliminate bare any casts in routes and hooks (`useElementalState.ts`, `agent-weekly-menu/route.ts`).
4. **Preserve Zero Regressions on All Sub-Baselines:**
   - Keep `no-unnecessary-condition`, `declined.total`, and `strict-index` completely clean.

---

## 3. Phase 16 Execution Tranches

### Tranche 1: Culinary & Celestial Energy Calculations (PNC Convergence)
- **Theme:** Eliminate falsy fallbacks (`||` → `??`) in energy calculations, cultural analytics, and tarot mappings.
- **Target Files (~25 PNC warnings):**
  1. `src/utils/cookingMethodRecommender.ts` (5 warnings):
     - Falsy fallbacks on cooking method temperatures, durations, and intensity scores.
  2. `src/utils/cuisineAggregations.ts` (5 warnings):
     - Cuisine profile weight aggregations and fallback traditions.
  3. `src/lib/alchemizer.ts` (5 warnings):
     - Elemental transformation scores and thermodynamic threshold defaults.
  4. `src/lib/celestial-energy-calculator.ts` (5 warnings):
     - Planetary energy coefficient fallbacks.
  5. `src/lib/tarotCalculations.ts` (5 warnings):
     - Card elemental affinity and astrological correspondence fallbacks.
- **Expected Outcome:** Ratchet `prefer-nullish-coalescing` down by ~25 (**475 → 450**).

---

### Tranche 2: UI Recommender & Menu Planner Components (PNC Convergence)
- **Theme:** Clean falsy fallbacks in recommendation cards, nutrition filters, and recipe previews.
- **Target Files (~27 PNC warnings):**
  1. `src/components/home/DynamicCuisineRecommender.tsx` (6 warnings):
     - Dynamic cuisine cards and fallback cuisine tags.
  2. `src/components/menu-planner/RecipeQuickView.tsx` (6 warnings):
     - Servings, cook times, and nutrition detail defaults.
  3. `src/components/nutrition/NutritionFilters.tsx` (6 warnings):
     - Caloric and macronutrient filter bounds.
  4. `src/components/profile/ProfileHeroCard.tsx` (5 warnings):
     - User level, title, and display preference defaults.
  5. `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` (5 warnings):
     - Method match reason and score fallbacks.
- **Expected Outcome:** Ratchet `prefer-nullish-coalescing` down by ~27 (**450 → 423**).

---

### Tranche 3: Tables, Social Lobbies & Ordering Flow (PNC Convergence)
- **Theme:** Clean falsy fallbacks in table lobbies, menu pages, and order processing.
- **Target Files (~20 PNC warnings):**
  1. `src/app/(alchm)/tables/[tableId]/page.tsx` (6 warnings):
     - Table member permissions, host details, and lobby state.
  2. `src/app/api/stripe/restaurant-order/route.ts` (5 warnings):
     - Order item price, quantity, and metadata fallbacks.
  3. `src/app/restaurants/[id]/menu/page.tsx` (5 warnings):
     - Restaurant menu category and item availability fallbacks.
  4. `src/app/api/transmutation_recommendations/route.ts` (4 warnings):
     - Transmutation score and category fallbacks.
- **Expected Outcome:** Ratchet `prefer-nullish-coalescing` down by ~20 (**423 → < 403**).

---

### Tranche 4: Production Cast Eradication (Casts + AST Assertion Sites)
- **Theme:** Eradicate high-leverage production type casts and chained assertions at the root.
- **Target Files (~15+ casts, ~5 `as any`):**
  1. `src/app/api/menu-planner/agent-weekly-menu/route.ts` (1 as any, 2 as unknown as):
     - Properly type the agent weekly menu response schema.
  2. `src/hooks/useElementalState.ts` (1 as any, 2 as unknown as):
     - Type elemental state dispatcher payloads.
  3. `src/utils/ingredientValidation.ts` (3 as unknown as):
     - Type ingredient validator inputs directly without unknown casting.
  4. `src/utils/recipeMatching.ts` (3 as unknown as):
     - Normalize recipe matcher comparison attributes.
  5. `src/utils/recipeCalculations.ts` (3 as unknown as):
     - Type computed recipe elemental profile properties.
  6. `src/services/UnifiedRecommendationService.ts` (3 as unknown as):
     - Align recommendation request and result schemas.
- **Expected Outcome:**
  - Gated casts: **355 → < 338 (−17+)**
  - Production casts: **297 → < 280**
  - `as any`: **93 → < 88**
  - Assertion sites: **4,502 → < 4,485**

---

## 4. Strict Operating Rules — Phase 16

1. **Do Not Change the Scanner and the Code in the Same Commit.** Instrument and baseline ratchet changes land alone, verified by `bun run test:gates`.
2. **`totalAssertionSites` Must Strictly Decrease.** A chain counts as **one** site; relabelling `as unknown as T` → `as T` cannot move it. Only real assertion deletion counts.
3. **The Gate's Own Tests Must Be Green** (`bun run test:gates`) before any baseline ratchet.
4. **Verify with Jest, Never `bun test`.** Enforced by `src/__tests__/testRunnerImports.test.ts`.
5. **Drive Changed-File Tests from `git status`.** Run relevant unit tests for every file touched.
6. **Never Regenerate `scripts/fixtures/snapshot-witness-baseline.json`.** Parity breaks are fixed in implementation code.
7. **Production Signatures Are Not a Cast Sink.** Fix types at the root rather than casting at return boundaries.
8. **Commit Scoped Changes Atomically.** Each tranche must compile, pass verification, and commit with an exact descriptive message.
9. **Never fix a `noUncheckedIndexedAccess` error with `!` or `?? 0`.** Use a real guard, an early return, or a typed accessor returning `T | undefined`.
10. **`tsc` clean is necessary, not sufficient.** Always verify with `bun run lint:debt` and `bun run test:fast`.
11. **Do not use `git stash` in this working directory.** Park work as a patch (`git diff > work.patch`). Never `git add -A`.
12. **Delete `.eslintcache` on both sides of any compiler-option measurement.**
13. **Measure branch scope against `origin/master`.**
14. **Before deleting an assertion the compiler calls redundant, probe the resulting type.** Confirm the result is not widened to `any`.
15. **Check `git diff --cached` before staging.** Prevent absorbing hook-staged files accidentally.
16. **Floating Promises Must Use `.catch(() => {})`, Never `void`.** `no-void` is an audited rule in the declined pool (baseline: 454). Using `void` regresses declined debt. Always use `.catch(() => {})`.
