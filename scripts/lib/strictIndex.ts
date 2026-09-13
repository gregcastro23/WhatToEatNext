import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isDuplicateArtifactPath } from "./lintDebt";

import type * as TSType from "typescript";

const ts = require("typescript") as typeof TSType;

export const strictIndexBaselineSchema = z.object({
  total: z.number().int().nonnegative(),
  files: z.number().int().nonnegative(),
  allowlist: z.array(z.string()),
});

export type StrictIndexBaseline = z.infer<typeof strictIndexBaselineSchema>;

export interface StrictIndexDiagnostic {
  filePath: string;
  line: number;
  character: number;
  code: number;
  message: string;
}

export interface StrictIndexSummary {
  total: number;
  files: number;
  byFile: Record<string, StrictIndexDiagnostic[]>;
  /**
   * Source files the program actually loaded. At zero errors this is the only
   * thing separating "the repo is clean" from "the scanner compiled nothing",
   * which otherwise both report total: 0.
   */
  filesScanned: number;
}

export interface StrictIndexComparison {
  exceedsBaseline: boolean;
  totalIncreasedBy: number;
  allowlistViolations: string[];
}

/**
 * Parse a single tsc diagnostic line from text output.
 * Adheres to Rule 11:
 * 1. Handles Next.js route groups containing parens (e.g., `src/app/(alchm)/...`)
 *    by extracting the file path before the line/char tuple preceding `: error TS`.
 * 2. Returns null for continuation lines of multi-line compiler messages.
 */
export function parseTscDiagnosticLine(
  line: string,
): StrictIndexDiagnostic | null {
  const match = line.match(
    /^(.+)\(([0-9]+),([0-9]+)\):\s+error\s+TS([0-9]+):\s+(.+)$/,
  );
  if (!match || !match[1] || !match[2] || !match[3] || !match[4] || !match[5]) {
    return null;
  }
  return {
    filePath: match[1].trim(),
    line: Number.parseInt(match[2], 10),
    character: Number.parseInt(match[3], 10),
    code: Number.parseInt(match[4], 10),
    message: match[5].trim(),
  };
}

/**
 * Count diagnostics from raw tsc text output.
 * Ignores multi-line continuations and counts real error header lines.
 */
export function countDiagnosticsFromText(
  text: string,
): { total: number; files: number; byFile: Record<string, StrictIndexDiagnostic[]> } {
  const lines = text.split(/\r?\n/);
  const byFile: Record<string, StrictIndexDiagnostic[]> = {};
  let total = 0;

  for (const line of lines) {
    const diag = parseTscDiagnosticLine(line);
    if (!diag) continue;
    if (!byFile[diag.filePath]) {
      byFile[diag.filePath] = [];
    }
    byFile[diag.filePath].push(diag);
    total += 1;
  }

  return {
    total,
    files: Object.keys(byFile).length,
    byFile,
  };
}

export type StrictIndexTargetResolution =
  | { valid: true; absPath: string; relPath: string }
  | { valid: false; error: string };

/**
 * Resolve and validate a file target path for strict-index inspection.
 * Handles missing arguments, relative paths, absolute paths, and unknown/missing files.
 */
export function resolveStrictIndexTarget(
  repoRoot: string,
  rawTarget: string | undefined,
): StrictIndexTargetResolution {
  if (!rawTarget || rawTarget.trim() === "" || rawTarget.startsWith("-")) {
    return { valid: false, error: "--file requires a file path argument." };
  }
  const absPath = path.isAbsolute(rawTarget)
    ? path.resolve(rawTarget)
    : path.resolve(repoRoot, rawTarget);
  const relPath = path.relative(repoRoot, absPath).split(path.sep).join("/");

  if (relPath.startsWith("..") || path.isAbsolute(relPath)) {
    return { valid: false, error: `Target file is outside repository: ${rawTarget}` };
  }

  if (!fs.existsSync(absPath)) {
    return { valid: false, error: `Target file does not exist: ${rawTarget}` };
  }

  try {
    const stat = fs.statSync(absPath);
    if (!stat.isFile()) {
      return { valid: false, error: `Target path is not a file: ${rawTarget}` };
    }
  } catch {
    return { valid: false, error: `Cannot read target path: ${rawTarget}` };
  }

  return { valid: true, absPath, relPath };
}

/**
 * Drive TypeScript Compiler API directly with noUncheckedIndexedAccess: true override.
 * When targetFile is specified, compiles and inspects only that file and its dependency graph.
 */
