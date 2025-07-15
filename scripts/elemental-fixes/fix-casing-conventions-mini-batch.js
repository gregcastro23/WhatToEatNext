/**
 * MINI-BATCH VERSION - Ultra cautious casing fixes with 10 files per batch
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const BATCH_SIZE = 10;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Define standardized casing maps
const zodiacMap = {
  'Aries': 'aries',
  'Taurus': 'taurus', 
  'Gemini': 'gemini',
  'Cancer': 'cancer',
  'Leo': 'leo',
  'Virgo': 'virgo',
  'Libra': 'libra',
  'Scorpio': 'scorpio',
  'Sagittarius': 'sagittarius',
  'Capricorn': 'capricorn',
  'Aquarius': 'aquarius',
  'Pisces': 'pisces'
};

const elementMap = {
  'fire': 'Fire',
  'water': 'Water',
  'earth': 'Earth',
  'air': 'Air'
};

let totalProcessed = 0;
let totalModified = 0;
let totalErrors = 0;

async function processFile(filePath) {
  try {
    totalProcessed++;
    console.log(`  Processing: ${path.relative(rootDir, filePath)}`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    let newContent = content;
    let modified = false;
    const changes = [];

    // Apply zodiac sign casing corrections (property names only)
    Object.entries(zodiacMap).forEach(([capitalized, lowercase]) => {
      const quotedRegex = new RegExp(`(['"])${capitalized}\\1\\s*:`, 'g');
      const matches = newContent.match(quotedRegex);
      if (matches) {
        newContent = newContent.replace(quotedRegex, (match, quote) => {
          changes.push(`${capitalized} → ${lowercase}`);
          modified = true;
          return `${quote}${lowercase}${quote}:`;
        });
      }
    });

    // Apply element casing corrections (property values only)
    Object.entries(elementMap).forEach(([lowercase, properCase]) => {
      const valueRegex = new RegExp(`:\\s*(['"])${lowercase}\\1`, 'g');
      const matches = newContent.match(valueRegex);
      if (matches) {
        newContent = newContent.replace(valueRegex, (match, quote) => {
          changes.push(`${lowercase} → ${properCase}`);
          modified = true;
          return `: ${quote}${properCase}${quote}`;
        });
      }
    });

    if (changes.length > 0) {
      console.log(`    ✨ Changes: ${changes.join(', ')}`);
    }

    if (modified) {
      totalModified++;
      if (!DRY_RUN) {
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`    ✅ Applied changes`);
      } else {
        console.log(`    🔍 Would apply changes (dry run)`);
      }
    }
  } catch (error) {
    totalErrors++;
    console.error(`    ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log(`🔧 MINI-BATCH CASING FIX - ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Processing in ultra-safe batches of ${BATCH_SIZE} files`);
  
  const files = globSync([
    'src/**/*.{ts,tsx,js,jsx}',
    'calculations/**/*.{ts,tsx,js,jsx}',
    'utils/**/*.{ts,tsx,js,jsx}',
    'data/**/*.{ts,tsx,js,jsx}'
  ], { 
    cwd: rootDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'] 
  });
  
  // Exclude files we already processed
  const processedFiles = [
    'src/data/planets/sun.ts',
    'src/config/index.ts', 
    'src/constants/elementalCore.ts',
    'src/data/planets/moon.ts',
    'src/data/planets/mars.ts'
  ];
  
  const remainingFiles = files.filter(file => 
    !processedFiles.some(processed => file.endsWith(processed))
  );
  
  console.log(`Found ${remainingFiles.length} remaining files to process`);
  console.log(`(${processedFiles.length} files already processed in safe test)`);
  
  // Process files in mini-batches
  for (let i = 0; i < remainingFiles.length; i += BATCH_SIZE) {
    const batch = remainingFiles.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(remainingFiles.length / BATCH_SIZE);
    
    console.log(`\n📦 Mini-Batch ${batchNum}/${totalBatches} (${batch.length} files)`);
    
    for (const file of batch) {
      await processFile(file);
    }
    
    console.log(`\n📊 Mini-Batch ${batchNum} Complete:`);
    console.log(`  Processed: ${batch.length} files`);
    console.log(`  Modified: ${totalModified} total so far`);
    console.log(`  Errors: ${totalErrors}`);
    
    // Pause between batches for caution
    if (i + BATCH_SIZE < remainingFiles.length) {
      console.log(`\n⏸️  Pausing... (${totalProcessed}/${remainingFiles.length} complete)`);
    }
  }
  
  console.log('\n🎯 FINAL SUMMARY:');
  console.log(`  Total files processed: ${totalProcessed}`);
  console.log(`  Total files modified: ${totalModified}`);
  console.log(`  Total errors: ${totalErrors}`);
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'}`);
  
  if (DRY_RUN) {
    console.log('\n🚀 To apply changes:');
    console.log('node scripts/elemental-fixes/fix-casing-conventions-mini-batch.js --execute');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 