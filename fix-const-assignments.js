#!/usr/bin/env node

/**
 * Script to fix const assignment errors across the codebase
 * This replaces 'const' with 'let' for variables that are reassigned
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get a list of files with const assignment errors from eslint
function getFilesWithConstAssignmentErrors() {
  try {
    const output = execSync('yarn eslint --config eslint.config.cjs src --format json')
      .toString()
      .trim();

    const results = JSON.parse(output);
    
    const filesWithConstAssignmentErrors = new Set();
    
    results.forEach(result => {
      const hasConstAssignmentError = result.messages.some(
        msg => msg.ruleId === 'no-const-assign'
      );
      
      if (hasConstAssignmentError) {
        filesWithConstAssignmentErrors.add(result.filePath);
      }
    });
    
    return Array.from(filesWithConstAssignmentErrors);
  } catch (error) {
    console.error('Error getting files with errors:', error);
    return [];
  }
}

// Fix const assignment errors in a file
function fixConstAssignmentErrorsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Get the lines with const assignment errors using eslint
    const output = execSync(`yarn eslint --config eslint.config.cjs "${filePath}" --format json`)
      .toString()
      .trim();
    
    const results = JSON.parse(output);
    const errors = results.find(r => r.filePath === filePath)?.messages || [];
    
    // Filter for const assignment errors and get the line numbers
    const constAssignmentErrors = errors
      .filter(error => error.ruleId === 'no-const-assign')
      .map(error => error.line);
    
    if (constAssignmentErrors.length === 0) {
      return false;
    }
    
    // Split content into lines
    const lines = content.split('\n');
    
    // Track if we made any changes
    let madeChanges = false;
    
    // Fix each line with a const assignment error
    constAssignmentErrors.forEach(lineNum => {
      const line = lines[lineNum - 1];
      
      // Replace 'const' with 'let' only if it's a variable declaration
      if (line.match(/^\s*const\s+([a-zA-Z0-9_$]+)\s*=/)) {
        lines[lineNum - 1] = line.replace(/\bconst\b/, 'let');
        madeChanges = true;
      }
    });
    
    if (madeChanges) {
      // Write the fixed content back to the file
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`Fixed const assignment errors in ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error fixing file ${filePath}:`, error);
    return false;
  }
}

// Main function
function main() {
  console.log('Finding files with const assignment errors...');
  const files = getFilesWithConstAssignmentErrors();
  
  if (files.length === 0) {
    console.log('No files with const assignment errors found.');
    return;
  }
  
  console.log(`Found ${files.length} files with const assignment errors.`);
  
  let fixedCount = 0;
  
  files.forEach(filePath => {
    const fixed = fixConstAssignmentErrorsInFile(filePath);
    if (fixed) {
      fixedCount++;
    }
  });
  
  console.log(`Fixed const assignment errors in ${fixedCount} files.`);
}

main(); 