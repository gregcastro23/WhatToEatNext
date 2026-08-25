# Next Session: Comprehensive TypeScript Warning & Lint Debt Elimination Campaign (< 14,000 Target)

**Priority Directive:** Suspend new feature expansion (including Solana roadmap progression) in favor of deep TypeScript type safety, ESLint warning remediation, and lint debt reduction.
**Current Status:** Lint Debt Baseline at **15,367** (Validated Green on PR #801). All core test suites, typechecks, and build gates passing.
**Primary Target:** Sub-14,000 Tracked Lint Debt (-1,367+ Warnings Eliminated) with 0 regressions.

---

## 0. Codebase Health & Warning Breakdown

### A. Core Quality Gates (Must Remain 0 Errors / 0 Regressions)
- **TypeScript Typecheck (`bun run typecheck`):** Clean exit (`0 errors`).
- **Standard ESLint (`bun run lint`):** Clean exit (`0 errors`).
- **Lint Debt Audit (`bun run lint:debt`):** Must strictly not exceed baseline (`<= 15,367`).
- **Fast Test Suite (`bun run test:fast`):** Clean exit across all fast suites (`410/410 passed`).
- **Full Test Suite (`bun run test`):** 281 suites passing (`2,982+ passed`).
- **Cargo / Rust Workspace (`cargo test --workspace`):** 81/81 passed.
- **Route Size Gate (`bun run build`):** All 111 routes within size limits.

### B. Tracked Lint Debt Rule Breakdown (15,367 Total Tracked)
The codebase's tracked lint debt under `eslint.config.audit.mjs` and [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json):

| Rule | Current Count | Auto-Fixable | Remediation Strategy |
|---|---|---|---|
| `@typescript-eslint/no-unnecessary-condition` | **3,876** | No | Narrow types, remove defensive null/undefined checks on non-nullable values. |
| `@typescript-eslint/explicit-function-return-type` | **2,535** | No | Add explicit return type annotations to all exported and internal functions. |
| `@typescript-eslint/no-unsafe-member-access` | **2,149** | No | Replace implicit/explicit `any` properties with typed record interfaces / schemas. |
| `@typescript-eslint/no-unsafe-assignment` | **1,452** | No | Type function arguments, API responses, and database row mappings strongly. |
| `@typescript-eslint/explicit-module-boundary-types` | **1,127** | No | Provide explicit exported signatures for public module boundaries. |
| `@typescript-eslint/no-explicit-any` | **892** | No | Refactor generic `any` into exact domain types, `unknown` with type guards, or discriminated unions. |
| `no-console` | **744** | No | Replace bare `console.error` / `console.warn` / `console.log` with `_logger` from `@/lib/logger`. |
| `no-void` | **719** | No | Replace `void promise()` with explicit `void` statement handling or proper async `await`. |
| `@typescript-eslint/prefer-nullish-coalescing` | **700** | No | Replace `||` with `??` where boolean falsiness (`0`, `""`, `false`) is valid data. |
| `@typescript-eslint/no-unsafe-argument` | **482** | No | Provide typed arguments to helper functions. |
| `@typescript-eslint/no-unsafe-call` | **265** | No | Cast untyped callable objects via typed interfaces rather than `any`. |
| `@typescript-eslint/no-unsafe-return` | **175** | No | Ensure function return values match declared return types without `any` leaks. |
| `@typescript-eslint/require-await` | **163** | No | Remove `async` keyword from functions that perform no `await` operations. |
| `no-useless-assignment` | **88** | No | Remove redundant intermediate variable assignments. |

---

## 1. Top High-Lint-Debt Files Catalog

The following files contain the highest density of TypeScript warnings and yield the largest reductions:

| # | File Path | Warnings | Primary Violations |
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
| 16 | [`src/components/recipe/RecipeCard.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/RecipeCard.tsx) | **68** | `explicit-function-return-type`, `no-unsafe-member-access`, `no-unnecessary-condition` |
| 17 | [`src/services/CommensalService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/CommensalService.ts) | **65** | `no-unsafe-member-access`, `no-unnecessary-condition`, `no-unsafe-assignment` |
| 18 | [`src/utils/alchemicalEngine.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/alchemicalEngine.ts) | **64** | `no-unsafe-member-access`, `no-unsafe-assignment`, `explicit-function-return-type` |

---

## 2. Phased Refactoring Plan (< 14,000 Milestone)

### Phase 1: Admin Dashboard, Recipe Client & Generation Layers (~400 Warnings Eliminated)
1. **[`src/app/admin/_dashboard/panels.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/admin/_dashboard/panels.tsx) (117 warnings)**:
   - Define strict types for admin query rows, practitioner usage records, and server resource summaries.
   - Add explicit return types to all panel component renderers.
2. **[`src/components/recipe/CosmicRecipeGenerator.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/CosmicRecipeGenerator.tsx) (114 warnings)**:
   - Strongly type recipe generator prompt state machines and step validation.
   - Replace untyped object indexing with discriminated union states.
3. **[`src/app/recipes/[recipeId]/RecipeClient.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/recipes/[recipeId]/RecipeClient.tsx) (105 warnings)**:
   - Type active cooking steps, ingredient checkboxes, and nutrition display panels.
   - Clean up unnecessary conditions where recipe data is guaranteed non-nullable.
4. **[`src/components/recipe/RecipeCard.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/RecipeCard.tsx) (68 warnings)**:
   - Type recipe card badges, elemental affinities, and action handlers.

### Phase 2: Recommendation Engine & Interactive Components (~350 Warnings Eliminated)
1. **[`src/components/recommendations/EnhancedCookingMethodRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedCookingMethodRecommender.tsx) (76 warnings)**:
   - Type method scoring matrices and cooking modality cards.
2. **[`src/components/recommendations/EnhancedIngredientRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedIngredientRecommender.tsx) (75 warnings)**:
   - Annotate return signatures, type ingredient season/element pills, and resolve nullish coalescing.
3. **[`src/components/CookingMethods.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/CookingMethods.tsx) (70 warnings)**:
   - Strongly type method filter options and method list state.
4. **[`src/components/dashboard/CommensalManager.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/dashboard/CommensalManager.tsx) (76 warnings)**:
   - Type commensal table lobby actions, guest dietary restrictions, and socket event responses.
5. **[`src/utils/menuPlanner/recommendationBridge.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/menuPlanner/recommendationBridge.ts) (78 warnings)**:
   - Clean up recommendation bridge adapter interfaces between the planner read-model and recommendations engine.

### Phase 3: Planetary Ephemeris, Alchemical Engine & Core Services (~600 Warnings Eliminated)
1. **[`src/utils/serverPlanetaryCalculations.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/serverPlanetaryCalculations.ts) (99 warnings)**:
   - Provide exact interfaces for Swiss Ephemeris return types and planet position vectors.
2. **[`src/utils/ingredientRecommender.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/ingredientRecommender.ts) (98 warnings)**:
   - Remove redundant condition checks on canonical ingredients.
3. **[`src/services/UnifiedIngredientService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedIngredientService.ts) (94 warnings)**:
   - Remove unnecessary condition checks, annotate return types, and clean up async signatures.
4. **[`src/data/unified/flavorCompatibilityLayer.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/unified/flavorCompatibilityLayer.ts) (90 warnings)**:
   - Type flavor pairing lookup tables, pairing scores, and affinity matrices.
5. **[`src/hooks/useAstrology.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useAstrology.ts) (83 warnings)**:
   - Type astrological transit fetch hooks, aspect data maps, and cache readers.
6. **[`src/services/UnifiedRecommendationService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedRecommendationService.ts) (82 warnings)**:
   - Type scoring context conversions, remove `require-await`, and strongly type recommendation filters.
7. **[`src/services/LocalRecipeService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/LocalRecipeService.ts) (72 warnings)**:
   - Strongly type recipe search filters, difficulty mappings, and sorting algorithms.
8. **[`src/services/CommensalService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/CommensalService.ts) (65 warnings)** & **[`src/utils/alchemicalEngine.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/alchemicalEngine.ts) (64 warnings)**:
   - Clean up commensal state mutations and alchemical calculation vector operations.

---

## 3. Strict Development Rules & Quality Checklist

1. **Strict Type Safety — Zero Suppressions**:
   - **Never** add `// eslint-disable`, `// @ts-ignore`, or `// @ts-expect-error`.
   - **Never** cast to `any` (`as any`).
   - Define domain-accurate TypeScript interfaces or generic models.
2. **Logging Discipline (`no-console`)**:
   - Do **NOT** use `console.log`, `console.warn`, or `console.error` directly in `src/`.
   - Always import and use `_logger` from `@/lib/logger`:
     ```ts
     import { _logger } from "@/lib/logger";
     _logger.error("[Component] action failed:", err);
     ```
3. **No Oppositions in Elemental Logic**:
   - Elemental forces are **additive and self-reinforcing** (Fire + Water harmonize). Never use opposing destructive mechanics.
4. **Execution & Fast Validation Commands**:
   - **Fast Single-File Audit (~5s):**
     ```bash
     bun scripts/checkFileLint.ts <path/to/file.ts>
     ```
   - **Pre-commit Gate Verification:**
     ```bash
     bun run verify
     ```
   - **Ratchet Baseline After Each Phase:**
     ```bash
     NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
     ```
