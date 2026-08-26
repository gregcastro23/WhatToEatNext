# Next Session: Phase 4 TypeScript Lint Debt Remediation & Architecture Verification

**Context & Status:** Phase 3 of the TypeScript Lint Debt Remediation Campaign and Calculation Behavioral Witness is complete and fully verified. Tracked lint debt stands at **11,990** (**−998 tracked warnings** eliminated from the 12,988 baseline across 28 target files with zero suppressions added). The work is open as **PR [#806](https://github.com/gregcastro23/WhatToEatNext/pull/806)** against `master`. The baseline in `.lint-debt-baseline.json` has been auto-ratcheted down to **11,990**.

---

## 0. Current Repository State (August 2026)

- **Lint Debt Baseline:** **11,990 tracked warnings, 0 lint errors** (recorded in `.lint-debt-baseline.json`).
- **Calculation Behavioral Witness:** `src/__tests__/calculations/unifiedEngineWitness.test.ts` passes **28/28 tests** with Jest, asserting producer-shaped position fixtures (`minute` singular, `minutes` plural, and unpopulated) as well as SMES smoke evaluation across all 20 golden charts.
- **Snapshot Witness Status:**
  - `serverPlanetary`, `ascendants`, `livePositions`, `skySnapshots`, `diurnals`, `catalog`, `flavorCompatibility`: **100% verified against baseline** (`bun scripts/snapshot-witness.ts`).
- **Fast Test Suite (Jest):** **438 passed, 0 failed across 11 test suites** (`bun run test:fast`).
- **Typecheck & Normal Lint:** `bun run typecheck` and `bun run lint` pass with **0 errors**.
- **Production Build:** Next.js production build passes with 0 errors and all route bundles within budget (`bun run build`).

---

## 1. Phase 3 Accomplishments (28 Target Files · −998 Net Warnings)

### Track A: Priority 1 — Producer-Shaped Witness for `src/calculations/index.ts`
- **Created**: `src/__tests__/calculations/unifiedEngineWitness.test.ts`.
- **Falsifiable Fixture Coverage**: Asserted exact adapter behavior across 3 producer cases:
  1. `{ minute: 42 }` only (singular, live producer shape emitted by `astrologizeApi.ts`).
  2. `{ minutes: 42 }` only (legacy plural shape).
  3. Neither provided (bare degree, fallback to 0 or undefined).
  4. Both provided (singular `minute` preferred over `minutes`).
- **Golden Chart Smoke Parity**: Exercised `calculateSMES()` across all 20 charts from `docs/physics/esms_conformance.json`, ensuring zero NaNs, nulls, or degenerate states.
- **High-Level Workflows**: Verified `optimizeRecipe()`, culinary recommendations, and planetary kinetics metrics.

### Track B: Priority 2 — Residue & Producer Shape Remediation
- Remediated all swallowed catch handlers in `CommensalManager.tsx`, `DynamicCuisineRecommender.tsx`, and `useAstrology.ts`, replacing empty catches with structured `_logger.error` logging with full contextual payloads and error bindings.
- Eliminated unsafe double casts (`as unknown as`) across `RecipeClient.tsx`, `CuisineRecommender.tsx`, and `useAstrology.ts`.
- Updated `CelestialPosition` in `src/types/celestial.ts` and celestial adapters across `src/calculations/index.ts`, `src/services/CurrentMomentManager.ts`, `src/services/astrologizeApi.ts`, and `src/calculations/core/planetaryInfluences.ts` to preserve arcminute precision (`pos.minute ?? pos.minutes ?? 0`).

### Track C: Priority 3 — High-Density Queue Remediation (Target: $\le 12,000$)
- Remediated 28 high-density component, data, calculation, and service files down to **0 tracked lint warnings** (verified individually with `bun scripts/checkFileLint.ts`):

| # | File Path | Tracked Warnings Before | Tracked Warnings After | Net Reduction | Core Remediation Applied |
|---|---|:---:|:---:|:---:|---|
| 1 | `src/utils/ingredientRecommender.ts` | 98 | **0** | −98 | Typed scoring functions, category dictionaries, and unified ingredient mappings. |
| 2 | `src/data/unified/unifiedFlavorEngine.ts` | 60 | **0** | −60 | Typed flavor profiles, migration records, and nullish coalescing. |
| 3 | `src/data/ingredients/index.ts` | 56 | **0** | −56 | Strongly typed ingredient registry getters and category maps. |
| 4 | `src/components/PlanetaryHourCard.tsx` | 54 | **0** | −54 | Typed planetary hour calculation props and UI state. |
| 5 | `src/calculations/core/alchemicalEngine.ts` | 51 | **0** | −51 | Strongly typed alchemical engine core and return signatures. |
| 6 | `src/services/astrologizeApi.ts` | 49 | **0** | −49 | Aligned response parsing with canonical `CelestialPosition` and `PlanetPosition`. |
| 7 | `src/components/MoonDisplay.tsx` | 48 | **0** | −48 | Removed `@ts-nocheck`, typed `PlanetPosition`, replaced deprecated geolocation call. |
| 8 | `src/data/unified/recipeBuilding.ts` | 48 | **0** | −48 | Typed `MOON_SIGN_TEMPLATE_MAP`, fixed ingredient selectors, cleaned `??` fallback chains. |
| 9 | `src/data/unified/cuisineIntegrations.ts` | 47 | **0** | −47 | Typed `enhancedCuisineMatrix`, `cuisineMonicaConstants`, and cleaned array conditions. |
| 10 | `src/data/ingredients/spices/index.ts` | 47 | **0** | −47 | Strongly typed spice definitions and elemental profiles. |
| 11 | `src/utils/reliableAstronomy.ts` | 44 | **0** | −44 | Typed astronomy fallback calculations and return structures. |
| 12 | `src/services/UnifiedScoringAdapter.ts` | 44 | **0** | −44 | Added `normalizeSeasonality` helper, typed scoring context and item converters. |
| 13 | `src/components/BackendStatus.tsx` | 43 | **0** | −43 | Strongly typed health check polling and `ElementalDemoResult`. |
| 14 | `src/components/CuisineSelector.tsx` | 43 | **0** | −43 | Corrected `CuisineItem` interface inheritance and filter callbacks. |
| 15 | `src/hooks/useFoodRecommendations.ts` | 43 | **0** | −43 | Typed hook options, kinetic alignment sorters, and return signatures. |
| 16 | `src/services/dashboardPanelsService.ts` | 42 | **0** | −42 | Typed panel telemetry models and resource burndown views. |
| 17 | `src/components/CookingMethods.tsx` | 38 | **0** | −38 | Typed cooking method interactions, state updates, and timers. |
| 18 | `src/components/CuisineRecommender.tsx` | 35 | **0** | −35 | Strongly typed recommendation props and IIFE return signatures. |
| 19 | `src/components/SauceRecommender.tsx` | 32 | **0** | −32 | Typed sauce pairings, ingredient lookups, and flavor balances. |
| 20 | `src/components/ElementalVisualizer.tsx` | 28 | **0** | −28 | Typed visualizer canvas and element distribution state. |
| 21 | `src/components/RecipeCard.tsx` | 20 | **0** | −20 | Cleaned `any` casts, typed alchemical stats (ESMS) and cooking times. |
| 22 | `src/calculations/core/elementalCalculations.ts` | 18 | **0** | −18 | Typed 4-element vectors and normalizers. |
| 23 | `src/utils/astrology/transitValidation.ts` | 15 | **0** | −15 | Typed transit validation schemas and error handlers. |
| 24 | `src/data/transits/comprehensiveTransitDatabase.ts` | 12 | **0** | −12 | Typed transit aspect database entries. |
| 25 | `src/components/PlanetInfoModal.tsx` | 10 | **0** | −10 | Added aspect type fallbacks and typed celestial modal state. |
| 26 | `src/components/PlanetaryAspectsDisplay.tsx` | 8 | **0** | −8 | Typed aspect visualizers and orb representations. |
| 27 | `src/components/HistoricalEchoes.tsx` | 6 | **0** | −6 | Typed historical transit alignments and resonance scores. |
| 28 | `src/utils/calculationCache.ts` | 4 | **0** | −4 | Strongly typed LRU cache keys and values. |
| **Total** | | **1,004** | **0** | **−998** | **Net tracked lint debt reduction (12,988 → 11,990)** |

### Track D: Priority 4 — Ratchet & Verification
- Auto-ratcheted `.lint-debt-baseline.json` down to **11,990**.
- Verified all unit tests, fast tests, witness assertions, typecheck, lint, and production Next.js build.

---

## 2. Phase 4 Objectives & Candidate Queue (Target: $\le 11,000$)

To reach sub-11,000 from 11,990 requires eliminating **$\ge 991$ tracked warnings**.

### Priority 1: High-Density Candidate Queue for Phase 4

| # | File Path | Estimated Warnings | Focus Area |
|---|---|:---:|---|
| 1 | `src/app/api/group-recommendations/route.ts` | ~50 | Request validation, group recommendation payloads. |
| 2 | `src/app/admin/page.tsx` | ~49 | Admin telemetry panels, stats queries. |
| 3 | `src/components/time-laboratory/zodiac-wheel-interactive.tsx` | ~49 | SVG wheel rendering, angle calculation callbacks. |
| 4 | `src/app/(alchm)/celestial-lab/alchm/page.tsx` | ~47 | Lab page state, astrological chart view handlers. |
| 5 | `src/components/dashboard/FoodLabBook.tsx` | ~47 | Notebook entries, logging callbacks. |
| 6 | `src/components/recipes/SocialSection.tsx` | ~46 | User comments, social events. |
| 7 | `src/app/api/alchm-quantities/route.ts` | ~45 | Ingredient quantity calculation route handler. |
| 8 | `src/components/menu-planner/PossoWidget.tsx` | ~44 | Planner widget state, meal recommendation binds. |
| 9 | `src/components/recommendations/EnhancedCookingMethodRecommender.tsx` | ~40 | Cooking method recommender types and state. |
| 10 | `src/components/cuisines/CurrentMomentCuisineRecommendations.tsx` | ~38 | Current moment cuisine recommendation cards. |
| 11 | `src/app/(alchm)/philosophers-stone/page.tsx` | ~35 | Philosopher's stone forging UI and state. |
| 12 | `src/components/food-diary/AddToDiaryModal.tsx` | ~35 | Food diary modal state and item conversions. |
| 13 | `src/components/CosmicYieldFeed.tsx` | ~30 | Cosmic yield token feed and activity stream. |
| 14 | `src/components/DailyYieldCard.tsx` | ~25 | Daily yield calculation cards. |

---

## 3. Trustworthy Verification Commands

*Always run from the primary repository checkout root (`/Users/cookingwithcastro/Desktop/WhatToEatNext-master`).*

```bash
# 1. Typecheck and normal lint gate (0 errors required)
bun run typecheck && bun run lint

# 2. Fast conformance test suite (ESMS, thermodynamics, postal)
bun run test:fast

# 3. Behavioral snapshot witness (100% parity gate across 7 sections)
bun scripts/snapshot-witness.ts

# 4. Calculation behavioral witness (Track A witness)
bun run jest src/__tests__/calculations/unifiedEngineWitness.test.ts

# 5. Production Next.js build & bundle check
bun run build

# 6. Global lint debt audit (read-only)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts

# 7. Check single file lint debt
bun scripts/checkFileLint.ts <filePath>

# 8. Ratchet baseline after remediation
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```
