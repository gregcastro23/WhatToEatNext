# Next Session: Phase 21 — `monicaConstant` Widening & JSON Trust Boundary Wave 2

> **Status of Phase 20:** Complete, verified, committed on branch `refactor/phase-19-trust-boundaries`.
> Commit: `693f5605` (Phase 20: dead surface pruning, safeReadJson trust boundaries, and nullish convergence).
>
> | Metric | Before (P19) | After (P20) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,787 | **2,742** | **−45** |
> | PNC sub-baseline | 301 | **295** | **−6** |
> | — `verifiedSafe` remaining | 6 | **0** | **−6** (Exhausted) |
> | Cast surface | 260 | **259** | **−1** |
> | — `as any` / `as unknown as` | 69 / 191 | **69 / 190** | 0 / −1 |
> | — Production / Test | 228 / 32 | **227 / 32** | −1 / 0 |
> | Assertion sites (AST) | 4,411 | **4,389** | **−22** |
> | — Production | 3,788 | **3,767** | **−21** |
> | — Test | 623 | **622** | **−1** |
> | Declined pool | 6,317 | **6,304** | **−13** |
> | Dead code pruned | — | **−780 lines** | 3 files deleted |
>
> Gates: `bun run verify` clean end-to-end (pre-commit hooks passed).
> Verification: typecheck 0 errors · gate suites 50/50 · 114 suites / 1,044 tests green · production build green.

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

## 1. Phase 21 Prioritized Action Plan

### Tranche 1: `DailyNutritionTotals.monicaConstant` Type Widening
- **Objective:** Fix the type honesty of `DailyNutritionTotals.monicaConstant` in [`src/types/nutrition.ts`](src/types/nutrition.ts).
- **Branch Strategy:** Execute on a dedicated branch (`refactor/monica-constant-optionality`) to avoid merge conflicts.
- **Scope:** 153 references across `src/data/`, `src/services/nutrition/`, `src/utils/nutritionCalculator.ts`, and test fixtures.
- **Tasks:**
  1. Change `monicaConstant: number` to `monicaConstant?: number`.
  2. Use compiler errors (`bun run typecheck`) to navigate to all dereferencing sites.
  3. Safely coalesce (`totals.monicaConstant ?? 0`) or update test fixtures.
  4. Ratchet lint debt: `bun scripts/checkLintDebt.ts --ratchet`.

### Tranche 2: `readJson` / `safeReadJson` Trust Boundary Fan-out (Wave 2)
- Continue migrating inline `.json() as T` casts across high-traffic services:
  - [`src/services/recipeData.ts`](src/services/recipeData.ts)
  - [`src/services/tokenService.ts`](src/services/tokenService.ts)
  - [`src/lib/embeddings/openaiEmbeddings.ts`](src/lib/embeddings/openaiEmbeddings.ts)
- Preserve error-handling semantics (use `safeReadJson` where callers catch or swallow).

### Tranche 3: Semantic PNC Investigation & Reduction
- Audit the remaining 290 `semantic` PNC entries in clusters where the operand is demonstrably non-numeric and non-empty (e.g. object references or arrays with type-level truthiness).

---

## 2. Standing Repo Hygiene & Known Warnings

1. **Reappearing Dead Files Hazard (`fruits.ts` / `enhancedFruits.ts`):**
   - Deleted in PR #819 (`fa29e501`), but can reappear as untracked files on disk with their original May timestamps.
   - If present, they add **+2 `max-lines`** to the declined pool, breaking `lint:debt`.
   - Diagnose via `git status --porcelain` and lint file counts (2022 vs 2024), never by file mtime.
2. **External Manifest Parity Test:**
   - [`src/lib/esms-chain/__tests__/tokenMetadata.test.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/esms-chain/__tests__/tokenMetadata.test.ts) fails on an external Arweave image URL diff against a sibling ASOL checkout. Known issue; do not patch locally.
