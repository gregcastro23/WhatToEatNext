# Next Session: Solana Mainnet Sync & Phase 2 Lint Debt Remediation

**Context & Status:** Phase 1 of the TypeScript Lint Debt Remediation Campaign was successfully completed. Tracked lint debt has been reduced from **15,364** down to **13,942** (**−1,422 tracked warnings** eliminated across 21 files, with zero suppressions and 100% snapshot witness parity).

This unlocks substantial headroom for the PR ratchet gate, enabling the team to either proceed with **Solana Mainnet Sync (K2/K3)** or continue driving lint debt down towards **sub-13,000**.

---

## 0. Current Repository State (August 2026)

- **Branch:** `feat/wten-lint-debt-remediation-p1`
- **Lint Debt Baseline:** **13,942 tracked warnings, 0 lint errors** (recorded in `.lint-debt-baseline.json`).
- **Snapshot Witness:** `scripts/snapshot-witness.ts` provides regression gating covering:
  - Offline server planetary kinematics (`astronomy-engine`).
  - Live sky ephemeris and sect calculation (`liveEphemeris`).
  - Multi-cuisine, planetary, and pairwise flavor compatibility (`flavorCompatibilityLayer`).
  - Rich static ingredient catalog distributions and property vectors (`UnifiedIngredientService`).
- **Unit Test Suite (Jest):** **3,191 passed, 0 failed, 10 skipped across 296 test suites** (`bun run test`).
- **Production Build:** Next.js build passes with 0 errors and all route bundles within budget (`bun run build`).

---

## 1. Phase 1 Accomplishments (21 Remediated Files · −1,416 Warnings)

