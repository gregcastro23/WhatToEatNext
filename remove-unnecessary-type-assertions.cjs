#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Enhanced script to remove unnecessary type assertions (694 cases)
 * Based on the comprehensive type assertion analysis
 * Focuses specifically on the "unnecessary" category while preserving safety
 */

class UnnecessaryTypeAssertionRemover {
  constructor() {
    this.processedFiles = 0;
    this.removedAssertions = 0;
    this.skippedAssertions = 0;
    this.errors = [];
    this.analysisData = null;
    this.dryRun = process.argv.includes("--dry-run");
  }

  /**
   * Load the existing type assertion analysis
   */
  loadAnalysisData() {
    try {
      const analysisPath = "./type-assertions-analysis.json";
      if (fs.existsSync(analysisPath)) {
        const data = fs.readFileSync(analysisPath, "utf8");
        this.analysisData = JSON.parse(data);
        console.log(
          `📊 Loaded analysis data: ${this.analysisData.assertions.length} assertions analyzed`,
        );
        console.log(
          `🎯 Target: ${this.analysisData.summary.categories.unnecessary} unnecessary assertions`,
        );
      }
    } catch (error) {
      console.warn(
        "⚠️  Could not load analysis data, using pattern-based approach",
      );
    }
  }

  /**
   * Get unnecessary type assertion patterns based on analysis
   */
  getUnnecessaryPatterns() {
    return [
      // Pattern 1: Assertions to 'any' that defeat type safety
      {
        pattern: /\(\s*([^)]+)\s+as\s+any\s*\)/g,
        replacement: "($1 as unknown)",
        description: "Replace any assertion with unknown",
        category: "unnecessary",
      },

      // Pattern 2: Simple variable as any
      {
        pattern: /(\w+)\s+as\s+any(?!\w)/g,
        replacement: "$1 as unknown",
        description: "Replace simple any assertion with unknown",
        category: "unnecessary",
      },

      // Pattern 3: Redundant string assertions on string literals
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+string(?!\[\])/g,
        replacement: "$1",
        description: "Remove redundant string assertion on string literal",
        category: "unnecessary",
      },

      // Pattern 4: Redundant number assertions on numeric literals
      {
        pattern: /(\d+(?:\.\d+)?)\s+as\s+number(?!\[\])/g,
        replacement: "$1",
        description: "Remove redundant number assertion on numeric literal",
        category: "unnecessary",
      },

      // Pattern 5: Redundant boolean assertions on boolean literals
      {
        pattern: /(true|false)\s+as\s+boolean(?!\[\])/g,
        replacement: "$1",
        description: "Remove redundant boolean assertion on boolean literal",
        category: "unnecessary",
      },

