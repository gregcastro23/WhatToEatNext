#!/usr/bin/env node

/**
 * Emergency Malformed Comma-Semicolon Syntax Repair Script
 *
 * Systematically repairs `,;` patterns and other malformed syntax throughout codebase
 * Targets files with malformed parameter defaults, object destructuring, and variable declarations
 *
 * Patterns to fix:
 * - `= {},;` → `= {},`
 * - `= value,;` → `= value,`
 * - `let variable,` → `let variable;`
 * - `const variable,` → `const variable;`
 * - Function parameter trailing commas
 * - Object literal malformed syntax
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class EmergencyMalformedSyntaxRepairer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.batchSize = 25;
    this.validationCheckpoints = [];
    this.backupDir = `.emergency-syntax-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get all TypeScript/JavaScript files with TS1005 errors
   */
  getFilesWithTS1005Errors() {
    try {
      console.log("🔍 Identifying files with TS1005 syntax errors...");

      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS1005"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const errorLines = output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
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

      const fileArray = Array.from(files);
      console.log(`📋 Found ${fileArray.length} files with TS1005 errors`);
      return fileArray;
    } catch (error) {
      console.log("ℹ️  No TS1005 errors found or TypeScript check failed");
      return [];
    }
  }

  /**
   * Create backup of file before modification
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
   * Fix malformed comma-semicolon patterns in content
   */
  fixMalformedSyntax(content, filePath) {
    let fixedContent = content;
    let localFixes = 0;

    // Pattern 1: Fix trailing comma followed by semicolon in object defaults
    // `= {},;` → `= {},`
    const pattern1 = /=\s*\{\s*\}\s*,\s*;/g;
    const matches1 = fixedContent.match(pattern1);
    if (matches1) {
      fixedContent = fixedContent.replace(pattern1, "= {},");
      localFixes += matches1.length;
      console.log(
        `  🔧 Fixed ${matches1.length} object default patterns (= {},;)`,
      );
    }

    // Pattern 2: Fix trailing comma followed by semicolon in value assignments
    // `= value,;` → `= value,`
    const pattern2 = /=\s*([^,;]+),\s*;/g;
    const matches2 = fixedContent.match(pattern2);
    if (matches2) {
      fixedContent = fixedContent.replace(pattern2, "= $1,");
      localFixes += matches2.length;
      console.log(
        `  🔧 Fixed ${matches2.length} value assignment patterns (= value,;)`,
      );
    }

    // Pattern 3: Fix variable declarations with trailing comma instead of semicolon
    // `let variable,` → `let variable;` (at end of line)
    const pattern3 = /^(\s*(?:let|const|var)\s+[^,;]+),\s*$/gm;
    const matches3 = fixedContent.match(pattern3);
    if (matches3) {
      fixedContent = fixedContent.replace(pattern3, "$1;");
      localFixes += matches3.length;
      console.log(
        `  🔧 Fixed ${matches3.length} variable declaration patterns`,
      );
    }

    // Pattern 4: Fix function parameter trailing commas at end of line
    // `parameter,` → `parameter` (when followed by closing paren on next line)
    const pattern4 = /,(\s*\n\s*\))/g;
    const matches4 = fixedContent.match(pattern4);
    if (matches4) {
      fixedContent = fixedContent.replace(pattern4, "$1");
      localFixes += matches4.length;
      console.log(
        `  🔧 Fixed ${matches4.length} function parameter trailing commas`,
      );
    }

    // Pattern 5: Fix object literal trailing commas followed by semicolon
    // `property: value,;` → `property: value;`
    const pattern5 = /:\s*([^,;]+),\s*;/g;
    const matches5 = fixedContent.match(pattern5);
    if (matches5) {
      fixedContent = fixedContent.replace(pattern5, ": $1;");
      localFixes += matches5.length;
      console.log(`  🔧 Fixed ${matches5.length} object property patterns`);
    }

    // Pattern 6: Fix array element trailing commas followed by semicolon
    // `element,;` → `element;`
    const pattern6 = /([^\s,;]+),\s*;/g;
    const matches6 = fixedContent.match(pattern6);
    if (matches6) {
      fixedContent = fixedContent.replace(pattern6, "$1;");
      localFixes += matches6.length;
      console.log(`  🔧 Fixed ${matches6.length} array element patterns`);
    }

    // Pattern 7: Fix malformed JSX component declarations
    // `const Component: React.FC<any> = (props: any) => <div>Content</div>,` → `const Component: React.FC<any> = (props: any) => <div>Content</div>;`
    const pattern7 =
      /const\s+\w+:\s*React\.FC<[^>]*>\s*=\s*\([^)]*\)\s*=>\s*<[^>]*>[^<]*<\/[^>]*>,\s*$/gm;
    const matches7 = fixedContent.match(pattern7);
    if (matches7) {
      fixedContent = fixedContent.replace(pattern7, (match) =>
        match.replace(/,\s*$/, ";"),
      );
      localFixes += matches7.length;
      console.log(
        `  🔧 Fixed ${matches7.length} JSX component declaration patterns`,
      );
    }

    // Pattern 8: Fix interface/type declarations with trailing comma
    // `interface Name {` followed by `property,` → `property;`
    const pattern8 = /^(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[^,;]+),\s*$/gm;
    const matches8 = fixedContent.match(pattern8);
    if (matches8) {
      fixedContent = fixedContent.replace(pattern8, "$1;");
      localFixes += matches8.length;
      console.log(`  🔧 Fixed ${matches8.length} interface property patterns`);
    }

    this.fixedPatterns += localFixes;
    return { content: fixedContent, fixes: localFixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      console.log(`\n📝 Processing: ${filePath}`);

      // Create backup
      this.createBackup(filePath);

      // Read and fix content
      const originalContent = fs.readFileSync(filePath, "utf8");
      const { content: fixedContent, fixes } = this.fixMalformedSyntax(
        originalContent,
        filePath,
      );

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`  ✅ Applied ${fixes} fixes to ${filePath}`);
      } else {
        console.log(`  ℹ️  No malformed patterns found in ${filePath}`);
      }

      this.processedFiles++;
      return fixes > 0;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      return false;
    }
  }

  /**
   * Validate TypeScript compilation
   */
  validateTypeScriptCompilation() {
    try {
      console.log("\n🔍 Validating TypeScript compilation...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      console.log(
        "⚠️  TypeScript compilation has errors (expected during repair process)",
      );
      return false;
    }
  }

  /**
   * Get current TS1005 error count
   */
  getTS1005ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1005"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      return 0; // No errors found
    }
  }

  /**
   * Process files in batches with validation checkpoints
   */
  async processBatch(files, startIndex) {
    const endIndex = Math.min(startIndex + this.batchSize, files.length);
    const batch = files.slice(startIndex, endIndex);

    console.log(
      `\n🔄 Processing batch ${Math.floor(startIndex / this.batchSize) + 1}: files ${startIndex + 1}-${endIndex} of ${files.length}`,
    );

    let batchFixes = 0;
    const modifiedFiles = [];

    for (const file of batch) {
      const wasModified = this.processFile(file);
      if (wasModified) {
        modifiedFiles.push(file);
        batchFixes++;
      }
    }

    // Validation checkpoint
    console.log(
      `\n📊 Batch ${Math.floor(startIndex / this.batchSize) + 1} Summary:`,
    );
    console.log(`  📝 Files processed: ${batch.length}`);
    console.log(`  🔧 Files modified: ${batchFixes}`);
    console.log(`  📈 Total fixes applied: ${this.fixedPatterns}`);

    // Check TS1005 error count
    const currentErrors = this.getTS1005ErrorCount();
    console.log(`  🎯 Current TS1005 errors: ${currentErrors}`);

    this.validationCheckpoints.push({
      batch: Math.floor(startIndex / this.batchSize) + 1,
      filesProcessed: endIndex,
      fixesApplied: this.fixedPatterns,
      ts1005Errors: currentErrors,
      modifiedFiles,
    });

    return endIndex < files.length;
  }

  /**
   * Main repair process
   */
  async repairMalformedSyntax() {
    console.log("🚨 EMERGENCY MALFORMED SYNTAX REPAIR STARTING");
    console.log("=".repeat(60));

    const startTime = Date.now();
    const initialErrors = this.getTS1005ErrorCount();
    console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

    // Get files with TS1005 errors
    const files = this.getFilesWithTS1005Errors();

    if (files.length === 0) {
      console.log("✅ No files with TS1005 errors found!");
      return;
    }

    console.log(`\n🎯 Target: Fix malformed syntax in ${files.length} files`);
    console.log(`📦 Batch size: ${this.batchSize} files`);
    console.log(`💾 Backup directory: ${this.backupDir}`);

    // Process files in batches
    let currentIndex = 0;
    while (currentIndex < files.length) {
      const hasMore = await this.processBatch(files, currentIndex);
      currentIndex += this.batchSize;

      if (hasMore && currentIndex < files.length) {
        console.log("\n⏸️  Pausing for validation checkpoint...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Final validation
    console.log("\n🏁 EMERGENCY REPAIR COMPLETED");
    console.log("=".repeat(60));

    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`📊 Final Results:`);
    console.log(`  ⏱️  Duration: ${duration} seconds`);
    console.log(`  📝 Files processed: ${this.processedFiles}`);
    console.log(`  🔧 Total fixes applied: ${this.fixedPatterns}`);
    console.log(
      `  🎯 TS1005 errors: ${initialErrors} → ${finalErrors} (${initialErrors - finalErrors} reduced)`,
    );
    console.log(`  💾 Backups saved in: ${this.backupDir}`);

    if (finalErrors < initialErrors) {
      console.log(
        `✅ SUCCESS: Reduced TS1005 errors by ${initialErrors - finalErrors}`,
      );
    } else if (finalErrors === 0) {
      console.log(`🎉 PERFECT: All TS1005 errors eliminated!`);
    } else {
      console.log(`⚠️  PARTIAL: ${finalErrors} TS1005 errors remain`);
    }

    // Final TypeScript validation
    console.log("\n🔍 Final TypeScript validation...");
    this.validateTypeScriptCompilation();

    return {
      initialErrors,
      finalErrors,
      filesProcessed: this.processedFiles,
      fixesApplied: this.fixedPatterns,
      duration: parseFloat(duration),
      checkpoints: this.validationCheckpoints,
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const repairer = new EmergencyMalformedSyntaxRepairer();
  repairer
    .repairMalformedSyntax()
    .then((results) => {
      console.log("\n📋 Emergency repair completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Emergency repair failed:", error);
      process.exit(1);
    });
}

module.exports = EmergencyMalformedSyntaxRepairer;
