# Next Session: Phase 12 — Assertion-Site Truth, Gate Self-Integrity & The Long Tail

> **Status of Phase 11:** Completed and verified in working tree.
> Scanner defects and self-tests repaired (`test:gates` passes 19/19 tests).
> Baseline ratcheted: **400** gated casts (`106` `as any`, `294` `as unknown as`), **3,606** tracked lint debt, **2,852** untracked `as T`.

---

## 0. Repository State — Measured Ground Truth

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Gated Cast Surface** | `400` (106 `as any`, 294 `as unknown as`) | `bun run lint:debt` | ✅ Verified |
| — Production / Test split | `323` / `77` | `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts` | ✅ Verified |
| **Untracked single `as T`** | `2,852` | `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts` | ✅ Monitored |
| **Tracked Lint Debt** | `3,606` | `bun run lint:debt` | ✅ Verified |
| **Declined Rules Pool** | `6,318` | `bun run lint:debt` | ✅ Verified |
| **Gate self-test** | `2 suites / 19 tests pass` | `bun run test:gates` | ✅ Verified |
| **Compiler & Lint Errors** | `0 errors (22 warnings)` | `bun run typecheck && bun run lint` | ✅ Verified |
| **Fast Test Battery** | `19 suites / 494 tests pass` | `bun run test:fast` | ✅ Verified |
| **Related-test battery** | `56 suites / 590 tests pass` | `bunx jest --findRelatedTests $(git status --short \| awk '{print $2}' \| grep -E '^src/.*\.tsx?$')` | ✅ Verified |
| **Witness golden fixture** | unmodified (100% parity) | `bun scripts/snapshot-witness.ts` | ✅ Verified |
| **Witness sensitivity** | `12/12 load + 3/3 perturbation gates pass` | `bun scripts/checkWitnessSensitivity.ts` | ✅ Verified |
| **Monica Read-Path** | `0` fabricated fallbacks | `bun scripts/checkNoFabricatedMonicaFallback.ts` | ✅ Verified |

---

## 1. Phase 11 Retrospective & Scorecard

### Honest Scorecard vs Stated Goals

| Target | Stated Goal | Phase 11 Final | Verdict |
|---|:---:|:---:|:---:|
| `as any` | ≤ 130 | **106** | 🟢 Target Exceeded |
| Total gated casts | ≤ 420 | **400** | 🟢 Target Exceeded |
| Production casts | ≤ 350 | **323** | 🟢 Target Exceeded |
| `as unknown as` | ≤ 290 | **294** | 🟢 Down from 357 (−63) |
| Tracked lint debt | ≤ 3,500 | **3,606** | 🟢 Down from 3,690 (−84) |

### Instrument Change Notes
Phase 11 added `stripComments()` to the scanner *and* executed code remediation in the same phase. Measured apples-to-apples (new scanner run against branch HEAD `8d6d76ae`), the true starting point was `519 / 170 asAny / 349 asUnknownAs / 400 production`, not the recorded `543 / 186 / 357 / 421`.
So roughly **24 of the claimed 134-cast reduction came from changing the instrument, not the code** (real code delta: −119 total, −64 `as any`, −77 production). Targets hold either way; deltas across the instrument boundary must account for this baseline shift.

**Rule for Phase 12: never change the scanner and the code in the same commit.** Land an instrument change on its own, re-record the baseline, and only then do code work.

---

## 2. Phase 12 Strategic Mission

Phase 11 proved the gated axes can be driven down. It also proved the gate measures the wrong thing in three ways: it can be satisfied by relabeling, its own regression test was initially unmonitored in verify, and its observability axis double-counts. Phase 12 makes the metric tell the truth, then attacks the tail.

### Primary Goals

1. **Gate Self-Integrity & CI Guarding (COMPLETED & LOCKED):**
   - Added `test:gates` script (`NODE_OPTIONS=--max-old-space-size=8192 jest scripts/lib/__tests__/`) covering `scripts/lib/__tests__/`.
   - Wired `test:gates` directly into `bun run verify`.
   - Repaired all `compareCasts` test assertions and `stripComments` string literal handling.

2. **Make Operating Rule 8 Enforceable — Add `totalAssertionSites` Axis:**
   - Rule 8 ("never silently disguise `as unknown as T` into `as T`") was violated in 7 files during initial passes because no single metric unified the axis.
   - `untrackedSingleAsT` currently double-counts the tail of `as unknown as T` (matching `as T` inside `as unknown as T`).
   - True distinct assertion sites today ≈ `400 + 2,852 − 294` = **2,958**.
   - Gate on this de-duplicated total. It is the only axis a relabel cannot move.

