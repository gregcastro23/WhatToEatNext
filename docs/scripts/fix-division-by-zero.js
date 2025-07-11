#!/usr/bin/env node

/**
 * Script to fix division by zero issues in the codebase
 * 
 * This script finds potential division operations and adds safety checks
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running division by zero fix script...');

// Directories to scan
const DIRECTORIES = [
  'src/services',
  'src/components',
  'src/utils',
  'src/lib',
  'src/contexts'
];

// File extensions to process
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Create backup
function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const backupDir = path.join(process.cwd(), 'division-fix-backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(
    backupDir, 
    `${path.basename(filePath)}.${timestamp}.backup`
  );
  
  fs.copyFileSync(filePath, backupPath);
  console.log(`Created backup at ${backupPath}`);
  
  return backupPath;
}

// Find all target files
let targetFiles = [];
DIRECTORIES.forEach(dir => {
  FILE_EXTENSIONS.forEach(ext => {
    const pattern = path.join(dir, '**', `*${ext}`);
    const files = glob.sync(pattern);
    targetFiles = targetFiles.concat(files);
  });
});

console.log(`Found ${targetFiles.length} files to process`);

// Track files that were modified
const modifiedFiles = [];

// Process each file
targetFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Find potential division operations
  // Division operation regex - matches x / y patterns
  const divisionRegex = /([a-zA-Z0-9_\)\]\}]+)\s*\/\s*([a-zA-Z0-9_\.\(\[\{]+)/g;
  let match;
  let modified = false;
  
  // Find any division operations
  while ((match = divisionRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const numerator = match[1];
    const denominator = match[2];
    
    // Skip if the denominator is a numeric literal (e.g., / 2)
    if (/^\d+(\.\d+)?$/.test(denominator)) {
      continue;
    }
    
    // Skip common safe patterns
    if (denominator === '100' || 
        denominator === '2' || 
        denominator === '1000' ||
        denominator.includes('length')) {
      continue;
    }
    
    // Check if this division already has a safety check
    const precedingCode = content.substring(0, match.index).split('\n').slice(-3).join('\n');
    const followingCode = content.substring(match.index, match.index + 100);
    
    // Skip if already has safety (checking for common patterns)
    if (
      precedingCode.includes(`if (${denominator} === 0)`) ||
      precedingCode.includes(`if (${denominator} !== 0)`) ||
      precedingCode.includes(`if (${denominator} == 0)`) ||
      precedingCode.includes(`if (${denominator} != 0)`) ||
      precedingCode.includes(`if (!${denominator})`) ||
      precedingCode.includes(`if (${denominator})`) ||
      precedingCode.includes(`${denominator} || 1`) ||
      followingCode.includes(`|| 1`) ||
      followingCode.includes(`|| 0.001`) ||
      followingCode.includes(`|| 0.01`)
    ) {
      console.log(`  Already has safety check for: ${fullMatch}`);
      continue;
    }
    
    // Replace with safe division pattern
    const replacement = `${numerator} / (${denominator} || 1)`;
    content = content.substring(0, match.index) + 
              replacement + 
              content.substring(match.index + fullMatch.length);
              
    console.log(`  Fixed division: ${fullMatch} → ${replacement}`);
    modified = true;
    
    // Reset regex to search from the beginning with the new content
    divisionRegex.lastIndex = 0;
  }
  
  // Save changes if the content was modified
  if (modified) {
    // Create backup before making changes
    createBackup(filePath);
    
    // Write the modified content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated ${filePath}`);
    modifiedFiles.push(filePath);
  } else {
    console.log(`  No unsafe divisions found in ${filePath}`);
  }
});

console.log('\nDivision by zero fix summary:');
console.log(`Modified ${modifiedFiles.length} files`);

if (modifiedFiles.length > 0) {
  console.log('\nFiles modified:');
  modifiedFiles.forEach(file => console.log(`- ${file}`));
}

console.log('\nDivision by zero fixes complete!'); 