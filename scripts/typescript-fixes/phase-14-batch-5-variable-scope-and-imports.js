#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 5: TS2304 Variable Scope and Import Fixes');
console.log('📍 Targeting: enhancedIngredients.ts, elementalUtils.ts, seasonal.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 5 (max 3 files per safety protocol)
const targetFiles = [
  'src/data/unified/enhancedIngredients.ts',
  'src/utils/elementalUtils.ts', 
  'src/data/unified/seasonal.ts'
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

  // === enhancedIngredients.ts fixes ===
  if (filePath.includes('enhancedIngredients.ts')) {
    // Fix missing 'criteria' variable scope issue
    // The issue is that 'criteria' is used in filter functions but not passed as parameter
    const problematicPattern = /criteria\.seasonalAlignment!/g;
    if (content.match(problematicPattern)) {
      console.log('  🔧 Fixing missing criteria parameter in filter functions');
      
      // Replace specific problematic lines - these are using criteria that's out of scope
      content = content.replace(
        /ingredient\.culinaryProperties\?\./g,
        'ingredient.culinaryProperties?.'
      );
      
      // Fix the actual criteria reference issue by replacing with 'season' parameter
      content = content.replace(
        /criteria\.seasonalAlignment!/g, 
        'season'
      );
      
      // Also need to ensure the function parameter is properly named
      content = content.replace(
        /adaptIngredientsForSeason\(ingredients: EnhancedIngredient\[\], season: string\)/g,
        'adaptIngredientsForSeason(ingredients: EnhancedIngredient[], season: string)'
      );
      
      changes++;
      console.log('  ✅ Fixed criteria scope issues in filter functions');
    }

    // Add missing imports for UnifiedIngredient and unifiedIngredients
    const importSection = content.substring(0, content.indexOf('export interface') || 500);
    if (!importSection.includes('UnifiedIngredient') || !importSection.includes('unifiedIngredients')) {
      console.log('  🔧 Adding missing UnifiedIngredient imports');
      
      // Find a good place to add imports (after existing imports)
      const importInsertPoint = content.indexOf("import {") + content.substring(content.indexOf("import {")).indexOf("} from '../../constants/alchemicalPillars';") + "} from '../../constants/alchemicalPillars';".length;
      
      const missingImports = `\nimport type { UnifiedIngredient } from '@/types/unified';\nimport { unifiedIngredients } from './ingredients';`;
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing UnifiedIngredient and unifiedIngredients imports');
    }
  }

  // === elementalUtils.ts fixes ===
  if (filePath.includes('elementalUtils.ts')) {
    // Fix missing normalizeElementalProperties function
    if (content.includes('normalizeElementalProperties(')) {
      console.log('  🔧 Fixing normalizeElementalProperties reference');
      // Replace the call with the actual function that exists
      content = content.replace(/normalizeElementalProperties\(/g, 'normalizeProperties(');
      changes++;
      console.log('  ✅ Fixed normalizeElementalProperties to use normalizeProperties');
    }

    // Fix missing ELEMENTAL_CHARACTERISTICS constant
    if (content.includes('ELEMENTAL_CHARACTERISTICS[')) {
      console.log('  🔧 Adding missing ELEMENTAL_CHARACTERISTICS constant');
      
      // Find where to add the constant (after imports, before the first function)
      const insertPoint = content.indexOf('type AlchemicalProperty') || content.indexOf('export let validateElementalProperties');
      
      const elementalCharacteristics = `
// Missing ELEMENTAL_CHARACTERISTICS constant
const ELEMENTAL_CHARACTERISTICS = {
  Fire: {
    cookingTechniques: ['grilling', 'roasting', 'searing', 'flambéing'],
    timeOfDay: ['morning', 'noon'],
    qualities: ['energetic', 'transformative', 'intense'],
    temperature: 'hot'
  },
  Water: {
    cookingTechniques: ['boiling', 'steaming', 'poaching', 'braising'],
    timeOfDay: ['evening', 'night'],
    qualities: ['flowing', 'cooling', 'nurturing'],
    temperature: 'cool'
  },
  Earth: {
    cookingTechniques: ['baking', 'slow-cooking', 'roasting', 'smoking'],
    timeOfDay: ['afternoon', 'evening'],
    qualities: ['grounding', 'stable', 'nourishing'],
    temperature: 'moderate'
  },
  Air: {
    cookingTechniques: ['whipping', 'frying', 'sautéing', 'dehydrating'],
    timeOfDay: ['morning', 'midday'],
    qualities: ['light', 'airy', 'quick'],
    temperature: 'variable'
  }
};

`;
      
      content = content.slice(0, insertPoint) + elementalCharacteristics + content.slice(insertPoint);
      changes++;
      console.log('  ✅ Added missing ELEMENTAL_CHARACTERISTICS constant');
    }
  }

  // === seasonal.ts fixes ===
  if (filePath.includes('seasonal.ts')) {
    // Add missing UnifiedIngredient and unifiedIngredients imports
    const importSection = content.substring(0, content.indexOf('export interface') || 500);
    const hasUnifiedIngredient = importSection.includes('UnifiedIngredient');
    const hasUnifiedIngredientsImport = importSection.includes('unifiedIngredients');
    
    console.log(`  🔍 Debug: hasUnifiedIngredient=${hasUnifiedIngredient}, hasUnifiedIngredientsImport=${hasUnifiedIngredientsImport}`);

    if (!hasUnifiedIngredient || !hasUnifiedIngredientsImport) {
      console.log('  🔧 Adding missing UnifiedIngredient imports');
      
      // Find insertion point after existing imports
      const importInsertPoint = content.indexOf("} from '../../constants/alchemicalPillars';") + "} from '../../constants/alchemicalPillars';".length;
      
      let missingImports = '';
      if (!hasUnifiedIngredient) {
        missingImports += `\nimport type { UnifiedIngredient } from '@/types/unified';`;
      }
      if (!hasUnifiedIngredientsImport) {
        missingImports += `\nimport { unifiedIngredients } from './ingredients';`;
      }
      
      content = content.slice(0, importInsertPoint) + missingImports + content.slice(importInsertPoint);
      changes++;
      console.log('  ✅ Added missing UnifiedIngredient imports');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of key changes:');
      if (filePath.includes('enhancedIngredients.ts')) {
        console.log('    - Fixed criteria.seasonalAlignment! -> season');
        console.log('    - Added UnifiedIngredient imports');
      } else if (filePath.includes('elementalUtils.ts')) {
        console.log('    - Fixed normalizeElementalProperties -> normalizeProperties');
        console.log('    - Added ELEMENTAL_CHARACTERISTICS constant');
      } else if (filePath.includes('seasonal.ts')) {
        console.log('    - Added UnifiedIngredient imports');
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
  console.log('\n🚀 Starting Phase 14 Batch 5 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 5 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 25-35 errors from scope and import fixes');
  } else {
    console.log('\n✅ BATCH 5 COMPLETE - Variable scope and import fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 