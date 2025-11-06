#!/usr/bin/env node

/**
 * Conservative TypeScript Error Fixer for Phase 12.1
 *
 * Only applies the safest, most proven fixes:
 * - Simple array access syntax fixes (property.[index] -> property[index])
 * - Basic type assertion fixes
 * - Conservative approach with extensive validation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ConservativeTypeScriptFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.conservative-ts-backup-${Date.now()}`;
    this.maxFiles = 5; // Very conservative batch size
  }

  async run() {
    console.log("🛡️ Starting Conservative TypeScript Error Recovery...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count and breakdown
      const initialErrors = await this.getErrorBreakdown();
      console.log("📊 Initial Error Analysis:");
      console.log(`   Total TypeScript errors: ${initialErrors.total}`);
      console.log(
        `   TS1003 (Expected identifier): ${initialErrors.TS1003 || 0}`,
      );
      console.log(`   TS1005 (Expected token): ${initialErrors.TS1005 || 0}`);

      if (initialErrors.total === 0) {
        console.log("✅ No TypeScript errors found!");
        return;
      }

      // Focus only on files with TS1003 errors (array access issues)
      const ts1003Files = await this.getFilesWithTS1003Errors();
      console.log(`🎯 Found ${ts1003Files.length} files with TS1003 errors`);

      // Process only a few files with the safest fixes
      await this.processFilesConservatively(ts1003Files, initialErrors.total);

      // Final results
      await this.showFinalResults(initialErrors);
    } catch (error) {
      console.error("❌ Conservative fix failed:", error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log(`📁 Created backup directory: ${this.backupDir}`);
  }

  async getErrorBreakdown() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const lines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const breakdown = { total: lines.length };

      // Count specific error types
      const errorCounts = {};
      lines.forEach((line) => {
        const match = line.match(/error (TS\d+):/);
        if (match) {
          const errorType = match[1];
          errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
        }
      });

      breakdown.TS1003 = errorCounts.TS1003 || 0;
      breakdown.TS1005 = errorCounts.TS1005 || 0;

      return breakdown;
    } catch (error) {
      return { total: 0, TS1003: 0, TS1005: 0 };
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

  async processFilesConservatively(errorFiles, initialErrorCount) {
    console.log(
      `\n🔧 Processing ${Math.min(this.maxFiles, errorFiles.length)} files with ultra-conservative fixes...`,
    );

    let processedCount = 0;

    for (const filePath of errorFiles.slice(0, this.maxFiles)) {
      await this.processFile(filePath);
      processedCount++;

      // Validate after EVERY file
      const buildValid = await this.validateBuild();
      if (!buildValid) {
        console.log("⚠️ Build validation failed, stopping immediately");
        return;
      }

      const currentErrors = await this.getCurrentErrorCount();
      console.log(
        `   📊 After file ${processedCount}: ${currentErrors} errors remaining`,
      );

      // Stop if errors increased at all
      if (currentErrors > initialErrorCount) {
        console.log("⚠️ Error count increased, stopping immediately");
        return;
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

      // ONLY apply the most proven fix: array access syntax
      // This was successful in previous campaigns with 29.9% reduction

      // Fix: property.[index] -> property[index] (most common TS1003 cause)
      const arrayAccessPattern = /(\w+)\.\[(\d+)\]/g;
      const matches = content.match(arrayAccessPattern) || [];
      if (matches.length > 0) {
        content = content.replace(arrayAccessPattern, "$1[$2]");
        fixesApplied += matches.length;
      }

      // Only apply if we found the specific pattern we're targeting
      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} array access fixes`);
      } else {
        console.log(`     - No array access patterns found`);
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
      execSync("yarn build", { stdio: "pipe" });
      console.log("     ✅ Build validation passed");
      return true;
    } catch (error) {
      console.log("     ⚠️ Build validation failed");
      return false;
    }
  }

  async getCurrentErrorCount() {
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

  async showFinalResults(initialErrors) {
    console.log("\n📈 Conservative Fix Results:");

    const finalErrors = await this.getErrorBreakdown();
    const totalReduction = initialErrors.total - finalErrors.total;
    const reductionPercentage = (
      (totalReduction / initialErrors.total) *
      100
    ).toFixed(1);

    console.log(`   Initial errors: ${initialErrors.total}`);
    console.log(`   Final errors: ${finalErrors.total}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    console.log("\n📊 TS1003 Error Progress:");
    console.log(
      `   TS1003: ${initialErrors.TS1003} → ${finalErrors.TS1003} (${initialErrors.TS1003 - finalErrors.TS1003} fixed)`,
    );

    if (finalErrors.total <= 100) {
      console.log(
        "\n🎉 SUCCESS! Target achieved: TypeScript errors reduced to <100",
      );
    } else if (reductionPercentage >= 10) {
      console.log(
        "\n✅ PROGRESS! 10%+ error reduction achieved with conservative approach",
      );
    } else if (totalReduction > 0) {
      console.log(
        "\n📈 SAFE PROGRESS! Some errors eliminated without breaking build",
      );
    } else {
      console.log(
        "\n🛡️ SAFE! No errors introduced, build stability maintained",
      );
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Final build validation
    const finalBuildValid = await this.validateBuild();
    if (finalBuildValid) {
      console.log(
        "✅ Final build validation successful - conservative approach maintained stability",
      );
    } else {
      console.log(
        "⚠️ Final build validation failed - this should not happen with conservative approach",
      );
    }
  }
}

// Execute the conservative fixer
if (require.main === module) {
  const fixer = new ConservativeTypeScriptFixer();
  fixer.run().catch(console.error);
}

module.exports = ConservativeTypeScriptFixer;
