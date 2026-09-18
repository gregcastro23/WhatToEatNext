import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  compareStrictIndex,
  countDiagnosticsFromText,
  parseTscDiagnosticLine,
  resolveStrictIndexTarget,
  runStrictIndexCheck,
  StrictIndexBaseline,
  strictIndexBaselineSchema,
  updateStrictIndexBaseline,
} from "../strictIndex";

describe("compareStrictIndex", () => {
  const baseBaseline: StrictIndexBaseline = {
    total: 2336,
    files: 433,
    allowlist: ["src/lib/safeModule.ts"],
  };

  it("passes when total error count equals baseline and allowlist has 0 errors", () => {
    const comparison = compareStrictIndex(
      { total: 2336, files: 433, byFile: {} },
      baseBaseline,
    );
    expect(comparison).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      allowlistViolations: [],
    });
  });

  it("passes when total error count decreases", () => {
    const comparison = compareStrictIndex(
      { total: 2300, files: 430, byFile: {} },
      baseBaseline,
    );
    expect(comparison).toEqual({
      exceedsBaseline: false,
      totalIncreasedBy: 0,
      allowlistViolations: [],
    });
  });

  it("fails when total error count increases", () => {
    const comparison = compareStrictIndex(
      { total: 2340, files: 435, byFile: {} },
      baseBaseline,
    );
    expect(comparison).toEqual({
      exceedsBaseline: true,
      totalIncreasedBy: 4,
      allowlistViolations: [],
    });
  });

  it("fails when an allowlisted file contains errors (RED PROOF), even if total error count decreased", () => {
    const comparison = compareStrictIndex(
      {
        total: 2000, // total decreased significantly!
        files: 400,
        byFile: {
          "src/lib/safeModule.ts": [
            {
              filePath: "src/lib/safeModule.ts",
              line: 42,
              character: 10,
              code: 2532,
              message: "Object is possibly 'undefined'.",
            },
          ],
        },
      },
      baseBaseline,
    );
    expect(comparison.exceedsBaseline).toBe(true);
    expect(comparison.allowlistViolations).toEqual(["src/lib/safeModule.ts"]);
  });

  it("fails when an individual file regresses even if total error count decreased", () => {
    const baselineWithByFile: StrictIndexBaseline = {
      total: 100,
      files: 50,
      allowlist: [],
      byFile: { "src/fileA.ts": 1, "src/fileB.ts": 2 },
    };
    const comparison = compareStrictIndex(
      {
        total: 90,
        files: 45,
        byFile: {
          "src/fileA.ts": [
            { filePath: "src/fileA.ts", line: 1, character: 1, code: 2532, message: "err" },
            { filePath: "src/fileA.ts", line: 2, character: 1, code: 2532, message: "err" },
          ],
        },
      },
      baselineWithByFile,
    );
    expect(comparison.exceedsBaseline).toBe(true);
    expect(comparison.regressedFiles).toEqual([
      { file: "src/fileA.ts", current: 2, baseline: 1 },
    ]);
  });
});

describe("parseTscDiagnosticLine", () => {
  it("pins parser trap 1: correctly extracts file path from route group containing parens", () => {
    const line =
      "src/app/(alchm)/generated-recipe/[id]/page.tsx(10,5): error TS2532: Object is possibly 'undefined'.";
    const parsed = parseTscDiagnosticLine(line);
    expect(parsed).toEqual({
      filePath: "src/app/(alchm)/generated-recipe/[id]/page.tsx",
      line: 10,
      character: 5,
      code: 2532,
      message: "Object is possibly 'undefined'.",
    });
  });

  it("parses standard TypeScript error diagnostic line", () => {
    const line =
      "src/lib/alchemical-kinetics.ts(234,12): error TS18048: 'positions[planet]' is possibly 'undefined'.";
    const parsed = parseTscDiagnosticLine(line);
    expect(parsed).toEqual({
      filePath: "src/lib/alchemical-kinetics.ts",
      line: 234,
      character: 12,
      code: 18048,
      message: "'positions[planet]' is possibly 'undefined'.",
    });
  });

  it("pins parser trap 2: returns null for multi-line error continuation lines", () => {
    const continuationLine1 =
      "  Type 'undefined' is not assignable to type 'string'.";
    const continuationLine2 =
      "    The expected type comes from property 'title' which is declared here on type 'Props'";
    expect(parseTscDiagnosticLine(continuationLine1)).toBeNull();
    expect(parseTscDiagnosticLine(continuationLine2)).toBeNull();
    expect(parseTscDiagnosticLine("")).toBeNull();
  });
});

describe("countDiagnosticsFromText", () => {
  it("counts only real error headers and ignores multi-line continuation snippets", () => {
    const rawTscOutput = [
      "src/app/(alchm)/recipe/[id]/page.tsx(15,3): error TS2322: Type 'number | undefined' is not assignable to type 'number'.",
      "  Type 'undefined' is not assignable to type 'number'.",
      "src/utils/math.ts(50,10): error TS18048: 'matrix[i]' is possibly 'undefined'.",
      "  Overload 1 of 2, '(x: number): void', gave the following error.",
      "    Argument of type 'undefined' is not assignable.",
    ].join("\n");

    const result = countDiagnosticsFromText(rawTscOutput);
    expect(result.total).toBe(2);
    expect(result.files).toBe(2);
    expect(result.byFile["src/app/(alchm)/recipe/[id]/page.tsx"]).toHaveLength(1);
    expect(result.byFile["src/utils/math.ts"]).toHaveLength(1);
  });
});

