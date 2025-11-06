#!/usr/bin/env node

/**
 * Fix malformed test function signatures
 * Pattern: test('description': any, callback) -> test('description', callback)
 * Pattern: it('description': any, callback) -> it('description', callback)
 */

const fs = require("fs");
const { execSync } = require("child_process");

class MalformedTestSignatureFixer {
  constructor() {
    this.fixedFiles = 0;
    this.totalFixes = 0;
  }

  async run() {
    console.log("🔧 Fixing malformed test function signatures...");

    // Get all TypeScript test files with TS1005 errors
    const errorFiles = await this.getFilesWithTS1005Errors();
    console.log(`📁 Found ${errorFiles.length} files with TS1005 errors`);

    for (const filePath of errorFiles) {
      try {
        const fixed = await this.fixTestSignaturesInFile(filePath);
        if (fixed > 0) {
          this.fixedFiles++;
          this.totalFixes += fixed;
          console.log(`  ✓ Fixed ${fixed} test signature(s) in ${filePath}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Files processed: ${this.fixedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    // Check final error count
    const finalErrors = await this.getTS1005ErrorCount();
    console.log(`   Remaining TS1005 errors: ${finalErrors}`);
  }

  async fixTestSignaturesInFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;

    const content = fs.readFileSync(filePath, "utf8");
    let fixed = content;
    let fixCount = 0;

    // Pattern 1: test('description': any, callback)
    const testPattern =
      /test\(([^)]+): any,\s*([^)]+\) => \{|async \(\) => \{)/g;
    const testMatches = fixed.match(testPattern);
    if (testMatches) {
      fixed = fixed.replace(
        /test\(([^)]+): any,\s*(async \(\) => \{)/g,
        "test($1, $2",
      );
      fixed = fixed.replace(
        /test\(([^)]+): any,\s*(\(\) => \{)/g,
        "test($1, $2",
      );
      fixCount += testMatches.length;
    }

    // Pattern 2: it('description': any, callback)
    const itPattern = /it\(([^)]+): any,\s*([^)]+\) => \{|async \(\) => \{)/g;
    const itMatches = fixed.match(itPattern);
    if (itMatches) {
      fixed = fixed.replace(
        /it\(([^)]+): any,\s*(async \(\) => \{)/g,
        "it($1, $2",
      );
      fixed = fixed.replace(/it\(([^)]+): any,\s*(\(\) => \{)/g, "it($1, $2");
      fixCount += itMatches.length;
    }

    // Pattern 3: describe('description': any, callback)
    const describePattern = /describe\(([^)]+): any,\s*([^)]+\) => \{)/g;
    const describeMatches = fixed.match(describePattern);
    if (describeMatches) {
      fixed = fixed.replace(
        /describe\(([^)]+): any,\s*(\(\) => \{)/g,
        "describe($1, $2",
      );
      fixCount += describeMatches.length;
    }

    // More specific patterns for the exact errors we're seeing
    // Pattern: 'string': any, async () => {
    fixed = fixed.replace(/('[^']*'): any,\s*(async \(\) => \{)/g, "$1, $2");
    fixed = fixed.replace(/("[^"]*"): any,\s*(async \(\) => \{)/g, "$1, $2");
    fixed = fixed.replace(/(`[^`]*`): any,\s*(async \(\) => \{)/g, "$1, $2");

    // Pattern: 'string': any, () => {
    fixed = fixed.replace(/('[^']*'): any,\s*(\(\) => \{)/g, "$1, $2");
    fixed = fixed.replace(/("[^"]*"): any,\s*(\(\) => \{)/g, "$1, $2");
    fixed = fixed.replace(/(`[^`]*`): any,\s*(\(\) => \{)/g, "$1, $2");

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed);
      if (fixCount === 0) fixCount = 1; // At least one fix was made
    }

    return fixCount;
  }

  async getFilesWithTS1005Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort -u',
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
  }

  async getTS1005ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005" || echo "0"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new MalformedTestSignatureFixer();
  fixer.run().catch(console.error);
}

module.exports = MalformedTestSignatureFixer;
