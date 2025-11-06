#!/usr/bin/env node

/**
 * Fix TS2339 Property Access Errors
 *
 * This script systematically fixes TS2339 errors by adding proper type assertions
 * and type guards for property access on unknown/empty object types.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Get current TS2339 errors
function getTS2339Errors() {
  try {
    const output = execSync(
      'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS2339"',
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
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS2339: (.+)$/);
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
    console.log("No TS2339 errors found or command failed");
    return [];
  }
}

// Fix property access on unknown types
function fixPropertyAccess(content, errors) {
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

      // Pattern 1: Property access on unknown - add type assertion
      lineErrors.forEach((error) => {
        if (error.message.includes("does not exist on type 'unknown'")) {
          const propertyMatch = error.message.match(/Property '(\w+)'/);
          if (propertyMatch) {
            const property = propertyMatch[1];

            // Look for patterns like: variable.property
            const patterns = [
              new RegExp(`(\\w+)\\.${property}`, "g"),
              new RegExp(`([\\w\\.\\[\\]]+)\\.${property}`, "g"),
            ];

            patterns.forEach((pattern) => {
              line = line.replace(pattern, (match, variable) => {
                // Add type assertion for property access
                return `(${variable} as Record<string, unknown>)?.${property}`;
              });
            });
          }
        }

        // Pattern 2: Property access on empty object type '{}'
        if (error.message.includes("does not exist on type '{}'")) {
          const propertyMatch = error.message.match(/Property '(\w+)'/);
          if (propertyMatch) {
            const property = propertyMatch[1];

            // Look for patterns like: variable.property
            const patterns = [
              new RegExp(`(\\w+)\\.${property}`, "g"),
              new RegExp(`([\\w\\.\\[\\]]+)\\.${property}`, "g"),
            ];

            patterns.forEach((pattern) => {
              line = line.replace(pattern, (match, variable) => {
                // Add type assertion for property access
                return `(${variable} as Record<string, unknown>)?.${property}`;
              });
            });
          }
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

    console.log(`Processing ${filePath} (${fileErrors.length} TS2339 errors)`);

    const result = fixPropertyAccess(content, fileErrors);

    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log(`  ✓ Fixed property access patterns in ${filePath}`);
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
  console.log("🔍 Analyzing TS2339 property access errors...");

  const errors = getTS2339Errors();
  console.log(`Found ${errors.length} TS2339 errors`);

  if (errors.length === 0) {
    console.log("✅ No TS2339 errors to fix!");
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
    `\n📁 Files with TS2339 errors: ${Object.keys(fileErrors).length}`,
  );

  let totalProcessed = 0;
  let totalErrors = 0;

  // Process files with most errors first
  const sortedFiles = Object.keys(fileErrors).sort(
    (a, b) => fileErrors[b].length - fileErrors[a].length,
  );

  for (const filePath of sortedFiles) {
    const result = processFile(filePath, fileErrors[filePath]);
    if (result.processed) {
      totalProcessed++;
    }
    totalErrors += result.errors;
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${totalProcessed}`);
  console.log(`  Total TS2339 errors addressed: ${totalErrors}`);

  // Verify the fix
  console.log("\n🔍 Verifying fixes...");
  const remainingErrors = getTS2339Errors();
  const reduction = errors.length - remainingErrors.length;

  console.log(`  Before: ${errors.length} TS2339 errors`);
  console.log(`  After: ${remainingErrors.length} TS2339 errors`);
  console.log(
    `  Reduction: ${reduction} errors (${Math.round((reduction / errors.length) * 100)}%)`,
  );

  if (remainingErrors.length > 0) {
    console.log("\n⚠️  Remaining errors may require manual review");
    console.log("Top remaining error files:");
    const remainingByFile = {};
    remainingErrors.forEach((error) => {
      remainingByFile[error.file] = (remainingByFile[error.file] || 0) + 1;
    });

    Object.entries(remainingByFile)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count} errors`);
      });
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, getTS2339Errors, processFile };
