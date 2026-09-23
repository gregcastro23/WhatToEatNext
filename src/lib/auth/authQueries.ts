/**
 * Canonical SQL statements for auth and device session management.
 * Zero external runtime dependencies so they can be imported cleanly
 * by services, API routes, and verification gates without drift.
 *
 * @file src/lib/auth/authQueries.ts
 */

import {
  LEGACY_SESSION_MIGRATION_EPOCH_SECONDS,
  SESSION_MAX_AGE_SECONDS,
} from "./sessionLifetime";

export const TOUCH_SESSION_SQL = `UPDATE device_sessions
        SET last_seen_at = NOW(),
            device = COALESCE($2, device),
            user_agent = COALESCE($3, user_agent),
            location_city = COALESCE($4, location_city),
            location_region = COALESCE($5, location_region),
            location_country = COALESCE($6, location_country)
      WHERE id = $1
        AND revoked_at IS NULL
        AND (last_seen_at < NOW() - interval '10 minutes' OR (device IS NULL AND $2::text IS NOT NULL))
      RETURNING id`;

export const REVOKE_SESSION_ON_SIGNOUT_SQL = `UPDATE device_sessions SET revoked_at = NOW() WHERE id = $1 AND revoked_at IS NULL`;

export const DELETE_NEXTAUTH_SESSION_ON_SIGNOUT_SQL = `DELETE FROM sessions WHERE "sessionToken" = $1`;

export const REVOKE_SESSION_BY_ID_SQL = `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
        RETURNING id`;

export const REVOKE_ALL_SESSIONS_SQL = `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND ($2::text IS NULL OR id <> $2)
        RETURNING id`;

/**
 * Pinned deployment instant for PR #851 absolute session lifetime (Production deploy 6480366726).
 * Sessions created at or before this instant carried no authTime claim in their JWT and were
 * stamped with LEGACY_SESSION_MIGRATION_EPOCH_SECONDS (2026-09-15T20:33:00Z).
 */
const SESSION_CAP_DEPLOY_TIMESTAMP_ISO = "2026-09-16T12:03:22Z";

/**
 * Filter predicate builder that bounds active device sessions to their exact effective lifetime.
 * Pre-deploy sessions expire at LEGACY_SESSION_MIGRATION_EPOCH_SECONDS + 30 days (2026-10-15T20:33:00Z).
 * Post-deploy sessions expire at created_at + 30 days.
 */
export function buildDeviceSessionActiveClause(
  createdAtCol = "created_at",
  nowExpr = "NOW()",
): string {
  const legacyEpochIso = new Date(
    LEGACY_SESSION_MIGRATION_EPOCH_SECONDS * 1000,
  ).toISOString();
  return `CASE WHEN ${createdAtCol} <= TIMESTAMPTZ '${SESSION_CAP_DEPLOY_TIMESTAMP_ISO}' THEN TIMESTAMPTZ '${legacyEpochIso}' ELSE ${createdAtCol} END > ${nowExpr} - interval '${SESSION_MAX_AGE_SECONDS} seconds'`;
}

export const SELECT_DEVICE_SESSIONS_SQL = `SELECT id, subdomain, device, user_agent, location_city, location_region, location_country, last_seen_at, revoked_at
         FROM device_sessions
        WHERE user_id = $1
          AND revoked_at IS NULL
          AND ${buildDeviceSessionActiveClause()}
        ORDER BY last_seen_at DESC
        LIMIT 25`;

export const SELECT_REVOKED_AT_BY_JTI_SQL = `SELECT revoked_at FROM device_sessions WHERE jti = $1 LIMIT 1`;

export const INSERT_DEVICE_SESSION_ON_SIGNIN_SQL = `INSERT INTO device_sessions (id, user_id, jti, provider, current_for_jti)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (user_id, jti) DO UPDATE SET
                     last_seen_at = NOW(),
                     revoked_at = NULL`;

export const ADMIN_REVOKE_USER_SESSIONS_SQL = `UPDATE device_sessions
          SET revoked_at = NOW()
        WHERE user_id = $1
          AND revoked_at IS NULL
        RETURNING id`;
