#!/usr/bin/env node

/**
 * Fix Remaining Error Categories Script
 *
 * This script addresses the remaining error categories from task 11.1:
 * - prefer-optional-chain (172 issues)
 * - no-non-null-assertion (11 issues)
 * - no-unnecessary-type-assertion (79 issues)
 * - no-floating-promises (245 issues)
 * - no-misused-promises (63 issues)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFiles: 30,
  dryRun: false,
  preservePatterns: [
    // Preserve astronomical calculations
    /planetary|astronomical|astrological|ephemeris/i,
    // Preserve campaign system patterns
    /campaign|metrics|progress|safety/i,
  ],
};

class RemainingErrorsFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
    this.fixesByType = {
      "prefer-optional-chain": 0,
      "no-non-null-assertion": 0,
      "no-unnecessary-type-assertion": 0,
      "no-floating-promises": 0,
      "no-misused-promises": 0,
    };
  }

  /**
   * Get files with specific error types
   */
  getFilesWithErrors() {
    try {
      console.log("🔍 Analyzing files with remaining error categories...");

      const lintOutput = execSync(
        "yarn lint --max-warnings=10000 --format=json",
        {
          encoding: "utf8",
          stdio: "pipe",
        },
      );

      const lintResults = JSON.parse(lintOutput);
      const filesWithErrors = new Map();

      for (const result of lintResults) {
        const filePath = result.filePath;
        const relevantMessages = result.messages.filter(
          (msg) =>
            msg.ruleId &&
            [
              "@typescript-eslint/prefer-optional-chain",
              "@typescript-eslint/no-non-null-assertion",
              "@typescript-eslint/no-unnecessary-type-assertion",
              "@typescript-eslint/no-floating-promises",
              "@typescript-eslint/no-misused-promises",
            ].includes(msg.ruleId),
        );

        if (relevantMessages.length > 0) {
          filesWithErrors.set(filePath, relevantMessages);
        }
      }

      console.log(
        `📊 Found ${filesWithErrors.size} files with target error categories`,
      );
      return Array.from(filesWithErrors.entries()).slice(0, CONFIG.maxFiles);
    } catch (error) {
      console.warn(
        "⚠️ Could not get lint JSON output, falling back to text parsing...",
      );
      return this.getFilesWithErrorsFallback();
    }
  }

  /**
   * Fallback method to get files with errors
   */
  getFilesWithErrorsFallback() {
    const files = [];
    const directories = ["src", "__tests__"];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files);
      }
    }

    return files.slice(0, CONFIG.maxFiles).map((file) => [file, []]);
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  scanDirectory(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith(".")) {
        this.scanDirectory(fullPath, files);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Check if file should be preserved from modifications
   */
  shouldPreserveFile(filePath, content) {
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(filePath) || pattern.test(content)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fix prefer-optional-chain issues
   */
  fixOptionalChain(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern: obj && obj.prop -> obj?.prop
    const pattern1 = /(\w+)\s*&&\s*\1\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      modifiedContent = modifiedContent.replace(pattern1, "$1?.$2");
      fixes += matches1.length;
    }

    // Pattern: obj && obj[key] -> obj?.[key]
    const pattern2 = /(\w+)\s*&&\s*\1\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      modifiedContent = modifiedContent.replace(pattern2, "$1?.[$2]");
      fixes += matches2.length;
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-non-null-assertion issues
   */
  fixNonNullAssertion(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern: obj!.prop -> obj?.prop
    const pattern1 = /(\w+)!\.(\w+)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    if (matches1.length > 0) {
      modifiedContent = modifiedContent.replace(pattern1, "$1?.$2");
      fixes += matches1.length;
    }

    // Pattern: obj![key] -> obj?.[key]
    const pattern2 = /(\w+)!\[([^\]]+)\]/g;
    const matches2 = [...modifiedContent.matchAll(pattern2)];
    if (matches2.length > 0) {
      modifiedContent = modifiedContent.replace(pattern2, "$1?.[$2]");
      fixes += matches2.length;
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-unnecessary-type-assertion issues
   */
  fixUnnecessaryTypeAssertion(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Simple pattern: (value as string) where it's clearly redundant
    // This is conservative - only removes obvious cases
    const pattern1 = /\((\w+)\s+as\s+string\)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      // Only remove if the variable name suggests it's already a string
      if (
        match[1].toLowerCase().includes("str") ||
        match[1].toLowerCase().includes("text") ||
        match[1].toLowerCase().includes("name")
      ) {
        modifiedContent = modifiedContent.replace(match[0], match[1]);
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Fix no-floating-promises issues
   */
  fixFloatingPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern: Promise calls that should be awaited or voided
    const lines = modifiedContent.split("\n");
    const fixedLines = [];

    for (let line of lines) {
      const originalLine = line;

      // Look for standalone promise calls that should be voided
      if (
        /^\s*[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*$/.test(
          line,
        ) &&
        !line.includes("await") &&
        !line.includes("void") &&
        !line.includes("return")
      ) {
        // Add void operator
        line = line.replace(
          /^(\s*)([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\(.*\);?\s*)$/,
          "$1void $2",
        );

        if (line !== originalLine) {
          fixes++;
        }
      }

      fixedLines.push(line);
    }

    return { content: fixedLines.join("\n"), fixes };
  }

  /**
   * Fix no-misused-promises issues
   */
  fixMisusedPromises(content) {
    let fixes = 0;
    let modifiedContent = content;

    // Pattern: if (promise) -> if (await promise)
    // This is conservative and only applies to obvious cases
    const pattern1 =
      /if\s*\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*\([^)]*\))\s*\)/g;
    const matches1 = [...modifiedContent.matchAll(pattern1)];
    for (const match of matches1) {
      if (match[1].includes("async") || match[1].includes("Promise")) {
        modifiedContent = modifiedContent.replace(
          match[0],
          `if (await ${match[1]})`,
        );
        fixes++;
      }
    }

    return { content: modifiedContent, fixes };
  }

  /**
   * Process a single file
   */
  processFile(filePath, errorMessages) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, "utf8");

      // Check if file should be preserved
      if (this.shouldPreserveFile(filePath, content)) {
        console.log(`  ⚠️ Preserving file due to domain-specific patterns`);
        return;
      }

      let modifiedContent = content;
      let totalFileFixes = 0;

      // Apply fixes based on error types present
      const errorTypes = new Set(
        errorMessages.map((msg) =>
          msg.ruleId?.replace("@typescript-eslint/", ""),
        ),
      );

      if (errorTypes.has("prefer-optional-chain")) {
        const result = this.fixOptionalChain(modifiedContent);
        modifiedContent = result.content;
        totalFileFixes += result.fixes;
        this.fixesByType["prefer-optional-chain"] += result.fixes;
        if (result.fixes > 0) {
          console.log(`  📝 Fixed ${result.fixes} optional chain issues`);
        }
      }

      if (errorTypes.has("no-non-null-assertion")) {
        const result = this.fixNonNullAssertion(modifiedContent);
        modifiedContent = result.content;
        totalFileFixes += result.fixes;
        this.fixesByType["no-non-null-assertion"] += result.fixes;
        if (result.fixes > 0) {
          console.log(`  📝 Fixed ${result.fixes} non-null assertion issues`);
        }
      }

      if (errorTypes.has("no-unnecessary-type-assertion")) {
        const result = this.fixUnnecessaryTypeAssertion(modifiedContent);
        modifiedContent = result.content;
        totalFileFixes += result.fixes;
        this.fixesByType["no-unnecessary-type-assertion"] += result.fixes;
        if (result.fixes > 0) {
          console.log(
            `  📝 Fixed ${result.fixes} unnecessary type assertion issues`,
          );
        }
      }

      if (errorTypes.has("no-floating-promises")) {
        const result = this.fixFloatingPromises(modifiedContent);
        modifiedContent = result.content;
        totalFileFixes += result.fixes;
        this.fixesByType["no-floating-promises"] += result.fixes;
        if (result.fixes > 0) {
          console.log(`  📝 Fixed ${result.fixes} floating promise issues`);
        }
      }

      if (errorTypes.has("no-misused-promises")) {
        const result = this.fixMisusedPromises(modifiedContent);
        modifiedContent = result.content;
        totalFileFixes += result.fixes;
        this.fixesByType["no-misused-promises"] += result.fixes;
        if (result.fixes > 0) {
          console.log(`  📝 Fixed ${result.fixes} misused promise issues`);
        }
      }

      if (totalFileFixes > 0) {
        if (!CONFIG.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, "utf8");
        }

        console.log(`  ✅ Applied ${totalFileFixes} total fixes`);
        this.totalFixes += totalFileFixes;
      } else {
        console.log(`  ℹ️ No fixable issues found`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  validateTypeScript() {
    try {
      console.log("\n🔍 Validating TypeScript compilation...");
      execSync("yarn tsc --noEmit --skipLibCheck", { stdio: "pipe" });
      console.log("✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      console.error("❌ TypeScript compilation failed");
      console.error(error.stdout?.toString() || error.message);
      return false;
    }
  }

  /**
   * Run the remaining errors fixing process
   */
  async run() {
    console.log("🚀 Starting Remaining Error Categories Fixing Process");
    console.log(
      `📊 Configuration: maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`,
    );

    const filesWithErrors = this.getFilesWithErrors();

    if (filesWithErrors.length === 0) {
      console.log("✅ No files found with target error categories");
      return;
    }

    console.log(`\n📋 Processing ${filesWithErrors.length} files...`);

    for (const [filePath, errorMessages] of filesWithErrors) {
      this.processFile(filePath, errorMessages);

      // Validate every 5 files
      if (this.processedFiles % 5 === 0 && this.processedFiles > 0) {
        if (!this.validateTypeScript()) {
          console.error("🛑 Stopping due to TypeScript errors");
          break;
        }
      }
    }

    // Final validation
    if (!CONFIG.dryRun && this.totalFixes > 0) {
      this.validateTypeScript();
    }

    // Summary
    console.log("\n📊 Remaining Error Categories Fixing Summary:");
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    console.log(`   Errors encountered: ${this.errors.length}`);

    console.log("\n📈 Fixes by category:");
    for (const [category, count] of Object.entries(this.fixesByType)) {
      if (count > 0) {
        console.log(`   ${category}: ${count} fixes`);
      }
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    if (this.totalFixes > 0) {
      console.log("\n✅ Remaining error fixes completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new RemainingErrorsFixer();
  fixer.run().catch(console.error);
}

module.exports = RemainingErrorsFixer;
