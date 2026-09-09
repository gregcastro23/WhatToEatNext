import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseUntrackedSourceFiles } from "./lib/untrackedSourceFiles";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

let statusOutput = "";
try {
  statusOutput = execSync("git status --porcelain -uall src scripts", {
    cwd: repoRoot,
    encoding: "utf8",
  });
} catch (err) {
  console.error("❌ Failed to query git status:", err);
  process.exit(1);
}

const untracked = parseUntrackedSourceFiles(statusOutput);

if (untracked.length > 0) {
  console.error(`\n❌ UNTRACKED SOURCE FILES DETECTED (${untracked.length} file(s) under src/ or scripts/):`);
  for (const f of untracked) {
    console.error(`  - ${f}`);
  }
  console.error("\nUntracked files corrupt tsc, check:scripts, lint:debt, and dead module audits.");
  console.error("Either git add them if intended, or delete them before verifying.\n");
  process.exit(1);
}

console.log("✅ No untracked TypeScript files under src/ or scripts/.");
