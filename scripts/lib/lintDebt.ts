import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const castsBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  asAny: z.number().int().nonnegative(),
  asUnknownAs: z.number().int().nonnegative(),
});

export type CastsBaseline = z.infer<typeof castsBaselineSchema>;

export const lintDebtBaselineSchema = z.object({
  trackedTotal: z.number().int().nonnegative(),
  casts: castsBaselineSchema.optional(),
  declined: z.object({
    total: z.number().int().nonnegative().optional(),
    rules: z.record(z.string(), z.number().int().nonnegative()),
  }),
  rules: z.record(
    z.string(),
    z.object({
      count: z.number().int().nonnegative(),
      autoFixable: z.number().int().nonnegative(),
    }),
  ),
});

export type LintDebtBaseline = z.infer<typeof lintDebtBaselineSchema>;

export interface LintDebtComparison {
  exceedsBaseline: boolean;
  increasedBy: number;
}

export const compareLintDebt = (
  currentTotal: number,
  baselineTotal: number,
): LintDebtComparison => {
  const delta = currentTotal - baselineTotal;

  return {
    exceedsBaseline: delta > 0,
    increasedBy: Math.max(delta, 0),
  };
};

export const compareCasts = (
  current: CastsBaseline,
  baseline: CastsBaseline,
): LintDebtComparison => {
  const delta = current.total - baseline.total;

  return {
    exceedsBaseline: delta > 0,
    increasedBy: Math.max(delta, 0),
  };
};

export const compareDeclinedDebt = (
  currentDeclinedTotal: number,
  baselineDeclinedTotal: number,
): LintDebtComparison => {
  const delta = currentDeclinedTotal - baselineDeclinedTotal;

  return {
    exceedsBaseline: delta > 0,
    increasedBy: Math.max(delta, 0),
  };
};

export interface RuleRegression {
  rule: string;
  baselineCount: number;
  currentCount: number;
  delta: number;
}

export const findPerRuleRegressions = (
  currentCounts: Record<string, number>,
  baselineRules: Record<string, { count: number }>,
  declinedRules: Set<string>,
): RuleRegression[] => {
  const regressions: RuleRegression[] = [];

  for (const [rule, info] of Object.entries(baselineRules)) {
    if (declinedRules.has(rule)) continue;
    const current = currentCounts[rule] ?? 0;
    const baseline = info.count;
    if (current > baseline) {
      regressions.push({
        rule,
        baselineCount: baseline,
        currentCount: current,
        delta: current - baseline,
      });
    }
  }

  return regressions.sort((a, b) => b.delta - a.delta);
};

export function countTypeCasts(targetDir: string): CastsBaseline {
  const files: string[] = [];

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|mts|cts|js|jsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(targetDir);

  let asAny = 0;
  let asUnknownAs = 0;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const anyMatches = content.match(/\bas\s+any\b/g);
    if (anyMatches) asAny += anyMatches.length;
    const unknownMatches = content.match(/\bas\s+unknown\s+as\b/g);
    if (unknownMatches) asUnknownAs += unknownMatches.length;
  }

  return {
    total: asAny + asUnknownAs,
    asAny,
    asUnknownAs,
  };
}

