/**
 * Code health — the TypeScript campaign's numbers, live. Server-only.
 *
 * Four sources, each answering a different question and labelled as such:
 *
 *   1. READINGS (codeHealthReadings) — what `tsc` and `eslint` actually
 *      reported on a commit, ingested from CI on every push to master. The
 *      only source of the raw ESLint warning count.
 *   2. RATCHETS (codeHealthRatchets) — the committed baselines the verify gate
 *      enforces, bundled for the deployed commit.
 *   3. RATCHET HISTORY (codeHealthRatchets) — the same baseline file at every
 *      commit that changed it: the campaign's trend line.
 *   4. CI / COMMITS / PRS (codeHealthGithub).
 *
 * @file src/services/admin/codeHealthService.ts
 */

import { ciStatus, openPulls, recentCommits, type CiStatus, type OpenPull, type RepoCommit } from "@/services/admin/codeHealthGithub";
import {
  bundledRatchets,
  ratchetHistory,
  type BundledRatchets,
  type RatchetHistory,
} from "@/services/admin/codeHealthRatchets";
import { readReadings, type ReadingsResult } from "@/services/admin/codeHealthReadings";
import { commitTitle, WTEN_REPO, type SourceState } from "@/services/admin/githubClient";

export interface DeployIdentity {
  sha: string | null;
  message: string | null;
  author: string | null;
  branch: string | null;
  env: string | null;
}

/** Vercel system env of the running deployment. Null locally. */
export function deployIdentity(): DeployIdentity {
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE;
  return {
    sha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    message: message ? commitTitle(message) : null,
    author: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN ?? process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    env: process.env.VERCEL_ENV ?? null,
  };
}

export interface CodeHealthPayload {
  generatedAt: string;
  repo: string;
  deploy: DeployIdentity;
  readings: ReadingsResult;
  ratchets: BundledRatchets;
  ratchetHistory: RatchetHistory;
  ci: CiStatus;
  commits: { state: SourceState; commits: RepoCommit[] };
  pulls: { state: SourceState; pulls: OpenPull[] };
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

/** Compact numbers for the overview pulse. */
export async function getCodeHealthPulse(): Promise<CodeHealthPulse> {
  const [readings, ci] = await Promise.all([readReadings(), ciStatus()]);
  const { latest } = readings;
  const lastCompleted = ci.runs.find((r) => r.status === "completed");
  return {
    tscErrors: latest?.tscErrors ?? null,
    eslintWarnings: latest?.eslintWarnings ?? null,
    eslintErrors: latest?.eslintErrors ?? null,
    readingSha: latest?.commitSha ?? null,
    readingAt: latest?.measuredAt ?? null,
    trackedDebt: bundledRatchets().lintDebt?.trackedTotal ?? null,
    ciConclusion: lastCompleted?.conclusion ?? null,
    ciSha: lastCompleted?.sha ?? null,
  };
}
