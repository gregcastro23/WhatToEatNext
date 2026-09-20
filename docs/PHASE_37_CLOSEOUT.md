# Phase 37 Closeout: Zero Strict Debt and High-Impact Boundary Validation

_Completed: September 20, 2026 | Branch: `codex/phase-37-typescript-health`_

---

## Executive Summary

Phase 37 accomplished the elimination of application strict-flags debt from 26 errors to **0 errors across 0 files**, reinforced critical client-side API response boundaries with runtime Zod validation schemas across 81 calls, resolved 5 critical code review defects (D1–D5), and ratcheted all baselines downwards while maintaining 100% behavioral parity on the alchemical snapshot witness.

**Honest Assessment on Targets**:
- 9 of 10 primary targets were fully met or exceeded.
- **1 required target was missed**: AST loose optionality (`?: T | undefined`) was reduced from 392 to **365**, falling short of the **≤350** required outcome by **15 sites**. An explicit analysis and continuation plan are detailed below.
- Both test and build suites completed successfully (exit code 0), with full disclosure of a Jest worker process open-handle force-exit and Next.js third-party SDK build warnings.

---

## Git State & Commits

- **Base Commit / Starting HEAD**: `24ed8912` (Phase 36 merge)
- **Active Branch**: `codex/phase-37-typescript-health`
- **Working Tree State**: All 6 validation schemas (`src/lib/validation/`), 57 modified source files, and 4 ratcheted baseline files are committed to `codex/phase-37-typescript-health`.
- **Inherited vs Campaign Work**: Inherited Phase 36 uncommitted closeout changes were preserved and integrated into this branch.

---

## Metrics & Baseline Ratchet Summary

| Metric / Gate | Starting Baseline | Live Measured Result | Required Target | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Strict-Index Errors (`strict-index:check`)** | 26 in 26 files | **0 in 0 files** | **0** | ✅ **MET (Zero Debt)** |
| **Scripts Typecheck Errors (`check:scripts`)** | 95 in 38 files | **66 in 32 files** | **≤70** | ✅ **MET (-29 errors)** |
| **Bare JSON Response Casts (`check:bare-json`)** | 188 prod (197 total) | **162 prod (171 total)** | **≤175** (stretch ≤165) | ✅ **MET (Stretch Exceeded)** |
| **Read JSON Response Validation (`check:read-json`)** | 0 unvalidated / 30 calls | **0 unvalidated / 81 calls** | **0 unvalidated** | ✅ **MET (+51 calls validated)** |
| **Tracked Lint Debt (`lint:debt`)** | 1,334 debt | **1,333 debt** | No regression | ✅ **MET (-1 debt)** |
| **Declined Rules Pool** | 4,905 items | **4,904 items** | No regression | ✅ **MET (-1 item)** |
| **AST Total Assertion Sites** | 3,260 sites | **3,231 sites** | No regression | ✅ **MET (-29 sites)** |
| **Single Assertion Sites** | 3,094 sites | **3,065 sites** | No regression | ✅ **MET (-29 sites)** |
| **Non-Null Assertions (`!`)** | 605 sites | **603 sites** | No regression | ✅ **MET (-2 sites)** |
| **AST Loose Optionality (`?: T \| undefined`)** | 392 sites | **365 sites** | **≤350** | ⚠️ **MISSED BY 15 SITES** |
| **Snapshot Witness Parity (`check:snapshot-witness`)** | 100% parity | **100% parity** | 100% exact parity | ✅ **MET (No re-record)** |
| **Jest Test Suite (`bun run test`)** | 389 suites | **389 suites / 4,037 tests passed (0 failed)** | 100% green | ✅ **MET (With worker leak disclosed)** |
| **Next.js Production Build (`bun run build`)** | Passed | **Passed (exit 0, route budgets met)** | Passed | ✅ **MET (With warnings inventoried)** |

---

## Analysis of Missed Target: Loose Optionality (365 vs ≤350)

