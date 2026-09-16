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
- **Static Verification Gates**:
  - `bun run verify:static`: All 11 static gates exit 0.
  - TypeScript compilation: 0 errors.
  - Lint debt: 1,473 (baseline $\le 1,473$).
  - Non-null assertions: 605 (baseline $\le 605$).

---

## Operational Considerations & Known Gaps

1. **Deploy-By Deadline (`2026-10-15T20:33:00Z`)**:
   - Legacy tokens without `authTime` are anchored to the Phase 1 release (`2026-09-15T20:33:00Z`).
   - If deployed after `2026-10-15T20:33:00Z`, all unstamped legacy sessions will expire immediately upon first request.
2. **Orphaned `device_sessions` Row on Cap Expiry**:
   - When the 30-day cap fires, `@auth/core` clears the session cookie but does **not** emit `events.signOut`.
   - `revoked_at` remains `NULL` in `device_sessions`, so the sessions UI continues to display the device until the 30-day reaper script runs. Tracked as Backlog Item §5.1.
3. **Upstream NextAuth (`@auth/core`) Contract**:
   - Cookie clearance relies on `@auth/core` 0.41.2 behavior where returning `null` from `callbacks.jwt` triggers `sessionStore.clean()`. Tracked as Backlog Item §5.3.
