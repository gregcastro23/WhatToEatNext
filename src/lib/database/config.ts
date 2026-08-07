/**
 * Database Configuration - Environment Variables Handler
 * Created: September 26, 2025
 *
 * Centralized configuration management for database connections
 * and environment-specific settings
 */


// Environment variable validation and defaults
export const databaseConfig = {
  // Database connection
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://user:pass@localhost:5432/alchm_kitchen",
  
  // Individual connection parameters (fallback if DATABASE_URL not provided)
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "alchm_kitchen",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  ssl: process.env.DB_SSL === "true",

  // Connection pool settings — kept small for serverless (each Vercel invocation
  // owns its own pool; 50 concurrent connections per instance would exhaust Railway).
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "5", 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || "10000", 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5000", 10),

  // Per-statement cap. Pool-acquisition storms (cold start + cron storms) used
  // to surface as 1737s queries on trivial SELECTs because the SQL never started
  // — the function instance was blocked waiting for a connection. With this
  // cap, Postgres cancels the query at 5s (error code 57014) and the request
  // fails fast instead of holding a function instance for 29 minutes. Pair
  // with a proper pooler (PgBouncer/Supavisor) for the root-cause fix; this is
  // the floor that should always be on.
  statementTimeoutMs: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || "5000", 10),

  // Pooler topology in front of Postgres. Governs how the per-statement cap is
  // delivered (see getDatabaseConfig in connection.ts):
  //   "direct"      — app talks straight to Postgres (or a session-mode pooler).
  //                   `statement_timeout` is sent as a connection startup param.
  //   "session"     — session-mode PgBouncer; same startup-param path as direct.
  //   "transaction" — transaction-mode PgBouncer. Startup params other than the
  //                   allow-listed few are REJECTED, and `SET`s don't persist
  //                   across the shared server connections, so we must NOT send
  //                   `statement_timeout` at startup. Server-side capping then
  //                   comes from a PgBouncer `connect_query` (recommended) and
  //                   `SET LOCAL` inside withTransaction; client-side bounding
  //                   stays on `query_timeout`. See docs/adr/007.
  poolerMode: (process.env.DB_POOLER_MODE || "direct").toLowerCase(),

  // Application settings
  environment: process.env.NODE_ENV || "development",
  logQueries: process.env.DB_LOG_QUERIES === "true",
  autoMigrate: process.env.DB_AUTO_MIGRATE !== "false", // Default true
  seedData: process.env.DB_SEED_DATA === "true", // Default false

  // Redis (optional)
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

// Validate configuration on import
export function validateDatabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check database URL format
  if (databaseConfig.databaseUrl) {
    try {
      const url = new URL(databaseConfig.databaseUrl);
      if (url.protocol !== "postgresql:") {
        errors.push("DATABASE_URL must use postgresql:// protocol");
      }
    } catch {
      errors.push("DATABASE_URL is not a valid URL");
    }
  }

  // Check individual parameters if no DATABASE_URL
  if (!databaseConfig.databaseUrl) {
    if (!databaseConfig.host)
      errors.push("DB_HOST is required when DATABASE_URL is not provided");
    if (!databaseConfig.database)
      errors.push("DB_NAME is required when DATABASE_URL is not provided");
    if (!databaseConfig.user)
      errors.push("DB_USER is required when DATABASE_URL is not provided");
    if (databaseConfig.port <= 0 || databaseConfig.port > 65535) {
      errors.push("DB_PORT must be a valid port number (1-65535)");
    }
  }

  // Check connection pool settings
  if (
    databaseConfig.maxConnections < 1 ||
    databaseConfig.maxConnections > 100
  ) {
    errors.push("DB_MAX_CONNECTIONS must be between 1 and 100");
  }
  if (databaseConfig.idleTimeout < 1000) {
    errors.push("DB_IDLE_TIMEOUT must be at least 1000ms");
  }
  if (databaseConfig.connectionTimeout < 100) {
    errors.push("DB_CONNECTION_TIMEOUT must be at least 100ms");
  }
  if (
    databaseConfig.statementTimeoutMs < 100 ||
    databaseConfig.statementTimeoutMs > 60000
  ) {
    errors.push(
      "DB_STATEMENT_TIMEOUT_MS must be between 100ms and 60000ms",
    );
  }
  if (!["direct", "session", "transaction"].includes(databaseConfig.poolerMode)) {
    errors.push(
      'DB_POOLER_MODE must be one of "direct", "session", or "transaction"',
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Runtime guard for the dangerous "missing DATABASE_URL in production" case.
 *
 * `databaseUrl` above always has a localhost default, so a missing env var passes
 * validateDatabaseConfig()'s format check yet silently points the app at a
 * non-existent local database. Call this at pool-creation time (NOT at import —
 * module-level work hangs the Next build) to fail fast instead of limping along.
 */
export function assertRuntimeDatabaseConfig(): void {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set in production — refusing to start against the " +
        "localhost default. Set DATABASE_URL (or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD).",
    );
  }
}

