import 'server-only';
import pkg from 'pg';
import { logger } from "../logger";
import { databaseConfig } from "./config";

// Robustly extract Pool and types from the pg package (handles various bundling scenarios)
const PoolValue = (pkg as any).Pool || (pkg as any).default?.Pool || (pkg as unknown as any).Pool;
const types = (pkg as any).types || (pkg as any).default?.types || (pkg as unknown as any).types;

if (!PoolValue) {
  console.error("FATAL: pg.Pool is undefined. Environment might be incompatible with the current pg import strategy.");
}

import type { Pool, PoolClient, QueryResult } from "pg";

// Note: neonConfig is no longer used as we are using standard pg

/**
 * Database Connection Layer - Phase 1 Infrastructure Migration
 * Created: September 26, 2025
 *
 * PostgreSQL connection utilities with connection pooling,
 * error handling, and environment configuration for alchm.kitchen
 */
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
}
// Configuration import
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
  } = databaseConfig;

  if (databaseUrl) {
    // Parse connection URL for cloud deployments
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port, 10) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      // Enable SSL for any remote connection (non-localhost)
      ssl: url.hostname !== "localhost" && url.hostname !== "127.0.0.1"
        ? { rejectUnauthorized: false } 
        : false,
      max: maxConnections,

      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
    };
  }
  // Local development configuration
  return {
    host,
    port,
    database,
    user,
    password,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    max: maxConnections,
    idleTimeoutMillis: idleTimeout,
    connectionTimeoutMillis: connectionTimeout,
  };
}
// Connection pool instance
let pool: Pool | null = null;
// Initialize database connection pool
export function initializeDatabase(): Pool {
  if (pool) {
    return pool;
  }
  
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
      void logger.info("Received SIGINT, closing database pool...");
      await closeDatabase();
      process.exit(0);
    })();
  });
  process.on("SIGTERM", () => {
    void (async () => {
      void logger.info("Received SIGTERM, closing database pool...");
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
// Get database pool instance (initialize if not exists)
export function getDatabasePool(): Pool {
  if (!pool) {
    return initializeDatabase();
  }
  return pool as Pool;
}
// Close database connection pool
export async function closeDatabase(): Promise<void> {
  if (pool) {
    void logger.info("Closing database connection pool...");
    await pool.end();
    pool = null;
    void logger.info("Database connection pool closed");
  }
}
// Health check function
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const client = await getDatabasePool().connect();
    const result = await client.query("SELECT 1 as health_check");
    client.release();
    const latency = Date.now() - startTime;
    const healthy = result.rows.length > 0;
    return { healthy, latency };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
// Transaction wrapper for database operations
export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    void logger.error("Database transaction failed, rolled back", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  } finally {
    client.release();
  }
}
// Query execution with error handling and logging
export async function executeQuery<_T extends any = any>(
  query: string,
  params: any[] = [],
  options: {
    logQuery?: boolean;
    timeout?: number;
  } = {},
): Promise<QueryResult<any>> {
  const { logQuery = databaseConfig.logQueries, timeout: _timeout = 30000 } = options;
  const startTime = Date.now();
  try {
    if (logQuery) {
      void logger.debug("Executing database query", {
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        paramCount: params.length,
      });
    }
    const result = await getDatabasePool().query(query, params);
    const executionTime = Date.now() - startTime;
    if (executionTime > 1000) {
      // Log slow queries (>1s)
      void logger.warn("Slow database query detected", {
        executionTime,
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        rowCount: result.rowCount,
      });
    }
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const err = error as Error;
    void logger.error("Database query failed", {
      error: err.message,
      stack: err.stack,
      executionTime,
      query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
      paramCount: params.length,
    });
    // Rethrow with better context if it's an ErrorEvent-like object
    if ((error as any).type === 'error') {
      throw new Error(`DB ErrorEvent: ${(error as any).message || 'Unknown connection error'}`);
    }
    throw error;
  }
}
// Utility function to safely execute queries with retry logic
export async function executeQueryWithRetry<T extends any = any>(
  query: string,
  params: any[] = [],
  maxRetries = 3,
  retryDelay = 1000,
): Promise<QueryResult<any>> {
  let lastError: Error;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await executeQuery<T>(query, params);
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown database error");
      // Don't retry on certain errors
      if (
        lastError.message.includes("syntax error") ||
        lastError.message.includes("does not exist") ||
        lastError.message.includes("permission denied")
      ) {
        throw lastError;
      }
      if (attempt < maxRetries) {
        void logger.warn(
          `Database query attempt ${attempt} failed, retrying...`,
          {
            error: lastError.message,
            attempt,
            maxRetries,
            delay: retryDelay,
          },
        );
        await new Promise<void>((resolve) =>
          setTimeout(() => resolve(), retryDelay),
        );
        retryDelay *= 2; // Exponential backoff
      }
    }
  }
  throw lastError!;
}
