/**
 * Pre-commit / local helper: Lint only changed or untracked JS/TS files.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * Previously, `lint:changed` executed:
 *   eslint --config eslint.config.mjs --cache $({ git diff ...; git ls-files ...; } | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$' | tr '\n' ' ')
 *
 * When committing docs-only changes (or when no JS/TS files were touched), the
 * subshell evaluated to an empty string. ESLint invoked with zero file arguments
 * targets the entire repository under the default Node/Bun heap, triggering:
 *   FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 *   SIGABRT, hook exit 134.
 *
 * This wrapper inspects the git working tree:
 *   - If no JS/TS files were changed or untracked: exits 0 cleanly with an informational message.
 *   - If JS/TS files exist: invokes eslint on only those files and propagates the exit code.
 *
 * @file scripts/lintChanged.ts
 */

import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const localEslint = path.resolve(repoRoot, "node_modules/.bin/eslint");
const eslintBin = existsSync(localEslint) ? localEslint : "eslint";

const JS_TS_EXTENSIONS_REGEX = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

function getChangedJsTsFiles(): string[] {
  try {
    const diffFiles = execSync("git diff --name-only --diff-filter=ACMR HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const untrackedFiles = execSync("git ls-files --others --exclude-standard", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const combined = Array.from(new Set([...diffFiles, ...untrackedFiles]));

    return combined.filter(
      (filePath) => JS_TS_EXTENSIONS_REGEX.test(filePath) && existsSync(filePath),
    );
  } catch {
    // If git fails (e.g. initial repo state or detached commit error), return empty
    return [];
  }
}

function main(): void {
  const filesToLint = getChangedJsTsFiles();

  if (filesToLint.length === 0) {
    console.log("✓ lint:changed: No staged, unstaged, or untracked JS/TS files to lint; skipping.");
    process.exit(0);
  }

  console.log(`Running ESLint on ${filesToLint.length} changed file(s)...`);

  const result = spawnSync(
    eslintBin,
    ["--config", "eslint.config.mjs", "--cache", ...filesToLint],
    {
      stdio: "inherit",
    },
  );

  if (result.error) {
    console.error(`✗ Failed to execute ESLint: ${result.error.message}`);
    process.exit(1);
  }

  process.exit(result.status ?? 0);
}

main();
