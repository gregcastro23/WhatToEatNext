#!/usr/bin/env node

/**
 * Fix Critical Parsing Errors Script
 *
 * This script addresses critical parsing errors that prevent TypeScript compilation:
 * - JSX HTML entity issues (&lt; instead of <, &gt; instead of >)
 * - Unclosed JSX tags
 * - Expression expected errors in async/await contexts
 * - Method call syntax issues in test utilities
 *
 * Phase 9.1 of Linting Excellence Campaign
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CriticalParsingErrorFixer {
  constructor() {
    this.fixedFiles = [];
    this.errors = [];
    this.dryRun = process.argv.includes('--dry-run');
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async findFilesWithParsingErrors() {
    this.log('🔍 Identifying files with critical parsing errors...');

    try {
      // Get TypeScript compilation errors
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorLines = tscOutput.split('\n').filter(line =>
        line.includes('error TS') && (
          line.includes('JSX element') ||
          line.includes('Unexpected token') ||
          line.includes('Expected') ||
          line.includes('Identifier expected') ||
          line.includes('Expression expected')
        )
      );

      const filesWithErrors = new Set();
      errorLines.forEach(line => {
        const match = line.match(/^([^(]+)\(/);
        if (match) {
          const filePath = match[1].trim();
          if (fs.existsSync(filePath)) {
            filesWithErrors.add(filePath);
          }
        }
      });

      this.log(`Found ${filesWithErrors.size} files with critical parsing errors`);
      return Array.from(filesWithErrors);
    } catch (error) {
      this.log(`Error finding files with parsing errors: ${error.message}`, 'error');
      return [];
    }
  }

  fixJSXEntityErrors(content, filePath) {
    let fixed = false;
    let newContent = content;

    // Fix common JSX HTML entity issues
    const entityFixes = [
      { from: /&lt;/g, to: '<', description: 'HTML entity &lt; to <' },
      { from: /&gt;/g, to: '>', description: 'HTML entity &gt; to >' },
      { from: /&amp;/g, to: '&', description: 'HTML entity &amp; to &' },
      { from: /&quot;/g, to: '"', description: 'HTML entity &quot; to "' },
      { from: /&#x27;/g, to: "'", description: 'HTML entity &#x27; to \'' },
      { from: /&nbsp;/g, to: ' ', description: 'HTML entity &nbsp; to space' }
    ];

    entityFixes.forEach(fix => {
      if (fix.from.test(newContent)) {
        newContent = newContent.replace(fix.from, fix.to);
        fixed = true;
        if (this.verbose) {
          this.log(`  Fixed ${fix.description} in ${path.basename(filePath)}`);
        }
      }
    });

    return { content: newContent, fixed };
  }

  fixUnclosedJSXTags(content, filePath) {
    let fixed = false;
    let newContent = content;

    // Fix common unclosed JSX tag patterns
    const tagFixes = [
      // Fix unclosed self-closing tags
      {
        from: /<(input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)([^>]*[^/])>/g,
        to: '<$1$2 />',
        description: 'Self-closing tags'
      },
      // Fix missing closing tags for common elements (basic pattern)
      {
        from: /<(div|span|p|h1|h2|h3|h4|h5|h6|nav|main|section|article|aside|header|footer)([^>]*)>([^<]*)<\/(?!\1)/g,
        to: '<$1$2>$3</$1>',
        description: 'Missing closing tags'
      }
    ];

    tagFixes.forEach(fix => {
      const matches = newContent.match(fix.from);
      if (matches) {
        newContent = newContent.replace(fix.from, fix.to);
        fixed = true;
        if (this.verbose) {
          this.log(`  Fixed ${fix.description} in ${path.basename(filePath)}`);
        }
      }
    });

    return { content: newContent, fixed };
  }

  fixAsyncAwaitSyntax(content, filePath) {
    let fixed = false;
    let newContent = content;

    // Fix common async/await syntax issues
    const asyncFixes = [
      // Fix missing await keyword
      {
        from: /(\s+)(Promise\.resolve|Promise\.reject|fetch|axios\.|api\.)\(/g,
        to: '$1await $2(',
        description: 'Missing await keywords'
      },
      // Fix async function declarations
      {
        from: /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*:\s*Promise</g,
        to: 'async function $1($2): Promise',
        description: 'Missing async keyword'
      }
    ];

    // Only apply to files that likely contain async code
    if (content.includes('Promise') || content.includes('await') || content.includes('async')) {
      asyncFixes.forEach(fix => {
        if (fix.from.test(newContent)) {
          newContent = newContent.replace(fix.from, fix.to);
          fixed = true;
          if (this.verbose) {
            this.log(`  Fixed ${fix.description} in ${path.basename(filePath)}`);
          }
        }
      });
    }

    return { content: newContent, fixed };
  }

  fixMethodCallSyntax(content, filePath) {
    let fixed = false;
    let newContent = content;

    // Fix common method call syntax issues in test files
    if (filePath.includes('test') || filePath.includes('spec')) {
      const methodFixes = [
        // Fix missing parentheses in method calls
        {
          from: /(expect\([^)]+\)\.to[A-Z][a-zA-Z]*)\s*$/gm,
          to: '$1()',
          description: 'Missing parentheses in expect calls'
        },
        // Fix incorrect jest matcher syntax
        {
          from: /\.toBe\s*\(/g,
          to: '.toBe(',
          description: 'Jest matcher syntax'
        }
      ];

      methodFixes.forEach(fix => {
        if (fix.from.test(newContent)) {
          newContent = newContent.replace(fix.from, fix.to);
          fixed = true;
          if (this.verbose) {
            this.log(`  Fixed ${fix.description} in ${path.basename(filePath)}`);
          }
        }
      });
    }

    return { content: newContent, fixed };
  }

  async fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let currentContent = originalContent;
      let totalFixed = false;

      // Apply all fixes
      const fixes = [
        this.fixJSXEntityErrors(currentContent, filePath),
        this.fixUnclosedJSXTags(currentContent, filePath),
        this.fixAsyncAwaitSyntax(currentContent, filePath),
        this.fixMethodCallSyntax(currentContent, filePath)
      ];

      // Chain the fixes
      for (const fix of fixes) {
        if (fix.fixed) {
          currentContent = fix.content;
          totalFixed = true;
        }
      }

      if (totalFixed) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, currentContent, 'utf8');
        }

        this.fixedFiles.push({
          path: filePath,
          changes: fixes.filter(f => f.fixed).length
        });

        this.log(`${this.dryRun ? '[DRY RUN] ' : ''}Fixed parsing errors in ${path.basename(filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      this.log(`Error fixing ${filePath}: ${error.message}`, 'error');
      this.errors.push({ file: filePath, error: error.message });
      return false;
    }
  }

  async validateFixes() {
    this.log('🔍 Validating fixes with TypeScript compiler...');

    try {
      const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const errorCount = (tscOutput.match(/error TS/g) || []).length;
      const parsingErrorCount = (tscOutput.match(/error TS(17008|1382|17002|1005|1003)/g) || []).length;

      this.log(`TypeScript validation: ${errorCount} total errors, ${parsingErrorCount} parsing errors`);

      return { totalErrors: errorCount, parsingErrors: parsingErrorCount };
    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      return { totalErrors: -1, parsingErrors: -1 };
    }
  }

  async createSyntaxValidationScript() {
    const scriptContent = `#!/usr/bin/env node

/**
 * Automated Syntax Validation Script
 * Validates TypeScript compilation and identifies parsing errors
 */

