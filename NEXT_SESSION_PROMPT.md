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
- **Current PNC status (295 remaining):**
  - **0 verifiedSafe**: (Exhausted in Phase 20).
  - **290 semantic**: operands can be falsy (`0`, `""`, `false`, `NaN`) or `any`/`unknown`.
  - **5 unclassified**: multi-line `||` expressions whose AST node begins on a line prior to the report.

### Earned vs. Manufactured Confidence (Architectural Law)
- `@typescript-eslint/no-unnecessary-condition` accounts for 1,276 entries (46.5% of tracked debt).
- **Do NOT treat `no-unnecessary-condition` as low-hanging fruit.** A condition is only truly "unnecessary" if the confidence of the type was **earned** via runtime validation (Zod schemas, exhaustive type discriminators) rather than **manufactured** by an upstream cast (`as unknown as`, `as any`, or unvalidated API rehydration).
- *Case study from Phase 20:* In `useCostEstimation.ts`, removing `typeof ing === 'string'` and `|| []` was type-clean because `m.recipe` was typed as `EnhancedRecipe`. But `meal.recipe` is written by `useMealSlots.ts:153` via `recipe as unknown as ...` and rehydrated at `MenuPlannerProvider.tsx:432` via `(await response.json()) as SavedMenuApiData` (unvalidated GET).
- Using `readJson<T>` without `options.parse` simply relocates an unverified claim. A true trust boundary must validate at the door.

---

## 1. Phase 21 Prioritized Action Plan

### Tranche 1: Earn the Menu Planner Boundary (`MenuPlannerProvider.tsx:432`)
- **Objective:** Secure the read path for menu planning and retroactively earn the Tranche 4 guard removal in `useCostEstimation.ts`.
- **Tasks:**
  1. Extract route-local Zod schemas from [`src/app/api/menu-planner/menus/route.ts`](src/app/api/menu-planner/menus/route.ts) into a shared module: [`src/lib/menu-planner/schemas.ts`](src/lib/menu-planner/schemas.ts).
  2. Validate GET responses on both server (`route.ts`) and client: [`src/contexts/menu-planner/MenuPlannerProvider.tsx:432`](src/contexts/menu-planner/MenuPlannerProvider.tsx#L432) using `readJson(response, { parse: (raw) => savedMenuApiDataSchema.parse(raw) })`.
  3. Ensure `ing.name` is guaranteed to be a string at runtime, eliminating the crash hazard in `priceEstimator.ts:198`.

### Tranche 2: `DailyNutritionTotals.monicaConstant` Type Widening (Dedicated Branch)
- **Objective:** Fix the type honesty of `DailyNutritionTotals.monicaConstant` in [`src/types/nutrition.ts`](src/types/nutrition.ts).
- **Branch Strategy:** Execute on a dedicated branch (`refactor/monica-constant-optionality`) to avoid merge conflicts across 153 call sites.
- **Tasks:**
  1. Change `monicaConstant: number` to `monicaConstant?: number`.
  2. Use compiler errors (`bun run typecheck`) to navigate to all dereferencing sites.
  3. Safely coalesce (`totals.monicaConstant ?? 0`) or update test fixtures.
  4. Ratchet lint debt: `bun scripts/checkLintDebt.ts --ratchet`.

### Tranche 3: Validated Trust Boundary Fan-out (Wave 2)
- Migrate inline `.json() as T` casts, pairing `readJson` / `safeReadJson` with actual schema parsers (`parse`) rather than bare type overrides:
  - [`src/services/recipeData.ts`](src/services/recipeData.ts)
  - [`src/services/tokenService.ts`](src/services/tokenService.ts)
  - [`src/lib/embeddings/openaiEmbeddings.ts`](src/lib/embeddings/openaiEmbeddings.ts)

### Tranche 4: Defend Against Naive `no-unnecessary-condition` Sweeps
- Partition the 1,276 `no-unnecessary-condition` candidates by earned vs. manufactured confidence. Refuse to delete runtime guards where upstream types originate from `as unknown as` or unvalidated I/O.

---

## 2. Standing Repo Hygiene & Known Warnings

1. **Reappearing Dead Files Hazard (`fruits.ts` / `enhancedFruits.ts`):**
   - Deleted in PR #819 (`fa29e501`), but can reappear as untracked files on disk with their original May timestamps.
   - If present, they add **+2 `max-lines`** to the declined pool, breaking `lint:debt`.
   - Diagnose via `git status --porcelain` and lint file counts (2022 vs 2024), never by file mtime.
2. **External Manifest Parity Test:**
   - [`src/lib/esms-chain/__tests__/tokenMetadata.test.ts`](src/lib/esms-chain/__tests__/tokenMetadata.test.ts) fails on an external Arweave image URL diff against a sibling ASOL checkout. Known issue; do not patch locally.

