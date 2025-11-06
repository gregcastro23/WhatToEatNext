#!/usr/bin/env node

/**
 * Comprehensive ESLint Warning Analyzer
 *
 * Generates detailed categorization and analysis of all ESLint warnings
 * in the codebase for systematic resolution planning.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ESLintWarningAnalyzer {
  constructor() {
    this.warnings = [];
    this.categories = {};
    this.severityBreakdown = {};
    this.fileBreakdown = {};
    this.ruleBreakdown = {};
    this.priorityMatrix = {};
  }

  /**
   * Generate comprehensive ESLint report
   */
  async generateComprehensiveReport() {
    console.log("🔍 Generating comprehensive ESLint warning report...");

    try {
      // Run ESLint with JSON output to get detailed warning information
      console.log("📊 Running ESLint analysis...");
      const eslintOutput = this.runESLintAnalysis();

      // Parse and categorize warnings
      console.log("📋 Parsing and categorizing warnings...");
      this.parseESLintOutput(eslintOutput);

      // Generate categorization
      console.log("🏷️ Categorizing warnings by type and severity...");
      this.categorizeWarnings();

      // Create priority matrix
      console.log("⚡ Creating priority matrix...");
      this.createPriorityMatrix();

      // Generate comprehensive report
      console.log("📄 Generating comprehensive report...");
      const report = this.generateReport();

      // Save report to file
      const reportPath = "eslint-warning-categorization-report.json";
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Generate markdown summary
      const summaryPath = "eslint-warning-categorization-summary.md";
      const markdownSummary = this.generateMarkdownSummary(report);
      fs.writeFileSync(summaryPath, markdownSummary);

      console.log(`✅ Comprehensive ESLint report generated:`);
      console.log(`   📊 JSON Report: ${reportPath}`);
      console.log(`   📝 Summary: ${summaryPath}`);
      console.log(`   🎯 Total Warnings: ${this.warnings.length}`);
      console.log(
        `   📂 Files Analyzed: ${Object.keys(this.fileBreakdown).length}`,
      );
      console.log(
        `   🔧 Rule Types: ${Object.keys(this.ruleBreakdown).length}`,
      );

      return report;
    } catch (error) {
      console.error("❌ Error generating ESLint report:", error.message);
      throw error;
    }
  }

  /**
   * Run ESLint analysis and capture output
   */
  runESLintAnalysis() {
    try {
      // Use the fast configuration for comprehensive analysis
      const command = "yarn lint:quick --format=json --no-fix";
      console.log(`   Running: ${command}`);

      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large output
      });

      return output;
    } catch (error) {
      // ESLint returns non-zero exit code when warnings/errors are found
      // The output is still in error.stdout
      if (error.stdout) {
        return error.stdout;
      }
      throw error;
    }
  }

  /**
   * Parse ESLint JSON output and extract warnings
   */
  parseESLintOutput(output) {
    try {
      const results = JSON.parse(output);

      for (const fileResult of results) {
        const filePath = fileResult.filePath;

        for (const message of fileResult.messages) {
          if (message.severity === 1) {
            // Warnings only (severity 1)
            this.warnings.push({
              file: this.getRelativePath(filePath),
              line: message.line,
              column: message.column,
              rule: message.ruleId,
              message: message.message,
              severity: "warning",
              fixable: message.fix ? true : false,
              suggestions: message.suggestions || [],
            });
          }
        }
      }

      console.log(
        `   📊 Parsed ${this.warnings.length} warnings from ${results.length} files`,
      );
    } catch (error) {
      console.error("❌ Error parsing ESLint output:", error.message);
      throw error;
    }
  }

  /**
   * Categorize warnings by type, severity, and impact
   */
  categorizeWarnings() {
    // Define warning categories
    const categoryMap = {
      "type-safety": [
        "@typescript-eslint/no-explicit-any",
        "@typescript-eslint/no-unsafe-assignment",
        "@typescript-eslint/no-unsafe-member-access",
        "@typescript-eslint/no-unsafe-call",
        "@typescript-eslint/no-unsafe-return",
        "@typescript-eslint/no-unsafe-argument",
      ],
      "code-quality": [
        "@typescript-eslint/no-unused-vars",
        "no-unused-vars",
        "prefer-const",
        "no-var",
        "eqeqeq",
        "no-constant-condition",
      ],
      "react-hooks": [
        "react-hooks/exhaustive-deps",
        "react-hooks/rules-of-hooks",
      ],
      imports: [
        "import/order",
        "import/no-unresolved",
        "import/no-duplicates",
        "@typescript-eslint/no-unused-imports",
      ],
      "console-debugging": ["no-console"],
      "style-formatting": [
        "@typescript-eslint/prefer-nullish-coalescing",
        "@typescript-eslint/prefer-optional-chain",
        "prefer-template",
        "object-shorthand",
      ],
      security: [
        "no-eval",
        "no-implied-eval",
        "security/detect-object-injection",
      ],
      performance: ["react/jsx-no-bind", "@typescript-eslint/prefer-readonly"],
    };

    // Categorize each warning
    for (const warning of this.warnings) {
      const rule = warning.rule;
      let category = "other";

      for (const [cat, rules] of Object.entries(categoryMap)) {
        if (rules.includes(rule)) {
          category = cat;
          break;
        }
      }

      // Update category breakdown
      if (!this.categories[category]) {
        this.categories[category] = [];
      }
      this.categories[category].push(warning);

      // Update rule breakdown
      if (!this.ruleBreakdown[rule]) {
        this.ruleBreakdown[rule] = 0;
      }
      this.ruleBreakdown[rule]++;

      // Update file breakdown
      if (!this.fileBreakdown[warning.file]) {
        this.fileBreakdown[warning.file] = 0;
      }
      this.fileBreakdown[warning.file]++;
    }

    console.log(
      `   🏷️ Categorized warnings into ${Object.keys(this.categories).length} categories`,
    );
  }

  /**
   * Create priority matrix for warning resolution
   */
  createPriorityMatrix() {
    // Define priority levels based on impact and effort
    const priorityRules = {
      critical: {
        description: "High impact, easy to fix",
        rules: ["no-console", "prefer-const", "no-var", "eqeqeq"],
        weight: 4,
      },
      high: {
        description: "High impact, moderate effort",
        rules: [
          "@typescript-eslint/no-unused-vars",
          "no-unused-vars",
          "import/order",
          "react-hooks/exhaustive-deps",
        ],
        weight: 3,
      },
      medium: {
        description: "Medium impact, variable effort",
        rules: [
          "@typescript-eslint/no-explicit-any",
          "@typescript-eslint/prefer-optional-chain",
          "import/no-unresolved",
        ],
        weight: 2,
      },
      low: {
        description: "Low impact, style improvements",
        rules: [
          "prefer-template",
          "object-shorthand",
          "@typescript-eslint/prefer-nullish-coalescing",
        ],
        weight: 1,
      },
    };

    // Assign priorities to warnings
    for (const [priority, config] of Object.entries(priorityRules)) {
      this.priorityMatrix[priority] = {
        description: config.description,
        weight: config.weight,
        warnings: [],
        count: 0,
        estimatedEffort: 0,
      };

      for (const warning of this.warnings) {
        if (config.rules.includes(warning.rule)) {
          this.priorityMatrix[priority].warnings.push(warning);
          this.priorityMatrix[priority].count++;

          // Estimate effort (minutes per warning)
          const effortMap = {
            "no-console": 1,
            "prefer-const": 0.5,
            "no-var": 1,
            eqeqeq: 2,
            "@typescript-eslint/no-unused-vars": 3,
            "import/order": 1,
            "react-hooks/exhaustive-deps": 10,
            "@typescript-eslint/no-explicit-any": 15,
          };

          this.priorityMatrix[priority].estimatedEffort +=
            effortMap[warning.rule] || 5;
        }
      }
    }

    console.log(
      `   ⚡ Created priority matrix with ${Object.keys(this.priorityMatrix).length} priority levels`,
    );
  }

  /**
   * Generate comprehensive report object
   */
  generateReport() {
    const totalWarnings = this.warnings.length;
    const totalFiles = Object.keys(this.fileBreakdown).length;

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalWarnings,
        totalFiles,
        totalRules: Object.keys(this.ruleBreakdown).length,
        analysisCommand: "yarn lint:quick --format=json",
      },
      summary: {
        warningsByCategory: Object.fromEntries(
          Object.entries(this.categories).map(([cat, warnings]) => [
            cat,
            warnings.length,
          ]),
        ),
        warningsByPriority: Object.fromEntries(
          Object.entries(this.priorityMatrix).map(([priority, data]) => [
            priority,
            data.count,
          ]),
        ),
        topRules: Object.entries(this.ruleBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([rule, count]) => ({ rule, count })),
        topFiles: Object.entries(this.fileBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([file, count]) => ({ file, count })),
      },
      categories: this.categories,
      priorityMatrix: this.priorityMatrix,
      ruleBreakdown: this.ruleBreakdown,
      fileBreakdown: this.fileBreakdown,
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Priority-based recommendations
    for (const [priority, data] of Object.entries(this.priorityMatrix)) {
      if (data.count > 0) {
        recommendations.push({
          type: "priority",
          priority,
          description: `Address ${data.count} ${priority} priority warnings`,
          estimatedEffort: `${Math.ceil(data.estimatedEffort / 60)} hours`,
          impact:
            data.weight >= 3 ? "high" : data.weight >= 2 ? "medium" : "low",
        });
      }
    }

    // Category-based recommendations
    const categoryPriorities = {
      "type-safety": {
        priority: "high",
        reason: "Improves code reliability and prevents runtime errors",
      },
      "code-quality": {
        priority: "high",
        reason: "Reduces technical debt and improves maintainability",
      },
      "console-debugging": {
        priority: "medium",
        reason: "Cleans up development artifacts",
      },
      "react-hooks": {
        priority: "high",
        reason: "Prevents React performance issues and bugs",
      },
      imports: {
        priority: "medium",
        reason: "Improves code organization and build performance",
      },
    };

    for (const [category, warnings] of Object.entries(this.categories)) {
      if (warnings.length > 10) {
        // Only recommend for categories with significant warnings
        const config = categoryPriorities[category] || {
          priority: "low",
          reason: "General code improvement",
        };
        recommendations.push({
          type: "category",
          category,
          count: warnings.length,
          priority: config.priority,
          reason: config.reason,
          suggestedApproach: this.getSuggestedApproach(category),
        });
      }
    }

    return recommendations;
  }

  /**
   * Get suggested approach for category
   */
  getSuggestedApproach(category) {
    const approaches = {
      "type-safety":
        "Gradual replacement with proper types, preserve intentional any types",
      "code-quality":
        "Automated fixes where safe, manual review for complex cases",
      "console-debugging":
        "Automated removal with preservation of intentional debug statements",
      "react-hooks":
        "Manual review required, use useCallback and useMemo appropriately",
      imports: "Automated import sorting and unused import removal",
      "style-formatting": "Automated fixes with Prettier integration",
      performance: "Manual optimization with performance testing",
      security: "Manual review required, security implications",
    };

    return approaches[category] || "Manual review and systematic resolution";
  }

  /**
   * Generate markdown summary report
   */
  generateMarkdownSummary(report) {
    const { metadata, summary, priorityMatrix, recommendations } = report;

    return `# ESLint Warning Categorization Summary

## Overview

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Warnings:** ${metadata.totalWarnings}
**Files Analyzed:** ${metadata.totalFiles}
**Rule Types:** ${metadata.totalRules}

## Warning Distribution

### By Category
${Object.entries(summary.warningsByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([category, count]) => `- **${category}**: ${count} warnings`)
  .join("\n")}

### By Priority
${Object.entries(summary.warningsByPriority)
  .sort(([, a], [, b]) => b - a)
  .map(
    ([priority, count]) => `- **${priority.toUpperCase()}**: ${count} warnings`,
  )
  .join("\n")}

## Top Warning Rules

${summary.topRules
  .map(
    (rule, index) =>
      `${index + 1}. **${rule.rule}**: ${rule.count} occurrences`,
  )
  .join("\n")}

## High-Impact Files

${summary.topFiles
  .slice(0, 10)
  .map(
    (file, index) => `${index + 1}. \`${file.file}\`: ${file.count} warnings`,
  )
  .join("\n")}

