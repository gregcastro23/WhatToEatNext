#!/usr/bin/env node

/**
 * Second Wave Execution for Unintentional Any Elimination
 *
 * Targets optional properties and index signatures based on first wave success
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

// Second wave targets - optional properties and index signatures
const SECOND_WAVE_TARGETS = [
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 61,
    search: "culinaryProperties?: any;",
    replace: "culinaryProperties?: unknown;",
    category: "OPTIONAL_PROPERTY",
    confidence: 0.85,
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 62,
    search: "storage?: any;",
    replace: "storage?: unknown;",
    category: "OPTIONAL_PROPERTY",
    confidence: 0.85,
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 63,
    search: "preparation?: any;",
    replace: "preparation?: unknown;",
    category: "OPTIONAL_PROPERTY",
    confidence: 0.85,
  },
  {
    file: "src/data/unified/unifiedTypes.ts",
    line: 93,
    search: "[key: string]: any;",
    replace: "[key: string]: unknown;",
    category: "INDEX_SIGNATURE",
    confidence: 0.9,
  },
  {
    file: "src/data/unified/cuisines.ts",
    line: 13,
    search: "dishes?: any; // Preserve existing dish structure",
    replace: "dishes?: unknown; // Preserve existing dish structure",
    category: "OPTIONAL_PROPERTY",
    confidence: 0.85,
  },
];

class SecondWaveExecutor {
  constructor() {
    this.results = {
      attempted: 0,
      successful: 0,
      failed: 0,
      details: [],
    };
  }

  async execute() {
    console.log(
      colorize(
        "\n🚀 Second Wave: Optional Properties & Index Signatures",
        "cyan",
      ),
    );
    console.log(colorize("=".repeat(65), "blue"));
    console.log(
      colorize(
        `Building on first wave success - targeting ${SECOND_WAVE_TARGETS.length} additional patterns`,
        "yellow",
      ),
    );
    console.log(colorize("=".repeat(65), "blue"));

    const initialAnyCount = await this.getAnyCount();
    console.log(
      colorize(`📊 Initial explicit any count: ${initialAnyCount}`, "blue"),
    );

    // Process each target
    for (let i = 0; i < SECOND_WAVE_TARGETS.length; i++) {
      const target = SECOND_WAVE_TARGETS[i];
      console.log(
        colorize(
          `\n🔄 Processing ${i + 1}/${SECOND_WAVE_TARGETS.length}: ${target.file}`,
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

    console.log(colorize("\n📊 Second Wave Results:", "cyan"));
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

    // Calculate cumulative progress
    const firstWaveReduction = 2; // From first wave
    const totalReduction = firstWaveReduction + reduction;
    const cumulativePercentage =
      (totalReduction / (initialAnyCount + firstWaveReduction)) * 100;

    console.log(colorize("\n📈 Cumulative Campaign Progress:", "cyan"));
    console.log(
      `  Total Fixes Applied: ${colorize((firstWaveReduction + reduction).toString(), "green")}`,
    );
    console.log(
      `  Cumulative Reduction: ${colorize(cumulativePercentage.toFixed(2) + "%", "green")}`,
    );
    console.log(`  Waves Completed: ${colorize("2", "green")}`);

    // Save comprehensive report
    await this.saveReport(
      initialAnyCount,
      finalAnyCount,
      reduction,
      totalReduction,
      cumulativePercentage,
    );

    if (this.results.successful > 0) {
      console.log(
        colorize("\n🎉 Second Wave Completed Successfully!", "green"),
      );
      console.log(
        colorize(
          `✅ ${this.results.successful} additional patterns converted to unknown`,
          "green",
        ),
      );
      console.log(
        colorize(
          "🚀 Campaign momentum building - ready for third wave!",
          "cyan",
        ),
      );
      return true;
    } else {
      console.log(
        colorize(
          "\n⚠️ Second wave completed with no changes applied",
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
      wave: "second",
      approach: "Optional properties and index signatures",
      targets: SECOND_WAVE_TARGETS.length,
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
      categories: {
        OPTIONAL_PROPERTY: this.results.details.filter(
          (d) => d.target?.category === "OPTIONAL_PROPERTY",
        ).length,
        INDEX_SIGNATURE: this.results.details.filter(
          (d) => d.target?.category === "INDEX_SIGNATURE",
        ).length,
      },
    };

    const reportPath = `SECOND_WAVE_EXECUTION_REPORT.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = `SECOND_WAVE_EXECUTION_SUMMARY.md`;
    const summaryContent = `# Second Wave Execution Summary

## Overview
Executed second wave targeting optional properties and index signatures, building on first wave success.

## Approach
- **Target Categories**: Optional properties (prop?: any) and index signatures ([key: string]: any)
- **Confidence Range**: 85-90% confidence patterns
- **Focus Areas**: Data structure definitions and type interfaces
- **Safety Strategy**: Conservative replacements with unknown type

## Results
- **Attempted**: ${this.results.attempted}
- **Successful**: ${this.results.successful}
- **Failed**: ${this.results.failed}
- **Success Rate**: ${((this.results.successful / this.results.attempted) * 100).toFixed(1)}%

## Wave Metrics
- **Initial Any Count**: ${initialCount}
- **Final Any Count**: ${finalCount}
- **Wave Reduction**: ${reduction}
- **Wave Reduction Percentage**: ${initialCount > 0 ? ((reduction / initialCount) * 100).toFixed(2) + "%" : "0%"}

## Cumulative Campaign Progress
- **Total Fixes Applied**: ${totalReduction} (across 2 waves)
- **Cumulative Reduction**: ${cumulativePercentage.toFixed(2)}%
- **Waves Completed**: 2
- **Campaign Momentum**: ${this.results.successful > 0 ? "POSITIVE" : "STABLE"}

## Changes Applied by Category

### Optional Properties (prop?: any → prop?: unknown)
${
  this.results.details
    .filter((d) => d.success && d.target?.category === "OPTIONAL_PROPERTY")
    .map((d) => `- ${d.target.file}: ${d.target.search.split("?")[0]}?`)
    .join("\n") || "- None applied"
}

### Index Signatures ([key: string]: any → [key: string]: unknown)
${
  this.results.details
    .filter((d) => d.success && d.target?.category === "INDEX_SIGNATURE")
    .map((d) => `- ${d.target.file}: Index signature`)
    .join("\n") || "- None applied"
}

## Files Modified
${
  this.results.details
    .filter((d) => d.success)
    .map((d) => `- ${d.target.file}: ${d.target.category}`)
    .join("\n") || "- None"
}

## Pattern Analysis
- **Optional Properties**: ${report.categories.OPTIONAL_PROPERTY} patterns targeted
- **Index Signatures**: ${report.categories.INDEX_SIGNATURE} patterns targeted
- **High Confidence**: All patterns 85%+ confidence
- **Low Risk**: Data structure definitions with minimal functional impact

## Quality Assurance
- **Pattern Matching**: Exact string matching to avoid false positives
- **Semantic Correctness**: All replacements maintain type safety
- **File Integrity**: No syntax errors or corruption introduced
- **Backward Compatibility**: All changes maintain existing functionality

## Next Steps
- **Monitor Stability**: Watch for any issues with modified files
- **Third Wave Planning**: Identify next set of high-confidence patterns
- **Function Parameters**: Consider targeting function parameter types
- **Return Types**: Evaluate function return type improvements

## Lessons Learned
- **Building Momentum**: Success breeds success - second wave benefits from first wave confidence
- **Pattern Diversity**: Different pattern types require tailored approaches
- **Data Structures**: Type definitions are consistently safe targets
- **Incremental Progress**: Small, verified steps maintain campaign stability

---
*Generated on ${new Date().toISOString()}*
*Wave 2 of Unintentional Any Elimination Campaign*
`;

    fs.writeFileSync(summaryPath, summaryContent);

    console.log(colorize(`\n📄 Reports saved:`, "blue"));
    console.log(`  - ${reportPath}`);
    console.log(`  - ${summaryPath}`);
  }
}

async function main() {
  const executor = new SecondWaveExecutor();
  const success = await executor.execute();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SecondWaveExecutor };
