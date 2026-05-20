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

**Revocation**: Soft revocation is implemented via [src/lib/auth/sessionRevocation.ts](../../src/lib/auth/sessionRevocation.ts). When `AUTH_REVOCATION_CHECK=on`, the middleware `authorized()` callback calls `isJtiRevoked(jti)`, which:

1. Looks up `session:revoked:<jti>` in Upstash Redis (negative cache); a hit denies immediately.
2. On cache miss, queries `device_sessions` and treats `revoked_at IS NOT NULL OR row missing` as revoked.
3. Lazy-populates Redis with TTL = remaining JWT lifetime so the next request from any instance is fast.
4. Fails open if both stores error — matches every other DB-touching path in this codebase.

The `DELETE /api/auth/sessions/[id]` and `POST /api/auth/sessions/revoke-all` endpoints write to Postgres only; the Redis cache is populated lazily by the middleware on the next protected-route hit. This is a one-write-path design to minimize coupling between the revoke endpoint and the cache backend.

Belt-and-braces: the `jwt()` callback also re-validates on `trigger === "update"` and returns `null` if the jti is revoked. Pure API-only consumers (no protected-page hits) keep a revoked JWT alive until its natural 30-day expiry; this is the "soft" part of the design.

**Fallback**: `GET /api/auth/sessions` falls back to JWT introspection if the DB is unavailable, returning the current session only.

## Consequences

**Positive:**
- Users can see and manage their active devices in `/profile/security`
- `sessionId` in the JWT enables per-session audit logging
- No change to NextAuth session strategy — edge auth still works

**Negative:**
- Revocation is soft: middleware checks the revocation store on every protected-route hit, but API-only consumers (no middleware match) keep working until the JWT's natural 30-day expiry. Hard revocation across every authenticated request was an explicit non-goal — adding a lookup to every `auth()` call was rejected for perf reasons.
- `device_sessions` rows must be cleaned up. Expired rows linger until the next sign-in or a cron job. The daily `device-sessions-cleanup` Railway cron (see [CRON_JOBS.md](../deployment/CRON_JOBS.md)) prunes rows whose `last_seen_at` is older than the JWT `maxAge`, and prunes revoked rows after a short grace period.
- If `device_sessions` write fails on sign-in (DB unavailable), the JWT still works but no session row is written. Silent degradation.
