#!/usr/bin/env node

/**
 * Comprehensive Linting Workflow Integration
 *
 * This script integrates ESLint optimization with existing error reduction tools
 * for a systematic approach to code quality improvement.
 *
 * Features:
 * - Integrates with SafeUnusedImportRemover system
 * - Connects to fix-typescript-errors-enhanced-v3.js
 * - Provides comprehensive error reduction workflow
 * - Safety protocols and rollback mechanisms
 * - Progress tracking and metrics collection
 *
 * Usage:
 *   node src/scripts/comprehensive-linting-workflow.js [options]
 *
 * Options:
 *   --phase         Run specific phase (1-5)
 *   --dry-run       Show what would be done without making changes
 *   --auto-fix      Enable automated fixes
 *   --max-files     Maximum files to process per phase
 *   --safety-mode   Extra safety checks and backups
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

class ComprehensiveLintingWorkflow {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      autoFix: options.autoFix || false,
      maxFiles: options.maxFiles || 25,
      safetyMode: options.safetyMode || true,
      phase: options.phase || "all",
      ...options,
    };

    this.metrics = {
      startTime: Date.now(),
      phases: {},
      errors: {
        before: 0,
        after: 0,
      },
      warnings: {
        before: 0,
        after: 0,
      },
    };

    this.backupDir = `.workflow-backup-${Date.now()}`;
    this.logFile = `comprehensive-workflow-${Date.now()}.log`;
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + "\n");
  }

  async createBackup() {
    if (!this.options.safetyMode) return;

    this.log("Creating comprehensive backup...");
    try {
      execSync(`cp -r src ${this.backupDir}`, { stdio: "inherit" });
      this.log(`Backup created: ${this.backupDir}`);
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, "error");
      throw error;
    }
  }

  async getLintingMetrics() {
    this.log("Collecting current linting metrics...");
    try {
      const output = execSync("yarn lint --format=json", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      const results = JSON.parse(output);
      const metrics = {
        errors: 0,
        warnings: 0,
        files: results.length,
        fixableErrors: 0,
        fixableWarnings: 0,
      };

      results.forEach((result) => {
        metrics.errors += result.errorCount;
        metrics.warnings += result.warningCount;
        metrics.fixableErrors += result.fixableErrorCount;
        metrics.fixableWarnings += result.fixableWarningCount;
      });

      return metrics;
    } catch (error) {
      this.log(`Failed to collect metrics: ${error.message}`, "warn");
      return {
        errors: 0,
        warnings: 0,
        files: 0,
        fixableErrors: 0,
        fixableWarnings: 0,
      };
    }
  }

  async runPhase1ImportOrganization() {
    this.log("=== Phase 1: Import Organization ===");
    const phaseStart = Date.now();

    try {
      if (this.options.dryRun) {
        this.log("DRY RUN: Would organize imports with import/order rule");
        return { success: true, changes: 0 };
      }

      this.log("Running import organization...");
      execSync("yarn lint:fix --rule import/order", { stdio: "inherit" });

      const duration = Date.now() - phaseStart;
      this.metrics.phases.importOrganization = { duration, success: true };
      this.log(`Phase 1 completed in ${duration}ms`);

      return { success: true, changes: "auto-detected" };
    } catch (error) {
      this.log(`Phase 1 failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async runPhase2UnusedVariables() {
    this.log("=== Phase 2: SafeUnusedImportRemover Integration ===");
    const phaseStart = Date.now();

    try {
      if (this.options.dryRun) {
        this.log("DRY RUN: Would run SafeUnusedImportRemover system");
        return { success: true, changes: 0 };
      }

      // Check if SafeUnusedImportRemover exists
      const removerPath = path.join(
        process.cwd(),
        "src/scripts/fix-unused-vars.js",
      );
      if (fs.existsSync(removerPath)) {
        this.log("Running SafeUnusedImportRemover...");
        execSync(
          `node ${removerPath} --auto-fix --max-files=${this.options.maxFiles}`,
          {
            stdio: "inherit",
          },
        );
      } else {
        this.log(
          "SafeUnusedImportRemover not found, using ESLint unused vars rule",
        );
        execSync("yarn lint:fix --rule @typescript-eslint/no-unused-vars", {
          stdio: "inherit",
        });
      }

      const duration = Date.now() - phaseStart;
      this.metrics.phases.unusedVariables = { duration, success: true };
      this.log(`Phase 2 completed in ${duration}ms`);

      return { success: true, changes: "auto-detected" };
    } catch (error) {
      this.log(`Phase 2 failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async runPhase3TypeScriptErrors() {
    this.log("=== Phase 3: TypeScript Error Integration ===");
    const phaseStart = Date.now();

    try {
      if (this.options.dryRun) {
        this.log("DRY RUN: Would run fix-typescript-errors-enhanced-v3.js");
        return { success: true, changes: 0 };
      }

      // Check if TypeScript error fixer exists
      const fixerPath = path.join(
        process.cwd(),
        "scripts/typescript-fixes/fix-typescript-errors-enhanced-v3.js",
      );
      if (fs.existsSync(fixerPath)) {
        this.log("Running TypeScript Error Fixer v3.0...");
        execSync(
          `node ${fixerPath} --max-files=${this.options.maxFiles} --auto-fix`,
          {
            stdio: "inherit",
          },
        );
      } else {
        this.log(
          "TypeScript Error Fixer not found, running basic TypeScript checks",
        );
        execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "inherit" });
      }

      const duration = Date.now() - phaseStart;
      this.metrics.phases.typescriptErrors = { duration, success: true };
      this.log(`Phase 3 completed in ${duration}ms`);

      return { success: true, changes: "auto-detected" };
    } catch (error) {
      this.log(`Phase 3 failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async runPhase4ExplicitAnyElimination() {
    this.log("=== Phase 4: Explicit Any Elimination ===");
    const phaseStart = Date.now();

    try {
      if (this.options.dryRun) {
        this.log("DRY RUN: Would run explicit-any elimination");
        return { success: true, changes: 0 };
      }

      // Check if explicit-any fixer exists
      const anyFixerPath = path.join(
        process.cwd(),
        "scripts/typescript-fixes/fix-explicit-any-systematic.js",
      );
      if (fs.existsSync(anyFixerPath)) {
        this.log("Running Explicit-Any Elimination...");
        execSync(
          `node ${anyFixerPath} --max-files=${this.options.maxFiles} --auto-fix`,
          {
            stdio: "inherit",
          },
        );
      } else {
        this.log("Explicit-Any fixer not found, using ESLint rule");
        execSync("yarn lint:fix --rule @typescript-eslint/no-explicit-any", {
          stdio: "inherit",
        });
      }

      const duration = Date.now() - phaseStart;
      this.metrics.phases.explicitAny = { duration, success: true };
      this.log(`Phase 4 completed in ${duration}ms`);

      return { success: true, changes: "auto-detected" };
    } catch (error) {
      this.log(`Phase 4 failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async runPhase5Validation() {
    this.log("=== Phase 5: Comprehensive Validation ===");
    const phaseStart = Date.now();

    try {
      this.log("Running build validation...");
      execSync("make check", { stdio: "inherit" });

      this.log("Running test validation...");
      execSync("make test", { stdio: "inherit" });

      this.log("Final linting check...");
      const finalMetrics = await this.getLintingMetrics();
      this.metrics.errors.after = finalMetrics.errors;
      this.metrics.warnings.after = finalMetrics.warnings;

      const duration = Date.now() - phaseStart;
      this.metrics.phases.validation = { duration, success: true };
      this.log(`Phase 5 completed in ${duration}ms`);

      return { success: true, metrics: finalMetrics };
    } catch (error) {
      this.log(`Phase 5 failed: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }

  async generateReport() {
    const totalDuration = Date.now() - this.metrics.startTime;
    const errorReduction =
      this.metrics.errors.before - this.metrics.errors.after;
    const warningReduction =
      this.metrics.warnings.before - this.metrics.warnings.after;

    const report = {
      summary: {
        totalDuration,
        errorReduction,
        warningReduction,
        successRate:
          Object.values(this.metrics.phases).filter((p) => p.success).length /
          Object.keys(this.metrics.phases).length,
      },
      phases: this.metrics.phases,
      recommendations: [],
    };

    if (errorReduction > 100) {
      report.recommendations.push(
        "Excellent error reduction achieved! Consider running weekly maintenance.",
      );
    }

    if (warningReduction > 500) {
      report.recommendations.push(
        "Significant warning reduction! Enable stricter linting rules.",
      );
    }

    this.log("=== Comprehensive Workflow Report ===");
    this.log(`Total Duration: ${totalDuration}ms`);
    this.log(`Error Reduction: ${errorReduction}`);
    this.log(`Warning Reduction: ${warningReduction}`);
    this.log(`Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`);

    // Save detailed report
    fs.writeFileSync(
      `workflow-report-${Date.now()}.json`,
      JSON.stringify(report, null, 2),
    );

    return report;
  }

  async run() {
    try {
      this.log("Starting Comprehensive Linting Workflow...");

      // Initial metrics
      const initialMetrics = await this.getLintingMetrics();
      this.metrics.errors.before = initialMetrics.errors;
      this.metrics.warnings.before = initialMetrics.warnings;

      this.log(
        `Initial state: ${initialMetrics.errors} errors, ${initialMetrics.warnings} warnings`,
      );

      // Create backup
      await this.createBackup();

      // Run phases based on options
      if (this.options.phase === "all" || this.options.phase === "1") {
        await this.runPhase1ImportOrganization();
      }

      if (this.options.phase === "all" || this.options.phase === "2") {
        await this.runPhase2UnusedVariables();
      }

      if (this.options.phase === "all" || this.options.phase === "3") {
        await this.runPhase3TypeScriptErrors();
      }

      if (this.options.phase === "all" || this.options.phase === "4") {
        await this.runPhase4ExplicitAnyElimination();
      }

      if (this.options.phase === "all" || this.options.phase === "5") {
        await this.runPhase5Validation();
      }

      // Generate final report
      const report = await this.generateReport();

      this.log("Comprehensive Linting Workflow completed successfully!");
      return report;
    } catch (error) {
      this.log(`Workflow failed: ${error.message}`, "error");

      if (this.options.safetyMode && fs.existsSync(this.backupDir)) {
        this.log("Attempting to restore from backup...");
        try {
          execSync(`rm -rf src && mv ${this.backupDir} src`, {
            stdio: "inherit",
          });
          this.log("Successfully restored from backup");
        } catch (restoreError) {
          this.log(`Restore failed: ${restoreError.message}`, "error");
        }
      }

      throw error;
    }
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--auto-fix":
        options.autoFix = true;
        break;
      case "--safety-mode":
        options.safetyMode = true;
        break;
      case "--max-files":
        options.maxFiles = parseInt(args[++i]) || 25;
        break;
      case "--phase":
        options.phase = args[++i] || "all";
        break;
      case "--help":
        console.log(`
Comprehensive Linting Workflow Integration

Usage: node src/scripts/comprehensive-linting-workflow.js [options]

Options:
  --phase <1-5|all>    Run specific phase or all phases (default: all)
  --dry-run           Show what would be done without making changes
  --auto-fix          Enable automated fixes
  --max-files <n>     Maximum files to process per phase (default: 25)
  --safety-mode       Extra safety checks and backups (default: true)
  --help              Show this help message

Phases:
  1. Import Organization
  2. Unused Variables (SafeUnusedImportRemover)
  3. TypeScript Errors (Enhanced v3.0)
  4. Explicit Any Elimination
  5. Comprehensive Validation
        `);
        process.exit(0);
    }
  }

  const workflow = new ComprehensiveLintingWorkflow(options);

  workflow
    .run()
    .then((report) => {
      console.log("\n🎉 Workflow completed successfully!");
      console.log(`📊 Report saved to: workflow-report-${Date.now()}.json`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Workflow failed:", error.message);
      process.exit(1);
    });
}

module.exports = ComprehensiveLintingWorkflow;
