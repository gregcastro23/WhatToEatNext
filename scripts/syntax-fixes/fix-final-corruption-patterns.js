#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDryRun = process.argv.includes('--dry-run');

// Target files with remaining corruption
const targetFiles = [
  'src/calculations/combinationEffects.ts',
  'src/utils/recipe/recipeEnrichment.ts',
  'src/scripts/updateCookingMethodTypes.ts',
  'src/components/recipes/RecipeGrid.tsx',
  'src/utils/recommendationEngine.ts',
  'src/services/SpoonacularService.ts',
  'src/utils/cookingMethodRecommender.ts',
  'src/components/IngredientRecommender/index.tsx',
  'src/utils/recommendation/ingredientRecommendation.ts',
  'src/services/SpoonacularElementalMapper.ts',
  'src/components/SauceRecommender.tsx'
];

// Corruption patterns to fix
const corruptionPatterns = [
  // Complex rule.conditions corruption
  {
    pattern: /rule\?\.\s*conditions\?\.\s*\(Array\.isArray\(([^)]+)\?\)\s*\?\s*([^:]+):\s*([^)]+)\)/g,
    replacement: 'rule.conditions.$1 && (Array.isArray($1) ? $2 : $3)',
    description: 'Fix corrupted rule.conditions with Array.isArray'
  },
  
  // Malformed Array.isArray with ternary
  {
    pattern: /Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^:]+):\s*\(([^)]+)\)\s*return;/g,
    replacement: 'if (Array.isArray($1) ? $2.includes($1) : $2 === $1) return;',
    description: 'Fix malformed Array.isArray with return statement'
  },
  
  // Complex season/currentSeason corruption
  {
    pattern: /\(mapping\.currentSeason as \(Array\.isArray\(string\[\]\?\)\s*\?\s*string\[\]\)\?\.\s*includes\(([^)]+)\)\s*:\s*string\[\]\)\?\s*===\s*([^)]+)\)/g,
    replacement: '(Array.isArray(mapping.currentSeason) ? mapping.currentSeason.includes($2) : mapping.currentSeason === $2)',
    description: 'Fix corrupted currentSeason Array.isArray pattern'
  },
  
  // Harmonious/antagonistic array corruption
  {
    pattern: /ELEMENT_COMBINATIONS\.(harmonious|antagonistic)\s+\|\|\s*\[\]\.some/g,
    replacement: '(ELEMENT_COMBINATIONS.$1 || []).some',
    description: 'Fix ELEMENT_COMBINATIONS array access'
  },
  
  // getPAirs function name corruption
  {
    pattern: /getPAirs/g,
    replacement: 'getPairs',
    description: 'Fix getPAirs function name'
  },
  
  // ingredientPAirs variable name corruption
  {
    pattern: /ingredientPAirs/g,
    replacement: 'ingredientPairs',
    description: 'Fix ingredientPAirs variable name'
  },
  
  // pAirs variable name corruption
  {
    pattern: /pAirs/g,
    replacement: 'pairs',
    description: 'Fix pAirs variable name'
  },
  
  // Complex cookingMethod condition corruption
  {
    pattern: /\(!rule\.conditions\.cookingMethod \|\| !cookingMethod \|\| rule\?\.\s*conditions\?\.\s*\(Array\.isArray\(cookingMethod\?\)\s*\?\s*cookingMethod\?\.\s*includes\(cookingMethod\)\s*:\s*cookingMethod\?\s*===\s*cookingMethod\)\)/g,
    replacement: '(!rule.conditions.cookingMethod || !cookingMethod || (Array.isArray(rule.conditions.cookingMethod) ? rule.conditions.cookingMethod.includes(cookingMethod) : rule.conditions.cookingMethod === cookingMethod))',
    description: 'Fix complex cookingMethod condition'
  },
  
  // Complex season condition corruption
  {
    pattern: /\(!rule\.conditions\.season \|\| !season \|\| rule\?\.\s*conditions\?\.\s*\(Array\.isArray\(season\?\)\s*\?\s*season\?\.\s*includes\(season\)\s*:\s*season\?\s*===\s*season\)\)/g,
    replacement: '(!rule.conditions.season || !season || (Array.isArray(rule.conditions.season) ? rule.conditions.season.includes(season) : rule.conditions.season === season))',
    description: 'Fix complex season condition'
  },
  
  // Missing closing parentheses in if statements
  {
    pattern: /if \(Array\.isArray\(\(([^)]+)\)\s*\?\s*\(([^:]+):\s*\(([^)]+)\)\s*return;/g,
    replacement: 'if (Array.isArray($1) ? $2.includes($1) : $2 === $1) return;',
    description: 'Fix missing parentheses in Array.isArray if statements'
  },
  
  // Double space cleanup
  {
    pattern: /\s{2,}/g,
    replacement: ' ',
    description: 'Clean up multiple spaces'
  }
];

function fixFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { fixed: false, changes: 0 };
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  let totalChanges = 0;

  console.log(`\n🔍 Processing: ${filePath}`);

  for (const { pattern, replacement, description } of corruptionPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  ✓ Found ${matches.length} instances of: ${description}`);
      content = content.replace(pattern, replacement);
      totalChanges += matches.length;
    }
  }

  if (totalChanges > 0) {
    if (!isDryRun) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ Applied ${totalChanges} fixes to ${filePath}`);
    } else {
      console.log(`  🔍 Would apply ${totalChanges} fixes to ${filePath}`);
    }
    return { fixed: true, changes: totalChanges };
  } else {
    console.log(`  ℹ️  No corruption patterns found in ${filePath}`);
    return { fixed: false, changes: 0 };
  }
}

function main() {
  console.log('🚀 Final Corruption Pattern Fix Script');
  console.log(isDryRun ? '🔍 DRY RUN MODE - No files will be modified' : '✏️  LIVE MODE - Files will be modified');
  
  let totalFiles = 0;
  let totalChanges = 0;
  let fixedFiles = 0;

  for (const file of targetFiles) {
    const result = fixFile(file);
    totalFiles++;
    if (result.fixed) {
      fixedFiles++;
      totalChanges += result.changes;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Files processed: ${totalFiles}`);
  console.log(`  Files with fixes: ${fixedFiles}`);
  console.log(`  Total fixes applied: ${totalChanges}`);
  
  if (isDryRun) {
    console.log('\n🔍 This was a dry run. Use without --dry-run to apply fixes.');
  } else {
    console.log('\n✅ All fixes have been applied!');
  }
}

main(); 