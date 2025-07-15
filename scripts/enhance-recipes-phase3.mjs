#!/usr/bin/env node

// ===== PHASE 3 RECIPE ENHANCEMENT SCRIPT =====
// Enhances existing cuisine files with Kalchm and Monica constant calculations
// WITHOUT removing any existing data - purely additive enhancements

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  dryRun: true, // Start with dry run mode
  backupFiles: false, // No backups as per requirements
  cuisinesDir: path.join(projectRoot, 'src/data/cuisines'),
  unifiedDir: path.join(projectRoot, 'src/data/unified'),
  outputDir: path.join(projectRoot, 'src/data/unified'),
  logLevel: 'info'
};

// Enhanced recipe interface for Phase 3
const ENHANCED_RECIPE_TEMPLATE = {
  // Existing recipe properties preserved
  // NEW: Alchemical enhancements
  alchemicalProperties: {
    totalKalchm: 0,
    monicaConstant: 0,
    thermodynamicProfile: {
      heat: 0,
      entropy: 0,
      reactivity: 0,
      gregsEnergy: 0
    },
    ingredientKalchmBreakdown: [],
    elementalBalance: {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    }
  },
  // NEW: Enhanced cooking optimization
  cookingOptimization: {
    optimalTemperature: null,
    planetaryTiming: null,
    monicaAdjustments: {},
    elementalCookingMethod: null
  },
  // NEW: Metadata tracking
  enhancementMetadata: {
    phase3Enhanced: false,
    kalchmCalculated: false,
    monicaCalculated: false,
    enhancedAt: null,
    sourceFile: null
  }
};

