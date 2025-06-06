#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🧹 Removing Corrupted Syntax Files for Phase 6');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be deleted');
}

// List of corrupted files identified by TypeScript syntax errors
const corruptedFiles = [
  'src/components/ErrorNotifications/index.tsx',
  'src/components/errors/ErrorDisplay.tsx',
  'src/components/errors/GlobalErrorBoundary.tsx',
  'src/components/FoodRecommender/components/Cuisinegroup.tsx',
  'src/components/FoodRecommender/components/FilterSection.tsx',
  'src/components/FoodRecommender/components/FoodBalanceTracker.tsx',
  'src/components/FoodRecommender/components/IngredientRecommendations.tsx',
  'src/components/FoodRecommender/components/NutritionDisplay.tsx',
  'src/components/FoodRecommender/mocks/ingredients.ts',
  'src/components/GlobalPopup.tsx',
  'src/components/Recipe.tsx',
  'src/components/Recipe/Recipe.tsx',
  'src/components/Recipe/RecipeCalculator.tsx',
  'src/components/Recipe/RecipeCard.tsx',
  'src/components/Recipe/RecipeGrid.tsx',
  'src/components/Recipe/RecipeRecommendations.tsx',
  'src/components/RecipeBuilder.tsx',
  'src/components/RecipeCard.tsx',
  'src/components/RecipeList.tsx',
  'src/utils/astrology/calculations.ts',
  'src/utils/astrology/index.ts',
  'src/utils/elementalScoring.ts',
  'src/utils/enhancedCuisineRecommender.ts',
  'src/utils/popup.ts',
  'src/utils/recipeEnrichment.ts',
  'src/utils/recipeRecommendation.ts',
  'src/utils/recipeUtils.ts'
];

// Critical files that should NOT be deleted (core functionality)
const criticalFiles = [
  'src/utils/astrology/core.ts',
  'src/utils/astrology/validation.ts',
  'src/components/FoodRecommender/index.tsx',
  'src/components/CuisineRecommender/index.tsx'
];

// Helper function to check if file is critical
function isCriticalFile(filePath) {
  return criticalFiles.some(critical => filePath.includes(critical));
}

// Helper function to check if file exists and is corrupted
function isFileCorrupted(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for corruption patterns
    const corruptionPatterns = [
      /import.*,\.\./,  // Malformed imports like "import ,../"
      /\{',\{',/,       // Malformed JSX patterns
      /\}'\}/,          // Malformed closing patterns
      /export.*,.*,.*,/, // Malformed exports
      /interface.*\{.*\[key: string\]: unknown;;.*\}/s, // Repeated interface patterns
      /className=".*,.*"/,  // Malformed className attributes
      /\s*,\s*,\s*,/,   // Multiple consecutive commas
      /\{',.*,>.*'\}/,  // Malformed JSX expressions
      /import.*\/.*\/.*from/,  // Malformed import paths
      /error TS1/,      // Files that cause TS1xxx syntax errors
      /\s+from\s+'/,    // Malformed from statements
      /\s+\.\.\//,      // Malformed relative paths
      /\s+,\s+from\s+/, // Malformed import syntax
      /\s+\.\.\s+from\s+/, // More malformed imports
      /\s+,\.\.\//      // Comma before relative path
    ];
    
    return corruptionPatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return false;
  }
}

// Process files
let deletedCount = 0;
let skippedCount = 0;

console.log(`\n📊 Processing ${corruptedFiles.length} potentially corrupted files...`);

for (const filePath of corruptedFiles) {
  const fullPath = path.join(ROOT_DIR, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    continue;
  }
  
  if (isCriticalFile(filePath)) {
    console.log(`🔒 Skipping critical file: ${filePath}`);
    skippedCount++;
    continue;
  }
  
  if (isFileCorrupted(fullPath)) {
    if (DRY_RUN) {
      console.log(`🗑️ Would delete corrupted: ${filePath}`);
    } else {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Deleted corrupted: ${filePath}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Failed to delete ${filePath}:`, error.message);
      }
    }
  } else {
    console.log(`ℹ️ File appears clean: ${filePath}`);
    skippedCount++;
  }
}

// Summary
console.log(`\n🎯 Corrupted Files Cleanup Summary:`);
console.log(`📊 Files processed: ${corruptedFiles.length}`);
console.log(`🗑️ Files deleted: ${DRY_RUN ? 'DRY RUN' : deletedCount}`);
console.log(`🔒 Files skipped (critical): ${skippedCount}`);

if (DRY_RUN) {
  console.log('\n🚀 Run without --dry-run to apply deletions');
} else {
  console.log('\n✅ Corrupted syntax files removed!');
  console.log('🔧 Next: Run yarn tsc --noEmit to check for remaining errors');
} 