// Initialize configuration and log warnings
// DISABLED: Module-level logging causes Next.js build to hang during module scanning
// These validations and logs should be called at runtime, not during import
/*
const validation = validateDatabaseConfig();
if (!validation.valid) {
  void logger.error("Database configuration validation failed", {
    errors: validation.errors,
  });
  throw new Error(
    `Invalid database configuration: ${validation.errors.join(", ")}`,
  );
}

// Log configuration summary (without sensitive data)
void logger.info("Database configuration loaded", {
  environment: databaseConfig.environment,
  hasDatabaseUrl: !!databaseConfig.databaseUrl,
  host: databaseConfig.databaseUrl ? "[hidden]" : databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  maxConnections: databaseConfig.maxConnections,
  ssl: databaseConfig.ssl,
  logQueries: databaseConfig.logQueries,
  autoMigrate: databaseConfig.autoMigrate,
});
*/

/**
 * Resolve the `pg` `ssl` option for a parsed connection URL.
 *
 * getDatabaseConfig() in rawPool.ts destructures the connection URL into
 * discrete pg fields (host/port/database/user/password), which drops the query
 * string. That made libpq's `sslmode` parameter unreadable, so every non-local
 * host got forced TLS. Railway's PgBouncer refuses TLS ("the server does not
 * support SSL connections"), which made routing through the pooler impossible
 * no matter what the connection string said — the pooler flip could not work
 * on an env change alone.
 *
 * Only `sslmode=disable` is special-cased. Every other libpq mode (`require`,
 * `verify-ca`, `verify-full`, …) wants TLS, which the default already provides.
 * We can't pin a CA we don't control (Railway rotates it), so remote hosts get
 * `rejectUnauthorized: false` — see the SSL note in rawPool.ts.
 */
export function resolveSslOption(
  url: URL,
): false | { rejectUnauthorized: boolean } {
  if (url.searchParams.get("sslmode") === "disable") {
    return false;
  }
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  return isLocal ? false : { rejectUnauthorized: false };
}

/**
 * Decide whether `statement_timeout` may ride the connection startup packet.
 *
 * node-postgres sends `statement_timeout` as a startup parameter. PgBouncer
 * rejects any startup parameter absent from `ignore_startup_parameters` with
 * `unsupported startup parameter: statement_timeout`, and **that check runs at
 * client login regardless of pool mode** — it is not specific to transaction
 * mode, as previously assumed. Verified against the live Railway pooler, whose
 * `ignore_startup_parameters` is `extra_float_digits` only: the app's exact
 * config was refused, and succeeded as soon as `statement_timeout` was removed.
 *
 * So the startup param is only safe on a genuinely direct connection. Anything
 * pooled (session or transaction) must omit it, or the pool cannot connect at
 * all.
 *
 * ⚠ Trade-off: when pooled, the server-side cap from docs/adr/007 is NOT in
 * force. `query_timeout` still bounds the request client-side, but it only
 * aborts the client read — it does not cancel the backend query. Restore the
 * server-side floor with a PgBouncer `connect_query` (`SET statement_timeout`)
 * or `SET LOCAL` inside withTransaction.
 */
export function resolveServerStatementCap(
  poolerMode: string,
  statementTimeoutMs: number,
): { statement_timeout?: number } {
  // Fail safe: only the explicitly-direct topology gets the startup param, so
  // an unrecognised value can never wedge the pool shut.
  return poolerMode === "direct" ? { statement_timeout: statementTimeoutMs } : {};
}

export default databaseConfig;
