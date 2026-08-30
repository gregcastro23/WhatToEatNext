# Next Session: Phase 8 TypeScript Lint Debt Remediation & Systematic Quality Campaign

**Starting Baseline:** **`4,497` tracked warnings, 0 lint errors, 0 compiler errors** (locked in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)).  
**Current Baseline:** **`4,137` tracked warnings** (net reduction of **360 tracked warnings** eliminated across Batches 0, A, B, C, D, E, F).  
**Target Milestone:** **$\le 3,750$** tracked warnings (a net reduction of $\ge 747$ warnings), prioritizing the remaining `any`-flow clusters in alchemical calculations, route handlers, recommender service pipelines, and shared contexts with zero deleted runtime guards.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Baseline at HEAD** | **`4,137`** | `bun run lint:debt` | Reconciles exactly across audited rules (Batches 0, A, B, C, D, E, F committed) |
| **Declined Rules Baseline** | **`6,430`** | `bun scripts/checkLintDebt.ts` | Synchronized; `no-void` declined to protect floating promises |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across entire workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit` clean |
| **Fast Test Suite** | `489/489` | `bun run test:fast` | 17/17 test suites passing (includes DB suites) |
| **Full Test Suite** | `3,297/3,297` | `bun run test --passWithNoTests` | 317/317 suites passing (10 skipped, exit 0) |
| **Calculation Witnesses** | `28/28` | `src/__tests__/calculations/unifiedEngineWitness.test.ts` | 100% celestial adapter & SMES parity |
| **Behavioral Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | 100% parity with baseline |
| **Monica Integrity** | Clean | `scripts/checkNoFabricatedMonicaFallback.ts` | 0 fabricated fallbacks |
| **Recent Phase 8 Commits** | 7 commits | `git log -n 7 --oneline` | Batch F (`52013de3`), Batch E (`fe01e191`), Batch D (`a3ab69e5`), Batch C (`a9894e90`), Batch B (`f91ec319`), Batch A (`a77cf178`), Batch 0 (`b0ba2949`) |

---

## 1. Phase 7 Assays & Keystone Safeguards Landed

1. **Governance Target $\le 4,500$ Achieved & Surpassed:**
   - Reduced baseline from `5,445` down to **`4,497`** across Batches 0 through E (net reduction of **948 tracked warnings**).
   - Maximum debt density per file dropped from 22 warnings down to $\le 21$ warnings across the whole repository.

2. **Promise Safety & Governance Alignment (`no-void` Declined):**
   - Declined `no-void` (457 warnings) in `.lint-debt-baseline.json`, resolving the conflict with `@typescript-eslint/no-floating-promises` and keeping promise discards intentionally explicit.

3. **Production Logger Asymmetry Rule Established:**
   - Enforced `_logger.error` / `createLogger` across all settlement, payment, auth, and critical sync routines to ensure telemetry is never silenced by production-gated warning loggers (`_logger.warn`).

4. **Honest Schema & Boundary Test Coverage:**
   - Created shared client schemas ([`clientSchemas.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/economy/clientSchemas.ts)) and added test suites ([`phase7BatchEBoundaries.test.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/__tests__/phase7BatchEBoundaries.test.ts) and [`phase7BatchEComponents.test.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/__tests__/phase7BatchEComponents.test.tsx)) ensuring zero runtime regressions.

---

## 2. Taxonomy of Remaining Debt (`4,497` Total)

