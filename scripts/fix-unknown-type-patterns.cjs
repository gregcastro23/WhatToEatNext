#!/usr/bin/env node

/**
 * Automated Unknown Type Pattern Fixer
 * Based on proven patterns from Phase 16 Master Library
 *
 * This script systematically fixes TS18046 and TS2571 errors
 * using safe progressive type casting patterns.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFilesPerBatch: 10,
  buildValidationInterval: 5,
  patterns: [
    {
      name: "msg_property_access",
      pattern: /\(msg as Record<string, unknown>\)\?\.(\w+)\.includes/g,
      replacement: "String((msg as Record<string, unknown>)?.$1).includes",
      description: "Fix msg property access with String wrapper",
    },
    {
      name: "as_unknown_double_cast",
      pattern: /as unknown as Record<string, unknown>/g,
      replacement: "as Record<string, unknown>",
      description: "Remove unnecessary double casting",
    },
    {
      name: "as_any_to_progressive",
      pattern: /\(([^)]+) as any\)\./g,
      replacement: "($1 as Record<string, unknown>).",
      description: "Convert as any to Record<string, unknown>",
    },
    {
      name: "process_env_cast",
      pattern: /\(process\.env as unknown\)\.(\w+)/g,
      replacement: "(process.env as Record<string, unknown>).$1",
      description: "Fix process.env casting",
    },
  ],
  safetyChecks: {
    backupBeforeFix: true,
    validateBuildAfterBatch: true,
    rollbackOnFailure: true,
  },
};

class UnknownTypeFixer {
  constructor() {
    this.fixedCount = 0;
    this.errors = [];
    this.processedFiles = new Set();
    this.backupDir = ".unknown-type-backups";
  }

  /**
   * Main execution function
   */
  async run() {
    console.log("🚀 Starting Unknown Type Pattern Fixer");
    console.log("=====================================\n");

    // Create backup directory
    if (CONFIG.safetyChecks.backupBeforeFix) {
      this.createBackupDirectory();
    }

    // Get files with TS18046 and TS2571 errors
    const errorFiles = this.getFilesWithErrors();
    console.log(
      `📊 Found ${errorFiles.length} files with unknown type errors\n`,
    );

    // Process files in batches
    const batches = this.createBatches(errorFiles, CONFIG.maxFilesPerBatch);

    for (let i = 0; i < batches.length; i++) {
      console.log(`\n📦 Processing Batch ${i + 1}/${batches.length}`);
      console.log("─".repeat(40));

      const success = await this.processBatch(batches[i], i + 1);

      if (!success && CONFIG.safetyChecks.rollbackOnFailure) {
        console.error("❌ Batch failed, rolling back changes");
        this.rollbackBatch(batches[i]);
        break;
      }

      // Validate build every N batches
      if ((i + 1) % CONFIG.buildValidationInterval === 0) {
        if (!this.validateBuild()) {
          console.error("❌ Build validation failed");
          if (CONFIG.safetyChecks.rollbackOnFailure) {
            this.rollbackBatch(batches[i]);
            break;
          }
        }
      }
    }

    this.printSummary();
  }

  /**
   * Get files with TS18046 and TS2571 errors
   */
  getFilesWithErrors() {
    try {
      const output = execSync(
        'make check 2>&1 | grep -E "TS18046|TS2571" | cut -d: -f1 | sort -u',
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        },
      );

      return output
        .split("\n")
        .filter(
          (file) => (file && file.endsWith(".ts")) || file.endsWith(".tsx"),
        )
        .map((file) => file.trim());
    } catch (error) {
      // Handle case where grep returns no results
      return [];
    }
  }

  /**
   * Create batches of files
   */
  createBatches(files, batchSize) {
    const batches = [];
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a batch of files
   */
  async processBatch(files, batchNumber) {
    console.log(`📝 Processing ${files.length} files`);
    let batchSuccess = true;

    for (const file of files) {
      try {
        const fixCount = this.fixFile(file);
        if (fixCount > 0) {
          console.log(`  ✅ ${path.basename(file)}: ${fixCount} fixes applied`);
          this.fixedCount += fixCount;
        } else {
          console.log(`  ⏭️  ${path.basename(file)}: No fixes needed`);
        }
        this.processedFiles.add(file);
      } catch (error) {
        console.error(`  ❌ ${path.basename(file)}: ${error.message}`);
        this.errors.push({ file, error: error.message });
        batchSuccess = false;
      }
    }

    return batchSuccess;
  }

  /**
   * Fix patterns in a single file
   */
  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    // Backup file
    if (CONFIG.safetyChecks.backupBeforeFix) {
      this.backupFile(filePath);
    }

    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;
    let totalFixes = 0;

    // Apply each pattern
    for (const pattern of CONFIG.patterns) {
      const matches = content.match(pattern.pattern);
      if (matches) {
        content = content.replace(pattern.pattern, pattern.replacement);
        totalFixes += matches.length;
      }
    }

    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
    }

    return totalFixes;
  }

  /**
   * Create backup directory
   */
  createBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Backup a file
   */
  backupFile(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      this.backupDir,
      `${path.basename(filePath)}.${timestamp}.backup`,
    );
    fs.copyFileSync(filePath, backupPath);
  }

  /**
   * Rollback changes for a batch
   */
  rollbackBatch(files) {
    console.log("🔄 Rolling back batch changes...");
    // In a real implementation, restore from backups
    // For now, we'll use git
    try {
      execSync(`git checkout -- ${files.join(" ")}`, { stdio: "pipe" });
      console.log("✅ Rollback complete");
    } catch (error) {
      console.error("❌ Rollback failed:", error.message);
    }
  }

  /**
   * Validate build
   */
  validateBuild() {
    console.log("\n🔍 Validating build...");
    try {
      execSync("yarn tsc --noEmit --skipLibCheck", {
        stdio: "pipe",
        timeout: 30000,
      });
      console.log("✅ Build validation passed");
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log("\n" + "=".repeat(50));
    console.log("📊 SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Files processed: ${this.processedFiles.size}`);
    console.log(`🔧 Total fixes applied: ${this.fixedCount}`);
    console.log(`❌ Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n⚠️ Files with errors:");
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${path.basename(file)}: ${error}`);
      });
    }

    // Check remaining errors
    try {
      const errorCount = execSync('make check 2>&1 | grep "error TS" | wc -l', {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      console.log(`\n📈 Remaining TypeScript errors: ${errorCount}`);
    } catch (error) {
      // Ignore
    }
  }
}

// Run if executed directly
if (require.main === module) {
  const fixer = new UnknownTypeFixer();
  fixer.run().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
}

module.exports = UnknownTypeFixer;
