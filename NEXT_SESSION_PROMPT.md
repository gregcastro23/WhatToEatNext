# Next Session: Phase 6 TypeScript Lint Debt Remediation & Root-Cause Architecture Campaign

**Starting Baseline:** **`9,944` tracked warnings, 0 lint errors** (locked in [`.lint-debt-baseline.json`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/.lint-debt-baseline.json)).
**Target Milestone:** **$\le 8,500$** (or **$\le 7,000$** if annotation-only rules are declined), with root-cause elimination of the `any`-flow cluster and zero deleted runtime guards.

---

## 0. Repository State — Measured, Not Assumed (August 2026)

| Fact | Value | Verification Command | Notes |
|---|:---:|---|---|
| **Baseline at HEAD** | `9,944` | `.lint-debt-baseline.json` | Reconciles exactly with whole-repo audit |
| **Lint Errors** | `0` | `bun run lint` | 0 errors across entire workspace |
| **Compiler Errors** | `0` | `bun run typecheck` | `tsc --noEmit` clean |
| **Fast Test Suite** | `438/438` | `bun run test:fast` | 11/11 test suites passing |
| **Calculation Witnesses** | `28/28` | `src/__tests__/calculations/unifiedEngineWitness.test.ts` | 100% celestial adapter & SMES parity |
| **Recent Phase 5 Commits** | 4 commits | `git log -n 4 --oneline` | `c411f3d3` (A), `66ee9f73` (B), `3d11e064` (C), `a8b2835a` (D) |

---

## 1. Phase 5 Assay & Critical Guard Restorations

The independent Phase 5 assay verified that **`9,944`** is exact, all 14 tracked rules decreased, and the `executeQuery<T>` keystone in `src/lib/database/connection.ts` was fixed to forward `<T>` to `pool.query<T>`.

