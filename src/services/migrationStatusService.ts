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
 * next.config.js traces `database/init/*.sql` into the dashboard route's
 * lambda so the manifest is normally present in production.
 *
 * Honesty contract: `live: false` when `_migrations` itself is unreadable.
 *
 * @file src/services/migrationStatusService.ts
 */

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

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
 * On-disk manifest, mirroring scripts/migrate.ts listMigrationFiles()
 * (including its " 2." backup-file exclusion) so both sides diff the same
 * set. Null when the directory is not in the deploy bundle.
 */
function readManifest(): string[] | null {
  try {
    return readdirSync(join(process.cwd(), "database", "init"))
      .filter((f) => f.endsWith(".sql") && !f.includes(" 2."))
      .sort();
  } catch {
    return null;
  }
}

export async function getMigrationStatus(): Promise<MigrationStatusData> {
  let applied: Array<{ filename: string; applied_at: Date }>;
  try {
    const result = await executeQuery<{ filename: string; applied_at: Date }>(
      `SELECT filename, applied_at FROM _migrations ORDER BY applied_at`,
    );
    applied = result.rows;
  } catch (err) {
    // Includes the table not existing at all — itself a finding (the runner
    // never ran here), reported as an honest absence rather than a guess.
    _logger.warn("[migrationStatus] _migrations query failed:", err);
    return {
      appliedCount: 0,
      latestApplied: null,
      pendingFiles: [],
      manifestCount: null,
      live: false,
    };
  }

  const manifest = readManifest();
  const appliedSet = new Set(applied.map((r) => r.filename));
  const latest = applied.length > 0 ? applied[applied.length - 1] : null;

  return {
    appliedCount: applied.length,
    latestApplied: latest
      ? {
          filename: latest.filename,
          appliedAt: new Date(latest.applied_at).toISOString(),
        }
      : null,
    pendingFiles: manifest ? manifest.filter((f) => !appliedSet.has(f)) : [],
    manifestCount: manifest ? manifest.length : null,
    live: true,
  };
}
