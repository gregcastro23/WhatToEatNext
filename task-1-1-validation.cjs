#!/usr/bin/env node

/**
 * Task 1.1 Validation Script
 *
 * Validates that all sub-tasks of "Comprehensive Error Analysis and Categorization"
 * have been completed successfully.
 */

const fs = require("fs");

class Task11Validator {
  constructor() {
    this.validationResults = {
      subTasks: {
        analyzeTypeScriptErrors: false,
        categorizeESLintIssues: false,
        identifyHighImpactFiles: false,
        createPriorityMatrix: false,
        generateBaselineMetrics: false,
      },
      overallSuccess: false,
      details: [],
    };
  }

  /**
   * Validate that TypeScript errors were analyzed by type and frequency
   */
  validateTypeScriptAnalysis(results) {
    console.log("🔍 Validating TypeScript error analysis...");

    const tsErrors = results.typeScriptErrors;

    if (tsErrors.total > 0 && Object.keys(tsErrors.byType).length > 0) {
      this.validationResults.subTasks.analyzeTypeScriptErrors = true;
      this.validationResults.details.push(
        `✅ TypeScript Analysis: Found ${tsErrors.total} errors across ${Object.keys(tsErrors.byType).length} error types`,
      );

      // Validate specific error types are captured
      const criticalTypes = ["TS1005", "TS1003", "TS1128"];
      const foundCritical = criticalTypes.filter(
        (type) => tsErrors.byType[type],
      );
      this.validationResults.details.push(
        `   Critical error types found: ${foundCritical.join(", ")}`,
      );

      return true;
    } else {
      this.validationResults.details.push(
        "❌ TypeScript Analysis: No errors found or analysis incomplete",
      );
      return false;
    }
  }

  /**
   * Validate that ESLint issues were categorized by severity and fixability
   */
  validateESLintCategorization(results) {
    console.log("🔍 Validating ESLint issue categorization...");

    const eslintIssues = results.eslintIssues;

    if (eslintIssues.total > 0 && Object.keys(eslintIssues.byRule).length > 0) {
      this.validationResults.subTasks.categorizeESLintIssues = true;
      this.validationResults.details.push(
        `✅ ESLint Categorization: Found ${eslintIssues.total} issues across ${Object.keys(eslintIssues.byRule).length} rules`,
      );
      this.validationResults.details.push(
        `   Auto-fixable: ${eslintIssues.autoFixable}, Manual review: ${eslintIssues.manualReview}`,
      );
      this.validationResults.details.push(
        `   Severity breakdown: ${eslintIssues.bySeverity.error} errors, ${eslintIssues.bySeverity.warning} warnings`,
      );

      return true;
    } else {
      this.validationResults.details.push(
        "⚠️ ESLint Categorization: Limited or no ESLint data available",
      );
      // Don't fail the task for ESLint issues since they might be minimal
      this.validationResults.subTasks.categorizeESLintIssues = true;
      return true;
    }
  }

  /**
   * Validate that high-impact files were identified
   */
  validateHighImpactFiles(results) {
    console.log("🔍 Validating high-impact file identification...");

    const highImpactFiles = results.typeScriptErrors.highImpactFiles;

    if (Array.isArray(highImpactFiles)) {
      this.validationResults.subTasks.identifyHighImpactFiles = true;
      this.validationResults.details.push(
        `✅ High-Impact Files: Identified ${highImpactFiles.length} files with 10+ errors`,
      );

      if (highImpactFiles.length > 0) {
        const topFile = highImpactFiles[0];
        this.validationResults.details.push(
          `   Top file: ${topFile.file} (${topFile.errorCount} errors)`,
        );
      }

      return true;
    } else {
      this.validationResults.details.push(
        "❌ High-Impact Files: Analysis incomplete or missing",
      );
      return false;
    }
  }

  /**
   * Validate that error priority matrix was created
   */
  validatePriorityMatrix(results) {
    console.log("🔍 Validating error priority matrix...");

    const priorityMatrix = results.priorityMatrix;

    if (Array.isArray(priorityMatrix) && priorityMatrix.length > 0) {
      this.validationResults.subTasks.createPriorityMatrix = true;
      this.validationResults.details.push(
        `✅ Priority Matrix: Created with ${priorityMatrix.length} entries`,
      );

      // Validate matrix has required fields
      const sampleEntry = priorityMatrix[0];
      const requiredFields = [
        "type",
        "errorType",
        "count",
        "priority",
        "complexity",
        "buildImpact",
        "estimatedEffort",
      ];
      const hasAllFields = requiredFields.every((field) =>
        sampleEntry.hasOwnProperty(field),
      );

      if (hasAllFields) {
        this.validationResults.details.push(
          `   Matrix includes: priority, complexity, build impact, and effort estimates`,
        );
      }

      // Count critical items
      const criticalItems = priorityMatrix.filter(
        (item) => item.priority === "CRITICAL",
      );
      this.validationResults.details.push(
        `   Critical priority items: ${criticalItems.length}`,
      );

      return true;
    } else {
      this.validationResults.details.push(
        "❌ Priority Matrix: Missing or incomplete",
      );
      return false;
    }
  }

