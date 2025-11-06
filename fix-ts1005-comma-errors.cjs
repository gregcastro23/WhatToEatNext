#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Specialized script to fix TS1005 comma and expression syntax errors
 * Focuses on function parameters, object literals, array expressions, and catch blocks
 */

class TS1005ErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.patterns = [
      // Fix catch block syntax: } catch (error): any { -> } catch (error) {
      {
        pattern: /\}\s*catch\s*\(\s*([^)]+)\)\s*:\s*any\s*\{/g,
        replacement: "} catch ($1) {",
        description: "Fix catch block syntax",
      },

      // Fix test function syntax: test('...', any, async () => { -> test('...', async () => {
      {
        pattern:
          /test\s*\(\s*(['"][^'"]*['"])\s*,\s*any\s*,\s*(async\s*\(\s*\)\s*=>\s*\{)/g,
        replacement: "test($1, $2",
        description: "Fix test function syntax",
      },

      // Fix describe function syntax: describe('...', any, () => { -> describe('...', () => {
      {
        pattern:
          /describe\s*\(\s*(['"][^'"]*['"])\s*,\s*any\s*,\s*(\(\s*\)\s*=>\s*\{)/g,
        replacement: "describe($1, $2",
        description: "Fix describe function syntax",
      },

      // Fix malformed date strings with spaces: 'T16: 2, 0:00Z' -> 'T16:20:00Z'
      {
        pattern: /'(\d{4}-\d{2}-\d{2}T\d{2}):\s*(\d+),\s*(\d+):(\d{2}Z)'/g,
        replacement: "'$1:$2:$3'",
        description: "Fix malformed date strings",
      },

      // Fix object literal syntax issues: { key: value, } -> { key: value }
      {
        pattern: /\{\s*([^}]+),\s*\}/g,
        replacement: (match, content) => {
          // Only fix if it's a simple trailing comma issue
          if (
            content.includes(":") &&
            !content.includes("{") &&
            !content.includes("[")
          ) {
            return `{ ${content.trim()} }`;
          }
          return match;
        },
        description: "Fix object literal trailing commas",
      },

      // Fix array literal syntax issues: [ item, ] -> [ item ]
      {
        pattern: /\[\s*([^\]]+),\s*\]/g,
        replacement: (match, content) => {
          // Only fix if it's a simple trailing comma issue
          if (!content.includes("[") && !content.includes("{")) {
            return `[ ${content.trim()} ]`;
          }
          return match;
        },
        description: "Fix array literal trailing commas",
      },

      // Fix function parameter syntax: function(param,) -> function(param)
      {
        pattern: /\(\s*([^)]+),\s*\)/g,
        replacement: (match, params) => {
          // Only fix if it's a simple trailing comma in parameters
          if (
            !params.includes("(") &&
            !params.includes("{") &&
            !params.includes("[")
          ) {
            return `(${params.trim()})`;
          }
          return match;
        },
        description: "Fix function parameter trailing commas",
      },

      // Fix try-catch syntax issues: try: -> try {
      {
        pattern: /try\s*:\s*/g,
        replacement: "try {",
        description: "Fix try block syntax",
      },

      // Fix generic type syntax: <Type,> -> <Type>
      {
        pattern: /<\s*([^>]+),\s*>/g,
        replacement: (match, type) => {
          // Only fix if it's a simple trailing comma in generics
          if (
            !type.includes("<") &&
            !type.includes("{") &&
            !type.includes("[")
          ) {
            return `<${type.trim()}>`;
          }
          return match;
        },
        description: "Fix generic type trailing commas",
      },
    ];
  }

  async getTS1005ErrorFiles() {
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
        // grep exit code 1 means no matches found
        return [];
      }
      throw error;
    }
  }

  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    let fileFixCount = 0;

    // Apply each pattern
    this.patterns.forEach(({ pattern, replacement, description }) => {
      const beforeLength = content.length;

      if (typeof replacement === "function") {
        content = content.replace(pattern, replacement);
      } else {
        content = content.replace(pattern, replacement);
      }

      const afterLength = content.length;
      if (beforeLength !== afterLength) {
        fileFixCount++;
        console.log(`  ✓ Applied: ${description}`);
      }
    });

    // Additional specific fixes for common patterns
    content = this.applySpecificFixes(content, filePath);

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      this.fixedFiles.push(filePath);
      this.totalFixes += fileFixCount;
      console.log(`✅ Fixed ${fileFixCount} patterns in: ${filePath}`);
      return true;
    }

    return false;
  }

  applySpecificFixes(content, filePath) {
    let modified = content;

    // Fix specific test file patterns
    if (filePath.includes(".test.") || filePath.includes("__tests__")) {
      // Fix expect statements with trailing commas
      modified = modified.replace(/expect\s*\(\s*([^)]+),\s*\)/g, "expect($1)");

      // Fix beforeEach/afterEach with incorrect syntax
      modified = modified.replace(
        /(beforeEach|afterEach)\s*\(\s*any\s*,\s*(async\s*\(\s*\)\s*=>\s*\{)/g,
        "$1($2",
      );
    }

    // Fix import/export statements with trailing commas
    modified = modified.replace(
      /import\s*\{\s*([^}]+),\s*\}\s*from/g,
      "import { $1 } from",
    );
    modified = modified.replace(
      /export\s*\{\s*([^}]+),\s*\}/g,
      "export { $1 }",
    );

    // Fix type annotations with incorrect syntax
    modified = modified.replace(/:\s*any\s*\{/g, " {");
    modified = modified.replace(/\)\s*:\s*any\s*\{/g, ") {");

    return modified;
  }

  async validateBuild() {
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

  async run() {
    console.log("🚀 Starting TS1005 Comma and Expression Error Fixes");
    console.log("==================================================");

    // Get current error count
    const initialErrorFiles = await this.getTS1005ErrorFiles();
    console.log(
      `📊 Found ${initialErrorFiles.length} files with TS1005 errors`,
    );

    if (initialErrorFiles.length === 0) {
      console.log("🎉 No TS1005 errors found!");
      return;
    }

    // Process files in batches
    const batchSize = 15;
    let processedCount = 0;

    for (let i = 0; i < initialErrorFiles.length; i += batchSize) {
      const batch = initialErrorFiles.slice(i, i + batchSize);
      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} files):`,
      );

      // Process each file in the batch
      batch.forEach((filePath, index) => {
        console.log(
          `\n[${processedCount + index + 1}/${initialErrorFiles.length}] Processing: ${filePath}`,
        );
        this.fixFile(filePath);
      });

      processedCount += batch.length;

      // Validate build after each batch
      const buildSuccess = await this.validateBuild();
      if (!buildSuccess) {
        console.log(
          "⚠️  Build validation failed, stopping to prevent further issues",
        );
        break;
      }

      console.log(
        `✅ Batch ${Math.floor(i / batchSize) + 1} completed successfully`,
      );
    }

    // Final summary
    console.log("\n📈 FINAL SUMMARY");
    console.log("================");
    console.log(`Files processed: ${processedCount}`);
    console.log(`Files modified: ${this.fixedFiles.length}`);
    console.log(`Total fixes applied: ${this.totalFixes}`);

    // Check final error count
    const finalErrorFiles = await this.getTS1005ErrorFiles();
    const reduction = initialErrorFiles.length - finalErrorFiles.length;
    const reductionPercent =
      initialErrorFiles.length > 0
        ? ((reduction / initialErrorFiles.length) * 100).toFixed(1)
        : 0;

    console.log(`\n📊 Error Reduction:`);
    console.log(`Initial TS1005 errors: ${initialErrorFiles.length} files`);
    console.log(`Final TS1005 errors: ${finalErrorFiles.length} files`);
    console.log(`Reduction: ${reduction} files (${reductionPercent}%)`);

    if (finalErrorFiles.length > 0) {
      console.log("\n🔍 Remaining error files:");
      finalErrorFiles
        .slice(0, 10)
        .forEach((file) => console.log(`  - ${file}`));
      if (finalErrorFiles.length > 10) {
        console.log(`  ... and ${finalErrorFiles.length - 10} more`);
      }
    }

    console.log("\n✅ TS1005 comma and expression fixes completed!");
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new TS1005ErrorFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005ErrorFixer;
