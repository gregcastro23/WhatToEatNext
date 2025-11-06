#!/usr/bin/env node

/**
 * Fourth Wave Execution for Unintentional Any Elimination
 *
 * Targets error handling patterns and return types
 */

const fs = require("fs");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Fourth wave targets - error handling and return types
const FOURTH_WAVE_TARGETS = [
  {
    file: "src/services/campaign/ExportTransformationEngine.ts",
    line: 637,
    search: "private async handleCriticalFailure(error: any): Promise<void> {",
    replace:
      "private async handleCriticalFailure(error: unknown): Promise<void> {",
    category: "ERROR_HANDLING",
    confidence: 0.7,
  },
  {
    file: "src/services/campaign/unintentional-any-elimination/CampaignIntegration.ts",
    line: 314,
    search: "} catch (error: any) {",
    replace: "} catch (error: unknown) {",
    category: "ERROR_HANDLING",
    confidence: 0.75,
  },
  {
    file: "src/services/campaign/unintentional-any-elimination/CampaignIntegration.ts",
    line: 336,
    search: "} catch (error: any) {",
    replace: "} catch (error: unknown) {",
    category: "ERROR_HANDLING",
    confidence: 0.75,
  },
  {
    file: "src/services/campaign/unintentional-any-elimination/SafetyValidator.ts",
    line: 520,
    search: "private extractErrorOutput(error: any): string {",
    replace: "private extractErrorOutput(error: unknown): string {",
    category: "ERROR_HANDLING",
    confidence: 0.7,
  },
];

class FourthWaveExecutor {
  constructor() {
    this.results = {
      attempted: 0,
      successful: 0,
      failed: 0,
      details: [],
    };
  }

  async execute() {
    console.log(colorize("\n🚀 Fourth Wave: Error Handling Patterns", "cyan"));
    console.log(colorize("=".repeat(55), "blue"));
    console.log(
      colorize(
        `Targeting error handling - ${FOURTH_WAVE_TARGETS.length} error-related patterns`,
        "yellow",
      ),
    );
    console.log(colorize("Focus: catch blocks and error parameters", "yellow"));
    console.log(colorize("=".repeat(55), "blue"));

    const initialAnyCount = await this.getAnyCount();
    console.log(
      colorize(`📊 Initial explicit any count: ${initialAnyCount}`, "blue"),
    );

    // Process each target
    for (let i = 0; i < FOURTH_WAVE_TARGETS.length; i++) {
      const target = FOURTH_WAVE_TARGETS[i];
      console.log(
        colorize(
          `\n🔄 Processing ${i + 1}/${FOURTH_WAVE_TARGETS.length}: ${target.file}`,
          "cyan",
        ),
      );
      console.log(
        colorize(
          `   Category: ${target.category} | Confidence: ${(target.confidence * 100).toFixed(0)}%`,
          "blue",
        ),
      );

      const result = await this.processTarget(target);
      this.results.attempted++;
      this.results.details.push(result);

      if (result.success) {
        this.results.successful++;
        console.log(colorize(`✅ Success: ${result.description}`, "green"));
        console.log(colorize(`   Before: ${result.before}`, "yellow"));
        console.log(colorize(`   After:  ${result.after}`, "green"));
      } else {
        this.results.failed++;
        console.log(colorize(`❌ Failed: ${result.error}`, "red"));
        if (result.note) {
          console.log(colorize(`   Note: ${result.note}`, "yellow"));
        }
      }
    }

    const finalAnyCount = await this.getAnyCount();
    const reduction = initialAnyCount - finalAnyCount;
    const reductionPercentage =
      initialAnyCount > 0 ? (reduction / initialAnyCount) * 100 : 0;

    console.log(colorize("\n📊 Fourth Wave Results:", "cyan"));
    console.log(`  Attempted: ${this.results.attempted}`);
    console.log(
      `  Successful: ${colorize(this.results.successful.toString(), "green")}`,
    );
    console.log(`  Failed: ${colorize(this.results.failed.toString(), "red")}`);
    console.log(
      `  Success Rate: ${colorize(((this.results.successful / this.results.attempted) * 100).toFixed(1) + "%", "green")}`,
    );
    console.log(
      `  Any Types Reduced: ${colorize(reduction.toString(), "green")}`,
    );
    console.log(
      `  Reduction Percentage: ${colorize(reductionPercentage.toFixed(2) + "%", "green")}`,
    );
    console.log(
      `  Final Any Count: ${colorize(finalAnyCount.toString(), "blue")}`,
    );

    // Calculate cumulative progress (waves 1-4)
    const previousReduction = 11; // From waves 1-3
    const totalReduction = previousReduction + reduction;
    const cumulativePercentage =
      (totalReduction / (initialAnyCount + previousReduction)) * 100;

    console.log(
      colorize("\n📈 Cumulative Campaign Progress (4 Waves):", "cyan"),
    );
    console.log(
      `  Total Fixes Applied: ${colorize(totalReduction.toString(), "green")}`,
    );
    console.log(
      `  Cumulative Reduction: ${colorize(cumulativePercentage.toFixed(2) + "%", "green")}`,
    );
    console.log(`  Waves Completed: ${colorize("4", "green")}`);
    console.log(
      `  Categories: Arrays, Properties, Signatures, Functions, Callbacks, Error Handling`,
    );

    // Save comprehensive report
    await this.saveReport(
      initialAnyCount,
      finalCount,
      reduction,
      totalReduction,
      cumulativePercentage,
    );

    if (this.results.successful > 0) {
      console.log(
        colorize("\n🎉 Fourth Wave Completed Successfully!", "green"),
      );
      console.log(
        colorize(
          `✅ ${this.results.successful} error handling patterns improved`,
          "green",
        ),
      );
      console.log(
        colorize(
          "🚀 Campaign building strong momentum - ready for fifth wave!",
          "cyan",
        ),
      );
      return true;
    } else {
      console.log(
        colorize(
          "\n⚠️ Fourth wave completed with no changes applied",
          "yellow",
        ),
      );
      return false;
    }
  }