| Population | Count | Share | Characteristics & Strategy |
|---|:---:|:---:|---|
| **1. `no-unnecessary-condition`** | **2,145** | 47.7% | ⚠️ **FROZEN UNLESS TYPE IS HONEST.** Fires when optimistic interfaces declare fields non-null that are optional at runtime. Clear `any`-flow first, then type honest boundary shapes; never delete runtime guards. |
| **2. `any`-Flow Cluster** | **1,098** | 24.4% | `no-unsafe-member-access` (431), `no-unsafe-assignment` (391), `no-unsafe-argument` (142), `no-unsafe-return` (84), `no-unsafe-call` (50). **Where lint fix = bug fix.** Remediate by strongly typing function parameters, return boundaries, and calculation adapters. |
| **3. Production Logging** | **482** | 10.7% | `no-console` (482). Route through `createLogger` or `_logger.error` (safe in production). |
| **4. Explicit `any` Leaks** | **371** | 8.2% | `no-explicit-any` (371). Replace with `unknown`, generics, or explicit domain interfaces (especially in database and auth types). |
| **5. Control Flow & Semantics** | **401** | 8.9% | `prefer-nullish-coalescing` (240), `require-await` (105), `no-useless-assignment` (56). Preserve `??` vs `||` domain semantics when `0` or `""` are valid. |
| **6. Annotation-Only (Declined)** | *(6,430)* | *(N/A)* | `explicit-function-return-type` (1,860), `explicit-module-boundary-types` (883), `max-lines-per-function` (2,119), `max-lines` (657), `no-void` (457), `complexity` (358), `max-depth` (99). |

---

## 3. Phase 8 Targeted Work Batches (Target $\le 3,750$)

### 📦 Batch A: Alchemical Calculations & Planetary Transforms (~110 Warnings)
Target calculation kernels and astronomical adapters:
1. `src/calculations/alchemicalTransformation.ts` (19 warnings: 7 unnecessary condition, 5 nullish coalescing, 5 unsafe member)
2. `src/calculations/alchemicalEngine.ts` (17 warnings: 6 explicit any, 4 unnecessary condition, 4 unsafe return)
3. `src/utils/streamlinedPlanetaryPositions.ts` (16 warnings: 6 unsafe assignment, 6 unsafe member, 3 explicit any)
4. `src/calculations/seasonalCalculations.ts` (16 warnings: 3 unnecessary condition, 3 unsafe member, 3 explicit any)
5. `src/calculations/elementalcalculations.ts` (16 warnings: 8 unsafe member, 2 unnecessary condition, 2 unsafe assignment)
6. `src/utils/safeAstrology.ts` (15 warnings: 9 explicit any, 3 unnecessary condition, 2 unsafe assignment)

### 📦 Batch B: API Endpoints & Route Deserializers (~105 Warnings)
Target remaining route handlers with untyped bodies or query params:
1. `src/app/api/commensal/companions/route.ts` (17 warnings: 6 explicit any, 4 console, 4 unnecessary condition)
2. `src/app/api/personalized-recommendations/route.ts` (17 warnings: 4 unsafe member, 4 unnecessary condition, 3 unsafe assignment)
3. `src/app/api/adept-table/route.ts` (15 warnings: 4 unsafe assignment, 4 unsafe member, 2 console)
4. `src/app/api/premium-table/route.ts` (15 warnings: 4 unsafe assignment, 4 unsafe member, 2 console)
5. `src/app/api/user/taste-graph/route.ts` (15 warnings: 9 unsafe member, 2 unnecessary condition, 2 console)
6. `src/app/api/notifications/generate-insight/route.ts` (15 warnings: 7 unsafe member, 3 explicit any, 2 nullish coalescing)
7. `src/app/api/stripe/restaurant-order/route.ts` (15 warnings: 5 nullish coalescing, 5 console, 5 unnecessary condition)

### 📦 Batch C: Service Layers & Recommender Pipelines (~105 Warnings)
Target service clients and saturation/quality monitors:
1. `src/services/recipeRecommendations.ts` (17 warnings: 6 unnecessary condition, 3 unsafe return, 2 require-await)
2. `src/services/poolerSaturationHealth.ts` (16 warnings: 7 unsafe member, 5 unsafe call, 3 unsafe assignment)
3. `src/services/subscriptionService.ts` (16 warnings: 7 console, 3 unnecessary condition, 2 unsafe return)
4. `src/services/AlchemicalApiClient.ts` (16 warnings: 7 explicit any, 4 unsafe return, 2 unsafe argument)
5. `src/services/sauceRecommender.ts` (16 warnings: 8 unsafe member, 3 unsafe call, 2 unsafe assignment)
6. `src/utils/buildQualityMonitor.ts` (17 warnings: 9 require-await, 3 unsafe assignment, 2 unsafe call)

