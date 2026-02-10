#!/usr/bin/env node

/**
 * Fix Malformed Test Syntax Script
 *
 * Fixes specific malformed patterns in test files:
 * - `: any, (: any) =>` should be `(`
 * - `{, property:` should be `{ property:`
 * - `property?.value` should be `property.value`
 * - Other corrupted syntax patterns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing malformed test syntax patterns...');

// Get all TypeScript test files with errors
const testFiles = [
  'src/utils/cuisineResolver.test.ts',
  'src/utils/elementalUtils.test.ts',
  'src/utils/validatePlanetaryPositions.test.ts'
];

let totalFixes = 0;

for (const filePath of testFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }

  console.log(`\n📝 Processing ${filePath}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed function signatures: `: any, (: any) =>` -> `(`
  content = content.replace(/: any, \(: any\) =>/g, '(');
  if (content !== originalContent) {
    const matches = (originalContent.match(/: any, \(: any\) =>/g) || []).length;
    fileFixes += matches;
    console.log(`  ✅ Fixed ${matches} malformed function signatures`);
  }

  // Fix malformed object literals: `{, property:` -> `{ property:`
  content = content.replace(/\{\s*,\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '{ $1:');
  const objectMatches = (originalContent.match(/\{\s*,\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/g) || []).length;
  if (objectMatches > 0) {
    fileFixes += objectMatches;
    console.log(`  ✅ Fixed ${objectMatches} malformed object literals`);
  }

  // Fix malformed optional chaining: `property?.value` -> `property.value` (in simple cases)
  content = content.replace(/(\w+)\?\.(25|5|000001)/g, '$1.$2');
  const chainMatches = (originalContent.match(/\w+\?\.(25|5|000001)/g) || []).length;
  if (chainMatches > 0) {
    fileFixes += chainMatches;
    console.log(`  ✅ Fixed ${chainMatches} malformed optional chains`);
  }

  // Fix malformed property assignments: `,;` -> `,`
  content = content.replace(/,\s*;/g, ',');
  const semicolonMatches = (originalContent.match(/,\s*;/g) || []).length;
  if (semicolonMatches > 0) {
    fileFixes += semicolonMatches;
    console.log(`  ✅ Fixed ${semicolonMatches} malformed property assignments`);
  }

  // Fix jest mock patterns: `jest?.mock('path': any, (: any) =>` -> `jest.mock('path', () =>`
  content = content.replace(/jest\?\.mock\('([^']+)': any, \(: any\) =>/g, "jest.mock('$1', () =>");
  const jestMatches = (originalContent.match(/jest\?\.mock\('[^']+': any, \(: any\) =>/g) || []).length;
  if (jestMatches > 0) {
    fileFixes += jestMatches;
    console.log(`  ✅ Fixed ${jestMatches} malformed jest.mock patterns`);
  }

  // Fix beforeEach/afterEach patterns: `beforeEach((: any) =>` -> `beforeEach(() =>`
  content = content.replace(/(beforeEach|afterEach)\(\(: any\) =>/g, '$1(() =>');
  const hookMatches = (originalContent.match(/(beforeEach|afterEach)\(\(: any\) =>/g) || []).length;
  if (hookMatches > 0) {
    fileFixes += hookMatches;
    console.log(`  ✅ Fixed ${hookMatches} malformed test hook patterns`);
  }

  // Fix test function patterns: `test('description': any, (: any) =>` -> `test('description', () =>`
  content = content.replace(/(test|it)\('([^']+)': any, \(: any\) =>/g, "$1('$2', () =>");
  const testMatches = (originalContent.match(/(test|it)\('[^']+': any, \(: any\) =>/g) || []).length;
  if (testMatches > 0) {
    fileFixes += testMatches;
    console.log(`  ✅ Fixed ${testMatches} malformed test function patterns`);
  }

  // Fix describe patterns: `describe('description': any, (: any) =>` -> `describe('description', () =>`
  content = content.replace(/describe\('([^']+)': any, \(: any\) =>/g, "describe('$1', () =>");
  const describeMatches = (originalContent.match(/describe\('[^']+': any, \(: any\) =>/g) || []).length;
  if (describeMatches > 0) {
    fileFixes += describeMatches;
    console.log(`  ✅ Fixed ${describeMatches} malformed describe patterns`);
  }

  if (fileFixes > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  📁 Saved ${filePath} with ${fileFixes} fixes`);
    totalFixes += fileFixes;
  } else {
    console.log(`  ✨ No fixes needed for ${filePath}`);
  }
}

console.log(`\n🎉 Total fixes applied: ${totalFixes}`);

// Validate the fixes
console.log('\n🔍 Validating fixes...');
try {
  execSync('yarn tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.log('⚠️  Some TypeScript errors remain, but syntax should be improved');
}

console.log('\n✅ Malformed test syntax fix completed!');
