# Phase 43 Closeout — Domain Loose Optionality, Bare JSON Casts, Assertion Sites, Scripts Typecheck

**Date:** 2026-09-30  
**Base:** `master` @ `b600020a`  
**Branch:** `codex/phase-43-domain-loose-optionality`  

Phase 43 met or exceeded all target acceptance ceilings while fully incorporating all five review amendments from [Phase 43 Plan Review](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/PHASE_43_PLAN_REVIEW.md) and addressing all spec, response-handling, and inventory feedback.

---

## 1. Results Summary

| Metric | Phase 42 Baseline | Drift-Banked Baseline (Step 0) | Phase 43 Ceiling | Measured Final | Status | Delta |
|---|---:|---:|---:|---:|:---:|---:|
| **Domain loose optionality** (`?: T \| undefined`) | 133 | 132 | ≤ 115 | **106** | ✅ | −26 |
| **Wire loose optionality** (allowlisted) | 89 | 89 | ≤ 89 | **89** | ✅ | 0 (held) |
| **Bare JSON casts, production** | 97 | 97 | ≤ 85 | **85** | ✅ | −12 |
| **Bare JSON casts, total** | 106 | 106 | ≤ 94 | **94** | ✅ | −12 |
| **Scripts typecheck errors** | 9 (6 files) | 9 (6 files) | ≤ 3 | **0 (0 files)** | ✅ | −9 |
| **Single assertion sites** | 2,889 | 2,857 | ≤ 2,850 | **2,827** | ✅ | −30 |
| **Non-null assertions** | 599 | 598 | ≤ 598 | **598** | ✅ | 0 (held) |
| **Tracked lint debt** | 1,304 | 1,293 | ≤ 1,293 | **1,293** | ✅ | 0 (held) |
| **Unvalidated `safeReadJson` calls** | 0 | 0 | 0 | **0** | ✅ | 0 (held) |

Committed baseline files were ratcheted: `.bare-json-casts-baseline.json` (85 prod / 94 total), `.scripts-typecheck-baseline.json` (0 errors), and `.lint-debt-baseline.json` (1,293). Scanner-measured gates were verified against their respective ceilings: domain loose optionality (106 ≤ 115), wire loose optionality (89 ≤ 89), single assertion sites (2,827 ≤ 2,850 via `check:diff-assertions`), non-null assertions (598 ≤ 598), and unvalidated `safeReadJson` calls (0 via `check:read-json`).

---

## 2. Review Amendments & Response-Handling Enhancements

1. **Quantile Safeguards & Non-Zero Ratios (`scripts/backfillMonicaPerConstruction.ts`):**
   - Under `noUncheckedIndexedAccess`, indexed access returns `number | undefined`. Read the quantile index into a local, throw a descriptive error if `undefined`, and explicitly return `: number`.
   - Handled empty `ratios` at the reporting site (`scripts/backfillMonicaPerConstruction.ts:208`). If non-zero ratio filtering yields an empty list, logs that no non-zero ratios are available rather than throwing or aborting. Exercised by dedicated unit tests.
2. **Derived Celestial Lab Schemas & Drift Prevention (`src/lib/validation/accountResponseSchemas.ts`):**
   - Refactored `CelestialLabTokenBalancesSchema` to extend `CoinAmountsSchema` directly (`CoinAmountsSchema.extend({...})`), eliminating field duplication and preventing schema drift.
   - Preserved `EconomyBalanceResponseSchema` contract for server-to-server readers (`MenuOrderClient`, `McpTopUpPanel`).
   - Added `CelestialLabQuantitiesResponseSchema` defining a consumed-fields view of `/api/alchm-quantities` (quantities, diurnal sect, thermodynamic metrics, kalchm/monica, momentum, degraded reasons) while passing through unrelated structural blocks (`circuit`, `kinetics`, `vectorCircuit`).
3. **Monica Endpoint Deferral (`src/app/(alchm)/philosophers-stone/page.tsx:286`):**
   - Confirmed `/api/monica-agent` is an external endpoint without a local route. Safely deferred converting this single cast rather than inventing a speculative schema, while still achieving the target production ceiling of 85.
4. **Shared Ingredient Fallback Types (`src/types/ingredient.ts`, `src/app/api/ingredients/[name]/route.ts`, `src/server/hono-api.ts`):**
   - Exported `RelatedIngredientRecipe` in `src/types/ingredient.ts` as the shared contract across the Next.js API route and Hono server.
   - Both routes explicitly construct all 4 fallback keys (`description`, `prepTime`, `cookTime`, `servings`) with `undefined` when recipe data is not loaded in memory.
   - Verified wire serialization parity across populated and missing-recipe fixtures.
