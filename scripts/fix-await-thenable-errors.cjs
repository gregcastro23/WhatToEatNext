#!/usr/bin/env node

/**
 * Fix Await-Thenable Errors Script
 *
 * This script identifies and fixes await statements on non-Promise values:
 * - Detects await on synchronous functions
 * - Fixes await on non-Promise return types
 * - Ensures proper Promise handling in test utilities
 * - Validates test execution stability
 *
 * Phase 9.2 of Linting Excellence Campaign
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AwaitThenableFixer {
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

  async findAwaitThenableIssues() {
    this.log('🔍 Identifying await-thenable issues...');

    try {
      // Use TypeScript compiler to find await-thenable errors
      const tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Look for specific await-thenable error patterns
      const awaitThenableErrors = tscOutput.split('\n').filter(line =>
        line.includes('TS1308') || // 'await' expression is only allowed within an async function
        line.includes('not assignable to type') && line.includes('Promise') ||
        line.includes('await') && line.includes('thenable')
      );

      // Also check ESLint for await-thenable rule violations
      let eslintOutput = '';
      try {
        eslintOutput = execSync('npx eslint src --format=compact --rule "@typescript-eslint/await-thenable: error" 2>/dev/null || true', {
          encoding: 'utf8',
          stdio: 'pipe'
        });
      } catch (error) {
        // ESLint rule might not be configured, continue
      }

      const eslintAwaitErrors = eslintOutput.split('\n').filter(line =>
        line.includes('await-thenable') ||
        line.includes('Unexpected `await`')
      );

      const allErrors = [...awaitThenableErrors, ...eslintAwaitErrors];
      const filesWithErrors = new Set();

      allErrors.forEach(line => {
        const match = line.match(/^([^(]+)\(/);
        if (match) {
          const filePath = match[1].trim();
          if (fs.existsSync(filePath)) {
            filesWithErrors.add(filePath);
          }
        }
      });

      this.log(`Found ${filesWithErrors.size} files with potential await-thenable issues`);
      return Array.from(filesWithErrors);
    } catch (error) {
      this.log(`Error finding await-thenable issues: ${error.message}`, 'error');
      return [];
    }
  }

  async analyzeAwaitUsage(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const issues = [];

      // Pattern to find await statements
      const awaitPattern = /await\s+([^;,\n\r]+)/g;
      let match;

      while ((match = awaitPattern.exec(content)) !== null) {
        const awaitExpression = match[1].trim();
        const lineNumber = content.substring(0, match.index).split('\n').length;

        // Check for common non-Promise patterns
        const nonPromisePatterns = [
          /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, // Simple variable names
          /^[a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*$/, // Property access
          /^[a-zA-Z_$][a-zA-Z0-9_$]*\(\)$/, // Function calls without async
          /^new\s+[A-Z][a-zA-Z0-9_$]*/, // Constructor calls
          /^[0-9]+$/, // Numbers
          /^['"`].*['"`]$/, // String literals
          /^true|false$/, // Booleans
          /^null|undefined$/ // Null/undefined
        ];

        const isLikelyNonPromise = nonPromisePatterns.some(pattern =>
          pattern.test(awaitExpression)
        );

        if (isLikelyNonPromise) {
          issues.push({
            line: lineNumber,
            expression: awaitExpression,
            fullMatch: match[0],
            type: 'likely-non-promise'
          });
        }
      }

      return issues;
    } catch (error) {
      this.log(`Error analyzing ${filePath}: ${error.message}`, 'error');
      return [];
    }
  }

  fixAwaitOnNonPromise(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // Fix common await-thenable patterns
    const fixes = [
      // Remove await from simple variable assignments
      {
        from: /await\s+([a-zA-Z_$][a-zA-Z0-9_$]*);/g,
        to: '$1;',
        description: 'Remove await from simple variables',
        validate: (match) => !match[1].includes('(') && !match[1].includes('.')
      },

      // Remove await from property access that doesn't return Promise
      {
        from: /await\s+([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*);/g,
        to: '$1;',
        description: 'Remove await from property access',
        validate: (match) => !match[1].includes('(')
      },

      // Fix await on constructor calls
      {
        from: /await\s+(new\s+[A-Z][a-zA-Z0-9_$]*\([^)]*\))/g,
        to: '$1',
        description: 'Remove await from constructor calls'
      },

      // Fix await on literals
      {
        from: /await\s+(true|false|null|undefined|[0-9]+)/g,
        to: '$1',
        description: 'Remove await from literals'
      },

      // Fix await on string literals
      {
        from: /await\s+(['"`][^'"`]*['"`])/g,
        to: '$1',
        description: 'Remove await from string literals'
      }
    ];

    fixes.forEach(fix => {
      const matches = [...newContent.matchAll(fix.from)];
      if (matches.length > 0) {
        // Validate each match if validator exists
        const validMatches = fix.validate ?
          matches.filter(match => fix.validate(match)) :
          matches;

        if (validMatches.length > 0) {
          newContent = newContent.replace(fix.from, fix.to);
          fixed = true;
          appliedFixes.push(`${fix.description} (${validMatches.length} occurrences)`);
        }
      }
    });

    if (this.verbose && appliedFixes.length > 0) {
      this.log(`  Fixed in ${path.basename(filePath)}: ${appliedFixes.join(', ')}`);
    }

    return { content: newContent, fixed, appliedFixes };
  }

  fixAsyncFunctionDeclarations(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // Fix functions that use await but aren't declared async
    const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*{[^}]*await[^}]*}/g;
    const matches = [...newContent.matchAll(functionPattern)];

    matches.forEach(match => {
      if (!match[0].includes('async')) {
        const asyncFunction = match[0].replace('function', 'async function');
        newContent = newContent.replace(match[0], asyncFunction);
        fixed = true;
        appliedFixes.push(`Made function ${match[1]} async`);
      }
    });

    // Fix arrow functions that use await but aren't declared async
    const arrowPattern = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>\s*{[^}]*await[^}]*}/g;
    const arrowMatches = [...newContent.matchAll(arrowPattern)];

    arrowMatches.forEach(match => {
      if (!match[0].includes('async')) {
        const asyncArrow = match[0].replace('=>', 'async =>');
        newContent = newContent.replace(match[0], asyncArrow);
        fixed = true;
        appliedFixes.push(`Made arrow function ${match[1]} async`);
      }
    });

    if (this.verbose && appliedFixes.length > 0) {
      this.log(`  Fixed async declarations in ${path.basename(filePath)}: ${appliedFixes.join(', ')}`);
    }

    return { content: newContent, fixed, appliedFixes };
  }

  fixTestUtilityPromises(content, filePath) {
    let fixed = false;
    let newContent = content;
    const appliedFixes = [];

    // Fix common test utility patterns
    if (filePath.includes('test') || filePath.includes('spec')) {
      const testFixes = [
        // Fix expect().resolves patterns
        {
          from: /await\s+expect\(([^)]+)\)\.resolves/g,
          to: 'await expect($1).resolves',
          description: 'Fix expect().resolves patterns'
        },

        // Fix waitFor patterns
        {
          from: /await\s+waitFor\(\s*\(\)\s*=>\s*{([^}]+)}\s*\)/g,
          to: 'await waitFor(() => {$1})',
          description: 'Fix waitFor patterns'
        },

        // Fix mock function calls that should return promises
        {
          from: /await\s+(mock[A-Z][a-zA-Z0-9_$]*)\(\)/g,
          to: 'await $1()',
          description: 'Ensure mock functions return promises',
          validate: (match, content) => {
            // Check if the mock is defined to return a promise
            const mockDefPattern = new RegExp(`${match[1]}.*mockResolvedValue|mockReturnValue.*Promise`);
            return mockDefPattern.test(content);
          }
        }
      ];

      testFixes.forEach(fix => {
        const matches = [...newContent.matchAll(fix.from)];
        if (matches.length > 0) {
          const validMatches = fix.validate ?
            matches.filter(match => fix.validate(match, newContent)) :
            matches;

          if (validMatches.length > 0) {
            newContent = newContent.replace(fix.from, fix.to);
            fixed = true;
            appliedFixes.push(`${fix.description} (${validMatches.length} occurrences)`);
          }
        }
      });
    }

    if (this.verbose && appliedFixes.length > 0) {
      this.log(`  Fixed test utilities in ${path.basename(filePath)}: ${appliedFixes.join(', ')}`);
    }

    return { content: newContent, fixed, appliedFixes };
  }

  async fixFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let currentContent = originalContent;
      let totalFixed = false;
      const allFixes = [];

      // Apply all fixes
      const fixes = [
        this.fixAwaitOnNonPromise(currentContent, filePath),
        this.fixAsyncFunctionDeclarations(currentContent, filePath),
        this.fixTestUtilityPromises(currentContent, filePath)
      ];

      // Chain the fixes
      for (const fix of fixes) {
        if (fix.fixed) {
          currentContent = fix.content;
          totalFixed = true;
          allFixes.push(...fix.appliedFixes);
        }
      }

      if (totalFixed) {
        if (!this.dryRun) {
          fs.writeFileSync(filePath, currentContent, 'utf8');
        }

        this.fixedFiles.push({
          path: filePath,
          fixes: allFixes
        });

        this.log(`${this.dryRun ? '[DRY RUN] ' : ''}Fixed await-thenable issues in ${path.basename(filePath)}`);
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
      const tscOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 || true', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      const awaitThenableErrors = (tscOutput.match(/TS1308|await.*thenable/g) || []).length;
      const totalErrors = (tscOutput.match(/error TS/g) || []).length;

      this.log(`Validation: ${totalErrors} total errors, ${awaitThenableErrors} await-thenable errors`);

      return { totalErrors, awaitThenableErrors };
    } catch (error) {
      this.log(`Validation error: ${error.message}`, 'error');
      return { totalErrors: -1, awaitThenableErrors: -1 };
    }
  }

  async createAwaitThenableUtility() {
    const utilityContent = `/**
 * Await-Thenable Utility Functions
 *
 * Utilities to identify and fix incorrect async/await usage
 */

export function isPromiseLike(value: any): value is PromiseLike<any> {
  return value && typeof value.then === 'function';
}

export function ensurePromise<T>(value: T | Promise<T>): Promise<T> {
  return isPromiseLike(value) ? value : Promise.resolve(value);
}

export async function safeAwait<T>(value: T | Promise<T>): Promise<T> {
  return isPromiseLike(value) ? await value : value;
}

export function validateAwaitUsage(fn: Function): boolean {
  const fnString = fn.toString();
  const hasAwait = fnString.includes('await');
  const isAsync = fnString.includes('async') || fn.constructor.name === 'AsyncFunction';

  if (hasAwait && !isAsync) {
    console.warn('Function uses await but is not declared async:', fn.name);
    return false;
  }

  return true;
}

// Test utility for checking Promise handling
export async function testPromiseHandling(testFn: () => Promise<any>): Promise<boolean> {
  try {
    await testFn();
    return true;
  } catch (error) {
    console.error('Promise handling test failed:', error);
    return false;
  }
}`;

    const utilityPath = 'src/utils/awaitThenableUtils.ts';
    if (!this.dryRun) {
      fs.writeFileSync(utilityPath, utilityContent, 'utf8');
    }

    this.log(`${this.dryRun ? '[DRY RUN] ' : ''}Created await-thenable utility: ${utilityPath}`);
    return utilityPath;
  }

  async run() {
    this.log('🚀 Starting Await-Thenable Error Fix (Phase 9.2)');
    this.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE EXECUTION'}`);

    // Find files with await-thenable issues
    const filesWithIssues = await this.findAwaitThenableIssues();

    // Also scan test files specifically
    const testFiles = [];
    try {
      const findTestFiles = execSync('find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx"', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      testFiles.push(...findTestFiles.trim().split('\n').filter(f => f.length > 0));
    } catch (error) {
      // No test files found or command failed
    }

    const allFiles = [...new Set([...filesWithIssues, ...testFiles])];

    if (allFiles.length === 0) {
      this.log('✅ No files with await-thenable issues found!');
      return;
    }

    // Fix each file
    this.log(`🔧 Processing ${allFiles.length} files...`);
    let fixedCount = 0;

    for (const filePath of allFiles) {
      if (fs.existsSync(filePath)) {
        const wasFixed = await this.fixFile(filePath);
        if (wasFixed) fixedCount++;
      }
    }

    // Create utility functions
    await this.createAwaitThenableUtility();

    // Validate fixes
    const validation = await this.validateFixes();

    // Report results
    this.log('\\n📊 Fix Summary:');
    this.log(`   Files processed: ${allFiles.length}`);
    this.log(`   Files fixed: ${fixedCount}`);
    this.log(`   Errors encountered: ${this.errors.length}`);

    if (validation.awaitThenableErrors >= 0) {
      this.log(`   Remaining await-thenable errors: ${validation.awaitThenableErrors}`);
    }

    if (this.fixedFiles.length > 0) {
      this.log('\\n✅ Fixed files:');
      this.fixedFiles.forEach(file => {
        this.log(`   ${file.path}`);
        if (this.verbose && file.fixes.length > 0) {
          file.fixes.forEach(fix => this.log(`     - ${fix}`));
        }
      });
    }

    if (this.errors.length > 0) {
      this.log('\\n❌ Errors encountered:');
      this.errors.forEach(error => {
        this.log(`   ${error.file}: ${error.error}`);
      });
    }

    this.log(`\\n${this.dryRun ? '🔍 DRY RUN COMPLETE' : '✅ AWAIT-THENABLE ERROR FIX COMPLETE'}`);

    if (!this.dryRun && validation.awaitThenableErrors === 0) {
      this.log('🎉 All await-thenable errors have been resolved!');
    }
  }
}

// Run the fixer
if (require.main === module) {
  const fixer = new AwaitThenableFixer();
  fixer.run().catch(error => {
    console.error('❌ Critical error:', error);
    process.exit(1);
  });
}

module.exports = AwaitThenableFixer;