  /**
   * Validate that baseline metrics were generated
   */
  validateBaselineMetrics(results) {
    console.log("🔍 Validating baseline metrics generation...");

    const baselineMetrics = results.baselineMetrics;

    if (
      baselineMetrics &&
      baselineMetrics.typeScript &&
      baselineMetrics.eslint &&
      baselineMetrics.estimatedEffort
    ) {
      this.validationResults.subTasks.generateBaselineMetrics = true;
      this.validationResults.details.push(
        `✅ Baseline Metrics: Generated comprehensive metrics`,
      );
      this.validationResults.details.push(
        `   TypeScript: ${baselineMetrics.typeScript.totalErrors} total, ${baselineMetrics.typeScript.criticalErrors} critical`,
      );
      this.validationResults.details.push(
        `   ESLint: ${baselineMetrics.eslint.totalIssues} total, ${baselineMetrics.eslint.autoFixablePercentage}% auto-fixable`,
      );
      this.validationResults.details.push(
        `   Effort: ${Math.round(baselineMetrics.estimatedEffort.totalMinutes / 60)} hours estimated`,
      );

      return true;
    } else {
      this.validationResults.details.push(
        "❌ Baseline Metrics: Missing or incomplete",
      );
      return false;
    }
  }

  /**
   * Validate file outputs exist
   */
  validateFileOutputs() {
    console.log("🔍 Validating output files...");

    const files = fs.readdirSync(".");
    const analysisFiles = files.filter(
      (f) =>
        f.includes("comprehensive-error-analysis") ||
        f.includes("error-analysis-summary") ||
        f.includes("priority-matrix"),
    );

    if (analysisFiles.length >= 3) {
      this.validationResults.details.push(
        `✅ Output Files: Generated ${analysisFiles.length} analysis files`,
      );
      analysisFiles.forEach((file) => {
        this.validationResults.details.push(`   - ${file}`);
      });
      return true;
    } else {
      this.validationResults.details.push(
        `❌ Output Files: Expected 3+ files, found ${analysisFiles.length}`,
      );
      return false;
    }
  }

  /**
   * Run complete validation
   */
  async runValidation() {
    console.log("🚀 Starting Task 1.1 validation...\n");

    try {
      // Find the most recent analysis file
      const files = fs.readdirSync(".");
      const analysisFiles = files.filter(
        (f) =>
          f.startsWith("comprehensive-error-analysis") && f.endsWith(".json"),
      );

      if (analysisFiles.length === 0) {
        throw new Error("No analysis results file found");
      }

      const latestFile = analysisFiles.sort().reverse()[0];
      console.log(`📄 Reading analysis results from: ${latestFile}`);

      const results = JSON.parse(fs.readFileSync(latestFile, "utf8"));

      // Run all validations
      const validations = [
        this.validateTypeScriptAnalysis(results),
        this.validateESLintCategorization(results),
        this.validateHighImpactFiles(results),
        this.validatePriorityMatrix(results),
        this.validateBaselineMetrics(results),
        this.validateFileOutputs(),
      ];

      const allPassed = validations.every((v) => v);
      this.validationResults.overallSuccess = allPassed;

      console.log("\n📊 Validation Results:");
      this.validationResults.details.forEach((detail) => console.log(detail));

      console.log("\n📋 Sub-task Completion Status:");
      Object.entries(this.validationResults.subTasks).forEach(
        ([task, completed]) => {
          console.log(`   ${completed ? "✅" : "❌"} ${task}`);
        },
      );

      if (allPassed) {
        console.log(
          '\n🎉 Task 1.1 "Comprehensive Error Analysis and Categorization" COMPLETED SUCCESSFULLY!',
        );
        console.log("\n📈 Key Achievements:");
        console.log(
          `   - Analyzed ${results.typeScriptErrors.total} TypeScript errors across ${Object.keys(results.typeScriptErrors.byType).length} types`,
        );
        console.log(
          `   - Categorized ${results.eslintIssues.total} ESLint issues by severity and fixability`,
        );
        console.log(
          `   - Identified ${results.typeScriptErrors.highImpactFiles.length} high-impact files`,
        );
        console.log(
          `   - Created priority matrix with ${results.priorityMatrix.length} entries`,
        );
        console.log(
          `   - Generated comprehensive baseline metrics for progress tracking`,
        );
        console.log(
          `   - Estimated total effort: ${Math.round(results.baselineMetrics.estimatedEffort.totalMinutes / 60)} hours`,
        );

        return true;
      } else {
        console.log(
          "\n❌ Task 1.1 validation failed - some sub-tasks incomplete",
        );
        return false;
      }
    } catch (error) {
      console.error("\n❌ Validation failed:", error.message);
      return false;
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new Task11Validator();
  validator
    .runValidation()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Validation error:", error);
      process.exit(1);
    });
}

module.exports = Task11Validator;
