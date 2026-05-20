/**
 * scripts/cleanup-device-sessions.ts
 *
 * Periodic cleanup of stale rows in the `device_sessions` table.
 *
 * The table records one row per active sign-in session (jti) for the
 * /profile/security UI (see docs/adr/004-device-sessions.md). It has no
 * `expires_at` column — expiry is derived from the JWT `maxAge` configured
 * in src/lib/auth/auth.config.ts (currently 30 days). Once `last_seen_at`
 * is older than the JWT maxAge, the row can no longer correspond to a
 * usable token, so it is safe to delete.
 *
 * Revoked rows (revoked_at IS NOT NULL) are kept for a short grace period
 * so the /profile/security UI can still display "revoked X minutes ago"
 * feedback, then pruned.
 *
 * Designed to run as a Railway cron (see docs/operations/cron-jobs.md).
 *
 * Required env vars:
 *   DATABASE_URL — Postgres connection string
 *
 * Optional env vars:
 *   DEVICE_SESSIONS_MAX_AGE_DAYS    (default 30)  must match JWT maxAge
 *   DEVICE_SESSIONS_REVOKED_TTL_DAYS (default 7)  grace period for revoked rows
 *   DRY_RUN=1                        log counts without deleting
 *
 * Run locally:
 *   bun scripts/cleanup-device-sessions.ts
 *   DRY_RUN=1 bun scripts/cleanup-device-sessions.ts
 */

import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const MAX_AGE_DAYS = Number(process.env.DEVICE_SESSIONS_MAX_AGE_DAYS ?? 30);
const REVOKED_TTL_DAYS = Number(
  process.env.DEVICE_SESSIONS_REVOKED_TTL_DAYS ?? 7,
);
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

if (!DATABASE_URL) {
  console.error("Missing required env var: DATABASE_URL");
  process.exit(1);
}

if (!Number.isFinite(MAX_AGE_DAYS) || MAX_AGE_DAYS <= 0) {
  console.error(
    `Invalid DEVICE_SESSIONS_MAX_AGE_DAYS: ${process.env.DEVICE_SESSIONS_MAX_AGE_DAYS}`,
  );
  process.exit(1);
}

if (!Number.isFinite(REVOKED_TTL_DAYS) || REVOKED_TTL_DAYS < 0) {
  console.error(
    `Invalid DEVICE_SESSIONS_REVOKED_TTL_DAYS: ${process.env.DEVICE_SESSIONS_REVOKED_TTL_DAYS}`,
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  // Single short-lived connection — this script runs and exits.
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 1_000,
  ssl:
    DATABASE_URL.includes("localhost") || DATABASE_URL.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
});

async function countMatching(
  client: pg.PoolClient,
  where: string,
  params: unknown[],
): Promise<number> {
  const { rows } = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM device_sessions WHERE ${where}`,
    params,
  );
  return Number(rows[0]?.count ?? 0);
}

async function deleteMatching(
  client: pg.PoolClient,
  where: string,
  params: unknown[],
): Promise<number> {
  const result = await client.query(
    `DELETE FROM device_sessions WHERE ${where}`,
    params,
  );
  return result.rowCount ?? 0;
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  console.log(
    `[cleanup-device-sessions] start dryRun=${DRY_RUN} maxAgeDays=${MAX_AGE_DAYS} revokedTtlDays=${REVOKED_TTL_DAYS}`,
  );

  const client = await pool.connect();
  try {
    // Predicates kept as plain strings so the dry-run COUNT and the DELETE
    // share the exact same shape. NOW() is evaluated server-side so the two
    // queries see a consistent reference time at the database boundary.
    const staleWhere = `last_seen_at < NOW() - ($1 || ' days')::interval`;
    const revokedWhere = `revoked_at IS NOT NULL AND revoked_at < NOW() - ($1 || ' days')::interval`;

    if (DRY_RUN) {
      const [staleCount, revokedCount] = await Promise.all([
        countMatching(client, staleWhere, [String(MAX_AGE_DAYS)]),
        countMatching(client, revokedWhere, [String(REVOKED_TTL_DAYS)]),
      ]);
      console.log(
        `[cleanup-device-sessions] dry-run: would delete ${staleCount} stale + ${revokedCount} revoked rows`,
      );
      return;
    }

    const staleDeleted = await deleteMatching(client, staleWhere, [
      String(MAX_AGE_DAYS),
    ]);
    const revokedDeleted = await deleteMatching(client, revokedWhere, [
      String(REVOKED_TTL_DAYS),
    ]);
    const elapsedMs = Date.now() - startedAt;
    console.log(
      `[cleanup-device-sessions] deleted stale=${staleDeleted} revoked=${revokedDeleted} elapsed_ms=${elapsedMs}`,
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[cleanup-device-sessions] fatal:", err);
  process.exit(1);
});