// Logging utility
function log(level, message, data = null) {
  if (CONFIG.logLevel === 'info' || level === 'error') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

// Load unified ingredients for Kalchm lookup
async function loadUnifiedIngredients() {
  try {
    const ingredientsPath = path.join(CONFIG.unifiedDir, 'ingredients.ts');
    const content = await fs.readFile(ingredientsPath, 'utf-8');
    
    // Extract the unifiedIngredients object (simplified parsing)
    const match = content.match(/export const unifiedIngredients[^=]*=\s*({[\s\S]*?});/);
    if (!match) {
      throw new Error('Could not parse unified ingredients');
    }
    
    // For now, return a mock structure - in production we'd properly parse this
    log('info', 'Loaded unified ingredients system');
    return {
      totalIngredients: 1078,
      kalchmRange: { min: 0.759056, max: 1.361423 },
      loaded: true
    };
  } catch (error) {
    log('error', 'Failed to load unified ingredients', error.message);
    return { loaded: false };
  }
}

// Load alchemical calculation functions
async function loadAlchemicalCalculations() {
  try {
    const calcPath = path.join(CONFIG.unifiedDir, 'alchemicalCalculations.ts');
    const content = await fs.readFile(calcPath, 'utf-8');
    
    log('info', 'Loaded alchemical calculations system');
    return {
      calculateKalchm: true,
      calculateMonica: true,
      performAlchemicalAnalysis: true,
      loaded: true
    };
  } catch (error) {
    log('error', 'Failed to load alchemical calculations', error.message);
    return { loaded: false };
  }
}

// Calculate recipe Kalchm from ingredients
function calculateRecipeKalchm(ingredients, unifiedIngredients) {
  if (!ingredients || !Array.isArray(ingredients)) {
    return 1.0; // Default Kalchm
  }
  
  let totalKalchm = 0;
  let validIngredients = 0;
  const breakdown = [];
  
  for (const ingredient of ingredients) {
    // Mock calculation - in production, lookup from unifiedIngredients
    const mockKalchm = 1.0 + (Math.random() * 0.4 - 0.2); // Range: 0.8-1.2
    totalKalchm += mockKalchm;
    validIngredients++;
    
    breakdown.push({
      name: ingredient.name,
      kalchm: mockKalchm,
      contribution: mockKalchm / ingredients.length
    });
  }
  
  return {
    totalKalchm: validIngredients > 0 ? totalKalchm / validIngredients : 1.0,
    breakdown
  };
}

// Calculate Monica constant for recipe
function calculateRecipeMonica(thermodynamics, kalchm) {
  const { gregsEnergy, reactivity } = thermodynamics;
  
  if (kalchm <= 0 || reactivity === 0) {
    return NaN;
  }
  
  const lnKalchm = Math.log(kalchm);
  if (lnKalchm === 0) {
    return NaN;
  }
  
  return -gregsEnergy / (reactivity * lnKalchm);
}

// Calculate thermodynamic properties for recipe
function calculateRecipeThermodynamics(elementalBalance) {
  const { Fire, water, earth, Air } = elementalBalance;
  
  // Mock thermodynamic calculations based on elemental properties
  const heat = (Fire * Fire + 0.5) / (water + earth + Air + 1);
  const entropy = (Fire + Air) / (water + earth + 1);
  const reactivity = (Fire + Air + water) / (earth + 1);
  const gregsEnergy = heat - (entropy * reactivity);
  
  return { heat, entropy, reactivity, gregsEnergy };
}

// Calculate elemental balance from ingredients
function calculateElementalBalance(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  let totalFire = 0, totalwater = 0, totalearth = 0, totalAir = 0;
  let count = 0;
  
  for (const ingredient of ingredients) {
    // Use existing elemental properties if available
    if (ingredient.element) {
      switch (ingredient.element.toLowerCase()) {
        case 'Fire': totalFire += 1; break;
        case 'Water': totalwater += 1; break;
        case 'Earth': totalearth += 1; break;
        case 'Air': totalAir += 1; break;
      }
      count++;
    }
  }
  
  if (count === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  return {
    Fire: totalFire / count,
    Water: totalwater / count,
    Earth: totalearth / count,
    Air: totalAir / count
  };
}

// Enhance a single recipe with alchemical properties
function enhanceRecipeWithAlchemy(recipe, unifiedIngredients, alchemicalCalcs) {
  // Calculate elemental balance from ingredients
  const elementalBalance = recipe.elementalProperties || calculateElementalBalance(recipe.ingredients);
  
  // Calculate recipe Kalchm
  const kalchmResult = calculateRecipeKalchm(recipe.ingredients, unifiedIngredients);
  
  // Calculate thermodynamic properties
  const thermodynamics = calculateRecipeThermodynamics(elementalBalance);
  
  // Calculate Monica constant
  const monicaConstant = calculateRecipeMonica(thermodynamics, kalchmResult.totalKalchm);
  
  // Create enhanced recipe (additive - preserves all existing data)
  const enhancedRecipe = {
    ...recipe, // Preserve ALL existing properties
    
    // ADD new alchemical properties
    alchemicalProperties: {
      totalKalchm: kalchmResult.totalKalchm,
      monicaConstant: isNaN(monicaConstant) ? null : monicaConstant,
      thermodynamicProfile: thermodynamics,
      ingredientKalchmBreakdown: kalchmResult.breakdown,
      elementalBalance
    },
    
    // ADD cooking optimization data
    cookingOptimization: {
      optimalTemperature: calculateOptimalTemperature(thermodynamics),
      planetaryTiming: calculatePlanetaryTiming(recipe),
      monicaAdjustments: calculateMonicaAdjustments(monicaConstant),
      elementalCookingMethod: determineElementalCookingMethod(elementalBalance)
    },
    
    // ADD enhancement metadata
    enhancementMetadata: {
      phase3Enhanced: true,
      kalchmCalculated: true,
      monicaCalculated: !isNaN(monicaConstant),
      enhancedAt: new Date().toISOString(),
      sourceFile: 'phase3-enhancement'
    }
  };
  
  return enhancedRecipe;
}

// Helper functions for cooking optimization
function calculateOptimalTemperature(thermodynamics) {
  const { heat, reactivity } = thermodynamics;
  // Base temperature adjusted by thermodynamic properties
  return Math.round(350 + (heat * 50) - (reactivity * 25));
}

function calculatePlanetaryTiming(recipe) {
  // Use existing astrological data if available
  if (recipe.astrologicalAffinities?.planets) {
    return recipe.astrologicalAffinities.planets[0] + ' hour';
  }
  return null;
}

function calculateMonicaAdjustments(monicaConstant) {
  if (isNaN(monicaConstant) || monicaConstant === null) {
    return {};
  }
  
  return {
    temperatureAdjustment: Math.round(monicaConstant * 10),
    timingAdjustment: Math.round(monicaConstant * 5),
    intensityModifier: monicaConstant > 0 ? 'increase' : 'decrease'
  };
}

function determineElementalCookingMethod(elementalBalance) {
  const { Fire, water, earth, Air } = elementalBalance;
  
  if (Fire > 0.4) return 'fire-dominant'; // Grilling, roasting
  if (water > 0.4) return 'water-dominant'; // Steaming, boiling
  if (earth > 0.4) return 'earth-dominant'; // Baking, slow cooking
  if (Air > 0.4) return 'Air-dominant'; // Whipping, rising
  
  return 'balanced'; // Multiple cooking methods
}

// Process a single cuisine file
async function processCuisineFile(cuisineFile) {
  const filePath = path.join(CONFIG.cuisinesDir, cuisineFile);
  
  try {
    log('info', `Processing cuisine file: ${cuisineFile}`);
    
    // Read the file
    const content = await fs.readFile(filePath, 'utf-8');
    
    // For dry run, just analyze the structure
    if (CONFIG.dryRun) {
      const dishMatches = content.match(/dishes:\s*{/g);
      const recipeCount = (content.match(/name:\s*["']/g) || []).length;
      
      log('info', `Analysis for ${cuisineFile}:`, {
        hasDishesSections: dishMatches ? dishMatches.length : 0,
        estimatedRecipes: recipeCount,
        fileSize: `${Math.round(content.length / 1024)}KB`
      });
      
      return {
        file: cuisineFile,
        analyzed: true,
        recipesFound: recipeCount,
        needsEnhancement: recipeCount > 0
      };
    }
    
    // In production mode, would parse and enhance the actual file
    // For now, return analysis
    return {
      file: cuisineFile,
      processed: false,
      reason: 'Production enhancement not implemented yet'
    };
    
  } catch (error) {
    log('error', `Failed to process ${cuisineFile}`, error.message);
    return {
      file: cuisineFile,
      error: error.message
    };
  }
}

// Main execution function
async function main() {
  log('info', '🚀 Starting Phase 3 Recipe Enhancement');
  log('info', `Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  
  try {
    // Load required systems
    log('info', 'Loading unified systems...');
    const [unifiedIngredients, alchemicalCalcs] = await Promise.all([
      loadUnifiedIngredients(),
      loadAlchemicalCalculations()
    ]);
    
    if (!unifiedIngredients.loaded || !alchemicalCalcs.loaded) {
      throw new Error('Failed to load required unified systems');
    }
    
    // Get cuisine files
    const cuisineFiles = await fs.readdir(CONFIG.cuisinesDir);
    const tsFiles = cuisineFiles.filter(file => 
      file.endsWith('.ts') && 
      !file.includes('index') && 
      !file.includes('template') &&
      !file.includes('__mocks__')
    );
    
    log('info', `Found ${tsFiles.length} cuisine files to process`);
    
    // Process each cuisine file
    const results = [];
    for (const file of tsFiles) {
      const result = await processCuisineFile(file);
      results.push(result);
    }
    
    // Summary
    const totalRecipes = results.reduce((sum, r) => sum + (r.recipesFound || 0), 0);
    const needsEnhancement = results.filter(r => r.needsEnhancement).length;
    
    log('info', '📊 Phase 3 Enhancement Summary:', {
      cuisineFilesAnalyzed: results.length,
      totalRecipesFound: totalRecipes,
      filesNeedingEnhancement: needsEnhancement,
      averageRecipesPerFile: Math.round(totalRecipes / results.length)
    });
    
    if (CONFIG.dryRun) {
      log('info', '✅ Dry run completed successfully');
      log('info', 'To run in production mode, set CONFIG.dryRun = false');
    }
    
  } catch (error) {
    log('error', 'Phase 3 enhancement failed', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--production')) {
  CONFIG.dryRun = false;
  log('info', 'Production mode enabled');
}

if (process.argv.includes('--verbose')) {
  CONFIG.logLevel = 'verbose';
  log('info', 'Verbose logging enabled');
}

// Run the script
main().catch(error => {
  log('error', 'Unhandled error', error);
  process.exit(1);
}); 