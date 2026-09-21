# Phase 38 Closeout Report: Honest Boundaries, Real Budgets, and a Metric That Means Something

_Version: 1.0.0 | Date: 2026-09-21 | Status: Complete & Verified_

---

## Executive Summary

Phase 38 delivered structural honesty and type integrity across boundaries, bundles, and gates:
1. **Natural Jest Exit Without `--forceExit`**: Diagnosed and eliminated unref/interval timer leaks in `unifiedFlavorEngine.ts` and `advanced-cache.ts` by migrating to lazy TTL eviction, dynamically tearing down database connection pools in `jest.setup.ts`. Jest now exits cleanly with 0 open handles across 389 test suites (4,072 tests).
2. **Dual Ratchets & AST Provenance Classification**: Replaced brittle naming heuristics with strict provenance-based classification (`z.input`/`z.output` under `src/lib/validation/**`). Split `chat.ts` and `recipe.ts` into wire schemas and pure domain adapters. Ratcheted domain loose optionality down from 276 to 233 (-43 sites), with 89 wire types segregated.
3. **Pure `parseEach` & Resilient Envelopes**: Shipped pure `parseEach` in `src/lib/api/json.ts` (0 imports, 0 dependencies), returning `{ items, kept, dropped, total }`. Applied element-level tolerance across notification, conversation, table chat, and feed feeds, and hardened empty write-acknowledgements. Verified notification enum parity against database schema.
4. **Adapter Round-Trip Parity & Red Proofs**: Built producer-grounded round-trip tests across 5 schema families (Feed, Notification, Chat, Recipes, UserProfile, Shop, Instacart) asserting both `Schema.shape` key presence (unmasking `.passthrough()`) and domain adapter translation (`toDomainX(Schema.parse(fixture))`).
5. **Route Budgets & Massive Bundle Reduction**: Updated `check-route-sizes.cjs` to fail on missing configured routes and evaluate route vs first-load budgets independently. Extracted `ShopStorefront.tsx` using dynamic loading, driving `/shop` First Load JS from **908 kB down to 109 kB** (-799 kB, 88% reduction!). All 3 build warnings honestly traced and stderr captured in `.next-build.log`.
6. **Bare JSON Cast Remediation**: Replaced bare `response.json() as T` casts with validated `safeReadJson` calls in `planetary-positions/route.ts`, `reliableAstronomy.ts`, `recipes/page.tsx`, and admin pages. Baseline ratcheted from 162 prod (171 total) to 145 prod (154 total).
7. **EOPT Promotion & Strict-Index Retirement**: Promoted `exactOptionalPropertyTypes: true` to the base `tsconfig.json`. Enforced strict optionality repo-wide, resolved all 12 script errors and all call sites in `src/`, and retired the redundant `tsconfig.strict-index.json`.
8. **App-Root Reachability**: Extended `deadModules.ts` with `--app-roots` to report four distinct tiers: `appReachable` (1,202), `scriptOnly` (18), `testOnly` (53), and `dead` (0). Pinned `snapshot-witness.ts` lunar phase to guarantee 100% deterministic behavioral parity.

---

## 1. Prerequisite: Natural Jest Teardown (0 Open Handles)

### Root Cause Analysis
Running `jest --detectOpenHandles` isolated two sources of uncollected background handles keeping Jest worker processes alive:
1. **Periodic Eviction Timers**: `setInterval(() => this.cleanupCaches(), 300000)` in `src/data/unified/unifiedFlavorEngine.ts` and 4 instances instantiated at module evaluation in `src/lib/performance/advanced-cache.ts`.
   - Calling `.unref()` on these timers was dangerous because these modules reach client-side bundles (e.g. `unifiedFlavorEngine` -> `flavorCompatibilityLayer` -> `QuickActionsToolbar.tsx` `"use client"`), where `setInterval` returns a numeric ID rather than a Node `Timeout` object, causing browser runtime crashes.
   - Furthermore, wall-clock intervals in serverless functions and browser tabs provide no utility.
2. **PostgreSQL Connection Pool**: `rawPool.ts` created an idle connection pool that was never closed at the end of the test run. Static import in `jest.setup.ts` would drag `pg` into all jsdom suites.

### Solution
- Migrated cache expiration in `unifiedFlavorEngine.ts` and `advanced-cache.ts` to lazy on-read TTL checks (`if (Date.now() - entry.timestamp > ttl) delete entry;`). Completely eliminated background timers.
- Added dynamic import `const { closeDatabase } = await import("@/lib/database/rawPool"); await closeDatabase();` in `tests/setup/jest.setup.ts` inside `afterAll`.
- Removed `--forceExit` from `package.json` test scripts.

