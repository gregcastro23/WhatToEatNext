#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { globSync } = require("glob");

/**
 * Fix Malformed Expressions Script
 * Fixes the specific pattern: this.((property as any)?.value || 0) * 0.2
 * and similar malformed property access patterns
 */

class MalformedExpressionFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.backupDir = ".malformed-expression-backup";
  }

  async run() {
    console.log("🔧 Starting Malformed Expression Fixing...");
    console.log("Target: Fix malformed property access patterns");

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
        await this.fixMalformedExpressions(file);
      }

      // Final validation
      await this.validateFixes();

      console.log("✅ Malformed expression fixing completed!");
      this.printSummary();
    } catch (error) {
      console.error("❌ Error during fixing process:", error.message);
      process.exit(1);
    }
  }

  /**
   * Fix malformed expressions in a file
   */
  async fixMalformedExpressions(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let modified = false;

      // Pattern 1: this.((property as any)?.value || 0) * 0.2
      const thisPattern =
        /this\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))\s*\*\s*([\d.]+)/g;
      const newContent1 = content.replace(
        thisPattern,
        (match, expr, multiplier) => {
          // Extract the property name and access path
          const propMatch = expr.match(
            /\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/,
          );
          if (propMatch) {
            const [, propName, accessPath, fallback] = propMatch;
            return `((this.${propName} as any)?.${accessPath} || ${fallback}) * ${multiplier}`;
          }
          return match;
        },
      );
      if (newContent1 !== content) {
        content = newContent1;
        modified = true;
      }

      // Pattern 2: object.((property as any)?.value || 0) * 0.2
      const objectPattern =
        /(\w+)\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))\s*\*\s*([\d.]+)/g;
      const newContent2 = content.replace(
        objectPattern,
        (match, obj, expr, multiplier) => {
          // Extract the property name and access path
          const propMatch = expr.match(
            /\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/,
          );
          if (propMatch) {
            const [, propName, accessPath, fallback] = propMatch;
            return `((${obj}.${propName} as any)?.${accessPath} || ${fallback}) * ${multiplier}`;
          }
          return match;
        },
      );
      if (newContent2 !== content) {
        content = newContent2;
        modified = true;
      }

      // Pattern 3: Simple malformed property access without multiplication
      const simplePattern =
        /(\w+)\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))/g;
      const newContent3 = content.replace(simplePattern, (match, obj, expr) => {
        // Extract the property name and access path
        const propMatch = expr.match(
          /\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/,
        );
        if (propMatch) {
          const [, propName, accessPath, fallback] = propMatch;
          return `((${obj}.${propName} as any)?.${accessPath} || ${fallback})`;
        }
        return match;
      });
      if (newContent3 !== content) {
        content = newContent3;
        modified = true;
      }

      // Pattern 4: Fix weight property access specifically
      const weightPattern =
        /weight:\s*this\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))\s*\*\s*([\d.]+)/g;
      const newContent4 = content.replace(
        weightPattern,
        (match, expr, multiplier) => {
          // Extract the property name and access path
          const propMatch = expr.match(
            /\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/,
          );
          if (propMatch) {
            const [, propName, accessPath, fallback] = propMatch;
            return `weight: ((this.${propName} as any)?.${accessPath} || ${fallback}) * ${multiplier}`;
          }
          return match;
        },
      );
      if (newContent4 !== content) {
        content = newContent4;
        modified = true;
      }

      // Pattern 5: Fix complex expressions with multiple operations
      const complexPattern =
        /(\w+)\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))\s*\*\s*([\d.]+)\s*[-+]\s*(\w+)\.(\(\([^)]+\s+as\s+any\)\?\.[^)]+\s*\|\|\s*[^)]+\))\s*\*\s*([\d.]+)/g;
      const newContent5 = content.replace(
        complexPattern,
        (match, obj1, expr1, mult1, obj2, expr2, mult2) => {
          // Fix both expressions
          const fixExpr = (obj, expr) => {
            const propMatch = expr.match(
              /\(\((\w+)\s+as\s+any\)\?\.([\w.]+)\s*\|\|\s*([^)]+)\)/,
            );
            if (propMatch) {
              const [, propName, accessPath, fallback] = propMatch;
              return `((${obj}.${propName} as any)?.${accessPath} || ${fallback})`;
            }
            return expr;
          };

          const fixed1 = fixExpr(obj1, expr1);
          const fixed2 = fixExpr(obj2, expr2);

          // Determine the operator (+ or -)
          const operator = match.includes(" - ") ? " - " : " + ";

          return `${fixed1} * ${mult1}${operator}${fixed2} * ${mult2}`;
        },
      );
      if (newContent5 !== content) {
        content = newContent5;
        modified = true;
      }

      if (modified) {
        // Create backup
        const backupPath = path.join(this.backupDir, path.basename(filePath));
        fs.writeFileSync(backupPath, originalContent);

        // Write fixed content
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed malformed expressions in ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log("\n🔍 Validating expression fixes...");

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
    console.log("\n📊 Malformed Expression Fix Summary:");
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log(`Backup directory: ${this.backupDir}`);
    console.log("\n🎯 Target: Zero TypeScript compilation errors");
    console.log("✅ Malformed expression fixing process completed");
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new MalformedExpressionFixer();
  fixer.run().catch(console.error);
}

module.exports = MalformedExpressionFixer;
