#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Function to find files with JSX fragment errors
function findJSXFragmentErrors() {
  try {
    const errorOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    
    // Extract files with JSX fragment errors
    const jsxErrors = errorOutput
      .split('\n')
      .filter(line => line.includes('error TS2657: JSX expressions must have one parent element'))
      .map(line => {
        const match = line.match(/^([^(]+)\((\d+),(\d+)\):/);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3])
          };
        }
        return null;
      })
      .filter(Boolean);
    
    // Group by file
    const fileErrors = {};
    jsxErrors.forEach(error => {
      if (!fileErrors[error.file]) {
        fileErrors[error.file] = [];
      }
      fileErrors[error.file].push(error);
    });
    
    return fileErrors;
  } catch (error) {
    console.log('No TypeScript errors found or error running tsc');
    return {};
  }
}

// Function to fix JSX fragments in a file
function fixJSXFragments(filepath, dryRun = true) {
  try {
    if (!fs.existsSync(filepath)) {
      console.log(`❌ File not found: ${filepath}`);
      return false;
    }

    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    // Look for common JSX fragment patterns that need fixing
    let modified = false;
    let newLines = [...lines];
    
    // Pattern 1: Multiple JSX elements at return statement
    for (let i = 0; i < newLines.length; i++) {
      const line = newLines[i];
      
      // Look for return statements with JSX
      if (line.trim().startsWith('return (') || line.trim() === 'return (') {
        // Check if there are multiple JSX elements
        let openTags = 0;
        let closeTags = 0;
        let jsxElements = 0;
        let inJSX = false;
        
        for (let j = i; j < newLines.length; j++) {
          const currentLine = newLines[j];
          
          // Count JSX elements (simplified detection)
          const jsxTagMatches = currentLine.match(/<[^/][^>]*>/g) || [];
          const closingTagMatches = currentLine.match(/<\/[^>]*>/g) || [];
          
          jsxTagMatches.forEach(tag => {
            if (!tag.includes('</') && !tag.endsWith('/>')) {
              openTags++;
              if (openTags === 1) jsxElements++;
            }
          });
          
          closingTagMatches.forEach(() => {
            closeTags++;
          });
          
          // Self-closing tags
          const selfClosingMatches = currentLine.match(/<[^>]*\/>/g) || [];
          selfClosingMatches.forEach(() => {
            jsxElements++;
          });
          
          // End of return statement
          if (currentLine.includes(');') && openTags === closeTags) {
            break;
          }
        }
        
        // If multiple JSX elements detected, wrap in fragment
        if (jsxElements > 1) {
          // Find the actual JSX content
          let returnStart = i;
          let returnEnd = i;
          
          // Find the end of the return statement
          for (let j = i; j < newLines.length; j++) {
            if (newLines[j].includes(');')) {
              returnEnd = j;
              break;
            }
          }
          
          // Wrap in React fragment
          if (returnStart < returnEnd) {
            // Add fragment start after return (
            const returnLine = newLines[returnStart];
            const returnMatch = returnLine.match(/^(\s*return\s*\()/);
            if (returnMatch) {
              newLines[returnStart] = returnLine.replace(/^(\s*return\s*\()/, '$1<>');
              
              // Add fragment end before );
              const endLine = newLines[returnEnd];
              newLines[returnEnd] = endLine.replace(/(\s*\);?\s*)$/, '</>$1');
              
              modified = true;
              console.log(`🔧 Fixed JSX fragment in ${filepath} at lines ${returnStart + 1}-${returnEnd + 1}`);
            }
          }
        }
      }
    }
    
    if (!modified) {
      console.log(`✅ No JSX fragment issues found in ${filepath}`);
      return false;
    }
    
    if (dryRun) {
      console.log(`🔥 DRY RUN: Would fix JSX fragments in ${filepath}`);
      return true;
    }
    
    // Write the fixed content
    fs.writeFileSync(filepath, newLines.join('\n'));
    console.log(`✅ Fixed JSX fragments in ${filepath}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error fixing JSX fragments in ${filepath}:`, error.message);
    return false;
  }
}

// Main function
async function fixJSXFragmentErrors(dryRun = true) {
  console.log('🔧 Starting JSX fragment fixes...\n');
  
  let totalErrorsBefore = 0;

  // Get initial error count
  try {
    const errorOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    totalErrorsBefore = parseInt(errorOutput.trim());
    console.log(`📊 Current TypeScript errors: ${totalErrorsBefore}\n`);
  } catch (error) {
    console.log('Could not get initial error count');
  }

  // Find JSX fragment errors
  const fileErrors = findJSXFragmentErrors();
  const filesToFix = Object.keys(fileErrors);
  
  console.log(`🔍 Found JSX fragment errors in ${filesToFix.length} files:\n`);
  
  if (filesToFix.length === 0) {
    console.log('✅ No JSX fragment errors found to fix');
    return;
  }

  // Show what will be fixed
  filesToFix.forEach(file => {
    const errors = fileErrors[file];
    console.log(`   • ${file} (${errors.length} errors)`);
  });

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will actually be modified');
    console.log('Run with --execute to actually fix JSX fragments');
    return;
  }

  // Actually fix the files
  console.log('\n🔧 Fixing JSX fragments...');
  let fixedCount = 0;
  
  for (const filepath of filesToFix) {
    if (fixJSXFragments(filepath, false)) {
      fixedCount++;
    }
  }

  // Get new error count
  try {
    const errorOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS"', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    const totalErrorsAfter = parseInt(errorOutput.trim());
    const errorReduction = totalErrorsBefore - totalErrorsAfter;
    
    console.log(`\n✅ JSX fragment fixes complete!`);
    console.log(`📊 Files fixed: ${fixedCount}`);
    console.log(`📉 Errors before: ${totalErrorsBefore}`);
    console.log(`📉 Errors after: ${totalErrorsAfter}`);
    console.log(`🎯 Error reduction: ${errorReduction}`);
  } catch (error) {
    console.log('Could not get final error count');
  }
}

// CLI execution
const args = process.argv.slice(2);
const dryRun = !args.includes('--execute');

fixJSXFragmentErrors(dryRun)
  .then(() => {
    console.log('\n🎉 JSX fragment fixes finished');
  })
  .catch(error => {
    console.error('❌ Error during JSX fixes:', error);
    process.exit(1);
  }); 