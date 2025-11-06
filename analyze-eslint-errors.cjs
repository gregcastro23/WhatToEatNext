#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

console.log("🔍 Analyzing ESLint Error Patterns...\n");

try {
  // Run ESLint and capture output
  console.log("Running ESLint analysis...");
  const eslintOutput = execSync("yarn lint --format=json 2>/dev/null", {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  const results = JSON.parse(eslintOutput);

  // Initialize counters
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalFiles = 0;
  let filesWithErrors = 0;
  let filesWithWarnings = 0;

  const errorsByRule = {};
  const warningsByRule = {};
  const errorsByFile = {};
  const parsingErrors = [];
  const highImpactFiles = [];

  // Process each file
  results.forEach((file) => {
    const filePath = file.filePath.replace(process.cwd(), "");
    totalFiles++;

    if (file.errorCount > 0) {
      filesWithErrors++;
      errorsByFile[filePath] = file.errorCount;

      // Track high-impact files (>10 errors)
      if (file.errorCount > 10) {
        highImpactFiles.push({
          file: filePath,
          errors: file.errorCount,
          warnings: file.warningCount,
        });
      }
    }

    if (file.warningCount > 0) {
      filesWithWarnings++;
    }

    totalErrors += file.errorCount;
    totalWarnings += file.warningCount;

    // Process each message
    file.messages.forEach((message) => {
      if (message.severity === 2) {
        // Error
        if (message.fatal) {
          parsingErrors.push({
            file: filePath,
            message: message.message,
            ruleId: message.ruleId,
          });
        } else {
          const rule = message.ruleId || "unknown";
          errorsByRule[rule] = (errorsByRule[rule] || 0) + 1;
        }
      } else if (message.severity === 1) {
        // Warning
        const rule = message.ruleId || "unknown";
        warningsByRule[rule] = (warningsByRule[rule] || 0) + 1;
      }
    });
  });

  // Generate comprehensive report
  console.log("📊 ESLint Error Analysis Report");
  console.log("================================\n");

  console.log("📈 Overall Statistics:");
  console.log(`   Total Files Analyzed: ${totalFiles}`);
  console.log(`   Files with Errors: ${filesWithErrors}`);
  console.log(`   Files with Warnings: ${filesWithWarnings}`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(`   Total Warnings: ${totalWarnings}`);
  console.log(`   Total Issues: ${totalErrors + totalWarnings}\n`);

  // Top error rules
  console.log("🚨 Top Error Rules:");
  const sortedErrors = Object.entries(errorsByRule)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  sortedErrors.forEach(([rule, count], index) => {
    console.log(
      `   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(40)} ${count.toString().padStart(4)} errors`,
    );
  });
  console.log();

  // Top warning rules
  console.log("⚠️  Top Warning Rules:");
  const sortedWarnings = Object.entries(warningsByRule)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  sortedWarnings.forEach(([rule, count], index) => {
    console.log(
      `   ${(index + 1).toString().padStart(2)}. ${rule.padEnd(40)} ${count.toString().padStart(4)} warnings`,
    );
  });
  console.log();

  // Parsing errors (critical)
  if (parsingErrors.length > 0) {
    console.log("💥 Parsing Errors (Critical):");
    parsingErrors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.file}`);
      console.log(`      ${error.message.split("\n")[0]}`);
    });
    console.log();
  }

  // High-impact files
  if (highImpactFiles.length > 0) {
    console.log("🎯 High-Impact Files (>10 errors):");
    highImpactFiles
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 10)
      .forEach((file, index) => {
        console.log(
          `   ${(index + 1).toString().padStart(2)}. ${file.file.padEnd(50)} ${file.errors.toString().padStart(3)} errors, ${file.warnings.toString().padStart(3)} warnings`,
        );
      });
    console.log();
  }

  // Error categorization
  console.log("📂 Error Categories:");
  const categories = {
    TypeScript: ["@typescript-eslint/", "typescript-eslint"],
    React: ["react/", "react-hooks/", "jsx-"],
    "Import/Export": ["import/", "no-unused-vars", "no-undef"],
    "Code Quality": ["no-console", "prefer-const", "eqeqeq"],
    Parsing: ["null", "unknown"],
  };

  Object.entries(categories).forEach(([category, patterns]) => {
    const categoryErrors = Object.entries(errorsByRule)
      .filter(([rule]) => patterns.some((pattern) => rule.includes(pattern)))
      .reduce((sum, [, count]) => sum + count, 0);

    const categoryWarnings = Object.entries(warningsByRule)
      .filter(([rule]) => patterns.some((pattern) => rule.includes(pattern)))
      .reduce((sum, [, count]) => sum + count, 0);

    if (categoryErrors > 0 || categoryWarnings > 0) {
      console.log(
        `   ${category.padEnd(15)}: ${categoryErrors.toString().padStart(4)} errors, ${categoryWarnings.toString().padStart(4)} warnings`,
      );
    }
  });
  console.log();

  // Recommendations
  console.log("💡 Recommendations:");

  if (parsingErrors.length > 0) {
    console.log(
      "   1. 🚨 CRITICAL: Fix parsing errors first - these prevent proper analysis",
    );
    console.log("      - Update tsconfig.json to include all TypeScript files");
    console.log("      - Remove duplicate or backup files from linting scope");
  }

  if (totalErrors > 500) {
    console.log("   2. 🎯 HIGH PRIORITY: Focus on high-impact files first");
    console.log("      - Target files with >10 errors for maximum impact");
    console.log("      - Use automated fixing tools where safe");
  }

  const topErrorRule = sortedErrors[0];
  if (topErrorRule && topErrorRule[1] > 100) {
    console.log(
      `   3. 📊 SYSTEMATIC: Address "${topErrorRule[0]}" rule (${topErrorRule[1]} instances)`,
    );
    console.log(
      "      - This single rule accounts for a large portion of errors",
    );
    console.log(
      "      - Consider automated fixing or rule configuration adjustment",
    );
  }

  console.log();

  // Save detailed report
  const detailedReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles,
      filesWithErrors,
      filesWithWarnings,
      totalErrors,
      totalWarnings,
      totalIssues: totalErrors + totalWarnings,
    },
    errorsByRule: Object.fromEntries(sortedErrors),
    warningsByRule: Object.fromEntries(sortedWarnings),
    parsingErrors,
    highImpactFiles,
    errorsByFile: Object.fromEntries(
      Object.entries(errorsByFile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
    ),
  };

  fs.writeFileSync(
    "eslint-error-analysis-report.json",
    JSON.stringify(detailedReport, null, 2),
  );
  console.log("📄 Detailed report saved to: eslint-error-analysis-report.json");

  // Exit with appropriate code
  if (totalErrors > 0) {
    console.log(`\n❌ Analysis complete: ${totalErrors} errors found`);
    process.exit(1);
  } else {
    console.log(
      `\n✅ Analysis complete: No errors found, ${totalWarnings} warnings`,
    );
    process.exit(0);
  }
} catch (error) {
  console.error("❌ Error running ESLint analysis:", error.message);

  // Try alternative approach
  console.log("\n🔄 Trying alternative analysis approach...");

  try {
    // Get basic error count
    const errorOutput = execSync(
      'yarn lint 2>&1 | grep -E "(error|warning)" | wc -l',
      {
        encoding: "utf8",
      },
    );

    const issueCount = parseInt(errorOutput.trim()) || 0;
    console.log(`Found approximately ${issueCount} linting issues`);

    // Get sample of errors
    const sampleOutput = execSync("yarn lint 2>&1 | head -50", {
      encoding: "utf8",
    });

    console.log("\n📋 Sample ESLint Output:");
    console.log("========================");
    console.log(sampleOutput);
  } catch (altError) {
    console.error("❌ Alternative analysis also failed:", altError.message);
    process.exit(1);
  }
}
