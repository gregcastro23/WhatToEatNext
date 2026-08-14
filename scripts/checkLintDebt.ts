import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
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

for (const result of results) {
  lintErrors += result.errorCount;
  for (const message of result.messages) {
    if (message.ruleId && Object.hasOwn(counts, message.ruleId)) {
      counts[message.ruleId] = (counts[message.ruleId] ?? 0) + 1;
    }
  }
}

if (lintErrors > 0) {
  console.error(
    `Audit aborted: the normal lint configuration reported ${lintErrors} error(s).`,
  );
  process.exit(1);
}

const declinedRules = new Set(Object.keys(baseline.declined.rules));
const trackedTotal = Object.entries(counts).reduce(
  (total, [rule, count]) => total + (declinedRules.has(rule) ? 0 : count),
  0,
);
const comparison = compareLintDebt(trackedTotal, baseline.trackedTotal);

console.log(trackedTotal);

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
