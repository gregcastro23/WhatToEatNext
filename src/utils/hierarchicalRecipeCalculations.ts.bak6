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
    CookingMethod,
    ElementalProperties,
    RecipeIngredient
} from '@/types/alchemy';
import type {
    QuantityScaledProperties,
    RecipeComputationOptions,
    RecipeComputedProperties
} from '@/types/hierarchy';
import { normalizeElementalProperties } from './ingredientUtils';
import {
    calculateThermodynamicMetrics
} from './monicaKalchmCalculations';
import {
    aggregateZodiacElementals,
    calculateAlchemicalFromPlanets,
    getDominantAlchemicalProperty,
    getDominantElement
} from './planetaryAlchemyMapping';

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

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 },

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
      console.warn(`Unknown cooking method: ${methodName}`),
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

  // Step 7: Calculate kinetic properties using P=IV circuit model
  const kineticProperties = calculateRecipeKinetics(
    alchemicalProperties,
    thermodynamicMetrics,
    planetaryPositions
  );

  // Step 8: Identify dominant properties
  const dominantElement = getDominantElement(finalElementals);
  const dominantAlchemicalProperty = getDominantAlchemicalProperty(alchemicalProperties);

  // Step 9: Extract cooking method names for metadata
  const cookingMethodNames = cookingMethods.map(method =>
    typeof method === 'string' ? method : method.name || method.id
  );

  // Return complete computed properties
  return {
    alchemicalProperties,
    elementalProperties: finalElementals,
    thermodynamicProperties: thermodynamicMetrics,
    kineticProperties,
    dominantElement,
    dominantAlchemicalProperty,
    computationMetadata: {
      planetaryPositionsUsed: planetaryPositions,
      cookingMethodsApplied: cookingMethodNames,
      computationTimestamp: new Date()
    }
  };
}

// ========== KINETIC PROPERTIES CALCULATION ==========

/**
 * Calculate kinetic properties for a recipe using P=IV circuit model
 *
 * The recipe acts as a circuit where:
 * - Charge (Q) = Matter + Substance (recipe density)
 * - Potential (V) = Greg's Energy / Q (energetic potential)
 * - Current (I) = Reactivity × velocity (transformation flow)
 * - Power (P) = I × V (transformation rate)
 *
 * @param alchemicalProperties - ESMS properties from planetary positions
 * @param thermodynamicMetrics - Heat, entropy, reactivity, etc.
 * @param planetaryPositions - Current planetary positions
 * @returns Kinetic metrics for the recipe circuit
 */
export function calculateRecipeKinetics(
  alchemicalProperties: AlchemicalProperties,
  thermodynamicMetrics: any,
  planetaryPositions: { [planet: string]: string }
): KineticMetrics {
  const { Spirit, Essence, Matter, Substance } = alchemicalProperties;
  const { heat, entropy, reactivity, gregsEnergy, kalchm, monica } = thermodynamicMetrics;

  // Recipe circuit parameters (30-minute standard time interval)
  const timeInterval = 1800; // 30 minutes in seconds
  const dominantPlanet = getDominantPlanet(planetaryPositions);

  // Prepare kinetics calculation input
  const kineticsInput: KineticsCalculationInput = {
    currentPlanetaryPositions: planetaryPositions,
    timeInterval,
    currentPlanet: dominantPlanet
  };

  // Calculate base kinetics from planetary positions
  const baseKinetics = calculateKinetics(kineticsInput);

  // Recipe-specific adjustments (recipe acts as a circuit component)

  // 1. Recipe charge (Q) = Matter + Substance (recipe mass/density)
  const recipeCharge = Matter + Substance;

  // 2. Recipe potential difference (V) = Greg's Energy / Q
  const recipePotential = recipeCharge > 0 ? gregsEnergy / recipeCharge : 0;

  // 3. Recipe current flow (I) = Reactivity × heat rate
  // Heat acts as velocity proxy in recipe context
  const recipeCurrent = reactivity * (heat / 100); // Normalized heat contribution

  // 4. Recipe power (P) = I × V (transformation power)
  const recipePower = recipeCurrent * recipePotential;

  // 5. Recipe force (F) = Power × Inertia (cooking resistance)
  const recipeInertia = 1 + (Matter + Substance) * 0.1;
  const recipeForce = recipePower * recipeInertia;

  // 6. Recipe acceleration = Force / Inertia
  const recipeAcceleration = recipeInertia > 0 ? recipeForce / recipeInertia : 0;

  // 7. Thermal direction based on heat vs entropy balance
  let thermalDirection: 'heating' | 'cooling' | 'stable'
  if (heat > entropy * reactivity) {
    thermalDirection = 'heating';
  } else if (entropy > heat) {
    thermalDirection = 'cooling';
  } else {
    thermalDirection = 'stable';
  }

  // 8. Force classification based on power level
  let forceClassification: 'accelerating' | 'decelerating' | 'balanced'
  if (recipePower > 2.0) {
    forceClassification = 'accelerating';
  } else if (recipePower < 0.5) {
    forceClassification = 'decelerating';
  } else {
    forceClassification = 'balanced';
  }

  // Return enhanced kinetics with recipe-specific properties
  return {
    ...baseKinetics,
    charge: recipeCharge,
    potentialDifference: recipePotential,
    currentFlow: recipeCurrent,
    power: recipePower,
    force: {
      Fire: recipeForce * (Spirit / (Spirit + Essence + Matter + Substance)),
      Water: recipeForce * (Essence / (Spirit + Essence + Matter + Substance)),
      Earth: recipeForce * (Matter / (Spirit + Essence + Matter + Substance)),
      Air: recipeForce * (Substance / (Spirit + Essence + Matter + Substance))
    },
    forceMagnitude: Math.abs(recipeForce),
    forceClassification,
    thermalDirection,
    // Additional recipe-specific kinetics
    velocity: {
      Fire: recipeAcceleration * 0.4,
      Water: recipeAcceleration * 0.3,
      Earth: recipeAcceleration * 0.2,
      Air: recipeAcceleration * 0.1
    },
    momentum: {
      Fire: recipeInertia * recipeAcceleration * 0.4,
      Water: recipeInertia * recipeAcceleration * 0.3,
      Earth: recipeInertia * recipeAcceleration * 0.2,
      Air: recipeInertia * recipeAcceleration * 0.1
    },
    inertia: recipeInertia
  };
}

/**
 * Get the dominant planet from planetary positions
 * Used for kinetics calculation weighting
 */
function getDominantPlanet(planetaryPositions: { [planet: string]: string }): string {
  // Default to Sun if no clear dominant planet
  return 'Sun';
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
