#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🔧 Fixing malformed syntax errors...");

// Get files with TS1005 and TS1128 errors
const getFilesWithSyntaxErrors = () => {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS1005\\|TS1128" | cut -d"(" -f1 | sort | uniq',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );
    return output
      .trim()
      .split("\n")
      .filter((line) => line.trim());
  } catch (error) {
    return [];
  }
};

// Fix common malformed patterns
const fixMalformedSyntax = (content) => {
  let fixed = content;

  // Fix malformed object properties with missing closing parenthesis
  // Pattern: category: ((obj as Record<string, unknown>)?.property,
  // Should be: category: (obj as Record<string, unknown>)?.property,
  fixed = fixed.replace(
    /(\w+):\s*\(\(([^)]+)\s+as\s+Record<string,\s*unknown>\)\?\.\w+,/g,
    "$1: ($2 as Record<string, unknown>)?.$3,",
  );

  // Fix malformed type assertions with missing closing bracket
  // Pattern: (unknown>)
  // Should be: unknown>)
  fixed = fixed.replace(/\(unknown>\)/g, "unknown>)");

  // Fix malformed Record type assertions
  // Pattern: (c as Record<string, (unknown>)
  // Should be: (c as Record<string, unknown>)
  fixed = fixed.replace(
    /Record<string,\s*\(unknown>\)/g,
    "Record<string, unknown>",
  );

  // Fix object literal syntax errors
  // Pattern: category: ((beforeCat as Record<string, unknown>)?.category,
  // Should be: category: (beforeCat as Record<string, unknown>)?.category,
  fixed = fixed.replace(
    /(\w+):\s*\(\(([^)]+as\s+Record<string,\s*unknown>)\)\?\.([\w.]+),/g,
    "$1: ($2)?.$3,",
  );

  // Fix missing closing parenthesis in object literals
  // Look for patterns where we have an opening ( but missing closing )
  fixed = fixed.replace(
    /category:\s*\(([^)]+as\s+Record<string,\s*unknown>)\?\.([\w.]+),/g,
    "category: ($1)?.$2,",
  );

  return fixed;
};

const filesToFix = getFilesWithSyntaxErrors();
console.log(`Found ${filesToFix.length} files with syntax errors`);

let totalFixed = 0;

for (const filePath of filesToFix) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fixed = fixMalformedSyntax(content);

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      console.log(`✅ Fixed syntax errors in ${filePath}`);
      totalFixed++;
    } else {
      console.log(`ℹ️  No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log(`\n📊 Summary: Fixed syntax errors in ${totalFixed} files`);

// Verify the fixes
console.log("\n🔍 Verifying fixes...");
try {
  const afterCount = execSync(
    'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"',
    {
      encoding: "utf8",
      stdio: "pipe",
    },
  ).trim();

  console.log(`TypeScript errors after fix: ${afterCount}`);
} catch (error) {
  console.log("Could not verify error count");
}
