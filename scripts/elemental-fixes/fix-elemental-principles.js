// Elemental Principles Fixer Script
// Fixes violations of elemental principles:
// - No opposing elements
// - Elements reinforce themselves
// - All element combinations can work together (min 0.7 compatibility)
// - No elemental "balancing"

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const isSingleFile = args.some(arg => arg.startsWith('--file='));
const targetFile = isSingleFile ? args.find(arg => arg.startsWith('--file=')).split('=')[1] : null;

// Problematic patterns and their fixes
const PATTERN_FIXES = [
  // Opposing elements -> each element is valuable in its own right
  { 
    pattern: /const\s+oppositeElements\s*=\s*{\s*Fire\s*:\s*['"]Water['"]\s*,\s*Water\s*:\s*['"]Fire['"]\s*,\s*earth\s*:\s*['"]Air['"]\s*,\s*Air\s*:\s*['"]earth['"]\s*}/g,
    replacement: `// Elements reinforce themselves, no opposites
const elementReinforcement = {
  Fire: 'Fire',
  Water: 'Water',
  Earth: 'Earth',
  Air: 'Air'
}`
  },
  // Opposing element function -> self-reinforcing function
  {
    pattern: /function\s+getOppositeElement\s*\(\s*element\s*\)\s*{\s*(?:const|let|var)?\s+opposites\s*=\s*{\s*Fire\s*:\s*['"]Water['"]\s*,\s*Water\s*:\s*['"]Fire['"]\s*,\s*earth\s*:\s*['"]Air['"]\s*,\s*Air\s*:\s*['"]earth['"]\s*}\s*;\s*return\s+opposites\s*\[\s*element\s*\]\s*;?\s*}/g,
    replacement: `// Each element complements itself most strongly
function getComplementaryElement(element) {
  // Each element reinforces itself most strongly
  const complementary = {
    Fire: 'Fire',  // Fire reinforces itself
    Water: 'Water', // Water reinforces itself
    Earth: 'Earth', // earth reinforces itself
    Air: 'Air'     // Air reinforces itself
  };
  return complementary[element];
}`
  },
  // Element balancing -> element matching based on individual qualities
  {
    pattern: /balance(?:d|s|ing)?\s+(?:Fire\s+with\s+Water|Water\s+with\s+Fire)/gi,
    replacement: `match Fire and Water based on their individual qualities`
  },
  {
    pattern: /balance(?:d|s|ing)?\s+(?:earth\s+with\s+Air|Air\s+with\s+earth)/gi,
    replacement: `match earth and Air based on their individual qualities`
  },
  // Low compatibility scores -> all combinations have good compatibility
  {
    pattern: /elementalCompatibility\s*=\s*{\s*(['"]Fire-Water['"]\s*:\s*)([0-5](?:\.\d+)?|0\.[0-6]\d*)/g,
    replacement: `elementalCompatibility = {
  $1 0.7`
  },
  {
    pattern: /elementalCompatibility\s*=\s*{\s*(['"]earth-Air['"]\s*:\s*)([0-5](?:\.\d+)?|0\.[0-6]\d*)/g,
    replacement: `elementalCompatibility = {
  $1 0.7`
  },
  // General compatibility function -> fix to use correct principles
  {
    pattern: /function\s+getElementalCompatibility\s*\(\s*element1\s*,\s*element2\s*\)\s*{\s*if\s*\(\s*element1\s*===\s*element2\s*\)\s*{\s*return\s+([0-9.]+)\s*;\s*}\s*(?:\/\/[^\n]*\s*)*(?:if\s*\(\s*\(\s*element1\s*===\s*['"]Fire['"]\s*&&\s*element2\s*===\s*['"]Water['"]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"]Water['"]\s*&&\s*element2\s*===\s*['"]Fire['"]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"]earth['"]\s*&&\s*element2\s*===\s*['"]Air['"]\s*\)\s*\|\|\s*\(\s*element1\s*===\s*['"]Air['"]\s*&&\s*element2\s*===\s*['"]earth['"]\s*\)\s*\)\s*{\s*return\s+([0-9.]+)\s*;\s*}\s*)+return\s+([0-9.]+)\s*;\s*}/g,
    replacement: `// CORRECT IMPLEMENTATION
function getElementalCompatibility(element1, element2) {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 0.9; // Same element has high compatibility
  }
  
  // All different element combinations have good compatibility
  return 0.7; // Different elements have good compatibility
}`
  }
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

// Get all relevant files
let files = [];
if (targetFile) {
  files = [targetFile];
  console.log(`Processing single file: ${targetFile}`);
} else {
  console.log(`Finding files in: ${DIRS_TO_SCAN.join(', ')}`);
  files = DIRS_TO_SCAN.flatMap(dir => 
    globSync(`${dir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['**/node_modules/**'] })
  );
  console.log(`Found ${files.length} files to process`);
}

console.log(`\nRunning in ${isDryRun ? 'DRY RUN' : 'LIVE'} mode`);

// Counters for summary
let totalFilesModified = 0;
let totalFixes = 0;
const modifiedFiles = [];

// Process each file
files.forEach(filePath => {
  // Skip excluded files unless it's the specifically targeted file
  if (!targetFile && EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))) {
    if (isVerbose) {
      console.log(`Skipping excluded file: ${filePath}`);
    }
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileModified = false;
    let fileFixes = 0;
    
    // Apply each pattern fix
    PATTERN_FIXES.forEach(({ pattern, replacement }) => {
      // Check if pattern exists in content
      if (pattern.test(content)) {
        // Count matches
        const matches = content.match(pattern);
        const matchCount = matches ? matches.length : 0;
        
        if (matchCount > 0) {
          fileFixes += matchCount;
          fileModified = true;
          
          // Apply fix
          content = content.replace(pattern, replacement);
          
          if (isVerbose) {
            console.log(`  - ${filePath}: Fixed ${matchCount} instance(s) of pattern`);
          }
        }
      }
    });
    
    // Update counters and save changes if needed
    if (fileModified) {
      totalFilesModified++;
      totalFixes += fileFixes;
      
      modifiedFiles.push({
        file: filePath,
        fixes: fileFixes
      });
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed ${fileFixes} issue${fileFixes > 1 ? 's' : ''} in: ${filePath}`);
      } else {
        console.log(`Would fix ${fileFixes} issue${fileFixes > 1 ? 's' : ''} in: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// Print summary
console.log('\n===== ELEMENTAL PRINCIPLES FIX SUMMARY =====');
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes made)' : 'LIVE (files updated)'}`);
console.log(`Total files processed: ${files.length}`);
console.log(`Files with fixes applied: ${totalFilesModified}`);
console.log(`Total issues fixed: ${totalFixes}`);

// Save report to file
const reportData = {
  timestamp: new Date().toISOString(),
  mode: isDryRun ? 'dry-run' : 'live',
  totalFilesProcessed: files.length,
  totalFilesModified,
  totalFixes,
  modifiedFiles
};

const reportPath = path.join(process.cwd(), 'elemental-principles-fixes-report.json');
fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
console.log(`\nReport saved to: ${reportPath}`);

// Suggest next steps
if (totalFilesModified > 0) {
  console.log('\nNext steps:');
  console.log('1. Review the changes made by this script');
  console.log('2. Run verification to ensure all issues were addressed:');
  console.log('   node scripts/elemental-fixes/verify-elemental-principles.js');
  console.log('3. Build the project to verify no regressions:');
  console.log('   yarn build');
} else {
  console.log('\n✅ No files needed fixes!');
}

console.log('\nDone!');

// Usage instructions if in dry run mode
if (isDryRun) {
  console.log('\nTo apply these changes, run the script without the --dry-run flag:');
  console.log('node scripts/elemental-fixes/fix-elemental-principles.js');
} 