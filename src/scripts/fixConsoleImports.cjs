#!/usr/bin/env node

/**
 * Fix Console Import Issues Script
 *
 * This script specifically fixes import statements that are missing the 'import' keyword
 * and are causing TypeScript compilation errors.
 */

const fs = require("fs");
const path = require("path");

class ConsoleImportFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), "src");
    this.fixedFiles = 0;
    this.fixedImports = 0;
  }

  getAllTypeScriptFiles() {
    const files = [];

    const scanDirectory = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (
            entry.isDirectory() &&
            !entry.name.startsWith(".") &&
            entry.name !== "node_modules"
          ) {
            scanDirectory(fullPath);
          } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to scan directory ${dir}:`, error.message);
      }
    };

    scanDirectory(this.srcDir);
    return files;
  }

  fixConsoleImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let hasChanges = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Look for lines that start with whitespace and have named imports followed by 'from'
        // but don't start with 'import' or 'export'
        if (
          trimmedLine.match(/^\s*\{.*\}\s+from\s+['"`].*['"`];?\s*$/) &&
          !trimmedLine.startsWith("import") &&
          !trimmedLine.startsWith("export")
        ) {
          // This looks like a broken import statement
          const leadingWhitespace = line.match(/^(\s*)/)[1];
          const fixedLine = `${leadingWhitespace}import ${trimmedLine}`;
          lines[i] = fixedLine;
          hasChanges = true;
          this.fixedImports++;

          console.log(
            `   Fixed broken import in ${path.relative(this.srcDir, filePath)}:${i + 1}`,
          );
          console.log(`     Before: ${trimmedLine}`);
          console.log(`     After:  import ${trimmedLine}`);
        }
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, lines.join("\n"));
        this.fixedFiles++;
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `⚠️ Failed to fix console imports in ${filePath}:`,
        error.message,
      );
      return false;
    }
  }

  async run() {
    console.log("🚀 Starting Console Import Fixer");
    console.log("=".repeat(50));

    try {
      const files = this.getAllTypeScriptFiles();
      console.log(`📁 Found ${files.length} TypeScript files`);

      if (files.length === 0) {
        console.log("✅ No TypeScript files to process");
        return;
      }

      console.log("🔧 Processing files...");

      for (const file of files) {
        this.fixConsoleImports(file);
      }

      console.log("=".repeat(50));
      console.log(`✅ Console import fixing completed!`);
      console.log(`   Files fixed: ${this.fixedFiles}`);
      console.log(`   Imports fixed: ${this.fixedImports}`);
    } catch (error) {
      console.error("❌ Console import fixing failed:", error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new ConsoleImportFixer();
  fixer.run().catch(console.error);
}

module.exports = ConsoleImportFixer;