5. **Mutation Ambiguity, Refresh Visibility & Recovery Test Suite:**
   - **Mutation Ambiguity:** On unreadable 2xx replies, `LifecycleControls.tsx` and `philosophers-stone/page.tsx` distinguish unverified 2xx responses from explicit server rejections, triggering state reconciliation (`onChanged?.()`) and warning the user rather than inviting a blind retry (which could generate duplicate agents or repeat table transitions).
   - **Refresh Visibility:** `celestial-lab/alchm/page.tsx` and `InvitePanel.tsx` log 2xx validation failures via `_logger.warn` and surface unavailable states (`economyError` and `companionsUnavailable`) while preserving prior good state.
   - **Consumer Recovery Tests:** Added `src/lib/validation/__tests__/phase43ConsumerRecovery.test.ts` (16 passing tests) covering unreadable 2xx table actions and agent creations, degraded quantities and chat, populated vs missing ingredient fallback serialization parity across Next and Hono, and script quantile safeguards.

---

## 3. Workstreams & Commits

### Step 0: Baseline Drift Banking (`f847a0c4`)
- `chore(ratchet): bank baseline improvements from master (#904-#925)`
- Banked upstream improvements into baseline files: lint debt 1,304 → 1,293, assertion sites 2,889 → 2,857, non-null assertions 599 → 598.

### Workstream D: Scripts Typecheck 9 → 0 (`c51fd407`)
- `feat(phase-43): scripts typecheck 9 -> 0 without invented fallbacks`
- Resolved all 9 errors across 6 scripts with defensive guards and type narrowing:
  - `scripts/checkNoStrayKalchmFormula.ts`: Guarded AST argument length for `Math.pow(base, exp)`.
  - `scripts/auditIngredients.ts`: Guarded `rel[0]` array access from `split()`.
  - `scripts/backfillHscaElementalProperties.ts`: Typed fallback sign mapping and guarded sign property lookup.
  - `scripts/backfillMonicaPerConstruction.ts`: Guarded indexed access for `q()`, explicit `: number` return, and handled empty `ratios` reporting.
  - `scripts/generate-cuisine-images.ts`: Typed cuisine image catalog lookup.
  - `scripts/generate-esms-baseline.ts`: Typed recipe loop indexing.
- Ratcheted `.scripts-typecheck-baseline.json` to 0.

### Workstream A: Domain Loose Optionality 132 → 106 (`04e954ef`)
- `feat(phase-43): domain loose optionality 132 -> 106`
- Eliminated 26 loose optionality sites across domain files:
  - `src/app/api/planetary-positions/route.ts` (−8): Converted loose optionality parameters to exact types.
  - `src/services/AlchemicalApiClient.ts` (−5): Cleaned optional parameter definitions.
  - `src/lib/tables/venueGeo.ts` (−4): Converted loose optionality definitions.
  - `src/utils/recipe/batchEnrichment.ts` (−1): Converted loose optionality definitions.
  - `src/app/api/ingredients/[name]/route.ts` (−6): Adopted shared `RelatedIngredientRecipe` type with explicit fallback keys.
  - `src/server/hono-api.ts` (−2): Adopted shared `RelatedIngredientRecipe` type with explicit fallback keys.

### Workstream B: Bare JSON Casts 97 → 85 (`a661d26e`)
- `feat(phase-43): bare json casts 97 -> 85 via validated response schemas`
- Added schemas:
  - `src/lib/validation/commensalResponseSchemas.ts`: `CommensalsListResponseSchema` (matching actual `manualCompanions` wire payload).
  - `src/lib/validation/accountResponseSchemas.ts`: `CelestialLabBalanceResponseSchema`, `CelestialLabQuantitiesResponseSchema`.
  - `src/lib/validation/agentResponseSchemas.ts`: `UnifiedAgentChatResponseSchema`, `UnifiedAgentCreateResponseSchema`.
- Replaced 12 bare casts with `safeReadJson(..., { parse })`:
  - `PhotoGrid.tsx` (1)
  - `LifecycleControls.tsx` (1)
  - `InvitePanel.tsx` (3)
  - `MembersPanel.tsx` (1)
  - `tables/[tableId]/page.tsx` (2)
  - `celestial-lab/alchm/page.tsx` (2)
  - `philosophers-stone/page.tsx` (2)
- Added boundary and consumer recovery tests in `accountResponseSchemas.test.ts`, `boundaryValidationSchemas.test.ts`, and `phase43ConsumerRecovery.test.ts`.
- Ratcheted `.bare-json-casts-baseline.json` production count to 85, total to 94.

### Workstream C: Fruit Demo Deletion (−30 Assertions) (`49b4d673`)
- `feat(phase-43): remove dead fruit demonstration block (-30 assertions)`
- Removed lines 27–42 and 1426–1632 in `src/data/ingredients/fruits/index.ts`.
- Verified exported `fruits` SHA-256 hash match before and after deletion (`e9cbdede6eeff05a866a5d6a7ae75ff8ba096fd5b0ce1e8f7ad4e1fdc08d786a`).
- Verified assertion site reduction from 2,857 to 2,827 (−30 single assertion sites).

---

## 4. Verification Evidence

- **Static Verification (`bun run verify:static`):** ✅ PASSED (all 13 gates green).
- **Unit Test Suite (`bun run test --passWithNoTests`):** ✅ PASSED (506/506 test suites, 5,197 tests passed).
- **Production Build (`bun run build`):** ✅ PASSED (routes and bundle budgets within thresholds).
