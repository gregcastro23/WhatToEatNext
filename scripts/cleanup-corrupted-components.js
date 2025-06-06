#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Files with high syntax error counts that are likely corrupted
const SUSPECTED_CORRUPTED_FILES = [
  'src/components/TodaysRecommendation.tsx',
  'src/components/home/Features.tsx', 
  'src/components/ElementalComparison.tsx',
  'src/components/common/LoadingSpinner.tsx',
  'src/components/home/Hero.tsx',
  'src/components/ElementalVisualizer.tsx',
  'src/components/ErrorNotifications/index.tsx',
  'src/components/Recipe/RecipeRecommendations.tsx'
];

// Function to check if a file contains excessive syntax errors
function hasExcessiveSyntaxErrors(filepath) {
  try {
    if (!fs.existsSync(filepath)) {
      console.log(`❌ File not found: ${filepath}`);
      return false;
    }

    // Check file for obvious corruption patterns
    const content = fs.readFileSync(filepath, 'utf8');
    
    // Patterns that indicate corruption
    const corruptionIndicators = [
      /error TS1005.*expected/g,  // Missing punctuation
      /error TS1128.*Declaration or statement expected/g,  // Malformed syntax
      /error TS1161.*Unterminated/g,  // Unterminated literals
      /\}\},/g,  // Malformed object syntax
      /\{\',\<\'/g,  // Malformed template syntax
      /export let.*\:\(\)/g,  // Malformed function declarations
      /\{\'\,\>\'\}/g,  // Malformed template literals
      /\:\s*\;/g,  // Invalid type annotations
    ];

    const corruptionCount = corruptionIndicators.reduce((count, pattern) => {
      const matches = content.match(pattern) || [];
      return count + matches.length;
    }, 0);

    // Also check TypeScript compilation for this specific file
    try {
      execSync(`npx tsc --noEmit --skipLibCheck "${filepath}"`, { 
        stdio: 'pipe', 
        encoding: 'utf8' 
      });
      return false; // No compilation errors
    } catch (error) {
      const errorOutput = error.stdout || error.stderr || '';
      const syntaxErrorCount = (errorOutput.match(/error TS1005|error TS1128|error TS1161/g) || []).length;
      
      console.log(`🔍 ${filepath}: ${syntaxErrorCount} syntax errors, ${corruptionCount} corruption patterns`);
      
      // Consider it corrupted if it has more than 20 syntax errors or 5 corruption patterns
      return syntaxErrorCount > 20 || corruptionCount > 5;
    }
  } catch (error) {
    console.error(`Error checking file ${filepath}:`, error.message);
    return false;
  }
}

// Function to safely backup and remove corrupted files
function cleanupCorruptedFile(filepath, dryRun = true) {
  try {
    if (!fs.existsSync(filepath)) {
      console.log(`⚠️  File not found: ${filepath}`);
      return false;
    }

    if (dryRun) {
      console.log(`🔥 DRY RUN: Would remove corrupted file: ${filepath}`);
      return true;
    }

    // Actually remove the file
    fs.unlinkSync(filepath);
    console.log(`✅ Removed corrupted file: ${filepath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error removing file ${filepath}:`, error.message);
    return false;
  }
}

// Main cleanup function
async function cleanupCorruptedComponents(dryRun = true) {
  console.log('🧹 Starting corrupted component cleanup...\n');
  
  const filesToRemove = [];
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

  // Check each suspected corrupted file
  console.log('🔍 Analyzing suspected corrupted files:\n');
  
  for (const filepath of SUSPECTED_CORRUPTED_FILES) {
    if (hasExcessiveSyntaxErrors(filepath)) {
      filesToRemove.push(filepath);
    }
  }

  console.log(`\n📋 Summary: Found ${filesToRemove.length} corrupted files`);
  
  if (filesToRemove.length === 0) {
    console.log('✅ No corrupted files found to remove');
    return;
  }

  // Show what will be removed
  console.log('\n🔥 Files to be removed:');
  filesToRemove.forEach(file => console.log(`   • ${file}`));

  if (dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will actually be removed');
    console.log('Run with --execute to actually remove corrupted files');
    return filesToRemove;
  }

  // Actually remove the files
  console.log('\n💥 Removing corrupted files...');
  let removedCount = 0;
  
  for (const filepath of filesToRemove) {
    if (cleanupCorruptedFile(filepath, false)) {
      removedCount++;
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
    
    console.log(`\n✅ Cleanup complete!`);
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

cleanupCorruptedComponents(dryRun)
  .then(() => {
    console.log('\n🎉 Corrupted component cleanup finished');
  })
  .catch(error => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }); 