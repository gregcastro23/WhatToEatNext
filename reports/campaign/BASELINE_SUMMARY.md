# ESLint Campaign Baseline Summary

**Date:** November 6, 2025
**Project:** WhatToEatNext
**Branch:** master

## Overall Metrics

- **Total Issues:** 14,919
  - **Errors:** 444
  - **Warnings:** 14,475
- **Auto-Fixable:** 1,824 issues (10 errors + 1,814 warnings)
- **Parsing Errors:** 65

## Campaign Targets

**Goal:** Reduce from 14,919 to <1,500 issues (90% reduction)

**Phase Targets:**
- Errors: 444 → <50 (89% reduction)
- Warnings: 14,475 → <1,450 (90% reduction)
- Parsing Errors: 65 → 0 (100% elimination)

## Top Error Categories

| Rank | Rule | Count | Type |
|------|------|-------|------|
| 1 | @typescript-eslint/no-unsafe-member-access | 3,183 | warning |
| 2 | @typescript-eslint/no-unsafe-assignment | 1,936 | warning |
| 3 | @typescript-eslint/no-unnecessary-condition | 1,896 | warning |
| 4 | @typescript-eslint/no-explicit-any | 1,327 | warning |
| 5 | @typescript-eslint/prefer-nullish-coalescing | 922 | warning |
| 6 | @typescript-eslint/no-unsafe-call | 860 | warning |
| 7 | @typescript-eslint/explicit-function-return-type | 562 | warning |
| 8 | @typescript-eslint/no-unsafe-argument | 449 | warning |
| 9 | @typescript-eslint/no-unused-vars | 315 | warning |
| 10 | @typescript-eslint/consistent-type-imports | 310 | warning |

**Total Top 10:** 11,760 issues (78.8% of all issues)

## Files with Most Issues

| Rank | File | Issues |
|------|------|--------|
| 1 | src/utils/ingredientRecommender.ts | 719 |
| 2 | src/services/UnifiedIngredientService.ts | 273 |
| 3 | src/utils/cookingMethodRecommender.ts | 267 |
| 4 | src/lib/monitoring/prometheus-metrics.ts | 267 |
| 5 | src/services/LocalRecipeService.ts | 245 |
| 6 | src/data/recipes.ts | 240 |
| 7 | src/utils/recommendation/methodRecommendation.ts | 230 |
| 8 | src/services/UnifiedRecommendationService.ts | 212 |
| 9 | src/utils/recipeMatching.ts | 200 |
| 10 | src/services/RecommendationAdapter.ts | 190 |

**Total Top 10 Files:** 2,843 issues (19.1% of all issues)

## Category Groupings

### Type Safety Issues (8,733 - 58.5%)
- no-unsafe-member-access: 3,183
- no-unsafe-assignment: 1,936
- no-unsafe-call: 860
- no-unsafe-argument: 449
- no-unsafe-return: 305
- no-explicit-any: 1,327
- consistent-type-imports: 310
- explicit-function-return-type: 562

### Code Quality Issues (2,818 - 18.9%)
- no-unnecessary-condition: 1,896
- prefer-nullish-coalescing: 922

### Unused Code (315 - 2.1%)
- no-unused-vars: 315

### Other Issues (3,053 - 20.5%)
- Various rules with <300 occurrences each

## Priority Attack Plan

### Quick Wins (Auto-Fixable)
1. Run `yarn lint:fix` → Fix 1,824 issues automatically
2. Expected reduction: 14,919 → ~13,095 (12.2% reduction)

### Phase 1: Type Safety (Target: 8,733 → <870)
Focus on unsafe operations and explicit-any
- Priority files: ingredientRecommender.ts, UnifiedIngredientService.ts, cookingMethodRecommender.ts
- Expected time: 2 weeks

### Phase 2: Code Quality (Target: 2,818 → <280)
Fix unnecessary conditions and nullish coalescing
- Expected time: 1 week

### Phase 3: Unused Code (Target: 315 → 0)
Remove or prefix unused variables
- Expected time: 3 days

### Phase 4: Parsing Errors (Target: 65 → 0)
Fix all parsing errors
- Expected time: 2 days

### Phase 5: Final Cleanup (Target: Remaining → <1,500)
Address remaining issues systematically
- Expected time: 1 week

## Success Metrics

Campaign succeeds when:
- [ ] Total issues < 1,500 (90% reduction)
- [ ] Errors < 50 (89% reduction)
- [ ] Parsing errors = 0 (100% elimination)
- [ ] Build time maintained or improved
- [ ] All tests passing
- [ ] Zero functionality regression

---

**Next Step:** Apply auto-fixes with `yarn lint:fix`
