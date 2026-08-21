# Next Session: Comprehensive Lint Debt Elimination Campaign (< 16,000 Target)

**Current Status:** Lint Debt Broken Below 17k to **16,688** (-1,235 Warnings Eliminated in Session). Full Runtimes, Typecheckers, and Test Suites Verified Green.  
**Lint Debt:** `16,688` (down from `17,923` / `18,250` / `18,361`) · **Standard Lint / Typecheck:** `0 errors, 0 warnings` · **Test Suites:** `10/10` fast (`408/408` tests) / `281/281` full passed (`2,982` passed, `10` skipped) · **Rust Workspace:** `81/81` passed · **Route Size Gate:** 100% passed (`111/111` routes within threshold) · **Ingredient Data Authenticity:** `0 non-real placeholders / 1,184 ingredients (100% authentic)`.

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

### B. Tracked Lint Debt Rule Distribution (`16,688` Total Tracked)
The codebase's tracked lint debt under `eslint.config.audit.mjs` was ratcheted down to **16,688** in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json):

| ESLint Rule | Current Count | Previous Baseline (`17,923`) | Delta (Session) | Core Remediation Pattern |
|---|---|---|---|---|
| `@typescript-eslint/no-unnecessary-condition` | **3,930** | 4,008 | **-78** | Remove redundant truthiness checks on non-nullable domain types |
| `@typescript-eslint/no-unsafe-member-access` | **2,700** | 3,212 | **-512** | Define typed DB rows, generic queries, and API payloads instead of `any` |
| `@typescript-eslint/explicit-function-return-type` | **2,607** | 2,612 | **-5** | Add explicit return types (`React.JSX.Element`, `void`, `Promise<T>`) |
| `@typescript-eslint/no-unsafe-assignment` | **1,716** | 1,939 | **-223** | Strongly type intermediate variables and helper function outputs |
| `@typescript-eslint/explicit-module-boundary-types` | **1,133** | 1,135 | **-2** | Annotate exported helper function parameters and returns |
| `@typescript-eslint/no-explicit-any` | **987** | 1,061 | **-74** | Replace `any` with domain interfaces or `unknown` + type guards |
| `no-void` | **760** | 764 | **-4** | Handle async promises explicitly or use named async wrapper |
| `@typescript-eslint/prefer-nullish-coalescing` | **760** | 874 | **-114** | Use `??` instead of `||` where false/0/empty strings are valid |
| `no-console` | **755** | 774 | **-19** | Replace naked `console.log/warn` with `_logger` / `clientLogger` |
| `@typescript-eslint/no-unsafe-argument` | **530** | 658 | **-128** | Ensure function call arguments match typed signatures |
| `@typescript-eslint/no-unsafe-call` | **367** | 412 | **-45** | Ensure invoked functions are typed as callable functions |
| `@typescript-eslint/no-unsafe-return` | **192** | 205 | **-13** | Explicitly type function return expressions |
| `@typescript-eslint/require-await` | **163** | 171 | **-8** | Remove `async` keyword from synchronous methods |
| `no-useless-assignment` | **88** | 93 | **-5** | Remove variable reassignments that are immediately overwritten |

---

## 1. Top 25 Highest-Lint-Debt Files Catalog

The following 25 files account for over **2,800 warnings** (~17% of total remaining debt). They represent the highest-yield targets for refactoring in the next run:

