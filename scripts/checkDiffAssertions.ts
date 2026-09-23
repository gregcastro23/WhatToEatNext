#!/usr/bin/env bun
/**
 * Diff-Level Assertion Guard
 *
 * Ensures PR diffs or local working tree changes do not introduce new
 * `as <Type>` or `as unknown as <Type>` type assertions into the codebase.
 *
 * Usage:
 *   bun scripts/checkDiffAssertions.ts
 *   bun scripts/checkDiffAssertions.ts --base origin/master
 *   bun scripts/checkDiffAssertions.ts --base HEAD
 *
 * @file scripts/checkDiffAssertions.ts
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanDiffAssertions } from "./lib/diffAssertions";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const targetDir = path.join(repoRoot, "src");

// Parse optional --base argument
let explicitBase: string | undefined;
const baseIndex = process.argv.indexOf("--base");
if (baseIndex !== -1 && process.argv[baseIndex + 1]) {
  explicitBase = process.argv[baseIndex + 1];
}

console.log("Checking diff for newly introduced type assertions...");
const result = scanDiffAssertions(targetDir, repoRoot, explicitBase);

console.log(`Base reference: ${result.baseRef}`);
console.log(`Files scanned: ${result.filesScanned}`);

if (!result.passed) {
  console.error(`\n❌ ASSERTION SLIPPAGE: ${result.totalAddedAssertions} new type assertion(s) introduced across ${result.regressedFiles.length} file(s):`);
  for (const file of result.regressedFiles) {
    console.error(`  - ${file.filePath}: +${file.addedAssertions} assertion(s) (was ${file.baseCount}, now ${file.currentCount})`);
  }
  console.error("\nPer Invariant §4: No new unchecked casts or assertions may be introduced. Use Zod parsing or type guards.");
  process.exit(1);
}

console.log("\n✅ Diff assertion check passed (0 new type assertions introduced).");
process.exit(0);
