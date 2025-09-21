#!/usr/bin/env node

/**
 * Build Critical Fix - Repairs critical syntax errors preventing build
 * Targets specific malformed patterns from aggressive automated fixes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get critical files causing build failures
function getCriticalBuildFiles() {
  const criticalFiles = [
    'src/app/alchemize-demo/page.tsx',
    'src/app/alchm-kitchen/page.tsx',
    'src/app/api/alchemize/route.ts',
    'src/app/api/astrologize/route.ts',
    'src/app/api/current-moment/route.ts'
  ];

  return criticalFiles.filter(file => fs.existsSync(file));
}

// Fix critical syntax patterns that break builds
function fixCriticalSyntax(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fixesApplied = 0;

    // Fix: Object declarations with malformed semicolon
    if (content.includes('= {;')) {
      content = content.replace(/= \{;/g, '= {');
      fixesApplied++;
    }

    // Fix: JSX elements with trailing semicolons
    content = content.replace(/(<[^>]+>);/g, '$1');
    if (content !== originalContent) fixesApplied++;

    // Fix: Function parameter syntax errors
    content = content.replace(/function\s+\w+\s*\(_\{/g, (match) => {
      return match.replace('_{', '({');
    });

    // Fix: Malformed JSX className attributes
    content = content.replace(/className='([^']+)';/g, "className='$1'");
    if (content !== originalContent) fixesApplied++;

    // Fix: Response object declarations
    content = content.replace(/const response = \{;/g, 'const response = {');
    if (content !== originalContent) fixesApplied++;

    // Fix: DEFAULT_LOCATION object declarations
    content = content.replace(/const DEFAULT_LOCATION = \{;/g, 'const DEFAULT_LOCATION = {');
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
console.log('🚨 Build Critical Fix - Repairing critical syntax errors');

const criticalFiles = getCriticalBuildFiles();
console.log(`📁 Found ${criticalFiles.length} critical files to fix`);

let totalFixes = 0;
let fixedFiles = 0;

for (const file of criticalFiles) {
  const fixes = fixCriticalSyntax(file);
  if (fixes > 0) {
    fixedFiles++;
    totalFixes += fixes;
    console.log(`✅ ${file}: ${fixes} critical fixes applied`);
  }
}

console.log(`\n📈 Build Critical Fix Results:`);
console.log(`   Files processed: ${criticalFiles.length}`);
console.log(`   Files with fixes: ${fixedFiles}`);
console.log(`   Total fixes applied: ${totalFixes}`);

console.log('\n🎯 Build critical fixes complete!');