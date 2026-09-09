import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { z } from "zod";
import { isDuplicateArtifactPath } from "./lintDebt";
import type * as TSType from "typescript";

const ts = require("typescript") as typeof TSType;

export const routeValidationBaselineSchema = z.object({
  totalUnvalidated: z.number().int().nonnegative(),
  totalBodyReading: z.number().int().nonnegative(),
  allowlist: z.array(z.string()),
});

export type RouteValidationBaseline = z.infer<typeof routeValidationBaselineSchema>;

export interface RouteValidationSummary {
  totalRoutes: number;
  totalBodyReading: number;
  validated: string[];
  unvalidated: string[];
}

export interface RouteValidationComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  allowlistViolations: string[];
}

export function inspectRouteFileContent(
  content: string,
  filePath: string,
): { readsBody: boolean; hasSafeParse: boolean } {
  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  let readsBody = false;
  let hasSafeParse = false;

  function visit(node: TSType.Node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const prop = node.expression.name.text;
      if ((prop === "json" || prop === "formData") && node.arguments.length === 0) {
        if (ts.isIdentifier(node.expression.expression)) {
          const id = node.expression.expression.text;
          if (/^(request|req|r)$/i.test(id)) {
            readsBody = true;
          }
        }
      }
      if (prop === "safeParse") {
        hasSafeParse = true;
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return { readsBody, hasSafeParse };
}

export function scanRouteValidation(repoRoot: string): RouteValidationSummary {
  const pattern = "src/app/api/**/route.ts";
  const files = globSync(pattern, { cwd: repoRoot })
    .map((f) => f.replace(/\\/g, "/"))
    .filter((f) => !isDuplicateArtifactPath(f))
    .sort();

  const validated: string[] = [];
  const unvalidated: string[] = [];
  let totalBodyReading = 0;

  for (const relPath of files) {
    const fullPath = path.join(repoRoot, relPath);
    const content = fs.readFileSync(fullPath, "utf8");
    const { readsBody, hasSafeParse } = inspectRouteFileContent(content, relPath);

    if (readsBody) {
      totalBodyReading++;
      if (hasSafeParse) {
        validated.push(relPath);
      } else {
        unvalidated.push(relPath);
      }
    }
  }

  return {
    totalRoutes: files.length,
    totalBodyReading,
    validated,
    unvalidated,
  };
}

export function compareRouteValidation(
  summary: RouteValidationSummary,
  baseline: RouteValidationBaseline,
): RouteValidationComparison {
  const allowlistSet = new Set(baseline.allowlist);
  const allowlistViolations = summary.unvalidated.filter((file) => !allowlistSet.has(file));
  const totalIncreasedBy = Math.max(0, summary.unvalidated.length - baseline.totalUnvalidated);

  const exceedsBaseline = allowlistViolations.length > 0 || totalIncreasedBy > 0;

  return {
    exceedsBaseline,
    totalIncreasedBy,
    allowlistViolations,
  };
}

export function updateRouteValidationBaseline(
  summary: RouteValidationSummary,
  baseline: RouteValidationBaseline,
): RouteValidationBaseline {
  return {
    totalUnvalidated: Math.min(summary.unvalidated.length, baseline.totalUnvalidated),
    totalBodyReading: summary.totalBodyReading,
    allowlist: [...summary.unvalidated].sort(),
  };
}
