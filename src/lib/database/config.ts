/**
 * Database Configuration - Environment Variables Handler
 * Created: September 26, 2025
 *
 * Centralized configuration management for database connections
 * and environment-specific settings
 */


/**
 * Read an integer env var, yielding NaN for anything that is not cleanly one.
 *
 * `parseInt` stops at the first non-digit, so it turns a malformed value into a
 * plausible one: `DB_MAX_CONNECTIONS="5s"` silently resolves to 5, and `="abc"`
 * resolves to NaN — which then passes every range check in
 * {@link validateDatabaseConfig}, because *every* comparison against NaN is
 * false. `Number` refuses the partial parse instead, collapsing both cases into
 * one detectable NaN that the validator's `Number.isInteger` guard rejects.
 *
 * Empty-string is treated as unset, matching the `||` fallback this replaced.
 */
function intFromEnv(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === "") return fallback;
  return Number(raw);
}

/**
 * Connection-URL schemes `pg` accepts. BOTH are valid libpq URLs, and Railway,
 * Neon, Supabase and Heroku all hand out the `postgres://` spelling. The
 * validator used to accept only `postgresql:`, which was harmless while nothing
 * called it — and would have aborted the pool on a perfectly working connection
 * string the moment initializeDatabase() started throwing on it.
 */
const VALID_DB_PROTOCOLS = ["postgresql:", "postgres:"];

// Environment variable validation and defaults
export const databaseConfig = {
  // Database connection
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://user:pass@localhost:5432/alchm_kitchen",

  // Individual connection parameters (fallback if DATABASE_URL not provided).
  // Note these are effectively unreachable: `databaseUrl` above always resolves
  // to a truthy default, and getDatabaseConfig() branches on `if (databaseUrl)`.
  // They are left in place because removing them is a separate change.
  host: process.env.DB_HOST ?? "localhost",
  port: intFromEnv(process.env.DB_PORT, 5432),
  database: process.env.DB_NAME ?? "alchm_kitchen",
  user: process.env.DB_USER ?? "user",
  password: process.env.DB_PASSWORD ?? "pass",
  ssl: process.env.DB_SSL === "true",

  // Connection pool settings — kept small for serverless (each Vercel invocation
  // owns its own pool; 50 concurrent connections per instance would exhaust Railway).
  maxConnections: intFromEnv(process.env.DB_MAX_CONNECTIONS, 5),
  idleTimeout: intFromEnv(process.env.DB_IDLE_TIMEOUT, 10000),
  connectionTimeout: intFromEnv(process.env.DB_CONNECTION_TIMEOUT, 5000),

  // Per-statement cap. Pool-acquisition storms (cold start + cron storms) used
  // to surface as 1737s queries on trivial SELECTs because the SQL never started
  // — the function instance was blocked waiting for a connection. With this
  // cap, Postgres cancels the query at 5s (error code 57014) and the request
  // fails fast instead of holding a function instance for 29 minutes. Pair
  // with a proper pooler (PgBouncer/Supavisor) for the root-cause fix; this is
  // the floor that should always be on.
  statementTimeoutMs: intFromEnv(process.env.DB_STATEMENT_TIMEOUT_MS, 5000),

  // Pooler topology in front of Postgres. Governs how the per-statement cap is
  // delivered (see getDatabaseConfig in connection.ts):
  //   "direct"      — app talks straight to Postgres. `statement_timeout` is
  //                   sent as a connection startup param.
  //   "session"     — session-mode PgBouncer. NOT the same path as direct: the
  //                   startup param is refused at login in every pool mode (see
  //                   resolveServerStatementCap), so the cap is delivered by a
  //                   post-connect `SET`, which session mode makes stick.
  //   "transaction" — transaction-mode PgBouncer. Startup params other than the
  //                   allow-listed few are REJECTED, and `SET`s don't persist
  //                   across the shared server connections, so we must NOT send
  //                   `statement_timeout` at startup. Server-side capping then
  //                   comes from a PgBouncer `connect_query` (recommended) and
  //                   `SET LOCAL` inside withTransaction; client-side bounding
  //                   stays on `query_timeout`. See docs/adr/007.
  poolerMode: (process.env.DB_POOLER_MODE ?? "direct").toLowerCase(),

  // Application settings
  environment: process.env.NODE_ENV || "development",
  logQueries: process.env.DB_LOG_QUERIES === "true",
  autoMigrate: process.env.DB_AUTO_MIGRATE !== "false", // Default true
  seedData: process.env.DB_SEED_DATA === "true", // Default false

  // Redis (optional)
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
};

/**
 * Range-check one integer knob.
 *
 * The `Number.isInteger` guard is the load-bearing half. Before it existed a
 * malformed env var produced NaN, and `NaN < min || NaN > max` is `false` — so
 * the *most* broken configuration was the one the validator was blindest to.
 */
function checkIntegerRange(
  errors: string[],
  name: string,
  value: number,
  min: number,
  max: number,
  unit = "",
): void {
  if (!Number.isInteger(value)) {
    errors.push(`${name} must be an integer (got ${JSON.stringify(value)})`);
    return;
  }
  if (value < min || value > max) {
    errors.push(
      `${name} must be between ${min}${unit} and ${max}${unit} (got ${value}${unit})`,
    );
  }
}

/**
 * Pure check of the resolved {@link databaseConfig}. Returns errors rather than
 * throwing so callers choose the consequence; initializeDatabase() throws.
 */
