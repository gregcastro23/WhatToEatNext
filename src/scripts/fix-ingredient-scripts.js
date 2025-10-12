/**
 * Script to fix the searchData.foods bug in all ingredient update scripts
 *
 * Run with: yarn node src/scripts/fix-ingredient-scripts.js
 */

const fs = require('fs');
const path = require('path');

// Files to update
const TARGET_FILES = [
  'updateVegetables.ts',
  'updateFruits.ts',
  'updateGrains.ts',
  'updateProteins.ts',
  'updateSpices.ts',
  'updateOils.ts',
  'updateVinegars.ts',
  'updateHerbs.ts',
];

// console.log('Starting to fix bug in ingredient category scripts...');

// Process each target file
TARGET_FILES.forEach(filename => {
  const filePath = path.resolve(process.cwd(), 'src/scripts', filename);

  if (!fs.existsSync(filePath)) {
    // console.log(`File not found: ${filePath}`);
    return;
  }

  // console.log(`Processing ${filename}...`);

  // Read the target file
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace searchData.foods with searchResults.foods
  const buggyCode = /for\s*\(\s*const\s+food\s+of\s+searchData\.foods\s*\)/;
  const fixedCode = 'for (const food of searchResults.foods)';

  if (content.match(buggyCode)) {
    content = content.replace(buggyCode, fixedCode);
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`Fixed bug in ${filename}`);
  } else {
    // console.log(`No bug found in ${filename}, skipping...`);
  }
});

// console.log('\nAll files have been checked and fixed!');
