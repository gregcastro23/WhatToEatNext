/**
 * Postgres error classification.
 *
 * @file src/lib/database/pgErrors.ts
 */

/**
 * `42P01 undefined_table` — the relation does not exist. Admin readers use it
 * to report "migration not applied yet" instead of a generic failure, because
 * the two call for different operator actions.
 */
export function isMissingRelation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "42P01";
}
