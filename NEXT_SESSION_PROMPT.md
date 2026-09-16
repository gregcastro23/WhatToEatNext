# Session Handover: Ship the 30-Day Session Cap, Then Close Its Gaps

_Canonical entry point for agent handover (WTEN only — PA / agents-repo work gets its own prompt). Raw telemetry and probes: [docs/handovers/handover-evidence-2026-09-15.md](docs/handovers/handover-evidence-2026-09-15.md). PR description: [docs/handovers/pr-body-auth-absolute-lifetime.md](docs/handovers/pr-body-auth-absolute-lifetime.md). `docs/prompts/next_session_prompt.md` is only a pointer to this file; never copy this file there._

> **Status (2026-09-16)** — the 30-day absolute session lifetime is **pushed; PR [#851](https://github.com/gregcastro23/WhatToEatNext/pull/851) is open against `master`. NOT merged, NOT deployed.** Production runs `d13aa0c1` (#850; GitHub Production deployment `6471308599`, `success` at 2026-09-16 00:39Z) with **no** absolute session cap.
>
> ⚠️ **Hard deadline — merged AND deployed well before `2026-10-15T20:33:00Z`.** The legacy epoch is pinned to the #848 release, not to this deploy. Shipping after that instant logs out every pre-policy session on its first request (§5.4).

---

## 1. Next-Session Priorities (in order)

**Re-measure before acting** — everything below was true when written, not necessarily when read:
- PR state and CI **on the current head SHA**: `gh pr view 851 --json state,headRefOid,mergeCommit,statusCheckRollup`.
- `master` head via `gh api repos/gregcastro23/WhatToEatNext/commits/master --jq .sha`. A local `origin/master` can be silently stale.
- What production serves: `gh api "repos/gregcastro23/WhatToEatNext/deployments?sha=<full sha>"`, then `…/deployments/<id>/statuses`. Look for `environment=Production` with `state=success`.

### P0 — Merge #851, deploy, and verify the cap live (deadline-driven)
1. **Merge** once the required contexts (Verify, Build, Test, rust) are green on the head SHA. Use a **merge commit, not squash**: this file, the PR body, and the handover evidence cite branch SHAs (`44dea44d`, `9c6740b1`, …), and squashing orphans them from `master`.
2. **Confirm production serves the merge commit** (a GitHub deployment for that SHA, `environment=Production`, `state=success`). If the Vercel build OOMs (exit 137) or stalls ~46 min, redeploy **without** build cache (§5.8; evidence doc §1).
3. **Live witness — legacy session.** In a browser signed in *before* the deploy, `GET https://alchm.kitchen/api/auth/session` must return `user.authTime === 1789504380`. This is observable because the edge `session` callback copies `token.authTime` into `session.user.authTime`.
4. **Live witness — fresh session.** Sign out and back in. `user.authTime` must be within seconds of the sign-in time (**not** `1789504380`), and a read-only query must show the new `device_sessions` row.
5. **Do not forge tokens against production** to witness expiry. The "expired token ⇒ cookie cleared" half is proven by P2's contract check instead.
6. **Traps for this step:**
   - **Logs cannot witness a rejection before `2026-10-15T20:33:00Z`.** Every token's `authTime` is ≥ `1789504380`, so no `expired` or `legacy_migration_expired` rejection can occur yet. "0 `Session lifetime rejected` lines" is vacuous until then.
   - Only the **server** `jwt` callback logs (`logger.info`; `createLogger` defaults to level `info` in production, so it is emitted). The **edge** middleware callback returns `null` **silently**, so middleware-path rejections never reach the logs at all.
   - A signed-out `GET /api/auth/session` returns `200` with a `null` body. It witnesses nothing.

### P1 — §5.1 before 2026-10-15: stop listing dead sessions as active
- **Why now**: it is coupled to the deadline. At `2026-10-15T20:33:00Z` every pre-policy session expires in the same instant, so all of their `device_sessions` rows become orphans at once, and every such user's sessions page lists dead devices as active.
- **Suggested fix: option (b)**, an age bound on `SELECT_DEVICE_SESSIONS_SQL`. It is read-only and adds no write on the hot path.
- ⚠️ **Bound on the effective lifetime, not raw `created_at`.** `device_sessions` has no `authTime` column, and `INSERT … ON CONFLICT (user_id, jti) DO UPDATE` never changes `created_at`. So a legacy row keeps its original sign-in `created_at` (the 09-15 audit row was `2026-08-06`) while its effective `authTime` is pinned to `2026-09-15T20:33Z`.
  - A naive `created_at > NOW() - interval '30 days'` would **hide still-valid legacy sessions** until 10-15.
  - The bound that mirrors the evaluator is `GREATEST(created_at, TIMESTAMPTZ '2026-09-15T20:33:00Z') > NOW() - interval '30 days'`.
- Changing SQL means:
  - edit it in `src/lib/auth/authQueries.ts`;
  - keep it registered in `scripts/checkAuthSqlParses.ts` (`EXPECTED_TOTAL` changes only when a statement is **added**);
  - run `bun run check:sql:auth` against a **real** Postgres.
- **Done when**:
  - The predicate is **executed** against real Postgres over literal rows (e.g. a `VALUES` CTE), proving (i) a row past its effective 30 days is excluded and (ii) a legacy row with `created_at` before 09-15 is still listed before 10-15. A mocked route test only proves which string was sent.
  - Route tests still mark the current device.
  - `check:sql:auth` passes.

### P2 — §5.3: guard the upstream `null`-token contract
- Add a **bun-run** check; jest cannot import `next-auth/jwt` (trap 4). It should:
  - encode a session JWT with `@auth/core/jwt` using a throwaway secret;
  - drive `@auth/core`'s session action with a `jwt` callback that returns `null`;
  - assert that `Set-Cookie` clears the session cookie.
- **Control**: the same token with a callback that returns the token must **not** clear the cookie. **Red proof**: invert the assertion and confirm the check fails.
- Wire it into an **existing** script chain, e.g. `test:gates` inside `verify:static`. **Do not add or rename a CI matrix command**: required contexts are pinned by repository ruleset `20950461`, so a renamed matrix entry blocks every merge even with all jobs green.
- Optionally pin `@auth/core` (currently 0.41.2, under `next-auth` 5.0.0-beta.31).

### P3 — Fix the pre-commit hook so docs-only commits stop needing `-n`
- **Measured 2026-09-16**: `lint:changed` builds its file list with `$({ git diff …; git ls-files --others …; } | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$')`. For a docs-only commit that list is **empty**, so `eslint --config eslint.config.mjs --cache` lints the **whole repo** on the default heap and dies: `FATAL ERROR: Reached heap limit`, SIGABRT, hook exit 134. The typecheck half had already passed.
- This is why every docs commit on #851 used `-n`. A habit of `-n` will eventually skip a real code check.
- **Fix**: exit 0 with a message when the list is empty (a small wrapper script is clearer than more shell inside `package.json`). **Red proof**: a docs-only commit passes the hook, and a commit containing a deliberate lint error is still rejected.

### P4 — Make revocation actually enforce (§5.6)
- Re-measure first: is `AUTH_REVOCATION_CHECK=on` set in production? Read env var **names only**, never values. As of the 2026-09-15 audit it was **absent**, so `revoked_at` is bookkeeping only.
- Even when it is on, coverage is partial:
  - the server `jwt` check runs only on `trigger === "update"` (`src/lib/auth/auth.ts`);
  - the edge check runs in `authorized` only for `isProtected` middleware-matched pages (`src/lib/auth/auth.config.ts`), so API routes and `GET /api/auth/session` are unguarded.
- ⚠️ **Ordering trap**: `isJtiRevoked` treats a **missing** row as revoked. The 09-14 audit counted 23 `signin_complete` events against 22 rows, so at least one live session has no row, and turning the check on would log those users out. Audit missing rows before enabling.

### P5 — 7-day idle enforcement: review no earlier than 2026-09-22T20:33Z
- A review date, not an enable date. Enabling needs telemetry proving `last_seen_at` touches cover real activity. Touches fire only on middleware-matched pages and `GET /api/auth/session(s)`, and are throttled to one per 10 minutes (`TOUCH_SESSION_SQL`), so users who only visit public pages look idle.

### P6 — "Sign out everywhere" semantics & UI (§5.7)
### P7 — Vercel build-cache OOM mitigation (§5.8)
### P8 — Exact-optional burndown 217 → ≤160 (§5.9)

---

## 2. Context & Repository Status

### Branch & PR State (2026-09-16, after push)
- **`origin/master`**: `d13aa0c1` — merge commit of PR #850, deployed to Production (GitHub deployment `6471308599`, `success` at 2026-09-16 00:39Z).
- **Feature branch**: `feat/auth-absolute-session-lifetime`, pushed. PR [#851](https://github.com/gregcastro23/WhatToEatNext/pull/851) is open against `master` (`MERGEABLE` at open; CI was running). It is based on `e04d8992`: ahead of master by the commits below, and behind only by the `d13aa0c1` merge commit, whose content is already in the base.
- **Commits** (trust `git log origin/master..origin/feat/auth-absolute-session-lifetime` over this list):
  - `44dea44d` feat(auth) — 6 files: `sessionLifetime.ts` (new), `__tests__/sessionLifetime.test.ts` (new), `__tests__/authWiring.test.ts`, `auth.config.ts`, `auth.ts`, `types/next-auth.d.ts`. Passed the pre-commit hook.
  - `fd775489` docs(auth) — handover prompt, pointer, handover evidence. `-n`, docs-only.
  - `9c6740b1` refactor(auth) — deletes the legacy-epoch env override (`sessionLifetime.ts` −45 lines, 4 tests removed) and restores the pointer file. Passed the hook.
  - `a8ba5d82` docs(auth) — adds the PR body file. `-n`, docs-only.
  - `8304934f` docs(auth) — corrects PR-body claims (reaper, deadline scope, contract caveat), re-measured gates, adds post-merge witnesses. `-n` **after** the hook was attempted: typecheck passed, then `lint:changed` OOMed on an empty file list (P3).
  - One further docs commit: this priorities rewrite.
- `.git/index.lock` was removed by hand once during this phase. The index was verified intact afterwards: 7291 index entries = 7291 HEAD tree entries, nothing staged.

### What Production Runs (`d13aa0c1`) vs This PR

| Capability | Origin | Status | Verification State |
| :--- | :---: | :---: | :--- |
| **Origin checks on revoke endpoints** | #848 (`6e4130f2`) | **Live** | Probed: 403 missing Origin, 403 sibling Origin, 401 canonical Origin. |
| **`last_seen_at` touch & device labels** | #848 | **Live** | DB row touched 2026-09-15 21:15Z (`Firefox on macOS`). |
| **Sign-out row revocation** | #848 | **Live** | `revoked_at` stamped 2026-09-15 21:34Z. |
| **Current-device marking** | #847 | **Live** | Unit tested; browser round trip verified. |
| **Canonical query module ([src/lib/auth/authQueries.ts](src/lib/auth/authQueries.ts))** | #850 (`d13aa0c1`) | **Deployed** | 0 copy-paste drift across 8 caller sites; admin `RETURNING id` reconciled. Not re-probed live since deploy. |
| **Auth SQL prepare gate ([scripts/checkAuthSqlParses.ts](scripts/checkAuthSqlParses.ts))** | #850 | **CI-gated** | Wired into the `pre-merge-sql` and `integrity` jobs; Control 2 proves `42P08` on an uncast `$2`. |
| **Datacenter location guard (`sec-fetch-site`)** | #850 | **Deployed** | Unit tested; not re-verified live since deploy. |
| **Route-export typegen compliance** | #850 | **Deployed** | Helper lives in [src/lib/auth/sessionResponseTouch.ts](src/lib/auth/sessionResponseTouch.ts). |
| **30-day absolute session lifetime** | [#851](https://github.com/gregcastro23/WhatToEatNext/pull/851) | **Open PR — NOT deployed** | Local + CI evidence only (§3, §4). The live witness is P0. |

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

### Reproducible Baseline Verification (re-measured at `a8ba5d82`, 2026-09-16)
Always re-run; never inherit a number. Code is unchanged since `a8ba5d82` — every later commit is docs-only.

| Gate | Command | Result |
| :--- | :--- | :--- |
| **Full static verification** | `bun run verify:static` | **Exit 0** across all 11 gates: untracked files, route validation, gate tests, strict-index, scripts typecheck, typecheck, lint, lint:scripts, lint:debt, dead modules, readJson. |
| Route validation | inside `verify:static` | 0 unvalidated / 123 body-reading routes (257 total). |
| Gate unit tests | `test:gates` | 119 / 119. |
| Strict-index | `strict-index:check` | 217 across 166 files = baseline. |
| Lint debt | `bun run lint:debt` | 1,473 = ceiling; no rule, cast, or assertion regressions. |
| Non-null assertions | `bun -e 'import path from "node:path"; import {scanAssertionSites} from "./scripts/lib/lintDebt"; console.log(scanAssertionSites(path.resolve("src"), process.cwd()).summary.nonNull)'` | 605 (ceiling ≤ 605). |
| Dead modules | `audit:dead-modules` | 0 unreachable (2,181 reachable, 53 test-only). |
| readJson validation | `check:read-json` | 0 unvalidated / 30. |
| **Auth test suites** | `bun run test --runTestsByPath` + the 8 paths below | **8 suites / 96 tests.** |
| **Auth SQL gate** | `bun run check:sql:auth` | 9/9 PREPARE + 4 controls. Last run at `9c6740b1` by another agent; auth SQL is unchanged since `e04d8992`. |

Auth suite paths (pass them explicitly — trap 6):
`src/lib/auth/__tests__/sessionLifetime.test.ts` `src/lib/auth/__tests__/authWiring.test.ts` `src/lib/auth/__tests__/sessionTouch.test.ts` `src/lib/auth/__tests__/signOutSession.test.ts` `src/lib/auth/__tests__/deviceLabels.test.ts` `src/lib/auth/__tests__/originCheck.test.ts` `src/__tests__/lib/sessionRevocation.test.ts` `src/app/api/auth/sessions/__tests__/route.test.ts`

### Tooling Traps & Operational Caveats
1. **`PREPARE` Scope**: `bun run check:sql:auth` validates SQL syntax, table/column presence, and parameter deduction in PostgreSQL. It does **not** evaluate runtime business logic or row updates. Unit tests remain mandatory.
2. **Auth SQL Extensibility**: The gate currently verifies exactly 9 statements (`EXPECTED_TOTAL = 9`). Any newly introduced SQL query must be added to [src/lib/auth/authQueries.ts](src/lib/auth/authQueries.ts) and registered in [scripts/checkAuthSqlParses.ts](scripts/checkAuthSqlParses.ts).
3. **Pre-push Hook is a Stub**: The pre-push hook is a `git-lfs` stub and does not run CI checks. Run verification commands explicitly.
4. **Jest & `next-auth/jwt`**: Jest cannot import `next-auth/jwt` directly due to ESM export mapping conflicts. Mock or isolate JWT helpers at the test boundary.
5. **Worktrees Require `node_modules` Symlink**: Always run `ln -s ../../node_modules node_modules` in any newly created worktree. Never run `worktree remove -f` without auditing untracked files.
6. **Zsh Multi-Path Splitting**: In zsh, unquoted `$VAR` containing space-separated paths does not word-split and silently runs 0 tests. Always pass explicit arguments.
7. **Stage Files Strictly by Name**: Never run `git add .` or `git add -A`.
8. **Exact test counts need `--runTestsByPath`**: positional jest args are regex path *patterns* and can match extra suites. `sessionRevocation.test.ts` lives in `src/__tests__/lib/`, not `src/lib/auth/__tests__/`; five other auth test paths tried during this phase do not exist.
9. **The pre-commit hook OOMs on docs-only commits** (P3). Until it is fixed, `-n` is acceptable **only** for docs-only commits, and the commit message must say so.
10. **Never `rm .git/index.lock` without first checking for a live git process** (IDE background git holds it). Afterwards compare `git ls-files | wc -l` with `git ls-tree -r HEAD | wc -l`.
11. **macOS has no `timeout` command.** `timeout 120 git push` fails with exit 127 and pushes nothing; use the tool's own timeout instead.
12. **A rejected commit leaves its files staged.** Check `git diff --cached --name-only` before retrying.

---

## 4. Completion (Done When)

Criteria 1–6 are **met and committed** (`44dea44d`, env override removed in `9c6740b1`). Criterion 7 is **half met**: SHAs are recorded and PR #851 is open, but nothing is merged, deployed, or verified live (P0). The original spec's `DEPLOYMENT_TIMESTAMP` is implemented as `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS`, pinned to the **#848 release** rather than to this PR's deploy (§5.4).

| # | Criterion | State | Where / evidence |
| :--- | :--- | :---: | :--- |
| 1 | `authTime` stamped on initial sign-in | **Met** | `evaluateSessionLifetime` returns `authTime: now` when `isInitialSignIn`; called at the top of the `jwt` callback in `src/lib/auth/auth.ts`. |
| 2 | `authTime` preserved across refresh/update | **Met** | Valid present-claim branch returns `tokenAuthTime` unchanged; `authWiring.test.ts` covers `trigger === "update"` and a client attempting to overwrite it. |
| 3 | `now >= authTime + 30d` ⇒ `null` | **Met** | Strict `>=` boundary in `sessionLifetime.ts`; returning `null` really does clear the cookie — see the upstream contract below. |
| 4 | Legacy tokens bounded, cannot reset grace | **Met** | `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380`. Verified: that is exactly `2026-09-15T20:33:00Z` (the `q8dv3cm3y` Ready instant), and `+2592000 = 1792096380` = **`2026-10-15T20:33:00Z`**. Pinned, so refreshes cannot extend it. |
| 5 | Boundary tests pass | **Met** | 43 tests across `sessionLifetime.test.ts` (24) and `authWiring.test.ts` (19). 8 suites / 96 tests green (`sessionLifetime`, `authWiring`, `sessionTouch`, `signOutSession`, `deviceLabels`, `originCheck`, `src/__tests__/lib/sessionRevocation`, `sessions/route`). Note: `sessionRevocation.test.ts` lives under `src/__tests__/lib/`, **not** `src/lib/auth/__tests__/`. |
| 6 | `typecheck` / `lint:debt` / `check:sql:auth` clean | **Met** | Re-measured at `a8ba5d82` (§3): `verify:static` exit 0 across all 11 gates; lint debt 1,473; non-null 605. This phase added no SQL, so `check:sql:auth` stays 9/9. |
| 7 | Commit SHAs + live verification recorded | **Half** | SHAs recorded (§2); pushed; PR #851 open. Not merged, not deployed, not verified live (P0). |

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

## 5. Findings & Backlog Detail

_Referenced by the §1 priorities. Numbering is stable because the PR body links to §5.1 and §5.3; mark items resolved instead of renumbering._

### 1. Cap expiry orphans the `device_sessions` row — the sessions UI lies
- **Found**: 2026-09-16, reviewing this phase. Not yet fixed; disclosed as a known gap in PR #851. **Scheduled as P1.**
- **Mechanism**: when the absolute cap fires, `@auth/core` clears the cookie but does **not** emit `events.signOut`, so `onSignOutEvent` → `handleSignOutSession` → `REVOKE_SESSION_ON_SIGNOUT_SQL` never runs. The row keeps `revoked_at IS NULL` **forever**.
- **Consequence**: `SELECT_DEVICE_SESSIONS_SQL` filters on `user_id = $1 AND revoked_at IS NULL` with **no age bound** (`LIMIT 25`, ordered by `last_seen_at`). `GET /api/auth/sessions` therefore lists a device whose session is already dead as an **active session** — on a security-facing surface, indefinitely. The NextAuth `sessions` row also lingers (its `expires` is now correctly in the past, but only sign-out deletes rows, and with `strategy: "jwt"` nothing reads that table).
- **Only current reaper**: `scripts/cleanup-device-sessions.ts` at `last_seen_at < NOW() - 30 days` — and that job has **no schedule attached**.
- **Fix options**: (a) revoke the row inside the `jwt` callback on the invalid branch before returning `null` (Node runtime only — the edge callback cannot reach Postgres); (b) add an age bound to `SELECT_DEVICE_SESSIONS_SQL` (remember: new/changed SQL must be registered in `scripts/checkAuthSqlParses.ts` and `EXPECTED_TOTAL` bumped); or (c) accept it and say so in the UI copy. Option (a) writes on a hot read path — measure before shipping.
- ⚠️ For (b), bound on the **effective** lifetime, not raw `created_at` — legacy rows predate their pinned `authTime`. See P1.

### 2. Legacy-epoch env override — deleted, pinned constant is the single authority
- **Resolved**: The env override, module-load parser `resolveConfiguredMigrationEpoch()`, and test-only helper `resolveMigrationEpochSeconds` have been completely deleted.
- **Single Source of Truth**: `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380` is the single, pinned constant. It requires no environment variable, cannot throw or be bypassed on the hot path, and eliminates any future-timestamp drift.
- **Witness (red → green), same command both times** — `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS=1800000000 bun -e …`, calling `evaluateSessionLifetime` for a legacy token and then for the same token 60 s later:
  - at `44dea44d`: req1 `{"valid":true,"authTime":1800000000}`, req2 `{"valid":false,"reason":"future_clock_skew"}` — logged out;
  - at `a8ba5d82`: req1 and req2 both `{"valid":true,"authTime":1789504380}` — the env var is ignored.
- `grep` for `CONFIGURED_MIGRATION_EPOCH_SECONDS`, `resolveMigrationEpochSeconds`, `resolveConfiguredMigrationEpoch`, and `AUTH_LEGACY_MIGRATION_EPOCH_SECONDS` across `src/` and `scripts/` → 0 hits. `sessionLifetime.ts` reads no `process.env`.

### 3. No guard on the upstream `null`-token contract
- Every one of the 47 new tests asserts what *our* function returns. The behaviour that actually ends the session — `token !== null` ⇒ else ⇒ `sessionStore.clean()` — is `@auth/core` **0.41.2** behaviour under `next-auth` **5.0.0-beta.31**.
- A beta bump that changed the `null` contract would leave every test green while the cap silently stopped capping.
- **Recommendation**: pin `@auth/core`, and/or add one cheap check asserting the installed core still honours the `null`-clears-cookie contract. Disclosed in PR #851. **Scheduled as P2.**

### 4. Legacy migration is a single simultaneous mass expiry — **2026-10-15T20:33:00Z**
- Every pre-policy token is stamped the *same* pinned `authTime`, so all legacy sessions die in the **same instant** rather than spread out.
- ⚠️ **This is a deploy-by date, not a 30-day grace from deploy.** The epoch is pinned to the **#848** release (`2026-09-15T20:33Z`), not to this PR's deploy, so the grace shrinks every day this PR goes unshipped. It also covers sessions created **after** 09-15 but before deploy: they carry no `authTime` either, so they get the same pinned epoch. **If this ships after `2026-10-15T20:33:00Z`, every pre-policy session is logged out on its first request** (`legacy_migration_expired`).
- **Measured blast radius is small**: 22 `device_sessions` rows total, 1 revoked, as of the 2026-09-15 21:40Z read-only audit — so this is acceptable, not a thundering herd. Recorded because it is a fixed calendar event and it is prerequisite #2 for enabling hard deletion (§2).
- **Scheduled consequences**: P0 (ship before it) and P1 (the orphaned-row listing lands for every legacy user in that same instant).
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
