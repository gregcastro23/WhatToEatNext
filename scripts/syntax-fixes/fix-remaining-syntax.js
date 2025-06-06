#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

console.log('🔧 Fixing Remaining Syntax Errors...\n');

const DRY_RUN = process.argv.includes('--dry-run');

function updateFile(filePath, content, description) {
  if (DRY_RUN) {
    console.log(`📝 ${filePath}: ${description}`);
    return;
  }
  
  try {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${filePath}: ${description}`);
  } catch (error) {
    console.error(`❌ Failed to update ${filePath}:`, error.message);
  }
}

// Fix all remaining syntax errors in alchemicalEngine.ts
function fixAllSyntaxErrors() {
  console.log('1️⃣ Fixing all remaining syntax errors in alchemicalEngine.ts...');
  
  const filePath = 'src/calculations/alchemicalEngine.ts';
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Fix malformed division operations that were incorrectly modified
    content = content.replace(/\/ Math\.max\(0\.001, \(/g, '/ (');
    
    // Fix specific problematic patterns
    content = content.replace(/\)\)\s*;/g, ');');
    content = content.replace(/\)\)\s*$/gm, ')');
    content = content.replace(/\)\)\s*\}/g, ')}');
    content = content.replace(/\)\)\s*,/g, '),');
    
    // Fix specific lines that are malformed
    content = content.replace(/Math\.max\(0\.001, \(([^)]+)\)\)/g, '$1');
    
    // Fix function calls that got mangled
    content = content.replace(/(\w+)\(([^)]*)\)\)/g, '$1($2)');
    
    // Fix object property access that got mangled
    content = content.replace(/\.(\w+)\)\)/g, '.$1)');
    
    // Fix array access that got mangled
    content = content.replace(/\[([^\]]+)\]\)\)/g, '[$1])');
    
    // Fix specific malformed expressions
    content = content.replace(/\(\s*\)\s*\)/g, '()');
    content = content.replace(/\{\s*\}\s*\)/g, '{}');
    
    // Fix return statements
    content = content.replace(/return\s+([^;]+)\)\);/g, 'return $1;');
    
    // Fix variable assignments
    content = content.replace(/=\s*([^;]+)\)\);/g, '= $1;');
    
    // Fix function parameters
    content = content.replace(/\(([^)]*)\)\)/g, '($1)');
    
    // Fix specific patterns that are causing issues
    content = content.replace(/\)\s*\)\s*\{/g, ') {');
    content = content.replace(/\)\s*\)\s*:/g, '):');
    content = content.replace(/\)\s*\)\s*=>/g, ') =>');
    
    // Fix any remaining double closing parentheses
    content = content.replace(/\)\)\)/g, '))');
    content = content.replace(/\)\)/g, ')');
    
    updateFile(filePath, content, 'Fixed all remaining syntax errors');
  } catch (error) {
    console.error(`❌ Error fixing remaining syntax errors:`, error.message);
  }
}

// Main execution
async function main() {
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No files will be modified\n');
  }
  
  fixAllSyntaxErrors();
  
  if (DRY_RUN) {
    console.log('\n🚀 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ All syntax error fixes completed!');
    console.log('🔍 Run yarn tsc --noEmit to check remaining errors');
  }
}

main().catch(console.error); 