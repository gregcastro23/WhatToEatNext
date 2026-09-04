# Next Session: Phase 20 — Trust Boundaries, Dead-Surface Pruning & Nullish Convergence

> **Status of Phase 19:** Complete, verified, committed on branch `refactor/phase-19-trust-boundaries`.
> Two commits: `ae5beae4` (Trust boundaries, dead surface, live defects) and `78960382` (34 PNC conversions & re-measured baseline).
>
> | Metric | Before (P18) | After (P19) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,875 | **2,787** | **−88** |
> | PNC sub-baseline | 337 | **301** | **−36** |
> | Cast surface | 263 | **260** | **−3** |
> | — `as any` / `as unknown as` | 71 / 192 | **69 / 191** | −2 / −1 |
> | — Production / Test | 231 / 32 | **228 / 32** | −3 / held |
> | Assertion sites (AST) | 4,418 | **4,411** | **−7** |
> | — Production | 3,799 | **3,788** | **−11** |
> | Declined pool | 6,356 | **6,317** | **−39** |
>
> Gates: `bun run verify` clean end-to-end (pre-commit hooks passed).
> Verification: typecheck 0 errors · gate suites 50/50 · 114 suites / 1,044 tests green.

---

## 0. Lessons & Operational Realities from Phase 19

### Subagent Workflows: Mechanical vs. Judgement
- **Do NOT launch parallel subagent swarms for mechanical audits or static queries.** In Phase 19, 8 unconstrained exploratory subagents burned 727k tokens and timed out on session limits with 0 synthesized output. Single-threaded local scripts, AST queries, and ripgrep complete in seconds, cost <5k tokens, and are fully deterministic.
- **Subagents ARE effective for multi-file judgement work with bounded schemas.** The 13-agent coverage analysis across independent files succeeded cleanly (13/13) because each subagent had a distinct target and a constrained output contract.

### PNC Sub-baseline Bookkeeping & `--ratchet` Gotcha
- `compareSubBaseline` in CI validates **`total` alone**.
- The script flag `--ratchet` (and `LINT_DEBT_AUTO_RATCHET=1`) spreads `...preferNullishCoalescing` and only overwrites `total` (line 380 of `scripts/checkLintDebt.ts`). The documentation fields (`verifiedSafe`, `semantic`, `unclassified`) survive unchanged and silently describe retired populations unless updated by hand.
- **Shape-dependent divergence rules** (essential for compiler-based classification):
  - `x || b` and `if (!x) x = b`: diverge when `x` is falsy-but-non-nullish (`0`, `""`, `false`, `0n`, `NaN`).
  - `x !== undefined ? x : b`: diverges **only** when `x` can be `null`.
  - `x === null ? b : x`: diverges **only** when `x` can be `undefined`.
  - `x != null ? x : b`: two-sided guard; never diverges.
- **Chains convert whole without parentheses:** `a || b || c` converts to `a ?? b ?? c` with **no parentheses**. Parentheses are only required when mixing `??` with `||` or `&&`.
- **Current PNC status (301 remaining):**
  - **6 verifiedSafe**: 4 chained `||` sites (`useChartData.ts:126`, `cuisineTypes.ts:621`) and 2 in `seasonings/vinegars.ts:13,19`.
  - **290 semantic**: operands can be falsy (`0`, `""`, `false`, `NaN`) or `any`/`unknown`.
  - **5 unclassified**: multi-line `||` expressions whose AST node begins on a line prior to the report.

