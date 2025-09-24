#!/usr/bin/env node

/**
 * Fix Test Syntax Errors
 *
 * Fixes malformed test function signatures and catch blocks
 * that were introduced during previous cleanup attempts
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class TestSyntaxFixer {
  constructor() {
    this.fixedFiles = 0;
    this.fixedIssues = 0;
  }

  async execute() {
    console.log('🔧 Fixing test syntax errors...');

    const testFiles = glob.sync('src/**/*.test.{ts,tsx}', {
      ignore: ['node_modules/**']
    });

    for (const file of testFiles) {
      await this.fixFile(file);
    }

    console.log(`✅ Fixed ${this.fixedIssues} syntax issues in ${this.fixedFiles} files`);
  }

  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modified = content;
      let fileFixCount = 0;

      // Fix malformed test function signatures
      modified = modified.replace(
        /(\s+)(it|test)\s*\(\s*'([^']+)'\s*:\s*any\s*,\s*(async\s*)?\(\s*\)\s*=>\s*{/g,
        (match, indent, testType, testName, asyncKeyword) => {
          fileFixCount++;
          return `${indent}${testType}('${testName}', ${asyncKeyword || ''}() => {`;
        }
      );

      // Fix malformed catch blocks
      modified = modified.replace(
        /}\s*catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*{/g,
        (match, errorParam) => {
          fileFixCount++;
          return `} catch (${errorParam}: any) {`;
        }
      );

      // Fix malformed Object.entries forEach calls
      modified = modified.replace(
        /Object\.entries\([^)]+\s*\|\|\s*\[\]\s*\)\.forEach\(\(\[\s*([^:]+)\s*:\s*any\s*,\s*([^:]+)\s*\]\s*:\s*any\)\s*=>/g,
        (match, key, value) => {
          fileFixCount++;
          return `Object.entries($1 || {}).forEach(([${key}, ${value}]: [string, any]) =>`;
        }
      );

      // Fix malformed date strings
      modified = modified.replace(
        /'(\d{4}-\d{2}-\d{2}T\d{2}):\s*(\d+)\s*,\s*(\d+):(\d{2}Z)'/g,
        (match, datePart, hour, minute, endPart) => {
          fileFixCount++;
          return `'${datePart}:${hour.padStart(2, '0')}:${minute.padStart(2, '0')}${endPart}'`;
        }
      );

      if (fileFixCount > 0) {
        fs.writeFileSync(filePath, modified);
        this.fixedFiles++;
        this.fixedIssues += fileFixCount;
        console.log(`  Fixed ${fileFixCount} issues in ${filePath}`);
      }

    } catch (error) {
      console.warn(`  Warning: Could not process ${filePath}: ${error.message}`);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new TestSyntaxFixer();

  fixer.execute()
    .then(() => {
      console.log('🎉 Test syntax fixing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Syntax fixing failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestSyntaxFixer;