### 🛡️ Runtime Guard Restorations Applied
1. **[`src/contexts/UserContext/index.tsx:106`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/contexts/UserContext/index.tsx#L106):**
   - *Problem:* `natalChart?.planets?.length` was shortened to `natalChart?.planets`. In JS/TS, `[]` is truthy, so `planets: []` fell through to `calculateAlchemicalProfile()`, generating an ascendant-only placeholder profile that contaminated `user.stats`.
   - *Fix:* Restored `(natalChart?.planets?.length ?? 0) > 0` guard.
2. **[`src/hooks/useProfile.ts:86`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/hooks/useProfile.ts#L86):**
   - *Problem:* Unsafe type assertion `as ProfileRecord` on raw `JSON.parse` output without verifying object/null status.
   - *Fix:* Restored non-null object checking (`parsed && typeof parsed === 'object' && parsed.natalChart`) before reading properties.
3. **[`src/lib/database/connection.ts:47`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/database/connection.ts#L47):**
   - *Problem:* `readPoolGauges` assumed `pool` object structure unconditionally.
   - *Fix:* Restored defensive pool existence and counter validation guards.

---

## 2. Taxonomy of Remaining Debt (`9,944` Total)

The remaining debt divides into four distinct behavioral populations:

| Population | Count | Share | Characteristics & Strategy |
|---|:---:|:---:|---|
| **1. Annotation-Only Cluster** | **2,971** | 30% | `explicit-function-return-type` (2,102), `explicit-module-boundary-types` (869). Purely mechanical, finds no runtime defects. Can be ruled on or formally declined to reduce baseline to `6,973`. |
| **2. `any`-Flow Cluster** | **2,811** | 28% | `no-unsafe-member-access` (1,241), `no-unsafe-assignment` (798), `no-explicit-any` (394), `no-unsafe-argument` (242), `no-unsafe-call` (98), `no-unsafe-return` (38). **Where lint fix = bug fix.** Must be remediated root-first (DB models & API envelopes). |
| **3. `no-unnecessary-condition`** | **2,512** | 25% | ⚠️ **FROZEN.** Fired when optimistic type definitions falsely claim runtime guards are unneeded. Deleting guards causes regressions. Only touch when the underlying types are 100% verified. |
| **4. Production Behavior & Control Flow** | **1,650** | 17% | `prefer-nullish-coalescing` (832), `no-console` (412), `require-await` (186), `no-void` (124), `no-floating-promises` (96). Requires careful per-site domain analysis (e.g. `0` / `""` preservation, prod-surviving logger selection). |

---

## 3. Phase 6 Strategic Sequencing

### 🎯 Key Architectural Directives
1. **Kill `= any` Defaults at the Root:**
   Ensure database querying wrappers (`executeQuery<T>`, `pool.query<T>`) do not default `T = any`. By defaulting to `unknown` or requiring explicit row models, call sites are forced to declare honest shapes, naturally collapsing hundreds of downstream `no-unsafe-member-access` warnings.
2. **Freeze `no-unnecessary-condition` Guard Deletions:**
   Never delete a null/undefined check to silence `no-unnecessary-condition`. If the linter claims a check is unnecessary, update the upstream type signature to honestly reflect potential `null` or `undefined` states.
3. **Purge Microtask Suppressions:**
   Avoid adding `await Promise.resolve()` inside synchronous or hook state updater callbacks just to satisfy `require-await`. Either remove the unnecessary `async` keyword (adjusting callers if needed) or properly await real async operations.
4. **Audit Logger Destinations:**
   Always use the production-surviving logger (`createLogger` from `@/utils/logger` or `_logger.error` from `@/lib/logger`) for critical services, Stripe webhooks, and auth paths. Never downgrade an alert to `_logger.warn` (which is silenced in production).

---

## 4. Phase 6 Work Batches

### Batch 0: Guard Hardening & CI Policy
- Commit the 3 restored guards (`UserContext/index.tsx`, `useProfile.ts`, `connection.ts`).
- Verify full test suite and build (`bun run verify:full`).
- Re-ratchet `.lint-debt-baseline.json`.

### Batch A: Database & Service Root Typings (The `any`-Flow Root)
Target core DB access services and models to eliminate `any` leaks into consumers:
1. `src/services/feedCommentsDatabaseService.ts` (~39 warnings)
2. `src/services/SocialFeedService.ts` (~42 warnings)
3. `src/services/TokenEconomyService.ts` (~38 warnings)
4. `src/services/FoodDiaryDatabaseService.ts` (~35 warnings)
5. `src/services/CommensalService.ts` (~34 warnings)

### Batch B: Annotation-Only Resolution & Rule Governance
- Make architectural determination on `explicit-function-return-type` (2,102) and `explicit-module-boundary-types` (869).
- If declined in `eslint.config.mjs`, instantly ratchets whole-repo baseline down by **~2,971** to **`6,973`**.
- If retained, apply mass mechanical explicit return types via batch passes.

### Batch C: Calculation & Core Logic Hardening
Target high-density calculation services with full behavioral witness verification:
1. `src/calculations/enhancedAlchemicalMatching.ts`
2. `src/calculations/CurrentMomentManager.ts`
3. `src/services/RealAlchemizeService.ts`
4. `src/utils/cuisineSauceProfiler.ts`
5. `src/utils/foodRecommender.ts`

### Batch D: UI State, Modals & Navigation
Remediate remaining high-density UI component and hook warnings:
1. `src/components/celestial-lab/FoodLabBook.tsx`
2. `src/components/modals/AddToDiaryModal.tsx`
3. `src/components/dashboard/NatalTransitChart.tsx`
4. `src/app/(alchm)/profile/[userId]/page.tsx`
5. `src/app/(alchm)/admin/page.tsx`

---

## 5. Verification Protocol (Mandatory Before Every Ratchet)

```bash
# 1. Typecheck
bun run typecheck

# 2. Lint Budget Verification
bun run lint

# 3. Calculation Behavioral Witness
bun test src/__tests__/calculations/unifiedEngineWitness.test.ts

# 4. Fast Unit Tests
bun run test:fast

# 5. Full Verification & Production Build
bun run verify:full

# 6. Audit & Auto-Ratchet (Always use 8GB heap)
NODE_OPTIONS=--max-old-space-size=8192 bun scripts/checkLintDebt.ts --ratchet
```

---

## 6. Standing Campaign Constraints

1. **Zero Suppressions:** 0 `eslint-disable` added, 0 `@ts-ignore` added, 0 artificial `as any` casts.
2. **Never Delete a Runtime Guard:** If `no-unnecessary-condition` fires, fix the type nullability — do not delete the guard.
3. **Preserve `??` vs `||` Semantics:** Never blindly replace `||` with `??` when `0` or `""` are valid domain values (scores, coordinates, counters).
4. **Commit Per Batch:** Keep git history granular and clean; verify and commit after every batch.
