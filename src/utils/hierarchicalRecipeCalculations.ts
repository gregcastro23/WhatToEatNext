/**
 * Hierarchical Recipe Property Calculations
 *
 * This module implements the correct hierarchical calculation pipeline for recipes:
 * 1. Aggregate ingredient elemental properties (with quantity scaling)
 * 2. Calculate ESMS from planetary positions (THE ONLY CORRECT METHOD)
 * 3. Aggregate zodiac elemental contributions
 * 4. Apply cooking method transformations
 * 5. Calculate thermodynamic metrics
 *
 * Based on the authoritative alchemizer engine formulas.
 */

import type {
  ElementalProperties,
  RecipeIngredient,
  CookingMethod
} from '@/types/alchemy';
import type {
  RecipeComputedProperties,
  RecipeComputationOptions,
  QuantityScaledProperties
} from '@/types/hierarchy';
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  getDominantElement,
  getDominantAlchemicalProperty
} from './planetaryAlchemyMapping';
import {
  calculateThermodynamicMetrics,
  type AlchemicalProperties
} from './monicaKalchmCalculations';
import { normalizeElementalProperties } from './ingredientUtils';

// ========== COOKING METHOD TRANSFORMATIONS ==========

/**
 * Cooking Method Elemental Modifiers
 *
 * Each cooking method applies specific transformations to elemental properties.
 * Based on the 14 Alchemical Pillars and traditional cooking techniques.
 */
export const COOKING_METHOD_MODIFIERS: Record<string, Partial<ElementalProperties>> = {
  // Dry Heat Methods (Fire dominant)
  grilling: { Fire: 1.4, Water: 0.6, Earth: 0.9, Air: 1.1 },
  roasting: { Fire: 1.3, Water: 0.7, Earth: 1.0, Air: 1.0 },
  baking: { Fire: 1.2, Water: 0.8, Earth: 1.1, Air: 0.9 },
  broiling: { Fire: 1.5, Water: 0.5, Earth: 0.8, Air: 1.2 },
  searing: { Fire: 1.6, Water: 0.4, Earth: 0.9, Air: 1.1 },

  // Moist Heat Methods (Water dominant)
  boiling: { Fire: 0.7, Water: 1.3, Earth: 0.8, Air: 1.0 },
  steaming: { Fire: 0.6, Water: 1.4, Earth: 0.9, Air: 1.1 },
  poaching: { Fire: 0.5, Water: 1.5, Earth: 1.0, Air: 0.8 },
  simmering: { Fire: 0.8, Water: 1.2, Earth: 0.9, Air: 1.0 },
  braising: { Fire: 0.9, Water: 1.1, Earth: 1.0, Air: 0.8 },
  stewing: { Fire: 0.8, Water: 1.2, Earth: 1.1, Air: 0.7 },

  // Combination Methods
  'stir-frying': { Fire: 1.3, Water: 0.8, Earth: 0.9, Air: 1.2 },
  sauteing: { Fire: 1.2, Water: 0.8, Earth: 0.9, Air: 1.1 },
  frying: { Fire: 1.4, Water: 0.6, Earth: 0.9, Air: 1.1 },
  'deep-frying': { Fire: 1.5, Water: 0.5, Earth: 0.8, Air: 1.2 },

  // Fermentation & Preservation (Earth/Water balance)
  fermenting: { Fire: 0.6, Water: 1.2, Earth: 1.3, Air: 0.9 },
  pickling: { Fire: 0.7, Water: 1.3, Earth: 1.1, Air: 0.8 },
  curing: { Fire: 0.5, Water: 0.9, Earth: 1.4, Air: 0.7 },
  smoking: { Fire: 1.2, Water: 0.6, Earth: 1.0, Air: 1.3 },

  // Mechanical Methods (Air/Earth)
  blending: { Fire: 0.9, Water: 1.0, Earth: 0.8, Air: 1.3 },
  pureeing: { Fire: 0.8, Water: 1.1, Earth: 0.7, Air: 1.4 },
  whisking: { Fire: 0.9, Water: 0.9, Earth: 0.7, Air: 1.5 },
  kneading: { Fire: 0.8, Water: 1.0, Earth: 1.4, Air: 0.8 },
  rolling: { Fire: 0.9, Water: 0.9, Earth: 1.3, Air: 0.9 },

  // Raw/Minimal Processing (preserves original balance)
  raw: { Fire: 1.0, Water: 1.0, Earth: 1.0, Air: 1.0 },
  chopping: { Fire: 1.0, Water: 0.95, Earth: 1.0, Air: 1.05 },
  slicing: { Fire: 1.0, Water: 0.95, Earth: 1.0, Air: 1.05 },
  marinating: { Fire: 0.8, Water: 1.2, Earth: 1.0, Air: 1.0 }
};