| # | File Path | Warning Count | Primary Rule Violations |
|---|---|---|---|
| 1 | [`src/components/profile/ProfileBlockRegistry.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/profile/ProfileBlockRegistry.tsx) | **200** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-explicit-any` |
| 2 | [`src/app/(alchm)/profile/[userId]/AgentProfile.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/[userId]/AgentProfile.tsx) | **189** | `no-unsafe-member-access`, `no-unnecessary-condition`, `no-unsafe-assignment` |
| 3 | [`src/lib/auth/auth.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/auth/auth.ts) | **150** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-void` |
| 4 | [`src/components/AlchemicalRecommendations.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/AlchemicalRecommendations.tsx) | **147** | `no-unsafe-member-access`, `no-unsafe-call`, `no-unsafe-assignment` |
| 5 | [`src/app/(alchm)/recipe-generator/page.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/recipe-generator/page.tsx) | **143** | `no-unsafe-member-access`, `no-explicit-any`, `no-unsafe-assignment` |
| 6 | [`src/app/(alchm)/profile/page.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/page.tsx) | **128** | `no-unsafe-assignment`, `no-unsafe-member-access`, `no-unnecessary-condition` |
| 7 | [`src/contexts/AlchemicalContext/provider.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/contexts/AlchemicalContext/provider.tsx) | **117** | `no-unsafe-assignment`, `no-unsafe-member-access`, `explicit-function-return-type` |
| 8 | [`src/app/admin/_dashboard/panels.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/admin/_dashboard/panels.tsx) | **117** | `no-unsafe-member-access`, `explicit-function-return-type`, `no-unsafe-assignment` |
| 9 | [`src/components/recipe/CosmicRecipeGenerator.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/CosmicRecipeGenerator.tsx) | **114** | `no-unnecessary-condition`, `no-unsafe-member-access`, `explicit-function-return-type` |
| 10 | [`src/middleware/auth-middleware.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/middleware/auth-middleware.ts) | **105** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-call` |
| 11 | [`src/app/recipes/[recipeId]/RecipeClient.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/recipes/[recipeId]/RecipeClient.tsx) | **105** | `no-unnecessary-condition`, `prefer-nullish-coalescing`, `no-explicit-any` |
| 12 | [`src/utils/serverPlanetaryCalculations.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/serverPlanetaryCalculations.ts) | **99** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-call` |
| 13 | [`src/utils/ingredientRecommender.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/ingredientRecommender.ts) | **98** | `no-unnecessary-condition`, `no-unsafe-call`, `no-unsafe-member-access` |
| 14 | [`src/services/UnifiedIngredientService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedIngredientService.ts) | **94** | `no-unnecessary-condition`, `prefer-nullish-coalescing`, `no-void` |
| 15 | [`src/data/unified/flavorCompatibilityLayer.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/unified/flavorCompatibilityLayer.ts) | **90** | `no-unsafe-member-access`, `prefer-nullish-coalescing`, `no-unsafe-assignment` |
| 16 | [`src/hooks/useAstrology.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useAstrology.ts) | **83** | `no-unsafe-member-access`, `prefer-nullish-coalescing`, `no-unsafe-assignment` |
| 17 | [`src/services/UnifiedRecommendationService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/UnifiedRecommendationService.ts) | **82** | `no-unnecessary-condition`, `require-await`, `no-unsafe-call` |
| 18 | [`src/app/api/user/profile/route.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/user/profile/route.ts) | **78** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-explicit-any` |
| 19 | [`src/utils/menuPlanner/recommendationBridge.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/menuPlanner/recommendationBridge.ts) | **78** | `no-unsafe-member-access`, `no-unnecessary-condition`, `no-explicit-any` |
| 20 | [`src/components/profile/AlchemicalDashboard.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/profile/AlchemicalDashboard.tsx) | **77** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-explicit-any` |
| 21 | [`src/components/recommendations/EnhancedCookingMethodRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedCookingMethodRecommender.tsx) | **76** | `no-unnecessary-condition`, `explicit-function-return-type`, `no-unsafe-member-access` |
| 22 | [`src/components/dashboard/CommensalManager.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/dashboard/CommensalManager.tsx) | **76** | `no-unsafe-member-access`, `explicit-function-return-type`, `no-unnecessary-condition` |
| 23 | [`src/components/recommendations/EnhancedIngredientRecommender.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recommendations/EnhancedIngredientRecommender.tsx) | **75** | `explicit-function-return-type`, `no-unnecessary-condition`, `no-unsafe-assignment` |
| 24 | [`src/services/LocalRecipeService.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/LocalRecipeService.ts) | **72** | `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-argument` |
| 25 | [`src/components/CookingMethods.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/CookingMethods.tsx) | **70** | `no-unnecessary-condition`, `explicit-function-return-type`, `no-unsafe-assignment` |

---

## 2. Targeted Execution Plan for Next Run (< 16,000 Milestone)

### Phase 1: Authentication, Middleware & Context Security Layer (~450 Warnings Elimination)
- **Target Files**:
  1. [`src/lib/auth/auth.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/auth/auth.ts) (150 warnings): Strongly type NextAuth session tokens, Google OAuth profile payloads, and database user row queries.
  2. [`src/middleware/auth-middleware.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/middleware/auth-middleware.ts) (105 warnings): Strongly type request headers, token verification callbacks, and session guards.
  3. [`src/contexts/AlchemicalContext/provider.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/contexts/AlchemicalContext/provider.tsx) (117 warnings): Strongly type context value states, reducer actions, and ephemeris listener triggers.
  4. [`src/app/api/user/profile/route.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/api/user/profile/route.ts) (78 warnings): Parameterize user profile request body schemas and typed response DTOs.

### Phase 2: Profile Block Architecture & Agent State Engine (~590 Warnings Elimination)
- **Target Files**:
  1. [`src/components/profile/ProfileBlockRegistry.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/profile/ProfileBlockRegistry.tsx) (200 warnings): Define explicit block component prop maps and registry return types.
  2. [`src/app/(alchm)/profile/[userId]/AgentProfile.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/[userId]/AgentProfile.tsx) (189 warnings): Strongly type agent stats, consciousness sigil rendering, and synastry overlays.
  3. [`src/app/(alchm)/profile/page.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/profile/page.tsx) (128 warnings): Strongly type user profile sub-panels and state tabs.
  4. [`src/components/profile/AlchemicalDashboard.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/profile/AlchemicalDashboard.tsx) (77 warnings): Type elemental resonance displays and chart summaries.

### Phase 3: Recipe Generator & Interactive Recommendation Components (~480 Warnings Elimination)
- **Target Files**:
  1. [`src/components/AlchemicalRecommendations.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/AlchemicalRecommendations.tsx) (147 warnings): Type alchemical recommendation cards and filter actions.
  2. [`src/app/(alchm)/recipe-generator/page.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/(alchm)/recipe-generator/page.tsx) (143 warnings): Strongly type cosmic recipe generation forms and parameter inputs.
  3. [`src/components/recipe/CosmicRecipeGenerator.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipe/CosmicRecipeGenerator.tsx) (114 warnings): Add explicit return types and typed recipe state machines.
  4. [`src/app/recipes/[recipeId]/RecipeClient.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/app/recipes/[recipeId]/RecipeClient.tsx) (105 warnings): Strongly type cooking action steps, timer states, and nutritional readouts.

### Phase 4: Recommendation Services & Ephemeris Utility Calculations (~450 Warnings Elimination)
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
4. **Iterative Verification Workflow**:
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
