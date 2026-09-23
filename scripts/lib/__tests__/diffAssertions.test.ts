import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  checkFileAssertionDiff,
  findAssertionSitesInSource,
  parseAddedLinesFromDiff,
  resolveBaseRef,
  resolveMergeBase,
  scanDiffAssertions,
} from "../diffAssertions";

describe("diffAssertions", () => {
  describe("parseAddedLinesFromDiff", () => {
    it("parses single added line (@@ -10 +10 @@)", () => {
      const diff = "@@ -10 +10 @@\n+const x = 1;";
      const lines = parseAddedLinesFromDiff(diff);
      expect(lines.has(10)).toBe(true);
      expect(lines.size).toBe(1);
    });

    it("parses added line range (@@ -5,2 +5,3 @@)", () => {
      const diff = "@@ -5,2 +5,3 @@\n+line 5\n+line 6\n+line 7";
      const lines = parseAddedLinesFromDiff(diff);
      expect(lines.has(5)).toBe(true);
      expect(lines.has(6)).toBe(true);
      expect(lines.has(7)).toBe(true);
      expect(lines.has(8)).toBe(false);
      expect(lines.size).toBe(3);
    });

    it("ignores pure deletions with 0 added lines (@@ -10,3 +10,0 @@)", () => {
      const diff = "@@ -10,3 +10,0 @@\n-line 1\n-line 2\n-line 3";
      const lines = parseAddedLinesFromDiff(diff);
      expect(lines.size).toBe(0);
    });

    it("parses multiple hunks correctly", () => {
      const diff = [
        "@@ -1,0 +1,2 @@",
        "+import a from 'a';",
        "+import b from 'b';",
        "@@ -20,1 +22,2 @@",
        "+const c = 3;",
        "+const d = 4;",
      ].join("\n");
      const lines = parseAddedLinesFromDiff(diff);
      expect(Array.from(lines).sort((a, b) => a - b)).toEqual([1, 2, 22, 23]);
    });
  });

  describe("findAssertionSitesInSource", () => {
    it("finds single 'as Type' assertion", () => {
      const code = "const a = 1;\nconst b = (x as Foo);";
      const sites = findAssertionSitesInSource(code, "test.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].startLine).toBe(2);
      expect(sites[0].text).toContain("as Foo");
    });

    it("counts chained 'as unknown as Type' as a single assertion site", () => {
      const code = "const a = 1;\nconst b = (x as unknown as Bar);";
      const sites = findAssertionSitesInSource(code, "test.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].startLine).toBe(2);
      expect(sites[0].text).toBe("x as unknown as Bar");
    });

    it("ignores 'as const' assertions", () => {
      const code = "const a = [1, 2, 3] as const;\nconst b = { foo: 'bar' } as const;";
      const sites = findAssertionSitesInSource(code, "test.ts");
      expect(sites).toHaveLength(0);
    });

    it("ignores '<const>' assertions", () => {
      const code = "const a = <const>[1, 2, 3];";
      const sites = findAssertionSitesInSource(code, "test.ts");
      expect(sites).toHaveLength(0);
    });
  });

  describe("checkFileAssertionDiff", () => {
    it("reports 0 added assertions when existing assertion is untouched", () => {
      const currentCode = "const a = (x as Foo);\nconst b = 2;\nconst c = 3;";
      // Only line 3 was added
      const addedLines = new Set([3]);
      const diff = checkFileAssertionDiff("src/test.ts", addedLines, currentCode);

      expect(diff.addedAssertions).toBe(0);
      expect(diff.sites).toHaveLength(0);
    });

    it("flags assertion on an added line", () => {
      const currentCode = "const a = 1;\nconst b = (x as Foo);";
      // Line 2 was added in diff
      const addedLines = new Set([2]);
      const diff = checkFileAssertionDiff("src/test.ts", addedLines, currentCode);

      expect(diff.addedAssertions).toBe(1);
      expect(diff.sites[0].line).toBe(2);
    });

    it("flags swapped assertions (negative control: net per-file count unchanged)", () => {
      // Old file had assertion on line 1. Line 1 assertion removed, new assertion added on line 3.
      // Net count delta is 0, but line 3 is in addedLines.
      const currentCode = "const a = 1;\nconst b = 2;\nconst c = (y as Bar);";
      const addedLines = new Set([1, 3]); // Line 1 modified, line 3 added
      const diff = checkFileAssertionDiff("src/test.ts", addedLines, currentCode);

      expect(diff.addedAssertions).toBe(1);
      expect(diff.sites[0].line).toBe(3);
    });

    it("flags all assertions in a brand new file (addedLines === null)", () => {
      const currentCode = "export const x = 42;\nexport const y = (z as string);\nexport const w = (v as number);";
      const diff = checkFileAssertionDiff("src/newFile.ts", null, currentCode);

      expect(diff.addedAssertions).toBe(2);
      expect(diff.sites).toHaveLength(2);
    });
  });

  describe("resolveBaseRef & resolveMergeBase error handling", () => {
    it("fails closed when explicit ref does not exist", () => {
      expect(() => resolveBaseRef("nonexistent-ref-xyz-123")).toThrow(
        /cannot be resolved by git rev-parse/,
      );
    });

    it("resolves a default git base ref in the current repository", () => {
      const base = resolveBaseRef();
      expect(["origin/master", "master", "origin/main", "main"]).toContain(base);
    });

    it("fails closed when merge-base cannot be resolved", () => {
      expect(() => resolveMergeBase("nonexistent-ref-xyz-123", process.cwd())).toThrow(
        /Failed to resolve git merge-base/,
      );
    });
  });

  describe("End-to-end temp git repository fixture", () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diff-guard-e2e-"));
      // Initialize git repo
      execFileSync("git", ["init", "-b", "master"], { cwd: tempDir, stdio: "ignore" });
      execFileSync("git", ["config", "user.name", "Test Runner"], { cwd: tempDir, stdio: "ignore" });
      execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: tempDir, stdio: "ignore" });

      fs.mkdirSync(path.join(tempDir, "src"), { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, "src", "example.ts"),
        "const a = (x as any);\nconst b = 2;\n",
        "utf8",
      );
      execFileSync("git", ["add", "."], { cwd: tempDir, stdio: "ignore" });
      execFileSync("git", ["commit", "-m", "Initial commit with 1 assertion"], {
        cwd: tempDir,
        stdio: "ignore",
      });
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it("resolves default base ref within temp git repository without relying on outer repo", () => {
      const base = resolveBaseRef(undefined, tempDir);
      expect(base).toBe("master");
    });

    it("detects assertion swap (removes 1, adds 1 elsewhere) as a regression", () => {
      // Create a feature branch
      execFileSync("git", ["checkout", "-b", "feature/swap"], { cwd: tempDir, stdio: "ignore" });

      // Swap: remove assertion on line 1, add assertion on line 2
      fs.writeFileSync(
        path.join(tempDir, "src", "example.ts"),
        "const a = 1;\nconst b = (2 as string);\n",
        "utf8",
      );

      const targetDir = path.join(tempDir, "src");
      const result = scanDiffAssertions(targetDir, tempDir, "master");

      expect(result.passed).toBe(false);
      expect(result.totalAddedAssertions).toBe(1);
      expect(result.regressedFiles[0].sites[0].line).toBe(2);
    });

    it("passes when assertions are removed without adding new ones", () => {
      execFileSync("git", ["checkout", "-b", "feature/clean"], { cwd: tempDir, stdio: "ignore" });

      // Remove assertion on line 1 cleanly
      fs.writeFileSync(
        path.join(tempDir, "src", "example.ts"),
        "const a = 1;\nconst b = 2;\n",
        "utf8",
      );

      const targetDir = path.join(tempDir, "src");
      const result = scanDiffAssertions(targetDir, tempDir, "master");

      expect(result.passed).toBe(true);
      expect(result.totalAddedAssertions).toBe(0);
    });
  });
});