describe("updateStrictIndexBaseline", () => {
  it("ratchets total down and sorts allowlist", () => {
    const base: StrictIndexBaseline = {
      total: 2336,
      files: 433,
      allowlist: ["b.ts", "a.ts"],
    };
    const summary = {
      total: 2200,
      files: 420,
      byFile: {},
    };
    const updated = updateStrictIndexBaseline(summary, base);
    expect(updated).toEqual({
      total: 2200,
      files: 420,
      allowlist: ["a.ts", "b.ts"],
    });
  });

  it("does not ratchet total up if current errors exceed baseline", () => {
    const base: StrictIndexBaseline = {
      total: 2336,
      files: 433,
      allowlist: [],
    };
    const summary = {
      total: 2400,
      files: 440,
      byFile: {},
    };
    const updated = updateStrictIndexBaseline(summary, base);
    expect(updated.total).toBe(2336);
  });
});

describe("runStrictIndexCheck (smoke/integration)", () => {
  it("executes the TypeScript compiler program and satisfies baseline bounds", () => {
    const repoRoot = path.resolve(__dirname, "../../../");
    const baselineRaw = readFileSync(
      path.resolve(repoRoot, ".strict-index-baseline.json"),
      "utf8",
    );
    const baseline = strictIndexBaselineSchema.parse(JSON.parse(baselineRaw));
    const summary = runStrictIndexCheck(repoRoot, "tsconfig.strict-index.json");

    expect(summary.total).toBeLessThanOrEqual(baseline.total);
    expect(summary.files).toBeLessThanOrEqual(baseline.files);
    // A clean repo and a scanner that loaded nothing both report total: 0, so
    // the liveness check is on files loaded, not on errors found.
    expect(summary.filesScanned).toBeGreaterThan(100);
    expect(Object.keys(summary.byFile).length).toBe(summary.files);

    const comparison = compareStrictIndex(summary, baseline);
    expect(comparison.exceedsBaseline).toBe(false);
    expect(comparison.allowlistViolations).toEqual([]);
  }, 60000);
});

describe("resolveStrictIndexTarget", () => {
  const repoRoot = path.resolve(__dirname, "../../../");

  it("rejects undefined, empty, or flag-prefixed targets", () => {
    expect(resolveStrictIndexTarget(repoRoot, undefined)).toEqual({
      valid: false,
      error: "--file requires a file path argument.",
    });
    expect(resolveStrictIndexTarget(repoRoot, "")).toEqual({
      valid: false,
      error: "--file requires a file path argument.",
    });
    expect(resolveStrictIndexTarget(repoRoot, "--json")).toEqual({
      valid: false,
      error: "--file requires a file path argument.",
    });
  });

  it("normalizes relative and absolute paths to repo-relative paths", () => {
    const rel = resolveStrictIndexTarget(repoRoot, "src/lib/cooking/labSolver.ts");
    expect(rel).toEqual({
      valid: true,
      absPath: path.resolve(repoRoot, "src/lib/cooking/labSolver.ts"),
      relPath: "src/lib/cooking/labSolver.ts",
    });

    const dotRel = resolveStrictIndexTarget(repoRoot, "./src/lib/cooking/labSolver.ts");
    expect(dotRel).toEqual({
      valid: true,
      absPath: path.resolve(repoRoot, "src/lib/cooking/labSolver.ts"),
      relPath: "src/lib/cooking/labSolver.ts",
    });
  });

  it("rejects non-existent targets", () => {
    const nonExistent = resolveStrictIndexTarget(repoRoot, "does/not/exist.ts");
    expect(nonExistent).toEqual({
      valid: false,
      error: "Target file does not exist: does/not/exist.ts",
    });
  });
});

describe("checkStrictIndex CLI --file inspection", () => {
  const repoRoot = path.resolve(__dirname, "../../../");

  it("handles valid target with strict-index errors", () => {
    const res = spawnSync(
      "bun",
      [
        "scripts/checkStrictIndex.ts",
        "--file",
        "scripts/fixtures/strict-index-fixture.ts",
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(0);
    expect(res.stdout).toContain(
      "=== STRICT FLAG ERRORS FOR scripts/fixtures/strict-index-fixture.ts",
    );
    expect(res.stdout).toContain("TS2375");
  });

  it("handles clean target with zero strict-index errors", () => {
    const res = spawnSync(
      "bun",
      ["scripts/checkStrictIndex.ts", "--file", "src/lib/cooking/labSolver.ts"],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("=== STRICT FLAG ERRORS FOR src/lib/cooking/labSolver.ts (0 errors) ===");
  });

  it("handles differently-prefixed and absolute paths for clean targets", () => {
    const absPath = path.resolve(repoRoot, "src/lib/cooking/labSolver.ts");
    const res = spawnSync(
      "bun",
      ["scripts/checkStrictIndex.ts", "--file", absPath],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(0);
    expect(res.stdout).toContain("=== STRICT FLAG ERRORS FOR src/lib/cooking/labSolver.ts (0 errors) ===");
  });

  it("fails clearly when argument is missing", () => {
    const res = spawnSync(
      "bun",
      ["scripts/checkStrictIndex.ts", "--file"],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("❌ --file requires a file path argument.");
  });

  it("fails clearly when target path does not exist", () => {
    const res = spawnSync(
      "bun",
      ["scripts/checkStrictIndex.ts", "--file", "nonexistent-target-file.ts"],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("❌ Target file does not exist: nonexistent-target-file.ts");
  });

  it("fails clearly when target path is outside repository", () => {
    const res = spawnSync(
      "bun",
      ["scripts/checkStrictIndex.ts", "--file", "../outside.ts"],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(res.status).toBe(1);
    expect(res.stderr).toContain("❌ Target file is outside repository: ../outside.ts");
  });
});
