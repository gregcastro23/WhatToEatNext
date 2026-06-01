import { logger } from "../logger";
import { recordSlowQuery } from "../observability/slowQueryLog";
import { databaseConfig } from "./config";
import { getDatabasePool, initializeDatabase, closeDatabase, isUsingFallback, setUsingFallback } from "./rawPool";
import type { PoolClient, QueryResult } from "pg";

/**
 * Database Connection Layer
 *
 * Query execution, transactions, retry logic, and health checks built on top of
 * the raw pool singleton in ./rawPool. The pool primitives are re-exported here
 * so existing consumers can keep importing them from this module.
 *
 * slowQueryLog imports the raw pool from ./rawPool (not this module), so the old
 * connection ⇄ slowQueryLog import cycle is gone — recordSlowQuery can stay a
 * static import on the hot query path.
 */
export { getDatabasePool, initializeDatabase, closeDatabase };
export type { DatabaseConfig } from "./rawPool";

// Throttle the per-query system_metrics persistence (in executeQuery below) so a
// burst of slow queries — e.g. during pool contention — can't self-amplify by
// each firing an extra pooled INSERT against the very pool that's already
// saturated. The in-memory ring (recordSlowQuery) keeps full fidelity at zero
// pool cost; this durable sink is sampled to at most one write per interval per
// instance.
let _lastSlowQueryMetricAt = 0;
const SLOW_QUERY_METRIC_MIN_INTERVAL_MS = 2000;

// Health check function
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
  usingFallback?: boolean;
}> {
  const startTime = Date.now();
  // Release in finally: if the health query throws, the client must still be
  // returned to the pool — otherwise a failing health check (the exact moment
  // the DB is under stress) leaks a pooled connection on every poll.
  let client: PoolClient | null = null;
  try {
    client = await getDatabasePool().connect();
    const result = await client.query("SELECT 1 as health_check");
    const latency = Date.now() - startTime;
    const healthy = result.rows.length > 0;
    return { healthy, latency, usingFallback: isUsingFallback() };
  } catch (error) {
    const latency = Date.now() - startTime;
    const err = error as Error & { code?: string };
    const isConnError = !isUsingFallback() && !!databaseConfig.fallbackDatabaseUrl && (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT" ||
      err.message.includes("connection timeout") ||
      err.message.includes("pool is closed") ||
      err.message.includes("could not connect")
    );

    if (isConnError) {
      void logger.warn("Primary database connection failed in health check. Falling back to hot-standby Neon DB...", {
        error: err.message,
      });
      setUsingFallback(true);
      return checkDatabaseHealth();
    }

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : "Unknown database error",
      usingFallback: isUsingFallback(),
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}
// Transaction wrapper for database operations
export async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  try {
    const client = await getDatabasePool().connect();
    try {
      await client.query("BEGIN");
      // Under transaction-mode PgBouncer the startup-level statement_timeout is
      // absent (see getDatabaseConfig). SET LOCAL is scoped to this transaction —
      // safe on shared pooled server connections — and restores a real
      // server-side cap for the duration of the transaction. statementTimeoutMs
      // is a parsed integer; Number() keeps the interpolation injection-proof.
      if (databaseConfig.poolerMode === "transaction") {
        await client.query(
          `SET LOCAL statement_timeout = ${Number(databaseConfig.statementTimeoutMs)}`,
        );
      }
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as Error & { code?: string };
    const isConnError = !isUsingFallback() && !!databaseConfig.fallbackDatabaseUrl && (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT" ||
      err.message.includes("connection timeout") ||
      err.message.includes("pool is closed") ||
      err.message.includes("could not connect")
    );

    if (isConnError) {
      void logger.warn("Primary database connection failed in transaction. Falling back to hot-standby Neon DB...", {
        error: err.message,
      });
      setUsingFallback(true);
      return withTransaction<T>(operation);
    }

    void logger.error("Database transaction failed, rolled back", {
      error: err.message,
    });
    throw error;
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
    // Push to the in-memory slow-query ring (threshold defaults to 200ms).
    // The admin observability endpoint reads this; production traffic should
    // surface gradual regressions here long before they trip the >1s warn.
    recordSlowQuery(executionTime, query, result.rowCount);

    // Persist slow queries to system_metrics (sampled — see throttle note at top).
    const nowMs = Date.now();
    if (
      executionTime >= 200 &&
      !query.toLowerCase().includes("system_metrics") &&
      nowMs - _lastSlowQueryMetricAt >= SLOW_QUERY_METRIC_MIN_INTERVAL_MS
    ) {
      _lastSlowQueryMetricAt = nowMs;
      getDatabasePool().query(
        `INSERT INTO system_metrics (metric_name, metric_value, metric_unit, tags)
         VALUES ($1, $2, $3, $4)`,
        [
          "slow_query_duration_ms",
          executionTime,
          "ms",
          { query: query.substring(0, 500), rowCount: result.rowCount }
        ]
      ).catch(err => {
        console.warn("Failed to write slow query to system_metrics:", err.message);
      });
    }

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
    const err = error as Error & { code?: string };

    const isConnError = !isUsingFallback() && !!databaseConfig.fallbackDatabaseUrl && (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "ETIMEDOUT" ||
      err.message.includes("connection timeout") ||
      err.message.includes("pool is closed") ||
      err.message.includes("could not connect")
    );

    if (isConnError) {
      void logger.warn("Primary database connection failed in query. Falling back to hot-standby Neon DB...", {
        error: err.message,
      });
      setUsingFallback(true);
      return executeQuery<_T>(query, params, options);
    }

    // Postgres surfaces statement_timeout cancels as code 57014. They look
    // identical to "real" errors in the log unless we distinguish them, and
    // they're the operational signal that the pool-storm cap is firing.
    if (err.code === "57014") {
      void logger.warn("Database query exceeded statement_timeout (57014)", {
        executionTime,
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        paramCount: params.length,
      });
    } else {
      void logger.error("Database query failed", {
        error: err.message,
        stack: err.stack,
        executionTime,
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        paramCount: params.length,
      });
    }
    // Rethrow with better context if it's an ErrorEvent-like object
    if ((error as any).type === 'error') {
      throw new Error(`DB ErrorEvent: ${(error as any).message || 'Unknown connection error'}`);
    }
    throw error;
  }
}
// Utility function to safely execute queries with retry logic.
//
// IMPORTANT — retries are only safe for read/idempotent queries. A mutating
// statement that timed out (57014) or lost its connection mid-flight may have
// already applied on the server, so replaying it risks a double-write. This
// helper therefore executes any data-modifying statement exactly once,
// regardless of `maxRetries`. Callers that need a retried write must guarantee
// idempotency (e.g. an idempotency key) and call executeQuery directly.
export async function executeQueryWithRetry<T extends any = any>(
  query: string,
  params: any[] = [],
  maxRetries = 3,
  retryDelay = 1000,
): Promise<QueryResult<any>> {
  const head = query.replace(/^\s+/, "").slice(0, 12).toUpperCase();
  const isMutating =
    /^(INSERT|UPDATE|DELETE|MERGE|TRUNCATE|CREATE|ALTER|DROP|GRANT|REVOKE)\b/.test(
      head,
    ) ||
    // Data-modifying CTE, e.g. `WITH x AS (INSERT ...) SELECT ...`.
    (/^WITH\b/.test(head) && /\b(INSERT|UPDATE|DELETE|MERGE)\b/i.test(query));
  if (isMutating) {
    return executeQuery<T>(query, params);
  }

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
