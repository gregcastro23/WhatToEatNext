#!/usr/bin/env node

/**
 * ESLint Warning Categorizer
 *
 * Generates categorized analysis of ESLint warnings for systematic resolution
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ESLintWarningCategorizer {
  constructor() {
    this.warnings = [];
    this.categories = {};
    this.ruleBreakdown = {};
    this.fileBreakdown = {};
    this.priorityMatrix = {};
  }

  /**
   * Main analysis function
   */
  async analyze() {
    console.log("🔍 ESLint Warning Categorization Analysis");
    console.log("==========================================\n");

    try {
      // Step 1: Get ESLint output
      console.log("📊 Step 1: Running ESLint analysis...");
      await this.runESLintAnalysis();

      // Step 2: Categorize warnings
      console.log("🏷️ Step 2: Categorizing warnings...");
      this.categorizeWarnings();

      // Step 3: Create priority matrix
      console.log("⚡ Step 3: Creating priority matrix...");
      this.createPriorityMatrix();

      // Step 4: Generate reports
      console.log("📄 Step 4: Generating reports...");
      const report = this.generateReport();

      // Save reports
      this.saveReports(report);

      // Display summary
      this.displaySummary(report);

      return report;
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      throw error;
    }
  }

  /**
   * Run ESLint and parse warnings
   */
  async runESLintAnalysis() {
    try {
      // Get ESLint output in a parseable format
      const command = "yarn lint:quick 2>&1";
      console.log(`   Running: ${command}`);

      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        maxBuffer: 50 * 1024 * 1024,
      });

      this.parseESLintTextOutput(output);
    } catch (error) {
      // ESLint returns non-zero exit code when issues are found
      if (error.stdout) {
        this.parseESLintTextOutput(error.stdout);
      } else {
        throw error;
      }
    }
  }

  /**
   * Parse ESLint text output to extract warnings
   */
  parseESLintTextOutput(output) {
    const lines = output.split("\n");
    let currentFile = "";
    let warningCount = 0;

    // Patterns to match ESLint output
    const filePattern = /^([^:]+\.(ts|tsx|js|jsx))$/;
    const warningPattern =
      /^\s*(\d+):(\d+)\s+(warning)\s+(.+?)\s+([a-zA-Z0-9/@-]+)$/;
    const summaryPattern =
      /(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) continue;

      // Check for file path
      const fileMatch = line.match(filePattern);
      if (fileMatch) {
        currentFile = this.getRelativePath(fileMatch[1]);
        continue;
      }

      // Check for warning line
      const warningMatch = line.match(warningPattern);
      if (warningMatch && currentFile) {
        const [, lineNum, colNum, severity, message, rule] = warningMatch;

        this.warnings.push({
          file: currentFile,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          rule: rule,
          message: message.trim(),
          severity: "warning",
          fixable: this.isRuleAutoFixable(rule),
        });

        warningCount++;
      }

      // Check for summary line to get total counts
      const summaryMatch = line.match(summaryPattern);
      if (summaryMatch) {
        const [, total, errors, warnings] = summaryMatch;
        console.log(
          `   📊 Found ${warnings} warnings and ${errors} errors (${total} total issues)`,
        );
      }
    }

    console.log(
      `   ✅ Parsed ${this.warnings.length} warnings from ESLint output`,
    );
  }

  /**
   * Check if a rule is auto-fixable
   */
  isRuleAutoFixable(rule) {
    const autoFixableRules = [
      "prefer-const",
      "no-var",
      "import/order",
      "object-shorthand",
      "prefer-template",
      "@typescript-eslint/prefer-optional-chain",
      "@typescript-eslint/prefer-nullish-coalescing",
    ];

    return autoFixableRules.includes(rule);
  }

  /**
   * Categorize warnings by type and impact
   */
  categorizeWarnings() {
    // Define category mappings
    const categoryMap = {
      "type-safety": {
        rules: [
          "@typescript-eslint/no-explicit-any",
          "@typescript-eslint/no-unsafe-assignment",
          "@typescript-eslint/no-unsafe-member-access",
          "@typescript-eslint/no-unsafe-call",
          "@typescript-eslint/no-unsafe-return",
          "@typescript-eslint/no-unsafe-argument",
        ],
        description: "Type safety and TypeScript best practices",
        impact: "high",
      },
      "code-quality": {
        rules: [
          "@typescript-eslint/no-unused-vars",
          "no-unused-vars",
          "prefer-const",
          "no-var",
          "eqeqeq",
          "no-constant-condition",
        ],
        description: "Code quality and maintainability",
        impact: "high",
      },
      "react-hooks": {
        rules: ["react-hooks/exhaustive-deps", "react-hooks/rules-of-hooks"],
        description: "React hooks best practices",
        impact: "high",
      },
      imports: {
        rules: [
          "import/order",
          "import/no-unresolved",
          "import/no-duplicates",
          "@typescript-eslint/no-unused-imports",
        ],
        description: "Import organization and resolution",
        impact: "medium",
      },
      "console-debugging": {
        rules: ["no-console"],
        description: "Console statements and debugging artifacts",
        impact: "medium",
      },
      "style-formatting": {
        rules: [
          "@typescript-eslint/prefer-nullish-coalescing",
          "@typescript-eslint/prefer-optional-chain",
          "prefer-template",
          "object-shorthand",
        ],
        description: "Code style and formatting preferences",
        impact: "low",
      },
    };

    // Initialize categories
    for (const [category, config] of Object.entries(categoryMap)) {
      this.categories[category] = {
        warnings: [],
        count: 0,
        description: config.description,
        impact: config.impact,
        rules: config.rules,
      };
    }

    // Categorize each warning
    for (const warning of this.warnings) {
      const rule = warning.rule;
      let categorized = false;

      // Find matching category
      for (const [category, config] of Object.entries(categoryMap)) {
        if (config.rules.includes(rule)) {
          this.categories[category].warnings.push(warning);
          this.categories[category].count++;
          categorized = true;
          break;
        }
      }

      // Handle uncategorized warnings
      if (!categorized) {
        if (!this.categories["other"]) {
          this.categories["other"] = {
            warnings: [],
            count: 0,
            description: "Other warnings not in main categories",
            impact: "low",
            rules: [],
          };
        }
        this.categories["other"].warnings.push(warning);
        this.categories["other"].count++;
      }

      // Update rule breakdown
      this.ruleBreakdown[rule] = (this.ruleBreakdown[rule] || 0) + 1;

      // Update file breakdown
      this.fileBreakdown[warning.file] =
        (this.fileBreakdown[warning.file] || 0) + 1;
    }

    console.log(
      `   🏷️ Categorized ${this.warnings.length} warnings into ${Object.keys(this.categories).length} categories`,
    );
  }

  /**
   * Create priority matrix for systematic resolution
   */
  createPriorityMatrix() {
    // Define priority levels
    const priorityLevels = {
      critical: {
        description: "High impact, easy to fix - immediate action",
        rules: ["no-console", "prefer-const", "no-var", "eqeqeq"],
        weight: 4,
        estimatedMinutesPerWarning: 1,
      },
      high: {
        description: "High impact, moderate effort - short term",
        rules: [
          "@typescript-eslint/no-unused-vars",
          "no-unused-vars",
          "import/order",
        ],
        weight: 3,
        estimatedMinutesPerWarning: 3,
      },
      medium: {
        description: "Medium impact, variable effort - medium term",
        rules: [
          "@typescript-eslint/no-explicit-any",
          "react-hooks/exhaustive-deps",
        ],
        weight: 2,
        estimatedMinutesPerWarning: 10,
      },
      low: {
        description: "Low impact, style improvements - long term",
        rules: [
          "prefer-template",
          "object-shorthand",
          "@typescript-eslint/prefer-optional-chain",
        ],
        weight: 1,
        estimatedMinutesPerWarning: 2,
      },
    };

    // Initialize priority matrix
    for (const [priority, config] of Object.entries(priorityLevels)) {
      this.priorityMatrix[priority] = {
        description: config.description,
        weight: config.weight,
        warnings: [],
        count: 0,
        estimatedEffortMinutes: 0,
        autoFixableCount: 0,
      };
    }

    // Assign warnings to priority levels
    for (const warning of this.warnings) {
      let assigned = false;

      for (const [priority, config] of Object.entries(priorityLevels)) {
        if (config.rules.includes(warning.rule)) {
          this.priorityMatrix[priority].warnings.push(warning);
          this.priorityMatrix[priority].count++;
          this.priorityMatrix[priority].estimatedEffortMinutes +=
            config.estimatedMinutesPerWarning;

          if (warning.fixable) {
            this.priorityMatrix[priority].autoFixableCount++;
          }

          assigned = true;
          break;
        }
      }

      // Assign unmatched warnings to low priority
      if (!assigned) {
        this.priorityMatrix["low"].warnings.push(warning);
        this.priorityMatrix["low"].count++;
        this.priorityMatrix["low"].estimatedEffortMinutes += 2;

        if (warning.fixable) {
          this.priorityMatrix["low"].autoFixableCount++;
        }
      }
    }

    console.log(
      `   ⚡ Created priority matrix with ${Object.keys(this.priorityMatrix).length} levels`,
    );
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const totalWarnings = this.warnings.length;
    const totalFiles = Object.keys(this.fileBreakdown).length;
    const totalRules = Object.keys(this.ruleBreakdown).length;

    // Calculate totals
    const totalEstimatedHours =
      Object.values(this.priorityMatrix).reduce(
        (sum, priority) => sum + priority.estimatedEffortMinutes,
        0,
      ) / 60;

    const totalAutoFixable = Object.values(this.priorityMatrix).reduce(
      (sum, priority) => sum + priority.autoFixableCount,
      0,
    );

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalWarnings,
        totalFiles,
        totalRules,
        totalEstimatedHours: Math.ceil(totalEstimatedHours),
        totalAutoFixable,
      },
      summary: {
        warningsByCategory: Object.fromEntries(
          Object.entries(this.categories).map(([cat, data]) => [
            cat,
            data.count,
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
          .slice(0, 15)
          .map(([rule, count]) => ({
            rule,
            count,
            fixable: this.isRuleAutoFixable(rule),
          })),
        topFiles: Object.entries(this.fileBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 20)
          .map(([file, count]) => ({ file, count })),
      },
      categories: this.categories,
      priorityMatrix: this.priorityMatrix,
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
        const hours = Math.ceil(data.estimatedEffortMinutes / 60);
        recommendations.push({
          type: "priority",
          priority,
          title: `${priority.toUpperCase()} Priority Warnings`,
          count: data.count,
          description: data.description,
          estimatedEffort: `${hours} hour${hours !== 1 ? "s" : ""}`,
          autoFixable: data.autoFixableCount,
          manualReview: data.count - data.autoFixableCount,
          action:
            priority === "critical"
              ? "Immediate action recommended"
              : priority === "high"
                ? "Address in next sprint"
                : priority === "medium"
                  ? "Plan for upcoming iteration"
                  : "Include in maintenance backlog",
        });
      }
    }

    // Category-based recommendations
    const highImpactCategories = Object.entries(this.categories)
      .filter(([, data]) => data.impact === "high" && data.count > 10)
      .sort(([, a], [, b]) => b.count - a.count);

    for (const [category, data] of highImpactCategories) {
      recommendations.push({
        type: "category",
        category,
        title: `${category.replace("-", " ").toUpperCase()} Category`,
        count: data.count,
        description: data.description,
        impact: data.impact,
        approach: this.getSuggestedApproach(category),
      });
    }

    return recommendations;
  }

  /**
   * Get suggested approach for category
   */
  getSuggestedApproach(category) {
    const approaches = {
      "type-safety":
        "Gradual replacement with proper types, preserve intentional any types with ESLint disable comments",
      "code-quality":
        "Automated fixes where safe, manual review for complex unused variables",
      "console-debugging":
        "Automated removal with preservation of intentional debug statements in test files",
      "react-hooks":
        "Manual review required - use useCallback and useMemo appropriately",
      imports:
        "Automated import sorting and unused import removal using ESLint --fix",
      "style-formatting":
        "Automated fixes with ESLint --fix and Prettier integration",
    };

    return approaches[category] || "Manual review and systematic resolution";
  }

  /**
   * Save reports to files
   */
  saveReports(report) {
    // Save JSON report
    const jsonPath = "eslint-warning-categorization-report.json";
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save markdown summary
    const markdownPath = "eslint-warning-categorization-summary.md";
    const markdown = this.generateMarkdownSummary(report);
    fs.writeFileSync(markdownPath, markdown);

    console.log(`   📊 JSON Report: ${jsonPath}`);
    console.log(`   📝 Markdown Summary: ${markdownPath}`);
  }

  /**
   * Generate markdown summary
   */
  generateMarkdownSummary(report) {
    const { metadata, summary, categories, priorityMatrix, recommendations } =
      report;

    return `# ESLint Warning Categorization Summary

## Overview

**Generated:** ${new Date(metadata.generatedAt).toLocaleString()}
**Total Warnings:** ${metadata.totalWarnings}
**Files with Warnings:** ${metadata.totalFiles}
**Unique Rules:** ${metadata.totalRules}
**Estimated Resolution Time:** ${metadata.totalEstimatedHours} hours
**Auto-fixable Warnings:** ${metadata.totalAutoFixable} (${Math.round((metadata.totalAutoFixable / metadata.totalWarnings) * 100)}%)

## Warning Distribution

### By Priority Level
${Object.entries(summary.warningsByPriority)
  .sort(([, a], [, b]) => b - a)
  .map(([priority, count]) => {
    const data = priorityMatrix[priority];
    const hours = Math.ceil(data.estimatedEffortMinutes / 60);
    return `- **${priority.toUpperCase()}**: ${count} warnings (${data.autoFixableCount} auto-fixable, ~${hours}h effort)`;
  })
  .join("\n")}

### By Category
${Object.entries(summary.warningsByCategory)
  .sort(([, a], [, b]) => b - a)
  .map(([category, count]) => {
    const data = categories[category];
    return `- **${category.replace("-", " ")}**: ${count} warnings (${data.impact} impact)`;
  })
  .join("\n")}

## Top Warning Rules

${summary.topRules
  .map(
    (rule, index) =>
      `${index + 1}. **${rule.rule}**: ${rule.count} occurrences ${rule.fixable ? "🔧 (auto-fixable)" : ""}`,
  )
  .join("\n")}

## High-Impact Files

${summary.topFiles
  .slice(0, 10)
  .map(
    (file, index) => `${index + 1}. \`${file.file}\`: ${file.count} warnings`,
  )
  .join("\n")}

