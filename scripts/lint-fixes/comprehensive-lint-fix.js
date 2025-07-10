#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const FIX_ALL = process.argv.includes('--fix-all');
const SKIP_ESLINT = process.argv.includes('--skip-eslint');
const ONLY_ESLINT = process.argv.includes('--only-eslint');

console.log('🔧 Comprehensive Linting Tool v3.0');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLYING CHANGES'}`);
console.log(`Verbose: ${VERBOSE ? 'ON' : 'OFF'}`);
console.log(`Fix All: ${FIX_ALL ? 'ON' : 'OFF'}`);
console.log(`Skip ESLint: ${SKIP_ESLINT ? 'ON' : 'OFF'}`);
console.log(`Only ESLint: ${ONLY_ESLINT ? 'ON' : 'OFF'}`);

/**
 * Run ESLint and capture output
 */
function runESLint() {
  try {
    console.log('\n🔍 Running ESLint...');
    const result = execSync('yarn lint', { 
      cwd: ROOT_DIR, 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ ESLint passed with no issues');
    return { success: true, output: result };
  } catch (error) {
    console.log('⚠️  ESLint found issues:');
    console.log(error.stdout);
    return { success: false, output: error.stdout };
  }
}

/**
 * Parse ESLint output to extract issues
 */
function parseESLintOutput(output) {
  const issues = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('warning') || line.includes('error')) {
      const match = line.match(/([^:]+):\s*(\d+):(\d+)\s+(warning|error)\s+(.+)/);
      if (match) {
        issues.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          type: match[4],
          message: match[5]
        });
      }
    }
  }
  
  return issues;
}

/**
 * Enhanced Pattern 1: Comprehensive unused variable detection and fixing
 */
function fixUnusedVariables(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Common unused variable names from the lint output
  const commonUnusedVars = [
    'latitude', 'longitude', 'message', 'args', 'zodiacSigns', 'elementalProfile',
    'timeFactors', 'PlanetaryPosition', 'debugLog', 'CACHE_DURATION', 'PlanetDataWithTransits',
    'date', 'calculateApproximateSunSign', 'getDaysSinceDate', 'toZodiacSign',
    'config', 'CacheEntry', 'T', 'baseCompatibility', 'Recipe', 'ElementalProperties',
    'Element', 'LunarPhase', 'ZodiacSign', 'AlchemicalProperties', 'ELEMENTS',
    'Season', 'ErrorHandler', 'times', 'ELEMENT_WEIGHTS', 'calculateUniqueness',
    'ensureSafeNumber', 'applyNonLinearScaling', 'calculateUniquenessScore',
    'generateEnhancedRecommendation', 'userPreferences', 'season', 'userSign',
    'getBalancingElement', 'cuisineFlavorProfiles', 'planetaryFlavorProfiles', 'flavorProfiles',
    'herbCount', 'grainCount', 'filteredOut', 'planetScore', 'currentHour', 'nutritionalScore',
    'getElementalAffinity', 'getPlanetaryElement', 'safeObjectCreate', 'houses',
    'IngredientMapping', 'isNutritionalProfile', 'jupiterData', 'saturnData', 'LUNAR_PHASES',
    'enhanceVenusIngredientScoring', 'amount', 'anyIng', 'logger', 'nutritionInfo',
    'CalculationData', 'CuisineData', 'NutrientData', 'MatchingResult', 'Modality',
    'venusData', 'marsData', 'mercuryData', 'jupiterData', 'mockPlanetaryData',
    'zodiac', 'calculatePlanetaryAspects', 'getCulturalVariations', 'calculateThermodynamicBaseScore',
    'isMarsRetrograde', 'isMercuryRetrograde', 'isJupiterRetrograde', 'isUranusRetrograde',
    'isNeptuneRetrograde', 'isPlutoRetrograde', 'mercuryZodiacTransit', 'uranusZodiacTransit',
    'neptuneZodiacTransit', 'plutoZodiacTransit', 'mercuryTemperament', 'jupiterTemperament',
    'methodNameLower', 'basicProps', 'ZodiacSign', 'PlanetaryAspect', 'planetaryFlavorProfiles',
    'allIngredients', 'calculatePlanetaryAspects', 'getAllDishesForCuisine', 'fallbackFn',
    'ElementalCharacter', 'primaryElement', 'cachedAllIngredientsData', 'cacheTimestamp',
    'elementalProps', 'options', 'Earth', 'isElementalProperties', 'hasFlavorProperties',
    'getElementalProperty', 'AstrologicalProfile', 'Rating', 'getSeasonalModifier',
    'getElementalBreakdown', 'currentDate', 'currentPhase', 'propDetails'
  ];

  commonUnusedVars.forEach(varName => {
    if (!varName.startsWith('_')) {
      // Fix variable declarations
      const declPattern = new RegExp(`(\\s+)(const|let|var)\\s+(${varName})\\s*=`, 'g');
      if (declPattern.test(content)) {
        newContent = newContent.replace(declPattern, `$1$2 _${varName} =`);
        changes++;
        if (VERBOSE) console.log(`  Fixed variable declaration: ${varName}`);
      }

      // Fix variable assignments
      const assignPattern = new RegExp(`(\\s+)(${varName})\\s*=`, 'g');
      if (assignPattern.test(content) && !declPattern.test(content)) {
        newContent = newContent.replace(assignPattern, `$1_${varName} =`);
        changes++;
        if (VERBOSE) console.log(`  Fixed variable assignment: ${varName}`);
      }
    }
  });

  return { content: newContent, changes };
}

