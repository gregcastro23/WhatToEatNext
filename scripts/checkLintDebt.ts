import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

import { AUDITED_RULES } from "../eslint.config.audit.mjs";
import {
  compareAssertionSites,
  compareCasts,
  compareDeclinedDebt,
  compareLintDebt,
  countTypeCasts,
  findPerRuleRegressions,
  lintDebtBaselineSchema,
  scanAssertionSites,
  scanFileCasts,
} from "./lib/lintDebt";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.lint-debt-baseline.json", import.meta.url);
const baseline = lintDebtBaselineSchema.parse(
  JSON.parse(await readFile(baselinePath, "utf8")),
);
const auditedRuleNames = Object.keys(AUDITED_RULES).sort();
const baselineRuleNames = Object.keys(baseline.rules).sort();

execFileSync("./node_modules/.bin/next", ["typegen"], {
  cwd: repoRoot,
  stdio: "ignore",
});

if (JSON.stringify(auditedRuleNames) !== JSON.stringify(baselineRuleNames)) {
  console.error(
    "Lint debt configuration and baseline cover different rules; re-run the full audit and update both together.",
  );
  process.exit(1);
}

const eslint = new ESLint({
  cwd: repoRoot,
  overrideConfigFile: "eslint.config.audit.mjs",
});
const results = await eslint.lintFiles(["src"]);
const counts: Record<string, number> = Object.fromEntries(
  auditedRuleNames.map((rule) => [rule, 0]),
);
let lintErrors = 0;

const declinedRules = new Set(Object.keys(baseline.declined.rules));

interface FileDebt {
  filePath: string;
  trackedCount: number;
  byRule: Record<string, number>;
}

const fileDebts: FileDebt[] = [];

for (const result of results) {
  lintErrors += result.errorCount;
  let fileTrackedCount = 0;
  const fileByRule: Record<string, number> = {};

  for (const message of result.messages) {
    if (message.ruleId && Object.hasOwn(counts, message.ruleId)) {
      counts[message.ruleId] = (counts[message.ruleId] ?? 0) + 1;
      if (!declinedRules.has(message.ruleId)) {
        fileTrackedCount += 1;
        fileByRule[message.ruleId] = (fileByRule[message.ruleId] ?? 0) + 1;
      }
    }
  }

  if (fileTrackedCount > 0) {
    fileDebts.push({
      filePath: path.relative(repoRoot, result.filePath),
      trackedCount: fileTrackedCount,
      byRule: fileByRule,
    });
  }
}

if (lintErrors > 0) {
  console.error(
    `Audit aborted: the normal lint configuration reported ${lintErrors} error(s).`,
  );
  process.exit(1);
}

const trackedTotal = Object.entries(counts).reduce(
  (total, [rule, count]) => total + (declinedRules.has(rule) ? 0 : count),
  0,
);
const declinedTotal = Object.entries(counts).reduce(
  (total, [rule, count]) => total + (declinedRules.has(rule) ? count : 0),
  0,
);

const baselineDeclinedTotal =
  baseline.declined.total ??
  Object.values(baseline.declined.rules).reduce((a, b) => a + b, 0);

// Scan and count type casts (as any, as unknown as) in src/
const castScan = scanFileCasts(path.join(repoRoot, "src"), repoRoot);
const currentCasts = castScan.summary;
const baselineCasts = baseline.casts;

if (!baselineCasts) {
  console.error("❌ Baseline is missing the required `casts` section; aborting audit.");
  process.exit(1);
}

// Distinct assertion sites (AST). A chain counts once, so relabelling
// `as unknown as T` into `as T` cannot move this number — only deleting an
// assertion can. See Operating Rule 8.
const siteScan = scanAssertionSites(path.join(repoRoot, "src"), repoRoot);
const currentSites = { ...siteScan.summary };
const baselineSites = baseline.assertionSites;

if (!baselineSites) {
  console.error(
    "❌ Baseline is missing the required `assertionSites` section; aborting audit.",
  );
  process.exit(1);
}

const comparison = compareLintDebt(trackedTotal, baseline.trackedTotal);
const declinedComparison = compareDeclinedDebt(declinedTotal, baselineDeclinedTotal);
const castComparison = compareCasts(currentCasts, baselineCasts);
const siteComparison = compareAssertionSites(currentSites, baselineSites);
const ruleRegressions = findPerRuleRegressions(counts, baseline.rules, declinedRules);

