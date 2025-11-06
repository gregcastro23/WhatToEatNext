#!/usr/bin/env node

/**
 * Fix Malformed Property Access Patterns
 *
 * This script identifies and fixes malformed property access patterns including:
 * - Multiple optional chaining operators
 * - Malformed bracket access patterns
 * - Mixed access patterns that could cause syntax errors
 * - Incorrect optional chaining usage
 *
 * Part of Phase 9.3: Source File Syntax Validation
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CONFIG = {
  sourceDirectories: ["src", "lib"],
  fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
  excludePatterns: [
    "node_modules",
    ".next",
    "dist",
    "build",
    ".git",
    "__tests__",
    ".test.",
    ".spec.",
    "coverage",
  ],
  maxFilesToProcess: 1000,
  backupDirectory: ".property-access-backups",
  dryRun: false,
};

// Malformed property access patterns to fix
const PROPERTY_ACCESS_FIXES = [
  {
    name: "Multiple Optional Chaining",
    pattern: /(\w+)\s*\?\s*\.\s*\?\s*\./g,
    replacement: "$1?.",
    description: "Fix multiple optional chaining operators",
  },
  {
    name: "Malformed Bracket Access",
    pattern: /(\w+)\s*\[\s*\?\s*\]/g,
    replacement: "$1",
    description: "Remove malformed bracket access with question mark",
  },
  {
    name: "Mixed Optional Access",
    pattern: /(\w+)\s*\.\s*\[\s*\?\s*\]/g,
    replacement: "$1",
    description: "Fix mixed property and bracket access with question mark",
  },
  {
    name: "Chained Optional Issues",
    pattern: /(\w+)\s*\?\s*\.\s*\?\s*\[/g,
    replacement: "$1?.[",
    description: "Fix chained optional access issues",
  },
  {
    name: "Double Question Marks",
    pattern: /(\w+)\s*\?\s*\?\s*\./g,
    replacement: "$1?.",
    description: "Fix double question marks in property access",
  },
  {
    name: "Spaced Optional Chaining",
    pattern: /(\w+)\s*\?\s+\.\s*(\w+)/g,
    replacement: "$1?.$2",
    description: "Fix spaced optional chaining",
  },
  {
    name: "Optional Chaining on Literals",
    pattern: /(null|undefined)\s*\?\s*\./g,
    replacement: "$1",
    description: "Remove optional chaining on null/undefined literals",
  },
  {
    name: "Empty Optional Access",
    pattern: /\?\s*\.\s*\?\s*$/gm,
    replacement: "",
    description: "Remove empty optional access at end of line",
  },
];

class PropertyAccessFixer {
  constructor() {
    this.results = {
      totalFilesProcessed: 0,
      filesModified: 0,
      fixesByType: {},
      fixesByFile: {},
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // Initialize fix counters
    for (const fix of PROPERTY_ACCESS_FIXES) {
      this.results.fixesByType[fix.name] = 0;
    }
  }

  /**
   * Get all source files to process
   */
  getSourceFiles() {
    const files = [];

    for (const dir of CONFIG.sourceDirectories) {
      if (fs.existsSync(dir)) {
        this.collectFiles(dir, files);
      }
    }

    return files.slice(0, CONFIG.maxFilesToProcess);
  }

  /**
   * Recursively collect files from directory
   */
  collectFiles(dir, files) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded patterns
        if (
          CONFIG.excludePatterns.some((pattern) => fullPath.includes(pattern))
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          this.collectFiles(fullPath, files);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (CONFIG.fileExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error.message);
    }
  }

  /**
   * Create backup of file before modification
   */
  createBackup(filePath) {
    try {
      if (!fs.existsSync(CONFIG.backupDirectory)) {
        fs.mkdirSync(CONFIG.backupDirectory, { recursive: true });
      }

      const backupPath = path.join(
        CONFIG.backupDirectory,
        path.basename(filePath) + ".backup",
      );
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(
        `Warning: Could not create backup for ${filePath}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Fix property access patterns in a single file
   */
  fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, "utf8");
      let modifiedContent = originalContent;
      const fileFixes = [];

      // Apply each fix pattern
      for (const fix of PROPERTY_ACCESS_FIXES) {
        const matches = [...originalContent.matchAll(fix.pattern)];

        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(
            fix.pattern,
            fix.replacement,
          );

          const fixCount = matches.length;
          this.results.fixesByType[fix.name] += fixCount;

          fileFixes.push({
            fixName: fix.name,
            count: fixCount,
            description: fix.description,
            matches: matches.map((match) => ({
              original: match[0],
              replacement: fix.replacement,
              line: this.getLineNumber(originalContent, match.index),
            })),
          });
        }
      }

      // Check if file was modified
      if (modifiedContent !== originalContent) {
        if (!CONFIG.dryRun) {
          // Create backup
          this.createBackup(filePath);

          // Write modified content
          fs.writeFileSync(filePath, modifiedContent, "utf8");
        }

        this.results.filesModified++;
        this.results.fixesByFile[filePath] = fileFixes;

        return { modified: true, fixes: fileFixes };
      }

      this.results.totalFilesProcessed++;
      return { modified: false, fixes: [] };
    } catch (error) {
      const errorMsg = `Error processing file ${filePath}: ${error.message}`;
      console.warn(errorMsg);
      this.results.errors.push(errorMsg);
      return { modified: false, fixes: [], error: errorMsg };
    }
  }

  /**
   * Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split("\n").length;
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  async validateTypeScript() {
    try {
      console.log("\n🔧 Validating TypeScript compilation...");
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: errorCount === 0, errorCount, output };
    } catch (error) {
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: false, errorCount, output: error.stdout || "" };
    }
  }

  /**
   * Run the complete property access fixing process
   */
  async runFixes() {
    console.log("🔧 Starting Malformed Property Access Pattern Fixes...");
    console.log(
      `📁 Processing directories: ${CONFIG.sourceDirectories.join(", ")}`,
    );
    console.log(`📄 File extensions: ${CONFIG.fileExtensions.join(", ")}`);
    console.log(`🔄 Dry run mode: ${CONFIG.dryRun ? "ENABLED" : "DISABLED"}`);

    const files = this.getSourceFiles();
    console.log(`📊 Found ${files.length} files to process`);

    if (files.length === 0) {
      console.log("⚠️  No source files found to process");
      return this.results;
    }

    // Process all files
    let processedCount = 0;
    for (const file of files) {
      const result = this.fixFile(file);
      processedCount++;

      if (result.modified) {
        console.log(
          `✅ Fixed: ${file} (${result.fixes.length} fix types applied)`,
        );
      }

      if (processedCount % 100 === 0) {
        console.log(
          `📈 Progress: ${processedCount}/${files.length} files processed`,
        );
      }
    }

    // Generate summary
    this.generateSummary();

    // Validate TypeScript compilation
    const validation = await this.validateTypeScript();
    this.results.validation = validation;

    // Save results
    this.saveResults();

    return this.results;
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log("\n📋 PROPERTY ACCESS FIX SUMMARY");
    console.log("=".repeat(50));
    console.log(
      `📊 Total files processed: ${this.results.totalFilesProcessed}`,
    );
    console.log(`🔧 Files modified: ${this.results.filesModified}`);
    console.log(
      `✅ Files unchanged: ${this.results.totalFilesProcessed - this.results.filesModified}`,
    );

    if (this.results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    }

    console.log("\n🔍 Fixes Applied by Type:");
    let totalFixes = 0;
    for (const [fixType, count] of Object.entries(this.results.fixesByType)) {
      if (count > 0) {
        console.log(`  • ${fixType}: ${count} fixes`);
        totalFixes += count;
      }
    }

    if (this.results.filesModified > 0) {
      console.log("\n🚨 Top Files Modified:");
      const fileFixCount = Object.entries(this.results.fixesByFile)
        .map(([file, fixes]) => ({
          file,
          count: fixes.reduce((sum, fix) => sum + fix.count, 0),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      for (const { file, count } of fileFixCount) {
        console.log(`  • ${file}: ${count} fixes`);
      }
    }

    console.log(`\n📈 Total property access fixes applied: ${totalFixes}`);

    if (CONFIG.dryRun) {
      console.log("\n⚠️  DRY RUN MODE: No files were actually modified");
    } else if (this.results.filesModified > 0) {
      console.log(`\n💾 Backups created in: ${CONFIG.backupDirectory}`);
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    try {
      const outputFile = "property-access-fix-report.json";
      fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${outputFile}`);
    } catch (error) {
      console.error("❌ Failed to save results:", error.message);
    }
  }

  /**
   * Rollback changes using backups
   */
  rollback() {
    try {
      if (!fs.existsSync(CONFIG.backupDirectory)) {
        console.log("❌ No backup directory found");
        return false;
      }

      const backups = fs.readdirSync(CONFIG.backupDirectory);
      let restoredCount = 0;

      for (const backup of backups) {
        if (backup.endsWith(".backup")) {
          const originalName = backup.replace(".backup", "");
          const backupPath = path.join(CONFIG.backupDirectory, backup);

          // Find the original file
          const files = this.getSourceFiles();
          const originalFile = files.find(
            (f) => path.basename(f) === originalName,
          );

          if (originalFile && fs.existsSync(originalFile)) {
            fs.copyFileSync(backupPath, originalFile);
            restoredCount++;
            console.log(`✅ Restored: ${originalFile}`);
          }
        }
      }

      console.log(`\n📈 Restored ${restoredCount} files from backups`);
      return true;
    } catch (error) {
      console.error("❌ Rollback failed:", error.message);
      return false;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--rollback")) {
    console.log("🔄 Rolling back property access fixes...");
    const fixer = new PropertyAccessFixer();
    const success = fixer.rollback();
    process.exit(success ? 0 : 1);
    return;
  }

  if (args.includes("--dry-run")) {
    CONFIG.dryRun = true;
  }

  try {
    const fixer = new PropertyAccessFixer();
    const results = await fixer.runFixes();

    // Exit with appropriate code
    const totalFixes = Object.values(results.fixesByType).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalFixes === 0) {
      console.log("\n✅ SUCCESS: No malformed property access patterns found!");
      process.exit(0);
    } else {
      console.log(`\n✅ SUCCESS: Applied ${totalFixes} property access fixes`);

      if (results.validation && !results.validation.success) {
        console.log("⚠️  WARNING: TypeScript compilation still has errors");
        console.log("Run with --rollback to undo changes if needed");
        process.exit(1);
      } else {
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("❌ FATAL ERROR:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { PropertyAccessFixer, PROPERTY_ACCESS_FIXES, CONFIG };