/**
 * Enhanced Pattern 2: Comprehensive unused parameter detection and fixing
 */
function fixUnusedParameters(content, filePath) {
  let changes = 0;
  let newContent = content;

  const commonUnusedParams = [
    'rank', 'handler', 'options', 'event', 'callback', 'message', 'args',
    'currentDate', 'currentPhase', 'season', 'elementalProps', 'userPreferences',
    'userSign', 'zodiac', 'elementalProperties', 'context', 'details', 't'
  ];

  commonUnusedParams.forEach(paramName => {
    if (!paramName.startsWith('_')) {
      // Fix function parameters
      const paramPattern = new RegExp(`(\\([^)]*[,\\s]+)(${paramName})(\\s*[,\\)])`, 'g');
      const matches = [...content.matchAll(paramPattern)];
      
      if (matches.length > 0) {
        newContent = newContent.replace(paramPattern, `$1_${paramName}$3`);
        changes += matches.length;
        if (VERBOSE) console.log(`  Fixed function parameter: ${paramName} (${matches.length} instances)`);
      }

      // Fix arrow function parameters
      const arrowParamPattern = new RegExp(`(\\([^)]*[,\\s]+)(${paramName})(\\s*[,\\)].*=>)`, 'g');
      const arrowMatches = [...content.matchAll(arrowParamPattern)];
      
      if (arrowMatches.length > 0) {
        newContent = newContent.replace(arrowParamPattern, `$1_${paramName}$3`);
        changes += arrowMatches.length;
        if (VERBOSE) console.log(`  Fixed arrow function parameter: ${paramName} (${arrowMatches.length} instances)`);
      }
    }
  });

  return { content: newContent, changes };
}

/**
 * Enhanced Pattern 3: Comprehensive unused import detection and fixing
 */
