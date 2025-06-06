import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Files with case sensitivity issues for planet names
const planetCaseFiles = [
  'src/__tests__/culinaryAstrology.test.ts',
  'src/__tests__/ingredientRecommender.test.ts'
];

// Files with case sensitivity issues for zodiac signs
const zodiacCaseFiles = [
  'src/__tests__/chakraSystem.test.ts'
];

// Files with elemental property case issues (Fire vs fire)
const elementalPropertyFiles = [
  'src/app/alchemicalEngine.ts',
  'src/app/test/migrated-components/cuisine-section/page.tsx'
];

// Fix planet name case sensitivity
function fixPlanetNameCase(content) {
  const planetMappings = {
    "'Sunsun'": "'Sun'",
    '"Sunsun"': '"Sun"',
    "'Moonmoon'": "'Moon'",
    '"Moonmoon"': '"Moon"',
    "'Mercurymercury'": "'Mercury'",
    '"Mercurymercury"': '"Mercury"',
    "'Venusvenus'": "'Venus'",
    '"Venusvenus"': '"Venus"',
    "'Marsmars'": "'Mars'",
    '"Marsmars"': '"Mars"',
    "'Jupiterjupiter'": "'Jupiter'",
    '"Jupiterjupiter"': '"Jupiter"',
    "'Saturnsaturn'": "'Saturn'",
    '"Saturnsaturn"': '"Saturn"'
  };

  let modified = content;
  let changed = false;

  for (const [wrong, correct] of Object.entries(planetMappings)) {
    if (modified.includes(wrong)) {
      modified = modified.replace(new RegExp(wrong, 'g'), correct);
      changed = true;
    }
  }

  return { content: modified, changed };
}

// Fix zodiac sign case sensitivity
function fixZodiacCase(content) {
  const zodiacMappings = {
    "'ariesAries'": "'aries'",
    '"ariesAries"': '"aries"',
    "'taurusTaurus'": "'taurus'",
    '"taurusTaurus"': '"taurus"',
    "'geminiGemini'": "'gemini'",
    '"geminiGemini"': '"gemini"',
    "'cancerCancer'": "'cancer'",
    '"cancerCancer"': '"cancer"',
    "'leoLeo'": "'leo'",
    '"leoLeo"': '"leo"',
    "'virgoVirgo'": "'virgo'",
    '"virgoVirgo"': '"virgo"',
    "'libraLibra'": "'libra'",
    '"libraLibra"': '"libra"',
    "'scorpioScorpio'": "'scorpio'",
    '"scorpioScorpio"': '"scorpio"',
    "'sagittariusSagittarius'": "'sagittarius'",
    '"sagittariusSagittarius"': '"sagittarius"',
    "'capricornCapricorn'": "'capricorn'",
    '"capricornCapricorn"': '"capricorn"',
    "'aquariusAquarius'": "'aquarius'",
    '"aquariusAquarius"': '"aquarius"',
    "'piscesPisces'": "'pisces'",
    '"piscesPisces"': '"pisces"'
  };

  let modified = content;
  let changed = false;

  for (const [wrong, correct] of Object.entries(zodiacMappings)) {
    if (modified.includes(wrong)) {
      modified = modified.replace(new RegExp(wrong, 'g'), correct);
      changed = true;
    }
  }

  return { content: modified, changed };
}

// Fix elemental property case (Fire -> fire, etc.)
function fixElementalPropertyCase(content) {
  // Only fix in object property definitions, not type names
  const patterns = [
    // Object properties
    { pattern: /(\s+)Fire:/g, replacement: '$1fire:' },
    { pattern: /(\s+)Water:/g, replacement: '$1water:' },
    { pattern: /(\s+)Earth:/g, replacement: '$1earth:' },
    { pattern: /(\s+)Air:/g, replacement: '$1Air:' },
    // Property access
    { pattern: /\.elementalProperties\.Fire/g, replacement: '.elementalProperties.Fire' },
    { pattern: /\.elementalProperties\.Water/g, replacement: '.elementalProperties.Water' },
    { pattern: /\.elementalProperties\.Earth/g, replacement: '.elementalProperties.Earth' },
    { pattern: /\.elementalProperties\.Air/g, replacement: '.elementalProperties.Air' }
  ];

  let modified = content;
  let changed = false;

  for (const { pattern, replacement } of patterns) {
    if (pattern.test(content)) {
      modified = modified.replace(pattern, replacement);
      changed = true;
    }
  }

  return { content: modified, changed };
}

