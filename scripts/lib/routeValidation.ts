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

  const handlerParams = new Set<string>();
  for (const stmt of sf.statements) {
    if (
      ts.isFunctionDeclaration(stmt) &&
      stmt.name &&
      /^(GET|POST|PUT|PATCH|DELETE)$/.test(stmt.name.text)
    ) {
      const firstParam = stmt.parameters[0];
      if (firstParam && ts.isIdentifier(firstParam.name)) {
        handlerParams.add(firstParam.name.text);
      }
    } else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          /^(GET|POST|PUT|PATCH|DELETE)$/.test(decl.name.text) &&
          decl.initializer
        ) {
          if (
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer)) &&
            decl.initializer.parameters.length > 0
          ) {
            const p = decl.initializer.parameters[0];
            if (p && ts.isIdentifier(p.name)) {
              handlerParams.add(p.name.text);
            }
          }
        }
      }
    }
  }

  // Fallback defaults for common Request parameter names
  handlerParams.add("request");
  handlerParams.add("req");
  handlerParams.add("r");

  let readsBody = false;
  let hasSafeParse = false;
  const bodyVars = new Set<string>();

  function containsBodyRead(node: TSType.Node): boolean {
    let found = false;
    function check(n: TSType.Node) {
      if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
        const prop = n.expression.name.text;
        if ((prop === "json" || prop === "formData") && n.arguments.length === 0) {
          if (
            ts.isIdentifier(n.expression.expression) &&
            handlerParams.has(n.expression.expression.text)
          ) {
            found = true;
          }
        }
      }
      if (!found) ts.forEachChild(n, check);
    }
    check(node);
    return found;
  }

  function visit(node: TSType.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isIdentifier(node.name)
    ) {
      if (containsBodyRead(node.initializer)) {
        readsBody = true;
        bodyVars.add(node.name.text);
      }
    } else if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isIdentifier(node.left)
    ) {
      if (containsBodyRead(node.right)) {
        readsBody = true;
        bodyVars.add(node.left.text);
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "safeParse"
    ) {
      if (node.arguments.some(containsBodyRead)) {
        readsBody = true;
        hasSafeParse = true;
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const prop = node.expression.name.text;
      if ((prop === "json" || prop === "formData") && node.arguments.length === 0) {
        if (
          ts.isIdentifier(node.expression.expression) &&
          handlerParams.has(node.expression.expression.text)
        ) {
          readsBody = true;
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);

  if (!readsBody) return { readsBody: false, hasSafeParse: false };
  if (hasSafeParse) return { readsBody: true, hasSafeParse: true };

  // Check if any bodyVars are referenced in a safeParse call
  function checkSafeParse(node: TSType.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "safeParse"
    ) {
      const arg0 = node.arguments[0];
      if (arg0) {
        let referencesBodyVar = false;
        function findVar(n: TSType.Node) {
          if (ts.isIdentifier(n) && bodyVars.has(n.text)) {
            referencesBodyVar = true;
          }
          if (!referencesBodyVar) ts.forEachChild(n, findVar);
        }
        findVar(arg0);
        if (referencesBodyVar) {
          hasSafeParse = true;
        }
      }
    }
    ts.forEachChild(node, checkSafeParse);
  }
  checkSafeParse(sf);

  return { readsBody: true, hasSafeParse };
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
