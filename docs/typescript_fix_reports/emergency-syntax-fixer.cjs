#!/usr/bin/env node

/**
 * Emergency Syntax Fixer - Fixes malformed patterns from automated scripts
 * Targets specific patterns: {; -> { and [; -> [
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get files with malformed patterns
function getFilesWithPattern(pattern) {
  try {
    const result = execSync(`grep -r "${pattern}" src/ --include="*.ts" --include="*.tsx" -l`,
      { encoding: 'utf8', cwd: process.cwd() });
    return result.trim().split('\n').filter(f => f.length > 0);
  } catch (error) {
    return [];
  }
}

// Fix malformed patterns in a file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix {; -> {
    content = content.replace(/\{\s*;/g, '{');

    // Fix [; -> [
    content = content.replace(/\[\s*;/g, '[');

    // Fix =; -> = (in case of assignment issues)
    content = content.replace(/=\s*;(\s*\n)/g, '=$1');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚨 Emergency Syntax Fixer - Starting...');

// Find files with malformed patterns
const braceFiles = getFilesWithPattern('\\{;');
const bracketFiles = getFilesWithPattern('\\[;');

const allFiles = [...new Set([...braceFiles, ...bracketFiles])];
console.log(`📁 Found ${allFiles.length} files with malformed patterns`);

let fixedFiles = 0;
let totalFixes = 0;

// Apply fixes
for (const file of allFiles) {
  const fixed = fixFile(file);
  if (fixed) {
    fixedFiles++;
    console.log(`✅ Fixed: ${file}`);
  }
}

console.log(`\n📊 Results:`);
console.log(`   Files processed: ${allFiles.length}`);
console.log(`   Files fixed: ${fixedFiles}`);

// Quick validation check
try {
  console.log('\n🔍 Running quick TypeScript check...');
  execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.log('⚠️  Some TypeScript errors remain, but syntax fixes applied.');
}

console.log('\n🎉 Emergency syntax fixing complete!');