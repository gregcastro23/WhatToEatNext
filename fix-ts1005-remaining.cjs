#!/usr/bin/env node

/**
 * Fix Remaining TS1005 Errors
 *
 * This script fixes the remaining common patterns:
 * 1. results.[0] -> results[0] (array access)
 * 2. .filter(; -> .filter(item => (incomplete filter)
 * 3. as any mockVar -> as any (remove extra identifier)
 * 4. MockedFunction<; -> MockedFunction<any> (incomplete generic)
 * 5. byPriority: { , -> byPriority: { (remove leading comma)
 *
 * Target: Reduce remaining ~213 errors to ~150 or less
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005RemainingFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  async run() {
    console.log("🔧 Starting TS1005 Remaining Fixes...\n");

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

      // Apply remaining fixes
      console.log("\n🛠️ Applying remaining fixes...");
      for (const filePath of errorFiles) {
        await this.fixFileRemaining(filePath);
      }

      // Final results
      const finalErrors = this.getTS1005ErrorCount();
      const reduction = initialErrors - finalErrors;
      const percentage = ((reduction / initialErrors) * 100).toFixed(1);

      console.log(`\n📈 Results:`);
      console.log(`   Initial errors: ${initialErrors}`);
      console.log(`   Final errors: ${finalErrors}`);
      console.log(`   Errors fixed: ${reduction}`);
      console.log(`   Reduction: ${percentage}%`);
      console.log(`   Files processed: ${this.fixedFiles.length}`);

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

  async fixFileRemaining(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: results.[0] -> results[0] (array access)
      const arrayAccessMatches = content.match(/\w+\.\[\d+\]/g);
      if (arrayAccessMatches) {
        content = content.replace(/(\w+)\.\[(\d+)\]/g, "$1[$2]");
        fixesApplied += arrayAccessMatches.length;
      }

      // Fix 2: .filter(; -> .filter(item => (incomplete filter)
      const incompleteFilterMatches = content.match(/\.filter\(\s*;\s*$/gm);
      if (incompleteFilterMatches) {
        content = content.replace(/\.filter\(\s*;\s*$/gm, ".filter(item =>");
        fixesApplied += incompleteFilterMatches.length;
      }

      // Fix 3: .some(; -> .some(item => (incomplete some)
      const incompleteSomeMatches = content.match(/\.some\(\s*;\s*$/gm);
      if (incompleteSomeMatches) {
        content = content.replace(/\.some\(\s*;\s*$/gm, ".some(item =>");
        fixesApplied += incompleteSomeMatches.length;
      }

      // Fix 4: .find(; -> .find(item => (incomplete find)
      const incompleteFindMatches = content.match(/\.find\(\s*;\s*$/gm);
      if (incompleteFindMatches) {
        content = content.replace(/\.find\(\s*;\s*$/gm, ".find(item =>");
        fixesApplied += incompleteFindMatches.length;
      }

      // Fix 5: as any mockVar -> as any (remove extra identifier)
      const asAnyExtraMatches = content.match(/as\s+any\s+\w+/g);
      if (asAnyExtraMatches) {
        content = content.replace(/as\s+any\s+\w+/g, "as any");
        fixesApplied += asAnyExtraMatches.length;
      }

      // Fix 6: MockedFunction<; -> MockedFunction<any> (incomplete generic)
      const incompleteMockedFunctionMatches = content.match(
        /MockedFunction<\s*;\s*$/gm,
      );
      if (incompleteMockedFunctionMatches) {
        content = content.replace(
          /MockedFunction<\s*;\s*$/gm,
          "MockedFunction<any>",
        );
        fixesApplied += incompleteMockedFunctionMatches.length;
      }

      // Fix 7: byPriority: { , -> byPriority: { (remove leading comma in object)
      const leadingCommaMatches = content.match(/:\s*\{\s*,/g);
      if (leadingCommaMatches) {
        content = content.replace(/:\s*\{\s*,/g, ": {");
        fixesApplied += leadingCommaMatches.length;
      }

      // Fix 8: })); -> }) (extra parentheses)
      const extraParenMatches = content.match(/\}\)\);/g);
      if (extraParenMatches) {
        content = content.replace(/\}\)\);/g, "});");
        fixesApplied += extraParenMatches.length;
      }

      // Fix 9: await (; -> await (remove incomplete parentheses)
      const incompleteAwaitMatches = content.match(/await\s*\(\s*;\s*$/gm);
      if (incompleteAwaitMatches) {
        content = content.replace(/await\s*\(\s*;\s*$/gm, "await");
        fixesApplied += incompleteAwaitMatches.length;
      }

      // Fix 10: as any<Type> -> as any (remove invalid generic on any)
      const invalidAnyGenericMatches = content.match(/as\s+any<[^>]*>/g);
      if (invalidAnyGenericMatches) {
        content = content.replace(/as\s+any<[^>]*>/g, "as any");
        fixesApplied += invalidAnyGenericMatches.length;
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
  const fixer = new TS1005RemainingFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005RemainingFixer;
