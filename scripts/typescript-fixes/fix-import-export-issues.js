#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Import/Export Issues - Phase 2 Type Errors');
console.log('================================================');

if (DRY_RUN) {
  console.log('🏃 DRY RUN MODE - No files will be modified');
  console.log('');
}

let changesMade = 0;

// Helper function to apply changes
function applyFix(filePath, content, description) {
  if (DRY_RUN) {
    console.log(`Would fix: ${filePath}`);
    console.log(`  - ${description}`);
    return;
  }
  
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    console.log(`  - ${description}`);
    changesMade++;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// 1. Fix missing elementalUtils exports
function fixElementalUtilsExports() {
  console.log('\n1. Adding missing exports to elementalUtils.ts');
  
  const filePath = path.join(ROOT_DIR, 'src/utils/elementalUtils.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ elementalUtils.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add the missing functions
  const missingFunctions = `
/**
 * Fixes ingredient mappings to ensure proper elemental properties
 */
export function fixIngredientMappings(ingredients: any): any {
  if (!ingredients || typeof ingredients !== 'object') {
    return {};
  }
  
  // If it's already a proper ingredient mapping, return as-is
  if (ingredients.elementalProperties) {
    return ingredients;
  }
  
  // Convert raw ingredient data to proper mappings
  const result: any = {};
  
  Object.entries(ingredients).forEach(([key, value]: [string, any]) => {
    if (value && typeof value === 'object') {
      result[key] = {
        ...value,
        elementalProperties: value.elementalProperties || normalizeProperties({
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        })
      };
    } else {
      // Handle primitive values
      result[key] = {
        name: key,
        elementalProperties: normalizeProperties({
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        })
      };
    }
  });
  
  return result;
}

/**
 * Enhances oil properties with proper elemental characteristics
 */
export function enhanceOilProperties(oils: any): any {
  if (!oils || typeof oils !== 'object') {
    return {};
  }
  
  return fixIngredientMappings(oils);
}

/**
 * Transforms items with planetary positions for alchemical calculations
 */
export function transformItemsWithPlanetaryPositions(
  items: any,
  planetaryPositions: any,
  isDaytime: boolean = true,
  currentZodiac?: string,
  lunarPhase?: string,
  tarotElementBoosts?: any,
  tarotPlanetaryBoosts?: any
): any {
  // Import the actual implementation from calculations
  try {
    const { transformItemsWithPlanetaryPositions: actualTransform } = require('@/calculations/alchemicalTransformation');
    return actualTransform(items, planetaryPositions, isDaytime, currentZodiac, lunarPhase, tarotElementBoosts, tarotPlanetaryBoosts);
  } catch (error) {
    console.warn('Could not import transformItemsWithPlanetaryPositions, using fallback');
    return items; // Fallback to original items
  }
}
`;

  // Add before the export default statement
  const exportDefaultRegex = /export default elementalUtils;/;
  if (exportDefaultRegex.test(content)) {
    content = content.replace(exportDefaultRegex, `${missingFunctions}\nexport default elementalUtils;`);
    applyFix(filePath, content, 'Added missing export functions: fixIngredientMappings, enhanceOilProperties, transformItemsWithPlanetaryPositions');
  } else {
    console.log('⚠️ Could not find export default statement in elementalUtils.ts');
  }
}

// 2. Fix planetary positions route import
function fixPlanetaryPositionsRoute() {
  console.log('\n2. Fixing planetary positions route import');
  
  const filePath = path.join(ROOT_DIR, 'src/app/api/planetary-positions/route.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ planetary-positions route not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add the missing import
  const importLine = "import { getCurrentPlanetaryPositions, getPlanetaryPositionsForDateTime } from '@/services/astrologizeApi';";
  
  // Check if import already exists - more accurate check
  if (content.includes('from \'@/services/astrologizeApi\'') || content.includes('from "@/services/astrologizeApi"')) {
    console.log('✅ astrologizeApi import already exists');
    return;
  }
  
  // Add import after existing imports
  const existingImports = content.match(/import[^;]+;/g) || [];
  if (existingImports.length > 0) {
    const lastImportIndex = content.lastIndexOf(existingImports[existingImports.length - 1]) + existingImports[existingImports.length - 1].length;
    content = content.slice(0, lastImportIndex) + '\n' + importLine + content.slice(lastImportIndex);
  } else {
    // No imports found, add at the beginning
    content = importLine + '\n' + content;
  }
  
  applyFix(filePath, content, 'Added missing import for getPlanetaryPositionsForDateTime and getCurrentPlanetaryPositions');
}

// 3. Fix ConsolidatedRecipeService export
function fixConsolidatedRecipeServiceExport() {
  console.log('\n3. Fixing ConsolidatedRecipeService export');
  
  const filePath = path.join(ROOT_DIR, 'src/services/ConsolidatedRecipeService.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ ConsolidatedRecipeService.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if consolidatedRecipeService is already exported
  if (content.includes('export const consolidatedRecipeService') || content.includes('export { consolidatedRecipeService }')) {
    console.log('✅ consolidatedRecipeService export already exists');
    return;
  }
  
  // Add export at the end of the file
  const exportLine = '\nexport const consolidatedRecipeService = new ConsolidatedRecipeService();\n';
  
  // Check if there's already a class export/instance
  if (content.includes('class ConsolidatedRecipeService')) {
    content += exportLine;
    applyFix(filePath, content, 'Added export for consolidatedRecipeService instance');
  } else {
    console.log('⚠️ ConsolidatedRecipeService class not found');
  }
}

// 4. Fix LegacyRecipeAdapter default export
function fixLegacyRecipeAdapterExport() {
  console.log('\n4. Fixing LegacyRecipeAdapter default export');
  
  const filePath = path.join(ROOT_DIR, 'src/services/adapters/LegacyRecipeAdapter.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ LegacyRecipeAdapter.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if default export exists
  if (content.includes('export default')) {
    console.log('✅ LegacyRecipeAdapter default export already exists');
    return;
  }
  
  // Add default export
  if (content.includes('export class LegacyRecipeAdapter') || content.includes('export { LegacyRecipeAdapter }')) {
    content += '\nexport default LegacyRecipeAdapter;\n';
    applyFix(filePath, content, 'Added default export for LegacyRecipeAdapter');
  } else if (content.includes('class LegacyRecipeAdapter')) {
    // Make the class exported and add default export
    content = content.replace('class LegacyRecipeAdapter', 'export class LegacyRecipeAdapter');
    content += '\nexport default LegacyRecipeAdapter;\n';
    applyFix(filePath, content, 'Made LegacyRecipeAdapter class exported and added default export');
  } else {
    console.log('⚠️ LegacyRecipeAdapter class not found');
  }
}

// 5. Fix recipeUtils missing export
function fixRecipeUtilsExport() {
  console.log('\n5. Fixing recipeUtils missing export');
  
  const filePath = path.join(ROOT_DIR, 'src/utils/recipe/recipeUtils.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ recipeUtils.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if isRecipeDietaryCompatible is already exported
  if (content.includes('export') && content.includes('isRecipeDietaryCompatible')) {
    console.log('✅ isRecipeDietaryCompatible export already exists');
    return;
  }
  
  // Add the missing function if it doesn't exist
  if (!content.includes('isRecipeDietaryCompatible')) {
    const missingFunction = `
/**
 * Checks if a recipe is compatible with dietary restrictions
 */
export function isRecipeDietaryCompatible(recipe: any, dietaryRestrictions: string[] = []): boolean {
  if (!recipe || !dietaryRestrictions.length) {
    return true;
  }
  
  // Check if recipe has dietary tags or properties
  const recipeTags = recipe.tags || recipe.dietaryTags || [];
  const recipeIngredients = recipe.ingredients || [];
  
  // Simple compatibility check
  for (const restriction of dietaryRestrictions) {
    const restrictionLower = restriction.toLowerCase();
    
    // Check if recipe explicitly supports this dietary restriction
    if (recipeTags.some((tag: string) => tag.toLowerCase().includes(restrictionLower))) {
      continue;
    }
    
    // Basic ingredient checks for common restrictions
    if (restrictionLower.includes('vegan') || restrictionLower.includes('vegetarian')) {
      const hasAnimalProducts = recipeIngredients.some((ing: any) => 
        (ing.name || ing).toLowerCase().includes('meat') ||
        (ing.name || ing).toLowerCase().includes('chicken') ||
        (ing.name || ing).toLowerCase().includes('beef') ||
        (ing.name || ing).toLowerCase().includes('pork')
      );
      if (hasAnimalProducts) return false;
    }
    
    if (restrictionLower.includes('gluten-free')) {
      const hasGluten = recipeIngredients.some((ing: any) => 
        (ing.name || ing).toLowerCase().includes('wheat') ||
        (ing.name || ing).toLowerCase().includes('flour') ||
        (ing.name || ing).toLowerCase().includes('bread')
      );
      if (hasGluten) return false;
    }
  }
  
  return true;
}
`;
    content += missingFunction;
    applyFix(filePath, content, 'Added missing isRecipeDietaryCompatible function');
  } else {
    // Function exists but might not be exported
    content = content.replace(/function isRecipeDietaryCompatible/, 'export function isRecipeDietaryCompatible');
    applyFix(filePath, content, 'Made isRecipeDietaryCompatible function exported');
  }
}

// 6. Fix missing getCurrentPlanetaryPositions import in route
function fixCurrentPlanetaryPositionsImport() {
  console.log('\n6. Fixing getCurrentPlanetaryPositions usage in route');
  
  const filePath = path.join(ROOT_DIR, 'src/app/api/planetary-positions/route.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ planetary-positions route not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if getCurrentPlanetaryPositions is used but not imported
  if (content.includes('getCurrentPlanetaryPositions') && !content.includes('import') && content.includes('getCurrentPlanetaryPositions')) {
    console.log('✅ getCurrentPlanetaryPositions import should be handled by previous fix');
    return;
  }
  
  // Also ensure we handle the case where getCurrentPlanetaryPositions is called
  if (content.includes('getCurrentPlanetaryPositions(location)') && !content.includes('@/services/astrologizeApi')) {
    // The import should already be added by fixPlanetaryPositionsRoute
    console.log('✅ Import should be handled by previous planetary positions fix');
  }
}

// Run all fixes
console.log('Starting import/export fixes...\n');

fixElementalUtilsExports();
fixPlanetaryPositionsRoute();
fixConsolidatedRecipeServiceExport();
fixLegacyRecipeAdapterExport();
fixRecipeUtilsExport();
fixCurrentPlanetaryPositionsImport();

console.log('\n' + '='.repeat(50));
console.log(`Import/Export fixes completed!`);
console.log(`Changes made: ${changesMade}`);

if (DRY_RUN) {
  console.log('\n⚠️  This was a dry run. No files were actually modified.');
  console.log('Run without --dry-run to apply the changes.');
} else {
  console.log('\n✅ Files have been modified.');
  console.log('🔍 Next step: Run "yarn build" to test the fixes.');
} 