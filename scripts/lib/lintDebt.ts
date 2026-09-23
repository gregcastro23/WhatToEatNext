import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";

export const castsBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  asAny: z.number().int().nonnegative(),
  asUnknownAs: z.number().int().nonnegative(),
  production: z.number().int().nonnegative(),
  test: z.number().int().nonnegative(),
});

export type CastsBaseline = z.infer<typeof castsBaselineSchema>;

export const assertionSitesBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  asAny: z.number().int().nonnegative(),
  chained: z.number().int().nonnegative(),
  single: z.number().int().nonnegative(),
  production: z.number().int().nonnegative(),
  test: z.number().int().nonnegative(),
  asConst: z.number().int().nonnegative(),
  nonNull: z.number().int().nonnegative(),
});

export type AssertionSitesBaseline = z.infer<typeof assertionSitesBaselineSchema>;

export const looseOptionalityBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  domain: z.number().int().nonnegative(),
  wire: z.number().int().nonnegative(),
  production: z.number().int().nonnegative(),
  test: z.number().int().nonnegative(),
  wireAllowlist: z.array(z.string()).optional().default([]),
});

export type LooseOptionalityBaseline = z.infer<typeof looseOptionalityBaselineSchema>;

export const preferNullishCoalescingSubBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  verifiedSafe: z.number().int().nonnegative().optional(),
  semantic: z.number().int().nonnegative().optional(),
  unclassified: z.number().int().nonnegative().optional(),
  note: z.string().optional(),
});

export type PreferNullishCoalescingSubBaseline = z.infer<
  typeof preferNullishCoalescingSubBaselineSchema
>;

export const subBaselinesSchema = z.object({
  preferNullishCoalescing: preferNullishCoalescingSubBaselineSchema.optional(),
});

export type SubBaselines = z.infer<typeof subBaselinesSchema>;

export const fileLevelDisablesBaselineSchema = z.object({
  ceiling: z.number().int().nonnegative(),
});

export type FileLevelDisablesBaseline = z.infer<typeof fileLevelDisablesBaselineSchema>;

