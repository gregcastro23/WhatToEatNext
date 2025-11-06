#!/usr/bin/env node

/**
 * Fix Broken Imports Script
 *
 * This script fixes import statements that are missing the 'import' keyword
 * due to previous processing errors.
 */

const fs = require("fs");
const path = require("path");

class BrokenImportFixer {
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

  fixBrokenImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      let hasChanges = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();

        // Check for lines that look like broken import statements
        // Pattern: starts with whitespace, then named imports, then 'from'
        const brokenImportMatch = trimmedLine.match(
          /^(\s*)([\w\s,{}]+)\s+from\s+['"`]([^'"`]+)['"`];?\s*$/,
        );

        if (brokenImportMatch && !trimmedLine.startsWith("import")) {
          const [, leadingSpace, importPart, source] = brokenImportMatch;

          // Check if this looks like a valid import part (contains { } or valid identifiers)
          if (
            importPart.includes("{") ||
            /^[a-zA-Z_$][a-zA-Z0-9_$]*(\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(
              importPart.trim(),
            )
          ) {
            // Fix the import by adding the 'import' keyword
            const fixedLine = `${leadingSpace}import ${importPart} from '${source}';`;
            lines[i] = fixedLine;
            hasChanges = true;
            this.fixedImports++;

            console.log(
              `   Fixed broken import in ${path.relative(this.srcDir, filePath)}:${i + 1}`,
            );
            console.log(`     Before: ${trimmedLine}`);
            console.log(`     After:  import ${importPart} from '${source}';`);
          }
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
        `⚠️ Failed to fix broken imports in ${filePath}:`,
        error.message,
      );
      return false;
    }
  }

  async run() {
    console.log("🚀 Starting Broken Import Fixer");
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
        this.fixBrokenImports(file);
      }

      console.log("=".repeat(50));
      console.log(`✅ Broken import fixing completed!`);
      console.log(`   Files fixed: ${this.fixedFiles}`);
      console.log(`   Imports fixed: ${this.fixedImports}`);
    } catch (error) {
      console.error("❌ Broken import fixing failed:", error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new BrokenImportFixer();
  fixer.run().catch(console.error);
}

module.exports = BrokenImportFixer;
