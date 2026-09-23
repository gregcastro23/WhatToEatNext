# Phase 39: Nutrition Schema Hardening, Migration 30 Parity, and Producer-Bound Round-Trip Coverage

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then implement and verify; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks dependent work, and continue independent work meanwhile.

---

## 1. Starting State (Measured on `master` @ `ae4c1d9d`, September 22, 2026)

Phase 38 was squashed and merged into `origin/master` as commit [`ae4c1d9d`](https://github.com/gregcastro23/WhatToEatNext/commit/ae4c1d9d5f0a041e79e7e6e685098027e46c7dfe) via PR #865. The working tree is clean.

### Commit History Reference:
- `ae4c1d9d`: `feat(phase-38): honest boundaries, route budgets, and EOPT promotion (#865)`
- `f48b6e8c`: `docs(phase-38): correct production enum gap diagnosis to migration 30 and align notification resilience`
- `fbb0b75b`: `fix(phase-38): fix waning crescent mapping, notification badge resilience, recipe parseEach, and ratchet lint-debt baseline`
- `334aadaa`: `fix(phase-38): remediate review findings, runtime validation, and honest boundaries`
- `20c15467`: `feat(phase-37): zero strict debt, client boundary validation, and defect fixes (#863)`

### Verified Gate State on `master`:

| Gate / Command | Measured Value | Baseline / Ceiling | Status |
|---|---:|---:|---|
| `check:untracked` | 0 untracked files | 0 | ✅ Clean |
| `check:route-validation` | 0 unvalidated / 123 body routes | 0 | ✅ 100% Compliant |
| `test:gates` | 8/8 suites, 124 tests passed | 8/8 | ✅ Pass |
| `check:scripts` | 66 baseline errors across 32 files | ≤66 | ✅ Met (0 regressions) |
| `typecheck` | 0 errors | 0 | ✅ Zero Type Errors |
| `lint:scripts` | 0 errors, 25 warnings | 0 errors | ✅ Pass |
| `lint:debt` (Casts) | **165 casts** | ≤165 | ✅ Ratcheted (-2) |
| `lint:debt` (Assertions) | **3,208 sites** | ≤3,208 | ✅ Ratcheted (-3) |
| `lint:debt` (Tracked debt) | **1,327 sites** | ≤1,327 | ✅ Ratcheted (-6) |
| `lint:debt` (Declined pool) | 4,904 sites | 4,904 | ✅ Constant |
| `lint:debt` (Loose Domain) | **233 sites** | ≤233 | ✅ Segregated (89 wire) |
| `audit:dead-modules` | 0 dead modules (1,202 reachable) | 0 | ✅ Pass |
| `check:read-json` | 0 unvalidated / 97 calls | 0 unvalidated | ✅ 100% Compliant |
| `check:bare-json` | 145 prod / 154 total (112 files) | ≤145 | ✅ Met |
| `check:snapshot-witness` | 100% behavioral parity | 100% | ✅ Exact Parity |
| `bun run test` | 389 suites, 4,080 passed, 0 failed | natural exit 0 | ✅ Clean Teardown (0 open handles) |
| `bun run build` | 7/7 route size checks pass | ceilings met | ✅ Pass (`/shop` 109 kB vs 120 kB ceiling) |

---

## 2. Key Context & Known Gaps from Phase 38 Closeout

### P1: Production Notification Enum Gap (Migration 30)
- **Finding**: Production DB (`tramway.proxy.rlwy.net:35670`) contains 17 values, while codebase migrations define 19 values (and client schema defines 20 with client-side `agent_broadcast`).
- **Actual Gap**: Production is missing `quest_completed` and `master_quest_broadcast` from **Migration 30** (`database/init/30-notification-type-master-quest-broadcast.sql`). Production already has Migration 67's `reaction_received` and `comment_received`.
- **Impact**: `QuestService.ts:798` inserts `'master_quest_broadcast'::notification_type`, which production PostgreSQL will reject if reached.
- **Action**: Verify whether Migration 30 can be applied cleanly to production DB or if `QuestService` requires defensive fallback handling for environments where Migration 30 has not been run.

### P2: Invariant §4 — Intermediate Nutrition Parsing in `parseJsonValue<T>`
- **Finding**: While the double assertions `as unknown as NonNullable<Recipe['nutrition']>` were removed in `LocalRecipeService.ts`, intermediate parsing in `parseJsonValue<T>` remains `JSON.parse(v) as T`.
- **Action**: Replace `parseJsonValue<T>` with concrete Zod validation using `ValidatedRecipeSchema` or a dedicated `RecipeNutritionSchema`.

### P3: Workstream C Remainder (UserProfile, Shop, Instacart Round-Trips)
- **Finding**: Schemas and domain adapters were defined in Phase 38 (`toDomainUserProfile`, `toDomainShopItem`, `toDomainInstacartRetailer`), but round-trips currently use synthetic shape checks rather than live producer fixtures, and consumer layers (`UserContext`, `ShopStorefront`, `InstacartService`) are not yet piped through these validation boundaries.
- **Action**: Build full producer-to-consumer round-trip tests and integrate the validation adapters into the real consumption paths.

---

## 3. Workstreams for Phase 39

### Workstream A: Invariant §4 Diff-Level Guard & Nutrition Boundary
1. **Prevent Assertion Slippage**:
   - Add a diff-level check or gate script (`scripts/checkDiffAssertions.ts`) to ensure PR diffs do not introduce new `as <Type>` or `as unknown as <Type>` casts.
2. **Harden Recipe Nutrition Boundary**:
   - In `LocalRecipeService.ts`, replace `parseJsonValue(row.nutritional_profile)` with a runtime Zod validator (`RecipeNutritionSchema.safeParse`).
   - Eliminate the remaining unchecked `as T` inside `parseJsonValue`.

### Workstream B: Production Enum Parity & Quest Broadcast Resilience
1. **Defensive Notification Inserts**:
   - In `src/services/QuestService.ts:798`, wrap the `'master_quest_broadcast'::notification_type` insert with error handling or check live enum capabilities before inserting.
2. **Migration Runbook / Verification**:
   - Provide an idempotent verification script to confirm database schema migrations on Railway (`ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'quest_completed';` and `'master_quest_broadcast'`).

### Workstream C: Complete Workstream C Round-Trip Wiring
1. **`userProfile`**:
   - Test both producer paths: the Hono `/api/user/profile` route and the direct database path (`userDatabaseService.ts`).
   - Wire `toDomainUserProfile` into `src/contexts/UserContext.tsx` or `src/hooks/useProfile.ts`.
2. **`shop`**:
   - Wire `ShopItemSchema` and `toDomainShopItem` into `ShopStorefront.tsx` with element-level resilience (`parseEach`).
3. **`instacart`**:
   - Wire `InstacartRetailerSchema` and `toDomainInstacartRetailer` into `InstacartService.ts`.

### Workstream D: Loose Optionality Domain Ratchet (Target: ≤220)
- Current state: 233 domain sites (ratcheted from 276; 89 wire segregated).
- Continue converting domain types using the adapter pattern (`XWire` from Zod output, domain type with exact optionality).
- Focus on the concentrated files identified in Phase 38:
  - `src/types/yelp.ts`
  - `src/services/restaurantDiscoveryService.ts`
  - `src/utils/menuPlanner/recommendationBridge.ts`
  - `src/types/foodDiary.ts`
- Ratchet `.lint-debt-baseline.json` domain loose optionality count accordingly.

### Workstream E: Bare JSON Casts by Surface
- 145 production casts remain across 112 files.
- Pick by functional surface rather than counter-grinding:
  - `src/app/api/planetary-positions/route.ts`
  - `src/utils/reliableAstronomy.ts`
  - `src/app/admin/*`
- Validate reads with Zod schemas and ratchet `.bare-json-casts-baseline.json`.

### Workstream F: Route Budgeting for `/account` and `/menu-planner`
- `/account` is currently 898 kB (ceiling: 910 kB). Target: split heavy Web3/auth chunks dynamically as done for `/shop`.
- `/menu-planner` is currently 799 kB (ceiling: 810 kB). Target: evaluate dynamic imports for drag-and-drop / heavy calendar libs to move toward <750 kB.

---

## 4. Invariants

- **Bun Only**: Always use `bun run` for dev commands, test runners, and build scripts.
- **Never Fabricate Values**: Missing elements, modalities, or coordinates render as unknown or are omitted.
- **No New Unchecked Casts**: All boundary parsing must use Zod or type guards; no new `as unknown as T` assertions.
- **Natural Worker Exits**: Never re-introduce `--forceExit` to test scripts. All suites must clean up resources and exit naturally.
- **Ratchet Strictly**: Update baselines only downward via their respective ratchet commands (`bun run lint:debt --ratchet`, etc.).
- **Process Hygiene**: Check for active listeners on port 3000 before dev runs; terminate any spawned dev processes when tasks conclude.
- **Single Worktree Rule**: Do not touch uncommitted edits from other active tasks/stashes. Keep commits atomic and clean.

---

## 5. Verification Commands

Run the full verification battery prior to PR creation:

```sh
bun run verify:static
bun run test
bun run build
```

Every command must exit with code 0.
