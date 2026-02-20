#!/usr/bin/env node

/**
 * Targeted Syntax Error Fixer
 * Fixes specific syntax errors found in ESLint output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting targeted syntax error fixes...');

// Get all TypeScript test files
function getTestFiles() {
  try {
    const output = execSync('find src/__tests__ -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' });
    return output.trim().split('\n').filter(f => f.trim());
  } catch (error) {
    return [];
  }
}

const files = getTestFiles();
console.log(`📁 Found ${files.length} test files to process`);

let totalFixes = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileFixes = 0;

  // Fix malformed property access: .property.[index] -> .property[index]
  const beforeProp = content;
  content = content.replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\.\[/g, '.$1[');
  const propFixes = (beforeProp.match(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\.\[/g) || []).length;
  fileFixes += propFixes;

  // Fix missing colons in object destructuring: {property} -> {property:}
  // This is more complex, let's skip for now

  // Fix malformed template literals (unclosed)
  const beforeTemplate = content;
  // Look for lines ending with unclosed template literals
  content = content.replace(/`[^`]*$/gm, (match) => {
    if (match.includes('${') && !match.includes('}')) {
      return match + '`';
    }
    return match;
  });
  const templateFixes = (beforeTemplate.match(/`[^`]*$/gm) || []).length;
  fileFixes += templateFixes;

  // Fix missing commas in function parameters
  const beforeComma = content;
  content = content.replace(/\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*\)/g, '($1: any, $2: any)');
  const commaFixes = (beforeComma.match(/\(\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*any\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*any\s*\)/g) || []).length;
  fileFixes += commaFixes;

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileFixes} issues in ${filePath}`);
    totalFixes += fileFixes;
  }
}

console.log(`\n🎉 Targeted syntax fix completed!`);
console.log(`🔧 Total fixes applied: ${totalFixes}`);

// Check if ESLint can now run without fatal errors
console.log('\n🔍 Testing ESLint after fixes...');
try {
  execSync('yarn lint --format=compact 2>&1 | head -5', { encoding: 'utf8', stdio: 'inherit' });
} catch (error) {
  console.log('ESLint still has issues, but continuing...');
}
