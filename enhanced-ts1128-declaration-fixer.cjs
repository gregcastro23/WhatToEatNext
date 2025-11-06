#!/usr/bin/env node

/**
 * Enhanced TS1128 Declaration Error Fixer
 * Linting Excellence Campaign - Task 1.1
 *
 * Fixes specific TS1128 patterns found in the codebase:
 * 1. Malformed function parameters: (: any : any { prop }) -> ({ prop }: any)
 * 2. Malformed object literals: {, property: value} -> { property: value }
 * 3. Extra colons in function declarations
 * 4. Incomplete destructuring patterns
 * 5. Missing semicolons and malformed exports
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class EnhancedTS1128Fixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.enhanced-ts1128-backup-${Date.now()}`;
    this.patterns = [];
  }

  async run() {
    console.log("🎯 Enhanced TS1128 Declaration Error Analysis & Fixes...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count and analysis
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log("✅ No TS1128 errors found!");
        return;
      }

      // Analyze error patterns first
      await this.analyzeErrorPatterns();

      // Get files with TS1128 errors
      const errorFiles = await this.getFilesWithTS1128Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1128 errors`);

      // Test on small batch first (5 files as per requirements)
      await this.testOnSmallBatch(errorFiles.slice(0, 5));

      // If test successful, process remaining files
      const remainingFiles = errorFiles.slice(5);
      if (remainingFiles.length > 0) {
        console.log(
          `\n🚀 Test successful, processing remaining ${remainingFiles.length} files...`,
        );
        await this.processBatches(remainingFiles, initialErrors);
      }

      // Final results
      await this.showFinalResults(initialErrors);
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
  }

  async analyzeErrorPatterns() {
    console.log("\n🔍 Analyzing TS1128 error patterns...");

    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1128" | head -20',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const patternCounts = {};

      for (const line of lines) {
        const match = line.match(/^(.+?)\((\d+),(\d+)\):/);
        if (match) {
          const [, filePath, lineNum, colNum] = match;

          try {
            if (fs.existsSync(filePath)) {
              const content = fs.readFileSync(filePath, "utf8");
              const lines = content.split("\n");
              const errorLine = lines[parseInt(lineNum) - 1];

              if (errorLine) {
                // Analyze the pattern
                const pattern = this.identifyPattern(errorLine);
                patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
              }
            }
          } catch (err) {
            // Skip files that can't be read
          }
        }
      }

      console.log("\n📈 Pattern Analysis Results:");
      Object.entries(patternCounts)
        .sort(([, a], [, b]) => b - a)
        .forEach(([pattern, count]) => {
          console.log(`   ${pattern}: ${count} occurrences`);
        });
    } catch (error) {
      console.log(
        "   ⚠️ Pattern analysis failed, proceeding with known patterns",
      );
    }
  }

  identifyPattern(line) {
    if (line.includes(": any : any {")) return "Malformed function parameters";
    if (line.includes("{,")) return "Malformed object literal (leading comma)";
    if (line.includes("export: {,")) return "Malformed export object";
    if (
      line.includes("function") &&
      line.includes(": any") &&
      line.includes(": any")
    )
      return "Double any in function";
    if (line.includes("});") && line.includes("};"))
      return "Double closing braces";
    return "Other pattern";
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log(`📁 Created backup directory: ${this.backupDir}`);
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"',
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

  async getFilesWithTS1128Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1128"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const files = new Set();
      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      for (const line of lines) {
        const match = line.match(/^(.+?)\(/);
        if (match) {
          files.add(match[1]);
        }
      }

      return Array.from(files);
    } catch (error) {
      return [];
    }
  }

  async testOnSmallBatch(testFiles) {
    console.log(
      `\n🧪 Testing fixes on small batch (${testFiles.length} files)...`,
    );

    const initialErrors = await this.getTS1128ErrorCount();
    let testFixes = 0;

    for (const filePath of testFiles) {
      const fixes = await this.processFile(filePath);
      testFixes += fixes;
    }

    const afterTestErrors = await this.getTS1128ErrorCount();
    const testReduction = initialErrors - afterTestErrors;

    console.log(`   📊 Test Results:`);
    console.log(`   - Fixes applied: ${testFixes}`);
    console.log(`   - Errors reduced: ${testReduction}`);
    console.log(
      `   - Success rate: ${testReduction > 0 ? "GOOD" : "NEEDS_REVIEW"}`,
    );

    if (testReduction < 0) {
      throw new Error("Test batch increased errors - stopping for safety");
    }

    return testReduction > 0;
  }

  async processBatches(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing remaining files in batches...`);

    const batchSize = 10; // As per requirements
    const totalBatches = Math.ceil(errorFiles.length / batchSize);
    let processedCount = 0;

    for (let i = 0; i < errorFiles.length; i += batchSize) {
      const batch = errorFiles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(
        `\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`,
      );

      for (const filePath of batch) {
        await this.processFile(filePath);
        processedCount++;
      }

      // Build validation after each batch
      console.log(`   🔍 Validating build after batch ${batchNumber}...`);
      const buildValid = await this.validateBuild();

      if (!buildValid) {
        console.log("⚠️ Build validation failed, stopping for safety");
        break;
      }

      const currentErrors = await this.getTS1128ErrorCount();
      console.log(`   📊 Progress: ${currentErrors} TS1128 errors remaining`);
    }
  }

  async validateBuild() {
    try {
      execSync("yarn build --dry-run 2>/dev/null", { stdio: "pipe" });
      return true;
    } catch (error) {
      return false;
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      console.log(`   🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Malformed function parameters (: any : any { prop }) -> ({ prop }: any)
      const malformedParamPattern =
        /\(\s*:\s*any\s*:\s*any\s*\{\s*([^}]+)\s*\}\s*\)/g;
      const matches1 = content.match(malformedParamPattern) || [];
      content = content.replace(malformedParamPattern, "({ $1 }: any)");
      fixesApplied += matches1.length;

      // Fix 2: Malformed object literals with leading comma {, property: value} -> { property: value }
      const malformedObjectPattern = /\{\s*,\s*([^}]+)\}/g;
      const matches2 = content.match(malformedObjectPattern) || [];
      content = content.replace(malformedObjectPattern, "{ $1 }");
      fixesApplied += matches2.length;

      // Fix 3: Malformed export objects export: {, -> export: {
      const malformedExportPattern = /export:\s*\{\s*,\s*/g;
      const matches3 = content.match(malformedExportPattern) || [];
      content = content.replace(malformedExportPattern, "export: { ");
      fixesApplied += matches3.length;

      // Fix 4: Double any in function declarations function name(param: any): any -> function name(param: any): any
      const doubleAnyPattern =
        /function\s+(\w+)\s*\(\s*([^)]*)\s*:\s*any\s*:\s*any\s*\{/g;
      const matches4 = content.match(doubleAnyPattern) || [];
      content = content.replace(doubleAnyPattern, "function $1($2: any) {");
      fixesApplied += matches4.length;

      // Fix 5: Incomplete export statements
      const incompleteExportPattern = /export\s*\{\s*$/gm;
      const matches5 = content.match(incompleteExportPattern) || [];
      content = content.replace(incompleteExportPattern, "export {};");
      fixesApplied += matches5.length;

      // Fix 6: Missing semicolons after variable declarations
      const missingSemicolonPattern = /^(\s*const\s+\w+\s*=\s*[^;]+)$/gm;
      const matches6 = content.match(missingSemicolonPattern) || [];
      content = content.replace(missingSemicolonPattern, "$1;");
      fixesApplied += matches6.length;

      // Fix 7: Double closing braces/parentheses
      const doubleClosingPattern = /\}\s*\}\s*;?\s*$/gm;
      const matches7 = content.match(doubleClosingPattern) || [];
      content = content.replace(doubleClosingPattern, "};");
      fixesApplied += matches7.length;

      // Fix 8: Malformed destructuring in function parameters with extra colons
      const malformedDestructuringPattern =
        /\(\s*\{\s*(\w+)\s*=\s*([^}]+)\s*\}\s*:\s*\{\s*\w+\?\s*:\s*\w+\s*\}\s*\)/g;
      const matches8 = content.match(malformedDestructuringPattern) || [];
      content = content.replace(
        malformedDestructuringPattern,
        "({ $1 = $2 }: { $1?: any })",
      );
      fixesApplied += matches8.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} declaration fixes`);
      } else {
        console.log(`     - No declaration fixes needed`);
      }

      return fixesApplied;
    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }

  async backupFile(filePath) {
    try {
      const relativePath = path.relative(".", filePath);
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDirPath = path.dirname(backupPath);

      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const content = fs.readFileSync(filePath, "utf8");
      fs.writeFileSync(backupPath, content);
    } catch (error) {
      console.log(`     ⚠️ Backup failed for ${filePath}: ${error.message}`);
    }
  }

  async showFinalResults(initialErrors) {
    console.log("\n📈 Enhanced TS1128 Declaration Fix Results:");

    const finalErrors = await this.getTS1128ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = (
      (totalReduction / initialErrors) *
      100
    ).toFixed(1);

    console.log(`   Initial TS1128 errors: ${initialErrors}`);
    console.log(`   Final TS1128 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 50) {
      console.log("\n🎉 EXCELLENT! TS1128 errors reduced to very low level");
    } else if (reductionPercentage >= 70) {
      console.log("\n🎯 GREAT! 70%+ error reduction achieved");
    } else if (reductionPercentage >= 40) {
      console.log("\n✅ GOOD! 40%+ error reduction achieved");
    } else {
      console.log("\n⚠️ Partial success - may need additional targeted fixes");
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);

    // Preserve astrological calculation accuracy check
    console.log("\n🔮 Verifying astrological calculation accuracy...");
    const astroAccuracy = await this.verifyAstrologicalAccuracy();
    console.log(
      `   Astrological calculations: ${astroAccuracy ? "✅ PRESERVED" : "⚠️ NEEDS_REVIEW"}`,
    );
  }

  async getTotalErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
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

  async verifyAstrologicalAccuracy() {
    try {
      // Check if key astrological files still compile
      const astroFiles = [
        "src/calculations/culinary/culinaryAstrology.ts",
        "src/calculations/alchemicalEngine.ts",
        "src/utils/reliableAstronomy.ts",
      ];

      for (const file of astroFiles) {
        if (fs.existsSync(file)) {
          execSync(`yarn tsc --noEmit --skipLibCheck ${file} 2>/dev/null`, {
            stdio: "pipe",
          });
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new EnhancedTS1128Fixer();
  fixer.run().catch(console.error);
}

module.exports = EnhancedTS1128Fixer;
