# Next Session: Phase 11 TypeScript Quality Campaign — `as any` Eradication, Production Cast Elimination & Untracked Axis Governance

> **Every number in this document is reproducible.** Each row in §0 names the exact command that
> re-derives it. If a command disagrees with the table, the table is wrong — fix the table.
> Numbers are derived from commit `49582412` on branch `feat/phase-10-cast-gate-hardening` (PR #814).

---

## 0. Repository State — Measured Ground Truth

| Metric / Fact | Current Value | Verification Command | Status |
|---|:---:|---|:---:|
| **Gated Cast Surface** | `543` total | `bun run lint:debt` | ✅ Verified |
| — `as unknown as` (Double Casts) | `357` (−324 from Phase 10 start) | `bun run lint:debt` | ✅ Verified |
| — `as any` (Unsafe Any Casts) | `186` (−1 from Phase 10 start) | `bun run lint:debt` | ✅ Verified |
| — Production Surface | `421` (131 `as any`, 290 `as unknown as`) | `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts` | ✅ Verified |
| — Test Surface | `122` (55 `as any`, 67 `as unknown as`) | `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --top-casts` | ✅ Verified |
| **Tracked Lint Debt Baseline** | `3,690` (−25 from Phase 10 start) | `bun run lint:debt` | ✅ Verified |
| **Declined Rules Pool** | `6,318` (−5 from Phase 10 start) | `bun run lint:debt` | ✅ Verified |
| **Lint Errors / Compiler Errors** | `0` errors (22 warnings) | `bun run lint && bun run typecheck` | ✅ Verified |
| **Fast Test Suite** | `19/19 suites, 494/494 tests` | `bun run test:fast` | ✅ Verified |
| **Snapshot Witness Parity** | `100% parity` across all 12 modules | `bun scripts/snapshot-witness.ts` | ✅ Verified |
| **Witness Sensitivity Gate** | `12/12 load + 3/3 output gates pass` | `bun scripts/checkWitnessSensitivity.ts` | ✅ Verified |
| **Monica Read-Path Integrity** | `0` fabricated fallbacks | `bun scripts/checkNoFabricatedMonicaFallback.ts` | ✅ Verified |
| **Upstream Branch / PR** | `feat/phase-10-cast-gate-hardening` | `gh pr view 814` | ✅ PR #814 Open |

---

## 1. Phase 11 Strategic Mission & Objectives

Phase 10 successfully eliminated 325 casts (−37.4%), expanded the behavioral snapshot witness across all 12 recommender modules, and committed the sensitivity prover. However, the audit revealed two critical insights:
1. **`as any` was largely bypassed:** Out of 325 casts removed, 324 were `as unknown as` and only 1 was `as any` (187 → 186). The `as any` axis is the most hazardous form of unsafety.
2. **Untracked substitution:** Batch D exhibited ~32% substitution into untracked single `as T` assertions.

### Primary Goals for Phase 11:
1. **`as any` Eradication (Attack the 186 Baseline):** Reduce `as any` from **186 → ≤ 130** (a net elimination of **≥ 56 `as any` assertions**), targeting both test fixtures and production services.
2. **Production Double Cast Flattening:** Reduce `as unknown as` from **357 → ≤ 290** (a net elimination of **≥ 67 double casts**), driving total gated casts from **543 → ≤ 420**.
3. **Untracked Axis Tracking:** Add single `as T` monitoring in `scripts/checkLintDebt.ts` to make substitution visible and prevent regression displacement.
4. **Tracked Debt Downward Ratchet:** Drive tracked lint debt from **3,690 → ≤ 3,500** (−190 warnings).

---

## 2. Target Concentration Matrix

### 2.1 Top `as any` High-Density Targets (Goal: ≥ 56 `as any` removed)
```
  15 as any : src/utils/astrology/astrologicalRules.test.ts
  10 as any : src/services/__tests__/syntheticProbeService.test.ts
   5 as any : src/app/api/tables/[tableId]/__tests__/transitions.test.ts
   4 as any : src/data/ingredients/seasonings/index.ts
   4 as any : src/utils/typescriptCampaignTrigger.ts
   4 as any : src/components/recommendations/EnhancedSauceRecommender.tsx
   3 as any : src/types/bridges/astrologicalBridge.ts
   3 as any : src/types/recipeIngredient.ts
   3 as any : src/app/api/transmutation_recommendations/route.ts
   3 as any : src/app/api/menu-planner/public-week/route.ts
   3 as any : src/server/hono-api.ts
   2 as any : src/app/api/menu-planner/agent-weekly-menu/__tests__/route.test.ts
   1 as any : src/utils/cuisineRecommender.ts
   1 as any : src/lib/services/planetary-agent-activation.ts
   1 as any : src/app/api/menu-planner/agent-weekly-menu/route.ts
```

### 2.2 Top `as unknown as` Production Targets (Goal: ≥ 67 double casts removed)
```
   5 as unknown as : src/utils/recipeFilters.ts
   5 as unknown as : src/hooks/useRecipeValidation.ts
   5 as unknown as : src/hooks/usePlanetaryKinetics.ts
   5 as unknown as : src/data/ingredients/index.ts
   5 as unknown as : src/services/EnhancedTransitAnalysisService.ts
   4 as unknown as : src/utils/cuisineRecommender.ts
   4 as unknown as : src/lib/services/planetary-agent-activation.ts
   4 as unknown as : src/components/astrological/ZodiacSelector.tsx
   4 as unknown as : src/components/recommendations/EnhancedIngredientRecommender.tsx
   4 as unknown as : src/data/nutritional/rdaStandards.ts
   4 as unknown as : src/data/unified/nutritional.ts
   4 as unknown as : src/data/unified/flavorProfileMigration.ts
   4 as unknown as : src/services/ingredientMappingService.ts
```

---

## 3. Structured Execution Prompts (XML Specifications)

### Batch 11A — `as any` Eradication & Test Fixture Typing

```xml
<prompt id="Phase-11A-AsAny-Eradication">
  <task_description>
    Eliminate `as any` assertions in test suites and utility files by introducing typed mock factories,
    proper partial schemas, and explicit event/request signatures.
  </task_description>
  <target_files>
    <file action="modify">src/utils/astrology/astrologicalRules.test.ts</file>
    <file action="modify">src/services/__tests__/syntheticProbeService.test.ts</file>
    <file action="modify">src/app/api/tables/[tableId]/__tests__/transitions.test.ts</file>
    <file action="modify">src/utils/typescriptCampaignTrigger.ts</file>
  </target_files>
  <technical_specifications>
    <astrological_rules_test>
      - In `astrologicalRules.test.ts` (15 `as any`):
        Replace mock state casts with typed `AstrologicalState` and `PlanetaryPositions` test builders.
        Ensure planet positions define required `degree`, `sign`, and `isRetrograde` properties.
    </astrological_rules_test>
    <synthetic_probe_test>
      - In `syntheticProbeService.test.ts` (10 `as any`):
        Type mock probe results and fetch response payloads using `SyntheticProbeResult` and `AlchemicalResponse`.
    </synthetic_probe_test>
    <table_transitions_test>
      - In `transitions.test.ts` (5 `as any`):
        Type mock NextRequest and database session objects cleanly using `NextRequest` and `SessionUser`.
    </table_transitions_test>
    <campaign_trigger>
      - In `typescriptCampaignTrigger.ts` (4 `as any`):
        Type campaign trigger payloads and AST diagnostic wrappers with strict interfaces.
    </campaign_trigger>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run test -- src/utils/astrology/astrologicalRules.test.ts`
    2. `bun run test -- src/services/__tests__/syntheticProbeService.test.ts`
    3. `bun run test -- src/app/api/tables/[tableId]/__tests__/transitions.test.ts`
    4. `bun run typecheck && bun run lint`
    5. Expected Reduction: ≥ 34 `as any` eliminated (186 → ≤ 152).
  </testing_and_verification>
</prompt>
```

---

### Batch 11B — Production Services & API Route Cast Remediation

```xml
<prompt id="Phase-11B-Production-Services-API-Remediation">
  <task_description>
    Eliminate `as any` and `as unknown as` casts across production API routes, bridges, and recommender hooks.
  </task_description>
  <target_files>
    <file action="modify">src/data/ingredients/seasonings/index.ts</file>
    <file action="modify">src/components/recommendations/EnhancedSauceRecommender.tsx</file>
    <file action="modify">src/types/bridges/astrologicalBridge.ts</file>
    <file action="modify">src/types/recipeIngredient.ts</file>
    <file action="modify">src/app/api/transmutation_recommendations/route.ts</file>
    <file action="modify">src/app/api/menu-planner/public-week/route.ts</file>
    <file action="modify">src/server/hono-api.ts</file>
    <file action="modify">src/utils/recipeFilters.ts</file>
    <file action="modify">src/utils/cuisineRecommender.ts</file>
    <file action="modify">src/hooks/useRecipeValidation.ts</file>
    <file action="modify">src/hooks/usePlanetaryKinetics.ts</file>
    <file action="modify">src/lib/services/planetary-agent-activation.ts</file>
  </target_files>
  <technical_specifications>
    <seasonings_registry>
      - In `src/data/ingredients/seasonings/index.ts` (4 `as any`, 1 `as unknown as`):
        Provide explicit `IngredientMapping` typing on seasoning dictionary records.
    </seasonings_registry>
    <sauce_recommender>
      - In `EnhancedSauceRecommender.tsx` (4 `as any`):
        Import `Sauce` type from `@/data/sauces` and eliminate ad-hoc untyped sauce objects.
    </sauce_recommender>
    <api_routes>
      - In `transmutation_recommendations/route.ts` & `public-week/route.ts`:
        Type request body parameters using Zod validation schemas or typed interfaces rather than `req.json() as any`.
    </api_routes>
    <recommender_hooks>
      - In `useRecipeValidation.ts` & `usePlanetaryKinetics.ts`:
        Utilize `RecipeValidationResult` and `KineticState` types for zero double-cast hooks.
    </recommender_hooks>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run typecheck`
    2. `bun run lint`
    3. `bun run test:fast`
    4. `bun scripts/snapshot-witness.ts`
    5. Expected Reduction: ≥ 22 `as any` eliminated (≤ 130) and ≥ 30 `as unknown as` eliminated (≤ 327).
  </testing_and_verification>
</prompt>
```

---

### Batch 11C — Nutritional, Migration & Catalog Domain Flattening

```xml
<prompt id="Phase-11C-Nutritional-Domain-Flattening">
  <task_description>
    Remediate double casts across nutritional registries, flavor profile migration layers, and ingredient mapping services.
  </task_description>
  <target_files>
    <file action="modify">src/data/nutritional/rdaStandards.ts</file>
    <file action="modify">src/data/unified/nutritional.ts</file>
    <file action="modify">src/data/unified/flavorProfileMigration.ts</file>
    <file action="modify">src/services/ingredientMappingService.ts</file>
    <file action="modify">src/components/astrological/ZodiacSelector.tsx</file>
    <file action="modify">src/components/recommendations/EnhancedIngredientRecommender.tsx</file>
  </target_files>
  <technical_specifications>
    <nutritional_data>
      - In `rdaStandards.ts` & `data/unified/nutritional.ts`:
        Type nutrient standard tables with `Record<NutrientKey, RDARequirement>` to enable direct access.
    </nutritional_data>
    <flavor_migration>
      - In `flavorProfileMigration.ts`:
        Align `UnifiedFlavorProfile` schema mappings to transform legacy profiles directly without `as unknown as`.
    </flavor_migration>
    <ui_components>
      - In `ZodiacSelector.tsx` & `EnhancedIngredientRecommender.tsx`:
        Use `ZodiacSign` enum and `IngredientRecommendation` interfaces natively.
    </ui_components>
  </technical_specifications>
  <testing_and_verification>
    1. `bun run typecheck && bun run lint && bun run test:fast`
    2. `bun scripts/snapshot-witness.ts`
    3. `bun scripts/checkWitnessSensitivity.ts`
    4. Expected Reduction: ≥ 30 double casts eliminated (≤ 290).
  </testing_and_verification>
</prompt>
```

---

### Batch 11D — Untracked Axis Gate Hardening & Production Ratchet

```xml
<prompt id="Phase-11D-Gate-Hardening-Untracked-Axis">
  <task_description>
    Extend `scripts/checkLintDebt.ts` to count and report single `as T` assertions alongside gated casts,
    and enforce independent ratchets for production and test cast surfaces.
  </task_description>
  <target_files>
    <file action="modify">scripts/checkLintDebt.ts</file>
    <file action="modify">.lint-debt-baseline.json</file>
  </target_files>
  <technical_specifications>
    <single_cast_counter>
      - In `scripts/checkLintDebt.ts`:
        Add AST or robust regex scanning for single `as [A-Z]\w*` type assertions to detect substitution displacement.
        Report `untrackedSingleAsT` total in `--top-casts` output.
    </single_cast_counter>
    <segmented_ratchets>
      - Add baseline properties: `casts.production` and `casts.test`.
      - Enforce `Math.min` ratchet independently across:
        - `casts.asAny` (strict non-regression)
        - `casts.asUnknownAs`
        - `casts.production`
        - `casts.total`
    </segmented_ratchets>
  </technical_specifications>
  <testing_and_verification>
    1. `NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet`
    2. Verify `.lint-debt-baseline.json` reflects new lower thresholds.
    3. Run `bun run lint:debt` to ensure all ratchets pass cleanly.
  </testing_and_verification>
</prompt>
```

---

## 4. Strict Operating Rules & Invariants

1. **`as any` Must Strictly Decrease:** Baseline is **186**. Every batch must reduce or strictly freeze this number.
2. **Total Gated Casts Must Strictly Decrease:** Baseline is **543** (target: $\le 420$).
3. **Tracked Debt Must Strictly Decrease:** Baseline is **3,690** (target: $\le 3,500$).
4. **Declined Rules Pool Must Not Increase:** Baseline is **6,318** in aggregate.
5. **Zero Compiler & Zero Lint Errors:** `bun run typecheck` and `bun run lint` must pass with 0 errors at every single step.
6. **100% Test & Witness Parity:** All 494 unit tests, `scripts/snapshot-witness.ts`, and `scripts/checkWitnessSensitivity.ts` must pass green before committing.
7. **Scoped Atomic Commits:** Commit baseline updates in the exact same scoped commit as the source changes that justify them.
8. **No Untracked Substitutions:** Refactoring must replace casts with proper types, narrowing, or interfaces—never silently disguise `as unknown as T` into `as T`.
