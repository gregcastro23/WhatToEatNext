/**
 * Cuisine Aggregation Engine
 *
 * Implements comprehensive statistical aggregation of recipe properties into cuisine signatures.
 * Handles weighted averaging, variance calculation, and confidence intervals for cuisine analysis.
 *
 * Key Features:
 * - Weighted aggregation across recipe collections
 * - Statistical variance and spread analysis
 * - Confidence interval calculations
 * - Recipe collection metadata tracking
 */

import type {
    AlchemicalProperties,
    CuisineComputationOptions,
    CuisineComputedProperties,
    ElementalProperties,
    PropertyVariance,
    RecipeComputedProperties,
    ThermodynamicProperties
} from '@/types/hierarchy';

// ========== STATISTICAL CALCULATION UTILITIES ==========

/**
 * Calculate weighted average of numeric properties
 *
 * @param values - Array of values to average
 * @param weights - Array of weights (must sum to 1.0)
 * @returns Weighted average
 */
export function calculateWeightedAverage(values: number[], weights: number[]): number {
  if (values.length === 0 || weights.length === 0 || values.length !== weights.length) {
    return 0;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < values.length; i++) {
    weightedSum += values[i] * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0
}

/**
 * Calculate variance of a numeric array
 *
 * @param values - Array of numeric values
 * @param mean - Pre-calculated mean (optional, will be calculated if not provided)
 * @returns Variance (population variance)
 */
export function calculateVariance(values: number[], mean?: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const avg = mean ?? values.reduce((sum, val) => sum + val, 0) / values.length;

  const squaredDifferences = values.map(val => Math.pow(val - avg, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;

  return variance;
}

/**
 * Calculate standard deviation from variance
 *
 * @param variance - Variance value
 * @returns Standard deviation
 */
export function calculateStandardDeviation(variance: number): number {
  return Math.sqrt(variance);
}

/**
 * Calculate confidence interval for a mean
 *
 * @param mean - Sample mean
 * @param standardDeviation - Sample standard deviation
 * @param sampleSize - Number of samples
 * @param confidenceLevel - Confidence level (default: 0.95 for 95% CI)
 * @returns Object with lower and upper bounds
 */
export function calculateConfidenceInterval(
  mean: number,
  standardDeviation: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; marginOfError: number } {
  if (sampleSize <= 1) {
    return { lower: mean, upper: mean, marginOfError: 0 };
  }

  // t-distribution approximation for small samples
  // Using z-score approximation for simplicity (works well for n > 30)
  const zScore = confidenceLevel === 0.95 ? 1.96 :
                 confidenceLevel === 0.99 ? 2.576 : confidenceLevel === 0.90 ? 1.645 : 1.96;

  const standardError = standardDeviation / Math.sqrt(sampleSize);
  const marginOfError = zScore * standardError;

  return {
    lower: mean - marginOfError,
    upper: mean + marginOfError,
    marginOfError
  };
}

// ========== PROPERTY AGGREGATION FUNCTIONS ==========

/**
 * Aggregate elemental properties from multiple recipes
 *
 * @param recipes - Array of recipe computed properties
 * @param weights - Weights for each recipe (optional, defaults to equal weighting)
 * @returns Aggregated elemental properties
 */
export function aggregateElementalProperties(
  recipes: RecipeComputedProperties[],
  weights?: number[]
): ElementalProperties {
  if (recipes.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const defaultWeights = weights ?? new Array(recipes.length).fill(1 / recipes.length);

  const fireValues = recipes.map(r => r.elementalProperties.Fire);
  const waterValues = recipes.map(r => r.elementalProperties.Water);
  const earthValues = recipes.map(r => r.elementalProperties.Earth);
  const airValues = recipes.map(r => r.elementalProperties.Air);

  return {
    Fire: calculateWeightedAverage(fireValues, defaultWeights),
    Water: calculateWeightedAverage(waterValues, defaultWeights),
    Earth: calculateWeightedAverage(earthValues, defaultWeights),
    Air: calculateWeightedAverage(airValues, defaultWeights)
  };
}

/**
 * Aggregate alchemical properties from multiple recipes
 *
 * @param recipes - Array of recipe computed properties (must have alchemical properties)
 * @param weights - Weights for each recipe (optional, defaults to equal weighting)
 * @returns Aggregated alchemical properties or undefined if no recipes have alchemical data
 */
export function aggregateAlchemicalProperties(
  recipes: RecipeComputedProperties[],
  weights?: number[]
): AlchemicalProperties | undefined {
  const recipesWithAlchemy = recipes.filter(r => r.alchemicalProperties);

  if (recipesWithAlchemy.length === 0) {
    return undefined;
  }

  const defaultWeights = weights ?? new Array(recipesWithAlchemy.length).fill(1 / recipesWithAlchemy.length);

  const spiritValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Spirit);
  const essenceValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Essence);
  const matterValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Matter);
  const substanceValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Substance);

  return {
    Spirit: calculateWeightedAverage(spiritValues, defaultWeights),
    Essence: calculateWeightedAverage(essenceValues, defaultWeights),
    Matter: calculateWeightedAverage(matterValues, defaultWeights),
    Substance: calculateWeightedAverage(substanceValues, defaultWeights)
  };
}

