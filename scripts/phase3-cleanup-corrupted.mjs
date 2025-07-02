#!/usr/bin/env node

/**
 * Phase 3: Cleanup Corrupted Files Script
 * 
 * Safely removes corrupted files that are causing TypeScript errors
 * Focuses on files with syntax corruption and backup files
 * 
 * Usage: node scripts/phase3-cleanup-corrupted.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Command line arguments
const isDryRun = process.argv.includes('--dry-run');

console.log(`🧹 Phase 3: Cleanup Corrupted Files ${isDryRun ? '(DRY RUN)' : ''}`);
console.log('Removing files with syntax corruption and backups...\n');

// Files and directories that are known to be corrupted or unnecessary
const corruptedPaths = [
  // Corrupted fixer-comparison directory
  'fixer-comparison',
  
  // Corrupted test files (will be regenerated if needed)
  'src/__tests__/alchemicalPillars.test.ts',
  'src/__tests__/chakraSystem.test.ts',
  
  // Corrupted data files with " 2" in the name
  'src/data/cooking 2.ts',
  'src/data/cookingMethods 2.ts', 
  'src/data/defaultRecipes 2.ts',
  
  // Backup files in cuisines directory
  'src/data/cuisines/mexican.ts.bak',
  'src/data/cuisines/korean.ts.bak',
  'src/data/cuisines/japanese.ts.bak.2',
  'src/data/cuisines/japanese.ts.bak',
  
  // Additional backup directories that might contain corrupted files
  'data/cooking 2',
  'public/backgrounds 2',
  'public/icons 2',
  
  // Temporary fix files and logs from previous attempts
  'const-fix-log.txt',
  'lint-fix-log.txt',
  'errors.log',
  'remaining-issues.log',
  'typescript-errors.log',
  'typescript-errors-current.log',
  'typescript-errors-after-fixes.log',
  'typescript-errors-after-test-fixes.log',
  'typescript-fixes.log',
  'unfixable-syntax-errors.log',
  'unused_files.txt',
  'redundant-files.txt',
  
  // Temporary scripts that may have corruption
  '.eslint-fix-tmp',
  'WhatToEatNext', // Nested directory duplicate
];

// Additional patterns to check for corrupted files
const corruptedPatterns = [
  /\.bak$/,
  /\.tmp$/,
  /\.backup$/,
  / 2\./,
  /fix-.*\.js$/,
  /error.*\.log$/,
];

function isCorruptedPath(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  
  // Check if it's in our explicit list
  if (corruptedPaths.includes(relativePath)) {
    return true;
  }
  
  // Check if it matches any corrupted patterns
  return corruptedPatterns.some(pattern => pattern.test(relativePath));
}

function findCorruptedFiles(dir, basePath = '') {
  const corrupted = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.join(basePath, item.name);
      
      if (isCorruptedPath(fullPath)) {
        corrupted.push(fullPath);
        continue; // Don't recurse into corrupted directories
      }
      
      // Recurse into clean directories
      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        corrupted.push(...findCorruptedFiles(fullPath, relativePath));
      }
    }
  } catch (error) {
    console.log(`⚠️  Warning: Could not read directory ${dir}: ${error.message}`);
  }
  
  return corrupted;
}

function removeCorruptedItem(itemPath) {
  try {
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true, force: true });
      console.log(`🗂️  Removed directory: ${path.relative(ROOT_DIR, itemPath)}`);
    } else {
      fs.unlinkSync(itemPath);
      console.log(`📄 Removed file: ${path.relative(ROOT_DIR, itemPath)}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error removing ${itemPath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Scanning for corrupted files...');
  
  const corruptedFiles = findCorruptedFiles(ROOT_DIR);
  
  if (corruptedFiles.length === 0) {
    console.log('✅ No corrupted files found!');
    return;
  }
  
  console.log(`\nFound ${corruptedFiles.length} corrupted items:`);
  corruptedFiles.forEach(file => {
    console.log(`  - ${path.relative(ROOT_DIR, file)}`);
  });
  
  console.log('\n🗑️  Removing corrupted files...');
  
  let removed = 0;
  let failed = 0;
  
  for (const file of corruptedFiles) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Already removed: ${path.relative(ROOT_DIR, file)}`);
      continue;
    }
    
    if (isDryRun) {
      console.log(`🏃 Would remove: ${path.relative(ROOT_DIR, file)}`);
      removed++;
    } else {
      const success = removeCorruptedItem(file);
      if (success) {
        removed++;
      } else {
        failed++;
      }
    }
  }
  
  console.log('\n📊 Cleanup Results:');
  console.log(`Items processed: ${corruptedFiles.length}`);
  console.log(`Successfully removed: ${removed}`);
  if (failed > 0) {
    console.log(`Failed to remove: ${failed}`);
  }
  
  if (isDryRun) {
    console.log('\n🏃 DRY RUN COMPLETED - No files were actually removed');
    console.log('Run without --dry-run to apply cleanup');
  } else {
    console.log('\n✨ Cleanup completed!');
    console.log('Run `yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"` to check error count');
  }
}

main().catch(console.error); 