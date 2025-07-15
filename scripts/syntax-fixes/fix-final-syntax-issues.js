#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Define the 5 critical files with their specific syntax issues
const CRITICAL_SYNTAX_FIXES = [
  {
    file: 'src/components/CuisineRecommender.tsx',
    patterns: [
      {
        pattern: /\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\]\, tags\) === 'meat'\)\)/g,
        replacement: '(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags]).includes(\'meat\')',
        description: 'Fix malformed safeSome call in dietary filter'
      },
      {
        pattern: /cuisine\.dishes\?\.\[mealType\]\.\(all\s+\|\|\s+\[\]\)\.length/g,
        replacement: '(cuisine?.dishes?.[mealType]?.all || []).length',
        description: 'Fix property access corruption in meal type processing'
      }
    ]
  },
  {
    file: 'src/services/FoodAlchemySystem.ts', 
    patterns: [
      {
        pattern: /signInfo\[planetSign\]\?\.\(Array\.isArray\(decanEffects\[decan\]\?\) \? decanEffects\[decan\]\?\.includes\(food\.planetaryRuler\)\s+: decanEffects\[decan\]\?\s+===\s+food\.planetaryRuler\)\)/g,
        replacement: 'Array.isArray(decanEffects[decan]) ? decanEffects[decan]?.includes(food.planetaryRuler) : decanEffects[decan] === food.planetaryRuler',
        description: 'Fix property access corruption in decan effects'
      },
      {
        pattern: /Array\.isArray\(a\.planets\) \? a\.planets\.includes\(food\.planetaryRuler\) : a\.planets === food\.planetaryRuler;/g,
        replacement: 'Array.isArray(a.planets) ? a.planets.includes(food.planetaryRuler) : a.planets === food.planetaryRuler)',
        description: 'Fix missing closing parenthesis in aspect filtering'
      }
    ]
  },
  {
    file: 'src/services/IngredientFilterService.ts',
    patterns: [
      {
        pattern: /ingredient\.qualities\s+\|\|\s+\[\]\.some\(q\s+=>\s+q\?\.toLowerCase\(\)\?\.includes\(lowerQuery\)\)/g,
        replacement: '(ingredient.qualities || []).some(q => q?.toLowerCase()?.includes(lowerQuery))',
        description: 'Fix missing opening parenthesis in qualities filter'
      },
      {
        pattern: /Array\.isArray\(\(!lowerExcluded\) \? \!lowerExcluded\.includes\(ingredient\.name\?\.toLowerCase\(\) : \!lowerExcluded === ingredient\.name\?\.toLowerCase\(\)\)/g,
        replacement: 'Array.isArray(lowerExcluded) ? !lowerExcluded.includes(ingredient.name?.toLowerCase()) : lowerExcluded !== ingredient.name?.toLowerCase()',
        description: 'Fix malformed Array.isArray condition in exclusion filter'
      },
      {
        pattern: /nutrition\.vitamins\s+\|\|\s+\[\]\.length/g,
        replacement: '(nutrition.vitamins || []).length',
        description: 'Fix missing parentheses in vitamins length calculation'
      },
      {
        pattern: /nutrition\.minerals\s+\|\|\s+\[\]\.length/g,
        replacement: '(nutrition.minerals || []).length',
        description: 'Fix missing parentheses in minerals length calculation'
      },
      {
        pattern: /data\.results\s+\|\|\s+\[\]\.length/g,
        replacement: '(data.results || []).length',
        description: 'Fix missing parentheses in results length calculation'
      }
    ]
  },
  {
    file: 'src/services/IngredientService.ts',
    patterns: [
      {
        pattern: /Object\.keys\(profile\.minerals \|\| \(\{\}\)\?\s+\|\|\s+\[\]\)\.some/g,
        replacement: 'Object.keys(profile.minerals || {}).some',
        description: 'Fix malformed object property access in minerals check'
      },
      {
        pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\]\, tags\) === 'meat'\)\)/g,
        replacement: 'safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag === \'meat\')',
        description: 'Fix malformed safeSome call with missing callback parameter'
      },
      {
        pattern: /safeSome\(Array\.isArray\(ingredient\.tags\) \? ingredient\.tags : \[ingredient\.tags\]\, tags\)\)\)/g,
        replacement: 'safeSome(Array.isArray(ingredient.tags) ? ingredient.tags : [ingredient.tags], tag => tag === \'dairy\')',
        description: 'Fix malformed safeSome call for dairy check'
      }
    ]
  },
  {
    file: 'src/services/LocalRecipeService.ts',
    patterns: [
      {
        pattern: /Array\.isArray\(normalizedName\) \? normalizedName\.includes\(c\?\.name\?\.toLowerCase\(\) : normalizedName === c\?\.name\?\.toLowerCase\(\)\)/g,
        replacement: 'Array.isArray(normalizedName) ? normalizedName.includes(c?.name?.toLowerCase()) : normalizedName === c?.name?.toLowerCase()',
        description: 'Fix missing closing parenthesis in cuisine name matching'
      },
      {
        pattern: /cuisine\?\.dishes\?\.\[mealType\]\.\(all\s+\|\|\s+\[\]\)\.length/g,
        replacement: '(cuisine?.dishes?.[mealType]?.all || []).length',
        description: 'Fix property access corruption in all length calculation'
      },
      {
        pattern: /Object\.entries\(cuisine\.dishes \|\| \(\{\}\)\?\s+\|\|\s+\[\]\)\.map/g,
        replacement: 'Object.entries(cuisine.dishes || {}).map',
        description: 'Fix malformed object entries call'
      },
      {
        pattern: /\(\(recipes\s+\|\|\s+\[\]\)\.length/g,
        replacement: '((recipes || []).length',
        description: 'Fix unbalanced parentheses in recipe length calculations'
      }
    ]
  }
];

