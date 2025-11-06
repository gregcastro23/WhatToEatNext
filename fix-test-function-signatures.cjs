#!/usr/bin/env node

/**
 * Fix Test Function Signatures
 * Specifically targets the malformed test function pattern:
 * test('description': any, async() => { -> test('description', async () => {
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TestFunctionSignatureFixer {
  constructor() {
    this.processedFiles = 0;
    this.fixedPatterns = 0;
    this.backupDir = `.test-signature-backup-${Date.now()}`;

    // Create backup directory
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Get files with TS1005 errors in test files
   */
  getTestFilesWithTS1005Errors() {
    try {
      const result = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      return this.extractTestFilesFromOutput(result);
    } catch (error) {
      if (error.stdout) {
        return this.extractTestFilesFromOutput(error.stdout);
      }
      return [];
    }
  }

  extractTestFilesFromOutput(output) {
    const errorLines = output
      .split("\n")
      .filter(
        (line) => line.includes("error TS1005") && line.includes(".test."),
      );
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
   * Fix test function signature patterns
   */
  fixTestFunctionSignatures(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: test('description': any, async() => {
    // Fix to: test('description', async () => {
    const testPattern1 =
      /test\s*\(\s*'([^']+)'\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
    const matches1 = [...fixedContent.matchAll(testPattern1)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(
        testPattern1,
        "test('$1', async () =>",
      );
      fixes += matches1.length;
      console.log(
        `    Fixed ${matches1.length} test function signatures with ': any, async()'`,
      );
    }

    // Pattern 2: test('description': any, () => {
    // Fix to: test('description', () => {
    const testPattern2 = /test\s*\(\s*'([^']+)'\s*:\s*any\s*,\s*\(\s*\)\s*=>/g;
    const matches2 = [...fixedContent.matchAll(testPattern2)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(testPattern2, "test('$1', () =>");
      fixes += matches2.length;
      console.log(
        `    Fixed ${matches2.length} test function signatures with ': any, ()'`,
      );
    }

    // Pattern 3: describe('description': any, () => {
    // Fix to: describe('description', () => {
    const describePattern =
      /describe\s*\(\s*'([^']+)'\s*:\s*any\s*,\s*\(\s*\)\s*=>/g;
    const matches3 = [...fixedContent.matchAll(describePattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(
        describePattern,
        "describe('$1', () =>",
      );
      fixes += matches3.length;
      console.log(
        `    Fixed ${matches3.length} describe function signatures with ': any, ()'`,
      );
    }

    // Pattern 4: it('description': any, async() => {
    // Fix to: it('description', async () => {
    const itPattern =
      /it\s*\(\s*'([^']+)'\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
    const matches4 = [...fixedContent.matchAll(itPattern)];
    if (matches4.length > 0) {
      fixedContent = fixedContent.replace(itPattern, "it('$1', async () =>");
      fixes += matches4.length;
      console.log(
        `    Fixed ${matches4.length} it function signatures with ': any, async()'`,
      );
    }

    // Pattern 5: beforeEach/afterEach with malformed signatures
    const beforeEachPattern =
      /beforeEach\s*\(\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
    const matches5 = [...fixedContent.matchAll(beforeEachPattern)];
    if (matches5.length > 0) {
      fixedContent = fixedContent.replace(
        beforeEachPattern,
        "beforeEach(async () =>",
      );
      fixes += matches5.length;
      console.log(
        `    Fixed ${matches5.length} beforeEach function signatures`,
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
        this.fixTestFunctionSignatures(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`    ✅ Applied ${fixes} fixes`);
        this.fixedPatterns += fixes;
        this.processedFiles++;
        return true;
      } else {
        console.log(`    ℹ️  No test function signature issues found`);
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
   * Validate build
   */
  validateBuild() {
    try {
      execSync("yarn tsc --noEmit --skipLibCheck 2>/dev/null", {
        stdio: "pipe",
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Main repair process
   */
  async repair() {
    console.log("🎯 TEST FUNCTION SIGNATURE FIXER");
    console.log("=".repeat(40));

    const startTime = Date.now();
    const initialErrors = this.getTS1005ErrorCount();
    console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

    // Get test files with TS1005 errors
    const files = this.getTestFilesWithTS1005Errors();
    console.log(`📁 Found ${files.length} test files with TS1005 errors`);

    if (files.length === 0) {
      console.log("✅ No test files with TS1005 errors found!");
      return;
    }

    let modifiedFiles = 0;

    // Process files in small batches with validation
    console.log(`\n🔄 Processing ${files.length} test files...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (this.processFile(file)) {
        modifiedFiles++;
      }

      // Validate build every 3 files
      if ((i + 1) % 3 === 0) {
        console.log(
          `  🔍 Build validation checkpoint at file ${i + 1}/${files.length}`,
        );
        const buildValid = this.validateBuild();
        if (!buildValid) {
          console.log("⚠️ Build validation failed, stopping for safety");
          break;
        }
      }
    }

    // Final validation
    console.log("\n🔍 Final build validation...");
    const finalBuildValid = this.validateBuild();

    // Final results
    const endTime = Date.now();
    const finalErrors = this.getTS1005ErrorCount();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🏁 TEST SIGNATURE FIXING COMPLETED");
    console.log("=".repeat(40));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`📝 Files processed: ${modifiedFiles}`);
    console.log(`🎯 Total fixes applied: ${this.fixedPatterns}`);
    console.log(`📊 TS1005 errors: ${initialErrors} → ${finalErrors}`);
    console.log(`🔍 Final build valid: ${finalBuildValid ? "✅" : "❌"}`);

    if (finalErrors < initialErrors && finalBuildValid) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(
        `✅ SUCCESS: Reduced by ${reduction} errors (${percentage}%) with valid build`,
      );
    } else if (finalErrors < initialErrors) {
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);
      console.log(
        `⚠️ PARTIAL SUCCESS: Reduced by ${reduction} errors (${percentage}%) but build issues remain`,
      );
    } else if (finalErrors === initialErrors && finalBuildValid) {
      console.log(`ℹ️  No change in error count but build remains valid`);
    } else {
      console.log(`❌ Issues detected - may need to rollback changes`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialErrors,
      finalErrors,
      filesModified: modifiedFiles,
      fixesApplied: this.fixedPatterns,
      duration: parseFloat(duration),
      buildValid: finalBuildValid,
    };
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new TestFunctionSignatureFixer();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Test function signature fixing completed");
      if (results.buildValid && results.finalErrors < results.initialErrors) {
        console.log("✅ Ready to proceed with next phase");
        process.exit(0);
      } else {
        console.log("⚠️ Manual review may be needed");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ Test function signature fixing failed:", error);
      process.exit(1);
    });
}

module.exports = TestFunctionSignatureFixer;
