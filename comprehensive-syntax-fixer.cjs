#!/usr/bin/env node

/**
 * Comprehensive Syntax Fixer
 *
 * Fixes widespread malformed patterns across all TypeScript files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive syntax fix...');

// Get all TypeScript files with errors
function getAllTSFiles() {
  try {
    const output = execSync('find src -name "*.ts" -o -name "*.tsx" | head -50', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f.trim());
  } catch (error) {
    return [];
  }
}

const files = getAllTSFiles();
console.log(`📁 Found ${files.length} TypeScript files to process`);

let totalFixes = 0;
let processedFiles = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed function signatures: `: any, (: any) =>` -> `(`
  const beforeSig = content;
  content = content.replace(/: any, \(: any\) =>/g, '(');
  const sigFixes = (beforeSig.match(/: any, \(: any\) =>/g) || []).length;
  fileFixes += sigFixes;

  // Fix malformed object literals: `{, property:` -> `{ property:`
  const beforeObj = content;
  content = content.replace(/\{\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ $1:');
  const objFixes = (beforeObj.match(/\{\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/g) || []).length;
  fileFixes += objFixes;

  // Fix malformed optional chaining in numbers: `0?.25` -> `0.25`
  const beforeChain = content;
  content = content.replace(/(\d+)\?\.(\d+)/g, '$1.$2');
  const chainFixes = (beforeChain.match(/\d+\?\.\d+/g) || []).length;
  fileFixes += chainFixes;

  // Fix malformed property assignments: `,;` -> `,`
  const beforeSemi = content;
  content = content.replace(/,\s*;/g, ',');
  const semiFixes = (beforeSemi.match(/,\s*;/g) || []).length;
  fileFixes += semiFixes;

  // Fix jest mock patterns
  const beforeJest = content;
  content = content.replace(/jest\?\.mock\('([^']+)': any, \(: any\) =>/g, "jest.mock('$1', () =>");
  const jestFixes = (beforeJest.match(/jest\?\.mock\('[^']+': any, \(: any\) =>/g) || []).length;
  fileFixes += jestFixes;

  // Fix test hooks
  const beforeHooks = content;
  content = content.replace(/(beforeEach|afterEach)\(\(: any\) =>/g, '$1(() =>');
  const hookFixes = (beforeHooks.match(/(beforeEach|afterEach)\(\(: any\) =>/g) || []).length;
  fileFixes += hookFixes;

  // Fix test functions
  const beforeTest = content;
  content = content.replace(/(test|it)\('([^']+)': any, \(: any\) =>/g, "$1('$2', () =>");
  const testFixes = (beforeTest.match(/(test|it)\('[^']+': any, \(: any\) =>/g) || []).length;
  fileFixes += testFixes;

  // Fix describe blocks
  const beforeDesc = content;
  content = content.replace(/describe\('([^']+)': any, \(: any\) =>/g, "describe('$1', () =>");
  const descFixes = (beforeDesc.match(/describe\('[^']+': any, \(: any\) =>/g) || []).length;
  fileFixes += descFixes;

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, content);
    totalFixes += fileFixes;
    processedFiles++;

    if (processedFiles % 10 === 0) {
      console.log(`📝 Processed ${processedFiles} files, ${totalFixes} total fixes`);
    }
  }
}

console.log(`\n🎉 Comprehensive syntax fix completed!`);
console.log(`📊 Files processed: ${processedFiles}`);
console.log(`🔧 Total fixes applied: ${totalFixes}`);

// Quick validation
console.log('\n🔍 Checking TypeScript compilation...');
try {
  const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
  const errorCount = parseInt(result.trim());
  console.log(`📊 Current TypeScript errors: ${errorCount}`);
} catch (error) {
  console.log('⚠️  Could not get error count');
}