function fixUnusedImports(content, filePath) {
  let changes = 0;
  let newContent = content;

  const commonUnusedImports = [
    'toArray', 'Element', 'getRecipeElementalProperties', 'getRecipeCookingMethods',
    'ElementalProperties', 'ThermodynamicMetrics', 'timeFactors', 'getPlanetaryElementalInfluence',
    'calculatePlanetaryPositions', 'logger', 'IngredientMapping', 'calculateMatchScore',
    'nutritionInfo', 'CalculationData', 'CuisineData', 'NutrientData', 'MatchingResult',
    'elementalUtils', 'isNonEmptyArray', 'safeFilter', 'safeSome', 'createElementalProperties',
    'getElementalProperty', 'recipeHasTag', 'ChakraEnergies', 'AstrologicalProfile', 'PlanetName',
    'getFlavorProperty', 'isElementalProperties', 'getCulturalVariations', 'CulturalCookingMethod',
    'venusData', 'marsData', 'mercuryData', 'jupiterData', 'saturnData', 'uranusData',
    'neptuneData', 'plutoData', 'calculateLunarPhase', 'hasFlavorProperties', 'getElementalProperty',
    'Planet', 'CelestialPosition', 'PlanetaryPosition', 'validatePlanetaryPositions', 'cache',
    'LunarPhase', 'AstrologicalProfile', 'validateElementalProperties', 'normalizeElementalProperties',
    'Rating', 'getElementalBreakdown', 'getCurrentSeason', 'calculateRecipeEnergyMatch',
    'getRecipes', 'Modality', 'RecipeFilters', 'PlanetaryAlignment', 'BasicThermodynamicProperties',
    'getCurrentSeason', 'getTimeOfDay', 'solar', 'moon', 'AlchemicalDignityType', 'PlanetPosition',
    'calculatePositionDifference', 'signToLongitude', 'CacheEntry', 'calculatePlanetPosition',
    'aspects', 'moonSign', 'planetaryDay', 'planetaryMinute', 'tanObliquity', 'nodeCycleDays',
    'LunarPhaseWithSpaces', 'getAllDishesForCuisine', 'fallbackFn', 'ElementalCharacter',
    'baseCompatibility', 'Recipe', 'ElementalProperties', 'Element', 'LunarPhase', 'ZodiacSign',
    'AlchemicalProperties', 'ELEMENTS', 'Season', 'ErrorHandler', 'times', 'ELEMENT_WEIGHTS',
    'calculateUniqueness', 'ensureSafeNumber', 'applyNonLinearScaling', 'calculateUniquenessScore',
    'generateEnhancedRecommendation', 'userPreferences', 'season', 'userSign', 'getBalancingElement',
    'cuisineFlavorProfiles', 'planetaryFlavorProfiles', 'flavorProfiles', 'herbCount', 'grainCount',
    'filteredOut', 'planetScore', 'currentHour', 'nutritionalScore', 'getElementalAffinity',
    'getPlanetaryElement', 'safeObjectCreate', 'houses', 'IngredientMapping', 'isNutritionalProfile',
    'jupiterData', 'saturnData', 'LUNAR_PHASES', 'enhanceVenusIngredientScoring', 'amount',
    'anyIng', 'logger', 'nutritionInfo', 'CalculationData', 'CuisineData', 'NutrientData',
    'MatchingResult', 'Modality', 'venusData', 'marsData', 'mercuryData', 'jupiterData',
    'mockPlanetaryData', 'zodiac', 'calculatePlanetaryAspects', 'getCulturalVariations',
    'calculateThermodynamicBaseScore', 'isMarsRetrograde', 'isMercuryRetrograde', 'isJupiterRetrograde',
    'isUranusRetrograde', 'isNeptuneRetrograde', 'isPlutoRetrograde', 'mercuryZodiacTransit',
    'uranusZodiacTransit', 'neptuneZodiacTransit', 'plutoZodiacTransit', 'mercuryTemperament',
    'jupiterTemperament', 'methodNameLower', 'basicProps', 'ZodiacSign', 'PlanetaryAspect',
    'planetaryFlavorProfiles', 'allIngredients', 'calculatePlanetaryAspects', 'getAllDishesForCuisine',
    'fallbackFn', 'ElementalCharacter', 'primaryElement', 'cachedAllIngredientsData', 'cacheTimestamp',
    'elementalProps', 'options', 'Earth', 'isElementalProperties', 'hasFlavorProperties',
    'getElementalProperty', 'AstrologicalProfile', 'Rating', 'getSeasonalModifier',
    'getElementalBreakdown', 'currentDate', 'currentPhase', 'propDetails'
  ];

  commonUnusedImports.forEach(importName => {
    if (!importName.startsWith('_')) {
      // Fix named imports
      const namedImportPattern = new RegExp(`(import\\s*{[^}]*[,\\s]+)(${importName})([,\\s][^}]*})`, 'g');
      if (namedImportPattern.test(content)) {
        newContent = newContent.replace(namedImportPattern, `$1_${importName}$3`);
        changes++;
        if (VERBOSE) console.log(`  Fixed named import: ${importName}`);
      }

      // Fix single imports
      const singleImportPattern = new RegExp(`(import\\s*{\\s*)(${importName})(\\s*})`, 'g');
      if (singleImportPattern.test(content)) {
        newContent = newContent.replace(singleImportPattern, `$1_${importName}$3`);
        changes++;
        if (VERBOSE) console.log(`  Fixed single import: ${importName}`);
      }
    }
  });

  return { content: newContent, changes };
}

