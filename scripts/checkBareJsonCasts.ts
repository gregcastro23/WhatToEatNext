import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  bareJsonCastsBaselineSchema,
  compareBareJsonCasts,
  scanBareJsonCasts,
  updateBareJsonCastsBaseline,
} from "./lib/bareJsonCasts";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.bare-json-casts-baseline.json", import.meta.url);

const baselineRaw = await readFile(baselinePath, "utf8");
const baseline = bareJsonCastsBaselineSchema.parse(JSON.parse(baselineRaw));

console.log("Running bare response.json() as T cast scan (plus predicate-less z.custom<T>())...");
const summary = scanBareJsonCasts(path.join(repoRoot, "src"), repoRoot);
const opaqueCustom = summary.sites.filter((s) => s.kind === "opaque-custom" && !s.isTest).length;

console.log(
  `\n=== BARE JSON CASTS: ${summary.production} production (${summary.total} total) across ${Object.keys(summary.byFile).length} files ===`,
);
console.log(
  `  of which ${summary.production - opaqueCustom} are res.json() casts and ${opaqueCustom} are z.custom<T>() with no predicate`,
);
console.log(
  `Baseline: ${baseline.production} production (${baseline.total} total) across ${Object.keys(baseline.byFile ?? {}).length} files`,
);

const comparison = compareBareJsonCasts(summary, baseline);

if (comparison.regressedFiles.length > 0) {
  console.error(`\n❌ PER-FILE REGRESSION: ${comparison.regressedFiles.length} file(s) regressed:`);
  for (const { file, current, baseline: baseCount } of comparison.regressedFiles) {
    console.error(`  - ${file}: ${current} (was ${baseCount}, +${current - baseCount})`);
  }
}

if (comparison.productionIncreasedBy > 0) {
  console.error(
    `\n❌ PRODUCTION REGRESSION: Production bare JSON casts increased from ${baseline.production} to ${summary.production} (+${comparison.productionIncreasedBy}).`,
  );
}

if (comparison.totalIncreasedBy > 0) {
  console.error(
    `\n❌ TOTAL REGRESSION: Total bare JSON casts increased from ${baseline.total} to ${summary.total} (+${comparison.totalIncreasedBy}).`,
  );
}

if (comparison.exceedsBaseline) {
  process.exit(1);
}

if (summary.production < baseline.production || summary.total < baseline.total) {
  const shouldRatchet = process.argv.includes("--ratchet");
  if (shouldRatchet) {
    const updated = updateBareJsonCastsBaseline(summary, baseline);
    await writeFile(baselinePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    console.log(
      `\n📉 Ratchet down: bare JSON casts baseline updated from ${baseline.production} prod (${baseline.total} total) to ${updated.production} prod (${updated.total} total).`,
    );
  } else {
    console.log(
      `\n📉 Bare JSON casts fell: pass --ratchet to record new baseline.`,
    );
  }
} else {
  console.log("\n✅ Bare JSON casts check passed (no regressions against baseline).");
}
