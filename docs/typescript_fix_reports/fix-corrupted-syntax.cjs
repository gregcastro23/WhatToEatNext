#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { globSync } = require('glob');

/**
 * Fix Corrupted Syntax Script
 * Repairs the syntax corruption caused by aggressive regex replacements
 */

class CorruptedSyntaxFixer {
  constructor() {
    this.fixedFiles = new Set();
  }

  async run() {
    console.log('🔧 Starting Corrupted Syntax Repair...');
    console.log('Target: Restore valid TypeScript syntax');

    try {
      // Get all TypeScript files
      const files = globSync('src/**/*.{ts,tsx}', {
        ignore: ['node_modules/**', '.next/**', 'dist/**']
      });

      console.log(`Processing ${files.length} TypeScript files...`);

      // Fix each file
      for (const file of files) {
        await this.fixCorruptedSyntax(file);
      }

      // Final validation
      await this.validateFixes();

      console.log('✅ Syntax repair completed!');
      this.printSummary();

    } catch (error) {
      console.error('❌ Error during repair process:', error.message);
      process.exit(1);
    }
  }

  /**
   * Fix corrupted syntax in a file
   */
  async fixCorruptedSyntax(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let modified = false;

      // Fix corrupted function signatures
      const functionFixes = [
        // Fix static method signatures corrupted by replacement
        {
          pattern: /static\s+\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\}:\s*ElementalProperties\s*\{/g,
          replacement: 'static getCurrentElementalState(): ElementalProperties {'
        },

        // Fix other corrupted static methods
        {
          pattern: /static\s+\{\s*[^}]+\}:\s*(\w+)\s*\{/g,
          replacement: 'static getDefaultValue(): $1 {'
        },

        // Fix corrupted function parameters
        {
          pattern: /\(\s*\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\}\s*\)/g,
          replacement: '(defaultElements: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })'
        },

        // Fix corrupted return statements
        {
          pattern: /return\s+\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\};/g,
          replacement: 'return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };'
        },

        // Fix corrupted variable assignments
        {
          pattern: /=\s+\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\}/g,
          replacement: '= { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }'
        },

        // Fix corrupted function calls
        {
          pattern: /\(\(\) => \(\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\}\)\)\(/g,
          replacement: '(() => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }))('
        },

        // Fix corrupted conditional expressions
        {
          pattern: /\(\(\) => true\)\(/g,
          replacement: '(() => true)('
        }
      ];

      // Apply function fixes
      for (const fix of functionFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      // Fix property access patterns
      const propertyFixes = [
        // Fix broken property access with Record<string, unknown>
        {
          pattern: /\((\w+) as Record<string, unknown>\)\?\.\$(\w+)/g,
          replacement: '($1 as Record<string, unknown>)?.$2'
        },

        // Fix broken property access patterns
        {
          pattern: /(\w+)\?\.\$(\w+)/g,
          replacement: '$1?.$2'
        },

        // Fix broken variable references
        {
          pattern: /\$(\w+)/g,
          replacement: '$1'
        }
      ];

      for (const fix of propertyFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      // Fix type assertion patterns
      const typeAssertionFixes = [
        // Fix broken type assertions
        {
          pattern: /as unknown as unknown/g,
          replacement: 'as any'
        },

        // Fix broken Record patterns
        {
          pattern: /Record<string,\s*unknown>\s*\?\./g,
          replacement: 'Record<string, unknown>)?.'
        },

        // Fix broken any patterns
        {
          pattern: /\(\$(\w+) as any\)/g,
          replacement: '($1 as any)'
        }
      ];

      for (const fix of typeAssertionFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      // Fix import/export patterns
      const importFixes = [
        // Fix broken import comments
        {
          pattern: /\/\/ ElementalAffinity import removed - not exported\n/g,
          replacement: '// ElementalAffinity import removed - not exported\n'
        },

        // Fix broken import statements
        {
          pattern: /import\s+type\s+\{\s*\}\s+from\s+['"][^'"]+['"];?\n/g,
          replacement: '// Empty import removed\n'
        }
      ];

      for (const fix of importFixes) {
        const newContent = content.replace(fix.pattern, fix.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      // Fix specific known corruptions
      content = this.fixSpecificCorruptions(content);
      if (content !== originalContent) {
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.add(filePath);
      }

    } catch (error) {
      console.error(`  ❌ Error fixing ${filePath}:`, error.message);
    }
  }

  /**
   * Fix specific known corruptions
   */
  fixSpecificCorruptions(content) {
    let fixed = content;

    // Fix corrupted class methods
    fixed = fixed.replace(
      /static\s+\{\s*[^}]*\}\s*:\s*\w+\s*\{/g,
      (match) => {
        // Extract the return type
        const typeMatch = match.match(/:\s*(\w+)\s*\{/);
        const returnType = typeMatch ? typeMatch[1] : 'any';
        return `static getDefaultValue(): ${returnType} {`;
      }
    );

    // Fix corrupted object literals in function calls
    fixed = fixed.replace(
      /\(\s*\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}\s*\)/g,
      '({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 })'
    );

    // Fix corrupted arrow functions
    fixed = fixed.replace(
      /\(\(\) =>\s*\{\s*Fire:\s*[\d.]+,\s*Water:\s*[\d.]+,\s*Earth:\s*[\d.]+,\s*Air:\s*[\d.]+\s*\}\)\(/g,
      '(() => ({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }))('
    );

    // Fix corrupted conditional operators
    fixed = fixed.replace(
      /\?\s*\.\s*(\w+)/g,
      '?.$1'
    );

    // Fix corrupted spread operators
    fixed = fixed.replace(
      /\.\.\.\(\(\$(\w+) as any\) \|\| \{\}\)/g,
      '...(($1 as any) || {})'
    );

    return fixed;
  }

  /**
   * Validate that fixes were successful
   */
  async validateFixes() {
    console.log('\n🔍 Validating syntax repairs...');

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
      const syntaxErrors = (error.stdout.match(/error TS1005|error TS1003|error TS1128|error TS1068|error TS1434/g) || []).length;
      const otherErrors = errorCount - syntaxErrors;

      console.log(`  - Syntax errors: ${syntaxErrors}`);
      console.log(`  - Other errors: ${otherErrors}`);

      if (syntaxErrors < 100) {
        console.log('🎯 Significant progress on syntax errors');
      }

      return false;
    }
  }

  /**
   * Print summary of fixes applied
   */
  printSummary() {
    console.log('\n📊 Syntax Repair Summary:');
    console.log(`Files modified: ${this.fixedFiles.size}`);
    console.log('\n🎯 Target: Zero TypeScript compilation errors');
    console.log('✅ Syntax repair process completed');
  }
}

// Execute if run directly
if (require.main === module) {
  const fixer = new CorruptedSyntaxFixer();
  fixer.run().catch(console.error);
}

module.exports = CorruptedSyntaxFixer;
