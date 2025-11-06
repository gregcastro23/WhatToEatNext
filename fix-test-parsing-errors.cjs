#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Fixing test file parsing errors systematically...");

// Get all files with parsing errors
let lintOutput;
try {
  execSync("yarn lint 2>&1", { stdio: "pipe" });
} catch (error) {
  lintOutput = error.stdout.toString();
}

const parsingErrorFiles = [];
const lines = lintOutput.split("\n");

for (const line of lines) {
  if (line.includes("error  Parsing error:")) {
    const match = line.match(/^(.+?):\d+:\d+\s+error\s+Parsing error:/);
    if (match) {
      const filePath = match[1].trim();
      if (!parsingErrorFiles.includes(filePath)) {
        parsingErrorFiles.push(filePath);
      }
    }
  }
}

console.log(`Found ${parsingErrorFiles.length} files with parsing errors`);

// Common parsing error patterns and fixes
const commonFixes = [
  // Invalid function signatures in tests
  {
    pattern: /test\('([^']+)'\s*:\s*any,\s*async\s*\(\)\s*=>\s*{/g,
    replacement: "test('$1', async () => {",
  },
  {
    pattern: /it\('([^']+)'\s*:\s*any,\s*async\s*\(\)\s*=>\s*{/g,
    replacement: "it('$1', async () => {",
  },
  // Invalid jest.mock calls
  {
    pattern: /jest\.mock\('([^']+)'\(\s*{/g,
    replacement: "jest.mock('$1', () => {",
  },
  // Invalid catch clauses
  {
    pattern: /}\s*catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*{/g,
    replacement: "} catch ($1: any) {",
  },
  // Invalid function return type annotations
  {
    pattern: /function\s+([^(]+)\(\s*\)\s*:\s*any\s*{/g,
    replacement: "function $1(): any {",
  },
  // Malformed template literals with code
  {
    pattern: /`([^`]*)\$\{[^}]*\.map\([^}]*\)\.join\([^}]*\)\}/g,
    replacement: (match, prefix) => {
      // This is a complex case, we'll handle it separately
      return match;
    },
  },
];

let totalFixed = 0;

for (const filePath of parsingErrorFiles) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      let fileFixed = false;

      for (const fix of commonFixes) {
        const originalContent = content;
        content = content.replace(fix.pattern, fix.replacement);
        if (content !== originalContent) {
          fileFixed = true;
        }
      }

      if (fileFixed) {
        fs.writeFileSync(filePath, content);
        console.log(
          `✅ Fixed parsing errors in ${path.relative(process.cwd(), filePath)}`,
        );
        totalFixed++;
      }
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log(`\n🎯 Fixed parsing errors in ${totalFixed} files`);

// Run a quick lint check to see remaining issues
console.log("\n📊 Checking remaining parsing errors...");
try {
  execSync('yarn lint 2>&1 | grep -c "Parsing error"', { stdio: "pipe" });
} catch (error) {
  const count = error.stdout.toString().trim();
  console.log(`Remaining parsing errors: ${count || "0"}`);
}
