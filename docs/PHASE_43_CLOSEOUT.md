# Phase 43 Closeout — Domain Loose Optionality, Bare JSON Casts, Assertion Sites, Scripts Typecheck

**Date:** 2026-09-30  
**Base:** `master` @ `b600020a`  
**Branch:** `codex/phase-43-domain-loose-optionality`  

Phase 43 met or exceeded all four target acceptance ceilings while incorporating all five review amendments from [Phase 43 Plan Review](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/docs/PHASE_43_PLAN_REVIEW.md).

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

All relevant baseline files (`.loose-optionality-baseline.json`, `.bare-json-baseline.json`, `.scripts-typecheck-baseline.json`, `.single-assertion-sites.json`, `.non-null-assertions.json`, `.lint-debt-baseline.json`) were updated and committed.

---

## 2. Review Amendments Implemented

1. **Quantile Fix (`scripts/backfillMonicaPerConstruction.ts`):**
   - Indexed access under `noUncheckedIndexedAccess` remains `number | undefined` even after array length checks. Read the quantile index into a local, throw if `undefined`, and explicitly return `: number`.
   - Handled empty `ratios` at reporting call site (`scripts/backfillMonicaPerConstruction.ts:208`). If non-zero ratio filtering yields an empty list, log that no ratios are available instead of throwing or aborting an otherwise valid migration run.
2. **Derived Celestial Lab Balance Schema (`src/lib/validation/accountResponseSchemas.ts`):**
   - Preserved the existing `EconomyBalanceResponseSchema` contract (validating only the 4 balances, matching the S2S endpoint and shared readers `MenuOrderClient` and `McpTopUpPanel`).
   - Defined a separate `CelestialLabBalanceResponseSchema` requiring `success`, `streak`, `canClaimDaily`, and full `TokenBalancesSchema`. Drift-guarded compile-time against `BalanceApiResponse`.
3. **Monica Endpoint Deferral (`src/app/(alchm)/philosophers-stone/page.tsx:286`):**
   - Confirmed the page calls `/api/monica-agent` (which does not exist in local routes, and Next.js rewrites were removed).
   - Intentionally deferred converting this 1 cast rather than inventing a speculative schema. The remaining 12 production cast removals achieved the exact target ceiling of 85.
4. **Ingredient Fallback Keys Construction (`src/app/api/ingredients/[name]/route.ts` & `src/server/hono-api.ts`):**
   - The missing-recipe fallback objects omitted `description`, `prepTime`, `cookTime`, and `servings`.
   - Converted the domain contracts to required `T | undefined` by explicitly constructing those 4 keys with `undefined` in both fallback paths. Existing servings calculations were left intact.
5. **Parse-Failure & Mutation Behavior (`safeReadJson` with `parse`):**
   - Passed `{ parse }` across all 12 eliminated sites to prevent unvalidated casts under `check:read-json`.
   - Distinguished table action / agent creation responses from unreadable responses: preserved existing state on refresh failures (`data?.success` guard) rather than wiping lists or fabricating zero balances.
   - Added round-trip and error recovery tests in `accountResponseSchemas.test.ts` and `boundaryValidationSchemas.test.ts`.

---

## 3. Workstreams & Commits

### Step 0: Baseline Drift Banking (`f847a0c4`)
- `chore(ratchet): bank baseline improvements from master (#904-#925)`
- Banked upstream improvements into baseline files: lint debt 1,304 → 1,293, assertion sites 2,889 → 2,857, non-null assertions 599 → 598.

### Workstream D: Scripts Typecheck 9 → 0 (`c51fd407`)
- `feat(phase-43): scripts typecheck 9 -> 0 without invented fallbacks`
- Resolved all 9 errors across 6 scripts with defensive guards and type narrowing:
  - `scripts/auditIngredients.ts`: Guarded AST argument length for `Math.pow(base, exp)`.
  - `scripts/backfillHscaElementalProperties.ts`: Typed fallback sign mapping and guarded sign property lookup.
  - `scripts/backfillMonicaPerConstruction.ts`: Guarded indexed access for `q()`, explicit `: number` return, and handled empty `ratios` reporting.
  - `scripts/checkNoStrayKalchmFormula.ts`: Guarded lookahead token indexing.
  - `scripts/generate-cuisine-images.ts`: Typed cuisine image catalog lookup.
  - `scripts/generate-esms-baseline.ts`: Typed recipe loop indexing.
- Ratcheted `.scripts-typecheck-baseline.json` to 0.

### Workstream A: Domain Loose Optionality 132 → 106 (`04e954ef`)
- `feat(phase-43): domain loose optionality 132 -> 106`
- Eliminated 26 loose optionality sites across 4 domain files:
  - `src/app/api/planetary-recommendations/route.ts` (−8): Fields required `T` (guaranteed by query parser).
  - `src/lib/api/alchemicalApiClient.ts` (−5): Cleaned optional parameter definitions (`?: T` instead of `?: T | undefined`).
  - `src/app/api/ingredients/[name]/route.ts` (−9): Converted to required `T | undefined` with 4 explicit fallback keys.
  - `src/server/hono-api.ts` (−4): Converted to required `T | undefined` with 4 explicit fallback keys.
- Ratcheted `.loose-optionality-baseline.json` domain count to 106.

### Workstream B: Bare JSON Casts 97 → 85 (`a661d26e`)
- `feat(phase-43): bare json casts 97 -> 85 via validated response schemas`
- Added schemas:
  - `src/lib/validation/commensalResponseSchemas.ts`: `CommensalsListResponseSchema` (matching actual `manualCompanions` wire payload).
  - `src/lib/validation/accountResponseSchemas.ts`: `CelestialLabBalanceResponseSchema`.
  - `src/lib/validation/agentResponseSchemas.ts`: `UnifiedAgentChatResponseSchema`, `UnifiedAgentCreateResponseSchema`.
- Replaced 12 bare casts with `safeReadJson(..., { parse })`:
  - `PhotoGrid.tsx` (1)
  - `LifecycleControls.tsx` (1)
  - `InvitePanel.tsx` (3)
  - `MembersPanel.tsx` (1)
  - `tables/[tableId]/page.tsx` (2)
  - `celestial-lab/alchm/page.tsx` (2)
  - `philosophers-stone/page.tsx` (2)
- Added boundary tests in `accountResponseSchemas.test.ts` and `boundaryValidationSchemas.test.ts`.
- Ratcheted `.bare-json-baseline.json` production count to 85, total to 94.

### Workstream C: Fruit Demo Deletion (−30 Assertions) (`49b4d673`)
- `feat(phase-43): remove dead fruit demonstration block (-30 assertions)`
- Removed lines 27–42 and 1426–1632 in `src/data/ingredients/fruits/index.ts`.
- Verified exported `fruits` SHA-256 hash match before and after deletion (`e9cbdede6eeff05a866a5d6a7ae75ff8ba096fd5b0ce1e8f7ad4e1fdc08d786a`).
- Ratcheted `.single-assertion-sites.json` from 2,857 to 2,827 (−30 single assertion sites).

---

## 4. Verification Evidence

- **Static Verification (`bun run verify:static`):** ✅ PASSED (all 13 gates green).
- **Unit Test Suite (`bun run test --passWithNoTests`):** ✅ PASSED (505/505 test suites, 5,181 tests passed).
- **Production Build (`bun run build`):** ✅ PASSED (routes and bundle budgets within thresholds).
