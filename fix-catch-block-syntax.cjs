#!/usr/bin/env node

/**
 * Fix Catch Block Syntax
 * Specifically fixes malformed catch blocks with type annotations
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class CatchBlockSyntaxFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.catch-block-fix-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get files with TS1005 errors
   */
  getFilesWithTS1005Errors() {
    try {
      const result = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      return this.extractFilesFromOutput(result);
    } catch (error) {
      if (error.stdout) {
        return this.extractFilesFromOutput(error.stdout);
      }
      return [];
    }
  }

  extractFilesFromOutput(output) {
    const errorLines = output
      .split("\n")
      .filter((line) => line.includes("error TS1005"));
    const files = new Set();

    errorLines.forEach((line) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        const filePath = match[1].trim();
        if (fs.existsSync(filePath)) {
          files.add(filePath);
        }
      }
    });

    return Array.from(files);
  }

  /**
   * Create backup of file
   */
  createBackup(filePath) {
    const backupPath = path.join(
      this.backupDir,
      filePath.replace(/[\/\\]/g, "_"),
    );
    const content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(backupPath, content, "utf8");
  }

  /**
   * Fix catch block syntax patterns
   */
  fixCatchBlockSyntax(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Malformed catch blocks with type annotations
    // `} catch (error): any {` → `} catch (error) {`
    // `} catch (error): Error {` → `} catch (error) {`
    const pattern1 = /(\}\s*catch\s*\([^)]+\))\s*:\s*[^{]+(\s*\{)/g;
    const matches1 = [...fixedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(pattern1, "$1$2");
      fixes += matches1.length;
      console.log(
        `    Fixed ${matches1.length} malformed catch blocks with type annotations`,
      );
    }

    return { content: fixedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, "utf8");

      // Only process files that contain catch blocks
      if (!originalContent.includes("catch (")) {
        return false;
      }

      console.log(`  Processing: ${filePath}`);

      // Create backup
      this.createBackup(filePath);

      // Fix patterns
      const { content: fixedContent, fixes } =
        this.fixCatchBlockSyntax(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      } else {
        console.log(`    ℹ️  No malformed catch blocks found`);
        return false;
      }
    } catch (error) {
      console.error(`    ❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Get current TS1005 error count
   */
  getTS1005ErrorCount() {
    try {
      const result = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      const errorCount = (result.match(/error TS1005/g) || []).length;
      return errorCount;
    } catch (error) {
      if (error.stdout) {
        const errorCount = (error.stdout.match(/error TS1005/g) || []).length;
        return errorCount;
      }
      return -1;
    }
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log("🔧 CATCH BLOCK SYNTAX FIX");
    console.log("=".repeat(40));

    const startTime = Date.now();
    const initialErrors = this.getTS1005ErrorCount();
    console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

    // Get files with TS1005 errors
    const files = this.getFilesWithTS1005Errors();
    console.log(`📁 Found ${files.length} files with TS1005 errors`);

    if (files.length === 0) {
      console.log("✅ No files with TS1005 errors found!");
      return;
    }

    let modifiedFiles = 0;

    // Process all files
    console.log(`\n🔄 Processing ${files.length} files...`);

    for (const file of files) {
      if (this.processFile(file)) {
        modifiedFiles++;
      }
    }

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🏁 CATCH BLOCK FIX COMPLETED");
    console.log("=".repeat(40));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📝 Files processed: ${modifiedFiles}`);
    console.log(`🎯 Total fixes applied: ${this.fixedPatterns}`);
    console.log(`📊 TS1005 errors: ${initialErrors} → ${finalErrors}`);

    if (finalErrors < initialErrors) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(
        `✅ SUCCESS: Reduced by ${reduction} errors (${percentage}%)`,
      );
    } else if (finalErrors === initialErrors) {
      console.log(`ℹ️  No change in error count`);
    } else {
      console.log(`⚠️  Error count increased`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialErrors,
      finalErrors,
      filesModified: modifiedFiles,
      fixesApplied: this.fixedPatterns,
      duration: parseFloat(duration),
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new CatchBlockSyntaxFixer();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Catch block syntax fix completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Catch block syntax fix failed:", error);
      process.exit(1);
    });
}

module.exports = CatchBlockSyntaxFixer;
