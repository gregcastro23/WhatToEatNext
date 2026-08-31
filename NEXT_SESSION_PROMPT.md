# Next Session: Phase 10 TypeScript Quality Campaign — Cast Surface Remediation & Type Safety

> **Every number in this doc is reproducible.** Each row in §0 names the command that
> re-derives it. If a command disagrees with the table, the table is wrong — fix the table.
> Numbers were last re-derived on 2026-08-31 at commit `391577f3`.

---

## 0. Repository State — Measured, Not Assumed

| Fact | Value | Verification Command | Re-derived? |
|---|:---:|---|:---:|
| **Tracked Baseline** | `3,690` (down 25 from 3,715) | `bun run lint:debt` | ✅ |
| **Declined Rules Pool** | `6,318` (down 5 from 6,323) | `bun run lint:debt` | ✅ |
| **Cast Surface (gated)** | `543` (186 `as any` + 357 `as unknown as`) | `bun run lint:debt` | ✅ |
| — Production Casts | `421` (131 `as any`, 290 `as unknown as`) | `bun run lint:debt` | ✅ |
| — Test Casts | `122` (55 `as any`, 67 `as unknown as`) | `bun run lint:debt` | ✅ |
| **Lint Errors** | `0` (22 warnings) | `bun run lint` | ✅ |
| **Compiler Errors** | `0` | `bun run typecheck` | ✅ |
| **Fast Test Suite** | `19/19 suites, 494/494 tests` | `bun run test:fast` | ✅ |
| **Snapshot Witness** | 100% parity across all 12 recommender modules | `bun scripts/snapshot-witness.ts` | ✅ |
| **Witness Sensitivity** | 100% sensitive (12/12 modules go RED on throw injection) | `bun test-witness-sensitivity.ts` | ✅ |
| **Monica Integrity** | 0 fabricated fallbacks | `bun scripts/checkNoFabricatedMonicaFallback.ts` | ✅ |

---

## 1. Phase 10 Campaign Accomplishments (Committed at `391577f3`)

### 1.1 Batches A, B, C (`6205d34e`)
- **250 casts eliminated** across 12 high-concentration modules (baseline ratcheted 868 → 618).
- Typed core recommender engines, seasonal pipelines, and cuisine adapters.

### 1.2 Snapshot Witness Extension & Gate Hardening (`b35a5e64`)
- Extended `scripts/snapshot-witness.ts` to exercise all 12 core recommender/cuisine modules.
- Proved 100% sensitivity across all 12 modules via automated throw-injection testing.
- Hardened `scripts/checkLintDebt.ts` with `Math.min(current, baseline)` ratchet for `asUnknownAs` and segmented prod/test reporting.
- Fixed latent null-access bug in `src/utils/recommendation/ingredientRecommendation.ts`.

### 1.3 Batch D Remediation (`391577f3`)
- **75 casts eliminated** across 10 target files (baseline ratcheted 618 → 543).
- Fixed `enhancedIngredients.ts`, `AlchemicalDataContext.tsx`, `dynamicImport.ts`, `transformations.ts`, `seasonalCalculations.ts`, `UnifiedIngredientService.ts`, `ingredientNutritionAggregation.ts`, `culinaryAstrology.ts`, `fruits/index.ts`, `EnhancedAstrologyService.ts`, and `CuisineRecommender.tsx`.
- Tracked debt dropped by 16 (3706 → 3690); declined rules dropped by 5 (6323 → 6318).

---

## 2. Top Remaining Cast Concentrations

Total remaining gated casts: **543** (421 Production, 122 Test).

### Top Test Files:
1. `src/utils/astrology/astrologicalRules.test.ts` (15 casts: 15 `as any`, 0 `as unknown as`)
2. `src/services/__tests__/syntheticProbeService.test.ts` (13 casts: 10 `as any`, 3 `as unknown as`)
3. `src/app/api/agent-forge/__tests__/ignite.route.test.ts` (9 casts: 0 `as any`, 9 `as unknown as`)
4. `src/app/api/generate-cosmic-recipe/__tests__/refundsOnFailedGeneration.test.ts` (9 casts: 0 `as any`, 9 `as unknown as`)
5. `src/components/lab/__tests__/BoundaryTransferCanvas.test.tsx` (6 casts: 0 `as any`, 6 `as unknown as`)
6. `src/app/api/tables/[tableId]/__tests__/transitions.test.ts` (5 casts: 5 `as any`, 0 `as unknown as`)

### Top Production Files:
1. `src/utils/recipeFilters.ts` (5 casts: 0 `as any`, 5 `as unknown as`)
2. `src/utils/cuisineRecommender.ts` (5 casts: 1 `as any`, 4 `as unknown as`)
3. `src/hooks/useRecipeValidation.ts` (5 casts: 0 `as any`, 5 `as unknown as`)
4. `src/hooks/usePlanetaryKinetics.ts` (5 casts: 0 `as any`, 5 `as unknown as`)

---

## 3. Strict Operating Rules

1. **`as any` must NEVER increase** (current baseline: 186).
2. **Total gated casts must strictly decrease** (current baseline: 543).
3. **Declined rules pool must not increase in aggregate** (current baseline: 6,318).
4. **0 compiler errors & 0 lint errors** at every checkpoint.
5. **Run all verification gates**:
   - `bun run typecheck`
   - `bun run lint`
   - `bun run test:fast`
   - `bun scripts/snapshot-witness.ts`
   - `bun scripts/checkNoFabricatedMonicaFallback.ts`
6. **Auto-ratchet** after each batch:
   `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet`
   — and commit the baseline in the same commit as the source that justifies it.
