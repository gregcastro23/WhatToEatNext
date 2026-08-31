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

export const assertionSitesBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  asAny: z.number().int().nonnegative(),
  chained: z.number().int().nonnegative(),
  single: z.number().int().nonnegative(),
  production: z.number().int().nonnegative(),
  test: z.number().int().nonnegative(),
  asConst: z.number().int().nonnegative().optional(),
  nonNull: z.number().int().nonnegative().optional(),
});

export type AssertionSitesBaseline = z.infer<typeof assertionSitesBaselineSchema>;

export const lintDebtBaselineSchema = z.object({
  trackedTotal: z.number().int().nonnegative(),
  casts: castsBaselineSchema,
  assertionSites: assertionSitesBaselineSchema.optional(),
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


// ---------------------------------------------------------------------------
// Assertion sites (AST-based)
//
// The regex axes above cannot express Operating Rule 8 ("never silently
// disguise `as unknown as T` into `as T`"): rewriting a chained assertion into
// a single one drops `asUnknownAs` by 1 while the type system is overridden in
// exactly as many places as before. They are also structurally blind to any
// assertion whose target type does not start with an uppercase identifier —
// `as keyof typeof X`, `as { a: b }`, `as string[]`, bare `as unknown` — and
// they count `import * as React`, `export { default as Foo }` and the literal
// text `as any` inside a template string as if those were assertions.
//
// An assertion *site* is one place in the source where the type system is
// overridden. A chain (`x as unknown as T`) is one site, not two, so a relabel
// cannot move this number; only deleting an assertion can. `as const` is a
// literal-type narrowing rather than an override and is reported separately.
// ---------------------------------------------------------------------------

// `typescript` is loaded through `require` on purpose. `import` resolves to a
// different, unrelated copy under bun (its global install cache), and
// `createRequire(import.meta.url)` is a syntax error under ts-jest, which
// compiles this file to CJS. Bare `require` yields the repo's own TypeScript in
// both runtimes; the type-only import is erased and never resolves at runtime.
import type * as TSType from "typescript";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ts = require("typescript") as typeof TSType;

export interface AssertionSiteCounts {
  total: number;
  asAny: number;
  chained: number;
  single: number;
  asConst: number;
  nonNull: number;
}

export interface FileAssertionDebt extends AssertionSiteCounts {
  filePath: string;
  isTest: boolean;
}

const scriptKindFor = (fileName: string): TSType.ScriptKind => {
  if (/\.tsx$/.test(fileName)) return ts.ScriptKind.TSX;
  if (/\.jsx?$/.test(fileName)) return ts.ScriptKind.JSX;
  return ts.ScriptKind.TS;
};

const isConstAssertion = (node: TSType.AsExpression): boolean =>
  ts.isTypeReferenceNode(node.type) &&
  ts.isIdentifier(node.type.typeName) &&
  node.type.typeName.escapedText === "const";

/**
 * Count assertion sites in a single source text. Exported so the counting rules
 * can be unit-tested against literal snippets rather than the whole repo.
 */
export function countAssertionSitesInSource(
  code: string,
  fileName: string,
): AssertionSiteCounts {
  const sourceFile = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(fileName),
  );

  let asAny = 0;
  let chained = 0;
  let single = 0;
  let asConst = 0;
  let nonNull = 0;

  const visit = (node: TSType.Node): void => {
    if (ts.isAsExpression(node)) {
      if (isConstAssertion(node)) {
        asConst += 1;
      } else {
        const { parent } = node;
        // Only the outermost link of a chain is a site.
        const isInnerLinkOfChain =
          parent !== undefined &&
          ts.isAsExpression(parent) &&
          parent.expression === node;

        if (!isInnerLinkOfChain) {
          const inner = node.expression;
          const viaUnknown =
            ts.isAsExpression(inner) &&
            inner.type.kind === ts.SyntaxKind.UnknownKeyword;

          if (node.type.kind === ts.SyntaxKind.AnyKeyword) {
            asAny += 1;
          } else if (viaUnknown) {
            chained += 1;
          } else {
            single += 1;
          }
        }
      }
    } else if (ts.isNonNullExpression(node)) {
      nonNull += 1;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return { total: asAny + chained + single, asAny, chained, single, asConst, nonNull };
}

export function scanAssertionSites(
  targetDir: string,
  repoRoot: string,
): {
  summary: AssertionSiteCounts & { production: number; test: number };
  files: FileAssertionDebt[];
} {
  const filePaths: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(ts|tsx|mts|cts|js|jsx)$/.test(entry.name)) {
        filePaths.push(fullPath);
      }
    }
  }

  walk(targetDir);

  const summary = {
    total: 0,
    asAny: 0,
    chained: 0,
    single: 0,
    asConst: 0,
    nonNull: 0,
    production: 0,
    test: 0,
  };
  const files: FileAssertionDebt[] = [];

  for (const file of filePaths) {
    const counts = countAssertionSitesInSource(readFileSync(file, "utf8"), file);
    const isTest = /(\b__tests__\b|\.test\.|\.spec\.)/.test(file);

    summary.total += counts.total;
    summary.asAny += counts.asAny;
    summary.chained += counts.chained;
    summary.single += counts.single;
    summary.asConst += counts.asConst;
    summary.nonNull += counts.nonNull;
    if (isTest) summary.test += counts.total;
    else summary.production += counts.total;

    if (counts.total > 0) {
      files.push({ filePath: path.relative(repoRoot, file), isTest, ...counts });
    }
  }

  files.sort((a, b) => b.total - a.total);

  return { summary, files };
}

export interface AssertionSitesComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  asAnyIncreasedBy: number;
  productionIncreasedBy: number;
}

export const compareAssertionSites = (
  current: AssertionSitesBaseline,
  baseline: AssertionSitesBaseline,
): AssertionSitesComparison => {
  const deltaTotal = current.total - baseline.total;
  const deltaAsAny = current.asAny - baseline.asAny;
  const deltaProduction = current.production - baseline.production;

  return {
    exceedsBaseline: deltaTotal > 0 || deltaAsAny > 0 || deltaProduction > 0,
    totalIncreasedBy: Math.max(deltaTotal, 0),
    asAnyIncreasedBy: Math.max(deltaAsAny, 0),
    productionIncreasedBy: Math.max(deltaProduction, 0),
  };
};