### Why the Target Was Missed
The required target was `≤350`, but live AST scanning recorded `365` sites (a reduction of 27 from the 392 starting baseline, but missing the target by 15).

During the campaign, we investigated tightening optionality across `src/types/natalChart.ts`, `src/types/table.ts`, and client-side wire schemas. Under TypeScript's `exactOptionalPropertyTypes: true`, declaring a property as `prop?: T` strictly forbids assigning `undefined`. However:
1. Zod's `.optional()` inherently infers `T | undefined` for optional keys.
2. Direct client-side JSON reads and wire representations receive absent keys as `undefined` at runtime.
3. Tightening types that directly receive parsed JSON outputs creates immediate TS2375 compiler errors unless explicit adapters or type assertions are introduced.

Rather than introducing artificial casts or suppressing compiler checks to hit an arbitrary counter, we chose to maintain strict type safety and leave `| undefined` where it accurately reflects wire reality.

### Phase 38 Continuation Plan
To safely bring loose optionality below 350 in Phase 38:
1. **Wire vs Domain Decoupling**: Explicitly separate wire DTOs (which accept `T | undefined` from network JSON) from internal domain entities (which enforce `prop?: T`).
2. **Adapter Layer**: Implement explicit builder/adapter functions (e.g. `toDomainNatalChart()`, `toDomainTable()`) that strip undefined values via conditional property spreads (`...(val !== undefined ? { prop: val } : {})`) at the boundary.
3. This will allow domain types in `src/types/` to be tightened to `?: T` without conflicting with Zod's wire inference.

---

## Detailed Resolutions of Code Review Defects (D1–D5 & Review Items)

### Defect 1: Profile Save 400 on Legacy Charts (`PUT /api/user/profile`)
- **Problem**: `PUT /api/user/profile` was initially tightened with a strict `NatalChartDomainSchema` that required 9 top-level keys (`dominantElement`, `elementalBalance`, `calculatedAt`, etc.). An exposure query run against production PostgreSQL revealed that **71 of 79 stored natal charts** are legacy records lacking modern elemental and alchemical properties. Every attempt by an onboarded user to update trivial profile data (name, dietary preferences, cooking style) triggered a 400 Bad Request.
- **Resolution**:
  - Kept the chart validation tolerant using `.passthrough()` with optional subfields.
  - Required validation only on patch fields explicitly submitted by the client.
  - Routine profile saves succeed for all users without corrupting or rejecting legacy charts.

### Defect 2: Malformed Nested Values Forcing Users "Offline" (`userProfileResponseSchemas.ts` / `UserContext`)
- **Problem**: In `userProfileResponseSchemas.ts`, all-or-nothing validation rejected the whole response if an auxiliary nested field was malformed (e.g., lowercase element name or null planet position). `UserContext` caught this failure and set `isOffline(true)`, silently turning authenticated users into offline guests across the application.
- **Resolution**:
  - Decoupled session-critical identity fields from optional celestial properties.
  - Implemented resilient parsers with safe fallbacks: if an auxiliary nested property fails, it degrades safely to `undefined` via `.catch(undefined)` without aborting the authentication session.
  - **Client-Side Rewrite Note**: `DominantElementSchema` normalizes lowercase inputs (`"fire"` → `"Fire"`). This is a client-side rewrite to protect legacy UI consumers that expect capitalized element keys.
  - Decomposed `parseServerProfile` into modular helpers (`deriveAlchemicalStats`, `buildCorePatchPayload`) to keep cyclomatic complexity ≤ 14, satisfying both ESLint complexity rules and `exactOptionalPropertyTypes`.

### Defect 3: Feed Schema Stripping `actorRevealed` (`feedResponseSchemas.ts`)
- **Problem**: `FeedEventWireSchema` used a plain `z.object` that stripped undeclared fields. Because `actorRevealed` was omitted from the schema definition, the parser stripped `actorRevealed: true` to `undefined` at runtime, causing cooked-dish feed cards to lose chef attribution in `feed/page.tsx`.
- **Resolution & Guard**:
  - Explicitly added `actorRevealed: z.boolean().optional()` to `FeedEventWireSchema`.
  - Added a dedicated producer-shaped round-trip test in `src/lib/validation/__tests__/boundaryValidationSchemas.test.ts` that tests both `actorRevealed: true` and `actorRevealed: false`, ensuring future schema edits cannot silently drop this field.

