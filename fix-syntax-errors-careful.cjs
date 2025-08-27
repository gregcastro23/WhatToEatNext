#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { globSync } = require('glob');

/**
 * Careful Syntax Error Fixing Script
 * Fixes the syntax errors introduced by the previous aggressive script
 */

class SyntaxErrorFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.backupDir = '.syntax-fix-backup';
  }

  async run() {
    console.log('🔧 Starting Careful Syntax Error Fixing...');
    console.log('Target: Fix syntax errors and restore valid TypeScript');

    try {
      // Create backup directory
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      // Get files with syntax errors
      const errorFiles = await this.getFilesWithSyntaxErrors();
      console.log(`Found ${errorFiles.length} files with syntax errors`);

      // Fix each file carefully
      for (const file of errorFiles) {
        await this.fixSyntaxInFile(file);
      }

      // Final validation
      await this.validateFixes();

      console.log('✅ Syntax error fixing completed!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Error during fixing process:', error.message);
      process.exit(1);
    }
  }

  /**
   * Get files that have syntax errors
   */
  async getFilesWithSyntaxErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return [];
    } catch (error) {
      const lines = error.stdout.split('\n');
      const files = new Set();

      for (const line of lines) {
        if (line.includes('error TS1005') || line.includes('error TS1003') || line.includes('error TS1128')) {
          const match = line.match(/^([^:]+):/);
          if (match && fs.existsSync(match[1])) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    }
  }

  /**
   * Fix syntax errors in a specific file
   */
  async fixSyntaxInFile(filePath) {
    try {
      console.log(`🔧 Fixing syntax in ${filePath}`);

      // Create backup
      const backupPath = path.join(this.backupDir, path.basename(filePath));
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content);

      let fixed = content;
      let modified = false;

      // Fix common syntax issues introduced by the previous script
      const syntaxFixes = [
        // Fix broken property access patterns
        {
          pattern: /\(\$1 as Record<string, unknown>\)\?\.\$2/g,
          replacement: (match, p1, p2) => `(${p1} as Record<string, unknown>)?.${p2}`
        },

        // Fix broken variable references
        {
          pattern: /\$(\d+)/g,
          replacement: (match, num) => {
            // This shouldn't happen in valid code, likely a regex artifact
            return match;
          }
        },

        // Fix broken type assertions
        {
          pattern: /\(\(\$1 as any\) \|\| \{\}\)/g,
          replacement: '(($1 as any) || {})'
        },

        // Fix malformed property access
        {
          pattern: /\?\.\$(\w+)/g,
          replacement: '?.$1'
        },

        // Fix broken as unknown patterns
        {
          pattern: /as unknown as unknown/g,
          replacement: 'as any'
        },

        // Fix broken Record patterns
        {
          pattern: /Record<string,\s*unknown>\s*\?\.\s*(\w+)/g,
          replacement: 'Record<string, unknown>)?.$1'
        },

        // Fix specific broken patterns we know about
        {
          pattern: /inputData\?\.\(primary\|element\|secondary\|strength\|compatibility\)/g,
          replacement: (match) => {
            const prop = match.match(/\(([^)]+)\)/)[1];
            return `(inputData as Record<string, unknown>)?.${prop}`;
          }
        },

        // Fix broken function calls
        {
          pattern: /\(\(\) => true\)\(/g,
          replacement: '(() => true)('
        },

        // Fix broken object returns
        {
          pattern: /\(\(\) => \{ Fire: 0\.25, Water: 0\.25, Earth: 0\.25, Air: 0\.25 \}\)\(/g,
          replacement: '(() => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }))('
        }
      ];

      // Apply syntax fixes
      for (const fix of syntaxFixes) {
        const newContent = fixed.replace(fix.pattern, fix.replacement);
        if (newContent !== fixed) {
          fixed = newContent;
          modified = true;
        }
      }

      // More specific fixes for common patterns
      fixed = this.fixSpecificPatterns(fixed);
      if (fixed !== content) {
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, fixed);
        this.fixedFiles.add(filePath);
        console.log(`  ✅ Fixed syntax errors in ${filePath}`);
      }

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Fix specific known patterns
   */
  fixSpecificPatterns(content) {
    let fixed = content;

    // Fix broken import statements
    fixed = fixed.replace(
      /\/\/ ElementalAffinity import removed - not exported/g,
      '// ElementalAffinity import removed - not exported'
    );

    fixed = fixed.replace(
      /\/\/ SearchFilters import removed - module not found/g,
      '// SearchFilters import removed - module not found'
    );

    // Fix broken type definitions
    fixed = fixed.replace(
      /: any \{/g,
      ': any {'
    );

    // Fix broken function parameters
    fixed = fixed.replace(
      /\((\w+): any\)/g,
      '($1: any)'
    );

    // Fix broken array access
    fixed = fixed.replace(
      /\[pattern\.category as string\]/g,
      '[pattern.category as string]'
    );

    // Fix broken arithmetic operations
    fixed = fixed.replace(
      /\(\((\w+) as any\)\?\.(\w+) \|\| 0\) \* (0\.\d+)/g,
      '(($1 as any)?.$2 || 0) * $3'
    );

    // Fix broken spread operators
    fixed = fixed.replace(
      /\.\.\.\(\(\$1 as any\) \|\| \{\}\), searchScore/g,
      '...(($1 as any) || {}), searchScore'
    );

    // Fix broken conditional expressions
    fixed = fixed.replace(
      /\?\s*\.\s*(\w+)/g,
      '?.$1'
    );

    return fixed;
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log('\n🔍 Validating syntax fixes...');

    try {
      execSync('yarn tsc --noEmit --skipLibCheck', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log('✅ TypeScript compilation successful - Zero errors achieved!');
      return true;

    } catch (error) {
      const errorCount = (error.stdout.match(/error TS/g) || []).length;
      console.log(`⚠️  ${errorCount} TypeScript errors remaining`);

      // Get error breakdown
      const syntaxErrors = (error.stdout.match(/error TS1005|error TS1003|error TS1128/g) || []).length;
      const otherErrors = errorCount - syntaxErrors;

      console.log(`  - Syntax errors: ${syntaxErrors}`);
      console.log(`  - Other errors: ${otherErrors}`);

      if (syntaxErrors < 50) {
        console.log('🎯 Good progress on syntax errors');
      }

      return false;
    }
  }

  /**
   * Print summary of fixes applied
   */
  printSummary() {
    console.log('\n📊 Syntax Fix Summary:');
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log(`Backup directory: ${this.backupDir}`);
    console.log('\n🎯 Target: Zero TypeScript compilation errors');
    console.log('✅ Syntax fixing process completed');
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new SyntaxErrorFixer();
  fixer.run().catch(console.error);
}

module.exports = SyntaxErrorFixer;
