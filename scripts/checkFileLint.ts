import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { AUDITED_RULES } from "../eslint.config.audit.mjs";
import { lintDebtBaselineSchema } from "./lib/lintDebt";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const baselinePath = new URL("../.lint-debt-baseline.json", import.meta.url);
const baseline = lintDebtBaselineSchema.parse(
  JSON.parse(await readFile(baselinePath, "utf8")),
);
const declinedRules = new Set(Object.keys(baseline.declined.rules));
const subBaselineRules = new Set<string>();
if (baseline.subBaselines?.preferNullishCoalescing) {
  subBaselineRules.add("@typescript-eslint/prefer-nullish-coalescing");
}

const targetFiles = process.argv.slice(2);

if (targetFiles.length === 0) {
  console.log("Usage: bun scripts/checkFileLint.ts <file1> <file2> ...");
  process.exit(1);
}

const eslint = new ESLint({
  cwd: repoRoot,
  overrideConfigFile: "eslint.config.audit.mjs",
});

const auditedRuleNames = new Set(Object.keys(AUDITED_RULES));
const results = await eslint.lintFiles(targetFiles);

let totalTrackedWarnings = 0;
let totalDeclinedWarnings = 0;
let totalSubBaselineWarnings = 0;
const trackedCounts: Record<string, number> = {};
const declinedCounts: Record<string, number> = {};
const subBaselineCounts: Record<string, number> = {};

for (const result of results) {
  console.log(`\nFile: ${result.filePath}`);
  let fileTracked = 0;
  let fileDeclined = 0;
  let fileSubBaseline = 0;
  for (const message of result.messages) {
    if (message.ruleId && auditedRuleNames.has(message.ruleId)) {
      if (declinedRules.has(message.ruleId)) {
        declinedCounts[message.ruleId] = (declinedCounts[message.ruleId] ?? 0) + 1;
        fileDeclined++;
        totalDeclinedWarnings++;
        console.log(`  [L${message.line}:${message.column}] [${message.ruleId}] (declined) ${message.message}`);
      } else if (subBaselineRules.has(message.ruleId)) {
        subBaselineCounts[message.ruleId] = (subBaselineCounts[message.ruleId] ?? 0) + 1;
        fileSubBaseline++;
        totalSubBaselineWarnings++;
        console.log(`  [L${message.line}:${message.column}] [${message.ruleId}] (sub-baseline) ${message.message}`);
      } else {
        trackedCounts[message.ruleId] = (trackedCounts[message.ruleId] ?? 0) + 1;
        fileTracked++;
        totalTrackedWarnings++;
        console.log(`  [L${message.line}:${message.column}] [${message.ruleId}] ${message.message}`);
      }
    }
  }
  console.log(
    `File Total: ${fileTracked} tracked warnings (${fileDeclined} declined, ${fileSubBaseline} sub-baseline)`,
  );
}

console.log(`\n========================================`);
console.log(`Total Tracked Warnings: ${totalTrackedWarnings}`);
for (const [rule, count] of Object.entries(trackedCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}

if (totalSubBaselineWarnings > 0) {
  console.log(`\nTotal Sub-Baseline Warnings: ${totalSubBaselineWarnings}`);
  for (const [rule, count] of Object.entries(subBaselineCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${count}`);
  }
}

if (totalDeclinedWarnings > 0) {
  console.log(`\nTotal Declined Warnings: ${totalDeclinedWarnings}`);
  for (const [rule, count] of Object.entries(declinedCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${count}`);
  }
}