### Defect 4: Migration Scripts Failing Open (`reattributeChefFeedEvents.ts`)
- **Problem**: In `scripts/reattributeChefFeedEvents.ts`, the "producer still live" refusal check evaluated `if (firstRecent && ...)`. When the target row was missing or null, the check was bypassed, reporting `0` affected rows and proceeding as if successful (failing open).
- **Resolution**:
  - Replaced ambiguous truthiness checks with fail-closed assertions (`!== undefined && !== null`) across lines 52, 170, and 241.
  - Missing rows or unexpected database responses now throw an error immediately and terminate execution with a non-zero exit code.

### Defect 5: Elimination of Forbidden `as unknown as` Double Casts
- **Problem**: 5 forbidden double casts (`as unknown as TargetRow[]`) were introduced across `scripts/backfillSignupGrants.ts`, `scripts/backfillHumanNatalPositions.ts`, and `src/app/api/user/profile/route.ts` because TypeScript interfaces do not satisfy index signature requirements for `QueryResultRow`.
- **Resolution**:
  - Changed interface definitions from `interface TargetRow` to `type TargetRow = { ... }`.
  - TypeScript generates implicit index signatures for type aliases, enabling `executeQuery<TargetRow>` to resolve its generic cleanly without any unchecked or double assertions.

### Aspect Adapter Casing Repair (`src/utils/ingredientRecommender.ts`)
- **Problem**: The aspect adapter previously mapped lowercase `PlanetaryAspect.type` (`"conjunction"`) into comparisons against capitalized `"Conjunction"` (`ingredientRecommender.ts:2780` → `:3053`), leaving the recommendation branch dead despite compiling cleanly.
- **Resolution**: Updated the comparisons at lines 3053 and 3065 to compare case-insensitively using `.toLowerCase()` (`"conjunction"`, `"trine"`), restoring runtime functionality to the branch while maintaining 100% snapshot witness parity.

### Notification List Validation Risk (Carried to Phase 38)
- Notifications currently use an all-or-nothing schema with a closed enum matching existing database migrations.
- If a new notification type is added in the database via `ALTER TYPE ... ADD VALUE` before the client schema is updated, the parser would reject the entire notification payload, blanking the bell icon.
- **Phase 38 Task**: Migrate notification list parsing to an item-level parser (`parseEach` helper) so that unfamiliar notification types are dropped individually rather than invalidating the entire list.

---

## Test & Build Verification Logs

### 1. Static Verification (`bun run verify:static`)
```
$ bun run check:untracked && bun run check:route-validation && bun run test:gates && bun run strict-index:check && bun run check:scripts && bun run typecheck && bun run lint && bun run lint:scripts && bun run lint:debt && bun run audit:dead-modules && bun run check:read-json && bun run check:bare-json && bun run check:snapshot-witness

=== STRICT FLAG ERRORS: 0 total across 0 files ===
Baseline: 0 total errors across 0 files (0 allowlisted)
✅ Strict flags check passed.

=== SCRIPT TYPECHECK ERRORS: 66 total across 32 files ===
Baseline: 66 total errors across 32 files
✅ Script typecheck check passed.

=== READJSON VALIDATION: 0 unvalidated / 81 total response-reading calls ===
Baseline: 0 unvalidated across 30 response calls (0 allowlisted)
✅ readJson validation check passed.

=== BARE JSON CASTS: 162 production (171 total) across 122 files ===
Baseline: 162 production (171 total) across 122 files
✅ Bare JSON casts check passed.

✅ Behavioral snapshot witness: 100% parity with baseline.
```

### 2. Jest Test Suite (`bun run test`)
```
Test Suites: 389 passed, 389 total
Tests:       10 skipped, 4037 passed, 4047 total
Snapshots:   0 total
Time:        14.678 s, estimated 16 s
Ran all test suites.
```

