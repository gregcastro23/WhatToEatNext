# WhatToEatNext · alchm.kitchen · Session Handover & Roadmap

_Last Updated: 2026-09-15 21:45Z | Production Commit: 6e4130f2 (#848) | Feature Branch: feat/auth-sql-gate-and-session-touch-hardening_

---

## 0. Repository Baselines & Active Constraints

### Measured Compiler & Code Quality Baselines

| Metric | Measured Baseline | Gate / Constraint |
| :--- | :---: | :--- |
| **Strict-index diagnostics** | **217 across 166 files** | Target was $\le 230$ / $\le 220$; shipped in #846 (`.strict-index-baseline.json`) |
| **Strict-index allowlist** | `[]` (0 entries) | Must remain strictly empty |
| **Tracked lint debt** | **1,473** | Ceiling 1,473 (zero regression allowed, `bun run lint:debt`) |
| **Non-null assertions (`!`)** | **605** | Ceiling 605 (scan must not exceed 605) |
| **Gated casts** | **167 total / 135 prod** | Baseline preserved |
| **AST assertion sites** | **3,293 total / 2,670 prod** | Baseline preserved |
| **Route validation** | **0 unvalidated / 123 routes** | `bun scripts/checkRouteValidation.ts` must stay 0 |
| **`readJson` validation** | **0 unvalidated / 30 calls** | `bun scripts/checkReadJsonValidation.ts` must stay 0 |
| **Base `typecheck`** | **0 errors** | `bun run typecheck` must have 0 errors |
| **Auth SQL Gate** | **9 of 9 statements parse** | `bun run check:sql:auth` (gated with 4 controls in CI) |
| **Jest test suites** | **All passing** | Run via `bun run test --runTestsByPath <path>` |

### Known Tooling Traps & Operational Rules (Mandatory)
1. **Pre-push hook is a git-lfs stub**: The pre-push hook in this repository is a git-lfs stub and does **NOT** execute test or typecheck gates. Always run verification commands explicitly (`bun run typecheck`, `bun run lint:debt`, `bun run check:sql:auth`, etc.) before opening a PR.
2. **Jest cannot import `next-auth/jwt`**: Importing `next-auth/jwt` directly in Jest tests fails due to ESM/CJS export mapping conflicts in the Jest runtime environment. Always mock or isolate JWT functions at test boundaries.
3. **Worktrees require `node_modules` symlink**: When creating a git worktree under `.worktrees/`, `node_modules` is not present; create a symlink (`ln -s ../../node_modules node_modules`) so Bun and Jest resolve packages properly. Do **NOT** run `worktree remove -f` without inspecting untracked contents.
4. **Zsh argument splitting trap**: In zsh, `$VAR` holding several paths does not split into separate arguments. A test run over an unquoted multi-path variable silently reports 0 tests run. Always pass explicit arguments or verify test count.
5. **Stage files strictly by name**: Never use `git add .` or `git add -A`. Stage every file explicitly by name.
6. **Test runner command**: Run tests using Jest via `bun run test --runTestsByPath <path>`, never `bun test` (which invokes Bun's native runner without Jest/jsdom module aliases).
7. **Next.js App Router Route Exports**: Exporting helper functions from `route.ts` causes `next typegen` to fail TS2344 (`OmitWithTag` constraint `{ [x: string]: never; }`). Helper functions must live in separate `.ts` modules outside `route.ts` (e.g. `src/lib/auth/sessionResponseTouch.ts`).
8. **Phase 33 Playbook Reference**: Commit `36a6d3e7` preserves the complete candidate worklist and categorized pools for the next wave of exact-optional property burndown (targeting $\le 160$).

---

## 1. Phase 1 Production Status & Verification Evidence

### Production State
- **Commit**: `6e4130f2` (merge of #848)
- **Deploy**: `q8dv3cm3y` (Ready 2026-09-15 20:33Z)
- **Shipped**: #846 exact-optional burndown (295 → 217) · #847 current-device fix · #848 session hardening

### Component Verification Status

| Item | State | Concrete Evidence |
| :--- | :---: | :--- |
| **Production deploys** | **Verified** | Production alias points at `q8dv3cm3y` (`6e4130f2`); home page returns 200. |
| **Step 1: `last_seen_at` & device labels** | **Verified Live** | `check:sql:auth` validates all 9 queries against live PostgreSQL; Control 2 proves `$2::text` cast is load-bearing. Read-only production query shows row `5bb8b074-29ce-4407-a539-767ce831b41c` touched with `"Firefox on macOS"` at `2026-09-15T21:15:26.733Z` (post-deploy). |
| **Step 2: Sign-out revokes session** | **Verified Live** | Real browser sign-out stamped `revoked_at: 2026-09-15T21:34:32.874Z` on row `5bb8b074-29ce-4407-a539-767ce831b41c`. |
| **Step 3: Origin checks on revoke endpoints** | **Verified** | Unauthenticated probes: missing Origin: 403; Origin `agents.alchm.kitchen`: 403; Origin `alchm.kitchen`: 401. |
| **Step 4: Cleanup cron** | **Safe** | Script dry-runs unless `ALLOW_DEVICE_SESSION_DELETIONS=1`. Railway job has no schedule attached. |
| **#847 current-device marking** | **Live** | Unit tests prove current-device marking binds exact `sessionId`; browser verification round trip confirmed. |
| **Server-side Datacenter Overwrite Guard** | **Shipped & Tested** | `isBrowserRequest` checks `sec-fetch-site`. Non-browser requests (e.g. Planetary Agents backend calling `/api/auth/session`) return null metadata so `COALESCE` in Postgres retains the user's real device and location. |
| **Auth SQL Prepare-Check Gate** | **Shipped & CI-Gated** | `scripts/checkAuthSqlParses.ts` runs 4 controls against Postgres, checking all 9 queries in `src/lib/auth/authQueries.ts`. Wired into `pre-merge-sql` and `integrity` in `.github/workflows/monica-integrity.yml`. |

### Live Production Measurement (Read-Only DB Audit 2026-09-15 21:40Z)
```
Total rows: 22
Touched post-deploy (after 2026-09-15 20:33Z): 1
Rows with device != NULL: 1 (Firefox on macOS)
Revoked rows (revoked_at != NULL): 1 (signed out at 21:34:32Z)

Most recent session:
  id:           5bb8b074-29ce-4407-a539-767ce831b41c
  user_id:      ce117d50-e3e3-4c53-8514-69bf8c21fca9
  device:       Firefox on macOS
  last_seen_at: 2026-09-15T21:15:26.733Z
  revoked_at:   2026-09-15T21:34:32.874Z
  created_at:   2026-08-06T22:39:30.108Z
```

---

## 2. The Canonical Auth Query Layer & CI Gate

All 9 SQL statements for auth and device sessions live in [`src/lib/auth/authQueries.ts`](file:///Users/cookingwithcastro/Desktop/WhatToEatNext-master/src/lib/auth/authQueries.ts) with zero runtime dependencies. Every calling service and API route imports directly from this file, eliminating copy-paste drift:

1. `TOUCH_SESSION_SQL` → imported by `src/lib/auth/sessionTouch.ts`
2. `REVOKE_SESSION_ON_SIGNOUT_SQL` → imported by `src/lib/auth/signOutSession.ts`
3. `DELETE_NEXTAUTH_SESSION_ON_SIGNOUT_SQL` → imported by `src/lib/auth/signOutSession.ts`
4. `REVOKE_SESSION_BY_ID_SQL` → imported by `src/app/api/auth/sessions/[id]/route.ts`
5. `REVOKE_ALL_SESSIONS_SQL` → imported by `src/app/api/auth/sessions/revoke-all/route.ts`
6. `SELECT_DEVICE_SESSIONS_SQL` → imported by `src/app/api/auth/sessions/route.ts`
7. `SELECT_REVOKED_AT_BY_JTI_SQL` → imported by `src/lib/auth/sessionRevocation.ts`
8. `INSERT_DEVICE_SESSION_ON_SIGNIN_SQL` → imported by `src/lib/auth/auth.ts`
9. `ADMIN_REVOKE_USER_SESSIONS_SQL` → imported by `src/app/api/admin/users/[userId]/sessions/revoke/route.ts`

### Gate Controls in `scripts/checkAuthSqlParses.ts`
- **Control 1 (Invalid Statement)**: Verifies that `PREPARE` correctly rejects an invalid SQL statement.
- **Control 2 (42P08 Proof)**: Verifies that preparing the uncast touch query (`(device IS NULL AND $2 IS NOT NULL)`) fails specifically with Postgres error `42P08` (`could not determine data type of parameter $2`), proving that the `$2::text` cast is load-bearing.
- **Control 3 (Export Coverage)**: Verifies that every exported statement from `authQueries.ts` is registered in the test suite.
- **Control 4 (Statement Count)**: Asserts that exactly 9 statements are gated.

Run locally:
```bash
bun run check:sql:auth
```

---

## 3. The Session Clock & Policy Milestones

The timestamps below count from when Step 1 went live (`q8dv3cm3y`, 2026-09-15 20:33Z). Prematurely enforcing idle limits or deletes before these dates would sign out or destroy active users whose sessions predate the deploy.

- **09-15 20:33Z (Touch Live)**: Device sessions update on each active visit.
- **09-22 20:33Z (7-day Idle Possible)**: Earliest time `last_seen_at` can be trusted to distinguish idle from active sessions.
- **10-15 20:33Z (Cron Deletes Allowed)**: All cookies issued before the Phase 1 deploy have expired (30-day maxAge). Real deletions may run only after this timestamp.
- **Any Time (30-Day Absolute Cap)**: Driven by sign-in `authTime` claim; does not depend on database timestamp accumulation.

---

## 4. Phase 2 Roadmap & Next Steps (In Dependency Order)

### 1. Enforce 30-day Absolute Session Lifetime
- **Status**: Ready now · Independent of DB data accumulation · Unlocks tombstone TTL
- Stamp an `authTime` claim in the JWT at sign-in.
- Return `null` from the `jwt` callback when `Date.now() - authTime > 30 days`.
- For existing tokens without `authTime`, backfill from `device_sessions.created_at` or issue a 30-day graceful claim.

### 2. Missing Row Policy Decision
- **Status**: Architectural decision required
- Currently, `sessionRevocation.ts` treats a missing `device_sessions` row as revoked.
- On 09-14, 23 `signin_complete` events existed vs 22 rows.
- Policy options:
  1. Backfill missing rows first before turning on enforcement.
  2. Treat missing row as unrecorded/allowed and record a fresh row.

### 3. Staged Revocation Enforcement
- Add short-lived in-memory / Redis caching for non-revoked session checks (avoid slamming Postgres on every route).
- **Stage 1**: Enable `AUTH_REVOCATION_CHECK=on` for middleware-matched routes.
- **Stage 2**: Enforce in NextAuth `jwt` callback.
- **Stage 3**: Enforce in `getUserIdFromRequest` and the Planetary Agents bridge.

### 4. Security UI Honesty (`/profile/security`)
- Wire "SIGN OUT EVERYWHERE" button to `POST /api/auth/sessions/revoke-all` (currently only calls `signOut()` for the local device).
- Surface revocation delay / cache TTL in the UI.
- Add visible toast / error notifications when revoke actions fail (e.g. 403 / 401).

### 5. Build Cache Failure Mitigation
- Either disable Webpack disk cache in `next.config.js` for CI builds or set `VERCEL_FORCE_NO_BUILD_CACHE=1` in project settings.

### 6. Phase 33 Exact-Optional TypeScript Burndown (217 → ≤160)
- Follow the candidate worklists and categorized pools preserved in commit `36a6d3e7`:
  - `src/utils/` (21 diagnostics)
  - `src/components/menu-planner/` (10 diagnostics)
  - `src/app/api/` (58 diagnostics)
  - `src/components/` (59 diagnostics)
- Adhere strictly to the absent vs undefined vs null decision rules and JS emit parity verification (`ts.transpileModule`).
