#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Files to process in the spices directory
const filesToProcess = [
  'src/data/ingredients/spices/groundspices.ts',
  'src/data/ingredients/spices/wholespices.ts',
  'src/data/ingredients/spices/warmSpices.ts',
  'src/data/ingredients/spices/spiceBlends.ts',
  'src/data/ingredients/spices/index.ts'
];

// Dry run flag (set to false to actually write files)
const DRY_RUN = false;

// Counter for changes
let changedFiles = 0;
let totalChanges = 0;

/**
 * Get the relative path prefix based on file location
 * @param {string} filePath - The file path
 * @returns {string} The relative path prefix
 */
function getRelativePathPrefix(filePath) {
  // Count directory levels from src
  const parts = filePath.split('/');
  const srcIndex = parts.indexOf('src');
  
  if (srcIndex === -1) return '../../../'; // Default if src not found
  
  // Calculate the relative path from the file to src
  const levelsUp = parts.length - srcIndex - 1;
  return '../'.repeat(levelsUp);
}

/**
 * Fix imports in a file
 * @param {string} filePath - Path to the file to fix
 */
function fixImports(filePath) {
  try {
    // Read the file
    const content = readFileSync(filePath, 'utf8');
    const relativePrefix = getRelativePathPrefix(filePath);
    
    // Replace @/ with the correct relative path
    const newContent = content.replace(/@\//g, relativePrefix);
    
    // Count changes
    const changes = (content.match(/@\//g) || []).length;
    
    // Output status
    if (changes > 0) {
      console.log(`[${DRY_RUN ? 'DRY RUN' : 'FIXING'}] ${filePath}: ${changes} replacements`);
      totalChanges += changes;
      changedFiles++;
      
      // Write the file if not in dry run mode
      if (!DRY_RUN) {
        writeFileSync(filePath, newContent, 'utf8');
      }
    } else {
      console.log(`[SKIPPED] ${filePath}: No changes needed`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log(`Starting import path fixes ${DRY_RUN ? '(DRY RUN)' : ''}...\n`);

filesToProcess.forEach(fixImports);

console.log(`\nSummary: Modified ${changedFiles} files with ${totalChanges} replacements ${DRY_RUN ? '(DRY RUN)' : ''}`);
if (DRY_RUN) {
  console.log('This was a dry run. Set DRY_RUN = false to apply changes.');
} 