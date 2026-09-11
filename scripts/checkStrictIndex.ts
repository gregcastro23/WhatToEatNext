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

const topArgIdx = process.argv.indexOf("--top");
const showTop = topArgIdx !== -1 || process.argv.includes("--files");
if (showTop) {
  let n = 20;
  const topArgVal = topArgIdx !== -1 ? process.argv[topArgIdx + 1] : undefined;
  if (topArgVal && /^\d+$/.test(topArgVal)) {
    n = parseInt(topArgVal, 10);
  }
  const sorted = Object.entries(summary.byFile).sort((a, b) => b[1].length - a[1].length);
  console.log(`\n=== TOP ${Math.min(n, sorted.length)} FILES BY STRICT ERROR COUNT ===`);
  for (const [file, diags] of sorted.slice(0, n)) {
    console.log(`  ${diags.length.toString().padStart(3)}: ${file}`);
  }
}

if (process.argv.includes("--json")) {
  const jsonOutput = {
    total: summary.total,
    files: summary.files,
    filesScanned: summary.filesScanned,
    rankedFiles: Object.entries(summary.byFile)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([file, diags]) => ({ file, count: diags.length })),
  };
  console.log(JSON.stringify(jsonOutput, null, 2));
}

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
