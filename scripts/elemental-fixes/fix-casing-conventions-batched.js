/**
 * BATCHED VERSION - Script to standardize casing conventions in small batches
 * Processes 20 files at a time to allow monitoring and early stopping if needed
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Set up dry run flag - default to true for safety
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
const BATCH_SIZE = 20;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Define standardized casing maps (focused on real issues)
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

// Element map for common lowercase issues
const elementMap = {
  'fire': 'Fire',
  'water': 'Water',
  'earth': 'Earth',
  'air': 'Air'
};

// Files counter
let totalProcessed = 0;
let totalModified = 0;
let totalErrors = 0;

// Function to handle file processing with proper error handling
async function processFile(filePath) {
  try {
    totalProcessed++;
    console.log(`  Processing: ${path.relative(rootDir, filePath)}`);
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    let newContent = content;
    let modified = false;
    const changes = [];

    // Apply zodiac sign casing corrections (in object properties only)
    Object.entries(zodiacMap).forEach(([capitalized, lowercase]) => {
      // Match as object property names (quoted) - very specific pattern
      const quotedRegex = new RegExp(`(['"])${capitalized}\\1\\s*:`, 'g');
      const matches = newContent.match(quotedRegex);
      if (matches) {
        newContent = newContent.replace(quotedRegex, (match, quote) => {
          changes.push(`${capitalized} -> ${lowercase} (property)`);
          modified = true;
          return `${quote}${lowercase}${quote}:`;
        });
      }
    });

    // Apply element casing corrections (lowercase to proper case)
    Object.entries(elementMap).forEach(([lowercase, properCase]) => {
      // Match element names in property values, but be very careful
      const valueRegex = new RegExp(`:\\s*(['"])${lowercase}\\1`, 'g');
      const matches = newContent.match(valueRegex);
      if (matches) {
        newContent = newContent.replace(valueRegex, (match, quote) => {
          // Only change if it's clearly an element value, not part of a word
          changes.push(`${lowercase} -> ${properCase} (element)`);
          modified = true;
          return `: ${quote}${properCase}${quote}`;
        });
      }
    });

    // Report changes
    if (changes.length > 0) {
      console.log(`    Changes: ${changes.join(', ')}`);
    }

    // Save changes if not in dry run mode and content was modified
    if (modified) {
      totalModified++;
      if (!DRY_RUN) {
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`    ✅ Fixed casing in: ${path.relative(rootDir, filePath)}`);
      } else {
        console.log(`    🔍 Would fix casing (dry run)`);
      }
    }
  } catch (error) {
    totalErrors++;
    console.error(`    ❌ Error processing ${path.relative(rootDir, filePath)}:`, error.message);
  }
}

// Function to prompt user to continue
function promptContinue() {
  return new Promise((resolve) => {
    if (DRY_RUN) {
      // In dry run, continue automatically
      resolve(true);
      return;
    }
    
    console.log('\n⏸️  Batch complete. Review the changes above.');
    console.log('Press Enter to continue with next batch, or Ctrl+C to stop...');
    
    process.stdin.once('data', () => {
      resolve(true);
    });
  });
}

// Main function to process files in batches
async function main() {
  console.log(`🔍 BATCHED VERSION - Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Processing files in batches of ${BATCH_SIZE}`);
  
  // Find all relevant files
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
  
  console.log(`Found ${files.length} files to process`);
  
  // Process files in batches
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(files.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (files ${i + 1}-${Math.min(i + BATCH_SIZE, files.length)})`);
    
    // Process all files in this batch
    for (const file of batch) {
      await processFile(file);
    }
    
    console.log(`\n📊 Batch ${batchNum} Summary:`);
    console.log(`  Files processed: ${Math.min(BATCH_SIZE, files.length - i)}`);
    console.log(`  Files modified in this batch: ${totalModified - (batchNum - 1) * BATCH_SIZE}`);
    console.log(`  Total progress: ${totalProcessed}/${files.length} files`);
    
    // Ask user to continue (except for last batch)
    if (i + BATCH_SIZE < files.length) {
      if (!DRY_RUN) {
        await promptContinue();
      }
    }
  }
  
  console.log('\n=== FINAL SUMMARY ===');
  console.log(`Total files processed: ${totalProcessed}`);
  console.log(`Total files modified: ${totalModified}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'EXECUTE (changes applied)'}`);
  
  if (DRY_RUN) {
    console.log('\n🚀 To apply these changes, run:');
    console.log('node scripts/elemental-fixes/fix-casing-conventions-batched.js --execute');
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 