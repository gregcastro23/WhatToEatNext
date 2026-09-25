import pkg, { Pool, type ClientBase, type PoolClient } from 'pg';
import { _logger } from "../logger";
import {
  databaseConfig,
  assertRuntimeDatabaseConfig,
  validateDatabaseConfig,
  databaseConfigSummary,
  resolveSslOption,
  resolveServerStatementCap,
  resolvePooledStatementTimeoutSql,
  resolveClientQueryTimeout,
} from "./config";

type TypeId = number;
type CustomTypeParser = (value: string) => unknown;

/**
 * Raw database pool singleton.
 *
 * Extracted from connection.ts so the slow-query logger can reach the pool
 * without an import cycle: connection.ts statically imports recordSlowQuery on
 * the hot query path, and slowQueryLog persists via the raw pool. Both now
 * depend on this leaf module instead of each other.
 *
 * connection.ts re-exports {@link initializeDatabase}, {@link getDatabasePool},
 * {@link closeDatabase}, and {@link DatabaseConfig}, so existing consumers that
 * import them from connection.ts are unaffected.
 */

interface PgTypesModule {
  builtins: {
    NUMERIC: TypeId;
    INT8: TypeId;
    [key: string]: TypeId;
  };
  setTypeParser: (type: TypeId, parser: CustomTypeParser) => void;
}

interface PgModuleShape {
  Pool?: typeof Pool;
  default?: {
    Pool?: typeof Pool;
    types?: PgTypesModule;
  };
  types?: PgTypesModule;
}

// Robustly extract Pool and types from the pg package (handles various bundling scenarios)
const pgModule = pkg as unknown as PgModuleShape;
const PoolValue: (typeof Pool) | undefined = pgModule.Pool ?? pgModule.default?.Pool;
const ResolvedPool: typeof Pool = PoolValue ?? Pool;
const typesValue: PgTypesModule | undefined = pgModule.types ?? pgModule.default?.types;

if (!PoolValue) {
  _logger.error("FATAL: pg.Pool is undefined on pgModule root. Environment might be incompatible with the current pg import strategy.");
}

// Configure PostgreSQL type parsers for better type safety
if (typesValue) {
  typesValue.setTypeParser(typesValue.builtins.NUMERIC, (value: string): number =>
    parseFloat(value),
  );
  typesValue.setTypeParser(typesValue.builtins.INT8, (value: string): number =>
    parseInt(value, 10),
  );
}

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | object;
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  // Server-side per-statement cap (ms). Postgres cancels with code 57014 when
  // a query runs longer than this. Floors pool-storm outliers at the cap
  // instead of letting them block a function instance for many minutes.
  // Omitted under transaction-mode PgBouncer (it can't be sent as a startup
  // param there) — see getDatabaseConfig and docs/adr/007.
  statement_timeout?: number;
  // Client-side query timeout (ms). The primary request-level bound through a
  // transaction-mode pooler (statement_timeout is unavailable there). Note this
  // only aborts the client read — it does NOT cancel the backend query — so it
  // is paired with a server-side cap (statement_timeout direct, or a PgBouncer
  // connect_query when pooled).
  query_timeout: number;
  // Awaited hook called by pg-pool on newly connected clients before they are
  // leased to any caller. Typed as @types/pg's PoolConfig.onConnect takes it
  // (ClientBase), so the config needs no cast to reach the constructor.
  onConnect?: ((client: ClientBase) => Promise<void>) | undefined;
}

/** The pooled-mode onConnect hook: apply the floor, or log and reject so pg-pool drops the client. */
function applyStatementFloor(sql: string): (client: ClientBase) => Promise<void> {
  return async (client) => {
    try {
      await client.query(sql);
    } catch (err: unknown) {
      _logger.error("Failed to apply pooled statement_timeout", {
        error: err instanceof Error ? err.message : String(err),
        statement: sql,
      });
      throw err;
    }
  };
}

// Environment-based configuration
function getDatabaseConfig(): DatabaseConfig {
  const {
    databaseUrl,
    host,
    port,
    database,
    user,
    password,
    ssl,
    maxConnections,
    idleTimeout,
    connectionTimeout,
    statementTimeoutMs,
    poolerMode,
  } = databaseConfig;

  // `statement_timeout` may only ride the connection startup packet on a
  // genuinely direct connection. PgBouncer refuses any startup parameter that
  // is not in `ignore_startup_parameters`, and that check runs at client login
  // in EVERY pool mode — the previous note here claimed session mode took "the
  // same startup-param path as direct", which is wrong and made the pooler
  // unreachable. Deliver the server-side cap when pooled via a PgBouncer
  // `connect_query` (+ `SET LOCAL` in withTransaction) instead. See
  // resolveServerStatementCap in ./config and docs/adr/007.
  const serverStatementCap = resolveServerStatementCap(
    poolerMode,
    statementTimeoutMs,
  );

  // SSL: Railway fronts Postgres/PgBouncer with a self-signed cert, and the
  // internal `*.railway.internal` traffic never leaves Railway's private
  // network. We can't pin a CA we don't control (Railway rotates it), so we
  // accept the cert for any remote host — the confidentiality guarantee is
  // Railway's network + proxy TLS, not certificate pinning.
  const remoteSsl = { rejectUnauthorized: false };

  if (databaseUrl) {
    // Parse connection URL for cloud deployments
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      // Enable SSL for any remote connection (non-localhost), unless the URL
      // explicitly opts out with `?sslmode=disable`. The opt-out is required
      // for PgBouncer, which refuses TLS — and because this function drops the
      // query string when it destructures the URL, `sslmode` is invisible
      // unless it is read here. See resolveSslOption in ./config.
      ssl: resolveSslOption(url),
      max: maxConnections,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
      ...serverStatementCap,
      query_timeout: resolveClientQueryTimeout(statementTimeoutMs),
    };
  }
  // Local development configuration
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: ssl ? remoteSsl : false,
    max: maxConnections,
    idleTimeoutMillis: idleTimeout,
    connectionTimeoutMillis: connectionTimeout,
    ...serverStatementCap,
    query_timeout: resolveClientQueryTimeout(statementTimeoutMs),
  };
}

