// Fix import paths in service files
// Replace @/ imports with relative paths

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const SERVICE_DIR = path.join(__dirname, '../src/services');
const SERVICE_PATH_PREFIX = '../';

// Get all TypeScript files in the services directory
const serviceFiles = globSync(path.join(SERVICE_DIR, '**/*.ts'));

// Regex patterns for finding imports
const importPattern = /import\s+(?:(?:{[^}]*})|(?:[\w*]+))?\s*(?:from\s+)?['"](@\/[^'"]+)['"]/g;
const typeImportPattern = /import\s+type\s+(?:(?:{[^}]*})|(?:[\w*]+))?\s*(?:from\s+)?['"](@\/[^'"]+)['"]/g;

// Counter for statistics
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  pathsFixed: 0
};

// Mapping of @/ prefixes to relative paths
function calculateRelativePath(importPath, currentFile) {
  // Remove @/ prefix
  const targetPath = importPath.replace('@/', '');
  
  // Calculate relative path from the current file to the target
  const currentDir = path.dirname(currentFile);
  const relativePath = path.relative(currentDir, path.join(SERVICE_DIR, '..', targetPath));
  
  // Ensure the path starts with ./ or ../
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

// Process a single file
function processFile(filePath) {
  console.log(`Processing ${filePath}`);
  stats.filesProcessed++;
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  let pathsFixed = 0;
  
  // Replace all @/ imports with relative paths
  newContent = newContent.replace(importPattern, (match, importPath) => {
    pathsFixed++;
    const relativePath = calculateRelativePath(importPath, filePath);
    return match.replace(importPath, relativePath);
  });
  
  newContent = newContent.replace(typeImportPattern, (match, importPath) => {
    pathsFixed++;
    const relativePath = calculateRelativePath(importPath, filePath);
    return match.replace(importPath, relativePath);
  });
  
  // Check if any changes were made
  if (content !== newContent) {
    stats.filesModified++;
    stats.pathsFixed += pathsFixed;
    
    if (DRY_RUN) {
      console.log(`Would update ${filePath} (${pathsFixed} paths)`);
    } else {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`Updated ${filePath} (${pathsFixed} paths)`);
    }
  }
}

// Main function
function main() {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixing import paths in service files...`);
  
  serviceFiles.forEach(processFile);
  
  console.log('\nSummary:');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Paths fixed: ${stats.pathsFixed}`);
  
  if (DRY_RUN) {
    console.log('\nThis was a dry run. No files were actually modified.');
    console.log('Run without --dry-run to apply changes.');
  }
}

main(); 