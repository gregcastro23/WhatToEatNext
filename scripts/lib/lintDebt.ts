import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const castsBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  asAny: z.number().int().nonnegative(),
  asUnknownAs: z.number().int().nonnegative(),
  production: z.number().int().nonnegative().optional(),
  test: z.number().int().nonnegative().optional(),
  untrackedSingleAsT: z.number().int().nonnegative().optional(),
});

export type CastsBaseline = z.infer<typeof castsBaselineSchema>;

export const lintDebtBaselineSchema = z.object({
  trackedTotal: z.number().int().nonnegative(),
  casts: castsBaselineSchema,
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

export interface CastsComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  asAnyIncreasedBy: number;
  asUnknownAsIncreasedBy: number;
  productionIncreasedBy: number;
}

export const compareCasts = (
  current: CastsBaseline,
  baseline: CastsBaseline,
): CastsComparison => {
  const deltaTotal = current.total - baseline.total;
  const deltaAsAny = current.asAny - baseline.asAny;
  const deltaAsUnknownAs = current.asUnknownAs - baseline.asUnknownAs;
  const deltaProduction =
    baseline.production !== undefined && current.production !== undefined
      ? current.production - baseline.production
      : 0;

  // Fail if overall total increased OR if asAny increased independently OR if production increased
  const exceedsBaseline = deltaTotal > 0 || deltaAsAny > 0 || deltaProduction > 0;

  return {
    exceedsBaseline,
    totalIncreasedBy: Math.max(deltaTotal, 0),
    asAnyIncreasedBy: Math.max(deltaAsAny, 0),
    asUnknownAsIncreasedBy: Math.max(deltaAsUnknownAs, 0),
    productionIncreasedBy: Math.max(deltaProduction, 0),
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

export interface FileCastDebt {
  filePath: string;
  total: number;
  asAny: number;
  asUnknownAs: number;
  untrackedSingleAsT: number;
  isTest: boolean;
}

export function stripComments(code: string): string {
  return code.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*)/g,
    (match) => (match.startsWith("/") ? "" : match),
  );
}

export function scanFileCasts(
  targetDir: string,
  repoRoot: string,
): {
  summary: CastsBaseline;
  files: FileCastDebt[];
} {
  const filePaths: string[] = [];

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|mts|cts|js|jsx)$/.test(entry.name)) {
        filePaths.push(fullPath);
      }
    }
  }

  walk(targetDir);

  let totalAsAny = 0;
  let totalAsUnknownAs = 0;
  let totalUntrackedSingleAsT = 0;
  let prodTotal = 0;
  let testTotal = 0;
  const files: FileCastDebt[] = [];

  for (const file of filePaths) {
    const rawContent = readFileSync(file, "utf8");
    const content = stripComments(rawContent);
    const anyMatches = content.match(/\bas\s+any\b/g);
    const unknownMatches = content.match(/\bas\s+unknown\s+as\b/g);
    const singleMatches = content.match(/\bas\s+(?!unknown\b|any\b)[A-Z]\w*\b/g);

    const asAny = anyMatches ? anyMatches.length : 0;
    const asUnknownAs = unknownMatches ? unknownMatches.length : 0;
    const untrackedSingleAsT = singleMatches ? singleMatches.length : 0;
    const total = asAny + asUnknownAs;

    totalAsAny += asAny;
    totalAsUnknownAs += asUnknownAs;
    totalUntrackedSingleAsT += untrackedSingleAsT;

    const isTest = /(\b__tests__\b|\.test\.|\.spec\.)/.test(file);
    if (isTest) {
      testTotal += total;
    } else {
      prodTotal += total;
    }

    if (total > 0 || untrackedSingleAsT > 0) {
      files.push({
        filePath: path.relative(repoRoot, file),
        total,
        asAny,
        asUnknownAs,
        untrackedSingleAsT,
        isTest,
      });
    }
  }

  files.sort((a, b) => b.total - a.total);

  return {
    summary: {
      total: totalAsAny + totalAsUnknownAs,
      asAny: totalAsAny,
      asUnknownAs: totalAsUnknownAs,
      production: prodTotal,
      test: testTotal,
      untrackedSingleAsT: totalUntrackedSingleAsT,
    },
    files,
  };
}

export function countTypeCasts(targetDir: string): CastsBaseline {
  return scanFileCasts(targetDir, targetDir).summary;
}