### Proof of Resolution
```text
Test Suites: 389 passed, 389 total
Tests:       10 skipped, 4072 passed, 4082 total
Snapshots:   0 total
Time:        17.566 s
Ran all test suites.
Done in 21.43s.
Exit code: 0 (natural exit, no open handles detected)
```

---

## 2. Workstream A: Dual Ratchets & AST Provenance Classification

### Classification Strategy
Replaced name-based heuristics (which allowed renames to game metrics) with provenance classification:
- A type is classified as **wire** if and only if it is derived from `z.input` or `z.output` of a Zod schema under `src/lib/validation/**`, or is explicitly declared in `.lint-debt-baseline.json`.
- All other types are classified as **domain**.
- Ratchet script enforces separate domain, wire, and total ceilings: any increase in domain, wire, or total fails the gate.

### Types Refactored
- `src/types/chat.ts` and `src/types/recipe.ts`: Split into wire schemas (`chatResponseSchemas.ts`, `recipeResponseSchemas.ts`) and clean domain types.
- Removed loose optionality (`?: T | undefined`) in favor of exact optionality (`?: T`).

### Baseline Delta
```text
Phase 37 Starting Loose Optionality: 365
Phase 38 Closeout Loose Optionality: 322 (233 domain, 89 wire)
Reclassification split:
  - 89 reclassified as wire types
  - 43 domain sites genuinely remediated / eliminated
```

---

## 3. Workstream B: Pure `parseEach` & Resilient Envelopes

### Architecture
- Created pure `parseEach<T>(items: unknown[], schema: ZodSchema<T>): { items: T[]; kept: number; dropped: number; total: number }` in `src/lib/api/json.ts`.
- **0 dependencies, 0 imports**: keeps `json.ts` completely leaf-pure without dragging logging services into client-side bundles.
- Allows hooks to differentiate between an empty server response (`total === 0`) and a response where malformed items were dropped (`dropped > 0 && kept === 0`), avoiding false empty states.

### Adopted Call Sites
- `src/hooks/useNotifications.ts`: Parse list with `parseEach(data.notifications, UserNotificationWireSchema)`, maintaining strictness on envelope metadata.
- `src/hooks/useConversation.ts`: Messages parsed with element-level resilience.
- `src/hooks/useTableChat.ts`: Live message updates parsed with item tolerance.
- `src/app/(alchm)/feed/page.tsx`: Feed events parsed with element-level resilience.
- Empty write-acknowledgement handling: Hardened `safeReadJson` to return `{}` for 200 OK responses with empty bodies instead of throwing syntax errors.

### Database Enum Parity Verification
- Created `scripts/checkNotificationEnumParity.ts` to assert that all PostgreSQL `notification_type` enum values are covered in `notificationResponseSchemas.ts`.
- Confirmed 100% parity across all 21 database enum values.

---

## 4. Workstream C: Producer Round-Trip Parity & Red Proofs

### Defect Addressed
Because Zod schemas in `src/lib/validation/**` utilize `.passthrough()`, `Schema.parse(x)` deep-equals `x` unconditionally, masking fields silently dropped during domain adapter conversion.

### Test Upgrades
- Added round-trip tests for 5 schema families: Feed, Notification, Chat, Recipes, UserProfile, Shop, and Instacart.
- Asserted both:
  1. Key presence in `Schema.shape`: `expect(Object.keys(Schema.shape)).toContain("actorRevealed")`
  2. Adapter translation: `expect(toDomainX(Schema.parse(fixture))).toEqual(expectedDomain)`
- Built fixtures directly using producer mappings to avoid synthetic drift.
- Verified red proofs: intentionally dropping an adapter field causes the test suite to fail immediately.

---

## 5. Workstream D: Route Budgets & Bundle Reduction

### Route Budget Gate Upgrades (`check-route-sizes.cjs`)
- Added validation that fails the build if a configured route is missing from the build log.
- Decoupled route size and first-load size checks into independent evaluations.
- Added strict thresholds for `/shop` and `/account`.

### Bundle Reduction Results
Extracted `ShopStorefront.tsx` using `next/dynamic` (`ssr: false`) for `@privy-io/react-auth` and Solana dependencies.

| Route | Pre-Phase 38 First Load | Post-Phase 38 First Load | Budget Ceiling | Delta | Status |
|---|---|---|---|---|---|
| `/` | 197 kB | 197 kB | 220 kB | 0 kB | ✅ Pass |
| `/menu-planner` | 808 kB | 799 kB | 810 kB | -9 kB | ✅ Pass |
| `/recipe-builder` | 182 kB | 182 kB | 200 kB | 0 kB | ✅ Pass |
| `/recipe-generator` | 201 kB | 201 kB | 220 kB | 0 kB | ✅ Pass |
| `/recipes/[recipeId]` | 331 kB | 331 kB | 350 kB | 0 kB | ✅ Pass |
| `/shop` | **908 kB** | **109 kB** | 120 kB | **-799 kB (-88%)** | ✅ Pass |
| `/account` | 898 kB | 898 kB | 910 kB | 0 kB | ✅ Pass |

