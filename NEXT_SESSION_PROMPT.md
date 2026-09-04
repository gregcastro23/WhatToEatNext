# Next Session: Phase 22 — Token Service Trust Boundaries, Cast Reductions & Downstream Hook Simplification

> **Status of Phase 21:** Complete, verified, committed on branch `refactor/phase-19-trust-boundaries`.
> Commit: Phase 21 (`monicaConstant` widening, menu planner Zod boundary, and JSON trust fan-out).
>
> | Metric | Before (P20) | After (P21) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,742 | **2,737** | **−5** |
> | — `@typescript-eslint/no-explicit-any` | 206 | **205** | **−1** |
> | — `@typescript-eslint/no-unsafe-assignment` | 274 | **273** | **−1** |
> | — `@typescript-eslint/no-unsafe-member-access` | 262 | **259** | **−3** |
> | — `@typescript-eslint/no-unnecessary-condition` | 1,276 | **1,276** | **0** (Defended) |
> | PNC sub-baseline | 295 | **295** | **0** |
> | Cast surface | 259 | **258** | **−1** |
> | — `as any` / `as unknown as` | 69 / 190 | **68 / 190** | **−1** / 0 |
> | — Production / Test | 227 / 32 | **226 / 32** | **−1** / 0 |
> | Assertion sites (AST) | 4,389 | **4,387** | **−2** |
> | — Production / Test | 3,766 / 623 | **3,763 / 624** | **−3** / +1 |
> | — `as any` sites | 67 | **66** | **−1** |
> | Declined pool | 6,304 | **6,304** | **0** |
>
> Gates: `bun run test:gates` 50/50 · `bun run strict-index:check` 0 errors · `bun run typecheck` 0 errors · `bun run test:fast` 494/494 · production build clean.

---

## 0. Lessons & Operational Realities from Phase 21

### Earned Confidence in Action
- **Menu Planner Trust Boundary:** `MenuPlannerProvider.tsx:432` now rehydrates menus via `readJson(response, { parse: (raw) => savedMenuApiDataSchema.parse(raw) })`.
- Shared Zod schemas in `src/lib/menu-planner/schemas.ts` guarantee that string ingredient names, recipe titles, meal slots, and nutritional totals are validated at the network edge.
- `DailyNutritionTotals.monicaConstant` is honestly typed as `monicaConstant?: number`, and `nutritionalCalculator.ts:296` safely coalesces with `?? 0`.

### Naive Condition Removal Trap Disarmed
- Adding redundant nullish coalescing to an already-defaulted field (e.g. `inventory: menu.inventory ?? []` where `menu.inventory` was defaulted to `[]` by Zod) triggers `no-unnecessary-condition`.
- Always verify whether an upstream schema default already guarantees non-nullishness before appending fallback operators.

---

## 1. Phase 22 Prioritized Action Plan

### Tranche 1: Token Service Trust Boundaries (`src/services/tokenService.ts`)
- **Objective:** Secure token API interactions and eliminate untyped casts.
- **Tasks:**
  1. Define Zod response schemas for token queries, transfers, and balances.
  2. Adopt `readJson(response, { parse: schema.parse })` for network calls.
  3. Reduce production `as any` / `as unknown as` occurrences in token handling.

### Tranche 2: Downstream Menu-Planner Hook Optimization
- **Objective:** Leverage the earned confidence from `MenuPlannerProvider` across downstream consumers.
- **Tasks:**
  1. Audit `src/hooks/menu-planner/useCostEstimation.ts` and `src/hooks/menu-planner/useMealSlots.ts`.
  2. Replace unearned casts (`recipe as unknown as ...`) with typed conversions from `EnhancedRecipe`.
  3. Clean up the single remaining `no-useless-assignment` warning in `src/utils/instacart/priceEstimator.ts:79`.

### Tranche 3: `require-await` Pruning Wave
- **Objective:** Reduce the 77 `@typescript-eslint/require-await` warnings across services.
- **Tasks:**
  1. Identify methods marked `async` that perform no asynchronous work.
  2. Convert to synchronous signatures where call sites allow, or add appropriate `await` expressions if operations were intended to be async.

---

## 2. Standing Repo Hygiene & Known Warnings

1. **Reappearing Dead Files Hazard (`fruits.ts` / `enhancedFruits.ts`):**
   - Deleted in PR #819 (`fa29e501`), but can reappear as untracked files on disk with their original May timestamps.
   - If present, they add **+2 `max-lines`** to the declined pool, breaking `lint:debt`.
   - Diagnose via `git status --porcelain` and lint file counts (2022 vs 2024), never by file mtime.
2. **External Manifest Parity Test:**
   - [`src/lib/esms-chain/__tests__/tokenMetadata.test.ts`](src/lib/esms-chain/__tests__/tokenMetadata.test.ts) fails on an external Arweave image URL diff against a sibling ASOL checkout. Known issue; do not patch locally.
