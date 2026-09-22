/**
 * Readings from code_health_snapshots — what tsc and ESLint actually
 * reported per commit. Server-only.
 *
 * @file src/services/admin/codeHealthReadings.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { isMissingRelation } from "@/lib/database/pgErrors";
import { _logger } from "@/lib/logger";
import { CodeHealthSnapshotInputSchema } from "@/services/admin/codeHealthIngest";

export interface CodeHealthReading {
  commitSha: string;
  source: string;
  measuredAt: string;
  committedAt: string | null;
  commitMessage: string | null;
  tscErrors: number | null;
  eslintErrors: number | null;
  eslintWarnings: number | null;
  eslintByRule: Array<{ rule: string; errors: number; warnings: number }>;
  eslintTopFiles: Array<{ file: string; warnings: number; errors: number }>;
  tscByCode: Array<{ code: string; count: number }>;
  census: { sourceFiles: number; sourceLines: number; testFiles: number } | null;
}

export interface ReadingsResult {
  status: "live" | "missing-table" | "error";
  detail?: string;
  latest: CodeHealthReading | null;
  history: CodeHealthReading[];
}

interface SnapshotRow {
  commit_sha: string;
  source: string;
  measured_at: Date;
  committed_at: Date | null;
  commit_message: string | null;
  tsc_errors: number | null;
  eslint_errors: number | null;
  eslint_warnings: number | null;
  payload: unknown;
}

type Detail = Pick<CodeHealthReading, "eslintByRule" | "eslintTopFiles" | "tscByCode" | "census">;

/** Per-rule / per-file breakdown — parsed only for the latest row. */
function readingDetail(payload: unknown): Detail {
  const parsed = CodeHealthSnapshotInputSchema.safeParse(payload);
  if (!parsed.success) return { eslintByRule: [], eslintTopFiles: [], tscByCode: [], census: null };
  const { eslint, tsc, census } = parsed.data;
  return {
    eslintByRule: Object.entries(eslint?.byRule ?? {})
      .map(([rule, v]) => ({ rule, errors: v.errors, warnings: v.warnings }))
      .sort((a, b) => b.errors + b.warnings - (a.errors + a.warnings)),
    eslintTopFiles: eslint?.topFiles ?? [],
    tscByCode: Object.entries(tsc?.byCode ?? {})
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count),
    census: census ?? null,
  };
}

function toReading(row: SnapshotRow, withDetail: boolean): CodeHealthReading {
  const detail: Detail = withDetail
    ? readingDetail(row.payload)
    : { eslintByRule: [], eslintTopFiles: [], tscByCode: [], census: null };
  return {
    commitSha: row.commit_sha,
    source: row.source,
    measuredAt: new Date(row.measured_at).toISOString(),
    committedAt: row.committed_at ? new Date(row.committed_at).toISOString() : null,
    commitMessage: row.commit_message,
    tscErrors: row.tsc_errors,
    eslintErrors: row.eslint_errors,
    eslintWarnings: row.eslint_warnings,
    ...detail,
  };
}

export async function readReadings(): Promise<ReadingsResult> {
  try {
    const res = await executeQuery<SnapshotRow>(
      `SELECT commit_sha, source, measured_at, committed_at, commit_message,
              tsc_errors, eslint_errors, eslint_warnings, payload
         FROM code_health_snapshots
        ORDER BY COALESCE(committed_at, measured_at) DESC
        LIMIT 60`,
    );
    const [first] = res.rows;
    return {
      status: "live",
      latest: first ? toReading(first, true) : null,
      history: res.rows.map((r) => toReading(r, false)),
    };
  } catch (err) {
    if (isMissingRelation(err)) {
      return {
        status: "missing-table",
        detail: "code_health_snapshots does not exist yet — migration 86 applies on the next backend deploy",
        latest: null,
        history: [],
      };
    }
    _logger.error("[code-health] readings query failed:", err);
    return { status: "error", detail: err instanceof Error ? err.message : "query failed", latest: null, history: [] };
  }
}