### Build Warnings Transparency
Updated `package.json` build scripts to pipe `2>&1 | tee .next-build.log` to truthfully capture stderr warnings.
The 3 dependency warnings originate from third-party vendor packages and are recorded:
1. `Module not found: Can't resolve '@farcaster/mini-app-solana' in '@privy-io/react-auth/dist/esm'` (Privy optional Solana connector).
2. `Critical dependency: the request of a dependency is an expression` in `@reown/appkit/.../virtualMasterPool.js` (client build).
3. `Critical dependency: the request of a dependency is an expression` in `@reown/appkit/.../virtualMasterPool.js` (server build).
We explicitly avoided masking these warnings with `exprContextCritical: false` to preserve build transparency.

---

## 6. Workstream E: Bare JSON Casts Remediated

Replaced unvalidated `response.json() as T` calls with `safeReadJson` backed by Zod schemas:
- `src/app/api/planetary-positions/route.ts`
- `src/utils/reliableAstronomy.ts`
- `src/app/recipes/page.tsx`
- Admin dashboards: `admin/chat-reports/page.tsx`, `admin/dashboard/page.tsx`, `admin/feed/comment-reports/page.tsx`, `admin/page.tsx`, `admin/users/page.tsx`.

### Baseline Delta
```text
Pre-Phase 38:  162 production (171 total) across 121 files
Post-Phase 38: 145 production (154 total) across 114 files (-17 casts remediated)
```

---

## 7. Workstream F: Two Measured Decisions

### Decision 1: EOPT Promotion & Strict-Index Retirement
- **Promoted `exactOptionalPropertyTypes: true` to base `tsconfig.json`**.
- Remedied all 12 script errors under EOPT in `scripts/`.
- Fixed all call sites across `src/` to use conditional spreads instead of `{ prop: undefined }`.
- Retired `tsconfig.strict-index.json`, `.strict-index-baseline.json`, and checker scripts since base `tsconfig.json` now enforces strict index access and exact optional properties globally.

### Decision 2: Four-Tier Module Reachability Audit
Extended `scripts/lib/deadModules.ts` and `scripts/auditDeadModules.ts` with `--app-roots`.

```text
Dead Module Audit Results:
==========================
Referrer files scanned : 2,197
Deadness candidates    : 1,273
Entry points           : 924
  of which app-roots   : 383
Reachable (any root)   : 2,202
App-root reachable     : 1,202
Script-only reachable  : 18
Test-only reachable    : 53
UNREACHABLE (dead)     : 0
```

Target Module Classifications:
- `src/utils/ingredientRecommender.ts`: **scriptOnly** (Referrers: `src/__tests__/ingredientRecommender.test.ts`, `scripts/snapshot-witness.ts`).
- `src/utils/cookingMethodRecommender.ts`: **scriptOnly** (Referrers: `src/__tests__/cookingMethodThermodynamicsFallback.test.ts`, `scripts/snapshot-witness.ts`).
- `src/types/ExtendedRecipe.ts`: **testOnly** (Referrers: `tests/extendedRecipe.test.ts`).

### Behavioral Snapshot Witness Stability
Identified that `cookingMethodRecommender.ts` called `new Date()` internally for lunar phase calculations, causing recommendation scores to drift as the real lunar phase changed over the calendar month.
Added an optional `date` parameter (`date: Date = new Date()`), allowing `snapshot-witness.ts` to pin the First Quarter phase matching `testAstroContext.lunarPhase`. Parity is now 100% deterministic.

---

## 8. Final Gate Verification

All verification commands pass cleanly with exit code 0:
```bash
# Static Verification (12 gates)
bun run verify:static
  - check:untracked: 0 untracked files
  - check:scripts: 66 baseline, 0 regressions
  - check:lint-debt: passed (loose optionality: 322)
  - check:dead-modules: passed (0 dead)
  - check:read-json: passed (0 unvalidated)
  - check:bare-json-casts: passed (145 prod / 154 total)
  - check:snapshot-witness: passed (100% parity)
  - test:gates: passed (8/8 suites, 124 tests)

# Test Suite
bun run test --passWithNoTests
  - 389 test suites passed, 4,072 tests passed (0 failures, natural exit 0)

# Production Build & Route Budgets
bun run build
  - Next.js production build succeeded
  - Route size checks: all 7 targeted routes within budget
```

Phase 38 is complete, verified, and ready for commit and merge.
