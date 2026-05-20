/**
 * Session revocation check for the middleware boundary.
 *
 * A `device_sessions` row is considered "revoked" when:
 *   - the row's `revoked_at` is non-null, OR
 *   - the row no longer exists (deleted by the cleanup cron or admin tooling).
 *
 * Lookup strategy:
 *   1. Upstash Redis "denylist" cache — `session:revoked:<jti>` keys with a
 *      TTL set to the remaining JWT lifetime. A cache hit immediately denies
 *      the request without a DB round trip.
 *   2. On Redis miss (or Redis unavailable), fall back to Postgres. If the
 *      row is revoked or missing, populate the Redis cache so future hits
 *      from any instance are fast.
 *
 * Fail-open: if both stores error, treat the jti as NOT revoked and log a
 * warning. Matches every other DB-touching path in this codebase (sign-in
 * also degrades gracefully when device_sessions writes fail).
 *
 * Gated by AUTH_REVOCATION_CHECK=on at the call site (middleware).
 */

import { logger } from "../logger";

const REDIS_KEY_PREFIX = "session:revoked:";

/** Falls back to 30d if env var is missing or invalid. Matches auth.config.ts. */
function getJwtMaxAgeSeconds(): number {
  const raw = process.env.AUTH_JWT_MAX_AGE_SECONDS;
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return 30 * 24 * 60 * 60;
}

/**
 * Returns whether the given jti is revoked.
 *
 * @param jti  The JWT id (UUID stored as both `sessions.sessionToken` and
 *             `device_sessions.jti` / `device_sessions.id`).
 * @returns    true if the jti is revoked or unknown, false otherwise.
 */
export async function isJtiRevoked(jti: string): Promise<boolean> {
  if (!jti) return false;

  // Step 1: Redis denylist.
  const cached = await checkRedis(jti);
  if (cached === true) return true;
  // cached === false means "Redis says not revoked" — but the negative cache
  // is only authoritative for entries we put there, so we still need to
  // confirm via Postgres on cache miss. Skip the DB only when cached is true.

  // Step 2: Postgres source of truth.
  const dbRevoked = await checkPostgres(jti);
  if (dbRevoked === null) {
    // Postgres errored — fail-open.
    return false;
  }

  // Lazy-populate Redis so the next request from any instance is fast.
  if (dbRevoked) {
    void writeRedis(jti);
  }
  return dbRevoked;
}

async function checkRedis(jti: string): Promise<boolean | null> {
  try {
    const { getRedisClient } = await import("../redis");
    const client = getRedisClient();
    if (!client) return null;
    const value = await client.get<string>(REDIS_KEY_PREFIX + jti);
    return value !== null;
  } catch (err) {
    void logger.warn("[sessionRevocation] Redis check failed:", { err: String(err) });
    return null;
  }
}

/**
 * Returns:
 *   true   — jti is revoked or row is missing entirely
 *   false  — jti row exists and revoked_at IS NULL
 *   null   — query errored (fail-open at the caller)
 */
async function checkPostgres(jti: string): Promise<boolean | null> {
  try {
    const { executeQuery } = await import("@/lib/database");
    const result = await executeQuery(
      `SELECT revoked_at FROM device_sessions WHERE jti = $1 LIMIT 1`,
      [jti],
    );
    if (result.rowCount === 0) {
      // Per ADR-004: row missing is treated as revoked. The cleanup cron
      // only deletes rows whose last_seen_at exceeds JWT maxAge (or that
      // have been revoked for the grace period), so any missing row should
      // correspond to a JWT that has no valid backing row. The remaining
      // edge case — a fresh sign-in where the device_sessions INSERT failed
      // silently in auth.ts — would loop the user back to /login. The
      // warning below surfaces that scenario so it can be detected before
      // turning the feature on in production.
      void logger.warn("[sessionRevocation] No device_sessions row for jti", { jti });
      return true;
    }
    const row = result.rows[0] as { revoked_at: Date | null };
    return row.revoked_at !== null;
  } catch (err) {
    void logger.warn("[sessionRevocation] Postgres check failed:", { err: String(err) });
    return null;
  }
}

async function writeRedis(jti: string): Promise<void> {
  try {
    const { getRedisClient } = await import("../redis");
    const client = getRedisClient();
    if (!client) return;
    await client.set(REDIS_KEY_PREFIX + jti, "1", { ex: getJwtMaxAgeSeconds() });
  } catch (err) {
    void logger.warn("[sessionRevocation] Redis populate failed:", { err: String(err) });
  }
}
