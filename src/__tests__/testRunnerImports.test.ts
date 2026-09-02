/**
 * No test file may import a test runner this repo does not run.
 *
 * `bun run test` runs jest. A file that pulls `describe`/`it`/`expect` from
 * another runner does not fail an assertion - jest cannot resolve the module,
 * so the suite fails to COLLECT and not one of its assertions ever executes.
 * It shows up as a single failing suite in CI and as coverage everywhere else.
 *
 * This has happened twice. `src/lib/auth/__tests__/authCache.test.ts` records
 * it in its own header, and it is the live control below. Then
 * `src/__tests__/fusionCuisine.test.ts` shipped in PR #818 with four tests
 * that had never run once (fixed 2026-09-02 in bcc8047d; all four passed the
 * moment the import came off).
 *
 * ── Why this is a test and not a lint rule ──────────────────────────────────
 *
 * `no-restricted-imports` cannot reach these files. eslint.config.mjs ignores
 * test files globally - point it at any of them and it reports "File ignored
 * because of a matching ignore pattern". eslint.config.audit.mjs does lint
 * them, but a new rule there fails `scripts/checkLintDebt.ts`, which exits 1
 * unless the audited rule names equal the keys of .lint-debt-baseline.json
 * exactly. And tsconfig.json excludes test files, so `tsc --noEmit` never
 * sees them either.
 *
 * The nearest sibling guard, `testImportPathsResolve.test.ts`, already walks
 * most of these files - but it returns `true` for every bare package
 * specifier by design, since node_modules resolution is out of its scope.
 * `bun:test` is a bare specifier. That is the gap it fell through, and the
 * reason this is a separate sweep rather than another case in that one.
 */
import fs from "fs";
import path from "path";

/**
 * Anchored to this file's own location, not `process.cwd()`. A sweep keyed on
 * the working directory reads whatever checkout jest was launched from, which
 * is not necessarily the one it is testing - running this from a sibling
 * worktree made it walk that tree instead and pass, with a planted bad import
 * sitting untouched in the tree it was supposed to be guarding. `__dirname`
 * cannot drift that way; `locatesTheRepoRoot` below pins that it still points
 * somewhere real if this file ever moves.
 */
const ROOT = path.resolve(__dirname, "..", "..");

/**
 * Runners that make a file unrunnable here. Each fails identically: an
 * unresolvable module at collection time rather than a failing assertion.
 *
 * `bun:test` is on the list because it has now cost two suites. `vitest` and
 * `node:test` are on it because they are what a copied snippet or a generated
 * test reaches for next, and they would fail exactly the same way. Nothing
 * jest ships is listed: `jest`, `@jest/globals` (imported by five suites
 * here) and `jest-mock` all have to keep working, and the control below pins
 * that they do.
 */
const FOREIGN_RUNNERS = ["bun:test", "vitest", "node:test"];

const escapeForRegExp = (literal: string): string =>
  literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Matches a real module reference, not a mention. Deliberately not anchored
 * to the start of a line: a multi-line
 *
 *     import {
 *       describe,
 *     } from "<runner>";
 *
 * is the same defect, and a line-anchored pattern walks straight past it.
 * Covers `import … from`, side-effect `import "x"`, `export … from`, dynamic
 * `import("x")` and `require("x")`.
 */
const RUNNER_REFERENCE = new RegExp(
  `(?:from|import|require)\\s*\\(?\\s*["'](${FOREIGN_RUNNERS.map(
    escapeForRegExp,
  ).join("|")})["']`,
  "g",
);

/**
 * Comments are removed first, so prose that merely names a runner - which is
 * exactly what the two files above do, and what a substring search would trip
 * over - cannot be read as an import. The `//` rule leaves protocol-relative
 * text like `https://` alone.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'`])\/\/[^\n]*/gm, "$1");
}

/** Every foreign runner this source actually imports, in order of appearance. */
function foreignRunnerImports(source: string): string[] {
  return [...stripComments(source).matchAll(RUNNER_REFERENCE)].map((m) => m[1]);
}

/**
 * Skips `foo 2.ts` - Finder leaves those behind, they are untracked, and CI
 * never checks them out. Counting them would fail a local run over a file
 * nobody has edited. Same rule as `testImportPathsResolve.test.ts`.
 */
function isMacosDuplicate(p: string): boolean {
  return / \d+\.[a-z]+$/.test(p) || / \d+\//.test(p);
}

/**
 * Under `tests/` every module counts - `tests/setup/*` is loaded into every
 * suite, so a bad import there takes down all 320 at once. Elsewhere it is
 * the files jest collects plus anything living in a `__tests__` directory,
 * which is where this repo keeps shared test helpers.
 */
