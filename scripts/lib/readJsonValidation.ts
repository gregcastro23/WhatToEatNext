import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { z } from "zod";
import { isDuplicateArtifactPath } from "./lintDebt";
import type * as TSType from "typescript";

const ts = require("typescript") as typeof TSType;

export const readJsonSiteSchema = z.object({
  file: z.string(),
  line: z.number().int().positive(),
  column: z.number().int().positive(),
  helper: z.enum(["readJson", "safeReadJson", "fetchJson"]),
});

export type ReadJsonSite = z.infer<typeof readJsonSiteSchema>;

export const readJsonBaselineSchema = z.object({
  totalUnvalidated: z.number().int().nonnegative(),
  totalCalls: z.number().int().nonnegative(),
  allowlist: z.array(readJsonSiteSchema),
});

export type ReadJsonBaseline = z.infer<typeof readJsonBaselineSchema>;

export interface ReadJsonCallSite {
  file: string;
  line: number;
  column: number;
  helper: "readJson" | "safeReadJson" | "fetchJson";
  isValidated: boolean;
}

export interface ReadJsonValidationSummary {
  totalFilesScanned: number;
  totalCalls: number;
  validatedSites: ReadJsonCallSite[];
  unvalidatedSites: ReadJsonCallSite[];
}

export interface ReadJsonComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  allowlistViolations: ReadJsonCallSite[];
}

/**
 * Inspect source content for import-aware calls to readJson/safeReadJson/fetchJson.
 */
export function inspectReadJsonContent(
  content: string,
  filePath: string,
): ReadJsonCallSite[] {
  // Fast skip if helper names don't even appear in text
  if (
    !content.includes("readJson") &&
    !content.includes("safeReadJson") &&
    !content.includes("fetchJson")
  ) {
    return [];
  }

  const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const trackedImports = new Map<
    string,
    "readJson" | "safeReadJson" | "fetchJson"
  >();

  // 1. Scan import declarations targeting @/lib/api/json or relative path to lib/api/json
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const mod = stmt.moduleSpecifier.text;
      if (mod === "@/lib/api/json" || mod.endsWith("/lib/api/json") || mod === "./json" || mod === "../json" || mod === "../../lib/api/json") {
        if (stmt.importClause?.namedBindings && ts.isNamedImports(stmt.importClause.namedBindings)) {
          for (const element of stmt.importClause.namedBindings.elements) {
            const importedName = element.propertyName ? element.propertyName.text : element.name.text;
            const localName = element.name.text;
            if (
              importedName === "readJson" ||
              importedName === "safeReadJson" ||
              importedName === "fetchJson"
            ) {
              trackedImports.set(localName, importedName);
            }
          }
        }
      }
    }
  }

  if (trackedImports.size === 0) {
    return [];
  }

  const callSites: ReadJsonCallSite[] = [];

  function isNonEmptyParseValue(node: TSType.Node): boolean {
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return false;
    if (ts.isIdentifier(node) && node.text === "undefined") return false;
    return true;
  }

  function hasValidParseOption(optNode?: TSType.Expression): boolean {
    if (!optNode) return false;
    // Direct function: (val) => ..., function(val) ..., or identifier: parse
    if (
      ts.isArrowFunction(optNode) ||
      ts.isFunctionExpression(optNode) ||
      ts.isIdentifier(optNode) ||
      ts.isPropertyAccessExpression(optNode)
    ) {
      return isNonEmptyParseValue(optNode);
    }
    // Object literal with parse property: { parse: ... }
    if (ts.isObjectLiteralExpression(optNode)) {
      for (const prop of optNode.properties) {
        if (ts.isPropertyAssignment(prop)) {
          const propName = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : "";
          if (propName === "parse") {
            return isNonEmptyParseValue(prop.initializer);
          }
        } else if (ts.isShorthandPropertyAssignment(prop)) {
          if (prop.name.text === "parse") {
            return true;
          }
        }
      }
    }
    return false;
  }

  function visit(node: TSType.Node) {
    if (ts.isCallExpression(node)) {
      let localIdentifier = "";
      if (ts.isIdentifier(node.expression)) {
        localIdentifier = node.expression.text;
      }

      if (localIdentifier && trackedImports.has(localIdentifier)) {
        const canonicalHelper = trackedImports.get(localIdentifier)!;
        const optArgIndex = canonicalHelper === "readJson" ? 1 : 2;
        const optArg = node.arguments[optArgIndex];
        const isValidated = hasValidParseOption(optArg);

        const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart());
        callSites.push({
          file: filePath,
          line: line + 1,
          column: character + 1,
          helper: canonicalHelper,
          isValidated,
        });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return callSites;
}

export function scanReadJsonValidation(repoRoot: string): ReadJsonValidationSummary {
  const pattern = "src/**/*.{ts,tsx}";
  const files = globSync(pattern, {
    cwd: repoRoot,
    ignore: ["**/__tests__/**", "**/*.test.ts", "**/*.test.tsx", "**/__mocks__/**"],
  })
    .map((f) => f.replace(/\\/g, "/"))
    .filter((f) => !isDuplicateArtifactPath(f))
    .sort();

  const validatedSites: ReadJsonCallSite[] = [];
  const unvalidatedSites: ReadJsonCallSite[] = [];

  for (const file of files) {
    const fullPath = path.resolve(repoRoot, file);
    const content = fs.readFileSync(fullPath, "utf8");
    const sites = inspectReadJsonContent(content, file);
    for (const site of sites) {
      if (site.isValidated) {
        validatedSites.push(site);
      } else {
        unvalidatedSites.push(site);
      }
    }
  }

  return {
    totalFilesScanned: files.length,
    totalCalls: validatedSites.length + unvalidatedSites.length,
    validatedSites,
    unvalidatedSites,
  };
}

export function compareReadJsonValidation(
  summary: ReadJsonValidationSummary,
  baseline: ReadJsonBaseline,
): ReadJsonComparison {
  const allowlistKeys = new Set(
    baseline.allowlist.map((s) => `${s.file}:${s.line}:${s.column}`),
  );

  const allowlistViolations = summary.unvalidatedSites.filter(
    (s) => !allowlistKeys.has(`${s.file}:${s.line}:${s.column}`),
  );

  const totalIncreasedBy = Math.max(
    0,
    summary.unvalidatedSites.length - baseline.totalUnvalidated,
  );

  return {
    exceedsBaseline:
      allowlistViolations.length > 0 || totalIncreasedBy > 0,
    totalIncreasedBy,
    allowlistViolations,
  };
}

export function updateReadJsonBaseline(
  summary: ReadJsonValidationSummary,
  baseline: ReadJsonBaseline,
): ReadJsonBaseline {
  const currentUnvalidated = summary.unvalidatedSites.length;
  if (currentUnvalidated > baseline.totalUnvalidated) {
    return baseline;
  }

  const sortedAllowlist: ReadJsonSite[] = summary.unvalidatedSites
    .map((s) => ({
      file: s.file,
      line: s.line,
      column: s.column,
      helper: s.helper,
    }))
    .sort((a, b) => {
      if (a.file !== b.file) return a.file.localeCompare(b.file);
      if (a.line !== b.line) return a.line - b.line;
      return a.column - b.column;
    });

  return {
    totalUnvalidated: currentUnvalidated,
    totalCalls: summary.totalCalls,
    allowlist: sortedAllowlist,
  };
}