### Trust Boundary Architecture vs. Ratchet Tension
- `res.json()` exists at 643 call sites; 313 currently pay an inline `as T` cast.
- The naive fix (`const data = await res.json() as TargetType`) trades unsafe-* for an assertion site.
- Use the shared JSON trust boundary helper in [`src/lib/api/json.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/api/json.ts): `readJson<T>(res)` and `fetchJson<T>(url, init)`. It absorbs the cast at the boundary and provides an optional validator hook (`parse?: (raw: unknown) => T`).

### Reference & Scope Corrections
- **`unsafe-*` family count:** Exactly **823 sites** (not 828).
- **`monicaConstant` references:** Exactly **153 references** across `src/` (not 136). Do not size the type-widening task off 136.

---

## 1. Phase 20 Prioritized Action Plan

### Tranche 1: Convert the Final 6 Safe PNC Sites
Convert the 6 compiler-verified safe sites to bring `verifiedSafe` to 0:
1. **Chained fallback sites (4 sites across 2 lines):**
   - [`src/hooks/useChartData.ts:126`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useChartData.ts#L126): `const location = optionLocation || userLocation || DEFAULT_LOCATION;` → `optionLocation ?? userLocation ?? DEFAULT_LOCATION;`
   - [`src/utils/cuisineTypes.ts:621`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/cuisineTypes.ts#L621): `return commonIngredients[key] || commonIngredients[reverseKey] || [];` → `commonIngredients[key] ?? commonIngredients[reverseKey] ?? [];`
2. **Vinegars fallback sites (2 sites):**
   - [`src/data/ingredients/seasonings/vinegars.ts:13,19`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/data/ingredients/seasonings/vinegars.ts#L13): `elementalProperties: properties.elementalProperties || { ... }` → `??`
3. **Ratchet & Doc Sync:**
   - Ratchet PNC sub-baseline: `301 → 295` (−6).
   - Update doc fields: `verifiedSafe: 0`, `semantic: 290`, `unclassified: 5` (sum = 295).

### Tranche 2: Prune Orphaned Dead Modules (Phase 19 Deletion Leftovers)
The deletion of `AstrologicalClock.tsx` and `RecommendedRecipes.tsx` in `ae5beae4` left two modules with zero importers:
1. **[`src/hooks/useCurrentChart.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useCurrentChart.ts) (381 lines):**
   - 0 code importers across `src/` (only referenced in `CONTEXT_CONSOLIDATION_GUIDE.md`).
   - Audit and delete.
2. **[`src/utils/recommendationEngine.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/utils/recommendationEngine.ts) (260 lines):**
   - 0 importers anywhere in the workspace.
   - Audit and delete.
- **Expected Yield:** −641 lines of dead code, zero broken dependencies, and immediate drop in overall repo complexity.

### Tranche 3: `fetchJson` / `readJson` Trust Boundary Fan-out (Wave 1)
Migrate cast-heavy `.json()` consumer sites to use [`src/lib/api/json.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/api/json.ts). Target 20–30 sites in domain-bounded groups:
- **Batch A: Recipe & Promotion Clients**
  - [`src/lib/recipe-nft/mintClient.ts:38,53,68`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/recipe-nft/mintClient.ts): Replace `(await res.json()) as MintQuoteResult` and `MintResult` with `fetchJson<MintQuoteResult>` / `fetchJson<MintResult>`.
  - [`src/components/recipes/LabBookIngest.tsx:76,177`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipes/LabBookIngest.tsx): Replace manual `.json()` casts with `fetchJson`.
- **Batch B: User & Astrologize Services**
  - [`src/services/astrologizeApi.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/astrologizeApi.ts) and [`src/services/recipeData.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/services/recipeData.ts).
- **Metric Impact:** Net reduction in `assertionSites` and `casts.untrackedSingleAsT` at zero risk.

### Tranche 4: Remaining Root-Cause Unsafe-* Backlog
1. **[`src/contexts/menu-planner/useCostEstimation.ts:56`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/contexts/menu-planner/useCostEstimation.ts#L56) (10 unsafe sites):**
   - `ingredients: (m.recipe!.ingredients || []).map((ing: any) => ({ ... }))`
   - Type `ing` properly with existing ingredient types (`RecipeIngredient`).
   - Resolves 10 unsafe-* warnings at zero assertion cost. Check with `scripts/checkEmitEquivalence.sh`.
2. **[`src/components/recipes/LabBookIngest.tsx`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/components/recipes/LabBookIngest.tsx) (13 unsafe sites):**
   - Clean up member-level assertions; bind once at the boundary.

### Tranche 5: `DailyNutritionTotals.monicaConstant` Type Widening
- Field declared `monicaConstant: number` in `DailyNutritionTotals` cannot represent absent/uncomputed values without fabricating a zero.
- Sized at exactly **153 references** across `src/`.
- Must be handled in an isolated, dedicated branch/PR to prevent merge conflicts.

---

## 2. Standing Repo Hygiene & Known Warnings

1. **Reappearing Dead Files Hazard (`fruits.ts` / `enhancedFruits.ts`):**
   - Deleted in PR #819 (`fa29e501`), but can reappear as untracked files on disk with their original May timestamps.
   - If present, they add **+2 `max-lines`** to the declined pool, breaking `lint:debt`.
   - Diagnose via `git status --porcelain` and lint file counts (2022 vs 2024), never by file mtime.
2. **External Manifest Parity Test:**
   - [`src/lib/esms-chain/__tests__/tokenMetadata.test.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/__tests__/tokenMetadata.test.ts) fails on an external Arweave image URL diff against a sibling ASOL checkout. Known issue; do not patch locally.
