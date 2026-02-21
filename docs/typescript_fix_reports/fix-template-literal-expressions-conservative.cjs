#!/usr/bin/env node

/**
 * Conservative Template Literal Expression Fixer
 *
 * This script identifies and fixes only genuine template literal syntax errors:
 * - Unclosed template expressions that cause compilation errors
 * - Malformed template literal syntax that breaks TypeScript
 * - Invalid escape sequences in template literals
 *
 * It avoids fixing valid multi-line template literals and complex expressions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  sourceDirectories: ['src'],
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
  backupDirectory: '.template-literal-conservative-backups',
  dryRun: false
};

// Only fix patterns that are clearly syntax errors
const CONSERVATIVE_FIXES = [
  {
    name: 'Unclosed Template Expression at End of Line',
    pattern: /(\$\{[^}]*[^}])(\s*$)/gm,
    replacement: (match, expression, whitespace) => {
      // Only fix if it's clearly incomplete (no closing brace and ends line)
      if (!expression.includes('}') && expression.length < 100) {
        return expression + '}' + whitespace;
      }
      return match;
    },
    description: 'Close template expressions that are clearly incomplete',
    validate: (match, content, index) => {
      // Only fix simple cases that are clearly errors
      const expression = match.match(/\$\{([^}]*)/)?.[1] || '';
      return (
        expression.length < 50 &&
        !expression.includes('${') &&
        !expression.includes('`') &&
        !expression.includes('\n')
      );
    }
  },
  {
    name: 'Double Template Expression Start',
    pattern: /\$\{\$\{([^}]+)\}/g,
    replacement: '${$1}',
    description: 'Fix double template expression starts',
    validate: (match, content, index) => {
      // Only fix obvious double starts
      return match.includes('${${') && !match.includes('${${${');
    }
  },
  {
    name: 'Escaped Template Expression in Template Literal',
    pattern: /(`[^`]*?)\\(\$\{[^}]+\})([^`]*?`)/g,
    replacement: '$1$2$3',
    description: 'Fix escaped template expressions inside template literals',
    validate: (match, content, index) => {
      // Only fix if it's clearly inside a template literal
      return typeof match === 'string' && match.startsWith('`') && match.endsWith('`');
    }
  }
];

class ConservativeTemplateLiteralFixer {
  constructor() {
    this.results = {
      totalFilesProcessed: 0,
      filesModified: 0,
      fixesByType: {},
      fixesByFile: {},
      errors: [],
      skippedFixes: [],
      timestamp: new Date().toISOString()
    };

    // Initialize fix counters
    for (const fix of CONSERVATIVE_FIXES) {
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
   * Check if a file contains template literals
   */
  hasTemplateLiterals(content) {
    return content.includes('`') && content.includes('${');
  }

  /**
   * Validate that a fix should be applied
   */
  shouldApplyFix(fix, match, content, index) {
    try {
      if (fix.validate) {
        return fix.validate(match, content, index);
      }
      return true;
    } catch (error) {
      console.warn(`Validation error for fix ${fix.name}:`, error.message);
      return false;
    }
  }

  /**
   * Check if content has basic syntax validity
   */
  hasBasicSyntaxValidity(content) {
    try {
      // Basic checks for template literal syntax
      const lines = content.split('\n');
      let inTemplateLiteral = false;
      let templateLiteralDepth = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Count backticks to track template literal state
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          const prevChar = j > 0 ? line[j - 1] : '';

          if (char === '`' && prevChar !== '\\') {
            inTemplateLiteral = !inTemplateLiteral;
          }

          if (inTemplateLiteral) {
            if (char === '{' && prevChar === '$') {
              templateLiteralDepth++;
            } else if (char === '}' && templateLiteralDepth > 0) {
              templateLiteralDepth--;
            }
          }
        }
      }

      // If we end with unclosed template expressions, it might be a syntax error
      return templateLiteralDepth === 0;
    } catch (error) {
      console.warn('Syntax validation error:', error.message);
      return true; // Default to allowing the fix
    }
  }

  /**
   * Fix template literal expressions in a single file
   */
  fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');

      // Skip files without template literals
      if (!this.hasTemplateLiterals(originalContent)) {
        this.results.totalFilesProcessed++;
        return { modified: false, fixes: [] };
      }

      let modifiedContent = originalContent;
      const fileFixes = [];

      // Apply each fix pattern
      for (const fix of CONSERVATIVE_FIXES) {
        let appliedFixes = 0;

        if (typeof fix.replacement === 'function') {
          modifiedContent = modifiedContent.replace(fix.pattern, (match, ...args) => {
            const index = args[args.length - 2]; // Second to last arg is the index
            if (this.shouldApplyFix(fix, match, originalContent, index)) {
              appliedFixes++;
              return fix.replacement(match, ...args.slice(0, -2));
            } else {
              this.results.skippedFixes.push({
                file: filePath,
                fixName: fix.name,
                match: match,
                reason: 'Failed validation'
              });
              return match;
            }
          });
        } else {
          const matches = [...originalContent.matchAll(fix.pattern)];
          for (const match of matches) {
            if (this.shouldApplyFix(fix, match, originalContent, match.index)) {
              modifiedContent = modifiedContent.replace(match[0], fix.replacement);
              appliedFixes++;
            } else {
              this.results.skippedFixes.push({
                file: filePath,
                fixName: fix.name,
                match: match[0],
                reason: 'Failed validation'
              });
            }
          }
        }

        if (appliedFixes > 0) {
          this.results.fixesByType[fix.name] += appliedFixes;

          fileFixes.push({
            fixName: fix.name,
            count: appliedFixes,
            description: fix.description
          });
        }
      }

      // Check if file was modified
      if (modifiedContent !== originalContent) {
        // Validate the modified content has basic syntax validity
        if (this.hasBasicSyntaxValidity(modifiedContent)) {
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
          console.warn(`⚠️  Skipping ${filePath}: fixes would introduce syntax errors`);
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
   * Run the complete template literal fixing process
   */
  async runFixes() {
    console.log('🔧 Starting Conservative Template Literal Expression Fixes...');
    console.log(`📁 Processing directories: ${CONFIG.sourceDirectories.join(', ')}`);
    console.log(`📄 File extensions: ${CONFIG.fileExtensions.join(', ')}`);
    console.log(`🔄 Dry run mode: ${CONFIG.dryRun ? 'ENABLED' : 'DISABLED'}`);

    const files = this.getSourceFiles();
    console.log(`📊 Found ${files.length} files to process`);

    if (files.length === 0) {
      console.log('⚠️  No source files found to process');
      return this.results;
    }

    // Get initial TypeScript error count
    const initialValidation = await this.validateTypeScript();
    console.log(`📊 Initial TypeScript errors: ${initialValidation.errorCount}`);

    // Process all files
    let processedCount = 0;
    for (const file of files) {
      const result = this.fixFile(file);
      processedCount++;

      if (result.modified) {
        console.log(`✅ Fixed: ${file} (${result.fixes.length} fix types applied)`);
      } else if (result.skipped) {
        console.log(`⚠️  Skipped: ${file} (would introduce syntax errors)`);
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
    this.results.initialErrorCount = initialValidation.errorCount;
    this.results.finalErrorCount = validation.errorCount;
    this.results.errorReduction = initialValidation.errorCount - validation.errorCount;

    // Save results
    this.saveResults();

    return this.results;
  }

  /**
   * Generate summary report
   */
  generateSummary() {
    console.log('\n📋 CONSERVATIVE TEMPLATE LITERAL FIX SUMMARY');
    console.log('=' .repeat(60));
    console.log(`📊 Total files processed: ${this.results.totalFilesProcessed}`);
    console.log(`🔧 Files modified: ${this.results.filesModified}`);
    console.log(`✅ Files unchanged: ${this.results.totalFilesProcessed - this.results.filesModified}`);

    if (this.results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${this.results.errors.length}`);
    }

    if (this.results.skippedFixes.length > 0) {
      console.log(`⚠️  Fixes skipped: ${this.results.skippedFixes.length}`);
    }

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

    console.log(`\n📈 Total template literal fixes applied: ${totalFixes}`);

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
      const outputFile = 'template-literal-fix-conservative-report.json';
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
    const fixer = new ConservativeTemplateLiteralFixer();
    const results = await fixer.runFixes();

    // Exit with appropriate code
    const totalFixes = Object.values(results.fixesByType).reduce((sum, count) => sum + count, 0);

    if (totalFixes === 0) {
      console.log('\n✅ SUCCESS: No template literal issues found that need fixing!');
      process.exit(0);
    } else {
      console.log(`\n✅ SUCCESS: Applied ${totalFixes} conservative template literal fixes`);

      if (results.errorReduction > 0) {
        console.log(`📉 TypeScript errors reduced by ${results.errorReduction} (${results.initialErrorCount} → ${results.finalErrorCount})`);
      }

      if (results.validation && !results.validation.success) {
        console.log('⚠️  WARNING: TypeScript compilation still has errors');
        process.exit(1);
      } else {
        process.exit(0);
      }
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

module.exports = { ConservativeTemplateLiteralFixer, CONSERVATIVE_FIXES, CONFIG };
