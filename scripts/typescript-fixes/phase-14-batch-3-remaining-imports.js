#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 3: TS2304 Remaining Import Fixes');
console.log('📍 Targeting: LegacyRecipeAdapter.ts, ConsolidatedIngredientService.ts, ingredients.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 3 (max 3 files per safety protocol)
const targetFiles = [
  'src/services/adapters/LegacyRecipeAdapter.ts',
  'src/services/ConsolidatedIngredientService.ts', 
  'src/data/unified/ingredients.ts'
];

let totalChanges = 0;

async function fixFile(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changes = 0;
  const originalContent = content;

  console.log(`\n📁 Processing: ${filePath}`);

  // === LegacyRecipeAdapter.ts fixes ===
  if (filePath.includes('LegacyRecipeAdapter.ts')) {
    // Add missing Recipe import (it has ScoredRecipe but not Recipe)
    const importInsertPoint = content.indexOf('import type {') !== -1 
      ? content.indexOf('import type {') 
      : content.indexOf('import { unifiedRecipeService }');

    const missingImports = `import type { Recipe, RecipeSearchCriteria } from '@/types/recipe';
import { LocalRecipeService } from '../LocalRecipeService';

`;

    if (!content.includes('import type { Recipe')) {
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing Recipe and LocalRecipeService imports');
    }
  }

  // === ConsolidatedIngredientService.ts fixes ===
  if (filePath.includes('ConsolidatedIngredientService.ts')) {
    // Check the import section
    const importSection = content.substring(0, content.indexOf('export class') || content.indexOf('export interface') || 500);
    
    // Check if IngredientServiceInterface and related types are used but not imported
    const hasIngredientServiceInterface = content.includes('IngredientServiceInterface');
    const hasIngredient = content.includes(': Ingredient');
    const hasImportedInterface = importSection.includes('IngredientServiceInterface');
    const hasImportedIngredient = importSection.includes('Ingredient');
    
    console.log(`  🔍 Debug: hasIngredientServiceInterface=${hasIngredientServiceInterface}, hasImportedInterface=${hasImportedInterface}`);
    console.log(`  🔍 Debug: hasIngredient=${hasIngredient}, hasImportedIngredient=${hasImportedIngredient}`);
    
    if ((hasIngredientServiceInterface && !hasImportedInterface) || (hasIngredient && !hasImportedIngredient)) {
      // Add missing interface and type imports at the top
      const missingImports = `import type { Ingredient } from '@/types/ingredient';
import type { IngredientServiceInterface } from './interfaces/IngredientServiceInterface';
import { errorHandler } from '@/utils/errorHandler';

`;

      content = missingImports + content;
      changes++;
      console.log('  ✅ Added missing Ingredient and IngredientServiceInterface imports');
    }
  }

  // === ingredients.ts fixes ===
  if (filePath.includes('data/unified/ingredients.ts')) {
    // Check the import section
    const importSection = content.substring(0, content.indexOf('export') || 500);
    
    // Check if Ingredient and related types are used but not imported
    const hasIngredient = content.includes('Ingredient');
    const hasUnifiedIngredient = content.includes('UnifiedIngredient');
    const hasImportedIngredient = importSection.includes('Ingredient');
    
    console.log(`  🔍 Debug: hasIngredient=${hasIngredient}, hasImportedIngredient=${hasImportedIngredient}`);
    console.log(`  🔍 Debug: hasUnifiedIngredient=${hasUnifiedIngredient}`);
    
    if (hasIngredient && !hasImportedIngredient) {
      // Add missing ingredient type imports at the top
      const missingImports = `import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';
import type { ElementalProperties, AlchemicalProperties } from '@/types/alchemy';

`;

      content = missingImports + content;
      changes++;
      console.log('  ✅ Added missing Ingredient and UnifiedIngredient imports');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of changes:');
      // Show a snippet of what would change
      const lines = content.split('\n');
      const changedLines = lines.slice(0, 15); // Show first 15 lines where imports are
      console.log('  ' + changedLines.slice(-5).join('\n  '));
    } else {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ Applied ${changes} fixes to ${filePath}`);
    }
    totalChanges += changes;
  } else {
    console.log(`  ⚪ No changes needed for ${filePath}`);
  }
}

// Process all target files
async function main() {
  console.log('\n🚀 Starting Phase 14 Batch 3 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 3 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 25-35 errors from remaining imports');
  } else {
    console.log('\n✅ BATCH 3 COMPLETE - Remaining import fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 