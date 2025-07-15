#!/usr/bin/env node

import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Critical Syntax Completion Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Critical fixes for remaining syntax errors from build output
const CRITICAL_FIXES = [
  // CuisineRecommender.tsx - JSX structure issue
  {
    file: 'src/components/CuisineRecommender.tsx',
    description: 'Fix JSX structure issues in CuisineRecommender',
    fixes: [
      {
        // Look for malformed return statements or JSX issues
        search: /}\s*return\s*\(\s*<div/,
        replace: '}\n\n  return (\n    <div',
        description: 'Fix JSX return statement formatting'
      },
      {
        // Fix any missing semicolons or closing braces before return
        search: /(\w+)\s*\)\s*return\s*\(/,
        replace: '$1);\n\n  return (',
        description: 'Add missing semicolon before return'
      }
    ]
  },
  // enhancedIngredients.ts - Object.values corruption
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    description: 'Fix Object method corruption in enhancedIngredients',
    fixes: [
      {
        search: /Object\.\(values\(unifiedIngredients\)\s*\|\|\s*\[\]\)/g,
        replace: 'Object.values(unifiedIngredients || {})',
        description: 'Fix Object.values syntax corruption'
      }
    ]
  },
  // useAstrologicalState.ts - Array.isArray corruption
  {
    file: 'src/hooks/useAstrologicalState.ts',
    description: 'Fix Array.isArray corruption in useAstrologicalState',
    fixes: [
      {
        search: /Array\.isArray\(\(!planetKeys\)\s*\?\s*\(!planetKeys\.includes\(planet\?\.\w+\s*:\s*\(!planetKeys\s*===\s*planet\?\.\w+\)\)/g,
        replace: '(Array.isArray(planetKeys) ? !planetKeys.includes(planet?.toLowerCase()) : planetKeys !== planet?.toLowerCase())',
        description: 'Fix malformed Array.isArray with planetKeys'
      }
    ]
  },
  // useElementalState.ts - Object syntax error
  {
    file: 'src/hooks/useElementalState.ts', 
    description: 'Fix object syntax in useElementalState',
    fixes: [
      {
        search: /return\s*\{\s*Fire:\s*0\.25,\s*Water:\s*0\.25,\s*Earth:\s*0\.25,\s*Air:\s*0\.25\s*\},\s*dominant:\s*'Fire',\s*balance:\s*1\.0\s*\};/g,
        replace: 'return {\n        Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,\n        dominant: \'fire\',\n        balance: 1.0\n      };',
        description: 'Fix malformed object return statement'
      }
    ]
  },
  // ChakraAlchemyService.ts - Object method corruption
  {
    file: 'src/lib/ChakraAlchemyService.ts',
    description: 'Fix Object method corruption in ChakraAlchemyService',
    fixes: [
      {
        search: /Object\.entries\(this\.\(chakraEnergyStateMappings\)\?\s*\|\|\s*\[\]\)/g,
        replace: 'Object.entries(this.chakraEnergyStateMappings || {})',
        description: 'Fix Object.entries with this.chakraEnergyStateMappings'
      },
      {
        search: /Array\.isArray\(\(energyStates\)\s*\?\s*\(energyStates\.includes\([^)]+\)\s*:\s*\(energyStates\s*===\s*[^)]+\)/g,
        replace: '(Array.isArray(energyStates) ? energyStates.includes(mapping.energyState) : energyStates === mapping.energyState)',
        description: 'Fix energyStates Array.isArray check'
      }
    ]
  }
];

let totalFixes = 0;
const fixedFiles = [];

// Apply all critical fixes
for (const fileInfo of CRITICAL_FIXES) {
  try {
    if (!fs.existsSync(fileInfo.file)) {
      console.log(`⚠️  File not found: ${fileInfo.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fileInfo.file, 'utf8');
    let fileFixCount = 0;
    const appliedFixes = [];
    
    for (const fix of fileInfo.fixes) {
      if (fix.search.test && fix.search.test(content)) {
        content = content.replace(fix.search, fix.replace);
        fileFixCount++;
        appliedFixes.push(fix.description);
        console.log(`  ✓ ${fix.description}`);
      } else if (typeof fix.search === 'string' && content.includes(fix.search)) {
        content = content.replace(fix.search, fix.replace);
        fileFixCount++;
        appliedFixes.push(fix.description);
        console.log(`  ✓ ${fix.description}`);
      }
    }
    
    if (fileFixCount > 0) {
      console.log(`📝 ${fileInfo.file} (${fileFixCount} fixes)`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(fileInfo.file, content, 'utf8');
      }
      
      totalFixes += fileFixCount;
      fixedFiles.push({
        path: fileInfo.file,
        fixes: fileFixCount,
        appliedFixes
      });
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${fileInfo.file}:`, error.message);
  }
}

// Additional manual fixes based on build errors
const MANUAL_STRING_FIXES = [
  // CuisineRecommender.tsx - check for unclosed function or missing braces
  {
    file: 'src/components/CuisineRecommender.tsx',
    search: 'function CuisineRecommender() {',
    check: () => {
      const content = fs.readFileSync('src/components/CuisineRecommender.tsx', 'utf8');
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        console.log(`  ⚠️  Brace mismatch: ${openBraces} open, ${closeBraces} close`);
        return false;
      }
      return true;
    },
    description: 'Check CuisineRecommender brace balance'
  }
];

// Run manual checks
console.log('\n🔍 Running manual syntax checks...');
for (const check of MANUAL_STRING_FIXES) {
  if (fs.existsSync(check.file)) {
    console.log(`📝 ${check.file}`);
    if (check.check) {
      check.check();
    }
  }
}

console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));
console.log(`Total fixes applied: ${totalFixes}`);
console.log(`Files modified: ${fixedFiles.length}`);

if (fixedFiles.length > 0) {
  console.log('\n📋 Fixed Files:');
  fixedFiles.forEach(file => {
    console.log(`  ${file.path}: ${file.fixes} fixes`);
    file.appliedFixes.forEach(fix => console.log(`    - ${fix}`));
  });
}

if (DRY_RUN) {
  console.log('\n🔍 DRY RUN COMPLETE - No files were modified');
  console.log('Remove --dry-run flag to apply these changes');
} else {
  console.log('\n✅ FIXES APPLIED SUCCESSFULLY');
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Run: yarn build');
console.log('2. If build still fails, manual inspection may be needed');
console.log('3. Update typescript-systematic-resolution-plan.md');
console.log('4. Begin Phase 2 TypeScript error resolution'); 