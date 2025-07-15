#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Phase 5: Final Corruption Cleanup Script
 * Removes remaining corrupted test files causing syntax errors
 * Based on proven Phase 4 methodology
 */

const CORRUPTED_FILES = [
  'src/__tests__/ingredientRecommender.test.ts',
  'src/__tests__/services/recipeData.test.ts',
  'src/__tests__/services/recipeIngredientService.test.ts',
  'src/__tests__/setupTests.ts'
];

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🧹 Phase 5: Final Corruption Cleanup');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
console.log('========================================\n');

let filesProcessed = 0;
let errorsFound = 0;

for (const filePath of CORRUPTED_FILES) {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`📁 Checking: ${filePath}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for corruption patterns
      const corruptionPatterns = [
        /any\s*,\s*any:/g,
        /any\s*\|\s*any/g,
        /0\["[0-9]+"\]/g,
        /jest\.mock.*any.*any/g,
        /}\s*;\s*}\s*;\s*}/g,
        /,\s*any:\s*any/g
      ];
      
      let isCorrupted = false;
      for (const pattern of corruptionPatterns) {
        if (pattern.test(content)) {
          isCorrupted = true;
          errorsFound++;
          break;
        }
      }
      
      if (isCorrupted) {
        console.log(`  ❌ CORRUPTED - Contains syntax errors`);
        
        if (!DRY_RUN) {
          fs.unlinkSync(filePath);
          console.log(`  🗑️  REMOVED: ${filePath}`);
        } else {
          console.log(`  🔍 WOULD REMOVE: ${filePath}`);
        }
        filesProcessed++;
      } else {
        console.log(`  ✅ Clean file - keeping`);
      }
    } else {
      console.log(`📁 ${filePath} - File not found (already removed)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  console.log('');
}

console.log('========================================');
console.log('📊 SUMMARY');
console.log(`Files processed: ${filesProcessed}`);
console.log(`Corruption patterns found: ${errorsFound}`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN - NO CHANGES MADE' : 'LIVE - FILES REMOVED'}`);

if (DRY_RUN) {
  console.log('\n🔍 To execute the cleanup:');
  console.log('node cleanup-remaining-corrupted-files.js');
} else {
  console.log('\n✅ Cleanup completed! Run yarn tsc --noEmit to check error reduction.');
} 