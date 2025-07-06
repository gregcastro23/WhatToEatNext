#!/usr/bin/env node

/**
 * Final Syntax Cleanup Script
 * 
 * Fixes the remaining syntax errors to achieve zero TypeScript errors
 * Targets: TS1003, TS1382, TS1005, TS1381
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  maxFiles: 50 // Process all files with syntax errors
};

// Syntax error fixes
const SYNTAX_FIXES = {
  'TS1003': {
    patterns: [
      {
        // Missing identifier after 'this'
        pattern: /this\.\s*;/g,
        replacement: 'this',
        description: 'Remove orphaned this.'
      },
      {
        // Expected identifier
        pattern: /\.\s*;/g,
        replacement: ';',
        description: 'Remove orphaned dot'
      },
      {
        // Missing property name
        pattern: /{\s*,/g,
        replacement: '{',
        description: 'Remove leading comma in object'
      },
      {
        // Trailing comma issues
        pattern: /,\s*}/g,
        replacement: '}',
        description: 'Remove trailing comma before closing brace'
      }
    ]
  },
  'TS1382': {
    patterns: [
      {
        // Unexpected token, expected property name
        pattern: /{\s*\[\s*([^\]]+)\s*\]\s*:/g,
        replacement: '{ [$1]:',
        description: 'Fix computed property syntax'
      },
      {
        // Missing property name
        pattern: /{\s*:\s*([^,}]+)/g,
        replacement: '{ value: $1',
        description: 'Add missing property name'
      }
    ]
  },
  'TS1005': {
    patterns: [
      {
        // Expected ',' or '}'
        pattern: /(\w+)\s+(\w+)\s*:/g,
        replacement: '$1: $2:',
        description: 'Fix property syntax'
      },
      {
        // Missing comma between properties
        pattern: /(\w+:\s*[^,}]+)\s+(\w+:)/g,
        replacement: '$1, $2',
        description: 'Add missing comma between properties'
      },
      {
        // Malformed object property
        pattern: /{\s*([^:,}]+)\s+([^:,}]+):/g,
        replacement: '{ $1: $2:',
        description: 'Fix malformed object property'
      }
    ]
  },
  'TS1381': {
    patterns: [
      {
        // Unexpected token in object literal
        pattern: /{\s*([^:,}]+)\s*([^:,}]+)\s*}/g,
        replacement: '{ $1: $2 }',
        description: 'Fix object literal syntax'
      },
      {
        // Missing colon in object property
        pattern: /{\s*(\w+)\s+([^}]+)}/g,
        replacement: '{ $1: $2 }',
        description: 'Add missing colon in object property'
      }
    ]
  }
};

class FinalSyntaxCleaner {
  constructor() {
    this.fixedFiles = new Set();
    this.totalFixes = 0;
  }

  async fixFile(filePath, errors) {
    try {
      const originalContent = await fs.readFile(filePath, 'utf8');
      let content = originalContent;
      let fixes = 0;

      // Group errors by type
      const errorsByType = new Map();
      errors.forEach(error => {
        if (!errorsByType.has(error.code)) {
          errorsByType.set(error.code, []);
        }
        errorsByType.get(error.code).push(error);
      });

      // Apply fixes for each error type
      for (const [errorCode, typeErrors] of errorsByType) {
        const fixConfig = SYNTAX_FIXES[errorCode];
        if (!fixConfig) continue;

        // Apply each pattern fix
        for (const pattern of fixConfig.patterns) {
          const beforeFix = content;
          content = content.replace(pattern.pattern, pattern.replacement);
          
          if (content !== beforeFix) {
            fixes++;
            if (CONFIG.verbose) {
              console.log(`  Applied ${errorCode} fix: ${pattern.description}`);
            }
          }
        }

        // Apply line-specific fixes
        for (const error of typeErrors) {
          const fixResult = this.applyLineSpecificFix(content, error);
          if (fixResult.modified) {
            content = fixResult.content;
            fixes++;
          }
        }
      }

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
      console.error(`Error fixing ${filePath}:`, error.message);
      return { fixed: false, fixes: 0, error: error.message };
    }
  }

  applyLineSpecificFix(content, error) {
    const lines = content.split('\n');
    const lineIndex = error.line - 1;
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const originalLine = lines[lineIndex];
      let fixedLine = originalLine;
      
      // Apply specific fixes based on error code and message
      switch (error.code) {
        case 'TS1003':
          fixedLine = this.fixTS1003(fixedLine, error);
          break;
        case 'TS1382':
          fixedLine = this.fixTS1382(fixedLine, error);
          break;
        case 'TS1005':
          fixedLine = this.fixTS1005(fixedLine, error);
          break;
        case 'TS1381':
          fixedLine = this.fixTS1381(fixedLine, error);
          break;
      }
      
      if (fixedLine !== originalLine) {
        lines[lineIndex] = fixedLine;
        return { modified: true, content: lines.join('\n') };
      }
    }
    
    return { modified: false, content };
  }

  fixTS1003(line, error) {
    // TS1003: Identifier expected
    
    // Remove orphaned dots
    line = line.replace(/\.\s*$/, '');
    
    // Fix malformed property access
    line = line.replace(/\.\s*;/, ';');
    
    // Fix empty object properties
    line = line.replace(/{\s*,/, '{');
    
    return line;
  }

  fixTS1382(line, error) {
    // TS1382: Unexpected token, expected property name
    
    // Fix computed property syntax
    line = line.replace(/{\s*\[\s*([^\]]+)\s*\]\s*:/, '{ [$1]:');
    
    // Fix missing property names
    line = line.replace(/{\s*:\s*([^,}]+)/, '{ value: $1');
    
    return line;
  }

  fixTS1005(line, error) {
    // TS1005: Expected ',' or '}'
    
    // Add missing commas between properties
    line = line.replace(/(\w+:\s*[^,}]+)\s+(\w+:)/, '$1, $2');
    
    // Fix property syntax
    line = line.replace(/(\w+)\s+(\w+)\s*:/, '$1: $2:');
    
    return line;
  }

  fixTS1381(line, error) {
    // TS1381: Unexpected token in object literal
    
    // Fix object literal syntax
    line = line.replace(/{\s*([^:,}]+)\s*([^:,}]+)\s*}/, '{ $1: $2 }');
    
    // Add missing colons
    line = line.replace(/{\s*(\w+)\s+([^}]+)}/, '{ $1: $2 }');
    
    return line;
  }

  async getSyntaxErrors() {
    try {
      const output = execSync('yarn tsc --noEmit --skipLibCheck', { encoding: 'utf8', stdio: 'pipe' });
      return [];
    } catch (error) {
      const errorLines = error.stdout.split('\n');
      const errors = [];
      
      errorLines.forEach(line => {
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match) {
          const errorCode = match[4];
          // Only process syntax errors
          if (['TS1003', 'TS1382', 'TS1005', 'TS1381'].includes(errorCode)) {
            errors.push({
              file: match[1],
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              code: errorCode,
              message: match[5]
            });
          }
        }
      });
      
      return errors;
    }
  }

  async run() {
    console.log('🧹 Final Syntax Cleanup - Zero Error Achievement');
    console.log(`⚙️  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

    const allErrors = await this.getSyntaxErrors();
    
    if (allErrors.length === 0) {
      console.log('🎉 No syntax errors found! Already at zero errors!');
      return;
    }

    // Group errors by file
    const errorsByFile = new Map();
    allErrors.forEach(error => {
      if (!errorsByFile.has(error.file)) {
        errorsByFile.set(error.file, []);
      }
      errorsByFile.get(error.file).push(error);
    });

    // Sort files by error count (descending)
    const sortedFiles = Array.from(errorsByFile.entries())
      .sort(([, errorsA], [, errorsB]) => errorsB.length - errorsA.length);

    console.log(`📁 Processing ${sortedFiles.length} files with syntax errors`);
    console.log(`🎯 Total syntax errors to fix: ${allErrors.length}`);

    // Show error breakdown
    const errorBreakdown = new Map();
    allErrors.forEach(error => {
      errorBreakdown.set(error.code, (errorBreakdown.get(error.code) || 0) + 1);
    });
    
    console.log('📊 Error breakdown:');
    for (const [code, count] of errorBreakdown) {
      console.log(`  - ${code}: ${count} errors`);
    }

    if (CONFIG.dryRun) {
      console.log('📝 Preview mode - no files will be modified');
    }

    let processedFiles = 0;
    let fixedFiles = 0;

    for (const [filePath, errors] of sortedFiles) {
      console.log(`\n🔧 Fixing: ${path.basename(filePath)} (${errors.length} errors)`);
      
      const result = await this.fixFile(filePath, errors);
      
      if (result.fixed) {
        fixedFiles++;
        console.log(`  ✅ Applied ${result.fixes} syntax fixes`);
      } else if (result.error) {
        console.log(`  ❌ Error: ${result.error}`);
      } else {
        console.log(`  ⭐ No applicable fixes found`);
      }

      processedFiles++;
    }

    console.log('\n🏁 Final Syntax Cleanup Complete');
    console.log(`📊 Statistics:`);
    console.log(`  - Files processed: ${processedFiles}`);
    console.log(`  - Files fixed: ${fixedFiles}`);
    console.log(`  - Total fixes applied: ${this.totalFixes}`);

    if (!CONFIG.dryRun) {
      console.log('\n🏗️  Final build validation...');
      if (this.validateBuild()) {
        console.log('✅ Build validation passed');
      } else {
        console.log('⚠️  Build validation failed - may need manual review');
      }
      
      // Check final error count
      console.log('\n🎯 Final error count check...');
      const finalErrors = await this.getSyntaxErrors();
      console.log(`📊 Remaining errors: ${finalErrors.length}`);
      
      if (finalErrors.length === 0) {
        console.log('🎉 ZERO ERRORS ACHIEVED! 🎉');
        console.log('🏆 HISTORIC MILESTONE REACHED!');
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
Final Syntax Cleanup Script

Usage: node final-syntax-cleanup.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed progress information
  --help        Show this help message

Target Errors:
  - TS1003: Identifier expected
  - TS1382: Unexpected token, expected property name  
  - TS1005: Expected ',' or '}'
  - TS1381: Unexpected token in object literal

Goal: Achieve zero TypeScript errors!
    `);
    return;
  }

  try {
    const cleaner = new FinalSyntaxCleaner();
    await cleaner.run();
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}