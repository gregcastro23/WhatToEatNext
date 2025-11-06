#!/usr/bin/env node

/**
 * Targeted Array Type Improvements
 *
 * Focuses on specific, safe array type patterns with enhanced safety checks
 */

const fs = require("fs");
const { execSync } = require("child_process");

// Get current linting count for tracking
function getCurrentExplicitAnyCount() {
  try {
    const result = execSync(
      'yarn lint --max-warnings=10000 2>&1 | grep -E "@typescript-eslint/no-explicit-any" | wc -l',
      { encoding: "utf8" },
    );
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
}

function validateTypeScriptCompilation() {
  try {
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

function fixArrayTypesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let fixes = 0;
    const originalContent = content;

    // Very specific, safe patterns only
    const safeReplacements = [
      // Logger spread operator arrays (safe - just for logging)
      {
        pattern: /\.\.\.\(options\.rest as any\[\]\)/g,
        replacement: "...(options.rest as unknown[])",
        description: "logger rest parameters to unknown[]",
      },
      // Generic utility function parameters (safe when used for iteration/filtering)
      {
        pattern: /function\s+\w+\([^)]*items:\s*any\[\]/g,
        replacement: (match) => match.replace("any[]", "unknown[]"),
        description: "utility function parameters to unknown[]",
      },
      // Function return types for utility functions
      {
        pattern: /\):\s*any\[\]/g,
        replacement: "): unknown[]",
        description: "function return types to unknown[]",
      },
    ];

    for (const replacement of safeReplacements) {
      const matches = content.match(replacement.pattern);
      if (matches) {
        if (typeof replacement.replacement === "function") {
          content = content.replace(
            replacement.pattern,
            replacement.replacement,
          );
        } else {
          content = content.replace(
            replacement.pattern,
            replacement.replacement,
          );
        }
        fixes += matches.length;
        console.log(`  ✓ ${replacement.description}: ${matches.length} fixes`);
      }
    }

    return { content, fixes, originalContent };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { content: null, fixes: 0, originalContent: null };
  }
}

async function main() {
  console.log("🔧 Targeted Array Type Improvements");
  console.log("====================================");

  const startingCount = getCurrentExplicitAnyCount();
  console.log(`📊 Starting explicit-any count: ${startingCount}`);

  // Target specific files that we know have safe patterns
  const targetFiles = [
    "/Users/GregCastro/Desktop/WhatToEatNext/src/utils/logger.ts",
    "/Users/GregCastro/Desktop/WhatToEatNext/src/utils/naturalLanguageProcessor.ts",
  ];

  let totalFixes = 0;
  let filesFixed = 0;

  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`\n🎯 Processing ${filePath.split("/").pop()}`);

      const { content, fixes, originalContent } = fixArrayTypesInFile(filePath);

      if (fixes > 0 && content) {
        // Create backup
        const backupPath = `${filePath}.array-backup-${Date.now()}`;
        fs.writeFileSync(backupPath, originalContent);

        // Apply fixes
        fs.writeFileSync(filePath, content);

        // Validate compilation
        if (validateTypeScriptCompilation()) {
          console.log(`✅ TypeScript compilation successful`);
          console.log(
            `📝 Applied ${fixes} fixes to ${filePath.split("/").pop()}`,
          );
          console.log(`🔄 Backup created: ${backupPath.split("/").pop()}`);
          totalFixes += fixes;
          filesFixed++;
        } else {
          // Restore backup
          fs.writeFileSync(filePath, originalContent);
          console.log(`❌ TypeScript compilation failed - restored backup`);
          fs.unlinkSync(backupPath);
        }
      } else {
        console.log(`ℹ️ No array type patterns found or safe to fix`);
      }
    }
  }

  const endingCount = getCurrentExplicitAnyCount();
  const totalReduction = startingCount - endingCount;

  console.log(`\n📊 Campaign Summary:`);
  console.log(`   Files processed: ${targetFiles.length}`);
  console.log(`   Files successfully fixed: ${filesFixed}`);
  console.log(`   Total array type fixes applied: ${totalFixes}`);
  console.log(`   Explicit-any count: ${startingCount} → ${endingCount}`);
  console.log(`   Net reduction: ${totalReduction}`);

  if (totalFixes > 0) {
    console.log(
      `\n🎉 Successfully improved ${totalFixes} array type patterns!`,
    );
    console.log(
      `📈 Reduction: ${((totalReduction / startingCount) * 100).toFixed(1)}% of total explicit-any issues`,
    );
  }
}

main().catch(console.error);
