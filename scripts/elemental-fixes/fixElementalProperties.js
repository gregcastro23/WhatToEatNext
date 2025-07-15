// A script to specifically fix missing elementalProperties fields
const fs = require('fs');
const path = require('path');

const INGREDIENTS_BASE_PATH = path.resolve(__dirname, '../data/ingredients');
const CATEGORIES = [
  'fruits',
  'grains',
  'herbs',
  'proteins',
  'seasonings',
  'spices',
  'vegetables',
];

// Fix a single file with missing elemental properties
function fixElementalProperties(filePath) {
  // console.log(`Processing ${filePath}...`);

  // Read the file
  const content = fs.readFileSync(filePath, 'utf8');
  const modified = false;

  // Fix missing elemental properties
  const missingAir = /elementalProperties:\s*{\s*(?!.*?\bAir\b.*?})[^}]+}/g;
  const missingFire = /elementalProperties:\s*{\s*(?!.*?\bFire\b.*?})[^}]+}/g;
  const missingWater = /elementalProperties:\s*{\s*(?!.*?\bWater\b.*?})[^}]+}/g;
  const missingEarth = /elementalProperties:\s*{\s*(?!.*?\bEarth\b.*?})[^}]+}/g;

  // Fix each missing element
  if (missingAir.test(content)) {
    content = content.replace(
      /elementalProperties:\s*{([^}]+)}/g,
      (match, group) => {
        if (!match.includes('Air:')) {
          return `elementalProperties: {${group}, Air: 0.1}`;
        }
        return match;
      }
    );
    modified = true;
  }

  if (missingFire.test(content)) {
    content = content.replace(
      /elementalProperties:\s*{([^}]+)}/g,
      (match, group) => {
        if (!match.includes('Fire:')) {
          return `elementalProperties: {${group}, Fire: 0.1}`;
        }
        return match;
      }
    );
    modified = true;
  }

  if (missingWater.test(content)) {
    content = content.replace(
      /elementalProperties:\s*{([^}]+)}/g,
      (match, group) => {
        if (!match.includes('Water:')) {
          return `elementalProperties: {${group}, Water: 0.1}`;
        }
        return match;
      }
    );
    modified = true;
  }

  if (missingEarth.test(content)) {
    content = content.replace(
      /elementalProperties:\s*{([^}]+)}/g,
      (match, group) => {
        if (!match.includes('Earth:')) {
          return `elementalProperties: {${group}, Earth: 0.1}`;
        }
        return match;
      }
    );
    modified = true;
  }

  // Fix capitalized zodiac signs
  const wrongCaseZodiac =
    /'(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)'/g;
  if (wrongCaseZodiac.test(content)) {
    content = content.replace(wrongCaseZodiac, (match, sign) => {
      return `'${sign.toLowerCase()}'`;
    });
    modified = true;
  }

  // Fix string origin to array
  const stringOrigin = /origin:\s*'([^']+)'/g;
  if (stringOrigin.test(content)) {
    content = content.replace(stringOrigin, (match, origin) => {
      return `origin: ['${origin}']`;
    });
    modified = true;
  }

  // If the file was modified, write it back
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    // console.log(`  Updated ${filePath}`);
    return true;
  } else {
    // console.log(`  No issues found in ${filePath}`);
    return false;
  }
}

// Process all TypeScript files in a directory
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  const processed = 0;

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      processed += processDirectory(fullPath);
    } else if (
      file.endsWith('.ts') &&
      !file.endsWith('.d.ts') &&
      file !== 'index.ts'
    ) {
      if (fixElementalProperties(fullPath)) {
        processed++;
      }
    }
  }

  return processed;
}

// Main function
async function main() {
  const totalProcessed = 0;

  for (const category of CATEGORIES) {
    const categoryPath = path.join(INGREDIENTS_BASE_PATH, category);

    if (!fs.existsSync(categoryPath)) {
      // console.warn(`Category directory not found: ${categoryPath}`);
      continue;
    }

    // console.log(`\nProcessing category: ${category}`);
    const processed = processDirectory(categoryPath);
    totalProcessed += processed;
    // console.log(`Processed ${processed} files in ${category}`);
  }

  // console.log(`\nTotal files processed: ${totalProcessed}`);
}

// Run the script
main()
  .then(() => {
    // console.log('All ingredient files have been processed.');
    process.exit(0);
  })
  .catch((error) => {
    // console.error('Error during processing:', error);
    process.exit(1);
  });
