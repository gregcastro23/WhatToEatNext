import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.scripts-typecheck-baseline.json", import.meta.url);

interface ScriptTypecheckBaseline {
  total: number;
  files: number;
  note?: string;
  byFile?: Record<string, number>;
}

function fail(msg: string): never {
  console.error(`\n❌ SCRIPT TYPECHECK FAILED: ${msg}`);
  process.exit(1);
}

const baselineRaw = await readFile(baselinePath, "utf8");
const baseline: ScriptTypecheckBaseline = JSON.parse(baselineRaw);

console.log("Running scripts/** typecheck check against scripts/tsconfig.json...");

let tscStdout = "";
let tscStderr = "";
let exitCode = 0;

try {
  const result = await execFileAsync(
    "bunx",
    ["tsc", "--noEmit", "--incremental", "false", "--project", "scripts/tsconfig.json"],
    {
      cwd: repoRoot,
      maxBuffer: 20 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_OPTIONS: "--max-old-space-size=8192",
      },
    },
  );
  tscStdout = result.stdout;
  tscStderr = result.stderr;
  exitCode = 0;
} catch (err: unknown) {
  const execErr = err as {
    stdout?: string;
    stderr?: string;
    code?: number | string;
    signal?: string;
    killed?: boolean;
  };
  if (execErr.killed || execErr.signal || typeof execErr.code !== "number") {
    fail(
      `tsc terminated abnormally (signal=${execErr.signal ?? "none"}, code=${String(execErr.code)}, killed=${String(execErr.killed ?? false)})`,
    );
  }
  tscStdout = execErr.stdout ?? "";
  tscStderr = execErr.stderr ?? "";
  exitCode = execErr.code;
}

// tsc's only normal exits are 0 (zero errors) and 2 (diagnostics reported)
if (exitCode !== 0 && exitCode !== 2) {
  fail(`tsc exited with unexpected exit code ${exitCode}:\n${tscStderr || tscStdout}`);
}

const errorRegex = /^([^(]+)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
const errorLines: string[] = [];
const byFile: Record<string, number> = {};

for (const line of tscStdout.split("\n")) {
  const match = line.match(errorRegex);
  if (match && match[1]) {
    errorLines.push(line);
    const file = path.relative(repoRoot, match[1].trim());
    byFile[file] = (byFile[file] ?? 0) + 1;
  }
}

const totalErrors = errorLines.length;
const errorFilesCount = Object.keys(byFile).length;

// Robustness cross-checks
if (exitCode === 0 && totalErrors !== 0) {
  fail("parsed errors but tsc exited clean");
}
if (exitCode !== 0 && totalErrors === 0) {
  fail(`tsc exited ${exitCode} with no parsable errors:\n${tscStderr || tscStdout}`);
}
if (tscStderr.trim().length > 0) {
  fail(`tsc emitted unexpected output to stderr:\n${tscStderr}`);
}

const unparsed = tscStdout
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l.includes("error TS") && !errorRegex.test(l));
if (unparsed.length > 0) {
  fail(`Unparsed compiler diagnostics detected:\n${unparsed.join("\n")}`);
}

// Ensure all error paths are strictly under scripts/
for (const file of Object.keys(byFile)) {
  if (!file.startsWith("scripts/")) {
    fail(`Error path outside scripts/ detected: ${file}. scripts/checkScriptsTypecheck must not leak src/ type errors.`);
  }
}

console.log(`\n=== SCRIPT TYPECHECK ERRORS: ${totalErrors} total across ${errorFilesCount} files ===`);
console.log(`Baseline: ${baseline.total} total errors across ${baseline.files} files`);

// Check per-file regressions if byFile baseline exists
const regressedFiles: { file: string; current: number; baseline: number }[] = [];
if (baseline.byFile) {
  for (const [file, count] of Object.entries(byFile)) {
    const baseCount = baseline.byFile[file] ?? 0;
    if (count > baseCount) {
      regressedFiles.push({ file, current: count, baseline: baseCount });
    }
  }
}

if (totalErrors > baseline.total || regressedFiles.length > 0) {
  console.error(
    `\n❌ SCRIPT TYPECHECK REGRESSION: Total script type errors: ${totalErrors} (baseline: ${baseline.total}).`,
  );
  if (regressedFiles.length > 0) {
    console.error(`Regressed files (${regressedFiles.length}):`);
    for (const { file, current, baseline: baseCount } of regressedFiles) {
      console.error(`  ${file}: ${current} (was ${baseCount}, +${current - baseCount})`);
    }
  }
  process.exit(1);
}

if (totalErrors < baseline.total) {
  const shouldRatchet = process.argv.includes("--ratchet");
  if (shouldRatchet) {
    const sortedByFile = Object.keys(byFile)
      .sort()
      .reduce<Record<string, number>>((acc, key) => {
        const val = byFile[key];
        if (val !== undefined) acc[key] = val;
        return acc;
      }, {});
    const updated: ScriptTypecheckBaseline = {
      ...baseline,
      total: totalErrors,
      files: errorFilesCount,
      byFile: sortedByFile,
    };
    await writeFile(baselinePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    console.log(
      `\n📉 Ratchet down: scripts baseline updated from ${baseline.total} to ${totalErrors} (-${baseline.total - totalErrors} errors).`,
    );
  } else {
    console.log(
      `\n📉 Errors fell from ${baseline.total} to ${totalErrors} (-${baseline.total - totalErrors}). Pass --ratchet to record new baseline.`,
    );
  }
} else {
  console.log("\n✅ Script typecheck passed (no regressions against baseline).");
}
