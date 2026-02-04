#!/usr/bin/env node

/**
 * Test Script for All Pattern Fix Scripts
 *
 * This script tests all three pattern fix scripts on a test file
 * to verify they work correctly before running on the actual codebase.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Test file with all patterns
const TEST_FILE = "/tmp/parsing-fix-test/comprehensive-test.ts";
const TEST_CONTENT = `// Comprehensive test file with all parsing error patterns

// Pattern 1: Missing opening parenthesis in function definitions
export function calculateSomething()
  param1: string,
  param2: number
): ReturnType {
  console.log("test");
}

export const anotherFunction = ()
  arg1: boolean,
  arg2: string[]
): void => {
  return;
};

// Pattern 2: Malformed template literals
function logMessages() {
  console.log(\`Message one: $) {variable1}\`);
  logger.info(\`Count: $) {items.length}\`);
  alert(\`Error: $) {error.message}\`);
}

// Pattern 3: Malformed object syntax
function createObjects() {
  this.debug(message, ) { component, args });
  const metadata = ) {
    key: 'value',
    data: 42
  };
}

// Pattern 4: Semicolon in type definitions
import {
  Type1,
  Type2,
  Type3;
} from './module';

interface MyType {
  name: string;
  age: number;
  RecipeSeason;
}

// Pattern 5: Comma instead of colon in type properties
type Config = {
  upper, number;
  lower, number;
  marginOfError, number;
  enabled, boolean;
}

type Settings = {
  verbose, boolean;
  timeout, number;
  retries, number;
}

// Mixed patterns
export function complexFunction()
  data: Data,
  options: Options
): Promise<Result> {
  console.log(\`Processing: $) {data.id}\`);
  const config = ) {
    timeout: 5000,
    retries, number;
  };
}
`;

function log(message) {
  console.log(`[TEST] ${message}`);
}

function createTestFile() {
  const dir = path.dirname(TEST_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TEST_FILE, TEST_CONTENT, "utf8");
  log(`✓ Created test file: ${TEST_FILE}`);
}

function runScript(scriptName, description) {
  log(`\n${"=".repeat(60)}`);
  log(`Testing: ${scriptName}`);
  log(`Description: ${description}`);
  log("=".repeat(60));

  try {
    // Dry run first
    log("Running dry-run...");
    const dryRunOutput = execSync(
      `node scripts/${scriptName} --file=${TEST_FILE}`,
      { encoding: "utf8", cwd: process.cwd() },
    );
    console.log(dryRunOutput);

    // Apply changes
    log("\nApplying changes...");
    const applyOutput = execSync(
      `node scripts/${scriptName} --apply --file=${TEST_FILE}`,
      { encoding: "utf8", cwd: process.cwd() },
    );
    console.log(applyOutput);

    log(`✅ ${scriptName} completed successfully`);
    return true;
  } catch (error) {
    log(`❌ ${scriptName} failed:`);
    console.error(error.message);
    return false;
  }
}

function showFinalResult() {
  log("\n" + "=".repeat(60));
  log("FINAL RESULT");
  log("=".repeat(60));
  const content = fs.readFileSync(TEST_FILE, "utf8");
  console.log(content);
}

function countPatterns() {
  const content = fs.readFileSync(TEST_FILE, "utf8");

  const pattern1 = content.match(
    /export (function|const) \w+\(\)\s*\n\s*\w+:/gm,
  );
  const pattern2 = content.match(/\$\)\s*\{/g);
  const pattern3 = content.match(/,\s*\)\s*\{/g);
  const pattern4 = content.match(/\w+;\s*\n\s*\}/gm);
  const pattern5 = content.match(/\w+,\s*(number|string|boolean)/g);

  log("\nPattern counts in file:");
  log(`  Pattern 1 (missing parens): ${pattern1 ? pattern1.length : 0}`);
  log(`  Pattern 2 (bad templates): ${pattern2 ? pattern2.length : 0}`);
  log(`  Pattern 3 (bad objects): ${pattern3 ? pattern3.length : 0}`);
  log(`  Pattern 4 (semicolons): ${pattern4 ? pattern4.length : 0}`);
  log(`  Pattern 5 (comma not colon): ${pattern5 ? pattern5.length : 0}`);

  return {
    pattern1: pattern1 ? pattern1.length : 0,
    pattern2: pattern2 ? pattern2.length : 0,
    pattern3: pattern3 ? pattern3.length : 0,
    pattern4: pattern4 ? pattern4.length : 0,
    pattern5: pattern5 ? pattern5.length : 0,
  };
}

// Main execution
function main() {
  log("===== TESTING ALL PATTERN FIX SCRIPTS =====");
  log("This will create a test file and run all three scripts\n");

  // Create test file
  createTestFile();

  // Count initial patterns
  log("\nInitial state:");
  const initialCounts = countPatterns();

  // Run scripts in order
  const results = [];

  results.push(
    runScript(
      "fix-pattern-2-template-literals.cjs",
      "Fixes malformed template literals ($) { -> ${)",
    ),
  );

  log("\nAfter Pattern 2:");
  countPatterns();

  results.push(
    runScript(
      "fix-pattern-1-function-parens.cjs",
      "Fixes missing opening parenthesis in functions",
    ),
  );

  log("\nAfter Pattern 1:");
  countPatterns();

  results.push(
    runScript(
      "fix-pattern-3-5-type-syntax.cjs",
      "Fixes object syntax and type definition errors",
    ),
  );

  log("\nAfter Pattern 3-5:");
  const finalCounts = countPatterns();

  // Show final result
  showFinalResult();

  // Summary
  log("\n" + "=".repeat(60));
  log("SUMMARY");
  log("=".repeat(60));
  log(`Script 1 (Template Literals): ${results[0] ? "✅ PASS" : "❌ FAIL"}`);
  log(`Script 2 (Function Parens): ${results[1] ? "✅ PASS" : "❌ FAIL"}`);
  log(`Script 3 (Type Syntax): ${results[2] ? "✅ PASS" : "❌ FAIL"}`);

  log("\nPattern reduction:");
  log(`  Pattern 1: ${initialCounts.pattern1} → ${finalCounts.pattern1}`);
  log(`  Pattern 2: ${initialCounts.pattern2} → ${finalCounts.pattern2}`);
  log(`  Pattern 3: ${initialCounts.pattern3} → ${finalCounts.pattern3}`);
  log(`  Pattern 4: ${initialCounts.pattern4} → ${finalCounts.pattern4}`);
  log(`  Pattern 5: ${initialCounts.pattern5} → ${finalCounts.pattern5}`);

  const allPassed = results.every((r) => r);
  if (allPassed) {
    log("\n✅ ALL TESTS PASSED");
    log("Scripts are ready to use on the codebase!");
  } else {
    log("\n❌ SOME TESTS FAILED");
    log("Please review the errors above before using on the codebase.");
  }

  log(`\nTest file location: ${TEST_FILE}`);
  log("Log files: fix-log-pattern-*.txt");
}

main();