## Priority Matrix Details

${Object.entries(priorityMatrix)
  .filter(([, data]) => data.count > 0)
  .map(([priority, data]) => {
    const hours = Math.ceil(data.estimatedEffortMinutes / 60);
    const autoFixPercent = Math.round(
      (data.autoFixableCount / data.count) * 100,
    );
    return `### ${priority.toUpperCase()} Priority
- **Count**: ${data.count} warnings
- **Description**: ${data.description}
- **Estimated Effort**: ${hours} hour${hours !== 1 ? "s" : ""}
- **Auto-fixable**: ${data.autoFixableCount} (${autoFixPercent}%)
- **Manual Review**: ${data.count - data.autoFixableCount}`;
  })
  .join("\n\n")}

## Actionable Recommendations

${recommendations
  .map((rec, index) => {
    if (rec.type === "priority") {
      return `### ${index + 1}. ${rec.title}
- **Count**: ${rec.count} warnings
- **Effort**: ${rec.estimatedEffort}
- **Auto-fixable**: ${rec.autoFixable}
- **Action**: ${rec.action}`;
    } else {
      return `### ${index + 1}. ${rec.title}
- **Count**: ${rec.count} warnings
- **Impact**: ${rec.impact}
- **Approach**: ${rec.approach}`;
    }
  })
  .join("\n\n")}

