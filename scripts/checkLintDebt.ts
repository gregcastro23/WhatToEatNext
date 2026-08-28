import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

import { AUDITED_RULES } from "../eslint.config.audit.mjs";
import { compareLintDebt, lintDebtBaselineSchema } from "./lib/lintDebt";

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
const comparison = compareLintDebt(trackedTotal, baseline.trackedTotal);

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

if (comparison.exceedsBaseline) {
  console.error(
    `Lint debt increased by ${comparison.increasedBy}: ` +
      `${trackedTotal} exceeds the baseline of ${baseline.trackedTotal}.`,
  );
  for (const [rule, count] of Object.entries(counts).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const baselineCount = baseline.rules[rule]?.count ?? 0;
    const delta = count - baselineCount;

    if (!declinedRules.has(rule) && delta !== 0) {
      console.error(
        `  ${rule}: ${baselineCount} -> ${count} (${delta > 0 ? "+" : ""}${delta})`,
      );
    }
  }
  process.exit(1);
}

if (trackedTotal < baseline.trackedTotal) {
  const decreasedBy = baseline.trackedTotal - trackedTotal;
  console.log(
    `🎉 Lint debt decreased by ${decreasedBy}: ${trackedTotal} (down from ${baseline.trackedTotal}).`,
  );
  if (process.argv.includes("--ratchet") || process.env.LINT_DEBT_AUTO_RATCHET === "1") {
    const updatedBaseline = {
      ...baseline,
      trackedTotal,
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
    console.log(`🔒 Baseline auto-ratcheted down to ${trackedTotal}.`);
  }
}