// ========== QUANTITY SCALING ==========

/**
 * Calculate logarithmic quantity scaling factor
 *
 * Uses log(1 + quantity/reference) to model diminishing returns.
 * Small amounts (5-10g) contribute 20-30% of base intensity.
 * Large amounts (500g+) contribute 90-95% but never exceed maximum.
 *
 * @param quantity - Ingredient quantity in grams
 * @param referenceAmount - Reference amount (default: 100g)
 * @returns Scaling factor (0-1)
 */
export function calculateQuantityScalingFactor(
  quantity: number,
  referenceAmount: number = 100
): number {
  if (quantity <= 0) return 0;
  if (referenceAmount <= 0) return 1;

  // Logarithmic scaling: log(1 + q/r) / log(1 + max_expected/r)
  // For max_expected = 1000g (10x reference), this normalizes to ~0.95
  const maxExpected = referenceAmount * 10;
  const scaledValue = Math.log(1 + quantity / referenceAmount);
  const maxValue = Math.log(1 + maxExpected / referenceAmount);

  return Math.min(1.0, scaledValue / maxValue);
}

/**
 * Scale ingredient elemental properties by quantity
 *
 * @param baseElementals - Base elemental properties (unscaled)
 * @param quantity - Quantity in grams or standardized units
 * @param unit - Unit of measurement
 * @returns Quantity-scaled properties
 */
export function scaleIngredientByQuantity(
  baseElementals: ElementalProperties,
  quantity: number,
  unit: string
): QuantityScaledProperties {
  // Convert to standard grams if needed
  let quantityInGrams = quantity;

  // Simple unit conversions (can be expanded)
  const conversionFactors: Record<string, number> = {
    kg: 1000,
    g: 1,
    mg: 0.001,
    oz: 28.35,
    lb: 453.59,
    cup: 240, // Approximate for liquids
    tbsp: 15,
    tsp: 5,
    ml: 1, // Approximate density
    l: 1000
  };

  const factor = conversionFactors[unit.toLowerCase()];
  if (factor) {
    quantityInGrams = quantity * factor;
  }

  const scalingFactor = calculateQuantityScalingFactor(quantityInGrams);

  // Scale each element by the factor
  const scaled: ElementalProperties = {
    Fire: baseElementals.Fire * scalingFactor,
    Water: baseElementals.Water * scalingFactor,
    Earth: baseElementals.Earth * scalingFactor,
    Air: baseElementals.Air * scalingFactor
  };

  return {
    base: baseElementals,
    scaled,
    quantity: quantityInGrams,
    unit,
    scalingFactor
  };
}

// ========== INGREDIENT AGGREGATION ==========

/**
 * Aggregate elemental properties from multiple ingredients
 *
 * @param ingredients - List of recipe ingredients with quantities
 * @returns Aggregated and normalized elemental properties
 */