console.log(trackedTotal);

fileDebts.sort((a, b) => b.trackedCount - a.trackedCount);

// Check if --top, --ranking, or --casts flag was requested
const topArgIdx = process.argv.findIndex((arg) => arg === "--top" || arg === "--ranking");
const showTop = topArgIdx !== -1 || process.argv.includes("--files");
let topN = 25;
if (topArgIdx !== -1 && process.argv[topArgIdx + 1] && /^\d+$/.test(process.argv[topArgIdx + 1])) {
  topN = parseInt(process.argv[topArgIdx + 1], 10);
}

const showCasts = process.argv.includes("--casts") || process.argv.includes("--top-casts");
const castArgIdx = process.argv.findIndex((arg) => arg === "--top-casts");
let topCastsN = 25;
if (castArgIdx !== -1 && process.argv[castArgIdx + 1] && /^\d+$/.test(process.argv[castArgIdx + 1])) {
  topCastsN = parseInt(process.argv[castArgIdx + 1], 10);
}

if (showTop) {
  console.log(`\n=== TOP ${Math.min(topN, fileDebts.length)} FILES BY TRACKED DEBT (${trackedTotal} total tracked) ===`);
  for (const item of fileDebts.slice(0, topN)) {
    const topRules = Object.entries(item.byRule)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([r, c]) => `${r.replace("@typescript-eslint/", "")}: ${c}`)
      .join(", ");
    console.log(`${item.trackedCount.toString().padStart(4)} warnings: ${item.filePath}`);
    console.log(`     (${topRules})`);
  }
  console.log("");
}

if (showCasts) {
  const prodCasts = castScan.files.filter((f) => !f.isTest);
  const testCasts = castScan.files.filter((f) => f.isTest);
  const prodTotal = prodCasts.reduce((s, f) => s + f.total, 0);
  const prodAsAny = prodCasts.reduce((s, f) => s + f.asAny, 0);
  const prodAsUnknownAs = prodCasts.reduce((s, f) => s + f.asUnknownAs, 0);
  const testTotal = testCasts.reduce((s, f) => s + f.total, 0);
  const testAsAny = testCasts.reduce((s, f) => s + f.asAny, 0);
  const testAsUnknownAs = testCasts.reduce((s, f) => s + f.asUnknownAs, 0);

  console.log(`\n=== TYPE CAST SURFACE: ${currentCasts.total} total (${currentCasts.asAny} as any, ${currentCasts.asUnknownAs} as unknown as) ===`);
  console.log(`  Production: ${prodTotal} (${prodAsAny} as any, ${prodAsUnknownAs} as unknown as) | Test: ${testTotal} (${testAsAny} as any, ${testAsUnknownAs} as unknown as)`);
  console.log(`  Untracked single \`as T\` assertions (regex, uppercase-only): ${currentCasts.untrackedSingleAsT ?? 0}`);
  console.log(
    `\n=== ASSERTION SITES (AST): ${currentSites.total} distinct ` +
      `(${currentSites.asAny} as any, ${currentSites.chained} chained, ${currentSites.single} single) ===`,
  );
  console.log(
    `  Production: ${currentSites.production} | Test: ${currentSites.test}` +
      `  [monitored: ${currentSites.asConst} \`as const\`, ${currentSites.nonNull} non-null \`!\`]`,
  );
  console.log(`=== TOP ${Math.min(topCastsN, siteScan.files.length)} FILES BY ASSERTION SITES ===`);
  for (const item of siteScan.files.slice(0, topCastsN)) {
    const tag = item.isTest ? "[TEST] " : "       ";
    console.log(
      `${item.total.toString().padStart(4)} sites (${item.asAny.toString().padStart(2)} any, ` +
        `${item.chained.toString().padStart(2)} chained, ${item.single.toString().padStart(3)} single) ${tag}: ${item.filePath}`,
    );
  }
  console.log(`\n=== TOP ${Math.min(topCastsN, castScan.files.length)} FILES BY GATED CASTS ===`);
  for (const item of castScan.files.slice(0, topCastsN)) {
    const tag = item.isTest ? "[TEST] " : "       ";
    console.log(`${item.total.toString().padStart(4)} casts (${item.asAny.toString().padStart(2)} as any, ${item.asUnknownAs.toString().padStart(2)} as unknown as, ${(item.untrackedSingleAsT ?? 0).toString().padStart(3)} as T) ${tag}: ${item.filePath}`);
  }
  console.log("");
}

