#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 10 - Targeted Fixes for Top Files');
console.log('='.repeat(60));

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

const fixes = [
  {
    file: 'src/services/RecommendationService.ts',
    description: 'Add missing imports and type definitions',
    changes: [
      {
        type: 'add_import',
        after: 'import { calculateLunarPhase } from \'../utils/astrologyUtils\';',
        content: `import { calculatePlanetaryPositions } from '../utils/astrology/core';
import { transformItemsWithPlanetaryPositions } from '../utils/astrologyUtils';
import { ScoredRecipe } from '@/types/recipe';
import { AstrologicalState } from '@/types/alchemy';`
      }
    ]
  },
  {
    file: 'src/utils/cookingMethodRecommender.ts',
    description: 'Fix variable scope and add missing imports',
    changes: [
      {
        type: 'add_import',
        after: 'import { PlanetaryAspect, LunarPhase, AstrologicalState, BasicThermodynamicProperties, CookingMethodProfile, MethodRecommendationOptions, MethodRecommendation, COOKING_METHOD_THERMODYNAMICS } from \'@/types/alchemy\';',
        content: `import { CookingMethod } from '@/types/cooking';`
      },
      {
        type: 'replace',
        search: '(method as any)?.(description as any)?.toLowerCase?.()',
        replace: '(method as any)?.description?.toLowerCase?.()'
      }
    ]
  },
  {
    file: 'src/utils/recipe/recipeFiltering.ts',
    description: 'Fix specific variable scope issues with targeted replacements',
    changes: [
      {
        type: 'replace_specific',
        search: 'ingredientRequirements && ingredientRequirements.required',
        replace: 'options.ingredientRequirements && options.ingredientRequirements.required'
      },
      {
        type: 'replace_specific', 
        search: 'connectIngredientsToMappings(',
        replace: 'this.connectIngredientsToMappings('
      },
      {
        type: 'replace_specific',
        search: 'required && required.length > 0',
        replace: 'options.required && options.required.length > 0'
      },
      {
        type: 'replace_specific',
        search: 'excluded && excluded.length > 0',
        replace: 'options.excluded && options.excluded.length > 0'
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
      } else if (change.type === 'replace' || change.type === 'replace_specific') {
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

console.log('\n' + '='.repeat(60));
console.log('✅ Phase 14 Batch 10 - Targeted Fixes Complete');

if (DRY_RUN) {
  console.log('\n🔄 To apply these changes, run:');
  console.log('node scripts/typescript-fixes/phase-14-batch-10-targeted-fixes.js');
} 