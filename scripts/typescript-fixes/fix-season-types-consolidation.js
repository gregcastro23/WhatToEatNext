#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

// Authoritative Season type definition (from alchemy.ts)
const AUTHORITATIVE_SEASON_TYPE = `export type Season = 'spring' | 'summer' | 'autumn' | 'fall' | 'winter' | 'all';`;

// Files that need to be updated to import Season from alchemy.ts
const FILES_TO_UPDATE = [
  'src/types/seasons.ts',
  'src/types/time.ts', 
  'src/types/common.ts',
  'src/types/shared.ts',
  'src/types/seasonal.ts',
  'src/constants/seasons.ts',
  'src/constants/recipe.ts',
  'src/types/constants.ts',
  'src/types/wiccan.ts'
];

// Files that need to import Season from alchemy.ts instead of defining it
const FILES_TO_IMPORT_FROM_ALCHEMY = [
  'src/services/interfaces/RecipeServiceInterface.ts',
  'src/services/adapters/FoodAlchemySystemAdapter.ts',
  'src/services/adapters/UnifiedDataAdapter.ts',
  'src/services/adapters/IngredientServiceAdapter.ts',
  'src/services/ConsolidatedIngredientService.ts',
  'src/services/IngredientService.ts',
  'src/data/ingredients/seasonings/oils.ts',
  'src/data/ingredients/vinegars/consolidated_vinegars.ts',
  'src/data/ingredients/oils/oils.ts',
  'src/data/unified/flavorCompatibilityLayer.ts',
  'src/data/unified/flavorProfileMigration.ts',
  'src/data/unified/nutritional.ts',
  'src/data/integrations/seasonalPatterns.ts',
  'src/data/integrations/seasonalUsage.ts',
  'src/data/integrations/seasonal.ts',
  'src/data/unified/cuisineIntegrations.ts',
  'src/data/recipes.ts',
  'src/utils/seasonalTransitions.ts',
  'src/utils/dateUtils.ts',
  'src/utils/recipe/recipeCore.ts',
  'src/utils/astrology/core.ts'
];

console.log('🔧 Critical Season Type Consolidation');
console.log('=====================================');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
}

let totalChanges = 0;
let filesProcessed = 0;

// Function to update Season type definitions
function updateSeasonTypeDefinition(filePath) {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // Remove existing Season type definitions
    const seasonTypePatterns = [
      /export\s+type\s+Season\s*=\s*[^;]+;/g,
      /type\s+Season\s*=\s*[^;]+;/g
    ];

    seasonTypePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, '');
        changed = true;
      }
    });

    // Add import from alchemy.ts if not already present
    const importPattern = /import\s+.*Season.*from\s+['"]@\/types\/alchemy['"]/;
    const hasImport = importPattern.test(content);

    if (!hasImport) {
      // Find the last import statement
      const importMatch = content.match(/(import\s+.*from\s+['"][^'"]+['"];?\s*)+/);
      
      if (importMatch) {
        const lastImport = importMatch[0];
        const updatedImport = lastImport.replace(/;?\s*$/, '') + 
          (lastImport.includes('Season') ? '' : ', Season') + 
          (lastImport.includes('@/types/alchemy') ? '' : ' from "@/types/alchemy"') + ';';
        
        content = content.replace(lastImport, updatedImport);
        changed = true;
      } else {
        // Add import at the top if no imports exist
        content = 'import type { Season } from "@/types/alchemy";\n\n' + content;
        changed = true;
      }
    }

    if (changed) {
      if (DRY_RUN) {
        console.log(`Would update: ${filePath}`);
        console.log(`  - Remove local Season type definition`);
        console.log(`  - Add/update import from @/types/alchemy`);
      } else {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      }
      totalChanges++;
    }

    filesProcessed++;
    return changed;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to consolidate Season type in specific files
function consolidateSeasonType(filePath) {
  try {
    const fullPath = path.join(ROOT_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    // Replace any Season type definition with the authoritative one
    const seasonTypePattern = /export\s+type\s+Season\s*=\s*[^;]+;/;
    if (seasonTypePattern.test(content)) {
      content = content.replace(seasonTypePattern, AUTHORITATIVE_SEASON_TYPE);
      changed = true;
    }

    if (changed) {
      if (DRY_RUN) {
        console.log(`Would consolidate: ${filePath}`);
        console.log(`  - Replace with authoritative Season type`);
      } else {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Consolidated: ${filePath}`);
      }
      totalChanges++;
    }

    filesProcessed++;
    return changed;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('\n📋 Processing files for Season type consolidation...\n');

// Step 1: Update files to import from alchemy.ts
console.log('Step 1: Updating imports to use authoritative Season type');
FILES_TO_IMPORT_FROM_ALCHEMY.forEach(filePath => {
  updateSeasonTypeDefinition(filePath);
});

// Step 2: Consolidate type definitions in specific files
console.log('\nStep 2: Consolidating Season type definitions');
FILES_TO_UPDATE.forEach(filePath => {
  consolidateSeasonType(filePath);
});

// Step 3: Special handling for constants/seasons.ts
const constantsSeasonsPath = path.join(ROOT_DIR, 'src/constants/seasons.ts');
if (fs.existsSync(constantsSeasonsPath)) {
  try {
    let content = fs.readFileSync(constantsSeasonsPath, 'utf8');
    let changed = false;

    // Remove the VALID_SEASONS constant and its type
    const validSeasonsPattern = /export\s+const\s+VALID_SEASONS\s*=\s*\[[^\]]+\]\s*as\s*const;/;
    const seasonTypePattern = /export\s+type\s+Season\s*=\s*typeof\s+VALID_SEASONS\[number\];/;

    if (validSeasonsPattern.test(content)) {
      content = content.replace(validSeasonsPattern, '');
      changed = true;
    }

    if (seasonTypePattern.test(content)) {
      content = content.replace(seasonTypePattern, AUTHORITATIVE_SEASON_TYPE);
      changed = true;
    }

    if (changed) {
      if (DRY_RUN) {
        console.log('Would update: src/constants/seasons.ts');
        console.log('  - Remove VALID_SEASONS constant');
        console.log('  - Replace with authoritative Season type');
      } else {
        fs.writeFileSync(constantsSeasonsPath, content, 'utf8');
        console.log('✅ Updated: src/constants/seasons.ts');
      }
      totalChanges++;
    }
  } catch (error) {
    console.error('❌ Error processing constants/seasons.ts:', error.message);
  }
}

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Files processed: ${filesProcessed}`);
console.log(`Total changes: ${totalChanges}`);

if (DRY_RUN) {
  console.log('\n🔍 DRY RUN COMPLETE');
  console.log('Review the changes above and run without --dry-run to apply');
} else {
  console.log('\n✅ Season type consolidation complete!');
  console.log('All Season types now use the authoritative definition from @/types/alchemy');
}

// Validation check
console.log('\n🔍 Validation: Checking for remaining Season type conflicts...');
const remainingConflicts = [];

FILES_TO_UPDATE.concat(FILES_TO_IMPORT_FROM_ALCHEMY).forEach(filePath => {
  const fullPath = path.join(ROOT_DIR, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const localSeasonDef = /export\s+type\s+Season\s*=\s*[^;]+;/;
    if (localSeasonDef.test(content)) {
      remainingConflicts.push(filePath);
    }
  }
});

if (remainingConflicts.length > 0) {
  console.log('⚠️  Remaining conflicts found:');
  remainingConflicts.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('✅ No remaining Season type conflicts found!');
} 