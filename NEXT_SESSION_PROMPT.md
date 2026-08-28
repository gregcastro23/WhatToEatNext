# Next Session: Phase 7 TypeScript Lint Debt Remediation & Systematic Quality Campaign

**Starting Baseline:** **`5,445` tracked warnings, 0 lint errors, 0 compiler errors** (locked in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)).  
**Target Milestone:** **$\le 4,500$** tracked warnings (a net reduction of $\ge 945$ warnings), prioritizing the remaining `any`-flow clusters in UI components, custom React hooks, and API routes with zero deleted runtime guards.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Baseline at HEAD** | **`5,445`** | `bun run lint:debt` | Reconciles exactly across audited rules |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across entire workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit` clean |
| **Fast Test Suite** | `489/489` | `bun run test:fast` | 17/17 test suites passing (includes DB suites) |
| **Full Test Suite** | `3,224/3,224` | `bun run test --passWithNoTests` | 298/298 suites passing (exit 0) |
| **Calculation Witnesses** | `28/28` | `src/__tests__/calculations/unifiedEngineWitness.test.ts` | 100% celestial adapter & SMES parity |
| **Behavioral Snapshot Witness** | 100% parity | `bun scripts/snapshot-witness.ts` | 100% parity with baseline |
| **Monica Integrity** | Clean | `scripts/checkNoFabricatedMonicaFallback.ts` | 0 fabricated fallbacks |
| **Recent Phase 6 Commits** | 13 commits | `git log -n 5 --oneline` | Batches A–K (`32194567`), CI repair (`69e72b66`), `test:fast` & seasonal sync (`2edb83ff`) |

---

## 1. Phase 6 Assays & Keystone Safeguards Landed

1. **Governance Target $\le 5,500$ Achieved & Surpassed:**
   - Reduced baseline from `6,973` down to **`5,445`** across Batches A through K (net reduction of **1,528 tracked warnings**).
   - Maximum debt density per file dropped from 42+ warnings down to $\le 22$ warnings across the whole codebase.

2. **Durable Declined Rules Synchronization:**
   - Updated `scripts/checkLintDebt.ts` to automatically map and synchronize live counts across `declined.rules` upon `--ratchet`, eliminating metadata drift.

3. **Closed `test:fast` Database Coverage Gap:**
   - Added `src/lib/database/__tests__/` to `test:fast` in `package.json` (17 suites / 489 tests), ensuring DB pool and connection logger mocks run on every pre-commit hook.

4. **Honest Boundary Type Pattern Established (`StoredChart` & `seasonalUsage`):**
   - When database rows or external payloads lack fields (such as `planets` in `saved_charts`), declare honest partial/stored types (`StoredChart`, `SeasonUsageData`) rather than deleting defensive runtime checks.
   - Normalized `"fall"` alongside `"autumn"` in `src/data/integrations/seasonalUsage.ts` with safe resolver fallbacks.

---

## 2. Taxonomy of Remaining Debt (`5,445` Total)

| Population | Count | Share | Characteristics & Strategy |
|---|:---:|:---:|---|
| **1. `no-unnecessary-condition`** | **2,118** | 39% | ⚠️ **FROZEN UNLESS TYPE IS HONEST.** Fires when optimistic interfaces declare fields non-null that are optional at runtime. Fix upstream types first; never delete runtime guards. |
| **2. `any`-Flow Cluster** | **1,414** | 26% | `no-unsafe-member-access` (638), `no-unsafe-assignment` (520), `no-unsafe-argument` (189), `no-unsafe-call` (67). **Where lint fix = bug fix.** Remediate by typing component props, API parameters, and hook states. |
| **3. Production Behavior & Control Flow** | **1,217** | 22% | `prefer-nullish-coalescing` (475), `no-console` (400), `require-await` (173), `no-void` (105), `no-floating-promises` (43), `no-empty` (21). Requires domain-aware fixes (`??` vs `||` for `0` / `""`, production logger routing). |
| **4. Explicit `any` Leaks** | **424** | 8% | `no-explicit-any` (424). Replace with `unknown`, generics, or explicit domain interfaces. |
| **5. Annotation-Only (Declined)** | *(2,749)* | *(N/A)* | `explicit-function-return-type` (1,864), `explicit-module-boundary-types` (885). Tracked in `declined.rules`. |

---

## 3. Phase 7 Targeted Work Batches (Target $\le 4,500$)

### 📦 Batch A: Tables, Feed & Profile UI Components (~210 Warnings)
Target remaining UI surfaces with loose record structures:
1. `src/app/adept-table/page.tsx` (22 warnings: 9 unsafe member, 4 unsafe call, 2 unsafe assignment)
2. `src/app/premium-table/page.tsx` (22 warnings: 9 unsafe member, 4 unsafe call, 2 unsafe assignment)
3. `src/components/profile/LiveAgentFeed.tsx` (22 warnings: 8 unsafe member, 4 unsafe assignment, 2 explicit any)
4. `src/components/profile/FoodPreferences.tsx` (22 warnings: 13 unsafe member, 4 unsafe assignment, 2 console)
5. `src/components/commensal/CompanionSuggestions.tsx` (19 warnings: 10 unsafe member, 6 unsafe argument, 1 unsafe assignment)
6. `src/components/LivePlanetaryTracker.tsx` (19 warnings: 5 unsafe member, 5 void, 2 unnecessary condition)

### 📦 Batch B: API Endpoints & Batch Calculators (~200 Warnings)
Target remaining route handlers and calculation helpers:
1. `src/app/api/nanobanana/cuisine/route.ts` (21 warnings: 6 unnecessary condition, 5 console, 4 unsafe member)
2. `src/app/api/astrologize/route.ts` (21 warnings: 7 console, 7 unnecessary condition, 6 void)
3. `src/app/api/menu-planner/menus/route.ts` (20 warnings: 11 unsafe member, 6 unsafe assignment, 2 console)
4. `src/app/api/zodiac-calendar/route.ts` (19 warnings: 17 unnecessary condition, 1 console, 1 require-await)
5. `src/utils/recipe/batchEnrichment.ts` (21 warnings: 10 unsafe member, 5 unsafe assignment, 3 explicit any)
6. `src/lib/enhanced-astronomical-calculator.ts` (21 warnings: 11 unsafe member, 6 explicit any, 3 unsafe assignment)

### 📦 Batch C: Custom React Hooks & State Managers (~200 Warnings)
Target hook return values and cached state stores:
1. `src/hooks/useTokenEconomy.ts` (21 warnings: 7 unsafe member, 5 unnecessary condition, 3 unsafe assignment)
2. `src/hooks/useTarotAstrologyData.ts` (20 warnings: 13 unnecessary condition, 3 nullish coalescing, 2 unsafe member)
3. `src/hooks/useCurrentChart.ts` (20 warnings: 6 unsafe assignment, 6 nullish coalescing, 5 unsafe member)
4. `src/lib/personalization/user-learning.ts` (20 warnings: 10 void, 8 unnecessary condition, 1 unsafe assignment)
5. `src/lib/performance/advanced-cache.ts` (20 warnings: 14 void, 2 explicit any, 2 require-await)
6. `src/types/ExtendedRecipe.ts` (19 warnings: 8 unsafe member, 5 unsafe assignment, 4 nullish coalescing)

### 📦 Batch D: Interactive Modals, Kitchen Intelligence & Dictionaries (~200 Warnings)
1. `src/components/home/CookingMethodPreview.tsx` (21 warnings: 20 unnecessary condition, 1 console)
2. `src/components/astrological/AstrologicalRecommendations.tsx` (21 warnings: 12 explicit any, 4 unsafe assignment, 2 void)
3. `src/components/recipes/LabBookIngest.tsx` (21 warnings: 8 unsafe member, 4 void, 4 unnecessary condition)
4. `src/components/time-laboratory/planetary-agent-chat.tsx` (21 warnings: 7 explicit any, 6 unsafe member, 3 unsafe assignment)
5. `src/components/RecipeBuilder.tsx` (20 warnings: 9 unsafe member, 4 unnecessary condition, 3 unsafe call)
6. `src/components/economy/TokenBalanceBar.tsx` (20 warnings: 7 unsafe member, 5 unsafe argument, 3 unnecessary condition)
7. `src/utils/ingredientValidation.ts` (20 warnings: 11 require-await, 9 unnecessary condition)

---

## 4. Verification Protocol (Mandatory Before Every Ratchet)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Verification
bun run lint

# 3. Fast Unit Test Suite (17 suites, 489 tests)
bun run test:fast

# 4. Calculation & Behavioral Snapshot Witnesses
bun test src/__tests__/calculations/unifiedEngineWitness.test.ts
bun scripts/snapshot-witness.ts

# 5. Full Verification & Production Build
bun run verify:full

# 6. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 5. Standing Campaign Constraints

1. **Zero Suppressions:** 0 `eslint-disable` added, 0 `@ts-ignore` added, 0 artificial `as any` casts.
2. **Never Delete a Runtime Guard:** If `no-unnecessary-condition` fires, fix the type nullability honestly — do not delete defensive guards.
3. **Preserve `??` vs `||` Domain Semantics:** Never blindly replace `||` with `??` when `0` or `""` are valid domain values (e.g., scores, coordinates, counts).
4. **Production Logger Discipline:** Use `createLogger` from `@/utils/logger` (or `_logger.error` from `@/lib/logger`) for critical services, Stripe webhooks, and auth paths.
5. **Commit Per Batch:** Keep git commits granular, staging only touched files by name.
