#!/usr/bin/env node

/**
 * First Wave Execution for Unintentional Any Elimination
 *
 * Targets specific high-confidence cases found in the codebase
 */

const fs = require("fs");
const { execSync } = require("child_process");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// High-confidence replacement targets identified from search
const FIRST_WAVE_TARGETS = [
  {
    file: "src/data/cuisineFlavorProfiles.ts",
    line: 836,
    original: "const allRecipes: any[] = [];",
    replacement: "const allRecipes: unknown[] = [];",
    confidence: 0.95,
    category: "ARRAY_TYPE",
  },
  {
    file: "src/data/unified/seasonal.ts",
    line: 112,
    original:
      "recipes: any[]; // Will be enhanced when recipe system is unified",
    replacement:
      "recipes: unknown[]; // Will be enhanced when recipe system is unified",
    confidence: 0.95,
    category: "ARRAY_TYPE",
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 61,
    original: "culinaryProperties?: any;",
    replacement: "culinaryProperties?: unknown;",
    confidence: 0.85,
    category: "OPTIONAL_PROPERTY",
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 62,
    original: "storage?: any;",
    replacement: "storage?: unknown;",
    confidence: 0.85,
    category: "OPTIONAL_PROPERTY",
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 63,
    original: "preparation?: any;",
    replacement: "preparation?: unknown;",
    confidence: 0.85,
    category: "OPTIONAL_PROPERTY",
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 93,
    original: "[key: string]: any;",
    replacement: "[key: string]: unknown;",
    confidence: 0.9,
    category: "INDEX_SIGNATURE",
  },
];

