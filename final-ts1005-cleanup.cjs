#!/usr/bin/env node

/**
 * Final TS1005 Cleanup
 * Handles remaining specific patterns causing TS1005 errors
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class FinalTS1005Cleanup {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.final-ts1005-backup-${Date.now()}`;

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
   * Fix remaining TS1005 patterns
   */
  fixRemainingTS1005Patterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Import statements with semicolon instead of comma
    // Fix cases like `import { a, b; } from 'module'`
    const pattern1 = /(\{\s*[^}]*);(\s*\}\s*from)/g;
    const matches1 = [...fixedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(pattern1, "$1,$2");
      fixes += matches1.length;
      console.log(
        `    Fixed ${matches1.length} import statements with semicolon instead of comma`,
      );
    }

    // Pattern 2: Object destructuring with semicolon instead of comma
    // Fix cases like `const { a; b } = obj`
    const pattern2 = /(\{\s*[^}]*);(\s*[^}]*\})/g;
    const matches2 = [...fixedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(pattern2, "$1,$2");
      fixes += matches2.length;
      console.log(
        `    Fixed ${matches2.length} object destructuring with semicolon instead of comma`,
      );
    }

    // Pattern 3: Function parameter lists with semicolon instead of comma
    // Fix cases like `function(a; b)` or `(a; b) =>`
    const pattern3 = /(\([^)]*);(\s*[^)]*\))/g;
    const matches3 = [...fixedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(pattern3, "$1,$2");
      fixes += matches3.length;
      console.log(
        `    Fixed ${matches3.length} function parameters with semicolon instead of comma`,
      );
    }

    // Pattern 4: Array elements with semicolon instead of comma
    // Fix cases like `[a; b]`
    const pattern4 = /(\[[^\]]*);(\s*[^\]]*\])/g;
    const matches4 = [...fixedContent.matchAll(pattern4)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(pattern4, "$1,$2");
      fixes += matches4.length;
      console.log(
        `    Fixed ${matches4.length} array elements with semicolon instead of comma`,
      );
    }

    // Pattern 5: Type parameter lists with semicolon instead of comma
    // Fix cases like `<T; U>`
    const pattern5 = /(<[^>]*);(\s*[^>]*>)/g;
    const matches5 = [...fixedContent.matchAll(pattern5)];
    if (matches5.length > 0) {
      fixedContent = fixedContent.replace(pattern5, "$1,$2");
      fixes += matches5.length;
      console.log(
        `    Fixed ${matches5.length} type parameters with semicolon instead of comma`,
      );
    }

    // Pattern 6: Object literal properties with semicolon instead of comma
    // Fix cases like `{ prop1: value; prop2: value }`
    const pattern6 = /(\{\s*[^}]*:\s*[^,;}]*);(\s*[^}]*\})/g;
    const matches6 = [...fixedContent.matchAll(pattern6)];
    if (matches6.length > 0) {
      fixedContent = fixedContent.replace(pattern6, "$1,$2");
      fixes += matches6.length;
      console.log(
        `    Fixed ${matches6.length} object properties with semicolon instead of comma`,
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

      console.log(`  Processing: ${filePath}`);

      // Create backup
      this.createBackup(filePath);

      // Fix patterns
      const { content: fixedContent, fixes } =
        this.fixRemainingTS1005Patterns(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      } else {
        console.log(`    ℹ️  No remaining TS1005 patterns found`);
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
    console.log("🎯 FINAL TS1005 CLEANUP");
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
    console.log(`\n🔄 Processing all ${files.length} files...`);

    for (const file of files) {
      if (this.processFile(file)) {
        modifiedFiles++;
      }
    }

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🏁 FINAL CLEANUP COMPLETED");
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
      console.log(
        `ℹ️  No change in error count - remaining errors may need manual review`,
      );
    } else {
      console.log(`⚠️  Error count increased - may need to rollback changes`);
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
  const fixer = new FinalTS1005Cleanup();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Final TS1005 cleanup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Final TS1005 cleanup failed:", error);
      process.exit(1);
    });
}

module.exports = FinalTS1005Cleanup;
