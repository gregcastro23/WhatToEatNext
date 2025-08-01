#!/usr/bin/env node

/**
 * Fix Await-Thenable Errors Script
 * 
 * This script identifies and fixes incorrect await statements on non-Promise values
 * in test files, specifically targeting the 6 identified await-thenable errors.
 * 
 * Features:
 * - Identifies await statements on non-Promise values
 * - Fixes common patterns like await primitive values, await object properties
 * - Preserves legitimate Promise handling in test utilities
 * - Creates backup files before modifications
 * - Provides dry-run mode for safety
 * 
 * Usage:
 *   node fix-await-thenable-errors.cjs [options]
 *   yarn lint:fix:await-thenable [options]
 * 
 * Options:
 *   --dry-run       Show what would be fixed without making changes
 *   --max-files=N   Limit processing to N files (default: 50)
 *   --target-file   Specific file to process
 *   --verbose       Show detailed processing information
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AwaitThenable {
  constructor(options = {}) {
    this.isDryRun = options.dryRun || false;
    this.maxFiles = options.maxFiles || 50;
    this.targetFile = options.targetFile || null;
    this.verbose = options.verbose || false;
    this.fixedFiles = 0;
    this.totalFixes = 0;
    this.backupDir = '.await-thenable-backups';
    
    // Common patterns for non-Promise values that shouldn't be awaited
    this.nonPromisePatterns = [
      // Primitive values
      /await\s+(true|false|null|undefined|\d+|'[^']*'|"[^"]*")\s*[;,\)\]]/g,
      // Object property access that returns non-Promise
      /await\s+([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?![(.:])/g,
      // Simple variable assignments
      /await\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?![(.:])/g,
      // Array/object literals
      /await\s+(\[.*?\]|\{.*?\})\s*[;,\)\]]/g,
      // typeof expressions
      /await\s+(typeof\s+[a-zA-Z_$][a-zA-Z0-9_$]*)/g
    ];
    
    // Patterns that should remain awaited (legitimate Promises)
    this.promisePatterns = [
      /\.(then|catch|finally)\(/,
      /new\s+Promise\(/,
      /Promise\.(resolve|reject|all|race)/,
      /async\s+function/,
      /fetch\(/,
      /axios\./,
      /\.(json|text|blob)\(/,
      /setTimeout.*Promise/,
      /delay\(/,
      /waitFor\(/,
      /expect.*resolves/,
      /expect.*rejects/
    ];
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  backupFile(filePath) {
    if (this.isDryRun) return;
    
    this.createBackupDir();
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.backup`);
    
    fs.copyFileSync(filePath, backupPath);
    if (this.verbose) {
      console.log(`✓ Backup created: ${backupPath}`);
    }
  }

  isLegitimatePromise(line, awaitMatch) {
    // Check if this looks like a legitimate Promise
    return this.promisePatterns.some(pattern => pattern.test(line));
  }

  fixAwaitThenable(content, filePath) {
    let fixes = 0;
    let modifiedContent = content;
    
    // Split into lines for better analysis
    const lines = content.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const originalLine = line;
      
      // Skip if this looks like a legitimate Promise
      if (this.isLegitimatePromise(line, null)) {
        fixedLines.push(line);
        continue;
      }
      
      // Apply fixes for each pattern
      this.nonPromisePatterns.forEach(pattern => {
        line = line.replace(pattern, (match, captured) => {
          if (this.verbose) {
            console.log(`  Fixing: await ${captured} -> ${captured}`);
          }
          fixes++;
          return match.replace('await ', '');
        });
      });
      
      // Special case: await in return statements with non-Promises
      line = line.replace(/return\s+await\s+([^;(]+)(?![(.:])/g, (match, value) => {
        if (!this.isLegitimatePromise(line, value)) {
          if (this.verbose) {
            console.log(`  Fixing return await: ${value} -> return ${value}`);
          }
          fixes++;
          return `return ${value}`;
        }
        return match;
      });
      
      fixedLines.push(line);
    }
    
    return { content: fixedLines.join('\n'), fixes };
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.fixAwaitThenable(content, filePath);
      
      if (result.fixes > 0) {
        console.log(`📝 ${filePath}: ${result.fixes} await-thenable fixes`);
        
        if (!this.isDryRun) {
          this.backupFile(filePath);
          fs.writeFileSync(filePath, result.content, 'utf8');
        }
        
        this.fixedFiles++;
        this.totalFixes += result.fixes;
      } else if (this.verbose) {
        console.log(`✓ ${filePath}: No await-thenable issues found`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  findTestFiles() {
    const testPatterns = [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
      'src/__tests__/**/*.ts',
      'src/__tests__/**/*.tsx'
    ];
    
    const files = [];
    
    testPatterns.forEach(pattern => {
      try {
        const cmd = `find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx"`;
        const result = execSync(cmd, { encoding: 'utf8' });
        const foundFiles = result.trim().split('\n').filter(f => f);
        files.push(...foundFiles);
      } catch (error) {
        // Ignore find errors
      }
    });
    
    return [...new Set(files)].slice(0, this.maxFiles);
  }

  run() {
    console.log('🔧 Await-Thenable Error Fix Script');
    console.log('=====================================');
    
    if (this.isDryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }
    
    const files = this.targetFile ? [this.targetFile] : this.findTestFiles();
    
    console.log(`📁 Processing ${files.length} test files (max: ${this.maxFiles})`);
    console.log('');
    
    files.forEach(file => this.processFile(file));
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Files with fixes: ${this.fixedFiles}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    
    if (!this.isDryRun && this.fixedFiles > 0) {
      console.log(`   Backups created in: ${this.backupDir}/`);
      console.log('');
      console.log('🧪 Next steps:');
      console.log('   1. Run tests to verify fixes: yarn test');
      console.log('   2. Run ESLint to verify no await-thenable errors: yarn lint');
      console.log('   3. If issues occur, restore from backups');
    }
    
    if (this.isDryRun && this.totalFixes > 0) {
      console.log('');
      console.log('🚀 To apply fixes, run: node fix-await-thenable-errors.cjs');
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  verbose: args.includes('--verbose'),
  maxFiles: 50,
  targetFile: null
};

args.forEach(arg => {
  if (arg.startsWith('--max-files=')) {
    options.maxFiles = parseInt(arg.split('=')[1]) || 50;
  }
  if (arg.startsWith('--target-file=')) {
    options.targetFile = arg.split('=')[1];
  }
});

// Run the script
const fixer = new AwaitThenable(options);
fixer.run();