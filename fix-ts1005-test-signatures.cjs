#!/usr/bin/env node

/**
 * TS1005 Test Signature Fixer
 *
 * This script fixes malformed test function signatures:
 * test('...': any, async () => { -> test('...', async () => {
 * it('...': any, async () => { -> it('...', async () => {
 *
 * Very specific and safe pattern matching.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005TestSignatureFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log("🔧 Starting TS1005 Test Signature Fixes...\n");

    try {
      const initialErrors = this.getTS1005ErrorCount();
      console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log("✅ No TS1005 errors found!");
        return;
      }

      // Get files with errors
      const errorFiles = await this.getFilesWithTS1005Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1005 errors`);

      // Apply test signature fixes
      console.log("\n🛠️ Applying test signature fixes...");

      for (const filePath of errorFiles) {
        await this.fixTestSignatures(filePath);
      }

      // Final results
      const finalErrors = this.getTS1005ErrorCount();
      const reduction = initialErrors - finalErrors;
      const percentage =
        reduction > 0 ? ((reduction / initialErrors) * 100).toFixed(1) : "0.0";

      console.log(`\n📈 Final Results:`);
      console.log(`   Initial errors: ${initialErrors}`);
      console.log(`   Final errors: ${finalErrors}`);
      console.log(`   Errors fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.fixedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);
    } catch (error) {
      console.error("❌ Error during fixing:", error.message);
    }
  }

  getTS1005ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | wc -l',
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

  async getFilesWithTS1005Errors() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005"',
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

  async fixTestSignatures(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: test('...': any, async () => { -> test('...', async () => {
      const testPattern =
        /(test\s*\(\s*[^:]+):\s*any\s*,\s*(async\s*\(\s*\)\s*=>)/g;
      const testMatches = content.match(testPattern);
      if (testMatches) {
        content = content.replace(testPattern, "$1, $2");
        fixesApplied += testMatches.length;
      }

      // Fix 2: it('...': any, async () => { -> it('...', async () => {
      const itPattern =
        /(it\s*\(\s*[^:]+):\s*any\s*,\s*(async\s*\(\s*\)\s*=>)/g;
      const itMatches = content.match(itPattern);
      if (itMatches) {
        content = content.replace(itPattern, "$1, $2");
        fixesApplied += itMatches.length;
      }

      // Fix 3: describe('...': any, () => { -> describe('...', () => {
      const describePattern =
        /(describe\s*\(\s*[^:]+):\s*any\s*,\s*(\(\s*\)\s*=>)/g;
      const describeMatches = content.match(describePattern);
      if (describeMatches) {
        content = content.replace(describePattern, "$1, $2");
        fixesApplied += describeMatches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(
          `   ✅ ${path.basename(filePath)}: ${fixesApplied} test signature fixes applied`,
        );
      }
    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005TestSignatureFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005TestSignatureFixer;
