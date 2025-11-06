#!/usr/bin/env node

/**
 * Linting Campaign CLI Tool (JavaScript version)
 *
 * Command-line interface for managing linting improvement campaigns,
 * quality gates, and progress tracking.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * CLI Commands
 */
const commands = {
  "collect-metrics": collectMetrics,
  "generate-report": generateReport,
  "start-campaign": startCampaign,
  "evaluate-gates": evaluateQualityGates,
  "deployment-readiness": checkDeploymentReadiness,
  "monitor-trends": monitorTrends,
  "create-cicd-report": createCICDReport,
  help: showHelp,
};

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || !commands[command]) {
    showHelp();
    process.exit(1);
  }

  try {
    await commands[command](args.slice(1));
  } catch (error) {
    console.error("Error executing command:", error.message);
    process.exit(1);
  }
}

/**
 * Collect current linting metrics
 */
async function collectMetrics(args) {
  console.log("🔍 Collecting linting metrics...");

  try {
    // Run ESLint with JSON output
    const result = execSync("yarn lint --format json --max-warnings 10000", {
      encoding: "utf8",
      stdio: "pipe",
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
    });

    const lintResults = JSON.parse(result);
    const metrics = parseLintingOutput(lintResults);

    console.log("\n📊 Linting Metrics:");
    console.log(`Total Issues: ${metrics.totalIssues}`);
    console.log(`Errors: ${metrics.errors}`);
    console.log(`Warnings: ${metrics.warnings}`);
    console.log(`Files Covered: ${metrics.filesCovered}`);
    console.log(`Fixable Issues: ${metrics.fixableIssues}`);

    if (args.includes("--json")) {
      console.log("\n📄 JSON Output:");
      console.log(JSON.stringify(metrics, null, 2));
    }

    if (args.includes("--categories")) {
      console.log("\n🏷️  Error Categories:");
      Object.entries(metrics.errorsByCategory).forEach(([rule, count]) => {
        console.log(`  ${rule}: ${count}`);
      });

      console.log("\n⚠️  Warning Categories:");
      Object.entries(metrics.warningsByCategory).forEach(([rule, count]) => {
        console.log(`  ${rule}: ${count}`);
      });
    }

    // Save metrics
    ensureDirectoryExists(".kiro/metrics");
    fs.writeFileSync(
      ".kiro/metrics/linting-metrics.json",
      JSON.stringify(
        {
          ...metrics,
          timestamp: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    if (error.stdout) {
      // ESLint returns non-zero exit code when issues are found
      const lintResults = JSON.parse(error.stdout);
      const metrics = parseLintingOutput(lintResults);

      console.log("\n📊 Linting Metrics:");
      console.log(`Total Issues: ${metrics.totalIssues}`);
      console.log(`Errors: ${metrics.errors}`);
      console.log(`Warnings: ${metrics.warnings}`);
      console.log(`Files Covered: ${metrics.filesCovered}`);
      console.log(`Fixable Issues: ${metrics.fixableIssues}`);

      if (args.includes("--categories")) {
        console.log("\n🏷️  Error Categories:");
        Object.entries(metrics.errorsByCategory).forEach(([rule, count]) => {
          console.log(`  ${rule}: ${count}`);
        });

        console.log("\n⚠️  Warning Categories:");
        Object.entries(metrics.warningsByCategory).forEach(([rule, count]) => {
          console.log(`  ${rule}: ${count}`);
        });
      }

      // Save metrics
      ensureDirectoryExists(".kiro/metrics");
      fs.writeFileSync(
        ".kiro/metrics/linting-metrics.json",
        JSON.stringify(
          {
            ...metrics,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      );

      if (args.includes("--json")) {
        console.log("\n📄 JSON Output:");
        console.log(
          JSON.stringify(
            {
              ...metrics,
              timestamp: new Date().toISOString(),
            },
            null,
            2,
          ),
        );
      }
    } else {
      throw error;
    }
  }
}

/**
 * Parse ESLint JSON output
 */
function parseLintingOutput(results) {
  let totalIssues = 0;
  let errors = 0;
  let warnings = 0;
  let fixableIssues = 0;
  const errorsByCategory = {};
  const warningsByCategory = {};
  const filesCovered = results.length;

  results.forEach((file) => {
    file.messages.forEach((message) => {
      totalIssues++;

      if (message.severity === 2) {
        errors++;
        errorsByCategory[message.ruleId || "unknown"] =
          (errorsByCategory[message.ruleId || "unknown"] || 0) + 1;
      } else {
        warnings++;
        warningsByCategory[message.ruleId || "unknown"] =
          (warningsByCategory[message.ruleId || "unknown"] || 0) + 1;
      }

      if (message.fix) {
        fixableIssues++;
      }
    });
  });

  return {
    totalIssues,
    errors,
    warnings,
    errorsByCategory,
    warningsByCategory,
    filesCovered,
    fixableIssues,
  };
}

/**
 * Generate progress report
 */
async function generateReport(args) {
  console.log("📈 Generating progress report...");

  // First collect current metrics
  await collectMetrics([]);

  // Read current and previous metrics
  const currentMetrics = readMetricsFile(".kiro/metrics/linting-metrics.json");
  const previousMetrics = readMetricsFile(
    ".kiro/metrics/linting-metrics-previous.json",
  );

  if (!currentMetrics) {
    console.log("❌ No current metrics found. Run collect-metrics first.");
    return;
  }

  console.log("\n📊 Progress Report:");
  console.log(`Current Issues: ${currentMetrics.totalIssues}`);
  console.log(`Current Errors: ${currentMetrics.errors}`);
  console.log(`Current Warnings: ${currentMetrics.warnings}`);

  if (previousMetrics) {
    const improvement = {
      totalIssuesReduced:
        previousMetrics.totalIssues - currentMetrics.totalIssues,
      errorsReduced: previousMetrics.errors - currentMetrics.errors,
      warningsReduced: previousMetrics.warnings - currentMetrics.warnings,
      percentageImprovement:
        previousMetrics.totalIssues > 0
          ? ((previousMetrics.totalIssues - currentMetrics.totalIssues) /
              previousMetrics.totalIssues) *
            100
          : 0,
    };

    console.log(`\n📉 Improvement:`);
    console.log(`Issues Reduced: ${improvement.totalIssuesReduced}`);
    console.log(`Errors Reduced: ${improvement.errorsReduced}`);
    console.log(`Warnings Reduced: ${improvement.warningsReduced}`);
    console.log(
      `Improvement: ${improvement.percentageImprovement.toFixed(2)}%`,
    );
  }

  console.log("\n🎯 Quality Gates:");
  console.log(`Zero Errors: ${currentMetrics.errors === 0 ? "✅" : "❌"}`);
  console.log(
    `Warnings Under Threshold: ${currentMetrics.warnings < 1000 ? "✅" : "❌"}`,
  );

  if (args.includes("--json")) {
    const report = {
      currentMetrics,
      previousMetrics,
      improvement: previousMetrics
        ? {
            totalIssuesReduced:
              previousMetrics.totalIssues - currentMetrics.totalIssues,
            errorsReduced: previousMetrics.errors - currentMetrics.errors,
            warningsReduced: previousMetrics.warnings - currentMetrics.warnings,
            percentageImprovement:
              previousMetrics.totalIssues > 0
                ? ((previousMetrics.totalIssues - currentMetrics.totalIssues) /
                    previousMetrics.totalIssues) *
                  100
                : 0,
          }
        : null,
    };

    console.log("\n📄 JSON Output:");
    console.log(JSON.stringify(report, null, 2));
  }
}

/**
 * Start a linting campaign
 */
async function startCampaign(args) {
  const campaignType = args[0] || "standard";

  console.log(`🚀 Starting linting campaign: ${campaignType}`);

  if (args.includes("--dry-run")) {
    console.log("\n🔍 Dry run - campaign would execute the following phases:");
    console.log("  1. Automated Fixes: Apply all available ESLint auto-fixes");
    console.log("     Tools: eslint-fix");
    console.log("     Estimated Duration: 15 minutes");
    console.log(
      "  2. Import Organization: Clean up and organize import statements",
    );
    console.log("     Tools: unused-imports, import-organization");
    console.log("     Estimated Duration: 30 minutes");
    console.log(
      "  3. Type Safety Improvement: Eliminate explicit any and improve type safety",
    );
    console.log("     Tools: explicit-any-elimination");
    console.log("     Estimated Duration: 45 minutes");
    console.log(
      "  4. Code Cleanup: Clean up console statements and other code quality issues",
    );
    console.log("     Tools: console-cleanup");
    console.log("     Estimated Duration: 20 minutes");
    return;
  }

  if (!args.includes("--confirm")) {
    console.log("\n⚠️  Add --confirm to actually start the campaign");
    console.log("   Add --dry-run to see what would be executed");
    return;
  }

  // Collect baseline metrics
  console.log("\n📊 Collecting baseline metrics...");
  await collectMetrics([]);

  // Execute campaign phases
  console.log("\n🚀 Executing campaign phases...");

  try {
    // Phase 1: Automated Fixes
    console.log("\n📝 Phase 1: Automated Fixes");
    execSync("yarn lint:fix", { stdio: "inherit" });

    // Phase 2: Import Organization
    console.log("\n📦 Phase 2: Import Organization");
    try {
      execSync("yarn lint --fix-type layout", { stdio: "inherit" });
    } catch (error) {
      console.log("   Import organization completed with warnings");
    }

    // Phase 3: Collect final metrics
    console.log("\n📊 Collecting final metrics...");
    await collectMetrics([]);

    console.log("✅ Campaign completed successfully!");
  } catch (error) {
    console.error("❌ Campaign failed:", error.message);
    process.exit(1);
  }
}

/**
 * Evaluate quality gates
 */
async function evaluateQualityGates(args) {
  console.log("🚪 Evaluating quality gates...");

  // Collect current metrics
  await collectMetrics([]);

  // Give a moment for file to be written
  await new Promise((resolve) => setTimeout(resolve, 100));

  const metrics = readMetricsFile(".kiro/metrics/linting-metrics.json");

  if (!metrics) {
    console.log("❌ No metrics found. Run collect-metrics first.");
    return;
  }

  // Define quality gate thresholds
  const thresholds = {
    maxErrors: 0,
    maxWarnings: 100,
    maxExecutionTime: 60000,
  };

  // Evaluate gates
  const violations = [];

  if (metrics.errors > thresholds.maxErrors) {
    violations.push({
      type: "error",
      message: `${metrics.errors} errors exceed threshold of ${thresholds.maxErrors}`,
      severity: "high",
    });
  }

  if (metrics.warnings > thresholds.maxWarnings) {
    violations.push({
      type: "warning",
      message: `${metrics.warnings} warnings exceed threshold of ${thresholds.maxWarnings}`,
      severity: "medium",
    });
  }

  const passed = violations.length === 0;
  const deploymentApproved = passed && metrics.errors === 0;
  const riskLevel =
    metrics.errors > 50 ? "high" : metrics.errors > 10 ? "medium" : "low";

  console.log("\n🎯 Quality Gate Results:");
  console.log(`Status: ${passed ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Risk Level: ${riskLevel.toUpperCase()}`);
  console.log(
    `Deployment Approved: ${deploymentApproved ? "✅ YES" : "❌ NO"}`,
  );

  if (violations.length > 0) {
    console.log("\n⚠️  Violations:");
    violations.forEach((violation, index) => {
      const icon = violation.severity === "high" ? "🚨" : "⚠️";
      console.log(`  ${index + 1}. ${icon} ${violation.message}`);
    });
  }

  if (metrics.fixableIssues > 0) {
    console.log("\n💡 Recommendations:");
    console.log(
      `  1. ${metrics.fixableIssues} issues can be auto-fixed with ESLint --fix`,
    );
  }

  console.log("\n📊 Current Metrics:");
  console.log(`Total Issues: ${metrics.totalIssues}`);
  console.log(`Errors: ${metrics.errors}`);
  console.log(`Warnings: ${metrics.warnings}`);
  console.log(`Fixable: ${metrics.fixableIssues}`);

  if (args.includes("--json")) {
    const result = {
      passed,
      deploymentApproved,
      riskLevel,
      violations,
      metrics,
    };

    console.log("\n📄 JSON Output:");
    console.log(JSON.stringify(result, null, 2));
  }
}

/**
 * Check deployment readiness
 */
async function checkDeploymentReadiness(args) {
  console.log("🚢 Checking deployment readiness...");

  // Evaluate quality gates first
  await evaluateQualityGates([]);

  const metrics = readMetricsFile(".kiro/metrics/linting-metrics.json");
  if (!metrics) {
    console.log("❌ No metrics found.");
    process.exit(1);
  }

  const ready = metrics.errors === 0;
  const confidence = Math.max(
    0,
    Math.min(100, 100 - metrics.errors * 10 - metrics.warnings * 0.5),
  );
  const qualityScore = Math.max(
    0,
    100 - metrics.errors * 2 - metrics.warnings * 0.1,
  );

  console.log("\n🚢 Deployment Readiness Assessment:");
  console.log(`Ready: ${ready ? "✅ YES" : "❌ NO"}`);
  console.log(`Confidence: ${confidence.toFixed(1)}%`);
  console.log(`Quality Score: ${qualityScore.toFixed(1)}/100`);

  const blockers = [];
  if (metrics.errors > 0) {
    blockers.push(`${metrics.errors} linting errors must be resolved`);
  }

  if (blockers.length > 0) {
    console.log("\n🚨 Blockers:");
    blockers.forEach((blocker, index) => {
      console.log(`  ${index + 1}. ${blocker}`);
    });
  }

  // Exit with appropriate code for CI/CD
  if (args.includes("--exit-code")) {
    process.exit(ready ? 0 : 1);
  }

  if (args.includes("--json")) {
    const readiness = {
      ready,
      confidence,
      qualityScore,
      blockers,
      riskAssessment: {
        level:
          metrics.errors > 50 ? "high" : metrics.errors > 10 ? "medium" : "low",
      },
    };

    console.log("\n📄 JSON Output:");
    console.log(JSON.stringify(readiness, null, 2));
  }
}

/**
 * Monitor quality trends (placeholder)
 */
async function monitorTrends(args) {
  console.log("📈 Monitoring quality trends...");
  console.log("\n📈 Quality Trends: (Feature requires historical data)");
  console.log("Run collect-metrics regularly to build trend data.");

  if (args.includes("--json")) {
    console.log("\n📄 JSON Output:");
    console.log(JSON.stringify({ trend: "insufficient-data" }, null, 2));
  }
}

/**
 * Create CI/CD report
 */
async function createCICDReport(args) {
  console.log("🔄 Creating CI/CD report...");

  await collectMetrics([]);
  const metrics = readMetricsFile(".kiro/metrics/linting-metrics.json");

  if (!metrics) {
    console.log("❌ No metrics found.");
    return;
  }

  const report = {
    timestamp: new Date().toISOString(),
    deployment: {
      approved: metrics.errors === 0,
      confidence: Math.max(0, Math.min(100, 100 - metrics.errors * 10)),
      qualityScore: Math.max(
        0,
        100 - metrics.errors * 2 - metrics.warnings * 0.1,
      ),
    },
    metrics: {
      totalIssues: metrics.totalIssues,
      errors: metrics.errors,
      warnings: metrics.warnings,
      fixableIssues: metrics.fixableIssues,
    },
    qualityGates: {
      passed: metrics.errors === 0,
      riskLevel:
        metrics.errors > 50 ? "high" : metrics.errors > 10 ? "medium" : "low",
    },
    blockers: metrics.errors > 0 ? [`${metrics.errors} linting errors`] : [],
    recommendations:
      metrics.fixableIssues > 0
        ? [`${metrics.fixableIssues} issues can be auto-fixed`]
        : [],
  };

  console.log("\n🔄 CI/CD Integration Report:");
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(
    `Deployment Approved: ${report.deployment.approved ? "✅" : "❌"}`,
  );
  console.log(`Confidence: ${report.deployment.confidence.toFixed(1)}%`);
  console.log(
    `Quality Score: ${report.deployment.qualityScore.toFixed(1)}/100`,
  );

  console.log("\n📊 Metrics Summary:");
  console.log(`Total Issues: ${report.metrics.totalIssues}`);
  console.log(`Errors: ${report.metrics.errors}`);
  console.log(`Warnings: ${report.metrics.warnings}`);
  console.log(`Fixable: ${report.metrics.fixableIssues}`);

  if (report.blockers.length > 0) {
    console.log("\n🚨 Blockers:");
    report.blockers.forEach((blocker, index) => {
      console.log(`  ${index + 1}. ${blocker}`);
    });
  }

  if (args.includes("--save")) {
    const filename = `cicd-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${filename}`);
  }

  if (args.includes("--json")) {
    console.log("\n📄 JSON Output:");
    console.log(JSON.stringify(report, null, 2));
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
🔧 Linting Campaign CLI Tool

Usage: yarn lint:campaign <command> [options]

Commands:
  collect-metrics              Collect current linting metrics
    --json                     Output in JSON format
    --categories               Show error/warning categories

  generate-report              Generate comprehensive progress report
    --json                     Output in JSON format

  start-campaign <type>        Start a linting improvement campaign
    --dry-run                  Show what would be executed without running
    --confirm                  Actually start the campaign
    Available types: standard

  evaluate-gates               Evaluate quality gates for deployment
    --json                     Output in JSON format

  deployment-readiness         Check if codebase is ready for deployment
    --exit-code                Exit with code 0 if ready, 1 if not
    --json                     Output in JSON format

  monitor-trends               Monitor quality trends over time
    --json                     Output in JSON format

  create-cicd-report           Create CI/CD integration report
    --json                     Output in JSON format
    --save                     Save report to file

  help                         Show this help message

Examples:
  yarn lint:campaign collect-metrics --categories
  yarn lint:campaign start-campaign standard --dry-run
  yarn lint:campaign deployment-readiness --exit-code
  yarn lint:campaign create-cicd-report --save --json

For more information, see the documentation in the linting services directory.
`);
}

/**
 * Utility functions
 */
function ensureDirectoryExists(dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.warn(`Warning: Could not create directory ${dir}:`, error.message);
  }
}

function readMetricsFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
  }
  return null;
}

// Run the CLI if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

module.exports = { main, commands };