/**
 * Aggregate thermodynamic properties from multiple recipes
 *
 * @param recipes - Array of recipe computed properties (must have thermodynamic properties)
 * @param weights - Weights for each recipe (optional, defaults to equal weighting)
 * @returns Aggregated thermodynamic properties or undefined if no recipes have thermodynamic data
 */
export function aggregateThermodynamicProperties(
  recipes: RecipeComputedProperties[],
  weights?: number[]
): ThermodynamicProperties | undefined {
  const recipesWithThermodynamics = recipes.filter(r => r.thermodynamicProperties);

  if (recipesWithThermodynamics.length === 0) {
    return undefined;
  }

  const defaultWeights = weights ?? new Array(recipesWithThermodynamics.length).fill(1 / recipesWithThermodynamics.length);

  const heatValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.heat);
  const entropyValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.entropy);
  const reactivityValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.reactivity);
  const gregsEnergyValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.gregsEnergy);
  const kalchmValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.kalchm);
  const monicaValues = recipesWithThermodynamics.map(r => r.thermodynamicProperties!.monica);

  return {
    heat: calculateWeightedAverage(heatValues, defaultWeights),
    entropy: calculateWeightedAverage(entropyValues, defaultWeights),
    reactivity: calculateWeightedAverage(reactivityValues, defaultWeights),
    gregsEnergy: calculateWeightedAverage(gregsEnergyValues, defaultWeights),
    kalchm: calculateWeightedAverage(kalchmValues, defaultWeights),
    monica: calculateWeightedAverage(monicaValues, defaultWeights)
  };
}

// ========== VARIANCE CALCULATION ==========

/**
 * Calculate variance for elemental properties across recipes
 *
 * @param recipes - Array of recipe computed properties
 * @param averages - Pre-calculated averages
 * @returns Property variance for elementals
 */
export function calculateElementalVariance(
  recipes: RecipeComputedProperties[],
  averages: ElementalProperties
): ElementalProperties {
  if (recipes.length === 0) {
    return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  }

  const fireValues = recipes.map(r => r.elementalProperties.Fire);
  const waterValues = recipes.map(r => r.elementalProperties.Water);
  const earthValues = recipes.map(r => r.elementalProperties.Earth);
  const airValues = recipes.map(r => r.elementalProperties.Air);

  return {
    Fire: calculateVariance(fireValues, averages.Fire),
    Water: calculateVariance(waterValues, averages.Water),
    Earth: calculateVariance(earthValues, averages.Earth),
    Air: calculateVariance(airValues, averages.Air)
  };
}

/**
 * Calculate variance for alchemical properties across recipes
 *
 * @param recipes - Array of recipe computed properties with alchemical data
 * @param averages - Pre-calculated averages
 * @returns Property variance for alchemicals or undefined
 */
export function calculateAlchemicalVariance(
  recipes: RecipeComputedProperties[],
  averages: AlchemicalProperties
): Partial<AlchemicalProperties> | undefined {
  const recipesWithAlchemy = recipes.filter(r => r.alchemicalProperties);

  if (recipesWithAlchemy.length === 0) {
    return undefined;
  }

  const spiritValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Spirit);
  const essenceValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Essence);
  const matterValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Matter);
  const substanceValues = recipesWithAlchemy.map(r => r.alchemicalProperties!.Substance);

  return {
    Spirit: calculateVariance(spiritValues, averages.Spirit),
    Essence: calculateVariance(essenceValues, averages.Essence),
    Matter: calculateVariance(matterValues, averages.Matter),
    Substance: calculateVariance(substanceValues, averages.Substance)
  };
}