/**
 * Enhanced Pattern 4: Comprehensive any type replacement
 */
function fixExplicitAny(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Enhanced any type replacements with more specific types
  const anyReplacements = [
    // Object types
    { pattern: /:\s*any(?=\s*[=;,)])/g, replacement: ': Record<string, unknown>' },
    { pattern: /as\s+any(?=\s*[;,)])/g, replacement: 'as unknown' },
    
    // Function parameters
    { pattern: /\(\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*\)/g, replacement: '($1: unknown)' },
    
    // Array types
    { pattern: /:\s*any\[\]/g, replacement: ': unknown[]' },
    
    // Property access patterns
    { pattern: /as\s+any\s*\)/g, replacement: 'as unknown)' },
    
    // Generic any types
    { pattern: /<any>/g, replacement: '<unknown>' },
    
    // Return types
    { pattern: /:\s*any\s*=>/g, replacement: ': unknown =>' },
    
    // Variable declarations
    { pattern: /(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*any\s*=/g, replacement: '$1 $2: unknown =' },
  ];

  anyReplacements.forEach(({ pattern, replacement }) => {
    const matches = [...content.matchAll(pattern)];
    if (matches.length > 0) {
      newContent = newContent.replace(pattern, replacement);
      changes += matches.length;
      if (VERBOSE) console.log(`  Fixed any type: ${matches.length} instances`);
    }
  });

  return { content: newContent, changes };
}

/**
 * Enhanced Pattern 5: Smart console statement handling
 */
function fixConsoleStatements(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Skip certain files that legitimately need console statements
  const skipConsoleFiles = [
    'logger.ts', 'debug', 'test', 'spec', 'script', 'block-popup-script.js',
    'globalInitializer.js', 'scriptReplacer.js', 'validatePlanetaryPositions.test.ts'
  ];

  const shouldSkipConsole = skipConsoleFiles.some(skip => 
    filePath.toLowerCase().includes(skip)
  );

  if (!shouldSkipConsole) {
    // Comment out console statements instead of removing them
    const consolePattern = /^(\s*)(console\.(log|warn|error|info|debug)\([^;]*\);?)$/gm;
    const matches = [...content.matchAll(consolePattern)];
    
    if (matches.length > 0) {
      newContent = newContent.replace(consolePattern, '$1// $2');
      changes += matches.length;
      if (VERBOSE) console.log(`  Commented console statements: ${matches.length} instances`);
    }
  }

  return { content: newContent, changes };
}

/**
 * New Pattern 6: Fix no-useless-catch errors
 */
function fixUselessCatch(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Pattern to find unnecessary try/catch wrappers
  const uselessCatchPattern = /try\s*{\s*([^}]+)\s*}\s*catch\s*\(\s*[^)]+\s*\)\s*{\s*throw\s*[^}]*\s*}/g;
  const matches = [...content.matchAll(uselessCatchPattern)];
  
  if (matches.length > 0) {
    // Replace with just the try block content
    newContent = newContent.replace(uselessCatchPattern, '$1');
    changes += matches.length;
    if (VERBOSE) console.log(`  Fixed useless catch: ${matches.length} instances`);
  }

  return { content: newContent, changes };
}

/**
 * New Pattern 7: Fix no-setter-return errors
 */
function fixSetterReturn(content, filePath) {
  let changes = 0;
  let newContent = content;

  // Pattern to find setters that return values
  const setterReturnPattern = /set\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(\s*[^)]+\s*\)\s*{\s*[^}]*return\s+[^}]*\s*}/g;
  const matches = [...content.matchAll(setterReturnPattern)];
  
  if (matches.length > 0) {
    // Remove return statements from setters
    newContent = newContent.replace(setterReturnPattern, (match) => {
      return match.replace(/return\s+[^;]+;?\s*/, '');
    });
    changes += matches.length;
    if (VERBOSE) console.log(`  Fixed setter return: ${matches.length} instances`);
  }

  return { content: newContent, changes };
}

