#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dryRun = process.argv.includes('--dry-run');

console.log(`🧹 Starting Duplicate & Corruption Cleanup Script ${dryRun ? '(DRY RUN)' : ''}`);

// Define files that are clearly corrupted and unused/duplicates
const filesToDelete = [
  // Clear duplicate - .js version with corrupted imports, .tsx version is clean
  'src/components/GlobalPopup.js',
  
  // Files with corrupted path comments and no clear usage
  'src/utils/popup.ts', // Likely duplicate/unused utility
];

// Define corruption patterns to identify more problematic files
const corruptionIndicators = [
  // Corrupted path comments
  /\/\/ src \/ \(/,
  // Malformed import statements (that weren't caught by our first script)
  /import [^'"]*from '[^']*' *;/,
  // Other patterns we might find
];

// Function to check if a file has corruption indicators
function hasCorruptionIndicators(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return corruptionIndicators.some(pattern => pattern.test(content));
  } catch (error) {
    console.warn(`Could not read file ${filePath}:`, error.message);
    return false;
  }
}

// Function to check if a file is imported anywhere
function isFileImported(targetFile, allFiles) {
  const relativePaths = [
    // Different ways the file might be imported
    targetFile.replace(/\.(ts|tsx|js|jsx)$/, ''),  // Without extension
    targetFile,  // With extension
    './' + path.basename(targetFile).replace(/\.(ts|tsx|js|jsx)$/, ''), // Relative without extension
    './' + path.basename(targetFile), // Relative with extension
    '@/' + targetFile.replace('src/', ''), // Absolute path without extension
    '@/' + targetFile.replace('src/', '').replace(/\.(ts|tsx|js|jsx)$/, ''), // Absolute path
  ];

  for (const file of allFiles) {
    if (file === targetFile) continue; // Skip self
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for import statements
      const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (relativePaths.some(relPath => importPath.includes(relPath))) {
          return true;
        }
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }
  
  return false;
}

// Find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other build directories
      if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(item)) {
        files.push(...findFiles(fullPath, extensions));
      }
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to delete a file
function deleteFile(filePath) {
  const relativePath = path.relative(__dirname, filePath);
  if (fs.existsSync(filePath)) {
    console.log(`  🗑️  Deleting: ${relativePath}`);
    if (!dryRun) {
      fs.unlinkSync(filePath);
    }
    return true;
  } else {
    console.log(`  ⚠️  File not found: ${relativePath}`);
    return false;
  }
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const allFiles = findFiles(srcDir);

let deletedCount = 0;

console.log(`\n🔍 Scanning ${allFiles.length} files...\n`);

// Step 1: Delete clearly identified problematic files
console.log('📋 Step 1: Deleting clearly identified duplicate/corrupted files...\n');

for (const fileToDelete of filesToDelete) {
  const fullPath = path.join(__dirname, fileToDelete);
  if (deleteFile(fullPath)) {
    deletedCount++;
  }
}

// Step 2: Look for more files with corruption indicators that aren't imported
console.log('\n📋 Step 2: Scanning for additional corrupted files that are not imported...\n');

const potentiallyCorrupted = [];

for (const file of allFiles) {
  if (hasCorruptionIndicators(file)) {
    const relativePath = path.relative(__dirname, file);
    
    // Skip if this file is in our known-safe list or already deleted
    if (filesToDelete.some(f => file.endsWith(f))) {
      continue;
    }
    
    // Check if it's imported anywhere
    const isImported = isFileImported(file, allFiles);
    
    if (!isImported) {
      console.log(`  ⚠️  Found corrupted, unused file: ${relativePath}`);
      potentiallyCorrupted.push(file);
    } else {
      console.log(`  📎 Found corrupted file but it's imported: ${relativePath}`);
    }
  }
}

// Step 3: Look for obvious duplicates (same filename in different locations)
console.log('\n📋 Step 3: Checking for potential duplicates...\n');

const filesByName = {};
for (const file of allFiles) {
  const fileName = path.basename(file);
  if (!filesByName[fileName]) {
    filesByName[fileName] = [];
  }
  filesByName[fileName].push(file);
}

for (const [fileName, files] of Object.entries(filesByName)) {
  if (files.length > 1) {
    console.log(`  📄 Multiple files named '${fileName}':`);
    for (const file of files) {
      const relativePath = path.relative(__dirname, file);
      const isImported = isFileImported(file, allFiles);
      const hasCorruption = hasCorruptionIndicators(file);
      console.log(`    - ${relativePath} ${isImported ? '(imported)' : '(not imported)'} ${hasCorruption ? '(corrupted)' : '(clean)'}`);
    }
    console.log('');
  }
}

console.log(`\n📊 Summary:`);
console.log(`  Files scanned: ${allFiles.length}`);
console.log(`  Files deleted: ${deletedCount}`);
console.log(`  Potentially corrupted files found: ${potentiallyCorrupted.length}`);

if (potentiallyCorrupted.length > 0) {
  console.log('\n⚠️  Found additional corrupted files that appear unused. Review manually:');
  for (const file of potentiallyCorrupted) {
    console.log(`  - ${path.relative(__dirname, file)}`);
  }
}

if (dryRun) {
  console.log(`\n⚠️  This was a dry run. To apply changes, run without --dry-run flag.`);
} else {
  console.log(`\n✅ Cleanup completed!`);
} 