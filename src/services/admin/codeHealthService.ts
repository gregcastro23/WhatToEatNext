/**
 * Code health — the TypeScript campaign's numbers, live. Server-only.
 *
 * Four sources, each answering a different question and labelled as such:
 *
 *   1. READINGS (`code_health_snapshots`, migration 86) — what `tsc` and
 *      `eslint` actually reported on a commit. Written by
 *      scripts/codeHealthSnapshot.ts in CI on every push to master. The only
 *      source of the raw ESLint warning count.
 *   2. RATCHETS (bundled at build) — the committed baselines the `verify` gate
 *      enforces: tracked lint debt, casts, assertion sites, bare JSON casts,
 *      scripts typecheck. `lint:debt:ratchet` pins them to the live
 *      measurement, so for the deployed commit they ARE the measurement.
 *   3. RATCHET HISTORY (GitHub) — the same baseline file at every commit that
 *      changed it: the campaign's trend line, with no backfill job.
 *   4. CI (GitHub Actions) — whether master is green, per leg. A green Verify
 *      leg on a commit implies tsc reported zero errors on it.
 *
 * @file src/services/admin/codeHealthService.ts
 */

import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  commitTitle,
  GithubCommitSchema,
  githubGet,
  GithubJobsSchema,
  GithubPullSchema,
  githubRawFile,
  GithubWorkflowRunsSchema,
  WTEN_REPO,
} from "@/services/admin/githubClient";
import { isMissingRelation } from "@/services/admin/trafficAnalyticsService";
import bareJsonBaselineRaw from "../../../.bare-json-casts-baseline.json";
import lintDebtBaselineRaw from "../../../.lint-debt-baseline.json";
import routeValidationBaselineRaw from "../../../.route-validation-baseline.json";
import scriptsTypecheckBaselineRaw from "../../../.scripts-typecheck-baseline.json";

// ─── Ingest (CI → DB) ───────────────────────────────────────────────────────

const RuleCountSchema = z.object({ errors: z.number().int(), warnings: z.number().int() });

export const CodeHealthSnapshotInputSchema = z.object({
  commitSha: z.string().regex(/^[0-9a-f]{7,40}$/i),
  branch: z.string().max(200).nullable().optional(),
  committedAt: z.string().nullable().optional(),
  commitMessage: z.string().max(2000).nullable().optional(),
  measuredAt: z.string(),
  source: z.enum(["ci", "local"]),
  tsc: z
    .object({
      errors: z.number().int().nonnegative(),
      byCode: z.record(z.string(), z.number().int()),
      topFiles: z.array(z.object({ file: z.string(), count: z.number().int() })).max(50),
      durationMs: z.number(),
    })
    .nullable(),
  eslint: z
    .object({
      errors: z.number().int().nonnegative(),
      warnings: z.number().int().nonnegative(),
      filesWithProblems: z.number().int().nonnegative(),
      byRule: z.record(z.string(), RuleCountSchema),
      topFiles: z
        .array(z.object({ file: z.string(), warnings: z.number().int(), errors: z.number().int() }))
        .max(50),
      durationMs: z.number(),
    })
    .nullable(),
  census: z
    .object({
      sourceFiles: z.number().int(),
      sourceLines: z.number().int(),
      testFiles: z.number().int(),
    })
    .nullable()
    .optional(),
});

export type CodeHealthSnapshotInput = z.infer<typeof CodeHealthSnapshotInputSchema>;

