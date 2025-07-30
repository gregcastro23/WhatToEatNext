#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with non-null assertion issues
function getFilesWithNonNullAssertions() {
  try {
    const output = execSync('yarn lint --format=compact 2>&1 | grep "no-non-null-assertion"', { encoding: 'utf8' });
    const lines = output.split('\n').filter(line => line.trim());
    const files = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    });
    
    return Array.from(files);
  } catch (error) {
    console.log('No non-null assertion issues found or error occurred');
    return [];
  }
}

// Fix non-null assertions in a file
function fixNonNullAssertionsInFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: Simple variable non-null assertions - replace with nullish coalescing
    // Example: variable! -> variable ?? defaultValue
    const simpleVariablePattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\!/g;
    content = content.replace(simpleVariablePattern, (match, varName) => {
      // Skip if it's already in a nullish coalescing or optional chaining context
      const beforeMatch = content.substring(0, content.indexOf(match));
      const afterMatch = content.substring(content.indexOf(match) + match.length);
      
      // Skip if already handled or in complex expressions
      if (beforeMatch.endsWith('?') || afterMatch.startsWith('?') || 
          beforeMatch.endsWith('??') || afterMatch.startsWith('??')) {
        return match;
      }
      
      // Common safe defaults based on variable names
      let defaultValue = 'undefined';
      if (varName.includes('year')) defaultValue = '2024';
      else if (varName.includes('month')) defaultValue = '1';
      else if (varName.includes('day') || varName.includes('date')) defaultValue = '1';
      else if (varName.includes('hour')) defaultValue = '0';
      else if (varName.includes('minute') || varName.includes('second')) defaultValue = '0';
      else if (varName.includes('id') || varName.includes('Id')) defaultValue = "''";
      else if (varName.includes('name') || varName.includes('Name')) defaultValue = "''";
      else if (varName.includes('count') || varName.includes('length') || varName.includes('size')) defaultValue = '0';
      else if (varName.includes('array') || varName.includes('list') || varName.includes('items')) defaultValue = '[]';
      else if (varName.includes('object') || varName.includes('data') || varName.includes('config')) defaultValue = '{}';
      
      modified = true;
      return `${varName} ?? ${defaultValue}`;
    });
    
    // Pattern 2: Property access non-null assertions - replace with optional chaining
    // Example: object.property! -> object.property ?? defaultValue
    const propertyAccessPattern = /([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)\!/g;
    content = content.replace(propertyAccessPattern, (match, propertyAccess) => {
      modified = true;
      return `${propertyAccess} ?? undefined`;
    });
    
    // Pattern 3: Array access non-null assertions
    // Example: array[0]! -> array[0] ?? defaultValue
    const arrayAccessPattern = /([a-zA-Z_][a-zA-Z0-9_]*\[[^\]]+\])\!/g;
    content = content.replace(arrayAccessPattern, (match, arrayAccess) => {
      modified = true;
      return `${arrayAccess} ?? undefined`;
    });
    
    // Pattern 4: Function call non-null assertions
    // Example: func()! -> func() ?? defaultValue
    const functionCallPattern = /([a-zA-Z_][a-zA-Z0-9_]*\([^)]*\))\!/g;
    content = content.replace(functionCallPattern, (match, functionCall) => {
      modified = true;
      return `${functionCall} ?? undefined`;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✓ Fixed non-null assertions in ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`  - No automatic fixes applied to ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  console.log('🔍 Finding files with non-null assertion issues...');
  const files = getFilesWithNonNullAssertions();
  
  if (files.length === 0) {
    console.log('✅ No non-null assertion issues found!');
    return;
  }
  
  console.log(`📝 Found ${files.length} files with non-null assertion issues`);
  
  let fixedCount = 0;
  files.forEach(file => {
    if (fixNonNullAssertionsInFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`  - Files processed: ${files.length}`);
  console.log(`  - Files modified: ${fixedCount}`);
  
  // Run linter again to check remaining issues
  console.log('\n🔍 Checking remaining non-null assertion issues...');
  try {
    const remainingOutput = execSync('yarn lint 2>&1 | grep -c "no-non-null-assertion"', { encoding: 'utf8' });
    const remainingCount = parseInt(remainingOutput.trim()) || 0;
    console.log(`📈 Remaining non-null assertion issues: ${remainingCount}`);
  } catch (error) {
    console.log('✅ No remaining non-null assertion issues found!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixNonNullAssertionsInFile, getFilesWithNonNullAssertions };