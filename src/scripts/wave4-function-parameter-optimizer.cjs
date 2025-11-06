#!/usr/bin/env node

/**
 * Wave 4: Function Parameter Optimization
 *
 * This script implements systematic function parameter optimization using underscore prefixing
 * strategy for unused function parameters. It targets args, options, error parameters across
 * utility files while applying conservative elimination patterns with full safety protocols.
 *
 * Requirements: 1.5, 3.1, 5.2, 6.1
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class Wave4FunctionParameterOptimizer {
  constructor() {
    this.processedFiles = 0;
    this.optimizedParameters = 0;
    this.preservedParameters = 0;
    this.errors = [];
    this.batchSize = 15; // Maximum 15 files per batch for safety
    this.safetyLevel = "MAXIMUM";

    // Domain preservation patterns
    this.preservationPatterns = {
      astrological:
        /^(planet|degree|sign|longitude|position|coordinates|transit|ephemeris|zodiac|lunar|solar|celestial)/i,
      campaign:
        /^(metrics|progress|safety|campaign|validation|intelligence|monitor|track|analyze)/i,
      culinary:
        /^(ingredient|recipe|flavor|cuisine|cooking|elemental|fire|water|earth|air)/i,
      test: /^(mock|stub|test|expect|describe|it|should|assert|spy)/i,
    };

    // Common function parameter patterns to optimize
    this.parameterPatterns = {
      args: /^(args?|arguments?|params?|parameters?)$/i,
      options: /^(opts?|options?|config|configuration|settings?)$/i,
      error: /^(err|error|exception|e)$/i,
      event: /^(evt?|event|e)$/i,
      callback: /^(cb|callback|done|next)$/i,
      context: /^(ctx|context|this)$/i,
      data: /^(data|payload|body|content)$/i,
      index: /^(i|idx|index|key|k)$/i,
      value: /^(val|value|item|element|el)$/i,
    };
  }

  /**
   * Get current unused variable count for baseline
   */
  getCurrentUnusedCount() {
    try {
      const output = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -E "unused|defined but never used" | wc -l',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      console.warn("Could not get current unused count:", error.message);
      return -1;
    }
  }

  /**
   * Get detailed breakdown of unused function parameters
   */
  getUnusedParameterBreakdown() {
    try {
      const output = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -E "defined but never used.*args must match"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const breakdown = {};

      for (const line of lines) {
        // Extract file path and parameter name
        const match = line.match(/^(.+?):\d+:\d+\s+error\s+'([^']+)'/);
        if (match) {
          const [, filePath, paramName] = match;
          if (!breakdown[filePath]) {
            breakdown[filePath] = [];
          }
          breakdown[filePath].push(paramName);
        }
      }

      return breakdown;
    } catch (error) {
      console.warn("Could not get parameter breakdown:", error.message);
      return {};
    }
  }

  /**
   * Check if a parameter should be preserved based on domain patterns
   */
  shouldPreserveParameter(paramName, filePath) {
    // Check domain preservation patterns
    for (const [domain, pattern] of Object.entries(this.preservationPatterns)) {
      if (pattern.test(paramName)) {
        console.log(
          `🛡️  Preserving ${paramName} in ${filePath} (${domain} domain)`,
        );
        return true;
      }
    }

    // Check if it's in a test file
    if (
      filePath.includes("test") ||
      filePath.includes("spec") ||
      filePath.includes("__tests__")
    ) {
      console.log(`🛡️  Preserving ${paramName} in test file ${filePath}`);
      return true;
    }

    // Check if it's in a critical system file
    const criticalPaths = [
      "src/calculations/",
      "src/services/campaign/",
      "src/utils/reliableAstronomy",
      "src/data/planets/",
    ];

    if (criticalPaths.some((criticalPath) => filePath.includes(criticalPath))) {
      console.log(`🛡️  Preserving ${paramName} in critical file ${filePath}`);
      return true;
    }

    return false;
  }

  /**
   * Determine optimization strategy for a parameter
   */
  getOptimizationStrategy(paramName, filePath) {
    // Check if should be preserved
    if (this.shouldPreserveParameter(paramName, filePath)) {
      return { action: "preserve", reason: "domain_preservation" };
    }

    // Check if it matches common parameter patterns
    for (const [category, pattern] of Object.entries(this.parameterPatterns)) {
      if (pattern.test(paramName)) {
        return {
          action: "prefix_underscore",
          reason: `common_${category}_parameter`,
          newName: `_${paramName}`,
        };
      }
    }

    // Default strategy for other parameters
    if (paramName.length <= 2) {
      return {
        action: "prefix_underscore",
        reason: "short_parameter",
        newName: `_${paramName}`,
      };
    }

    return {
      action: "prefix_underscore",
      reason: "unused_parameter",
      newName: `_${paramName}`,
    };
  }

  /**
   * Apply underscore prefix to a parameter in file content
   */
  applyUnderscorePrefix(content, paramName, newName) {
    // Pattern to match function parameter declarations
    const patterns = [
      // Function declarations: function name(param, ...)
      new RegExp(`\\bfunction\\s+\\w+\\s*\\([^)]*\\b${paramName}\\b`, "g"),
      // Arrow functions: (param) => or param =>
      new RegExp(`\\([^)]*\\b${paramName}\\b[^)]*\\)\\s*=>`, "g"),
      // Method definitions: methodName(param, ...)
      new RegExp(`\\b\\w+\\s*\\([^)]*\\b${paramName}\\b`, "g"),
      // Destructuring parameters: { param }
      new RegExp(`\\{[^}]*\\b${paramName}\\b[^}]*\\}`, "g"),
      // Array destructuring: [param]
      new RegExp(`\\[[^\\]]*\\b${paramName}\\b[^\\]]*\\]`, "g"),
    ];

    let modifiedContent = content;
    let replacementMade = false;

    // Try to replace parameter name with underscore prefix
    // This is a conservative approach - only replace in parameter positions
    const lines = content.split("\n");
    const modifiedLines = lines.map((line, lineIndex) => {
      // Look for function parameter declarations
      if (
        line.includes(paramName) &&
        (line.includes("function") ||
          line.includes("=>") ||
          line.includes("(") ||
          line.match(/^\s*\w+\s*\(/))
      ) {
        // Replace parameter name with underscore prefix
        const regex = new RegExp(`\\b${paramName}\\b(?=\\s*[,)])`, "g");
        const newLine = line.replace(regex, newName);

        if (newLine !== line) {
          console.log(`  📝 Line ${lineIndex + 1}: ${paramName} → ${newName}`);
          replacementMade = true;
          return newLine;
        }
      }
      return line;
    });

    if (replacementMade) {
      modifiedContent = modifiedLines.join("\n");
    }

    return { content: modifiedContent, modified: replacementMade };
  }

  /**
   * Process a single file for parameter optimization
   */
  processFile(filePath, unusedParams) {
    console.log(`\n📁 Processing: ${filePath}`);
    console.log(`   Unused parameters: ${unusedParams.join(", ")}`);

    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileModified = false;
      const optimizations = [];

      for (const paramName of unusedParams) {
        const strategy = this.getOptimizationStrategy(paramName, filePath);

        if (strategy.action === "preserve") {
          console.log(`  🛡️  Preserving: ${paramName} (${strategy.reason})`);
          this.preservedParameters++;
          continue;
        }

        if (strategy.action === "prefix_underscore") {
          const result = this.applyUnderscorePrefix(
            modifiedContent,
            paramName,
            strategy.newName,
          );

          if (result.modified) {
            modifiedContent = result.content;
            fileModified = true;
            this.optimizedParameters++;
            optimizations.push({
              original: paramName,
              new: strategy.newName,
              reason: strategy.reason,
            });
            console.log(
              `  ✅ Optimized: ${paramName} → ${strategy.newName} (${strategy.reason})`,
            );
          } else {
            console.log(
              `  ⚠️  Could not optimize: ${paramName} (pattern not found)`,
            );
          }
        }
      }

      // Write modified content if changes were made
      if (fileModified) {
        fs.writeFileSync(filePath, modifiedContent, "utf8");
        console.log(`  💾 Saved changes to ${filePath}`);
        return { success: true, optimizations };
      } else {
        console.log(`  ℹ️  No changes made to ${filePath}`);
        return { success: true, optimizations: [] };
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate TypeScript compilation after changes
   */
  validateTypeScriptCompilation() {
    try {
      console.log("\n🔍 Validating TypeScript compilation...");
      execSync("yarn tsc --noEmit --skipLibCheck", {
        encoding: "utf8",
        stdio: "pipe",
      });
      console.log("✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      console.error("❌ TypeScript compilation failed:", error.message);
      return false;
    }
  }

  /**
   * Create git stash for rollback capability
   */
  createSafetyStash() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const stashMessage = `wave4-function-params-${timestamp}`;

      execSync(`git add -A && git stash push -m "${stashMessage}"`, {
        encoding: "utf8",
        stdio: "pipe",
      });

      console.log(`🛡️  Created safety stash: ${stashMessage}`);
      return stashMessage;
    } catch (error) {
      console.warn("⚠️  Could not create safety stash:", error.message);
      return null;
    }
  }

  /**
   * Rollback changes using git stash
   */
  rollbackChanges(stashName) {
    try {
      if (stashName) {
        execSync("git stash pop", { encoding: "utf8", stdio: "pipe" });
        console.log("🔄 Rolled back changes using git stash");
      }
      return true;
    } catch (error) {
      console.error("❌ Could not rollback changes:", error.message);
      return false;
    }
  }

  /**
   * Process files in safe batches
   */
  async processBatch(files, batchNumber) {
    console.log(`\n🚀 Processing Batch ${batchNumber} (${files.length} files)`);
    console.log(`   Safety Level: ${this.safetyLevel}`);

    // Create safety stash before processing
    const stashName = this.createSafetyStash();

    const batchResults = [];

    for (const [filePath, unusedParams] of files) {
      const result = this.processFile(filePath, unusedParams);
      batchResults.push({ filePath, result });
      this.processedFiles++;
    }

    // Validate TypeScript compilation after batch
    const compilationValid = this.validateTypeScriptCompilation();

    if (!compilationValid) {
      console.error(
        `❌ Batch ${batchNumber} caused compilation errors - rolling back`,
      );
      this.rollbackChanges(stashName);
      return { success: false, rolledBack: true };
    }

    console.log(`✅ Batch ${batchNumber} completed successfully`);
    return { success: true, results: batchResults };
  }

  /**
   * Generate progress report
   */
  generateProgressReport(initialCount, finalCount) {
    const eliminated = initialCount - finalCount;
    const reductionPercentage =
      initialCount > 0 ? ((eliminated / initialCount) * 100).toFixed(1) : 0;

    const report = {
      campaign: "Wave 4: Function Parameter Optimization",
      timestamp: new Date().toISOString(),
      metrics: {
        initialUnusedCount: initialCount,
        finalUnusedCount: finalCount,
        variablesEliminated: eliminated,
        reductionPercentage: `${reductionPercentage}%`,
        filesProcessed: this.processedFiles,
        parametersOptimized: this.optimizedParameters,
        parametersPreserved: this.preservedParameters,
      },
      safetyProtocols: {
        batchSize: this.batchSize,
        safetyLevel: this.safetyLevel,
        compilationValidation: true,
        gitStashRollback: true,
      },
      errors: this.errors,
      status: this.errors.length === 0 ? "SUCCESS" : "PARTIAL_SUCCESS",
    };

    return report;
  }

  /**
   * Execute Wave 4 function parameter optimization campaign
   */
  async execute() {
    console.log("🚀 Starting Wave 4: Function Parameter Optimization Campaign");
    console.log(
      "📋 Target: 50-70 function parameters with underscore prefixing strategy",
    );
    console.log("🛡️  Safety Level: MAXIMUM with full rollback capabilities\n");

    // Get baseline metrics
    const initialCount = this.getCurrentUnusedCount();
    console.log(`📊 Initial unused variable count: ${initialCount}`);

    // Get unused parameter breakdown
    const parameterBreakdown = this.getUnusedParameterBreakdown();
    const totalFiles = Object.keys(parameterBreakdown).length;

    console.log(`📁 Files with unused parameters: ${totalFiles}`);

    if (totalFiles === 0) {
      console.log("✅ No unused function parameters found - campaign complete");
      return;
    }

    // Convert to array for batch processing
    const fileList = Object.entries(parameterBreakdown);

    // Process in batches
    const batches = [];
    for (let i = 0; i < fileList.length; i += this.batchSize) {
      batches.push(fileList.slice(i, i + this.batchSize));
    }

    console.log(
      `📦 Processing ${batches.length} batches (max ${this.batchSize} files per batch)`,
    );

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      const batchResult = await this.processBatch(batches[i], i + 1);

      if (!batchResult.success) {
        console.error(`❌ Batch ${i + 1} failed - stopping campaign`);
        break;
      }

      // Small delay between batches for safety
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Get final metrics
    const finalCount = this.getCurrentUnusedCount();
    console.log(`\n📊 Final unused variable count: ${finalCount}`);

    // Generate and display report
    const report = this.generateProgressReport(initialCount, finalCount);

    console.log("\n📈 WAVE 4 CAMPAIGN REPORT");
    console.log("========================");
    console.log(`Status: ${report.status}`);
    console.log(`Files Processed: ${report.metrics.filesProcessed}`);
    console.log(`Parameters Optimized: ${report.metrics.parametersOptimized}`);
    console.log(`Parameters Preserved: ${report.metrics.parametersPreserved}`);
    console.log(`Variables Eliminated: ${report.metrics.variablesEliminated}`);
    console.log(`Reduction Percentage: ${report.metrics.reductionPercentage}`);

    if (this.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${this.errors.length}`);
      this.errors.forEach((error) => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }

    // Save detailed report
    const reportPath =
      ".kiro/specs/unused-variable-elimination/wave4-function-params-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    return report;
  }
}

// Execute if run directly
if (require.main === module) {
  const optimizer = new Wave4FunctionParameterOptimizer();
  optimizer.execute().catch(console.error);
}

module.exports = Wave4FunctionParameterOptimizer;
