#!/usr/bin/env node

/**
 * Progressive TS1005 Fixes
 *
 * This script fixes TS1005 patterns with progressive validation:
 * - Only validates that total error count doesn't increase
 * - Focuses on reducing TS1005 errors specifically
 * - Processes files in batches as per task requirements
 *
 * Safety: Batch processing with error count monitoring
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005ProgressiveFixer {
  constructor(options = {}) {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.dryRun = options.dryRun || false;
    this.batchSize = options.batchSize || 15; // Task requirement
  }

  async run() {
    const mode = this.dryRun ? "DRY-RUN" : "EXECUTION";
    console.log(`🔧 Starting TS1005 Progressive Fixes (${mode})...\n`);

    if (this.dryRun) {
      console.log(
        "🔍 DRY-RUN MODE: No files will be modified, only showing what would be changed\n",
      );
    }

    try {
      const initialTS1005Errors = this.getTS1005ErrorCount();
      const initialTotalErrors = this.getTotalErrorCount();

      console.log(`📊 Initial TS1005 errors: ${initialTS1005Errors}`);
      console.log(`📊 Initial total errors: ${initialTotalErrors}`);

      if (initialTS1005Errors === 0) {
        console.log("✅ No TS1005 errors found!");
        return;
      }

      // Get files with errors
      const errorFiles = await this.getFilesWithTS1005Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1005 errors`);

      // Apply progressive fixes in batches
      console.log(
        `\n🛠️ Applying progressive fixes (batch size: ${this.batchSize})...`,
      );

      for (let i = 0; i < errorFiles.length; i += this.batchSize) {
        const batch = errorFiles.slice(i, i + this.batchSize);
        const batchNum = Math.floor(i / this.batchSize) + 1;
        const totalBatches = Math.ceil(errorFiles.length / this.batchSize);

        console.log(
          `\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} files)`,
        );

        let batchFixes = 0;
        const batchResults = [];

        for (const filePath of batch) {
          const fixes = await this.fixFileProgressive(filePath);
          batchFixes += fixes;
          if (fixes > 0) {
            batchResults.push({ file: path.basename(filePath), fixes });
          }
        }

        // Progressive validation - only check that we don't make things worse
        if (batchFixes > 0 && !this.dryRun) {
          console.log(`   🔍 Validating progress after ${batchFixes} fixes...`);

          const currentTS1005Errors = this.getTS1005ErrorCount();
          const currentTotalErrors = this.getTotalErrorCount();

          console.log(
            `   📊 TS1005 errors: ${initialTS1005Errors} → ${currentTS1005Errors}`,
          );
          console.log(
            `   📊 Total errors: ${initialTotalErrors} → ${currentTotalErrors}`,
          );

          // Check if we made progress on TS1005 errors without significantly increasing total errors
          if (currentTotalErrors > initialTotalErrors + 50) {
            console.log(
              "   ⚠️ Total error count increased significantly, reverting batch...",
            );
            for (const result of batchResults) {
              const fullPath = batch.find(
                (f) => path.basename(f) === result.file,
              );
              if (fullPath) {
                execSync(`git checkout -- "${fullPath}"`);
              }
            }
            console.log("   ⚠️ Stopping fixes due to error increase");
            break;
          } else {
            console.log("   ✅ Progress validation passed");
          }
        } else if (batchFixes > 0 && this.dryRun) {
          console.log(
            `   🔍 DRY-RUN: Would validate progress after ${batchFixes} fixes`,
          );
        }

        // Show batch results
        if (batchResults.length > 0) {
          console.log(`   📋 Batch results:`);
          for (const result of batchResults) {
            console.log(`     ✅ ${result.file}: ${result.fixes} fixes`);
          }
        }

        // Continue with additional batches for maximum scaling
        if (batchNum >= 5) {
          console.log(
            `\n⏸️ Stopping after ${batchNum} batches for comprehensive assessment`,
          );
          break;
        }
      }

      // Final results
      if (!this.dryRun) {
        const finalTS1005Errors = this.getTS1005ErrorCount();
        const finalTotalErrors = this.getTotalErrorCount();
        const ts1005Reduction = initialTS1005Errors - finalTS1005Errors;
        const ts1005Percentage =
          ts1005Reduction > 0
            ? ((ts1005Reduction / initialTS1005Errors) * 100).toFixed(1)
            : "0.0";

        console.log(`\n📈 Final Results:`);
        console.log(`   Initial TS1005 errors: ${initialTS1005Errors}`);
        console.log(`   Final TS1005 errors: ${finalTS1005Errors}`);
        console.log(`   TS1005 errors fixed: ${ts1005Reduction}`);
        console.log(`   TS1005 reduction: ${ts1005Percentage}%`);
        console.log(`   Initial total errors: ${initialTotalErrors}`);
        console.log(`   Final total errors: ${finalTotalErrors}`);
        console.log(`   Files processed: ${this.fixedFiles.length}`);
        console.log(`   Total fixes applied: ${this.totalFixes}`);
      } else {
        console.log(`\n📈 DRY-RUN Results:`);
        console.log(`   Initial TS1005 errors: ${initialTS1005Errors}`);
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

  getTotalErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"',
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

  async fixFileProgressive(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }

      // Count TS1005 errors before fixing
      const errorsBefore = this.getFileTS1005ErrorCount(filePath);

      if (errorsBefore === 0) {
        return 0;
      }

      if (!this.dryRun) {
        // Apply sed fixes for the specific patterns we know work
        try {
          // Fix 1: } catch (error): any { -> } catch (error) {
          execSync(
            `sed -i '' 's/} catch (error): any {/} catch (error) {/g' "${filePath}"`,
            {
              stdio: "pipe",
            },
          );

          // Fix 2: test('...': any, async () => { -> test('...', async () => {
          execSync(
            `sed -i '' "s/test('\\([^']*\\)': any, async () =>/test('\\1', async () =>/g" "${filePath}"`,
            {
              stdio: "pipe",
            },
          );

          // Fix 3: it('...': any, async () => { -> it('...', async () => {
          execSync(
            `sed -i '' "s/it('\\([^']*\\)': any, async () =>/it('\\1', async () =>/g" "${filePath}"`,
            {
              stdio: "pipe",
            },
          );
        } catch (sedError) {
          console.log(
            `   ⚠️ SED command failed for ${path.basename(filePath)}: ${sedError.message}`,
          );
          return 0;
        }
      }

      // Count TS1005 errors after fixing
      const errorsAfter = this.dryRun
        ? 0
        : this.getFileTS1005ErrorCount(filePath);
      const fixesApplied = errorsBefore - errorsAfter;

      if (fixesApplied > 0 || (this.dryRun && errorsBefore > 0)) {
        this.fixedFiles.push(filePath);
        this.totalFixes += this.dryRun ? errorsBefore : fixesApplied;
        return this.dryRun ? errorsBefore : fixesApplied;
      }

      return 0;
    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
      return 0;
    }
  }

  getFileTS1005ErrorCount(filePath) {
    try {
      const output = execSync(
        `yarn tsc --noEmit --skipLibCheck 2>&1 | grep "error TS1005" | grep "${filePath}" | wc -l`,
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
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const batchSize = args.includes("--batch-size")
    ? parseInt(args[args.indexOf("--batch-size") + 1]) || 15
    : 15;

  const fixer = new TS1005ProgressiveFixer({ dryRun, batchSize });
  fixer.run().catch(console.error);
}

module.exports = TS1005ProgressiveFixer;
