// Element Inconsistency Identifier Script
// This script scans the codebase for inconsistent element naming (fire vs Fire, water vs Water, etc.)
// It reports files that need fixes but doesn't modify them

import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const ELEMENT_PATTERNS = [
  // Lowercase variants (incorrect)
  { pattern: /\b(fire)\b/g, correctForm: 'Fire', isCaseSensitive: true },
  { pattern: /\b(water)\b/g, correctForm: 'Water', isCaseSensitive: true },
  { pattern: /\b(Air)\b/g, correctForm: 'Air', isCaseSensitive: true },
  { pattern: /\b(earth)\b/g, correctForm: 'Earth', isCaseSensitive: true },
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
];

// Get all relevant files
const files = DIRS_TO_SCAN.flatMap(dir => 
  globSync(`${dir}/**/*.{ts,tsx,js,jsx}`, { ignore: ['**/node_modules/**'] })
);

console.log(`Scanning ${files.length} files for element name inconsistencies...`);

const inconsistentFiles = [];

// Process each file
files.forEach(filePath => {
  // Skip excluded files
  if (EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath))) {
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let hasInconsistency = false;
    const inconsistencies = [];

    // Check for each element pattern
    ELEMENT_PATTERNS.forEach(({ pattern, correctForm, isCaseSensitive }) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        hasInconsistency = true;
        inconsistencies.push({
          element: correctForm,
          count: matches.length,
          incorrectForm: matches[0]
        });
      }
    });

    if (hasInconsistency) {
      inconsistentFiles.push({
        file: filePath,
        inconsistencies
      });
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
});

// Report results
console.log('\n===== ELEMENT INCONSISTENCY REPORT =====');
console.log(`Found ${inconsistentFiles.length} files with element name inconsistencies\n`);

inconsistentFiles.forEach(({ file, inconsistencies }) => {
  console.log(`File: ${file}`);
  inconsistencies.forEach(({ element, count, incorrectForm }) => {
    console.log(`  - Found ${count} instances of '${incorrectForm}' (should be '${element}')`);
  });
  console.log('');
});

// Save results to file
if (inconsistentFiles.length > 0) {
  const reportPath = path.join(process.cwd(), 'element-inconsistencies-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify({ 
      timestamp: new Date().toISOString(),
      totalInconsistentFiles: inconsistentFiles.length,
      files: inconsistentFiles
    }, null, 2)
  );
  console.log(`Report saved to: ${reportPath}`);
} else {
  console.log('No inconsistencies found!');
}

console.log('\nDone!'); 