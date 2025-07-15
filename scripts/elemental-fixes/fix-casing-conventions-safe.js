/**
 * SAFE VERSION - Script to test casing conventions on a small subset of files
 * This version only processes 5 specific files to test the logic
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Set up dry run flag - default to true for safety
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Test with only these specific files
const TEST_FILES = [
  'src/data/planets/sun.ts',
  'src/config/index.ts',
  'src/constants/elementalCore.ts',
  'src/data/planets/moon.ts',
  'src/data/planets/mars.ts'
];

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

// Files counter
let processedFiles = 0;
let modifiedFiles = 0;
let errorFiles = 0;

// Function to handle file processing with proper error handling
async function processFile(filePath) {
  try {
    processedFiles++;
    console.log(`Processing: ${filePath}`);
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    let newContent = content;
    let modified = false;

    // Track specific changes
    const changes = [];

    // Apply zodiac sign casing corrections (in object properties)
    Object.entries(zodiacMap).forEach(([capitalized, lowercase]) => {
      // Match as object property names (quoted)
      const quotedRegex = new RegExp(`(['"])${capitalized}\\1\\s*:`, 'g');
      const quotedMatches = newContent.match(quotedRegex);
      if (quotedMatches) {
        newContent = newContent.replace(quotedRegex, (match, quote) => {
          changes.push(`${capitalized} -> ${lowercase} (property)`);
          modified = true;
          return `${quote}${lowercase}${quote}:`;
        });
      }
    });

    // Log changes for verification
    if (changes.length > 0) {
      console.log(`  Changes for ${filePath}:`);
      changes.forEach(change => console.log(`    - ${change}`));
    }

    // Save changes if not in dry run mode and content was modified
    if (modified) {
      modifiedFiles++;
      if (!DRY_RUN) {
        await fs.writeFile(filePath, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${filePath}`);
      } else {
        console.log(`🔍 Would fix casing in: ${filePath} (dry run)`);
      }
    } else {
      console.log(`  No changes needed for: ${filePath}`);
    }
  } catch (error) {
    errorFiles++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function to process test files
async function main() {
  console.log(`🔍 SAFE TEST VERSION - Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Testing on ${TEST_FILES.length} specific files only`);
  
  for (const relativePath of TEST_FILES) {
    const fullPath = path.resolve(rootDir, relativePath);
    try {
      await fs.access(fullPath);
      await processFile(fullPath);
    } catch (error) {
      console.log(`⚠️  File not found, skipping: ${relativePath}`);
    }
  }
  
  console.log('\n=== SAFE TEST SUMMARY ===');
  console.log(`Total files processed: ${processedFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Files with errors: ${errorFiles}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'EXECUTE (changes applied)'}`);
  
  if (DRY_RUN) {
    console.log('\n🚀 To apply these changes, run:');
    console.log('node scripts/elemental-fixes/fix-casing-conventions-safe.js --execute');
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 