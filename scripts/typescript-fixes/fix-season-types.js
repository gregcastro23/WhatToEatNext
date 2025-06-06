/**
 * fix-season-types.js
 * 
 * Script to standardize Season type definitions across the codebase.
 * We'll use the most comprehensive definition from alchemy.ts as our standard:
 * 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all'
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Standard Season type definition
const STANDARD_SEASON_TYPE = `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`;

// Regex patterns to find various Season type definitions
const SEASON_TYPE_PATTERNS = [
  /export\s+type\s+Season\s*=\s*(['"]spring['"]\s*\|\s*['"]summer['"]\s*\|\s*(['"]autumn['"]\s*\|\s*)?['"]fall['"]\s*\|\s*['"]winter['"]\s*(\|\s*['"]all['"])?\s*);/,
  /export\s+type\s+Season\s*=\s*(['"]Spring['"]\s*\|\s*['"]Summer['"]\s*\|\s*(['"]Autumn['"]\s*\|\s*)?['"]Fall['"]\s*\|\s*['"]Winter['"]\s*(\|\s*['"]All['"])?\s*);/,
  /export\s+type\s+Season\s*=\s*(['"]spring['"]\s*\|\s*['"]summer['"]\s*\|\s*['"]autumn['"]\s*\|\s*['"]winter['"]\s*(\|\s*['"]all['"])?\s*);/,
  /export\s+type\s+Season\s*=\s*(['"]Spring['"]\s*\|\s*['"]Summer['"]\s*\|\s*['"]Autumn['"]\s*\|\s*['"]Winter['"]\s*(\|\s*['"]All['"])?\s*);/
];

// List of common files that may contain Season type definitions
const COMMON_TYPE_FILES = [
  'src/types/alchemy.ts',
  'src/types/seasons.ts',
  'src/types/seasonal.ts',
  'src/types/time.ts',
  'src/constants/recipe.ts',
  'src/utils/recommendation/cuisineRecommendation.ts'
];

// Files that import Season type
const IMPORT_PATTERNS = [
  /import\s*{([^}]*)Season([^}]*)}.*from\s*['"](.*)['"]/,
  /import\s*type\s*{([^}]*)Season([^}]*)}.*from\s*['"](.*)['"]/
];

// Function to check if a file is a TypeScript file
const isTypeScriptFile = (filePath) => {
  return filePath.endsWith('.ts') || filePath.endsWith('.tsx');
};

// Function to recursively search for TypeScript files
async function findTypeScriptFiles(dir) {
  const files = [];
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.next' && entry !== 'dist' && entry !== 'build') {
        const subFiles = await findTypeScriptFiles(fullPath);
        files.push(...subFiles);
      }
    } else if (isTypeScriptFile(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to update Season type definitions
async function updateSeasonTypeDefinition(filePath, dryRun) {
  try {
    let content = await readFile(filePath, 'utf8');
    let modified = false;
    
    // Check if file contains a Season type definition
    for (const pattern of SEASON_TYPE_PATTERNS) {
      if (pattern.test(content)) {
        const updatedContent = content.replace(pattern, STANDARD_SEASON_TYPE);
        if (updatedContent !== content) {
          if (!dryRun) {
            await writeFile(filePath, updatedContent, 'utf8');
          }
          console.log(`${dryRun ? '[DRY RUN] Would update' : 'Updated'} Season type in ${filePath}`);
          modified = true;
          content = updatedContent; // Update content for further replacements
        }
      }
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  const dryRun = process.argv.includes('--dry-run');
  
  if (dryRun) {
    console.log('Running in DRY RUN mode. No files will be modified.');
  }
  
  // First, update known type definition files
  let modifiedCount = 0;
  for (const filePath of COMMON_TYPE_FILES) {
    try {
      if (fs.existsSync(filePath)) {
        const modified = await updateSeasonTypeDefinition(filePath, dryRun);
        if (modified) modifiedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  // Then, find and update other TypeScript files
  const tsFiles = await findTypeScriptFiles('src');
  
  for (const filePath of tsFiles) {
    if (!COMMON_TYPE_FILES.includes(filePath)) {
      const modified = await updateSeasonTypeDefinition(filePath, dryRun);
      if (modified) modifiedCount++;
    }
  }
  
  console.log(`${dryRun ? '[DRY RUN] Would update' : 'Updated'} ${modifiedCount} files with standardized Season type.`);
}

// Run the script
main().catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
}); 