export function aggregateIngredientElementals(
  ingredients: RecipeIngredient[]
): ElementalProperties {
  if (!ingredients || ingredients.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  for (const ingredient of ingredients) {
    if (!ingredient.elementalProperties) continue;

    // Scale by quantity
    const scaled = scaleIngredientByQuantity(
      ingredient.elementalProperties,
      ingredient.amount || 1,
      ingredient.unit || 'g'
    );

    // Add to totals
    totals.Fire += scaled.scaled.Fire;
    totals.Water += scaled.scaled.Water;
    totals.Earth += scaled.scaled.Earth;
    totals.Air += scaled.scaled.Air;
  }

  // Normalize to sum = 1.0
  return normalizeElementalProperties(totals);
}

// ========== COOKING METHOD TRANSFORMATIONS ==========

/**
 * Apply cooking method transformations to elemental properties
 *
 * Methods are applied sequentially in the order provided.
 *
 * @param baseElementals - Base elemental properties
 * @param methods - Array of cooking method names or objects
 * @returns Transformed elemental properties
 */
export function applyCookingMethodTransforms(
  baseElementals: ElementalProperties,
  methods: (string | CookingMethod)[]
): ElementalProperties {
  let current = { ...baseElementals };

  for (const method of methods) {
    const methodName = typeof method === 'string' ? method : method.name || method.id;
    const modifiers = COOKING_METHOD_MODIFIERS[methodName.toLowerCase()];

    if (!modifiers) {
      console.warn(`Unknown cooking method: ${methodName}`);
      continue;
    }

    // Apply multiplicative modifiers
    current = {
      Fire: current.Fire * (modifiers.Fire ?? 1.0),
      Water: current.Water * (modifiers.Water ?? 1.0),
      Earth: current.Earth * (modifiers.Earth ?? 1.0),
      Air: current.Air * (modifiers.Air ?? 1.0)
    };

    // Re-normalize after each transformation
    current = normalizeElementalProperties(current);
  }

  return current;
}

// ========== MAIN RECIPE COMPUTATION FUNCTION ==========

/**
 * Compute complete recipe properties from planetary positions and ingredients
 *
 * This is the main entry point for recipe property calculation.
 * Implements the full hierarchical calculation pipeline.
 *
 * @param ingredients - Recipe ingredients with quantities
 * @param cookingMethods - Cooking methods applied to the recipe
 * @param options - Computation options (must include planetaryPositions)
 * @returns Complete recipe computed properties
 *
 * @throws Error if planetary positions are not provided
 */
export function computeRecipeProperties(
  ingredients: RecipeIngredient[],
  cookingMethods: (string | CookingMethod)[],
  options: RecipeComputationOptions
): RecipeComputedProperties {
  // Validate required options
  if (!options.planetaryPositions) {
    throw new Error(
      'planetaryPositions are required for recipe property calculation. ' +
        'ESMS values cannot be derived without astrological context.'
    );
  }

  const { planetaryPositions, applyCookingMethods: applyMethods = true } = options;

  // Step 1: Aggregate ingredient elementals with quantity scaling
  const ingredientElementals = aggregateIngredientElementals(ingredients);

  // Step 2: Calculate ESMS from planetary positions (THE CORRECT WAY)
  const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);

  // Step 3: Aggregate zodiac elementals from planetary sign positions
  const zodiacElementals = aggregateZodiacElementals(planetaryPositions);

  // Step 4: Combine ingredient and zodiac elementals (weighted average)
  // Ingredient elementals get 70% weight, zodiac elementals get 30%
  const combinedElementals: ElementalProperties = {
    Fire: ingredientElementals.Fire * 0.7 + zodiacElementals.Fire * 0.3,
    Water: ingredientElementals.Water * 0.7 + zodiacElementals.Water * 0.3,
    Earth: ingredientElementals.Earth * 0.7 + zodiacElementals.Earth * 0.3,
    Air: ingredientElementals.Air * 0.7 + zodiacElementals.Air * 0.3
  };

  // Step 5: Apply cooking method transformations if enabled
  const finalElementals = applyMethods
    ? applyCookingMethodTransforms(combinedElementals, cookingMethods)
    : combinedElementals;

  // Step 6: Calculate thermodynamic metrics from ESMS + elementals
  const thermodynamicMetrics = calculateThermodynamicMetrics(
    alchemicalProperties,
    finalElementals
  );

  // Step 7: Identify dominant properties
  const dominantElement = getDominantElement(finalElementals);
  const dominantAlchemicalProperty = getDominantAlchemicalProperty(alchemicalProperties);

  // Return complete computed properties
  return {
    alchemicalProperties,
    elementalProperties: finalElementals,
    thermodynamicMetrics,
    dominantElement,
    dominantAlchemicalProperty,
    computedAt: new Date(),
    planetaryPositionsUsed: planetaryPositions
  };
}

/**
 * Compute recipe properties with default options
 *
 * Convenience function that uses default computation settings.
 *
 * @param ingredients - Recipe ingredients
 * @param cookingMethods - Cooking methods
 * @param planetaryPositions - Required planetary positions
 * @returns Complete recipe computed properties
 */
export function computeRecipePropertiesSimple(
  ingredients: RecipeIngredient[],
  cookingMethods: (string | CookingMethod)[],
  planetaryPositions: { [planet: string]: string }
): RecipeComputedProperties {
  return computeRecipeProperties(ingredients, cookingMethods, {
    planetaryPositions,
    applyCookingMethods: true,
    quantityScaling: 'logarithmic',
    cacheResults: false
  });
}
