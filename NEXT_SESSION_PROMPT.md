# Phase 40: ASOL Signature Enforcement, Inbound Delivery Hardening, Domain Loose Optionality (≤200), and Bare JSON Cast Ratchet

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then implement and verify; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks dependent work, and continue independent work meanwhile.

---

## 1. Starting State (Measured on `feat/phase-39-nutrition-migration30-roundtrips` / PR #869, September 23, 2026)

Phase 39 and the ASOL Contract Follow-ups are complete on branch `feat/phase-39-nutrition-migration30-roundtrips` (PR #869). All static gates, tests, and production build checks pass with 0 errors and 0 warnings.

### Preceding Commit Reference (PR #869):
- `d47cb923`: `refactor(asol): modularize admin delivery health components and enforce strict lint compliance`
- `0647e66d`: `fix(users): validate check-shared request body with zod safeParse`
- `4e12109d`: `feat(admin): asol delivery health dashboard and telemetry service`
- `c9fe5683`: `feat(webhooks): standard webhooks signature verifier and test vectors`
- `53581798`: `feat(asol-contract): implement sync-status, check-shared, and vessel endpoints`
- `b97545a6`: `feat(agents): internal agent roster endpoint for fleet visibility`
- `8337fd6d`: `feat(webhooks): inbox deduplication for asol inbound routes`
- `887a2aed`: `feat(recipes): attach internal bearer auth to agent recipe prewarm`
- `8d1f8b93`: `fix(security): timing-safe bearer check for feed api and secret comparison scan test`
- `19b40c90`: `fix(phase-39): pass repoRoot to resolveBaseRef in diff guard and enable tls in enum parity CLI`
- `5a4764b1`: `feat(hooks): webhook_events record, constant-time secrets, Vercel deployment webhook (Phases 0–1) (#868)`

### Verified Gate State:

| Gate / Command | Measured Value | Baseline / Ceiling | Status |
|---|---:|---:|---|
| `check:untracked` | 0 untracked files | 0 | ✅ Clean |
| `check:route-validation` | 0 unvalidated / 123 body routes | 0 | ✅ 100% Compliant |
| `test:gates` | 10/10 suites, 147 tests passed | 10/10 | ✅ Pass |
| `check:scripts` | 66 baseline errors across 32 files | ≤66 | ✅ Met (0 regressions) |
| `typecheck` | 0 errors | 0 | ✅ Zero Type Errors |
| `lint:scripts` | 0 errors, ≤25 warnings | 0 errors | ✅ Pass |
| `lint:debt` (Casts) | **165 casts** (38 asAny, 127 asUnknownAs) | ≤165 | ✅ Met |
| `lint:debt` (Assertions) | **3,185 sites** | ≤3,186 | ✅ Decreased (-1) |
| `lint:debt` (Single assertions) | **3,021 sites** | ≤3,022 | ✅ Decreased (-1) |
| `lint:debt` (Tracked debt) | **1,320 sites** | ≤1,322 | ✅ Decreased (-2) |
| `lint:debt` (Declined pool) | **4,891 sites** | ≤4,892 | ✅ Decreased (-1) |
| `lint:debt` (Loose Domain) | **216 sites** | ≤220 | ✅ Met (89 wire segregated) |
| `audit:dead-modules` | 0 dead modules (1,282 reachable) | 0 | ✅ Pass |
| `check:read-json` | 0 unvalidated / 108 calls | 0 unvalidated | ✅ 100% Compliant |
| `check:bare-json` | 139 prod / 148 total (109 files) | ≤139 prod | ✅ Met |
| `check:diff-assertions` | **0 new type assertions** across 70 diff files | 0 | ✅ Zero Slippage |
| `check:snapshot-witness` | 100% behavioral parity | 100% | ✅ Exact Parity |
| `bun run test` | 430 suites, 4,325 passed, 0 failed | natural exit 0 | ✅ Clean Teardown |
| `bun run build` | 7/7 route size checks pass | ceilings met | ✅ Pass (`/account` 109 kB, `/menu-planner` 289 kB) |

---

## 2. Key Accomplishments & Context Handed Off from Phase 39

1. **ASOL Contract Alignment Completed (PRs #41, #43, #44)**:
   - All 7 contract deliverables are fully implemented on WTEN:
     - Constant-time secret checking on `/api/feed` via `crypto.timingSafeEqual`.
     - Internal bearer authentication for outbound recipe generation prewarm (`Authorization: Bearer <INTERNAL_API_SECRET>`).
     - Webhook inbox deduplication (`src/lib/hooks/idempotency.ts`) using `webhook_events` with SHA-256 event normalization and replay of completed results.
     - Agent roster endpoint (`/api/internal/agent-roster`) serving `@agentic.alchm.kitchen` accounts with natal charts, tier, and counts.
     - Three missing contract endpoints: `/api/economy/sync-status`, `/api/internal/users/check-shared`, and `/api/economy/vessel`.
     - Admin delivery health monitoring dashboard at `/admin/asol` powered by `asolHealthService.ts`.
     - Standard Webhooks signature verification engine (`standardWebhooks.ts`) supporting `v1` HMAC-SHA256 signatures, drift tolerance, and three-state gating (`off`, `permissive`, `enforced`).
2. **Migration 30 & Production Parity Verified**:
   - `database/init/88-notification-type-agent-broadcast.sql` created and verified against production database.
   - `scripts/verifyNotificationEnumParity.ts` confirmed 20/20 notification types in full parity on production Railway PostgreSQL.
   - Replaced legacy `notif_...` string identifiers with standard UUIDs (`crypto.randomUUID()` and `uuid_generate_v4()`), resolving PostgreSQL `22P02` syntax errors.
3. **Fail-Closed Diff Assertion Guard**:
   - `scripts/lib/diffAssertions.ts` runs in `verify:static` and CI, rejecting any newly introduced `as <Type>` or `as unknown as <Type>` assertions across PR diffs.

---

## 3. Workstreams for Phase 40

### Workstream A: ASOL Phase 3 Rollout & Webhook Signature Gating
1. **Signature Enforcement Mode Promotion**:
   - Upstream ASOL (agents.alchm.kitchen) is shipping symmetric `v1` signing headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`).
   - Coordinate rollout of `ASOL_WEBHOOK_SIGNATURES`:
     - Transition runtime from `"permissive"` (log-only failures) to `"enforced"` (reject unauthenticated or drifted deliveries with 401/400).
   - Ensure webhook replay responses return appropriate HTTP status codes (200 for processed duplicates, 503/429 for in-flight collisions to trigger provider backoff).
2. **Admin Telemetry & Alerting**:
   - Add alert triggers to `/admin/asol` when in-flight webhook counts exceed threshold or p95 delivery latency degrades > 1000ms.
   - Add filter / inspection controls to view failed deliveries and inspect `last_error` payloads safely.

### Workstream B: Loose Optionality Domain Ratchet (Target: ≤200)
1. **Current State**:
   - 216 domain sites (89 wire segregated in `wireAllowlist`).
2. **Target File Clusters**:
   - `src/utils/menuPlanner/recommendationBridge.ts`
   - `src/types/foodDiary.ts`
   - `src/services/restaurantDiscoveryService.ts`
   - `src/types/yelp.ts`
3. **Execution**:
   - Convert loose optional fields (`?: T | undefined`) to explicit union types or exact optionality using the adapter pattern (`toDomain...`).
   - Run `bun run lint:debt` and ratchet `.lint-debt-baseline.json` down from 216 towards ≤200.

### Workstream C: Bare JSON Casts by Surface (Target: ≤130 prod / ≤140 total)
1. **Current State**:
   - 139 production bare casts (148 total) across 109 files.
2. **High-Value Target Surfaces**:
   - `src/app/api/planetary-positions/route.ts` & `src/utils/reliableAstronomy.ts`
   - `src/services/yelpRestaurantService.ts` / external discovery client boundaries
   - `src/services/InstacartService.ts` and `src/services/AmazonFreshService.ts`
3. **Execution**:
   - Replace unchecked `(await res.json()) as T` with schema-validated `readJson` or Zod `.safeParse`.
   - Ratchet `.bare-json-casts-baseline.json`.

### Workstream D: AST Assertion Sites & Single Assertions Ratchet (Target: <3,000 single)
1. **Current State**:
   - 3,021 single assertion sites (improved from 3,039 in Phase 38).
   - 3,185 total assertion sites.
2. **Strategy**:
   - Target high-density assertion areas:
     - `src/data/seasonings/` (replace manual `as Seasoning` casts with const assertions or typed array factories).
     - `src/services/cartService.ts` & `src/services/mealPlanner/`.
   - Bring single assertion sites under 3,000 without introducing any new assertions (enforced by `checkDiffAssertions.ts`).

### Workstream E: Cross-Service Synthetic Contract Probe (WTEN ↔ ASOL)
1. **Synthetic E2E Probe**:
   - Create a synthetic test / health probe exercising the full contract loop:
     - Enumerate fleet via `/api/internal/agent-roster`.
     - Validate recipe generation dispatch headers (`Authorization: Bearer`).
     - Submit mock webhook payload to `/api/feed` and verify inbox claiming, duplicate detection, and stored result retrieval.
     - Validate email lookup on `/api/internal/users/check-shared`.
     - Inspect vessel telemetry on `/api/economy/vessel`.
   - Add probe to the automated health monitoring runner (`/admin/health` or synthetic cron).

### Workstream F: Route Budget Maintenance & Code Splitting
1. **Route Budgets**:
   - Monitor all 7 tracked routes:
     - `/` (target < 50 kB route / < 220 kB first-load)
     - `/menu-planner` (target < 60 kB route / < 320 kB first-load; currently 289 kB)
     - `/shop` (target < 15 kB route / < 120 kB first-load; currently 109 kB)
     - `/account` (target < 15 kB route / < 125 kB first-load; currently 109 kB)
     - `/recipes/[recipeId]` (target < 80 kB route / < 350 kB first-load; currently 331 kB)
   - Evaluate dynamic component splitting on `/recipes/[recipeId]` to move first-load JS under 300 kB.

---

## 4. Invariants

- **Bun Only**: Always use `bun run` for dev commands, test runners, and build scripts. Never run `npm` or `yarn`.
- **Zero Assertion Invariant**: Never add new `as <Type>` or `as unknown as <Type>` casts. `bun scripts/checkDiffAssertions.ts` must always exit 0.
- **Natural Worker Exits**: Never re-introduce `--forceExit` to test scripts. All suites must clean up resources and exit naturally.
- **Ratchet Strictly**: Update baselines only downward via their respective ratchet commands (`bun run lint:debt:ratchet`, `check:bare-json:ratchet`, etc.).
- **Process Hygiene**: Check for active listeners on port 3000 before dev runs (`lsof -ti:3000`); terminate any spawned dev processes when tasks conclude.
- **Atomic Git Commits**: Explicit staging only (`git add <file1> <file2>`), never `git add -A` or `git add .`.

---

## 5. Verification Commands

Run the full verification suite before any PR creation:

```sh
bun run verify:static
bun run test --passWithNoTests
bun run build
```

Every command must exit with code 0.
