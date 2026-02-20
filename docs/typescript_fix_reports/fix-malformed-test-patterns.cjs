#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Fix malformed patterns in test files
 */

function getAllTestFiles() {
  try {
    const output = execSync('find ./src -name "*.test.*" -o -name "*.spec.*" | grep -v backup', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => file.trim());
  } catch (error) {
    console.log('No test files found or error occurred');
    return [];
  }
}

function fixMalformedPatterns(content) {
  let fixed = content;

  // Fix malformed jest.fn() patterns
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any\.mockReturnValue\(([^)]+)\)/g, 'jest.fn().mockReturnValue($1)');
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any\.mockResolvedValue\(([^)]+)\)/g, 'jest.fn().mockResolvedValue($1)');
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any\.mockRejectedValue\(([^)]+)\)/g, 'jest.fn().mockRejectedValue($1)');
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any\.mockImplementation\(([^)]+)\)/g, 'jest.fn().mockImplementation($1)');
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any,/g, 'jest.fn(),');
  fixed = fixed.replace(/jest\.fn\(\)\s+as\s+any$/gm, 'jest.fn()');

  // Fix malformed type assertions in mocks
  fixed = fixed.replace(/:\s*jest\.fn\(\)\s+as\s+any/g, ': jest.fn()');

  // Fix malformed arrow function syntax
  fixed = fixed.replace(/=>\s*\(\s*\)\s*=>/g, '=> () =>');

  // Fix malformed object destructuring
  fixed = fixed.replace(/\{\s*([^}]+)\s*\}\s*=\s*\{\s*\}/g, '{ $1 } = {} as any');

  // Fix malformed template literals
  fixed = fixed.replace(/`([^`]*)\$\{([^}]*)\}([^`]*)`/g, (match, before, expr, after) => {
    // Ensure proper template literal syntax
    return `\`${before}\${${expr}}${after}\``;
  });

  // Fix malformed async/await patterns
  fixed = fixed.replace(/await\s+([^(]+)\(\s*\)\s*\.\s*([^(]+)\(/g, '(await $1()).$2(');

  // Fix malformed expect statements
  fixed = fixed.replace(/expect\s*\(\s*([^)]+)\s*\)\s*\.\s*([^(]+)\s*\(\s*([^)]*)\s*\)\s*\.\s*([^(]+)\s*\(/g, 'expect($1).$2($3).$4(');

  // Fix malformed import statements
  fixed = fixed.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]\s*as\s*any/g, 'import { $1 } from \'$2\'');

  // Fix malformed export statements
  fixed = fixed.replace(/export\s*\{\s*([^}]+)\s*\}\s*as\s*any/g, 'export { $1 }');

  // Fix malformed function declarations
  fixed = fixed.replace(/function\s+([^(]+)\s*\(\s*([^)]*)\s*\)\s*:\s*any\s*\{/g, 'function $1($2): any {');

  // Fix malformed class declarations
  fixed = fixed.replace(/class\s+([^{]+)\s*\{\s*([^}]*)\s*\}\s*as\s*any/g, 'class $1 { $2 }');

  // Fix malformed interface declarations
  fixed = fixed.replace(/interface\s+([^{]+)\s*\{\s*([^}]*)\s*\}\s*as\s*any/g, 'interface $1 { $2 }');

  // Fix malformed type declarations
  fixed = fixed.replace(/type\s+([^=]+)\s*=\s*([^;]+);\s*as\s*any/g, 'type $1 = $2;');

  // Fix malformed variable declarations
  fixed = fixed.replace(/const\s+([^=]+)\s*=\s*([^;]+);\s*as\s*any/g, 'const $1 = $2 as any;');
  fixed = fixed.replace(/let\s+([^=]+)\s*=\s*([^;]+);\s*as\s*any/g, 'let $1 = $2 as any;');
  fixed = fixed.replace(/var\s+([^=]+)\s*=\s*([^;]+);\s*as\s*any/g, 'var $1 = $2 as any;');

  // Fix malformed array access
  fixed = fixed.replace(/\[([^\]]+)\]\s*as\s*any\s*\[([^\]]+)\]/g, '($1 as any)[$2]');

  // Fix malformed object access
  fixed = fixed.replace(/\.([^.\s]+)\s*as\s*any\s*\.([^.\s]+)/g, '($1 as any).$2');

  // Fix malformed conditional expressions
  fixed = fixed.replace(/\?\s*([^:]+)\s*:\s*([^;]+);\s*as\s*any/g, '? $1 : $2 as any;');

  // Fix malformed try-catch blocks
  fixed = fixed.replace(/catch\s*\(\s*([^)]+)\s*\)\s*as\s*any\s*\{/g, 'catch ($1) {');

  // Fix malformed for loops
  fixed = fixed.replace(/for\s*\(\s*([^)]+)\s*\)\s*as\s*any\s*\{/g, 'for ($1) {');

  // Fix malformed while loops
  fixed = fixed.replace(/while\s*\(\s*([^)]+)\s*\)\s*as\s*any\s*\{/g, 'while ($1) {');

  // Fix malformed if statements
  fixed = fixed.replace(/if\s*\(\s*([^)]+)\s*\)\s*as\s*any\s*\{/g, 'if ($1) {');

  return fixed;
}

function fixSyntaxErrors(content) {
  let fixed = content;

  // Fix missing commas in object literals
  fixed = fixed.replace(/(\w+):\s*([^,}\n]+)\s*(\w+):/g, '$1: $2, $3:');

  // Fix missing semicolons
  fixed = fixed.replace(/(\w+\s*=\s*[^;]+)\s*(\n\s*\w+)/g, '$1;$2');

  // Fix missing parentheses in function calls
  fixed = fixed.replace(/(\w+)\s*\(\s*([^)]*)\s*\)\s*\.\s*(\w+)\s*\(\s*([^)]*)\s*\)\s*\.\s*(\w+)\s*\(/g, '$1($2).$3($4).$5(');

  // Fix malformed string literals
  fixed = fixed.replace(/(['"])[^'"]*\1\s*\+\s*(['"])[^'"]*\2/g, (match) => {
    // Combine adjacent string literals
    return match.replace(/\s*\+\s*/g, '');
  });

  // Fix malformed regular expressions
  fixed = fixed.replace(/\/([^\/]+)\/([gimuy]*)\s*as\s*any/g, '/$1/$2');

  return fixed;
}

function fixTestFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Apply malformed pattern fixes
    content = fixMalformedPatterns(content);

    // Apply syntax error fixes
    content = fixSyntaxErrors(content);

    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed malformed patterns in ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('Starting malformed pattern fixes in test files...');

  const testFiles = getAllTestFiles();
  console.log(`Found ${testFiles.length} test files`);

  let fixedCount = 0;

  for (const filePath of testFiles) {
    if (fixTestFile(filePath)) {
      fixedCount++;
    }
  }

  console.log(`✅ Fixed malformed patterns in ${fixedCount} test files`);

  // Check remaining syntax errors
  try {
    const errorOutput = execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -E "TS1005|TS1135|TS1011|TS1128" | wc -l', { encoding: 'utf8' });
    const syntaxErrorCount = parseInt(errorOutput.trim()) || 0;
    console.log(`Remaining syntax errors: ${syntaxErrorCount}`);
  } catch (error) {
    console.log('Could not count remaining syntax errors');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixTestFile, fixMalformedPatterns, fixSyntaxErrors };
