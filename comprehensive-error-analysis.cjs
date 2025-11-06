#!/usr/bin/env node

/**
 * Comprehensive Error Analysis and Categorization System
 *
 * This script implements task 1.1 from the linting excellence spec:
 * - Analyze current TypeScript errors by type and frequency
 * - Categorize ESLint issues by severity and fixability
 * - Identify high-impact files with concentrated error patterns
 * - Create error priority matrix based on build impact and fix complexity
 * - Generate baseline metrics for progress tracking
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ComprehensiveErrorAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      typeScriptErrors: {
        total: 0,
        byType: {},
        byFile: {},
        highImpactFiles: [],
      },
      eslintIssues: {
        total: 0,
        byRule: {},
        bySeverity: {},
        byFile: {},
        autoFixable: 0,
        manualReview: 0,
      },
      priorityMatrix: [],
      baselineMetrics: {},
      recommendations: [],
    };
  }

  /**
   * Analyze TypeScript errors by type and frequency
   */
  async analyzeTypeScriptErrors() {
    console.log("🔍 Analyzing TypeScript errors...");

    try {
      // Get TypeScript compilation errors
      const tscOutput = execSync(
        "yarn tsc --noEmit --skipLibCheck 2>&1 || true",
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      const errorLines = tscOutput
        .split("\n")
        .filter(
          (line) => line.includes("error TS") && !line.includes("Found "),
        );

      this.results.typeScriptErrors.total = errorLines.length;

      // Parse errors by type
      const errorsByType = {};
      const errorsByFile = {};

      errorLines.forEach((line) => {
        // Extract error code (e.g., TS2304, TS1005)
        const errorMatch = line.match(/error (TS\d+):/);
        if (errorMatch) {
          const errorCode = errorMatch[1];
          errorsByType[errorCode] = (errorsByType[errorCode] || 0) + 1;
        }

        // Extract file path
        const fileMatch = line.match(/^([^(]+)\(/);
        if (fileMatch) {
          const filePath = fileMatch[1].trim();
          errorsByFile[filePath] = (errorsByFile[filePath] || 0) + 1;
        }
      });

      this.results.typeScriptErrors.byType = errorsByType;
      this.results.typeScriptErrors.byFile = errorsByFile;

      // Identify high-impact files (>10 errors)
      this.results.typeScriptErrors.highImpactFiles = Object.entries(
        errorsByFile,
      )
        .filter(([file, count]) => count >= 10)
        .sort(([, a], [, b]) => b - a)
        .map(([file, count]) => ({ file, errorCount: count }));

      console.log(
        `✅ Found ${this.results.typeScriptErrors.total} TypeScript errors`,
      );
      console.log(`📊 Error types: ${Object.keys(errorsByType).length}`);
      console.log(
        `🎯 High-impact files: ${this.results.typeScriptErrors.highImpactFiles.length}`,
      );
    } catch (error) {
      console.error("❌ Error analyzing TypeScript errors:", error.message);
      this.results.typeScriptErrors.analysisError = error.message;
    }
  }

  /**
   * Categorize ESLint issues by severity and fixability
   */
  async analyzeESLintIssues() {
    console.log("🔍 Analyzing ESLint issues...");

    try {
      // Get ESLint issues in JSON format
      const eslintOutput = execSync(
        'yarn lint --format=json 2>/dev/null || echo "[]"',
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        },
      );

      let eslintResults;
      try {
        eslintResults = JSON.parse(eslintOutput);
      } catch (parseError) {
        console.warn(
          "⚠️ Could not parse ESLint JSON output, trying alternative approach...",
        );

        // Fallback: parse text output
        const textOutput = execSync("yarn lint 2>&1 || true", {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        });

        eslintResults = this.parseESLintTextOutput(textOutput);
      }

      if (!Array.isArray(eslintResults)) {
        eslintResults = [];
      }

      // Analyze ESLint results
      const issuesByRule = {};
      const issuesBySeverity = { error: 0, warning: 0 };
      const issuesByFile = {};
      let autoFixableCount = 0;
      let totalIssues = 0;

      eslintResults.forEach((fileResult) => {
        if (fileResult.messages) {
          issuesByFile[fileResult.filePath] = fileResult.messages.length;

          fileResult.messages.forEach((message) => {
            totalIssues++;

            // Count by rule
            const rule = message.ruleId || "unknown";
            issuesByRule[rule] = (issuesByRule[rule] || 0) + 1;

            // Count by severity
            const severity = message.severity === 2 ? "error" : "warning";
            issuesBySeverity[severity]++;

            // Count auto-fixable
            if (message.fix || this.isAutoFixableRule(rule)) {
              autoFixableCount++;
            }
          });
        }
      });

      this.results.eslintIssues.total = totalIssues;
      this.results.eslintIssues.byRule = issuesByRule;
      this.results.eslintIssues.bySeverity = issuesBySeverity;
      this.results.eslintIssues.byFile = issuesByFile;
      this.results.eslintIssues.autoFixable = autoFixableCount;
      this.results.eslintIssues.manualReview = totalIssues - autoFixableCount;

      console.log(`✅ Found ${totalIssues} ESLint issues`);
      console.log(`🔧 Auto-fixable: ${autoFixableCount}`);
      console.log(`👁️ Manual review: ${totalIssues - autoFixableCount}`);
    } catch (error) {
      console.error("❌ Error analyzing ESLint issues:", error.message);
      this.results.eslintIssues.analysisError = error.message;
    }
  }

  /**
   * Parse ESLint text output as fallback
   */
  parseESLintTextOutput(textOutput) {
    const lines = textOutput.split("\n");
    const results = [];
    let currentFile = null;
    let currentMessages = [];

    lines.forEach((line) => {
      // Check if line is a file path
      if (line.match(/^\/.*\.(ts|tsx|js|jsx)$/)) {
        if (currentFile) {
          results.push({
            filePath: currentFile,
            messages: currentMessages,
          });
        }
        currentFile = line.trim();
        currentMessages = [];
      } else if (line.match(/^\s+\d+:\d+/)) {
        // Parse error/warning line
        const match = line.match(
          /^\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+([a-zA-Z0-9/@-]+)$/,
        );
        if (match) {
          currentMessages.push({
            line: parseInt(match[1]),
            column: parseInt(match[2]),
            severity: match[3] === "error" ? 2 : 1,
            message: match[4],
            ruleId: match[5],
          });
        }
      }
    });

    if (currentFile) {
      results.push({
        filePath: currentFile,
        messages: currentMessages,
      });
    }

    return results;
  }

  /**
   * Check if a rule is typically auto-fixable
   */
  isAutoFixableRule(rule) {
    const autoFixableRules = [
      "@typescript-eslint/no-unused-vars",
      "no-unused-vars",
      "prefer-const",
      "no-var",
      "quotes",
      "semi",
      "comma-dangle",
      "indent",
      "space-before-function-paren",
      "object-curly-spacing",
      "array-bracket-spacing",
      "import/order",
      "import/newline-after-import",
    ];

    return autoFixableRules.includes(rule);
  }

  /**
   * Create error priority matrix based on build impact and fix complexity
   */
  createPriorityMatrix() {
    console.log("📊 Creating error priority matrix...");

    const priorityMatrix = [];

    // TypeScript error priorities
    const tsErrorPriorities = {
      TS1005: {
        priority: "CRITICAL",
        complexity: "MEDIUM",
        buildImpact: "HIGH",
        description: "Syntax errors - prevent compilation",
      },
      TS1128: {
        priority: "CRITICAL",
        complexity: "LOW",
        buildImpact: "HIGH",
        description: "Declaration errors - prevent compilation",
      },
      TS2304: {
        priority: "HIGH",
        complexity: "MEDIUM",
        buildImpact: "HIGH",
        description: "Cannot find name errors",
      },
      TS2339: {
        priority: "HIGH",
        complexity: "MEDIUM",
        buildImpact: "MEDIUM",
        description: "Property access errors",
      },
      TS2322: {
        priority: "MEDIUM",
        complexity: "HIGH",
        buildImpact: "MEDIUM",
        description: "Type assignment errors",
      },
      TS2345: {
        priority: "MEDIUM",
        complexity: "MEDIUM",
        buildImpact: "MEDIUM",
        description: "Argument type errors",
      },
      TS2571: {
        priority: "LOW",
        complexity: "LOW",
        buildImpact: "LOW",
        description: "Object literal errors",
      },
    };

    Object.entries(this.results.typeScriptErrors.byType).forEach(
      ([errorType, count]) => {
        const priority = tsErrorPriorities[errorType] || {
          priority: "MEDIUM",
          complexity: "MEDIUM",
          buildImpact: "MEDIUM",
          description: "Other TypeScript error",
        };

        priorityMatrix.push({
          type: "TypeScript",
          errorType,
          count,
          ...priority,
          estimatedEffort: this.calculateEstimatedEffort(
            count,
            priority.complexity,
          ),
        });
      },
    );

    // ESLint issue priorities
    const eslintPriorities = {
      "@typescript-eslint/no-unused-vars": {
        priority: "MEDIUM",
        complexity: "LOW",
        buildImpact: "LOW",
        autoFixable: true,
      },
      "@typescript-eslint/no-explicit-any": {
        priority: "MEDIUM",
        complexity: "HIGH",
        buildImpact: "LOW",
        autoFixable: false,
      },
      "react-hooks/exhaustive-deps": {
        priority: "HIGH",
        complexity: "MEDIUM",
        buildImpact: "MEDIUM",
        autoFixable: false,
      },
      "no-console": {
        priority: "LOW",
        complexity: "LOW",
        buildImpact: "LOW",
        autoFixable: true,
      },
      "prefer-const": {
        priority: "LOW",
        complexity: "LOW",
        buildImpact: "LOW",
        autoFixable: true,
      },
      "no-var": {
        priority: "MEDIUM",
        complexity: "LOW",
        buildImpact: "LOW",
        autoFixable: true,
      },
    };

    Object.entries(this.results.eslintIssues.byRule).forEach(
      ([rule, count]) => {
        const priority = eslintPriorities[rule] || {
          priority: "MEDIUM",
          complexity: "MEDIUM",
          buildImpact: "LOW",
          autoFixable: this.isAutoFixableRule(rule),
        };

        priorityMatrix.push({
          type: "ESLint",
          errorType: rule,
          count,
          ...priority,
          estimatedEffort: this.calculateEstimatedEffort(
            count,
            priority.complexity,
            priority.autoFixable,
          ),
        });
      },
    );

    // Sort by priority and impact
    priorityMatrix.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

      const aPriorityScore =
        priorityOrder[a.priority] * 10 + impactOrder[a.buildImpact];
      const bPriorityScore =
        priorityOrder[b.priority] * 10 + impactOrder[b.buildImpact];

      return bPriorityScore - aPriorityScore;
    });

    this.results.priorityMatrix = priorityMatrix;
    console.log(
      `✅ Created priority matrix with ${priorityMatrix.length} entries`,
    );
  }

  /**
   * Calculate estimated effort for fixing errors
   */
  calculateEstimatedEffort(count, complexity, autoFixable = false) {
    const baseMinutes = {
      LOW: autoFixable ? 0.5 : 2,
      MEDIUM: autoFixable ? 1 : 5,
      HIGH: autoFixable ? 2 : 15,
    };

    return Math.ceil(count * baseMinutes[complexity]);
  }

  /**
   * Generate baseline metrics for progress tracking
   */
  generateBaselineMetrics() {
    console.log("📈 Generating baseline metrics...");

    const baseline = {
      timestamp: new Date().toISOString(),
      typeScript: {
        totalErrors: this.results.typeScriptErrors.total,
        criticalErrors: this.getCriticalErrorCount(),
        highImpactFiles: this.results.typeScriptErrors.highImpactFiles.length,
        mostCommonErrors: this.getTopErrors(
          this.results.typeScriptErrors.byType,
          5,
        ),
      },
      eslint: {
        totalIssues: this.results.eslintIssues.total,
        errors: this.results.eslintIssues.bySeverity.error || 0,
        warnings: this.results.eslintIssues.bySeverity.warning || 0,
        autoFixablePercentage: Math.round(
          (this.results.eslintIssues.autoFixable /
            this.results.eslintIssues.total) *
            100,
        ),
        mostCommonRules: this.getTopErrors(this.results.eslintIssues.byRule, 5),
      },
      estimatedEffort: {
        totalMinutes: this.results.priorityMatrix.reduce(
          (sum, item) => sum + item.estimatedEffort,
          0,
        ),
        criticalMinutes: this.results.priorityMatrix
          .filter((item) => item.priority === "CRITICAL")
          .reduce((sum, item) => sum + item.estimatedEffort, 0),
        autoFixableMinutes: this.results.priorityMatrix
          .filter((item) => item.autoFixable)
          .reduce((sum, item) => sum + item.estimatedEffort, 0),
      },
    };

    this.results.baselineMetrics = baseline;
    console.log(`✅ Generated baseline metrics`);
    console.log(
      `⏱️ Estimated total effort: ${baseline.estimatedEffort.totalMinutes} minutes`,
    );
  }

  /**
   * Get count of critical errors (build-blocking)
   */
  getCriticalErrorCount() {
    const criticalErrorTypes = ["TS1005", "TS1128", "TS1003"];
    return criticalErrorTypes.reduce((sum, errorType) => {
      return sum + (this.results.typeScriptErrors.byType[errorType] || 0);
    }, 0);
  }

  /**
   * Get top N errors by frequency
   */
  getTopErrors(errorObject, n) {
    return Object.entries(errorObject)
      .sort(([, a], [, b]) => b - a)
      .slice(0, n)
      .map(([type, count]) => ({ type, count }));
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations() {
    console.log("💡 Generating recommendations...");

    const recommendations = [];

    // TypeScript recommendations
    if (this.results.typeScriptErrors.total > 0) {
      const criticalCount = this.getCriticalErrorCount();
      if (criticalCount > 0) {
        recommendations.push({
          priority: "CRITICAL",
          category: "TypeScript",
          title: `Fix ${criticalCount} critical syntax errors immediately`,
          description:
            "TS1005, TS1128, and TS1003 errors prevent compilation and must be addressed first",
          estimatedEffort: `${this.results.priorityMatrix
            .filter((item) => item.priority === "CRITICAL")
            .reduce((sum, item) => sum + item.estimatedEffort, 0)} minutes`,
          suggestedTools: [
            "fix-ts1005-targeted-safe.cjs",
            "enhanced-ts1128-declaration-fixer.cjs",
          ],
        });
      }

      if (this.results.typeScriptErrors.highImpactFiles.length > 0) {
        recommendations.push({
          priority: "HIGH",
          category: "TypeScript",
          title: `Focus on ${this.results.typeScriptErrors.highImpactFiles.length} high-impact files`,
          description:
            "Files with 10+ errors should be prioritized for batch processing",
          files: this.results.typeScriptErrors.highImpactFiles
            .slice(0, 5)
            .map((f) => f.file),
          suggestedApproach:
            "Batch processing with validation checkpoints every 5 files",
        });
      }
    }

    // ESLint recommendations
    if (this.results.eslintIssues.total > 0) {
      const autoFixablePercentage = Math.round(
        (this.results.eslintIssues.autoFixable /
          this.results.eslintIssues.total) *
          100,
      );

      if (autoFixablePercentage > 30) {
        recommendations.push({
          priority: "MEDIUM",
          category: "ESLint",
          title: `Auto-fix ${this.results.eslintIssues.autoFixable} issues (${autoFixablePercentage}% of total)`,
          description:
            "Many ESLint issues can be automatically fixed to reduce manual effort",
          estimatedEffort: `${this.results.priorityMatrix
            .filter((item) => item.autoFixable)
            .reduce((sum, item) => sum + item.estimatedEffort, 0)} minutes`,
          suggestedCommand: "yarn lint --fix",
        });
      }

      const topRule = this.getTopErrors(this.results.eslintIssues.byRule, 1)[0];
      if (topRule && topRule.count > 100) {
        recommendations.push({
          priority: "MEDIUM",
          category: "ESLint",
          title: `Address ${topRule.count} instances of ${topRule.type}`,
          description:
            "Most common ESLint issue should be addressed systematically",
          suggestedApproach: "Create targeted script for this specific rule",
        });
      }
    }

    // Performance recommendations
    const totalEffort =
      this.results.baselineMetrics.estimatedEffort.totalMinutes;
    if (totalEffort > 480) {
      // More than 8 hours
      recommendations.push({
        priority: "HIGH",
        category: "Strategy",
        title: "Implement phased approach for large error count",
        description: `${totalEffort} minutes of estimated effort requires systematic campaign approach`,
        suggestedPhases: [
          "Phase 1: Critical TypeScript errors (build-blocking)",
          "Phase 2: High-impact files and common patterns",
          "Phase 3: Auto-fixable ESLint issues",
          "Phase 4: Manual review and complex fixes",
        ],
      });
    }

    this.results.recommendations = recommendations;
    console.log(`✅ Generated ${recommendations.length} recommendations`);
  }

  /**
   * Save comprehensive analysis results
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `comprehensive-error-analysis-${timestamp}.json`;

    try {
      fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
      console.log(`💾 Saved detailed results to ${filename}`);

      // Also save a summary report
      const summaryFilename = `error-analysis-summary-${timestamp}.md`;
      const summaryReport = this.generateSummaryReport();
      fs.writeFileSync(summaryFilename, summaryReport);
      console.log(`📄 Saved summary report to ${summaryFilename}`);

      return { detailedReport: filename, summaryReport: summaryFilename };
    } catch (error) {
      console.error("❌ Error saving results:", error.message);
      throw error;
    }
  }

  /**
   * Generate human-readable summary report
   */
  generateSummaryReport() {
    const { baselineMetrics, priorityMatrix, recommendations } = this.results;

    return `# Comprehensive Error Analysis Summary

**Analysis Date:** ${new Date().toLocaleString()}

## Executive Summary

- **TypeScript Errors:** ${baselineMetrics.typeScript.totalErrors} total (${baselineMetrics.typeScript.criticalErrors} critical)
- **ESLint Issues:** ${baselineMetrics.eslint.totalIssues} total (${baselineMetrics.eslint.errors} errors, ${baselineMetrics.eslint.warnings} warnings)
- **High-Impact Files:** ${baselineMetrics.typeScript.highImpactFiles} files with 10+ errors
- **Auto-Fixable Issues:** ${baselineMetrics.eslint.autoFixablePercentage}% of ESLint issues
- **Estimated Total Effort:** ${Math.round(baselineMetrics.estimatedEffort.totalMinutes / 60)} hours

## TypeScript Error Breakdown

${baselineMetrics.typeScript.mostCommonErrors
  .map((error) => `- **${error.type}:** ${error.count} occurrences`)
  .join("\n")}

## ESLint Issue Breakdown

${baselineMetrics.eslint.mostCommonRules
  .map((rule) => `- **${rule.type}:** ${rule.count} occurrences`)
  .join("\n")}

## Priority Matrix (Top 10)

${priorityMatrix
  .slice(0, 10)
  .map(
    (item, index) =>
      `${index + 1}. **${item.errorType}** (${item.type})
   - Count: ${item.count}
   - Priority: ${item.priority}
   - Complexity: ${item.complexity}
   - Build Impact: ${item.buildImpact}
   - Estimated Effort: ${item.estimatedEffort} minutes`,
  )
  .join("\n\n")}

## Recommendations

${recommendations
  .map(
    (rec, index) =>
      `### ${index + 1}. ${rec.title} (${rec.priority})
${rec.description}
${rec.estimatedEffort ? `**Estimated Effort:** ${rec.estimatedEffort}` : ""}
${rec.suggestedTools ? `**Suggested Tools:** ${rec.suggestedTools.join(", ")}` : ""}
${rec.suggestedCommand ? `**Suggested Command:** \`${rec.suggestedCommand}\`` : ""}
${rec.files ? `**Key Files:** ${rec.files.slice(0, 3).join(", ")}${rec.files.length > 3 ? "..." : ""}` : ""}`,
  )
  .join("\n\n")}

## Next Steps

1. **Immediate Action:** Address ${baselineMetrics.typeScript.criticalErrors} critical TypeScript errors
2. **Quick Wins:** Auto-fix ${this.results.eslintIssues.autoFixable} ESLint issues
3. **Systematic Approach:** Implement phased campaign for remaining ${baselineMetrics.typeScript.totalErrors - baselineMetrics.typeScript.criticalErrors} errors
4. **Monitoring:** Set up progress tracking and validation checkpoints

---
*Generated by Comprehensive Error Analysis System*
`;
  }

  /**
   * Run complete analysis
   */
  async runCompleteAnalysis() {
    console.log("🚀 Starting comprehensive error analysis...\n");

    try {
      await this.analyzeTypeScriptErrors();
      console.log("");

      await this.analyzeESLintIssues();
      console.log("");

      this.createPriorityMatrix();
      console.log("");

      this.generateBaselineMetrics();
      console.log("");

      this.generateRecommendations();
      console.log("");

      const savedFiles = await this.saveResults();

      console.log("\n🎉 Comprehensive error analysis complete!");
      console.log("\n📊 Summary:");
      console.log(
        `   TypeScript Errors: ${this.results.typeScriptErrors.total}`,
      );
      console.log(`   ESLint Issues: ${this.results.eslintIssues.total}`);
      console.log(`   Priority Items: ${this.results.priorityMatrix.length}`);
      console.log(`   Recommendations: ${this.results.recommendations.length}`);
      console.log(`\n📁 Reports saved:`);
      console.log(`   Detailed: ${savedFiles.detailedReport}`);
      console.log(`   Summary: ${savedFiles.summaryReport}`);

      return this.results;
    } catch (error) {
      console.error("\n❌ Analysis failed:", error.message);
      throw error;
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new ComprehensiveErrorAnalyzer();
  analyzer
    .runCompleteAnalysis()
    .then(() => {
      console.log("\n✅ Analysis completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Analysis failed:", error);
      process.exit(1);
    });
}

module.exports = ComprehensiveErrorAnalyzer;
