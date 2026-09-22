/**
 * Minimal read-only GitHub client for the admin surface. Server-only.
 *
 * Both repos the admin reads are PUBLIC (WhatToEatNext, alchm-agents-solana),
 * so every call works without credentials. Unauthenticated REST calls are
 * limited to 60/hour per egress IP, and Vercel egress IPs are shared, so:
 *   - set GITHUB_TOKEN (a fine-grained, read-only, public-repo token is
 *     enough) to lift the limit to 5,000/hour;
 *   - file contents go through raw.githubusercontent.com, which is a CDN and
 *     does not consume the REST quota;
 *   - every result is memoized, and a rate-limited answer is reported as
 *     `rate-limited` rather than as an empty list.
 *
 * @file src/services/admin/githubClient.ts
 */

import { z } from "zod";
import { readJson } from "@/lib/api/json";
import { memoize } from "@/lib/cache/memoryCache";

export const WTEN_REPO =
  process.env.ADMIN_GITHUB_REPO ??
  (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
    ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
    : "gregcastro23/WhatToEatNext");

export const SOLANA_REPO = process.env.ADMIN_SOLANA_REPO ?? "gregcastro23/alchm-agents-solana";

const TIMEOUT_MS = 6_000;

export type GithubResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "rate-limited" | "not-found" | "error"; detail: string };

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "user-agent": "alchm-kitchen-admin",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.authorization = `Bearer ${token}`;
  return h;
}

export function githubAuthenticated(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Transient failures (timeouts, 5xx) are thrown inside `memoize` so they are
 * NOT cached — the next poll retries. Definitive answers (data, 404, rate
 * limit) are returned as values and cached for the TTL.
 */
class TransientGithubError extends Error {}

async function settle<T>(work: Promise<GithubResult<T>>): Promise<GithubResult<T>> {
  try {
    return await work;
  } catch (err) {
    return {
      ok: false,
      reason: "error",
      detail: err instanceof Error ? err.message : "GitHub request failed",
    };
  }
}

/**
 * GET a REST path (e.g. `/repos/o/r/commits?per_page=5`), validated by
 * `schema` and memoized for `ttlMs`.
 */
export async function githubGet<T>(
  path: string,
  schema: z.ZodType<T>,
  ttlMs: number,
): Promise<GithubResult<T>> {
  return settle(
    memoize(`github:${path}`, ttlMs, async (): Promise<GithubResult<T>> => {
      const res = await fetchWithTimeout(`https://api.github.com${path}`, { headers: headers() });
      if (res.status === 404) {
        return { ok: false, reason: "not-found", detail: `404 ${path}` };
      }
      if (res.status === 403 || res.status === 429) {
        const remaining = res.headers.get("x-ratelimit-remaining");
        if (remaining === "0" || res.status === 429) {
          const reset = Number(res.headers.get("x-ratelimit-reset") ?? 0);
          return {
            ok: false,
            reason: "rate-limited",
            detail: `GitHub API rate limit reached${
              reset ? ` until ${new Date(reset * 1000).toISOString()}` : ""
            }${githubAuthenticated() ? "" : " — set GITHUB_TOKEN to raise it"}`,
          };
        }
      }
      if (!res.ok) throw new TransientGithubError(`HTTP ${res.status} ${path}`);
      return { ok: true, data: await readJson(res, { parse: (raw) => schema.parse(raw) }) };
    }),
  );
}

/**
 * Raw file at a ref via the CDN (no REST quota). A ref that is a full commit
 * SHA is immutable, so callers may cache those results for a long time.
 */
export async function githubRawFile(
  repo: string,
  ref: string,
  filePath: string,
  ttlMs: number,
): Promise<GithubResult<string>> {
  return settle(
    memoize(`github-raw:${repo}@${ref}:${filePath}`, ttlMs, async (): Promise<GithubResult<string>> => {
      const res = await fetchWithTimeout(
        `https://raw.githubusercontent.com/${repo}/${ref}/${filePath}`,
        { headers: { "user-agent": "alchm-kitchen-admin" } },
      );
      if (res.status === 404) return { ok: false, reason: "not-found", detail: `404 ${filePath}@${ref}` };
      if (!res.ok) throw new TransientGithubError(`HTTP ${res.status} ${filePath}@${ref}`);
      return { ok: true, data: await res.text() };
    }),
  );
}

// ─── Shapes we read (only the fields used; passthrough keeps the rest) ──────

export const GithubCommitSchema = z
  .object({
    sha: z.string(),
    html_url: z.string(),
    commit: z
      .object({
        message: z.string(),
        author: z.object({ name: z.string(), date: z.string() }).passthrough().nullable(),
        committer: z.object({ date: z.string() }).passthrough().nullable(),
      })
      .passthrough(),
    author: z.object({ login: z.string() }).passthrough().nullable(),
  })
  .passthrough();
export type GithubCommit = z.infer<typeof GithubCommitSchema>;

export const GithubWorkflowRunSchema = z
  .object({
    id: z.number(),
    name: z.string().nullable(),
    head_sha: z.string(),
    head_branch: z.string().nullable(),
    event: z.string(),
    status: z.string().nullable(),
    conclusion: z.string().nullable(),
    html_url: z.string(),
    created_at: z.string(),
    run_started_at: z.string().optional(),
    updated_at: z.string(),
    display_title: z.string().optional(),
  })
  .passthrough();
export type GithubWorkflowRun = z.infer<typeof GithubWorkflowRunSchema>;

export const GithubWorkflowRunsSchema = z
  .object({ total_count: z.number(), workflow_runs: z.array(GithubWorkflowRunSchema) })
  .passthrough();

export const GithubJobSchema = z
  .object({
    name: z.string(),
    status: z.string(),
    conclusion: z.string().nullable(),
    started_at: z.string().nullable(),
    completed_at: z.string().nullable(),
    html_url: z.string().nullable(),
  })
  .passthrough();
export type GithubJob = z.infer<typeof GithubJobSchema>;

export const GithubJobsSchema = z
  .object({ total_count: z.number(), jobs: z.array(GithubJobSchema) })
  .passthrough();

export const GithubPullSchema = z
  .object({
    number: z.number(),
    title: z.string(),
    html_url: z.string(),
    draft: z.boolean().optional(),
    created_at: z.string(),
    updated_at: z.string(),
    merged_at: z.string().nullable().optional(),
    user: z.object({ login: z.string() }).passthrough().nullable(),
    head: z.object({ ref: z.string() }).passthrough(),
  })
  .passthrough();
export type GithubPull = z.infer<typeof GithubPullSchema>;

/** First line of a commit message. */
export function commitTitle(message: string): string {
  return (message.split("\n")[0] ?? "").slice(0, 160);
}
