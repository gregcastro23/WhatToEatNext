#!/usr/bin/env node

import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 JSX Parsing Errors Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Specific JSX parsing fixes
const JSX_FIXES = [
  {
    file: 'src/components/CuisineRecommender.tsx',
    search: /\(\s*sauce\.preparationSteps\s*\|\|\s*sauce\.procedure\s*\|\|\s*sauce\.instructions\s*\|\|\s*\[\]\)\.map/g,
    replace: '(sauce.preparationSteps || sauce.procedure || sauce.instructions || []).map',
    description: 'Fix malformed sauce instructions array access'
  },
  {
    file: 'src/components/CuisineRecommender.tsx',
    search: /Object\.entries\(selectedCuisineData\.elementalState\s*\|\|\s*\[\]\)/g,
    replace: 'Object.entries(selectedCuisineData.elementalState || {})',
    description: 'Fix Object.entries on elementalState'
  }
];

// Manual fixes for remaining build errors
const REMAINING_FIXES = [
  {
    file: 'src/data/ingredients/proteins/index.ts',
    search: /Object\.keys\(protein\.\(Array\.isArray\(culinaryApplications\)\s*\?\s*\)?\s*\?\s*culinaryApplications\)?\?\.\w+\([^)]+\)\s*:\s*culinaryApplications\)?\?\s*===\s*\w+\)/g,
    replace: 'Object.keys(protein.culinaryApplications || {})',
    description: 'Fix malformed Object.keys with culinaryApplications'
  },
  {
    file: 'src/data/ingredients/proteins/index.ts',
    search: /\(\)\s*\|\|\s*\[\]\)\.length\s*\/\s*\(Object\s*\|\|\s*1\)\.keys\(/g,
    replace: '|| []).length / Object.keys(',
    description: 'Fix complex division expression'
  },
  {
    file: 'src/data/ingredients/seasonings/index.ts',
    search: /value\.\(Array\.isArray\(traditionalCombinations\)\s*\?\s*traditionalCombinations\.\w+\([^)]+\)\s*:\s*traditionalCombinations\s*===\s*[^)]+\)/g,
    replace: '(Array.isArray(value.traditionalCombinations) ? value.traditionalCombinations.includes(cuisine) : value.traditionalCombinations === cuisine)',
    description: 'Fix traditionalCombinations Array.isArray check'
  },
  {
    file: 'src/data/ingredients/spices/index.ts',
    search: /(\w+)\.qualities\?\s*\|\|\s*\[\]\.some/g,
    replace: '($1.qualities || []).some',
    description: 'Fix qualities array method access'
  },
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    search: /ingredient\.\(Array\.isArray\(qualities\)\s*\?\s*qualities\?\.\w+\([^)]+\)\s*:\s*qualities\?\s*===\s*[^)]+\)/g,
    replace: '(Array.isArray(ingredient.qualities) ? ingredient.qualities?.includes(quality) : ingredient.qualities === quality)',
    description: 'Fix ingredient qualities Array.isArray check'
  }
];

let totalFixes = 0;
const fixedFiles = [];

// Apply JSX fixes
for (const fix of JSX_FIXES) {
  try {
    if (!fs.existsSync(fix.file)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fix.file, 'utf8');
    const hasMatch = fix.search.test(content);
    
    if (hasMatch) {
      console.log(`📝 ${fix.file}`);
      console.log(`  ✓ ${fix.description}`);
      
      if (!DRY_RUN) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(fix.file, content, 'utf8');
      }
      
      totalFixes++;
      if (!fixedFiles.includes(fix.file)) {
        fixedFiles.push(fix.file);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
  }
}

// Apply remaining fixes
for (const fix of REMAINING_FIXES) {
  try {
    if (!fs.existsSync(fix.file)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fix.file, 'utf8');
    const hasMatch = fix.search.test(content);
    
    if (hasMatch) {
      console.log(`📝 ${fix.file}`);
      console.log(`  ✓ ${fix.description}`);
      
      if (!DRY_RUN) {
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(fix.file, content, 'utf8');
      }
      
      totalFixes++;
      if (!fixedFiles.includes(fix.file)) {
        fixedFiles.push(fix.file);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
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
    console.log(`  ${file}`);
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
console.log('2. Verify build completion');
console.log('3. Continue with Phase 2 TypeScript error resolution'); 