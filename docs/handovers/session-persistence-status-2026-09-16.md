# Session Persistence & Hardening Status

_Reference document for WTEN session persistence, live verification status, and remaining security gaps as of 2026-09-16._

---

## 1. Current Deployed State (Production)

- **30-Day Absolute Session Cap (Shipped & Live)**:
  - Commit: `7bdc4adf65f44aafc6f7a81e75cc21871975cb73` (PR #851 merge commit).
  - GitHub Production Deployment: `6480366726`, `state=success` at 2026-09-16 12:03:22Z.
  - Active on [alchm.kitchen](https://alchm.kitchen).
  - Every newly minted session receives an `authTime` claim. Sessions expire strictly at `authTime + 30 days` regardless of ongoing activity or rolling JWT exp.
  - Pre-policy tokens without `authTime` receive pinned `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS = 1789504380` (2026-09-15T20:33:00Z) and expire on 2026-10-15T20:33:00Z.

- **Earlier Hardening (Shipped in #848 & #850)**:
  - Sign-out row revocation (`REVOKE_SESSION_ON_SIGNOUT_SQL`).
  - `last_seen_at` touches and device labeling (`TOUCH_SESSION_SQL`).
  - Origin and Sec-Fetch-Site checks on session revocation endpoints.
  - Canonical auth queries module (`src/lib/auth/authQueries.ts`).
  - Prepared SQL CI gate (`scripts/checkAuthSqlParses.ts`).

- **Gaps Closed in PR #852 (Open against master)**:
  - **P1 — Active Device Sessions Filtering**:
    - `SELECT_DEVICE_SESSIONS_SQL` uses `buildDeviceSessionActiveClause()` to exclude dead sessions past their effective 30-day lifetime while preserving legacy sessions until 2026-10-15T20:33:00Z.
    - Verified by Control 5 in `scripts/checkAuthSqlParses.ts` against live PostgreSQL over literal rows via CTE.
  - **P2 — Upstream `@auth/core` Null-Token Contract Guard**:
    - Standalone check `scripts/checkAuthNullTokenContract.ts` wired into `test:gates`.
    - Loads `@auth/core` directly from `next-auth`'s location to prevent subdependency divergence.
    - Asserts that returning `null` from `jwt()` emits `Set-Cookie` with `Max-Age=0` for both HTTP and HTTPS cookies.
  - **P3 — Pre-Commit Hook Heap OOM Fix**:
    - `scripts/lintChanged.ts` wrapper skips ESLint on empty JS/TS diffs, eliminating heap OOMs (`SIGABRT 134`) on docs-only commits. Exits 1 if git queries fail.

---

## 2. Unresolved Session Persistence Gaps & Tail

| Gap | Details & Required Action |
| :--- | :--- |
| **Revoking a device does not end its session** | `AUTH_REVOCATION_CHECK` is **not set** in production environment variables (confirmed via env scan on 2026-09-16: `AUTH_SECRET`, `DATABASE_URL`, and `AUTH_GOOGLE_ID` exist, but `AUTH_REVOCATION_CHECK` is absent). Revoking marks `revoked_at` in the database, but the client JWT remains valid until the 30-day cap expires. |
| **Partial enforcement coverage even when enabled** | In code, server-side JWT check only runs when `trigger === "update"` (`src/lib/auth/auth.ts`). Edge check only runs in `authorized` for `isProtected` middleware routes (`src/lib/auth/auth.config.ts`), leaving API routes unguarded. |
| **Missing-row logout risk** | `isJtiRevoked` treats a missing database row as revoked. Because historical signins had unrecorded rows (e.g. 23 signins vs 22 rows on 09-14 audit), blindly turning on `AUTH_REVOCATION_CHECK` will immediately log out valid active users. Missing rows must be audited before enabling. |
| **Sign-out everywhere UI & semantics** | `REVOKE_ALL_SESSIONS_SQL` explicitly excludes the caller's row (`AND ($2::text IS NULL OR id <> $2)`). Complete flow requires calling `revoke-all` followed by local `signOut()`. No UI button or user toast exists yet. |
| **Session cleanup job unscheduled** | `scripts/cleanup-device-sessions.ts` only runs dry runs and has no scheduled cron trigger. A hard tombstone retention policy (retaining revoked rows for $\ge 30$ days before physical deletion) must be established. |

---

## 3. Dated Milestones & Probes

1. **Live Browser Witness (`authTime`)**:
   - In a browser signed in *before* 2026-09-16 12:03:22Z, navigate to `https://alchm.kitchen/api/auth/session`.
   - Verify `user.authTime === 1789504380`.
   - Sign out and back in: verify `user.authTime` is within seconds of the current Unix epoch time.
2. **2026-09-22T20:33:00Z**:
   - Earliest review date (not automatic enablement trigger) for 7-day idle session timeouts. Requires telemetry proving `last_seen_at` touches reliably cover active users.
3. **2026-10-15T20:33:00Z**:
   - Simultaneous mass expiry instant for all pre-policy legacy sessions.
