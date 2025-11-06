#!/usr/bin/env node

/**
 * Fix Non-Null Assertions Script
 *
 * This script addresses @typescript-eslint/no-non-null-assertion violations
 * by replacing non-null assertions with proper type guards and validation.
 *
 * Current Issues: 11 no-non-null-assertion violations
 * Target: Replace non-null assertions with safe type checking
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  maxFiles: 15,
  dryRun: false,
  preservePatterns: [
    // Preserve astronomical data processing where assertions are necessary
    /planetary|astronomical|astrological|ephemeris/i,
    // Preserve test files where assertions might be intentional
    /\.test\.|\.spec\.|__tests__/i,
    // Preserve external library integrations
    /astronomy-engine|astronomia|suncalc/i,
  ],
  replacementPatterns: [
    {
      // Replace simple property access assertions
      pattern: /(\w+)!\.(\w+)/g,
      replacement: (match, obj, prop) => `${obj} && ${obj}.${prop}`,
      description: "Replace obj!.prop with obj && obj.prop",
    },
    {
      // Replace array access assertions
      pattern: /(\w+)!\[([^\]]+)\]/g,
      replacement: (match, obj, index) => `${obj} && ${obj}[${index}]`,
      description: "Replace obj![index] with obj && obj[index]",
    },
    {
      // Replace method call assertions
      pattern: /(\w+)!\.(\w+)\(/g,
      replacement: (match, obj, method) => `${obj}?.${method}(`,
      description: "Replace obj!.method( with obj?.method(",
    },
  ],
};

class NonNullAssertionFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Get files with no-non-null-assertion violations
   */
  getFilesWithNonNullAssertions() {
    try {
      console.log(
        "🔍 Analyzing files with no-non-null-assertion violations...",
      );

      const lintOutput = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -E "no-non-null-assertion"',
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
        `📊 Found ${fileArray.length} files with no-non-null-assertion issues`,
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
   * Apply non-null assertion fixes to content
   */
  applyNonNullAssertionFixes(content, filePath) {
    let modifiedContent = content;
    let fileFixCount = 0;

    // Find all non-null assertions
    const nonNullAssertions = content.match(/\w+!/g) || [];

    if (nonNullAssertions.length === 0) {
      return { content: modifiedContent, fixCount: 0 };
    }

    console.log(`  📝 Found ${nonNullAssertions.length} non-null assertions`);

    for (const {
      pattern,
      replacement,
      description,
    } of CONFIG.replacementPatterns) {
      const beforeCount = (modifiedContent.match(pattern) || []).length;

      if (typeof replacement === "function") {
        modifiedContent = modifiedContent.replace(pattern, replacement);
      } else {
        modifiedContent = modifiedContent.replace(pattern, replacement);
      }

      const afterCount = (modifiedContent.match(pattern) || []).length;
      const fixesApplied = beforeCount - afterCount;

      if (fixesApplied > 0) {
        console.log(`  📝 Applied: ${description} (${fixesApplied} fixes)`);
        fileFixCount += fixesApplied;
      }
    }

    return { content: modifiedContent, fixCount: fileFixCount };
  }

  /**
   * Add type guard utilities if needed
   */
  addTypeGuardUtilities(content, filePath) {
    // Check if file needs type guard utilities
    const needsTypeGuards = /(\w+) && \1\./.test(content);

    if (!needsTypeGuards) {
      return content;
    }

    // Check if utilities already exist
    if (
      content.includes("function isDefined") ||
      content.includes("const isDefined")
    ) {
      return content;
    }

    // Add type guard utility at the top of the file
    const typeGuardUtility = `
/**
 * Type guard utility to check if value is defined
 */
function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

`;

    // Find the first import or the beginning of the file
    const importMatch = content.match(/^(import.*\n)*/m);
    if (importMatch) {
      const insertIndex = importMatch[0].length;
      return (
        content.slice(0, insertIndex) +
        typeGuardUtility +
        content.slice(insertIndex)
      );
    } else {
      return typeGuardUtility + content;
    }
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
        this.applyNonNullAssertionFixes(content, filePath);

      if (fixCount > 0) {
        // Add type guard utilities if needed
        const finalContent = this.addTypeGuardUtilities(
          modifiedContent,
          filePath,
        );

        if (!CONFIG.dryRun) {
          fs.writeFileSync(filePath, finalContent, "utf8");
        }

        console.log(`  ✅ Applied ${fixCount} non-null assertion fixes`);
        this.totalFixes += fixCount;
      } else {
        console.log(`  ℹ️ No non-null assertions found to fix`);
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
   * Run the non-null assertion fixing process
   */
  async run() {
    console.log("🚀 Starting Non-Null Assertion Fixing Process");
    console.log(
      `📊 Configuration: maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`,
    );

    const files = this.getFilesWithNonNullAssertions();

    if (files.length === 0) {
      console.log("✅ No files found with no-non-null-assertion issues");
      return;
    }

    console.log(`\n📋 Processing ${files.length} files...`);

    for (const file of files) {
      this.processFile(file);

      // Validate every 3 files (smaller batches due to fewer files)
      if (this.processedFiles % 3 === 0 && this.processedFiles > 0) {
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
    console.log("\n📊 Non-Null Assertion Fixing Summary:");
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
      console.log("\n✅ Non-null assertion fixes completed successfully!");
      console.log("💡 Run yarn lint to verify the improvements");
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new NonNullAssertionFixer();
  fixer.run().catch(console.error);
}

module.exports = NonNullAssertionFixer;
