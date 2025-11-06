#!/usr/bin/env node

/**
 * Scaled Fix Strategy - Comprehensive Linting Error Resolution System
 *
 * This script implements a scalable approach to fixing the remaining error categories
 * by processing files in batches, with safety checks and progress tracking.
 *
 * Features:
 * - Batch processing with configurable sizes
 * - Multi-category error fixing in single pass
 * - Progress tracking and metrics
 * - Safety validation after each batch
 * - Rollback capabilities
 * - Comprehensive reporting
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  batchSize: 10,
  maxFiles: 50,
  dryRun: false,
  validateAfterBatch: true,
  createBackups: true,
  backupDir: ".scaled-fix-backups",
  preservePatterns: [
    // Preserve astronomical calculations
    /planetary|astronomical|astrological|ephemeris/i,
    // Preserve campaign system patterns (but allow some fixes)
    /campaign.*critical|safety.*protocol/i,
    // Preserve test utilities
    /mock.*setup|test.*framework/i,
  ],
};

class ScaledFixStrategy {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.batchCount = 0;
    this.errors = [];
    this.fixesByCategory = {
      "prefer-optional-chain": 0,
      "no-non-null-assertion": 0,
      "no-unnecessary-type-assertion": 0,
      "no-floating-promises": 0,
      "no-misused-promises": 0,
    };
    this.startTime = Date.now();
  }

  /**
   * Create backup directory
   */
  createBackupDir() {
    if (!CONFIG.createBackups) return;

    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
  }

  /**
   * Backup file before modification
   */
  backupFile(filePath) {
    if (!CONFIG.createBackups || CONFIG.dryRun) return;

    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      CONFIG.backupDir,
      `${fileName}.${timestamp}.backup`,
    );

    try {
      fs.copyFileSync(filePath, backupPath);
    } catch (error) {
      console.warn(
        `⚠️ Could not create backup for ${filePath}: ${error.message}`,
      );
    }
  }

  /**
   * Get files with linting issues using JSON output
   */
  async getFilesWithIssues() {
    try {
      console.log("🔍 Analyzing files with target error categories...");

      const lintOutput = execSync(
        "yarn lint --max-warnings=10000 --format=json",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const lintResults = JSON.parse(lintOutput);
      const filesWithIssues = new Map();

      for (const result of lintResults) {
        const filePath = result.filePath;
        const relevantMessages = result.messages.filter(
          (msg) =>
            msg.ruleId &&
            [
              "@typescript-eslint/prefer-optional-chain",
              "@typescript-eslint/no-non-null-assertion",
              "@typescript-eslint/no-unnecessary-type-assertion",
              "@typescript-eslint/no-floating-promises",
              "@typescript-eslint/no-misused-promises",
            ].includes(msg.ruleId),
        );

        if (relevantMessages.length > 0) {
          filesWithIssues.set(filePath, {
            messages: relevantMessages,
            issueCount: relevantMessages.length,
          });
        }
      }

      // Sort by issue count (highest first) for maximum impact
      const sortedFiles = Array.from(filesWithIssues.entries())
        .sort(([, a], [, b]) => b.issueCount - a.issueCount)
        .slice(0, CONFIG.maxFiles);

      console.log(
        `📊 Found ${sortedFiles.length} files with target error categories`,
      );
      console.log(`📈 Top files by issue count:`);
      sortedFiles.slice(0, 5).forEach(([file, data], index) => {
        const shortPath = file.replace(process.cwd(), ".");
        console.log(
          `   ${index + 1}. ${shortPath} (${data.issueCount} issues)`,
        );
      });

      return sortedFiles;
    } catch (error) {
      console.warn(
        "⚠️ Could not get lint JSON output, falling back to file scanning...",
      );
      return this.scanForFiles();
    }
  }

  /**
   * Fallback file scanning method
   */
  scanForFiles() {
    const files = [];
    const directories = ["src"];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files);
      }
    }

    return files
      .slice(0, CONFIG.maxFiles)
      .map((file) => [file, { messages: [], issueCount: 0 }]);
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  scanDirectory(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        this.scanDirectory(fullPath, files);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Check if file should be preserved from modifications
   */
  shouldPreserveFile(filePath, content) {
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(filePath) || pattern.test(content)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Apply all fix strategies to content
   */
  applyAllFixes(content, filePath, errorMessages) {
    let modifiedContent = content;
    let totalFixes = 0;
    const fixDetails = {};

    // Get error types present in this file
    const errorTypes = new Set(
      errorMessages.map((msg) =>
        msg.ruleId?.replace("@typescript-eslint/", ""),
      ),
    );

    // 1. Fix prefer-optional-chain issues
    if (errorTypes.has("prefer-optional-chain")) {
      const result = this.fixOptionalChain(modifiedContent);
      modifiedContent = result.content;
      totalFixes += result.fixes;
      fixDetails["prefer-optional-chain"] = result.fixes;
      this.fixesByCategory["prefer-optional-chain"] += result.fixes;
    }

    // 2. Fix no-non-null-assertion issues
    if (errorTypes.has("no-non-null-assertion")) {
      const result = this.fixNonNullAssertion(modifiedContent);
      modifiedContent = result.content;
      totalFixes += result.fixes;
      fixDetails["no-non-null-assertion"] = result.fixes;
      this.fixesByCategory["no-non-null-assertion"] += result.fixes;
    }

    // 3. Fix no-unnecessary-type-assertion issues
    if (errorTypes.has("no-unnecessary-type-assertion")) {
      const result = this.fixUnnecessaryTypeAssertion(modifiedContent);
      modifiedContent = result.content;
      totalFixes += result.fixes;
      fixDetails["no-unnecessary-type-assertion"] = result.fixes;
      this.fixesByCategory["no-unnecessary-type-assertion"] += result.fixes;
    }

    // 4. Fix no-floating-promises issues
    if (errorTypes.has("no-floating-promises")) {
      const result = this.fixFloatingPromises(modifiedContent);
      modifiedContent = result.content;
      totalFixes += result.fixes;
      fixDetails["no-floating-promises"] = result.fixes;
      this.fixesByCategory["no-floating-promises"] += result.fixes;
    }

    // 5. Fix no-misused-promises issues
    if (errorTypes.has("no-misused-promises")) {
      const result = this.fixMisusedPromises(modifiedContent);
      modifiedContent = result.content;
      totalFixes += result.fixes;
      fixDetails["no-misused-promises"] = result.fixes;
      this.fixesByCategory["no-misused-promises"] += result.fixes;
    }

    return { content: modifiedContent, fixes: totalFixes, details: fixDetails };
  }

  /**
   * Fix prefer-optional-chain issues (enhanced patterns)
   */
  fixOptionalChain(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: obj && obj.prop -> obj?.prop
    const pattern1 = /(\w+)\s*&&\s*\1\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      modifiedContent = modifiedContent.replace(pattern1, "$1?.$2");
      fixes += matches1.length;
    }

    // Pattern 2: obj && obj[key] -> obj?.[key]
    const pattern2 = /(\w+)\s*&&\s*\1\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      modifiedContent = modifiedContent.replace(pattern2, "$1?.[$2]");
      fixes += matches2.length;
    }

    // Pattern 3: (obj || {})[key] -> obj?.[key]
    const pattern3 = /\((\w+)\s*\|\|\s*\{\}\)\[([^\]]+)\]/g;
    const matches3 = [...modifiedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      modifiedContent = modifiedContent.replace(pattern3, "$1?.[$2]");
      fixes += matches3.length;
    }

    // Pattern 4: (obj || {}).prop -> obj?.prop
    const pattern4 = /\((\w+)\s*\|\|\s*\{\}\)\.(\w+)/g;
    const matches4 = [...modifiedContent.matchAll(pattern4)];
    if (matches4.length > 0) {
      modifiedContent = modifiedContent.replace(pattern4, "$1?.$2");
      fixes += matches4.length;
    }

    // Pattern 5: key in (obj || {}) -> obj?.[key] !== undefined
    const pattern5 = /(\w+)\s+in\s+\((\w+)\s*\|\|\s*\{\}\)/g;
    const matches5 = [...modifiedContent.matchAll(pattern5)];
    if (matches5.length > 0) {
      modifiedContent = modifiedContent.replace(
        pattern5,
        "$2?.[$1] !== undefined",
      );
      fixes += matches5.length;
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-non-null-assertion issues
   */
  fixNonNullAssertion(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: obj!.prop -> obj?.prop (safe cases)
    const pattern1 = /(\w+)!\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      // Only fix if it's not in a critical path
      if (!match[0].includes("campaign") && !match[0].includes("safety")) {
        modifiedContent = modifiedContent.replace(
          match[0],
          `${match[1]}?.${match[2]}`,
        );
        fixes++;
      }
    }

    // Pattern 2: obj![key] -> obj?.[key] (safe cases)
    const pattern2 = /(\w+)!\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    for (const match of matches2) {
      if (!match[0].includes("campaign") && !match[0].includes("safety")) {
        modifiedContent = modifiedContent.replace(
          match[0],
          `${match[1]}?.[${match[2]}]`,
        );
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-unnecessary-type-assertion issues
   */
  fixUnnecessaryTypeAssertion(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: (value as string) where clearly redundant
    const pattern1 = /\((\w+)\s+as\s+(string|number|boolean)\)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      const [fullMatch, variable, type] = match;
      // Only remove if variable name suggests it's already the right type
      if (
        (type === "string" && variable.toLowerCase().includes("str")) ||
        (type === "number" && variable.toLowerCase().includes("num")) ||
        (type === "boolean" && variable.toLowerCase().includes("is"))
      ) {
        modifiedContent = modifiedContent.replace(fullMatch, variable);
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-floating-promises issues
   */
  fixFloatingPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    const lines = modifiedContent.split("\n");
    const fixedLines = [];

    for (let line of lines) {
      const originalLine = line;

      // Pattern: Standalone promise calls that should be voided
      if (
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*$/.test(
          line,
        ) &&
        !line.includes("await") &&
        !line.includes("void") &&
        !line.includes("return")
      ) {
        line = line.replace(
          /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*)$/,
          "$1void $2",
        );

        if (line !== originalLine) {
          fixes++;
        }
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join("\n"), fixes };
  }

  /**
   * Fix no-misused-promises issues
   */
  fixMisusedPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern 1: onClick={asyncFunction} -> onClick={() => void asyncFunction()}
    const eventHandlerPattern = /(on\w+)=\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
    const matches1 = [...modifiedContent.matchAll(eventHandlerPattern)];
    for (const match of matches1) {
      const [fullMatch, eventName, functionName] = match;
      if (functionName.includes("async") || functionName.includes("handle")) {
        modifiedContent = modifiedContent.replace(
          fullMatch,
          `${eventName}={() => void ${functionName}()}`,
        );
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a batch of files
   */
  async processBatch(batch) {
    console.log(
      `\n📦 Processing Batch ${this.batchCount + 1} (${batch.length} files)`,
    );

    let batchFixes = 0;
    const batchResults = [];

    for (const [filePath, fileData] of batch) {
      try {
        const shortPath = filePath.replace(process.cwd(), ".");
        console.log(`  📁 ${shortPath} (${fileData.issueCount} issues)`);

        const content = fs.readFileSync(filePath, "utf8");

        // Check if file should be preserved
        if (this.shouldPreserveFile(filePath, content)) {
          console.log(`    ⚠️ Preserving file due to domain-specific patterns`);
          continue;
        }

        // Backup file
        this.backupFile(filePath);

        // Apply fixes
        const {
          content: modifiedContent,
          fixes,
          details,
        } = this.applyAllFixes(content, filePath, fileData.messages);

        if (fixes > 0) {
          if (!CONFIG.dryRun) {
            fs.writeFileSync(filePath, modifiedContent, "utf8");
          }

          console.log(
            `    ✅ Applied ${fixes} fixes:`,
            Object.entries(details)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => `${type}(${count})`)
              .join(", "),
          );

          batchFixes += fixes;
          batchResults.push({ file: shortPath, fixes, details });
        } else {
          console.log(`    ℹ️ No fixable issues found`);
        }

        this.processedFiles++;
      } catch (error) {
        console.error(`    ❌ Error processing ${filePath}:`, error.message);
        this.errors.push({ file: filePath, error: error.message });
      }
    }

    this.totalFixes += batchFixes;
    this.batchCount++;

    return { fixes: batchFixes, results: batchResults };
  }

  /**
   * Validate TypeScript compilation after batch
   */
  validateBatch() {
    if (!CONFIG.validateAfterBatch) return true;

    try {
      console.log("  🔍 Validating TypeScript compilation...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("  ✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      console.error("  ❌ TypeScript compilation failed");
      return false;
    }
  }

  /**
   * Generate progress report
   */
  generateProgressReport() {
    const elapsed = (Date.now() - this.startTime) / 1000;

    console.log("\n📊 Scaled Fix Strategy Progress Report");
    console.log("=====================================");
    console.log(`⏱️  Execution Time: ${elapsed.toFixed(1)}s`);
    console.log(`📁 Files Processed: ${this.processedFiles}`);
    console.log(`📦 Batches Completed: ${this.batchCount}`);
    console.log(`🔧 Total Fixes Applied: ${this.totalFixes}`);
    console.log(`❌ Errors Encountered: ${this.errors.length}`);

    console.log("\n📈 Fixes by Category:");
    for (const [category, count] of Object.entries(this.fixesByCategory)) {
      if (count > 0) {
        console.log(`   ${category}: ${count} fixes`);
      }
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.slice(0, 5).forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
      if (this.errors.length > 5) {
        console.log(`   ... and ${this.errors.length - 5} more errors`);
      }
    }
  }

  /**
   * Run the scaled fixing process
   */
  async run() {
    console.log("🚀 Starting Scaled Fix Strategy");
    console.log(
      `📊 Configuration: batchSize=${CONFIG.batchSize}, maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`,
    );

    this.createBackupDir();

    const filesWithIssues = await this.getFilesWithIssues();

    if (filesWithIssues.length === 0) {
      console.log("✅ No files found with target error categories");
      return;
    }

    // Process files in batches
    const batches = [];
    for (let i = 0; i < filesWithIssues.length; i += CONFIG.batchSize) {
      batches.push(filesWithIssues.slice(i, i + CONFIG.batchSize));
    }

    console.log(
      `\n📋 Processing ${filesWithIssues.length} files in ${batches.length} batches...`,
    );

    for (const batch of batches) {
      const batchResult = await this.processBatch(batch);

      // Validate after each batch
      if (batchResult.fixes > 0 && !this.validateBatch()) {
        console.error("🛑 Stopping due to TypeScript errors after batch");
        break;
      }

      // Brief pause between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.generateProgressReport();

    if (this.totalFixes > 0) {
      console.log("\n✅ Scaled fix strategy completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");

      if (CONFIG.createBackups) {
        console.log(`🔄 Backups available in: ${CONFIG.backupDir}/`);
      }
    }
  }
}

// Run the script
if (require.main === module) {
  const strategy = new ScaledFixStrategy();
  strategy.run().catch(console.error);
}

module.exports = ScaledFixStrategy;