class FirstWaveExecutor {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      attempted: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };
  }

  async execute() {
    console.log(
      colorize("\n🚀 First Wave: Unintentional Any Elimination", "cyan"),
    );
    console.log(colorize("=".repeat(60), "blue"));
    console.log(
      colorize(
        `Targeting ${FIRST_WAVE_TARGETS.length} high-confidence cases`,
        "yellow",
      ),
    );
    console.log(colorize("=".repeat(60), "blue"));

    // Create backup
    const backupPath = await this.createBackup();
    console.log(colorize(`📦 Backup created: ${backupPath}`, "blue"));

    // Get initial metrics
    const initialMetrics = await this.getInitialMetrics();
    console.log(
      colorize(
        `📊 Initial State: ${initialMetrics.tsErrors} TS errors, ${initialMetrics.anyCount} explicit any`,
        "blue",
      ),
    );

    try {
      // Process each target
      for (let i = 0; i < FIRST_WAVE_TARGETS.length; i++) {
        const target = FIRST_WAVE_TARGETS[i];
        console.log(
          colorize(
            `\n🔄 Processing ${i + 1}/${FIRST_WAVE_TARGETS.length}: ${target.file}`,
            "cyan",
          ),
        );

        const result = await this.processTarget(target);
        this.results.details.push(result);

        if (result.success) {
          this.results.successful++;
          console.log(colorize(`✅ Success: ${result.description}`, "green"));
        } else {
          this.results.failed++;
          console.log(colorize(`❌ Failed: ${result.error}`, "red"));
        }

        this.results.attempted++;
      }

      // Validate build after all changes
      console.log(colorize("\n🔍 Validating build stability...", "blue"));
      const buildValid = await this.validateBuild();

      if (!buildValid) {
        console.log(
          colorize("⚠️ Build validation failed, rolling back...", "yellow"),
        );
        await this.rollback(backupPath);
        throw new Error("Build validation failed");
      }

      // Get final metrics
      const finalMetrics = await this.getInitialMetrics();
      console.log(
        colorize(
          `📊 Final State: ${finalMetrics.tsErrors} TS errors, ${finalMetrics.anyCount} explicit any`,
          "blue",
        ),
      );

      // Calculate results
      const reduction = initialMetrics.anyCount - finalMetrics.anyCount;
      const reductionPercentage =
        initialMetrics.anyCount > 0
          ? (reduction / initialMetrics.anyCount) * 100
          : 0;

      console.log(colorize("\n📋 First Wave Results:", "cyan"));
      console.log(`  Attempted: ${this.results.attempted}`);
      console.log(
        `  Successful: ${colorize(this.results.successful.toString(), "green")}`,
      );
      console.log(
        `  Failed: ${colorize(this.results.failed.toString(), "red")}`,
      );
      console.log(
        `  Success Rate: ${colorize(((this.results.successful / this.results.attempted) * 100).toFixed(1) + "%", "green")}`,
      );
      console.log(
        `  Any Types Reduced: ${colorize(reduction.toString(), "green")}`,
      );
      console.log(
        `  Reduction Percentage: ${colorize(reductionPercentage.toFixed(1) + "%", "green")}`,
      );

      // Save report
      await this.saveReport({
        initialMetrics,
        finalMetrics,
        reduction,
        reductionPercentage,
        duration: Date.now() - this.startTime,
      });

      console.log(colorize("\n🎉 First Wave Completed Successfully!", "green"));
      return true;
    } catch (error) {
      console.error(colorize(`❌ First Wave Failed: ${error.message}`, "red"));
      await this.rollback(backupPath);
      return false;
    }
  }

  async processTarget(target) {
    try {
      // Check if file exists
      if (!fs.existsSync(target.file)) {
        return {
          success: false,
          target: target,
          error: "File not found",
          description: `${target.file}:${target.line}`,
        };
      }

      // Read file content
      const content = fs.readFileSync(target.file, "utf8");
      const lines = content.split("\n");

      // Check if the target line exists and matches
      if (lines.length < target.line) {
        return {
          success: false,
          target: target,
          error: "Line number out of range",
          description: `${target.file}:${target.line}`,
        };
      }

      const currentLine = lines[target.line - 1];

      // Check if the line contains the expected pattern
      if (!currentLine.includes(": any")) {
        return {
          success: false,
          target: target,
          error: "Pattern not found in line",
          description: `${target.file}:${target.line} - Expected pattern not found`,
          currentLine: currentLine.trim(),
        };
      }

      // Apply the replacement
      const newLine = currentLine.replace(": any", ": unknown");
      lines[target.line - 1] = newLine;

      // Write the updated content
      const updatedContent = lines.join("\n");
      fs.writeFileSync(target.file, updatedContent);

      return {
        success: true,
        target: target,
        description: `${target.file}:${target.line} - ${target.category}`,
        originalLine: currentLine.trim(),
        newLine: newLine.trim(),
      };
    } catch (error) {
      return {
        success: false,
        target: target,
        error: error.message,
        description: `${target.file}:${target.line}`,
      };
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `backups/first-wave-${timestamp}`;

    try {
      execSync(`mkdir -p ${backupPath}`);
      execSync(`cp -r src ${backupPath}/`);
      return backupPath;
    } catch (error) {
      console.warn(colorize("Warning: Could not create backup", "yellow"));
      return null;
    }
  }

  async rollback(backupPath) {
    if (!backupPath || !fs.existsSync(backupPath)) {
      console.warn(
        colorize("Warning: No backup available for rollback", "yellow"),
      );
      return;
    }

    try {
      execSync(`rm -rf src`);
      execSync(`cp -r ${backupPath}/src .`);
      console.log(colorize("✅ Rollback completed successfully", "green"));
    } catch (error) {
      console.error(colorize(`❌ Rollback failed: ${error.message}`, "red"));
    }
  }

  async validateBuild() {
    try {
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getInitialMetrics() {
    let tsErrors = 0;
    let anyCount = 0;

    try {
      const tsOutput = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      tsErrors = parseInt(tsOutput.trim()) || 0;
    } catch {
      tsErrors = 0;
    }

    try {
      const anyOutput = execSync(
        'find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk -F: \'{sum += $2} END {print sum}\' || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      anyCount = parseInt(anyOutput.trim()) || 0;
    } catch {
      anyCount = 0;
    }

    return { tsErrors, anyCount };
  }

  async saveReport(metrics) {
    const report = {
      timestamp: new Date().toISOString(),
      wave: "first",
      targets: FIRST_WAVE_TARGETS.length,
      results: this.results,
      metrics: metrics,
      summary: {
        attempted: this.results.attempted,
        successful: this.results.successful,
        failed: this.results.failed,
        successRate:
          ((this.results.successful / this.results.attempted) * 100).toFixed(
            1,
          ) + "%",
        anyTypesReduced: metrics.reduction,
        reductionPercentage: metrics.reductionPercentage.toFixed(1) + "%",
        duration: `${Math.round(metrics.duration / 1000)}s`,
      },
    };

    const reportPath = `FIRST_WAVE_EXECUTION_REPORT.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = `FIRST_WAVE_EXECUTION_SUMMARY.md`;
    const summaryContent = `# First Wave Execution Summary

## Overview
Executed first wave of unintentional any elimination targeting ${FIRST_WAVE_TARGETS.length} high-confidence cases.

## Results
- **Attempted**: ${this.results.attempted}
- **Successful**: ${this.results.successful}
- **Failed**: ${this.results.failed}
- **Success Rate**: ${((this.results.successful / this.results.attempted) * 100).toFixed(1)}%

## Metrics
- **Initial Any Count**: ${metrics.initialMetrics.anyCount}
- **Final Any Count**: ${metrics.finalMetrics.anyCount}
- **Any Types Reduced**: ${metrics.reduction}
- **Reduction Percentage**: ${metrics.reductionPercentage.toFixed(1)}%
- **Duration**: ${Math.round(metrics.duration / 1000)}s

## Target Categories
- Array Types (any[] → unknown[])
- Optional Properties (prop?: any → prop?: unknown)
- Index Signatures ([key: string]: any → [key: string]: unknown)

## Files Modified
${this.results.details
  .filter((d) => d.success)
  .map((d) => `- ${d.target.file}:${d.target.line}`)
  .join("\n")}

## Next Steps
- Monitor build stability over next 24 hours
- Prepare second wave targeting function parameters
- Review any remaining high-confidence cases

---
*Generated on ${new Date().toISOString()}*
`;

    fs.writeFileSync(summaryPath, summaryContent);

    console.log(colorize(`📄 Reports saved:`, "blue"));
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
  }
}

async function main() {
  const executor = new FirstWaveExecutor();
  const success = await executor.execute();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FirstWaveExecutor };
