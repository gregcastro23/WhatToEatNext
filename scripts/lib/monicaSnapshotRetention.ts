/**
 * Retention selection for daily `monica_preconstruction_*` backfill snapshots.
 *
 * `scripts/backfillMonicaPerConstruction.ts --write` snapshots `user_profiles`
 * before each run. Over months those post-migration tables accumulate needlessly,
 * whereas `monica_preconstruction_20260722_160100` (and any table passing the
 * `auditAgentDataIntegrity.ts` rollback predicate) is the irreplaceable
 * pre-migration restore point and must never be dropped.
 */

export const DEFAULT_MONICA_SNAPSHOT_RETAIN_DAYS = 7;

export const PROTECTED_MONICA_ROLLBACK_SNAPSHOTS: ReadonlySet<string> = new Set([
  "monica_preconstruction_20260722_160100",
]);

export const MONICA_SNAPSHOT_NAME_RE =
  /^monica_preconstruction_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/;

export interface MonicaSnapshotCandidate {
  readonly tableName: string;
  readonly isTrueRollbackPoint: boolean;
}

export interface MonicaRetentionOptions {
  readonly now?: Date;
  readonly retainDays?: number;
  readonly currentSnapshot?: string;
}

/**
 * Parses `monica_preconstruction_YYYYMMDD_HHMMSS` into a UTC `Date`, or returns
 * `null` for malformed names and invalid calendar components.
 */
export function parseMonicaSnapshotTimestamp(tableName: string): Date | null {
  const match = MONICA_SNAPSHOT_NAME_RE.exec(tableName);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);

  const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (Number.isNaN(parsed.getTime())) return null;

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day ||
    parsed.getUTCHours() !== hour ||
    parsed.getUTCMinutes() !== minute ||
    parsed.getUTCSeconds() !== second
  ) {
    return null;
  }

  return parsed;
}

/**
 * Selects sorted unique post-migration snapshot table names strictly older than
 * `retainDays` (default 7). Never selects `PROTECTED_MONICA_ROLLBACK_SNAPSHOTS`,
 * content-verified rollback points, or `currentSnapshot`.
 */
export function selectExpiredMonicaSnapshots(
  candidates: readonly MonicaSnapshotCandidate[],
  options: MonicaRetentionOptions = {},
): string[] {
  const now = options.now ?? new Date();
  const retainDays = options.retainDays ?? DEFAULT_MONICA_SNAPSHOT_RETAIN_DAYS;
  if (!Number.isFinite(retainDays) || retainDays < 0) {
    throw new Error(`Invalid retainDays: ${retainDays}`);
  }

  const maxAgeMs = retainDays * 24 * 60 * 60 * 1000;
  const nowMs = now.getTime();
  const selected = new Set<string>();

  for (const candidate of candidates) {
    const { tableName, isTrueRollbackPoint } = candidate;
    if (!MONICA_SNAPSHOT_NAME_RE.test(tableName)) continue;
    if (PROTECTED_MONICA_ROLLBACK_SNAPSHOTS.has(tableName)) continue;
    if (isTrueRollbackPoint) continue;
    if (tableName === options.currentSnapshot) continue;

    const timestamp = parseMonicaSnapshotTimestamp(tableName);
    if (!timestamp) continue;

    if (nowMs - timestamp.getTime() > maxAgeMs) {
      selected.add(tableName);
    }
  }

  return [...selected].sort();
}
