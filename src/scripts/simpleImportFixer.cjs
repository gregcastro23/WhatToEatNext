#!/usr/bin/env node

/**
 * Simple Import Fixer
 *
 * A lightweight approach to fix import organization issues:
 * - Remove duplicate import statements
 * - Basic import organization
 * - Safe file processing with validation
 */

const fs = require("fs");
const path = require("path");

class SimpleImportFixer {
  constructor() {
    this.srcDir = path.join(process.cwd(), "src");
    this.processedFiles = 0;
    this.fixedFiles = 0;
    this.duplicatesFound = 0;
    this.duplicatesFixed = 0;
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

  analyzeImports(content) {
    const lines = content.split("\n");
    const imports = new Map(); // source -> { lines: [], imports: Set(), defaultImport: string, namespaceImport: string }
    const importLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Match import statements
      const importMatch = trimmedLine.match(
        /^import\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`];?\s*$/,
      );

      if (importMatch) {
        const [, importPart, source] = importMatch;
        importLines.push(i);

        if (!imports.has(source)) {
          imports.set(source, {
            lines: [],
            imports: new Set(),
            defaultImport: null,
            namespaceImport: null,
          });
        }

        const importInfo = imports.get(source);
        importInfo.lines.push(i);

        // Parse different import types
        if (importPart.includes("{")) {
          // Named imports: import { a, b, c } from 'module'
          const namedMatch = importPart.match(/\{([^}]+)\}/);
          if (namedMatch) {
            const namedImports = namedMatch[1]
              .split(",")
              .map((imp) => imp.trim())
              .filter((imp) => imp.length > 0);

            namedImports.forEach((imp) => importInfo.imports.add(imp));
          }
        }

        if (importPart.includes("* as ")) {
          // Namespace import: import * as name from 'module'
          const namespaceMatch = importPart.match(/\*\s+as\s+(\w+)/);
          if (namespaceMatch) {
            importInfo.namespaceImport = namespaceMatch[1];
          }
        }

        // Default import: import name from 'module' or import name, { ... } from 'module'
        const defaultMatch = importPart.match(/^([^{,*]+)(?=,|\s*$)/);
        if (defaultMatch && !defaultMatch[1].includes("*")) {
          importInfo.defaultImport = defaultMatch[1].trim();
        }
      }
    }

    return { imports, importLines, lines };
  }

  fixDuplicateImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const { imports, importLines, lines } = this.analyzeImports(content);

      let hasChanges = false;
      const newLines = [...lines];

      // Find and fix duplicates
      for (const [source, importInfo] of imports) {
        if (importInfo.lines.length > 1) {
          this.duplicatesFound++;

          // Keep the first import line, remove others
          const firstLineIndex = importInfo.lines[0];
          const linesToRemove = importInfo.lines.slice(1).sort((a, b) => b - a); // Remove from end to start

          // Remove duplicate lines
          for (const lineIndex of linesToRemove) {
            newLines.splice(lineIndex, 1);
          }

          // Merge all imports into the first line
          const parts = [];

          if (importInfo.defaultImport) {
            parts.push(importInfo.defaultImport);
          }

          if (importInfo.namespaceImport) {
            parts.push(`* as ${importInfo.namespaceImport}`);
          }

          if (importInfo.imports.size > 0) {
            const sortedImports = Array.from(importInfo.imports).sort();
            parts.push(`{ ${sortedImports.join(", ")} }`);
          }

          const mergedImport = `import ${parts.join(", ")} from '${source}';`;

          // Update the first line (accounting for removed lines)
          const adjustedIndex =
            firstLineIndex -
            linesToRemove.filter((idx) => idx < firstLineIndex).length;
          newLines[adjustedIndex] = mergedImport;

          hasChanges = true;
          this.duplicatesFixed++;
        }
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, newLines.join("\n"));
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `⚠️ Failed to fix duplicates in ${filePath}:`,
        error.message,
      );
      return false;
    }
  }

  organizeImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      // Find import section boundaries
      let importStartIndex = -1;
      let importEndIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("import ")) {
          if (importStartIndex === -1) {
            importStartIndex = i;
          }
          importEndIndex = i;
        } else if (
          importStartIndex !== -1 &&
          line !== "" &&
          !line.startsWith("//")
        ) {
          // Non-empty, non-comment line after imports
          break;
        }
      }

      if (importStartIndex === -1) {
        return false; // No imports found
      }

      // Extract import lines
      const importLines = [];
      for (let i = importStartIndex; i <= importEndIndex; i++) {
        const line = lines[i].trim();
        if (line.startsWith("import ")) {
          importLines.push(lines[i]);
        }
      }

      // Categorize imports
      const categories = {
        builtin: [],
        external: [],
        internal: [],
        relative: [],
      };

      for (const importLine of importLines) {
        const match = importLine.match(/from\s+['"`]([^'"`]+)['"`]/);
        if (match) {
          const source = match[1];

          if (
            source.startsWith("node:") ||
            ["fs", "path", "crypto", "util", "child_process"].includes(source)
          ) {
            categories.builtin.push(importLine);
          } else if (
            source.startsWith("@/") ||
            source.startsWith("@components/") ||
            source.startsWith("@utils/")
          ) {
            categories.internal.push(importLine);
          } else if (source.startsWith("./") || source.startsWith("../")) {
            categories.relative.push(importLine);
          } else {
            categories.external.push(importLine);
          }
        }
      }

      // Sort each category
      Object.keys(categories).forEach((key) => {
        categories[key].sort();
      });

      // Rebuild import section with proper spacing
      const organizedImports = [];

      if (categories.builtin.length > 0) {
        organizedImports.push(...categories.builtin, "");
      }
      if (categories.external.length > 0) {
        organizedImports.push(...categories.external, "");
      }
      if (categories.internal.length > 0) {
        organizedImports.push(...categories.internal, "");
      }
      if (categories.relative.length > 0) {
        organizedImports.push(...categories.relative, "");
      }

      // Remove trailing empty line
      if (organizedImports[organizedImports.length - 1] === "") {
        organizedImports.pop();
      }

      // Check if organization changed
      const originalImports = lines.slice(importStartIndex, importEndIndex + 1);
      if (
        JSON.stringify(organizedImports) !== JSON.stringify(originalImports)
      ) {
        // Replace import section
        const newLines = [
          ...lines.slice(0, importStartIndex),
          ...organizedImports,
          ...lines.slice(importEndIndex + 1),
        ];

        fs.writeFileSync(filePath, newLines.join("\n"));
        return true;
      }

      return false;
    } catch (error) {
      console.warn(
        `⚠️ Failed to organize imports in ${filePath}:`,
        error.message,
      );
      return false;
    }
  }

  processFile(filePath) {
    this.processedFiles++;

    let fileChanged = false;

    // Step 1: Fix duplicate imports
    if (this.fixDuplicateImports(filePath)) {
      fileChanged = true;
    }

    // Step 2: Organize imports
    if (this.organizeImports(filePath)) {
      fileChanged = true;
    }

    if (fileChanged) {
      this.fixedFiles++;
    }

    return fileChanged;
  }

  generateReport() {
    const report = `
# Simple Import Fixer Report

## Processing Summary
- **Files Processed**: ${this.processedFiles}
- **Files Modified**: ${this.fixedFiles}
- **Duplicate Import Sources Found**: ${this.duplicatesFound}
- **Duplicate Import Sources Fixed**: ${this.duplicatesFixed}

## Success Rate
- **File Modification Rate**: ${this.processedFiles > 0 ? Math.round((this.fixedFiles / this.processedFiles) * 100) : 0}%
- **Duplicate Fix Rate**: ${this.duplicatesFound > 0 ? Math.round((this.duplicatesFixed / this.duplicatesFound) * 100) : 0}%

Generated: ${new Date().toISOString()}
`;

    fs.writeFileSync("simple-import-fixer-report.md", report);
    console.log("📊 Report generated: simple-import-fixer-report.md");
  }

  async run() {
    console.log("🚀 Starting Simple Import Fixer");
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
        const relativePath = path.relative(this.srcDir, file);
        const changed = this.processFile(file);

        if (changed) {
          console.log(`   ✅ Fixed: ${relativePath}`);
        }
      }

      this.generateReport();

      console.log("=".repeat(50));
      console.log(`✅ Simple import fixing completed!`);
      console.log(`   Files processed: ${this.processedFiles}`);
      console.log(`   Files modified: ${this.fixedFiles}`);
      console.log(`   Duplicates fixed: ${this.duplicatesFixed}`);
    } catch (error) {
      console.error("❌ Simple import fixing failed:", error);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new SimpleImportFixer();
  fixer.run().catch(console.error);
}

module.exports = SimpleImportFixer;
