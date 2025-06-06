#!/usr/bin/env node

import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Final Syntax Corruption Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Comprehensive fixes for all remaining syntax corruption
const FINAL_FIXES = [
  // CuisineRecommender.tsx - the root of JSX issues
  {
    file: 'src/components/CuisineRecommender.tsx',
    fixes: [
      {
        search: /sauce\.preparationSteps\s*\|\|\s*sauce\.procedure\s*\|\|\s*sauce\.instructions\s*\|\|\s*\[\]\)\.map/g,
        replace: '(sauce.preparationSteps || sauce.procedure || sauce.instructions || []).map',
        description: 'Fix sauce instructions array access'
      },
      {
        search: /Object\.entries\(selectedCuisineData\.elementalState\s*\|\|\s*\[\]\)/g,
        replace: 'Object.entries(selectedCuisineData.elementalState || {})',
        description: 'Fix Object.entries on elementalState'
      }
    ]
  },
  // spices/index.ts - multiple corruption issues
  {
    file: 'src/data/ingredients/spices/index.ts',
    fixes: [
      {
        search: /Object\.keys\(\(Array\.isArray\(preparation\)\s*\?\s*preparation\.includes\(method\)\s*:\s*preparation\s*===\s*method\)/g,
        replace: '(Array.isArray(value.preparation) ? value.preparation.includes(method) : value.preparation === method)',
        description: 'Fix Object.keys with preparation method check'
      },
      {
        search: /\(Array\.isArray\(affinities\)\s*\?\s*affinities\?\.\w+\(affinity\)\s*:\s*affinities\s*===\s*affinity\)/g,
        replace: '(Array.isArray(spice.affinities) ? spice.affinities?.includes(affinity) : spice.affinities === affinity)',
        description: 'Fix spice affinities corruption'
      },
      {
        search: /\(Array\.isArray\(qualities\)\s*\?\s*qualities\?\.\w+\(quality\)\s*:\s*qualities\s*===\s*quality\)/g,
        replace: '(Array.isArray(spice.qualities) ? spice.qualities?.includes(quality) : spice.qualities === quality)',
        description: 'Fix spice qualities corruption'
      },
      {
        search: /value\.\(Array\.isArray\(origin\)\s*\?\s*origin\.includes\(region\)\s*:\s*origin\s*===\s*region\)/g,
        replace: '(Array.isArray(value.origin) ? value.origin.includes(region) : value.origin === region)',
        description: 'Fix origin Array.isArray check'
      }
    ]
  },
  // proteins/index.ts
  {
    file: 'src/data/ingredients/proteins/index.ts',
    fixes: [
      {
        search: /Object\.keys\(protein\.\(Array\.isArray\(culinaryApplications\)\s*\?\s*\)?\s*\?\s*culinaryApplications\)?\?\.\w+\([^)]+\)\s*:\s*culinaryApplications\)?\?\s*===\s*\w+\)/g,
        replace: 'Object.keys(protein.culinaryApplications || {})',
        description: 'Fix malformed Object.keys with culinaryApplications'
      },
      {
        search: /\(\)\s*\|\|\s*\[\]\)\.length\s*\/\s*\(Object\s*\|\|\s*1\)\.keys\(/g,
        replace: '|| []).length / Object.keys(',
        description: 'Fix complex division expression'
      },
      {
        search: /\(proteinQualities\s*\|\|\s*\(1\)\s*\|\|\s*\[\]\)\.length/g,
        replace: '(proteinQualities || []).length',
        description: 'Fix protein qualities length calculation'
      }
    ]
  },
  // seasonings/index.ts
  {
    file: 'src/data/ingredients/seasonings/index.ts',
    fixes: [
      {
        search: /value\.\(Array\.isArray\(traditionalCombinations\)\s*\?\s*traditionalCombinations\.\w+\([^)]+\)\s*:\s*traditionalCombinations\s*===\s*[^)]+\)/g,
        replace: '(Array.isArray(value.traditionalCombinations) ? value.traditionalCombinations.includes(cuisine) : value.traditionalCombinations === cuisine)',
        description: 'Fix traditionalCombinations Array.isArray check'
      }
    ]
  },
  // enhancedIngredients.ts
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    fixes: [
      {
        search: /ingredient\.\(Array\.isArray\(qualities\)\s*\?\s*qualities\?\.\w+\([^)]+\)\s*:\s*qualities\?\s*===\s*[^)]+\)/g,
        replace: '(Array.isArray(ingredient.qualities) ? ingredient.qualities?.includes(quality) : ingredient.qualities === quality)',
        description: 'Fix ingredient qualities Array.isArray check'
      },
      {
        search: /ingredient\.culinaryProperties\?\.\(Array\.isArray\(cookingMethods\)\s*\?\s*cookingMethods\?\.\w+\([^)]+\)\s*:\s*cookingMethods\?\s*===\s*\w+\)/g,
        replace: '(Array.isArray(ingredient.culinaryProperties?.cookingMethods) ? ingredient.culinaryProperties?.cookingMethods?.includes(method) : ingredient.culinaryProperties?.cookingMethods === method)',
        description: 'Fix cookingMethods property corruption'
      },
      {
        search: /ingredient\.culinaryProperties\?\.\(Array\.isArray\(pAirings\)\s*\?\s*pAirings\?\.\w+\([^)]+\)\s*:\s*pAirings\?\s*===\s*\w+\)/g,
        replace: '(Array.isArray(ingredient.culinaryProperties?.pAirings) ? ingredient.culinaryProperties?.pAirings?.includes(pairing) : ingredient.culinaryProperties?.pAirings === pairing)',
        description: 'Fix pAirings property corruption'
      },
      {
        search: /ingredient\.seasonality\?\s*\|\|\s*\[\]\)\.length/g,
        replace: '(ingredient.seasonality || []).length',
        description: 'Fix seasonality array access'
      }
    ]
  }
];

let totalFixes = 0;
const fixedFiles = [];

// Apply all fixes
for (const fileInfo of FINAL_FIXES) {
  try {
    if (!fs.existsSync(fileInfo.file)) {
      console.log(`⚠️  File not found: ${fileInfo.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fileInfo.file, 'utf8');
    let fileFixCount = 0;
    const appliedFixes = [];
    
    for (const fix of fileInfo.fixes) {
      if (fix.search.test(content)) {
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
console.log('2. Verify build completion');
console.log('3. Update typescript-systematic-resolution-plan.md');
console.log('4. Begin Phase 2 TypeScript error resolution'); 