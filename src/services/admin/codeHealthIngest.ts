/**
 * Code-health snapshot contract + ingest (CI → code_health_snapshots).
 * Server-only.
 *
 * The schema is the contract between scripts/codeHealthSnapshot.ts (which
 * produces the JSON) and POST /api/admin/code-health/ingest (which stores
 * it). One row per (commit, source); a re-run of the same commit replaces it.
 *
 * @file src/services/admin/codeHealthIngest.ts
 */

import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";

const RuleCountSchema = z.object({ errors: z.number().int(), warnings: z.number().int() });

const TscReadingSchema = z.object({
  errors: z.number().int().nonnegative(),
  byCode: z.record(z.string(), z.number().int()),
  topFiles: z.array(z.object({ file: z.string(), count: z.number().int() })).max(50),
  durationMs: z.number(),
});

const EslintReadingSchema = z.object({
  errors: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  filesWithProblems: z.number().int().nonnegative(),
  byRule: z.record(z.string(), RuleCountSchema),
  topFiles: z
    .array(z.object({ file: z.string(), warnings: z.number().int(), errors: z.number().int() }))
    .max(50),
  durationMs: z.number(),
});

export const CodeHealthSnapshotInputSchema = z.object({
  commitSha: z.string().regex(/^[0-9a-f]{7,40}$/i),
  branch: z.string().max(200).nullable().optional(),
  committedAt: z.string().nullable().optional(),
  commitMessage: z.string().max(2000).nullable().optional(),
  measuredAt: z.string(),
  source: z.enum(["ci", "local"]),
  tsc: TscReadingSchema.nullable(),
  eslint: EslintReadingSchema.nullable(),
  census: z
    .object({ sourceFiles: z.number().int(), sourceLines: z.number().int(), testFiles: z.number().int() })
    .nullable()
    .optional(),
});

export type CodeHealthSnapshotInput = z.infer<typeof CodeHealthSnapshotInputSchema>;

function validDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function ingestCodeHealthSnapshot(snapshot: CodeHealthSnapshotInput): Promise<void> {
  await executeQuery(
    `INSERT INTO code_health_snapshots (
       commit_sha, source, measured_at, committed_at, branch, commit_message,
       tsc_errors, eslint_errors, eslint_warnings, payload
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (commit_sha, source) DO UPDATE SET
       measured_at = EXCLUDED.measured_at, committed_at = EXCLUDED.committed_at,
       branch = EXCLUDED.branch, commit_message = EXCLUDED.commit_message,
       tsc_errors = EXCLUDED.tsc_errors, eslint_errors = EXCLUDED.eslint_errors,
       eslint_warnings = EXCLUDED.eslint_warnings, payload = EXCLUDED.payload,
       received_at = NOW()`,
    [
      snapshot.commitSha.toLowerCase(),
      snapshot.source,
      validDate(snapshot.measuredAt) ?? new Date(),
      validDate(snapshot.committedAt),
      snapshot.branch ?? null,
      snapshot.commitMessage ?? null,
      snapshot.tsc?.errors ?? null,
      snapshot.eslint?.errors ?? null,
      snapshot.eslint?.warnings ?? null,
      JSON.stringify(snapshot),
    ],
  );
}
