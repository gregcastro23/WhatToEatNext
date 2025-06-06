import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Files to fix based on the TypeScript errors
const filesToFix = [
  'src/components/ElementalVisualizer.tsx',
  'src/components/ErrorNotifications/index.tsx',
  'src/components/errors/ErrorDisplay.tsx',
  'src/components/errors/GlobalErrorBoundary.tsx',
  'src/components/FoodRecommender/components/FoodBalanceTracker.tsx',
  'src/components/FoodRecommender/components/IngredientRecommendations.tsx',
  'src/components/FoodRecommender/components/NutritionDisplay.tsx',
  'src/components/FoodRecommender/mocks/ingredients.ts',
  'src/components/GlobalPopup.tsx',
  'src/components/Recipe.tsx',
  'src/components/Recipe/RecipeCalculator.tsx',
  'src/components/Recipe/RecipeCard.tsx',
  'src/components/RecipeCard.tsx',
  'src/components/RecipeList.tsx',
  'src/utils/elementalScoring.ts',
  'src/utils/enhancedCuisineRecommender.ts',
  'src/utils/popup.ts',
  'src/utils/recipeEnrichment.ts',
  'src/utils/recipeRecommendation.ts',
  'src/utils/recipeUtils.ts'
];

// Map of expected imports based on the file usage
const importMappings = {
  'elemental': '{ ElementalProperties }',
  'elementalCompatibility': '{ calculateElementalCompatibility }',
  'ErrorContext': '{ useErrorContext }',
  'logger': '{ logger }',
  'errorHandler': '{ errorHandler }',
  'defaults': '{ DEFAULT_ELEMENTAL_PROPERTIES }',
  'ingredients': '{ ingredients }',
  'alchemy': '{ AlchemicalState, ThermodynamicMetrics, ElementalProperties, UnifiedNutritionData }',
  'cuisines': '{ cuisines }',
  'foodRecommender': '{ analyzeIngredientCompatibility }',
  'FoodRecommender': '{ FoodRecommenderProps }',
  'PopupContext': '{ usePopupContext }',
  'elementalConstants': '{ ELEMENT_COLORS }',
  'recipe': '{ Recipe }',
  'AlchemicalContext': '{ useAlchemicalContext }',
  'seasonalCalculations': '{ calculateSeasonalBonus }',
  'time': '{ PlanetaryHour }',
  'useAstrologicalState': 'useAstrologicalState',
  'recipeEnrichment': '{ enrichRecipeData }',
  'PlanetaryHourCalculator': 'PlanetaryHourCalculator',
  'recipeFilters': '{ filterRecipesByCuisine }',
  'zodiacSeasons': '{ zodiacSeasons }',
  'cuisine': '{ Cuisine }',
  'astrologyUtils': '{ getZodiacSign }'
};

function fixImportStatement(line, filename) {
  // Pattern 1: import ../path  from 'module ';
  const pattern1 = /import\s+(\.\.\/[^\s]+)\s+from\s+'([^']+)\s+';/;
  const match1 = line.match(pattern1);
  if (match1) {
    const importPath = match1[1];
    const moduleName = match1[2].trim();
    const importName = importMappings[moduleName] || '{ }';
    return `import ${importName} from '${importPath}/${moduleName}';`;
  }

  // Pattern 2: import @/path  from 'module ';
  const pattern2 = /import\s+(@\/[^\s]+)\s+from\s+'([^']+)\s+';/;
  const match2 = line.match(pattern2);
  if (match2) {
    const importPath = match2[1];
    const moduleName = match2[2].trim();
    const importName = importMappings[moduleName] || '{ }';
    return `import ${importName} from '${importPath}/${moduleName}';`;
  }

  // Pattern 3: import ../../path  from 'module ';
  const pattern3 = /import\s+(\.\.\/\.\.\/[^\s]+)\s+from\s+'([^']+)\s+';/;
  const match3 = line.match(pattern3);
  if (match3) {
    const importPath = match3[1];
    const moduleName = match3[2].trim();
    const importName = importMappings[moduleName] || '{ }';
    return `import ${importName} from '${importPath}/${moduleName}';`;
  }

  // Pattern 4: import @/path  from 'module ' (with space before quote)
  const pattern4 = /import\s+(@\/[^\s]+)\s+from\s+'([^']+)\s+'/;
  const match4 = line.match(pattern4);
  if (match4) {
    const importPath = match4[1];
    const moduleName = match4[2].trim();
    const importName = importMappings[moduleName] || '{ }';
    return `import ${importName} from '${importPath}/${moduleName}';`;
  }

  // Pattern 5: import ../path  from 'module' (without trailing space)
  const pattern5 = /import\s+(\.\.\/[^\s]+)\s+from\s+'([^']+)'/;
  const match5 = line.match(pattern5);
  if (match5) {
    const importPath = match5[1];
    const moduleName = match5[2].trim();
    const importName = importMappings[moduleName] || '{ }';
    return `import ${importName} from '${importPath}/${moduleName}';`;
  }

  return line;
}

function processFile(filepath) {
  const fullPath = path.join(__dirname, filepath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filepath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  const newLines = lines.map(line => {
    const newLine = fixImportStatement(line, filepath);
    if (newLine !== line) {
      modified = true;
      console.log(`  Fixed: ${line.trim()}`);
      console.log(`     To: ${newLine.trim()}`);
    }
    return newLine;
  });

  if (modified) {
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would update: ${filepath}`);
    } else {
      fs.writeFileSync(fullPath, newLines.join('\n'));
      console.log(`Updated: ${filepath}`);
    }
  } else {
    console.log(`No changes needed: ${filepath}`);
  }
}

console.log(`Fixing malformed imports...`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'WRITE'}`);
console.log('');

filesToFix.forEach(file => {
  console.log(`Processing: ${file}`);
  processFile(file);
  console.log('');
});

console.log('Done!');
console.log('');
console.log('Next steps:');
console.log('1. Run "yarn build" to check if the fixes are correct');
console.log('2. You may need to adjust import names based on actual exports'); 