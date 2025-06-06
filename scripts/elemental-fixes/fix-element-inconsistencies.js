// Element Inconsistency Fixer Script
// Fixes inconsistent element naming (fire → Fire, water → Water, Air → Air, earth → earth)
// Includes dry run capability to preview changes

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

// Element replacement patterns
const ELEMENT_PATTERNS = [
  // Lowercase variants (incorrect)
  { pattern: /\b(fire)\b(?![-_])/g, replacement: 'Fire' },
  { pattern: /\b(water)\b(?![-_])/g, replacement: 'Water' },
  { pattern: /\b(Air)\b(?![-_])/g, replacement: 'Air' },
  { pattern: /\b(earth)\b(?![-_])/g, replacement: 'Earth' }
];

// Directories to scan
const DIRS_TO_SCAN = [
  'src/calculations',
  'src/utils/elemental',
  'src/utils/elementalMappings',
  'src/data/unified',
  'src/components/recommendations',
  'src/components/FoodRecommender',
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /__tests__/,
  /node_modules/,
  /\.d\.ts$/,
];

// Files with special handling (e.g., exclude from fixes)
const SPECIAL_HANDLING = [
  // Add files that need special handling or should be excluded here
];

// Get all relevant files
console.log(`Finding files in: ${DIRS_TO_SCAN.join(', ')}`);
const files = DIRS_TO_SCAN.flatMap(dir => 
  globSync(`${dir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['**/node_modules/**'] })
);

console.log(`\nRunning in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);
console.log(`Found ${files.length} files to process`);

// Counters for summary
let totalFilesModified = 0;
let totalReplacements = 0;
const modifiedFiles = [];

// Process each file
files.forEach(filePath => {
  // Skip excluded files
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath)) || 
      SPECIAL_HANDLING.includes(filePath)) {
    if (isVerbose) {
      console.log(`Skipping excluded file: ${filePath}`);
    }
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;
    let fileReplacements = 0;
    let modifiedContent = content;

    // Apply each replacement pattern
    ELEMENT_PATTERNS.forEach(({ pattern, replacement }) => {
      // Count matches before replacement
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        fileReplacements += matches.length;
        
        // Apply replacement
        modifiedContent = modifiedContent.replace(pattern, replacement);
        fileModified = true;
        
        if (isVerbose) {
          console.log(`  - ${filePath}: Replacing ${matches.length} instances of '${pattern}' with '${replacement}'`);
        }
      }
    });

    // Update counters and save changes if needed
    if (fileModified) {
      totalFilesModified++;
      totalReplacements += fileReplacements;
      
      modifiedFiles.push({
        file: filePath,
        replacements: fileReplacements
      });
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, modifiedContent, 'utf8');
        console.log(`✓ Fixed ${fileReplacements} element${fileReplacements > 1 ? 's' : ''} in: ${filePath}`);
      } else if (!isVerbose) {
        console.log(`Would fix ${fileReplacements} element${fileReplacements > 1 ? 's' : ''} in: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// Print summary
console.log('\n===== ELEMENT CONSISTENCY FIX SUMMARY =====');
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes made)' : 'LIVE (files updated)'}`);
console.log(`Total files processed: ${files.length}`);
console.log(`Files with element inconsistencies: ${totalFilesModified}`);
console.log(`Total element fixes: ${totalReplacements}`);

// Save report to file
const reportData = {
  timestamp: new Date().toISOString(),
  mode: isDryRun ? 'dry-run' : 'live',
  totalFilesProcessed: files.length,
  totalFilesModified,
  totalReplacements,
  modifiedFiles
};

const reportPath = path.join(process.cwd(), 'element-fixes-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`\nReport saved to: ${reportPath}`);

console.log('\nDone!');

// Usage instructions
if (isDryRun) {
  console.log('\nTo apply these changes, run the script without the --dry-run flag:');
  console.log('node scripts/elemental-fixes/fix-element-inconsistencies.js');
} 