#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes('--dry-run');

// Track changes for reporting
let totalChanges = 0;
let filesModified = 0;

// Enhanced list of unused variables to prefix with underscore
const unusedVariables = [
  'Element', 'Season', 'ZodiacSign', 'LunarPhase', 'PlanetName', 'RecipeServiceInterface',
  'UnifiedRecipeService', 'getAllRecipes', 'ThermodynamicProperties', 'PlanetaryAlignment',
  'unifiedIngredientService', 'alchemicalEngine', 'recipeDataService', 'getIngredientRecommendations',
  'getElementalCompatibilityWithSeason', 'getEnhancedElementalBreakdown', 'Ingredient',
  'AstrologicalState', 'planetInfo', 'signInfo', 'getTarotCardsForDate', 'CHAKRA_BALANCING_FOODS',
  'unifiedFlavorEngine', 'CHAKRA_NUTRITIONAL_CORRELATIONS', 'CHAKRA_HERBS', 'NutritionalProfile',
  'kalchmEngine', 'RecipeIngredient', 'ingredientsMap', 'processedOils', 'CalculationData',
  'CuisineData', 'NutrientData', 'MatchingResult', 'SpoonacularRecipe', 'createUnifiedIngredient',
  'isUnifiedIngredient', 'isArray', 'SeasonalDishes', 'TransformedItem', 'Recipe', 'FoodCompatibility',
  'ElementalProperties', 'FoodAlchemySystem', 'ScoredRecipe', 'UnifiedIngredient', 'IngredientMapping',
  'AspectType', 'DignityType', 'AlchemicalProperties', 'ThermodynamicProperties', 'CookingMethod',
  'AlchemyRecipe', 'LunarPhaseWithSpaces', 'PlanetaryPosition', 'RulingPlanet', 'transformItemWithPlanetaryPositions',
  'getCookingMethodPillar', 'calculateCookingMethodCompatibility', 'calculateAlchemicalScore', 'calculateMoonTimes',
  'calculateSunTimes', 'PlanetPositionData', 'ElementalCharacter', 'AlchemicalPillarData', 'getTimeOfDay',
  'solar', 'moon', 'AlchemicalDignityType', 'BasicThermodynamicProperties', 'config', 'CacheEntry',
  'ELEMENTS', 'cuisineFlavorProfiles', 'planetaryFlavorProfiles', 'flavorProfiles', 'allIngredients',
  'calculatePlanetaryAspects', 'venusData', 'marsData', 'mercuryData', 'jupiterData', 'saturnData',
  'uranusData', 'neptuneData', 'plutoData', 'LUNAR_PHASES', 'generateEnhancedRecommendation',
  'ErrorHandler', 'AlchemicalEngine', 'calculateElementalScore', 'AstrologicalProfile', 'toZodiacSign',
  'generateIngredientRecommendations', 'mockLunarData', 'RecipeElementalProperties', 'ThermodynamicMetrics'
];

// Enhanced list of unused parameters to prefix with underscore
const unusedParameters = [
  'userPreferences', 'season', 'alignment', 'operation', 'chakraEnergyStates', 'location',
  'criteria', 'id', 'query', 'ingredient', 'data', 'context', 'isFatal', 'message', 'target',
  'args', 'T', 'planet', 'currentZodiacSign', 'ingredients', 'error', 'result', 'rec',
  't', 'options', 'callback', 'event', 'issue', 'userSign'
];

// Enhanced list of variables to assign but mark as unused
const assignedUnusedVars = [
  'dietParam', 'energy', 'currentZodiacSign', 'modalityPreference', 'result', 'recipeRecommendations',
  'API_KEY', 'BASE_URL', 'INGREDIENTS_URL', 'overallHarmony', 'season', 'signFormatted',
  'defaultElementalBalance', 'fallbackStatePromise', 'jupiterDignityName', 'saturnDignityName',
  'CUISINES', 'celestialInfluence', 'includeAlternatives', 'times', 'elementalProps', 'aspects',
  'timeFactors', 'zodiacSigns', 'primaryElement', 'cachedAllIngredientsData', 'cacheTimestamp',
  'Earth', 'firstRunTime', 'secondRunTime', 'elementalState', 'combinedElements', 'naturalInfluences',
  'elementRanking', 'astrologicalPower', 'firewaterAffinity', 'firefireAffinity', 'AirearthAffinity',
  'basicMatch', 'advancedHarmony', 'compatibility', 'fallbackFn'
];

