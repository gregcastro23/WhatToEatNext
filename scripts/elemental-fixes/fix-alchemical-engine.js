/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|6662Fire/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|fire|13345Water/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|6662Fire/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|fire|water|Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); |water|Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); |Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); |14564Water/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|6662Fire/**
 * Script to specifically fix casing in the alchemicalEngine.ts file
 * 
 * This targeted script ensures the most critical file is properly standardized.
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

// Target file
const targetFile = path.resolve(rootDir, 'src/calculations/core/alchemicalEngine.ts');

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

async function main() {
  console.log(`🔍 Running in ${DRY_RUN ? 'DRY RUN' : 'EXECUTE'} mode`);
  console.log(`Target file: ${targetFile}`);
  
  try {
    // Read file content
    const content = await fs.readFile(targetFile, 'utf-8');
    
    // Make a backup of the file content for comparison
    const originalContent = content;
    
    // Step 1: Fix the AlchemyTotals type definition
    let newContent = content.replace(
      /type\s+AlchemyTotals\s*=\s*{([^}]+)}/s,
      (match, typeContent) => {
        // Fix alchemical properties in the type
        let fixedTypeContent = typeContent;
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        // Fix element properties in the type
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b:\\s*number`, 'g');
          fixedTypeContent = fixedTypeContent.replace(regex, `${pascal}: number`);
        });
        
        return `type AlchemyTotals = {${fixedTypeContent}}`;
      }
    );
    
    // Step 2: Fix planet object properties
    Object.entries(planetMap).forEach(([lowercase, pascal]) => {
      // Replace planet properties, being careful with context
      const planetObjRegex = new RegExp(`${lowercase}:\\s*{`, 'gi');
      newContent = newContent.replace(planetObjRegex, `${pascal}: {`);
    });
    
    // Step 3: Fix the elements in planetInfo objects
    newContent = newContent.replace(
      /['"]Elements['"]\s*:\s*\[\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\]/g,
      (match, element1, element2) => {
        const fixedElement1 = elementMap[element1.toLowerCase()] || element1;
        const fixedElement2 = elementMap[element2.toLowerCase()] || element2;
        return `'Elements': ['${fixedElement1}', '${fixedElement2}']`;
      }
    );
    
    // Step 4: Fix the Alchemy object properties
    newContent = newContent.replace(
      /['"]Alchemy['"]\s*:\s*{\s*([^}]+)\s*}/g,
      (match, alchemyContent) => {
        let fixedAlchemyContent = alchemyContent;
        
        // Fix each alchemical property
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b\\s*:`, 'g');
          fixedAlchemyContent = fixedAlchemyContent.replace(regex, `${pascal}: `);
        });
        
        return `'Alchemy': { ${fixedAlchemyContent} }`;
      }
    );
    
    // Step 5: Fix the Diurnal and Nocturnal Element values
    newContent = newContent.replace(
      /['"]Diurnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Diurnal Element': '${fixedElement}'`;
      }
    );
    
    newContent = newContent.replace(
      /['"]Nocturnal Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `'Nocturnal Element': '${fixedElement}'`;
      }
    );
    
    // Step 6: Fix the signInfo object
    newContent = newContent.replace(
      /Element['"]\s*:\s*['"]([^'"]+)['"]/g,
      (match, element) => {
        const fixedElement = elementMap[element.toLowerCase()] || element;
        return `Element': '${fixedElement}'`;
      }
    );
    
    // Step 7: Fix the variable names in alchemize function
    newContent = newContent.replace(
      /const\s*{\s*([^}]+)\s*}\s*=\s*totals/,
      (match, destructuring) => {
        let fixedDestructuring = destructuring;
        
        // Fix alchemical properties
        Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        // Fix elements
        Object.entries(elementMap).forEach(([lowercase, pascal]) => {
          const regex = new RegExp(`\\b${lowercase}\\b`, 'g');
          fixedDestructuring = fixedDestructuring.replace(regex, pascal);
        });
        
        return `const { ${fixedDestructuring} } = totals`;
      }
    );
    
    // Step 8: Fix the references to totals object in calculations
    // For example, Math.pow(Spirit, 2) -> Math.pow(Spirit, 2)
    Object.entries(alchemicalMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    Object.entries(elementMap).forEach(([lowercase, pascal]) => {
      const regex = new RegExp(`\\bMath\\.pow\\(${lowercase},`, 'g');
      newContent = newContent.replace(regex, `Math.pow(${pascal},`);
    });
    
    // Step 9: Fix variable references in equation components
    const variableRefRegex = /\b(Spirit|Essence|Matter|Substance|fire|water|Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); |water|Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); |Air|earth)\b\s*[+\-*/]/gi;
    newContent = newContent.replace(variableRefRegex, (match) => {
      const parts = match.split(/([+\-*/])/);
      const variable = parts[0].trim();
      
      // Fix alchemical property
      if (alchemicalMap[variable.toLowerCase()]) {
        return match.replace(variable, alchemicalMap[variable.toLowerCase()]);
      }
      
      // Fix element
      if (elementMap[variable.toLowerCase()]) {
        return match.replace(variable, elementMap[variable.toLowerCase()]);
      }
      
      return match;
    });
    
    // Save changes if not in dry run mode and content was modified
    if (newContent !== originalContent) {
      if (!DRY_RUN) {
        await fs.writeFile(targetFile, newContent, 'utf-8');
        console.log(`✅ Fixed casing in: ${targetFile}`);
      } else {
        console.log(`🔍 Would fix casing in: ${targetFile} (dry run)`);
      }
    } else {
      console.log('⚠️ No changes needed in the file');
    }
  } catch (error) {
    console.error(`❌ Error processing ${targetFile}:`, error.message);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 