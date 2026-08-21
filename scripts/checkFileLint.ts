import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { AUDITED_RULES } from "../eslint.config.audit.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
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

let totalWarnings = 0;
const counts: Record<string, number> = {};

for (const result of results) {
  console.log(`\nFile: ${result.filePath}`);
  let fileWarnings = 0;
  for (const message of result.messages) {
    if (message.ruleId && auditedRuleNames.has(message.ruleId)) {
      counts[message.ruleId] = (counts[message.ruleId] ?? 0) + 1;
      fileWarnings++;
      totalWarnings++;
      console.log(`  [L${message.line}:${message.column}] [${message.ruleId}] ${message.message}`);
    }
  }
  console.log(`File Total: ${fileWarnings} warnings`);
}

console.log(`\n========================================`);
console.log(`Total Tracked Warnings: ${totalWarnings}`);
for (const [rule, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}
