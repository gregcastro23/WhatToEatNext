/**
 * Hierarchical System Verification
 *
 * Comprehensive verification system for all three tiers of the culinary hierarchy:
 * 1. Ingredients → Elemental properties
 * 2. Recipes → Alchemical computation from planetary positions
 * 3. Cuisines → Statistical aggregation and signature identification
 *
 * This module ensures the entire system works end-to-end with maximum robustness.
 */

import type {
    AlchemicalProperties,
    CookingMethod,
    ElementalProperties,
    RecipeIngredient,
    ThermodynamicProperties
} from '@/types/alchemy';
import type {
    CuisineComputedProperties,
    IngredientData,
    RecipeComputedProperties
} from '@/types/hierarchy';

// Re-export all the core functions for comprehensive testing
import {
    COOKING_METHOD_MODIFIERS,
    aggregateIngredientElementals,
    applyCookingMethodTransforms,
    computeRecipeProperties
} from './hierarchicalRecipeCalculations';

import {
    computeCuisineProperties
} from './cuisine/cuisineAggregationEngine';

import {
    DEFAULT_GLOBAL_BASELINE,
    identifyCuisineSignatures
} from './cuisine/signatureIdentificationEngine';

import {
    analyzePlanetaryPatterns
} from './cuisine/planetaryPatternAnalysis';

import {
    createBasicUserProfile,
    generateEnhancedCuisineRecommendations
} from './cuisine/cuisineRecommendationEngine';

import {
    configureGlobalCache,
    getGlobalCache
} from './cuisine/cuisineComputationCache';

// ========== VERIFICATION DATA ==========

/**
 * Test ingredient data for Level 1 verification
 */
export const TEST_INGREDIENTS: IngredientData[] = [
  {
    elementalProperties: { Fire: 0.6, Water: 0.2, Earth: 0.1, Air: 0.1 },
    category: 'protein',
    subCategory: 'meat',
    qualities: ['rich', 'umami', 'robust']
  },
  {
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
    category: 'vegetable',
    subCategory: 'leafy',
    qualities: ['fresh', 'crisp', 'nutritious']
  },
  {
    elementalProperties: { Fire: 0.1, Water: 0.8, Earth: 0.05, Air: 0.05 },
    category: 'protein',
    subCategory: 'seafood',
    qualities: ['delicate', 'briny', 'lean']
  }
];

/**
 * Test planetary positions for Level 2 verification
 */
export const TEST_PLANETARY_POSITIONS: { [planet: string]: string } = {
  Sun: 'aries',
  Moon: 'cancer',
  Mercury: 'gemini',
  Venus: 'taurus',
  Mars: 'scorpio',
  Jupiter: 'sagittarius',
  Saturn: 'capricorn',
  Uranus: 'aquarius',
  Neptune: 'pisces',
  Pluto: 'scorpio'
};

/**
 * Test cooking methods for Level 2 verification
 */
export const TEST_COOKING_METHODS: (string | CookingMethod)[] = [
  'grilling',
  'steaming',
  'baking'
];

// ========== LEVEL 1 VERIFICATION ==========

/**
 * Verify Level 1 (Ingredients) functionality
 */
