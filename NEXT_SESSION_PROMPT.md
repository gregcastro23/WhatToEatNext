# Next Session: Phase 10 TypeScript Quality Campaign — Cast Surface Gating & Non-Regression

**Starting Baseline:** **`3,715` tracked warnings, `6,327` declined warnings (10,042 total lint surface), `868` total type casts (187 `as any`, 681 `as unknown as`), 0 lint errors, 0 compiler errors** (locked in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)).  
**Target Milestone:**
1. **Gate Cast Surface**: Enforce cast ratchet on `as any` + `as unknown as` (fail on increase, ratchet down).
2. **Freeze Declined Pool**: Fail if declined pool (`6,327`) increases.
3. **Mechanical Per-Rule Non-Regression**: Fail if any individual tracked rule increases.
4. **Targeted Maintenance**: Remediate casts on state objects, context defaults, and registry adapters first, driving tracked debt to $\le 3,400$ second.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Tracked Baseline at HEAD** | **`3,715`** | `bun run lint:debt` | Reconciles exactly across audited rules (Batches 0–D committed at `b5ab18c0`) |
| **Declined Rules Baseline** | **`6,327`** | `bun scripts/checkLintDebt.ts` | Frozen; 7 declined rules totaling 6,327 |
| **Cast Surface Baseline** | **`868`** | `bun scripts/checkLintDebt.ts` | 187 `as any` + 681 `as unknown as` |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit` clean |
| **Fast Test Suite** | `19/19 suites (494/494)` | `bun run test:fast` | 100% passing (includes alchemical defaultState integrity & smoke test) |
| **Full Test Suite** | `319/319 suites (3,302/3,302)` | `bun run test --passWithNoTests` | 100% passing (10 skipped, exit 0) |
| **Behavioral Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | 100% parity with baseline |
| **Monica Integrity** | Clean | `bun scripts/checkNoFabricatedMonicaFallback.ts` | 0 unprincipled agent fallbacks |
| **Production Deployment** | Verified | Vercel (`b5ab18c0`) | Seeded guest test confirmed live recommender mounting & scoring |

---

## 1. Phase 9 Progress & Campaign Ledger

1. **Governance Target Progress (`4,110` $\rightarrow$ `3,715`):**
   - Reduced baseline from `4,110` down to **`3,715`** across Batches 0, A, B, C, and D (net reduction of **395 tracked debt warnings eliminated** across 23 files, beating the $\le 3,750$ target by 35).
   - Zero regressions of any kind across every tracked and declined rule.
2. **Production Crash Remediated & End-to-End Verified:**
   - Initialized complete, honest `defaultState` in `AlchemicalContext/context.tsx` and `defaults.ts`.
   - Verified in production by seeding guest table state and confirming 17 real ingredient scores rendered.
3. **Omission Precedent Maintained:**
   - Applied strict omission policy on `method.elementalEffect` without fabricated fallbacks.

---

## 2. Top 40 Files by Tracked Debt (`3,715` Total Tracked)

*Generated from `bun scripts/checkLintDebt.ts --top 40`:*

1. `src/app/recipe-builder/page.tsx` (17 warnings: no-unnecessary-condition 5, no-unsafe-member-access 5, prefer-nullish-coalescing 3)
2. `src/utils/buildQualityMonitor.ts` (17 warnings: require-await 9, no-unsafe-assignment 3, no-unsafe-call 2)
3. `src/components/recipes/LabBookIngest.tsx` (17 warnings: no-unsafe-member-access 8, no-unnecessary-condition 4, no-unsafe-argument 3)
4. `src/components/dashboard/DashboardOverview.tsx` (16 warnings: no-unnecessary-condition 9, no-unsafe-member-access 3, no-explicit-any 1)
5. `src/data/ingredients/seasonings/vinegars.ts` (16 warnings: no-unsafe-assignment 10, no-unsafe-member-access 2, prefer-nullish-coalescing 2)
6. `src/services/poolerSaturationHealth.ts` (16 warnings: no-unsafe-member-access 7, no-unsafe-call 5, no-unsafe-assignment 3)
7. `src/app/onboarding/page.tsx` (15 warnings: no-explicit-any 3, no-unsafe-assignment 3, no-unnecessary-condition 3)
8. `src/components/SunDisplay.tsx` (15 warnings: no-unsafe-call 4, no-console 4, no-unsafe-assignment 3)
9. `src/contexts/menu-planner/useCostEstimation.ts` (14 warnings: no-unsafe-assignment 6, no-unsafe-member-access 6, no-unnecessary-condition 1)
10. `src/app/(alchm)/kitchen-lab/alchm/page.tsx` (14 warnings: no-unsafe-member-access 6, no-unnecessary-condition 4, no-unsafe-assignment 3)
11. `src/app/api/recipes/route.ts` (14 warnings: no-unsafe-assignment 4, no-console 4, no-unnecessary-condition 3)
12. `src/app/api/generate-cosmic-recipe/route.ts` (14 warnings: no-console 6, no-unsafe-assignment 3, no-unnecessary-condition 3)
13. `src/utils/elemental/transformations.ts` (14 warnings: no-unnecessary-condition 14)
14. `src/components/LivePlanetaryTracker.tsx` (14 warnings: no-unsafe-member-access 5, no-unnecessary-condition 2, no-explicit-any 2)
15. `src/components/menu-planner/SmartRecommendations.tsx` (14 warnings: no-unnecessary-condition 10, no-explicit-any 2, no-unsafe-member-access 2)
16. `src/hooks/usePlanetaryKinetics.ts` (14 warnings: no-unnecessary-condition 12, prefer-nullish-coalescing 2)
17. `src/calculations/culinaryAstrology.ts` (14 warnings: no-unnecessary-condition 8, prefer-nullish-coalescing 6)
18. `src/lib/tables/composite.ts` (14 warnings: no-unsafe-member-access 6, no-unnecessary-condition 6, no-unsafe-assignment 1)
19. `src/lib/elemental-reinforcement.ts` (14 warnings: no-unsafe-assignment 4, no-unnecessary-condition 4, no-unsafe-return 3)
20. `src/lib/alchemizer.ts` (14 warnings: no-unnecessary-condition 13, prefer-nullish-coalescing 1)
21. `src/services/ConfigurationService.ts` (14 warnings: no-unnecessary-condition 6, no-unsafe-assignment 2, no-unsafe-argument 2)
22. `src/services/UnifiedRecipeService.ts` (14 warnings: no-unsafe-member-access 4, no-unnecessary-condition 3, no-unsafe-assignment 2)
23. `src/app/api/transmutation_recommendations/route.ts` (13 warnings: no-unnecessary-condition 4, no-explicit-any 3, no-unsafe-member-access 3)
24. `src/constants/planetaryFoodAssociations.ts` (13 warnings: prefer-nullish-coalescing 5, no-unnecessary-condition 3, no-explicit-any 2)
25. `src/components/auth/OnboardingWizard.tsx` (13 warnings: no-unsafe-assignment 4, no-unsafe-argument 3, no-explicit-any 2)
26. `src/components/recipe-builder/GenerateRecipeButton.tsx` (13 warnings: no-unsafe-member-access 5, no-unnecessary-condition 4, no-unsafe-assignment 3)
27. `src/components/profile/ProfileHeroCard.tsx` (13 warnings: no-unnecessary-condition 13)
28. `src/components/alchm-kinetics.tsx` (13 warnings: no-unsafe-member-access 5, no-unsafe-assignment 4, no-unnecessary-condition 3)
29. `src/components/time-laboratory/planetary-agents-view.tsx` (13 warnings: no-unnecessary-condition 7, no-explicit-any 2, no-unsafe-assignment 2)
30. `src/hooks/useAstrologize.ts` (13 warnings: no-unsafe-assignment 6, no-unsafe-member-access 4, no-explicit-any 2)
31. `src/lib/monica/horoscope-generator.ts` (13 warnings: no-unsafe-assignment 4, no-unsafe-member-access 3, no-console 2)
32. `src/lib/recipe-nft/mintClient.ts` (13 warnings: no-unsafe-assignment 7, no-unsafe-member-access 6)
33. `src/lib/agents/persona/format-persona-block.ts` (13 warnings: no-unnecessary-condition 13)
34. `src/lib/api/alchm-client.ts` (13 warnings: no-explicit-any 12, no-unnecessary-condition 1)
35. `src/data/recipes/elementalMappings.ts` (13 warnings: prefer-nullish-coalescing 6, no-unsafe-assignment 3, no-explicit-any 3)
36. `src/services/QuestService.ts` (13 warnings: no-unsafe-member-access 7, no-unsafe-assignment 4, no-unsafe-call 2)
37. `src/services/EnhancedRecommendationService.ts` (13 warnings: no-unnecessary-condition 10, no-useless-assignment 3)
38. `src/services/ElementalCalculator.ts` (13 warnings: no-unnecessary-condition 13)
39. `src/services/PlanetaryHoursClient.ts` (13 warnings: no-unsafe-assignment 6, no-unsafe-member-access 5, no-unsafe-call 1)
40. `src/app/(alchm)/commensal/page.tsx` (12 warnings: no-unsafe-member-access 3, prefer-nullish-coalescing 3, no-unsafe-argument 2)

---

## 3. Targeted Work Batches for Phase 10

### 📦 Batch A: Cast Surface on State, Context Defaults & Recommenders
Prioritize type laundering elimination (`as any` / `as unknown as`) across contexts, hooks, and adapters:
1. `src/app/recipe-builder/page.tsx` (17 tracked warnings + eliminate cast surface)
2. `src/components/recipes/LabBookIngest.tsx` (17 tracked warnings + eliminate cast surface)
3. `src/components/dashboard/DashboardOverview.tsx` (16 tracked warnings + eliminate cast surface)
4. `src/contexts/menu-planner/useCostEstimation.ts` (14 tracked warnings)
5. `src/app/onboarding/page.tsx` (15 tracked warnings)

### 📦 Batch B: Server Routes, Pooler Health & Monitoring
1. `src/utils/buildQualityMonitor.ts` (17 tracked warnings)
2. `src/services/poolerSaturationHealth.ts` (16 tracked warnings)
3. `src/app/api/recipes/route.ts` (14 tracked warnings)
4. `src/app/api/generate-cosmic-recipe/route.ts` (14 tracked warnings)
5. `src/app/api/transmutation_recommendations/route.ts` (13 tracked warnings)

### 📦 Batch C: Kinetics, Elemental Calculations & Alchemical Services
1. `src/utils/elemental/transformations.ts` (14 tracked warnings)
2. `src/hooks/usePlanetaryKinetics.ts` (14 tracked warnings)
3. `src/calculations/culinaryAstrology.ts` (14 tracked warnings)
4. `src/lib/tables/composite.ts` (14 tracked warnings)
5. `src/lib/alchemizer.ts` (14 tracked warnings)

### 📦 Batch D: Datasets, Recipe Services & Client Bridges
1. `src/data/ingredients/seasonings/vinegars.ts` (16 tracked warnings)
2. `src/services/ConfigurationService.ts` (14 tracked warnings)
3. `src/services/UnifiedRecipeService.ts` (14 tracked warnings)
4. `src/constants/planetaryFoodAssociations.ts` (13 tracked warnings)
5. `src/lib/api/alchm-client.ts` (13 tracked warnings)

---

## 4. Verification Protocol (Mandatory Per Batch)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Verification
bun run lint

# 3. Fast Unit Test Suite (19 suites, 494 tests)
bun run test:fast

# 4. Calculation & Behavioral Snapshot Witnesses
bun scripts/snapshot-witness.ts
bun scripts/checkNoFabricatedMonicaFallback.ts

# 5. Full Unit & Integration Test Suite
bun run test --passWithNoTests

# 6. Production Next.js Build
bun run build

# 7. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```
