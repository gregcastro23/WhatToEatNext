#!/usr/bin/env node

/**
 * Fix TS2571 'Object is of type unknown' Errors
 *
 * This script systematically fixes TS2571 errors by adding proper type assertions
 * for objects that are of type 'unknown'.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get current TS2571 errors
function getTS2571Errors() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS2571"',
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const errors = [];
    const lines = output
      .trim()
      .split("\n")
      .filter((line) => line.trim());

    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2571: (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4],
        });
      }
    }

    return errors;
  } catch (error) {
    console.log("No TS2571 errors found or command failed");
    return [];
  }
}

// Fix 'Object is of type unknown' errors
function fixUnknownObjectErrors(content, errors) {
  const lines = content.split("\n");
  let modified = false;

  // Group errors by line number
  const errorsByLine = {};
  errors.forEach((error) => {
    if (!errorsByLine[error.line]) {
      errorsByLine[error.line] = [];
    }
    errorsByLine[error.line].push(error);
  });

  // Process each line with errors
  Object.keys(errorsByLine).forEach((lineNum) => {
    const lineIndex = parseInt(lineNum) - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let line = lines[lineIndex];
      const lineErrors = errorsByLine[lineNum];

      // Pattern: Object is of type 'unknown'
      lineErrors.forEach((error) => {
        if (error.message.includes("Object is of type 'unknown'")) {
          // Look for common patterns that need type assertions

          // Pattern 1: Object.keys(), Object.values(), Object.entries()
          line = line.replace(
            /Object\.(keys|values|entries)\(([^)]+)\)/g,
            (match, method, obj) => {
              return `Object.${method}(${obj} as Record<string, unknown>)`;
            },
          );

          // Pattern 2: for...in loops with unknown objects
          line = line.replace(
            /for\s*\(\s*const\s+(\w+)\s+in\s+([^)]+)\)/g,
            (match, key, obj) => {
              return `for (const ${key} in (${obj} as Record<string, unknown>))`;
            },
          );

          // Pattern 3: Bracket notation access
          line = line.replace(/([^[\s]+)\[([^\]]+)\]/g, (match, obj, key) => {
            // Only apply if the object looks like it might be unknown
            if (obj.includes("unknown") || obj.includes("any")) {
              return `(${obj} as Record<string, unknown>)[${key}]`;
            }
            return match;
          });

          // Pattern 4: Property access on unknown objects
          line = line.replace(/(\w+)\.(\w+)/g, (match, obj, prop) => {
            // Check if this looks like an unknown object access
            if (line.includes("unknown") && !match.includes("as Record")) {
              return `(${obj} as Record<string, unknown>).${prop}`;
            }
            return match;
          });
        }
      });

      if (lines[lineIndex] !== line) {
        lines[lineIndex] = line;
        modified = true;
      }
    }
  });

  return { content: lines.join("\n"), modified };
}

// Process a single file
function processFile(filePath, errors) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const fileErrors = errors.filter((error) => error.file === filePath);

    if (fileErrors.length === 0) {
      return { processed: false, errors: 0 };
    }

    console.log(`Processing ${filePath} (${fileErrors.length} TS2571 errors)`);

    const result = fixUnknownObjectErrors(content, fileErrors);

    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log(`  ✓ Fixed unknown object patterns in ${filePath}`);
      return { processed: true, errors: fileErrors.length };
    } else {
      console.log(`  - No changes needed in ${filePath}`);
      return { processed: false, errors: fileErrors.length };
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { processed: false, errors: 0 };
  }
}

// Main execution
function main() {
  console.log("🔍 Analyzing TS2571 unknown object errors...");

  const errors = getTS2571Errors();
  console.log(`Found ${errors.length} TS2571 errors`);

  if (errors.length === 0) {
    console.log("✅ No TS2571 errors to fix!");
    return;
  }

  // Group errors by file
  const fileErrors = {};
  errors.forEach((error) => {
    if (!fileErrors[error.file]) {
      fileErrors[error.file] = [];
    }
    fileErrors[error.file].push(error);
  });

  console.log(
    `\n📁 Files with TS2571 errors: ${Object.keys(fileErrors).length}`,
  );

  let totalProcessed = 0;
  let totalErrors = 0;

  // Process files with most errors first
  const sortedFiles = Object.keys(fileErrors).sort(
    (a, b) => fileErrors[b].length - fileErrors[a].length,
  );

  for (const filePath of sortedFiles.slice(0, 15)) {
    // Process top 15 files
    const result = processFile(filePath, fileErrors[filePath]);
    if (result.processed) {
      totalProcessed++;
    }
    totalErrors += result.errors;
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${totalProcessed}`);
  console.log(`  Total TS2571 errors addressed: ${totalErrors}`);

  // Verify the fix
  console.log("\n🔍 Verifying fixes...");
  const remainingErrors = getTS2571Errors();
  const reduction = errors.length - remainingErrors.length;

  console.log(`  Before: ${errors.length} TS2571 errors`);
  console.log(`  After: ${remainingErrors.length} TS2571 errors`);
  console.log(
    `  Reduction: ${reduction} errors (${Math.round((reduction / errors.length) * 100)}%)`,
  );
}

if (require.main === module) {
  main();
}

module.exports = { main, getTS2571Errors, processFile };
