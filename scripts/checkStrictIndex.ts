import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  compareStrictIndex,
  runStrictIndexCheck,
  strictIndexBaselineSchema,
  updateStrictIndexBaseline,
} from "./lib/strictIndex";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.strict-index-baseline.json", import.meta.url);

const baselineRaw = await readFile(baselinePath, "utf8");
const baseline = strictIndexBaselineSchema.parse(JSON.parse(baselineRaw));

console.log("Running exactOptionalPropertyTypes strict-flags check...");
const summary = runStrictIndexCheck(repoRoot, "tsconfig.strict-index.json");

console.log(`\n=== STRICT FLAG ERRORS: ${summary.total} total across ${summary.files} files ===`);
console.log(`Baseline: ${baseline.total} total errors across ${baseline.files} files (${baseline.allowlist.length} allowlisted)`);

const comparison = compareStrictIndex(summary, baseline);

if (comparison.allowlistViolations.length > 0) {
  console.error("\n❌ ALLOWLIST REGRESSION:");
  for (const file of comparison.allowlistViolations) {
    const errCount = summary.byFile[file]?.length ?? 0;
    console.error(`  - ${file} is allowlisted but contains ${errCount} strict index error(s)`);
    for (const diag of summary.byFile[file] ?? []) {
      console.error(`      (${diag.line},${diag.character}): TS${diag.code} ${diag.message}`);
    }
  }
}

if (comparison.totalIncreasedBy > 0) {
  console.error(
    `\n❌ TOTAL ERROR REGRESSION: Total strict index errors increased from ${baseline.total} to ${summary.total} (+${comparison.totalIncreasedBy}).`,
  );
}

if (comparison.exceedsBaseline) {
  process.exit(1);
}

if (summary.total < baseline.total) {
  const shouldRatchet = process.argv.includes("--ratchet");
  if (shouldRatchet) {
    const updated = updateStrictIndexBaseline(summary, baseline);
    await writeFile(baselinePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    console.log(
      `\n📉 Ratchet down: strict-flags baseline updated from ${baseline.total} to ${updated.total} (-${baseline.total - updated.total} errors).`,
    );
  } else {
    console.log(
      `\n📉 Errors fell from ${baseline.total} to ${summary.total} (-${baseline.total - summary.total}). Pass --ratchet to record new baseline.`,
    );
  }
} else {
  console.log("\n✅ Strict-flags check passed (no regressions against baseline).");
}
