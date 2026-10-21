/**
 * Fault-tolerant isolation boundaries for diagnostic and secondary sub-queries.
 *
 * Inside an active PostgreSQL transaction (when a `client` is provided), sub-queries
 * that throw an error cause PostgreSQL to abort the entire transaction block
 * (`current transaction is aborted, commands ignored until end of transaction block`).
 *
 * Wrapping secondary or optional diagnostic queries with a `SAVEPOINT` allows the
 * sub-query to fail and rollback to the savepoint without poisoning the outer transaction.
 * When running without a transaction client, an independent try/catch query guard ensures
 * a slow or degraded secondary query returns a neutral fallback instead of failing
 * the primary health/telemetry response.
 *
 * @file src/lib/database/queryIsolation.ts
 */

import { _logger } from "@/lib/logger";
import type { PoolClient } from "pg";

export interface DiagnosticQueryOptions {
  client?: PoolClient;
}

/**
 * Execute a diagnostic sub-query safely behind a SAVEPOINT (when a transaction client
 * is present) or an independent query guard.
 */
export async function isolateDiagnosticQuery<T>(
  name: string,
  queryFn: () => Promise<T>,
  fallback: T,
  client?: PoolClient,
): Promise<T> {
  if (client) {
    const savepointName = `sp_diag_${name.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40)}`;
    try {
      await client.query(`SAVEPOINT ${savepointName}`);
      const result = await queryFn();
      await client.query(`RELEASE SAVEPOINT ${savepointName}`);
      return result;
    } catch (err) {
      try {
        await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      } catch (rollbackErr) {
        _logger.warn(`[queryIsolation] rollback failed for savepoint ${savepointName}:`, rollbackErr);
      }
      _logger.warn(`[queryIsolation] diagnostic sub-query '${name}' failed under savepoint:`, err);
      return fallback;
    }
  }

  try {
    return await queryFn();
  } catch (err) {
    _logger.warn(`[queryIsolation] diagnostic query '${name}' failed:`, err);
    return fallback;
  }
}