// Process a file with a specific fix function
function processFile(filepath, fixFunction, fixName) {
  const fullPath = path.join(__dirname, filepath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const { content: fixedContent, changed } = fixFunction(content);

  if (changed) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would fix ${fixName} in: ${filepath}`);
    } else {
      fs.writeFileSync(fullPath, fixedContent);
      console.log(`Fixed ${fixName} in: ${filepath}`);
    }
  } else {
    console.log(`No ${fixName} changes needed: ${filepath}`);
  }
}

// Add missing exports to AstrologicalService
function addMissingExports() {
  const filepath = 'src/services/AstrologicalService.ts';
  const fullPath = path.join(__dirname, filepath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if PlanetaryAlignment is already exported
  if (content.includes('export type PlanetaryAlignment') || 
      content.includes('export interface PlanetaryAlignment') ||
      content.includes('export { PlanetaryAlignment }')) {
    console.log('PlanetaryAlignment already exported');
    return;
  }

  // Add re-export after the import statement
  const updatedContent = content.replace(
    /(import {[\s\S]*?PlanetaryAlignment[\s\S]*?} from '@\/types\/celestial';)/,
    `$1\n\n// Re-export for backward compatibility\nexport { PlanetaryAlignment };`
  );

  if (updatedContent !== content) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would add re-export of PlanetaryAlignment in: ${filepath}`);
    } else {
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`Added re-export of PlanetaryAlignment in: ${filepath}`);
    }
  }
}

// Add RecipeIngredient type if missing
function addRecipeIngredientType() {
  const filepath = 'src/types/recipe.ts';
  const fullPath = path.join(__dirname, filepath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if RecipeIngredient is already defined
  if (content.includes('RecipeIngredient')) {
    console.log('RecipeIngredient already defined');
    return;
  }

  // Add RecipeIngredient type after Recipe type
  const recipeIngredientType = `
export interface RecipeIngredient {
  id?: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  element?: string;
  elementalCharacter?: string;
  astrologicalProfile?: {
    rulingPlanets?: string[];
  };
}
`;

  const updatedContent = content.replace(
    /(export interface Recipe[\s\S]*?}\n)/,
    `$1${recipeIngredientType}`
  );

  if (updatedContent !== content) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would add RecipeIngredient type to: ${filepath}`);
    } else {
      fs.writeFileSync(fullPath, updatedContent);
      console.log(`Added RecipeIngredient type to: ${filepath}`);
    }
  }
}

console.log(`Fixing TypeScript errors...`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`);
console.log('');

// Fix planet name case issues
console.log('=== Fixing planet name case sensitivity ===');
planetCaseFiles.forEach(file => {
  processFile(file, fixPlanetNameCase, 'planet names');
});
console.log('');

// Fix zodiac sign case issues
console.log('=== Fixing zodiac sign case sensitivity ===');
zodiacCaseFiles.forEach(file => {
  processFile(file, fixZodiacCase, 'zodiac signs');
});
console.log('');

// Fix elemental property case issues
console.log('=== Fixing elemental property case ===');
elementalPropertyFiles.forEach(file => {
  processFile(file, fixElementalPropertyCase, 'elemental properties');
});
console.log('');

// Add missing exports
console.log('=== Adding missing exports ===');
addMissingExports();
console.log('');

// Add missing types
console.log('=== Adding missing types ===');
addRecipeIngredientType();
console.log('');

console.log('Done!');
console.log('');
console.log('Next steps:');
console.log('1. Run "yarn tsc --noEmit" to check for remaining errors');
console.log('2. May need to fix additional imports and type mismatches'); 