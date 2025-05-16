#!/usr/bin/env node

/**
 * Script to fix const variable assignments that should be let
 * 
 * This script scans the codebase for variables declared with const
 * that are later reassigned, and converts them to let declarations.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Running fix for const-to-let conversions...');

// Directories to scan
const DIRECTORIES = [
  'src/services',
  'src/components',
  'src/utils',
  'src/lib',
  'src/contexts'
];

// Find all target files
let targetFiles = [];
DIRECTORIES.forEach(dir => {
  const pattern = path.join(dir, '**', '*.{js,jsx,ts,tsx}');
  const files = glob.sync(pattern);
  targetFiles = targetFiles.concat(files);
});

console.log(`Found ${targetFiles.length} files to process`);

// Track files that were modified
const modifiedFiles = [];

// Process each file
targetFiles.forEach(filePath => {
  console.log(`Processing ${filePath}...`);
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Split into lines for analysis
  const lines = content.split('\n');
  
  // Track const declarations and reassignments
  const constDeclarations = new Map(); // line number -> variable name
  const reassignedVars = new Set();
  
  // First pass: find all const declarations
  lines.forEach((line, index) => {
    // Match const declarations
    const constMatch = line.match(/const\s+([a-zA-Z0-9_]+)\s*=/);
    if (constMatch) {
      constDeclarations.set(index, constMatch[1]);
    }
  });
  
  // Second pass: find all reassignments
  lines.forEach((line, index) => {
    // For each known const variable, check if it's reassigned
    for (const [declarationLine, varName] of constDeclarations.entries()) {
      if (index > declarationLine) { // Only check lines after declaration
        // Check for assignment patterns (varName = ...)
        const assignmentRegex = new RegExp(`${varName}\\s*=(?!=)`);
        if (assignmentRegex.test(line)) {
          reassignedVars.add(varName);
        }
      }
    }
  });
  
  // If we found reassigned const variables, fix them
  if (reassignedVars.size > 0) {
    console.log(`  Found ${reassignedVars.size} const variables that should be let:`);
    reassignedVars.forEach(varName => console.log(`    - ${varName}`));
    
    // Create a backup
    const backupPath = `${filePath}.backup`;
    fs.writeFileSync(backupPath, originalContent, 'utf8');
    console.log(`  Created backup at ${backupPath}`);
    
    // Replace const with let for reassigned variables
    let modifiedContent = content;
    for (const varName of reassignedVars) {
      const constRegex = new RegExp(`(const\\s+)(${varName})(\\s*=)`, 'g');
      modifiedContent = modifiedContent.replace(constRegex, 'let $2$3');
    }
    
    // Write the modified content
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    console.log(`  Updated ${filePath}`);
    modifiedFiles.push(filePath);
  } else {
    console.log(`  No const-to-let issues found in ${filePath}`);
  }
});

console.log('\nConst-to-let fix summary:');
console.log(`Modified ${modifiedFiles.length} files`);

if (modifiedFiles.length > 0) {
  console.log('\nFiles modified:');
  modifiedFiles.forEach(file => console.log(`- ${file}`));
}

console.log('\nConst-to-let fixes complete!'); 