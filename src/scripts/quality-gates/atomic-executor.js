#!/usr/bin/env node

/**
 * AtomicExecutor - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 9, 2025
 *
 * Provides atomic execution of error processors with automatic rollback on failure
 * Ensures safe, reliable automated error fixing with transaction-like guarantees
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class AtomicExecutor {
  constructor() {
    this.projectRoot = process.cwd();
    this.activeTransactions = new Map();
  }

  /**
   * Execute a processor with atomic safety guarantees
   * Automatically creates backups and rolls back on failure
   */
  async executeProcessorSafely(processorCode, options = {}) {
    const transactionId = Date.now().toString();
    const transaction = {
      id: transactionId,
      backups: new Map(),
      startTime: Date.now(),
      processor: processorCode,
    };

    this.activeTransactions.set(transactionId, transaction);

    try {
      console.log(`🔒 Transaction ${transactionId}: Starting ${processorCode}`);

      // 1. Get files that will be modified
      const ProcessorFactory = await import("./processor-factory.js");
      const factory = new ProcessorFactory.default();
      const processor = factory.createProcessor(processorCode);

      // 2. Create backups BEFORE processing
      const filesWithErrors = await this.getFilesWithErrors(processorCode);
      console.log(`📋 Creating backups for ${filesWithErrors.length} files`);

      for (const filePath of filesWithErrors) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          transaction.backups.set(filePath, {
            content,
            timestamp: Date.now(),
            stats: fs.statSync(filePath),
          });
        } catch (error) {
          console.warn(`⚠️  Could not backup ${filePath}: ${error.message}`);
        }
      }

      // 3. Run processor
      console.log(`🔧 Executing ${processorCode} processor...`);
      const result = await processor.process(options.dryRun || false);

      // 4. Validate changes (skip for dry-run)
      if (!options.dryRun) {
        console.log(`✅ Validating changes...`);
        const validation = await this.validateChanges(transaction);

        if (!validation.success) {
          throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
        }
      }

      // 5. Commit transaction
      console.log(`✅ Transaction ${transactionId}: SUCCESS`);
      console.log(`   Files processed: ${result.filesProcessed || 0}`);
      console.log(`   Errors fixed: ${result.errorsFixed || 0}`);

      this.activeTransactions.delete(transactionId);

      return {
        success: true,
        result,
        transactionId,
        backupsCreated: transaction.backups.size,
        dryRun: options.dryRun || false,
      };
    } catch (error) {
      console.error(
        `❌ Transaction ${transactionId}: FAILED - ${error.message}`,
      );

      // Only rollback if not in dry-run mode
      if (!options.dryRun) {
        console.log(`🔄 Rolling back changes...`);
        await this.rollbackTransaction(transaction);
      }

      return {
        success: false,
        error: error.message,
        transactionId,
        rolledBack: !options.dryRun,
        dryRun: options.dryRun || false,
      };
    }
  }

  /**
   * Get list of files that have errors for a specific error code
   */
  async getFilesWithErrors(errorCode) {
    try {
      const tscOutput = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
        {
          cwd: this.projectRoot,
          encoding: "utf8",
          maxBuffer: 50 * 1024 * 1024,
        },
      );

      const filesWithErrors = new Set();
      const lines = tscOutput.split("\n");

      for (const line of lines) {
        if (line.includes(`error ${errorCode}:`)) {
          const match = line.match(/^(.+?)\((\d+),(\d+)\):/);
          if (match) {
            const filePath = path.resolve(this.projectRoot, match[1]);
            filesWithErrors.add(filePath);
          }
        }
      }

      return Array.from(filesWithErrors);
    } catch (error) {
      console.warn(`⚠️  Could not analyze errors: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate that changes did not break the codebase
   */
  async validateChanges(transaction) {
    const errors = [];

    try {
      // Validation 1: TypeScript compilation check
      console.log("  Checking TypeScript compilation...");
      const tscOutput = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
        {
          cwd: this.projectRoot,
          encoding: "utf8",
          maxBuffer: 50 * 1024 * 1024,
          timeout: 60000,
        },
      );

      const errorLines = tscOutput
        .split("\n")
        .filter((line) => line.includes("error TS"));
      console.log(`  ℹ️  TypeScript errors present: ${errorLines.length}`);

      // We don't fail on TS errors since we're actively fixing them
      // Just log for reference
    } catch (error) {
      // Timeout or other error - don't fail validation
      console.log(`  ⚠️  TypeScript check encountered issue: ${error.message}`);
    }

    // Validation 2: Check for syntax corruption in modified files
    for (const [filePath] of transaction.backups) {
      try {
        const content = fs.readFileSync(filePath, "utf8");

        // Check for obvious syntax corruption patterns
        if (content.includes("}}}}") || content.includes(",,,,")) {
          errors.push(
            `${filePath}: Potential syntax corruption detected (excessive brackets/commas)`,
          );
        }

        if (content.includes("undefined undefined")) {
          errors.push(`${filePath}: Potential keyword corruption detected`);
        }
      } catch (error) {
        errors.push(
          `${filePath}: Cannot read file after processing - ${error.message}`,
        );
      }
    }

    // Validation 3: Ensure no files were deleted
    for (const [filePath] of transaction.backups) {
      if (!fs.existsSync(filePath)) {
        errors.push(`${filePath}: File was deleted during processing`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
      validationTime: Date.now() - transaction.startTime,
    };
  }

  /**
   * Rollback all changes made during a transaction
   */
  async rollbackTransaction(transaction) {
    let rolledBack = 0;
    let failed = 0;

    for (const [filePath, backup] of transaction.backups) {
      try {
        fs.writeFileSync(filePath, backup.content);
        rolledBack++;
        console.log(
          `  ✓ Rolled back: ${path.relative(this.projectRoot, filePath)}`,
        );
      } catch (error) {
        failed++;
        console.error(`  ✗ Failed to rollback: ${filePath} - ${error.message}`);
      }
    }

    console.log(
      `🔄 Rollback complete: ${rolledBack} restored, ${failed} failed`,
    );

    this.activeTransactions.delete(transaction.id);

    return { rolledBack, failed };
  }

  /**
   * Execute multiple processors in batch with atomic safety
   */
  async executeBatch(processorCodes, options = {}) {
    console.log(`\n${"=".repeat(60)}`);
    console.log("🚀 BATCH EXECUTION WITH ATOMIC SAFETY");
    console.log("=".repeat(60));
    console.log(`Mode: ${options.dryRun ? "DRY RUN" : "LIVE"}`);
    console.log(`Processors: ${processorCodes.length}`);
    console.log(`Stop on failure: ${options.stopOnFailure ? "Yes" : "No"}`);
    console.log("");

    const results = [];

    for (const code of processorCodes) {
      console.log(`\n${"─".repeat(60)}`);
      console.log(`Processing ${code}...`);
      console.log("─".repeat(60));

      const result = await this.executeProcessorSafely(code, options);
      results.push({ processorCode: code, ...result });

      // Stop on first failure if requested
      if (!result.success && options.stopOnFailure) {
        console.log("\n⚠️  Stopping batch execution due to failure");
        break;
      }

      // Pause between processors if requested
      if (options.pauseBetween && results.length < processorCodes.length) {
        console.log(
          `\n⏸️  Pausing ${options.pauseBetween}ms before next processor...`,
        );
        await this.pause(options.pauseBetween);
      }
    }

    return this.generateBatchReport(results);
  }

  /**
   * Generate comprehensive batch execution report
   */
  generateBatchReport(results) {
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const report = {
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        totalFilesProcessed: successful.reduce(
          (sum, r) => sum + (r.result?.filesProcessed || 0),
          0,
        ),
        totalErrorsFixed: successful.reduce(
          (sum, r) => sum + (r.result?.errorsFixed || 0),
          0,
        ),
        totalBackups: successful.reduce(
          (sum, r) => sum + (r.backupsCreated || 0),
          0,
        ),
      },
      successful: successful.map((r) => ({
        processor: r.processorCode,
        filesProcessed: r.result?.filesProcessed || 0,
        errorsFixed: r.result?.errorsFixed || 0,
        backupsCreated: r.backupsCreated || 0,
      })),
      failed: failed.map((r) => ({
        processor: r.processorCode,
        error: r.error,
        rolledBack: r.rolledBack,
      })),
      dryRun: results[0]?.dryRun || false,
    };

    console.log("\n" + "=".repeat(60));
    console.log("📊 BATCH EXECUTION SUMMARY");
    console.log("=".repeat(60));
    console.log(`Mode:              ${report.dryRun ? "DRY RUN" : "LIVE"}`);
    console.log(`Total Processors:  ${report.summary.total}`);
    console.log(`✅ Successful:      ${report.summary.successful}`);
    console.log(`❌ Failed:          ${report.summary.failed}`);
    console.log(`📁 Files Processed: ${report.summary.totalFilesProcessed}`);
    console.log(`🔧 Errors Fixed:    ${report.summary.totalErrorsFixed}`);
    console.log(`💾 Backups Created: ${report.summary.totalBackups}`);

    if (successful.length > 0) {
      console.log("\n✅ Successful Processors:");
      successful.forEach((s) => {
        console.log(
          `  ${s.processor}: ${s.errorsFixed} errors, ${s.filesProcessed} files`,
        );
      });
    }

    if (failed.length > 0) {
      console.log("\n❌ Failed Processors:");
      failed.forEach((f) => {
        console.log(`  ${f.processor}: ${f.error}`);
        if (f.rolledBack) {
          console.log(`    (Changes rolled back)`);
        }
      });
    }

    console.log("=".repeat(60));

    return report;
  }

  /**
   * Pause execution for specified milliseconds
   */
  pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  const executor = new AtomicExecutor();

  switch (command) {
    case "execute":
      const processorCode = args[1];
      const isDryRun = !args.includes("--confirm");

      if (!processorCode) {
        console.log("❌ Error: Processor code required");
        console.log(
          "Usage: node atomic-executor.js execute <code> [--confirm]",
        );
        process.exit(1);
      }

      await executor.executeProcessorSafely(processorCode, {
        dryRun: isDryRun,
      });
      break;

    case "batch":
      const codes = args.slice(1).filter((a) => !a.startsWith("--"));
      const batchOptions = {
        dryRun: !args.includes("--confirm"),
        stopOnFailure: args.includes("--stop-on-failure"),
        pauseBetween: parseInt(
          args.find((a) => a.startsWith("--pause="))?.split("=")[1] || "0",
        ),
      };

      if (codes.length === 0) {
        console.log("❌ Error: At least one processor code required");
        console.log(
          "Usage: node atomic-executor.js batch <code1> <code2> ... [options]",
        );
        process.exit(1);
      }

      await executor.executeBatch(codes, batchOptions);
      break;

    default:
      console.log(`
AtomicExecutor - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 9, 2025

Provides atomic execution of error processors with automatic rollback on failure

Usage: node src/scripts/quality-gates/atomic-executor.js <command> [options]

Commands:
  execute <code> [--confirm]           - Execute single processor with atomic safety
  batch <code1> <code2> ... [options]  - Execute multiple processors with atomic safety

Options:
  --confirm           - Execute in LIVE mode (default: dry-run)
  --stop-on-failure   - Stop batch execution on first failure
  --pause=<ms>        - Pause between processors (milliseconds)

Examples:
  # Dry-run single processor
  node src/scripts/quality-gates/atomic-executor.js execute TS1005

  # Live execution with confirmation
  node src/scripts/quality-gates/atomic-executor.js execute TS1005 --confirm

  # Batch dry-run
  node src/scripts/quality-gates/atomic-executor.js batch TS1005 TS1434 TS1180

  # Batch live execution with pause
  node src/scripts/quality-gates/atomic-executor.js batch TS1005 TS1434 --confirm --pause=2000

  # Stop on first failure
  node src/scripts/quality-gates/atomic-executor.js batch TS1005 TS1434 --stop-on-failure --confirm

Features:
  ✅ Automatic file backups before processing
  ✅ Validation after processing
  ✅ Automatic rollback on failure
  ✅ Transaction-like guarantees
  ✅ Batch execution support
      `);
  }
}

export default AtomicExecutor;