function collectSuiteFiles(dir: string, everyModule: boolean, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (isMacosDuplicate(full)) continue;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      collectSuiteFiles(full, everyModule, out);
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      const isSuite =
        /\.(test|spec)\.tsx?$/.test(entry.name) ||
        full.includes(`${path.sep}__tests__${path.sep}`);
      if (everyModule || isSuite) out.push(full);
    }
  }
  return out;
}

function scannedFiles(): string[] {
  return [
    ...collectSuiteFiles(path.join(ROOT, "src"), false),
    ...collectSuiteFiles(path.join(ROOT, "tests"), true),
    ...collectSuiteFiles(path.join(ROOT, "scripts"), false),
  ];
}

const PROSE_CONTROL = "src/lib/auth/__tests__/authCache.test.ts";

describe("no test file imports a runner this repo does not run", () => {
  it("locatesTheRepoRoot: the sweep is pointed at this checkout", () => {
    // If this file moves, `../..` stops being the repo root and every sweep
    // below would walk an empty tree and pass. Fail here instead.
    expect(fs.existsSync(path.join(ROOT, "jest.config.js"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "src", "__tests__"))).toBe(true);
  });

  it("finds no foreign runner import under src/, tests/ or scripts/", () => {
    const files = scannedFiles();

    // A sweep that reads nothing passes silently, so pin what it reached.
    // 326 files on 2026-09-02; the floor is loose enough to survive ordinary
    // churn and tight enough that a broken walker cannot slip under it.
    expect(files.length).toBeGreaterThan(200);
    const under = (root: string) =>
      files.some((f) => f.startsWith(`${path.join(ROOT, root)}${path.sep}`));
    expect(under("src")).toBe(true);
    expect(under("tests")).toBe(true);
    expect(files).toContain(path.join(ROOT, PROSE_CONTROL));

    const offenders: string[] = [];
    for (const file of files) {
      for (const runner of foreignRunnerImports(fs.readFileSync(file, "utf8"))) {
        offenders.push(`${path.relative(ROOT, file)} → "${runner}"`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("live control: the file that names bun:test in prose is read, and cleared", () => {
    // The sweep above only means something because a file that would trip a
    // substring search is inside it. authCache.test.ts's header explains that
    // its first version imported from the runner it names.
    const source = fs.readFileSync(path.join(ROOT, PROSE_CONTROL), "utf8");
    expect(source).toContain(FOREIGN_RUNNERS[0]);
    expect(foreignRunnerImports(source)).toEqual([]);
  });
});

describe("the matcher this guard relies on", () => {
  // Built from the runner name rather than written out, so this file does not
  // contain the very import statement it is looking for.
  const importFrom = (runner: string) =>
    `import { describe, expect, it } from "${runner}";\n`;

  it("catches the single-line import that broke both suites", () => {
    expect(foreignRunnerImports(importFrom("bun:test"))).toEqual(["bun:test"]);
  });

  it("catches an import split across lines", () => {
    // A `^\s*import[^\n]*from` pattern misses this one entirely.
    const split = `import {\n  describe,\n  it,\n}\n  from\n  "${FOREIGN_RUNNERS[1]}";\n`;
    expect(foreignRunnerImports(split)).toEqual([FOREIGN_RUNNERS[1]]);
  });

  it("catches side-effect, dynamic and require forms", () => {
    expect(foreignRunnerImports(`import "${FOREIGN_RUNNERS[2]}";`)).toEqual([
      FOREIGN_RUNNERS[2],
    ]);
    expect(
      foreignRunnerImports(`const t = await import("${FOREIGN_RUNNERS[0]}");`),
    ).toEqual([FOREIGN_RUNNERS[0]]);
    expect(
      foreignRunnerImports(`const t = require("${FOREIGN_RUNNERS[0]}");`),
    ).toEqual([FOREIGN_RUNNERS[0]]);
  });

  it("does not flag a runner named in a comment", () => {
    const line = `// its first version imported from "${FOREIGN_RUNNERS[0]}"\n`;
    const block = `/**\n * imported from "${FOREIGN_RUNNERS[0]}", which fails.\n */\n`;
    expect(foreignRunnerImports(line)).toEqual([]);
    expect(foreignRunnerImports(block)).toEqual([]);
  });

  it("leaves the imports this repo actually uses alone", () => {
    const real =
      'import { jest } from "@jest/globals";\n' +
      'import fs from "fs";\n' +
      'import { render } from "@testing-library/react";\n';
    expect(foreignRunnerImports(real)).toEqual([]);
  });
});
