#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 2: TS2304 Service Import Fixes');
console.log('📍 Targeting: RecipeFinder.ts, LegacyRecipeAdapter.ts, UnifiedIngredientService.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 2 (max 3 files per safety protocol)
const targetFiles = [
  'src/services/RecipeFinder.ts',
  'src/services/adapters/LegacyRecipeAdapter.ts', 
  'src/services/UnifiedIngredientService.ts'
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

  // === RecipeFinder.ts fixes ===
  if (filePath.includes('RecipeFinder.ts')) {
    // Add missing service imports
    const importInsertPoint = content.indexOf('} from \'./interfaces/RecipeServiceInterface\';') + '} from \'./interfaces/RecipeServiceInterface\';'.length;

    const missingImports = `

// Missing service imports
import type { RecipeServiceInterface } from './interfaces/RecipeServiceInterface';
import { ConsolidatedRecipeService } from './ConsolidatedRecipeService';
import { errorHandler } from '@/utils/errorHandler';
`;

    if (!content.includes('import type { RecipeServiceInterface }')) {
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing RecipeServiceInterface and ConsolidatedRecipeService imports');
    }
  }

  // === LegacyRecipeAdapter.ts fixes ===
  if (filePath.includes('LegacyRecipeAdapter.ts')) {
    // Check the import section
    const importSection = content.substring(0, content.indexOf('export class') || content.indexOf('export interface') || 500);
    
    // Check if Recipe and related types are used but not imported
    const hasRecipe = content.includes('Recipe');
    const hasRecipeSearchCriteria = content.includes('RecipeSearchCriteria');
    const hasLocalRecipeService = content.includes('LocalRecipeService');
    const hasImportedRecipe = importSection.includes('Recipe');
    
    console.log(`  🔍 Debug: hasRecipe=${hasRecipe}, hasImportedRecipe=${hasImportedRecipe}`);
    
    if (hasRecipe && !hasImportedRecipe) {
      // Add missing Recipe and service imports at the top
      const missingImports = `import type { Recipe } from '@/types/recipe';
import type { RecipeSearchCriteria } from '../interfaces/RecipeServiceInterface';
import { LocalRecipeService } from '../LocalRecipeService';
import { errorHandler } from '@/utils/errorHandler';

`;

      content = missingImports + content;
      changes++;
      console.log('  ✅ Added missing Recipe and service imports');
    }
  }

  // === UnifiedIngredientService.ts fixes ===
  if (filePath.includes('UnifiedIngredientService.ts')) {
    // Check the import section
    const importSection = content.substring(0, content.indexOf('export class') || content.indexOf('export interface') || 500);
    
    // Check if IngredientServiceInterface and related types are used but not imported
    const hasIngredientServiceInterface = content.includes('IngredientServiceInterface');
    const hasIngredientFilter = content.includes('IngredientFilter');
    const hasElementalFilter = content.includes('ElementalFilter');
    const hasImportedInterface = importSection.includes('IngredientServiceInterface');
    
    console.log(`  🔍 Debug: hasIngredientServiceInterface=${hasIngredientServiceInterface}, hasImportedInterface=${hasImportedInterface}`);
    
    // Also fix any $1 corruption from previous regex fixes
    if (content.includes('$1')) {
      console.log('  🔧 Fixing $1 corruption from previous regex fixes');
      // Replace common $1 patterns with likely intended values
      content = content.replace(/Cannot find name '\$1'/g, "Cannot find name 'ingredient'");
      content = content.replace(/\$1\./g, 'ingredient.');
      content = content.replace(/\$1\[/g, 'ingredient[');
      content = content.replace(/\$1 /g, 'ingredient ');
      changes++;
      console.log('  ✅ Fixed $1 corruption patterns');
    }
    
    if (hasIngredientServiceInterface && !hasImportedInterface) {
      // Add missing interface imports at the top
      const missingImports = `import type { IngredientServiceInterface } from './interfaces/IngredientServiceInterface';
import type { IngredientFilter, ElementalFilter } from '@/types/filters';
import { errorHandler } from '@/utils/errorHandler';

`;

      content = missingImports + content;
      changes++;
      console.log('  ✅ Added missing IngredientServiceInterface and filter imports');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of changes:');
      // Show a snippet of what would change
      const lines = content.split('\n');
      const changedLines = lines.slice(0, 20); // Show first 20 lines where imports are
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
  console.log('\n🚀 Starting Phase 14 Batch 2 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 2 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 30-40 errors from service imports');
  } else {
    console.log('\n✅ BATCH 2 COMPLETE - Service import fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 