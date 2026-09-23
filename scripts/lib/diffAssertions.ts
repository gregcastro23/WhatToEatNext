import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { countAssertionSitesInSource, type AssertionSiteCounts } from "./lintDebt";

export interface FileAssertionDiff {
  filePath: string;
  baseCount: number;
  currentCount: number;
  addedAssertions: number;
}

export interface DiffAssertionsResult {
  baseRef: string;
  filesScanned: number;
  regressedFiles: FileAssertionDiff[];
  totalAddedAssertions: number;
  passed: boolean;
}

/**
 * Determine a reasonable base git ref for diff comparisons.
 * Prefers origin/master if available, then master, then HEAD.
 */
export function resolveBaseRef(explicitRef?: string): string {
  if (explicitRef) return explicitRef;

  // Try checking origin/master
  try {
    execFileSync("git", ["rev-parse", "--verify", "origin/master"], { stdio: "ignore" });
    return "origin/master";
  } catch {
    // try master
    try {
      execFileSync("git", ["rev-parse", "--verify", "master"], { stdio: "ignore" });
      return "master";
    } catch {
      return "HEAD";
    }
  }
}

/**
 * Get the content of a file at a specific git ref.
 * Returns null if the file did not exist at that ref.
 */
export function getFileAtRef(ref: string, relativePath: string, repoRoot: string): string | null {
  try {
    const gitPath = relativePath.split(path.sep).join("/");
    return execFileSync("git", ["show", `${ref}:${gitPath}`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/**
 * Query changed and untracked TypeScript/JavaScript files relative to a base ref.
 */
export function getChangedSourceFiles(
  baseRef: string,
  targetDir: string,
  repoRoot: string,
): string[] {
  const tsJsRegex = /\.(ts|tsx|js|jsx)$/i;
  const relTargetDir = path.relative(repoRoot, targetDir).split(path.sep).join("/");

  let diffFiles: string[] = [];
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", "--diff-filter=ACMR", baseRef],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    diffFiles = output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    diffFiles = [];
  }

  let untrackedFiles: string[] = [];
  try {
    const output = execFileSync(
      "git",
      ["ls-files", "--others", "--exclude-standard"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    untrackedFiles = output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    untrackedFiles = [];
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
 * Compare assertion counts on a single file between base and current content.
 */
export function checkFileAssertionDiff(
  filePath: string,
  baseContent: string | null,
  currentContent: string,
): FileAssertionDiff {
  const baseCounts: AssertionSiteCounts = baseContent !== null
    ? countAssertionSitesInSource(baseContent, filePath)
    : { total: 0, asAny: 0, chained: 0, single: 0, asConst: 0, nonNull: 0 };

  const currentCounts = countAssertionSitesInSource(currentContent, filePath);
  const delta = currentCounts.total - baseCounts.total;

  return {
    filePath,
    baseCount: baseCounts.total,
    currentCount: currentCounts.total,
    addedAssertions: Math.max(delta, 0),
  };
}

/**
 * Scan all changed files against a base ref for newly introduced type assertions.
 */
export function scanDiffAssertions(
  targetDir: string,
  repoRoot: string,
  explicitBaseRef?: string,
): DiffAssertionsResult {
  const baseRef = resolveBaseRef(explicitBaseRef);
  const changedFiles = getChangedSourceFiles(baseRef, targetDir, repoRoot);

  const regressedFiles: FileAssertionDiff[] = [];
  let totalAddedAssertions = 0;

  for (const relPath of changedFiles) {
    const fullPath = path.join(repoRoot, relPath);
    const currentContent = fs.readFileSync(fullPath, "utf8");
    const baseContent = getFileAtRef(baseRef, relPath, repoRoot);

    const diff = checkFileAssertionDiff(relPath, baseContent, currentContent);
    if (diff.addedAssertions > 0) {
      regressedFiles.push(diff);
      totalAddedAssertions += diff.addedAssertions;
    }
  }

  return {
    baseRef,
    filesScanned: changedFiles.length,
    regressedFiles,
    totalAddedAssertions,
    passed: regressedFiles.length === 0,
  };
}
