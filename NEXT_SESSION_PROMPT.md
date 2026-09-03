# Next Session: Phase 18 — Unsafe Operations & Cast Decimation (Wave 2)

> **Status of Phase 17:** Complete, reviewed, verified, and committed on `feat/phase-17-cast-decimation-pnc`.
> - **Tracked Lint Debt:** Reduced from **2,889 → 2,885 (−4 debt warnings)**.
> - **Sub-Baseline (`prefer-nullish-coalescing`):** Slashed from **420 → 398 (−22 warnings eradicated across the Deferred Four)**:
>   - `src/components/nutrition/NutritionFilters.tsx`: −6 PNC (6 → 0)
>   - `src/app/(alchm)/tables/[tableId]/`: −6 PNC (6 → 0)
>   - `src/app/restaurants/[id]/menu/`: −5 PNC (5 → 0)
>   - `src/app/api/stripe/restaurant-order/`: −5 PNC (5 → 0)
> - **Type Casts Total:** Slashed from **317 → 279 (−38 casts eradicated)**:
>   - `as any`: **78**
>   - `as unknown as`: **239 → 201 (−38 eliminated)**
>   - Production casts: **262 → 241 (−21 eliminated across 7 production files)**
>   - Test casts: **55 → 38 (−17 eliminated across 3 test files)**
> - **Assertion Sites (AST):** Reduced from **4,468 → 4,430 (−38 sites eradicated)**:
>   - Chained sites: **239 → 201 (−38)**
>   - Production sites: **3,833 → 3,809 (−24)**
>   - Test sites: **635 → 621 (−14)**
> - **Characterisation Test Coverage:** Authored 4 comprehensive test suites (34 tests, 100% passing) pinning runtime semantics before remediation:
>   - `NutritionFilters.characterisation.test.ts` (14 tests)
>   - `appUrl.characterisation.test.ts` (6 tests)
>   - `restaurantOrderNormalization.characterisation.test.ts` (5 tests)
>   - `venueLabel.characterisation.test.ts` (9 tests)
> - **Declined Rules Pool:** Held strictly at **6,356 (0 regressions)**.
> - **Compiler & Gate Suite:** `bun run typecheck` (0 errors), `bun run strict-index:check` (0 errors), `bun run test:gates` (50/50 passing), `bun run test:fast` (494/494 passing), `bun run verify` (green end-to-end).
>
> ℹ️ **Sequence Note:** Phase 18 immediately succeeds Phase 17. All 5 tranches committed atomically across 5 commits (`2b08b8f3`, `65fb963d`, `e73e679e`, `3f8119d0`, `34be8140`).

---

## 0. Repository State — Measured Ground Truth

All values verified live on branch `feat/phase-17-cast-decimation-pnc`.

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Strict index errors** | `0` across `0` files | `bun run strict-index:check` | ✅ Verified |
| **`noUncheckedIndexedAccess`** | **`true`, enforcing** | `tsconfig.json:14` | ✅ Live |
| **Compiler errors (flag on)** | `0` | `bun run typecheck` | ✅ Clean |
| **Normal lint errors / warnings** | `0` / `12` | `bun run lint` | ✅ Clean |
| **Full verify** | exit `0` | `bun run verify` | ✅ Verified |
| **Fast test suite** | `19 suites / 494 tests` | `bun run test:fast` | ✅ 100% Passing |
| **Gate self-integrity tests** | `3 suites / 50 tests` | `bun run test:gates` | ✅ 100% Passing |
| **Characterisation tests** | `4 suites / 34 tests` | `bun jest *.characterisation` | ✅ 100% Passing |
| **Tracked lint debt** | `2,885` vs baseline `2,885` | `bun run lint:debt` | 🟢 **GREEN (−4 in Phase 17; total 2,933 → 2,885 −48)** |
| **Declined rules pool** | `6,356` vs baseline `6,356` | same | 🟢 **GREEN (Held steady at 0 regressions)** |
| — `max-lines` | `661` | same | 🟢 Preserved |
| — `max-lines-per-function` | `2,127` | same | 🟢 Preserved |
| — `no-void` | `454` | same | 🟢 Preserved (.catch pattern) |
| **Sub-baseline: `prefer-nullish-coalescing`** | `398` vs sub-baseline `398` | same | 🟢 **GREEN (−22 in Phase 17; 692 → 398 total −294)** |
| **Gated cast surface** | `279` total (`78` as any, `201` as unknown as) | `bun run lint:debt --top-casts 5` | 🟢 **GREEN (−38 casts: −21 prod, −17 test)** |
| — Production / Test | `241` (63 any, 178 unk) / `38` (15 any, 23 unk) | same | 🟢 **Production casts down 262 → 241!** |
| **Assertion sites (AST)** | `4,430` vs baseline `4,430` | same | 🟢 **GREEN (−38 sites: −24 prod, −14 test)** |
| — Production / Test | `3,809` / `621` | same | 🟢 Production sites down 3,833 → 3,809 |
| — Monitored | `645` `as const`, `659` non-null `!` | same | ⚪ Monitored |
| **Strict-index allowlist** | `0` entries (retired) | `.strict-index-baseline.json` | 🟢 Clean |

---

## 1. Retrospective: Phase 17

### 1.1 Scorecard

