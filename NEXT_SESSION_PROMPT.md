# Next Session: Phase 3 TypeScript Lint Debt Remediation & Core Calculation Witnesses

**Context & Status:** Phase 2 of the TypeScript Lint Debt Remediation Campaign and Solana Mainnet Read Sync (ADR-014) is committed on `feat/wten-solana-sync-p2-lint-remediation` (`18d3ced0`) and open as **PR [#805](https://github.com/gregcastro23/WhatToEatNext/pull/805)** against `master` (after PR [#804](https://github.com/gregcastro23/WhatToEatNext/pull/804) was merged in `11043027`). Tracked lint debt has been reduced from **13,942** down to **12,988** (**−954 tracked warnings** eliminated across 13 target files with zero suppressions and all latent defects resolved).

---

## 0. Current Repository State (August 2026)

- **Branch & PR:** `feat/wten-solana-sync-p2-lint-remediation` (PR [#805](https://github.com/gregcastro23/WhatToEatNext/pull/805) open against `master`).
- **Lint Debt Baseline:** **12,988 tracked warnings, 0 lint errors** (recorded in `.lint-debt-baseline.json`).
- **Snapshot Witness Status:**
  - `serverPlanetary`, `ascendants`, `livePositions`, `skySnapshots`, `diurnals`, `catalog`, `flavorCompatibility` (7 sections): **100% verified against baseline** (`bun scripts/snapshot-witness.ts`).
- **Unit Test Suite (Jest):** **3,193 passed, 0 failed, 10 skipped across 296 test suites** (`bun run test` from repo root).
- **Production Build:** Next.js build passes with 0 errors and all route bundles within budget (`bun run build`).

---

## 1. Phase 2 Accomplishments (13 Target Files · −954 Net Warnings)

### Track A: Solana Mainnet Sync & Custody Boundary Assertion (ADR-014)
- **Committed**: `132a3c9e` on `feat/wten-solana-sync-p2-lint-remediation`.
- **ADR-014 Published**: Documented immutable custody boundaries (K2/K3 custody isolation, server-side read-only cluster sync).
- **Cluster Verifier**: Shipped `scripts/verify-solana-cluster.ts` with 15s RPC timeout, cluster genesis check, and fail-loud offline behavior.

### Track B: Phase 2 Lint Debt Remediation
- **Committed**: `4e699e05` & `18d3ced0`.
- Remediated 13 primary component and calculation files to **0 tracked warnings**:

| # | File Path | Warnings Before | Warnings After | Dominant Focus |
|---|---|:---:|:---:|---|
| 1 | `src/components/recipe/CosmicRecipeGenerator.tsx` | 114 | **0** | Typed recipe generator state, nullish coalescing, nutritionalOptimization defaults. |
| 2 | `src/app/recipes/[recipeId]/RecipeClient.tsx` | 105 | **0** | Cleaned component state, mapped optional chained reason fields. |
| 3 | `src/hooks/useAstrology.ts` | 83 | **0** | Strongly typed hook returns; safe astrology calculation bindings. |
| 4 | `src/components/dashboard/CommensalManager.tsx` | 76 | **0** | Typed companion lobby state and search handler responses. |
| 5 | `src/components/home/DynamicCuisineRecommender.tsx` | 69 | **0** | Typed dynamic cuisine recommendations and API response mapping. |
| 6 | `src/components/CuisineRecommender.tsx` | 69 | **0** | Strongly typed recommendation props, IIFE return signatures. |
| 7 | `src/services/feedDatabaseService.ts` | 68 | **0** | Typed database row mappings, table memories, and feed events. |
| 8 | `src/calculations/index.ts` | 67 | **0** | Typed SMES calculation engine, kinetics, and astrological state mapping. |
| 9 | `src/app/(alchm)/feed/page.tsx` | 66 | **0** | Mapped LiveFeedEvent and TableMemoryPayload unions. |
| 10 | `src/components/menu-planner/WeeklyCalendar.tsx` | 64 | **0** | Defensively chained weekly nutrition and meal slot callbacks. |
| 11 | `src/contexts/menu-planner/MenuPlannerProvider.tsx` | 60 | **0** | Typed weekly menu persistence and debounced auto-persist effects. |
| 12 | `src/app/api/agents/unified/route.ts` | 57 | **0** | Structured agent payload transforms and query parameter checks. |
| 13 | `src/app/api/agent-forge/ignite/route.ts` | 55 | **0** | Validated ignite JSON request bodies and persona ignition logic. |
| 14 | `src/types/recipe.ts` | — | **0** | Extracted `IngredientAlchemicalSummary` named interface. |

---

## 2. Latent Defect Remediation & Quality Audit (`18d3ced0`)

A post-remediation audit identified and eliminated 3 mechanical defect patterns introduced by lint compliance:

1. **Swallowed Catch Handlers Remediated**:
   - Replaced silent `.catch(() => undefined)` and `.catch(() => {})` handlers across `WeeklyCalendar.tsx`, `MenuPlannerProvider.tsx`, `feed/page.tsx`, `CommensalManager.tsx`, `CuisineRecommender.tsx`, and `useAstrology.ts` with structured error logging (`_logger.error` / `logger.error`).
2. **Type Blindfolds Eliminated in Core Alchemy Engine**:
   - Replaced 5 `as unknown as Parameters<typeof f>[0]` and `as unknown as Recipe` double casts in `src/calculations/index.ts` with explicit, strongly-typed adapters (`toRealAlchemizePositions`, `toAlchemyPlanetaryPositions`, `toAstrologyUtilsPlanetPositions`, `toZodiacSign`).
3. **Production Alert Visibility Restored**:
   - In `DynamicCuisineRecommender.tsx` and `CosmicRecipeGenerator.tsx`, replaced `_logger.warn` calls (which `@/lib/logger` suppresses in production) with `_logger.error` to retain production visibility over silent fallbacks and mint quote failures.

---

## 3. Phase 3 Objectives & Roadmap (Target: $\le 12,000$)

To reach sub-12,000 from 12,988 requires eliminating **$\ge 989$ tracked warnings**.

### Priority 1: Targeted Behavioral Witness for `src/calculations/index.ts`
Before touching core calculation utilities, create a dedicated behavioral test harness (`src/__tests__/calculations/unifiedEngineWitness.test.ts`) that records and asserts exact outputs for:
- `calculateSMES()` across all 20 golden test charts (diurnal/nocturnal, retrogrades, stelliums, decans).
- `optimizeRecipe()` compatibility outputs and dominant planet influences.
- Kinetics and Greg's Energy derivations.

### Priority 2: High-Density Remediation Queue

| # | File Path | Tracked Warnings | Dominant Rules | Target Focus |
|---|---|---:|---|---|
| 1 | `src/utils/ingredientRecommender.ts` | 98 | unnecessary-condition (52) · unsafe-call (18) · unsafe-member (18) | Type scoring functions, align ingredient parameter types with unified catalog. |
| 2 | `src/utils/planetaryAlchemyMapping.ts` | ~85 | unsafe-member · explicit-any | Type planetary sect mappings and inertial mass tables. |
| 3 | `src/services/RecipeElementalService.ts` | ~75 | unsafe-member · unsafe-assign · nullish | Type elemental normalization and recipe derivation. |
| 4 | `src/utils/recipeCompatibility.ts` | ~70 | unnecessary-condition · unsafe-member | Type compatibility scoring and aspect influences. |
| 5 | `src/services/UnifiedIngredientService.ts` (Phase 2 pass) | ~65 | unsafe-member · unsafe-call | Complete remaining resolver typing. |
| 6 | `src/components/cooking-methods/OvenConvectionCanvas.tsx` | ~55 | unsafe-member · efrt | Strongly type canvas renderer and animation state. |
| 7 | `src/hooks/useSpacetimeTable.ts` | ~50 | unsafe-member · unsafe-assign | Type SpacetimeDB table subscription state. |
| 8 | **Mechanical Tier (`explicit-function-return-type`)** | **~500+** | explicit-function-return-type | Annotate pure utility helper return types across `src/utils/` and `src/services/`. |

---

## 4. Trustworthy Verification Commands

*Note: Always run from the primary repository checkout root (`/Users/cookingwithcastro/Desktop/WhatToEatNext-master`).*

```bash
# 1. Typecheck and normal lint gate (0 errors required)
bun run typecheck && bun run lint

# 2. Fast conformance test suite (ESMS, thermodynamics, postal)
bun run test:fast

# 3. Behavioral snapshot witness (100% parity gate across 7 sections)
bun scripts/snapshot-witness.ts

# 4. Full Jest unit test suite (3,193 tests)
bun run test

# 5. Production Next.js build & bundle check
bun run build

# 6. Global lint debt audit
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts

# 7. Ratchet baseline (only when total has decreased)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 5. Hard Rules

1. **Zero suppressions**: No `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `as any`.
2. **Never swallow catches**: When satisfying `no-floating-promises` or `no-void`, never write `.catch(() => {})` or `.catch(() => undefined)`. Always write `.catch((err) => _logger.error("<ContextName>", err))` or route to the component error handler.
3. **No blindfolded casts**: Do not use `as unknown as Parameters<typeof f>[0]`. Write explicit typed adapter functions that validate and map fields.
4. **Production logger awareness**: `@/lib/logger` suppresses `.warn` and `.info` in production. Alerts on silent fallbacks or degraded operations MUST use `_logger.error` or `@/utils/logger`.
5. **Preserve data invariants**: Do not delete runtime validation checks simply because TypeScript types assert non-nullability over untyped/partial data.
6. **`||` → `??` is a behavioral change**: They differ whenever LHS can be `0`, `""`, `false`, or `NaN`. Never convert without proving the falsy-but-valid case impossible.
7. **Commit the baseline**: Always commit `.lint-debt-baseline.json` alongside code changes when ratcheting.
