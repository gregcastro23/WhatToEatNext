#!/usr/bin/env node

/**
 * Comprehensive Safe TS1005 Fixes
 *
 * This script fixes the most common TS1005 patterns safely:
 * 1. test('...', any, async () => { -> test('...', async () => {
 * 2. it('...', any, async () => { -> it('...', async () => {
 * 3. catch (error): any { -> catch (error) {
 * 4. results.[0] -> results[0]
 * 5. .filter(; -> .filter(
 * 6. as any mockVar -> as any
 *
 * Target: ~1700 → ~150 errors (90%+ reduction)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005ComprehensiveSafeFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log("🔧 Starting TS1005 Comprehensive Safe Fixes...\n");

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

      // Apply comprehensive safe fixes
      console.log("\n🛠️ Applying comprehensive safe fixes...");
      const batchSize = 20;

      for (let i = 0; i < errorFiles.length; i += batchSize) {
        const batch = errorFiles.slice(i, i + batchSize);
        console.log(
          `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(errorFiles.length / batchSize)} (${batch.length} files)`,
        );

        for (const filePath of batch) {
          await this.fixFileComprehensive(filePath);
        }

        // Check progress after each batch
        const currentErrors = this.getTS1005ErrorCount();
        console.log(`   📊 Current TS1005 errors: ${currentErrors}`);

        // Safety check - if errors increase, stop
        if (currentErrors > initialErrors) {
          console.log("⚠️ Error count increased, stopping fixes");
          break;
        }
      }

      // Final results
      const finalErrors = this.getTS1005ErrorCount();
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);

      console.log(`\n📈 Final Results:`);
      console.log(`   Initial errors: ${initialErrors}`);
      console.log(`   Final errors: ${finalErrors}`);
      console.log(`   Errors fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.fixedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);

      if (finalErrors <= 150) {
        console.log(
          "🎉 Target achieved! TS1005 errors reduced to target level.",
        );
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

  async fixFileComprehensive(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: test('...', any, async () => { -> test('...', async () => {
      const testMatches = content.match(
        /test\s*\(\s*[^,]+\s*,\s*any\s*,\s*async\s*\(\s*\)\s*=>/g,
      );
      if (testMatches) {
        content = content.replace(
          /test\s*\(\s*([^,]+)\s*,\s*any\s*,\s*async\s*\(\s*\)\s*=>/g,
          "test($1, async () =>",
        );
        fixesApplied += testMatches.length;
      }

      // Fix 2: it('...', any, async () => { -> it('...', async () => {
      const itMatches = content.match(
        /it\s*\(\s*[^,]+\s*,\s*any\s*,\s*async\s*\(\s*\)\s*=>/g,
      );
      if (itMatches) {
        content = content.replace(
          /it\s*\(\s*([^,]+)\s*,\s*any\s*,\s*async\s*\(\s*\)\s*=>/g,
          "it($1, async () =>",
        );
        fixesApplied += itMatches.length;
      }

      // Fix 3: catch (error): any { -> catch (error) {
      const catchMatches = content.match(
        /catch\s*\(\s*[^)]+\s*\)\s*:\s*any\s*\{/g,
      );
      if (catchMatches) {
        content = content.replace(
          /catch\s*\(\s*([^)]+)\s*\)\s*:\s*any\s*\{/g,
          "catch ($1) {",
        );
        fixesApplied += catchMatches.length;
      }

      // Fix 4: results.[0] -> results[0] (array access)
      const arrayAccessMatches = content.match(/\w+\.\[\d+\]/g);
      if (arrayAccessMatches) {
        content = content.replace(/(\w+)\.\[(\d+)\]/g, "$1[$2]");
        fixesApplied += arrayAccessMatches.length;
      }

      // Fix 5: .filter(; -> .filter( (incomplete filter calls)
      const filterMatches = content.match(/\.filter\(\s*;\s*$/gm);
      if (filterMatches) {
        content = content.replace(/\.filter\(\s*;\s*$/gm, ".filter(");
        fixesApplied += filterMatches.length;
      }

      // Fix 6: as any mockVar -> as any (remove extra identifier)
      const asAnyMatches = content.match(/as\s+any\s+\w+/g);
      if (asAnyMatches) {
        content = content.replace(/as\s+any\s+\w+/g, "as any");
        fixesApplied += asAnyMatches.length;
      }

      // Fix 7: MockedFunction<; -> MockedFunction< (incomplete generic)
      const mockedFunctionMatches = content.match(/MockedFunction<\s*;\s*$/gm);
      if (mockedFunctionMatches) {
        content = content.replace(
          /MockedFunction<\s*;\s*$/gm,
          "MockedFunction<",
        );
        fixesApplied += mockedFunctionMatches.length;
      }

      // Fix 8: Record<string, PlanetPosition> = { -> Record<string, PlanetPosition> = {
      const recordMatches = content.match(/Record<[^>]+>\s*=\s*\(\s*\{/g);
      if (recordMatches) {
        content = content.replace(
          /Record<([^>]+)>\s*=\s*\(\s*\{/g,
          "Record<$1> = {",
        );
        fixesApplied += recordMatches.length;
      }

      // Fix 9: })); -> })
      const extraParenMatches = content.match(/\}\)\);/g);
      if (extraParenMatches) {
        content = content.replace(/\}\)\);/g, "});");
        fixesApplied += extraParenMatches.length;
      }

      // Fix 10: Remove trailing commas in function calls
      const trailingCommaMatches = content.match(/,\s*\)/g);
      if (trailingCommaMatches) {
        content = content.replace(/,\s*\)/g, ")");
        fixesApplied += trailingCommaMatches.length;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        this.fixedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(
          `   ✅ ${path.basename(filePath)}: ${fixesApplied} fixes applied`,
        );
      }
    } catch (error) {
      console.log(`   ❌ Error fixing ${filePath}: ${error.message}`);
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new TS1005ComprehensiveSafeFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005ComprehensiveSafeFixer;
