# Next Session: Comprehensive Lint Debt Elimination Campaign (< 14,500 Target)

**Current Status:** Lint Debt Broken Below 15.5k to **15,367** (-887 Warnings Eliminated in Session). Full Runtimes, Typecheckers, and Test Suites Verified Green.  
**Lint Debt:** `15,367` (down from `16,254` / `16,688` / `17,923` / `18,250` / `18,361`) · **Standard Lint / Typecheck:** `0 errors, 0 warnings` · **Test Suites:** `10/10` fast (`408/408` tests) / `281/281` full passed (`2,982` passed, `10` skipped) · **Rust Workspace:** `81/81` passed · **Route Size Gate:** 100% passed (`111/111` routes within threshold) · **Ingredient Data Authenticity:** `0 non-real placeholders / 1,184 ingredients (100% authentic)`.

---

## 0. Codebase Health & Warning Audit Report

A complete repository audit was conducted across all runtimes, typecheckers, test runners, build bundlers, and domain linters:

### A. Clean Passing Gates (0 Errors, 0 Warnings)
- **Ingredient Reality Audit (`bun run audit:ingredients`):** Clean exit — **0 of 1,184 ingredients carry placeholder/default values (100% authentic)**.
- **Ingredient Data Quality Audit (`bun run audit:ingredient-quality`):** Clean exit — **0 ingredient issues, 0 unmatched recipe ingredient names**.
- **Ingredient Coverage Index (`bun run build:ingredient-recipe-index`):** Clean exit — **828/1,030 canonical ingredients matched across 1,164 recipes (20,832 references)**.
- **Standard ESLint (`bun run lint`):** Clean exit (`0 errors, 0 warnings`).
- **TypeScript Typecheck (`bun run typecheck`):** Clean exit across Next.js typegen and TypeScript compiler (`0 errors, 0 warnings`).
- **Jest Fast Test Suite (`bun run test:fast`):** Clean exit across 10 test suites (`408/408 passed`).
- **Jest Full Test Suite (`bun run test`):** Clean exit across all 281 test suites (`2,982 passed, 10 skipped`).
- **Cargo / Rust Workspace (`cargo test --workspace`):** Clean exit across `alchm_culinary` (10/10), `thermo_core` unittests (31/31), `thermo_core` golden parity suite (33/33), and `thermo_wasm` (7/7) — total **81/81 passed**.
- **Route Size Budgets (`bun run build`):** All 111 routes passed strict size thresholds (e.g. `/` at 29.1 kB / 180 kB first-load, `/menu-planner` at 207 kB / 833 kB).

### B. Tracked Lint Debt Baseline (`15,367` Total Tracked)
The codebase's tracked lint debt under `eslint.config.audit.mjs` was ratcheted down to **15,367** in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json):

- **Recipe Generator Modularization**: Successfully dismantled the 1,583-line monolithic [`src/app/(alchm)/recipe-generator/page.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/recipe-generator/page.tsx) into 14 modular components and hooks with **0 warnings**.
- **Profile & Block Architecture**: Completely restructured [`src/app/(alchm)/profile/`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/) and [`src/components/profile/blocks/`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/profile/blocks/) with strict type safety, zero index-signature assignability conflicts, and 0 warnings.
- **Recommendations Engine**: Cleaned up styling and zodiac typing in [`src/components/AlchemicalRecommendations.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/AlchemicalRecommendations.tsx) with 0 warnings.

---

## 1. Top Remaining High-Lint-Debt Files Catalog

The following high-debt files represent the highest-yield targets for refactoring in the next run:

