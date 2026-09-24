# Phase 41: Domain Loose Optionality (≤175), Bare JSON Casts (≤115), and Scripts Typecheck Hardening

Implement this campaign end to end in the existing WhatToEatNext repository. Start with a short evidence-based plan, then implement and verify; do not stop at a proposal. Use judgment for routine reversible decisions. Ask only when a missing requirement or permission genuinely blocks dependent work, and continue independent work meanwhile.

---

## 1. Starting State (Measured on `codex/phase-40-asol-hardening`, September 23, 2026)

Phase 40 is complete on branch `codex/phase-40-asol-hardening`. All static gates, full test suites (432 suites, 4,362 tests), and production build checks pass with 0 errors and 0 warnings.

### Preceding Commit Reference (Phase 40):
- `4a7a2a30`: `feat(debt): domain loose optionality <= 193, bare json <= 128, assertions <= 2983 (#B, #C, #D, #E)`
- `062620d5`: `style(admin): alphabetical import order in asol health page`
- `345f9be0`: `feat(admin): 24h delivery telemetry, signature audit, and stale lock alerts (#A2, #A3)`
- `e56a3c52`: `feat(hooks): in-flight conflict marker on 409 for ASOL delivery contract (#A1)`

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
| `lint:debt` (Assertions) | **3,147 sites** (2,523 prod, 624 test) | ≤3,147 | ✅ Decreased (-39) |
| `lint:debt` (Single assertions) | **2,983 sites** | ≤2,983 | ✅ Decreased (-39) |
| `lint:debt` (Tracked debt) | **1,320 sites** | ≤1,320 | ✅ Decreased (-2) |
| `lint:debt` (Declined pool) | **4,889 sites** | ≤4,889 | ✅ Decreased (-3) |
| `lint:debt` (Loose Domain) | **193 sites** | ≤193 | ✅ Met (89 wire segregated) |
| `lint:debt` (Prefer nullish coalescing) | **210 sites** | ≤210 | ✅ Decreased (-1) |
| `audit:dead-modules` | 0 dead modules (1,287 reachable) | 0 | ✅ Pass |
| `check:read-json` | 0 unvalidated / 108 calls | 0 unvalidated | ✅ 100% Compliant |
| `check:bare-json` | **128 prod / 137 total** (100 files) | ≤128 prod | ✅ Decreased (-11) |
| `check:diff-assertions` | **0 new type assertions** | 0 | ✅ Zero Slippage |
| `check:snapshot-witness` | 100% behavioral parity | 100% | ✅ Exact Parity |
| `bun run test` | 432 suites, 4,362 passed, 0 failed | natural exit 0 | ✅ Clean Teardown |
| `bun run build` | 7/7 route size checks pass | ceilings met | ✅ Pass (`/account` 109 kB, `/menu-planner` 289 kB) |

---

## 2. Phase 40 Deliverables Summary

1. **ASOL Delivery Contract Hardening**:
   - Wired `{ status: "in_flight", error: "conflict" }` marker on 409 responses for `/api/feed`, `/api/economy/sync-event`, and `/api/internal/agent-recipes`. ASOL retry classification functions correctly without dropping pending events.
   - Wired `verifyStandardWebhook` in `shadow` mode across inbound ASOL webhooks. Missing or unrecognized signature mode safely defaults to `shadow` and logs an alert.
   - Evaluated signature verification is stored in `webhook_events.summary.signatureVerification` for production auditing.
2. **24-Hour Rolling Telemetry & Stale Lock Alerting**:
   - Bounded queries in `asolHealthQueries.ts` to `NOW() - INTERVAL '24 hours'`.
   - Separated live in-flight locks (received ≤ 300s ago) from stale locks (> 300s).
   - Upgraded `/admin/asol` dashboard with KPI grid, latency indicators, source breakdown, delivery failure inspection modal, and stale lock alerts.
3. **Debt Ratchets Shipped**:
   - Domain loose optionality down from 216 to 193 (target ≤ 193).
   - Bare JSON casts down from 139 to 128 production (target ≤ 130).
   - Single assertion sites down from 3,022 to 2,983 (target ≤ 2,992).
   - Tracked lint debt decreased to 1,320 (-2), declined rules pool decreased to 4,889 (-3).
4. **ASOL Boundary Contract Probe**:
   - Implemented `AsolContractProbeService` with positive probes and negative controls (verifying 401 across all 4 boundary endpoints), backed by 14 unit tests with 0 new type assertions.

---

## 3. Recommended Scope for Phase 41

1. **Workstream A: Domain Loose Optionality Ratchet (193 → ≤ 175)**:
   - Target next high-density domain model files (`src/utils/dayCircuitCalculations.ts`, `src/types/mealCircuit.ts`, and core domain types) for removing `?: T | undefined` patterns.
   - Verify with `bun scripts/scanLooseOptionality.ts`.
2. **Workstream B: Bare JSON Response Casts (128 → ≤ 115)**:
   - Target client-side queries and remaining internal endpoints (`src/hooks/useTables.ts`, `src/hooks/useUserLocation.ts`, `src/app/restaurants/[id]/menu/MenuOrderClient.tsx`, etc.).
   - Replace bare casts with Zod schemas or typed parsing helpers.
3. **Workstream C: Assertion Sites Ratchet (2,983 → ≤ 2,950)**:
   - Target typed accumulators and type-guarded unions across `src/data/` and `src/utils/`.
4. **Workstream D: Scripts Typecheck Hardening (66 → ≤ 40)**:
   - Remediate TypeScript errors in `scripts/` identified by `bun run check:scripts`.
5. **Workstream E: Operator Verification of ASOL Webhook Signatures**:
   - Check `/admin/asol` signature audit metrics in shadow mode once ASOL deploys signing headers.
