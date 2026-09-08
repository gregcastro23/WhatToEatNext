/**
 * Reachability audit for `src/` modules.
 *
 * Usage:
 *   bun scripts/auditDeadModules.ts                 # human summary
 *   bun scripts/auditDeadModules.ts --json out.json # full machine report
 *
 * Reports modules under `src/` that no traversal from any entry point reaches.
 * See scripts/lib/deadModules.ts for the criterion and its refutation notes.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildReport,
  isDeadnessCandidate,
  isReferrerSource,
} from "./lib/deadModules";

import type * as TSType from "typescript";

const ts = require("typescript") as typeof TSType;

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".claude",
  ".worktrees",
  "dist",
  "dist-scripts",
  "coverage",
  "archive",
  "docs",
  "wten-migration-ui-components",
  "mcp-server",
  ".open-next",
  ".storybook-static",
  "target",
]);

function walk(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = path.join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      walk(full, acc);
    } else {
      const rel = path.relative(repoRoot, full).split(path.sep).join("/");
      if (isReferrerSource(rel)) acc.push(rel);
    }
  }
  return acc;
}

// Every directory that may reference a src/ module.
// Every directory that may reference a src/ module. `__tests__` at the repo
// ROOT is easy to miss — it is not under src/, but jest collects it, and
// omitting it reported two modules dead that root-level suites still import
// (caught empirically: 2 suites failed on `Cannot find module`).
const REFERRER_ROOTS = ["src", "scripts", ".storybook", "tests", "__tests__"];

const referrerFiles: string[] = [];
for (const root of REFERRER_ROOTS) {
  referrerFiles.push(...walk(path.join(repoRoot, root)));
}

// package.json scripts invoke modules directly (`bun src/server/hono-api.ts`,
// `bun src/scripts/process-all-cuisines.ts`). Those are entry points that no
// import graph can see, so harvest them from the manifest itself.
const pkgScripts = JSON.parse(
  readFileSync(path.join(repoRoot, "package.json"), "utf8"),
) as { scripts?: Record<string, string> };
const manifestEntryPoints = new Set<string>();
for (const command of Object.values(pkgScripts.scripts ?? {})) {
  for (const match of command.matchAll(/[\w./-]+\.tsx?/g)) {
    const rel = match[0].replace(/^\.\//, "");
    if (rel.startsWith("src/") || rel.startsWith("scripts/")) {
      manifestEntryPoints.add(rel);
    }
  }
}

const candidateFiles = referrerFiles.filter(
  (f) => isDeadnessCandidate(f) && !manifestEntryPoints.has(f),
);

// Load the real tsconfig so `paths` aliases resolve exactly as tsc resolves them.
const configPath = path.join(repoRoot, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  repoRoot,
);
const compilerOptions: TSType.CompilerOptions = {
  ...parsed.options,
  // Resolution only — never emit, never typecheck.
  noEmit: true,
};

const report = buildReport({
  repoRoot,
  referrerFiles,
  candidateFiles,
  compilerOptions,
  extraEntryPoints: [...manifestEntryPoints],
});

const jsonFlagIndex = process.argv.indexOf("--json");
if (jsonFlagIndex !== -1) {
  const target = process.argv[jsonFlagIndex + 1] ?? "dead-modules.json";
  writeFileSync(path.resolve(repoRoot, target), JSON.stringify(report, null, 2));
  console.log(`Wrote ${target}`);
}

const byDir = new Map<string, string[]>();
for (const file of report.dead) {
  const segments = file.split("/");
  const key = segments.slice(0, 2).join("/");
  const list = byDir.get(key) ?? [];
  list.push(file);
  byDir.set(key, list);
}

console.log("Dead module audit");
console.log("=================");
console.log(`Referrer files scanned : ${referrerFiles.length}`);
console.log(`Deadness candidates    : ${candidateFiles.length}`);
console.log(`Entry points           : ${report.entryPoints.length}`);
console.log(`  of which manifest    : ${manifestEntryPoints.size}`);
console.log(`Reachable              : ${report.reachable.length}`);
console.log(`UNREACHABLE            : ${report.dead.length}`);
console.log(`Test-only reachable    : ${report.testOnly.length}`);
console.log(
  `Unresolvable dynamic   : ${report.unresolvableDynamicImports.length}`,
);
console.log("");
for (const [dir, files] of [...byDir.entries()].sort(
  (a, b) => b[1].length - a[1].length,
)) {
  console.log(`  ${dir.padEnd(24)} ${String(files.length).padStart(4)}`);
}

if (report.unresolvableDynamicImports.length > 0) {
  console.log("");
  console.log("Unresolvable dynamic imports (their targets are pinned alive):");
  for (const entry of report.unresolvableDynamicImports) {
    console.log(`  ${entry.file}: ${entry.specifier}`);
  }
}