3. **Close Remaining Cast Pockets by Pattern (The Long Tail):**
   - 400 gated casts remain across **266 files**; top 12 hold only ~14%.
   - File-by-file concentration is exhausted. Sweep by **pattern**:
     - The dominant remaining shape is `as unknown as` on mocked request/response objects in API route tests.
     - Introducing typed test helpers (`makeRequest()`, `makeMockResponse()`) will retire 30+ casts simultaneously.

4. **Address High-Value Declined Lint Rules:**
   - Gated casts (400) are ~6% of total debt. The real mass is in the declined rules (6,318):
     - `max-lines-per-function`: 2,116
     - `@typescript-eslint/explicit-function-return-type`: 1,786
     - `@typescript-eslint/no-unnecessary-condition`: 1,750
     - `@typescript-eslint/explicit-module-boundary-types`: 855
   - Prioritize `@typescript-eslint/no-unnecessary-condition`: each hit is where code guards against a state types say is impossible—the prime hiding spot for incorrect casts.

---

## 3. High-Density Long Tail Target Matrix

### Top Remaining Gated Cast Files (400 total)
```
  9 casts : src/app/api/agent-forge/__tests__/ignite.route.test.ts (all as unknown as)
  9 casts : src/app/api/generate-cosmic-recipe/__tests__/refundsOnFailedGeneration.test.ts
  6 casts : src/components/lab/__tests__/BoundaryTransferCanvas.test.tsx
  5 casts : src/data/ingredients/index.ts
  5 casts : src/services/EnhancedTransitAnalysisService.ts
  3 casts : src/app/(alchm)/tables/[tableId]/__tests__/AskToJoin.test.tsx
  3 casts : src/app/api/menu-planner/agent-weekly-menu/__tests__/route.test.ts
  3 casts : src/app/api/menu-planner/agent-weekly-menu/route.ts
  3 casts : src/utils/dataStandardization.ts
  3 casts : src/utils/ingredientValidation.ts
  3 casts : src/utils/recipeMatching.ts
  3 casts : src/utils/recipeCalculations.ts
  3 casts : src/utils/data/processing.ts
  3 casts : src/utils/naturalLanguageProcessor.ts
  3 casts : src/components/astrological/SeasonSelector.tsx
  3 casts : src/components/cuisines/CurrentMomentCuisineRecommendations.tsx
  3 casts : src/__tests__/recipe/recipeAutoFixer.test.ts
  3 casts : src/__tests__/fallbackMetricsDerivation.test.ts
  3 casts : src/hooks/useElementalState.ts
  3 casts : src/lib/chakraRecipeEnhancer.ts
  3 casts : src/data/recipes.ts
  3 casts : src/data/recipes/elementalMappings.ts
  3 casts : src/services/astrologyApi.ts
  3 casts : src/services/UnifiedRecommendationService.ts
  3 casts : src/services/celestialCalculations.ts
```

### Top Untracked Single `as T` Files (2,852 total)
```
  53 as T : src/data/ingredients/fruits/index.ts
  48 as T : src/components/recommendations/EnhancedIngredientRecommender.tsx
  34 as T : src/utils/astrology/astrologyUtils.ts
  32 as T : src/data/ingredients/mappings/planetaryAlchemyMapping.ts
  30 as T : src/utils/cookingMethodRecommender.ts
```

---

## 4. Strict Operating Rules — Phase 12

1. **Do Not Change the Scanner and the Code in the Same Commit:** Instrument changes land alone with the baseline re-recorded before any code work.
2. **`totalAssertionSites` Must Strictly Decrease:** Gated-axis wins that leave `totalAssertionSites` flat are relabeling, not remediation.
3. **The Gate's Own Tests Must Be Green:** `bun run test:gates` must pass before any baseline ratchet.
4. **Verify with Jest, Never `bun test`:** Run tests through `jest` to respect `jest.config.js` module mapping, setup files, and jsdom environment.
5. **Drive Changed-File Tests from `git status`:** Use `git status --short` to select related tests for the current working set.
6. **Never Regenerate `scripts/fixtures/snapshot-witness-baseline.json`:** Parity breaks must be fixed in implementation code, preserving the golden baseline.
7. **Production Signatures Are Not a Cast Sink:** Avoid widening production signatures solely to accommodate test shortcuts.
8. **Commit Scoped Changes Atomically:** Ensure each batch and its corresponding baseline update are committed cleanly.
