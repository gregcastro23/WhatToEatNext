#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Ultra-conservative script to remove only the safest unnecessary type assertions
 * Focuses on obvious cases that cannot break code
 */

class SafeUnnecessaryTypeAssertionRemover {
  constructor() {
    this.processedFiles = 0;
    this.removedAssertions = 0;
    this.skippedAssertions = 0;
    this.errors = [];
    this.dryRun = process.argv.includes("--dry-run");
  }

  /**
   * Only the absolute safest patterns for unnecessary type assertions
   */
  getSafestPatterns() {
    return [
      // Pattern 1: Simple 'as any' to 'as unknown' (safer than removing entirely)
      {
        pattern: /\b(\w+)\s+as\s+any\b(?!\s*\))/g,
        replacement: "$1 as unknown",
        description: "Replace simple any assertion with unknown",
        category: "unnecessary",
      },

      // Pattern 2: Parenthesized 'as any' to 'as unknown'
      {
        pattern: /\(([^)]+)\s+as\s+any\)/g,
        replacement: "($1 as unknown)",
        description: "Replace parenthesized any assertion with unknown",
        category: "unnecessary",
      },

      // Pattern 3: Redundant string literals as string (very safe)
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+string\b/g,
        replacement: "$1",
        description: "Remove redundant string assertion on string literal",
        category: "unnecessary",
      },

      // Pattern 4: Redundant number literals as number (very safe)
      {
        pattern: /(\b\d+(?:\.\d+)?)\s+as\s+number\b/g,
        replacement: "$1",
        description: "Remove redundant number assertion on numeric literal",
        category: "unnecessary",
      },

      // Pattern 5: Redundant boolean literals as boolean (very safe)
      {
        pattern: /\b(true|false)\s+as\s+boolean\b/g,
        replacement: "$1",
        description: "Remove redundant boolean assertion on boolean literal",
        category: "unnecessary",
      },
    ];
  }

  /**
   * Files and patterns that should be completely excluded
   */
  shouldSkipFile(filePath) {
    // Skip all test files completely
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

    // Skip campaign system files (they have complex patterns)
    if (filePath.includes("/campaign/")) {
      return true;
    }

    // Skip script files in root directory
    if (filePath.endsWith(".cjs") || filePath.endsWith(".mjs")) {
      return true;
    }

    return false;
  }

  /**
   * Check if content should be preserved based on context
   */
  shouldPreserveAssertion(content, assertionMatch, filePath) {
    // Preserve assertions with explanatory comments
    const lines = content.split("\n");
    const matchIndex = content.indexOf(assertionMatch);
    const matchLine = content.substring(0, matchIndex).split("\n").length - 1;

    // Check previous line for comments
    if (matchLine > 0) {
      const prevLine = lines[matchLine - 1];
      if (prevLine && (prevLine.includes("//") || prevLine.includes("/*"))) {
        return true;
      }
    }

    // Check same line for comments
    const currentLine = lines[matchLine];
    if (currentLine && currentLine.includes("//")) {
      return true;
    }

    // Preserve assertions in error handling contexts
    const contextBefore = content.substring(
      Math.max(0, matchIndex - 100),
      matchIndex,
    );
    if (
      contextBefore.includes("catch") ||
      contextBefore.includes("error") ||
      contextBefore.includes("Error")
    ) {
      return true;
    }

    // Preserve complex patterns
    if (
      assertionMatch.includes("Record<") ||
      assertionMatch.includes("import(") ||
      assertionMatch.includes("typeof") ||
      assertionMatch.includes("keyof")
    ) {
      return true;
    }

    // Preserve if it's part of a complex expression
    if (
      assertionMatch.includes("[") ||
      assertionMatch.includes("{") ||
      assertionMatch.includes("?") ||
      assertionMatch.includes(":")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Process a single file to remove safe unnecessary type assertions
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileChanges = 0;

      const patterns = this.getSafestPatterns();

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
      `🚀 Starting safe unnecessary type assertion removal${this.dryRun ? " (DRY RUN)" : ""}...\n`,
    );

    // Find all TypeScript files to process (excluding tests and campaign files)
    const files = this.findTypeScriptFiles("./src");
    console.log(
      `Found ${files.length} TypeScript files to process (excluding tests and campaign files)\n`,
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
      `\n✅ Safe unnecessary type assertion ${mode} completed successfully!`,
    );

    if (this.dryRun) {
      console.log("\n💡 Run without --dry-run to apply changes");
    }
  }
}

// Run the script
if (require.main === module) {
  const remover = new SafeUnnecessaryTypeAssertionRemover();
  remover.run();
}

module.exports = SafeUnnecessaryTypeAssertionRemover;
