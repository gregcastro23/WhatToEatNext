/**
 * The committed ratchet baselines — bundled for the deployed commit, and
 * read from GitHub for every past commit that changed them. Server-only.
 *
 * `lint:debt:ratchet` pins .lint-debt-baseline.json to the live measurement
 * ("no headroom"), and the verify gate fails if the tree exceeds it, so for
 * the commit that is deployed these ceilings ARE the measurement. The file's
 * git history is therefore the TypeScript campaign's trend line.
 *
 * @file src/services/admin/codeHealthRatchets.ts
 */

import { z } from "zod";
import {
  commitTitle,
  GithubCommitSchema,
  githubGet,
  githubRawFile,
  WTEN_REPO,
  type SourceState,
} from "@/services/admin/githubClient";
import bareJsonBaselineRaw from "../../../.bare-json-casts-baseline.json";
import lintDebtBaselineRaw from "../../../.lint-debt-baseline.json";
import routeValidationBaselineRaw from "../../../.route-validation-baseline.json";
import scriptsTypecheckBaselineRaw from "../../../.scripts-typecheck-baseline.json";

/** Lenient: older commits' baselines lack newer sections. */
const LintDebtBaselineSchema = z.object({
  trackedTotal: z.number().optional(),
  casts: z.object({ total: z.number(), asAny: z.number(), asUnknownAs: z.number() }).optional(),
  assertionSites: z.object({ total: z.number(), nonNull: z.number().optional() }).optional(),
  looseOptionality: z.object({ total: z.number() }).optional(),
  declined: z.object({ total: z.number(), rules: z.record(z.string(), z.number()).optional() }).optional(),
  suppressions: z.record(z.string(), z.number()).optional(),
  subBaselines: z.object({ preferNullishCoalescing: z.object({ total: z.number() }).optional() }).optional(),
  rules: z.record(z.string(), z.object({ count: z.number() })).optional(),
});

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

function ranked(entries: Array<[string, number]>): Array<{ rule: string; count: number }> {
  return entries
    .map(([rule, count]) => ({ rule, count }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

function castFields(b: LintDebtBaseline): Pick<RatchetSummary, "castsTotal" | "asAny" | "asUnknownAs"> {
  return {
    castsTotal: b.casts?.total ?? null,
    asAny: b.casts?.asAny ?? null,
    asUnknownAs: b.casts?.asUnknownAs ?? null,
  };
}

function poolFields(
  b: LintDebtBaseline,
): Pick<RatchetSummary, "looseOptionality" | "declinedPool" | "preferNullishCoalescing" | "suppressions"> {
  return {
    looseOptionality: b.looseOptionality?.total ?? null,
    declinedPool: b.declined?.total ?? null,
    preferNullishCoalescing: b.subBaselines?.preferNullishCoalescing?.total ?? null,
    suppressions: b.suppressions ? Object.values(b.suppressions).reduce((sum, n) => sum + n, 0) : null,
  };
}

export function summarizeLintDebt(b: LintDebtBaseline): RatchetSummary {
  return {
    trackedTotal: b.trackedTotal ?? null,
    ...castFields(b),
    assertionSites: b.assertionSites?.total ?? null,
    nonNullAssertions: b.assertionSites?.nonNull ?? null,
    ...poolFields(b),
    topRules: ranked(Object.entries(b.rules ?? {}).map(([rule, v]) => [rule, v.count])).slice(0, 12),
    declinedRules: ranked(Object.entries(b.declined?.rules ?? {})),
  };
}

const CountBaselineSchema = z.object({ total: z.number(), production: z.number().optional() });
const RouteValidationBaselineSchema = z.object({ totalUnvalidated: z.number(), totalBodyReading: z.number() });

export interface BundledRatchets {
  basis: string;
  lintDebt: RatchetSummary | null;
  bareJsonCasts: { total: number; production: number | null } | null;
  scriptsTypecheckErrors: number | null;
  routeValidation: { unvalidated: number; bodyReadingRoutes: number } | null;
}

export function bundledRatchets(): BundledRatchets {
  const lint = LintDebtBaselineSchema.safeParse(lintDebtBaselineRaw);
  const bare = CountBaselineSchema.safeParse(bareJsonBaselineRaw);
  const scripts = CountBaselineSchema.safeParse(scriptsTypecheckBaselineRaw);
  const routes = RouteValidationBaselineSchema.safeParse(routeValidationBaselineRaw);
  return {
    basis: "committed ratchet baselines, bundled at build of the deployed commit",
    lintDebt: lint.success ? summarizeLintDebt(lint.data) : null,
    bareJsonCasts: bare.success ? { total: bare.data.total, production: bare.data.production ?? null } : null,
    scriptsTypecheckErrors: scripts.success ? scripts.data.total : null,
    routeValidation: routes.success
      ? { unvalidated: routes.data.totalUnvalidated, bodyReadingRoutes: routes.data.totalBodyReading }
      : null,
  };
}

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

export interface RatchetHistory {
  state: SourceState;
  points: RatchetPoint[];
}

type Commit = z.infer<typeof GithubCommitSchema>;

function parseBaseline(text: string): LintDebtBaseline | null {
  try {
    const parsed = LintDebtBaselineSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function pointForCommit(c: Commit): Promise<RatchetPoint | null> {
  // A commit SHA is immutable: cache its file for a day.
  const raw = await githubRawFile(WTEN_REPO, c.sha, ".lint-debt-baseline.json", 24 * 3_600_000);
  const baseline = raw.ok ? parseBaseline(raw.data) : null;
  if (!baseline) return null;
  const s = summarizeLintDebt(baseline);
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
}

export async function ratchetHistory(): Promise<RatchetHistory> {
  const commits = await githubGet(
    `/repos/${WTEN_REPO}/commits?sha=master&path=.lint-debt-baseline.json&per_page=40`,
    z.array(GithubCommitSchema),
    15 * 60_000,
  );
  if (!commits.ok) return { state: { status: commits.reason, detail: commits.detail }, points: [] };
  const points = await Promise.all(commits.data.map(pointForCommit));
  return {
    state: { status: "live" },
    points: points.filter((p): p is RatchetPoint => p !== null).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