export async function ingestCodeHealthSnapshot(snapshot: CodeHealthSnapshotInput): Promise<void> {
  const measuredAt = new Date(snapshot.measuredAt);
  const committedAt = snapshot.committedAt ? new Date(snapshot.committedAt) : null;
  await executeQuery(
    `INSERT INTO code_health_snapshots (
       commit_sha, source, measured_at, committed_at, branch, commit_message,
       tsc_errors, eslint_errors, eslint_warnings, payload
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (commit_sha, source) DO UPDATE SET
       measured_at = EXCLUDED.measured_at,
       committed_at = EXCLUDED.committed_at,
       branch = EXCLUDED.branch,
       commit_message = EXCLUDED.commit_message,
       tsc_errors = EXCLUDED.tsc_errors,
       eslint_errors = EXCLUDED.eslint_errors,
       eslint_warnings = EXCLUDED.eslint_warnings,
       payload = EXCLUDED.payload,
       received_at = NOW()`,
    [
      snapshot.commitSha.toLowerCase(),
      snapshot.source,
      Number.isNaN(measuredAt.getTime()) ? new Date() : measuredAt,
      committedAt && !Number.isNaN(committedAt.getTime()) ? committedAt : null,
      snapshot.branch ?? null,
      snapshot.commitMessage ?? null,
      snapshot.tsc?.errors ?? null,
      snapshot.eslint?.errors ?? null,
      snapshot.eslint?.warnings ?? null,
      JSON.stringify(snapshot),
    ],
  );
}

// ─── Bundled ratchet baselines ──────────────────────────────────────────────

/** Lenient: older commits' baselines lack newer sections. */
const LintDebtBaselineSchema = z
  .object({
    trackedTotal: z.number().optional(),
    casts: z
      .object({ total: z.number(), asAny: z.number(), asUnknownAs: z.number() })
      .passthrough()
      .optional(),
    assertionSites: z
      .object({
        total: z.number(),
        nonNull: z.number().optional(),
        asConst: z.number().optional(),
        chained: z.number().optional(),
      })
      .passthrough()
      .optional(),
    looseOptionality: z.object({ total: z.number() }).passthrough().optional(),
    declined: z
      .object({ total: z.number(), rules: z.record(z.string(), z.number()).optional() })
      .passthrough()
      .optional(),
    suppressions: z.record(z.string(), z.number()).optional(),
    subBaselines: z
      .object({
        preferNullishCoalescing: z.object({ total: z.number() }).passthrough().optional(),
      })
      .passthrough()
      .optional(),
    rules: z.record(z.string(), z.object({ count: z.number() }).passthrough()).optional(),
  })
  .passthrough();

type LintDebtBaseline = z.infer<typeof LintDebtBaselineSchema>;

export interface RatchetSummary {
  /** Tracked debt across the audited rule set (eslint.config.audit.mjs). */
  trackedTotal: number | null;
  castsTotal: number | null;
  asAny: number | null;
  asUnknownAs: number | null;
  assertionSites: number | null;
  nonNullAssertions: number | null;
  looseOptionality: number | null;
  declinedPool: number | null;
  preferNullishCoalescing: number | null;
  suppressions: number | null;
  topRules: Array<{ rule: string; count: number }>;
  declinedRules: Array<{ rule: string; count: number }>;
}

function summarizeLintDebt(b: LintDebtBaseline): RatchetSummary {
  const rules = Object.entries(b.rules ?? {})
    .map(([rule, v]) => ({ rule, count: v.count }))
    .filter((r) => r.count > 0)
    .sort((a, c) => c.count - a.count);
  const declinedRules = Object.entries(b.declined?.rules ?? {})
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, c) => c.count - a.count);
  const suppressions = b.suppressions
    ? Object.values(b.suppressions).reduce((sum, n) => sum + n, 0)
    : null;
  return {
    trackedTotal: b.trackedTotal ?? null,
    castsTotal: b.casts?.total ?? null,
    asAny: b.casts?.asAny ?? null,
    asUnknownAs: b.casts?.asUnknownAs ?? null,
    assertionSites: b.assertionSites?.total ?? null,
    nonNullAssertions: b.assertionSites?.nonNull ?? null,
    looseOptionality: b.looseOptionality?.total ?? null,
    declinedPool: b.declined?.total ?? null,
    preferNullishCoalescing: b.subBaselines?.preferNullishCoalescing?.total ?? null,
    suppressions,
    topRules: rules.slice(0, 12),
    declinedRules,
  };
}

const CountBaselineSchema = z.object({ total: z.number(), production: z.number().optional() }).passthrough();
const RouteValidationBaselineSchema = z
  .object({ totalUnvalidated: z.number(), totalBodyReading: z.number() })
  .passthrough();