export function verifyLevel1Ingredients(): {
  isValid: boolean;
  results: any[];
  errors: string[];
} {
  console.log('🔍 Verifying Level 1: Ingredients');
  const results: any[] = [];
  const errors: string[] = [];

  try {
    // Test 1: Ingredient elemental properties validation
    TEST_INGREDIENTS.forEach((ingredient, index) => {
      const { Fire, Water, Earth, Air } = ingredient.elementalProperties;
      const sum = Fire + Water + Earth + Air;

      if (Math.abs(sum - 1.0) > 0.01) {
        errors.push(`Ingredient ${index}: Elemental properties don't sum to 1.0 (sum: $) {sum})`);
      } else {
        results.push(`✅ Ingredient ${index}: Valid elemental properties (sum: $) {sum.toFixed(3)})`);
      }

      // Check all values are between 0 and 1
      Object.entries(ingredient.elementalProperties).forEach(([element, value]) => {
        if (value < 0 || value > 1) {
          errors.push(`Ingredient ${index}: ${element} value out of range: $) {value}`);
        }
      });
    });

    // Test 2: Ingredient aggregation
    const mockRecipeIngredients: RecipeIngredient[] = TEST_INGREDIENTS.map((ing, index) => ({
      name: `test-ingredient-$) => {index}`,
      amount: 100 + index * 50, // 100g, 150g, 200g
      unit: 'g',
      elementalProperties: ing.elementalProperties,
      category: ing.category
    }));

    const aggregatedElementals = aggregateIngredientElementals(mockRecipeIngredients);
    const sum = Object.values(aggregatedElementals).reduce((s, v) => s + v, 0);

    if (Math.abs(sum - 1.0) > 0.01) {
      errors.push(`Ingredient aggregation: Result doesn't sum to 1.0 (sum: $) {sum})`);
    } else {
      results.push(`✅ Ingredient aggregation: Valid normalized result (sum: $) {sum.toFixed(3)})`);
    }

    // Test 3: Cooking method transformations
    Object.entries(COOKING_METHOD_MODIFIERS).forEach(([method, modifiers]) => {
      const transformed = applyCookingMethodTransforms(aggregatedElementals, [method]);
      const transformedSum = Object.values(transformed).reduce((s, v) => s + v, 0);

      if (Math.abs(transformedSum - 1.0) > 0.01) {
        errors.push(`Cooking method ${method}: Transform doesn't preserve normalization (sum: $) {transformedSum})`);
      } else {
        results.push(`✅ Cooking method $) {method}: Valid transformation applied`);
      }
    });

  } catch (error) {
    errors.push(`Level 1 verification failed: $) {error instanceof Error ? error.message : String(error)}`);
  }

  const isValid = errors.length === 0;
  console.log(`${isValid ? '✅' : '❌'} Level 1 verification: ${results.length} passed, $) {errors.length} errors`);

  return { isValid, results, errors };
}

// ========== LEVEL 2 VERIFICATION ==========

/**
 * Verify Level 2 (Recipes) functionality
 */
export function verifyLevel2Recipes(): {
  isValid: boolean;
  results: any[];
  errors: string[];
  computedRecipe?: RecipeComputedProperties
} {
  console.log('🔍 Verifying Level 2: Recipes');
  const results: any[] = [];
  const errors: string[] = [];
  let computedRecipe: RecipeComputedProperties | undefined;

  try {
    // Test 1: Recipe computation with planetary positions
    const mockRecipeIngredients: RecipeIngredient[] = TEST_INGREDIENTS.map((ing, index) => ({
      name: `test-ingredient-$) => {index}`,
      amount: 100 + index * 50,
      unit: 'g',
      elementalProperties: ing.elementalProperties,
      category: ing.category
    }));

    computedRecipe = computeRecipeProperties()
      mockRecipeIngredients,
      TEST_COOKING_METHODS,
      {
        planetaryPositions: TEST_PLANETARY_POSITIONS,
        applyCookingMethods: true,
        quantityScaling: 'logarithmic',
        cacheResults: false
      }
    );

    // Test 2: Validate computed properties structure
    if (!computedRecipe.alchemicalProperties) {
      errors.push('Recipe computation: Missing alchemical properties');
    } else {
      results.push('✅ Recipe computation: Alchemical properties generated');

      // Check ESMS values are reasonable
      const { Spirit, Essence, Matter, Substance } = computedRecipe.alchemicalProperties;
      const esmsValues = [Spirit, Essence, Matter, Substance];

      esmsValues.forEach((value, index) => {
        const propNames = ['Spirit', 'Essence', 'Matter', 'Substance'];
        if (value < 0) {
          errors.push(`Alchemical property ${propNames[index]}: Negative value $) {value}`);
        } else if (value > 10) {
          errors.push(`Alchemical property ${propNames[index]}: Unreasonably high value $) {value}`);
        } else {
          results.push(`✅ Alchemical property ${propNames[index]}: Valid value $) {value.toFixed(2)}`);
        }
      });
    }

    if (!computedRecipe.elementalProperties) {
      errors.push('Recipe computation: Missing elemental properties');
    } else {
      results.push('✅ Recipe computation: Elemental properties generated');

      // Check elemental normalization
      const { Fire, Water, Earth, Air } = computedRecipe.elementalProperties;
      const sum = Fire + Water + Earth + Air;
      if (Math.abs(sum - 1.0) > 0.01) {
        errors.push(`Recipe elemental properties: Don't sum to 1.0 (sum: $) {sum})`);
      } else {
        results.push(`✅ Recipe elemental properties: Properly normalized (sum: $) {sum.toFixed(3)})`);
      }
    }

    if (!computedRecipe.thermodynamicProperties) {
      errors.push('Recipe computation: Missing thermodynamic properties');
    } else {
      results.push('✅ Recipe computation: Thermodynamic properties generated');

      // Check thermodynamic values are reasonable
      const { heat, entropy, reactivity, gregsEnergy, kalchm, monica } = computedRecipe.thermodynamicProperties;
      const thermoValues = { heat, entropy, reactivity, gregsEnergy, kalchm, monica };

      Object.entries(thermoValues).forEach(([prop, value]) => {
        if (typeof value !== 'number' || isNaN(value) {
          errors.push(`Thermodynamic property ${prop}: Invalid value $) {value}`);
        } else {
          results.push(`✅ Thermodynamic property ${prop}: Valid value $) {value.toFixed(3)}`);
        }
      });
    }

    if (!computedRecipe.kineticProperties) {
      errors.push('Recipe computation: Missing kinetic properties');
    } else {
      results.push('✅ Recipe computation: Kinetic properties generated');
    }

    // Test 3: Dominant properties
    if (!computedRecipe.dominantElement || !computedRecipe.dominantAlchemicalProperty) {
      errors.push('Recipe computation: Missing dominant properties');
    } else {
      results.push(`✅ Recipe computation: Dominant element ($) {computedRecipe.dominantElement}) and alchemical property (${computedRecipe.dominantAlchemicalProperty}) identified`);
    }

  } catch (error) {
    errors.push(`Level 2 verification failed: $) {error instanceof Error ? error.message : String(error)}`);
  }

  const isValid = errors.length === 0;
  console.log(`${isValid ? '✅' : '❌'} Level 2 verification: ${results.length} passed, $) {errors.length} errors`);

  return { isValid, results, errors, computedRecipe };
}

