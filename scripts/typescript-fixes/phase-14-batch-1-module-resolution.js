#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 1: TS2304 Module Resolution Fixes');
console.log('📍 Targeting: ConsolidatedRecipeService.ts, flavorProfileMigration.ts, transformations.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 1 (max 3 files per safety protocol)
const targetFiles = [
  'src/services/ConsolidatedRecipeService.ts',
  'src/data/unified/flavorProfileMigration.ts', 
  'src/utils/elemental/transformations.ts'
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

  // === ConsolidatedRecipeService.ts fixes ===
  if (filePath.includes('ConsolidatedRecipeService.ts')) {
    // Add missing imports at the top after existing imports
    const importInsertPoint = content.indexOf('} from \'@/types/alchemy\';') + '} from \'@/types/alchemy\';'.length;

    const missingImports = `

// Missing service and interface imports
import type { Recipe } from '@/types/recipe';
import type { RecipeServiceInterface } from './interfaces/RecipeServiceInterface';
import type { ElementalProperties } from '@/types/alchemy';
import { LocalRecipeService } from './LocalRecipeService';
import { UnifiedRecipeService } from './UnifiedRecipeService';
import { errorHandler } from '@/utils/errorHandler';

// Missing unified system imports
import { 
  getRecipesForZodiac,
  getRecipesForSeason, 
  getRecipesForLunarPhase,
  adaptAllRecipes
} from '@/data/recipes';
import { unifiedRecipeService } from '@/services/UnifiedRecipeService';
`;

    if (!content.includes('import type { Recipe }')) {
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing Recipe and service imports');
    }
  }

  // === flavorProfileMigration.ts fixes ===
  if (filePath.includes('flavorProfileMigration.ts')) {
    // Check the import section specifically
    const importSection = content.substring(0, content.indexOf('// ===== FLAVOR PROFILE MIGRATION UTILITY'));
    
    // Check if UnifiedFlavorProfile is used but not imported in import section
    const hasUnifiedFlavorProfile = content.includes('UnifiedFlavorProfile');
    const hasImportedUnifiedFlavorProfile = importSection.includes('UnifiedFlavorProfile');
    
    console.log(`  🔍 Debug: hasUnifiedFlavorProfile=${hasUnifiedFlavorProfile}, hasImportedUnifiedFlavorProfile=${hasImportedUnifiedFlavorProfile}`);
    
    if (hasUnifiedFlavorProfile && !hasImportedUnifiedFlavorProfile) {
      // Add missing UnifiedFlavorProfile and related imports
      const importInsertPoint = content.indexOf('import { Element }') + 'import { Element } from "@/types/alchemy";'.length;

      const missingImports = `

// Missing unified system type imports
import type { 
  UnifiedFlavorProfile, 
  BaseFlavorNotes 
} from '@/types/unified';

// Missing unified data imports
import { unifiedFlavorProfiles } from './data/unifiedFlavorProfiles';
`;

      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing UnifiedFlavorProfile imports');
    }
  }

  // === transformations.ts fixes ===
  if (filePath.includes('transformations.ts')) {
    // Check the import section specifically
    const importSection = content.substring(0, content.indexOf('// --- Types ---'));
    
    // Check if ElementalItem and AlchemicalItem are used but not imported in import section
    const hasElementalItem = content.includes('ElementalItem');
    const hasAlchemicalItem = content.includes('AlchemicalItem');
    const hasImportedElementalItem = importSection.includes('ElementalItem');
    const hasImportedAlchemicalItem = importSection.includes('AlchemicalItem');
    
    console.log(`  🔍 Debug: hasElementalItem=${hasElementalItem}, hasImportedElementalItem=${hasImportedElementalItem}`);
    console.log(`  🔍 Debug: hasAlchemicalItem=${hasAlchemicalItem}, hasImportedAlchemicalItem=${hasImportedAlchemicalItem}`);
    
    if ((hasElementalItem && !hasImportedElementalItem) || (hasAlchemicalItem && !hasImportedAlchemicalItem)) {
      // Add missing ElementalItem and AlchemicalItem type imports
      const importInsertPoint = content.indexOf('import { AlchemicalProperties }') + 'import { AlchemicalProperties } from "@/types/alchemy";'.length;

      const missingImports = `

// Missing elemental and alchemical item types
import type { 
  ElementalItem,
  AlchemicalItem 
} from '@/types/items';
`;

      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing ElementalItem and AlchemicalItem imports');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of changes:');
      // Show a snippet of what would change
      const lines = content.split('\n');
      const changedLines = lines.slice(0, 40); // Show first 40 lines where imports are
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
  console.log('\n🚀 Starting Phase 14 Batch 1 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 1 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 20-30 errors from targeted imports');
  } else {
    console.log('\n✅ BATCH 1 COMPLETE - Module resolution fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 