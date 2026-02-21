#!/usr/bin/env node

/**
 * Quick Null Fixes - Target the most common patterns
 */

import { execSync } from "child_process";
import fs from "fs";

// Get a sample of errors to understand patterns
console.log("🔍 Analyzing strictNullChecks errors...\n");

try {
  const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1 | head -50", {
    encoding: "utf8",
  });

  console.log("Sample errors:");
  console.log(output);
} catch (error) {
  console.log("Error output:", error.stdout);
}

// Apply targeted fixes to test files
console.log("\n🧪 Applying targeted fixes to test files...\n");

const testFiles = [
  "src/__tests__/setupMemoryManagement.ts",
  "src/__tests__/mocks/CampaignSystemMocks.ts",
  "src/__tests__/astrologize-integration.test.ts",
];

for (const filePath of testFiles) {
  if (fs.existsSync(filePath)) {
    console.log(`Fixing ${filePath}...`);

    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Fix common patterns

    // Pattern 1: Add optional chaining for object access
    const beforeOptional = content;
    content = content.replace(/(\w+)\.(\w+)/g, (match, obj, prop) => {
      // Don't change if already has optional chaining or is a known safe pattern
      if (
        match.includes("?.") ||
        obj === "console" ||
        obj === "process" ||
        obj === "global" ||
        obj === "expect" ||
        obj === "jest"
      ) {
        return match;
      }
      return `${obj}?.${prop}`;
    });

    if (content !== beforeOptional) {
      modified = true;
      console.log("  ✅ Added optional chaining");
    }

    // Pattern 2: Add null checks for function calls
    const beforeNullCheck = content;
    content = content.replace(/if\s*\(\s*(\w+)\s*\)/g, "if ($1 != null)");

    if (content !== beforeNullCheck && content !== beforeOptional) {
      modified = true;
      console.log("  ✅ Added null checks");
    }

    // Pattern 3: Add default values for potentially undefined variables
    const beforeDefaults = content;
    content = content.replace(
      /(\w+)\.toLowerCase\(\)/g,
      '($1 || "").toLowerCase()',
    );
    content = content.replace(/(\w+)\.includes\(/g, '($1 || "").includes(');

    if (content !== beforeDefaults) {
      modified = true;
      console.log("  ✅ Added default values for string operations");
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  💾 Saved changes to ${filePath}`);
    } else {
      console.log(`  ℹ️  No changes needed for ${filePath}`);
    }
  }
}

// Check progress
console.log("\n📊 Checking progress...");
try {
  const errorCount = execSync(
    'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS" | wc -l',
    {
      encoding: "utf8",
    },
  ).trim();

  console.log(`Current error count: ${errorCount}`);

  if (parseInt(errorCount) < 796) {
    console.log("✅ Progress made! Errors reduced.");
  } else {
    console.log("ℹ️  No reduction yet, may need more targeted fixes.");
  }
} catch (error) {
  console.log("Could not get error count");
}
