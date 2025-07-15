#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

// Files with remaining errors and their approximate error counts
const ERROR_FILES = [
  'src/data/culturalrules.ts',
  'src/data/foodTypes.ts', 
  'src/data/integrations/seasonalUsage.ts',
  'src/data/unified/cuisines.ts',
  'src/data/unified/flavorProfileMigration.ts',
  'src/data/unified/recipes.ts',
  'src/data/unified/unifiedFlavorEngine.ts'
];

console.log('🔧 Fixing remaining TypeScript errors in data directory files');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

// Comprehensive regex patterns for specific remaining errors
const REGEX_FIXES = [
  // Fix malformed combo.foods access patterns
  {
    pattern: /combo\.\(Array\.isArray\(foods\) \? foods\.includes\(dish\)\s*:\s*foods === dish\)/g,
    replacement: '(combo.foods && Array.isArray(combo.foods) ? combo.foods.includes(dish) : combo.foods === dish)',
    description: 'Fix malformed combo.foods array access'
  },
  
  // Fix malformed filter chains with combo.foods
  {
    pattern: /combo\?\.foods \|\| \[\]\.filter\(food => \(Array\.isArray\(!currentDishes\) \? !currentDishes\.includes\(food\) : !currentDishes === food\)\)/g,
    replacement: '(combo?.foods || []).filter(food => !currentDishes.includes(food))',
    description: 'Fix malformed combo.foods filter chain'
  },
  
  // Fix malformed cuisine.dishes access
  {
    pattern: /cuisine\.\(dishes\)\? \|\| \[\]/g,
    replacement: 'cuisine.dishes || {}',
    description: 'Fix malformed cuisine.dishes access'
  },
  
  // Fix malformed dish property access
  {
    pattern: /dish\.\(Array\.isArray\(properties\?\) \? properties\?\.includes\(prop\)\s*:\s*properties\? === prop\)/g,
    replacement: '(dish.properties && Array.isArray(dish.properties) ? dish.properties.includes(prop) : dish.properties === prop)',
    description: 'Fix malformed dish.properties array access'
  },
  
  // Fix malformed seasonData access patterns
  {
    pattern: /seasonData\.\(Array\.isArray\((\w+)\) \? \1\.includes\(ingredient\)\s*:\s*\1 === ingredient\)/g,
    replacement: '(seasonData.$1 && Array.isArray(seasonData.$1) ? seasonData.$1.includes(ingredient) : seasonData.$1 === ingredient)',
    description: 'Fix malformed seasonData property access'
  },
  
  // Fix malformed primaryMethods push
  {
    pattern: /primaryMethods\?\.push\(\.\.\.sortedMethods\?\.slice\(0, \(5\)\? \|\| \[\]\.map\(\(\[method\]\) => method\)\);/g,
    replacement: 'primaryMethods.push(...sortedMethods.slice(0, 5).map(([method]) => method));',
    description: 'Fix malformed primaryMethods push statement'
  },
  
  // Fix malformed ingredient access patterns
  {
    pattern: /cuisineData\.signatureIngredients\?\s*\|\| \[\]\.length/g,
    replacement: '(cuisineData.signatureIngredients || []).length',
    description: 'Fix malformed signatureIngredients length access'
  },
  
  // Fix malformed technique access patterns  
  {
    pattern: /cuisineData\.signatureTechniques\?\s*\|\| \[\]\.length/g,
    replacement: '(cuisineData.signatureTechniques || []).length',
    description: 'Fix malformed signatureTechniques length access'
  },
  
  // Fix malformed array includes patterns
  {
    pattern: /\(Array\.isArray\(\((\w+)\) \? \(\1\.includes\('([^']+)'\) : \(\1 === '([^']+)'\)/g,
    replacement: '($1 && Array.isArray($1) ? $1.includes(\'$2\') : $1 === \'$3\')',
    description: 'Fix malformed array includes conditional'
  },
  
  // Fix malformed filter length patterns
  {
    pattern: /\(\(\)\s*\|\|\s*\[\]\)\.length/g,
    replacement: '().length',
    description: 'Fix malformed filter length patterns'
  },
  
  // Fix malformed elementalBalance variable reference
  {
    pattern: /const elementalBalance = Fire \+ Water \+ Earth \+ Air;/g,
    replacement: 'const elementalBalance = (Fire + Water + Earth + Air) / 4;',
    description: 'Fix malformed elementalBalance calculation'
  },
  
  // Fix malformed recommendations.push patterns
  {
    pattern: /recommendations\?\.push\(/g,
    replacement: 'recommendations.push(',
    description: 'Fix malformed recommendations.push calls'
  },
  
  // Fix malformed variable name references (fire vs Fire)
  {
    pattern: /if \(fire > 0\.4\)/g,
    replacement: 'if (Fire > 0.4)',
    description: 'Fix incorrect fire variable reference (should be Fire)'
  },
  
  // Fix malformed variable name references (water vs Water)
  {
    pattern: /if \(water > 0\.4\)/g,
    replacement: 'if (Water > 0.4)',
    description: 'Fix incorrect water variable reference (should be Water)'
  },
  
  // Fix malformed variable name references (earth vs Earth)  
  {
    pattern: /if \(earth > 0\.4\)/g,
    replacement: 'if (Earth > 0.4)',
    description: 'Fix incorrect earth variable reference (should be Earth)'
  },
  
  // Fix malformed set access patterns
  {
    pattern: /\[\.\.\.\((\w+)\] \|\| \[\]\)\.filter\(x => (\w+)\.has\(x\)\)/g,
    replacement: '[...$1].filter(x => $2.has(x))',
    description: 'Fix malformed set filter patterns'
  },
  
  // Fix malformed number filter patterns
  {
    pattern: /\.filter\(val => val > 0\.\(1\) \|\| \[\]\)/g,
    replacement: '.filter(val => val > 0.1)',
    description: 'Fix malformed number filter patterns'
  },
  
  // Fix malformed method access with parentheses
  {
    pattern: /method\?\.toLowerCase\(\)\s*\(\)\s*\|\|\s*\[\]/g,
    replacement: 'method?.toLowerCase()',
    description: 'Fix malformed method toLowerCase call'
  },
  
  // Fix malformed element variable assignments
  {
    pattern: /return \{ Fire: totalFire \/ total, Water: totalWater \/ total, Earth: totalEarth \/ total, Air: totalAir \/ total\s*\n\s*\};/g,
    replacement: 'return { Fire: totalFire / total, Water: totalWater / total, Earth: totalEarth / total, Air: totalAir / total };',
    description: 'Fix malformed elemental properties return statement'
  },
  
  // Fix pairing recommendations typo
  {
    pattern: /extractPAiringRecommendations/g,
    replacement: 'extractPairingRecommendations',
    description: 'Fix typo in pAiring -> pairing'
  },
  
  // Fix missing return statement complexity
  {
    pattern: /const complexityFactor = profile\.complexity; \/\/ Higher complexity is betterreturn/g,
    replacement: 'const complexityFactor = profile.complexity; // Higher complexity is better\n    return',
    description: 'Fix missing newline in complexity calculation'
  }
];

// Manual fixes for specific files
const MANUAL_FIXES = {
  'src/data/culturalrules.ts': (content) => {
    // Fix the specific lines around 252-254 that have malformed syntax
    content = content.replace(
      /currentDishes || \[\]\.some\(dish => combo\.\(Array\.isArray\(foods\) \? foods\.includes\(dish\)\s*:\s*foods === dish\)\)/g,
      '(currentDishes || []).some(dish => combo.foods && Array.isArray(combo.foods) ? combo.foods.includes(dish) : combo.foods === dish)'
    );
    
    content = content.replace(
      /\.map\(combo => combo\?\.foods \|\| \[\]\.filter\(food => \(Array\.isArray\(!currentDishes\) \? !currentDishes\.includes\(food\) : !currentDishes === food\)\)\)/g,
      '.map(combo => (combo?.foods || []).filter(food => !currentDishes.includes(food)))'
    );
    
    return content;
  },
  
  'src/data/foodTypes.ts': (content) => {
    // Fix the malformed cuisine.dishes access around line 138
    content = content.replace(
      /Object\.values\(cuisine\.\(dishes\)\? \|\| \[\]\)/g,
      'Object.values(cuisine.dishes || {})'
    );
    
    // Fix the malformed dish.properties access
    content = content.replace(
      /if \(dish\.\(Array\.isArray\(properties\?\) \? properties\?\.includes\(prop\)\s*:\s*properties\? === prop\)\)/g,
      'if (dish.properties && Array.isArray(dish.properties) ? dish.properties.includes(prop) : dish.properties === prop)'
    );
    
    return content;
  },
  
  'src/data/unified/recipes.ts': (content) => {
    // Fix the variable casing issue (fire vs Fire)
    content = content.replace(/if \(fire > 0\.4\) return 'fire-dominant';/g, "if (Fire > 0.4) return 'fire-dominant';");
    content = content.replace(/if \(water > 0\.4\) return 'water-dominant';/g, "if (Water > 0.4) return 'water-dominant';");
    content = content.replace(/if \(earth > 0\.4\) return 'earth-dominant';/g, "if (Earth > 0.4) return 'earth-dominant';");
    
    // Fix the astrologicalPropertiesAffinities access 
    content = content.replace(
      /recipe\.astrologicalPropertiesAffinities\?\.planets && recipe\?\.astrologicalPropertiesAffinities\?\.planets \|\| \[\]\.length > 0/g,
      'recipe.astrologicalAffinities?.planets && (recipe.astrologicalAffinities.planets || []).length > 0'
    );
    
    return content;
  }
};

let totalFixesApplied = 0;

// Process each file
for (const filePath of ERROR_FILES) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  console.log(`\n📄 Processing: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixesApplied = 0;
  
  // Apply regex fixes
  for (const fix of REGEX_FIXES) {
    const matches = content.match(fix.pattern);
    if (matches) {
      content = content.replace(fix.pattern, fix.replacement);
      fileFixesApplied += matches.length;
      console.log(`   ✅ ${fix.description}: ${matches.length} fix(es)`);
    }
  }
  
  // Apply manual fixes if available
  const manualFix = MANUAL_FIXES[filePath];
  if (manualFix) {
    const originalContent = content;
    content = manualFix(content);
    if (content !== originalContent) {
      fileFixesApplied += 1;
      console.log(`   ✅ Applied manual fixes for ${filePath}`);
    }
  }
  
  // Write file if changes were made
  if (fileFixesApplied > 0) {
    if (!DRY_RUN) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`   💾 Saved ${filePath} with ${fileFixesApplied} fix(es)`);
    } else {
      console.log(`   🏃 Would save ${filePath} with ${fileFixesApplied} fix(es)`);
    }
    totalFixesApplied += fileFixesApplied;
  } else {
    console.log(`   ℹ️ No fixes needed for ${filePath}`);
  }
}

console.log(`\n🎉 Fix completed!`);
console.log(`📊 Total fixes applied: ${totalFixesApplied}`);
console.log(`📂 Files processed: ${ERROR_FILES.length}`);

if (DRY_RUN) {
  console.log(`\n🏃 This was a dry run. To apply fixes, run:`);
  console.log(`node scripts/syntax-fixes/fix-remaining-data-directory-errors.js`);
} else {
  console.log(`\n✅ All fixes have been applied. Run 'yarn build' to verify.`);
} 