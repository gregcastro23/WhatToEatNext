#!/usr/bin/env node

/**
 * Fix Remaining Identifier Syntax Issues
 *
 * Addresses TS1434 errors and other identifier-related syntax problems:
 * 1. Malformed template literal expressions
 * 2. Variable declaration syntax issues
 * 3. Import statement syntax problems
 * 4. Function definition syntax issues
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class IdentifierSyntaxFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.backupDir = `.identifier-syntax-backup-${Date.now()}`;
  }

  async run() {
    console.log("🎯 Fixing Remaining Identifier Syntax Issues...\n");

    try {
      // Create backup directory
      this.createBackupDir();

      // Get files with identifier-related errors
      const errorFiles = await this.getFilesWithIdentifierErrors();
      console.log(
        `🔍 Found ${errorFiles.length} files with identifier syntax issues`,
      );

      if (errorFiles.length === 0) {
        console.log("✅ No identifier syntax issues found!");
        return;
      }

      // Process each file
      for (const filePath of errorFiles) {
        await this.processFile(filePath);
      }

      // Final results
      await this.showFinalResults();
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

  async getFilesWithIdentifierErrors() {
    try {
      // Get files with TS1434 errors (unexpected keyword or identifier)
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -E "error TS1434|identifier"',
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

      // Fix 1: Malformed template literal expressions split across lines
      // Pattern: ${Object.entries(something)}\n  .map(...) -> ${Object.entries(something).map(...)}
      const multilineTemplatePattern =
        /\$\{([^}]+)\}\s*\n\s*\.(\w+)\(([^)]+)\)\s*\n\s*\.(\w+)\(([^)]+)\)/g;
      const templateMatches = content.match(multilineTemplatePattern) || [];
      content = content.replace(
        multilineTemplatePattern,
        "${$1.$2($3).$4($5)}",
      );
      fixesApplied += templateMatches.length;

      // Fix 2: Template literal expressions that are not properly enclosed
      // Look for patterns where Object.entries() is not in ${} but should be
      const unenclosedObjectPattern = /^(\s*)Object\.entries\(([^)]+)\)\s*$/gm;
      const objectMatches = content.match(unenclosedObjectPattern) || [];
      content = content.replace(
        unenclosedObjectPattern,
        "$1${Object.entries($2)}",
      );
      fixesApplied += objectMatches.length;

      // Fix 3: Malformed variable declarations
      // Pattern: let variable.property = value -> let variable = value
      const malformedVarPattern = /(let|const|var)\s+(\w+)\.(\w+)\s*=/g;
      const varMatches = content.match(malformedVarPattern) || [];
      content = content.replace(malformedVarPattern, "$1 $2 =");
      fixesApplied += varMatches.length;

      // Fix 4: Malformed import statements
      // Pattern: import { something.property } -> import { something }
      const malformedImportPattern = /import\s*\{\s*([^}]*\.[^}]*)\s*\}/g;
      const importMatches = content.match(malformedImportPattern) || [];
      content = content.replace(malformedImportPattern, (match, imports) => {
        const cleanImports = imports
          .split(",")
          .map((imp) => imp.trim().split(".")[0])
          .join(", ");
        return `import { ${cleanImports} }`;
      });
      fixesApplied += importMatches.length;

      // Fix 5: Malformed function definitions
      // Pattern: function name.property() -> function name()
      const malformedFunctionPattern = /function\s+(\w+)\.(\w+)\s*\(/g;
      const functionMatches = content.match(malformedFunctionPattern) || [];
      content = content.replace(malformedFunctionPattern, "function $1(");
      fixesApplied += functionMatches.length;

      // Fix 6: Specific template literal fix for the EnhancedPreCommitHook.ts file
      if (filePath.includes("EnhancedPreCommitHook.ts")) {
        // Fix the specific multiline template literal issues
        content = content.replace(
          /\$\{Object\.entries\(this\.config\.checks\)\}\s*\n\s*\.map\(\(\[check, enabled\]\) => `- \*\*\$\{check\}\*\*: \$\{enabled \? '✅ Enabled' : '❌ Disabled'\}`\)\s*\n\s*\.join\('\\n'\)\}/g,
          "${Object.entries(this.config.checks).map(([check, enabled]) => `- **${check}**: ${enabled ? '✅ Enabled' : '❌ Disabled'}`).join('\\n')}",
        );

        content = content.replace(
          /\$\{Object\.entries\(this\.config\.autoFix\)\}\s*\n\s*\.map\(\(\[fix, enabled\]\) => `- \*\*\$\{fix\}\*\*: \$\{enabled \? '✅ Enabled' : '❌ Disabled'\}`\)\s*\n\s*\.join\('\\n'\)\}/g,
          "${Object.entries(this.config.autoFix).map(([fix, enabled]) => `- **${fix}**: ${enabled ? '✅ Enabled' : '❌ Disabled'}`).join('\\n')}",
        );

        fixesApplied += 2;
      }

      if (fixesApplied > 0 && content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
        console.log(`     ✅ Applied ${fixesApplied} identifier syntax fixes`);
      } else {
        console.log(`     - No identifier syntax fixes needed`);
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

  async showFinalResults() {
    console.log("\n📈 Identifier Syntax Fix Results:");

    // Check for remaining identifier errors
    const remainingErrors = await this.getIdentifierErrorCount();

    console.log(`   Files processed: ${this.processedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    console.log(`   Remaining identifier errors: ${remainingErrors}`);

    if (remainingErrors === 0) {
      console.log("\n🎉 PERFECT! All identifier syntax issues resolved");
    } else if (remainingErrors <= 5) {
      console.log("\n🎯 EXCELLENT! Identifier errors reduced to minimal level");
    } else {
      console.log(
        "\n⚠️ Some identifier issues remain - may need manual review",
      );
    }

    console.log(`\n📁 Backup available at: ${this.backupDir}`);

    // Final build validation
    const finalBuildValid = await this.validateBuild();
    if (finalBuildValid) {
      console.log("✅ Final build validation successful");
    } else {
      console.log("⚠️ Final build validation failed - review may be needed");
    }

    // Show overall TypeScript error count
    const totalErrors = await this.getTotalErrorCount();
    console.log(`\n📊 Total TypeScript errors now: ${totalErrors}`);
  }

  async getIdentifierErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c -E "error TS1434|identifier"',
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

  async validateBuild() {
    try {
      console.log("🔍 Validating build...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("✅ Build validation passed");
      return true;
    } catch (error) {
      console.log("⚠️ Build validation failed");
      return false;
    }
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
  const fixer = new IdentifierSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = IdentifierSyntaxFixer;
