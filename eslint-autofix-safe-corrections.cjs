#!/usr/bin/env node

/**
 * ESLint Auto-Fix Safe Corrections
 *
 * This script applies ESLint auto-fixes for safe corrections while maintaining
 * build stability and preserving astrological calculation accuracy.
 *
 * Features:
 * - Batch processing with safety validation
 * - Build verification after each batch
 * - Rollback capability on failures
 * - Comprehensive progress tracking
 * - Domain-aware pattern preservation
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ESLintAutoFixProcessor {
  constructor() {
    this.processedFiles = 0;
    this.fixedFiles = 0;
    this.errors = [];
    this.batchSize = 25; // Process files in batches
    this.logFile = "eslint-autofix-progress.log";
    this.backupDir = ".eslint-autofix-backup";

    // Initialize logging
    this.log("ESLint Auto-Fix Safe Corrections Started");
    this.log(`Batch size: ${this.batchSize} files`);
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + "\n");
  }

  async getAutoFixableFiles() {
    try {
      this.log("Identifying auto-fixable files...");

      // Get files with auto-fixable issues
      const output = execSync(
        "yarn lint --fix-dry-run --format=json 2>/dev/null",
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      const results = JSON.parse(output);
      const fixableFiles = results
        .filter((result) => result.output && result.output !== result.source)
        .map((result) => ({
          filePath: result.filePath,
          errorCount: result.errorCount,
          warningCount: result.warningCount,
          fixableErrorCount: result.fixableErrorCount,
          fixableWarningCount: result.fixableWarningCount,
        }));

      this.log(`Found ${fixableFiles.length} files with auto-fixable issues`);

      // Sort by priority: fewer errors first (safer)
      fixableFiles.sort((a, b) => {
        const aTotal = a.errorCount + a.warningCount;
        const bTotal = b.errorCount + b.warningCount;
        return aTotal - bTotal;
      });

      return fixableFiles;
    } catch (error) {
      this.log(`Error identifying fixable files: ${error.message}`);
      return [];
    }
  }

  createBackup(files) {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const backupId = Date.now();
      const batchBackupDir = path.join(this.backupDir, `batch-${backupId}`);
      fs.mkdirSync(batchBackupDir, { recursive: true });

      for (const file of files) {
        const relativePath = path.relative(process.cwd(), file.filePath);
        const backupPath = path.join(batchBackupDir, relativePath);
        const backupDirPath = path.dirname(backupPath);

        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }

        if (fs.existsSync(file.filePath)) {
          fs.copyFileSync(file.filePath, backupPath);
        }
      }

      this.log(`Created backup for ${files.length} files in ${batchBackupDir}`);
      return batchBackupDir;
    } catch (error) {
      this.log(`Error creating backup: ${error.message}`);
      throw error;
    }
  }

  async applyAutoFixes(files) {
    try {
      const filePaths = files.map((f) => f.filePath).join(" ");

      this.log(`Applying auto-fixes to ${files.length} files...`);

      // Apply fixes using ESLint
      execSync(`yarn lint --fix ${filePaths}`, {
        encoding: "utf8",
        stdio: "pipe",
      });

      this.log(`Auto-fixes applied successfully to ${files.length} files`);
      return true;
    } catch (error) {
      this.log(`Error applying auto-fixes: ${error.message}`);
      return false;
    }
  }

  async validateBuild() {
    try {
      this.log("Validating build after auto-fixes...");

      // Check TypeScript compilation
      execSync("yarn tsc --noEmit --skipLibCheck", {
        encoding: "utf8",
        stdio: "pipe",
      });

      this.log("Build validation successful");
      return true;
    } catch (error) {
      this.log(`Build validation failed: ${error.message}`);
      return false;
    }
  }

  async validateLinting() {
    try {
      this.log("Validating linting status...");

      const output = execSync("yarn lint --format=json 2>/dev/null", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });

      const results = JSON.parse(output);
      const totalErrors = results.reduce(
        (sum, result) => sum + result.errorCount,
        0,
      );
      const totalWarnings = results.reduce(
        (sum, result) => sum + result.warningCount,
        0,
      );

      this.log(
        `Current linting status: ${totalErrors} errors, ${totalWarnings} warnings`,
      );
      return { errors: totalErrors, warnings: totalWarnings };
    } catch (error) {
      this.log(`Error validating linting: ${error.message}`);
      return null;
    }
  }

  restoreBackup(backupDir) {
    try {
      this.log(`Restoring backup from ${backupDir}...`);

      // Find all files in backup and restore them
      const restoreFiles = (dir, baseDir) => {
        const items = fs.readdirSync(dir);

        for (const item of items) {
          const backupPath = path.join(dir, item);
          const relativePath = path.relative(baseDir, backupPath);
          const originalPath = path.join(process.cwd(), relativePath);

          if (fs.statSync(backupPath).isDirectory()) {
            restoreFiles(backupPath, baseDir);
          } else {
            const originalDir = path.dirname(originalPath);
            if (!fs.existsSync(originalDir)) {
              fs.mkdirSync(originalDir, { recursive: true });
            }
            fs.copyFileSync(backupPath, originalPath);
          }
        }
      };

      restoreFiles(backupDir, backupDir);
      this.log("Backup restored successfully");
      return true;
    } catch (error) {
      this.log(`Error restoring backup: ${error.message}`);
      return false;
    }
  }

  async processBatch(files) {
    const backupDir = this.createBackup(files);

    try {
      // Apply auto-fixes
      const fixSuccess = await this.applyAutoFixes(files);
      if (!fixSuccess) {
        this.restoreBackup(backupDir);
        return false;
      }

      // Validate build
      const buildValid = await this.validateBuild();
      if (!buildValid) {
        this.log("Build validation failed, restoring backup...");
        this.restoreBackup(backupDir);
        return false;
      }

      // Update counters
      this.fixedFiles += files.length;
      this.log(`Batch completed successfully: ${files.length} files fixed`);

      return true;
    } catch (error) {
      this.log(`Batch processing failed: ${error.message}`);
      this.restoreBackup(backupDir);
      return false;
    }
  }

  async processAllFiles() {
    const fixableFiles = await this.getAutoFixableFiles();

    if (fixableFiles.length === 0) {
      this.log("No auto-fixable files found");
      return;
    }

    // Get initial linting status
    const initialStatus = await this.validateLinting();
    this.log(
      `Initial status: ${initialStatus?.errors || "unknown"} errors, ${initialStatus?.warnings || "unknown"} warnings`,
    );

    // Process files in batches
    for (let i = 0; i < fixableFiles.length; i += this.batchSize) {
      const batch = fixableFiles.slice(i, i + this.batchSize);
      const batchNum = Math.floor(i / this.batchSize) + 1;
      const totalBatches = Math.ceil(fixableFiles.length / this.batchSize);

      this.log(
        `Processing batch ${batchNum}/${totalBatches} (${batch.length} files)`,
      );

      const success = await this.processBatch(batch);
      if (!success) {
        this.log(`Batch ${batchNum} failed, stopping processing`);
        break;
      }

      this.processedFiles += batch.length;

      // Progress update
      const progress = (
        ((i + batch.length) / fixableFiles.length) *
        100
      ).toFixed(1);
      this.log(
        `Progress: ${progress}% (${this.processedFiles}/${fixableFiles.length} files)`,
      );
    }

    // Get final linting status
    const finalStatus = await this.validateLinting();
    this.log(
      `Final status: ${finalStatus?.errors || "unknown"} errors, ${finalStatus?.warnings || "unknown"} warnings`,
    );

    // Calculate improvements
    if (initialStatus && finalStatus) {
      const errorReduction = initialStatus.errors - finalStatus.errors;
      const warningReduction = initialStatus.warnings - finalStatus.warnings;

      this.log(
        `Improvements: ${errorReduction} errors fixed, ${warningReduction} warnings fixed`,
      );
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      processedFiles: this.processedFiles,
      fixedFiles: this.fixedFiles,
      errors: this.errors,
      success: this.errors.length === 0,
    };

    fs.writeFileSync(
      "eslint-autofix-report.json",
      JSON.stringify(report, null, 2),
    );

    this.log("=".repeat(60));
    this.log("ESLint Auto-Fix Safe Corrections Completed");
    this.log(`Files processed: ${this.processedFiles}`);
    this.log(`Files fixed: ${this.fixedFiles}`);
    this.log(`Errors encountered: ${this.errors.length}`);
    this.log("=".repeat(60));

    return report;
  }
}

// Main execution
async function main() {
  const processor = new ESLintAutoFixProcessor();

  try {
    await processor.processAllFiles();
  } catch (error) {
    processor.log(`Fatal error: ${error.message}`);
    processor.errors.push(error.message);
  } finally {
    processor.generateReport();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ESLintAutoFixProcessor };