const { execSync } = require('child_process');

function validateSyntax() {
  console.log('🔍 Running TypeScript syntax validation...');

  try {
    const tscOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 || true', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    const lines = tscOutput.split('\\n');
    const errors = lines.filter(line => line.includes('error TS'));
    const parsingErrors = errors.filter(line =>
      line.includes('JSX element') ||
      line.includes('Unexpected token') ||
      line.includes('Expected') ||
      line.includes('Identifier expected') ||
      line.includes('Expression expected')
    );

    console.log(\`📊 Validation Results:\`);
    console.log(\`   Total TypeScript errors: \${errors.length}\`);
    console.log(\`   Critical parsing errors: \${parsingErrors.length}\`);

    if (parsingErrors.length > 0) {
      console.log('\\n❌ Critical parsing errors found:');
      parsingErrors.slice(0, 10).forEach(error => {
        console.log(\`   \${error}\`);
      });
      if (parsingErrors.length > 10) {
        console.log(\`   ... and \${parsingErrors.length - 10} more\`);
      }
      process.exit(1);
    } else {
      console.log('✅ No critical parsing errors found!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  validateSyntax();
}

module.exports = { validateSyntax };
`;

    const scriptPath = 'scripts/validate-syntax.cjs';
    if (!this.dryRun) {
      fs.writeFileSync(scriptPath, scriptContent, 'utf8');
      execSync(`chmod +x ${scriptPath}`);
    }

    this.log(`${this.dryRun ? '[DRY RUN] ' : ''}Created syntax validation script: ${scriptPath}`);
    return scriptPath;
  }

  async run() {
    this.log('🚀 Starting Critical Parsing Error Fix (Phase 9.1)');
    this.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);

    // Find files with parsing errors
    const filesWithErrors = await this.findFilesWithParsingErrors();

    if (filesWithErrors.length === 0) {
      this.log('✅ No files with critical parsing errors found!');
      return;
    }

    // Fix each file
    this.log(`🔧 Processing ${filesWithErrors.length} files...`);
    let fixedCount = 0;

    for (const filePath of filesWithErrors) {
      const wasFixed = await this.fixFile(filePath);
      if (wasFixed) fixedCount++;
    }

    // Create syntax validation script
    await this.createSyntaxValidationScript();

    // Validate fixes
    const validation = await this.validateFixes();

    // Report results
    this.log('\\n📊 Fix Summary:');
    this.log(`   Files processed: ${filesWithErrors.length}`);
    this.log(`   Files fixed: ${fixedCount}`);
    this.log(`   Errors encountered: ${this.errors.length}`);

    if (validation.parsingErrors >= 0) {
      this.log(`   Remaining parsing errors: ${validation.parsingErrors}`);
    }

    if (this.fixedFiles.length > 0) {
      this.log('\\n✅ Fixed files:');
      this.fixedFiles.forEach(file => {
        this.log(`   ${file.path} (${file.changes} fixes)`);
      });
    }

    if (this.errors.length > 0) {
      this.log('\\n❌ Errors encountered:');
      this.errors.forEach(error => {
        this.log(`   ${error.file}: ${error.error}`);
      });
    }

    this.log(`\\n${this.dryRun ? '🔍 DRY RUN COMPLETE' : '✅ CRITICAL PARSING ERROR FIX COMPLETE'}`);

    if (!this.dryRun && validation.parsingErrors === 0) {
      this.log('🎉 All critical parsing errors have been resolved!');
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new CriticalParsingErrorFixer();
  fixer.run().catch(error => {
    console.error('❌ Critical error:', error);
    process.exit(1);
  });
}

module.exports = CriticalParsingErrorFixer;
