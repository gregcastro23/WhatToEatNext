import pkg from 'pg';
import { logger } from "../logger";
import { databaseConfig, assertRuntimeDatabaseConfig } from "./config";
import type { Pool, PoolClient } from "pg";

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

// Robustly extract Pool and types from the pg package (handles various bundling scenarios)
const PoolValue = (pkg as any).Pool || (pkg as any).default?.Pool || (pkg as unknown as any).Pool;
const types = (pkg as any).types || (pkg as any).default?.types || (pkg as unknown as any).types;

if (!PoolValue) {
  console.error("FATAL: pg.Pool is undefined. Environment might be incompatible with the current pg import strategy.");
}

// Configure PostgreSQL type parsers for better type safety
types.setTypeParser(types.builtins.NUMERIC, (value: string) =>
  parseFloat(value),
);
types.setTypeParser(types.builtins.INT8, (value: string) =>
  parseInt(value, 10),
);

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
}

// Environment-based configuration
function getDatabaseConfig(customUrl?: string): DatabaseConfig {
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

  const activeUrl = customUrl || databaseUrl;

  // Under transaction-mode PgBouncer, `statement_timeout` cannot ride the
  // connection startup packet: PgBouncer rejects non-allow-listed startup
  // params, and even when ignored it has no effect because server connections
  // are shared across clients. Omit it there and deliver the server-side cap
  // via a PgBouncer `connect_query` (+ `SET LOCAL` in withTransaction) instead.
  // In direct/session mode the per-connection startup param is the right floor.
  const serverStatementCap =
    poolerMode === "transaction"
      ? {}
      : { statement_timeout: statementTimeoutMs };

  // SSL: Railway fronts Postgres/PgBouncer with a self-signed cert, and the
  // internal `*.railway.internal` traffic never leaves Railway's private
  // network. We can't pin a CA we don't control (Railway rotates it), so we
  // accept the cert for any remote host — the confidentiality guarantee is
  // Railway's network + proxy TLS, not certificate pinning.
  const remoteSsl = { rejectUnauthorized: false };

  if (activeUrl) {
    // Parse connection URL for cloud deployments
    const url = new URL(activeUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      // Enable SSL for any remote connection (non-localhost)
      ssl: url.hostname !== "localhost" && url.hostname !== "127.0.0.1"
        ? remoteSsl
        : false,
      max: maxConnections,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
      ...serverStatementCap,
      query_timeout: statementTimeoutMs,
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
    query_timeout: statementTimeoutMs,
  };
}

// Connection pool instances
let pool: Pool | null = null;
let fallbackPool: Pool | null = null;
let usingFallback = false;

export function isUsingFallback(): boolean {
  return usingFallback;
}

export function setUsingFallback(value: boolean): void {
  usingFallback = value;
  void logger.warn(`Database routing strategy updated: usingFallback = ${value}`);
}

// Initialize fallback database connection pool (Neon DB)
export function initializeFallbackDatabase(): Pool | null {
  if (fallbackPool) {
    return fallbackPool;
  }

  const fallbackUrl = databaseConfig.fallbackDatabaseUrl;
  if (!fallbackUrl) {
    return null;
  }

  const config = getDatabaseConfig(fallbackUrl);
  fallbackPool = new PoolValue(config);

  if (!fallbackPool) {
    throw new Error("Failed to initialize fallback database pool");
  }

  // Connection event handlers
  fallbackPool.on("connect", (_client: PoolClient) => {
    void logger.info("New fallback database connection established (Neon)", {
      database: config.database,
      host: config.host,
    });
  });
  fallbackPool.on("error", (err: Error, _client: PoolClient) => {
    void logger.error("Unexpected fallback database pool error", {
      error: err.message,
      stack: err.stack,
      database: config.database,
    });
  });

  void logger.info("Fallback database connection pool initialized (Neon)", {
    database: config.database,
    host: config.host,
    port: config.port,
    maxConnections: config.max,
  });

  return fallbackPool;
}

// Initialize database connection pool (Railway DB)
export function initializeDatabase(): Pool {
  if (pool) {
    return pool;
  }

  // Fail fast in production if DATABASE_URL is unset (would silently fall back
  // to the localhost default and "succeed" until the first query times out).
  assertRuntimeDatabaseConfig();

  const config = getDatabaseConfig();

  pool = new PoolValue(config);

  if (!pool) {
    throw new Error("Failed to initialize database pool");
  }

  // Connection event handlers
  pool.on("connect", (_client: PoolClient) => {
    void logger.info("New database connection established", {
      database: config.database,
      host: config.host,
    });
  });
  pool.on("error", (err: Error, _client: PoolClient) => {
    void logger.error("Unexpected database pool error", {
      error: err.message,
      stack: err.stack,
      database: config.database,
    });
  });

  // Graceful shutdown handling
  process.on("SIGINT", () => {
    void (async () => {
      void logger.info("Received SIGINT, closing database pools...");
      await closeDatabase();
      process.exit(0);
    })();
  });
  process.on("SIGTERM", () => {
    void (async () => {
      void logger.info("Received SIGTERM, closing database pools...");
      await closeDatabase();
      process.exit(0);
    })();
  });

  void logger.info("Database connection pool initialized", {
    database: config.database,
    host: config.host,
    port: config.port,
    maxConnections: config.max,
  });
  return pool;
}

// Get database pool instance (initialize if not exists, switches dynamically to fallback if strategy set)
export function getDatabasePool(): Pool {
  if (usingFallback) {
    const fb = initializeFallbackDatabase();
    if (fb) return fb;
  }
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

// Close database connection pools
export async function closeDatabase(): Promise<void> {
  if (pool) {
    void logger.info("Closing database connection pool...");
    await pool.end();
    pool = null;
    void logger.info("Database connection pool closed");
  }
  if (fallbackPool) {
    void logger.info("Closing fallback database connection pool...");
    await fallbackPool.end();
    fallbackPool = null;
    void logger.info("Fallback database connection pool closed");
  }
  usingFallback = false;
}
