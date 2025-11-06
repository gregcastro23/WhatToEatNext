#!/usr/bin/env node

/**
 * Quick Test Syntax Fix Script
 *
 * Fixes malformed object syntax in test files caused by previous operations
 */

const fs = require("fs");
const path = require("path");

function fixTestFileSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Fix malformed object syntax patterns
    const fixes = [
      // Fix ({, to ({
      { pattern: /\(\{,/g, replacement: "({" },
      // Fix {, to {
      { pattern: /\{\s*,/g, replacement: "{" },
      // Fix function(); to function()
      { pattern: /(\w+\(\))\s*;/g, replacement: "$1" },
      // Fix extra })); patterns
      { pattern: /\}\)\);\s*\}\)\);/g, replacement: "}));" },
    ];

    for (const fix of fixes) {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed syntax in ${path.basename(filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Get all test files with potential syntax issues
const testFiles = [
  "src/__tests__/linting/LintingValidationDashboard.test.ts",
  "src/__tests__/linting/React19NextJS15CompatibilityValidation.test.ts",
  "src/__tests__/linting/LintingPerformance.test.ts",
  "src/__tests__/linting/ConfigurationFileRuleValidation.test.ts",
  "src/__tests__/linting/PerformanceOptimizationValidation.test.ts",
  "src/__tests__/linting/AstrologicalRuleValidation.test.ts",
  "src/__tests__/linting/ZeroErrorAchievementDashboard.test.ts",
];

let fixedCount = 0;
for (const file of testFiles) {
  if (fs.existsSync(file)) {
    if (fixTestFileSyntax(file)) {
      fixedCount++;
    }
  }
}

console.log(`\n📊 Summary: Fixed ${fixedCount} test files`);
