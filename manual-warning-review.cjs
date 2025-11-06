#!/usr/bin/env node

/**
 * Manual Warning Review Analysis
 *
 * Identifies complex warnings requiring manual intervention
 */

const { execSync } = require("child_process");
const fs = require("fs");

console.log("🔍 Analyzing warnings requiring manual review...\n");

// Get warning counts by type
console.log("📊 Warning Distribution:");
try {
  const warningCounts = execSync(
    `
    yarn lint:quick 2>&1 |
    grep -E "(error|warning)" |
    sed 's/.*\\(error\\|warning\\)  //' |
    awk '{print $NF}' |
    sort | uniq -c | sort -nr | head -15
  `,
    { encoding: "utf8" },
  );

  console.log(warningCounts);
} catch (error) {
  console.log("Could not get warning distribution");
}

// Analyze specific categories requiring manual review
const categories = {
  EXPLICIT_ANY_TYPES: {
    command: `yarn lint:quick 2>&1 | grep "@typescript-eslint/no-explicit-any" | wc -l`,
    description: "Explicit any types requiring domain knowledge",
    priority: "HIGH",
  },
  UNUSED_VARIABLES: {
    command: `yarn lint:quick 2>&1 | grep -E "(no-unused-vars|@typescript-eslint/no-unused-vars)" | wc -l`,
    description: "Unused variables (may be domain-specific)",
    priority: "MEDIUM",
  },
  CONSOLE_STATEMENTS: {
    command: `yarn lint:quick 2>&1 | grep "no-console" | wc -l`,
    description: "Console statements (may be intentional)",
    priority: "LOW",
  },
  REACT_HOOKS: {
    command: `yarn lint:quick 2>&1 | grep "react-hooks" | wc -l`,
    description: "React hooks requiring logic understanding",
    priority: "HIGH",
  },
  SYNTAX_ERRORS: {
    command: `yarn lint:quick 2>&1 | grep -E "(no-const-assign|no-undef|no-redeclare)" | wc -l`,
    description: "Syntax errors indicating deeper issues",
    priority: "HIGH",
  },
};

console.log("\n🏷️  Categories Requiring Manual Review:");
console.log("=".repeat(50));

let totalManualReview = 0;
const results = {};

for (const [category, info] of Object.entries(categories)) {
  try {
    const count =
      parseInt(execSync(info.command, { encoding: "utf8" }).trim()) || 0;
    totalManualReview += count;
    results[category] = { count, ...info };

    console.log(`${category}:`);
    console.log(`  Count: ${count}`);
    console.log(`  Priority: ${info.priority}`);
    console.log(`  Description: ${info.description}`);
    console.log();
  } catch (error) {
    console.log(`${category}: Could not analyze`);
  }
}

// Get sample files with high warning counts
console.log("📁 Files with High Warning Counts:");
console.log("=".repeat(50));

try {
  const topFiles = execSync(
    `
    yarn lint:quick 2>&1 |
    grep -E "^/" |
    cut -d: -f1 |
    sort | uniq -c |
    sort -nr |
    head -10
  `,
    { encoding: "utf8" },
  );

  console.log(topFiles);
} catch (error) {
  console.log("Could not analyze top files");
}

// Identify domain-specific files that need careful review
console.log("\n🎯 Domain-Specific Files Requiring Expert Review:");
console.log("=".repeat(50));

const domainPatterns = [
  "calculations/",
  "alchemicalEngine",
  "astrology",
  "planetary",
  "services/campaign/",
  "Intelligence",
];

for (const pattern of domainPatterns) {
  try {
    const count = execSync(
      `
      yarn lint:quick 2>&1 |
      grep -E "^/" |
      grep -i "${pattern}" |
      wc -l
    `,
      { encoding: "utf8" },
    ).trim();

    if (parseInt(count) > 0) {
      console.log(`${pattern}: ${count} warnings`);
    }
  } catch (error) {
    // Skip if pattern not found
  }
}

// Generate recommendations
console.log("\n💡 Manual Review Recommendations:");
console.log("=".repeat(50));

const recommendations = [];

if (results.EXPLICIT_ANY_TYPES?.count > 100) {
  recommendations.push({
    priority: "HIGH",
    category: "Type Safety",
    action: `Review ${results.EXPLICIT_ANY_TYPES.count} explicit any types`,
    description: "Focus on calculations/ and services/ directories first",
  });
}

if (results.REACT_HOOKS?.count > 10) {
  recommendations.push({
    priority: "HIGH",
    category: "React Logic",
    action: `Review ${results.REACT_HOOKS.count} React hooks warnings`,
    description: "Requires understanding of component state and effects",
  });
}

if (results.UNUSED_VARIABLES?.count > 200) {
  recommendations.push({
    priority: "MEDIUM",
    category: "Domain Variables",
    action: `Review ${results.UNUSED_VARIABLES.count} unused variables`,
    description:
      "Many may be intentionally preserved for astrological/campaign logic",
  });
}

if (results.SYNTAX_ERRORS?.count > 50) {
  recommendations.push({
    priority: "HIGH",
    category: "Code Quality",
    action: `Fix ${results.SYNTAX_ERRORS.count} syntax errors`,
    description: "These may indicate deeper architectural issues",
  });
}

// Sort by priority
const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 };
recommendations.sort(
  (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
);

for (let i = 0; i < recommendations.length; i++) {
  const rec = recommendations[i];
  console.log(`${i + 1}. ${rec.category} (${rec.priority} Priority)`);
  console.log(`   Action: ${rec.action}`);
  console.log(`   Description: ${rec.description}`);
  console.log();
}

// Summary
console.log("📋 SUMMARY:");
console.log("=".repeat(50));
console.log(`Total warnings requiring manual review: ~${totalManualReview}`);
console.log(
  `Estimated effort: ${totalManualReview > 1000 ? "HIGH" : totalManualReview > 500 ? "MEDIUM" : "LOW"}`,
);
console.log();

console.log("🎯 Next Steps:");
console.log("1. Start with HIGH priority categories");
console.log("2. Focus on domain-specific files first");
console.log("3. Preserve astrological and campaign system logic");
console.log("4. Work in small batches to maintain stability");
console.log();

// Save results
const reportData = {
  timestamp: new Date().toISOString(),
  totalManualReview,
  categories: results,
  recommendations,
  summary: {
    highPriority: recommendations.filter((r) => r.priority === "HIGH").length,
    mediumPriority: recommendations.filter((r) => r.priority === "MEDIUM")
      .length,
    lowPriority: recommendations.filter((r) => r.priority === "LOW").length,
  },
};

fs.writeFileSync(
  "manual-warning-review-report.json",
  JSON.stringify(reportData, null, 2),
);
console.log("📄 Report saved to: manual-warning-review-report.json");