### 📦 Batch D: Interactive UI Components, Contexts & Hook State (~100 Warnings)
Target recipe builder sub-components, custom hooks, and state providers:
1. `src/app/recipe-builder/page.tsx` (17 warnings: 5 unnecessary condition, 5 unsafe member, 3 nullish coalescing)
2. `src/components/recipes/LabBookIngest.tsx` (17 warnings: 8 unsafe member, 4 unnecessary condition, 3 unsafe argument)
3. `src/components/dashboard/DashboardOverview.tsx` (16 warnings: 9 unnecessary condition, 3 unsafe member, 1 explicit any)
4. `src/hooks/useIngredientRecommendations.ts` (16 warnings: 6 unnecessary condition, 3 explicit any, 2 unsafe member)
5. `src/contexts/AlchemicalDataContext.tsx` (15 warnings: 5 nullish coalescing, 4 explicit any, 4 unnecessary condition)
6. `src/contexts/menu-planner/useCostEstimation.ts` (14 warnings: 6 unsafe assignment, 6 unsafe member, 1 unnecessary condition)
7. `src/components/SunDisplay.tsx` (15 warnings: 4 unsafe call, 4 console, 3 unsafe assignment)

### 📦 Batch E: Database Types, Auth Config & Catalog Dictionaries (~100 Warnings)
Target foundational database interfaces, auth handlers, and catalog data:
1. `src/lib/database/types.ts` (16 warnings: 16 explicit any)
2. `src/lib/auth/validateRequest.ts` (17 warnings: 11 console, 2 explicit any, 1 unsafe assignment)
3. `src/lib/auth/auth.config.ts` (15 warnings: 4 unsafe assignment, 3 explicit any, 3 unsafe member)
4. `src/lib/cuisineCalculations.ts` (17 warnings: 7 unsafe member, 2 explicit any, 2 unsafe assignment)
5. `src/data/ingredients/seasonings/vinegars.ts` (16 warnings: 10 unsafe assignment, 2 unsafe member, 2 nullish coalescing)
6. `src/utils/astrology/validation.ts` (15 warnings: 11 unnecessary condition, 2 unsafe return, 2 explicit any)

---

## 4. Verification Protocol (Mandatory Before Every Ratchet)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Verification
bun run lint

# 3. Fast Unit Test Suite (17 suites, 489 tests)
bun run test:fast

# 4. Calculation & Behavioral Snapshot Witnesses
bun test src/__tests__/calculations/unifiedEngineWitness.test.ts
bun scripts/snapshot-witness.ts

# 5. Full Unit & Integration Test Suite (Mandatory per batch gate)
bun run test --passWithNoTests

# 6. Full Verification & Production Build
bun run verify:full

# 7. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 5. Standing Campaign Constraints

1. **Zero Suppressions:** 0 `eslint-disable` added, 0 `@ts-ignore` added, 0 artificial `as any` casts.
2. **Never Delete a Runtime Guard:** If `no-unnecessary-condition` fires, fix the type nullability honestly — do not delete defensive guards.
3. **Preserve `??` vs `||` Domain Semantics:** Never blindly replace `||` with `??` when `0` or `""` are valid domain values (e.g. scores, coordinates, counts).
4. **Production Logger Discipline:** `_logger.error` is ungated in production; `_logger.warn` is gated. Use `_logger.error` (or `createLogger`) on all critical services, payments, auth, and settlement paths.
5. **Run Full Test Suite Per Batch:** Run `bun run test` on every batch gate to protect all 317 test suites across all layers.
6. **Commit Per Batch:** Keep git commits granular, staging only touched files by name after verification passes.
