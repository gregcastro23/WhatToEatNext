# Next Session: Phase 23 — Remaining require-await Pruning, Token Client Cast Reduction & Schema Edge Hardening

> **Status of Phase 22:** Complete, verified, committed on branch `refactor/phase-22-trust-boundaries`.
> Commit: Phase 22 (Token trust boundaries, menu planner cast reductions, and require-await pruning).
>
> | Metric | Before (P21) | After (P22) | Δ |
> |---|---:|---:|---:|
> | Tracked lint debt | 2,737 | **2,701** | **−36** |
> | — `@typescript-eslint/require-await` | 77 | **46** | **−31** |
> | — `@typescript-eslint/no-unsafe-member-access` | 259 | **257** | **−2** |
> | — `@typescript-eslint/no-unsafe-assignment` | 273 | **272** | **−1** |
> | — `@typescript-eslint/no-unsafe-argument` | 97 | **96** | **−1** |
> | — `@typescript-eslint/no-useless-assignment` | 53 | **52** | **−1** |
> | — `@typescript-eslint/no-unnecessary-condition` | 1,276 | **1,276** | **0** (Defended) |
> | PNC sub-baseline | 295 | **294** | **−1** |
> | Cast surface | 258 | **255** | **−3** |
> | — `as any` / `as unknown as` | 68 / 190 | **68 / 187** | 0 / **−3** |
> | — Production / Test | 226 / 32 | **223 / 32** | **−3** / 0 |
> | Assertion sites (AST) | 4,387 | **4,373** | **−14** |
> | — Production / Test | 3,763 / 624 | **3,749 / 624** | **−14** / 0 |
> | — `as any` sites | 66 | **66** | **0** |
> | Declined pool | 6,304 | **6,302** | **−2** |
>
> Gates: `bun run test:gates` 50/50 · `bun run strict-index:check` 0 errors · `bun run typecheck` 0 errors · `bun run test:fast` 494/494 · production build clean.

---

## 0. Lessons & Operational Realities from Phase 22

### Earned Confidence in Action
- **`EnhancedRecipe.title?: string` Alignment:** Widening `title` on `EnhancedRecipe` from `string` to optional `string` aligned it with `MonicaOptimizedRecipe` without unsafe double casting (`as unknown as MonicaOptimizedRecipe`).
- **Defending `prefer-nullish-coalescing`:** When making a string field optional, references using `||` (like `recipe.title || ''`) trigger PNC. Updating them to `(recipe.title ?? '')` resolved the warnings cleanly and ratcheted PNC from 295 down to 294.
- **`require-await` Pruning Semantics:**
  - Returning `Promise.resolve(...)` inside methods preserving an async interface avoids breaking external contract callers while clearing `@typescript-eslint/require-await`.
  - Avoid wrapping entire bodies in `return Promise.resolve().then(() => { ... })` because long arrow functions trip `max-lines-per-function` in the declined pool. Return resolved/rejected promises directly in `try/catch`.

---

## 1. Phase 23 Prioritized Action Plan

### Tranche 1: Remaining `require-await` Pruning (46 remaining)
- **Objective:** Tackle the second wave of `@typescript-eslint/require-await` warnings across API routes, hooks, and helpers.
- **Focus:**
  1. Identify remaining async functions performing no await.
  2. Maintain `Promise` return signatures for external API compatibility.
  3. Ensure no anonymous function introduces `max-lines-per-function` bloat.

### Tranche 2: Token Client Cast Elimination (`TokensClient.ts` & Consumer Components)
- **Objective:** Continue the token safety improvements started in Phase 22.
- **Tasks:**
  1. Audit `TokensClient.ts` helper methods for unneeded type casts.
  2. Harden consumer components to avoid bare `as any` / `as unknown as` assertions.
  3. Wire additional Zod schemas from `src/lib/economy/clientSchemas.ts` where responses are still untyped.

### Tranche 3: Menu & Recipe Trust Boundary Hardening
- **Objective:** Further reduce production cast surface across recipe presentation and planning components.
- **Tasks:**
  1. Audit recipe display components for unnecessary assertions between `EnhancedRecipe` and `MonicaOptimizedRecipe`.
  2. Verify compatibility with `useMealSlots` and `MenuPlannerProvider`.

---

## 2. Standing Repo Hygiene & Known Warnings

1. **Reappearing Dead Files Hazard (`fruits.ts` / `enhancedFruits.ts`):**
   - Deleted in PR #819 (`fa29e501`), but can reappear as untracked files on disk with their original May timestamps.
   - If present, they add **+2 `max-lines`** to the declined pool, breaking `lint:debt`.
   - Diagnose via `git status --porcelain` and lint file counts (2022 vs 2024), never by file mtime.
2. **External Manifest Parity Test:**
   - [`src/lib/esms-chain/__tests__/tokenMetadata.test.ts`](src/lib/esms-chain/__tests__/tokenMetadata.test.ts) fails on an external Arweave image URL diff against a sibling ASOL checkout. Known issue; do not patch locally.

