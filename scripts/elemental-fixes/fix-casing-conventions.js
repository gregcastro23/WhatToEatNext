/**
 * Script to standardize casing conventions for planets, zodiac signs, elements, and alchemical properties
 * 
 * Standardized Conventions:
 * - Planets: Pascal Case (Sun, Moon, Mercury, etc.)
 * - Zodiac Signs: lowercase (aries, taurus, gemini, etc.)
 * - Elements: Pascal Case (Fire, Water, Earth, Air)
 * - Alchemical Properties: Pascal Case (Spirit, Essence, Matter, Substance)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

// Set up dry run flag - default to true for safety
const DRY_RUN = process.argv.includes('--dry-run') || !process.argv.includes('--execute');

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// Define standardized casing maps
const planetMap = {
  'Sunsun': 'Sun',
  'Moonmoon': 'Moon', 
  'Mercurymercury': 'Mercury',
  'Venusvenus': 'Venus',
  'Marsmars': 'Mars',
  'Jupiterjupiter': 'Jupiter',
  'Saturnsaturn': 'Saturn',
  'Uranusuranus': 'Uranus',
  'Neptuneneptune': 'Neptune',
  'Plutopluto': 'Pluto',
  'northnode': 'NorthNode',
  'southnode': 'SouthNode',
  'chiron': 'Chiron',
  'ascendant': 'Ascendant'
};

const zodiacMap = {
  'ariesAries': 'aries',
  'taurusTaurus': 'taurus',
  'geminiGemini': 'gemini',
  'cancerCancer': 'cancer',
  'leoLeo': 'leo',
  'virgoVirgo': 'virgo',
  'libraLibra': 'libra',
  'scorpioScorpio': 'scorpio',
  'sagittariusSagittarius': 'sagittarius',
  'capricornCapricorn': 'capricorn',
  'aquariusAquarius': 'aquarius',
  'piscesPisces': 'pisces'
};

const elementMap = {
  'Fire': 'Fire',
  'Water': 'Water',
  'Earth': 'Earth',
  'Air': 'Air'
};

const alchemicalMap = {
  'Spirit': 'Spirit',
  'Essence': 'Essence',
  'Matter': 'Matter',
  'Substance': 'Substance'
};

// Create reverse maps for exact matching
const reversePlanetMap = Object.fromEntries(
  Object.entries(planetMap).map(([key, value]) => [value.toLowerCase(), value])
);
const reverseZodiacMap = Object.fromEntries(
  Object.entries(zodiacMap).map(([key, value]) => [key.toLowerCase(), value])
);
const reverseElementMap = Object.fromEntries(
  Object.entries(elementMap).map(([key, value]) => [value.toLowerCase(), value])
);
const reverseAlchemicalMap = Object.fromEntries(
  Object.entries(alchemicalMap).map(([key, value]) => [value.toLowerCase(), value])
);

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

    // Apply planet casing corrections (outside of string literals)
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Match outside of string literals, object properties, and type definitions
      // Careful with word boundaries to avoid partial word matches
      const regex = new RegExp(`\\b${lowercase}\\b(?!['":]|\\s*:)`, 'gi');
      newContent = newContent.replace(regex, (match) => {
        modified = true;
        return pascal;
      });
    });

    // Apply zodiac sign casing corrections
    Object.entries(zodiacMap).forEach(([pascal, lowercase]) => {
      // Match outside of string literals and object properties
      const regex = new RegExp(`\\b${pascal}\\b(?!['":]|\\s*:)`, 'gi');
      newContent = newContent.replace(regex, (match) => {
        modified = true;
        return lowercase;
      });
    });

    // Apply element casing corrections
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      // Match outside of string literals, object properties, and type definitions
      const regex = new RegExp(`\\b${lowercase}\\b(?!['":]|\\s*:)`, 'gi');
      newContent = newContent.replace(regex, (match) => {
        modified = true;
        return pascal;
      });
    });

    // Apply alchemical property casing corrections
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      // Match outside of string literals, object properties, and type definitions
      const regex = new RegExp(`\\b${lowercase}\\b(?!['":]|\\s*:)`, 'gi');
      newContent = newContent.replace(regex, (match) => {
        modified = true;
        return pascal;
      });
    });

    // Additional, more targeted corrections for object properties and known structures
    
    // Fix planet property names in objects
    Object.entries(reversePlanetMap).forEach(([lowercase, pascal]) => {
      // Match planet names as object properties
      const propRegex = new RegExp(`(['"])${lowercase}\\1\\s*:`, 'gi');
      newContent = newContent.replace(propRegex, (match, quote) => {
        modified = true;
        return `${quote}${pascal}${quote}:`;
      });
    });

    // Fix alchemical property names in objects
    Object.entries(reverseAlchemicalMap).forEach(([lowercase, pascal]) => {
      // Match alchemical properties as object properties
      const propRegex = new RegExp(`(['"])${lowercase}\\1\\s*:`, 'gi');
      newContent = newContent.replace(propRegex, (match, quote) => {
        modified = true;
        return `${quote}${pascal}${quote}:`;
      });
    });

    // Fix planet names in specific objects known to contain planet keys
    const planetKeys = Object.values(planetMap).join('|');
    const planetObjRegex = new RegExp(`(planetInfo|planetData)\\s*\\[\\s*(?:['"](${planetKeys})['"]).+?\\]`, 'gis');
    newContent = newContent.replace(planetObjRegex, (match) => {
      // Fix each planet name within these objects
      let fixedMatch = match;
      Object.entries(planetMap).forEach(([lowercase, pascal]) => {
        const lowerRegex = new RegExp(`['"]${lowercase}['"]`, 'gi');
        fixedMatch = fixedMatch.replace(lowerRegex, `'${pascal}'`);
      });
      if (fixedMatch !== match) modified = true;
      return fixedMatch;
    });

    // Fix element properties in objects
    const elementObjRegex = /\b(elementalProperties|ElementalProperties|elements)\s*[:=]\s*{[^}]+}/gs;
    newContent = newContent.replace(elementObjRegex, (match) => {
      // Fix each element within these objects
      let fixedMatch = match;
      Object.entries(elementMap).forEach(([lowercase, pascal]) => {
        // Match element as property name or value
        const propRegex = new RegExp(`(['"])${lowercase}\\1\\s*:`, 'gi');
        fixedMatch = fixedMatch.replace(propRegex, (match, quote) => `${quote}${pascal}${quote}:`);
        
        // Match element as property value
        const valueRegex = new RegExp(`: *(['"])${lowercase}\\1`, 'gi');
        fixedMatch = fixedMatch.replace(valueRegex, (match, quote) => `: ${quote}${pascal}${quote}`);
      });
      if (fixedMatch !== match) modified = true;
      return fixedMatch;
    });

    // Specifically fix the AlchemyTotals type in alchemicalEngine.ts
    if (filePath.includes('alchemicalEngine.ts')) {
      const alchemyTotalsRegex = /(type\s+AlchemyTotals\s*=\s*\{[^}]+\})/gs;
      newContent = newContent.replace(alchemyTotalsRegex, (match) => {
        let fixedMatch = match;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const propRegex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'gi');
          fixedMatch = fixedMatch.replace(propRegex, `${pascal}: number`);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const propRegex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'gi');
          fixedMatch = fixedMatch.replace(propRegex, `${pascal}: number`);
        });
        
        if (fixedMatch !== match) modified = true;
        return fixedMatch;
      });
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
    }
  } catch (error) {
    errorFiles++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main function to process all files
async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  
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
  
  // Process files in smaller batches to avoid memory issues
  const BATCH_SIZE = 50;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(processFile));
    console.log(`Processed batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(files.length/BATCH_SIZE)}`);
  }
  
  console.log('\n=== Summary ===');
  console.log(`Total files processed: ${processedFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Files with errors: ${errorFiles}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes made)' : 'EXECUTE (changes applied)'}`);
  
  if (DRY_RUN) {
    console.log('\n🚀 To apply these changes, run:');
    console.log('node scripts/elemental-fixes/fix-casing-conventions.js --execute');
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 