      // Pattern 6: Redundant const assertions on simple literals
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+const/g,
        replacement: "$1",
        description: "Remove redundant const assertion on string literal",
        category: "unnecessary",
      },

      // Pattern 7: Unnecessary object assertions to Record<string, any>
      {
        pattern: /(\{[^}]*\})\s+as\s+Record<string,\s*any>/g,
        replacement: "$1 as Record<string, unknown>",
        description: "Replace Record<string, any> with Record<string, unknown>",
        category: "unnecessary",
      },
    ];
  }

  /**
   * Check if file should be processed based on analysis data
   */
  shouldProcessFile(filePath) {
    // Only process TypeScript files
    if (!/\.(ts|tsx)$/.test(filePath)) {
      return false;
    }

    // Skip node_modules and other excluded directories
    if (
      filePath.includes("node_modules") ||
      filePath.includes(".git") ||
      filePath.includes("dist") ||
      filePath.includes("build") ||
      filePath.includes(".next")
    ) {
      return false;
    }

    // If we have analysis data, check if this file has unnecessary assertions
    if (this.analysisData) {
      const normalizedPath = filePath.replace(/^\.\//, "");
      const hasUnnecessaryAssertions = this.analysisData.assertions.some(
        (assertion) =>
          assertion.file === normalizedPath &&
          assertion.analysis.category === "unnecessary",
      );

      if (!hasUnnecessaryAssertions) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if specific assertion should be preserved
   */
  shouldPreserveAssertion(content, assertionMatch, filePath) {
    // Always preserve test file assertions (they need flexibility)
    if (
      /\.(test|spec)\.(ts|tsx)$/.test(filePath) ||
      filePath.includes("__tests__")
    ) {
      return true;
    }

    // Preserve assertions with explanatory comments
    const lines = content.split("\n");
    const matchIndex = content.indexOf(assertionMatch);
    const matchLine = content.substring(0, matchIndex).split("\n").length - 1;

    // Check for comments explaining the assertion
    if (matchLine > 0) {
      const prevLine = lines[matchLine - 1];
      if (prevLine && (prevLine.includes("//") || prevLine.includes("/*"))) {
        // Check if comment explains why assertion is needed
        if (
          prevLine.toLowerCase().includes("necessary") ||
          prevLine.toLowerCase().includes("required") ||
          prevLine.toLowerCase().includes("external") ||
          prevLine.toLowerCase().includes("library")
        ) {
          return true;
        }
      }
    }

    // Preserve assertions in error handling contexts
    const contextBefore = content.substring(
      Math.max(0, matchIndex - 200),
      matchIndex,
    );
    if (
      contextBefore.includes("catch") ||
      contextBefore.includes("error") ||
      contextBefore.includes("Error")
    ) {
      return true;
    }

    // Preserve complex type assertions that might be necessary
    if (
      assertionMatch.includes("Record<") ||
      assertionMatch.includes("import(") ||
      assertionMatch.includes("typeof") ||
      assertionMatch.includes("keyof")
    ) {
      return true;
    }

    // Preserve assertions in campaign system files (they have complex patterns)
    if (filePath.includes("/campaign/")) {
      return true;
    }

    return false;
  }

  /**
   * Process a single file to remove unnecessary type assertions
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      let modifiedContent = content;
      let fileChanges = 0;

      const patterns = this.getUnnecessaryPatterns();

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
            !["node_modules", ".git", "dist", "build", ".next"].includes(
              entry.name,
            )
          ) {
            files.push(...this.findTypeScriptFiles(fullPath));
          }
        } else if (this.shouldProcessFile(fullPath)) {
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
   * Generate detailed report based on analysis data
   */
  generateReport() {
    console.log("\n📊 Detailed Analysis Report:");

    if (this.analysisData) {
      const unnecessaryAssertions = this.analysisData.assertions.filter(
        (a) => a.analysis.category === "unnecessary",
      );

      console.log(
        `Total unnecessary assertions found: ${unnecessaryAssertions.length}`,
      );

      // Group by file
      const fileGroups = {};
      unnecessaryAssertions.forEach((assertion) => {
        if (!fileGroups[assertion.file]) {
          fileGroups[assertion.file] = [];
        }
        fileGroups[assertion.file].push(assertion);
      });

      console.log(
        `Files with unnecessary assertions: ${Object.keys(fileGroups).length}`,
      );

      // Show top files with most unnecessary assertions
      const sortedFiles = Object.entries(fileGroups)
        .sort(([, a], [, b]) => b.length - a.length)
        .slice(0, 10);

      console.log("\nTop files with unnecessary assertions:");
      sortedFiles.forEach(([file, assertions]) => {
        console.log(`  ${file}: ${assertions.length} assertions`);
      });
    }
  }

  /**
   * Main execution method
   */
  run() {
    console.log(
      `🚀 Starting unnecessary type assertion removal${this.dryRun ? " (DRY RUN)" : ""}...\n`,
    );

    // Load analysis data
    this.loadAnalysisData();

    // Generate initial report
    this.generateReport();

    // Find all TypeScript files to process
    const files = this.findTypeScriptFiles("./src");
    console.log(`\nFound ${files.length} TypeScript files to process\n`);

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
      `\n✅ Unnecessary type assertion ${mode} completed successfully!`,
    );

    if (this.dryRun) {
      console.log("\n💡 Run without --dry-run to apply changes");
    }
  }
}

// Run the script
if (require.main === module) {
  const remover = new UnnecessaryTypeAssertionRemover();
  remover.run();
}

module.exports = UnnecessaryTypeAssertionRemover;