## Priority Matrix

${Object.entries(priorityMatrix)
  .filter(([, data]) => data.count > 0)
  .map(
    ([priority, data]) => `### ${priority.toUpperCase()} Priority
- **Count**: ${data.count} warnings
- **Description**: ${data.description}
- **Estimated Effort**: ${Math.ceil(data.estimatedEffort / 60)} hours
- **Weight**: ${data.weight}/4`,
  )
  .join("\n\n")}

## Recommendations

${recommendations
  .map((rec, index) => {
    if (rec.type === "priority") {
      return `${index + 1}. **${rec.priority.toUpperCase()} Priority**: ${rec.description} (${rec.estimatedEffort})`;
    } else {
      return `${index + 1}. **${rec.category}**: ${rec.count} warnings - ${rec.reason}
   - **Approach**: ${rec.suggestedApproach}`;
    }
  })
  .join("\n")}

## Next Steps

1. **Immediate Action**: Focus on CRITICAL priority warnings (${priorityMatrix.critical?.count || 0} warnings)
2. **Short Term**: Address HIGH priority warnings (${priorityMatrix.high?.count || 0} warnings)
3. **Medium Term**: Systematic resolution of MEDIUM priority warnings (${priorityMatrix.medium?.count || 0} warnings)
4. **Long Term**: Style and formatting improvements (${priorityMatrix.low?.count || 0} warnings)

