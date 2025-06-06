#!/usr/bin/env node

import fs from 'fs';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔧 Direct Syntax Errors Fix Script`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY CHANGES'}`);
console.log('=' .repeat(50));

// Direct fixes for specific syntax errors from build output
const DIRECT_FIXES = [
  // enhancedIngredients.ts line 748
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 748,
    search: 'Object.values(ingredient.(elementalProperties)? || [])',
    replace: 'Object.values(ingredient.elementalProperties || {})',
    description: 'Fix line 748 Object.values syntax corruption'
  },
  // enhancedIngredients.ts line 753
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 753,
    search: 'Object.values(ingredient.(alchemicalProperties)? || [])',
    replace: 'Object.values(ingredient.alchemicalProperties || {})',
    description: 'Fix line 753 Object.values syntax corruption'
  },
  // enhancedIngredients.ts line 757
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 757,
    search: 'if (ingredient.astrologicalPropertiesProfile?.rulingPlanets || [].length)',
    replace: 'if ((ingredient.astrologicalPropertiesProfile?.rulingPlanets || []).length)',
    description: 'Fix line 757 array length access'
  },
  // enhancedIngredients.ts line 758
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 758,
    search: 'if ((ingredient.qualities?  || []).length)',
    replace: 'if ((ingredient.qualities || []).length)',
    description: 'Fix line 758 qualities array access'
  },
  // enhancedIngredients.ts line 760
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 760,
    search: 'if ((ingredient.pAiringRecommendations?  || []).length)',
    replace: 'if ((ingredient.pAiringRecommendations || []).length)',
    description: 'Fix line 760 pAirings array access'
  },
  // enhancedIngredients.ts line 814
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 814,
    search: 'if (Array.isArray((!seasonalIngredients) ? (!seasonalIngredients.includes(ingredient.name) : (!seasonalIngredients === ingredient.name))',
    replace: 'if (!seasonalIngredients.includes(ingredient.name))',
    description: 'Fix line 814 Array.isArray corruption'
  },
  // enhancedIngredients.ts line 930
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 930,
    search: 'if (ingredient.culinaryProperties?.pAirings || [].length > 0)',
    replace: 'if ((ingredient.culinaryProperties?.pAirings || []).length > 0)',
    description: 'Fix line 930 pAirings length access'
  },
  // enhancedIngredients.ts line 966
  {
    file: 'src/data/unified/enhancedIngredients.ts',
    line: 966,
    search: '(!fromDifferentCategories || []).some(i => i.name === other.name)',
    replace: '!(fromDifferentCategories || []).some(i => i.name === other.name)',
    description: 'Fix line 966 negation syntax'
  }
];

let totalFixes = 0;
const fixedFiles = [];

// Apply direct fixes
console.log('🎯 Applying direct syntax fixes...');
for (const fix of DIRECT_FIXES) {
  try {
    if (!fs.existsSync(fix.file)) {
      console.log(`⚠️  File not found: ${fix.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fix.file, 'utf8');
    const originalContent = content;
    
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      
      console.log(`📝 ${fix.file}:${fix.line}`);
      console.log(`  ✓ ${fix.description}`);
      
      if (!DRY_RUN) {
        fs.writeFileSync(fix.file, content, 'utf8');
      }
      
      totalFixes++;
      
      // Track fixed files
      const existingFile = fixedFiles.find(f => f.path === fix.file);
      if (existingFile) {
        existingFile.fixes++;
        existingFile.appliedFixes.push(fix.description);
      } else {
        fixedFiles.push({
          path: fix.file,
          fixes: 1,
          appliedFixes: [fix.description]
        });
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${fix.file}:`, error.message);
  }
}

// Special handling for CuisineRecommender.tsx JSX issue
console.log('\n🔍 Analyzing CuisineRecommender.tsx JSX structure...');
try {
  const cuisineContent = fs.readFileSync('src/components/CuisineRecommender.tsx', 'utf8');
  const lines = cuisineContent.split('\n');
  
  // Look for the problematic area around line 720-730
  for (let i = 720; i < 730; i++) {
    if (lines[i] && lines[i].includes('return')) {
      console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    }
  }
  
  // Check for missing closing braces before the return statement
  const beforeReturn = cuisineContent.substring(0, cuisineContent.indexOf('return ('));
  const openBraces = (beforeReturn.match(/\{/g) || []).length;
  const closeBraces = (beforeReturn.match(/\}/g) || []).length;
  
  console.log(`📊 Before return statement:`);
  console.log(`  Open braces: ${openBraces}`);
  console.log(`  Close braces: ${closeBraces}`);
  
  if (openBraces > closeBraces) {
    console.log(`  ⚠️  Missing ${openBraces - closeBraces} closing brace(s)`);
    
    // Try to add missing braces before the return statement
    const missingBraces = '}  '.repeat(openBraces - closeBraces);
    const fixedContent = cuisineContent.replace(
      /(\s*)return\s*\(/,
      `${missingBraces}\n\n$1return (`
    );
    
    if (!DRY_RUN) {
      fs.writeFileSync('src/components/CuisineRecommender.tsx', fixedContent, 'utf8');
      console.log(`  ✓ Added ${openBraces - closeBraces} missing closing brace(s)`);
      totalFixes++;
      
      const existingFile = fixedFiles.find(f => f.path === 'src/components/CuisineRecommender.tsx');
      if (existingFile) {
        existingFile.fixes++;
        existingFile.appliedFixes.push('Added missing closing braces');
      } else {
        fixedFiles.push({
          path: 'src/components/CuisineRecommender.tsx',
          fixes: 1,
          appliedFixes: ['Added missing closing braces']
        });
      }
    } else {
      console.log(`  🔍 Would add ${openBraces - closeBraces} missing closing brace(s)`);
    }
  }
  
} catch (error) {
  console.error('❌ Error analyzing CuisineRecommender.tsx:', error.message);
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