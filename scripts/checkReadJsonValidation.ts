import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  compareReadJsonValidation,
  readJsonBaselineSchema,
  scanReadJsonValidation,
  updateReadJsonBaseline,
} from "./lib/readJsonValidation";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.read-json-baseline.json", import.meta.url);

const baselineRaw = await readFile(baselinePath, "utf8");
const baseline = readJsonBaselineSchema.parse(JSON.parse(baselineRaw));

console.log("Running readJson response validation gate...");
const summary = scanReadJsonValidation(repoRoot);

console.log(
  `\n=== READJSON VALIDATION: ${summary.unvalidatedSites.length} unvalidated / ${summary.totalCalls} total response-reading calls ===`,
);
console.log(
  `Baseline: ${baseline.totalUnvalidated} unvalidated across ${baseline.totalCalls} response calls (${baseline.allowlist.length} allowlisted)`,
);

const comparison = compareReadJsonValidation(summary, baseline);

if (comparison.allowlistViolations.length > 0) {
  console.error(
    "\n❌ ALLOWLIST VIOLATION: The following call site(s) invoke readJson/safeReadJson/fetchJson without { parse } and are not allowlisted:",
  );
  for (const site of comparison.allowlistViolations) {
    console.error(`  - ${site.file}:${site.line}:${site.column} (${site.helper})`);
  }
}

if (comparison.totalIncreasedBy > 0) {
  console.error(
    `\n❌ TOTAL REGRESSION: Unvalidated response call count increased from ${baseline.totalUnvalidated} to ${summary.unvalidatedSites.length} (+${comparison.totalIncreasedBy}).`,
  );
}

if (comparison.exceedsBaseline) {
  process.exit(1);
}

if (summary.unvalidatedSites.length < baseline.totalUnvalidated) {
  const shouldRatchet = process.argv.includes("--ratchet");
  if (shouldRatchet) {
    const updated = updateReadJsonBaseline(summary, baseline);
    await writeFile(baselinePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    console.log(
      `\n📉 Ratchet down: readJson validation baseline updated from ${baseline.totalUnvalidated} to ${updated.totalUnvalidated} (-${baseline.totalUnvalidated - updated.totalUnvalidated} unvalidated sites).`,
    );
  } else {
    console.log(
      `\n📉 Unvalidated response sites fell from ${baseline.totalUnvalidated} to ${summary.unvalidatedSites.length} (-${baseline.totalUnvalidated - summary.unvalidatedSites.length}). Pass --ratchet to record new baseline.`,
    );
  }
} else {
  console.log("\n✅ readJson validation check passed (no regressions against baseline).");
}