| # | File Path | Warnings Before | Warnings After | Net Delta |
|---|---|---|---|---|
| 1 | `src/app/admin/_dashboard/panels.tsx` | 117 | **0** | -117 |
| 2 | `src/utils/serverPlanetaryCalculations.ts` | 99 | **0** | -99 |
| 3 | `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` | 98 | **0** | -98 |
| 4 | `src/components/recommendations/EnhancedIngredientRecommender.tsx` | 95 | **0** | -95 |
| 5 | `src/data/unified/flavorCompatibilityLayer.ts` | 91 | **0** | -91 |
| 6 | `src/services/UnifiedIngredientService.ts` | 87 | **0** | -87 |
| 7 | `src/services/UnifiedRecommendationService.ts` | 82 | **0** | -82 |
| 8 | `src/utils/menuPlanner/recommendationBridge.ts` | 78 | **0** | -78 |
| 9 | `src/services/LocalRecipeService.ts` | 72 | **0** | -72 |
| 10 | `src/components/CookingMethods.tsx` | 70 | **0** | -70 |
| 11 | `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | 69 | **0** | -69 |
| 12 | `src/utils/liveEphemeris.ts` | 69 | **0** | -69 |
| 13 | `src/data/recipes.ts` | 67 | **0** | -67 |
| 14 | `src/services/planetaryScoring.ts` | 62 | **0** | -62 |
| 15 | `src/utils/cuisine/sauceLineage.ts` | 62 | **0** | -62 |
| 16 | `src/app/(alchm)/philosophers-stone/page.tsx` | 62 | **0** | -62 |
| 17 | `src/lib/agents/persona/build-agent-context.ts` | 53 | **0** | -53 |
| 18 | `src/utils/recommendation/methodRecommendation.ts` | 52 | **0** | -52 |
| 19 | `src/actions/foodDiary.ts` | 35 | **0** | -35 |
| 20 | `src/app/api/recommendations/ingredients/route.ts` | 12 | **0** | -12 |
| 21 | `src/utils/alchemicalPillarUtils.ts` | 12 | **0** | -12 |

### Key Technical Notes & Findings
- **Defensive Numeric Fallbacks in `recipes.ts`**: Restored `Number(flavorProfile.spicy) || 0` and `Number(ingredientData.amount) || 1` guards to eliminate `NaN` poisoning when dish records are parsed.
- **Product Finding (`recipes.ts`)**: Static cuisine files currently define empty dish arrays for meal-type/season combinations (`Transformed 0 recipes`). The logic is completely type-safe and ready, but dish data will need catalog population in a future data pass.
- **`flavorCompatibilityLayer.ts`**: Defined `LegacyProfileObject` to replace loose `any` casts with strictly typed interfaces while preserving 100% backward compatibility.
- **`UnifiedIngredientService.ts`**: Simplified redundant synchronous `void` invocations and adopted logical nullish assignments (`??=`).

---

## 2. Next Session Directives & Options

### Track A: Resume Solana Mainnet Integration (Recommended)
Now that the lint ratchet provides over 1,400 warnings of buffer, PRs will no longer be blocked by incidental logging or boundary lint warnings:
1. **Commit and Merge Phase 1**: Merge `feat/wten-lint-debt-remediation-p1` into `master`.
2. **Resume Mainnet Roadmap (K2/K3 Milestone)**:
   - Dual-rail checkout and transaction settlement reconciliation (`src/services/solanaPaymentService.ts`).
   - Token-2022 minting verification and KMS governance operations.
   - Live storefront and cart integration with instant idempotency checks.

### Track B: Phase 2 Lint Debt Reduction (Target: sub-13,000)
If continuing the lint debt reduction campaign, the next highest-density target files are:

| # | File Path | Tracked Warnings | Dominant Rules | Target Focus |
|---|---|---:|---|---|
| 1 | `src/components/recipe/CosmicRecipeGenerator.tsx` | 114 | unnecessary-condition (41) · unsafe-member (19) · no-console (5) | Type recipe generator state against `CosmicRecipe`; clean condition fallbacks. |
| 2 | `src/app/recipes/[recipeId]/RecipeClient.tsx` | 105 | unnecessary-condition (31) · nullish (25) · explicit-any (14) | Clean component state and map fallbacks; convert `||` to `??`. |
| 3 | `src/utils/ingredientRecommender.ts` | 98 | unnecessary-condition (52) · unsafe-call (18) · unsafe-member (18) | Type scoring functions and align parameter types. |
| 4 | `src/hooks/useAstrology.ts` | 83 | unsafe-member (22) · nullish (16) · unsafe-assign (16) | Strongly type planetary positions hook return values and cache. |
| 5 | `src/components/dashboard/CommensalManager.tsx` | 76 | unsafe-member (18) · efrt (17) · no-void (9) | Type lobby state; annotate return types; clean `no-void`. |
| 6 | `src/components/home/DynamicCuisineRecommender.tsx` | 69 | unsafe-member (32) · unsafe-assign (15) · no-console (7) | Type cuisine recommender state and callbacks. |
| 7 | `src/components/CuisineRecommender.tsx` | 69 | unsafe-member (18) · cond (15) · unsafe-assign (9) | Type recommendation props and return types. |
| 8 | `src/services/feedDatabaseService.ts` | 68 | unsafe-member (30) · unsafe-assign (27) · unsafe-call (4) | Type database row mappings and feed events. |
| 9 | `src/calculations/index.ts` | 67 | explicit-any (19) · nullish (13) · unsafe-arg (8) | Replace `any` casts with domain types. |

---

## 3. Trustworthy Verification Commands

```bash
# 1. Individual file lint audit
bun scripts/checkFileLint.ts src/path/to/File.tsx

# 2. Behavioral regression check (100% parity gate)
bun scripts/snapshot-witness.ts

# 3. Full unit test suite (Jest)
bun run test

# 4. Production Next.js build & bundle check
bun run build

# 5. Global lint debt audit
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts

# 6. Ratchet baseline (only when total has decreased)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 4. Hard Rules
1. **Zero suppressions**: No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `as any`.
2. **Preserve data invariants**: Do not delete runtime validation checks simply because TypeScript types assert non-nullability over untyped data.
3. **Assert on artifacts and numbers**: Never rely solely on exit codes; always verify printed totals and diffs.
4. **Commit the baseline**: Always commit `.lint-debt-baseline.json` alongside code changes when ratcheting.
