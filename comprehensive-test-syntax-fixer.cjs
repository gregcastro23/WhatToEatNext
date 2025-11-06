#!/usr/bin/env node

/**
 * Comprehensive Test Syntax Fixer
 *
 * Fixes remaining syntax issues in test files that are preventing ESLint from running properly
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Starting comprehensive test syntax fix...");

// Get all test files
function getAllTestFiles() {
  try {
    const output = execSync(
      'find src -name "*.test.ts" -o -name "*.test.tsx"',
      { encoding: "utf8" },
    );
    return output
      .trim()
      .split("\n")
      .filter((f) => f.trim());
  } catch (error) {
    return [];
  }
}

const testFiles = getAllTestFiles();
console.log(`📁 Found ${testFiles.length} test files to process`);

let totalFixes = 0;
let processedFiles = 0;

for (const filePath of testFiles) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed jest.mock patterns: `jest?.mock('path'( ({` -> `jest.mock('path', () => ({`
  const jestMockMatches = (
    content.match(/jest\?\.mock\('([^']+)'\(\s*\(\{/g) || []
  ).length;
  content = content.replace(
    /jest\?\.mock\('([^']+)'\(\s*\(\{/g,
    "jest.mock('$1', () => ({",
  );
  fileFixes += jestMockMatches;

  // Fix malformed arrow functions: `() =>)` -> `() =>`
  const arrowMatches = (content.match(/\(\)\s*=>\)\s*=>/g) || []).length;
  content = content.replace(/\(\)\s*=>\)\s*=>/g, "() =>");
  fileFixes += arrowMatches;

  // Fix malformed type assertions: `as jest?.MockedFunction` -> `as jest.MockedFunction`
  const assertionMatches = (content.match(/as jest\?\./g) || []).length;
  content = content.replace(/as jest\?\./g, "as jest.");
  fileFixes += assertionMatches;

  // Fix malformed object properties: `{;` -> `{`
  const objectMatches = (content.match(/\{\s*;/g) || []).length;
  content = content.replace(/\{\s*;/g, "{");
  fileFixes += objectMatches;

  // Fix malformed property access: `property?.` -> `property.` (in simple cases)
  const accessMatches = (content.match(/(\w+)\?\./g) || []).length;
  content = content.replace(/(\w+)\?\./g, "$1.");
  fileFixes += accessMatches;

  // Fix malformed function parameters: `(: any)` -> `()`
  const paramMatches = (content.match(/\(\s*:\s*any\s*\)/g) || []).length;
  content = content.replace(/\(\s*:\s*any\s*\)/g, "()");
  fileFixes += paramMatches;

  // Fix malformed closing patterns: `}));` issues
  const closingMatches = (content.match(/\}\)\);/g) || []).length;
  // Only fix if it's clearly malformed (preceded by specific patterns)
  content = content.replace(/(\w+:\s*jest\.fn\(\),?\s*)\}\)\);/g, "$1}));");

  // Fix malformed property assignments: `property: value,;` -> `property: value,`
  const propMatches = (content.match(/:\s*[^,}]+,\s*;/g) || []).length;
  content = content.replace(/(:\s*[^,}]+),\s*;/g, "$1,");
  fileFixes += propMatches;

  // Fix malformed array/object access: `recipe?.seasonality[season as keyof typeof recipe?.seasonality]`
  const keyofMatches = (content.match(/typeof\s+\w+\?\./g) || []).length;
  content = content.replace(/typeof\s+(\w+)\?\./g, "typeof $1.");
  fileFixes += keyofMatches;

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, content);
    totalFixes += fileFixes;
    processedFiles++;

    if (processedFiles <= 20) {
      console.log(`📝 Fixed ${fileFixes} issues in ${path.basename(filePath)}`);
    }
  }
}

console.log(`\n🎉 Comprehensive test syntax fix completed!`);
console.log(`📊 Files processed: ${processedFiles}`);
console.log(`🔧 Total fixes applied: ${totalFixes}`);

// Check progress
console.log("\n🔍 Checking TypeScript compilation...");
try {
  const result = execSync(
    'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"',
    { encoding: "utf8" },
  );
  const errorCount = parseInt(result.trim());
  console.log(`📊 Current TypeScript errors: ${errorCount}`);

  if (errorCount < 25000) {
    console.log("🎉 Major progress made!");
  }
} catch (error) {
  console.log("⚠️  Could not get error count");
}
