#!/usr/bin/env node

/**
 * Comprehensive Test File Fixer
 * Apply proven patterns to all test files with TS1005 errors
 * Based on successful single file approach
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ComprehensiveTestFileFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.backupDir = `.comprehensive-test-backup-${Date.now()}`;
    this.successfulFiles = [];
    this.failedFiles = [];

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get test files with TS1005 errors
   */
  getTestFilesWithTS1005Errors() {
    try {
      const result = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      return this.extractTestFilesFromOutput(result);
    } catch (error) {
      if (error.stdout) {
        return this.extractTestFilesFromOutput(error.stdout);
      }
      return [];
    }
  }

  extractTestFilesFromOutput(output) {
    const errorLines = output
      .split("\n")
      .filter(
        (line) =>
          line.includes("error TS1005") &&
          (line.includes(".test.") || line.includes(".spec.")),
      );
    const files = new Set();

    errorLines.forEach((line) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const filePath = match[1].trim();
        if (fs.existsSync(filePath)) {
          files.add(filePath);
        }
      }
    });

    return Array.from(files);
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = path.join(
      this.backupDir,
      filePath.replace(/[\/\\]/g, "_"),
    );
    const content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(backupPath, content, "utf8");
  }

  /**
   * Get TS1005 error count for a specific file
   */
  getFileTS1005ErrorCount(filePath) {
    try {
      const result = execSync(
        `yarn tsc --noEmit --skipLibCheck ${filePath} 2>&1`,
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        },
      );
      const errorCount = (result.match(/error TS1005/g) || []).length;
      return errorCount;
    } catch (error) {
      if (error.stdout) {
        const errorCount = (error.stdout.match(/error TS1005/g) || []).length;
        return errorCount;
      }
      return -1;
    }
  }

  /**
   * Validate a specific file
   */
  validateFile(filePath) {
    try {
      const result = execSync(
        `yarn tsc --noEmit --skipLibCheck ${filePath} 2>&1`,
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      // Check for syntax errors (not type definition errors)
      const syntaxErrors = result.match(/error TS(?!2688)/g) || [];
      return syntaxErrors.length === 0;
    } catch (error) {
      if (error.stdout) {
        const syntaxErrors = error.stdout.match(/error TS(?!2688)/g) || [];
        return syntaxErrors.length === 0;
      }
      return false;
    }
  }

  /**
   * Fix proven patterns in content
   */
  fixProvenPatterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: test('description': any, async () => {
    // Fix to: test('description', async () => {
    const testColonAnyPattern =
      /(\b(?:test|it|describe|beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*'[^']+'):\s*any\s*,/g;
    const matches1 = [...fixedContent.matchAll(testColonAnyPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(testColonAnyPattern, "$1,");
      fixes += matches1.length;
    }

    // Pattern 2: } catch (error): any {
    // Fix to: } catch (error) {
    const catchColonAnyPattern = /(\}\s*catch\s*\([^)]+\)):\s*any\s*\{/g;
    const matches2 = [...fixedContent.matchAll(catchColonAnyPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(catchColonAnyPattern, "$1 {");
      fixes += matches2.length;
    }

    // Pattern 3: ([_planet: any, position]: any) => {
    // Fix to: ([_planet, position]: any) => {
    const destructuringColonAnyPattern = /(\[\s*[^,\]]+):\s*any\s*,/g;
    const matches3 = [...fixedContent.matchAll(destructuringColonAnyPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(destructuringColonAnyPattern, "$1,");
      fixes += matches3.length;
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Process a single file
   */
  async processFile(filePath) {
    try {
      console.log(`  Processing: ${path.basename(filePath)}`);

      const initialErrors = this.getFileTS1005ErrorCount(filePath);
      console.log(`    Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log(`    ✅ No TS1005 errors found`);
        return { success: true, fixes: 0, errorReduction: 0 };
      }

      // Create backup
      this.createBackup(filePath);

      const originalContent = fs.readFileSync(filePath, "utf8");
      const { content: fixedContent, fixes } =
        this.fixProvenPatterns(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`    Applied ${fixes} fixes`);
      }

      // Validate
      const fileValid = this.validateFile(filePath);
      const finalErrors = this.getFileTS1005ErrorCount(filePath);
      const errorReduction = initialErrors - finalErrors;

      console.log(`    Final TS1005 errors: ${finalErrors}`);
      console.log(`    Error reduction: ${errorReduction}`);
      console.log(`    File valid: ${fileValid ? "✅" : "❌"}`);

      if (fileValid && errorReduction >= 0) {
        console.log(`    ✅ SUCCESS`);
        this.successfulFiles.push({
          file: filePath,
          initialErrors,
          finalErrors,
          fixes,
          errorReduction,
        });
        return { success: true, fixes, errorReduction };
      } else {
        console.log(`    ❌ FAILED - restoring from backup`);
        fs.writeFileSync(filePath, originalContent);
        this.failedFiles.push({
          file: filePath,
          reason: fileValid
            ? "Error count increased"
            : "File validation failed",
        });
        return { success: false, fixes: 0, errorReduction: 0 };
      }
    } catch (error) {
      console.error(`    ❌ Error processing file: ${error.message}`);
      this.failedFiles.push({
        file: filePath,
        reason: error.message,
      });
      return { success: false, fixes: 0, errorReduction: 0 };
    }
  }

  /**
   * Get total TypeScript error count
   */
  getTotalErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log("🎯 COMPREHENSIVE TEST FILE FIXER");
    console.log("=".repeat(50));
    console.log("Based on proven single-file approach");

    const startTime = Date.now();
    const initialTotalErrors = this.getTotalErrorCount();
    console.log(`📊 Initial total TypeScript errors: ${initialTotalErrors}`);

    // Get test files with TS1005 errors
    const testFiles = this.getTestFilesWithTS1005Errors();
    console.log(`📁 Found ${testFiles.length} test files with TS1005 errors`);

    if (testFiles.length === 0) {
      console.log("✅ No test files with TS1005 errors found!");
      return;
    }

    console.log(`\n🔄 Processing ${testFiles.length} test files...`);

    // Process files one by one
    for (let i = 0; i < testFiles.length; i++) {
      const filePath = testFiles[i];
      console.log(
        `\n📦 File ${i + 1}/${testFiles.length}: ${path.basename(filePath)}`,
      );

      const result = await this.processFile(filePath);
      if (result.success) {
        this.processedFiles++;
        this.totalFixes += result.fixes;
      }

      // Progress update every 5 files
      if ((i + 1) % 5 === 0) {
        const currentTotalErrors = this.getTotalErrorCount();
        console.log(
          `\n📊 Progress update: ${currentTotalErrors} total errors remaining`,
        );
      }
    }

    // Final results
    const endTime = Date.now();
    const finalTotalErrors = this.getTotalErrorCount();
    const totalErrorReduction = initialTotalErrors - finalTotalErrors;
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(50));
    console.log("🏁 COMPREHENSIVE TEST FILE FIXING COMPLETED");
    console.log("=".repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(
      `📝 Files processed successfully: ${this.processedFiles}/${testFiles.length}`,
    );
    console.log(`🎯 Total fixes applied: ${this.totalFixes}`);
    console.log(
      `📊 Total TypeScript errors: ${initialTotalErrors} → ${finalTotalErrors}`,
    );
    console.log(`📉 Total error reduction: ${totalErrorReduction}`);

    if (this.successfulFiles.length > 0) {
      console.log(`\n✅ Successful files (${this.successfulFiles.length}):`);
      this.successfulFiles.forEach((file) => {
        const percentage =
          file.initialErrors > 0
            ? ((file.errorReduction / file.initialErrors) * 100).toFixed(1)
            : "0.0";
        console.log(
          `   ${path.basename(file.file)}: ${file.initialErrors} → ${file.finalErrors} (${percentage}%)`,
        );
      });
    }

    if (this.failedFiles.length > 0) {
      console.log(`\n❌ Failed files (${this.failedFiles.length}):`);
      this.failedFiles.forEach((file) => {
        console.log(`   ${path.basename(file.file)}: ${file.reason}`);
      });
    }

    const successRate =
      testFiles.length > 0
        ? ((this.processedFiles / testFiles.length) * 100).toFixed(1)
        : "0.0";

    console.log(`\n📈 Success Rate: ${successRate}%`);

    if (totalErrorReduction > 0) {
      const reductionPercentage =
        initialTotalErrors > 0
          ? ((totalErrorReduction / initialTotalErrors) * 100).toFixed(1)
          : "0.0";
      console.log(
        `✅ CAMPAIGN SUCCESS: Reduced ${totalErrorReduction} errors (${reductionPercentage}%)`,
      );
    } else {
      console.log(`⚠️ No overall error reduction achieved`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialTotalErrors,
      finalTotalErrors,
      totalErrorReduction,
      filesProcessed: this.processedFiles,
      totalFiles: testFiles.length,
      totalFixes: this.totalFixes,
      duration: parseFloat(duration),
      successRate: parseFloat(successRate),
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new ComprehensiveTestFileFixer();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Comprehensive test file fixing completed");
      if (results.totalErrorReduction > 0 && results.successRate >= 80) {
        console.log("✅ Excellent results - ready for next phase");
        process.exit(0);
      } else if (results.totalErrorReduction > 0) {
        console.log("✅ Good progress made");
        process.exit(0);
      } else {
        console.log("⚠️ Limited progress - manual review needed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ Comprehensive test file fixing failed:", error);
      process.exit(1);
    });
}

module.exports = ComprehensiveTestFileFixer;
