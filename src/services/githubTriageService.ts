/**
 * GitHub triage queue — the "unfinished work" panel's live source.
 *
 * This repo's issue tracker is GitHub issues under the five canonical triage
 * labels (needs-triage, needs-info, ready-for-agent, ready-for-human,
 * wontfix — see docs/agents/triage-labels.md). wontfix is closed-state by
 * convention, so the queue counts only the four open-state labels. The repo
 * is public, so the issues API is readable without credentials; an optional
 * `GITHUB_TOKEN` raises the rate limit. Responses are cached server-side so
 * a dashboard poll never spends more than a few requests per hour.
 *
 * Honesty contract: on fetch failure or rate-limit the payload degrades to
 * `live: false` with zeroed counts — never a stale count presented as fresh
 * without its `fetchedAt`. A partial fetch (any one label failing) degrades
 * the whole payload rather than masquerading as complete.
 *
 * @file src/services/githubTriageService.ts
 */

import { _logger } from "@/lib/logger";
import { redisCached } from "@/lib/redis";

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
  /** Open issues across the four triage labels, null when the fetch degraded. */
  openTotal: number | null;
  /** When the underlying fetch actually ran (cache-aware), null when degraded. */
  fetchedAt: string | null;
  live: boolean;
}

const REPO = "gregcastro23/WhatToEatNext";
const CACHE_KEY = "admin:triage-queue";
const CACHE_TTL_SECONDS = 600;
const FETCH_TIMEOUT_MS = 4_000;
const TOP_ISSUES_LIMIT = 8;

/** The labels this queue counts; wontfix is closed-state and excluded. */
export const TRIAGE_LABELS = [
  "needs-triage",
  "needs-info",
  "ready-for-agent",
  "ready-for-human",
] as const;

/** Labels whose issues are actionable now — the ones the queue list shows. */
const ACTIONABLE_LABELS = new Set([
  "needs-triage",
  "ready-for-agent",
  "ready-for-human",
]);

interface GithubIssueRow {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  /** Present on PR rows — the issues API returns PRs too; we exclude them. */
  pull_request?: unknown;
}

/** Pages fetched per label before declaring the count unknowable. 500 open
 *  issues under one triage label is beyond what a count tile can help with —
 *  degrading to live:false is more honest than a silently-capped number. */
const MAX_PAGES_PER_LABEL = 5;

/**
 * Open issues (never PRs) carrying `label`, following pagination so the
 * count is exact — a single page silently caps at 100 and would present a
 * truncated figure as a live fact. Throws on any non-200/network failure.
 */
async function fetchLabelledIssues(label: string): Promise<GithubIssueRow[]> {
  const token = process.env.GITHUB_TOKEN;
  const all: GithubIssueRow[] = [];
  for (let page = 1; page <= MAX_PAGES_PER_LABEL; page++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO}/issues?state=open&labels=${encodeURIComponent(label)}&per_page=100&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github+json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        },
      );
      if (!res.ok) {
        throw new Error(`GitHub issues (${label}) responded ${res.status}`);
      }
      // Raw page length (PRs included) decides pagination; a page below 100
      // rows is the last one.
      const rows = (await res.json()) as GithubIssueRow[];
      all.push(...rows.filter((row) => row.pull_request === undefined));
      if (rows.length < 100) return all;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error(
    `GitHub issues (${label}) exceed ${MAX_PAGES_PER_LABEL * 100} — count unknowable, degrading`,
  );
}

/** Assemble the full payload from GitHub. Throws so a failure is never cached. */
async function loadTriageQueue(): Promise<TriageQueueData> {
  const fetchedAt = new Date().toISOString();
  const [needsTriage, needsInfo, readyForAgent, readyForHuman] =
    await Promise.all([
      fetchLabelledIssues("needs-triage"),
      fetchLabelledIssues("needs-info"),
      fetchLabelledIssues("ready-for-agent"),
      fetchLabelledIssues("ready-for-human"),
    ]);

  const byLabel: Array<[string, GithubIssueRow[]]> = [
    ["needs-triage", needsTriage],
    ["needs-info", needsInfo],
    ["ready-for-agent", readyForAgent],
    ["ready-for-human", readyForHuman],
  ];

  const topIssues: TriageIssue[] = byLabel
    .filter(([label]) => ACTIONABLE_LABELS.has(label))
    .flatMap(([label, rows]) =>
      rows.map((row) => ({
        number: row.number,
        title: row.title,
        label,
        url: row.html_url,
        updatedAt: row.updated_at,
      })),
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, TOP_ISSUES_LIMIT);

  return {
    counts: {
      needsTriage: needsTriage.length,
      needsInfo: needsInfo.length,
      readyForAgent: readyForAgent.length,
      readyForHuman: readyForHuman.length,
    },
    topIssues,
    openTotal:
      needsTriage.length +
      needsInfo.length +
      readyForAgent.length +
      readyForHuman.length,
    fetchedAt,
    live: true,
  };
}

export async function getTriageQueue(): Promise<TriageQueueData> {
  try {
    return await redisCached(CACHE_KEY, CACHE_TTL_SECONDS, loadTriageQueue);
  } catch (err) {
    // Loader throws on any partial failure, so a degraded payload is never
    // written to the cache — the next poll retries GitHub directly.
    _logger.warn("[githubTriage] fetch failed:", err);
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
}
