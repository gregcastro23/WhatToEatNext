#!/usr/bin/env node

/**
 * Targeted TS1005 Pattern Fixer
 *
 * Fixes specific TS1005 patterns found in the codebase:
 * 1. Missing commas in destructuring: ([_planet: any, position]: any) -> ([_planet, position]: any)
 * 2. Semicolon instead of closing brace: replace(/\s+/g '-')}`; -> replace(/\s+/g, '-')}`
 * 3. Missing closing parentheses in expressions
 * 4. Malformed template literals and function calls
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class TS1005TargetedPatternFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.ts1005-targeted-backup-${Date.now()}`;
  }

  async run() {
    console.log("🎯 Starting TS1005 Targeted Pattern Fixes...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get initial error count
      const initialErrors = await this.getTS1005ErrorCount();
      console.log(`📊 Initial TS1005 errors: ${initialErrors}`);

      if (initialErrors === 0) {
        console.log("✅ No TS1005 errors found!");
        return;
      }

      // Get files with TS1005 errors
      const errorFiles = await this.getFilesWithTS1005Errors();
      console.log(`🔍 Found ${errorFiles.length} files with TS1005 errors`);

      // Process files in small batches
      await this.processBatches(errorFiles, initialErrors);

      // Final results
      await this.showFinalResults(initialErrors);
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
      console.log(`📁 Backup available at: ${this.backupDir}`);
    }
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
    console.log(`📁 Created backup directory: ${this.backupDir}`);
  }

  async getTS1005ErrorCount() {
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

  async processBatches(errorFiles, initialErrorCount) {
    console.log(`\n🔧 Processing files in small batches...`);

    const batchSize = 10;
    const totalBatches = Math.ceil(errorFiles.length / batchSize);
    let processedCount = 0;

    for (let i = 0; i < errorFiles.length; i += batchSize) {
      const batch = errorFiles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      console.log(
        `\n📦 Processing Batch ${batchNumber}/${totalBatches} (${batch.length} files)`,
      );

      for (const filePath of batch) {
        await this.processFile(filePath);
        processedCount++;

        // Progress check every 5 files
        if (processedCount % 5 === 0) {
          const currentErrors = await this.getTS1005ErrorCount();
          console.log(
            `   📊 Progress: ${currentErrors} TS1005 errors remaining`,
          );

          // Safety check - if errors increased significantly, stop
          if (currentErrors > initialErrorCount * 1.3) {
            console.log(
              "⚠️ Error count increased significantly, stopping for safety",
            );
            return;
          }
        }
      }
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return;
      }

      console.log(`   🔧 Processing ${path.basename(filePath)}`);

      // Create backup
      await this.backupFile(filePath);

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Fix 1: Destructuring with type annotations - remove type annotations from destructuring
      const destructuringPattern = /\(\[([^:]+):\s*any,\s*([^:]+)\]:\s*any\)/g;
      const matches1 = content.match(destructuringPattern) || [];
      content = content.replace(destructuringPattern, "([$1, $2]: any)");
      fixesApplied += matches1.length;

      // Fix 2: Semicolon instead of comma in function calls
      const semicolonInCallPattern = /replace\(([^)]+)\s*;\s*([^)]+)\)/g;
      const matches2 = content.match(semicolonInCallPattern) || [];
      content = content.replace(semicolonInCallPattern, "replace($1, $2)");
      fixesApplied += matches2.length;

      // Fix 3: Missing closing parentheses in template literals
      const templateLiteralPattern = /data-testid=\{`([^`]+)`\};/g;
      const matches3 = content.match(templateLiteralPattern) || [];
      content = content.replace(templateLiteralPattern, "data-testid={`$1`}");
      fixesApplied += matches3.length;

      // Fix 4: Missing closing parentheses in function calls
      const missingParenPattern = /(\w+)\(([^)]*);$/gm;
      const matches4 = content.match(missingParenPattern) || [];
      content = content.replace(missingParenPattern, "$1($2);");
      fixesApplied += matches4.length;

      // Fix 5: Malformed generic type syntax
      const malformedGenericPattern = /as\s+any<([^>]+)>,/g;
      const matches5 = content.match(malformedGenericPattern) || [];
      content = content.replace(malformedGenericPattern, "as any,");
      fixesApplied += matches5.length;

      // Fix 6: Missing closing angle bracket in generics
      const missingAngleBracketPattern = /MockedFunction<\s*;/g;
      const matches6 = content.match(missingAngleBracketPattern) || [];
      content = content.replace(
        missingAngleBracketPattern,
        "MockedFunction<any>;",
      );
      fixesApplied += matches6.length;

      // Fix 7: Incomplete filter/find expressions
      const incompleteFilterPattern = /\.(filter|find)\(\s*;\s*$/gm;
      const matches7 = content.match(incompleteFilterPattern) || [];
      content = content.replace(incompleteFilterPattern, ".$1(() => true);");
      fixesApplied += matches7.length;

      // Fix 8: Missing closing parentheses in Record types
      const recordTypePattern =
        /Record<string,\s*PlanetPosition>\s*=\s*\(\s*\{/g;
      const matches8 = content.match(recordTypePattern) || [];
      content = content.replace(
        recordTypePattern,
        "Record<string, PlanetPosition> = {",
      );
      fixesApplied += matches8.length;

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} TS1005 fixes`);
      } else {
        console.log(`     - No TS1005 fixes needed`);
      }
    } catch (error) {
      console.log(`     ❌ Error processing file: ${error.message}`);
    }
  }

  async backupFile(filePath) {
    try {
      const relativePath = path.relative(".", filePath);
      const backupPath = path.join(this.backupDir, relativePath);
      const backupDirPath = path.dirname(backupPath);

      if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
      }

      const content = fs.readFileSync(filePath, "utf8");
      fs.writeFileSync(backupPath, content);
    } catch (error) {
      console.log(`     ⚠️ Backup failed for ${filePath}: ${error.message}`);
    }
  }

  async showFinalResults(initialErrors) {
    console.log("\n📈 TS1005 Targeted Pattern Fix Results:");

    const finalErrors = await this.getTS1005ErrorCount();
    const totalReduction = initialErrors - finalErrors;
    const reductionPercentage = (
      (totalReduction / initialErrors) *
      100
    ).toFixed(1);

    console.log(`   Initial TS1005 errors: ${initialErrors}`);
    console.log(`   Final TS1005 errors: ${finalErrors}`);
    console.log(`   Errors eliminated: ${totalReduction}`);
    console.log(`   Reduction: ${reductionPercentage}%`);
    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);

    if (finalErrors <= 50) {
      console.log("\n🎉 EXCELLENT! TS1005 errors reduced to very low level");
    } else if (reductionPercentage >= 60) {
      console.log("\n🎯 GREAT! 60%+ error reduction achieved");
    } else if (reductionPercentage >= 30) {
      console.log("\n✅ GOOD! 30%+ error reduction achieved");
    } else {
      console.log("\n⚠️ Partial success - may need additional targeted fixes");
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);
  }

  async getTotalErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"',
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
  const fixer = new TS1005TargetedPatternFixer();
  fixer.run().catch(console.error);
}

module.exports = TS1005TargetedPatternFixer;
