#!/usr/bin/env node

/**
 * Pre-Commit Quality Gate Hook - Phase 4 Enterprise Error Elimination
 * WhatToEatNext - October 8, 2025
 *
 * Automated quality gate validation for git commits
 * Prevents commits that violate quality standards
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import CIDCOrchestrator from "./ci-cd-orchestrator.js";

class PreCommitHook {
  constructor() {
    this.projectRoot = path.resolve(
      import.meta.dirname ||
        path.dirname(import.meta.url.replace("file://", "")),
      "../../../",
    );
    this.hookConfig = this.loadHookConfig();
    this.orchestrator = new CIDCOrchestrator();
  }

  loadHookConfig() {
    // Default pre-commit configuration
    return {
      enabled: true,
      strictMode: false, // Set to true for zero-tolerance
      checks: {
        buildValidation: true,
        errorAnalysis: true,
        qualityGates: true,
        fileSizeLimits: true,
        forbiddenPatterns: true,
      },
      limits: {
        maxFileSizeKB: 500,
        maxCommitSizeKB: 2000,
        maxModifiedFiles: 50,
      },
      forbiddenPatterns: [
        "console\\.log",
        "debugger",
        "console\\.error",
        "console\\.warn",
        "TODO:",
        "FIXME:",
        "HACK:",
      ],
      allowedFileTypes: [
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".json",
        ".md",
        ".yml",
        ".yaml",
        ".css",
        ".scss",
        ".html",
        ".txt",
        ".gitignore",
      ],
    };
  }

  /**
   * Main pre-commit validation
   */
  async validate() {
    console.log("🔒 WhatToEatNext Pre-Commit Quality Gate");
    console.log("=".repeat(45));
    console.log(`Date: ${new Date().toLocaleString()}`);
    console.log("");

    const results = {
      success: true,
      checks: {},
      violations: [],
      recommendations: [],
    };

    try {
      // Check 1: Branch protection
      results.checks.branchProtection = await this.checkBranchProtection();
      if (!results.checks.branchProtection.passed) {
        results.success = false;
        results.violations.push(...results.checks.branchProtection.violations);
      }

      // Check 2: File validation
      results.checks.fileValidation = await this.validateFiles();
      if (!results.checks.fileValidation.passed) {
        results.success = false;
        results.violations.push(...results.checks.fileValidation.violations);
      }

      // Check 3: Code quality gates
      if (this.hookConfig.checks.qualityGates) {
        results.checks.qualityGates = await this.checkQualityGates();
        if (!results.checks.qualityGates.passed) {
          results.success = false;
          results.violations.push(...results.checks.qualityGates.violations);
          results.recommendations.push(
            ...results.checks.qualityGates.recommendations,
          );
        }
      }

      // Check 4: Forbidden patterns
      if (this.hookConfig.checks.forbiddenPatterns) {
        results.checks.forbiddenPatterns = await this.checkForbiddenPatterns();
        if (!results.checks.forbiddenPatterns.passed) {
          results.success = false;
          results.violations.push(
            ...results.checks.forbiddenPatterns.violations,
          );
        }
      }

      // Generate result summary
      this.displayResults(results);

      if (!results.success) {
        console.log("\n❌ Commit blocked by quality gates!");
        console.log("\nTo bypass (not recommended):");
        console.log('  git commit --no-verify -m "your message"');
        process.exit(1);
      }

      console.log("\n✅ All quality gates passed - commit allowed");
      return results;
    } catch (error) {
      console.error("❌ Pre-commit hook failed:", error.message);
      if (this.hookConfig.strictMode) {
        process.exit(1);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Check branch protection rules
   */
  async checkBranchProtection() {
    const branchInfo = this.orchestrator.checkBranchProtection();

    if (!branchInfo.isProtected) {
      return {
        passed: true,
        message: `Branch '${branchInfo.branch}' is not protected - skipping quality gates`,
      };
    }

    return {
      passed: true,
      message: `Branch '${branchInfo.branch}' is protected - running quality gates`,
      branchInfo,
    };
  }

  /**
   * Validate staged files
   */
  async validateFiles() {
    try {
      // Get staged files
      const stagedFiles = execSync("git diff --cached --name-only", {
        cwd: this.projectRoot,
        encoding: "utf8",
      })
        .trim()
        .split("\n")
        .filter((f) => f.length > 0);

      const violations = [];

      // Check file count limit
      if (stagedFiles.length > this.hookConfig.limits.maxModifiedFiles) {
        violations.push(
          `Too many modified files: ${stagedFiles.length} (max: ${this.hookConfig.limits.maxModifiedFiles})`,
        );
      }

      // Check file sizes
      let totalSize = 0;
      for (const file of stagedFiles) {
        const filePath = path.join(this.projectRoot, file);

        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          const sizeKB = stats.size / 1024;

          // Check individual file size
          if (sizeKB > this.hookConfig.limits.maxFileSizeKB) {
            violations.push(
              `File too large: ${file} (${sizeKB.toFixed(1)}KB > ${this.hookConfig.limits.maxFileSizeKB}KB)`,
            );
          }

          totalSize += sizeKB;

          // Check file extension
          const ext = path.extname(file);
          if (!this.hookConfig.allowedFileTypes.includes(ext) && ext !== "") {
            violations.push(`File type not allowed: ${file} (${ext})`);
          }
        }
      }

      // Check total commit size
      if (totalSize > this.hookConfig.limits.maxCommitSizeKB) {
        violations.push(
          `Commit too large: ${totalSize.toFixed(1)}KB > ${this.hookConfig.limits.maxCommitSizeKB}KB`,
        );
      }

      return {
        passed: violations.length === 0,
        filesChecked: stagedFiles.length,
        totalSizeKB: totalSize,
        violations,
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        violations: [`Failed to validate files: ${error.message}`],
      };
    }
  }

  /**
   * Check quality gates via orchestrator
   */
  async checkQualityGates() {
    try {
      const qualityStatus = await this.orchestrator.getQualityGateStatus();

      if (qualityStatus.passed) {
        return {
          passed: true,
          message: "Quality gates passed",
          metrics: qualityStatus.metrics,
        };
      }

      const violations = [];
      const recommendations = [];

      if (
        qualityStatus.qualityGates.currentErrors >
        qualityStatus.qualityGates.thresholds.total
      ) {
        violations.push(
          `Total errors exceed threshold: ${qualityStatus.qualityGates.currentErrors} > ${qualityStatus.qualityGates.thresholds.total}`,
        );
      }

      if (
        qualityStatus.qualityGates.criticalErrors >
        qualityStatus.qualityGates.thresholds.critical
      ) {
        violations.push(
          `Critical errors exceed threshold: ${qualityStatus.qualityGates.criticalErrors} > ${qualityStatus.qualityGates.thresholds.critical}`,
        );
      }

      recommendations.push(...qualityStatus.recommendations);

      return {
        passed: false,
        violations,
        recommendations,
        metrics: qualityStatus.metrics,
      };
    } catch (error) {
      return {
        passed: false,
        violations: [`Quality gate check failed: ${error.message}`],
      };
    }
  }

  /**
   * Check for forbidden patterns in staged files
   */
  async checkForbiddenPatterns() {
    try {
      // Get staged file contents
      const stagedDiff = execSync("git diff --cached", {
        cwd: this.projectRoot,
        encoding: "utf8",
      });

      const violations = [];

      for (const pattern of this.hookConfig.forbiddenPatterns) {
        const regex = new RegExp(pattern, "gi");
        const matches = stagedDiff.match(regex);

        if (matches) {
          violations.push(
            `Forbidden pattern found: '${pattern}' (${matches.length} occurrences)`,
          );
        }
      }

      return {
        passed: violations.length === 0,
        patternsChecked: this.hookConfig.forbiddenPatterns.length,
        violations,
      };
    } catch (error) {
      return {
        passed: false,
        error: error.message,
        violations: [`Forbidden pattern check failed: ${error.message}`],
      };
    }
  }

  /**
   * Display validation results
   */
  displayResults(results) {
    console.log("📊 Validation Results:");
    console.log("");

    Object.entries(results.checks).forEach(([checkName, checkResult]) => {
      const icon = checkResult.passed ? "✅" : "❌";
      const status = checkResult.passed ? "PASSED" : "FAILED";

      console.log(`${icon} ${checkName}: ${status}`);

      if (checkResult.message) {
        console.log(`   ${checkResult.message}`);
      }

      if (checkResult.filesChecked !== undefined) {
        console.log(`   Files checked: ${checkResult.filesChecked}`);
      }

      if (checkResult.totalSizeKB !== undefined) {
        console.log(`   Total size: ${checkResult.totalSizeKB.toFixed(1)}KB`);
      }

      if (checkResult.violations && checkResult.violations.length > 0) {
        console.log("   Violations:");
        checkResult.violations.forEach((violation) => {
          console.log(`     • ${violation}`);
        });
      }

      console.log("");
    });

    if (results.violations.length > 0) {
      console.log("🚫 Commit Violations:");
      results.violations.forEach((violation) => {
        console.log(`  • ${violation}`);
      });
      console.log("");
    }

    if (results.recommendations.length > 0) {
      console.log("💡 Recommendations:");
      results.recommendations.forEach((rec) => {
        console.log(`  • ${rec}`);
      });
      console.log("");
    }
  }

  /**
   * Install pre-commit hook
   */
  installHook() {
    const hookPath = path.join(this.projectRoot, ".git", "hooks", "pre-commit");

    // Create hook content
    const hookContent = `#!/bin/sh
# WhatToEatNext Pre-Commit Quality Gate - Phase 4

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Run pre-commit quality gate
node "$PROJECT_ROOT/src/scripts/quality-gates/pre-commit-hook.js"

# Exit with the result of the quality gate
exit $?
`;

    try {
      fs.writeFileSync(hookPath, hookContent);
      fs.chmodSync(hookPath, "755");
      console.log("✅ Pre-commit hook installed successfully");
      console.log(`   Location: ${hookPath}`);
    } catch (error) {
      console.error("❌ Failed to install pre-commit hook:", error.message);
      throw error;
    }
  }

  /**
   * Uninstall pre-commit hook
   */
  uninstallHook() {
    const hookPath = path.join(this.projectRoot, ".git", "hooks", "pre-commit");

    try {
      if (fs.existsSync(hookPath)) {
        fs.unlinkSync(hookPath);
        console.log("✅ Pre-commit hook uninstalled successfully");
      } else {
        console.log("ℹ️ No pre-commit hook found to uninstall");
      }
    } catch (error) {
      console.error("❌ Failed to uninstall pre-commit hook:", error.message);
      throw error;
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || "validate";

  const hook = new PreCommitHook();

  switch (command) {
    case "validate":
      await hook.validate();
      break;

    case "install":
      hook.installHook();
      break;

    case "uninstall":
      hook.uninstallHook();
      break;

    case "test":
      console.log("🧪 Testing pre-commit hook...");
      const testResult = await hook.validate();
      console.log(`Test result: ${testResult.success ? "PASSED" : "FAILED"}`);
      break;

    default:
      console.log(`
Pre-Commit Quality Gate Hook - Phase 4 Enterprise Error Elimination
WhatToEatNext - October 8, 2025

Usage: node src/scripts/quality-gates/pre-commit-hook.js <command>

Commands:
  validate  - Run pre-commit validation (default)
  install   - Install git pre-commit hook
  uninstall - Remove git pre-commit hook
  test      - Test pre-commit validation

Examples:
  node src/scripts/quality-gates/pre-commit-hook.js validate
  node src/scripts/quality-gates/pre-commit-hook.js install
  node src/scripts/quality-gates/pre-commit-hook.js test

The install command will create a .git/hooks/pre-commit file that runs
this validation automatically before each commit.
      `);
  }
}

export default PreCommitHook;
