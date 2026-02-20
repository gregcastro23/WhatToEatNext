#!/usr/bin/env node

/**
 * Fix TS18046 'is of type unknown' Errors
 *
 * This script systematically fixes TS18046 errors by adding proper type assertions
 * for variables that are of type 'unknown'.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get current TS18046 errors
function getTS18046Errors() {
  try {
    const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep "TS18046"', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const errors = [];
    const lines = output.trim().split('\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/^(.+?)\((\d+),(\d+)\): error TS18046: (.+)$/);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          message: match[4]
        });
      }
    }

    return errors;
  } catch (error) {
    console.log('No TS18046 errors found or command failed');
    return [];
  }
}

// Fix 'is of type unknown' errors
function fixUnknownTypeErrors(content, errors) {
  const lines = content.split('\n');
  let modified = false;

  // Group errors by line number
  const errorsByLine = {};
  errors.forEach(error => {
    if (!errorsByLine[error.line]) {
      errorsByLine[error.line] = [];
    }
    errorsByLine[error.line].push(error);
  });

  // Process each line with errors
  Object.keys(errorsByLine).forEach(lineNum => {
    const lineIndex = parseInt(lineNum) - 1;
    if (lineIndex >= 0 && lineIndex < lines.length) {
      let line = lines[lineIndex];
      const lineErrors = errorsByLine[lineNum];

      // Pattern 1: Variable 'x' is of type 'unknown'
      lineErrors.forEach(error => {
        if (error.message.includes("is of type 'unknown'")) {
          const variableMatch = error.message.match(/'([^']+)' is of type 'unknown'/);
          if (variableMatch) {
            const variable = variableMatch[1];

            // Look for common patterns and add type assertions
            const patterns = [
              // Pattern: variable.method() or variable.property
              new RegExp(`\\b${variable}\\.(\\w+)`, 'g'),
              // Pattern: variable as parameter
              new RegExp(`\\b${variable}\\b(?!\\s*as\\s)`, 'g')
            ];

            patterns.forEach((pattern, index) => {
              if (index === 0) {
                // For property/method access, wrap in type assertion
                line = line.replace(pattern, (match, property) => {
                  return `(${variable} as Record<string, unknown>).${property}`;
                });
              } else {
                // For general usage, add type assertion if not already present
                if (!line.includes(`${variable} as`) && !line.includes(`(${variable} as`)) {
                  line = line.replace(pattern, `(${variable} as Record<string, unknown>)`);
                }
              }
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

  return { content: lines.join('\n'), modified };
}

// Process a single file
function processFile(filePath, errors) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileErrors = errors.filter(error => error.file === filePath);

    if (fileErrors.length === 0) {
      return { processed: false, errors: 0 };
    }

    console.log(`Processing ${filePath} (${fileErrors.length} TS18046 errors)`);

    const result = fixUnknownTypeErrors(content, fileErrors);

    if (result.modified) {
      fs.writeFileSync(filePath, result.content);
      console.log(`  ✓ Fixed unknown type patterns in ${filePath}`);
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
  console.log('🔍 Analyzing TS18046 unknown type errors...');

  const errors = getTS18046Errors();
  console.log(`Found ${errors.length} TS18046 errors`);

  if (errors.length === 0) {
    console.log('✅ No TS18046 errors to fix!');
    return;
  }

  // Group errors by file
  const fileErrors = {};
  errors.forEach(error => {
    if (!fileErrors[error.file]) {
      fileErrors[error.file] = [];
    }
    fileErrors[error.file].push(error);
  });

  console.log(`\n📁 Files with TS18046 errors: ${Object.keys(fileErrors).length}`);

  let totalProcessed = 0;
  let totalErrors = 0;

  // Process files with most errors first
  const sortedFiles = Object.keys(fileErrors).sort((a, b) =>
    fileErrors[b].length - fileErrors[a].length
  );

  for (const filePath of sortedFiles.slice(0, 10)) { // Process top 10 files first
    const result = processFile(filePath, fileErrors[filePath]);
    if (result.processed) {
      totalProcessed++;
    }
    totalErrors += result.errors;
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Files processed: ${totalProcessed}`);
  console.log(`  Total TS18046 errors addressed: ${totalErrors}`);

  // Verify the fix
  console.log('\n🔍 Verifying fixes...');
  const remainingErrors = getTS18046Errors();
  const reduction = errors.length - remainingErrors.length;

  console.log(`  Before: ${errors.length} TS18046 errors`);
  console.log(`  After: ${remainingErrors.length} TS18046 errors`);
  console.log(`  Reduction: ${reduction} errors (${Math.round(reduction / errors.length * 100)}%)`);

  if (remainingErrors.length > 0) {
    console.log('\n⚠️  Remaining errors may require manual review');
    console.log('Top remaining error files:');
    const remainingByFile = {};
    remainingErrors.forEach(error => {
      remainingByFile[error.file] = (remainingByFile[error.file] || 0) + 1;
    });

    Object.entries(remainingByFile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([file, count]) => {
        console.log(`  ${file}: ${count} errors`);
      });
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, getTS18046Errors, processFile };
