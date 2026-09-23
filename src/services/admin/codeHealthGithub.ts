/**
 * CI status, recent commits, and open PRs for this repo, from GitHub.
 * Server-only.
 *
 * A green Verify leg on master implies `tsc` reported zero errors on that
 * commit (typecheck is part of verify:static), so CI is also the zero-config
 * answer to "does master typecheck?" before any snapshot has been ingested.
 *
 * @file src/services/admin/codeHealthGithub.ts
 */

import { z } from "zod";
import {
  commitTitle,
  GithubCommitSchema,
  githubGet,
  GithubJobsSchema,
  GithubPullSchema,
  GithubWorkflowRunsSchema,
  WTEN_REPO,
  type SourceState,
} from "@/services/admin/githubClient";

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

export interface CiStatus {
  state: SourceState;
  runs: CiRun[];
  latestJobs: CiJob[];
  passRate: number | null;
}

type WorkflowRun = z.infer<typeof GithubWorkflowRunsSchema>["workflow_runs"][number];

function durationMs(start: string | null | undefined, end: string | null | undefined): number | null {
  if (!start || !end) return null;
  const d = new Date(end).getTime() - new Date(start).getTime();
  return Number.isFinite(d) && d >= 0 ? d : null;
}

function toCiRun(r: WorkflowRun): CiRun {
  return {
    id: r.id,
    sha: r.head_sha,
    title: commitTitle(r.display_title ?? r.name ?? ""),
    conclusion: r.conclusion,
    status: r.status,
    event: r.event,
    createdAt: r.created_at,
    durationMs: r.status === "completed" ? durationMs(r.run_started_at ?? r.created_at, r.updated_at) : null,
    url: r.html_url,
  };
}

async function jobsFor(runId: number): Promise<CiJob[]> {
  const jobs = await githubGet(`/repos/${WTEN_REPO}/actions/runs/${runId}/jobs?per_page=30`, GithubJobsSchema, 3 * 60_000);
  if (!jobs.ok) return [];
  return jobs.data.jobs.map((j) => ({
    name: j.name,
    conclusion: j.conclusion,
    status: j.status,
    durationMs: durationMs(j.started_at, j.completed_at),
    url: j.html_url,
  }));
}

export async function ciStatus(): Promise<CiStatus> {
  const runs = await githubGet(
    `/repos/${WTEN_REPO}/actions/workflows/ci.yml/runs?branch=master&per_page=20`,
    GithubWorkflowRunsSchema,
    3 * 60_000,
  );
  if (!runs.ok) {
    return { state: { status: runs.reason, detail: runs.detail }, runs: [], latestJobs: [], passRate: null };
  }
  const mapped = runs.data.workflow_runs.map(toCiRun);
  // Cancelled runs were superseded, not failed — they say nothing about health.
  const completed = mapped.filter((r) => r.status === "completed" && r.conclusion !== "cancelled");
  const passRate =
    completed.length > 0 ? completed.filter((r) => r.conclusion === "success").length / completed.length : null;
  const [latest] = mapped;
  return { state: { status: "live" }, runs: mapped, latestJobs: latest ? await jobsFor(latest.id) : [], passRate };
}

export interface RepoCommit {
  sha: string;
  title: string;
  author: string;
  date: string;
  url: string;
}

export async function recentCommits(): Promise<{ state: SourceState; commits: RepoCommit[] }> {
  const res = await githubGet(`/repos/${WTEN_REPO}/commits?sha=master&per_page=15`, z.array(GithubCommitSchema), 5 * 60_000);
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

export async function openPulls(): Promise<{ state: SourceState; pulls: OpenPull[] }> {
  const res = await githubGet(`/repos/${WTEN_REPO}/pulls?state=open&per_page=30`, z.array(GithubPullSchema), 5 * 60_000);
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
