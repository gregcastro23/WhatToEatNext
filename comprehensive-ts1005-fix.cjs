#!/usr/bin/env node

/**
 * Comprehensive TS1005 Error Fix
 * Handles various malformed syntax patterns causing TS1005 errors
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class ComprehensiveTS1005Fixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.ts1005-fix-backup-${Date.now()}`;

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
   * Fix comprehensive TS1005 syntax patterns
   */
  fixTS1005Patterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: Malformed catch blocks with type annotations
    // `} catch (error): any {` → `} catch (error) {`
    const pattern1 = /(\}\s*catch\s*\([^)]+\))\s*:\s*[^{]+(\s*\{)/g;
    const matches1 = [...fixedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(pattern1, "$1$2");
      fixes += matches1.length;
      console.log(`    Fixed ${matches1.length} malformed catch blocks`);
    }

    // Pattern 2: Variable declarations with trailing comma at end of line
    const pattern2 =
      /^(\s*(?:let|const|var)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;=]+),(\s*)$/gm;
    const matches2 = [...fixedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(pattern2, "$1;$2");
      fixes += matches2.length;
      console.log(
        `    Fixed ${matches2.length} variable declarations with trailing comma`,
      );
    }

    // Pattern 3: Function parameter lists with malformed syntax
    // Fix trailing commas in function parameters before closing paren
    const pattern3 = /,(\s*\n\s*\))/g;
    const matches3 = [...fixedContent.matchAll(pattern3)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(pattern3, "$1");
      fixes += matches3.length;
      console.log(
        `    Fixed ${matches3.length} function parameter trailing commas`,
      );
    }

    // Pattern 4: Object destructuring with malformed syntax
    // `= {},;` → `= {},`
    const pattern4 = /=\s*\{\s*\}\s*,\s*;/g;
    const matches4 = [...fixedContent.matchAll(pattern4)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(pattern4, "= {},");
      fixes += matches4.length;
      console.log(`    Fixed ${matches4.length} object destructuring patterns`);
    }

    // Pattern 5: Import statements with malformed syntax
    const pattern5 = /^(\s*import\s+[^;]+),(\s*)$/gm;
    const matches5 = [...fixedContent.matchAll(pattern5)];
    if (matches5.length > 0) {
      fixedContent = fixedContent.replace(pattern5, "$1;$2");
      fixes += matches5.length;
      console.log(
        `    Fixed ${matches5.length} import statements with trailing comma`,
      );
    }

    // Pattern 6: Export statements with malformed syntax
    const pattern6 = /^(\s*export\s+[^;]+),(\s*)$/gm;
    const matches6 = [...fixedContent.matchAll(pattern6)];
    if (matches6.length > 0) {
      fixedContent = fixedContent.replace(pattern6, "$1;$2");
      fixes += matches6.length;
      console.log(
        `    Fixed ${matches6.length} export statements with trailing comma`,
      );
    }

    // Pattern 7: Malformed type annotations in function signatures
    // Fix cases where type annotations are malformed
    const pattern7 = /(\w+)\s*:\s*([^,)]+)\s*,\s*;/g;
    const matches7 = [...fixedContent.matchAll(pattern7)];
    if (matches7.length > 0) {
      fixedContent = fixedContent.replace(pattern7, "$1: $2,");
      fixes += matches7.length;
      console.log(`    Fixed ${matches7.length} malformed type annotations`);
    }

    // Pattern 8: React component declarations with trailing comma
    const pattern8 =
      /^(\s*const\s+[A-Z][a-zA-Z0-9_]*\s*:\s*React\.FC<[^>]*>\s*=\s*[^,;]+),(\s*)$/gm;
    const matches8 = [...fixedContent.matchAll(pattern8)];
    if (matches8.length > 0) {
      fixedContent = fixedContent.replace(pattern8, "$1;$2");
      fixes += matches8.length;
      console.log(
        `    Fixed ${matches8.length} React component declarations with trailing comma`,
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
        this.fixTS1005Patterns(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      } else {
        console.log(`    ℹ️  No TS1005 patterns found`);
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
    console.log("🔧 COMPREHENSIVE TS1005 ERROR REPAIR");
    console.log("=".repeat(50));

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
    let batchCount = 0;

    // Process files in batches of 15 (smaller batches for safety)
    for (let i = 0; i < files.length; i += 15) {
      const batch = files.slice(i, Math.min(i + 15, files.length));
      batchCount++;

      console.log(
        `\n🔄 Batch ${batchCount}: Processing files ${i + 1}-${Math.min(i + 15, files.length)}`,
      );

      for (const file of batch) {
        if (this.processFile(file)) {
          modifiedFiles++;
        }
      }

      // Validation checkpoint every batch
      const currentErrors = this.getTS1005ErrorCount();
      console.log(`  📊 Current TS1005 errors: ${currentErrors}`);

      // Stop if errors are increasing significantly
      if (currentErrors > initialErrors + 10) {
        console.log(
          "  ⚠️  Error count increased significantly - stopping to prevent damage",
        );
        break;
      }

      if (i + 15 < files.length) {
        console.log("  ⏸️  Checkpoint - continuing...");
      }
    }

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🏁 REPAIR COMPLETED");
    console.log("=".repeat(50));
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
      console.log(`ℹ️  No change in error count - may need manual review`);
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
  const fixer = new ComprehensiveTS1005Fixer();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Comprehensive TS1005 repair completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Comprehensive TS1005 repair failed:", error);
      process.exit(1);
    });
}

module.exports = ComprehensiveTS1005Fixer;