| # | File Path | Warning Count | Primary Rule Violations |
|---|---|---|---|
| 1 | [`src/app/admin/_dashboard/panels.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/admin/_dashboard/panels.tsx) | **117** | `no-unsafe-member-access`, `explicit-function-return-type`, `no-unsafe-assignment` |
| 2 | [`src/components/recipe/CosmicRecipeGenerator.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/CosmicRecipeGenerator.tsx) | **114** | `no-unnecessary-condition`, `no-unsafe-member-access`, `explicit-function-return-type` |
| 3 | [`src/app/recipes/[recipeId]/RecipeClient.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/recipes/[recipeId]/RecipeClient.tsx) | **105** | `no-unnecessary-condition`, `prefer-nullish-coalescing`, `no-explicit-any` |
| 4 | [`src/utils/serverPlanetaryCalculations.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/serverPlanetaryCalculations.ts) | **99** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-call` |
| 5 | [`src/utils/ingredientRecommender.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/ingredientRecommender.ts) | **98** | `no-unnecessary-condition`, `no-unsafe-call`, `no-unsafe-member-access` |
| 6 | [`src/services/UnifiedIngredientService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedIngredientService.ts) | **94** | `no-unnecessary-condition`, `prefer-nullish-coalescing`, `no-void` |
| 7 | [`src/data/unified/flavorCompatibilityLayer.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/unified/flavorCompatibilityLayer.ts) | **90** | `no-unsafe-member-access`, `prefer-nullish-coalescing`, `no-unsafe-assignment` |
| 8 | [`src/hooks/useAstrology.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useAstrology.ts) | **83** | `no-unsafe-member-access`, `prefer-nullish-coalescing`, `no-unsafe-assignment` |
| 9 | [`src/services/UnifiedRecommendationService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedRecommendationService.ts) | **82** | `no-unnecessary-condition`, `require-await`, `no-unsafe-call` |
| 10 | [`src/utils/menuPlanner/recommendationBridge.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/menuPlanner/recommendationBridge.ts) | **78** | `no-unsafe-member-access`, `no-unnecessary-condition`, `no-explicit-any` |
| 11 | [`src/components/recommendations/EnhancedCookingMethodRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedCookingMethodRecommender.tsx) | **76** | `no-unnecessary-condition`, `explicit-function-return-type`, `no-unsafe-member-access` |
| 12 | [`src/components/dashboard/CommensalManager.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/dashboard/CommensalManager.tsx) | **76** | `no-unsafe-member-access`, `explicit-function-return-type`, `no-unnecessary-condition` |
| 13 | [`src/components/recommendations/EnhancedIngredientRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedIngredientRecommender.tsx) | **75** | `explicit-function-return-type`, `no-unnecessary-condition`, `no-unsafe-assignment` |
| 14 | [`src/services/LocalRecipeService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/LocalRecipeService.ts) | **72** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-argument` |
| 15 | [`src/components/CookingMethods.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/CookingMethods.tsx) | **70** | `no-unnecessary-condition`, `explicit-function-return-type`, `no-unsafe-assignment` |

---

## 2. Targeted Execution Plan for Next Run (< 14,500 Milestone)

### Phase 1: Admin Dashboard & Recipe Viewer Client Layer (~350 Warnings Elimination)
- **Target Files**:
  1. [`src/app/admin/_dashboard/panels.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/admin/_dashboard/panels.tsx) (117 warnings): Strongly type admin metrics, resource usage tables, and practitioner query results.
  2. [`src/components/recipe/CosmicRecipeGenerator.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/CosmicRecipeGenerator.tsx) (114 warnings): Add explicit return types and typed recipe state machines.
  3. [`src/app/recipes/[recipeId]/RecipeClient.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/recipes/[recipeId]/RecipeClient.tsx) (105 warnings): Strongly type cooking action steps, timer states, and nutritional readouts.

### Phase 2: Recommendation & Cooking Method Components (~300 Warnings Elimination)
- **Target Files**:
  1. [`src/components/recommendations/EnhancedCookingMethodRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedCookingMethodRecommender.tsx) (76 warnings): Type method scoring vectors and modality selectors.
  2. [`src/components/recommendations/EnhancedIngredientRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedIngredientRecommender.tsx) (75 warnings): Annotate explicit return types and remove redundant null checks.
  3. [`src/components/CookingMethods.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/CookingMethods.tsx) (70 warnings): Type method cards and elemental balance tags.
  4. [`src/components/dashboard/CommensalManager.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/dashboard/CommensalManager.tsx) (76 warnings): Type commensal dining groups and shared dietary restrictions.

### Phase 3: Planetary Ephemeris & Service Computation Layer (~350 Warnings Elimination)
- **Target Files**:
  1. [`src/utils/serverPlanetaryCalculations.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/serverPlanetaryCalculations.ts) (99 warnings): Clean up astronomical calculations and planetary aspect types.
  2. [`src/utils/ingredientRecommender.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/ingredientRecommender.ts) (98 warnings): Remove redundant condition checks on canonical ingredients.
  3. [`src/services/UnifiedIngredientService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedIngredientService.ts) (94 warnings): Standardize async return signatures and remove unnecessary condition checks.
  4. [`src/data/unified/flavorCompatibilityLayer.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/unified/flavorCompatibilityLayer.ts) (90 warnings): Type flavor pairing lookup tables and matrices.
  5. [`src/services/UnifiedRecommendationService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedRecommendationService.ts) (82 warnings): Type scoring context conversions and remove `require-await` warnings.

---

## 3. Strict Architectural Rules & Methodology

1. **Bun Runtime Exclusivity**:
   - Always run commands using `bun` (`bun run dev|build|test|verify`). Never use `npm` or `yarn`.
2. **Type Safety Over Assertions & Disables**:
   - Never suppress warnings with `eslint-disable` or `// @ts-ignore`.
   - Never cast to `any` (`as any`).
   - Define exact, domain-accurate TypeScript interfaces or utilize generic types (`executeQuery<TRow>`, `ApiResponse<T>`, etc.).
3. **No Oppositions in Elemental Logic**:
   - Elemental forces are **additive and self-reinforcing** (e.g. Fire + Water harmonize rather than cancel out). Never introduce opposing destructive mechanics.
4. **Token Economy Architecture**:
   - The paywall/subscription premium concept is retired. All registered account holders participate in the ESMS Token Economy (Spirit 🝇, Essence 🝑, Matter 🝙, Substance 🝉).
5. **Iterative Verification Workflow**:
   - Check file-specific linting in ~10 seconds:
     ```bash
     bun scripts/checkFileLint.ts <file_path>
     ```
   - Verify standard typecheck, lint, and fast tests:
     ```bash
     bun run verify
     ```
   - Ratchet baseline to lock down new record low:
     ```bash
     NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
     ```
