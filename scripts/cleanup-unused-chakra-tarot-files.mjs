#!/usr/bin/env node

/**
 * Cleanup Script for Unused Chakra and Tarot Files
 * 
 * This script removes files that were analyzed and their functionality
 * has been extracted and integrated into the EnhancedRecommendationService.
 * 
 * Run with: node scripts/cleanup-unused-chakra-tarot-files.mjs --dry-run
 * Or: node scripts/cleanup-unused-chakra-tarot-files.mjs --execute
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Files to be removed after functionality extraction
const filesToRemove = [
  // Tarot context files - functionality moved to EnhancedRecommendationService
  'src/context/TarotContext.tsx',
  'src/contexts/TarotContext/hooks.ts',
  'src/contexts/TarotContext/provider.tsx',
  
  // Theme context files - not being used
  'src/contexts/ThemeContext/hooks.ts',
  'src/contexts/ThemeContext/provider.tsx',
  
  // Unused tarot hook
  'src/hooks/useTarotAstrologyData.ts',
  
  // Unused header components
  'src/components/Header/TarotFoodDisplay.tsx',
  
  // Standalone chakra display - functionality integrated into enhanced recommender
  'src/components/ChakraDisplay.tsx',
  
  // Unused utility files - functionality moved to enhanced service
  'src/utils/timeFactors.ts',
  'src/utils/timingUtils.ts',
  'src/utils/tarotUtils.ts',
  'src/utils/seasonalCalculations.ts',
  'src/utils/seasonalTransitions.ts',
  
  // Recipe chakra service - functionality integrated
  'src/services/RecipeChakraService.ts'
];

// Files to keep but note they're now integrated
const integratedFiles = [
  'src/services/ChakraService.ts', // Used by EnhancedRecommendationService
  'src/constants/chakraSymbols.ts', // Used by EnhancedRecommendationService
  'src/constants/chakraMappings.ts', // Used by EnhancedRecommendationService
  'src/lib/tarotCalculations.ts', // Used by EnhancedRecommendationService
  'src/lib/chakraRecipeEnhancer.ts', // Functionality extracted but keeping for reference
  'src/services/WiccanCorrespondenceService.ts' // Used by EnhancedRecommendationService
];

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`✅ Removed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove ${filePath}:`, error.message);
    return false;
  }
}

async function removeEmptyDirectories(dirPath) {
  try {
    const entries = await fs.readdir(dirPath);
    if (entries.length === 0) {
      await fs.rmdir(dirPath);
      console.log(`✅ Removed empty directory: ${dirPath}`);
      
      // Recursively check parent directory
      const parentDir = path.dirname(dirPath);
      if (parentDir !== dirPath && parentDir !== projectRoot) {
        await removeEmptyDirectories(parentDir);
      }
    }
  } catch (error) {
    // Directory doesn't exist or isn't empty, which is fine
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const shouldExecute = args.includes('--execute');
  
  if (!isDryRun && !shouldExecute) {
    console.log('❌ Please specify either --dry-run or --execute');
    console.log('Usage: node scripts/cleanup-unused-chakra-tarot-files.mjs [--dry-run|--execute]');
    process.exit(1);
  }
  
  console.log('🧹 Chakra and Tarot Files Cleanup Script');
  console.log('==========================================');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No files will be deleted');
  } else {
    console.log('⚠️  EXECUTION MODE - Files will be permanently deleted');
  }
  
  console.log('');
  
  // Check which files exist
  const existingFiles = [];
  const missingFiles = [];
  
  for (const file of filesToRemove) {
    const fullPath = path.join(projectRoot, file);
    if (await checkFileExists(fullPath)) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }
  
  console.log(`📊 Analysis:`);
  console.log(`   Files to remove: ${filesToRemove.length}`);
  console.log(`   Files found: ${existingFiles.length}`);
  console.log(`   Files already missing: ${missingFiles.length}`);
  console.log('');
  
  if (missingFiles.length > 0) {
    console.log('📝 Files already missing:');
    missingFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');
  }
  
  if (existingFiles.length === 0) {
    console.log('✅ All target files are already removed!');
    return;
  }
  
  console.log('🎯 Files to be removed:');
  existingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');
  
  console.log('📚 Files being kept (functionality integrated):');
  integratedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');
  
  if (isDryRun) {
    console.log('🔍 DRY RUN COMPLETE - No files were deleted');
    return;
  }
  
  // Execute removal
  console.log('🗑️  Starting file removal...');
  let removedCount = 0;
  const directoriesToCheck = new Set();
  
  for (const file of existingFiles) {
    const fullPath = path.join(projectRoot, file);
    if (await removeFile(fullPath)) {
      removedCount++;
      // Add directory to check for emptiness later
      directoriesToCheck.add(path.dirname(fullPath));
    }
  }
  
  // Remove empty directories
  console.log('');
  console.log('🗂️  Checking for empty directories...');
  for (const dir of directoriesToCheck) {
    await removeEmptyDirectories(dir);
  }
  
  console.log('');
  console.log('✅ Cleanup complete!');
  console.log(`   Files removed: ${removedCount}/${existingFiles.length}`);
  
  if (removedCount === existingFiles.length) {
    console.log('');
    console.log('🎉 All unused chakra and tarot files have been successfully removed!');
    console.log('   Their functionality has been integrated into:');
    console.log('   - src/services/EnhancedRecommendationService.ts');
    console.log('   - src/components/EnhancedIngredientRecommender.tsx');
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});