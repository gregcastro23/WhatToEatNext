#!/usr/bin/env node

/**
 * Cleanup Script for Planetary Positions Files
 * 
 * This script removes corrupted and redundant files from the planetary positions
 * functionality to streamline the codebase.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Files to remove (corrupted/redundant)
const filesToRemove = [
  'src/app/api/astrology/route.ts',
  'src/services/astrologyApi.ts',
  'src/types/CurrentChart.ts',
  'src/utils/astroEvents.ts',
  'src/utils/astrologyValidation.ts',
  'src/utils/astronomiaCalculator.ts',
  'src/utils/reliableAstronomy.ts',
  'src/utils/safeAccess.ts',
  'src/utils/planetCalculations.ts',
  'src/utils/solarPositions.ts',
  'src/utils/planetInfoUtils.ts',
  'src/utils/planetaryConsistencyCheck.ts'
];

// Check if dry run mode
const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!(await fileExists(fullPath))) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  if (isDryRun) {
    console.log(`🔍 [DRY RUN] Would remove: ${filePath}`);
    return true;
  }
  
  try {
    await fs.unlink(fullPath);
    console.log(`✅ Removed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to remove ${filePath}:`, error.message);
    return false;
  }
}

async function analyzeFile(filePath) {
  const fullPath = path.join(projectRoot, filePath);
  
  if (!(await fileExists(fullPath))) {
    return { exists: false, size: 0, lines: 0 };
  }
  
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const stats = await fs.stat(fullPath);
    
    return {
      exists: true,
      size: stats.size,
      lines: content.split('\n').length,
      lastModified: stats.mtime
    };
  } catch (error) {
    return { exists: true, size: 0, lines: 0, error: error.message };
  }
}

async function main() {
  console.log('🧹 Planetary Positions Cleanup Script');
  console.log('=====================================');
  
  if (isDryRun) {
    console.log('🔍 Running in DRY RUN mode - no files will be deleted');
  } else {
    console.log('⚠️  LIVE MODE - files will be permanently deleted');
  }
  
  console.log('');
  
  // Analyze files first
  console.log('📊 File Analysis:');
  console.log('------------------');
  
  let totalSize = 0;
  let totalLines = 0;
  let existingFiles = 0;
  
  for (const filePath of filesToRemove) {
    const analysis = await analyzeFile(filePath);
    
    if (analysis.exists) {
      existingFiles++;
      totalSize += analysis.size;
      totalLines += analysis.lines;
      
      const sizeKB = (analysis.size / 1024).toFixed(1);
      console.log(`📄 ${filePath}`);
      console.log(`   Size: ${sizeKB} KB, Lines: ${analysis.lines}`);
      
      if (analysis.error) {
        console.log(`   ⚠️  Error: ${analysis.error}`);
      }
    } else {
      console.log(`❌ ${filePath} (not found)`);
    }
  }
  
  console.log('');
  console.log(`📈 Summary: ${existingFiles} files, ${(totalSize / 1024).toFixed(1)} KB total, ${totalLines} lines`);
  console.log('');
  
  // Confirm deletion in live mode
  if (!isDryRun) {
    console.log('⚠️  This will permanently delete the files listed above.');
    console.log('   Make sure you have committed your changes to git first.');
    console.log('');
    
    // In a real environment, you might want to add a confirmation prompt
    // For now, we'll proceed automatically
  }
  
  // Remove files
  console.log('🗑️  File Removal:');
  console.log('------------------');
  
  let removedCount = 0;
  let failedCount = 0;
  
  for (const filePath of filesToRemove) {
    const success = await removeFile(filePath);
    if (success) {
      removedCount++;
    } else {
      failedCount++;
    }
  }
  
  console.log('');
  console.log('📊 Cleanup Results:');
  console.log('--------------------');
  
  if (isDryRun) {
    console.log(`🔍 [DRY RUN] Would remove ${removedCount} files`);
    console.log(`⚠️  ${failedCount} files not found or would fail`);
  } else {
    console.log(`✅ Successfully removed ${removedCount} files`);
    console.log(`❌ Failed to remove ${failedCount} files`);
  }
  
  console.log('');
  console.log('🎯 Streamlined Files Remaining:');
  console.log('--------------------------------');
  console.log('✅ src/app/api/planetary-positions/route.ts (main API)');
  console.log('✅ src/utils/streamlinedPlanetaryPositions.ts (new utility)');
  console.log('✅ src/utils/astrologyUtils.ts (core utilities)');
  console.log('✅ src/utils/validatePlanetaryPositions.ts (validation)');
  console.log('✅ src/components/PlanetaryPositionInitializer.tsx (component)');
  console.log('✅ src/components/PlanetaryPositionDisplay.tsx (display)');
  console.log('✅ src/components/PlanetaryPositionValidation.tsx (validation UI)');
  
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('---------------');
  console.log('1. Test the streamlined planetary positions functionality');
  console.log('2. Update any remaining imports to use streamlinedPlanetaryPositions');
  console.log('3. Run yarn build to ensure everything compiles');
  console.log('4. Test the alchemizer with the new positions');
  
  if (isDryRun) {
    console.log('');
    console.log('💡 To actually remove files, run: node scripts/cleanup-planetary-positions.mjs');
  }
}

// Handle errors gracefully
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 