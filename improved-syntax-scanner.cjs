#!/usr/bin/env node

/**
 * Improved Source File Syntax Validation Scanner
 *
 * This script focuses on actual syntax issues that cause TypeScript compilation errors:
 * - Missing commas, semicolons, brackets
 * - Malformed object/array literals
 * - Unclosed template literals
 * - Invalid property access patterns
 * - Actual syntax corruption (not legitimate code patterns)
 *
 * Part of Phase 9.3: Source File Syntax Validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDirectories: ['src', 'lib'],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '.git',
    'coverage'
  ],
  maxFilesToProcess: 1000,
  outputFile: 'improved-syntax-validation-report.json'
};

// Refined syntax issue patterns - focusing on actual problems
const SYNTAX_PATTERNS = {
  // Missing punctuation that causes TS1005, TS1109 errors
  missingPunctuation: [
    /\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\}/g,  // Missing comma in object
    /\[\s*[^,\]]+\s+[^,\]]+\s*\]/g,                                      // Missing comma in array
    /\(\s*[^,)]+\s+[^,)]+\s*\)/g,                                        // Missing comma in function call
  ],

  // Malformed object literals
  malformedObjects: [
    /\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*[^:,}]/g,                          // Missing colon in object property
    /\{\s*[a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^,}]+\s*[a-zA-Z_$]/g,           // Missing comma after property
  ],

  // Unclosed brackets/braces/parentheses
  unclosedBrackets: [
    /\([^)]*$/gm,                                                        // Unclosed parentheses at end of line
    /\[[^\]]*$/gm,                                                       // Unclosed square brackets at end of line
    /\{[^}]*$/gm,                                                        // Unclosed curly braces at end of line
  ],

  // Invalid template literals
  invalidTemplateLiterals: [
    /`[^`]*\$\{[^}]*$/gm,                                               // Unclosed template expression
    /`[^`]*\$\{[^}]*\$[^{]/g,                                           // Malformed template expression
  ],

  // Actual syntax corruption patterns
  syntaxCorruption: [
    /\?\s*\?\s*\?/g,                                                    // Multiple question marks (not nullish coalescing)
    /\.\s*\?\s*\.\s*\?\s*\./g,                                          // Malformed optional chaining
    /\s+as\s+unknown\s+as\s+unknown/g,                                  // Double unknown casting
    /\(\s*\)\s*\(\s*\)/g,                                               // Empty double parentheses
  ]
};

class ImprovedSyntaxValidator {
  constructor() {
    this.results = {
      totalFilesScanned: 0,
      filesWithIssues: 0,
      issuesByType: {},
      issuesByFile: {},
      summary: {
        missingPunctuation: 0,
        malformedObjects: 0,
        unclosedBrackets: 0,
        invalidTemplateLiterals: 0,
        syntaxCorruption: 0
      },
      timestamp: new Date().toISOString()
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
        if (CONFIG.excludePatterns.some(pattern => fullPath.includes(pattern))) {
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
   * Check if a match is a false positive
   */
  isFalsePositive(content, match, matchIndex) {
    const context = content.substring(Math.max(0, matchIndex - 100), matchIndex + 100);

    // Skip spread operators (legitimate ...)
    if (match.match === '...' && context.includes('...')) {
      return true;
    }

    // Skip legitimate template literals with nested expressions
    if (match.type === 'invalidTemplateLiterals' && context.includes('${') && context.includes('}')) {
      // Check if it's actually a valid nested template literal
      const beforeMatch = content.substring(0, matchIndex);
      const openBraces = (beforeMatch.match(/\$\{/g) || []).length;
      const closeBraces = (beforeMatch.match(/\}/g) || []).length;
      if (openBraces > closeBraces) {
        return true; // Likely a valid nested expression
      }
    }

    // Skip comments
    if (context.includes('//') || context.includes('/*') || context.includes('*/')) {
      return true;
    }

    return false;
  }

  /**
   * Scan a single file for syntax issues
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileIssues = [];

      // Check each pattern category
      for (const [category, patterns] of Object.entries(SYNTAX_PATTERNS)) {
        for (const pattern of patterns) {
          const matches = [...content.matchAll(pattern)];

          for (const match of matches) {
            const matchObj = {
              type: category,
              pattern: pattern.source,
              match: match[0],
              index: match.index
            };

            // Skip false positives
            if (this.isFalsePositive(content, matchObj, match.index)) {
              continue;
            }

            const lineNumber = this.getLineNumber(content, match.index);
            const issue = {
              type: category,
              pattern: pattern.source,
              match: match[0],
              line: lineNumber,
              column: match.index - this.getLineStart(content, match.index),
              context: this.getContext(content, match.index)
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
            ...issue
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
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get the start index of the line containing the given index
   */
  getLineStart(content, index) {
    const beforeIndex = content.substring(0, index);
    const lastNewline = beforeIndex.lastIndexOf('\n');
    return lastNewline === -1 ? 0 : lastNewline + 1;
  }

  /**
   * Get context around a match
   */
  getContext(content, index, contextLength = 80) {
    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + contextLength);
    return content.substring(start, end).replace(/\n/g, '\\n').replace(/\t/g, '\\t');
  }

  /**
   * Get files with TypeScript compilation errors
   */
  async getFilesWithTSErrors() {
    try {
      console.log('\n🔧 Getting files with TypeScript compilation errors...');
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      const filesWithErrors = new Set();

      for (const line of errorLines) {
        const match = line.match(/^([^(]+)\(/);
        if (match) {
          filesWithErrors.add(match[1]);
        }
      }

      return Array.from(filesWithErrors);
    } catch (error) {
      const output = error.stdout || '';
      const errorLines = output.split('\n').filter(line => line.includes('error TS'));
      const filesWithErrors = new Set();

      for (const line of errorLines) {
        const match = line.match(/^([^(]+)\(/);
        if (match) {
          filesWithErrors.add(match[1]);
        }
      }

      return Array.from(filesWithErrors);
    }
  }

  /**
   * Run the complete syntax validation scan
   */
  async runScan() {
    console.log('🔍 Starting Improved Source File Syntax Validation Scan...');
    console.log(`📁 Scanning directories: ${CONFIG.sourceDirectories.join(', ')}`);
    console.log(`📄 File extensions: ${CONFIG.fileExtensions.join(', ')}`);

    // Get files with TypeScript errors first
    const tsErrorFiles = await this.getFilesWithTSErrors();
    console.log(`🚨 Found ${tsErrorFiles.length} files with TypeScript compilation errors`);

    const files = this.getSourceFiles();
    console.log(`📊 Found ${files.length} files to scan`);

    if (files.length === 0) {
      console.log('⚠️  No source files found to scan');
      return this.results;
    }

    // Prioritize files with TypeScript errors
    const prioritizedFiles = [
      ...files.filter(f => tsErrorFiles.some(tsFile => f.includes(tsFile))),
      ...files.filter(f => !tsErrorFiles.some(tsFile => f.includes(tsFile)))
    ];

    // Scan all files
    let processedCount = 0;
    for (const file of prioritizedFiles) {
      const issues = this.scanFile(file);
      processedCount++;

      if (issues.length > 0) {
        console.log(`🚨 Found ${issues.length} issues in: ${file}`);
      }

      if (processedCount % 100 === 0) {
        console.log(`📈 Progress: ${processedCount}/${files.length} files scanned`);
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
    console.log('\n📋 IMPROVED SYNTAX VALIDATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`📊 Total files scanned: ${this.results.totalFilesScanned}`);
    console.log(`🚨 Files with syntax issues: ${this.results.filesWithIssues}`);
    console.log(`✅ Clean files: ${this.results.totalFilesScanned - this.results.filesWithIssues}`);

    console.log('\n🔍 Issues by Category:');
    for (const [category, count] of Object.entries(this.results.summary)) {
      if (count > 0) {
        console.log(`  • ${category}: ${count} issues`);
      }
    }

    if (this.results.filesWithIssues > 0) {
      console.log('\n🚨 Files with Most Issues:');
      const fileIssueCount = Object.entries(this.results.issuesByFile)
        .map(([file, issues]) => ({ file, count: issues.length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      for (const { file, count } of fileIssueCount) {
        console.log(`  • ${file}: ${count} issues`);
      }
    }

    const totalIssues = Object.values(this.results.summary).reduce((sum, count) => sum + count, 0);
    console.log(`\n📈 Total actual syntax issues found: ${totalIssues}`);
  }

  /**
   * Save results to file
   */
  saveResults() {
    try {
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${CONFIG.outputFile}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }
}

// Main execution
async function main() {
  try {
    const validator = new ImprovedSyntaxValidator();

    // Run syntax validation
    const results = await validator.runScan();

    // Exit with appropriate code
    const totalIssues = Object.values(results.summary).reduce((sum, count) => sum + count, 0);

    if (totalIssues === 0) {
      console.log('\n✅ SUCCESS: No actual syntax issues found!');
      process.exit(0);
    } else {
      console.log(`\n⚠️  ISSUES FOUND: ${totalIssues} actual syntax issues detected`);
      console.log('📋 Review the detailed report for specific fixes needed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ImprovedSyntaxValidator, SYNTAX_PATTERNS, CONFIG };
