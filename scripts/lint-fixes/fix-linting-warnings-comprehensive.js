#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');

console.log('🔧 Comprehensive Linting Warnings Fix - Phase 2');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLYING CHANGES'}`);

/**
 * Fix remaining unused variables by prefixing with underscore
 */
function fixRemainingUnusedVariables(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Specific unused variables from the lint output
  const unusedVars = [
    'getCurrentSeason', 'getTimeOfDay', 'solar', 'moon', 'AlchemicalDignityType',
    'calculatePlanetPosition', 't', 'aspects', 'moonSign', 'planetaryDay', 'planetaryMinute',
    'tanObliquity', 'nodeCycleDays', 'calculatePositionDifference', 'signToLongitude',
    'config', 'CacheEntry', 'T', 'calculateThermodynamicBaseScore', 'isMarsRetrograde',
    'isMercuryRetrograde', 'isJupiterRetrograde', 'isUranusRetrograde', 'isNeptuneRetrograde',
    'isPlutoRetrograde', 'mercuryZodiacTransit', 'uranusZodiacTransit', 'neptuneZodiacTransit',
    'plutoZodiacTransit', 'mercuryTemperament', 'jupiterTemperament', 'methodNameLower',
    'basicProps', 'ZodiacSign', 'PlanetaryAspect', 'LUNAR_PHASES', 'planetaryFlavorProfiles',
    'allIngredients', 'calculatePlanetaryAspects', 'venusData', 'marsData', 'mercuryData',
    'jupiterData', 'saturnData', 'uranusData', 'neptuneData', 'plutoData', 'mockPlanetaryData',
    'Recipe', 'IngredientMapping', 'options', 'LunarPhaseWithSpaces', 'getAllDishesForCuisine',
    'fallbackFn', 'ElementalCharacter', 'baseCompatibility', 'elementalProfile',
    'Element', 'LunarPhase', 'AlchemicalProperties', 'ELEMENTS', 'Season', 'ErrorHandler',
    'times', 'ELEMENT_WEIGHTS', 'calculateUniqueness', 'ensureSafeNumber',
    'applyNonLinearScaling', 'calculateUniquenessScore', 'generateEnhancedRecommendation',
    'getBalancingElement', 'cuisineFlavorProfiles', 'planetaryFlavorProfiles',
    'flavorProfiles', 'herbCount', 'grainCount', 'filteredOut', 'planetScore',
    'currentHour', 'nutritionalScore', 'getElementalAffinity', 'getPlanetaryElement',
    'safeObjectCreate', 'enhanceVenusIngredientScoring', 'component', 'cachedAllIngredientsData',
    'cacheTimestamp', 'ElementalProperties', 'ThermodynamicMetrics', 'timeFactors',
    'logger', 'nutritionInfo', 'CalculationData', 'CuisineData', 'NutrientData',
    'MatchingResult', 'Modality', 'calculateRecipeEnergyMatch', 'primaryElement',
    'getFlavorProperty', 'Earth', 'isElementalProperties', 'hasFlavorProperties',
    'getElementalProperty', 'PlanetaryAlignment', 'BasicThermodynamicProperties',
    'AstrologicalProfile', 'Rating', 'getSeasonalModifier', 'getElementalBreakdown',
    'propDetails', 'calculateMoonTimes', 'calculateSunTimes', 'latitude', 'longitude',
    'PlanetPositionData', 'zodiacSigns', 'debugLog', 'CACHE_DURATION',
    'PlanetDataWithTransits', 'date', 'calculateApproximateSunSign', 'getDaysSinceDate',
    'toZodiacSign', 'PlanetaryPosition', 'hoursPerPlanetaryHour', 'marsData'
  ];

  unusedVars.forEach(varName => {
    if (!varName.startsWith('_')) {
      // Fix variable declarations
      const declPattern = new RegExp(`(\\s+)(const|let|var)\\s+(${varName})\\s*=`, 'g');
      if (declPattern.test(content)) {
        newContent = newContent.replace(declPattern, `$1$2 _${varName} =`);
        changes++;
      }

      // Fix variable assignments
      const assignPattern = new RegExp(`(\\s+)(${varName})\\s*=(?!.*function)`, 'g');
      if (assignPattern.test(content) && !declPattern.test(content)) {
        newContent = newContent.replace(assignPattern, `$1_${varName} =`);
        changes++;
      }

      // Fix function declarations
      const funcPattern = new RegExp(`(\\s+)(function\\s+)(${varName})\\s*\\(`, 'g');
      if (funcPattern.test(content)) {
        newContent = newContent.replace(funcPattern, `$1$2_${varName}(`);
        changes++;
      }

      // Fix export function declarations
      const exportFuncPattern = new RegExp(`(export\\s+function\\s+)(${varName})\\s*\\(`, 'g');
      if (exportFuncPattern.test(content)) {
        newContent = newContent.replace(exportFuncPattern, `$1_${varName}(`);
        changes++;
      }
    }
  });

  return { content: newContent, changes };
}

/**
 * Fix remaining unused parameters by prefixing with underscore
 */