**Worker Process Leak Disclosure**:
The Jest test runner prints:
```
A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
```
**Open Handle Diagnosis**:
- This warning occurs during multi-worker Jest runs when background asynchronous handles (e.g. database connection pools or uncleared timers in integration tests) remain referenced after test completion.
- Running with `--detectOpenHandles` isolates the issue to persistent pg poolers and background interval timers in test mock setups that lack explicit teardown hooks. The test suite passes all 4,037 assertions cleanly with exit code 0.

### 3. Next.js Production Build (`bun run build`)
```
$ bash -c 'set -o pipefail; next build | tee .next-build.log && node ./scripts/check-route-sizes.cjs .next-build.log'
   ▲ Next.js 15.5.19
   - Environments: .env.production.local, .env.local, .env.production, .env

   Creating an optimized production build ...
 ⚠ Compiled with warnings in 34.2s

Route (app)                               Size     First Load JS
┌ ƒ /                                  22.5 kB         197.0 kB
├ ○ /menu-planner                       203 kB         799.0 kB
├ ○ /recipe-builder                     6.5 kB         182.0 kB
├ ƒ /recipe-generator                  11.7 kB         201.0 kB
└ ● /recipes/[recipeId]                51.7 kB         330.0 kB

✅ Route / is within threshold: 22.5 kB route / 197.0 kB first-load (Max: 150 kB / 250 kB)
✅ Route /menu-planner is within threshold: 203.0 kB route / 799.0 kB first-load (Max: 400 kB / 950 kB)
✅ Route /recipe-builder is within threshold: 6.5 kB route / 182.0 kB first-load (Max: 150 kB / 250 kB)
✅ Route /recipe-generator is within threshold: 11.7 kB route / 201.0 kB first-load (Max: 150 kB / 250 kB)
✅ Route /recipes/[recipeId] is within threshold: 51.7 kB route / 330.0 kB first-load (Max: 150 kB / 400 kB)
✅ All targeted routes passed bundle size checks.
Build completed successfully with exit code 0.
```

**Build Warning Inventory**:
During compilation, Next.js emitted 3 dependency warnings originating from external Web3 and authentication packages:
1. `./node_modules/@privy-io/react-auth/dist/esm/index-DVzZhJ9X.mjs`:
   `Module not found: Can't resolve '@farcaster/mini-app-solana' in '.../node_modules/@privy-io/react-auth/dist/esm'`
   (Import trace: `./src/app/(alchm)/account/page.tsx`)
2. `./node_modules/@reown/appkit/node_modules/viem/node_modules/ox/_esm/tempo/internal/virtualMasterPool.js`:
   `Critical dependency: the request of a dependency is an expression`
   (Import trace: `./src/app/(alchm)/account/page.tsx`)
3. `./node_modules/x402/node_modules/viem/node_modules/ox/_esm/tempo/internal/virtualMasterPool.js`:
   `Critical dependency: the request of a dependency is an expression`
   (Import trace: `./src/app/(alchm)/account/page.tsx`)

These warnings represent missing optional peer dependencies and dynamic imports inside `@privy-io`, `@reown/appkit`, and `x402`. They do not block static page generation or impact production bundling.

---

## Conclusion & Phase 38 Handover Priorities

Phase 37 successfully delivered zero strict-flags debt, hardened client-side response parsing, and eliminated critical defect vectors.

**Phase 38 Priorities**:
1. **Loose Optionality**: Implement wire-versus-domain type adapters to eliminate the remaining 15 loose optionality sites (bringing count from 365 to ≤350).
2. **Notification List Resilience**: Implement `parseEach` item-level validation on notification responses to tolerate unknown schema values.
3. **Jest Teardown Cleanup**: Add explicit pooler teardown and `.unref()` calls to eliminate the worker process force-exit warning.
4. **Bare JSON Casts**: Continue ratcheting bare JSON casts down from 162 towards ≤140.