## Implementation Roadmap

### Phase 1: Quick Wins (Immediate - 1-2 hours)
- Address **CRITICAL** priority warnings (${priorityMatrix.critical?.count || 0} warnings)
- Focus on auto-fixable rules: \`prefer-const\`, \`no-var\`, \`no-console\`
- Use ESLint --fix for automated resolution

### Phase 2: High Impact (Short term - 1 week)
- Address **HIGH** priority warnings (${priorityMatrix.high?.count || 0} warnings)
- Focus on unused variables and import organization
- Manual review for complex cases

### Phase 3: Type Safety (Medium term - 2-3 weeks)
- Address **MEDIUM** priority warnings (${priorityMatrix.medium?.count || 0} warnings)
- Systematic \`@typescript-eslint/no-explicit-any\` replacement
- React hooks dependency optimization

### Phase 4: Polish (Long term - ongoing)
- Address **LOW** priority warnings (${priorityMatrix.low?.count || 0} warnings)
- Style and formatting improvements
- Code consistency enhancements

## Automation Scripts Needed

1. **Console Statement Cleaner**: Remove development console.log statements
2. **Import Organizer**: Sort and clean up import statements
3. **Unused Variable Cleaner**: Remove or prefix unused variables
4. **Type Safety Enhancer**: Replace safe \`any\` types with proper types

---

*Generated by eslint-warning-categorizer.cjs*
*Next: Run specific category analyzers for detailed resolution plans*
`;
  }

  /**
   * Display summary in console
   */
  displaySummary(report) {
    const { metadata, summary, priorityMatrix } = report;

    console.log("\n🎯 ESLint Warning Analysis Complete!");
    console.log("=====================================\n");

    console.log("📊 **Summary Statistics:**");
    console.log(`   Total Warnings: ${metadata.totalWarnings}`);
    console.log(`   Files Affected: ${metadata.totalFiles}`);
    console.log(`   Unique Rules: ${metadata.totalRules}`);
    console.log(
      `   Auto-fixable: ${metadata.totalAutoFixable} (${Math.round((metadata.totalAutoFixable / metadata.totalWarnings) * 100)}%)`,
    );
    console.log(`   Estimated Effort: ${metadata.totalEstimatedHours} hours\n`);

    console.log("🏷️ **By Category:**");
    Object.entries(summary.warningsByCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(
          `   ${category.padEnd(20)}: ${count.toString().padStart(4)} warnings`,
        );
      });

    console.log("\n⚡ **By Priority:**");
    Object.entries(summary.warningsByPriority)
      .sort(([, a], [, b]) => b - a)
      .forEach(([priority, count]) => {
        const data = priorityMatrix[priority];
        const hours = Math.ceil(data.estimatedEffortMinutes / 60);
        console.log(
          `   ${priority.toUpperCase().padEnd(8)}: ${count.toString().padStart(4)} warnings (~${hours}h)`,
        );
      });

    console.log("\n🔧 **Top Rules:**");
    summary.topRules.slice(0, 5).forEach((rule, index) => {
      const fixable = rule.fixable ? " 🔧" : "";
      console.log(
        `   ${(index + 1).toString().padStart(2)}. ${rule.rule.padEnd(35)}: ${rule.count.toString().padStart(3)}${fixable}`,
      );
    });

    console.log("\n📁 **High-Impact Files:**");
    summary.topFiles.slice(0, 5).forEach((file, index) => {
      console.log(
        `   ${(index + 1).toString().padStart(2)}. ${file.file.padEnd(50)}: ${file.count} warnings`,
      );
    });

    console.log("\n🚀 **Next Steps:**");
    console.log("   1. Review generated reports for detailed analysis");
    console.log("   2. Start with CRITICAL priority warnings for quick wins");
    console.log("   3. Use automated fixes where possible");
    console.log("   4. Plan systematic resolution of HIGH priority warnings");
    console.log(
      "   5. Create specific automation scripts for common patterns\n",
    );
  }

  /**
   * Get relative path
   */
  getRelativePath(absolutePath) {
    return path.relative(process.cwd(), absolutePath);
  }
}

// Main execution
async function main() {
  const categorizer = new ESLintWarningCategorizer();

  try {
    await categorizer.analyze();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Categorization failed:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ESLintWarningCategorizer };
