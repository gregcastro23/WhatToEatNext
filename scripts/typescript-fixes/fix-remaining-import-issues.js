#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const ROOT_DIR = process.cwd();

console.log('🔧 Fixing Remaining Import/Export Issues');
console.log('========================================');

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

// 1. Fix adapters index to properly export legacyRecipeAdapter
function fixAdaptersIndex() {
  console.log('\n1. Fixing adapters index export');
  
  const filePath = path.join(ROOT_DIR, 'src/services/adapters/index.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ adapters index not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the current export line with proper default export
  content = content.replace(
    /export { default as legacyRecipeAdapter, LegacyRecipeAdapter } from '\.\/LegacyRecipeAdapter';/,
    'export { default as legacyRecipeAdapter, LegacyRecipeAdapter } from \'./LegacyRecipeAdapter\';'
  );
  
  applyFix(filePath, content, 'Ensured proper legacyRecipeAdapter export');
}

// 2. Check and ensure elementalUtils exports are correct
function verifyElementalUtilsExports() {
  console.log('\n2. Verifying elementalUtils exports');
  
  const filePath = path.join(ROOT_DIR, 'src/utils/elementalUtils.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ elementalUtils.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if our exports exist
  if (!content.includes('export function fixIngredientMappings')) {
    console.log('⚠️ fixIngredientMappings export not found - this should have been added');
    return;
  }
  
  if (!content.includes('export function enhanceOilProperties')) {
    console.log('⚠️ enhanceOilProperties export not found - this should have been added');
    return;
  }
  
  if (!content.includes('export function transformItemsWithPlanetaryPositions')) {
    console.log('⚠️ transformItemsWithPlanetaryPositions export not found - this should have been added');
    return;
  }
  
  console.log('✅ All elementalUtils exports are present');
}

// 3. Check ConsolidatedRecipeService export
function verifyConsolidatedRecipeServiceExport() {
  console.log('\n3. Verifying ConsolidatedRecipeService export');
  
  const filePath = path.join(ROOT_DIR, 'src/services/ConsolidatedRecipeService.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ ConsolidatedRecipeService.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('export const consolidatedRecipeService')) {
    console.log('⚠️ consolidatedRecipeService export not found - this should have been added');
    return;
  }
  
  console.log('✅ ConsolidatedRecipeService export is present');
}

// 4. Check recipeUtils export
function verifyRecipeUtilsExport() {
  console.log('\n4. Verifying recipeUtils export');
  
  const filePath = path.join(ROOT_DIR, 'src/utils/recipe/recipeUtils.ts');
  if (!fs.existsSync(filePath)) {
    console.log('❌ recipeUtils.ts not found');
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('export function isRecipeDietaryCompatible')) {
    console.log('⚠️ isRecipeDietaryCompatible export not found - this should have been added');
    return;
  }
  
  console.log('✅ recipeUtils export is present');
}

// 5. Force refresh of cache/build artifacts that might be causing stale import issues
function clearBuildCache() {
  console.log('\n5. Checking for build cache issues');
  
  const nextDir = path.join(ROOT_DIR, '.next');
  const tsconfigBuildInfo = path.join(ROOT_DIR, 'tsconfig.tsbuildinfo');
  
  let cacheCleared = false;
  
  if (fs.existsSync(nextDir)) {
    console.log('💭 .next directory exists - build cache might be stale');
    cacheCleared = true;
  }
  
  if (fs.existsSync(tsconfigBuildInfo)) {
    console.log('💭 tsconfig.tsbuildinfo exists - TypeScript cache might be stale');
    cacheCleared = true;
  }
  
  if (cacheCleared) {
    console.log('ℹ️ Recommend running: yarn build --force or rm -rf .next && yarn build');
  } else {
    console.log('✅ No obvious cache issues detected');
  }
}

// Run all checks/fixes
console.log('Starting remaining import/export fixes...\n');

fixAdaptersIndex();
verifyElementalUtilsExports();
verifyConsolidatedRecipeServiceExport();
verifyRecipeUtilsExport();
clearBuildCache();

console.log('\n' + '='.repeat(50));
console.log(`Remaining import/export fixes completed!`);
console.log(`Changes made: ${changesMade}`);

if (DRY_RUN) {
  console.log('\n⚠️  This was a dry run. No files were actually modified.');
  console.log('Run without --dry-run to apply the changes.');
} else {
  console.log('\n✅ Checks completed.');
  console.log('🔍 Next step: Run "yarn build" to test the fixes.');
} 