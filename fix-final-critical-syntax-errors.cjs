#!/usr/bin/env node

/**
 * Fix Final Critical Syntax Errors
 * Addresses the remaining specific syntax issues preventing build
 */

const fs = require("fs");
const { execSync } = require("child_process");

function fixSpecificSyntaxErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  console.log(`Fixing specific syntax errors in: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Fix double commas
  if (content.includes(",,")) {
    content = content.replace(/,,/g, ",");
    modified = true;
    console.log(`  ✅ Fixed double commas`);
  }

  // Fix numeric literals with underscores followed by identifiers
  const numericUnderscorePattern = /(\d+\.\d+)_([A-Z]\w*)/g;
  if (numericUnderscorePattern.test(content)) {
    content = content.replace(numericUnderscorePattern, "$1, $2");
    modified = true;
    console.log(`  ✅ Fixed numeric underscore patterns`);
  }

  // Fix object literal with comma after opening brace
  if (content.includes("{,")) {
    content = content.replace(/{\s*,/g, "{");
    modified = true;
    console.log(`  ✅ Fixed object literal comma after brace`);
  }

  // Fix array/object properties with trailing commas followed by semicolons
  const trailingCommaPattern =
    /(\w+:\s*[^,;\n}]+),(\s*\n\s*\w+:\s*[^,;\n}]+);/g;
  if (trailingCommaPattern.test(content)) {
    content = content.replace(trailingCommaPattern, "$1,$2,");
    modified = true;
    console.log(`  ✅ Fixed trailing comma-semicolon patterns`);
  }

  // Fix export type/interface syntax issues
  const exportTypePattern = /export\s+(type|interface)\s+(\w+)\s*=\s*{/g;
  if (exportTypePattern.test(content)) {
    content = content.replace(exportTypePattern, "export $1 $2 = {");
    modified = true;
    console.log(`  ✅ Fixed export type/interface syntax`);
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Successfully fixed ${filePath}`);
    return true;
  }

  return false;
}

// Files identified from build errors
const criticalFiles = [
  "src/calculations/alchemicalTransformation.ts",
  "src/contexts/AlchemicalContext/provider.tsx",
  "src/data/cuisines/index.ts",
  "src/data/ingredients/fruits/index.ts",
  "src/data/ingredients/grains/wholeGrains.ts",
];

console.log("Fixing final critical syntax errors...");

let totalFixed = 0;

for (const filePath of criticalFiles) {
  if (fixSpecificSyntaxErrors(filePath)) {
    totalFixed++;
  }
}

console.log(`\nFixed ${totalFixed} critical files`);

// Test build
console.log("\nTesting build...");
try {
  execSync("yarn build", { stdio: "pipe", timeout: 90000 });
  console.log("🎉 Build successful!");
  console.log("✅ All critical syntax errors fixed");
  console.log("✅ Ready to proceed with ESLint mass reduction");
} catch (error) {
  console.log("❌ Some build issues remain");
  const errorOutput =
    error.stdout?.toString() || error.stderr?.toString() || "";
  console.log("Remaining errors:");
  console.log(errorOutput.split("\n").slice(0, 30).join("\n"));
}