  async processTarget(target) {
    try {
      if (!fs.existsSync(target.file)) {
        return {
          success: false,
          target: target,
          error: "File not found",
          description: target.file,
        };
      }

      const content = fs.readFileSync(target.file, "utf8");

      // Check if the search pattern exists
      if (!content.includes(target.search)) {
        return {
          success: false,
          target: target,
          error: "Pattern not found in file",
          description: target.file,
          note: "Pattern may have already been replaced or modified",
        };
      }

      // Apply the replacement
      const updatedContent = content.replace(target.search, target.replace);

      // Verify the replacement was made
      if (updatedContent === content) {
        return {
          success: false,
          target: target,
          error: "Replacement failed - content unchanged",
          description: target.file,
        };
      }

      // Write the updated content
      fs.writeFileSync(target.file, updatedContent);

      return {
        success: true,
        target: target,
        description: `${target.file} - ${target.category}`,
        before: target.search.trim(),
        after: target.replace.trim(),
      };
    } catch (error) {
      return {
        success: false,
        target: target,
        error: error.message,
        description: target.file,
      };
    }
  }

  async getAnyCount() {
    try {
      const output = execSync(
        'find src -name "*.ts" -o -name "*.tsx" | xargs grep -c ": any" | awk -F: \'{sum += $2} END {print sum}\' || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch {
      return 0;
    }
  }

  async saveReport(
    initialCount,
    finalCount,
    reduction,
    totalReduction,
    cumulativePercentage,
  ) {
    const report = {
      timestamp: new Date().toISOString(),
      wave: "fourth",
      approach: "Error handling patterns",
      targets: FOURTH_WAVE_TARGETS.length,
      results: this.results,
      metrics: {
        initialAnyCount: initialCount,
        finalAnyCount: finalCount,
        waveReduction: reduction,
        waveReductionPercentage:
          initialCount > 0
            ? ((reduction / initialCount) * 100).toFixed(2) + "%"
            : "0%",
        totalReduction: totalReduction,
        cumulativeReductionPercentage: cumulativePercentage.toFixed(2) + "%",
      },
    };

    const reportPath = `FOURTH_WAVE_EXECUTION_REPORT.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = `FOURTH_WAVE_EXECUTION_SUMMARY.md`;
    const summaryContent = `# Fourth Wave Execution Summary

## Overview
Executed fourth wave targeting error handling patterns, focusing on catch blocks and error parameters.

## Results
- **Attempted**: ${this.results.attempted}
- **Successful**: ${this.results.successful}
- **Failed**: ${this.results.failed}
- **Success Rate**: ${((this.results.successful / this.results.attempted) * 100).toFixed(1)}%

## Cumulative Progress (4 Waves)
- **Total Fixes Applied**: ${totalReduction}
- **Cumulative Reduction**: ${cumulativePercentage.toFixed(2)}%
- **Waves Completed**: 4

## Changes Applied
${
  this.results.details
    .filter((d) => d.success)
    .map((d) => `- ${d.target.file}: ${d.target.category}`)
    .join("\n") || "- None"
}

---
*Generated on ${new Date().toISOString()}*
`;

    fs.writeFileSync(summaryPath, summaryContent);

    console.log(colorize(`\n📄 Reports saved:`, "blue"));
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
  }
}

async function main() {
  const executor = new FourthWaveExecutor();
  const success = await executor.execute();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FourthWaveExecutor };
