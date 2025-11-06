#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Ultra-conservative script to remove only the most obvious unnecessary type assertions
 * Only handles cases that are 100% safe and cannot break code
 */

class UltraSafeTypeAssertionRemover {
  constructor() {
    this.processedFiles = 0;
    this.removedAssertions = 0;
    this.skippedAssertions = 0;
    this.errors = [];
    this.dryRun = process.argv.includes("--dry-run");
  }

  /**
   * Only the most obvious and safe patterns
   */
  getUltraSafePatterns() {
    return [
      // Pattern 1: Simple variable 'as any' to 'as unknown' (safer than removing)
      {
        pattern: /\b(\w+)\s+as\s+any\b(?!\s*[\[\(])/g,
        replacement: "$1 as unknown",
        description: "Replace simple any assertion with unknown",
        category: "safe-replacement",
      },

      // Pattern 2: Redundant string literals as string (only simple cases)
      {
        pattern: /(['"`][^'"`\n]*['"`])\s+as\s+string\b/g,
        replacement: "$1",
        description: "Remove redundant string assertion on string literal",
        category: "redundant-literal",
      },

      // Pattern 3: Redundant number literals as number (only simple cases)
      {
        pattern: /(\b\d+(?:\.\d+)?)\s+as\s+number\b/g,
        replacement: "$1",
        description: "Remove redundant number assertion on numeric literal",
        category: "redundant-literal",
      },

      // Pattern 4: Redundant boolean literals as boolean (only simple cases)
      {
        pattern: /\b(true|false)\s+as\s+boolean\b/g,
        replacement: "$1",
        description: "Remove redundant boolean assertion on boolean literal",
        category: "redundant-literal",
      },
    ];
  }

  /**
   * Files that should be completely excluded
   */
  shouldSkipFile(filePath) {
    // Skip ALL test files
    if (
      /\.(test|spec)\.(ts|tsx)$/.test(filePath) ||
      filePath.includes("__tests__") ||
      filePath.includes("/tests/")
    ) {
      return true;
    }

    // Skip node_modules and other excluded directories
    if (
      filePath.includes("node_modules") ||
      filePath.includes(".git") ||
      filePath.includes("dist") ||
      filePath.includes("build") ||
      filePath.includes(".next")
    ) {
      return true;
    }

    // Skip ALL campaign system files
    if (filePath.includes("/campaign/")) {
      return true;
    }

    // Skip script files in root directory
    if (filePath.endsWith(".cjs") || filePath.endsWith(".mjs")) {
      return true;
    }

    // Skip any file with 'test' in the name
    if (filePath.toLowerCase().includes("test")) {
      return true;
    }

    return false;
  }

  /**
   * Check if content should be preserved based on context
   */
  shouldPreserveAssertion(content, assertionMatch, filePath) {
    // Preserve ALL assertions with comments
    const lines = content.split("\n");
    const matchIndex = content.indexOf(assertionMatch);
    const matchLine = content.substring(0, matchIndex).split("\n").length - 1;

    // Check previous line for ANY comments
    if (matchLine > 0) {
      const prevLine = lines[matchLine - 1];
      if (prevLine && (prevLine.includes("//") || prevLine.includes("/*"))) {
        return true;
      }
    }

    // Check same line for ANY comments
    const currentLine = lines[matchLine];
    if (currentLine && currentLine.includes("//")) {
      return true;
    }

    // Preserve assertions in ANY error handling contexts
    const contextBefore = content.substring(
      Math.max(0, matchIndex - 150),
      matchIndex,
    );
    if (
      contextBefore.includes("catch") ||
      contextBefore.includes("error") ||
      contextBefore.includes("Error") ||
      contextBefore.includes("try")
    ) {
      return true;
    }

    // Preserve ANY complex patterns
    if (
      assertionMatch.includes("Record<") ||
      assertionMatch.includes("import(") ||
      assertionMatch.includes("typeof") ||
      assertionMatch.includes("keyof") ||
      assertionMatch.includes("[") ||
      assertionMatch.includes("{") ||
      assertionMatch.includes("?") ||
      assertionMatch.includes(":") ||
      assertionMatch.includes("(") ||
      assertionMatch.includes(")")
    ) {
      return true;
    }

    // Preserve if it's part of a function call or complex expression
    const contextAfter = content.substring(matchIndex, matchIndex + 50);
    if (
      contextAfter.includes("(") ||
      contextAfter.includes("[") ||
      contextAfter.includes(".")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Process a single file to remove ultra-safe unnecessary type assertions
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileChanges = 0;

      const patterns = this.getUltraSafePatterns();

      for (const { pattern, replacement, description, category } of patterns) {
        const matches = [...content.matchAll(pattern)];

        for (const match of matches) {
          // Check if this assertion should be preserved
          if (this.shouldPreserveAssertion(content, match[0], filePath)) {
            this.skippedAssertions++;
            console.log(
              `  Skipped: ${description} - "${match[0]}" in ${path.basename(filePath)} (preserved)`,
            );
            continue;
          }

          // Apply the replacement
          const newReplacement = replacement.replace(
            /\$(\d+)/g,
            (_, num) => match[parseInt(num)],
          );
          modifiedContent = modifiedContent.replace(match[0], newReplacement);
          fileChanges++;
          this.removedAssertions++;

          console.log(
            `  ${this.dryRun ? "Would remove" : "Removed"}: ${description} - "${match[0]}" in ${path.basename(filePath)}`,
          );
        }
      }

      // Only write file if changes were made and not in dry run mode
      if (fileChanges > 0 && !this.dryRun) {
        fs.writeFileSync(filePath, modifiedContent);
        console.log(
          `✅ Modified ${filePath} (${fileChanges} assertions removed)`,
        );
        this.processedFiles++;
      } else if (fileChanges > 0 && this.dryRun) {
        console.log(`🔍 Would modify ${filePath} (${fileChanges} assertions)`);
        this.processedFiles++;
      }
    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Recursively find all TypeScript files in a directory
   */
  findTypeScriptFiles(dir) {
    const files = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip certain directories
          if (
            ![
              "node_modules",
              ".git",
              "dist",
              "build",
              ".next",
              "__tests__",
              "tests",
              "campaign",
            ].includes(entry.name)
          ) {
            files.push(...this.findTypeScriptFiles(fullPath));
          }
        } else if (
          /\.(ts|tsx)$/.test(fullPath) &&
          !this.shouldSkipFile(fullPath)
        ) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error.message}`);
    }

    return files;
  }

  /**
   * Validate TypeScript compilation after changes
   */
  validateTypeScript() {
    if (this.dryRun) {
      console.log("\n🔍 Skipping TypeScript validation (dry run mode)");
      return true;
    }

    try {
      console.log("\n🔍 Validating TypeScript compilation...");
      execSync("npx tsc --noEmit --skipLibCheck", {
        stdio: "pipe",
        encoding: "utf8",
      });
      console.log("✅ TypeScript compilation successful");
      return true;
    } catch (error) {
      console.error("❌ TypeScript compilation failed:");
      console.error(error.stdout || error.message);
      return false;
    }
  }

  /**
   * Main execution method
   */
  run() {
    console.log(
      `🚀 Starting ultra-safe unnecessary type assertion removal${this.dryRun ? " (DRY RUN)" : ""}...\n`,
    );

    // Find all TypeScript files to process (excluding tests, campaign files, etc.)
    const files = this.findTypeScriptFiles("./src");
    console.log(
      `Found ${files.length} TypeScript files to process (excluding tests, campaign files, etc.)\n`,
    );

    // Process each file
    for (const file of files) {
      this.processFile(file);
    }

    // Validate compilation
    const compilationSuccess = this.validateTypeScript();

    // Report results
    console.log("\n📊 Summary:");
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Assertions removed: ${this.removedAssertions}`);
    console.log(`Assertions preserved: ${this.skippedAssertions}`);
    console.log(`Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach((error) => console.log(`  ${error}`));
    }

    if (!compilationSuccess && !this.dryRun) {
      console.log(
        "\n⚠️  TypeScript compilation failed. You may need to review the changes.",
      );
      process.exit(1);
    }

    const mode = this.dryRun ? "analysis" : "removal";
    console.log(
      `\n✅ Ultra-safe unnecessary type assertion ${mode} completed successfully!`,
    );

    if (this.dryRun) {
      console.log("\n💡 Run without --dry-run to apply changes");
    }
  }
}

// Run the script
if (require.main === module) {
  const remover = new UltraSafeTypeAssertionRemover();
  remover.run();
}

module.exports = UltraSafeTypeAssertionRemover;
