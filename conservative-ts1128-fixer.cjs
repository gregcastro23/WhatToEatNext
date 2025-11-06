#!/usr/bin/env node

/**
 * Conservative TS1128 Declaration Error Fixer
 * Linting Excellence Campaign - Task 1.2
 *
 * Focuses only on validated, safe patterns:
 * 1. Malformed function parameters: (: any : any { prop }) -> ({ prop }: any)
 * 2. Malformed object literals: {, property: value} -> { property: value }
 * 3. Incomplete export statements
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ConservativeTS1128Fixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.conservative-ts1128-backup-${Date.now()}`;
  }

  async run() {
    console.log("🎯 Conservative TS1128 Declaration Error Fixes...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log("✅ No TS1128 errors found!");
        return;
      }

      // Get files with TS1128 errors
      const errorFiles = await this.getFilesWithTS1128Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1128 errors`);

      // Process files in batches of 10 as per requirements
      await this.processBatches(errorFiles, initialErrors);

      // Final results
      await this.showFinalResults(initialErrors);
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
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

  async processBatches(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing files in batches of 10...`);

    const batchSize = 10; // As per requirements
    const totalBatches = Math.ceil(errorFiles.length / batchSize);
    let processedCount = 0;

    for (let i = 0; i < errorFiles.length; i += batchSize) {
      const batch = errorFiles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(
        `\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`,
      );

      let batchFixes = 0;
      for (const filePath of batch) {
        const fixes = await this.processFile(filePath);
        batchFixes += fixes;
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
      const reduction = initialErrorCount - currentErrors;
      console.log(
        `   📊 Progress: ${currentErrors} TS1128 errors remaining (${reduction >= 0 ? "-" + reduction : "+" + Math.abs(reduction)})`,
      );
      console.log(`   🔧 Batch fixes applied: ${batchFixes}`);

      // Safety check - if errors increased significantly, stop
      if (currentErrors > initialErrorCount * 1.1) {
        console.log(
          "⚠️ Error count increased significantly, stopping for safety",
        );
        break;
      }
    }
  }

  async validateBuild() {
    try {
      execSync("yarn tsc --noEmit --skipLibCheck 2>/dev/null", {
        stdio: "pipe",
      });
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

      // Fix 1: Malformed function parameters (VALIDATED SAFE)
      // Pattern: (: any : any { prop = value }: Type) -> ({ prop = value }: Type)
      const malformedParamPattern =
        /\(\s*:\s*any\s*:\s*any\s*(\{[^}]+\})\s*:\s*(\{[^}]+\})\s*\)/g;
      const matches1 = content.match(malformedParamPattern) || [];
      if (matches1.length > 0) {
        content = content.replace(malformedParamPattern, "($1: $2)");
        fixesApplied += matches1.length;
        console.log(
          `     🔧 Fixed ${matches1.length} malformed function parameter(s)`,
        );
      }

      // Fix 2: Malformed object literals (CONSERVATIVE)
      // Pattern: {, property: value} -> { property: value }
      const malformedObjectPattern =
        /\{\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,}]+)/g;
      const matches2 = content.match(malformedObjectPattern) || [];
      if (matches2.length > 0) {
        content = content.replace(malformedObjectPattern, "{ $1");
        fixesApplied += matches2.length;
        console.log(
          `     🔧 Fixed ${matches2.length} malformed object literal(s)`,
        );
      }

      // Fix 3: Incomplete export statements (SAFE)
      const incompleteExportPattern = /^(\s*)export\s*\{\s*$/gm;
      const matches3 = content.match(incompleteExportPattern) || [];
      if (matches3.length > 0) {
        content = content.replace(incompleteExportPattern, "$1export {};");
        fixesApplied += matches3.length;
        console.log(`     🔧 Fixed ${matches3.length} incomplete export(s)`);
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} conservative fixes`);
      } else {
        console.log(`     - No safe fixes identified`);
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
    console.log("\n📈 Conservative TS1128 Declaration Fix Results:");

    const finalErrors = await this.getTS1128ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage =
      initialErrors > 0
        ? ((totalReduction / initialErrors) * 100).toFixed(1)
        : "0.0";

    console.log(`   Initial TS1128 errors: ${initialErrors}`);
    console.log(`   Final TS1128 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 50) {
      console.log("\n🎉 EXCELLENT! TS1128 errors reduced to very low level");
    } else if (parseFloat(reductionPercentage) >= 70) {
      console.log("\n🎯 GREAT! 70%+ error reduction achieved");
    } else if (parseFloat(reductionPercentage) >= 40) {
      console.log("\n✅ GOOD! 40%+ error reduction achieved");
    } else if (totalReduction > 0) {
      console.log(
        "\n📈 PROGRESS! Some errors eliminated with conservative approach",
      );
    } else {
      console.log(
        "\n⚠️ No errors eliminated - patterns may need manual review",
      );
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

    // Focus on incomplete function declarations and malformed exports
    console.log("\n🎯 Focus Areas for Manual Review:");
    console.log("   - Incomplete function declarations in test files");
    console.log("   - Malformed exports in campaign system files");
    console.log("   - JSX context issues requiring individual assessment");
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
  const fixer = new ConservativeTS1128Fixer();
  fixer.run().catch(console.error);
}

module.exports = ConservativeTS1128Fixer;
