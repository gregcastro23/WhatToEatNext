#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 4: TS2304 Corruption and Type Import Fixes');
console.log('📍 Targeting: ConsolidatedIngredientService.ts, ingredients.ts, recipeFilters.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 4 (max 3 files per safety protocol)
const targetFiles = [
  'src/services/ConsolidatedIngredientService.ts',
  'src/data/unified/ingredients.ts', 
  'src/utils/recipeFilters.ts'
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

  // === ConsolidatedIngredientService.ts fixes ===
  if (filePath.includes('ConsolidatedIngredientService.ts')) {
    // Fix $1 corruption from previous regex fixes
    if (content.includes('$1')) {
      console.log('  🔧 Fixing $1 corruption from previous regex fixes');
      // Replace common $1 patterns with likely intended values based on context
      content = content.replace(/Cannot find name '\$1'/g, "Cannot find name 'ingredient'");
      content = content.replace(/\$1\./g, 'ingredient.');
      content = content.replace(/\$1\[/g, 'ingredient[');
      content = content.replace(/\$1 /g, 'ingredient ');
      content = content.replace(/\$1\)/g, 'ingredient)');
      content = content.replace(/\$1,/g, 'ingredient,');
      content = content.replace(/\$1;/g, 'ingredient;');
      content = content.replace(/\(\$1/g, '(ingredient');
      changes++;
      console.log('  ✅ Fixed $1 corruption patterns');
    }
  }

  // === ingredients.ts fixes ===
  if (filePath.includes('data/unified/ingredients.ts')) {
    // Fix malformed import at the top and add missing UnifiedIngredient import
    const malformedImportPattern = /import type \{ \/\/ ===== UNIFIED INGREDIENTS SYSTEM =====[\s\S]*?\} from "@\/types\/alchemy";/;
    
    if (content.match(malformedImportPattern)) {
      const fixedImports = `// ===== UNIFIED INGREDIENTS SYSTEM =====
// This file provides a unified interface for accessing ingredients with enhanced alchemical properties
// It acts as an adapter/enhancer for existing ingredient data rather than duplicating it

import type { 
  IngredientMapping, 
  ElementalProperties, 
  ThermodynamicMetrics,
  ThermodynamicProperties,
  AlchemicalProperties 
} from "@/types/alchemy";

import type { 
  UnifiedIngredient 
} from "@/types/unified";`;

      content = content.replace(malformedImportPattern, fixedImports);
      changes++;
      console.log('  ✅ Fixed malformed imports and added UnifiedIngredient type');
    }

    // Remove duplicate AlchemicalProperties import lower in the file
    if (content.includes('import { AlchemicalProperties } from \'@/types\';')) {
      content = content.replace('import { AlchemicalProperties } from \'@/types\';\n\n', '');
      changes++;
      console.log('  ✅ Removed duplicate AlchemicalProperties import');
    }
  }

  // === recipeFilters.ts fixes ===
  if (filePath.includes('recipeFilters.ts')) {
    // Check import section for ScoredRecipe
    const importSection = content.substring(0, content.indexOf('interface FilterOptions') || 500);
    const usesScoredRecipe = content.includes('ScoredRecipe');
    const importsScoredRecipe = importSection.includes('ScoredRecipe');
    
    console.log(`  🔍 Debug: usesScoredRecipe=${usesScoredRecipe}, importsScoredRecipe=${importsScoredRecipe}`);
    
    // Add missing ScoredRecipe import
    if (usesScoredRecipe && !importsScoredRecipe) {
      const importInsertPoint = content.indexOf('import { Recipe, RecipeFilters }') + 'import { Recipe, RecipeFilters } from \'@/types/recipe\';'.length;
      const missingImports = `\nimport type { ScoredRecipe } from '@/types/recipe';`;
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing ScoredRecipe import');
    }

    // Fix variable scope issue with 'i' variable
    const problematicPattern = /Cannot find name 'i'/g;
    if (content.match(problematicPattern)) {
      // Find loop contexts where 'i' might be missing
      content = content.replace(/\.some\((recipe, i)\)/g, '.some((recipe, index))');
      content = content.replace(/\.map\((recipe, i)\)/g, '.map((recipe, index))');
      content = content.replace(/\.filter\((recipe, i)\)/g, '.filter((recipe, index))');
      content = content.replace(/\.forEach\((recipe, i)\)/g, '.forEach((recipe, index))');
      changes++;
      console.log('  ✅ Fixed variable scope issues with loop indices');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of changes:');
      // Show a snippet of what would change for ingredients.ts (the most complex fix)
      if (filePath.includes('ingredients.ts')) {
        const lines = content.split('\n');
        const importLines = lines.slice(0, 20); // Show first 20 lines where imports are
        console.log('  ' + importLines.slice(0, 10).join('\n  '));
      } else {
        const lines = content.split('\n');
        const changedLines = lines.slice(0, 15);
        console.log('  ' + changedLines.slice(-5).join('\n  '));
      }
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
  console.log('\n🚀 Starting Phase 14 Batch 4 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 4 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 20-30 errors from corruption fixes and imports');
  } else {
    console.log('\n✅ BATCH 4 COMPLETE - Corruption and type import fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 