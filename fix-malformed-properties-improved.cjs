#!/usr/bin/env node

/**
 * Improved Malformed Properties Fixer
 * Fixes malformed property names in TypeScript files with dry run support
 */

const fs = require("fs");
const { execSync } = require("child_process");

class ImprovedMalformedPropertiesFixer {
  constructor() {
    this.processedFiles = [];
    this.totalFixes = 0;
    this.dryRun =
      process.argv.includes("--dry-run") || !process.argv.includes("--live");
    this.verbose = process.argv.includes("--verbose");
    this.maxFiles = this.getMaxFiles();
  }

  getMaxFiles() {
    const maxIndex = process.argv.indexOf("--max-files");
    if (maxIndex !== -1 && process.argv[maxIndex + 1]) {
      return parseInt(process.argv[maxIndex + 1]) || 10;
    }
    return 10;
  }

  async run() {
    console.log(
      `🎯 Malformed Properties Fixer ${this.dryRun ? "(DRY RUN)" : "(LIVE)"}`,
    );
    console.log(`📊 Processing up to ${this.maxFiles} files`);
    console.log("=".repeat(60));

    try {
      // Get initial error count
      const initialErrors = await this.getTS1128ErrorCount();
      console.log(`📊 Initial TS1128 errors: ${initialErrors}`);

      // Get all TypeScript test files
      const allFiles = await this.getTestFiles();
      const files = allFiles.slice(0, this.maxFiles);
      console.log(
        `🔍 Found ${allFiles.length} test files, processing ${files.length}`,
      );

      if (files.length === 0) {
        console.log("⚠️  No files found to process");
        return;
      }

      // Process each file
      for (const filePath of files) {
        await this.processFile(filePath);
      }

      // Final results
      let finalErrors = initialErrors;
      if (!this.dryRun) {
        finalErrors = await this.getTS1128ErrorCount();
      }

      const reduction = initialErrors - finalErrors;

      console.log("\n" + "=".repeat(60));
      console.log("📈 Results:");
      console.log(`   Initial TS1128 errors: ${initialErrors}`);
      console.log(`   Final TS1128 errors: ${finalErrors}`);
      console.log(`   Errors reduced: ${reduction}`);
      console.log(`   Files processed: ${this.processedFiles.length}`);
      console.log(`   Total fixes applied: ${this.totalFixes}`);

      if (this.dryRun) {
        console.log("\n🔍 This was a dry run. Use --live to apply changes.");
        console.log("💡 Tip: Use --verbose for detailed output");
      } else {
        console.log("\n✅ Changes applied successfully!");
        console.log("💡 Backup files created with .backup extension");
      }
    } catch (error) {
      console.error("❌ Fix failed:", error.message);
      process.exit(1);
    }
  }

  async getTS1128ErrorCount() {
    try {
      const output = execSync(
        'yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS1128"',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return parseInt(output.trim()) || 0;
    } catch (error) {
      // grep returns exit code 1 when no matches found
      return error.status === 1 ? 0 : -1;
    }
  }

  async getTestFiles() {
    try {
      const output = execSync(
        'find src/ -name "*.test.ts" -o -name "*.test.tsx" | head -20',
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );
      return output
        .trim()
        .split("\n")
        .filter((line) => line.trim());
    } catch (error) {
      console.error("❌ Error finding test files:", error.message);
      return [];
    }
  }

  validateSyntax(content, filePath) {
    try {
      // Basic syntax validation
      const issues = [];

      // Check for unmatched brackets
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push(
          `Unmatched curly brackets: ${openBrackets} open, ${closeBrackets} close`,
        );
      }

      // Check for unmatched parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        issues.push(
          `Unmatched parentheses: ${openParens} open, ${closeParens} close`,
        );
      }

      return issues;
    } catch (error) {
      return [`Validation error: ${error.message}`];
    }
  }

  async processFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        if (this.verbose) {
          console.log(`⚠️  File not found: ${filePath}`);
        }
        return 0;
      }

      console.log(`🔧 Processing ${filePath}`);

      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;
      let fixesApplied = 0;

      // Validate original content
      const originalIssues = this.validateSyntax(content, filePath);
      if (originalIssues.length > 0 && this.verbose) {
        console.log(`   ⚠️  Original issues: ${originalIssues.join(", ")}`);
      }

      // Fix patterns with improved safety
      const fixes = [
        {
          name: "Malformed severity property",
          pattern: /severit,\s*y:/g,
          replacement: "severity:",
          description: 'Fix "severit, y:" to "severity:"',
        },
        {
          name: "Malformed key property in index signature",
          pattern: /\[ke,\s*y:\s*string\]/g,
          replacement: "[key: string]",
          description: 'Fix "[ke, y: string]" to "[key: string]"',
        },
        {
          name: "Malformed degree property",
          pattern: /degre,\s*e:/g,
          replacement: "degree:",
          description: 'Fix "degre, e:" to "degree:"',
        },
        {
          name: "Missing semicolons after object declarations",
          pattern: /(\}\s*)\n(\s*const\s+\w+)/g,
          replacement: "$1;\n$2",
          description: "Add missing semicolons after object declarations",
        },
        {
          name: "Incomplete object declarations",
          pattern: /(\{\s*[^}]+)\n(\s*const\s+\w+)/g,
          replacement: "$1\n        };\n$2",
          description: "Complete incomplete object declarations",
        },
      ];

      // Apply fixes
      for (const fix of fixes) {
        const beforeContent = content;
        const matches = content.match(fix.pattern) || [];

        if (matches.length > 0) {
          content = content.replace(fix.pattern, fix.replacement);
          fixesApplied += matches.length;

          if (this.verbose) {
            console.log(`   ✓ ${fix.description}: ${matches.length} fixes`);
          }
        }
      }

      // Validate modified content
      if (fixesApplied > 0) {
        const modifiedIssues = this.validateSyntax(content, filePath);

        if (modifiedIssues.length > originalIssues.length) {
          console.log(
            `   ⚠️  Skipping: modifications would introduce syntax issues`,
          );
          if (this.verbose) {
            console.log(`   New issues: ${modifiedIssues.join(", ")}`);
          }
          return 0;
        }

        if (this.dryRun) {
          console.log(`   📝 Would apply ${fixesApplied} fixes (DRY RUN)`);
        } else {
          // Create backup
          const backupPath = `${filePath}.backup`;
          fs.writeFileSync(backupPath, originalContent, "utf8");

          // Write modified content
          fs.writeFileSync(filePath, content);
          console.log(`   ✅ Applied ${fixesApplied} fixes`);

          if (this.verbose) {
            console.log(`   💾 Backup created: ${backupPath}`);
          }
        }

        this.processedFiles.push(filePath);
        this.totalFixes += fixesApplied;
      } else {
        console.log(`   - No fixes needed`);
      }

      return fixesApplied;
    } catch (error) {
      console.log(`   ❌ Error processing file: ${error.message}`);
      return 0;
    }
  }
}

// Execute the fixer
if (require.main === module) {
  const fixer = new ImprovedMalformedPropertiesFixer();
  fixer.run().catch((error) => {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  });
}

module.exports = ImprovedMalformedPropertiesFixer;
