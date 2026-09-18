import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isDuplicateArtifactPath } from "./lintDebt";
import type * as TSType from "typescript";

const ts = require("typescript") as typeof TSType;

export const bareJsonCastsBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  production: z.number().int().nonnegative(),
  test: z.number().int().nonnegative(),
  byFile: z.record(z.string(), z.number().int().nonnegative()).optional(),
});

export type BareJsonCastsBaseline = z.infer<typeof bareJsonCastsBaselineSchema>;

export interface BareJsonCastSite {
  file: string;
  line: number;
  column: number;
  isTest: boolean;
  typeText: string;
}

export interface BareJsonCastsSummary {
  total: number;
  production: number;
  test: number;
  sites: BareJsonCastSite[];
  byFile: Record<string, number>;
}

export interface BareJsonCastsComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  productionIncreasedBy: number;
  regressedFiles: { file: string; current: number; baseline: number }[];
}

function unwrap(node: TSType.Expression): TSType.Expression {
  let curr = node;
  while (ts.isParenthesizedExpression(curr)) {
    curr = curr.expression;
  }
  return curr;
}

export function isBareJsonCast(node: TSType.Node): boolean {
  if (!ts.isAsExpression(node) && !ts.isTypeAssertionExpression(node)) {
    return false;
  }
  let expr = unwrap(node.expression);
  if (ts.isAwaitExpression(expr)) {
    expr = unwrap(expr.expression);
  }
  if (ts.isCallExpression(expr)) {
    const callee = unwrap(expr.expression);
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === "json") {
      return true;
    }
  }
  return false;
}

export function scanBareJsonCastsInSource(
  code: string,
  relPath: string,
  isTest: boolean,
): BareJsonCastSite[] {
  const sf = ts.createSourceFile(
    relPath,
    code,
    ts.ScriptTarget.Latest,
    true,
    relPath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const sites: BareJsonCastSite[] = [];

  function visit(node: TSType.Node): void {
    if (isBareJsonCast(node)) {
      const pos = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      let typeText = "unknown";
      if (ts.isAsExpression(node)) {
        typeText = node.type.getText(sf);
      } else if (ts.isTypeAssertionExpression(node)) {
        typeText = node.type.getText(sf);
      }
      sites.push({
        file: relPath,
        line: pos.line + 1,
        column: pos.character + 1,
        isTest,
        typeText,
      });
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return sites;
}

export function scanBareJsonCasts(
  targetDir: string,
  repoRoot: string,
): BareJsonCastsSummary {
  const sites: BareJsonCastSite[] = [];
  const byFile: Record<string, number> = {};
  let production = 0;
  let test = 0;

  function walk(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        /\.(ts|tsx)$/.test(entry.name) &&
        !isDuplicateArtifactPath(path.relative(targetDir, fullPath))
      ) {
        const relPath = path.relative(repoRoot, fullPath).split(path.sep).join("/");
        const isTest = /(\b__tests__\b|\.test\.|\.spec\.)/.test(relPath);
        const code = fs.readFileSync(fullPath, "utf8");
        const fileSites = scanBareJsonCastsInSource(code, relPath, isTest);
        if (fileSites.length > 0) {
          sites.push(...fileSites);
          byFile[relPath] = fileSites.length;
          if (isTest) test += fileSites.length;
          else production += fileSites.length;
        }
      }
    }
  }

  walk(targetDir);

  return {
    total: production + test,
    production,
    test,
    sites,
    byFile,
  };
}

export function compareBareJsonCasts(
  current: BareJsonCastsSummary,
  baseline: BareJsonCastsBaseline,
): BareJsonCastsComparison {
  const deltaTotal = current.total - baseline.total;
  const deltaProd = current.production - baseline.production;
  const regressedFiles: { file: string; current: number; baseline: number }[] = [];

  if (baseline.byFile) {
    for (const [file, count] of Object.entries(current.byFile)) {
      const baseCount = baseline.byFile[file] ?? 0;
      if (count > baseCount) {
        regressedFiles.push({ file, current: count, baseline: baseCount });
      }
    }
  }

  const exceedsBaseline = deltaTotal > 0 || deltaProd > 0 || regressedFiles.length > 0;

  return {
    exceedsBaseline,
    totalIncreasedBy: Math.max(0, deltaTotal),
    productionIncreasedBy: Math.max(0, deltaProd),
    regressedFiles,
  };
}

export function updateBareJsonCastsBaseline(
  current: BareJsonCastsSummary,
  baseline: BareJsonCastsBaseline,
): BareJsonCastsBaseline {
  const sortedByFile = Object.entries(current.byFile)
    .filter(([, count]) => count > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce<Record<string, number>>((acc, [file, count]) => {
      acc[file] = count;
      return acc;
    }, {});

  return {
    total: Math.min(baseline.total, current.total),
    production: Math.min(baseline.production, current.production),
    test: current.test,
    byFile: sortedByFile,
  };
}
