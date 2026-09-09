import { parseUntrackedSourceFiles } from "../untrackedSourceFiles";

describe("parseUntrackedSourceFiles", () => {
  it("extracts untracked .ts and .tsx files under src/ and scripts/", () => {
    const porcelain = [
      "?? src/utils/foo.ts",
      "?? src/components/Bar.tsx",
      "?? scripts/checkSomething.ts",
      " M src/app/page.tsx",
      "?? package.json",
      "?? src/styles/main.css",
      "?? docs/notes.md",
    ].join("\n");

    const result = parseUntrackedSourceFiles(porcelain);
    expect(result).toEqual([
      "src/utils/foo.ts",
      "src/components/Bar.tsx",
      "scripts/checkSomething.ts",
    ]);
  });

  it("ignores non-source files and modified files", () => {
    const porcelain = [
      " M src/lib/database.ts",
      "D  src/old.ts",
      " M scripts/checkStrictIndex.ts",
      "?? docs/notes.md",
      "?? README.md",
    ].join("\n");

    const result = parseUntrackedSourceFiles(porcelain);
    expect(result).toEqual([]);
  });

  it("handles empty git status output", () => {
    expect(parseUntrackedSourceFiles("")).toEqual([]);
  });
});
