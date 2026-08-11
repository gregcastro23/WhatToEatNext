/**
 * GitHub triage queue — the "unfinished work" panel's live source.
 *
 * This repo's issue tracker is GitHub issues under the five canonical triage
 * labels (needs-triage, needs-info, ready-for-agent, ready-for-human,
 * wontfix — see docs/agents/triage-labels.md). The repo is public, so the
 * issues API is readable without credentials; an optional `GITHUB_TOKEN`
 * raises the rate limit. Responses are cached server-side so a dashboard
 * poll never spends more than a few requests per hour.
 *
 * Honesty contract: on fetch failure or rate-limit the payload degrades to
 * `live: false` with zeroed counts — never a stale count presented as fresh
 * without its `fetchedAt`.
 *
 * @file src/services/githubTriageService.ts
 */

export interface TriageIssue {
  number: number;
  title: string;
  /** The triage label this issue carries. */
  label: string;
  url: string;
  updatedAt: string;
}

export interface TriageQueueData {
  counts: {
    needsTriage: number;
    needsInfo: number;
    readyForAgent: number;
    readyForHuman: number;
  };
  /** Newest actionable issues (needs-triage + ready-for-*), for the queue list. */
  topIssues: TriageIssue[];
  /** All open issues in the repo, null when the fetch degraded. */
  openTotal: number | null;
  /** When the underlying fetch actually ran (cache-aware), null when degraded. */
  fetchedAt: string | null;
  live: boolean;
}

/**
 * NOT YET WIRED — skeleton returning the honest degraded state. The
 * implementation fetches the GitHub issues API per triage label with
 * server-side caching and an optional GITHUB_TOKEN.
 */
export async function getTriageQueue(): Promise<TriageQueueData> {
  return {
    counts: {
      needsTriage: 0,
      needsInfo: 0,
      readyForAgent: 0,
      readyForHuman: 0,
    },
    topIssues: [],
    openTotal: null,
    fetchedAt: null,
    live: false,
  };
}
