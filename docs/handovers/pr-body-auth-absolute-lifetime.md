## Summary

This PR implements and enforces a **30-day absolute session lifetime** cap across WhatToEatNext (Alchm.kitchen) with a bounded legacy migration window.

Sessions now carry an immutable `authTime` Unix epoch timestamp minted on initial sign-in. Once a session reaches `authTime + 30 days`, the session is terminated regardless of ongoing activity, rolling JWT expiration, or client-driven updates.

### Key Changes
1. **Pure Session Lifetime Evaluator (`src/lib/auth/sessionLifetime.ts`)**:
   - `SESSION_MAX_AGE_SECONDS`: Pinned to 2,592,000s (30 days).
   - `CLOCK_SKEW_TOLERANCE_SECONDS`: Pinned to 300s (5 minutes).
   - `LEGACY_SESSION_MIGRATION_EPOCH_SECONDS`: Pinned to `1789504380` (`2026-09-15T20:33:00Z`, Phase 1 release).
   - Single source of truth: No environment variable overrides, eliminating runtime throws and startup parsing drift.
   - Type-safe evaluation union distinguishing initial sign-in, legacy tokens, corrupted/explicit-null claims, clock skew, and boundary expiration.
2. **Dual Auth.js Configuration Enforcement**:
   - **Edge Runtime (`src/lib/auth/auth.config.ts`)**: Synchronous `callbacks.jwt` invokes `evaluateSessionLifetime`. Middleware rejects expired sessions and ceases cookie refreshes.
   - **Server Runtime (`src/lib/auth/auth.ts`)**: Server `callbacks.jwt` invokes `evaluateSessionLifetime` at the very top, returning `null` immediately prior to any database queries or revocation checks. Preserves `authTime` immutably on `trigger === "update"`.
   - Derives database `sessions` row `expiresAt` directly from `authTime + 30 days`.
3. **Type Augmentation (`src/types/next-auth.d.ts`)**:
   - Added `authTime?: number;` to NextAuth `Session.user` and `JWT` interfaces.

---

## Verification & Test Results

- **Unit & Boundary Tests**:
  - `src/lib/auth/__tests__/sessionLifetime.test.ts`: 24/24 passed (exact $\pm 1$s boundaries, clock skew, malformed claims, legacy grace cutoff).
- **Full Auth Test Suites (8 Suites, 96 Tests)**:
  - All 8 suites passing (`sessionLifetime`, `authWiring`, `sessionTouch`, `signOutSession`, `deviceLabels`, `originCheck`, `sessionRevocation`, `sessions/route`).
- **Auth SQL Prepare Gate**:
  - `bun run check:sql:auth`: 9/9 statements prepared and type-checked against live PostgreSQL.
- **Static Verification Gates** (re-run at `a8ba5d82`; later commits on this branch are docs-only):
  - `bun run verify:static`: exit 0 across all 11 gates.
  - TypeScript compilation: 0 errors.
  - Lint debt: 1,473 (baseline $\le 1,473$).
  - Non-null assertions: 605 (baseline $\le 605$).
  - Dead-module audit: 0 unreachable. readJson validation: 0 / 30 unvalidated. Route validation: 0 / 123 unvalidated.

---

## Operational Considerations & Known Gaps

1. **Deploy-By Deadline (`2026-10-15T20:33:00Z`)**:
   - Legacy tokens without `authTime` are anchored to the Phase 1 release (`2026-09-15T20:33:00Z`).
   - If deployed after `2026-10-15T20:33:00Z`, all unstamped legacy sessions will expire immediately upon first request.
   - The grace window is measured from the Phase 1 release, **not** from this deploy, so it shrinks every day this PR is unmerged. Sessions created after 2026-09-15 but before deploy also carry no `authTime` and share the same deadline.
2. **Orphaned `device_sessions` Row on Cap Expiry**:
   - When the 30-day cap fires, `@auth/core` clears the session cookie but does **not** emit `events.signOut`.
   - `revoked_at` remains `NULL` in `device_sessions`, and `GET /api/auth/sessions` filters only on `revoked_at IS NULL` with no age bound, so the sessions UI keeps listing the dead device as active.
   - There is **no effective reaper today**: `scripts/cleanup-device-sessions.ts` has no schedule attached and dry-runs unless `ALLOW_DEVICE_SESSION_DELETIONS=1`. In practice these rows persist indefinitely. Deferred; tracked as §5.1 in `NEXT_SESSION_PROMPT.md`.
3. **Upstream NextAuth (`@auth/core`) Contract**:
   - Cookie clearance relies on `@auth/core` 0.41.2 behavior where returning `null` from `callbacks.jwt` triggers `sessionStore.clean()` (verified by reading `node_modules/@auth/core/lib/actions/session.js`). No test asserts this, and `next-auth` is **5.0.0-beta.31**, so a dependency bump could silently disable the cap. Deferred; tracked as §5.3 in `NEXT_SESSION_PROMPT.md`.

---

## Post-merge verification (required — nothing here has been verified live)

1. Confirm the Production deployment for the merge commit reports `success`.
2. **Legacy session**: in a browser signed in before the deploy, `GET /api/auth/session` returns `user.authTime === 1789504380`.
3. **Fresh session**: after signing out and back in, `user.authTime` is the sign-in time, not `1789504380`.
4. Logs cannot witness a rejection before `2026-10-15T20:33:00Z`, because no token can be expired yet. The edge middleware callback also rejects silently.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
