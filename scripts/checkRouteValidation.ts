import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import {
  compareRouteValidation,
  routeValidationBaselineSchema,
  scanRouteValidation,
  updateRouteValidationBaseline,
} from "./lib/routeValidation";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.route-validation-baseline.json", import.meta.url);

const baselineRaw = await readFile(baselinePath, "utf8");
const baseline = routeValidationBaselineSchema.parse(JSON.parse(baselineRaw));

console.log("Running route request body validation gate...");
const summary = scanRouteValidation(repoRoot);

console.log(
  `\n=== ROUTE VALIDATION: ${summary.unvalidated.length} unvalidated / ${summary.totalBodyReading} body-reading routes (${summary.totalRoutes} total routes) ===`,
);
console.log(
  `Baseline: ${baseline.totalUnvalidated} unvalidated across ${baseline.totalBodyReading} body-reading routes (${baseline.allowlist.length} allowlisted)`,
);

const comparison = compareRouteValidation(summary, baseline);

if (comparison.allowlistViolations.length > 0) {
  console.error(
    "\n❌ ALLOWLIST VIOLATION: The following route(s) read request body without safeParse and are not allowlisted:",
  );
  for (const file of comparison.allowlistViolations) {
    console.error(`  - ${file}`);
  }
}

if (comparison.totalIncreasedBy > 0) {
  console.error(
    `\n❌ TOTAL REGRESSION: Unvalidated route count increased from ${baseline.totalUnvalidated} to ${summary.unvalidated.length} (+${comparison.totalIncreasedBy}).`,
  );
}

if (comparison.exceedsBaseline) {
  process.exit(1);
}

if (summary.unvalidated.length < baseline.totalUnvalidated) {
  const shouldRatchet = process.argv.includes("--ratchet");
  if (shouldRatchet) {
    const updated = updateRouteValidationBaseline(summary, baseline);
    await writeFile(baselinePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    console.log(
      `\n📉 Ratchet down: route validation baseline updated from ${baseline.totalUnvalidated} to ${updated.totalUnvalidated} (-${baseline.totalUnvalidated - updated.totalUnvalidated} unvalidated routes).`,
    );
  } else {
    console.log(
      `\n📉 Unvalidated routes fell from ${baseline.totalUnvalidated} to ${summary.unvalidated.length} (-${baseline.totalUnvalidated - summary.unvalidated.length}). Pass --ratchet to record new baseline.`,
    );
  }
} else {
  console.log("\n✅ Route validation check passed (no regressions against baseline).");
}
