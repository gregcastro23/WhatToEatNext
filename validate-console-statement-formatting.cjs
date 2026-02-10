#!/usr/bin/env node

/**
 * Validate Console Statement Formatting
 *
 * This script validates and fixes console statement formatting issues including:
 * - Optional chaining on console methods
 * - Bracket notation console access
 * - Malformed console method calls
 * - Inconsistent console statement formatting
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
    '__tests__',
    '.test.',
    '.spec.',
    'coverage'
  ],
  maxFilesToProcess: 1000,
  backupDirectory: '.console-formatting-backups',
  dryRun: false
};

// Console statement formatting fixes
const CONSOLE_FORMATTING_FIXES = [
  {
    name: 'Optional Chaining on Console',
    pattern: /console\s*\?\s*\.\s*(\w+)/g,
    replacement: 'console.$1',
    description: 'Remove optional chaining on console object'
  },
  {
    name: 'Bracket Notation Console Access',
    pattern: /console\s*\[\s*['"](\w+)['"]\s*\]/g,
    replacement: 'console.$1',
    description: 'Convert bracket notation to dot notation for console methods'
  },
  {
    name: 'Optional Call on Console Methods',
    pattern: /console\s*\.\s*(\w+)\s*\?\s*\(/g,
    replacement: 'console.$1(',
    description: 'Remove optional call operator on console methods'
  },
  {
    name: 'Optional Chaining on Console Methods',
    pattern: /console\s*\.\s*(\w+)\s*\?\.\s*\(/g,
    replacement: 'console.$1(',
    description: 'Remove optional chaining on console method calls'
  },
  {
    name: 'Spaced Console Access',
    pattern: /console\s+\.\s*(\w+)/g,
    replacement: 'console.$1',
    description: 'Fix spaced console method access'
  },
  {
    name: 'Multiple Dots in Console',
    pattern: /console\s*\.\s*\.\s*(\w+)/g,
    replacement: 'console.$1',
    description: 'Fix multiple dots in console access'
  },
  {
    name: 'Console with Question Mark',
    pattern: /console\s*\?\s*(\w+)/g,
    replacement: 'console.$1',
    description: 'Remove question mark after console'
  }
];

// Console statement validation patterns
const CONSOLE_VALIDATION_PATTERNS = [
  {
    name: 'Valid Console Methods',
    pattern: /console\.(log|warn|error|info|debug|trace|table|group|groupEnd|time|timeEnd|count|clear|assert)/g,
    description: 'Standard console methods'
  },
  {
    name: 'Malformed Console Calls',
    pattern: /console\.[a-zA-Z]+\s*\?\s*\(/g,
    description: 'Console calls with optional chaining'
  },
  {
    name: 'Console with Undefined Access',
    pattern: /console\s*\?\s*\./g,
    description: 'Optional chaining on console object'
  }
];

class ConsoleFormattingValidator {
  constructor() {
    this.results = {
      totalFilesProcessed: 0,
      filesModified: 0,
      fixesByType: {},
      fixesByFile: {},
      validationResults: {
        validConsoleStatements: 0,
        malformedConsoleStatements: 0,
        fixedConsoleStatements: 0
      },
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Initialize fix counters
    for (const fix of CONSOLE_FORMATTING_FIXES) {
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
   * Create backup of file before modification
   */
  createBackup(filePath) {
    try {
      if (!fs.existsSync(CONFIG.backupDirectory)) {
        fs.mkdirSync(CONFIG.backupDirectory, { recursive: true });
      }

      const backupPath = path.join(CONFIG.backupDirectory, path.basename(filePath) + '.backup');
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(`Warning: Could not create backup for ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Check if a file contains console statements
   */
  hasConsoleStatements(content) {
    return content.includes('console.');
  }

  /**
   * Validate console statements in content
   */
  validateConsoleStatements(content) {
    const validation = {
      valid: 0,
      malformed: 0,
      issues: []
    };

    // Check for valid console methods
    const validMatches = [...content.matchAll(CONSOLE_VALIDATION_PATTERNS[0].pattern)];
    validation.valid = validMatches.length;

    // Check for malformed console calls
    for (let i = 1; i < CONSOLE_VALIDATION_PATTERNS.length; i++) {
      const pattern = CONSOLE_VALIDATION_PATTERNS[i];
      const matches = [...content.matchAll(pattern.pattern)];

      if (matches.length > 0) {
        validation.malformed += matches.length;
        validation.issues.push({
          type: pattern.name,
          count: matches.length,
          description: pattern.description
        });
      }
    }

    return validation;
  }

  /**
   * Fix console statement formatting in a single file
   */
  fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Skip files without console statements
      if (!this.hasConsoleStatements(originalContent)) {
        this.results.totalFilesProcessed++;
        return { modified: false, fixes: [] };
      }

      // Validate console statements before fixing
      const beforeValidation = this.validateConsoleStatements(originalContent);
      this.results.validationResults.validConsoleStatements += beforeValidation.valid;
      this.results.validationResults.malformedConsoleStatements += beforeValidation.malformed;

      let modifiedContent = originalContent;
      const fileFixes = [];

      // Apply each fix pattern
      for (const fix of CONSOLE_FORMATTING_FIXES) {
        const matches = [...originalContent.matchAll(fix.pattern)];

        if (matches.length > 0) {
          modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);

          const fixCount = matches.length;
          this.results.fixesByType[fix.name] += fixCount;
          this.results.validationResults.fixedConsoleStatements += fixCount;

          fileFixes.push({
            fixName: fix.name,
            count: fixCount,
            description: fix.description,
            matches: matches.map(match => ({
              original: match[0],
              replacement: fix.replacement,
              line: this.getLineNumber(originalContent, match.index)
            }))
          });
        }
      }

      // Check if file was modified
      if (modifiedContent !== originalContent) {
        // Validate the modified content
        const afterValidation = this.validateConsoleStatements(modifiedContent);

        if (afterValidation.malformed === 0) {
          if (!CONFIG.dryRun) {
            // Create backup
            this.createBackup(filePath);

            // Write modified content
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
          }

          this.results.filesModified++;
          this.results.fixesByFile[filePath] = fileFixes;

          return { modified: true, fixes: fileFixes };
        } else {
          console.warn(`⚠️  Skipping ${filePath}: fixes would still leave malformed console statements`);
          return { modified: false, fixes: [], skipped: true };
        }
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
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  async validateTypeScript() {
    try {
      console.log('\n🔧 Validating TypeScript compilation...');
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = (output.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: errorCount === 0, errorCount, output };
    } catch (error) {
      const errorCount = (error.stdout?.match(/error TS/g) || []).length;
      console.log(`📊 TypeScript errors after fixes: ${errorCount}`);

      return { success: false, errorCount, output: error.stdout || '' };
    }
  }

  /**
   * Run the complete console formatting validation process
   */
  async runValidation() {
    console.log('🔧 Starting Console Statement Formatting Validation...');
    console.log(`📁 Processing directories: ${CONFIG.sourceDirectories.join(', ')}`);
    console.log(`📄 File extensions: ${CONFIG.fileExtensions.join(', ')}`);
    console.log(`🔄 Dry run mode: ${CONFIG.dryRun ? 'ENABLED' : 'DISABLED'}`);

    const files = this.getSourceFiles();
    console.log(`📊 Found ${files.length} files to process`);

    if (files.length === 0) {
      console.log('⚠️  No source files found to process');
      return this.results;
    }

    // Process all files
    let processedCount = 0;
    for (const file of files) {
      const result = this.fixFile(file);
      processedCount++;

      if (result.modified) {
        console.log(`✅ Fixed: ${file} (${result.fixes.length} fix types applied)`);
      } else if (result.skipped) {
        console.log(`⚠️  Skipped: ${file} (would still have malformed statements)`);
      }

      if (processedCount % 100 === 0) {
        console.log(`📈 Progress: ${processedCount}/${files.length} files processed`);
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
    console.log('\n📋 CONSOLE STATEMENT VALIDATION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📊 Total files processed: ${this.results.totalFilesProcessed}`);
    console.log(`🔧 Files modified: ${this.results.filesModified}`);
    console.log(`✅ Files unchanged: ${this.results.totalFilesProcessed - this.results.filesModified}`);

    if (this.results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    }

    console.log('\n📊 Console Statement Analysis:');
    console.log(`  • Valid console statements found: ${this.results.validationResults.validConsoleStatements}`);
    console.log(`  • Malformed console statements found: ${this.results.validationResults.malformedConsoleStatements}`);
    console.log(`  • Console statements fixed: ${this.results.validationResults.fixedConsoleStatements}`);

    console.log('\n🔍 Fixes Applied by Type:');
    let totalFixes = 0;
    for (const [fixType, count] of Object.entries(this.results.fixesByType)) {
      if (count > 0) {
        console.log(`  • ${fixType}: ${count} fixes`);
        totalFixes += count;
      }
    }

    if (this.results.filesModified > 0) {
      console.log('\n🚨 Top Files Modified:');
      const fileFixCount = Object.entries(this.results.fixesByFile)
        .map(([file, fixes]) => ({
          file,
          count: fixes.reduce((sum, fix) => sum + fix.count, 0)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      for (const { file, count } of fileFixCount) {
        console.log(`  • ${file}: ${count} fixes`);
      }
    }

    console.log(`\n📈 Total console formatting fixes applied: ${totalFixes}`);

    if (CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN MODE: No files were actually modified');
    } else if (this.results.filesModified > 0) {
      console.log(`\n💾 Backups created in: ${CONFIG.backupDirectory}`);
    }
  }

  /**
   * Save results to file
   */
  saveResults() {
    try {
      const outputFile = 'console-formatting-validation-report.json';
      fs.writeFileSync(outputFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${outputFile}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--dry-run')) {
    CONFIG.dryRun = true;
  }

  try {
    const validator = new ConsoleFormattingValidator();
    const results = await validator.runValidation();

    // Exit with appropriate code
    const totalFixes = Object.values(results.fixesByType).reduce((sum, count) => sum + count, 0);
    const malformedRemaining = results.validationResults.malformedConsoleStatements - results.validationResults.fixedConsoleStatements;

    if (totalFixes === 0 && malformedRemaining === 0) {
      console.log('\n✅ SUCCESS: All console statements are properly formatted!');
      process.exit(0);
    } else if (totalFixes > 0 && malformedRemaining === 0) {
      console.log(`\n✅ SUCCESS: Fixed ${totalFixes} console formatting issues`);

      if (results.validation && !results.validation.success) {
        console.log('⚠️  WARNING: TypeScript compilation still has errors');
        process.exit(1);
      } else {
        process.exit(0);
      }
    } else {
      console.log(`\n⚠️  PARTIAL SUCCESS: Fixed ${totalFixes} issues, ${malformedRemaining} malformed statements remain`);
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

module.exports = { ConsoleFormattingValidator, CONSOLE_FORMATTING_FIXES, CONFIG };
