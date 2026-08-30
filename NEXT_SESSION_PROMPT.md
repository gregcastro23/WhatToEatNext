# Next Session: Phase 9 TypeScript Lint Debt Remediation & Systematic Quality Campaign

**Starting Baseline:** **`4,110` tracked warnings, 0 lint errors, 0 compiler errors** (locked in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)).  
**Target Milestone:** **$\le 3,750$** tracked warnings (a net reduction of $\ge 360$ warnings), prioritizing the remaining `any`-flow clusters in alchemical calculations, route handlers, recommender service pipelines, and shared contexts with zero deleted runtime guards.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Baseline at HEAD** | **`4,110`** | `bun run lint:debt` | Reconciles exactly across audited rules (Batches 0–F + auth typing committed) |
| **Declined Rules Baseline** | **`6,430`** | `bun scripts/checkLintDebt.ts` | Synchronized; `no-void` declined to protect floating promises |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across entire workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit` clean |
| **Fast Test Suite** | `489/489` | `bun run test:fast` | 17/17 test suites passing (includes DB suites) |
| **Full Test Suite** | `3,297/3,297` | `bun run test --passWithNoTests` | 317/317 suites passing (10 skipped, exit 0) |
| **Calculation Witnesses** | `28/28` | `bun run jest src/__tests__/calculations/unifiedEngineWitness.test.ts` | 100% celestial adapter & SMES parity |
| **Behavioral Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | 100% parity with baseline |
| **Monica Integrity** | Clean | `scripts/checkNoFabricatedMonicaFallback.ts` | 0 fabricated fallbacks |
| **Recent Phase 8 Commits** | 8 commits | `git log -n 8 --oneline` | Auth typing (`f9e734ff`), Batch F (`52013de3`), Batch E (`fe01e191`), Batch D (`a3ab69e5`), Batch C (`a9894e90`), Batch B (`f91ec319`), Batch A (`a77cf178`), Batch 0 (`b0ba2949`) |

---

## 1. Phase 8 Progress & Keystone Safeguards Landed

1. **Governance Target Progress (`4,497` $\rightarrow$ `4,110`):**
   - Reduced baseline from `4,497` down to **`4,110`** across Batches 0 through F plus honest NextAuth typing (net reduction of **387 tracked warnings** eliminated across 35+ files with zero regressions).
   - Maximum debt density per file dropped from 22 warnings down to $\le 21$ warnings across the repository.

2. **Honest NextAuth Type Augmentation & Guard Restoration:**
   - Augmented `Session.user?:` with nullable fields (`name`, `email`, `image: string | null`), restoring four defensive `session?.user?.id` guards (including checkout at `stripe/restaurant-order:461`).
   - Cleaned redundant `as Record<string, unknown>` type assertions across 10 components and route files.

3. **Production Logger Asymmetry Rule Maintained:**
   - Enforced `_logger.error` on all critical services, payments, auth, and ordering stubs (`oloService.ts:13`).

---

## 2. Taxonomy of Remaining Debt (`4,110` Total)

| Population | Count | Share | Characteristics & Strategy |
|---|:---:|:---:|---|
| **1. `no-unnecessary-condition`** | **2,018** | 49.1% | ⚠️ **FROZEN UNLESS TYPE IS HONEST.** Fires when optimistic interfaces declare fields non-null that are optional at runtime. Clear `any`-flow first, then type honest boundary shapes; never delete runtime guards. |
| **2. `any`-Flow Cluster** | **957** | 23.3% | `no-unsafe-member-access` (368), `no-unsafe-assignment` (354), `no-unsafe-argument` (123), `no-unsafe-return` (68), `no-unsafe-call` (44). **Where lint fix = bug fix.** Remediate by strongly typing function parameters, return boundaries, and calculation adapters. |
| **3. Production Logging** | **428** | 10.4% | `no-console` (428). Route through `createLogger` or `_logger.error` (safe in production). |
| **4. Explicit `any` Leaks** | **304** | 7.4% | `no-explicit-any` (304). Replace with `unknown`, generics, or explicit domain interfaces. |
| **5. Control Flow & Semantics** | **405** | 9.8% | `prefer-nullish-coalescing` (246), `require-await` (104), `no-useless-assignment` (55). Preserve `??` vs `||` domain semantics when `0` or `""` are valid. |
| **6. Annotation-Only (Declined)** | *(6,430)* | *(N/A)* | `explicit-function-return-type` (1,819), `explicit-module-boundary-types` (865), `max-lines-per-function` (2,121), `max-lines` (660), `no-void` (457), `complexity` (356), `max-depth` (99). |

---

## 3. Targeted Work Batches (Target $\le 3,750$, ~360 Warnings to Eliminate)

### 📦 Batch A: Recommender Adapters & Search Validation (~120 Warnings)
Target remaining recommender bridges and search validation modules:
1. `src/components/home/CookingMethodPreview.tsx` (21 warnings: 20 unnecessary condition, 1 console)
2. `src/services/RecommendationAdapter.ts` (21 warnings: 21 unnecessary condition)
3. `src/utils/ingredientValidation.ts` (20 warnings: 11 require-await, 9 unnecessary condition)
4. `src/components/food-diary/NutritionDashboard.tsx` (19 warnings: 19 unnecessary condition)
5. `src/services/restaurantDiscoveryService.ts` (19 warnings: 15 unnecessary condition, 3 nullish coalescing, 1 console)
6. `src/services/ChartComparisonService.ts` (19 warnings: 18 unnecessary condition, 1 explicit any)

### 📦 Batch B: Timeline, Quality & Elemental Services (~100 Warnings)
Target timeline feeds, recipe-builder subpages, and elemental transformations:
1. `src/services/userTimelineService.ts` (18 warnings: 18 unnecessary condition)
2. `src/app/recipe-builder/page.tsx` (17 warnings: 5 unnecessary condition, 5 unsafe member, 3 nullish coalescing)
3. `src/utils/buildQualityMonitor.ts` (17 warnings: 9 require-await, 3 unsafe assignment, 2 unsafe call)
4. `src/utils/elemental/core.ts` (17 warnings: 9 unnecessary condition, 3 require-await, 2 unsafe member)
5. `src/components/recipes/LabBookIngest.tsx` (17 warnings: 8 unsafe member, 4 unnecessary condition, 3 unsafe argument)
6. `src/lib/cuisineCalculations.ts` (17 warnings: 7 unsafe member, 2 explicit any, 2 unsafe assignment)
7. `src/services/QualityMetricsService.ts` (17 warnings: 17 unnecessary condition)

### 📦 Batch C: Search Engines, Hooks & Dashboards (~95 Warnings)
Target search engines, custom hooks, and dashboard overviews:
1. `src/utils/recipeSearchEngine.ts` (16 warnings: 16 unnecessary condition)
2. `src/components/dashboard/DashboardOverview.tsx` (16 warnings: 9 unnecessary condition, 3 unsafe member, 1 explicit any)
3. `src/hooks/useCookingMethods.ts` (16 warnings: 16 prefer-nullish-coalescing)
4. `src/hooks/useAlchemicalRecommendations.ts` (16 warnings: 16 unnecessary condition)
5. `src/hooks/useIngredientRecommendations.ts` (16 warnings: 6 unnecessary condition, 3 explicit any, 2 unsafe member)
6. `src/lib/mcp/synastryTools.ts` (16 warnings: 16 unnecessary condition)

### 📦 Batch D: Ingredients, Pooler Saturation & Core State (~95 Warnings)
Target static ingredient datasets, pooler health monitor, and data contexts:
1. `src/data/ingredients/seasonings/vinegars.ts` (16 warnings: 10 unsafe assignment, 2 unsafe member, 2 nullish coalescing)
2. `src/services/poolerSaturationHealth.ts` (16 warnings: 7 unsafe member, 5 unsafe call, 3 unsafe assignment)
3. `src/services/ConsolidatedIngredientService.ts` (16 warnings: 10 unnecessary condition, 6 require-await)
4. `src/services/AlchemicalApiClient.ts` (16 warnings: 7 explicit any, 4 unsafe return, 2 unsafe argument)
5. `src/services/RealAlchemizeService.ts` (16 warnings: 16 unnecessary condition)
6. `src/contexts/AlchemicalDataContext.tsx` (15 warnings: 5 nullish coalescing, 4 explicit any, 4 unnecessary condition)

---

## 4. Verification Protocol (Mandatory Before Every Ratchet)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Verification
bun run lint

# 3. Fast Unit Test Suite (17 suites, 489 tests)
bun run test:fast

# 4. Calculation & Behavioral Snapshot Witnesses (Always use Jest)
bun run jest src/__tests__/calculations/unifiedEngineWitness.test.ts
bun scripts/snapshot-witness.ts

# 5. Full Unit & Integration Test Suite (Mandatory per batch gate)
bun run test --passWithNoTests

# 6. Production Next.js Build
bun run build

# 7. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 5. Standing Campaign Constraints

1. **Zero Suppressions:** 0 `eslint-disable` added, 0 `@ts-ignore` added, 0 artificial `as any` casts.
2. **Never Delete a Runtime Guard:** If `no-unnecessary-condition` fires, fix the type nullability honestly — do not delete defensive guards.
3. **Preserve `??` vs `||` Domain Semantics:** Never blindly replace `||` with `??` when `0` or `""` are valid domain values (e.g. scores, coordinates, counts).
4. **Production Logger Discipline:** `_logger.error` is ungated in production; `_logger.warn` is gated. Use `_logger.error` (or `createLogger`) on all critical services, payments, auth, and settlement paths.
5. **Always Use Jest Test Runner:** Never run Bun's native test runner (`bun test`) as it bypasses `jest.config.js` and custom setup. Always use `bun run test` or `bun run jest`.
6. **Commit Per Batch:** Keep git commits granular, staging only touched files by name after verification passes.
