#!/usr/bin/env node

/**
 * Targeted Array Access Syntax Fixer
 *
 * Fixes the most common TS1003 pattern: property.[index] -> property[index]
 * This is the primary cause of the remaining 601 TS1003 errors.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ArrayAccessSyntaxFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.array-access-backup-${Date.now()}`;
  }

  async run() {
    console.log("🎯 Starting Targeted Array Access Syntax Fixes...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getTS1003ErrorCount();
      console.log(`📊 Initial TS1003 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log("✅ No TS1003 errors found!");
        return;
      }

      // Get files with TS1003 errors
      const errorFiles = await this.getFilesWithTS1003Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1003 errors`);

      // Process files in small batches with validation
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

  async getTS1003ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1003"',
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

  async getFilesWithTS1003Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1003"',
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
    console.log(`\n🔧 Processing files in small batches with validation...`);

    const batchSize = 10; // Smaller batches for safety
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

        // Validation checkpoint every 5 files
        if (processedCount % 5 === 0) {
          const buildValid = await this.validateBuild();
          if (!buildValid) {
            console.log("⚠️ Build validation failed, stopping for safety");
            return;
          }

          const currentErrors = await this.getTS1003ErrorCount();
          console.log(
            `   📊 Progress: ${currentErrors} TS1003 errors remaining`,
          );

          // Safety check - if errors increased, stop
          if (currentErrors > initialErrorCount * 1.1) {
            console.log("⚠️ Error count increased, stopping for safety");
            return;
          }
        }
      }
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      console.log(`   🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Primary fix: property.[index] -> property[index]
      const arrayAccessPattern = /(\w+)\.\[(\d+)\]/g;
      const matches = content.match(arrayAccessPattern) || [];
      content = content.replace(arrayAccessPattern, "$1[$2]");
      fixesApplied += matches.length;

      // Secondary fix: property.[variable] -> property[variable]
      const variableAccessPattern = /(\w+)\.\[(\w+)\]/g;
      const matches2 = content.match(variableAccessPattern) || [];
      content = content.replace(variableAccessPattern, "$1[$2]");
      fixesApplied += matches2.length;

      // Tertiary fix: complex property access like results.[0].property -> results[0].property
      const complexAccessPattern = /(\w+)\.\[([^\]]+)\]\.(\w+)/g;
      const matches3 = content.match(complexAccessPattern) || [];
      content = content.replace(complexAccessPattern, "$1[$2].$3");
      fixesApplied += matches3.length;

      // Quaternary fix: method calls with array access like method().[0] -> method()[0]
      const methodAccessPattern = /(\w+\(\))\.\[(\d+)\]/g;
      const matches4 = content.match(methodAccessPattern) || [];
      content = content.replace(methodAccessPattern, "$1[$2]");
      fixesApplied += matches4.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} array access fixes`);
      } else {
        console.log(`     - No array access fixes needed`);
      }
    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
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

  async validateBuild() {
    try {
      console.log("     🔍 Validating build...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("     ✅ Build validation passed");
      return true;
    } catch (error) {
      console.log("     ⚠️ Build validation failed");
      return false;
    }
  }

  async showFinalResults(initialErrors) {
    console.log("\n📈 Array Access Fix Results:");

    const finalErrors = await this.getTS1003ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = (
      (totalReduction / initialErrors) *
      100
    ).toFixed(1);

    console.log(`   Initial TS1003 errors: ${initialErrors}`);
    console.log(`   Final TS1003 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 100) {
      console.log("\n🎉 EXCELLENT! TS1003 errors reduced to target level");
    } else if (reductionPercentage >= 80) {
      console.log("\n🎯 GREAT! 80%+ error reduction achieved");
    } else if (reductionPercentage >= 50) {
      console.log("\n✅ GOOD! 50%+ error reduction achieved");
    } else {
      console.log("\n⚠️ Partial success - may need additional targeted fixes");
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Final build validation
    const finalBuildValid = await this.validateBuild();
    if (finalBuildValid) {
      console.log("✅ Final build validation successful");
    } else {
      console.log("⚠️ Final build validation failed - review may be needed");
    }

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);
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
}

// Execute the fixer
if (require.main === module) {
  const fixer = new ArrayAccessSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = ArrayAccessSyntaxFixer;