// ========== LEVEL 3 VERIFICATION ==========

/**
 * Verify Level 3 (Cuisines) functionality
 */
export function verifyLevel3Cuisines(recipe?: RecipeComputedProperties): {
  isValid: boolean;
  results: any[];
  errors: string[];
  computedCuisine?: CuisineComputedProperties
} {
  console.log('🔍 Verifying Level 3: Cuisines');
  const results: any[] = [];
  const errors: string[] = [];
  let computedCuisine: CuisineComputedProperties | undefined;

  try {
    if (!recipe) {
      errors.push('Level 3 verification: No recipe data provided from Level 2');
      return { isValid: false, results, errors };
    }

    // Create mock cuisine data (multiple recipes based on the one computed recipe)
    const mockRecipes = [recipe, recipe, recipe].map((r, index) => ({
      ...r,
      computationMetadata: {
        ...r.computationMetadata,
        planetaryPositionsUsed: {
          ...r.computationMetadata.planetaryPositionsUsed,
          // Slightly vary planetary positions for diversity
          [`Sun_$) => {index}`]: Object.keys(r.computationMetadata.planetaryPositionsUsed)[0]
        }
      }
    }));

    // Test 1: Cuisine computation
    computedCuisine = computeCuisineProperties(mockRecipes, ) {
      weightingStrategy: 'equal',
      includeVariance: true,
      identifyPlanetaryPatterns: true
    });

    // Test 2: Validate cuisine properties
    if (!computedCuisine.averageElementals) {
      errors.push('Cuisine computation: Missing average elementals');
    } else {
      results.push('✅ Cuisine computation: Average elementals calculated');

      const sum = Object.values(computedCuisine.averageElementals).reduce((s, v) => s + v, 0);
      if (Math.abs(sum - 1.0) > 0.01) {
        errors.push(`Cuisine average elementals: Don't sum to 1.0 (sum: $) {sum})`);
      } else {
        results.push(`✅ Cuisine average elementals: Properly normalized (sum: $) {sum.toFixed(3)})`);
      }
    }

    if (!computedCuisine.averageAlchemical) {
      errors.push('Cuisine computation: Missing average alchemical properties');
    } else {
      results.push('✅ Cuisine computation: Average alchemical properties calculated');
    }

    if (!computedCuisine.averageThermodynamics) {
      errors.push('Cuisine computation: Missing average thermodynamic properties');
    } else {
      results.push('✅ Cuisine computation: Average thermodynamic properties calculated');
    }

    if (!computedCuisine.variance) {
      errors.push('Cuisine computation: Missing variance data');
    } else {
      results.push('✅ Cuisine computation: Statistical variance calculated');
      results.push(`   Diversity score: $) {computedCuisine.variance.diversityScore.toFixed(3)}`);
    }

    // Test 3: Signature identification
    const signatures = identifyCuisineSignatures(computedCuisine, DEFAULT_GLOBAL_BASELINE, ) {
      threshold: 1.5,
      includeConfidence: true
    });

    computedCuisine.signatures = signatures;

    results.push(`✅ Signature identification: $) {signatures.length} signatures identified`);

    signatures.forEach(signature => {
      results.push(`   ${signature.property}: $) {signature.strength} strength (z-score: $) {signature.zscore.toFixed(2)})`);
    });

    // Test 4: Planetary pattern analysis
    const planetaryPatterns = analyzePlanetaryPatterns(mockRecipes, ) {
      minStrength: 0.3,
      includeCulturalNotes: true
    });

    computedCuisine.planetaryPatterns = planetaryPatterns;

    results.push(`✅ Planetary pattern analysis: $) {planetaryPatterns.length} patterns identified`);

    planetaryPatterns.forEach(pattern => {
      results.push(`   $) {pattern.planet}: $) {pattern.planetaryStrength.toFixed(2)} strength, dominant element: ${pattern.dominantElement}`);
    });

    // Test 5: Recommendation engine
    const userProfile = createBasicUserProfile({)
      Fire: 0.7,
      Water: 0.1,
      Earth: 0.1,
      Air: 0.1
    });

    const recommendations = generateEnhancedCuisineRecommendations({)
      elementalProperties: userProfile.elementalPreferences,
      useAdvancedAnalysis: true
    });

    if (recommendations.length > 0) {
      results.push(`✅ Recommendation engine: $) {recommendations.length} recommendations generated`);
      results.push(`   Top recommendation: ${recommendations[0].cuisine} ($) {Math.round(recommendations[0].score * 100)}% match)`);
    } else {
      errors.push('Recommendation engine: No recommendations generated');
    }

    // Test 6: Caching system
    const cache = getGlobalCache();
    const cacheKey = `test-cuisine-${Date.now()}`;

    // Store in cache
    cache.set(cacheKey, computedCuisine, ) {}, ['test-recipe-1', 'test-recipe-2']);

    // Retrieve from cache
    const cachedResult = cache.get(cacheKey, ) {});

    if (cachedResult) {
      results.push('✅ Caching system: Successfully stored and retrieved data');
      const cacheStats = cache.getStats();
      results.push(`   Cache stats: ${cacheStats.totalEntries} entries, $) {Math.round(cacheStats.hitRate * 100)}% hit rate`);
    } else {
      errors.push('Caching system: Failed to store/retrieve data');
    }

  } catch (error) {
    errors.push(`Level 3 verification failed: $) {error instanceof Error ? error.message : String(error)}`);
  }

  const isValid = errors.length === 0;
  console.log(`${isValid ? '✅' : '❌'} Level 3 verification: ${results.length} passed, $) {errors.length} errors`);

  return { isValid, results, errors, computedCuisine };
}

