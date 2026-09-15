/**
 * Device session activity touch and metadata refresh service.
 *
 * Keeps `device_sessions.last_seen_at` and coarse device/location metadata
 * up to date for active user sessions.
 *
 * Throttling strategy:
 *   1. Redis `session:touch:<id>` with NX and 10-minute TTL (optimization).
 *   2. Authoritative SQL predicate:
 *      `WHERE id = $1 AND revoked_at IS NULL AND last_seen_at < NOW() - interval '10 minutes'`
 *   3. Never INSERT if 0 rows matched (prevents resurrecting deleted/unseeded sessions).
 *
 * Execution safety:
 *   Non-blocking background updates via `after()` from `next/server` with
 *   defensive fallback for non-request environments (tests, scripts).
 *
 * @file src/lib/auth/sessionTouch.ts
 */

import { after } from "next/server";
import { createLogger } from "@/utils/logger";
import { extractDeviceMetadata } from "./deviceLabels";

const logger = createLogger("sessionTouch");

const REDIS_TOUCH_PREFIX = "session:touch:";
const TOUCH_THROTTLE_SECONDS = 600; // 10 minutes

type HeaderSource = Request | Headers | { headers: Headers };

async function checkRedisThrottle(cleanId: string): Promise<boolean> {
  try {
    const { getRedisClient } = await import("../redis");
    const client = getRedisClient();
    if (client) {
      const setResult = await client.set(
        REDIS_TOUCH_PREFIX + cleanId,
        "1",
        { nx: true, ex: TOUCH_THROTTLE_SECONDS },
      );
      if (!setResult) {
        return false;
      }
    }
  } catch (err) {
    logger.warn("[sessionTouch] Redis throttle check failed (falling back to SQL):", {
      err: String(err),
    });
  }
  return true;
}

async function updateSessionInDb(cleanId: string, source?: HeaderSource): Promise<boolean> {
  const metadata = source
    ? extractDeviceMetadata(source)
    : {
        device: null,
        userAgent: null,
        locationCity: null,
        locationRegion: null,
        locationCountry: null,
      };

  const { executeQuery } = await import("@/lib/database");
  const result = await executeQuery(
    `UPDATE device_sessions
        SET last_seen_at = NOW(),
            device = COALESCE($2, device),
            user_agent = COALESCE($3, user_agent),
            location_city = COALESCE($4, location_city),
            location_region = COALESCE($5, location_region),
            location_country = COALESCE($6, location_country)
      WHERE id = $1
        AND revoked_at IS NULL
        AND (last_seen_at < NOW() - interval '10 minutes' OR (device IS NULL AND $2::text IS NOT NULL))
      RETURNING id`,
    [
      cleanId,
      metadata.device && metadata.device !== "Unknown device" ? metadata.device : null,
      metadata.userAgent,
      metadata.locationCity,
      metadata.locationRegion,
      metadata.locationCountry,
    ],
  );

  return (result.rowCount ?? 0) > 0;
}

/**
 * Updates `last_seen_at` and device metadata for a valid active session.
 *
 * Returns `true` if the session was touched in the database, `false` if
 * throttled, session not found, or already revoked.
 */
export async function touchSession(
  sessionId: string | null | undefined,
  source?: HeaderSource,
): Promise<boolean> {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
    return false;
  }

  const cleanId = sessionId.trim();

  const allowedToQuery = await checkRedisThrottle(cleanId);
  if (!allowedToQuery) {
    return false;
  }

  try {
    return await updateSessionInDb(cleanId, source);
  } catch (err) {
    logger.warn("[sessionTouch] Database touch query failed:", { err: String(err) });
    return false;
  }
}

/**
 * Schedules a session touch asynchronously without blocking the request/response cycle.
 */
export function scheduleSessionTouch(
  sessionId: string | null | undefined,
  source?: HeaderSource,
): void {
  if (!sessionId || typeof sessionId !== "string" || sessionId.trim().length === 0) {
    return;
  }

  const run = async (): Promise<void> => {
    try {
      await touchSession(sessionId, source);
    } catch (err) {
      logger.warn("[sessionTouch] Background touch error:", { err: String(err) });
    }
  };

  try {
    after(run);
  } catch {
    // If called outside Next.js request scope (e.g. in unit tests), execute directly
    run().catch(() => {});
  }
}
