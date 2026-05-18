# ADR-004: Device Sessions via DB + JWT `jti`

**Status**: Accepted  
**Date**: 2026-05-09  
**Deciders**: Greg Castro  

---

## Context

NextAuth.js v5 uses httpOnly cookies containing a JWT. By default there is no way to:
- List all active sessions for a user ("you're logged in on 3 devices")
- Revoke a specific session without invalidating all sessions
- Show the user when and where they last logged in

The standard NextAuth solution is to use database sessions (`strategy: "database"`) but this requires a full session table and invalidates the JWT approach we rely on for edge compatibility.

## Decision

Keep JWTs for session tokens but **augment with a `device_sessions` side-table** that records JWT IDs:

```sql
CREATE TABLE device_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jti          VARCHAR(255) UNIQUE NOT NULL,  -- JWT ID (sessionId)
  user_agent   TEXT,
  ip_address   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ NOT NULL
);
```

On sign-in, the JWT callback in `auth.ts` generates a UUID as `jti`, writes a row to `device_sessions`, and stores the `jti` as `token.sessionId`.

**Revocation**: Deleting a `device_sessions` row doesn't invalidate the cookie (JWTs are self-contained), but the `AccountSessions` component calls `DELETE /api/auth/sessions/[id]` which removes the row. Future middleware can check for the row's existence to gate access — the groundwork is laid.

**Fallback**: `GET /api/auth/sessions` falls back to JWT introspection if the DB is unavailable, returning the current session only.

## Consequences

**Positive:**
- Users can see and manage their active devices in `/profile/security`
- `sessionId` in the JWT enables per-session audit logging
- No change to NextAuth session strategy — edge auth still works

**Negative:**
- Revocation is soft (row deleted but token still valid until expiry). Full revocation requires middleware checking the DB on every request — deferred.
- `device_sessions` rows must be cleaned up. Expired rows linger until the next sign-in or a cron job. A cleanup migration or Railway cron is not yet implemented.
- If `device_sessions` write fails on sign-in (DB unavailable), the JWT still works but no session row is written. Silent degradation.
