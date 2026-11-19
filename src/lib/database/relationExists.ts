/**
 * Process-local memoization for PostgreSQL schema-existence (`to_regclass`) probes.
 *
 * Once a relation is confirmed present it cannot disappear at runtime, so caching
 * positive hits eliminates per-request catalog round-trips under serverless
 * PgBouncer pooling. Negative or failed probes are NOT latched so pending
 * migrations or transient DB errors self-heal on the next check.
 *
 * @file src/lib/database/relationExists.ts
 */

import { executeQuery } from "@/lib/database/connection";
import type { QueryResultRow } from "pg";

const RELATION_NAME_RE = /^[a-z_][a-z0-9_]*(\.[a-z_][a-z0-9_]*)?$/;

const confirmedRelations = new Set<string>();
const inFlightProbes = new Map<string, Promise<boolean>>();

export type RelationQueryFn = <T extends QueryResultRow = Record<string, unknown>>(
  query: string,
) => Promise<{ rows: T[] }>;

/** Run `probe` once confirmed `true` and deduplicate concurrent in-flight probes. */
export function memoizeRelationPresent(
  relationName: string,
  probe: () => Promise<boolean>,
): Promise<boolean> {
  if (confirmedRelations.has(relationName)) {
    return Promise.resolve(true);
  }
  const existing = inFlightProbes.get(relationName);
  if (existing) {
    return existing;
  }

  const run = probe()
    .then((present): boolean => {
      if (present) {
        confirmedRelations.add(relationName);
      }
      return present;
    })
    .catch((): boolean => false)
    .finally((): void => {
      inFlightProbes.delete(relationName);
    });

  inFlightProbes.set(relationName, run);
  return run;
}

/** Check via `to_regclass` whether `relationName` exists, caching positive hits. */
export function relationExists(
  relationName: string,
  queryFn: RelationQueryFn = executeQuery,
): Promise<boolean> {
  if (!RELATION_NAME_RE.test(relationName)) {
    throw new Error(`Invalid relation name: ${relationName}`);
  }
  return memoizeRelationPresent(relationName, async (): Promise<boolean> => {
    const res = await queryFn<{ present: boolean }>(
      `SELECT to_regclass('${relationName}') IS NOT NULL AS present`,
    );
    return res.rows[0]?.present === true;
  });
}

/** Clear memoized relation-existence state (for tests). */
export function resetRelationExistsCache(): void {
  confirmedRelations.clear();
  inFlightProbes.clear();
}
