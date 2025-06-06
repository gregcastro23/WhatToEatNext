#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Target files
const targetFiles = [
  path.resolve(__dirname, '../../src/utils/recommendation/ingredientRecommendation.ts'),
  path.resolve(__dirname, '../../src/utils/recommendation/methodRecommendation.ts')
];

// Helper to log with optional dry run indicator
function logChange(message, isDryRun) {
  console.log(`  ${isDryRun ? '[DRY RUN] Would ' : ''}${message}`);
}

// Function to fix async return types in a file
function fixAsyncReturnTypes(filePath, isDryRun) {
  console.log(`Processing ${filePath}...`);
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changes = 0;
    
    // Pattern 1: Fix async function declarations without return types
    // Match: async function name(...) {
    // Don't match if it already has a return type: async function name(...): Promise<...> {
    const asyncFunctionPattern = /async\s+function\s+(\w+)\s*\(([^)]*)\)\s*(?!:\s*Promise<)(\s*{)/g;
    content = content.replace(asyncFunctionPattern, (match, funcName, params, bracket) => {
      changes++;
      return `async function ${funcName}(${params}): Promise<any>${bracket}`;
    });
    
    // Pattern 2: Fix async method declarations without return types
    // Match: async methodName(...) {
    // Don't match if it already has a return type: async methodName(...): Promise<...> {
    const asyncMethodPattern = /(\s+)async\s+(\w+)\s*\(([^)]*)\)\s*(?!:\s*Promise<)(\s*{)/g;
    content = content.replace(asyncMethodPattern, (match, indent, methodName, params, bracket) => {
      changes++;
      return `${indent}async ${methodName}(${params}): Promise<any>${bracket}`;
    });
    
    // Pattern 3: Fix missing await keywords
    // Match: someObject.then(
    // Replace with: (await someObject).then(
    const missingAwaitPattern = /(\s|\()(\w+)\.then\(/g;
    content = content.replace(missingAwaitPattern, (match, prefix, objName) => {
      // Skip if await is already there
      if (match.includes('await')) {
        return match;
      }
      changes++;
      return `${prefix}(await ${objName}).then(`;
    });
    
    // Pattern 4: Fix array.then() calls by refactoring to Promise.all()
    const arrayThenPattern = /(\w+)\.then\(/g;
    let arrayThenMatches = Array.from(content.matchAll(/(\w+)\.then\(/g));
    
    for (const match of arrayThenMatches) {
      const fullMatch = match[0];
      const objName = match[1];
      
      // Check if this appears to be an array by looking for array operations
      const hasArrayOps = new RegExp(`${objName}\\.(map|filter|forEach|reduce|some|every|find)\\(`).test(content);
      
      if (hasArrayOps) {
        // Replace array.then with Promise.all(array).then
        const replacePattern = new RegExp(`${objName}\\.then\\(`, 'g');
        content = content.replace(replacePattern, `Promise.all(${objName}).then(`);
        changes++;
      }
    }
    
    // Write changes
    if (content !== originalContent) {
      if (isDryRun) {
        logChange(`make ${changes} changes to async/Promise patterns`, isDryRun);
      } else {
        fs.writeFileSync(filePath, content, 'utf8');
        logChange(`made ${changes} changes to async/Promise patterns`, false);
      }
    } else {
      console.log('  No changes needed for async/Promise patterns');
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main execution function
function main() {
  console.log(`Running in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);
  
  for (const filePath of targetFiles) {
    if (fs.existsSync(filePath)) {
      fixAsyncReturnTypes(filePath, isDryRun);
    } else {
      console.error(`File not found: ${filePath}`);
    }
  }
}

// Run the script
main(); 