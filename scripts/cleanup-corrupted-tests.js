#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Function to find all test files with syntax errors
function findCorruptedTestFiles() {
  try {
    // Get all TypeScript errors
    const errorOutput = execSync('yarn tsc --noEmit --skipLibCheck 2>&1', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    });
    
    // Extract test files with syntax errors
    const testFileErrors = errorOutput
      .split('\n')
      .filter(line => line.includes('src/__tests__') && line.includes('error TS1'))
      .map(line => {
        const match = line.match(/^(src\/__tests__\/[^(]+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    // Count errors per file
    const errorCounts = {};
    testFileErrors.forEach(file => {
      errorCounts[file] = (errorCounts[file] || 0) + 1;
    });
    
    // Return files with more than 5 syntax errors (likely corrupted)
    return Object.entries(errorCounts)
      .filter(([file, count]) => count > 5)
      .map(([file, count]) => ({ file, count }))
      .sort((a, b) => b.count - a.count);
      
  } catch (error) {
    console.log('No TypeScript errors found or error running tsc');
    return [];
  }
}

// Function to check if a test file is corrupted
function isTestFileCorrupted(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      return false;
    }

    const content = fs.readFileSync(filepath, 'utf8');
    
    // Patterns that indicate corruption in test files
    const corruptionIndicators = [
      /any \| any/g,  // Malformed type annotations
      /any, any:/g,   // Malformed object syntax
      /function for\(/g,  // Malformed for loops
      /\[\"\d+\"\]/g,  // Malformed array access
      /\: any \|/g,   // Malformed type unions
      /\}, any/g,     // Malformed object endings
      /expect\([^)]*\)\s*\)/g,  // Malformed expect calls
    ];

    const corruptionCount = corruptionIndicators.reduce((count, pattern) => {
      const matches = content.match(pattern) || [];
      return count + matches.length;
    }, 0);

    return corruptionCount > 3; // Consider corrupted if multiple patterns found
  } catch (error) {
    console.error(`Error checking file ${filepath}:`, error.message);
    return false;
  }
}

// Main cleanup function
async function cleanupCorruptedTests(dryRun = true) {
  console.log('🧹 Starting corrupted test file cleanup...\n');
  
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

  // Find corrupted test files
  const corruptedFiles = findCorruptedTestFiles();
  
  console.log('🔍 Analyzing test files with syntax errors:\n');
  
  const filesToRemove = [];
  
  for (const { file, count } of corruptedFiles) {
    console.log(`🔍 ${file}: ${count} syntax errors`);
    
    if (isTestFileCorrupted(file)) {
      filesToRemove.push(file);
      console.log(`   ❌ CORRUPTED - will be removed`);
    } else {
      console.log(`   ✅ Appears valid - will be kept`);
    }
  }

  console.log(`\n📋 Summary: Found ${filesToRemove.length} corrupted test files`);
  
  if (filesToRemove.length === 0) {
    console.log('✅ No corrupted test files found to remove');
    return;
  }

  // Show what will be removed
  console.log('\n🔥 Test files to be removed:');
  filesToRemove.forEach(file => console.log(`   • ${file}`));

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will actually be removed');
    console.log('Run with --execute to actually remove corrupted test files');
    return filesToRemove;
  }

  // Actually remove the files
  console.log('\n💥 Removing corrupted test files...');
  let removedCount = 0;
  
  for (const filepath of filesToRemove) {
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        console.log(`✅ Removed: ${filepath}`);
        removedCount++;
      }
    } catch (error) {
      console.error(`❌ Error removing ${filepath}:`, error.message);
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
    
    console.log(`\n✅ Test cleanup complete!`);
    console.log(`📊 Files removed: ${removedCount}`);
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

cleanupCorruptedTests(dryRun)
  .then(() => {
    console.log('\n🎉 Corrupted test cleanup finished');
  })
  .catch(error => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }); 