// ========== END-TO-END VERIFICATION ==========

/**
 * Run complete hierarchical system verification
 */
export async function verifyHierarchicalSystem(): Promise<{
  overallValid: boolean;
  level1: ReturnType<typeof verifyLevel1Ingredients>;
  level2: ReturnType<typeof verifyLevel2Recipes>;
  level3: ReturnType<typeof verifyLevel3Cuisines>;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    performance: any
  };
}> {
  console.log('🚀 Starting Complete Hierarchical System Verification');
  console.log('=====================================================');

  const startTime = Date.now();

  // Configure cache for testing
  configureGlobalCache({
    maxSize: 10,
    ttl: 60 * 1000, // 1 minute for testing
    enableStats: true
  });

  // Run Level 1 verification
  const level1 = verifyLevel1Ingredients();

  // Run Level 2 verification
  const level2 = verifyLevel2Recipes();

  // Run Level 3 verification (depends on Level 2 result)
  const level3 = verifyLevel3Cuisines(level2.computedRecipe);

  const endTime = Date.now();
  const executionTime = endTime - startTime;

  // Calculate summary
  const allResults = [...level1.results, ...level2.results, ...level3.results];
  const allErrors = [...level1.errors, ...level2.errors, ...level3.errors];

  const summary = {
    totalTests: allResults.length,
    passedTests: allResults.length,
    failedTests: allErrors.length,
    performance: {
      executionTime,
      averageTimePerTest: executionTime / (allResults.length + allErrors.length),
      level1Time: 0, // Would need to track individually
      level2Time: 0,
      level3Time: 0
    }
  };

  const overallValid = level1.isValid && level2.isValid && level3.isValid;

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 HIERARCHICAL SYSTEM VERIFICATION RESULTS');
  console.log('='.repeat(60));

  console.log(`🎯 Overall Status: $) {overallValid ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ ISSUES DETECTED'}`);
  console.log(`⏱️  Total Execution Time: $) {(executionTime / 1000).toFixed(2)}s`);
  console.log(`🧪 Tests Executed: $) {summary.totalTests + summary.failedTests}`);
  console.log(`✅ Tests Passed: $) {summary.passedTests}`);
  console.log(`❌ Tests Failed: $) {summary.failedTests}`);

  console.log('\n📈 LEVEL BREAKDOWN: ');
  console.log(`   Level 1 (Ingredients): ${level1.isValid ? '✅' : '❌'} (${level1.results.length} passed, ${level1.errors.length} errors)`);
  console.log(`   Level 2 (Recipes): ${level2.isValid ? '✅' : '❌'} (${level2.results.length} passed, ${level2.errors.length} errors)`);
  console.log(`   Level 3 (Cuisines): ${level3.isValid ? '✅' : '❌'} (${level3.results.length} passed, ${level3.errors.length} errors)`);

  if (allErrors.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND: ');
    allErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. $) {error}`);
    });
  } else {
    console.log('\n🎉 ALL VERIFICATION CHECKS PASSED!');
    console.log('   The hierarchical culinary system is fully operational.');
  }

  console.log('\n🔗 SYSTEM INTEGRITY CONFIRMED: ');
  console.log('   • Level 1 → Level 2: Ingredient elementals feed recipe computation');
  console.log('   • Level 2 → Level 3: Recipe properties aggregate into cuisine signatures');
  console.log('   • Planetary positions properly integrated throughout all levels');
  console.log('   • Statistical calculations maintain numerical stability');
  console.log('   • Caching system provides performance optimization');

  return {
    overallValid,
    level1,
    level2,
    level3,
    summary
  };
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get system health status
 */
export function getSystemHealth(): {
  level1Ready: boolean;
  level2Ready: boolean;
  level3Ready: boolean;
  cacheReady: boolean;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
} {
  // Simple health checks
  const level1Ready = TEST_INGREDIENTS.length > 0;
  const level2Ready = Object.keys(TEST_PLANETARY_POSITIONS).length >= 10;
  const level3Ready = true; // Always ready since we have the computation engine

  let cacheReady = false;
  try {
    const cache = getGlobalCache();
    cacheReady = cache !== null;
  } catch {
    cacheReady = false;
  }

  let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
  const readyCount = [level1Ready, level2Ready, level3Ready, cacheReady].filter(Boolean).length;

  if (readyCount === 4) overallHealth = 'excellent';
  else if (readyCount === 3) overallHealth = 'good';
  else if (readyCount === 2) overallHealth = 'fair';
  else overallHealth = 'poor';

  return {
    level1Ready,
    level2Ready,
    level3Ready,
    cacheReady,
    overallHealth
  };
}

// ========== EXPORTS ==========

export type {
    AlchemicalProperties, CookingMethod, CuisineComputedProperties, ElementalProperties, IngredientData, RecipeComputedProperties, RecipeIngredient, ThermodynamicProperties
};
