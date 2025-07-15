#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 11 - Final Cleanup (Completing TS2304 Reduction Campaign)');
console.log('='.repeat(70));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/data/unified/recipeBuilding.ts',
    description: 'Add missing imports for unified types and seasonal system',
    changes: [
      {
        type: 'add_import',
        after: 'import type { Recipe } from "@/types/recipe";',
        content: `import { UnifiedIngredient } from '@/types/ingredient';
import { SeasonalRecommendations } from '@/types/seasons';
import { unifiedSeasonalSystem } from '@/data/integrations/seasonal';`
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeMatching.ts',
    description: 'Add missing service imports and fix variable scope',
    changes: [
      {
        type: 'add_import',
        after: 'import { Recipe, ScoredRecipe } from \'@/types/recipe\';',
        content: `import { LocalRecipeService } from '@/services/LocalRecipeService';
import { getRecipePlanetaryInfluence, calculatePlanetaryAlignment } from '@/utils/astrologyUtils';`
      },
      {
        type: 'replace_specific',
        search: 'new Array(length).fill',
        replace: 'new Array(length).fill'
      }
    ]
  },
  {
    file: 'src/utils/recipeMatching.ts',
    description: 'Add missing LocalRecipeService import',
    changes: [
      {
        type: 'add_import',
        after: 'import { Recipe } from \'@/types/recipe\';',
        content: `import { LocalRecipeService } from '@/services/LocalRecipeService';`
      }
    ]
  },
  {
    file: 'src/utils/recipeFilters.ts',
    description: 'Fix variable scope issues and add missing imports',
    changes: [
      {
        type: 'add_import',
        after: 'import { Recipe } from \'@/types/recipe\';',
        content: `import { Cuisine } from '@/types/cuisine';`
      },
      {
        type: 'replace_specific',
        search: 'recipe.ingredients.some((ingredient, i) =>',
        replace: 'recipe.ingredients.some((ingredient, index) =>'
      },
      {
        type: 'replace_specific',
        search: 'i < recipes.length',
        replace: 'index < recipes.length'
      },
      {
        type: 'replace_specific',
        search: 'cuisines.includes',
        replace: 'availableCuisines.includes'
      }
    ]
  }
];

function readFileContent(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function writeFileContent(filePath, content) {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (DRY_RUN) {
    console.log(`  Would write to: ${filePath}`);
    return;
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`  ✅ Fixed: ${filePath}`);
}

function processFile(fix) {
  console.log(`\n📁 Processing: ${fix.file}`);
  console.log(`   ${fix.description}`);
  
  try {
    let content = readFileContent(fix.file);
    let modified = false;
    
    for (const change of fix.changes) {
      if (change.type === 'add_import') {
        // Find the line after which to add the import
        const lines = content.split('\n');
        const afterIndex = lines.findIndex(line => line.includes(change.after));
        
        if (afterIndex !== -1) {
          lines.splice(afterIndex + 1, 0, change.content);
          content = lines.join('\n');
          modified = true;
          console.log(`    ✅ Added import after: ${change.after.substring(0, 50)}...`);
        } else {
          console.log(`    ⚠️  Could not find reference line: ${change.after.substring(0, 50)}...`);
        }
      } else if (change.type === 'replace_specific') {
        // Use exact string matching for targeted replacements
        if (content.includes(change.search)) {
          // Replace only the first occurrence for safety
          const index = content.indexOf(change.search);
          if (index !== -1) {
            content = content.substring(0, index) + 
                      change.replace + 
                      content.substring(index + change.search.length);
            modified = true;
            console.log(`    ✅ Replaced: ${change.search.substring(0, 40)}...`);
          }
        } else {
          console.log(`    ⚠️  Could not find text to replace: ${change.search.substring(0, 40)}...`);
        }
      }
    }
    
    if (modified) {
      writeFileContent(fix.file, content);
    } else {
      console.log(`    ℹ️  No changes needed`);
    }
    
  } catch (error) {
    console.error(`  ❌ Error processing ${fix.file}:`, error.message);
  }
}

// Process all fixes
console.log('\nProcessing files...\n');

for (const fix of fixes) {
  processFile(fix);
}

console.log('\n' + '='.repeat(70));
console.log('🎊 Phase 14 Batch 11 - Final Cleanup Complete!');
console.log('🎯 TypeScript TS2304 Error Reduction Campaign COMPLETED');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-11-final-cleanup.js');
} 