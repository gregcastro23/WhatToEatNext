#!/usr/bin/env node

/**
 * Fix Test Function Syntax
 *
 * Fixes the specific issue where function signatures were over-corrected
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing test function syntax...');

// Get all test files that were processed
function getAllTestFiles() {
  try {
    const output = execSync('find src -name "*.test.ts" -o -name "*.test.tsx"', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f.trim());
  } catch (error) {
    return [];
  }
}

const testFiles = getAllTestFiles();
console.log(`📁 Found ${testFiles.length} test files to fix`);

let totalFixes = 0;
let processedFiles = 0;

for (const filePath of testFiles) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed function calls: `describe('name'(` -> `describe('name', () =>`
  const describeMatches = (content.match(/describe\('([^']+)'\(/g) || []).length;
  content = content.replace(/describe\('([^']+)'\(/g, "describe('$1', () =>");
  fileFixes += describeMatches;

  // Fix malformed test calls: `test('name'(` -> `test('name', () =>`
  const testMatches = (content.match(/(test|it)\('([^']+)'\(/g) || []).length;
  content = content.replace(/(test|it)\('([^']+)'\(/g, "$1('$2', () =>");
  fileFixes += testMatches;

  // Fix malformed beforeEach/afterEach: `beforeEach((` -> `beforeEach(() =>`
  const hookMatches = (content.match(/(beforeEach|afterEach)\(\(/g) || []).length;
  content = content.replace(/(beforeEach|afterEach)\(\(/g, '$1(() =>');
  fileFixes += hookMatches;

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, content);
    totalFixes += fileFixes;
    processedFiles++;

    if (processedFiles <= 10) {
      console.log(`📝 Fixed ${fileFixes} issues in ${filePath}`);
    }
  }
}

console.log(`\n🎉 Function syntax fix completed!`);
console.log(`📊 Files processed: ${processedFiles}`);
console.log(`🔧 Total fixes applied: ${totalFixes}`);

// Check progress
console.log('\n🔍 Checking TypeScript compilation...');
try {
  const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
  const errorCount = parseInt(result.trim());
  console.log(`📊 Current TypeScript errors: ${errorCount}`);
} catch (error) {
  console.log('⚠️  Could not get error count');
}
