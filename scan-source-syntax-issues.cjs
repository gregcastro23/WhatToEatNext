#!/usr/bin/env node

/**
 * Source File Syntax Validation Scanner
 *
 * This script scans all source files for syntax issues including:
 * - Malformed property access patterns
 * - Template literal expression issues
 * - Console statement formatting problems
 * - General syntax corruption patterns
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
  outputFile: "syntax-validation-report.json",
};

// Syntax issue patterns to detect
const SYNTAX_PATTERNS = {
  malformedPropertyAccess: [
    /\.\s*\?\s*\.\s*\?\s*\./g, // Multiple optional chaining
    /\[\s*\?\s*\]/g, // Malformed bracket access
    /\.\s*\[\s*\?\s*\]/g, // Mixed access patterns
    /\?\s*\.\s*\?\s*\[/g, // Chained optional access issues
  ],
  templateLiteralIssues: [
    /`[^`]*\$\{[^}]*\$\{[^}]*\}[^}]*\}/g, // Nested template expressions
    /`[^`]*\$\{[^}]*`[^`]*`[^}]*\}/g, // Template literal in template
    /\$\{[^}]*\$\{/g, // Unclosed template expressions
    /`[^`]*\\\$\{/g, // Escaped template expressions
  ],
  consoleStatementIssues: [
    /console\s*\.\s*\?\s*\./g, // Optional chaining on console
    /console\s*\[\s*['"][^'"]*['"]\s*\]/g, // Bracket notation console access
    /console\s*\.\s*log\s*\?\s*\(/g, // Optional call on console.log
    /console\s*\.\s*\w+\s*\?\.\s*\(/g, // Optional chaining on console methods
  ],
  generalSyntaxIssues: [
    /\(\s*\?\s*\)/g, // Empty optional expressions
    /\{\s*\?\s*\}/g, // Empty optional objects
    /\[\s*\?\s*\]/g, // Empty optional arrays
    /\?\s*\?\s*\?/g, // Multiple question marks
    /\.\s*\.\s*\./g, // Multiple dots without spread
    /\s+as\s+unknown\s+as\s+/g, // Double type casting
    /\s+as\s+any\s+as\s+/g, // Any type casting chains
  ],
};

class SyntaxValidator {
  constructor() {
    this.results = {
      totalFilesScanned: 0,
      filesWithIssues: 0,
      issuesByType: {},
      issuesByFile: {},
      summary: {
        malformedPropertyAccess: 0,
        templateLiteralIssues: 0,
        consoleStatementIssues: 0,
        generalSyntaxIssues: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all source files to scan
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
   * Scan a single file for syntax issues
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const fileIssues = [];

      // Check each pattern category
      for (const [category, patterns] of Object.entries(SYNTAX_PATTERNS)) {
        for (const pattern of patterns) {
          const matches = [...content.matchAll(pattern)];

          for (const match of matches) {
            const lineNumber = this.getLineNumber(content, match.index);
            const issue = {
              type: category,
              pattern: pattern.source,
              match: match[0],
              line: lineNumber,
              column: match.index - this.getLineStart(content, match.index),
              context: this.getContext(content, match.index),
            };

            fileIssues.push(issue);
            this.results.summary[category]++;
          }
        }
      }

      if (fileIssues.length > 0) {
        this.results.filesWithIssues++;
        this.results.issuesByFile[filePath] = fileIssues;

        // Group by issue type
        for (const issue of fileIssues) {
          if (!this.results.issuesByType[issue.type]) {
            this.results.issuesByType[issue.type] = [];
          }
          this.results.issuesByType[issue.type].push({
            file: filePath,
            ...issue,
          });
        }
      }

      this.results.totalFilesScanned++;

      return fileIssues;
    } catch (error) {
      console.warn(`Warning: Could not scan file ${filePath}:`, error.message);
      return [];
    }
  }

  /**
   * Get line number for a character index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split("\n").length;
  }

  /**
   * Get the start index of the line containing the given index
   */
  getLineStart(content, index) {
    const beforeIndex = content.substring(0, index);
    const lastNewline = beforeIndex.lastIndexOf("\n");
    return lastNewline === -1 ? 0 : lastNewline + 1;
  }

  /**
   * Get context around a match
   */
  getContext(content, index, contextLength = 50) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end).replace(/\n/g, "\\n");
  }

  /**
   * Run the complete syntax validation scan
   */
  async runScan() {
    console.log("🔍 Starting Source File Syntax Validation Scan...");
    console.log(
      `📁 Scanning directories: ${CONFIG.sourceDirectories.join(", ")}`,
    );
    console.log(`📄 File extensions: ${CONFIG.fileExtensions.join(", ")}`);

    const files = this.getSourceFiles();
    console.log(`📊 Found ${files.length} files to scan`);

    if (files.length === 0) {
      console.log("⚠️  No source files found to scan");
      return this.results;
    }

    // Scan all files
    let processedCount = 0;
    for (const file of files) {
      this.scanFile(file);
      processedCount++;

      if (processedCount % 50 === 0) {
        console.log(
          `📈 Progress: ${processedCount}/${files.length} files scanned`,
        );
      }
    }

    // Generate summary
    this.generateSummary();

    // Save results
    this.saveResults();

    return this.results;
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log("\n📋 SYNTAX VALIDATION SUMMARY");
    console.log("=".repeat(50));
    console.log(`📊 Total files scanned: ${this.results.totalFilesScanned}`);
    console.log(`🚨 Files with issues: ${this.results.filesWithIssues}`);
    console.log(
      `✅ Clean files: ${this.results.totalFilesScanned - this.results.filesWithIssues}`,
    );

    console.log("\n🔍 Issues by Category:");
    for (const [category, count] of Object.entries(this.results.summary)) {
      if (count > 0) {
        console.log(`  • ${category}: ${count} issues`);
      }
    }

    if (this.results.filesWithIssues > 0) {
      console.log("\n🚨 Top Files with Issues:");
      const fileIssueCount = Object.entries(this.results.issuesByFile)
        .map(([file, issues]) => ({ file, count: issues.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      for (const { file, count } of fileIssueCount) {
        console.log(`  • ${file}: ${count} issues`);
      }
    }

    const totalIssues = Object.values(this.results.summary).reduce(
      (sum, count) => sum + count,
      0,
    );
    console.log(`\n📈 Total syntax issues found: ${totalIssues}`);
  }

  /**
   * Save results to file
   */
  saveResults() {
    try {
      fs.writeFileSync(
        CONFIG.outputFile,
        JSON.stringify(this.results, null, 2),
      );
      console.log(`\n💾 Results saved to: ${CONFIG.outputFile}`);
    } catch (error) {
      console.error("❌ Failed to save results:", error.message);
    }
  }

  /**
   * Get TypeScript compilation errors for comparison
   */
  async getTypeScriptErrors() {
    try {
      console.log("\n🔧 Checking TypeScript compilation status...");
      const output = execSync("yarn tsc --noEmit --skipLibCheck 2>&1", {
        encoding: "utf8",
        stdio: "pipe",
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`📊 Current TypeScript errors: ${errorCount}`);

      return { errorCount, output };
    } catch (error) {
      // Handle case where there are no errors (exit code 0) or errors exist (exit code 2)
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      console.log(`📊 Current TypeScript errors: ${errorCount}`);

      return { errorCount, output: error.stdout || "" };
    }
  }
}

// Main execution
async function main() {
  try {
    const validator = new SyntaxValidator();

    // Run syntax validation
    const results = await validator.runScan();

    // Also check TypeScript compilation status
    await validator.getTypeScriptErrors();

    // Exit with appropriate code
    const totalIssues = Object.values(results.summary).reduce(
      (sum, count) => sum + count,
      0,
    );

    if (totalIssues === 0) {
      console.log("\n✅ SUCCESS: No syntax issues found!");
      process.exit(0);
    } else {
      console.log(`\n⚠️  ISSUES FOUND: ${totalIssues} syntax issues detected`);
      console.log("📋 Review the detailed report for specific fixes needed");
      process.exit(1);
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

module.exports = { SyntaxValidator, SYNTAX_PATTERNS, CONFIG };
