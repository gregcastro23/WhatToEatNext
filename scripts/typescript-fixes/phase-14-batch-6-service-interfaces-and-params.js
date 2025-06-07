#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Phase 14 Batch 6: TS2304 Service Interfaces and Parameter Fixes');
console.log('📍 Targeting: UnifiedIngredientService.ts, recipeFiltering.ts, cookingMethodRecommender.ts');
if (DRY_RUN) console.log('🏃 DRY RUN MODE - No files will be modified');

// Target files for Batch 6 (max 3 files per safety protocol)
const targetFiles = [
  'src/services/UnifiedIngredientService.ts',
  'src/utils/recipe/recipeFiltering.ts', 
  'src/utils/cookingMethodRecommender.ts'
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

  // === UnifiedIngredientService.ts fixes ===
  if (filePath.includes('UnifiedIngredientService.ts')) {
    // Add missing interface definitions
    const hasIngredientServiceInterface = content.includes('interface IngredientServiceInterface');
    if (!hasIngredientServiceInterface) {
      console.log('  🔧 Adding missing interface definitions');
      
      const interfaceDefinitions = `
// Missing interface definitions
interface IngredientServiceInterface {
  getAllIngredients(): Record<string, UnifiedIngredient[]>;
  getIngredientByName(name: string): UnifiedIngredient | undefined;
  getIngredientsByCategory(category: string): UnifiedIngredient[];
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]>;
}

interface IngredientFilter {
  nutritional?: NutritionalFilter;
  elemental?: ElementalFilter;
  dietary?: DietaryFilter;
  currentSeason?: string;
  searchQuery?: string;
  excludeIngredients?: string[];
  currentZodiacSign?: ZodiacSign;
  planetaryInfluence?: PlanetName;
}

interface ElementalFilter {
  element?: Element;
  minThreshold?: number;
  maxThreshold?: number;
  dominantElement?: Element;
}

interface NutritionalFilter {
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  minFiber?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
}

interface DietaryFilter {
  restrictions: string[];
  preferences: string[];
  allergies?: string[];
}

interface IngredientRecommendationOptions {
  maxResults?: number;
  includeAlternatives?: boolean;
  seasonalPreference?: boolean;
  elementalBalance?: boolean;
}

`;
      
      // Insert after imports, before the class definition
      const classStartPoint = content.indexOf('export class UnifiedIngredientService');
      content = content.slice(0, classStartPoint) + interfaceDefinitions + content.slice(classStartPoint);
      changes++;
      console.log('  ✅ Added missing interface definitions');
    }

    // Fix variable scope issue with 'ingredient'
    if (content.includes('(ingredient || []).length > 0')) {
      console.log('  🔧 Fixing ingredient variable scope issue');
      content = content.replace(
        /filter\.excludeIngredients && \(ingredient \|\| \[\]\)\.length > 0/g,
        'filter.excludeIngredients && filter.excludeIngredients.length > 0'
      );
      changes++;
      console.log('  ✅ Fixed ingredient scope issue');
    }
  }

  // === recipeFiltering.ts fixes ===
  if (filePath.includes('recipeFiltering.ts')) {
    // Fix currentSeason scope issue
    if (content.includes('currentSeason?.includes(options.currentSeason)')) {
      console.log('  🔧 Fixing currentSeason scope issue');
      content = content.replace(
        /recipe\.currentSeason && recipe\.currentSeason\.includes\(currentSeason\?\.includes\(options\.currentSeason\)\s+\)\)/g,
        'recipe.season && recipe.season.includes(options.currentSeason)'
      );
      changes++;
      console.log('  ✅ Fixed currentSeason scope issue');
    }

    // Add missing connectIngredientsToMappings import
    const hasConnectIngredientsImport = content.includes('connectIngredientsToMappings');
    const importsConnectIngredients = content.includes("import { connectIngredientsToMappings }");
    
    if (hasConnectIngredientsImport && !importsConnectIngredients) {
      console.log('  🔧 Adding missing connectIngredientsToMappings import');
      
      // Find import section to add the missing import
      const importInsertPoint = content.indexOf("import { availableCuisines }");
      if (importInsertPoint !== -1) {
        const insertAfterLine = content.indexOf('\n', importInsertPoint);
        const missingImport = `import { connectIngredientsToMappings } from '../recipeMatching';\n`;
        content = content.slice(0, insertAfterLine + 1) + missingImport + content.slice(insertAfterLine + 1);
        changes++;
        console.log('  ✅ Added connectIngredientsToMappings import');
      }
    }

    // Fix parameter scope issues in destructuring
    if (content.includes('required?.')) {
      console.log('  🔧 Fixing parameter destructuring scope issues');
      // Find and fix the function that has this issue
      content = content.replace(
        /ingredientRequirements\?\.\s*{\s*required\?\?\:\s*string\[\];\s*preferred\?\?\:\s*string\[\];\s*avoided\?\?\:\s*string\[\];\s*}/g,
        'ingredientRequirements?: {\n    required?: string[];\n    preferred?: string[];\n    avoided?: string[];\n  }'
      );
      
      // Fix the usage of required/excluded variables
      content = content.replace(/required\?/g, 'ingredientRequirements?.required');
      content = content.replace(/excluded\?/g, 'ingredientRequirements?.avoided');
      changes++;
      console.log('  ✅ Fixed parameter destructuring scope');
    }
  }

  // === cookingMethodRecommender.ts fixes ===
  if (filePath.includes('cookingMethodRecommender.ts')) {
    // Fix seasonalPreference scope issue
    if (content.includes('seasonalPreference')) {
      console.log('  🔧 Fixing seasonalPreference scope issue');
      // Replace undefined seasonalPreference with proper parameter access
      content = content.replace(
        /seasonalPreference/g,
        'preferences?.seasonalPreference || false'
      );
      changes++;
      console.log('  ✅ Fixed seasonalPreference scope issue');
    }

    // Fix description scope issues
    if (content.includes('description') && content.includes('Cannot find name')) {
      console.log('  🔧 Fixing description scope issues');
      // These are likely in methods where description should be method.description
      content = content.replace(/(\s+)description(\s*[;,\)])/g, '$1method.description$2');
      content = content.replace(/(\s+)description(\s*\.)/g, '$1method.description$2');
      changes++;
      console.log('  ✅ Fixed description scope issues');
    }
  }

  // Apply changes if any were made
  if (changes > 0) {
    if (DRY_RUN) {
      console.log(`  🔍 Would make ${changes} changes to ${filePath}`);
      console.log('  📋 Preview of key changes:');
      if (filePath.includes('UnifiedIngredientService.ts')) {
        console.log('    - Added missing service interfaces (IngredientServiceInterface, IngredientFilter, etc.)');
        console.log('    - Fixed ingredient variable scope');
      } else if (filePath.includes('recipeFiltering.ts')) {
        console.log('    - Fixed currentSeason scope');
        console.log('    - Added connectIngredientsToMappings import');
        console.log('    - Fixed parameter destructuring scope');
      } else if (filePath.includes('cookingMethodRecommender.ts')) {
        console.log('    - Fixed seasonalPreference scope');
        console.log('    - Fixed description scope');
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
  console.log('\n🚀 Starting Phase 14 Batch 6 execution...');
  
  for (const file of targetFiles) {
    await fixFile(file);
  }

  console.log('\n📊 Phase 14 Batch 6 Summary:');
  console.log(`   📁 Files processed: ${targetFiles.length}`);
  console.log(`   🔧 Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\n🏃 DRY RUN COMPLETE - No files were modified');
    console.log('💡 Run without --dry-run to apply changes');
    console.log('🔍 Expected TS2304 reduction: 20-30 errors from interface and scope fixes');
  } else {
    console.log('\n✅ BATCH 6 COMPLETE - Service interfaces and parameter fixes applied');
    console.log('🔍 Next: Run "yarn build" to verify success');
  }
}

main().catch(console.error); 