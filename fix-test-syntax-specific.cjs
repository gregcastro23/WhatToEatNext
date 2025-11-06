#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Specific fix for test function syntax issues causing TS1005 errors
 */

function fixTestSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;
  let fixCount = 0;

  // Fix test function syntax: test('...': any, async () => { -> test('...', async () => {
  const testPattern =
    /test\s*\(\s*(['"][^'"]*['"])\s*:\s*any\s*,\s*(async\s*\(\s*\)\s*=>\s*\{)/g;
  content = content.replace(testPattern, (match, testName, asyncFunc) => {
    fixCount++;
    console.log(`  ✓ Fixed test syntax: ${testName}`);
    return `test(${testName}, ${asyncFunc}`;
  });

  // Fix describe function syntax: describe('...': any, () => { -> describe('...', () => {
  const describePattern =
    /describe\s*\(\s*(['"][^'"]*['"])\s*:\s*any\s*,\s*(\(\s*\)\s*=>\s*\{)/g;
  content = content.replace(describePattern, (match, describeName, func) => {
    fixCount++;
    console.log(`  ✓ Fixed describe syntax: ${describeName}`);
    return `describe(${describeName}, ${func}`;
  });

  // Fix beforeEach/afterEach syntax: beforeEach(': any, async () => { -> beforeEach(async () => {
  const hookPattern =
    /(beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*['"]?\s*:\s*any\s*,\s*(async\s*\(\s*\)\s*=>\s*\{)/g;
  content = content.replace(hookPattern, (match, hookName, asyncFunc) => {
    fixCount++;
    console.log(`  ✓ Fixed ${hookName} syntax`);
    return `${hookName}(${asyncFunc}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Fixed ${fixCount} test syntax issues in: ${filePath}`);
    return true;
  }

  return false;
}

async function getTS1005ErrorFiles() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const errorLines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
    const files = new Set();

    errorLines.forEach((line) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        files.add(match[1]);
      }
    });

    return Array.from(files);
  } catch (error) {
    if (error.status === 1) {
      return [];
    }
    throw error;
  }
}

async function validateBuild() {
  try {
    console.log("\n🔍 Validating TypeScript compilation...");
    execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
    console.log("✅ TypeScript compilation successful");
    return true;
  } catch (error) {
    console.log("❌ TypeScript compilation failed");
    return false;
  }
}

async function main() {
  console.log("🚀 Fixing Test Function Syntax Issues");
  console.log("====================================");

  const errorFiles = await getTS1005ErrorFiles();
  console.log(`📊 Found ${errorFiles.length} files with TS1005 errors`);

  if (errorFiles.length === 0) {
    console.log("🎉 No TS1005 errors found!");
    return;
  }

  let fixedCount = 0;

  // Focus on test files first
  const testFiles = errorFiles.filter(
    (file) => file.includes(".test.") || file.includes("__tests__"),
  );

  console.log(`\n📝 Processing ${testFiles.length} test files:`);

  testFiles.forEach((filePath, index) => {
    console.log(`\n[${index + 1}/${testFiles.length}] Processing: ${filePath}`);
    if (fixTestSyntax(filePath)) {
      fixedCount++;
    }
  });

  // Validate build
  const buildSuccess = await validateBuild();

  // Final summary
  console.log("\n📈 SUMMARY");
  console.log("==========");
  console.log(`Files processed: ${testFiles.length}`);
  console.log(`Files modified: ${fixedCount}`);
  console.log(`Build successful: ${buildSuccess ? "Yes" : "No"}`);

  // Check final error count
  const finalErrorFiles = await getTS1005ErrorFiles();
  const reduction = errorFiles.length - finalErrorFiles.length;
  const reductionPercent =
    errorFiles.length > 0
      ? ((reduction / errorFiles.length) * 100).toFixed(1)
      : 0;

  console.log(`\n📊 Error Reduction:`);
  console.log(`Initial TS1005 errors: ${errorFiles.length} files`);
  console.log(`Final TS1005 errors: ${finalErrorFiles.length} files`);
  console.log(`Reduction: ${reduction} files (${reductionPercent}%)`);

  console.log("\n✅ Test syntax fixes completed!");
}

main().catch(console.error);