let hasError = false;

if (comparison.exceedsBaseline) {
  hasError = true;
  console.error(
    `❌ Lint debt increased by ${comparison.increasedBy}: ` +
      `${trackedTotal} exceeds the baseline of ${baseline.trackedTotal}.`,
  );
}

if (ruleRegressions.length > 0) {
  hasError = true;
  console.error(`❌ Per-rule non-regression check failed (${ruleRegressions.length} rule(s) regressed):`);
  for (const reg of ruleRegressions) {
    console.error(`  ${reg.rule}: ${reg.baselineCount} -> ${reg.currentCount} (+${reg.delta})`);
  }
}

if (declinedComparison.exceedsBaseline) {
  hasError = true;
  console.error(
    `❌ Declined rules pool increased by ${declinedComparison.increasedBy}: ` +
      `${declinedTotal} exceeds baseline of ${baselineDeclinedTotal}.`,
  );
}

if (castComparison.exceedsBaseline) {
  hasError = true;
  if (castComparison.totalIncreasedBy > 0) {
    console.error(
      `❌ Type casts increased by ${castComparison.totalIncreasedBy}: ` +
        `${currentCasts.total} exceeds baseline of ${baselineCasts.total} ` +
        `(as any: ${currentCasts.asAny} vs ${baselineCasts.asAny}, as unknown as: ${currentCasts.asUnknownAs} vs ${baselineCasts.asUnknownAs}).`,
    );
  }
  if (castComparison.asAnyIncreasedBy > 0 && castComparison.totalIncreasedBy === 0) {
    console.error(
      `❌ \`as any\` casts increased by ${castComparison.asAnyIncreasedBy}: ` +
        `${currentCasts.asAny} exceeds baseline of ${baselineCasts.asAny} (total casts remained ${currentCasts.total}).`,
    );
  }
  if (castComparison.productionIncreasedBy > 0 && castComparison.totalIncreasedBy === 0) {
    console.error(
      `❌ Production type casts increased by ${castComparison.productionIncreasedBy}: ` +
        `${currentCasts.production} exceeds baseline of ${baselineCasts.production}.`,
    );
  }
}

if (siteComparison.exceedsBaseline) {
  hasError = true;
  if (siteComparison.totalIncreasedBy > 0) {
    console.error(
      `❌ Assertion sites increased by ${siteComparison.totalIncreasedBy}: ` +
        `${currentSites.total} exceeds baseline of ${baselineSites.total} ` +
        `(as any: ${currentSites.asAny} vs ${baselineSites.asAny}, chained: ${currentSites.chained} vs ${baselineSites.chained}, single: ${currentSites.single} vs ${baselineSites.single}).`,
    );
  }
  if (siteComparison.asAnyIncreasedBy > 0 && siteComparison.totalIncreasedBy === 0) {
    console.error(
      `❌ \`as any\` assertion sites increased by ${siteComparison.asAnyIncreasedBy}: ` +
        `${currentSites.asAny} exceeds baseline of ${baselineSites.asAny} (site total remained ${currentSites.total}).`,
    );
  }
  if (siteComparison.productionIncreasedBy > 0 && siteComparison.totalIncreasedBy === 0) {
    console.error(
      `❌ Production assertion sites increased by ${siteComparison.productionIncreasedBy}: ` +
        `${currentSites.production} exceeds baseline of ${baselineSites.production}.`,
    );
  }
}

if (hasError) {
  process.exit(1);
}

const shouldRatchet = process.argv.includes("--ratchet") || process.env.LINT_DEBT_AUTO_RATCHET === "1";