export function runStrictIndexCheck(
  repoRoot: string,
  configFileName: string = "tsconfig.strict-index.json",
  targetFile?: string,
): StrictIndexSummary {
  const configPath = path.resolve(repoRoot, configFileName);
  const readResult = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readResult.error) {
    const message = ts.formatDiagnostic(readResult.error, {
      getCanonicalFileName: (f) => f,
      getCurrentDirectory: () => repoRoot,
      getNewLine: () => "\n",
    });
    throw new Error(`Failed to read ${configPath}: ${message}`);
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    path.dirname(configPath),
  );

  const compilerOptions: TSType.CompilerOptions = {
    ...parsedConfig.options,
    noUncheckedIndexedAccess: true,
    noEmit: true,
    incremental: false,
  };

  let rootNames = parsedConfig.fileNames;
  let targetAbsPath: string | undefined;

  if (targetFile) {
    targetAbsPath = path.isAbsolute(targetFile)
      ? path.resolve(targetFile)
      : path.resolve(repoRoot, targetFile);
    if (!fs.existsSync(targetAbsPath)) {
      throw new Error(`Target file does not exist: ${targetFile}`);
    }
    rootNames = [targetAbsPath];
  }

  const program = ts.createProgram({
    rootNames,
    options: compilerOptions,
    projectReferences: parsedConfig.projectReferences,
  });

  let diagnostics: readonly TSType.Diagnostic[];
  let filesScanned: number;

  if (targetAbsPath) {
    const sourceFile = program.getSourceFile(targetAbsPath);
    diagnostics = sourceFile ? ts.getPreEmitDiagnostics(program, sourceFile) : [];
    filesScanned = sourceFile && !sourceFile.isDeclarationFile ? 1 : 0;
  } else {
    diagnostics = ts.getPreEmitDiagnostics(program);
    filesScanned = program
      .getSourceFiles()
      .filter((f) => !f.isDeclarationFile).length;
  }

  const byFile: Record<string, StrictIndexDiagnostic[]> = {};
  let total = 0;

  if (targetAbsPath) {
    const relTarget = path
      .relative(repoRoot, targetAbsPath)
      .split(path.sep)
      .join("/");
    byFile[relTarget] = [];
  }

  for (const diag of diagnostics) {
    if (!diag.file || diag.file.isDeclarationFile) continue;

    const relPath = path
      .relative(repoRoot, diag.file.fileName)
      .split(path.sep)
      .join("/");

    if (isDuplicateArtifactPath(relPath)) continue;

    let line = 0;
    let character = 0;
    if (diag.start !== undefined) {
      const pos = diag.file.getLineAndCharacterOfPosition(diag.start);
      line = pos.line + 1;
      character = pos.character + 1;
    }

    const message = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
    const item: StrictIndexDiagnostic = {
      filePath: relPath,
      line,
      character,
      code: diag.code,
      message,
    };

    if (!byFile[relPath]) {
      byFile[relPath] = [];
    }
    byFile[relPath].push(item);
    total += 1;
  }

  return {
    total,
    files: Object.keys(byFile).length,
    byFile,
    filesScanned,
  };
}

/**
 * Compare current summary against baseline.
 * Hard gate: Fails if any allowlisted file has errors.
 * Ratchet: Fails if total errors increase.
 */
export function compareStrictIndex(
  current: { total: number; files: number; byFile?: Record<string, StrictIndexDiagnostic[]> },
  baseline: StrictIndexBaseline,
): StrictIndexComparison {
  const allowlistViolations: string[] = [];
  const currentByFile = current.byFile ?? {};

  for (const file of baseline.allowlist) {
    const fileDiags = currentByFile[file];
    if (fileDiags && fileDiags.length > 0) {
      allowlistViolations.push(file);
    }
  }

  const delta = current.total - baseline.total;
  return {
    exceedsBaseline: delta > 0 || allowlistViolations.length > 0,
    totalIncreasedBy: Math.max(0, delta),
    allowlistViolations,
  };
}

/**
 * Update baseline if total errors dropped or allowlist evolved.
 */
export function updateStrictIndexBaseline(
  current: StrictIndexSummary,
  baseline: StrictIndexBaseline,
): StrictIndexBaseline {
  return {
    total: Math.min(baseline.total, current.total),
    files: current.files,
    allowlist: [...baseline.allowlist].sort(),
  };
}