export interface BundledRatchets {
  basis: string;
  lintDebt: RatchetSummary | null;
  bareJsonCasts: { total: number; production: number | null } | null;
  scriptsTypecheckErrors: number | null;
  routeValidation: { unvalidated: number; bodyReadingRoutes: number } | null;
}

function bundledRatchets(): BundledRatchets {
  const lint = LintDebtBaselineSchema.safeParse(lintDebtBaselineRaw);
  const bare = CountBaselineSchema.safeParse(bareJsonBaselineRaw);
  const scripts = CountBaselineSchema.safeParse(scriptsTypecheckBaselineRaw);
  const routes = RouteValidationBaselineSchema.safeParse(routeValidationBaselineRaw);
  return {
    basis: "committed ratchet baselines, bundled at build of the deployed commit",
    lintDebt: lint.success ? summarizeLintDebt(lint.data) : null,
    bareJsonCasts: bare.success
      ? { total: bare.data.total, production: bare.data.production ?? null }
      : null,
    scriptsTypecheckErrors: scripts.success ? scripts.data.total : null,
    routeValidation: routes.success
      ? {
          unvalidated: routes.data.totalUnvalidated,
          bodyReadingRoutes: routes.data.totalBodyReading,
        }
      : null,
  };
}

// ─── Readings from the DB ───────────────────────────────────────────────────

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

function toReading(row: SnapshotRow, withDetail: boolean): CodeHealthReading {
  const parsed = withDetail ? CodeHealthSnapshotInputSchema.safeParse(row.payload) : null;
  const payload = parsed?.success ? parsed.data : null;
  return {
    commitSha: row.commit_sha,
    source: row.source,
    measuredAt: new Date(row.measured_at).toISOString(),
    committedAt: row.committed_at ? new Date(row.committed_at).toISOString() : null,
    commitMessage: row.commit_message,
    tscErrors: row.tsc_errors,
    eslintErrors: row.eslint_errors,
    eslintWarnings: row.eslint_warnings,
    eslintByRule: payload?.eslint
      ? Object.entries(payload.eslint.byRule)
          .map(([rule, v]) => ({ rule, errors: v.errors, warnings: v.warnings }))
          .sort((a, b) => b.errors + b.warnings - (a.errors + a.warnings))
      : [],
    eslintTopFiles: payload?.eslint?.topFiles ?? [],
    tscByCode: payload?.tsc
      ? Object.entries(payload.tsc.byCode)
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => b.count - a.count)
      : [],
    census: payload?.census ?? null,
  };
}

