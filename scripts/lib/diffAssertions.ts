import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

export interface AddedAssertionSite {
  line: number;
  column: number;
  snippet: string;
}

export interface FileAssertionDiff {
  filePath: string;
  addedAssertions: number;
  sites: AddedAssertionSite[];
}

export interface DiffAssertionsResult {
  baseRef: string;
  mergeBase: string;
  filesScanned: number;
  regressedFiles: FileAssertionDiff[];
  totalAddedAssertions: number;
  passed: boolean;
}

export interface AssertionSite {
  startLine: number;
  endLine: number;
  column: number;
  text: string;
}

function scriptKindFor(fileName: string): ts.ScriptKind {
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (fileName.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (fileName.endsWith(".js") || fileName.endsWith(".mjs") || fileName.endsWith(".cjs")) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function isConstTypeReference(typeNode: ts.TypeNode): boolean {
  return (
    ts.isTypeReferenceNode(typeNode) &&
    ts.isIdentifier(typeNode.typeName) &&
    typeNode.typeName.escapedText === "const"
  );
}

/**
 * Determine a reasonable base git ref for diff comparisons.
 * Prefers explicitRef, then GITHUB_BASE_REF (in CI), then origin/master, master, origin/main, main.
 * Fails closed if no valid ref can be verified.
 */
export function resolveBaseRef(explicitRef?: string, repoRoot: string = process.cwd()): string {
  if (explicitRef) {
    try {
      execFileSync("git", ["rev-parse", "--verify", explicitRef], { cwd: repoRoot, stdio: "ignore" });
      return explicitRef;
    } catch {
      throw new Error(`Explicit base ref "${explicitRef}" cannot be resolved by git rev-parse.`);
    }
  }

  // CI base ref from GitHub Actions environment
  if (process.env.GITHUB_BASE_REF) {
    const prBase = `origin/${process.env.GITHUB_BASE_REF}`;
    try {
      execFileSync("git", ["rev-parse", "--verify", prBase], { cwd: repoRoot, stdio: "ignore" });
      return prBase;
    } catch {
      try {
        execFileSync("git", ["rev-parse", "--verify", process.env.GITHUB_BASE_REF], { cwd: repoRoot, stdio: "ignore" });
        return process.env.GITHUB_BASE_REF;
      } catch {
        // Fall through to standard branch checks
      }
    }
  }

  for (const candidate of ["origin/master", "master", "origin/main", "main"]) {
    try {
      execFileSync("git", ["rev-parse", "--verify", candidate], { cwd: repoRoot, stdio: "ignore" });
      return candidate;
    } catch {
      // Continue to next candidate
    }
  }

  throw new Error(
    "Could not resolve a default git base ref (tried origin/master, master, origin/main, main). Specify one with --base <ref>.",
  );
}

/**
 * Compute the merge-base between HEAD and the base ref.
 * Fails closed if git merge-base fails.
 */
export function resolveMergeBase(baseRef: string, repoRoot: string): string {
  try {
    const output = execFileSync("git", ["merge-base", "HEAD", baseRef], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const mergeBase = output.trim();
    if (!mergeBase) {
      throw new Error(`Empty merge-base returned for HEAD and ${baseRef}`);
    }
    return mergeBase;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to resolve git merge-base between HEAD and "${baseRef}": ${msg}`);
  }
}

/**
 * Parse added line numbers from a unified diff (-U0) output.
 * Lines are 1-indexed.
 */
export function parseAddedLinesFromDiff(diffOutput: string): Set<number> {
  const addedLines = new Set<number>();
  const hunkRegex = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

  for (const line of diffOutput.split("\n")) {
    const match = line.match(hunkRegex);
    if (!match) continue;

    const startLineStr = match[1];
    if (!startLineStr) continue;
    const startLine = parseInt(startLineStr, 10);
    const count = match[2] ? parseInt(match[2], 10) : 1;

    for (let i = 0; i < count; i++) {
      addedLines.add(startLine + i);
    }
  }

  return addedLines;
}

/**
 * Find all type assertion sites in a source file.
 * Excludes `as const` and `<const>` assertions.
 * For chained assertions like `(x as unknown as T)`, only the outermost site is recorded.
 */
export function findAssertionSitesInSource(code: string, fileName: string): AssertionSite[] {
  const sf = ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    scriptKindFor(fileName),
  );

  const sites: AssertionSite[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isAsExpression(node)) {
      if (!isConstTypeReference(node.type)) {
        const { parent } = node;
        const isInnerLink =
          parent !== undefined &&
          ts.isAsExpression(parent) &&
          parent.expression === node;

        if (!isInnerLink) {
          const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
          const end = sf.getLineAndCharacterOfPosition(node.getEnd());
          sites.push({
            startLine: start.line + 1,
            endLine: end.line + 1,
            column: start.character + 1,
            text: node.getText(sf).trim(),
          });
        }
      }
    } else if (ts.isTypeAssertionExpression(node)) {
      if (!isConstTypeReference(node.type)) {
        const { parent } = node;
        const isInnerLink =
          parent !== undefined &&
          ts.isTypeAssertionExpression(parent) &&
          parent.expression === node;

        if (!isInnerLink) {
          const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
          const end = sf.getLineAndCharacterOfPosition(node.getEnd());
          sites.push({
            startLine: start.line + 1,
            endLine: end.line + 1,
            column: start.character + 1,
            text: node.getText(sf).trim(),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
  return sites;
}

/**
 * Get the set of added line numbers for a changed file relative to mergeBase.
 * Returns null if the file did not exist at mergeBase (brand-new or untracked).
 */
export function getFileDiffAddedLines(
  mergeBase: string,
  relPath: string,
  repoRoot: string,
): Set<number> | null {
  const gitPath = relPath.split(path.sep).join("/");
  try {
    execFileSync("git", ["cat-file", "-e", `${mergeBase}:${gitPath}`], {
      cwd: repoRoot,
      stdio: "ignore",
    });
  } catch {
    // File did not exist at mergeBase
    return null;
  }

  try {
    const diffOutput = execFileSync(
      "git",
      ["diff", "-U0", mergeBase, "--", gitPath],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return parseAddedLinesFromDiff(diffOutput);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`git diff -U0 failed for file ${relPath}: ${msg}`);
  }
}

/**
 * Compare assertion sites in currentContent against added lines.
 * If addedLines is null, all assertion sites in the file are considered added.
 * If addedLines is a Set<number>, only assertion sites whose line range overlaps
 * an added line are flagged.
 */
export function checkFileAssertionDiff(
  filePath: string,
  addedLines: Set<number> | null,
  currentContent: string,
): FileAssertionDiff {
  const allSites = findAssertionSitesInSource(currentContent, filePath);
  const flaggedSites: AddedAssertionSite[] = [];

  for (const site of allSites) {
    let isAdded = false;
    if (addedLines === null) {
      isAdded = true;
    } else {
      for (let l = site.startLine; l <= site.endLine; l++) {
        if (addedLines.has(l)) {
          isAdded = true;
          break;
        }
      }
    }

    if (isAdded) {
      flaggedSites.push({
        line: site.startLine,
        column: site.column,
        snippet: site.text.length > 80 ? `${site.text.slice(0, 77)}...` : site.text,
      });
    }
  }

  return {
    filePath,
    addedAssertions: flaggedSites.length,
    sites: flaggedSites,
  };
}

/**
 * Query changed and untracked TypeScript/JavaScript files relative to a merge base.
 */
export function getChangedSourceFiles(
  mergeBase: string,
  targetDir: string,
  repoRoot: string,
): string[] {
  const tsJsRegex = /\.(ts|tsx|js|jsx)$/i;
  const relTargetDir = path.relative(repoRoot, targetDir).split(path.sep).join("/");

  let diffFiles: string[] = [];
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", mergeBase],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    diffFiles = output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`git diff --name-only failed against ${mergeBase}: ${msg}`);
  }

  let untrackedFiles: string[] = [];
  try {
    const output = execFileSync(
      "git",
      ["ls-files", "--others", "--exclude-standard"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    untrackedFiles = output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`git ls-files failed: ${msg}`);
  }

  const allFiles = Array.from(new Set([...diffFiles, ...untrackedFiles]));
  return allFiles.filter((relPath) => {
    const normalized = relPath.split(path.sep).join("/");
    if (relTargetDir && !normalized.startsWith(`${relTargetDir}/`) && normalized !== relTargetDir) {
      return false;
    }
    return tsJsRegex.test(relPath) && fs.existsSync(path.join(repoRoot, relPath));
  });
}

/**
 * Scan all changed files against a base ref (via merge-base) for newly introduced type assertions.
 */
export function scanDiffAssertions(
  targetDir: string,
  repoRoot: string,
  explicitBaseRef?: string,
): DiffAssertionsResult {
  const baseRef = resolveBaseRef(explicitBaseRef, repoRoot);
  const mergeBase = resolveMergeBase(baseRef, repoRoot);
  const changedFiles = getChangedSourceFiles(mergeBase, targetDir, repoRoot);

  const regressedFiles: FileAssertionDiff[] = [];
  let totalAddedAssertions = 0;

  for (const relPath of changedFiles) {
    const fullPath = path.join(repoRoot, relPath);
    const currentContent = fs.readFileSync(fullPath, "utf8");
    const addedLines = getFileDiffAddedLines(mergeBase, relPath, repoRoot);

    const diff = checkFileAssertionDiff(relPath, addedLines, currentContent);
    if (diff.addedAssertions > 0) {
      regressedFiles.push(diff);
      totalAddedAssertions += diff.addedAssertions;
    }
  }

  return {
    baseRef,
    mergeBase,
    filesScanned: changedFiles.length,
    regressedFiles,
    totalAddedAssertions,
    passed: regressedFiles.length === 0,
  };
}
