# Next Session: Solana Mainnet Sync & Phase 2 Lint Debt Remediation

**Context & Status:** Phase 1 of the TypeScript Lint Debt Remediation Campaign is committed on `feat/wten-lint-debt-remediation-p1` (`eb386f0c`) and open as PR [#804](https://github.com/gregcastro23/WhatToEatNext/pull/804). Tracked lint debt has been reduced from **15,364** (post-PR #803 baseline) down to **13,942** (**−1,422 tracked warnings** across 21 files, with zero suppressions).

---

## 0. Current Repository State (August 2026)

- **Branch & PR:** `feat/wten-lint-debt-remediation-p1` (PR [#804](https://github.com/gregcastro23/WhatToEatNext/pull/804) open against `master`).
- **Lint Debt Baseline:** **13,942 tracked warnings, 0 lint errors** (recorded in `.lint-debt-baseline.json`).
- **Snapshot Witness Status:**
  - `serverPlanetary`, `ascendants`, `livePositions`, `skySnapshots`, `diurnals` (5 sections): **100% verified against pre-campaign baseline**.
  - `catalog` and `flavorCompatibility` (2 sections): Added/re-baselined during campaign; need pre-change baseline verification to guarantee non-circularity.
- **Unit Test Suite (Jest):** **3,191 passed, 0 failed, 10 skipped across 296 test suites** (`bun run test` from repo root).
- **Production Build:** Next.js build passes with 0 errors and all route bundles within budget (`bun run build`).

---

## 1. Phase 1 Accomplishments (21 Remediated Files · −1,422 Net Warnings)

| # | File Path | Tracked Warnings (After) | Dominant Focus |
|---|---|:---:|---|
| 1 | `src/app/admin/_dashboard/panels.tsx` | **0** | Typed dashboard panel data models; preserved `live: false` fallbacks. |
| 2 | `src/utils/serverPlanetaryCalculations.ts` | **0** | Astronomy module typing without altering numerical math. |
| 3 | `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` | **0** | Element effect types aligned with `@/types/alchemy`. |
| 4 | `src/components/recommendations/EnhancedIngredientRecommender.tsx` | **0** | Cleaned condition cascades and explicit return types. |
| 5 | `src/data/unified/flavorCompatibilityLayer.ts` | **0** | Typed `LegacyProfileObject` interface; converted fallbacks to `??`. |
| 6 | `src/services/UnifiedIngredientService.ts` | **0** | Removed synchronous `void` invocations; logical nullish assignment `??=`. |
| 7 | `src/services/UnifiedRecommendationService.ts` | **0** | Cleaned non-awaiting async methods and condition checks. |
| 8 | `src/utils/menuPlanner/recommendationBridge.ts` | **0** | Strongly typed `Recipe` to `MonicaOptimizedRecipe` adaptation. |
| 9 | `src/services/LocalRecipeService.ts` | **0** | Typed JSON parse boundaries and domain Recipe nutrition mappings. |
| 10 | `src/components/CookingMethods.tsx` | **0** | Defensively typed method descriptions and examples. |
| 11 | `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | **0** | Cleaned condition trees and array type definitions. |
| 12 | `src/utils/liveEphemeris.ts` | **0** | Astronomy module typed shims; ephemeris position mapping. |
| 13 | `src/data/recipes.ts` | **0** | Synchronous pure transform; restored defensive `Number(...) || 0` / `|| 1` guards. |
| 14 | `src/services/planetaryScoring.ts` | **0** | Cleaned import orders and transit scoring condition guards. |
| 15 | `src/utils/cuisine/sauceLineage.ts` | **0** | Typed sauce lineage hierarchy and culinary trees. |
| 16 | `src/app/(alchm)/philosophers-stone/page.tsx` | **0** | Structured agent forge creation state and logger error signatures. |
| 17 | `src/lib/agents/persona/build-agent-context.ts` | **0** | Typed agent DB rows and consciousness natal chart interfaces. |
| 18 | `src/utils/recommendation/methodRecommendation.ts` | **0** | Cleaned import ordering and recommendation condition cascades. |
| 19 | `src/actions/foodDiary.ts` | **0** | Strict null returns on server preset queries. |
| 20 | `src/app/api/recommendations/ingredients/route.ts` | **0** | Replaced local argmax with canonical elemental signature. |
| 21 | `src/utils/alchemicalPillarUtils.ts` | **0** | Fixed elemental string array types and recommendation signatures. |

### Key Technical Notes
- **Defensive Numeric Fallbacks in `recipes.ts`**: Restored `Number(flavorProfile.spicy) || 0` and `Number(ingredientData.amount) || 1` guards to prevent `Number(undefined) -> NaN` poisoning.
- **Data Reality**: `transformCuisineData()` in `recipes.ts` is fully typed but unexercised at runtime because static cuisine definitions currently define empty dish arrays (`Transformed 0 recipes`).

---

## 1b. Known Defects Behind a Zero (Clean of Lint, but Carry Product Bugs)

Do not assume 0 lint warnings means the logic is complete or functioning. The following known defect signals remain:

1. **`alchemicalPillarUtils.ts:543–603`**: Dead `itemWithProps.element` check gates up to +40 compatibility points on a field `AlchemicalItem` does not possess (the real field is `dominantElement`). Entire subtree is only called from `_getHolisticCookingRecommendations` (unused).
2. **`unifiedFlavorEngine.ts`**: `_flavorHarmony` is computed but omitted from the `overall` score weighting (base flavor notes have 0 effect on overall score).
3. **`initializeProfilesSync`**: Asynchronous despite its name; dispatches a promise without awaiting, meaning ingredient profiles never load during synchronous initialization.
4. **`getAllIngredients()` in `ingredientRecommendation.ts`**: Throws unconditionally on real data and has 0 importers.
5. **`IngredientFilterService.applyDietaryFilter`**: Reads a flat `isVegan` property and fails closed, contradicting `UnifiedIngredientService`.
6. **`getRecommendedCookingMethodsForIngredient`**: Dead function with zero callers across the codebase.

---

## 2. Next Session Directives & Options

### Track A: Resume Solana Mainnet Integration (K2/K3)
**Ratchet Reality Check:** Lowering the baseline from 15,364 to 13,942 **tightened the gate by 1,422 warnings**. The baseline is a hard ceiling (`checkLintDebt.ts`). Any new code added for K2/K3 (logging, boundary parsing, transaction types) must not increase total lint debt beyond 13,942:
1. **Merge PR #804**: Ensure all CI checks pass and merge `feat/wten-lint-debt-remediation-p1` into `master`.
2. **Resume Mainnet Roadmap (K2/K3)**:
   - Dual-rail payment integration and transaction settlement reconciliation (`src/services/solanaPaymentService.ts`).
   - Token-2022 minting verification and KMS governance operations.
   - Live storefront and cart integration with idempotency checks.
   - **Debt Budgeting**: Keep net new lint warnings at 0 for any new Solana service files by adding explicit types and using `_logger.error`.

### Track B: Phase 2 Lint Debt Remediation (Target: sub-13,000)
To achieve sub-13,000 from 13,942 requires eliminating **≥943 warnings**. The 9 primary component files below provide ~749 warnings; the remaining ~200+ warnings can be extracted from the mechanical explicit-return-type tier (~3,600 unannotated functions in `src/` with 0 behavioral risk):

| # | File Path | Tracked Warnings | Dominant Rules | Target Focus |
|---|---|---:|---|---|
| 1 | `src/components/recipe/CosmicRecipeGenerator.tsx` | 114 | unnecessary-condition (41) · unsafe-member (19) · no-console (5) | Type recipe generator state against `CosmicRecipe`. |
| 2 | `src/app/recipes/[recipeId]/RecipeClient.tsx` | 105 | unnecessary-condition (31) · nullish (25) · explicit-any (14) | Clean component state and map fallbacks; convert `||` to `??`. |
| 3 | `src/utils/ingredientRecommender.ts` | 98 | unnecessary-condition (52) · unsafe-call (18) · unsafe-member (18) | Type scoring functions and align parameter types. |
| 4 | `src/hooks/useAstrology.ts` | 83 | unsafe-member (22) · nullish (16) · unsafe-assign (16) | Strongly type planetary positions hook return values. |
| 5 | `src/components/dashboard/CommensalManager.tsx` | 76 | unsafe-member (18) · efrt (17) · no-void (9) | Type lobby state; clean `no-void`. |
| 6 | `src/components/home/DynamicCuisineRecommender.tsx` | 69 | unsafe-member (32) · unsafe-assign (15) · no-console (7) | Type cuisine recommender state and callbacks. |
| 7 | `src/components/CuisineRecommender.tsx` | 69 | unsafe-member (18) · cond (15) · unsafe-assign (9) | Type recommendation props and return types. |
| 8 | `src/services/feedDatabaseService.ts` | 68 | unsafe-member (30) · unsafe-assign (27) · unsafe-call (4) | Type database row mappings and feed events. |
| 9 | `src/calculations/index.ts` | 67 | explicit-any (19) · nullish (13) · unsafe-arg (8) | Replace `any` casts with domain types. |
| 10 | **Mechanical Tier (`explicit-function-return-type`)** | **~200+** | explicit-function-return-type | Annotate pure helper return types across `src/utils/` and `src/services/`. |

---

## 3. Trustworthy Verification Commands

*Note: Always run from the primary repository checkout root (`/Users/cookingwithcastro/Desktop/WhatToEatNext-master`).*

```bash
# 1. Typecheck and normal lint gate (0 errors required)
bun run typecheck && bun run lint

# 2. Fast conformance test suite
bun run test:fast

# 3. Full Jest unit test suite (3,191 tests)
bun run test

# 4. Individual file lint audit (active feedback loop)
bun scripts/checkFileLint.ts src/path/to/File.tsx

# 5. Behavioral regression check (100% parity gate)
bun scripts/snapshot-witness.ts

# 6. Production Next.js build & bundle check
bun run build

# 7. Global lint debt audit
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts

# 8. Ratchet baseline (only when total has decreased)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 4. Hard Rules

1. **Zero suppressions**: No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `as any`.
2. **Preserve data invariants**: Do not delete runtime validation checks simply because TypeScript types assert non-nullability over untyped/partial data.
3. **Assert on artifacts and numbers**: Never rely solely on exit codes; always verify printed totals and diffs.
4. **Commit the baseline**: Always commit `.lint-debt-baseline.json` alongside code changes when ratcheting.
5. **`||` → `??` is a behavioral change, not a lint fix**: They differ whenever LHS can be `0`, `""`, `false`, or `NaN`. Never convert on a numeric- or string-valued expression without proving the falsy-but-valid case impossible. `Number(x) ?? 0` is always wrong because `NaN` is not nullish.
6. **Check reachability before investing**: Driving dead code to zero warnings is wasted effort and hides bugs behind a green number. Confirm a file has live callers and live data before remediating; if it's dead, decide delete-vs-wire first.
7. **Never regenerate the witness fixture in the same change it polices**: Re-record against the pre-change tree to prevent circular verification.