## Automation Opportunities

- **Console Statement Cleanup**: ${summary.warningsByCategory["console-debugging"] || 0} warnings can be automated
- **Import Organization**: ${summary.warningsByCategory["imports"] || 0} warnings can be automated
- **Style Formatting**: ${summary.warningsByCategory["style-formatting"] || 0} warnings can be automated
- **Code Quality**: Partial automation possible for ${summary.warningsByCategory["code-quality"] || 0} warnings

---

*Report generated by comprehensive-eslint-warning-analyzer.cjs*
`;
  }

  /**
   * Get relative path from absolute path
   */
  getRelativePath(absolutePath) {
    return path.relative(process.cwd(), absolutePath);
  }
}

// Main execution
async function main() {
  const analyzer = new ESLintWarningAnalyzer();

  try {
    const report = await analyzer.generateComprehensiveReport();

    console.log("\n🎯 Analysis Complete!");
    console.log("\n📊 Summary:");
    console.log(`   Total Warnings: ${report.metadata.totalWarnings}`);
    console.log(`   Categories: ${Object.keys(report.categories).length}`);
    console.log(
      `   Priority Levels: ${Object.keys(report.priorityMatrix).length}`,
    );
    console.log(`   Recommendations: ${report.recommendations.length}`);

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Analysis failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ESLintWarningAnalyzer };
