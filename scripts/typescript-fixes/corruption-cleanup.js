#!/usr/bin/env node

/**
 * Corruption Cleanup Script
 * 
 * Fixes malformed code patterns from previous automated fixes
 * Focuses on common corruption patterns that prevent proper TypeScript checking
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose')
};

// Common corruption patterns to fix
const CORRUPTION_FIXES = [
  {
    name: 'malformed-optional-chaining',
    pattern: /\?\?\?/g,
    replacement: '?',
    description: 'Fix triple question marks'
  },
  {
    name: 'malformed-spread',
    pattern: /\.\.\.\./g,
    replacement: '...',
    description: 'Fix quadruple dots in spread'
  },
  {
    name: 'undefined-question-mark',
    pattern: /undefined\?/g,
    replacement: 'undefined',
    description: 'Remove question mark after undefined'
  },
  {
    name: 'empty-function-optional-chaining',
    pattern: /\(\s*\)\s*\?\./g,
    replacement: '().',
    description: 'Fix empty function call with optional chaining'
  },
  {
    name: 'malformed-property-access',
    pattern: /(\w+)\s*\|\|\s*\{\}\s*\?\s*\.\s*(\w+)/g,
    replacement: '($1 as Record<string, unknown>)?.$2',
    description: 'Fix malformed property access patterns'
  },
  {
    name: 'double-cast-access',
    pattern: /\(\s*(\w+)\s+as\s+unknown\s*\)\s*\?\s*\.\s*\(\s*(\w+)\s+as\s+string\s*\)\s*\?\s*\./g,
    replacement: '($1 as { $2?: string })?.$2?.',
    description: 'Fix double casting with property access'
  },
  {
    name: 'malformed-object-property',
    pattern: /(\w+)\.(\w+)\s*\|\|\s*\{\}\s*\?\s*:/g,
    replacement: '$1?.$2?:',
    description: 'Fix malformed object property syntax'
  },
  {
    name: 'malformed-function-call',
    pattern: /(\w+)\s*\|\|\s*\{\}\s*\?\s*\.\s*(\w+)\s*\?\s*\.\s*\(\s*\)/g,
    replacement: '($1 as Record<string, unknown>)?.$2?.()',
    description: 'Fix malformed function call patterns'
  }
];

class CorruptionCleaner {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
  }

  async cleanFile(filePath) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // Apply each corruption fix
      for (const fix of CORRUPTION_FIXES) {
        const before = content;
        content = content.replace(fix.pattern, fix.replacement);
        
        if (content !== before) {
          fixes++;
          if (CONFIG.verbose) {
            console.log(`  ✓ ${fix.description}`);
          }
        }
      }

      // Additional specific fixes for common issues
      content = this.applySpecificFixes(content);

      if (content !== originalContent) {
        if (!CONFIG.dryRun) {
          await fs.writeFile(filePath, content);
        }
        this.fixedFiles.add(filePath);
        this.totalFixes += fixes;
        return { fixed: true, fixes };
      }

      return { fixed: false, fixes: 0 };
    } catch (error) {
      console.error(`Error cleaning ${filePath}:`, error.message);
      return { fixed: false, fixes: 0, error: error.message };
    }
  }

  applySpecificFixes(content) {
    // Fix malformed interface properties
    content = content.replace(
      /(\w+)\s*\|\|\s*\{\}\s*\?\s*:\s*(\w+);/g,
      '$1?: $2;'
    );

    // Fix malformed destructuring
    content = content.replace(
      /const\s*\{\s*(\w+)\.(\w+)\s*\|\|\s*\{\}\s*\}\s*=/g,
      'const $2 = $1?.$2 ||'
    );

    // Fix malformed import statements
    content = content.replace(
      /import\s*\{\s*([^}]+)\s*\|\|\s*\{\}\s*\}\s*from/g,
      'import { $1 } from'
    );

    // Fix malformed array access
    content = content.replace(
      /(\w+)\s*\|\|\s*\[\]\s*\?\s*\.\s*(\w+)/g,
      '($1 || [])?.$2'
    );

    return content;
  }

  async findCorruptedFiles() {
    try {
      // Get files with TS2339 errors
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorOutput = error.stdout;
      const errorFiles = new Set();
      
      errorOutput.split('\n').forEach(line => {
        const match = line.match(/^(.+?)\(\d+,\d+\): error TS/);
        if (match) {
          errorFiles.add(match[1]);
        }
      });
      
      return Array.from(errorFiles);
    }
  }

  async run() {
    console.log('🧹 Corruption Cleanup Script');
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const corruptedFiles = await this.findCorruptedFiles();
    console.log(`📁 Found ${corruptedFiles.length} files with TypeScript errors`);

    if (CONFIG.dryRun) {
      console.log('📝 Preview mode - no files will be modified');
    }

    let processedFiles = 0;
    let cleanedFiles = 0;

    for (const filePath of corruptedFiles.slice(0, 50)) { // Process first 50 files
      console.log(`\n🔧 Cleaning: ${path.basename(filePath)}`);
      
      const result = await this.cleanFile(filePath);
      
      if (result.fixed) {
        cleanedFiles++;
        console.log(`  ✅ Applied ${result.fixes} corruption fixes`);
      } else if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ⭐ No corruption found`);
      }

      processedFiles++;

      // Build validation every 10 files
      if (processedFiles % 10 === 0 && !CONFIG.dryRun) {
        console.log('\n🏗️  Validating build...');
        if (this.validateBuild()) {
          console.log('✅ Build validation passed');
        } else {
          console.log('⚠️  Build has errors (expected during cleanup)');
        }
      }
    }

    console.log('\n🏁 Corruption Cleanup Complete');
    console.log(`📊 Statistics:`);
    console.log(`  - Files processed: ${processedFiles}`);
    console.log(`  - Files cleaned: ${cleanedFiles}`);
    console.log(`  - Total fixes applied: ${this.totalFixes}`);

    if (!CONFIG.dryRun && cleanedFiles > 0) {
      console.log('\n🏗️  Final build validation...');
      if (this.validateBuild()) {
        console.log('✅ Build validation passed');
      } else {
        console.log('⚠️  Some TypeScript errors remain (expected)');
      }
    }
  }

  validateBuild() {
    try {
      execSync('yarn build', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log(`
Corruption Cleanup Script

Usage: node corruption-cleanup.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed progress information
  --help        Show this help message

Fixes:
  - Malformed optional chaining (???, ....)
  - Broken property access patterns
  - Malformed function calls
  - Interface syntax errors
  - Import/export corruption
    `);
    return;
  }

  try {
    const cleaner = new CorruptionCleaner();
    await cleaner.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}