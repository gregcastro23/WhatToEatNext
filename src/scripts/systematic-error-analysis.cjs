#!/usr/bin/env node

/**
 * Systematic TypeScript Error Analysis and Fix Strategy
 *
 * Analyzes the remaining 2,348 TypeScript errors and determines which ones
 * can be fixed using a priori knowledge and systematic approaches.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class SystematicErrorAnalyzer {
  constructor() {
    this.errorCategories = new Map();
    this.fixablePatterns = new Map();
    this.gitRestoreCandidates = [];
    this.aPrioriFixable = [];
  }

  async analyzeAllErrors() {
    console.log("🔍 Analyzing remaining 2,348 TypeScript errors...\n");

    // Get all TypeScript errors
    const errors = this.getAllTypeScriptErrors();

    // Categorize errors by type and location
    this.categorizeErrors(errors);

    // Identify fixable patterns
    this.identifyFixablePatterns();

    // Analyze git restore candidates
    this.analyzeGitRestoreCandidates();

    // Generate comprehensive report
    this.generateAnalysisReport();

    return {
      totalErrors: errors.length,
      categories: Object.fromEntries(this.errorCategories),
      fixableCount: this.aPrioriFixable.length,
      restoreCandidates: this.gitRestoreCandidates.length,
    };
  }

  getAllTypeScriptErrors() {
    try {
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });
      return [];
    } catch (error) {
      const errorLines = error.stdout
        .split("\n")
        .filter((line) => line.includes("error TS"))
        .map((line) => this.parseErrorLine(line))
        .filter(Boolean);

      return errorLines;
    }
  }

  parseErrorLine(line) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (!match) return null;

    const [, filePath, lineNum, colNum, errorCode, message] = match;
    return {
      filePath: filePath.trim(),
      line: parseInt(lineNum),
      column: parseInt(colNum),
      errorCode,
      message: message.trim(),
      category: this.categorizeErrorType(errorCode, message, filePath),
    };
  }

  categorizeErrorType(errorCode, message, filePath) {
    // Determine error category based on code, message, and file location
    const categories = {
      // High-priority fixable errors
      TS18046_unknown_type:
        errorCode === "TS18046" && message.includes("unknown"),
      TS2339_missing_property: errorCode === "TS2339",
      TS2571_object_is_unknown: errorCode === "TS2571",
      TS2345_argument_type: errorCode === "TS2345",
      TS2322_type_assignment: errorCode === "TS2322",

      // Location-based categories
      test_file_errors:
        filePath.includes("__tests__") || filePath.includes(".test."),
      service_layer_errors: filePath.includes("/services/"),
      utils_errors: filePath.includes("/utils/"),
      data_layer_errors: filePath.includes("/data/"),
      app_directory_errors: filePath.includes("/app/"),

      // Specific fixable patterns
      campaign_system_errors: filePath.includes("campaign"),
      astrological_errors:
        filePath.includes("astro") || filePath.includes("celestial"),
      elemental_errors:
        filePath.includes("elemental") || filePath.includes("element"),
      ingredient_errors:
        filePath.includes("ingredient") || filePath.includes("recipe"),
    };

    for (const [category, condition] of Object.entries(categories)) {
      if (condition) return category;
    }

    return "other";
  }

  categorizeErrors(errors) {
    for (const error of errors) {
      const category = error.category;
      if (!this.errorCategories.has(category)) {
        this.errorCategories.set(category, []);
      }
      this.errorCategories.get(category).push(error);
    }
  }

  identifyFixablePatterns() {
    console.log("🎯 Identifying systematically fixable error patterns...\n");

    // TS18046: 'unknown' type errors - highly fixable
    const unknownTypeErrors =
      this.errorCategories.get("TS18046_unknown_type") || [];
    if (unknownTypeErrors.length > 0) {
      this.aPrioriFixable.push({
        type: "TS18046_unknown_type",
        count: unknownTypeErrors.length,
        fixStrategy: "Type assertion or proper typing",
        confidence: "HIGH",
        examples: unknownTypeErrors.slice(0, 3),
      });
    }

    // TS2339: Missing property errors - often fixable with proper imports/types
    const missingPropertyErrors =
      this.errorCategories.get("TS2339_missing_property") || [];
    if (missingPropertyErrors.length > 0) {
      this.aPrioriFixable.push({
        type: "TS2339_missing_property",
        count: missingPropertyErrors.length,
        fixStrategy: "Add missing properties or fix imports",
        confidence: "MEDIUM",
        examples: missingPropertyErrors.slice(0, 3),
      });
    }

    // TS2571: Object is unknown - fixable with type guards
    const objectUnknownErrors =
      this.errorCategories.get("TS2571_object_is_unknown") || [];
    if (objectUnknownErrors.length > 0) {
      this.aPrioriFixable.push({
        type: "TS2571_object_is_unknown",
        count: objectUnknownErrors.length,
        fixStrategy: "Type guards and proper typing",
        confidence: "HIGH",
        examples: objectUnknownErrors.slice(0, 3),
      });
    }

    // Test file errors - often have relaxed typing requirements
    const testFileErrors = this.errorCategories.get("test_file_errors") || [];
    if (testFileErrors.length > 0) {
      this.aPrioriFixable.push({
        type: "test_file_errors",
        count: testFileErrors.length,
        fixStrategy: "Mock typing and test utilities",
        confidence: "MEDIUM",
        examples: testFileErrors.slice(0, 3),
      });
    }
  }

  analyzeGitRestoreCandidates() {
    console.log("🔄 Analyzing git restore candidates...\n");

    // Check for files that might have been corrupted during previous campaigns
    const suspiciousFiles = [
      "src/app/alchemicalEngine.ts",
      "src/app/test/migrated-components/",
      "src/services/campaign/",
      "src/__tests__/",
    ];

    for (const filePattern of suspiciousFiles) {
      try {
        // Check if file exists and has recent modifications
        const gitLog = execSync(
          `git log --oneline -10 --since="1 week ago" -- "${filePattern}"`,
          {
            encoding: "utf8",
            stdio: "pipe",
          },
        );

        if (gitLog.trim()) {
          this.gitRestoreCandidates.push({
            path: filePattern,
            recentChanges: gitLog.split("\n").length - 1,
            strategy: "Selective restore from known good state",
          });
        }
      } catch (error) {
        // File might not exist or no git history
      }
    }
  }

  generateAnalysisReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: Array.from(this.errorCategories.values()).reduce(
        (sum, arr) => sum + arr.length,
        0,
      ),
      errorBreakdown: {},
      fixabilityAnalysis: {
        highConfidenceFixes: 0,
        mediumConfidenceFixes: 0,
        lowConfidenceFixes: 0,
        totalFixable: 0,
      },
      recommendations: [],
    };

    // Calculate error breakdown
    for (const [category, errors] of this.errorCategories) {
      report.errorBreakdown[category] = errors.length;
    }

    // Calculate fixability metrics
    for (const fixable of this.aPrioriFixable) {
      report.fixabilityAnalysis.totalFixable += fixable.count;

      switch (fixable.confidence) {
        case "HIGH":
          report.fixabilityAnalysis.highConfidenceFixes += fixable.count;
          break;
        case "MEDIUM":
          report.fixabilityAnalysis.mediumConfidenceFixes += fixable.count;
          break;
        case "LOW":
          report.fixabilityAnalysis.lowConfidenceFixes += fixable.count;
          break;
      }
    }

    // Generate recommendations
    this.generateRecommendations(report);

    // Write report to file
    fs.writeFileSync(
      "systematic-error-analysis-report.json",
      JSON.stringify(report, null, 2),
    );

    // Display summary
    this.displaySummary(report);
  }

  generateRecommendations(report) {
    const recommendations = [];

    // High-confidence fixes
    if (report.fixabilityAnalysis.highConfidenceFixes > 0) {
      recommendations.push({
        priority: "HIGH",
        action: "Execute systematic fixes for TS18046 and TS2571 errors",
        impact: `${report.fixabilityAnalysis.highConfidenceFixes} errors`,
        effort: "LOW",
        description:
          "These errors have well-defined patterns and can be fixed systematically",
      });
    }

    // Git restore candidates
    if (this.gitRestoreCandidates.length > 0) {
      recommendations.push({
        priority: "MEDIUM",
        action: "Selective git restore for corrupted files",
        impact: `Potentially ${this.gitRestoreCandidates.length} file groups`,
        effort: "MEDIUM",
        description:
          "Some files may have been corrupted during previous campaigns",
      });
    }

    // Test file cleanup
    const testErrors = report.errorBreakdown.test_file_errors || 0;
    if (testErrors > 100) {
      recommendations.push({
        priority: "MEDIUM",
        action: "Comprehensive test file type cleanup",
        impact: `${testErrors} test-related errors`,
        effort: "MEDIUM",
        description:
          "Test files often have relaxed typing requirements and can be batch-fixed",
      });
    }

    // Service layer refactoring
    const serviceErrors = report.errorBreakdown.service_layer_errors || 0;
    if (serviceErrors > 500) {
      recommendations.push({
        priority: "LOW",
        action: "Service layer architectural review",
        impact: `${serviceErrors} service errors`,
        effort: "HIGH",
        description: "Service layer errors may require architectural changes",
      });
    }

    report.recommendations = recommendations;
  }

  displaySummary(report) {
    console.log("\n" + "=".repeat(80));
    console.log("📊 SYSTEMATIC ERROR ANALYSIS SUMMARY");
    console.log("=".repeat(80));

    console.log(`\n📈 Total Errors: ${report.totalErrors}`);

    console.log("\n🎯 Fixability Analysis:");
    console.log(
      `  High Confidence: ${report.fixabilityAnalysis.highConfidenceFixes} errors`,
    );
    console.log(
      `  Medium Confidence: ${report.fixabilityAnalysis.mediumConfidenceFixes} errors`,
    );
    console.log(
      `  Low Confidence: ${report.fixabilityAnalysis.lowConfidenceFixes} errors`,
    );
    console.log(
      `  Total Fixable: ${report.fixabilityAnalysis.totalFixable} errors (${Math.round((report.fixabilityAnalysis.totalFixable / report.totalErrors) * 100)}%)`,
    );

    console.log("\n📂 Error Distribution:");
    const sortedCategories = Object.entries(report.errorBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [category, count] of sortedCategories) {
      console.log(`  ${category}: ${count} errors`);
    }

    console.log("\n🚀 Top Recommendations:");
    for (const rec of report.recommendations.slice(0, 3)) {
      console.log(`  ${rec.priority}: ${rec.action}`);
      console.log(`    Impact: ${rec.impact}`);
      console.log(`    Effort: ${rec.effort}`);
      console.log(`    ${rec.description}\n`);
    }

    console.log(
      `\n📄 Full report saved to: systematic-error-analysis-report.json`,
    );
    console.log("=".repeat(80));
  }
}

// Execute analysis
async function main() {
  const analyzer = new SystematicErrorAnalyzer();
  const results = await analyzer.analyzeAllErrors();

  console.log("\n✅ Analysis complete!");
  console.log(`📊 ${results.totalErrors} total errors analyzed`);
  console.log(
    `🎯 ${results.fixableCount} errors identified as systematically fixable`,
  );
  console.log(
    `🔄 ${results.restoreCandidates} git restore candidates identified`,
  );
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SystematicErrorAnalyzer };
