#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { globSync } = require("glob");

/**
 * Fix Remaining Syntax Errors Script
 * Comprehensive fix for all remaining malformed patterns
 */

class RemainingSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.backupDir = ".remaining-syntax-backup";
  }

  async run() {
    console.log("🔧 Starting Remaining Syntax Error Fixing...");
    console.log("Target: Fix all remaining malformed patterns");

    try {
      // Create backup directory
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Get all TypeScript files
      const files = globSync("src/**/*.{ts,tsx}", {
        ignore: ["node_modules/**", ".next/**", "dist/**"],
      });

      console.log(`Processing ${files.length} TypeScript files...`);

      // Fix each file
      for (const file of files) {
        await this.fixRemainingSyntax(file);
      }

      // Final validation
      await this.validateFixes();

      console.log("✅ Remaining syntax error fixing completed!");
      this.printSummary();
    } catch (error) {
      console.error("❌ Error during fixing process:", error.message);
      process.exit(1);
    }
  }

  /**
   * Fix remaining syntax errors in a file
   */
  async fixRemainingSyntax(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let modified = false;

      // Pattern 1: Malformed decimal access like ((0 as any)?.5 || 0)
      const malformedDecimalPattern =
        /\(\(0\s+as\s+any\)\?\.\s*(\d+(?:\.\d+)?)\s*\|\|\s*0\)/g;
      const newContent1 = content.replace(
        malformedDecimalPattern,
        (match, decimal) => {
          return `0.${decimal}`;
        },
      );
      if (newContent1 !== content) {
        content = newContent1;
        modified = true;
      }

      // Pattern 2: Malformed method calls like this.{ Fire: 0.25, ... }
      const malformedThisPattern =
        /this\.\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}/g;
      const newContent2 = content.replace(
        malformedThisPattern,
        "{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }",
      );
      if (newContent2 !== content) {
        content = newContent2;
        modified = true;
      }

      // Pattern 3: Malformed static calls like ClassName.{ Fire: 0.25, ... }
      const malformedStaticPattern =
        /(\w+)\.\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}/g;
      const newContent3 = content.replace(
        malformedStaticPattern,
        "{ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }",
      );
      if (newContent3 !== content) {
        content = newContent3;
        modified = true;
      }

      // Pattern 4: Malformed function signatures like function { Fire: 0.25, ... }: Type
      const malformedFunctionPattern =
        /function\s+\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}:\s*(\w+)/g;
      const newContent4 = content.replace(
        malformedFunctionPattern,
        "function getDefaultElementalProperties(): $1",
      );
      if (newContent4 !== content) {
        content = newContent4;
        modified = true;
      }

      // Pattern 5: Malformed export function signatures
      const malformedExportPattern =
        /export\s+function\s+\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}:\s*(\w+)/g;
      const newContent5 = content.replace(
        malformedExportPattern,
        "export function getDefaultElementalProperties(): $1",
      );
      if (newContent5 !== content) {
        content = newContent5;
        modified = true;
      }

      // Pattern 6: Malformed object method signatures
      const malformedMethodPattern =
        /\s+\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}:\s*(\w+)\s*\{/g;
      const newContent6 = content.replace(
        malformedMethodPattern,
        "  getDefaultElementalProperties(): $1 {",
      );
      if (newContent6 !== content) {
        content = newContent6;
        modified = true;
      }

      // Pattern 7: Fix broken conditional expressions
      const brokenConditionalPattern = /\?\s*\.\s*(\w+)/g;
      const newContent7 = content.replace(brokenConditionalPattern, "?.$1");
      if (newContent7 !== content) {
        content = newContent7;
        modified = true;
      }

      // Pattern 8: Fix broken spread operators
      const brokenSpreadPattern =
        /\.\.\.\(\(\$(\w+)\s+as\s+any\)\s*\|\|\s*\{\}\)/g;
      const newContent8 = content.replace(
        brokenSpreadPattern,
        "...(($1 as any) || {})",
      );
      if (newContent8 !== content) {
        content = newContent8;
        modified = true;
      }

      // Pattern 9: Fix malformed type assertions
      const malformedTypeAssertionPattern = /as\s+unknown\s+as\s+unknown/g;
      const newContent9 = content.replace(
        malformedTypeAssertionPattern,
        "as any",
      );
      if (newContent9 !== content) {
        content = newContent9;
        modified = true;
      }

      // Pattern 10: Fix broken Record patterns
      const brokenRecordPattern = /Record<string,\s*unknown>\s*\?\./g;
      const newContent10 = content.replace(
        brokenRecordPattern,
        "Record<string, unknown>)?.",
      );
      if (newContent10 !== content) {
        content = newContent10;
        modified = true;
      }

      if (modified) {
        // Create backup
        const backupPath = path.join(this.backupDir, path.basename(filePath));
        fs.writeFileSync(backupPath, originalContent);

        // Write fixed content
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed remaining syntax errors in ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log("\n🔍 Validating remaining syntax fixes...");

    try {
      execSync("yarn tsc --noEmit --skipLibCheck", {
        encoding: "utf8",
        stdio: "pipe",
      });

      console.log(
        "✅ TypeScript compilation successful - Zero errors achieved!",
      );
      return true;
    } catch (error) {
      const errorCount = (error.stdout.match(/error TS/g) || []).length;
      console.log(`⚠️  ${errorCount} TypeScript errors remaining`);

      // Get error breakdown
      const syntaxErrors = (
        error.stdout.match(
          /error TS1005|error TS1003|error TS1128|error TS1068|error TS1434/g,
        ) || []
      ).length;
      const otherErrors = errorCount - syntaxErrors;

      console.log(`  - Syntax errors: ${syntaxErrors}`);
      console.log(`  - Other errors: ${otherErrors}`);

      if (syntaxErrors === 0) {
        console.log("🎯 All syntax errors fixed!");
      } else if (syntaxErrors < 50) {
        console.log("🎯 Significant progress on syntax errors");
      }

      return syntaxErrors === 0;
    }
  }

  /**
   * Print summary of fixes applied
   */
  printSummary() {
    console.log("\n📊 Remaining Syntax Fix Summary:");
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log(`Backup directory: ${this.backupDir}`);
    console.log("\n🎯 Target: Zero TypeScript compilation errors");
    console.log("✅ Remaining syntax fixing process completed");
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new RemainingSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = RemainingSyntaxFixer;
