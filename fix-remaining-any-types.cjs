#!/usr/bin/env node

/**
 * Clean up remaining any types in test files
 */

const fs = require("fs");
const path = require("path");

class RemainingAnyTypeCleanup {
  constructor() {
    this.processedFiles = 0;
    this.anyTypesReplaced = 0;
    this.backupDir = `.remaining-any-cleanup-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async execute() {
    console.log("🔧 Cleaning up remaining any types in test files...");

    const testFiles = [
      "src/services/campaign/TypeScriptErrorAnalyzer.test.ts",
      "src/services/campaign/LintingWarningAnalyzer.test.ts",
    ];

    for (const filePath of testFiles) {
      if (fs.existsSync(filePath)) {
        await this.cleanupAnyTypesInFile(filePath);
      }
    }

    this.printSummary();
  }

  async cleanupAnyTypesInFile(filePath) {
    try {
      console.log(`  📄 Processing: ${filePath}`);

      // Create backup
      const backupPath = path.join(this.backupDir, path.basename(filePath));
      fs.copyFileSync(filePath, backupPath);

      let content = fs.readFileSync(filePath, "utf8");
      let changes = 0;

      // Replace test variable any types with unknown for better type safety
      content = content.replace(
        /const\s+(\w+):\s*any\s*=/g,
        "const $1: unknown =",
      );
      changes += (content.match(/const\s+\w+:\s*unknown\s*=/g) || []).length;

      // Replace function parameter any types with unknown
      content = content.replace(
        /\(\s*_?(\w+):\s*unknown\s*\)\s*:\s*any\s*{/g,
        "($1: unknown): unknown {",
      );

      // Replace method any types with unknown
      content = content.replace(/:\s*any\s*=\s*\(/g, ": unknown = (");

      if (changes > 0) {
        fs.writeFileSync(filePath, content);
        this.anyTypesReplaced += changes;
        this.processedFiles++;
        console.log(`    ✅ Replaced ${changes} any types with unknown`);
      } else {
        console.log(`    ℹ️  No any types to replace`);
      }
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }

  printSummary() {
    console.log("\n📊 REMAINING ANY TYPE CLEANUP SUMMARY");
    console.log("=".repeat(50));
    console.log(`📁 Files processed: ${this.processedFiles}`);
    console.log(`🔧 Any types replaced: ${this.anyTypesReplaced}`);
    console.log(`💾 Backup created at: ${this.backupDir}`);
    console.log("\n✅ Remaining any type cleanup completed!");
  }
}

// Execute if run directly
if (require.main === module) {
  const cleanup = new RemainingAnyTypeCleanup();
  cleanup.execute().catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
}

module.exports = RemainingAnyTypeCleanup;