| Milestone | Stated Goal | Result | Verdict |
|---|---|:---:|:---:|
| **Tranche 1: Test-File Cast Decimation** | Eliminate 17 chained casts across 3 top test files | **17 casts eliminated** (`ignite.route.test.ts`, `BoundaryTransferCanvas.test.tsx`, `refundsOnFailedGeneration.test.ts`) | 🟢 Exact Hit |
| **Tranche 2: Production Cast Decimation** | Eliminate 21 chained casts across seven 3-cast files | **21 production casts eliminated** (`recipes.ts`, `astrologyApi.ts`, `celestialCalculations.ts`, `chakraRecipeEnhancer.ts`, `CurrentMomentCuisineRecommendations.tsx`, `naturalLanguageProcessor.ts`, `data/processing.ts`) | 🟢 Exact Hit |
| **Tranche 3: Characterisation Suites** | Author characterisation suites for the Deferred Four | **4 suites / 34 unit tests authored**, pinning all edge cases | 🟢 Exceeded |
| **Tranche 4: PNC Semantic Resolution** | Remediate all 22 PNC sites in Deferred Four | **22 PNC sites eradicated** (PNC sub-baseline dropped 420 → 398; tracked debt dropped 2889 → 2885) | 🟢 Exact Hit |
| **Tranche 5: Monotonic Ratchet** | Lock in all metrics with 0 regressions | **Tracked: 2885 (−4), PNC: 398 (−22), Casts: 279 (−38), Sites: 4430 (−38)** | 🟢 All Ratcheted |

### 1.2 Architectural Highlights of Phase 17

1. **Top Production Cast Invariant:**
   - There are now **zero** production files in the repository with 3 or more gated casts. The maximum gated cast count in any production file is now 2.
2. **Decoupled Route Helpers:**
   - In Next.js App Router, `page.tsx` and `route.ts` enforce strict type checking on named exports via `next typegen`. By extracting helper functions into sibling `helpers.ts` modules (`src/app/restaurants/[id]/menu/helpers.ts`, `src/app/api/stripe/restaurant-order/helpers.ts`, `src/app/(alchm)/tables/[tableId]/helpers.ts`), we achieved pure testability with zero Next.js typegen friction.
3. **PNC Falsy-Fallback Preservation:**
   - Instead of mechanically converting `||` to `??` (which would have introduced silent runtime bugs where empty strings `""` or numbers `0` bypass fallback defaults), explicit semantic checks (`trimmed && trimmed.length > 0 ? trimmed : fallback`, `itemSubtotalCents > 0 ? itemSubtotalCents : fallback`) preserved 100% of business requirements while satisfying `@typescript-eslint/prefer-nullish-coalescing`.

---

## 2. Phase 18 Strategic Blueprint: Unsafe Operations & Cast Decimation (Wave 2)

### 2.1 Remaining Gated Casts (Top Targets)

The cast surface now stands at **279 total (78 `as any`, 201 `as unknown as`)**:

#### Top Test Files (6 casts):
1. `src/__tests__/recipe/recipeAutoFixer.test.ts` (3 casts: 3 `as any`)
2. `src/__tests__/fallbackMetricsDerivation.test.ts` (3 casts: 3 `as unknown as`)

#### Top Production Files (12 casts):
1. `src/contexts/menu-planner/useMealSlots.ts` (2 casts: 2 `as unknown as`)
2. `src/app/ingredients/IngredientsExplorer.tsx` (2 casts: 2 `as unknown as`)
3. `src/app/api/commensal/companions/route.ts` (2 casts: 2 `as unknown as`)
4. `src/app/api/commensals/accept/route.ts` (2 casts: 2 `as any`)
5. `src/app/api/admin/users/[userId]/route.ts` (2 casts: 2 `as any`)
6. `src/app/api/menu-planner/menus/route.ts` (2 casts: 2 `as unknown as`)

### 2.2 Unsafe Operations & Debt Concentration

The largest tracked debt pools remaining in `.lint-debt-baseline.json`:
- `@typescript-eslint/no-unnecessary-condition`: 1,288
- `@typescript-eslint/prefer-nullish-coalescing`: 398 (down from 692)
- `@typescript-eslint/no-unsafe-assignment`: 323
- `@typescript-eslint/no-unsafe-member-access`: 304
- `@typescript-eslint/no-explicit-any`: 216
- `@typescript-eslint/no-unsafe-argument`: 105
- `@typescript-eslint/no-unsafe-return`: 56
- `@typescript-eslint/no-unsafe-call`: 40

---

## 3. Recommended Phase 18 Execution Plan

1. **Tranche 1: Test Cast Eradication (6 casts):**
   - Remediate `src/__tests__/recipe/recipeAutoFixer.test.ts` (3 `as any`).
   - Remediate `src/__tests__/fallbackMetricsDerivation.test.ts` (3 `as unknown as`).
2. **Tranche 2: Production Cast Eradication (12 casts across 6 files):**
   - Remediate `useMealSlots.ts`, `IngredientsExplorer.tsx`, `companions/route.ts`, `accept/route.ts`, `users/[userId]/route.ts`, `menus/route.ts`.
3. **Tranche 3: High-Yield Unsafe Operations Clean-up:**
   - Target concentrated `@typescript-eslint/no-unsafe-argument` and `@typescript-eslint/no-unsafe-assignment` sites in core services.
4. **Tranche 4: Low-Risk PNC UI Tail (Optional Wave):**
   - Remediate ~20 simple UI boolean/string fallback sites in components where types are well-defined.
5. **Tranche 5: Monotonic Ratchet & Gate Verification:**
   - Run `bun scripts/checkLintDebt.ts --ratchet` and `bun run verify`.
