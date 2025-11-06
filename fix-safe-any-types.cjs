#!/usr/bin/env node

/**
 * Fix Safe Any Types
 *
 * Only fixes the absolutely safest any type patterns
 */

const fs = require("fs");
const { execSync } = require("child_process");

function fixSafeAnyTypes(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let fixes = 0;
    const originalContent = content;

    // Only the absolutely safest patterns
    const replacements = [
      // any[] -> unknown[]
      {
        pattern: /\bany\[\]/g,
        replacement: "unknown[]",
        description: "array types",
      },
      // Array<any> -> Array<unknown>
      {
        pattern: /Array<any>/g,
        replacement: "Array<unknown>",
        description: "Array generic types",
      },
      // Record<string, any> -> Record<string, unknown>
      {
        pattern: /Record<string,\s*any>/g,
        replacement: "Record<string, unknown>",
        description: "Record types",
      },
    ];

    for (const { pattern, replacement, description } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        fixes += matches.length;
        console.log(`  ✓ ${description}: ${matches.length} fixes`);
      }
    }

    if (fixes > 0) {
      // Create backup
      const backupPath = `${filePath}.safe-any-backup-${Date.now()}`;
      fs.writeFileSync(backupPath, originalContent);

      // Write fixed content
      fs.writeFileSync(filePath, content);
      console.log(`📝 Applied ${fixes} fixes to ${filePath.split("/").pop()}`);

      // Test TypeScript compilation immediately
      try {
        execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
        console.log("✅ TypeScript compilation successful");
        return fixes;
      } catch (error) {
        console.log("❌ TypeScript compilation failed - restoring backup");
        fs.writeFileSync(filePath, originalContent);
        return 0;
      }
    }

    return fixes;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function getTopFiles() {
  try {
    const output = execSync(
      'yarn lint --format=unix 2>/dev/null | grep "@typescript-eslint/no-explicit-any" | cut -d: -f1 | sort | uniq -c | sort -nr | head -20',
      { encoding: "utf8" },
    );
    const files = [];

    output.split("\n").forEach((line) => {
      const match = line.trim().match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        const count = parseInt(match[1]);
        const filePath = match[2].trim();
        files.push({ path: filePath, count });
      }
    });

    return files;
  } catch (error) {
    console.log("Error getting files:", error.message);
    return [];
  }
}

console.log("🔧 Fix Safe Any Types");
console.log("=====================");

const files = getTopFiles();
console.log(`📊 Found ${files.length} files with explicit-any issues`);

let totalFixes = 0;
for (const { path: filePath, count } of files.slice(0, 15)) {
  console.log(`\n🎯 Processing ${filePath.split("/").pop()} (${count} issues)`);
  const fixes = fixSafeAnyTypes(filePath);
  totalFixes += fixes;
}

console.log(`\n📊 Campaign Summary:`);
console.log(`   Total files processed: ${Math.min(files.length, 15)}`);
console.log(`   Total fixes applied: ${totalFixes}`);

// Final check
console.log(`\n🧪 Final validation...`);
try {
  const lintOutput = execSync(
    'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
    { encoding: "utf8" },
  );
  const remainingIssues = parseInt(lintOutput.trim());
  console.log(`📊 Remaining explicit-any issues: ${remainingIssues}`);

  if (totalFixes > 0) {
    console.log(
      `🎉 Successfully reduced explicit-any issues by ${totalFixes}!`,
    );
  }
} catch (error) {
  console.log("Could not count remaining issues");
}
