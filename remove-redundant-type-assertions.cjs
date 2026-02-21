#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to remove redundant type assertions from TypeScript files
 * Focuses on safe removals that don't change functionality
 */

class RedundantTypeAssertionRemover {
  constructor() {
    this.processedFiles = 0;
    this.removedAssertions = 0;
    this.skippedAssertions = 0;
    this.errors = [];
  }

  /**
   * Patterns for redundant type assertions that can be safely removed
   */
  getRedundantPatterns() {
    return [
      // Pattern 1: Redundant string assertions on string literals
      {
        pattern: /(['"`][^'"`]*['"`])\s+as\s+string/g,
        replacement: '$1',
        description: 'String literal as string'
      },

      // Pattern 2: Redundant number assertions on numeric literals
      {
        pattern: /(\d+(?:\.\d+)?)\s+as\s+number/g,
        replacement: '$1',
        description: 'Number literal as number'
      },

      // Pattern 3: Redundant boolean assertions on boolean literals
      {
        pattern: /(true|false)\s+as\s+boolean/g,
        replacement: '$1',
        description: 'Boolean literal as boolean'
      },

      // Pattern 4: Redundant array assertions on array literals
      {
        pattern: /(\[[^\]]*\])\s+as\s+\w+\[\]/g,
        replacement: '$1',
        description: 'Array literal as array type'
      },

      // Pattern 5: Double type assertions (as unknown as X where X is obvious)
      {
        pattern: /\(\s*([^)]+)\s+as\s+unknown\s*\)\s+as\s+string/g,
        replacement: '($1 as string)',
        description: 'Double assertion to string'
      },

      // Pattern 6: Redundant const assertions on already const values
      {
        pattern: /const\s+(\w+)\s*=\s*(['"`][^'"`]*['"`])\s+as\s+const/g,
        replacement: 'const $1 = $2',
        description: 'Const assertion on string literal'
      }
    ];
  }

  /**
   * Patterns that should be preserved (not removed)
   */
  getPreservedPatterns() {
    return [
      // Preserve any assertions in test files (they often need flexibility)
      /\.test\.|\.spec\.|__tests__/,

      // Preserve assertions with comments explaining why they're needed
      /\/\*.*\*\/.*as\s+/,
      /\/\/.*as\s+/,

      // Preserve complex type assertions that might be necessary
      /as\s+Record<string,\s*unknown>/,
      /as\s+import\(/,

      // Preserve assertions in error handling
      /catch\s*\([^)]*\)\s*{[^}]*as\s+/,

      // Preserve assertions for external library compatibility
      /as\s+any.*\/\/.*external|library|third-party/i
    ];
  }

  /**
   * Check if a file should be processed
   */
  shouldProcessFile(filePath) {
    // Only process TypeScript files
    if (!/\.(ts|tsx)$/.test(filePath)) {
      return false;
    }

    // Skip node_modules and other excluded directories
    if (filePath.includes('node_modules') ||
        filePath.includes('.git') ||
        filePath.includes('dist') ||
        filePath.includes('build')) {
      return false;
    }

    return true;
  }

  /**
   * Check if content should be preserved based on patterns
   */
  shouldPreserveAssertion(content, assertionMatch) {
    const preservedPatterns = this.getPreservedPatterns();

    for (const pattern of preservedPatterns) {
      if (pattern.test(content) || pattern.test(assertionMatch)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Process a single file to remove redundant type assertions
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let modifiedContent = content;
      let fileChanges = 0;

      const redundantPatterns = this.getRedundantPatterns();

      for (const { pattern, replacement, description } of redundantPatterns) {
        const matches = [...content.matchAll(pattern)];

        for (const match of matches) {
          // Check if this assertion should be preserved
          if (this.shouldPreserveAssertion(content, match[0])) {
            this.skippedAssertions++;
            continue;
          }

          // Apply the replacement
          modifiedContent = modifiedContent.replace(match[0], replacement.replace(/\$(\d+)/g, (_, num) => match[parseInt(num)]));
          fileChanges++;
          this.removedAssertions++;

          console.log(`  Removed: ${description} - "${match[0]}"`);
        }
      }

      // Only write file if changes were made
      if (fileChanges > 0) {
        fs.writeFileSync(filePath, modifiedContent);
        console.log(`✅ Modified ${filePath} (${fileChanges} assertions removed)`);
        this.processedFiles++;
      }

    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error.message}`);
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Recursively find all TypeScript files in a directory
   */
  findTypeScriptFiles(dir) {
    const files = [];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
            files.push(...this.findTypeScriptFiles(fullPath));
          }
        } else if (this.shouldProcessFile(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}: ${error.message}`);
    }

    return files;
  }

  /**
   * Validate TypeScript compilation after changes
   */
  validateTypeScript() {
    try {
      console.log('\n🔍 Validating TypeScript compilation...');
      execSync('npx tsc --noEmit --skipLibCheck', {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed:');
      console.error(error.stdout || error.message);
      return false;
    }
  }

  /**
   * Main execution method
   */
  run() {
    console.log('🚀 Starting redundant type assertion removal...\n');

    // Find all TypeScript files in src directory
    const files = this.findTypeScriptFiles('./src');
    console.log(`Found ${files.length} TypeScript files to process\n`);

    // Process each file
    for (const file of files) {
      this.processFile(file);
    }

    // Validate compilation
    const compilationSuccess = this.validateTypeScript();

    // Report results
    console.log('\n📊 Summary:');
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Assertions removed: ${this.removedAssertions}`);
    console.log(`Assertions preserved: ${this.skippedAssertions}`);
    console.log(`Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (!compilationSuccess) {
      console.log('\n⚠️  TypeScript compilation failed. You may need to review the changes.');
      process.exit(1);
    }

    console.log('\n✅ Redundant type assertion removal completed successfully!');
  }
}

// Run the script
if (require.main === module) {
  const remover = new RedundantTypeAssertionRemover();
  remover.run();
}

module.exports = RedundantTypeAssertionRemover;