if (
  trackedTotal < baseline.trackedTotal ||
  currentCasts.total < baselineCasts.total ||
  currentCasts.asAny < baselineCasts.asAny ||
  (baselineCasts.production !== undefined && (currentCasts.production ?? 0) < baselineCasts.production) ||
  currentSites.total < baselineSites.total ||
  currentSites.asAny < baselineSites.asAny ||
  currentSites.production < baselineSites.production ||
  declinedTotal < baselineDeclinedTotal
) {
  if (trackedTotal < baseline.trackedTotal) {
    const decreasedBy = baseline.trackedTotal - trackedTotal;
    console.log(
      `🎉 Lint debt decreased by ${decreasedBy}: ${trackedTotal} (down from ${baseline.trackedTotal}).`,
    );
  }
  if (currentCasts.total < baselineCasts.total || currentCasts.asAny < baselineCasts.asAny) {
    const castsDecreasedBy = baselineCasts.total - currentCasts.total;
    console.log(
      `🎉 Type casts decreased: ${currentCasts.total} (down ${castsDecreasedBy >= 0 ? castsDecreasedBy : 0} from ${baselineCasts.total}; as any: ${currentCasts.asAny} vs baseline ${baselineCasts.asAny}, as unknown as: ${currentCasts.asUnknownAs} vs baseline ${baselineCasts.asUnknownAs}).`,
    );
  }
  if (currentSites.total < baselineSites.total) {
    console.log(
      `🎉 Assertion sites decreased by ${baselineSites.total - currentSites.total}: ` +
        `${currentSites.total} (down from ${baselineSites.total}).`,
    );
  } else if (
    currentSites.chained < baselineSites.chained &&
    currentSites.total === baselineSites.total
  ) {
    console.log(
      `ℹ️  ${baselineSites.chained - currentSites.chained} chained assertion(s) became single ` +
        `assertions but the site total held at ${currentSites.total}: that is relabelling, not remediation (Rule 8).`,
    );
  }
  if (declinedTotal < baselineDeclinedTotal) {
    const declinedDecreasedBy = baselineDeclinedTotal - declinedTotal;
    console.log(
      `🎉 Declined rules pool decreased by ${declinedDecreasedBy}: ${declinedTotal} (down from ${baselineDeclinedTotal}).`,
    );
  }

  if (shouldRatchet) {
    const updatedBaseline = {
      ...baseline,
      trackedTotal,
      casts: {
        total: Math.min(currentCasts.total, baselineCasts.total),
        asAny: Math.min(currentCasts.asAny, baselineCasts.asAny),
        asUnknownAs: Math.min(currentCasts.asUnknownAs, baselineCasts.asUnknownAs),
        production: Math.min(currentCasts.production ?? 0, baselineCasts.production ?? (currentCasts.production ?? 0)),
        test: Math.min(currentCasts.test ?? 0, baselineCasts.test ?? (currentCasts.test ?? 0)),
        untrackedSingleAsT: currentCasts.untrackedSingleAsT ?? 0,
      },
      assertionSites: {
        total: Math.min(currentSites.total, baselineSites.total),
        asAny: Math.min(currentSites.asAny, baselineSites.asAny),
        chained: currentSites.chained,
        single: currentSites.single,
        production: Math.min(currentSites.production, baselineSites.production),
        test: currentSites.test,
        asConst: currentSites.asConst,
        nonNull: currentSites.nonNull,
      },
      declined: {
        total: declinedTotal,
        rules: Object.fromEntries(
          Object.entries(baseline.declined.rules).map(([rule, prevCount]) => [
            rule,
            counts[rule] ?? prevCount,
          ]),
        ),
      },
      rules: Object.fromEntries(
        Object.entries(baseline.rules).map(([rule, info]) => [
          rule,
          {
            ...info,
            count: counts[rule] ?? info.count,
          },
        ]),
      ),
    };
    await writeFile(baselinePath, JSON.stringify(updatedBaseline, null, 2) + "\n", "utf8");
    console.log(`🔒 Baseline auto-ratcheted down: tracked ${trackedTotal}, declined ${declinedTotal}, casts ${updatedBaseline.casts.total} (as any: ${updatedBaseline.casts.asAny}, prod: ${updatedBaseline.casts.production}, test: ${updatedBaseline.casts.test}), assertion sites ${updatedBaseline.assertionSites.total} (as any: ${updatedBaseline.assertionSites.asAny}, prod: ${updatedBaseline.assertionSites.production}).`);
  }
}


