# Session Handover: 30-Day Absolute Session Lifetime & Auth Architecture

_Canonical entry point for agent handover. Detailed historical telemetry and raw probes are preserved in [docs/handovers/handover-evidence-2026-09-15.md](docs/handovers/handover-evidence-2026-09-15.md)._

> **Status as of 2026-09-16 (re-measured after commit)** — the 30-day absolute lifetime is **committed on `feat/auth-absolute-session-lifetime` (`44dea44d` code, `fd775489` docs), NOT pushed, no PR, NOT deployed**. ⚠️ **Deploy-by: well before `2026-10-15T20:33:00Z`** — see §5.4. PR [#850](https://github.com/gregcastro23/WhatToEatNext/pull/850) (the *previous* phase: auth SQL gate + query centralization) is **merged** as `d13aa0c1`, which is now `origin/master`. No production behaviour has changed yet: prod still runs `6e4130f2` + `d13aa0c1` with **no** absolute session cap.

---

## 1. Goal (Immediate Objective)

**Objective**: Implement and validate a **30-day absolute session lifetime** with a documented, bounded migration strategy for existing legacy tokens that cannot perpetually restart grace.

**Remaining for this objective** (the evaluator and its wiring are done — see §4):
1. ✅ Committed on a new branch (`44dea44d`, `fd775489`). **Remaining: push and open a PR.** Do **not** use the old `walkthrough.md` as the PR body — it predates the env change, lists none of §5's gaps, and carries 5 local `file:///` links into a **public** repo.
2. §5.2 is **half-fixed and now has a different defect** (witnessed below). §5.1 and §5.3 are **untouched**. Resolve each or explicitly defer it with a reason — in the PR body, not just here.
3. Deploy and verify **live**, to this repo's usual standard: a real signed-in session, a real DB read, a real probe. Everything recorded so far is local-only.

### Primary Acceptance Criteria
1. **`authTime` Contract Defined & Implemented**:
   - **Units**: Unix epoch seconds (`Math.floor(Date.now() / 1000)`).
   - **Minting**: Minted in the NextAuth `jwt` callback *only* on initial sign-in (when `user` or `account` is defined).
   - **Immutability**: Preserved strictly across all token refreshes and session updates (`trigger === "update"`). It must never be re-minted or overwritten.
   - **Strict Boundary**: Return `null` from the `jwt` callback when `Math.floor(Date.now() / 1000) >= token.authTime + (30 * 86400)`.
   - **Validation**: Reject missing, non-numeric, negative (`<= 0`), `NaN`, or future timestamps (`> now + 300` allowing 5 minutes clock skew) by returning `null`.
2. **Bounded Legacy Migration**:
   - Existing active JWTs lack `authTime`.
   - **Adopted Policy (Choice A - Pinned Deployment Epoch)**:
     - Define a fixed deployment constant: `DEPLOYMENT_TIMESTAMP` (Unix epoch seconds of the release).
     - When a token lacks `authTime`, treat its baseline as `DEPLOYMENT_TIMESTAMP`.
     - Expiry check: if `now >= DEPLOYMENT_TIMESTAMP + (30 * 86400)`, the token is expired (`return null`).
     - Otherwise, persist `token.authTime = DEPLOYMENT_TIMESTAMP` in the token. Because it is pinned to the fixed deployment epoch, subsequent refreshes cannot extend the 30-day grace window.
3. **Boundary Unit Tests**:
   - Test at `authTime + 30d - 1s`: valid (token returned).
   - Test at `authTime + 30d`: expired (`null` returned).
   - Test at `authTime + 30d + 1s`: expired (`null` returned).
   - Test that session updates and refreshes preserve existing `authTime`.
   - Test that legacy tokens without `authTime` expire strictly at `DEPLOYMENT_TIMESTAMP + 30d`.

---

## 2. Context & Repository Status

### Branch & PR State (re-measured 2026-09-16)
- **`origin/master`**: `d13aa0c1` — merge commit of PR #850 (merged 2026-09-16 00:36Z, all CI green). Local ref and `gh api` agree.
- **Current Branch**: `feat/auth-absolute-session-lifetime`, based on `e04d8992`. Relative to master: **2 ahead** (`44dea44d`, `fd775489`), **1 behind** (only the `d13aa0c1` merge commit, whose content is already in the base — no conflict expected).
- **Remote**: branch **not pushed** (`gh api …/branches/feat/auth-absolute-session-lifetime` → 404). No PR.
- **Commits**:
  - `44dea44d` feat(auth) — 6 files: `sessionLifetime.ts` (new), `__tests__/sessionLifetime.test.ts` (new), `__tests__/authWiring.test.ts`, `auth.config.ts`, `auth.ts`, `types/next-auth.d.ts`. Went through the pre-commit hook (`typecheck && lint:changed`).
  - `fd775489` docs(auth) — `NEXT_SESSION_PROMPT.md`, `docs/prompts/next_session_prompt.md`, `docs/handovers/handover-evidence-2026-09-15.md`. Committed with **`-n` (hook skipped)**; docs-only, so the TS gates it skipped cannot have caught anything.
- **Working Tree**: clean at `fd775489` before this doc refresh.
- ⚠️ `docs/prompts/next_session_prompt.md` was committed as a **full copy** of this file, which overwrote the 8-line pointer. Two copies drift on the next edit, so it has been restored to a pointer. This file is the canonical one.

### Separation of Concerns: Local PR #850 vs Production `6e4130f2`

| Capability | Origin Commit | Current Status | Verification State |
| :--- | :---: | :---: | :--- |
| **Origin checks on revoke endpoints** | `6e4130f2` (PR #848) | **Live in Production** | Probed: 403 on missing origin, 403 on sibling domain, 401 on canonical origin. |
| **`last_seen_at` touch & device labels** | `6e4130f2` (PR #848) | **Live in Production** | Verified live in DB at 2026-09-15 21:15Z (`Firefox on macOS`). |
| **Sign-out row revocation** | `6e4130f2` (PR #848) | **Live in Production** | Verified live in DB at 2026-09-15 21:34Z (`revoked_at` stamped). |
| **Current-device marking (#847)** | `6e4130f2` (PR #847) | **Live in Production** | Unit tested; browser round trip verified. |
| **Canonical Query Module ([src/lib/auth/authQueries.ts](src/lib/auth/authQueries.ts))** | `e04d8992` (PR #850) | **Pending Merge (PR #850)** | 0 copy-paste drift across 8 caller sites; admin `RETURNING id` reconciled. |
| **Auth SQL Prepare Gate ([scripts/checkAuthSqlParses.ts](scripts/checkAuthSqlParses.ts))** | `e04d8992` (PR #850) | **Pending Merge (PR #850)** | Verified against live PostgreSQL; Control 2 proves error `42P08` on uncast `$2`. |
| **CI Integration ([.github/workflows/monica-integrity.yml](.github/workflows/monica-integrity.yml))** | `e04d8992` (PR #850) | **Pending Merge (PR #850)** | Wired into `pre-merge-sql` and `integrity` jobs. |
| **Datacenter Location Guard (`sec-fetch-site`)** | `e04d8992` (PR #850) | **Pending Merge (PR #850)** | Prevents server-side calls (e.g. PA backend) from overwriting user device/location. |
| **App Router Route Typegen Compliance** | `e04d8992` (PR #850) | **Pending Merge (PR #850)** | Moved helper to [src/lib/auth/sessionResponseTouch.ts](src/lib/auth/sessionResponseTouch.ts). |

### Concrete Prerequisites for Lifecycle Policies (Replacing Calendar-Based Rules)
1. **Hard Session Deletion (Cleanup Cron)**:
   - *Cannot run simply because of a calendar date.* In Auth.js, active sessions refresh JWT and cookie expiry on every session read.
   - **Prerequisites before enabling deletions**:
     1. 30-day absolute lifetime (`authTime`) is deployed and enforced.
     2. Legacy token migration deadline (`DEPLOYMENT_TIMESTAMP + 30d`) has elapsed.
     3. Tombstone retention policy is enforced: revoked rows MUST be retained as tombstones (`revoked_at IS NOT NULL`) for at least 30 days so that a deleted row cannot be resurrected or treated as an unknown-valid session.
2. **7-Day Idle Enforcement**:
   - September 22 is an *earliest review date*, not an automatic enablement trigger.
   - Enforcement can only be enabled once telemetry proves `last_seen_at` touches reliably cover the active user base.

---

## 3. Constraints & Operating Rules

### Reproducible Baseline Verification (Commit `e04d8992`)
Always verify against live commands; never rely on unstated assumptions:

| Verification Gate | Command | Commit & Timestamp | Result |
| :--- | :--- | :---: | :--- |
| **Auth SQL Gate** | `bun run check:sql:auth` | `e04d8992` · 2026-09-15 21:41Z | **Passed**: 4 controls, 9/9 statements prepared against PostgreSQL. |
| **Full Typecheck** | `bun run typecheck` | `e04d8992` · 2026-09-15 21:42Z | **Passed**: `next typegen` and `tsc --noEmit` exit 0 with 0 errors. |
| **Changed Files Lint** | `bun run lint:changed` | `e04d8992` · 2026-09-15 21:42Z | **Passed**: 0 errors across modified files. |
| **Lint Debt** | `bun run lint:debt` | `e04d8992` · 2026-09-15 21:44Z | **Passed**: Exactly 1,473 tracked debt (declined pool down to 4,905). |
| **Non-Null Assertions** | `bun -e 'import path from "node:path"; import {scanAssertionSites} from "./scripts/lib/lintDebt"; const c = scanAssertionSites(path.resolve("src"), process.cwd()).summary.nonNull; if (c > 605) process.exit(1);'` | `e04d8992` · 2026-09-15 21:45Z | **Passed**: 605 non-null assertions (ceiling $\le 605$). |
| **Auth Test Suite** | `bun run test --runTestsByPath src/lib/auth/__tests__/authWiring.test.ts src/lib/auth/__tests__/deviceLabels.test.ts src/lib/auth/__tests__/originCheck.test.ts src/lib/auth/__tests__/sessionTouch.test.ts src/lib/auth/__tests__/signOutSession.test.ts src/app/api/auth/sessions/__tests__/route.test.ts` | `e04d8992` · 2026-09-15 21:40Z | **Passed**: 6 suites, 57 tests passed. |

### Tooling Traps & Operational Caveats
1. **`PREPARE` Scope**: `bun run check:sql:auth` validates SQL syntax, table/column presence, and parameter deduction in PostgreSQL. It does **not** evaluate runtime business logic or row updates. Unit tests remain mandatory.
2. **Auth SQL Extensibility**: The gate currently verifies exactly 9 statements (`EXPECTED_TOTAL = 9`). Any newly introduced SQL query must be added to [src/lib/auth/authQueries.ts](src/lib/auth/authQueries.ts) and registered in [scripts/checkAuthSqlParses.ts](scripts/checkAuthSqlParses.ts).
3. **Pre-push Hook is a Stub**: The pre-push hook is a `git-lfs` stub and does not run CI checks. Run verification commands explicitly.
4. **Jest & `next-auth/jwt`**: Jest cannot import `next-auth/jwt` directly due to ESM export mapping conflicts. Mock or isolate JWT helpers at the test boundary.
5. **Worktrees Require `node_modules` Symlink**: Always run `ln -s ../../node_modules node_modules` in any newly created worktree. Never run `worktree remove -f` without auditing untracked files.
6. **Zsh Multi-Path Splitting**: In zsh, unquoted `$VAR` containing space-separated paths does not word-split and silently runs 0 tests. Always pass explicit arguments.
7. **Stage Files Strictly by Name**: Never run `git add .` or `git add -A`.

---

## 4. Completion (Done When)

Criteria 1–6 are **met and committed** (`44dea44d`). Criterion 7 is **half met**: commit SHAs are recorded, but there is no PR and no live verification.

| # | Criterion | State | Where / evidence |
| :--- | :--- | :---: | :--- |
| 1 | `authTime` stamped on initial sign-in | **Met** | `evaluateSessionLifetime` returns `authTime: now` when `isInitialSignIn`; called at the top of the `jwt` callback in `src/lib/auth/auth.ts`. |
| 2 | `authTime` preserved across refresh/update | **Met** | Valid present-claim branch returns `tokenAuthTime` unchanged; `authWiring.test.ts` covers `trigger === "update"` and a client attempting to overwrite it. |
| 3 | `now >= authTime + 30d` ⇒ `null` | **Met** | Strict `>=` boundary in `sessionLifetime.ts`; returning `null` really does clear the cookie — see the upstream contract below. |
| 4 | Legacy tokens bounded, cannot reset grace | **Met** | `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380`. Verified: that is exactly `2026-09-15T20:33:00Z` (the `q8dv3cm3y` Ready instant), and `+2592000 = 1792096380` = **`2026-10-15T20:33:00Z`**. Pinned, so refreshes cannot extend it. |
| 5 | Boundary tests pass | **Met** | 43 tests across `sessionLifetime.test.ts` (24) and `authWiring.test.ts` (19). 8 suites / 96 tests green (`sessionLifetime`, `authWiring`, `sessionTouch`, `signOutSession`, `deviceLabels`, `originCheck`, `src/__tests__/lib/sessionRevocation`, `sessions/route`). Note: `sessionRevocation.test.ts` lives under `src/__tests__/lib/`, **not** `src/lib/auth/__tests__/`. |
| 6 | `typecheck` / `lint:debt` / `check:sql:auth` clean | **Met** | 0 tsc errors; lint debt exactly 1,473 with 0 rule regressions; non-null assertions 605 (≤ 605); `verify:static` all 11 gates green. This phase added no SQL, so `check:sql:auth` stays 9/9. |
| 7 | Commit SHAs + live verification recorded | **Half** | SHAs `44dea44d` / `fd775489` recorded. Not pushed, no PR, nothing deployed or verified live. |

### Upstream contract this design depends on (verified by source read)

`@auth/core` **0.41.2** / `next-auth` **5.0.0-beta.31**, `node_modules/@auth/core/lib/actions/session.js`: the JWT branch calls `callbacks.jwt(...)` and then

```js
if (token !== null) { /* ...re-encode, set cookie... */ }
else { response.cookies?.push(...sessionStore.clean()); }
```

So a `null` return **does** clear the session cookie — the gate genuinely gates. Two consequences a future reader must not miss:
- **No `events.signOut` fires on the `null` path.** `onSignOutEvent` → `handleSignOutSession` never runs, so nothing revokes the `device_sessions` row. This is finding §5.1.
- **The tests only assert our own return value**, never that the cookie was cleared. That contract lives in a **beta** dependency. See finding §5.3.

`src/middleware.ts` builds middleware from `authConfig` via `NextAuth(authConfig).auth(...)`, so the edge `jwt` callback is genuinely on the request path. `auth.ts` spreads `...authConfig.callbacks` **before** defining its own `jwt`, so the server `jwt` correctly overrides the edge one while `authorized` and `session` (which propagates `session.user.authTime`) are preserved.

---

## 5. Ordered Backlog (Subsequent Work)

### 1. Cap expiry orphans the `device_sessions` row — the sessions UI lies
- **Found**: 2026-09-16, reviewing this phase. Not yet fixed.
- **Mechanism**: when the absolute cap fires, `@auth/core` clears the cookie but does **not** emit `events.signOut`, so `onSignOutEvent` → `handleSignOutSession` → `REVOKE_SESSION_ON_SIGNOUT_SQL` never runs. The row keeps `revoked_at IS NULL` **forever**.
- **Consequence**: `SELECT_DEVICE_SESSIONS_SQL` filters on `user_id = $1 AND revoked_at IS NULL` with **no age bound** (`LIMIT 25`, ordered by `last_seen_at`). `GET /api/auth/sessions` therefore lists a device whose session is already dead as an **active session** — on a security-facing surface, indefinitely. The NextAuth `sessions` row also lingers (its `expires` is now correctly in the past, but only sign-out deletes rows, and with `strategy: "jwt"` nothing reads that table).
- **Only current reaper**: `scripts/cleanup-device-sessions.ts` at `last_seen_at < NOW() - 30 days` — and that job has **no schedule attached**.
- **Fix options**: (a) revoke the row inside the `jwt` callback on the invalid branch before returning `null` (Node runtime only — the edge callback cannot reach Postgres); (b) add an age bound to `SELECT_DEVICE_SESSIONS_SQL` (remember: new/changed SQL must be registered in `scripts/checkAuthSqlParses.ts` and `EXPECTED_TOTAL` bumped); or (c) accept it and say so in the UI copy. Option (a) writes on a hot read path — measure before shipping.

### 2. Legacy-epoch env override — deleted, pinned constant is the single authority
- **Resolved**: The env override, module-load parser `resolveConfiguredMigrationEpoch()`, and test-only helper `resolveMigrationEpochSeconds` have been completely deleted.
- **Single Source of Truth**: `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380` is the single, pinned constant. It requires no environment variable, cannot throw or be bypassed on the hot path, and eliminates any future-timestamp drift.

### 3. No guard on the upstream `null`-token contract
- Every one of the 47 new tests asserts what *our* function returns. The behaviour that actually ends the session — `token !== null` ⇒ else ⇒ `sessionStore.clean()` — is `@auth/core` **0.41.2** behaviour under `next-auth` **5.0.0-beta.31**.
- A beta bump that changed the `null` contract would leave every test green while the cap silently stopped capping.
- **Recommendation**: pin `@auth/core`, and/or add one cheap test asserting the installed core still honours the `null`-clears-cookie contract.

### 4. Legacy migration is a single simultaneous mass expiry — **2026-10-15T20:33:00Z**
- Every pre-policy token is stamped the *same* pinned `authTime`, so all legacy sessions die in the **same instant** rather than spread out.
- ⚠️ **This is a deploy-by date, not a 30-day grace from deploy.** The epoch is pinned to the **#848** release (`2026-09-15T20:33Z`), not to this PR's deploy, so the grace shrinks every day this PR goes unshipped. It also covers sessions created **after** 09-15 but before deploy: they carry no `authTime` either, so they get the same pinned epoch. **If this ships after `2026-10-15T20:33:00Z`, every pre-policy session is logged out on its first request** (`legacy_migration_expired`).
- **Measured blast radius is small**: 22 `device_sessions` rows total, 1 revoked, as of the 2026-09-15 21:40Z read-only audit — so this is acceptable, not a thundering herd. Recorded because it is a fixed calendar event and it is prerequisite #2 for enabling hard deletion (§2).
- Note the coupling: `DEVICE_SESSIONS_MAX_AGE_DAYS` defaults to 30 and its own docstring says it "must match JWT maxAge" — now `SESSION_MAX_AGE_SECONDS`. Nothing gates that agreement; changing one silently diverges from the other.

### 5. Edge `jwt` callback can never mint (unreachable by path, not dead code)
- In `auth.config.ts`, `isInitialSignIn = Boolean(user) || Boolean(account)` — but `@auth/core`'s `session()` calls `callbacks.jwt({ token, trigger?, session })` with **no** `user`/`account`, and sign-in is handled by `auth.ts`'s handlers. The minting branch is therefore unreachable *at the edge*.
- It is correct defensive code, not deletable dead code — the distinction is which branch *fires*, not which *could*.
- ✅ **Done in `44dea44d`**: `auth.config.ts` now carries a comment explaining exactly this.

### 6. Missing-Row Policy, Tombstones & Cache Extension
- **Current State**: `sessionRevocation.ts` treats a missing row as revoked (`result.rowCount === 0` returns `true`).
- **Policy**: Do NOT blindly recreate missing rows, which risks resurrecting deleted/revoked tokens.
- **Tombstones**: Retain revoked rows in PostgreSQL with `revoked_at IS NOT NULL` for $\ge 30$ days before physical deletion.
- **Caching**: Implement short-lived caching (30–60s in-memory / Redis) for non-revoked session checks, with immediate invalidation on revocation.
- **Coverage**: The JWT revocation check currently runs only when `trigger === "update"`. Extend revocation checks across all session evaluations, middleware, and `getUserIdFromRequest`.

### 7. "Sign Out Everywhere" Semantics & Security UI
- **Current Limitation**: [REVOKE_ALL_SESSIONS_SQL](src/lib/auth/authQueries.ts#L30) explicitly contains `AND ($2::text IS NULL OR id <> $2)` to preserve the caller's current session.
- **Required Implementation**:
  1. Call `POST /api/auth/sessions/revoke-all` (revoking all *other* devices).
  2. Call `signOut()` immediately after (revoking and destroying the current session locally).
  3. Provide visible toast notifications for network/authorization errors (401, 403).
  4. Ensure UI copy truthfully states whether revocation is immediate or subject to cache TTL.

### 8. Vercel Build Cache Failure Mitigation
- Mitigate recurring build timeouts and OOMs by turning off Webpack disk caching in `next.config.js` for CI builds or configuring `VERCEL_FORCE_NO_BUILD_CACHE=1`.

### 9. Phase 33 Exact-Optional Property Burndown (217 → ≤160)
- Pick up the candidate pools preserved in commit `36a6d3e7`:
  - `src/utils/` (21 diagnostics)
  - `src/components/menu-planner/` (10 diagnostics)
  - `src/app/api/` (58 diagnostics)
  - `src/components/` (59 diagnostics)
- Follow the absent vs undefined vs null decision table and verify JS emit parity via `ts.transpileModule`.