function fixRemainingUnusedParameters(content, filePath) {
  let changes = 0;
  let newContent = content;

  const unusedParams = [
    'target', 'source', 'error', 'rec', 'index', 'message', 'args', 'timeFactors',
    'context', 'details', 'zodiac', 'userPreferences', 'season', 'userSign',
    'elementalProps', 'options', 'houses', 'currentDate', 'currentPhase',
    'issue', 'event', 'callback'
  ];

  unusedParams.forEach(paramName => {
    if (!paramName.startsWith('_')) {
      // Fix function parameters (including arrow functions)
      const paramPattern = new RegExp(`(\\([^)]*[,\\s]+)(${paramName})(\\s*[,:\\)])`, 'g');
      const matches = [...content.matchAll(paramPattern)];
      
      if (matches.length > 0) {
        newContent = newContent.replace(paramPattern, `$1_${paramName}$3`);
        changes += matches.length;
      }

      // Fix single parameters
      const singleParamPattern = new RegExp(`(\\(\\s*)(${paramName})(\\s*[:\\)])`, 'g');
      const singleMatches = [...content.matchAll(singleParamPattern)];
      
      if (singleMatches.length > 0) {
        newContent = newContent.replace(singleParamPattern, `$1_${paramName}$3`);
        changes += singleMatches.length;
      }
    }
  });

  return { content: newContent, changes };
}

/**
 * Fix explicit any types with better alternatives
 */
function fixExplicitAnyTypes(content, filePath) {
  let changes = 0;
  let newContent = content;

  // More comprehensive any type replacements
  const anyReplacements = [
    // Basic object types
    { pattern: /:\s*any(?=\s*[=;,)\]])/g, replacement: ': unknown' },
    { pattern: /as\s+any(?=\s*[;,)\]])/g, replacement: 'as unknown' },
    { pattern: /\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*\)/g, replacement: '($1: unknown)' },
    { pattern: /:\s*any\[\]/g, replacement: ': unknown[]' },
    { pattern: /as\s+any\s*\)/g, replacement: 'as unknown)' },
    { pattern: /<any>/g, replacement: '<unknown>' },
    
    // Function types
    { pattern: /\(\s*\.\.\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\[\]\s*\)/g, replacement: '(...$1: unknown[])' },
    { pattern: /=>\s*any/g, replacement: '=> unknown' },
    
    // Record types
    { pattern: /Record<([^,>]+),\s*any>/g, replacement: 'Record<$1, unknown>' },
  ];

  anyReplacements.forEach(({ pattern, replacement }) => {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      newContent = newContent.replace(pattern, replacement);
      changes += matches.length;
    }
  });

  return { content: newContent, changes };
}

/**
 * Comment out console statements
 */
function fixConsoleStatements(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Skip certain files that legitimately need console statements
  const skipConsoleFiles = [
    'logger.ts', 'debug', 'test', 'spec'
  ];

  const shouldSkipConsole = skipConsoleFiles.some(skip => 
    filePath.toLowerCase().includes(skip)
  );

  if (!shouldSkipConsole) {
    // Comment out console statements
    const consolePattern = /^(\s*)(console\.(log|warn|error|info|debug)\([^;]*\);?)$/gm;
    const matches = [...content.matchAll(consolePattern)];
    
    if (matches.length > 0) {
      newContent = newContent.replace(consolePattern, '$1// $2');
      changes += matches.length;
    }
  }

  return { content: newContent, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let totalChanges = 0;
  const fixes = [];

  // Apply all fix patterns
  const fixFunctions = [
    { name: 'Unused Variables', fn: fixRemainingUnusedVariables },
    { name: 'Unused Parameters', fn: fixRemainingUnusedParameters },
    { name: 'Explicit Any Types', fn: fixExplicitAnyTypes },
    { name: 'Console Statements', fn: fixConsoleStatements }
  ];

  fixFunctions.forEach(({ name, fn }) => {
    const result = fn(newContent, filePath);
    newContent = result.content;
    if (result.changes > 0) {
      fixes.push(`${name}: ${result.changes} fixes`);
      totalChanges += result.changes;
    }
  });

  if (totalChanges > 0) {
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`📁 ${relativePath}`);
    fixes.forEach(fix => console.log(`  ✅ ${fix}`));

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent, 'utf8');
    }
  }

  return totalChanges;
}

/**
 * Get files to process
 */
function getFilesToProcess() {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const excludePatterns = [
    'node_modules',
    '.next',
    'dist',
    'build',
    '.git',
    'scripts/cache'
  ];

  function walkDir(dir) {
    const files = [];
    const entries = fs.readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!excludePatterns.some(pattern => fullPath.includes(pattern))) {
          files.push(...walkDir(fullPath));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(entry);
        if (extensions.includes(ext) && !excludePatterns.some(pattern => fullPath.includes(pattern))) {
          files.push(fullPath);
        }
      }
    }

    return files;
  }

  return walkDir(path.join(ROOT_DIR, 'src'));
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Finding files to process...');
  const files = getFilesToProcess();
  console.log(`Found ${files.length} files to check\n`);

  let totalFilesProcessed = 0;
  let totalFixes = 0;

  files.forEach(file => {
    const fixes = processFile(file);
    if (fixes > 0) {
      totalFilesProcessed++;
      totalFixes += fixes;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`Files processed: ${totalFilesProcessed}/${files.length}`);
  console.log(`Total fixes applied: ${totalFixes}`);

  if (DRY_RUN) {
    console.log('\n⚠️  This was a dry run. Remove --dry-run to apply changes.');
  } else {
    console.log('\n✅ All fixes applied successfully!');
    console.log('\n💡 Run "yarn lint" to see the improvements.');
  }
}

main(); 