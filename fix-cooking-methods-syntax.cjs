#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { globSync } = require("glob");

/**
 * Fix Cooking Methods Syntax
 * Specifically targets the corrupted gregsEnergy calculations in cooking method files
 */

class CookingMethodsSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
  }

  async run() {
    console.log("🔧 Starting Cooking Methods Syntax Fixes...");
    console.log("Target: Fix corrupted gregsEnergy calculations");

    try {
      // Get all cooking method files
      const files = globSync("src/data/cooking/methods/**/*.ts", {
        ignore: ["node_modules/**", ".next/**", "dist/**"],
      });

      console.log(`Processing ${files.length} cooking method files...`);

      // Fix each file
      for (const file of files) {
        await this.fixCookingMethodSyntax(file);
      }

      // Also fix other files with similar patterns
      const otherFiles = [
        "src/__tests__/utils/TestMemoryMonitor.ts",
        "src/calculations/alchemicalEngine.ts",
        "src/constants/alchemicalEnergyMapping.ts",
      ];

      for (const file of otherFiles) {
        if (fs.existsSync(file)) {
          await this.fixCookingMethodSyntax(file);
        }
      }

      // Final validation
      await this.validateFixes();

      console.log("✅ Cooking methods syntax fixes completed!");
      this.printSummary();
    } catch (error) {
      console.error("❌ Error during fixing process:", error.message);
      process.exit(1);
    }
  }

  /**
   * Fix cooking method syntax issues
   */
  async fixCookingMethodSyntax(filePath) {
    try {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let modified = false;

      // Fix corrupted gregsEnergy calculations
      const gregsEnergyFixes = [
        // Fix corrupted property access in calculations
        {
          pattern:
            /gregsEnergy:\s*[\d.]+\s*-\s*\(\((\d+(?:\.\d+)?)\s+as\s+any\)\?\.([\d.]+)\s*\|\|\s*0\)\s*\*\s*([\d.]+)/g,
          replacement: (match, num1, num2, num3) => {
            // Calculate the proper gregsEnergy value
            const heat = parseFloat(num1) || 0.65;
            const entropy = parseFloat(num2) || 0.55;
            const reactivity = parseFloat(num3) || 0.2;
            const result = heat - entropy * reactivity;
            return `gregsEnergy: ${result.toFixed(3)} // Calculated using heat - (entropy * reactivity)`;
          },
        },

        // Fix simpler corrupted patterns
        {
          pattern:
            /gregsEnergy:\s*([\d.]+)\s*-\s*\(\(0\s+as\s+any\)\?\.([\d.]+)\s*\|\|\s*0\)\s*\*\s*([\d.]+)/g,
          replacement: (match, heat, entropy, reactivity) => {
            const h = parseFloat(heat);
            const e = parseFloat(entropy);
            const r = parseFloat(reactivity);
            const result = h - e * r;
            return `gregsEnergy: ${result.toFixed(3)} // Calculated using heat - (entropy * reactivity)`;
          },
        },

        // Fix any remaining corrupted property access
        {
          pattern: /\(\((\d+(?:\.\d+)?)\s+as\s+any\)\?\.([\d.]+)\s*\|\|\s*0\)/g,
          replacement: "$2",
        },

        // Fix corrupted object property access
        {
          pattern: /(\w+)\.\(\(/g,
          replacement: "$1.(",
        },

        // Fix corrupted method calls
        {
          pattern: /(\w+)\.(\w+)\.\(/g,
          replacement: "$1.$2(",
        },
      ];

      // Apply gregsEnergy fixes
      for (const fix of gregsEnergyFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      // Fix other common syntax issues
      const generalFixes = [
        // Fix corrupted property access
        {
          pattern: /(\w+)\.(\w+)\.\{\s*[^}]+\s*\}/g,
          replacement: "$1.$2.getCurrentElementalState()",
        },

        // Fix corrupted function calls
        {
          pattern: /(\w+)\.\(\(/g,
          replacement: "$1.(",
        },

        // Fix corrupted assignments
        {
          pattern: /=\s*(\w+)\.\{\s*[^}]+\s*\}/g,
          replacement: "= $1.getCurrentElementalState()",
        },
      ];

      for (const fix of generalFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed syntax in ${filePath}`);
      }
    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log("\n🔍 Validating cooking methods syntax fixes...");

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
        console.log("🎯 All syntax errors fixed! Only semantic errors remain.");
      } else if (syntaxErrors < 100) {
        console.log("🎯 Excellent progress on syntax errors");
      }

      return false;
    }
  }

  /**
   * Print summary of fixes applied
   */
  printSummary() {
    console.log("\n📊 Cooking Methods Syntax Fix Summary:");
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log("\n🎯 Target: Zero TypeScript compilation errors");
    console.log("✅ Cooking methods syntax fixing process completed");
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new CookingMethodsSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = CookingMethodsSyntaxFixer;
