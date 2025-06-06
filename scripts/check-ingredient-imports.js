#!/usr/bin/env node

import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { readdirSync, statSync } from 'fs';

// Base directory
const baseDir = 'src/data/ingredients';

// Files with @/ imports
const filesWithAliasImports = [];

/**
 * Check if a file has @/ imports
 * @param {string} filePath - Path to the file to check
 */
function checkFileForAliasImports(filePath) {
  try {
    // Read the file
    const content = readFileSync(filePath, 'utf8');
    
    // Check for @/ in the content
    if (content.includes('@/')) {
      // Count occurrences
      const matches = content.match(/@\//g) || [];
      const count = matches.length;
      
      filesWithAliasImports.push({
        path: filePath,
        count
      });
      
      console.log(`[FOUND] ${filePath}: ${count} @/ imports`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively walk a directory and process files
 * @param {string} dir - Directory to walk
 */
function walkDir(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively walk subdirectories
      walkDir(filePath);
    } else if (stat.isFile() && filePath.endsWith('.ts')) {
      // Check TypeScript files
      checkFileForAliasImports(filePath);
    }
  });
}

console.log(`Checking for @/ imports in ${baseDir}...\n`);

// Start the recursive walk
walkDir(baseDir);

console.log(`\nSummary: Found ${filesWithAliasImports.length} files with @/ imports:`);
filesWithAliasImports.forEach(file => {
  console.log(`- ${file.path}: ${file.count} occurrences`);
}); 