export function validateDatabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check database URL format
  if (databaseConfig.databaseUrl) {
    try {
      const url = new URL(databaseConfig.databaseUrl);
      if (!VALID_DB_PROTOCOLS.includes(url.protocol)) {
        errors.push(
          `DATABASE_URL must use postgresql:// or postgres:// (got ${url.protocol}//)`,
        );
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
    checkIntegerRange(errors, "DB_PORT", databaseConfig.port, 1, 65535);
  }

  // Check connection pool settings. Upper bounds are the blast radius, not a
  // preference: the pool is per-serverless-instance, so a large `max` multiplied
  // by concurrent instances is what exhausts PgBouncer's max_client_conn.
  checkIntegerRange(errors, "DB_MAX_CONNECTIONS", databaseConfig.maxConnections, 1, 100);
  checkIntegerRange(
    errors, "DB_IDLE_TIMEOUT", databaseConfig.idleTimeout, 1000, 600_000, "ms",
  );
  checkIntegerRange(
    errors, "DB_CONNECTION_TIMEOUT", databaseConfig.connectionTimeout, 100, 60_000, "ms",
  );
  checkIntegerRange(
    errors, "DB_STATEMENT_TIMEOUT_MS", databaseConfig.statementTimeoutMs, 100, 60_000, "ms",
  );
  // An unrecognised pooler mode is not cosmetic: resolveServerStatementCap and
  // resolvePooledStatementTimeoutSql both compare against exact strings, so a
  // typo silently disables the docs/adr/007 statement floor on every connection
  // while the pool still appears to work.
  if (!["direct", "session", "transaction"].includes(databaseConfig.poolerMode)) {
    errors.push(
      `DB_POOLER_MODE must be one of "direct", "session", or "transaction" ` +
        `(got ${JSON.stringify(databaseConfig.poolerMode)})`,
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

/**
 * Loggable summary of the resolved config — no credentials.
 *
 * The connection URL carries the password, so nothing derived from it is
 * reported beyond presence. `host`/`database` mirror what initializeDatabase()
 * already logs on pool creation, and `poolerMode` is a topology enum rather
 * than a secret; it is included because a wrong value silently disables the
 * statement floor and was otherwise unobservable in production.
 */
export function databaseConfigSummary(): Record<string, unknown> {
  return {
    environment: databaseConfig.environment,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    port: databaseConfig.port,
    poolerMode: databaseConfig.poolerMode,
    maxConnections: databaseConfig.maxConnections,
    idleTimeout: databaseConfig.idleTimeout,
    connectionTimeout: databaseConfig.connectionTimeout,
    statementTimeoutMs: databaseConfig.statementTimeoutMs,
    logQueries: databaseConfig.logQueries,
    autoMigrate: databaseConfig.autoMigrate,
  };
}

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
 * When pooled the startup packet can't carry the cap, so it is delivered after
 * connect instead — see {@link resolvePooledStatementTimeoutSql}.
 */
export function resolveServerStatementCap(
  poolerMode: string,
  statementTimeoutMs: number,
): { statement_timeout?: number } {
  // Fail safe: only the explicitly-direct topology gets the startup param, so
  // an unrecognised value can never wedge the pool shut.
  return poolerMode === "direct" ? { statement_timeout: statementTimeoutMs } : {};
}

/**
 * The `SET` that restores the docs/adr/007 server-side floor when pooled.
 *
 * WHY THIS IS NEEDED AT ALL
 * -------------------------
 * `query_timeout` bounds the request client-side but only aborts the client
 * read — it does NOT cancel the backend query. Measured against the live
 * Railway pooler with no floor set: the client gave up at 2,002ms while the
 * backend ran the full 6s, holding one of the 20 pooled slots for four seconds
 * after the request was abandoned. That leak is what the floor exists to stop.
 *
 * WHY A POST-CONNECT `SET` RATHER THAN THE STARTUP PACKET
 * ------------------------------------------------------
 * PgBouncer refuses `statement_timeout` as a startup parameter at login in
 * every pool mode (see {@link resolveServerStatementCap}), but a plain `SET`
 * after connect is just a query, and in SESSION mode it persists for the life
 * of the client connection. `server_reset_query = DISCARD ALL` issues
 * `RESET ALL` on release, which resets to the role default rather than to
 * nothing — so the reset floor is whatever `pg_db_role_setting` holds, and this
 * `SET` re-tightens it on the next checkout.
 *
 * Returns null when the `SET` would not do anything:
 *   • "direct"      — the startup param already carries it.
 *   • "transaction" — a session `SET` does not survive; PgBouncer reassigns a
 *                     server per transaction. Such a deployment needs a
 *                     PgBouncer `connect_query`, and is meanwhile covered by
 *                     the role-level backstop on the Postgres side.
 */
export function resolvePooledStatementTimeoutSql(
  poolerMode: string,
  statementTimeoutMs: number,
): string | null {
  if (poolerMode !== "session") return null;
  // `SET` takes no bind parameters, so the value is interpolated. Only a finite
  // positive integer may ever reach the string.
  const ms = Math.round(statementTimeoutMs);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return `SET statement_timeout = ${ms}`;
}

/**
 * Client-side bound, deliberately set ABOVE the server-side cap.
 *
 * Both timers race, and node-postgres starts its own at dispatch while Postgres
 * starts `statement_timeout` when the backend begins executing — measured delta
 * ~40ms. With equal values the client wins, and the caller sees a bare
 * "Query read timeout" instead of `SQLSTATE 57014 canceling statement due to
 * statement timeout`. The margin lets the server win, so a query killed by the
 * floor says so in the logs. `query_timeout` stays as the backstop for a
 * connection that hangs without the backend ever starting the query.
 */
export const CLIENT_TIMEOUT_MARGIN_MS = 1000;

export function resolveClientQueryTimeout(statementTimeoutMs: number): number {
  return statementTimeoutMs + CLIENT_TIMEOUT_MARGIN_MS;
}

export default databaseConfig;
