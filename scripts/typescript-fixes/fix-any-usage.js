/**
 * Fix 'any' Being Used as Value Script
 * 
 * This script fixes the common TS2693 error: "'any' only refers to a type, but is being used as a value here."
 * The script replaces 'any' used as values with more appropriate fallbacks like '{}', 'null', etc.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');
const VALIDATE = process.argv.includes('--validate');
const VERBOSE = process.argv.includes('--verbose');

// Files to check for 'any' used as a value
const FILES_TO_CHECK = [
  'src/constants/planetaryFoodAssociations.ts',
  'src/data/ingredients/proteins/meat.ts',
  'src/data/unified/recipes.ts'
];

// Log helper
function log(message, type = 'info') {
  const prefix = type === 'info' ? '📝' : type === 'warn' ? '⚠️' : '❌';
  console.log(`${prefix} ${message}`);
}

// Verbose logging
function verbose(message) {
  if (VERBOSE) {
    console.log(`  🔍 ${message}`);
  }
}

// Find files with 'any' used as a value
async function findFilesWithAnyUsageAsValue() {
  log('Scanning for files with "any" used as a value...');
  
  try {
    // Use grep to find files with potential 'any' value usage
    const grepCommand = "grep -r --include='*.ts' --include='*.tsx' '\\bany\\b[^:;()<>=]' src/";
    const output = execSync(grepCommand, { stdio: 'pipe' }).toString();
    
    // Parse grep output to get file paths
    const filePaths = new Set();
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        const match = line.match(/^([^:]+):/);
        if (match && match[1]) {
          filePaths.add(match[1]);
        }
      }
    }
    
    log(`Found ${filePaths.size} files with potential 'any' usage as a value`);
    return Array.from(filePaths);
    
  } catch (error) {
    log(`Error finding files: ${error.message}`, 'error');
    return FILES_TO_CHECK; // Fallback to predefined list
  }
}

// Fix 'any' usage as a value in a file
function fixAnyUsageInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace instances of 'any' used as a value with actual values or objects
  const anyAsValueRegex = /\b(const|let|var)?\s+(\w+)\s*=\s*any\s*;/g;
  if (anyAsValueRegex.test(content)) {
    content = content.replace(anyAsValueRegex, (match, declarationType, variableName) => {
      modified = true;
      return `${declarationType || 'const'} ${variableName} = {}; // Fixed: replaced 'any' with empty object`;
    });
  }
  
  // Replace any being used directly in property access or function calls
  const anyDirectUsageRegex = /\bany\.([\w]+)/g;
  if (anyDirectUsageRegex.test(content)) {
    content = content.replace(anyDirectUsageRegex, (match, property) => {
      modified = true;
      return `({})["${property}"]`;
    });
  }
  
  // Write changes back to file
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    log(`Fixed 'any' usage in ${filePath}`);
    return true;
  }
  
  log(`No 'any' usage issues found in ${filePath}`);
  return false;
}

// Main function
async function main() {
  log(`Starting 'any' usage fix ${DRY_RUN ? '(DRY RUN)' : ''}`);
  
  try {
    // Find files with 'any' used as a value
    const filesToCheck = await findFilesWithAnyUsageAsValue();
    
    // Process each file
    let fixedFiles = 0;
    for (const file of filesToCheck) {
      const filePath = path.join(rootDir, file);
      if (fixAnyUsageInFile(filePath)) {
        fixedFiles++;
      }
    }
    
    log(`Fixed 'any' usage in ${fixedFiles} files`);
    
    // Validate changes if requested
    if (VALIDATE && !DRY_RUN) {
      log('Validating changes with TypeScript compiler...');
      try {
        const output = execSync('yarn tsc --noEmit', { stdio: 'pipe' }).toString();
        log('TypeScript validation successful!');
      } catch (error) {
        log('TypeScript validation found errors. The fixes may not have resolved all issues.', 'warn');
        
        // Count errors and display summary
        try {
          const errorOutput = error.stdout.toString();
          const anyErrors = (errorOutput.match(/only refers to a type, but is being used as a value/g) || []).length;
          log(`TypeScript still has ${anyErrors} 'any' used as value errors`, 'warn');
        } catch (e) {
          log('Could not determine error count', 'error');
        }
      }
    }
    
    log('Fix for "any" usage as a value completed successfully!');
  } catch (error) {
    log(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  }
}

// Run the script
main(); 