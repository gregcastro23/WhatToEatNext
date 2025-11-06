#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Conservative script to remove only the safest redundant type assertions
 * Focuses on obvious cases and preserves complex patterns
 */

class ConservativeTypeAssertionRemover {
  constructor() {
    this.processedFiles = 0;
    this.removedAssertions = 0;
    this.skippedAssertions = 0;
    this.errors = [];
  }

  /**
   * Only the safest patterns for redundant type assertions
   */
  getSafePatterns() {
    return [
      // Pattern 1: Redundant string assertions on string literals (very safe)
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+string(?!\[\])/g,
        replacement: "$1",
        description: "String literal as string",
      },

      // Pattern 2: Redundant number assertions on numeric literals (very safe)
      {
        pattern: /(\d+(?:\.\d+)?)\s+as\s+number(?!\[\])/g,
        replacement: "$1",
        description: "Number literal as number",
      },

      // Pattern 3: Redundant boolean assertions on boolean literals (very safe)
      {
        pattern: /(true|false)\s+as\s+boolean(?!\[\])/g,
        replacement: "$1",
        description: "Boolean literal as boolean",
      },

      // Pattern 4: Simple redundant const assertions on string literals
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+const/g,
        replacement: "$1",
        description: "String literal as const",
      },
    ];
  }

  /**
   * Files and patterns that should be completely excluded
   */
  shouldSkipFile(filePath) {
    // Skip all test files
    if (
      /\.(test|spec)\.(ts|tsx)$/.test(filePath) ||
      filePath.includes("__tests__") ||
      filePath.includes("test.ts") ||
      filePath.includes("test.tsx")
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

    return false;
  }

  /**
   * Check if content should be preserved based on context
   */
  shouldPreserveAssertion(content, assertionMatch, filePath) {
    // Preserve assertions with explanatory comments
    const lines = content.split("\n");
    const matchLine =
      content.substring(0, content.indexOf(assertionMatch)).split("\n").length -
      1;

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
    if (
      assertionMatch.includes("error") ||
      content
        .substring(
          Math.max(0, content.indexOf(assertionMatch) - 100),
          content.indexOf(assertionMatch),
        )
        .includes("catch")
    ) {
      return true;
    }

    // Preserve assertions with complex type patterns
    if (
      assertionMatch.includes("Record<") ||
      assertionMatch.includes("import(") ||
      assertionMatch.includes("unknown") ||
      assertionMatch.includes("any")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Process a single file to remove safe redundant type assertions
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileChanges = 0;

      const safePatterns = this.getSafePatterns();

      for (const { pattern, replacement, description } of safePatterns) {
        const matches = [...content.matchAll(pattern)];

        for (const match of matches) {
          // Check if this assertion should be preserved
          if (this.shouldPreserveAssertion(content, match[0], filePath)) {
            this.skippedAssertions++;
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
            `  Removed: ${description} - "${match[0]}" in ${path.basename(filePath)}`,
          );
        }
      }

      // Only write file if changes were made
      if (fileChanges > 0) {
        fs.writeFileSync(filePath, modifiedContent);
        console.log(
          `✅ Modified ${filePath} (${fileChanges} assertions removed)`,
        );
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
      "🚀 Starting conservative redundant type assertion removal...\n",
    );

    // Find all TypeScript files in src directory (excluding tests)
    const files = this.findTypeScriptFiles("./src");
    console.log(
      `Found ${files.length} TypeScript files to process (excluding tests)\n`,
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

    if (!compilationSuccess) {
      console.log(
        "\n⚠️  TypeScript compilation failed. You may need to review the changes.",
      );
      process.exit(1);
    }

    console.log(
      "\n✅ Conservative redundant type assertion removal completed successfully!",
    );
  }
}

// Run the script
if (require.main === module) {
  const remover = new ConservativeTypeAssertionRemover();
  remover.run();
}

module.exports = ConservativeTypeAssertionRemover;
