# Next Session: Phase 10 TypeScript Quality Campaign — Cast Surface Remediation & Type Safety

**Starting Baseline at HEAD:**  
- **Tracked Warnings:** **`3,715`** (0 lint errors, 0 compiler errors)
- **Declined Rules Pool:** **`6,327`** (Frozen, gated against increase)
- **Total Lint Surface:** **`10,042`**
- **Type Cast Surface:** **`868`** (187 `as any`, 681 `as unknown as` — Gated against total and `asAny` increase)  
- **Locked Baseline File:** [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)

**Target Milestone:**  
- **Primary Goal (Cast Surface):** **$\le 750$** total type casts (a net reduction of $\ge 118$ casts), prioritizing high-concentration engines, recommender adapters, and data registries.
- **Secondary Goal (Tracked Debt):** **$\le 3,500$** tracked warnings (a net reduction of $\ge 215$ warnings) as a natural consequence of typing the core recommendation and cuisine pipelines.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Tracked Baseline at HEAD** | **`3,715`** | `bun run lint:debt` | Reconciles exactly across audited rules (Batches 0–D committed at `b5ab18c0`) |
| **Declined Rules Baseline** | **`6,327`** | `bun scripts/checkLintDebt.ts` | Frozen; 7 declined rules totaling 6,327 |
| **Cast Surface Baseline** | **`868`** | `bun scripts/checkLintDebt.ts` | 187 `as any` + 681 `as unknown as` (locked in baseline) |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit --incremental false` clean |
| **Fast Test Suite** | `19/19 suites (494/494)` | `bun run test:fast` | 100% passing (includes alchemical defaultState integrity & smoke test) |
| **Full Test Suite** | `319/319 suites (3,309 passed, 10 skipped, 3,319 total)` | `bun run test --passWithNoTests` | 100% passing (exit 0) |
| **Behavioral Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | 100% parity with baseline |
| **Monica Integrity** | Clean | `bun scripts/checkNoFabricatedMonicaFallback.ts` | 0 unprincipled agent fallbacks |
| **Production Deployment** | Verified | Vercel (`b5ab18c0`) | Seeded guest test confirmed live recommender mounting & scoring |

---

## 1. Governance & Tooling Status (Landed in PR #813)

1. **Cast Surface Gating Active:**
   - `scripts/lib/lintDebt.ts` scans `src/` for `as any` and `as unknown as`.
   - `scripts/checkLintDebt.ts` fails CI if total casts exceed baseline **or** if `as any` specifically increases (preventing type laundering).
2. **Declined Pool Frozen:**
   - Tooling fails CI if the 6,327 declined warnings pool increases.
3. **Per-Rule Non-Regression Active:**
   - Tooling fails CI if *any* individual tracked rule increases, guaranteeing mechanical non-regression.
4. **Dedicated Cast Ranking Flag:**
   - Run `bun scripts/checkLintDebt.ts --casts` or `--top-casts 25` to inspect the top cast density files.

---

## 2. High-Concentration Cast Surface (868 Total Casts)

*Generated from `bun scripts/checkLintDebt.ts --top-casts 25`:*

| File Path | Total Casts | `as any` | `as unknown as` | Notes |
|---|:---:|:---:|:---:|---|
| `src/utils/ingredientRecommender.ts` | **48** | 0 | 48 | Core ingredient recommender matrix |
| `src/utils/cookingMethodRecommender.ts` | **31** | 0 | 31 | Method scoring & thermodynamics |
| `src/data/unified/seasonal.ts` | **28** | 1 | 27 | Seasonal ingredients registry |
| `src/data/ingredients/spices/index.ts` | **22** | 0 | 22 | Spice catalog alchemical mappings |
| `src/data/unified/recipeBuilding.ts` | **21** | 0 | 21 | Recipe synthesis pipeline |
| `src/services/IngredientFilterService.ts` | **21** | 0 | 21 | Category & planetary filtering |
| `src/utils/recommendation/methodRecommendation.ts` | **17** | 0 | 17 | Method recommendation bridge |
| `src/data/cuisines/index.ts` | **16** | 0 | 16 | Cuisine registry & traditions |
| `src/data/unified/cuisineIntegrations.ts` | **14** | 0 | 14 | Cross-cuisine elemental integration |
| `src/utils/recommendation/ingredientRecommendation.ts` | **13** | 0 | 13 | Legacy recommendation adapter |
| `src/services/RecommendationAdapter.ts` | **12** | 0 | 12 | Recommendation service adapter |
| `src/data/unified/enhancedIngredients.ts` | **11** | 0 | 11 | Enhanced ingredient properties |
| `src/data/unified/cuisines.ts` | **10** | 0 | 10 | Unified cuisine definitions |
| `src/contexts/AlchemicalDataContext.tsx` | **8** | 0 | 8 | Alchemical data provider state |
| `src/utils/dynamicImport.ts` | **8** | 0 | 8 | Dynamic module loader |
| `src/utils/seasonalCalculations.ts` | **8** | 0 | 8 | Seasonal calculation helpers |
| `src/utils/elemental/transformations.ts` | **8** | 0 | 8 | Elemental state transformers (14 tracked) |
| `src/utils/ingredientNutritionAggregation.ts` | **7** | 0 | 7 | Nutrition rollup service |
| `src/services/UnifiedIngredientService.ts` | **7** | 0 | 7 | Unified ingredient catalog service |
| `src/calculations/culinaryAstrology.ts` | **6** | 0 | 6 | Astrological calculation engine (14 tracked) |

---

## 3. Targeted Work Batches for Phase 10

### 📦 Batch A: Core Recommendation Engines & Seasonality (~107 Casts)
Target the highest-density cast clusters in the recommendation core:
1. `src/utils/ingredientRecommender.ts` (48 casts: 48 as unknown as)
2. `src/utils/cookingMethodRecommender.ts` (31 casts: 31 as unknown as)
3. `src/data/unified/seasonal.ts` (28 casts: 1 as any, 27 as unknown as)

### 📦 Batch B: Spice Catalogs, Recipe Synthesis & Filter Services (~81 Casts)
Target ingredient registries and recipe builders:
1. `src/data/ingredients/spices/index.ts` (22 casts: 22 as unknown as)
2. `src/data/unified/recipeBuilding.ts` (21 casts: 21 as unknown as)
3. `src/services/IngredientFilterService.ts` (21 casts: 21 as unknown as)
4. `src/utils/recommendation/methodRecommendation.ts` (17 casts: 17 as unknown as)

### 📦 Batch C: Cuisines, Integrations & Adapters (~65 Casts)
Target cuisine databases and recommendation adapters:
1. `src/data/cuisines/index.ts` (16 casts: 16 as unknown as)
2. `src/data/unified/cuisineIntegrations.ts` (14 casts: 14 as unknown as)
3. `src/utils/recommendation/ingredientRecommendation.ts` (13 casts: 13 as unknown as)
4. `src/services/RecommendationAdapter.ts` (12 casts: 12 as unknown as)
5. `src/data/unified/cuisines.ts` (10 casts: 10 as unknown as)

### 📦 Batch D: Utilities, State Contexts & Elemental Transformers (~40 Casts + Tracked Debt)
Target dynamic loaders, alchemical contexts, and high-debt calculation files:
1. `src/contexts/AlchemicalDataContext.tsx` (8 casts: 8 as unknown as)
2. `src/utils/dynamicImport.ts` (8 casts: 8 as unknown as)
3. `src/utils/seasonalCalculations.ts` (8 casts: 8 as unknown as)
4. `src/utils/elemental/transformations.ts` (8 casts: 8 as unknown as, 14 tracked warnings)
5. `src/services/UnifiedIngredientService.ts` (7 casts: 7 as unknown as)
6. `src/calculations/culinaryAstrology.ts` (6 casts: 6 as unknown as, 14 tracked warnings)

---

## 4. Verification Protocol (Mandatory Per Batch)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Verification
bun run lint

# 3. Fast Unit Test Suite (19 suites, 494 tests)
bun run test:fast

# 4. Calculation & Behavioral Snapshot Witnesses
bun scripts/snapshot-witness.ts
bun scripts/checkNoFabricatedMonicaFallback.ts

# 5. Full Unit & Integration Test Suite
bun run test --passWithNoTests

# 6. Production Next.js Build
bun run build

# 7. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 5. Standing Campaign Constraints

1. **Cast Non-Regression:** `as any` and `total casts` must never increase.
2. **Declined Pool Non-Regression:** The 6,327 declined pool is frozen; any increase fails the build.
3. **Per-Rule Non-Regression:** Every tracked rule is individually asserted; no batch may trade safety for volume.
4. **Never Delete a Runtime Guard:** Fix optimistic interfaces honestly rather than removing runtime checks.
5. **Preserve `??` vs `||` Domain Semantics:** Never replace `||` with `??` when `0` or `""` are valid domain values.
6. **Handoff Document Synchronization:** Always update `NEXT_SESSION_PROMPT.md` at the end of each batch as part of the closeout gate.
