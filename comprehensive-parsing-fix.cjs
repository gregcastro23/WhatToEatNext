#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Comprehensive parsing error fix...");

// Function to fix common parsing errors in a file
function fixParsingErrors(filePath) {
  if (!fs.existsSync(filePath)) return false;

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // Fix invalid function signatures in tests
  content = content.replace(
    /test\('([^']+)'\s*:\s*any,\s*async\s*\(\)\s*=>\s*{/g,
    "test('$1', async () => {",
  );
  content = content.replace(
    /it\('([^']+)'\s*:\s*any,\s*async\s*\(\)\s*=>\s*{/g,
    "it('$1', async () => {",
  );

  // Fix invalid jest.mock calls
  content = content.replace(
    /jest\.mock\('([^']+)'\(\s*{/g,
    "jest.mock('$1', () => {",
  );

  // Fix invalid catch clauses
  content = content.replace(
    /}\s*catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*{/g,
    "} catch ($1: any) {",
  );

  // Fix invalid function return type annotations
  content = content.replace(
    /function\s+([^(]+)\(\s*\)\s*:\s*any\s*{/g,
    "function $1(): any {",
  );

  // Fix invalid array access with dot
  content = content.replace(/\.phases\.\[(\d+)\]/g, ".phases[$1]");

  // Fix invalid parameter type annotations in forEach
  content = content.replace(
    /\(\[([^:]+):\s*any,\s*([^:]+)\]:\s*any\)/g,
    "([$1, $2]: [string, any])",
  );

  // Fix malformed object literals
  content = content.replace(/JSON\.stringify\(\{\}/g, "JSON.stringify({");

  // Fix malformed template literals
  content = content.replace(
    /`([^`]*)\$\{([^}]*)\s*\.map\([^}]*\)\s*\.join\([^}]*\)\}/g,
    (match, prefix, variable) => {
      return `\`${prefix}\${${variable}.map(dir => \`-not -path "*/$\{dir\}/*"\`).join(' ')}\``;
    },
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }

  return false;
}

// Get files with parsing errors
let errorFiles = [];
try {
  const lintOutput = execSync("yarn lint 2>&1", {
    encoding: "utf8",
    stdio: "pipe",
  });
} catch (error) {
  const output = error.stdout.toString();
  const lines = output.split("\n");

  for (const line of lines) {
    const match = line.match(/^([^:]+):\d+:\d+\s+error\s+Parsing error:/);
    if (match) {
      const filePath = match[1].trim();
      if (!errorFiles.includes(filePath)) {
        errorFiles.push(filePath);
      }
    }
  }
}

console.log(`Found ${errorFiles.length} files with parsing errors`);

let fixedCount = 0;
for (const filePath of errorFiles) {
  if (fixParsingErrors(filePath)) {
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
    fixedCount++;
  }
}

console.log(`\n🎯 Fixed ${fixedCount} files`);

// Check remaining errors
try {
  const remainingErrors = execSync(
    'yarn lint 2>&1 | grep -c "Parsing error" || echo "0"',
    { encoding: "utf8" },
  ).trim();
  console.log(`📊 Remaining parsing errors: ${remainingErrors}`);
} catch (error) {
  console.log("📊 Could not count remaining errors");
}