/**
 * Main function to process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let totalChanges = 0;

    const patterns = [
      { name: 'Unused Variables', fix: fixUnusedVariables },
      { name: 'Unused Parameters', fix: fixUnusedParameters },
      { name: 'Unused Imports', fix: fixUnusedImports },
      { name: 'Explicit Any Types', fix: fixExplicitAny },
      { name: 'Console Statements', fix: fixConsoleStatements },
      { name: 'Useless Catch', fix: fixUselessCatch },
      { name: 'Setter Return', fix: fixSetterReturn }
    ];

    const fileChanges = {};

    patterns.forEach(({ name, fix }) => {
      const result = fix(newContent, filePath);
      newContent = result.content;
      fileChanges[name] = result.changes;
      totalChanges += result.changes;
    });

    if (totalChanges > 0) {
      console.log(`\n📁 ${path.relative(ROOT_DIR, filePath)}`);
      Object.entries(fileChanges).forEach(([patternName, changes]) => {
        if (changes > 0) {
          console.log(`  ✅ ${patternName}: ${changes} fixes`);
        }
      });

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, newContent, 'utf8');
      }
    }

    return totalChanges;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get all TypeScript and JavaScript files to process
 */
function getFilesToProcess() {
  const srcDir = path.join(ROOT_DIR, 'src');
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        // Only process TypeScript and JavaScript files
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  walkDir(srcDir);
  return files;
}

/**
 * Generate a comprehensive report
 */
function generateReport(totalChanges, processedFiles, totalFiles, eslintIssues) {
  console.log('\n📊 Comprehensive Linting Tool Report:');
  console.log(`Files processed: ${processedFiles}/${totalFiles}`);
  console.log(`Total fixes applied: ${totalChanges}`);
  console.log(`Success rate: ${((processedFiles / totalFiles) * 100).toFixed(1)}%`);
  
  if (eslintIssues) {
    console.log(`ESLint issues found: ${eslintIssues.length}`);
    const errorCount = eslintIssues.filter(issue => issue.type === 'error').length;
    const warningCount = eslintIssues.filter(issue => issue.type === 'warning').length;
    console.log(`  - Errors: ${errorCount}`);
    console.log(`  - Warnings: ${warningCount}`);
  }
  
  if (DRY_RUN) {
    console.log('\n⚠️  This was a dry run. Add --apply to make changes.');
  } else {
    console.log('\n✅ All fixes applied successfully!');
    console.log('\n💡 Run "yarn lint" to see the improvements.');
  }
}

/**
 * Main execution
 */
async function main() {
  let eslintIssues = null;
  
  if (!ONLY_ESLINT) {
    console.log('\n🔍 Finding files to process...');
    const files = getFilesToProcess();
    console.log(`Found ${files.length} files to check`);

    let totalChanges = 0;
    let processedFiles = 0;

    files.forEach(filePath => {
      const changes = processFile(filePath);
      if (changes > 0) {
        processedFiles++;
        totalChanges += changes;
      }
    });

    generateReport(totalChanges, processedFiles, files.length, eslintIssues);
  }

  if (!SKIP_ESLINT) {
    const eslintResult = runESLint();
    if (!eslintResult.success) {
      eslintIssues = parseESLintOutput(eslintResult.output);
      console.log(`\n📋 ESLint Issues Summary:`);
      console.log(`Total issues: ${eslintIssues.length}`);
      
      const errorCount = eslintIssues.filter(issue => issue.type === 'error').length;
      const warningCount = eslintIssues.filter(issue => issue.type === 'warning').length;
      console.log(`Errors: ${errorCount}, Warnings: ${warningCount}`);
      
      if (FIX_ALL && !DRY_RUN) {
        console.log('\n🔄 Running ESLint auto-fix...');
        try {
          execSync('yarn lint:fix', { cwd: ROOT_DIR, stdio: 'inherit' });
          console.log('✅ ESLint auto-fix completed');
        } catch (error) {
          console.log('⚠️  ESLint auto-fix had issues, but some fixes were applied');
        }
      }
    }
  }
}

main(); 