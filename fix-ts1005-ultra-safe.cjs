#!/usr/bin/env node

/**
 * Ultra Safe TS1005 Fixes
 *
 * This script fixes TS1005 patterns one file at a time with immediate validation:
 * 1. catch (error): any { -> catch (error) {
 * 2. test('...': any, async () => { -> test('...', async () => {
 * 3. it('...': any, async () => { -> it('...', async () => {
 *
 * Safety: Process 1 file at a time with build validation after each
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005UltraSafeFixer {
  constructor(options = {}) {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.dryRun = options.dryRun || false;
  }

  async run() {
    const mode = this.dryRun ? "DRY-RUN" : "EXECUTION";
    console.log(`🔧 Starting TS1005 Ultra Safe Fixes (${mode})...\n`);

    if (this.dryRun) {
      console.log(
        "🔍 DRY-RUN MODE: No files will be modified, only showing what would be changed\n",
      );
    }

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

      // Apply ultra safe fixes - one file at a time
      console.log("\n🛠️ Applying ultra safe fixes (1 file at a time)...");

      let processedCount = 0;
      for (const filePath of errorFiles) {
        processedCount++;
        console.log(
          `\n📦 Processing file ${processedCount}/${errorFiles.length}: ${path.basename(filePath)}`,
        );

        const fixes = await this.fixFileUltraSafe(filePath);

        if (fixes > 0 && !this.dryRun) {
          console.log(`   🔍 Validating build after ${fixes} fixes...`);
          const buildSuccess = this.validateBuild();
          if (!buildSuccess) {
            console.log("   ⚠️ Build validation failed, reverting file...");
            execSync(`git checkout -- "${filePath}"`);
            console.log("   ⚠️ Stopping fixes due to build failure");
            break;
          } else {
            console.log("   ✅ Build validation passed");
          }

          // Check progress
          const currentErrors = this.getTS1005ErrorCount();
          console.log(`   📊 Current TS1005 errors: ${currentErrors}`);
        } else if (fixes > 0 && this.dryRun) {
          console.log(
            `   🔍 DRY-RUN: Would validate build after ${fixes} fixes`,
          );
        }

        // Stop after processing 10 files to avoid overwhelming output
        if (processedCount >= 10) {
          console.log(
            `\n⏸️ Stopping after processing ${processedCount} files for safety`,
          );
          break;
        }
      }

      // Final results
      if (!this.dryRun) {
        const finalErrors = this.getTS1005ErrorCount();
        const reduction = initialErrors - finalErrors;
        const percentage =
          reduction > 0
            ? ((reduction / initialErrors) * 100).toFixed(1)
            : "0.0";

        console.log(`\n📈 Final Results:`);
        console.log(`   Initial errors: ${initialErrors}`);
        console.log(`   Final errors: ${finalErrors}`);
        console.log(`   Errors fixed: ${reduction}`);
        console.log(`   Reduction: ${percentage}%`);
        console.log(`   Files processed: ${this.fixedFiles.length}`);
        console.log(`   Total fixes applied: ${this.totalFixes}`);
      } else {
        console.log(`\n📈 DRY-RUN Results:`);
        console.log(`   Initial errors: ${initialErrors}`);
        console.log(`   Potential fixes: ${this.totalFixes}`);
        console.log(
          `   Files that would be processed: ${this.fixedFiles.length}`,
        );
        console.log(`   \n✅ DRY-RUN COMPLETE - No files were modified`);
        console.log(`   To apply these fixes, run without --dry-run flag`);
      }
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

  validateBuild() {
    try {
      execSync("yarn tsc --noEmit --skipLibCheck", {
        encoding: "utf8",
        stdio: "pipe",
      });
      return true;
    } catch (error) {
      return false;
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

  async fixFileUltraSafe(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: catch (error): any { -> catch (error) {
      // Very specific pattern for malformed catch clauses
      const catchPattern = /catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*\{/g;
      const catchMatches = content.match(catchPattern);
      if (catchMatches) {
        content = content.replace(catchPattern, "catch ($1) {");
        fixesApplied += catchMatches.length;
      }

      // Fix 2: test('...': any, async () => { -> test('...', async () => {
      // Very specific pattern for malformed test signatures
      const testPattern =
        /test\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
      const testMatches = content.match(testPattern);
      if (testMatches) {
        content = content.replace(testPattern, "test($1, async () =>");
        fixesApplied += testMatches.length;
      }

      // Fix 3: it('...': any, async () => { -> it('...', async () => {
      // Very specific pattern for malformed it signatures
      const itPattern =
        /it\s*\(\s*([^,]+)\s*:\s*any\s*,\s*async\s*\(\s*\)\s*=>/g;
      const itMatches = content.match(itPattern);
      if (itMatches) {
        content = content.replace(itPattern, "it($1, async () =>");
        fixesApplied += itMatches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, content, "utf8");
          console.log(
            `   ✅ ${path.basename(filePath)}: ${fixesApplied} fixes applied`,
          );
        } else {
          console.log(
            `   🔍 ${path.basename(filePath)}: ${fixesApplied} fixes would be applied (DRY-RUN)`,
          );
        }
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        return fixesApplied;
      }

      return 0;
    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const fixer = new TS1005UltraSafeFixer({ dryRun });
  fixer.run().catch(console.error);
}

module.exports = TS1005UltraSafeFixer;
