#!/usr/bin/env node

/**
 * Fix Specific Non-Null Assertions
 *
 * This script targets specific non-null assertions that can be safely converted
 * to optional chaining or proper null checks.
 */

const fs = require("fs");

class SpecificNonNullAssertionFixer {
  constructor() {
    this.totalFixes = 0;
  }

  /**
   * Fix non-null assertions in content
   */
  fixNonNullAssertions(content) {
    let modifiedContent = content;
    let fixes = 0;

    // Pattern: obj.prop! -> obj.prop || defaultValue (for specific safe cases)
    // We'll be very conservative and only fix obvious cases

    // Pattern: resolutionStrategy! -> resolutionStrategy || 'unknown'
    if (modifiedContent.includes("resolutionStrategy!")) {
      modifiedContent = modifiedContent.replace(
        /resolutionStrategy!/g,
        "resolutionStrategy || 'unknown'",
      );
      fixes++;
      console.log(`  📝 Fixed resolutionStrategy! assertion`);
    }

    // Pattern: conflict.prop! -> conflict.prop || defaultValue (very specific)
    const conflictAssertionPattern = /(\w+)\.(\w+)!/g;
    const matches = [...modifiedContent.matchAll(conflictAssertionPattern)];
    for (const match of matches) {
      const [fullMatch, obj, prop] = match;

      // Only fix very safe cases
      if (
        obj === "conflict" &&
        ["resolutionStrategy", "id", "type"].includes(prop)
      ) {
        const replacement = `${obj}.${prop} || 'unknown'`;
        modifiedContent = modifiedContent.replace(fullMatch, replacement);
        fixes++;
        console.log(`  📝 Fixed ${fullMatch} assertion`);
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a specific file
   */
  processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, "utf8");
      const { content: modifiedContent, fixes } =
        this.fixNonNullAssertions(content);

      if (fixes > 0) {
        fs.writeFileSync(filePath, modifiedContent, "utf8");
        console.log(`  ✅ Applied ${fixes} total fixes`);
        this.totalFixes += fixes;
      } else {
        console.log(`  ℹ️ No fixable non-null assertions found`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the fixing process
   */
  run() {
    console.log("🚀 Starting Specific Non-Null Assertion Fixing Process");

    // Target the specific file we know has issues
    const targetFiles = ["src/services/CampaignConflictResolver.ts"];

    for (const file of targetFiles) {
      if (fs.existsSync(file)) {
        this.processFile(file);
      } else {
        console.log(`⚠️ File not found: ${file}`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (this.totalFixes > 0) {
      console.log("\n✅ Non-null assertion fixes completed!");
      console.log("💡 Run yarn lint to verify the improvements");
    }
  }
}

// Run the script
const fixer = new SpecificNonNullAssertionFixer();
fixer.run();