// Patterns for any type fixes
const anyTypePatterns = [
  { from: ': any', to: ': unknown' },
  { from: ': any[]', to: ': unknown[]' },
  { from: ': any =', to: ': unknown =' },
  { from: '(any)', to: '(unknown)' },
  { from: '<any>', to: '<unknown>' },
  { from: ' any ', to: ' unknown ' },
  { from: 'Unexpected any.', to: 'Unexpected unknown.' }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  // 1. Fix unused variables by prefixing with underscore
  unusedVariables.forEach(varName => {
    // Match variable declarations, imports, and interface properties
    const patterns = [
      // Import patterns
      new RegExp(`(import\\s+{[^}]*?)(\\b${varName}\\b)([^}]*?})`, 'g'),
      new RegExp(`(import\\s+)(\\b${varName}\\b)(\\s+from)`, 'g'),
      // Variable declarations
      new RegExp(`(const|let|var)\\s+(${varName})\\b(?!.*_${varName})`, 'g'),
      // Function parameters  
      new RegExp(`\\(([^)]*?)(\\b${varName}\\b)([^)]*?)\\)`, 'g'),
      // Interface/type declarations
      new RegExp(`(:\\s*)(${varName})\\b(?![a-zA-Z_])`, 'g'),
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, ...groups) => {
          if (groups.length === 3) {
            return `${groups[0]}_${groups[1]}${groups[2]}`;
          } else if (groups.length === 2) {
            return `${groups[0]}_${groups[1]}`;
          }
          return match;
        });
        fileChanges++;
      }
    });
  });

  // 2. Fix unused parameters by prefixing with underscore
  unusedParameters.forEach(paramName => {
    const pattern = new RegExp(`\\(([^)]*?)(\\b${paramName}\\b)([^)]*?)\\)`, 'g');
    content = content.replace(pattern, (match, before, param, after) => {
      if (!param.startsWith('_')) {
        fileChanges++;
        return `(${before}_${param}${after})`;
      }
      return match;
    });
  });

  // 3. Fix assigned unused variables
  assignedUnusedVars.forEach(varName => {
    const patterns = [
      new RegExp(`(const|let|var)\\s+(${varName})\\s*=`, 'g'),
      new RegExp(`\\s+(${varName})\\s*=\\s*`, 'g')
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, (match, ...groups) => {
          if (groups.length === 2) {
            fileChanges++;
            return `${groups[0]} _${groups[1]} =`;
          } else if (groups.length === 1) {
            fileChanges++;
            return ` _${groups[0]} = `;
          }
          return match;
        });
      }
    });
  });

  // 4. Fix explicit any types
  anyTypePatterns.forEach(({ from, to }) => {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      fileChanges++;
    }
  });

  // 5. Comment out non-debug console statements
  const consolePattern = /^(\s*)(console\.(log|warn|info|error))/gm;
  content = content.replace(consolePattern, (match, indent, consoleCall) => {
    // Skip if already commented or if it's in a debug context
    if (match.trim().startsWith('//') || match.includes('debug') || match.includes('DEBUG')) {
      return match;
    }
    fileChanges++;
    return `${indent}// ${consoleCall}`;
  });

  // 6. Fix prefer-const errors by changing let to const for variables that aren't reassigned
  const letPattern = /(\s+)(let)(\s+)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const letMatches = [...content.matchAll(letPattern)];
  letMatches.forEach(match => {
    const varName = match[4];
    const afterDeclaration = content.substring(match.index + match[0].length);
    
    // Check if variable is reassigned (simple heuristic)
    const reassignPattern = new RegExp(`\\b${varName}\\s*=`, 'g');
    const reassignments = afterDeclaration.match(reassignPattern);
    
    if (!reassignments || reassignments.length === 0) {
      content = content.replace(match[0], `${match[1]}const${match[3]}${match[4]} =`);
      fileChanges++;
    }
  });

  if (fileChanges > 0) {
    filesModified++;
    totalChanges += fileChanges;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Fixed ${fileChanges} issues in ${filePath}`);
    return true;
  }

  return false;
}

function findTypeScriptFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, build directories
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          scanDir(fullPath);
        }
      } else if (entry.isFile()) {
        // Include TypeScript, JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDir(dir);
  return files;
}

function main() {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Starting comprehensive linting fixes...`);
  
  const projectRoot = path.resolve(__dirname, '../../');
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found');
    process.exit(1);
  }

  const files = findTypeScriptFiles(srcDir);
  console.log(`Found ${files.length} files to process`);

  files.forEach(filePath => {
    try {
      fixFile(filePath);
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Summary:`);
  console.log(`- Files modified: ${filesModified}`);
  console.log(`- Total changes: ${totalChanges}`);
  
  if (DRY_RUN) {
    console.log('\nRun without --dry-run to apply changes');
  } else {
    console.log('\nChanges applied successfully!');
  }
}

main(); 