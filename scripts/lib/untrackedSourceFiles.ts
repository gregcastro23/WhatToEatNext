/**
 * Detect untracked TypeScript source files under src/ and scripts/.
 *
 * Untracked source files corrupt tsc (which typechecks all .ts files on disk),
 * check:scripts, lint:debt, and dead module audits.
 */

export function parseUntrackedSourceFiles(statusOutput: string): string[] {
  return statusOutput
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("??") && /\.(ts|tsx)$/.test(line))
    .map((line) => line.replace(/^\?\?\s+/, "").trim())
    .filter(
      (file) =>
        file.startsWith("src/") ||
        file.startsWith("./src/") ||
        file.startsWith("scripts/") ||
        file.startsWith("./scripts/"),
    );
}
