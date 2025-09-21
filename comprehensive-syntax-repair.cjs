#!/usr/bin/env node

/**
 * Comprehensive Syntax Repair - Final cleanup of TS1005 fixer damage
 * Targets all remaining syntax patterns that prevent compilation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files that need comprehensive repair
function getAllProblemFiles() {
  try {
    const allFiles = execSync('find src -name "*.ts" -o -name "*.tsx" | head -100',
      { encoding: 'utf8' }).split('\n').filter(f => f.length > 0 && fs.existsSync(f));
    return allFiles;
  } catch (error) {
    return [];
  }
}

// Comprehensive syntax repair patterns
function comprehensiveSyntaxRepair(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Fix 1: Malformed const declarations (const, x = y)
    content = content.replace(/const,\s*(\w+):\s*([^=]+)\s*=/g, 'const $1: $2 =');
    if (content !== originalContent) fixesApplied++;

    // Fix 2: Malformed private declarations (private, x:)
    content = content.replace(/private,\s*(\w+):/g, 'private $1:');
    if (content !== originalContent) fixesApplied++;

    // Fix 3: Fix semicolons in object properties
    content = content.replace(/:\s*([^,}\n;]+);(\s*[,}])/g, ': $1$2');
    if (content !== originalContent) fixesApplied++;

    // Fix 4: Fix trailing semicolons in JSX attribute values
    content = content.replace(/=\{([^}]+)\};\s*>/g, '={$1}>');
    if (content !== originalContent) fixesApplied++;

    // Fix 5: Fix malformed opening JSX tags
    content = content.replace(/(<\w+[^>]*)\};/g, '$1}');
    if (content !== originalContent) fixesApplied++;

    // Fix 6: Fix method chain breaks
    content = content.replace(/(\.\w+\(\))\s*;\s*(\.\w+)/g, '$1$2');
    if (content !== originalContent) fixesApplied++;

    // Fix 7: Fix JSX elements with trailing semicolons
    content = content.replace(/(<\/\w+>);/g, '$1');
    if (content !== originalContent) fixesApplied++;

    // Fix 8: Fix math expressions with trailing semicolons
    content = content.replace(/([+\-*/])\s*;/g, '$1');
    if (content !== originalContent) fixesApplied++;

    // Fix 9: Fix object property access
    content = content.replace(/(\w+)\](\w+)/g, '$1].$2');
    if (content !== originalContent) fixesApplied++;

    // Fix 10: Fix condition blocks with semicolons
    content = content.replace(/if\s*\([^)]+\)\s*{;/g, (match) => match.replace('{;', '{'));
    if (content !== originalContent) fixesApplied++;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return fixesApplied;
    }
    return 0;
  } catch (error) {
    console.error(`Error repairing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
console.log('🔧 Comprehensive Syntax Repair - Final TS1005 damage cleanup');

const problemFiles = getAllProblemFiles();
console.log(`📁 Found ${problemFiles.length} files to repair`);

let totalFixes = 0;
let fixedFiles = 0;
let processedCount = 0;

for (const file of problemFiles) {
  const fixes = comprehensiveSyntaxRepair(file);
  if (fixes > 0) {
    fixedFiles++;
    totalFixes += fixes;
    console.log(`✅ ${file}: ${fixes} comprehensive fixes applied`);
  }

  processedCount++;
  if (processedCount % 20 === 0) {
    console.log(`📊 Progress: ${processedCount}/${problemFiles.length} files processed`);
  }
}

console.log(`\n📈 Comprehensive Syntax Repair Results:`);
console.log(`   Files processed: ${problemFiles.length}`);
console.log(`   Files with fixes: ${fixedFiles}`);
console.log(`   Total fixes applied: ${totalFixes}`);

console.log('\n🎯 Comprehensive syntax repair complete!');