function fixFile(filePath, patterns) {
  let fixesApplied = 0;
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return 0;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  for (const pattern of patterns) {
    const matches = content.match(pattern.pattern);
    if (matches) {
      console.log(`🔧 ${DRY_RUN ? 'WOULD FIX' : 'FIXING'}: ${pattern.description}`);
      console.log(`   Pattern matches found: ${matches.length}`);
      
      if (!DRY_RUN) {
        content = content.replace(pattern.pattern, pattern.replacement);
        fixesApplied++;
      } else {
        fixesApplied += matches.length;
      }
    }
  }

  if (!DRY_RUN && content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Applied ${fixesApplied} fixes to ${filePath}`);
  } else if (DRY_RUN && fixesApplied > 0) {
    console.log(`📋 Would apply ${fixesApplied} fixes to ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }

  return fixesApplied;
}

function main() {
  console.log(`🔧 ${DRY_RUN ? 'DRY RUN' : 'EXECUTING'}: Fix Final Syntax Issues`);
  console.log('📋 Targeting 5 critical build-blocking syntax errors\n');

  let totalFixes = 0;
  
  for (const fileConfig of CRITICAL_SYNTAX_FIXES) {
    console.log(`\n📁 Processing: ${fileConfig.file}`);
    const fixes = fixFile(fileConfig.file, fileConfig.patterns);
    totalFixes += fixes;
  }

  console.log(`\n🎯 Summary:`);
  console.log(`   Total fixes ${DRY_RUN ? 'identified' : 'applied'}: ${totalFixes}`);
  
  if (DRY_RUN) {
    console.log('\n⚡ Run without --dry-run to apply fixes');
    console.log('   Then test with: yarn build');
  } else {
    console.log('\n✅ Syntax fixes applied!');
    console.log('🔄 Next: Run "yarn build" to verify clean build status');
    console.log('🚀 Then proceed with Phase 2 targeting:');
    console.log('   - cuisineFlavorProfiles.ts (179 errors)');
    console.log('   - useCurrentChart.ts (165 errors)'); 
    console.log('   - SpoonacularService.ts (136 errors)');
  }
}

main(); 