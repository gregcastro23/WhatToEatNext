#!/usr/bin/env node

/**
 * Aggressive Syntax Cleanup - Repairs damage from over-aggressive TS1005 fixer
 * Targets specific patterns that break builds and compilation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get build-critical files that need immediate fixing
function getBuildCriticalFiles() {
  try {
    // Get files with compilation errors from build output
    const buildErrors = execSync('yarn build 2>&1 | grep -E "Error:|/src/" | head -20',
      { encoding: 'utf8' }).split('\n').filter(line => line.includes('/src/'));

    const criticalFiles = buildErrors.map(line => {
      const match = line.match(/\.\/([^:]+)/);
      return match ? match[1] : null;
    }).filter(Boolean);

    // Also add known problematic patterns
    const additionalFiles = [
      'src/app/alchm-kitchen/DevSettings.tsx',
      'src/app/alchm-kitchen/SignVectorPanel.tsx',
      'src/context/AstrologicalContext.tsx',
      'src/contexts/AlchemicalContext/provider.tsx',
      'src/services/RealAlchemizeService.ts'
    ];

    return [...new Set([...criticalFiles, ...additionalFiles])];
  } catch (error) {
    console.log('Build check failed, using fallback file list');
    return [
      'src/app/alchm-kitchen/DevSettings.tsx',
      'src/app/alchm-kitchen/SignVectorPanel.tsx',
      'src/context/AstrologicalContext.tsx',
      'src/contexts/AlchemicalContext/provider.tsx',
      'src/services/RealAlchemizeService.ts'
    ];
  }
}

// Fix aggressive TS1005 fixer damage
function fixAggressiveDamage(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Fix 1: Malformed variable declarations (const, x = y)
    content = content.replace(/const,\s*(\w+):\s*any\s*=/g, 'const $1: any =');
    if (content !== originalContent) fixesApplied++;

    // Fix 2: Fix malformed function parameters (_{
    content = content.replace(/function\s+\w+\s*\(_\{/g, (match) => {
      return match.replace('_{', '({');
    });
    if (content !== originalContent) fixesApplied++;

    // Fix 3: JSX element trailing semicolons
    content = content.replace(/(<[^>]+>);/g, '$1');
    if (content !== originalContent) fixesApplied++;

    // Fix 4: Fix malformed type declarations
    content = content.replace(/type\s+\w+\s*=\s*\{;/g, (match) => {
      return match.replace('{;', '{');
    });
    if (content !== originalContent) fixesApplied++;

    // Fix 5: Fix malformed JSX attributes
    content = content.replace(/(\w+)='([^']+)';/g, "$1='$2'");
    if (content !== originalContent) fixesApplied++;

    // Fix 6: Fix double semicolons in object properties
    content = content.replace(/:\s*([^,}\n]+);;/g, ': $1;');
    if (content !== originalContent) fixesApplied++;

    // Fix 7: Fix malformed math expressions
    content = content.replace(/\+;/g, '+');
    if (content !== originalContent) fixesApplied++;

    // Fix 8: Fix malformed object property access
    content = content.replace(/(\w+)\](\w+)/g, '$1].$2');
    if (content !== originalContent) fixesApplied++;

    // Fix 9: Remove excessive semicolons in JSX
    content = content.replace(/;(<\/)/g, '$1');
    if (content !== originalContent) fixesApplied++;

    // Fix 10: Fix provider function parameters
    content = content.replace(/Provider\(_\{/g, 'Provider({');
    if (content !== originalContent) fixesApplied++;

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      return fixesApplied;
    }
    return 0;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
console.log('🚨 Aggressive Syntax Cleanup - Repairing TS1005 fixer damage');

const criticalFiles = getBuildCriticalFiles();
console.log(`📁 Found ${criticalFiles.length} build-critical files to repair`);

let totalFixes = 0;
let fixedFiles = 0;

for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    const fixes = fixAggressiveDamage(file);
    if (fixes > 0) {
      fixedFiles++;
      totalFixes += fixes;
      console.log(`✅ ${file}: ${fixes} aggressive damage fixes applied`);
    }
  }
}

console.log(`\n📈 Aggressive Syntax Cleanup Results:`);
console.log(`   Files processed: ${criticalFiles.length}`);
console.log(`   Files with fixes: ${fixedFiles}`);
console.log(`   Total fixes applied: ${totalFixes}`);

console.log('\n🎯 Aggressive syntax cleanup complete!');