#!/usr/bin/env node

/**
 * Simple TS1005 Fixer
 * Focus: Only fix TS1005 errors, simple validation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SimpleTS1005Fixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.successfulFiles = [];
    this.backupDir = `.simple-ts1005-backup-${Date.now()}`;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

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
      return 0;
    }
  }

  getFilesWithTS1005Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | cut -d"(" -f1 | sort -u',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return output
        .trim()
        .split("\n")
        .filter((line) => line.trim() && fs.existsSync(line.trim()));
    } catch (error) {
      return [];
    }
  }

  getFileTS1005ErrorCount(filePath) {
    try {
      const result = execSync(
        `yarn tsc --noEmit --skipLibCheck ${filePath} 2>&1`,
        {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        },
      );
      return (result.match(/error TS1005/g) || []).length;
    } catch (error) {
      if (error.stdout) {
        return (error.stdout.match(/error TS1005/g) || []).length;
      }
      return -1;
    }
  }

  createBackup(filePath) {
    const backupPath = path.join(
      this.backupDir,
      filePath.replace(/[\/\\]/g, "_"),
    );
    const content = fs.readFileSync(filePath, "utf8");
    fs.writeFileSync(backupPath, content, "utf8");
  }

  applyProvenPatterns(content) {
    let fixedContent = content;
    let fixes = 0;

    // Pattern 1: test('description': any, async () => {
    const testColonAnyPattern =
      /(\b(?:test|it|describe|beforeEach|afterEach|beforeAll|afterAll)\s*\(\s*'[^']+'):\s*any\s*,/g;
    const matches1 = [...fixedContent.matchAll(testColonAnyPattern)];
    if (matches1.length > 0) {
      fixedContent = fixedContent.replace(testColonAnyPattern, "$1,");
      fixes += matches1.length;
    }

    // Pattern 2: } catch (error): any {
    const catchColonAnyPattern = /(\}\s*catch\s*\([^)]+\)):\s*any\s*\{/g;
    const matches2 = [...fixedContent.matchAll(catchColonAnyPattern)];
    if (matches2.length > 0) {
      fixedContent = fixedContent.replace(catchColonAnyPattern, "$1 {");
      fixes += matches2.length;
    }

    // Pattern 3: ([_planet: any, position]: any) => {
    const destructuringColonAnyPattern = /(\[\s*[^,\]]+):\s*any\s*,/g;
    const matches3 = [...fixedContent.matchAll(destructuringColonAnyPattern)];
    if (matches3.length > 0) {
      fixedContent = fixedContent.replace(destructuringColonAnyPattern, "$1,");
      fixes += matches3.length;
    }

    return { content: fixedContent, fixes };
  }

  async processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${path.basename(filePath)}`);

      const initialTS1005Errors = this.getFileTS1005ErrorCount(filePath);
      console.log(`   Initial TS1005 errors: ${initialTS1005Errors}`);

      if (initialTS1005Errors === 0) {
        console.log(`   ✅ No TS1005 errors found`);
        return { success: true, fixes: 0, errorReduction: 0 };
      }

      this.createBackup(filePath);
      const originalContent = fs.readFileSync(filePath, "utf8");
      const { content: fixedContent, fixes } =
        this.applyProvenPatterns(originalContent);

      if (fixes > 0) {
        fs.writeFileSync(filePath, fixedContent, "utf8");
        console.log(`   Applied ${fixes} proven pattern fixes`);
      }

      const finalTS1005Errors = this.getFileTS1005ErrorCount(filePath);
      const errorReduction = initialTS1005Errors - finalTS1005Errors;

      console.log(`   Final TS1005 errors: ${finalTS1005Errors}`);
      console.log(`   TS1005 error reduction: ${errorReduction}`);

      // SUCCESS: TS1005 errors reduced or stayed same (no increase)
      if (errorReduction >= 0) {
        console.log(`   ✅ SUCCESS - TS1005 errors reduced or maintained`);
        this.successfulFiles.push({
          file: filePath,
          initialErrors: initialTS1005Errors,
          finalErrors: finalTS1005Errors,
          fixes,
          errorReduction,
        });
        return { success: true, fixes, errorReduction };
      } else {
        console.log(`   ❌ FAILED - TS1005 errors increased, restoring`);
        fs.writeFileSync(filePath, originalContent);
        return { success: false, fixes: 0, errorReduction: 0 };
      }
    } catch (error) {
      console.error(`   ❌ Error processing file: ${error.message}`);
      return { success: false, fixes: 0, errorReduction: 0 };
    }
  }

  async repair() {
    console.log("🎯 SIMPLE TS1005 FIXER");
    console.log("=".repeat(50));
    console.log("Strategy: Focus ONLY on TS1005 errors");

    const startTime = Date.now();
    const initialTS1005 = this.getTS1005ErrorCount();

    console.log(`📊 Initial TS1005 errors: ${initialTS1005}`);

    const files = this.getFilesWithTS1005Errors();
    console.log(`📁 Found ${files.length} files with TS1005 errors`);

    if (files.length === 0) {
      console.log("🎉 No files with TS1005 errors found!");
      return { initialTS1005, finalTS1005: initialTS1005, ts1005Reduction: 0 };
    }

    console.log(`\n🔄 Processing ${Math.min(files.length, 20)} files...`);

    for (let i = 0; i < Math.min(files.length, 20); i++) {
      const filePath = files[i];
      console.log(`\n📦 File ${i + 1}/${Math.min(files.length, 20)}`);

      const result = await this.processFile(filePath);
      if (result.success) {
        this.processedFiles++;
        this.totalFixes += result.fixes;
      }

      if ((i + 1) % 5 === 0) {
        const currentTS1005 = this.getTS1005ErrorCount();
        console.log(`\n📊 Progress: ${currentTS1005} TS1005 errors remaining`);
      }
    }

    const endTime = Date.now();
    const finalTS1005 = this.getTS1005ErrorCount();
    const ts1005Reduction = initialTS1005 - finalTS1005;
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n" + "=".repeat(50));
    console.log("🏁 SIMPLE TS1005 FIXING COMPLETED");
    console.log("=".repeat(50));
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(
      `📝 Files processed: ${this.processedFiles}/${Math.min(files.length, 20)}`,
    );
    console.log(`🎯 Total fixes applied: ${this.totalFixes}`);
    console.log(`📊 TS1005 errors: ${initialTS1005} → ${finalTS1005}`);
    console.log(
      `📉 TS1005 reduction: ${ts1005Reduction} (${((ts1005Reduction / initialTS1005) * 100).toFixed(1)}%)`,
    );

    if (this.successfulFiles.length > 0) {
      console.log(`\n✅ Successful files (${this.successfulFiles.length}):`);
      this.successfulFiles.slice(0, 10).forEach((file) => {
        const percentage =
          file.initialErrors > 0
            ? ((file.errorReduction / file.initialErrors) * 100).toFixed(1)
            : "0.0";
        console.log(
          `   ${path.basename(file.file)}: ${file.initialErrors} → ${file.finalErrors} TS1005 (${percentage}%)`,
        );
      });
    }

    if (ts1005Reduction > 0) {
      console.log(`\n✅ SUCCESS: Reduced ${ts1005Reduction} TS1005 errors`);
    } else {
      console.log(`\n⚠️ No TS1005 reduction achieved`);
    }

    console.log(`💾 Backups saved in: ${this.backupDir}`);

    return {
      initialTS1005,
      finalTS1005,
      ts1005Reduction,
      filesProcessed: this.processedFiles,
    };
  }
}

if (require.main === module) {
  const fixer = new SimpleTS1005Fixer();
  fixer
    .repair()
    .then((results) => {
      console.log("\n📋 Simple TS1005 fixing completed");
      if (results.ts1005Reduction > 0) {
        console.log("✅ Progress made on TS1005 errors");
        process.exit(0);
      } else {
        console.log("⚠️ No TS1005 progress made");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("\n❌ Simple TS1005 fixing failed:", error);
      process.exit(1);
    });
}

module.exports = SimpleTS1005Fixer;