export const lintDebtBaselineSchema = z.object({
  trackedTotal: z.number().int().nonnegative(),
  casts: castsBaselineSchema,
  assertionSites: assertionSitesBaselineSchema,
  looseOptionality: looseOptionalityBaselineSchema,
  fileLevelDisables: fileLevelDisablesBaselineSchema,
  suppressions: z.record(z.string(), z.number().int().nonnegative()),
  subBaselines: subBaselinesSchema.optional(),
  declined: z.object({
    total: z.number().int().nonnegative().optional(),
    rules: z.record(z.string(), z.number().int().nonnegative()),
    note: z.string().optional(),
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

export const compareSubBaseline = (
  currentCount: number,
  baselineCount: number,
): LintDebtComparison => {
  const delta = currentCount - baselineCount;

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
  ignoredRules: Set<string> = new Set(),
): RuleRegression[] => {
  const regressions: RuleRegression[] = [];

  for (const [rule, info] of Object.entries(baselineRules)) {
    if (ignoredRules.has(rule)) continue;
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
  isTest: boolean;
}

/**
 * Editor/sync duplicates — `foo 2.ts`, `bar 3.tsx`, `mechanics 2/page.tsx` —
 * are excluded by tsconfig (its "* 2.*" and "* 2/" exclude patterns) and by
 * .gitignore, so they are never compiled and never shipped. They still sit on
 * disk, and a scanner that walks the filesystem counts their casts, which makes
 * the debt numbers depend on local Finder/sync cruft rather than on the
 * repository. Skip them so the gate measures the same source everywhere.
 */
export function isDuplicateArtifactPath(relativePath: string): boolean {
  return relativePath
    .split(path.sep)
    .some((segment) => / \d+(\.[^.]+)*$/.test(segment));
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
      } else if (
        /\.(ts|tsx|mts|cts|js|jsx)$/.test(entry.name) &&
        !isDuplicateArtifactPath(path.relative(targetDir, fullPath))
      ) {
        filePaths.push(fullPath);
      }
    }
  }

  walk(targetDir);

  let totalAsAny = 0;
  let totalAsUnknownAs = 0;
  let prodTotal = 0;
  let testTotal = 0;
  const files: FileCastDebt[] = [];

  for (const file of filePaths) {
    const rawContent = readFileSync(file, "utf8");
    const content = stripComments(rawContent);
    const anyMatches = content.match(/\bas\s+any\b/g);
    const unknownMatches = content.match(/\bas\s+unknown\s+as\b/g);

    const asAny = anyMatches ? anyMatches.length : 0;
    const asUnknownAs = unknownMatches ? unknownMatches.length : 0;
    const total = asAny + asUnknownAs;

    totalAsAny += asAny;
    totalAsUnknownAs += asUnknownAs;

    const isTest = /(\b__tests__\b|\.test\.|\.spec\.)/.test(file);
    if (isTest) {
      testTotal += total;
    } else {
      prodTotal += total;
    }

    if (total > 0) {
      files.push({
        filePath: path.relative(repoRoot, file),
        total,
        asAny,
        asUnknownAs,
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
      } else if (
        /\.(ts|tsx|mts|cts|js|jsx)$/.test(entry.name) &&
        !isDuplicateArtifactPath(path.relative(targetDir, fullPath))
      ) {
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
  singleIncreasedBy: number;
  productionIncreasedBy: number;
  nonNullIncreasedBy: number;
}

export const compareAssertionSites = (
  current: AssertionSitesBaseline,
  baseline: AssertionSitesBaseline,
): AssertionSitesComparison => {
  const deltaTotal = (current.total ?? 0) - (baseline.total ?? 0);
  const deltaAsAny = (current.asAny ?? 0) - (baseline.asAny ?? 0);
  const deltaSingle = (current.single ?? 0) - (baseline.single ?? 0);
  const deltaProduction = (current.production ?? 0) - (baseline.production ?? 0);
  const deltaNonNull = (current.nonNull ?? 0) - (baseline.nonNull ?? 0);

  return {
    exceedsBaseline:
      deltaTotal > 0 ||
      deltaAsAny > 0 ||
      deltaSingle > 0 ||
      deltaProduction > 0 ||
      deltaNonNull > 0,
    totalIncreasedBy: Math.max(deltaTotal, 0),
    asAnyIncreasedBy: Math.max(deltaAsAny, 0),
    singleIncreasedBy: Math.max(deltaSingle, 0),
    productionIncreasedBy: Math.max(deltaProduction, 0),
    nonNullIncreasedBy: Math.max(deltaNonNull, 0),
  };
};

// ---------------------------------------------------------------------------
// Loose optionality (AST-based ?: T | undefined)
// ---------------------------------------------------------------------------

export interface FileLooseOptionalDebt {
  filePath: string;
  count: number;
  domainCount: number;
  wireCount: number;
  isTest: boolean;
}

function isOptionalAlias(typeNode: TSType.TypeNode): boolean {
  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName;
    if (ts.isIdentifier(typeName) && typeName.text === "Optional") {
      return true;
    }
  }
  return false;
}

export function countLooseOptionalityDetails(
  code: string,
  fileName: string,
  isWireFile = false,
): { total: number; domain: number; wire: number } {
  const sourceFile = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName),
  );
  let total = 0;
  let domain = 0;
  let wire = 0;

  function getEnclosingTypeName(node: TSType.Node): string | null {
    let curr: TSType.Node | undefined = node.parent;
    while (curr) {
      if (ts.isTypeAliasDeclaration(curr) || ts.isInterfaceDeclaration(curr)) {
        return curr.name.text;
      }
      curr = curr.parent;
    }
    return null;
  }

  const visit = (node: TSType.Node): void => {
    if (
      (ts.isPropertySignature(node) || ts.isPropertyDeclaration(node) || ts.isParameter(node)) &&
      node.questionToken &&
      node.type
    ) {
      const isUnionWithUndefined =
        ts.isUnionTypeNode(node.type) &&
        node.type.types.some(
          (t) => t.kind === ts.SyntaxKind.UndefinedKeyword || isOptionalAlias(t),
        );
      const isDirectOptionalAlias = isOptionalAlias(node.type);
      if (isUnionWithUndefined || isDirectOptionalAlias) {
        total += 1;
        if (isWireFile) {
          wire += 1;
        } else {
          const typeName = getEnclosingTypeName(node);
          if (typeName && (typeName.endsWith("Wire") || typeName.endsWith("WireSchema"))) {
            wire += 1;
          } else {
            domain += 1;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return { total, domain, wire };
}

export function countLooseOptionalityInSource(code: string, fileName: string): number {
  return countLooseOptionalityDetails(code, fileName, false).total;
}

export function scanLooseOptionality(
  targetDir: string,
  repoRoot: string,
  wireAllowlist: string[] = [],
): {
  summary: LooseOptionalityBaseline;
  files: FileLooseOptionalDebt[];
} {
  const filePaths: string[] = [];
  const allowlistSet = new Set(wireAllowlist.map((f) => f.split(path.sep).join("/")));

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        /\.(ts|tsx)$/.test(entry.name) &&
        !isDuplicateArtifactPath(path.relative(targetDir, fullPath)) &&
        !path.relative(targetDir, fullPath).startsWith("lib/spacetime/generated")
      ) {
        filePaths.push(fullPath);
      }
    }
  }

  walk(targetDir);

  let prodTotal = 0;
  let prodDomain = 0;
  let prodWire = 0;
  let testTotal = 0;
  let testDomain = 0;
  let testWire = 0;
  const files: FileLooseOptionalDebt[] = [];

  for (const file of filePaths) {
    const rawContent = readFileSync(file, "utf8");
    const rel = path.relative(repoRoot, file).split(path.sep).join("/");
    const isWireFile = allowlistSet.has(rel) || rel.startsWith("src/lib/validation/");
    const counts = countLooseOptionalityDetails(rawContent, file, isWireFile);
    const isTest = /(\b__tests__\b|\.test\.|\.spec\.)/.test(file);

    if (isTest) {
      testTotal += counts.total;
      testDomain += counts.domain;
      testWire += counts.wire;
    } else {
      prodTotal += counts.total;
      prodDomain += counts.domain;
      prodWire += counts.wire;
    }

    if (counts.total > 0) {
      files.push({
        filePath: rel,
        count: counts.total,
        domainCount: counts.domain,
        wireCount: counts.wire,
        isTest,
      });
    }
  }

  files.sort((a, b) => b.count - a.count);

  return {
    summary: {
      total: prodTotal + testTotal,
      domain: prodDomain + testDomain,
      wire: prodWire + testWire,
      production: prodTotal,
      test: testTotal,
      wireAllowlist,
    },
    files,
  };
}

export interface LooseOptionalityComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  domainIncreasedBy: number;
  wireIncreasedBy: number;
  productionIncreasedBy: number;
}

export const compareLooseOptionality = (
  current: LooseOptionalityBaseline,
  baseline: LooseOptionalityBaseline,
): LooseOptionalityComparison => {
  const deltaTotal = current.total - baseline.total;
  const deltaDomain = current.domain - baseline.domain;
  const deltaWire = current.wire - baseline.wire;
  const deltaProduction = current.production - baseline.production;

  return {
    exceedsBaseline:
      deltaTotal > 0 ||
      deltaDomain > 0 ||
      deltaWire > 0 ||
      deltaProduction > 0,
    totalIncreasedBy: Math.max(deltaTotal, 0),
    domainIncreasedBy: Math.max(deltaDomain, 0),
    wireIncreasedBy: Math.max(deltaWire, 0),
    productionIncreasedBy: Math.max(deltaProduction, 0),
  };
};

// ---------------------------------------------------------------------------
// File-level disables & Suppressions
// ---------------------------------------------------------------------------

export const ALLOWED_LOGGER_SINKS = new Set([
  "src/utils/logger.ts",
  "src/lib/logger.ts",
  "src/services/LoggingService.ts",
  "src/utils/clientLogger.ts",
]);

export interface FileLevelDisableFinding {
  filePath: string;
  directive: string;
  line: number;
  isNoConsole: boolean;
  hasReason: boolean;
}

export interface FileLevelDisablesScan {
  total: number;
  unauthorizedNoConsole: string[];
  findings: FileLevelDisableFinding[];
  files: string[];
}

export function findFileLevelDisablesInSource(
  rawContent: string,
  relPath: string,
): {
  findings: FileLevelDisableFinding[];
  unauthorizedNoConsole: string[];
} {
  const findings: FileLevelDisableFinding[] = [];
  const unauthorizedNoConsole: string[] = [];
  const regex = /\/\*\s*eslint-disable(?!-next-line|-line)([\s\S]*?)\*\//g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawContent)) !== null) {
    const beforeMatch = rawContent.slice(0, match.index);
    const lineNumber = beforeMatch.split("\n").length;
    const directiveBody = match[1]?.trim() ?? "";
    const isNoConsole = /\bno-console\b/.test(directiveBody);
    const hasReason = /--/.test(directiveBody);

    findings.push({
      filePath: relPath,
      directive: match[0],
      line: lineNumber,
      isNoConsole,
      hasReason,
    });

    if (isNoConsole && !ALLOWED_LOGGER_SINKS.has(relPath)) {
      unauthorizedNoConsole.push(`${relPath}:${lineNumber}`);
    }
  }

  return { findings, unauthorizedNoConsole };
}

export function scanFileLevelDisables(
  targetDir: string,
  repoRoot: string,
): FileLevelDisablesScan {
  const filePaths: string[] = [];

  function walk(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        /\.(ts|tsx|js|jsx|mts|cts)$/.test(entry.name) &&
        !isDuplicateArtifactPath(path.relative(targetDir, fullPath)) &&
        !path.relative(targetDir, fullPath).startsWith("lib/spacetime/generated")
      ) {
        filePaths.push(fullPath);
      }
    }
  }

  walk(targetDir);

  const findings: FileLevelDisableFinding[] = [];
  const unauthorizedNoConsole: string[] = [];
  const matchingFiles = new Set<string>();

  for (const file of filePaths) {
    const rawContent = readFileSync(file, "utf8");
    const relPath = path.relative(repoRoot, file);
    const fileResult = findFileLevelDisablesInSource(rawContent, relPath);

    if (fileResult.findings.length > 0) {
      findings.push(...fileResult.findings);
      matchingFiles.add(relPath);
    }
    if (fileResult.unauthorizedNoConsole.length > 0) {
      unauthorizedNoConsole.push(...fileResult.unauthorizedNoConsole);
    }
  }

  return {
    total: matchingFiles.size,
    unauthorizedNoConsole,
    findings,
    files: Array.from(matchingFiles).sort(),
  };
}

export interface SuppressionsComparison {
  exceedsBaseline: boolean;
  regressions: Array<{ rule: string; baselineCount: number; currentCount: number; delta: number }>;
}

export const compareSuppressions = (
  current: Record<string, number>,
  baseline: Record<string, number>,
): SuppressionsComparison => {
  const regressions: Array<{
    rule: string;
    baselineCount: number;
    currentCount: number;
    delta: number;
  }> = [];

  for (const [rule, currentCount] of Object.entries(current)) {
    const baselineCount = baseline[rule] ?? 0;
    if (currentCount > baselineCount) {
      regressions.push({
        rule,
        baselineCount,
        currentCount,
        delta: currentCount - baselineCount,
      });
    }
  }

  return {
    exceedsBaseline: regressions.length > 0,
    regressions: regressions.sort((a, b) => b.delta - a.delta),
  };
};

