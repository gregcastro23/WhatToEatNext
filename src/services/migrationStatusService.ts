/**
 * Migration status — live pending-migrations detection.
 *
 * The `_migrations` tracking table (filename PK, applied_at) is written by
 * `scripts/migrate.ts` and the Railway backend's Python runner, but until now
 * nothing in the app read it — schema drift was invisible to operators, and
 * a migration has already shipped unapplied while its feature went live.
 *
 * This service diffs the applied set against the `database/init/*.sql`
 * manifest. The manifest is read from the filesystem at runtime; when the
 * deploy bundle does not include the directory the payload degrades to
 * `manifestCount: null` (applied facts still render) rather than guessing.
 *
 * Honesty contract: `live: false` when `_migrations` itself is unreadable.
 *
 * @file src/services/migrationStatusService.ts
 */

export interface MigrationStatusData {
  /** Rows in `_migrations`. */
  appliedCount: number;
  /** Most recently applied migration, by applied_at. */
  latestApplied: { filename: string; appliedAt: string } | null;
  /** Manifest files with no `_migrations` row — the drift that bites. */
  pendingFiles: string[];
  /** Total files in the on-disk manifest; null when unreadable at runtime. */
  manifestCount: number | null;
  /** false when the `_migrations` table could not be read. */
  live: boolean;
}

/**
 * NOT YET WIRED — skeleton returning the honest degraded state. The
 * implementation reads `_migrations` and diffs it against database/init.
 */
export async function getMigrationStatus(): Promise<MigrationStatusData> {
  return {
    appliedCount: 0,
    latestApplied: null,
    pendingFiles: [],
    manifestCount: null,
    live: false,
  };
}
