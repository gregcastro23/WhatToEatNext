#!/usr/bin/env node

/**
 * Direct JSX Entity Fixer
 *
 * This script directly searches for and fixes unescaped JSX entities
 * without relying on ESLint output to avoid buffer issues.
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

class DirectJSXEntityFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Find all TSX files in the src directory
   */
  findTSXFiles() {
    try {
      return glob.sync("src/**/*.tsx", {
        ignore: ["**/node_modules/**", "**/*.test.tsx", "**/*.spec.tsx"],
      });
    } catch (error) {
      console.error("Error finding TSX files:", error.message);
      return [];
    }
  }

  /**
   * Check if a line contains template literal syntax
   */
  isTemplateLiteral(line) {
    const templatePatterns = [
      /`[^`]*\$\{[^}]*\}[^`]*`/, // Template literal with interpolation
      /`[^`]*`/, // Simple template literal
      /\$\{[^}]*\}/, // Template interpolation
    ];

    return templatePatterns.some((pattern) => pattern.test(line));
  }

  /**
   * Check if a line is within a comment
   */
  isInComment(lines, lineIndex) {
    const line = lines[lineIndex].trim();

    // Single-line comment
    if (line.startsWith("//")) {
      return true;
    }

    // Multi-line comment check
    let inComment = false;
    for (let i = 0; i <= lineIndex; i++) {
      const currentLine = lines[i];
      const commentStart = currentLine.indexOf("/*");
      const commentEnd = currentLine.indexOf("*/");

      if (commentStart !== -1) {
        inComment = true;
      }
      if (commentEnd !== -1 && commentEnd > commentStart) {
        inComment = false;
      }
    }

    return inComment;
  }

  /**
   * Check if position is within JSX text content (not attributes)
   */
  isJSXTextContent(line, position) {
    const beforePos = line.substring(0, position);
    const afterPos = line.substring(position);

    // Count quotes to determine if we're in an attribute
    const beforeQuotes = (beforePos.match(/"/g) || []).length;
    const beforeSingleQuotes = (beforePos.match(/'/g) || []).length;

    // If we're inside quotes, we're likely in an attribute
    if (beforeQuotes % 2 === 1 || beforeSingleQuotes % 2 === 1) {
      return false;
    }

    // Check if we're between JSX tags (> ... <)
    const lastOpenTag = beforePos.lastIndexOf(">");
    const lastCloseTag = beforePos.lastIndexOf("<");
    const nextOpenTag = afterPos.indexOf("<");

    // We're in JSX text if we're after a > and before a <
    return lastOpenTag > lastCloseTag && nextOpenTag !== -1;
  }

  /**
   * Find and fix unescaped entities in JSX text
   */
  fixEntitiesInFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let modified = false;
      let fileFixCount = 0;

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];

        // Skip if line contains template literals
        if (this.isTemplateLiteral(line)) {
          continue;
        }

        // Skip if line is in comments
        if (this.isInComment(lines, lineIndex)) {
          continue;
        }

        // Look for unescaped entities in JSX text
        const entityPattern = /['"&<>]/g;
        let match;
        const fixes = [];

        while ((match = entityPattern.exec(line)) !== null) {
          const char = match[0];
          const position = match.index;

          // Check if this is in JSX text content
          if (this.isJSXTextContent(line, position)) {
            let replacement = "";

            switch (char) {
              case "'":
                replacement = "&apos;";
                break;
              case '"':
                replacement = "&quot;";
                break;
              case "&":
                // Only replace if not already an entity
                if (!line.substring(position).match(/^&[a-zA-Z0-9#]+;/)) {
                  replacement = "&amp;";
                }
                break;
              case "<":
                replacement = "&lt;";
                break;
              case ">":
                replacement = "&gt;";
                break;
            }

            if (replacement) {
              fixes.push({ position, char, replacement });
            }
          }
        }

        // Apply fixes in reverse order to maintain positions
        if (fixes.length > 0) {
          let newLine = line;
          fixes.reverse().forEach((fix) => {
            newLine =
              newLine.substring(0, fix.position) +
              fix.replacement +
              newLine.substring(fix.position + 1);

            console.log(
              `Fixed '${fix.char}' -> '${fix.replacement}' in ${filePath}:${lineIndex + 1}:${fix.position + 1}`,
            );
            fileFixCount++;
          });

          lines[lineIndex] = newLine;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, lines.join("\n"));
        this.fixedFiles.push(filePath);
        this.totalFixes += fileFixCount;
        console.log(`✅ Fixed ${fileFixCount} JSX entities in ${filePath}`);
      }
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  /**
   * Run the fixing process
   */
  async run() {
    console.log("🔍 Finding TSX files...");

    const tsxFiles = this.findTSXFiles();
    console.log(`📝 Found ${tsxFiles.length} TSX files to check`);

    for (const filePath of tsxFiles) {
      this.fixEntitiesInFile(filePath);
    }

    this.generateReport();
  }

  /**
   * Generate summary report
   */
  generateReport() {
    console.log("\n" + "=".repeat(60));
    console.log("DIRECT JSX ENTITY FIXING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Files processed: ${this.fixedFiles.length}`);
    console.log(`Total fixes applied: ${this.totalFixes}`);
    console.log(`Errors encountered: ${this.errors.length}`);

    if (this.fixedFiles.length > 0) {
      console.log("\n✅ Fixed files:");
      this.fixedFiles.forEach((file) => {
        console.log(`  - ${file}`);
      });
    }

    if (this.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        filesProcessed: this.fixedFiles.length,
        totalFixes: this.totalFixes,
        errors: this.errors.length,
      },
      fixedFiles: this.fixedFiles,
      errors: this.errors,
    };

    fs.writeFileSync(
      "jsx-entity-fixes-direct-report.json",
      JSON.stringify(report, null, 2),
    );
    console.log(
      "\n📊 Detailed report saved to jsx-entity-fixes-direct-report.json",
    );
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new DirectJSXEntityFixer();
  fixer.run().catch(console.error);
}

module.exports = DirectJSXEntityFixer;
