/**
 * Code-health snapshot — measures the numbers the TypeScript campaign moves.
 *
 * Runs the SAME tools the gates run (tsc over tsconfig.json, ESLint over src/
 * with eslint.config.mjs) and records what they actually report, rather than
 * what a baseline file says they should report. The committed ratchet
 * baselines are ceilings; this is the reading.
 *
 * Output is a JSON document matching `CodeHealthSnapshotInput` in
 * src/services/admin/codeHealthIngest.ts. With `--post <url>` it is sent to
 * the admin ingest endpoint, authenticated by CODE_HEALTH_INGEST_SECRET.
 *
 *   bun scripts/codeHealthSnapshot.ts                    # print JSON
 *   bun scripts/codeHealthSnapshot.ts --out snap.json    # write JSON
 *   bun scripts/codeHealthSnapshot.ts --post https://alchm.kitchen/api/admin/code-health/ingest
 *   bun scripts/codeHealthSnapshot.ts --skip-eslint      # tsc + file census only
 *
 * CI runs it on every push to master (.github/workflows/ci.yml, job
 * `code-health`), so /admin/code-health gets one row per merged commit.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

function argValue(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  const value = process.argv[idx + 1];
  return value && !value.startsWith("--") ? value : null;
}

const outPath = argValue("--out");
const postUrl = argValue("--post");
const skipEslint = process.argv.includes("--skip-eslint");
const skipTsc = process.argv.includes("--skip-tsc");

function git(args: string[]): string | null {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

// ── tsc ─────────────────────────────────────────────────────────────────────

interface TscReading {
  errors: number;
  byCode: Record<string, number>;
  topFiles: Array<{ file: string; count: number }>;
  durationMs: number;
}

function runTsc(): TscReading {
  const started = Date.now();
  // `next typegen` first, exactly as `bun run typecheck` does — without the
  // generated route types tsc reports errors the gate never sees.
  spawnSync("bunx", ["next", "typegen"], { cwd: repoRoot, stdio: "ignore" });
  // --incremental false: a stale .tsbuildinfo can make an incremental run
  // report errors that a clean run does not.
  const res = spawnSync(
    "bunx",
    ["tsc", "--noEmit", "--incremental", "false", "--pretty", "false", "-p", "tsconfig.json"],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
  );
  const output = `${res.stdout ?? ""}${res.stderr ?? ""}`;
  const byCode: Record<string, number> = {};
  const byFile = new Map<string, number>();
  let errors = 0;
  for (const line of output.split("\n")) {
    const m = /^(.+?)\(\d+,\d+\): error (TS\d+):/.exec(line);
    if (!m) continue;
    errors += 1;
    const [, file, code] = m;
    if (code) byCode[code] = (byCode[code] ?? 0) + 1;
    if (file) byFile.set(file, (byFile.get(file) ?? 0) + 1);
  }
  // A non-zero exit with zero parsed errors means tsc itself failed (OOM,
  // bad config) — that is not a clean reading, so refuse to report one.
  if (res.status !== 0 && errors === 0) {
    throw new Error(
      `tsc exited ${String(res.status)} without parseable diagnostics:\n${output.slice(0, 2000)}`,
    );
  }
  return {
    errors,
    byCode,
    topFiles: [...byFile.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([file, count]) => ({ file, count })),
    durationMs: Date.now() - started,
  };
}

// ── eslint ──────────────────────────────────────────────────────────────────

interface EslintReading {
  errors: number;
  warnings: number;
  filesWithProblems: number;
  byRule: Record<string, { errors: number; warnings: number }>;
  topFiles: Array<{ file: string; warnings: number; errors: number }>;
  durationMs: number;
}

async function runEslint(): Promise<EslintReading> {
  const started = Date.now();
  const { ESLint } = await import("eslint");
  // Same config and target as `bun run lint`, minus the cache: a cached run
  // reports only the files that changed since the cache was written.
  const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: "eslint.config.mjs" });
  const results = await eslint.lintFiles(["src"]);
  const byRule: Record<string, { errors: number; warnings: number }> = {};
  let errors = 0;
  let warnings = 0;
  let filesWithProblems = 0;
  const files: Array<{ file: string; warnings: number; errors: number }> = [];
  for (const result of results) {
    errors += result.errorCount;
    warnings += result.warningCount;
    if (result.errorCount + result.warningCount > 0) {
      filesWithProblems += 1;
      files.push({
        file: path.relative(repoRoot, result.filePath),
        warnings: result.warningCount,
        errors: result.errorCount,
      });
    }
    for (const msg of result.messages) {
      // ruleId is null for two different things: unused eslint-disable
      // directives (reportUnusedDisableDirectives) and real parse failures.
      // Lumping them together hides which one you have.
      const rule =
        msg.ruleId ??
        (/unused eslint-disable/i.test(msg.message)
          ? "(unused-disable-directive)"
          : msg.fatal
            ? "(parse-error)"
            : "(no-rule)");
      const bucket = (byRule[rule] ??= { errors: 0, warnings: 0 });
      if (msg.severity === 2) bucket.errors += 1;
      else bucket.warnings += 1;
    }
  }
  return {
    errors,
    warnings,
    filesWithProblems,
    byRule,
    topFiles: files
      .sort((a, b) => b.warnings + b.errors - (a.warnings + a.errors))
      .slice(0, 15),
    durationMs: Date.now() - started,
  };
}

// ── file census ─────────────────────────────────────────────────────────────

interface Census {
  sourceFiles: number;
  sourceLines: number;
  testFiles: number;
}

async function walk(dir: string, out: string[]): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    // macOS Finder duplicates ("foo 2.ts") are copies, not source.
    if (/ \d+\.[a-z]+$/.test(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts")) out.push(full);
  }
}

async function census(): Promise<Census> {
  const files: string[] = [];
  await walk(path.join(repoRoot, "src"), files);
  let lines = 0;
  let tests = 0;
  for (const file of files) {
    if (/\.test\.tsx?$/.test(file)) tests += 1;
    const info = await stat(file);
    if (info.size > 2_000_000) continue;
    const text = await readFile(file, "utf8");
    lines += text.split("\n").length;
  }
  return { sourceFiles: files.length, sourceLines: lines, testFiles: tests };
}

// ── main ────────────────────────────────────────────────────────────────────

const commitSha = process.env.GITHUB_SHA ?? git(["rev-parse", "HEAD"]);
if (!commitSha) throw new Error("Cannot resolve the commit being measured");

const tsc = skipTsc ? null : runTsc();
const eslintReading = skipEslint ? null : await runEslint();
const fileCensus = await census();

const snapshot = {
  commitSha,
  branch: process.env.GITHUB_REF_NAME ?? git(["rev-parse", "--abbrev-ref", "HEAD"]),
  committedAt: git(["show", "-s", "--format=%cI", commitSha]),
  commitMessage: git(["show", "-s", "--format=%s", commitSha]),
  measuredAt: new Date().toISOString(),
  source: process.env.GITHUB_ACTIONS === "true" ? "ci" : "local",
  tsc,
  eslint: eslintReading,
  census: fileCensus,
};

const json = JSON.stringify(snapshot, null, 2);

if (outPath) {
  await writeFile(outPath, `${json}\n`);
  console.error(`wrote ${outPath}`);
} else if (!postUrl) {
  console.log(json);
}

if (postUrl) {
  const secret = process.env.CODE_HEALTH_INGEST_SECRET;
  if (!secret) {
    // Not an error: forks and local runs have no secret. Say so and exit 0 so
    // a missing secret never turns master red.
    console.error("CODE_HEALTH_INGEST_SECRET not set — snapshot measured but not posted");
  } else {
    const res = await fetch(postUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: json,
    });
    const body = await res.text();
    console.error(`POST ${postUrl} → ${res.status} ${body.slice(0, 300)}`);
    // A failed post is a warning, not a red build: the reading is already in
    // this log, and the endpoint may simply not be deployed yet (the push that
    // introduces it runs before its own deploy finishes).
    if (!res.ok) console.log(`::warning::code-health ingest returned ${res.status}; reading not stored`);
  }
}

console.error(
  `tsc errors: ${tsc ? tsc.errors : "skipped"} · eslint: ${
    eslintReading ? `${eslintReading.errors} errors / ${eslintReading.warnings} warnings` : "skipped"
  } · ${fileCensus.sourceFiles} files / ${fileCensus.sourceLines} lines`,
);
