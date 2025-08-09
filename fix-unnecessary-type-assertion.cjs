#!/usr/bin/env node

/**
 * Fix Unnecessary Type Assertions Script
 *
 * This script addresses @typescript-eslint/no-unnecessary-type-assertion violations
 * by removing redundant type assertions that don't change the type.
 *
 * Current Issues: 79 no-unnecessary-type-assertion violations
 * Target: Remove redundant type assertions while preserving necessary ones
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxFiles: 20,
  dryRun: false,
  preservePatterns: [
    // Preserve astronomical calculations where assertions might be needed
    /planetary|astronomical|astrological|ephemeris/i,
    // Preserve external library integrations
    /astronomy-engine|astronomia|suncalc/i,
    // Preserve test files where assertions might be intentional
    /\.test\.|\.spec\.|__tests__/i,
  ],
  safeRemovalPatterns: [
    {
      // Remove simple redundant assertions like (value as string) where value is already string
      pattern: /\(([^)]+)\s+as\s+(\w+)\)/g,
      description: 'Remove redundant type assertions',
      validate: (match, value, type) => {
        // Only remove if it's clearly redundant (basic validation)
        return !value.includes('unknown') && !value.includes('any');
      },
    },
    {
      // Remove angle bracket assertions <Type>value where not needed
      pattern: /<(\w+)>([^<>\s]+)/g,
      description: 'Remove redundant angle bracket assertions',
      validate: (match, type, value) => {
        // Only remove simple cases
        return !value.includes('(') && !value.includes('[');
      },
    },
  ],
};

class UnnecessaryTypeAssertionFixer {
  constructor() {
    this.processedFiles = 0;
    this.totalFixes = 0;
    this.errors = [];
  }

  /**
   * Get files with no-unnecessary-type-assertion violations
   */
  getFilesWithUnnecessaryAssertions() {
    try {
      console.log('🔍 Analyzing files with no-unnecessary-type-assertion violations...');

      const lintOutput = execSync(
        'yarn lint --max-warnings=10000 2>&1 | grep -E "no-unnecessary-type-assertion"',
        { encoding: 'utf8', stdio: 'pipe' },
      );

      const files = new Set();
      const lines = lintOutput.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const match = line.match(/^([^:]+):/);
        if (match) {
          const filePath = match[1].trim();
          if (fs.existsSync(filePath)) {
            files.add(filePath);
          }
        }
      }

      const fileArray = Array.from(files);
      console.log(`📊 Found ${fileArray.length} files with no-unnecessary-type-assertion issues`);
      return fileArray.slice(0, CONFIG.maxFiles);
    } catch (error) {
      console.warn('⚠️ Could not get lint output, scanning common directories...');
      return this.scanCommonDirectories();
    }
  }

  /**
   * Scan common directories for TypeScript files
   */
  scanCommonDirectories() {
    const directories = ['src', '__tests__'];
    const files = [];

    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, files);
      }
    }

    return files.slice(0, CONFIG.maxFiles);
  }

  /**
   * Recursively scan directory for TypeScript files
   */
  scanDirectory(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        this.scanDirectory(fullPath, files);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  /**
   * Check if file should be preserved from modifications
   */
  shouldPreserveFile(filePath, content) {
    // Check file path patterns
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(filePath)) {
        return true;
      }
    }

    // Check content patterns
    for (const pattern of CONFIG.preservePatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Apply unnecessary type assertion fixes to content
   */
  applyUnnecessaryAssertionFixes(content, filePath) {
    let modifiedContent = content;
    let fileFixCount = 0;

    // Find all type assertions
    const typeAssertions = [
      ...content.matchAll(/\([^)]+\s+as\s+\w+\)/g),
      ...content.matchAll(/<\w+>[^<>\s]+/g),
    ];

    if (typeAssertions.length === 0) {
      return { content: modifiedContent, fixCount: 0 };
    }

    console.log(`  📝 Found ${typeAssertions.length} type assertions to analyze`);

    // Use ESLint to identify which assertions are actually unnecessary
    try {
      const tempFile = filePath + '.temp';
      fs.writeFileSync(tempFile, content, 'utf8');

      const eslintOutput = execSync(
        `yarn eslint --no-eslintrc --config eslint.config.cjs "${tempFile}" --format json`,
        { encoding: 'utf8', stdio: 'pipe' },
      );

      const eslintResults = JSON.parse(eslintOutput);
      const unnecessaryAssertions =
        eslintResults[0]?.messages?.filter(
          msg => msg.ruleId === '@typescript-eslint/no-unnecessary-type-assertion',
        ) || [];

      // Remove the temp file
      fs.unlinkSync(tempFile);

      // Apply fixes based on ESLint findings
      for (const assertion of unnecessaryAssertions) {
        const line = assertion.line;
        const column = assertion.column;

        // Get the specific line content
        const lines = modifiedContent.split('\n');
        if (lines[line - 1]) {
          const lineContent = lines[line - 1];

          // Try to identify and remove the unnecessary assertion
          const fixedLine = this.removeUnnecessaryAssertion(lineContent, column);
          if (fixedLine !== lineContent) {
            lines[line - 1] = fixedLine;
            modifiedContent = lines.join('\n');
            fileFixCount++;
            console.log(`  📝 Removed unnecessary assertion on line ${line}`);
          }
        }
      }
    } catch (error) {
      console.warn(`  ⚠️ Could not analyze with ESLint, using pattern matching`);

      // Fallback to pattern matching
      for (const { pattern, description, validate } of CONFIG.safeRemovalPatterns) {
        const matches = [...modifiedContent.matchAll(pattern)];

        for (const match of matches) {
          if (validate && !validate(...match)) {
            continue;
          }

          // Remove the assertion by replacing with just the value
          if (pattern.source.includes('as')) {
            // For (value as Type) -> value
            modifiedContent = modifiedContent.replace(match[0], match[1]);
          } else {
            // For <Type>value -> value
            modifiedContent = modifiedContent.replace(match[0], match[2]);
          }

          fileFixCount++;
        }

        if (matches.length > 0) {
          console.log(`  📝 Applied: ${description} (${matches.length} fixes)`);
        }
      }
    }

    return { content: modifiedContent, fixCount: fileFixCount };
  }

  /**
   * Remove unnecessary assertion from a line at specific column
   */
  removeUnnecessaryAssertion(lineContent, column) {
    // Simple pattern matching to remove common unnecessary assertions

    // Pattern: (value as Type) -> value
    const asPattern = /\(([^)]+)\s+as\s+\w+\)/g;
    let match;
    while ((match = asPattern.exec(lineContent)) !== null) {
      if (match.index <= column && column <= match.index + match[0].length) {
        return lineContent.replace(match[0], match[1]);
      }
    }

    // Pattern: <Type>value -> value
    const anglePattern = /<\w+>([^<>\s]+)/g;
    while ((match = anglePattern.exec(lineContent)) !== null) {
      if (match.index <= column && column <= match.index + match[0].length) {
        return lineContent.replace(match[0], match[1]);
      }
    }

    return lineContent;
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      console.log(`\n📁 Processing: ${filePath}`);

      const content = fs.readFileSync(filePath, 'utf8');

      // Check if file should be preserved
      if (this.shouldPreserveFile(filePath, content)) {
        console.log(`  ⚠️ Preserving file due to domain-specific patterns`);
        return;
      }

      // Apply fixes
      const { content: modifiedContent, fixCount } = this.applyUnnecessaryAssertionFixes(
        content,
        filePath,
      );

      if (fixCount > 0) {
        if (!CONFIG.dryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
        }

        console.log(`  ✅ Applied ${fixCount} unnecessary assertion fixes`);
        this.totalFixes += fixCount;
      } else {
        console.log(`  ℹ️ No unnecessary type assertions found to fix`);
      }

      this.processedFiles++;
    } catch (error) {
      console.error(`  ❌ Error processing ${filePath}:`, error.message);
      this.errors.push({ file: filePath, error: error.message });
    }
  }

  /**
   * Validate TypeScript compilation after fixes
   */
  validateTypeScript() {
    try {
      console.log('\n🔍 Validating TypeScript compilation...');
      execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed');
      console.error(error.stdout?.toString() || error.message);
      return false;
    }
  }

  /**
   * Run the unnecessary type assertion fixing process
   */
  async run() {
    console.log('🚀 Starting Unnecessary Type Assertion Fixing Process');
    console.log(`📊 Configuration: maxFiles=${CONFIG.maxFiles}, dryRun=${CONFIG.dryRun}`);

    const files = this.getFilesWithUnnecessaryAssertions();

    if (files.length === 0) {
      console.log('✅ No files found with no-unnecessary-type-assertion issues');
      return;
    }

    console.log(`\n📋 Processing ${files.length} files...`);

    for (const file of files) {
      this.processFile(file);

      // Validate every 5 files
      if (this.processedFiles % 5 === 0 && this.processedFiles > 0) {
        if (!this.validateTypeScript()) {
          console.error('🛑 Stopping due to TypeScript errors');
          break;
        }
      }
    }

    // Final validation
    if (!CONFIG.dryRun && this.totalFixes > 0) {
      this.validateTypeScript();
    }

    // Summary
    console.log('\n📊 Unnecessary Type Assertion Fixing Summary:');
    console.log(`   Files processed: ${this.processedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    console.log(`   Errors encountered: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    if (this.totalFixes > 0) {
      console.log('\n✅ Unnecessary type assertion fixes completed successfully!');
      console.log('💡 Run yarn lint to verify the improvements');
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new UnnecessaryTypeAssertionFixer();
  fixer.run().catch(console.error);
}

module.exports = UnnecessaryTypeAssertionFixer;
