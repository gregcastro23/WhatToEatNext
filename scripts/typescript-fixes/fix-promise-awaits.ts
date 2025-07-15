/**
 * fix-promise-awaits.ts
 * 
 * Script to fix missing awaits for Promise operations in the codebase.
 * This specifically targets the errors in ingredientRecommendation.ts where
 * filter() and map() are being called on Promise<Array> objects without awaiting.
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Files with await issues to fix
const FILES_TO_FIX = [
  'src/utils/recommendation/ingredientRecommendation.ts'
].map(file => path.resolve(ROOT_DIR, file));

// Patterns to detect Promise operations without await
// This is simplified and may need refinement for specific cases
const MISSING_AWAIT_PATTERNS = [
  {
    pattern: /(\w+)\s*=\s*(\w+)\.filter\(/g,
    replacement: (match: string, result: string, promise: string) => 
      `${result} = await ${promise}.filter(`
  },
  {
    pattern: /(\w+)\s*=\s*(\w+)\.map\(/g,
    replacement: (match: string, result: string, promise: string) => 
      `${result} = await ${promise}.map(`
  },
  {
    pattern: /(\w+)\s*=\s*(\w+)\.sort\(/g,
    replacement: (match: string, result: string, promise: string) => 
      `${result} = await ${promise}.sort(`
  }
];

async function fixMissingAwaits(filePath: string, dryRun: boolean): Promise<boolean> {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let updatedContent = content;
    
    // Make sure the containing function is marked as async
    // This is simplified and may need refinement
    const asyncFunctionPattern = /export\s+(const|function)\s+(\w+)\s*=\s*(\(.*?\)\s*=>|function\s*\(.*?\))\s*{/g;
    updatedContent = updatedContent.replace(
      asyncFunctionPattern,
      (match, type, name, params) => {
        if (!match.includes('async')) {
          return match.replace(params, `async ${params}`);
        }
        return match;
      }
    );
    
    // Fix missing awaits in Promise operations
    for (const { pattern, replacement } of MISSING_AWAIT_PATTERNS) {
      updatedContent = updatedContent.replace(pattern, replacement);
    }
    
    if (updatedContent !== content) {
      if (!dryRun) {
        await fs.writeFile(filePath, updatedContent, 'utf8');
      }
      console.log(`${dryRun ? '[DRY RUN] Would fix' : 'Fixed'} missing awaits in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing missing awaits in ${filePath}:`, error);
    return false;
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  
  if (dryRun) {
    console.log('Running in DRY RUN mode. No files will be modified.');
  }
  
  let modifiedCount = 0;
  
  for (const filePath of FILES_TO_FIX) {
    try {
      if (fsSync.existsSync(filePath)) {
        const modified = await fixMissingAwaits(filePath, dryRun);
        if (modified) modifiedCount++;
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  console.log(`${dryRun ? '[DRY RUN] Would fix' : 'Fixed'} missing awaits in ${modifiedCount} files`);
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 