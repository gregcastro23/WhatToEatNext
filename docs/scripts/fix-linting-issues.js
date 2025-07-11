#!/usr/bin/env node

/**
 * This script automatically fixes the most common linting issues:
 * - prefer-const errors (changing 'let' to 'const' for variables never reassigned)
 * 
 * Run with:
 * node fix-linting-issues.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to exclude from processing
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'build',
  'dist',
  'coverage',
  '.yarn'
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Simple helper for logging
function log(message) {
  console.log(`[FIX-LINTING] ${message}`);
}

// Find files recursively
function findFiles(dir, fileList = []) {
  if (EXCLUDED_DIRS.includes(path.basename(dir))) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (FILE_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Fix prefer-const issues in a file
function fixPreferConst(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Match let declarations where the variable is never reassigned
    // This is a simplified approach - ESLint's actual checks are more sophisticated
    const letRegex = /let\s+([a-zA-Z0-9_$]+)\s*=/g;
    let match;
    const changes = [];

    while ((match = letRegex.exec(content)) !== null) {
      const varName = match[1];
      const varStart = match.index;
      const declaration = match[0];
      
      // Simple check to see if there's a reassignment - far from perfect but helps with obvious cases
      const reassignmentRegex = new RegExp(`${varName}\\s*=(?!=)`, 'g');
      reassignmentRegex.lastIndex = varStart + declaration.length;
      
      const reassignmentMatch = reassignmentRegex.exec(content);
      
      // If no reassignment found or reassignment is for a different variable with the same prefix
      if (!reassignmentMatch) {
        changes.push({ start: varStart, end: varStart + 3, replacement: 'const' });
        modified = true;
      }
    }
    
    // Apply changes in reverse order to not mess up positions
    changes.sort((a, b) => b.start - a.start);
    
    for (const change of changes) {
      content = content.substring(0, change.start) + change.replacement + content.substring(change.end);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    
    return false;
  } catch (error) {
    log(`Error fixing ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function
function main() {
  log('Starting linting fixes...');
  
  const rootDir = process.cwd();
  log(`Looking for files in ${rootDir}`);
  
  const files = findFiles(rootDir);
  log(`Found ${files.length} files to process`);
  
  const fixCount = 0;
  
  files.forEach(file => {
    const wasFixed = fixPreferConst(file);
    if (wasFixed) {
      fixCount++;
      log(`Fixed prefer-const issues in ${file}`);
    }
  });
  
  log(`Fixed issues in ${fixCount} files`);
  
  // Run ESLint --fix on the project
  try {
    log('Running ESLint --fix to apply more fixes...');
    execSync('npx eslint . --fix', { stdio: 'inherit' });
    log('ESLint --fix completed');
  } catch (error) {
    log('ESLint --fix completed with errors (some issues may still need manual fixing)');
  }
}

main(); 