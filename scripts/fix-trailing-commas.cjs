#!/usr/bin/env node

/**
 * Fix Trailing Commas Script
 * Purpose: Systematically remove inappropriate trailing commas throughout codebase
 * Target: JavaScript/TypeScript files with syntax errors from trailing commas
 * Success Rate: High - fixes systematic syntax issues
 * Last Updated: 2025-01-09
 *
 * Usage: node scripts/fix-trailing-commas.cjs [options]
 *
 * Options:
 *   --dry-run    Show what would be changed without making changes
 *   --verbose    Show detailed output
 *   --max-files  Maximum number of files to process (default: 100)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  maxFiles: process.argv.includes('--max-files') ?
    parseInt(process.argv[process.argv.indexOf('--max-files') + 1]) : 100
};

// Common file extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to fix (regex patterns for trailing commas that break syntax)
const PATTERNS = [
  // Object literals: { prop: value, } → { prop: value }
  {
    name: 'Object literal trailing comma',
    pattern: /\{\s*([^}]+),\s*\}/g,
    replacement: (match, content) => {
      // Only remove trailing comma if the content doesn't contain nested structures
      if (content.includes('{') || content.includes('[') || content.includes('(')) {
        return match; // Keep comma for complex objects
      }
      return `{${content}}`;
    }
  },

  // Variable declarations: const x = value, → const x = value
  {
    name: 'Variable declaration trailing comma',
    pattern: /(const|let|var)\s+(\w+)\s*=\s*([^,]+),\s*;/g,
    replacement: '$1 $2 = $3;'
  },

  // Array/object returns: return [item], → return [item]
  {
    name: 'Return statement trailing comma',
    pattern: /return\s+([\[{\(][^\]}\)]*),\s*([;\}])/g,
    replacement: 'return $1$2'
  },

  // Switch case returns: case 'x': return 'y', → case 'x': return 'y'
  {
    name: 'Switch return trailing comma',
    pattern: /case\s+[^:]+:\s*return\s+([^,]+),\s*/g,
    replacement: "case $1: return $2"
  },

  // Function parameters: func(param, ) → func(param)
  {
    name: 'Function call trailing comma',
    pattern: /(\w+)\(\s*([^)]+),\s*\)/g,
    replacement: '$1($2)'
  }
];

async function findFiles() {
  const files = [];

  function scanDirectory(dir) {
    if (files.length >= CONFIG.maxFiles) return;

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        if (files.length >= CONFIG.maxFiles) return;

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (EXTENSIONS.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      if (CONFIG.verbose) {
        console.log(`Skipping directory ${dir}: ${error.message}`);
      }
    }
  }

  // Start from src directory
  scanDirectory('src');

  return files;
}

async function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changeCount = 0;

    // Apply each pattern
    for (const pattern of PATTERNS) {
      const originalContent = content;
      content = content.replace(pattern.pattern, pattern.replacement);
      if (content !== originalContent) {
        modified = true;
        changeCount++;
        if (CONFIG.verbose) {
          console.log(`  Applied ${pattern.name} (${changeCount} changes)`);
        }
      }
    }

    if (modified) {
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      return changeCount;
    }

    return 0;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔧 Fix Trailing Commas Script');
  console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Max files: ${CONFIG.maxFiles}`);
  console.log('');

  try {
    // Find files to process
    console.log('Finding files to process...');
    const files = await findFiles();
    console.log(`Found ${files.length} files to check`);
    console.log('');

    // Process files
    let processedCount = 0;
    let modifiedCount = 0;
    let totalChanges = 0;

    for (const file of files) {
      if (processedCount >= CONFIG.maxFiles) break;

      const changes = await fixFile(file);
      processedCount++;

      if (changes > 0) {
        modifiedCount++;
        totalChanges += changes;

        if (CONFIG.verbose || CONFIG.dryRun) {
          console.log(`${CONFIG.dryRun ? 'Would modify' : 'Modified'}: ${path.relative(process.cwd(), file)} (${changes} changes)`);
        }
      } else if (CONFIG.verbose) {
        console.log(`No changes needed: ${path.relative(process.cwd(), file)}`);
      }

      // Progress indicator
      if (processedCount % 10 === 0 && !CONFIG.verbose) {
        process.stdout.write(`\rProcessed ${processedCount}/${files.length} files...`);
      }
    }

    console.log('');
    console.log('📊 Results:');
    console.log(`  Files processed: ${processedCount}`);
    console.log(`  Files modified: ${modifiedCount}`);
    console.log(`  Total changes: ${totalChanges}`);

    if (CONFIG.dryRun) {
      console.log('');
      console.log('🔄 Run without --dry-run to apply changes');
    } else {
      console.log('');
      console.log('✅ Trailing comma fixes completed!');
      console.log('💡 Run TypeScript compilation to verify fixes');
    }

  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
