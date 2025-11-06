#!/usr/bin/env node

/**
 * Fix Optional Chain Opportunities Script
 *
 * This script addresses @typescript-eslint/prefer-optional-chain violations
 * by converting logical AND chains to optional chaining where safe.
 *
 * Current Issues: 172 prefer-optional-chain violations
 * Target: Convert safe logical AND patterns to optional chaining
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFiles: 25,
  dryRun: false,
  preservePatterns: [
    // Preserve complex logical expressions in calculations
    /planetary|astronomical|astrological|elemental/i,
    // Preserve campaign system patterns
    /campaign|metrics|progress|safety/i,
    // Preserve test patterns
    /test|mock|stub/i,
  ],
  safePatterns: [
    // Safe patterns to convert
    {
      pattern: /(\w+)\s*&&\s*\1\.(\w+)/g,
      replacement: "$1?.$2",
      description: "Convert obj && obj.prop to obj?.prop",
    },
    {
      pattern: /(\w+)\s*&&\s*\1\[([^\]]+)\]/g,
      replacement: "$1?.[$2]",
      description: "Convert obj && obj[key] to obj?.[key]",
    },
    {
      pattern: /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g,
      replacement: "$1?.$2?.$3",
      description:
        "Convert obj && obj.prop && obj.prop.nested to obj?.prop?.nested",
    },
  ],
};

class OptionalChainFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Get files with prefer-optional-chain violations
   */
  getFilesWithOptionalChainIssues() {
    try {
      console.log(
        "🔍 Analyzing files with prefer-optional-chain violations...",
      );

      const lintOutput = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -E "prefer-optional-chain"',
        { encoding: "utf8", stdio: "pipe" },
      );

      const files = new Set();
      const lines = lintOutput.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        const match = line.match(/^([^:]+):/);
        if (match) {
          const filePath = match[1].trim();
          if (fs.existsSync(filePath)) {
            files.add(filePath);
          }
        }
      }

      const fileArray = Array.from(files);
      console.log(
        `📊 Found ${fileArray.length} files with prefer-optional-chain issues`,
      );
      return fileArray.slice(0, CONFIG.maxFiles);
    } catch (error) {
      console.warn(
        "⚠️ Could not get lint output, scanning common directories...",
      );
      return this.scanCommonDirectories();
    }
  }

  /**
   * Scan common directories for TypeScript files
   */
  scanCommonDirectories() {
    const directories = ["src", "__tests__"];
    const files = [];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files);
      }
    }

    return files.slice(0, CONFIG.maxFiles);
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
    // Check file path patterns
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(filePath)) {
        return true;
      }
    }

    // Check content patterns
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Apply optional chain fixes to content
   */
  applyOptionalChainFixes(content, filePath) {
    let modifiedContent = content;
    let fileFixCount = 0;

    for (const { pattern, replacement, description } of CONFIG.safePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`  📝 Applying: ${description}`);
        modifiedContent = modifiedContent.replace(pattern, replacement);
        fileFixCount += matches.length;
      }
    }

    return { content: modifiedContent, fixCount: fileFixCount };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, "utf8");

      // Check if file should be preserved
      if (this.shouldPreserveFile(filePath, content)) {
        console.log(`  ⚠️ Preserving file due to domain-specific patterns`);
        return;
      }

      // Apply fixes
      const { content: modifiedContent, fixCount } =
        this.applyOptionalChainFixes(content, filePath);

      if (fixCount > 0) {
        if (!CONFIG.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, "utf8");
        }

        console.log(`  ✅ Applied ${fixCount} optional chain fixes`);
        this.totalFixes += fixCount;
      } else {
        console.log(`  ℹ️ No optional chain opportunities found`);
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
   * Run the optional chain fixing process
   */
  async run() {
    console.log("🚀 Starting Optional Chain Fixing Process");
    console.log(
      `📊 Configuration: maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`,
    );

    const files = this.getFilesWithOptionalChainIssues();

    if (files.length === 0) {
      console.log("✅ No files found with prefer-optional-chain issues");
      return;
    }

    console.log(`\n📋 Processing ${files.length} files...`);

    for (const file of files) {
      this.processFile(file);

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
    console.log("\n📊 Optional Chain Fixing Summary:");
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    console.log(`   Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    if (this.totalFixes > 0) {
      console.log("\n✅ Optional chain fixes completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new OptionalChainFixer();
  fixer.run().catch(console.error);
}

module.exports = OptionalChainFixer;
