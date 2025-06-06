#!/usr/bin/env node

/**
 * Simple TypeScript Error Fixer
 * 
 * This script addresses common TypeScript errors in the codebase:
 * - Parameter type issues (any: any -> any)
 * - Missing semicolons
 * - Invalid CSP headers
 * - Object declarations with trailing commas
 * 
 * Usage:
 * node fix-typescript-simple.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_DIR = './src';
const BACKUP_DIR = './typescript-fixes-backup';
const LOG_FILE = './typescript-fix.log';

// Regular expressions for finding common TypeScript errors
const patterns = {
  // Fix parameter type issues: "param: any: any" -> "param: any"
  badParamTypes: /(\w+):\s*any(?:y|u)?:\s*any(?:e|r|s|t)?/g,
  
  // Fix "anyX: any" -> "anyX"
  badAnyTypes: /(\w+):\s*any\s*,/g,

  // Fix missing semicolons in interface methods
  missingSemicolons: /(\w+\s*\([^)]*\)):\s*([^;{]*?)\s*,/g,
  
  // Fix trailing commas in object declarations
  trailingCommas: /},\s*\n\s*}/g,
  
  // Fix CSP header issues
  cspHeaderIssues: /let\s+cspHeader\s*=\s*;\s*`/g,

  // Fix invalid type declarations
  invalidTypes: /:\s*\{.*\}\s*,\s*$/gm,

  // Fix missing parentheses in function calls
  missingParens: /(\w+)\s*\(\s*\)\s*\)/g,
};

// Files to process
let filesToProcess = [];

// Setup
function setup() {
  console.log(`Starting TypeScript fix${DRY_RUN ? ' (DRY RUN)' : ''}`);
  
  if (!DRY_RUN && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Clear the log file
  if (!DRY_RUN) {
    fs.writeFileSync(LOG_FILE, '', 'utf8');
  }
}

// Find all TypeScript files
function findTypescriptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        findTypescriptFiles(fullPath);
      }
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      filesToProcess.push(fullPath);
    }
  }
}

// Process a file to fix TypeScript errors
function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    // Apply all the patterns
    for (const [name, pattern] of Object.entries(patterns)) {
      // Store the content before applying this pattern
      const beforePattern = content;
      
      if (name === 'badParamTypes') {
        content = content.replace(pattern, '$1: any');
      } else if (name === 'badAnyTypes') {
        content = content.replace(pattern, '$1,');
      } else if (name === 'missingSemicolons') {
        content = content.replace(pattern, '$1: $2;');
      } else if (name === 'trailingCommas') {
        content = content.replace(pattern, '}\n}');
      } else if (name === 'cspHeaderIssues') {
        content = content.replace(pattern, 'let cspHeader = `');
      } else if (name === 'invalidTypes') {
        content = content.replace(pattern, ': any,');
      } else if (name === 'missingParens') {
        content = content.replace(pattern, '$1()');
      }
      
      // Check if this pattern made changes
      if (beforePattern !== content) {
        const changes = countChanges(beforePattern, content);
        logToFile(`Applied ${name} to ${filePath}: ${changes} changes`);
        hasChanges = true;
      }
    }
    
    // Write changes if there are any
    if (hasChanges && !DRY_RUN) {
      // Create backup
      const backupPath = path.join(BACKUP_DIR, path.basename(filePath));
      fs.writeFileSync(backupPath, originalContent, 'utf8');
      
      // Write fixed content
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${filePath}`);
    } else if (hasChanges) {
      console.log(`🔍 Would fix ${filePath} (dry run)`);
    } else {
      console.log(`⏭️ No changes needed for ${filePath}`);
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    logToFile(`Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Count the number of changes between two strings
function countChanges(oldStr, newStr) {
  return newStr.split('\n').filter((line, i) => {
    const oldLines = oldStr.split('\n');
    return i < oldLines.length && line !== oldLines[i];
  }).length;
}

// Log to file
function logToFile(message) {
  if (!DRY_RUN) {
    fs.appendFileSync(LOG_FILE, message + '\n', 'utf8');
  }
}

// Main execution
function main() {
  setup();
  findTypescriptFiles(TARGET_DIR);
  
  console.log(`Found ${filesToProcess.length} TypeScript files to process`);
  
  let fixedFiles = 0;
  for (const file of filesToProcess) {
    const fixed = processFile(file);
    if (fixed) fixedFiles++;
  }
  
  const action = DRY_RUN ? 'Would fix' : 'Fixed';
  console.log(`\n${action} ${fixedFiles} out of ${filesToProcess.length} files`);
  
  if (!DRY_RUN) {
    console.log(`Log file written to ${LOG_FILE}`);
  }
}

main(); 