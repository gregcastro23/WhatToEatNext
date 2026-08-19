# Next Session: Phase B Landed · Observability Defect, Performance Regression & Codebase Health Triage

**Master:** `137d79a9` (#788 merged 2026-08-19 03:49Z) · **Prod:** `alchm.kitchen`, deploy `dpl_BS1LRpMFHjcmV6tX9jjAKfZ27ngc` READY, serving `137d79a9` · **Working tree:** clean.

Everything marked `[MEASURED 08-19]` was measured directly against production or by running active test suites. `[CARRIED]` was carried from earlier session observations and should be treated as a verified lead.

Two claims from previous session audits were **wrong** and have been corrected in §2:
1. `cosmic-recipe` is **not down** (151 requests, 151× HTTP 200) — it suffered a ~7× latency regression that trips the fixed 10s probe timeout (§2.1).
2. Alerting is **not dead** — email delivery succeeds; only Slack alerts fail due to an unset webhook URL (§2.2).

---

## 0. What Shipped

### 0.1 #788 — Phase B: Admin Observability Kit Migration `[MEASURED 08-19]`

`+1761 / −631` across 18 files. Verified clean:

| Check | Result |
|---|---|
| Admin Kit Migration | ✅ **10 of 10** admin panels import from kit (`ProvenanceBadge`, `EmptyState`, `fromLiveFlag`, `Metric`) |
| `bun run jest src/components/admin` | ✅ **35/35** pass |
| `bun run typecheck` | ✅ **0 errors** (clean) |
| `bun run test:fast` | ✅ **408/408** pass across 10 suites |
| `bun run lint:debt` | ✅ **21864** — *down* 44 from baseline 21908 |
| CI Workflows | ✅ Build, Lint debt, SQL-parse, monica-fallback all pass |

The test suite `src/components/admin/__tests__/AdminPanelsKitMigration.test.tsx` (410 lines) renders live panels through `useHardenedPolling` and uses `makeDocumentVisible()` from `src/utils/testing/pollingTestEnv` to prevent jsdom `document.hidden` stalls.

### 0.2 Financial Rail Hardening — #786 / #787 `[CARRIED]`

- **#786:** MCP top-up no longer answers 2xx on a rolled-back credit transaction.
- **#787:** `daily-yield` no longer reports a rollback as "already claimed today".

---

## 1. Review of #788 & Immediate Defects

### 1.1 What is Correct and Retained
- **Stripe Webhook Wrapper:** `withObservability` does not consume the request body; raw payload signature verification (`request.text()`) and re-throw on failure survive intact.
- **Route Normalization:** Standard routes (`/api/onboarding`, `/api/feed`, `/api/stripe/webhook`) match their expected callers in `systemStatusService.ts` and `onboardingHealthService.ts`.
- **Mechanical Refactoring:** Onboarding and feed route diffs are pure mechanical handler wraps with no moved business logic.

### 1.2 ⚠️ CRITICAL DEFECT: Google OAuth Route Observability Blind Spot `[MEASURED 08-19]`

`src/app/api/auth/[...nextauth]/route.ts` hardcodes a constant route name:
```ts
routeName: "/api/auth/[...nextauth]"
```

This collapses `/api/auth/session`, `/api/auth/callback/google`, `/api/auth/csrf`, `/api/auth/providers`, `/api/auth/signin`, and `/api/auth/signout` into one bucket.

`src/services/systemStatusService.ts:1568` probes for OAuth traffic via:
```ts
const authPath = summarizePath("/api/auth/callback/google", ONE_DAY);
```

Because `summarizePath` checks `r.path.startsWith(pathPrefix)` (`src/lib/observability/requestLog.ts:246`), `"/api/auth/[...nextauth]".startsWith("/api/auth/callback/google")` evaluates to **`false`**.

**Impact:**
- `probeGoogleOAuthDependency()` returns `observed: false` indefinitely, pinning the Google OAuth tile to `UNKNOWN — "No OAuth callback traffic in 24h"`.
- NextAuth only writes `auth_events` (`signin_started`) inside the `signIn` callback (`src/lib/auth/auth.ts:127`) **after** Google redirects back. If Google OAuth fails at Google (consent screen, redirect URI mismatch, quota, expired secret), no `auth_events` row is written. The only witness is `/api/auth/callback/google` in `request_log_entries` — which is currently masked by the catch-all route name.

**Action Required (Effort: S):**
Widen `routeName` in `ObservabilityOptions` to `string | ((req: NextRequest) => string)` or derive dynamic subpath `/api/auth/:action` so `/api/auth/callback/google` is accurately logged while keeping `summarizePath("/api/auth", ...)` satisfied. Red-proof with a test.

### 1.3 Secondary Observability Improvements
- **`/api/feed` GET Missing `skipUserResolution`:** Polled every 30–40s per open client tab (`src/app/(alchm)/feed/page.tsx:313`). It currently executes a background `jose` JWT verification on every poll. Add `skipUserResolution: true` to `src/app/api/feed/route.ts:101`.
- **`SettlementPanel.tsx` Kit Completeness:** Migrate `SettlementPanel.tsx` to include `ProvenanceBadge` alongside `EmptyState`.
- **`requestLog.ts` In-Memory Buffer Ceiling:** `RING_SIZE = 500` with `LIMIT 500` hydration. Whole-app traffic is ~77 req/hr today (safe), but high concurrency feed polling can truncate the 5m window.

---

## 2. Production Board Health & Latency Triage

### 2.1 `cosmic-recipe` Performance Regression (p50 2.3s → 17.1s) `[MEASURED 08-19]`

The probe reports **4.2% success, 23 of 24 runs `timeout`**, pinned at 10,004 ms.
However, `request_log_entries` over 7 days confirms the endpoint itself is **100% operational**:
- **151 requests, 151× HTTP 200, 0× 4xx, 0× 5xx.**

| Day (UTC) | Count | p50 Latency | p95 Latency | Min Latency |
|---|---|---|---|---|
| 08-15 | 23 | 2,320 ms | 3,338 ms | 1,644 ms |
| 08-16 | 24 | 2,199 ms | 4,571 ms | 1,682 ms |
| 08-17 | 23 | 2,345 ms | 16,472 ms | 1,853 ms |
| 08-18 | 13 | **17,084 ms** | 41,808 ms | 2,635 ms |
| 08-19 | 4 | **14,753 ms** | 20,864 ms | **13,725 ms** |

**Diagnosis:**
The endpoint is healthy but now consistently exceeds the synthetic probe's 10s timeout budget (`PROBE_TIMEOUT_MS`). The regression coincides with the merge of PRs #780–#785 (thermal stack, boundary network, lab solver). `cron:prewarm-agent-recipes` p95 also rose to **53,079 ms**.

⚠️ **Do NOT mask this by bumping the probe timeout.** Profile and isolate where execution time went across the grounding calculations, boundary network, or upstream Planetary Agents LLM call.

### 2.2 Alert Delivery Status `[MEASURED 08-19]`
- Email alerts work (`dispatch` payload contains `{"email": {"ok": true}}`).
- Slack alert failures (`"ALERT_SLACK_WEBHOOK_URL not set"`) are due to a missing environment secret.

### 2.3 Genuinely Red Subsystems `[MEASURED 08-19]`
- **Database Flapping:** "Database degraded" 21× and "Database recovered" 21× over 7 days (~3 round-trips/day). Needs connection pool and query timeout inspection.
- **`chain-shop` Audit Errors:** "Shop burn audit hit 40 error(s)" reported 6× in 7 days.
- **Ungated Cron:** `cron:prewarm-agent-recipes` has no execution timeout gate (runs up to 53s+).
- **Sustained Stripe Alert:** "Payments · Stripe still down" raised 08-12; verify closure.

### 2.4 User Traffic Reality & Six Empty Tables `[MEASURED 08-19]`
- **Funnel Reality:** 22 lifetime sign-ins; last sign-in 2026-08-06; last human signup 2026-08-05. Agent signups decreased from 242/day (08-08) to ~5/day (08-18). (Fixing §1.2 is required to confirm whether OAuth attempts are failing).
- **Empty Panels:** 6 tables have 0 rows (`restaurants`, `restaurant_order_intents`, `food_diary_entries`, `user_meal_plans`, `user_calculations`, `cart_handoff_intents`). Panels now render `EmptyState`, but should explicitly specify `kind="never-used"` with contextual explanations.

---

## 3. Verified Repository State

### 3.1 Repository & CI `[MEASURED 08-19]`
- **Master Branch:** `137d79a9`. Working tree clean.
- **TypeScript:** `bun run typecheck` passes with **0 errors**.
- **Fast Tests:** `bun run test:fast` passes **408/408 tests**.
- **Admin Tests:** `bun run jest src/components/admin` passes **35/35 tests**.
- **Lint Debt:** `bun run lint:debt` is **21,864** (down from baseline 21,908).

### 3.2 Production Environment `[MEASURED 08-19]`
- Domains: `https://alchm.kitchen` (200), `https://www.alchm.kitchen` (200).
- ⚠️ `whattoeatnext.com` is parked on Hover (`216.40.34.41`) and is **not** the active product domain.
- Missing Prod Secrets: `ALERT_SLACK_WEBHOOK_URL`, `AUTH_REVOCATION_CHECK`, `NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG`, `STRIPE_RESTAURANT_ORDER_PRICE_ID`, `BASE_RPC_URL`.
- Active Prod Secrets: `STRIPE_SECRET_KEY` (**LIVE**), `INTERNAL_API_SECRET`, `UPSTASH_REDIS_REST_URL`.

---

## 4. Operational Landmines & Guardrails

1. **`_logger.warn` Emits Nothing in Production:** `src/lib/logger.ts` gates `warn`/`info`/`debug` on `NODE_ENV !== "production"`. Only `_logger.error` is emitted in production.
2. **node-postgres Timestamps:** Timestamps without time zone are parsed as local time by `node-postgres`. Always format timestamps as text in SQL (`to_char(ts AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`) when auditing.
3. **Control Tests:** Always construct controls by restoring original code, not by hand-editing branches that could return false positives through exception catch-alls.
4. **Shell & Parameter Quoting:** zsh does not word-split unquoted parameters and globs unquoted `*` and `?`. Quote all file patterns and URLs.
5. **React 19 Types:** Use `React.JSX.Element` rather than global `JSX.Element`.
6. **Live Database Access:** `DATABASE_PUBLIC_URL` connects directly to production PostgreSQL. All exploratory scripts must use rolled-back transactions (`BEGIN ... ROLLBACK`).

---

## 5. Prioritized Action Plan for Next Session

```
                                  TRIAGE PRIORITIES
                                  
  ┌────────────────────────────────────────────────────────────────────────┐
  │ TIER 1: CRITICAL OBSERVABILITY & BOTTLENECK TRIAGE (Do First)          │
  │ • Fix OAuth route name in [...nextauth]/route.ts & withObservability   │
  │ • Trace cosmic-recipe p50 latency regression (2.3s -> 17.1s)           │
  │ • Add skipUserResolution: true to GET /api/feed                        │
  │ • Complete SettlementPanel kit migration (add ProvenanceBadge)         │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ TIER 2: SYSTEM RELIABILITY, CRONS & DASHBOARD HONESTY                  │
  │ • Gate cron:prewarm-agent-recipes with timeout guard                   │
  │ • Triage 21x/7d database degrade/recover flap                          │
  │ • Triage chain-shop 40-error spike in shop burn audit                  │
  │ • Add kind="never-used" contextual copy to 6 empty dashboard panels    │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ TIER 3: SECURITY & MONEY RAIL HARDENING                                │
  │ • Address session revocation runtime gaps (sessionRevocation.ts)       │
  │ • Split Stripe webhook error codes (400 for signature, 500 for server) │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ TIER 4: CI QUALITY GATES & VERIFICATION TOOLING                        │
  │ • Fix inert bundle-size check in package.json & check-route-sizes.cjs  │
  │ • Wire scripts/checkKitchenSettingsSqlParses.ts into CI                │
  │ • Establish lint debt auto-ratchet script                              │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
  ┌──────────────────────────────────▼─────────────────────────────────────┐
  │ TIER 5: CODEBASE CLEANLINESS & TYPE SAFETY ENFORCEMENT                 │
  │ • Enforce scoped "as any" ban in calculations/data/services            │
  │ • Type executeQuery<T> return values                                   │
  │ • Reclaim 32 stale worktrees & delete merged branches                  │
  │ • Fix hardcoded "11375" fallback in InstacartService.ts                │
  │ • Remove dead duration chip branch in cooking-methods/[method]/page.tsx│
  │ • Sphere eigenvalue Taylor series residual fix (Rust + TS)             │
  └────────────────────────────────────────────────────────────────────────┘
```

### Tier 1: Critical Observability & Bottleneck Triage (Immediate)

1. **Fix Google OAuth Route Observability (§1.2):**
   - File: `src/app/api/auth/[...nextauth]/route.ts` & `src/lib/observability/withObservability.ts`.
   - Update `withObservability` to support dynamic route name resolution (e.g. `(req) => req.nextUrl.pathname` or `/api/auth/:action`).
   - Red-proof: ensure `summarizePath("/api/auth/callback/google")` observes callback traffic and clears the permanent `UNKNOWN` status.
   - Effort: **S**.

2. **Trace `cosmic-recipe` Latency Regression (§2.1):**
   - File: `src/app/api/generate-cosmic-recipe/route.ts` & `src/services/syntheticProbeService.ts`.
   - Profile step-by-step latency across `getAccuratePlanetaryPositions`, `calculateAlchemicalFromPlanets`, `alchemize`, and the PA upstream call.
   - Effort: **M**.

3. **Add `skipUserResolution: true` to `/api/feed` GET (§1.3):**
   - File: `src/app/api/feed/route.ts:101`.
   - Stop redundant JWT verification on high-frequency public polling.
   - Effort: **XS**.

4. **Complete `SettlementPanel` Kit Migration (§1.3):**
   - File: `src/components/admin/SettlementPanel.tsx`.
   - Add `ProvenanceBadge` to match the other 9 admin panels.
   - Effort: **S**.

---

### Tier 2: System Reliability, Crons & Dashboard Honesty

5. **Gate `cron:prewarm-agent-recipes` with a Timeout:**
   - File: `src/app/api/cron/prewarm-agent-recipes/route.ts`.
   - Add explicit timeout handling (p95 is currently 53s).
   - Effort: **S**.

6. **Triage 21×/7d Database Degrade/Recover Flapping:**
   - Inspect PostgreSQL connection pooling, pool size exhaustion, and long-running queries in `src/lib/database.ts` and Railway metrics.
   - Effort: **M**.

7. **Triage `chain-shop` Burn Audit 40-Error Spike:**
   - Investigate why shop burn audit hits exactly 40 errors during probe sweeps.
   - Effort: **S**.

8. **Contextual Empty States on the 6 Permanently Empty Panels (§2.4):**
   - Provide `kind="never-used"` and descriptive copy on `restaurants`, `restaurant_order_intents`, `food_diary_entries`, `user_meal_plans`, `user_calculations`, and `cart_handoff_intents` panels.
   - Effort: **M**.

---

### Tier 3: Security & Money Rail Hardening

9. **Close Session Revocation Runtime Gaps:**
   - Files: `src/lib/auth/sessionRevocation.ts`, `src/lib/auth/auth.ts`, `src/lib/auth/auth.config.ts`.
   - Fix fail-open behavior on Postgres errors (use `_logger.error` so errors are visible in prod).
   - Ensure JWTs without `sessionId` do not bypass revocation checks.
   - Align middleware matcher with `isProtected`.
   - Effort: **M**.

10. **Separate Stripe Webhook Status Codes:**
    - File: `src/app/api/stripe/webhook/route.ts`.
    - Return HTTP 400 strictly for invalid signatures; return HTTP 500 for internal server/DB processing failures so Stripe retries appropriately and alerts reflect true server errors.
    - Effort: **S**.

---

### Tier 4: CI Quality Gates & Verification Tooling

11. **Fix Structurally Inert Route Bundle Size Check:**
    - Files: `package.json`, `scripts/check-route-sizes.cjs`.
    - Update `build:size-check` so `check-route-sizes.cjs` directly reads `.next/` build output/manifest rather than relying on an unpiped `&&`. Re-calibrate route size budgets.
    - Effort: **S**.

12. **Wire PostgreSQL Query Verification Gate to CI:**
    - File: `scripts/checkKitchenSettingsSqlParses.ts`, `.github/workflows/`.
    - Connect the live SQL PREPARE validation script to pre-merge CI checks.
    - Effort: **S**.

13. **Implement Lint Debt Auto-Ratchet:**
    - File: `scripts/checkLintDebt.ts`.
    - Automatically decrease the baseline in `.lint-debt-baseline.json` when debt drops (current: 21,864 vs baseline 21,908).
    - Effort: **M**.

---

### Tier 5: Codebase Cleanliness & Type Safety

14. **Enforce Scoped `as any` Ban:**
    - Add ESLint rule preventing `as any` in `src/constants/`, `src/data/`, `src/calculations/`, `src/services/`.
    - Effort: **M**.

15. **Type `executeQuery<T>` Return Values:**
    - Refactor `executeQuery` in `src/lib/database.ts` to return typed row results without requiring manual casting.
    - Effort: **M**.

16. **Worktree & Branch Reclamation:**
    - Clean up 32 local worktrees that point to already-merged master commits.
    - Effort: **S**.

17. **Fix Hardcoded Zip Code in `InstacartService.ts`:**
    - Replace default `"11375"` with parameterized/user postal code resolution.
    - Effort: **XS**.

18. **Eliminate Dead Duration Chip Branch:**
    - File: `src/app/cooking-methods/[method]/page.tsx:468-476`.
    - Remove unreachable `"—"` fallback.
    - Effort: **XS**.

19. **Sphere Eigenvalue Residual Normalization:**
    - Regroup residual to `S(λ) − Bi·sin λ` with Taylor series for small λ across Rust `thermo-core` and TypeScript implementations.
    - Effort: **M**.

---

## 6. Items Requiring User Input / Secrets

- **Configure `ALERT_SLACK_WEBHOOK_URL`:** Required to enable Slack alert delivery (currently email-only).
- **Rule on `AUTH_REVOCATION_CHECK` Deployment:** Decide whether to enable active database session revocation checking in production.
- **Provide Stripe Test Keys (`sk_test_*`):** Enables end-to-end testing of the restaurant ESMS settlement rail without live fiat transactions.
- **Resolve `premium-table/route.ts` Mock Fallbacks:** Decide on business logic for recipes lacking alchemical properties.

---

## 7. Residual & Unobserved State

- **Admin UI Visual Inspection:** Admin routes require Google OAuth authentication; visual inspection of all 10 migrated panels in a real browser session has not yet occurred.
- **Post-Deploy Request Log Confirmation:** Confirm that request log entries for `/api/feed`, `/api/onboarding`, and `/api/auth` are populating in production `request_log_entries`.
