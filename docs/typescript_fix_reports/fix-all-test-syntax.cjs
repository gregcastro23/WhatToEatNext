#!/usr/bin/env node

/**
 * Fix All Test Syntax Script
 *
 * Systematically fixes malformed patterns in all test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing syntax in all test files...');

// Get all test files
function getAllTestFiles() {
  try {
    const output = execSync('find src -name "*.test.ts" -o -name "*.test.tsx"', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f.trim());
  } catch (error) {
    return [];
  }
}

const testFiles = getAllTestFiles();
console.log(`📁 Found ${testFiles.length} test files to process`);

let totalFixes = 0;
let processedFiles = 0;

for (const filePath of testFiles) {
  if (!fs.existsSync(filePath)) continue;

  console.log(`📝 Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed function signatures: `: any, (: any) =>` -> `(`
  const sigMatches = (content.match(/: any, \(: any\) =>/g) || []).length;
  content = content.replace(/: any, \(: any\) =>/g, '(');
  fileFixes += sigMatches;
  if (sigMatches > 0) console.log(`  ✅ Fixed ${sigMatches} function signatures`);

  // Fix malformed object literals: `{, property:` -> `{ property:`
  const objMatches = (content.match(/\{\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g) || []).length;
  content = content.replace(/\{\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ $1:');
  fileFixes += objMatches;
  if (objMatches > 0) console.log(`  ✅ Fixed ${objMatches} object literals`);

  // Fix malformed optional chaining in numbers: `0?.25` -> `0.25`
  const chainMatches = (content.match(/(\d+)\?\.(\d+)/g) || []).length;
  content = content.replace(/(\d+)\?\.(\d+)/g, '$1.$2');
  fileFixes += chainMatches;
  if (chainMatches > 0) console.log(`  ✅ Fixed ${chainMatches} optional chains`);

  // Fix malformed property assignments: `,;` -> `,`
  const semiMatches = (content.match(/,\s*;/g) || []).length;
  content = content.replace(/,\s*;/g, ',');
  fileFixes += semiMatches;
  if (semiMatches > 0) console.log(`  ✅ Fixed ${semiMatches} property assignments`);

  // Fix jest mock patterns
  const jestMatches = (content.match(/jest\?\.mock\('([^']+)': any, \(: any\) =>/g) || []).length;
  content = content.replace(/jest\?\.mock\('([^']+)': any, \(: any\) =>/g, "jest.mock('$1', () =>");
  fileFixes += jestMatches;
  if (jestMatches > 0) console.log(`  ✅ Fixed ${jestMatches} jest.mock patterns`);

  // Fix test hooks
  const hookMatches = (content.match(/(beforeEach|afterEach)\(\(: any\) =>/g) || []).length;
  content = content.replace(/(beforeEach|afterEach)\(\(: any\) =>/g, '$1(() =>');
  fileFixes += hookMatches;
  if (hookMatches > 0) console.log(`  ✅ Fixed ${hookMatches} test hooks`);

  // Fix test functions
  const testMatches = (content.match(/(test|it)\('([^']+)': any, \(: any\) =>/g) || []).length;
  content = content.replace(/(test|it)\('([^']+)': any, \(: any\) =>/g, "$1('$2', () =>");
  fileFixes += testMatches;
  if (testMatches > 0) console.log(`  ✅ Fixed ${testMatches} test functions`);

  // Fix describe blocks
  const descMatches = (content.match(/describe\('([^']+)': any, \(: any\) =>/g) || []).length;
  content = content.replace(/describe\('([^']+)': any, \(: any\) =>/g, "describe('$1', () =>");
  fileFixes += descMatches;
  if (descMatches > 0) console.log(`  ✅ Fixed ${descMatches} describe blocks`);

  // Fix malformed expect calls: `expect(value as any)` -> `expect(value)`
  const expectMatches = (content.match(/expect\(([^)]+) as any\)/g) || []).length;
  content = content.replace(/expect\(([^)]+) as any\)/g, 'expect($1)');
  fileFixes += expectMatches;
  if (expectMatches > 0) console.log(`  ✅ Fixed ${expectMatches} expect calls`);

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, content);
    totalFixes += fileFixes;
    processedFiles++;
    console.log(`  📁 Saved with ${fileFixes} fixes`);
  } else {
    console.log(`  ✨ No fixes needed`);
  }
}

console.log(`\n🎉 Test syntax fix completed!`);
console.log(`📊 Files processed: ${processedFiles}`);
console.log(`🔧 Total fixes applied: ${totalFixes}`);

// Check progress
console.log('\n🔍 Checking TypeScript compilation...');
try {
  const result = execSync('yarn tsc --noEmit --skipLibCheck 2>&1 | grep -c "error TS" || echo "0"', { encoding: 'utf8' });
  const errorCount = parseInt(result.trim());
  console.log(`📊 Current TypeScript errors: ${errorCount}`);

  if (errorCount < 30000) {
    console.log('🎉 Significant progress made!');
  }
} catch (error) {
  console.log('⚠️  Could not get error count');
}
