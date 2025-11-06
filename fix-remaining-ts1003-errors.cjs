#!/usr/bin/env node

/**
 * Targeted Fix for Remaining TS1003 Identifier Errors
 *
 * Addresses the final 7 TS1003 errors with specific patterns:
 * 1. JSX attribute semicolon issues
 * 2. Malformed property access with quotes
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class RemainingTS1003Fixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.remaining-ts1003-backup-${Date.now()}`;
  }

  async run() {
    console.log("🎯 Fixing Remaining TS1003 Identifier Errors...\n");

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

      // Get specific files with errors
      const errorFiles = await this.getFilesWithTS1003Errors();
      console.log(
        `🔍 Found ${errorFiles.length} files with remaining TS1003 errors`,
      );

      // Process each file individually
      for (const filePath of errorFiles) {
        await this.processFile(filePath);
      }

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

      // Fix 1: JSX attribute semicolon issues
      // Pattern: attribute={value}; (at end of line) -> attribute={value}
      // This handles cases where semicolon should be removed entirely
      const jsxSemicolonPattern = /(\w+={[^}]+})\s*;\s*$/gm;
      const jsxMatches = content.match(jsxSemicolonPattern) || [];
      content = content.replace(jsxSemicolonPattern, "$1");
      fixesApplied += jsxMatches.length;

      // Fix 2: Malformed property access with quotes
      // Pattern: object.['property'] -> object['property']
      const quotedPropertyPattern = /(\w+)\.\[(['"`][^'"`]+['"`])\]/g;
      const quotedMatches = content.match(quotedPropertyPattern) || [];
      content = content.replace(quotedPropertyPattern, "$1[$2]");
      fixesApplied += quotedMatches.length;

      // Fix 3: Malformed property access with string literals
      // Pattern: object.['string-with-dashes'] -> object['string-with-dashes']
      const stringLiteralPattern = /(\w+)\.\[(['"`][^'"`\[\]]+['"`])\]/g;
      const stringMatches = content.match(stringLiteralPattern) || [];
      content = content.replace(stringLiteralPattern, "$1[$2]");
      fixesApplied += stringMatches.length;

      // Fix 4: Template literal issues in JSX
      // Pattern: {`text-${variable.toLowerCase().replace(/\s+/g, '-')}`}; -> {`text-${variable.toLowerCase().replace(/\s+/g, '-')}`}
      const templateJsxPattern = /(\{`[^`]*`\})\s*;\s*$/gm;
      const templateMatches = content.match(templateJsxPattern) || [];
      content = content.replace(templateJsxPattern, "$1");
      fixesApplied += templateMatches.length;

      // Fix 5: Complex JSX attribute patterns
      // Handle cases where there might be nested issues
      const complexJsxPattern =
        /(\w+={[^}]*})\s*;\s*(?=\s*\w+\s*=|\s*>|\s*\/?>)/gm;
      const complexMatches = content.match(complexJsxPattern) || [];
      content = content.replace(complexJsxPattern, "$1");
      fixesApplied += complexMatches.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} targeted fixes`);
      } else {
        console.log(`     - No fixes needed`);
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

  async showFinalResults(initialErrors) {
    console.log("\n📈 Remaining TS1003 Fix Results:");

    const finalErrors = await this.getTS1003ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage =
      initialErrors > 0
        ? ((totalReduction / initialErrors) * 100).toFixed(1)
        : "0.0";

    console.log(`   Initial TS1003 errors: ${initialErrors}`);
    console.log(`   Final TS1003 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors === 0) {
      console.log("\n🎉 PERFECT! All remaining TS1003 errors eliminated");
    } else if (finalErrors <= 3) {
      console.log("\n🎯 EXCELLENT! TS1003 errors reduced to minimal level");
    } else {
      console.log("\n⚠️ Some errors remain - may need manual review");
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

  async validateBuild() {
    try {
      console.log("🔍 Validating build...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("✅ Build validation passed");
      return true;
    } catch (error) {
      console.log("⚠️ Build validation failed");
      return false;
    }
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
  const fixer = new RemainingTS1003Fixer();
  fixer.run().catch(console.error);
}

module.exports = RemainingTS1003Fixer;