async function readReadings(): Promise<{
  status: "live" | "missing-table" | "error";
  detail?: string;
  latest: CodeHealthReading | null;
  history: CodeHealthReading[];
}> {
  try {
    const res = await executeQuery<SnapshotRow>(
      `SELECT commit_sha, source, measured_at, committed_at, commit_message,
              tsc_errors, eslint_errors, eslint_warnings, payload
         FROM code_health_snapshots
        ORDER BY COALESCE(committed_at, measured_at) DESC
        LIMIT 60`,
    );
    const [first, ...rest] = res.rows;
    return {
      status: "live",
      latest: first ? toReading(first, true) : null,
      history: [first, ...rest].filter((r): r is SnapshotRow => r !== undefined).map((r) => toReading(r, false)),
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
    return {
      status: "error",
      detail: err instanceof Error ? err.message : "query failed",
      latest: null,
      history: [],
    };
  }
}

// ─── Ratchet history from GitHub ────────────────────────────────────────────

export interface RatchetPoint {
  sha: string;
  date: string;
  title: string;
  url: string;
  trackedTotal: number | null;
  castsTotal: number | null;
  asAny: number | null;
  assertionSites: number | null;
  nonNullAssertions: number | null;
  declinedPool: number | null;
}

type SourceState = { status: "live" } | { status: "rate-limited" | "error" | "not-found"; detail: string };

async function ratchetHistory(): Promise<{ state: SourceState; points: RatchetPoint[] }> {
  const commits = await githubGet(
    `/repos/${WTEN_REPO}/commits?sha=master&path=.lint-debt-baseline.json&per_page=40`,
    z.array(GithubCommitSchema),
    15 * 60_000,
  );
  if (!commits.ok) return { state: { status: commits.reason, detail: commits.detail }, points: [] };

  const points = await Promise.all(
    commits.data.map(async (c): Promise<RatchetPoint | null> => {
      // A commit SHA is immutable: cache its file for a day.
      const raw = await githubRawFile(WTEN_REPO, c.sha, ".lint-debt-baseline.json", 24 * 3_600_000);
      if (!raw.ok) return null;
      let json: unknown;
      try {
        json = JSON.parse(raw.data);
      } catch {
        return null;
      }
      const parsed = LintDebtBaselineSchema.safeParse(json);
      if (!parsed.success) return null;
      const s = summarizeLintDebt(parsed.data);
      return {
        sha: c.sha,
        date: c.commit.committer?.date ?? c.commit.author?.date ?? "",
        title: commitTitle(c.commit.message),
        url: c.html_url,
        trackedTotal: s.trackedTotal,
        castsTotal: s.castsTotal,
        asAny: s.asAny,
        assertionSites: s.assertionSites,
        nonNullAssertions: s.nonNullAssertions,
        declinedPool: s.declinedPool,
      };
    }),
  );
  return {
    state: { status: "live" },
    points: points
      .filter((p): p is RatchetPoint => p !== null)
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// ─── CI + repo activity from GitHub ─────────────────────────────────────────

export interface CiRun {
  id: number;
  sha: string;
  title: string;
  conclusion: string | null;
  status: string | null;
  event: string;
  createdAt: string;
  durationMs: number | null;
  url: string;
}

export interface CiJob {
  name: string;
  conclusion: string | null;
  status: string;
  durationMs: number | null;
  url: string | null;
}

function durationMs(start: string | null | undefined, end: string | null | undefined): number | null {
  if (!start || !end) return null;
  const d = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(d) && d >= 0 ? d : null;
}

async function ciStatus(): Promise<{
  state: SourceState;
  runs: CiRun[];
  latestJobs: CiJob[];
  passRate: number | null;
}> {
  const runs = await githubGet(
    `/repos/${WTEN_REPO}/actions/workflows/ci.yml/runs?branch=master&per_page=20`,
    GithubWorkflowRunsSchema,
    3 * 60_000,
  );
  if (!runs.ok) {
    return { state: { status: runs.reason, detail: runs.detail }, runs: [], latestJobs: [], passRate: null };
  }
  const mapped: CiRun[] = runs.data.workflow_runs.map((r) => ({
    id: r.id,
    sha: r.head_sha,
    title: commitTitle(r.display_title ?? r.name ?? ""),
    conclusion: r.conclusion,
    status: r.status,
    event: r.event,
    createdAt: r.created_at,
    durationMs: r.status === "completed" ? durationMs(r.run_started_at ?? r.created_at, r.updated_at) : null,
    url: r.html_url,
  }));
  const completed = mapped.filter((r) => r.status === "completed" && r.conclusion !== "cancelled");
  const passRate =
    completed.length > 0
      ? completed.filter((r) => r.conclusion === "success").length / completed.length
      : null;

  let latestJobs: CiJob[] = [];
  const [latest] = mapped;
  if (latest) {
    const jobs = await githubGet(
      `/repos/${WTEN_REPO}/actions/runs/${latest.id}/jobs?per_page=30`,
      GithubJobsSchema,
      3 * 60_000,
    );
    if (jobs.ok) {
      latestJobs = jobs.data.jobs.map((j) => ({
        name: j.name,
        conclusion: j.conclusion,
        status: j.status,
        durationMs: durationMs(j.started_at, j.completed_at),
        url: j.html_url,
      }));
    }
  }
  return { state: { status: "live" }, runs: mapped, latestJobs, passRate };
}

export interface RepoCommit {
  sha: string;
  title: string;
  author: string;
  date: string;
  url: string;
}

async function recentCommits(): Promise<{ state: SourceState; commits: RepoCommit[] }> {
  const res = await githubGet(
    `/repos/${WTEN_REPO}/commits?sha=master&per_page=15`,
    z.array(GithubCommitSchema),
    5 * 60_000,
  );
  if (!res.ok) return { state: { status: res.reason, detail: res.detail }, commits: [] };
  return {
    state: { status: "live" },
    commits: res.data.map((c) => ({
      sha: c.sha,
      title: commitTitle(c.commit.message),
      author: c.author?.login ?? c.commit.author?.name ?? "unknown",
      date: c.commit.committer?.date ?? c.commit.author?.date ?? "",
      url: c.html_url,
    })),
  };
}

export interface OpenPull {
  number: number;
  title: string;
  url: string;
  author: string;
  draft: boolean;
  branch: string;
  updatedAt: string;
}

async function openPulls(): Promise<{ state: SourceState; pulls: OpenPull[] }> {
  const res = await githubGet(
    `/repos/${WTEN_REPO}/pulls?state=open&per_page=30`,
    z.array(GithubPullSchema),
    5 * 60_000,
  );
  if (!res.ok) return { state: { status: res.reason, detail: res.detail }, pulls: [] };
  return {
    state: { status: "live" },
    pulls: res.data.map((p) => ({
      number: p.number,
      title: p.title,
      url: p.html_url,
      author: p.user?.login ?? "unknown",
      draft: p.draft ?? false,
      branch: p.head.ref,
      updatedAt: p.updated_at,
    })),
  };
}

// ─── Payload ────────────────────────────────────────────────────────────────

export interface DeployIdentity {
  sha: string | null;
  message: string | null;
  author: string | null;
  branch: string | null;
  env: string | null;
}

export function deployIdentity(): DeployIdentity {
  return {
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    message: process.env.VERCEL_GIT_COMMIT_MESSAGE
      ? commitTitle(process.env.VERCEL_GIT_COMMIT_MESSAGE)
      : null,
    author:
      process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ?? process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    env: process.env.VERCEL_ENV ?? null,
  };
}

export interface CodeHealthPayload {
  generatedAt: string;
  repo: string;
  deploy: DeployIdentity;
  readings: Awaited<ReturnType<typeof readReadings>>;
  ratchets: BundledRatchets;
  ratchetHistory: Awaited<ReturnType<typeof ratchetHistory>>;
  ci: Awaited<ReturnType<typeof ciStatus>>;
  commits: Awaited<ReturnType<typeof recentCommits>>;
  pulls: Awaited<ReturnType<typeof openPulls>>;
}

export async function getCodeHealth(): Promise<CodeHealthPayload> {
  const [readings, history, ci, commits, pulls] = await Promise.all([
    readReadings(),
    ratchetHistory(),
    ciStatus(),
    recentCommits(),
    openPulls(),
  ]);
  return {
    generatedAt: new Date().toISOString(),
    repo: WTEN_REPO,
    deploy: deployIdentity(),
    readings,
    ratchets: bundledRatchets(),
    ratchetHistory: history,
    ci,
    commits,
    pulls,
  };
}

/** Compact numbers for the overview pulse. No GitHub calls beyond CI. */
export interface CodeHealthPulse {
  tscErrors: number | null;
  eslintWarnings: number | null;
  eslintErrors: number | null;
  readingSha: string | null;
  readingAt: string | null;
  trackedDebt: number | null;
  ciConclusion: string | null;
  ciSha: string | null;
}

export async function getCodeHealthPulse(): Promise<CodeHealthPulse> {
  const [readings, ci] = await Promise.all([readReadings(), ciStatus()]);
  const latestCompleted = ci.runs.find((r) => r.status === "completed");
  return {
    tscErrors: readings.latest?.tscErrors ?? null,
    eslintWarnings: readings.latest?.eslintWarnings ?? null,
    eslintErrors: readings.latest?.eslintErrors ?? null,
    readingSha: readings.latest?.commitSha ?? null,
    readingAt: readings.latest?.measuredAt ?? null,
    trackedDebt: bundledRatchets().lintDebt?.trackedTotal ?? null,
    ciConclusion: latestCompleted?.conclusion ?? null,
    ciSha: latestCompleted?.sha ?? null,
  };
}