// Connection pool instance
let pool: Pool | null = null;

// Initialize database connection pool
export function initializeDatabase(): Pool {
  if (pool) {
    return pool;
  }

  // Fail fast in production if DATABASE_URL is unset (would silently fall back
  // to the localhost default and "succeed" until the first query times out).
  assertRuntimeDatabaseConfig();

  // The resolved config, before it can throw — so a rejected configuration is
  // still legible in the runtime logs rather than only in the exception.
  _logger.info("Database configuration resolved", databaseConfigSummary());

  // This validation used to run at module scope and was commented out because
  // module-level work hung the Next build. Pool creation is the right place: it
  // is lazy (first query after a cold start), it runs in the environment being
  // validated rather than at build time, and a bad value is refused before it
  // reaches `new Pool()` — where NaN and out-of-range knobs otherwise produce a
  // pool that connects and then misbehaves under load.
  const validation = validateDatabaseConfig();
  if (!validation.valid) {
    _logger.error("Database configuration validation failed", {
      errors: validation.errors,
    });
    throw new Error(
      `Invalid database configuration: ${validation.errors.join("; ")}`,
    );
  }

  const config = getDatabaseConfig();

  // Restore the docs/adr/007 server-side floor on every new pooled connection.
  // PgBouncer refuses `statement_timeout` in the startup packet (see
  // resolveServerStatementCap), so when pooled it is delivered as an ordinary
  // query via pg-pool's awaited `onConnect` hook right after connect.
  //
  // ORDERING & CONCURRENCY:
  // pg-pool (>= 3.14, pulled in by pg ^8.21) awaits `options.onConnect` in
  // newClient, after connect and BEFORE _afterConnect/_acquireClient emit
  // "connect" or hand the client to its waiter (pg-pool 3.14 index.js:288-305).
  // pooledOnConnectContract.test.ts drives the real pg-pool to hold that true.
  //
  // Awaiting the SET here ensures:
  // 1. The SET statement completes before the caller's first statement is
  //    dispatched, guaranteeing every new connection runs with the floor.
  // 2. The client._queryQueue is empty when the caller's query arrives,
  //    eliminating the deprecation warning:
  //    "Calling client.query() when the client is already executing a query".
  // 3. The caller's query_timeout timer (6000ms) gets its full allotment
  //    rather than racing and sharing time with SET on the same connection.
  // 4. If SET fails or times out (query_timeout applies), pg-pool ends the
  //    client and drops it, so no uncapped client enters the pool. The
  //    checkout that created it fails with the SET's error — a deliberate
  //    change from the old listener, which served the request without the
  //    floor. The failure is logged here, since the caller only sees the
  //    driver error.
  const pooledStatementTimeoutSql = resolvePooledStatementTimeoutSql(
    databaseConfig.poolerMode,
    databaseConfig.statementTimeoutMs,
  );

  const poolConfig: DatabaseConfig = {
    ...config,
    onConnect: pooledStatementTimeoutSql ? applyStatementFloor(pooledStatementTimeoutSql) : undefined,
  };

  try {
    pool = new ResolvedPool(poolConfig);
  } catch (err: unknown) {
    _logger.error("Failed to construct database pool", { err });
    throw new Error("Failed to initialize database pool");
  }

  // Connection event handlers
  pool.on("connect", (_client: PoolClient) => {
    _logger.info("New database connection established", {
      database: config.database,
      host: config.host,
    });
  });
  pool.on("error", (err: Error, _client: PoolClient) => {
    _logger.error("Unexpected database pool error", {
      error: err.message,
      stack: err.stack,
      database: config.database,
    });
  });

  // Graceful shutdown handling
  process.on("SIGINT", () => {
    const handleSigint = async (): Promise<void> => {
      _logger.info("Received SIGINT, closing database pool...");
      await closeDatabase();
      process.exit(0);
    };
    handleSigint().catch((err: unknown) => {
      _logger.error("Error during SIGINT database pool close", { err });
      process.exit(1);
    });
  });
  process.on("SIGTERM", () => {
    const handleSigterm = async (): Promise<void> => {
      _logger.info("Received SIGTERM, closing database pool...");
      await closeDatabase();
      process.exit(0);
    };
    handleSigterm().catch((err: unknown) => {
      _logger.error("Error during SIGTERM database pool close", { err });
      process.exit(1);
    });
  });

  _logger.info("Database connection pool initialized", {
    database: config.database,
    host: config.host,
    port: config.port,
    maxConnections: config.max,
  });
  return pool;
}

// Get database pool instance (initialize if not exists)
export function getDatabasePool(): Pool {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

// Close database connection pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    _logger.info("Closing database connection pool...");
    await pool.end();
    pool = null;
    _logger.info("Database connection pool closed");
  }
}
