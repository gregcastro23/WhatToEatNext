import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

import { AUDITED_RULES } from "../eslint.config.audit.mjs";
import {
  compareCasts,
  compareDeclinedDebt,
  compareLintDebt,
  countTypeCasts,
  findPerRuleRegressions,
  lintDebtBaselineSchema,
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
const currentCasts = countTypeCasts(path.join(repoRoot, "src"));
const baselineCasts = baseline.casts ?? currentCasts;

const comparison = compareLintDebt(trackedTotal, baseline.trackedTotal);
const declinedComparison = compareDeclinedDebt(declinedTotal, baselineDeclinedTotal);
const castComparison = compareCasts(currentCasts, baselineCasts);
const ruleRegressions = findPerRuleRegressions(counts, baseline.rules, declinedRules);

console.log(trackedTotal);

fileDebts.sort((a, b) => b.trackedCount - a.trackedCount);

// Check if --top or --ranking flag was requested
const topArgIdx = process.argv.findIndex((arg) => arg === "--top" || arg === "--ranking");
const showTop = topArgIdx !== -1 || process.argv.includes("--files");
let topN = 25;
if (topArgIdx !== -1 && process.argv[topArgIdx + 1] && /^\d+$/.test(process.argv[topArgIdx + 1])) {
  topN = parseInt(process.argv[topArgIdx + 1], 10);
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
  console.error(
    `❌ Type casts increased by ${castComparison.increasedBy}: ` +
      `${currentCasts.total} exceeds baseline of ${baselineCasts.total} ` +
      `(as any: ${currentCasts.asAny} vs ${baselineCasts.asAny}, as unknown as: ${currentCasts.asUnknownAs} vs ${baselineCasts.asUnknownAs}).`,
  );
}

if (hasError) {
  process.exit(1);
}

const shouldRatchet = process.argv.includes("--ratchet") || process.env.LINT_DEBT_AUTO_RATCHET === "1";

if (
  trackedTotal < baseline.trackedTotal ||
  currentCasts.total < baselineCasts.total ||
  declinedTotal < baselineDeclinedTotal
) {
  if (trackedTotal < baseline.trackedTotal) {
    const decreasedBy = baseline.trackedTotal - trackedTotal;
    console.log(
      `🎉 Lint debt decreased by ${decreasedBy}: ${trackedTotal} (down from ${baseline.trackedTotal}).`,
    );
  }
  if (currentCasts.total < baselineCasts.total) {
    const castsDecreasedBy = baselineCasts.total - currentCasts.total;
    console.log(
      `🎉 Type casts decreased by ${castsDecreasedBy}: ${currentCasts.total} (down from ${baselineCasts.total}; as any: ${currentCasts.asAny}, as unknown as: ${currentCasts.asUnknownAs}).`,
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
      casts: currentCasts,
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
    console.log(`🔒 Baseline auto-ratcheted down: tracked ${trackedTotal}, declined ${declinedTotal}, casts ${currentCasts.total}.`);
  }
} else if (shouldRatchet && !baseline.casts) {
  // First time ratcheting to write casts and declined total into baseline
  const updatedBaseline = {
    ...baseline,
    trackedTotal,
    casts: currentCasts,
    declined: {
      total: declinedTotal,
      rules: Object.fromEntries(
        Object.entries(baseline.declined.rules).map(([rule, prevCount]) => [
          rule,
          counts[rule] ?? prevCount,
        ]),
      ),
    },
  };
  await writeFile(baselinePath, JSON.stringify(updatedBaseline, null, 2) + "\n", "utf8");
  console.log(`🔒 Baseline updated with cast surface (${currentCasts.total}) and declined pool (${declinedTotal}).`);
}