/**
 * Calculate overall diversity score based on variance
 *
 * @param variance - Property variance object
 * @returns Diversity score (0-1, higher = more diverse)
 */
export function calculateDiversityScore(variance: PropertyVariance): number {
  const elementalVariances = Object.values(variance.elementals);
  const alchemicalVariances = variance.alchemical ? Object.values(variance.alchemical) : [];
  const thermodynamicVariances = variance.thermodynamics ? Object.values(variance.thermodynamics) : [];

  const allVariances = [...elementalVariances, ...alchemicalVariances, ...thermodynamicVariances];

  if (allVariances.length === 0) return 0;

  // Normalize variances to 0-1 scale (assuming max variance of 0.25 for properties)
  const normalizedVariances = allVariances.map(v => Math.min(v / 0.25, 1));
  const averageVariance = normalizedVariances.reduce((sum, v) => sum + v, 0) / normalizedVariances.length;

  return averageVariance;
}

// ========== MAIN CUISINE COMPUTATION FUNCTION ==========

/**
 * Compute comprehensive cuisine properties from recipe collection
 *
 * This is the main entry point for cuisine-level aggregation.
 * Implements the complete statistical analysis pipeline.
 *
 * @param recipes - Array of recipe computed properties
 * @param options - Computation options
 * @returns Complete cuisine computed properties
 */
export function computeCuisineProperties(
  recipes: RecipeComputedProperties[],
  options: CuisineComputationOptions = {}
): CuisineComputedProperties {
  const {
    weightingStrategy = 'equal',
    includeVariance = true
  } = options;

  if (recipes.length === 0) {
    throw new Error('Cannot compute cuisine properties: no recipes provided');
  }

  // Determine weights based on strategy
  let weights: number[] | undefined;
  if (weightingStrategy === 'equal') {
    weights = undefined; // Use default equal weighting
  } else if (weightingStrategy === 'popularity') {
    // TODO: Implement popularity-based weighting when recipe popularity data is available
    weights = undefined;
  } else if (weightingStrategy === 'representativeness') {
    // TODO: Implement representativeness-based weighting
    weights = undefined;
  }

  // Step 1: Aggregate average properties
  const averageElementals = aggregateElementalProperties(recipes, weights);
  const averageAlchemical = aggregateAlchemicalProperties(recipes, weights);
  const averageThermodynamics = aggregateThermodynamicProperties(recipes, weights);

  // Step 2: Calculate variance if requested
  let variance: PropertyVariance;
  if (includeVariance) {
    const elementalVariance = calculateElementalVariance(recipes, averageElementals);
    const alchemicalVariance = averageAlchemical ?
      calculateAlchemicalVariance(recipes, averageAlchemical) : undefined;

    variance = {
      elementals: elementalVariance,
      alchemical: alchemicalVariance,
      thermodynamics: undefined, // TODO: Implement thermodynamic variance
      diversityScore: 0 // Will be calculated below
    };

    variance.diversityScore = calculateDiversityScore(variance);
  } else {
    variance = {
      elementals: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      diversityScore: 0
    };
  }

  // Step 3: Generate computation metadata
  const computedAt = new Date();
  const version = '1.0.0'; // Algorithm version for cache invalidation

  // Return complete cuisine properties
  return {
    averageElementals,
    averageAlchemical,
    averageThermodynamics,
    variance,
    signatures: [], // Will be populated by signature identification engine
    planetaryPatterns: undefined, // Will be populated by planetary pattern analysis
    sampleSize: recipes.length,
    computedAt,
    version
  };
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Validate cuisine computation inputs
 *
 * @param recipes - Recipe array to validate
 * @returns Validation result with errors if any
 */
export function validateCuisineComputationInputs(recipes: RecipeComputedProperties[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(recipes)) {
    errors.push('Recipes must be an array');
  } else {
    if (recipes.length === 0) {
      errors.push('At least one recipe is required for cuisine computation');
    }

    recipes.forEach((recipe, index) => {
      if (!recipe.elementalProperties) {
        errors.push(`Recipe ${index} missing elemental properties`);
      }

      // Validate elemental properties sum to ~1.0
      if (recipe.elementalProperties) {
        const sum = Object.values(recipe.elementalProperties).reduce((s, v) => s + v, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
          errors.push(`Recipe ${index} elemental properties don't sum to 1.0 (sum: ${sum})`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// ========== EXPORTS ==========

export type {
    PropertyVariance
};
