/**
 * @jest-environment node
 *
 * Source scan: a shared secret or authorization header must never be compared
 * with ===, !==, ==, or !=, and must never have its .length compared (leaking secret length).
 *
 * Those operators return as soon as the first byte differs or leaks secret length,
 * so response time / length leaks how much of a guess was right. Every inbound check
 * must go through `src/lib/hooks/secureCompare.ts` (`safeEqual` or `bearerMatches`).
 *
 * Modeled after ASOL's `test/security/secret-compare-scan.spec.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(__dirname, "../../../..");
const TS_ROOTS = ["src/app/api", "src/lib/hooks", "src/services"];
const SKIP_DIRS = new Set(["node_modules", ".next", "dist", ".worktrees", ".claude"]);
const OPT_OUT = /secret-compare-ok:/;

const SECRET_NAME = /secret|api_?key|password/i;
const AUTH_LOCALS = new Set([
  "expectedSecret",
  "expectedToken",
  "expectedHeader",
  "expectedKey",
  "providedSecret",
  "providedToken",
  "suppliedSecret",
  "suppliedToken",
  "bearer",
  "bearerToken",
  "authHeader",
  "authorization",
  "syncSecret",
  "internalSecret",
  "cronSecret",
]);

const EQUALITY = new Set([
  ts.SyntaxKind.EqualsEqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsEqualsToken,
  ts.SyntaxKind.EqualsEqualsToken,
  ts.SyntaxKind.ExclamationEqualsToken,
]);

function walk(rel: string, exts: string[]): string[] {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return exts.some((e) => abs.endsWith(e)) ? [abs] : [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    out.push(...walk(path.join(rel, entry.name), exts));
  }
  return out;
}

function isLiteralLike(node: ts.Expression): boolean {
  const n = ts.isParenthesizedExpression(node) ? node.expression : node;
  return (
    ts.isStringLiteral(n) ||
    ts.isNoSubstitutionTemplateLiteral(n) ||
    ts.isNumericLiteral(n) ||
    n.kind === ts.SyntaxKind.TrueKeyword ||
    n.kind === ts.SyntaxKind.FalseKeyword ||
    n.kind === ts.SyntaxKind.NullKeyword ||
    (ts.isIdentifier(n) && n.text === "undefined") ||
    ts.isTypeOfExpression(n) ||
    (ts.isPrefixUnaryExpression(n) && ts.isNumericLiteral(n.operand))
  );
}

function carriesSecret(node: ts.Expression): boolean {
  const n = ts.isParenthesizedExpression(node) ? node.expression : node;
  if (ts.isTemplateExpression(n) && /^Bearer\s/.test(n.head.text)) return true;
  if (ts.isIdentifier(n)) return SECRET_NAME.test(n.text) || AUTH_LOCALS.has(n.text);
  if (ts.isPropertyAccessExpression(n)) {
    // If it's `foo.length` where foo carries a secret or auth local, this flags length comparisons!
    if (n.name.text === "length") {
      return carriesSecret(n.expression);
    }
    return SECRET_NAME.test(n.name.text) || /process\.env\.\w*(SECRET|KEY)\b/.test(n.getText());
  }
  if (ts.isElementAccessExpression(n)) return SECRET_NAME.test(n.argumentExpression.getText());
  return false;
}

export function scanTypeScript(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const lines = source.split("\n");
  const hits: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isBinaryExpression(node) && EQUALITY.has(node.operatorToken.kind)) {
      const { left, right } = node;
      if (!isLiteralLike(left) && !isLiteralLike(right) && (carriesSecret(left) || carriesSecret(right))) {
        const line = sf.getLineAndCharacterOfPosition(node.getStart()).line;
        const lineContent = lines[line] ?? "";
        if (!OPT_OUT.test(lineContent)) {
          hits.push(`${path.relative(ROOT, file)}:${line + 1}: ${node.getText().slice(0, 120)}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sf);
  return hits;
}

describe("secret comparison security scan", () => {
  it("rejects plain equality and length checks on secrets in src/app/api, src/lib/hooks, src/services", () => {
    const files = TS_ROOTS.flatMap((r) => walk(r, [".ts", ".tsx"])).filter(
      (f) => !f.endsWith(".d.ts") && !f.includes("__tests__"),
    );
    expect(files.length).toBeGreaterThan(30);
    const hits = files.flatMap((f) => scanTypeScript(f, fs.readFileSync(f, "utf8")));
    expect(hits).toEqual([]);
  });

  it("detects when code attempts plain secret equality or length checks", () => {
    const vulnerableSnippet = `
      function check(authHeader: string, expectedSecret: string) {
        if (authHeader.length !== expectedSecret.length) return false;
        return authHeader === expectedSecret;
      }
    `;
    const hits = scanTypeScript("sample.ts", vulnerableSnippet);
    expect(hits.length).toBeGreaterThanOrEqual(2);
  });
});
