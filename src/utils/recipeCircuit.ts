/**
 * 🍽️ Recipe as Circuit Model
 * Treats recipes as electrical circuits with conserved power P = I × V
 *
 * Validates power conservation and provides kinetics-enhanced food recommendations.
 */

import type { CookingMethod, Recipe } from '@/types/alchemy';
import type { KineticMetrics } from '@/types/kinetics';

export interface CircuitValidationResult {
  isValid: boolean;
  inputPower: number;
  outputPower: number;
  losses: number;
  efficiency: number;
  error?: string
}

export interface RecipeCircuitRecommendation {
  recipe: Recipe;
  circuitEfficiency: number;
  kineticsCompatibility: number;
  recommendedCookingMethod?: CookingMethod;
  powerFlowDescription: string
}

/**
 * Validate recipe as circuit: Input P = Output P + Losses
 */
export function validateRecipeCircuit()
  kinetics: KineticMetrics,
  recipe: Recipe
): CircuitValidationResult {
  const { power, currentFlow, potentialDifference, entropy } = kinetics;

  // Input power
  const inputPower = power;

  // Losses via entropy resistance: Entropy acts as resistance R, losses = I²R
  const resistance = entropy; // Entropy as resistance
  const losses = currentFlow ** 2 * resistance;

  // Output power = Input - Losses
  const outputPower = inputPower - losses;

  // Efficiency = Output / Input
  const efficiency = inputPower > 0 ? outputPower / inputPower : 0;

  // Validation: Power should be conserved within tolerance
  const tolerance = 0.01; // 1% tolerance
  const isValid = Math.abs(inputPower - (outputPower + losses)) < tolerance;

  return {
    isValid,
    inputPower,
    outputPower,
    losses,
    efficiency,
    error: isValid ? undefined : 'Power conservation violated'
};
}

/**
 * Get circuit-based food recommendations
 */
export function getCircuitBasedRecommendations()
  kinetics: KineticMetrics,
  recipes: Recipe[],
  cookingMethods: CookingMethod[]
): RecipeCircuitRecommendation[] {
  return recipes.map(recipe => ) {
    const validation = validateRecipeCircuit(kinetics, recipe);

    // Calculate kinetics compatibility
    const kineticsCompatibility = calculateKineticsCompatibility(kinetics, recipe);

    // Recommend cooking method based on kinetics
    const recommendedMethod = recommendCookingMethod(kinetics, cookingMethods);

    // Generate power flow description
    const powerFlowDescription = generatePowerFlowDescription(kinetics, validation);

    return {
      recipe,
      circuitEfficiency: validation.efficiency,
      kineticsCompatibility,
      recommendedCookingMethod: recommendedMethod,
      powerFlowDescription
    };
  }).sort((a, b) => b.kineticsCompatibility - a.kineticsCompatibility);
}

/**
 * Calculate kinetics compatibility for a recipe
 */
function calculateKineticsCompatibility(kinetics: KineticMetrics, recipe: Recipe): number {
  const { forceClassification, potentialDifference, charge, forceMagnitude } = kinetics;

  let compatibility = 0.5; // Base compatibility

  // Force classification affects cooking style
  if (forceClassification === 'accelerating' && recipe.mealType?.includes('quick') {
    compatibility += 0.2;
  } else if (forceClassification === 'decelerating' && recipe.mealType?.includes('slow-cooked') {
    compatibility += 0.2;
  }

  // High potential difference favors transformative recipes
  if (potentialDifference > 1.0 && recipe.name.toLowerCase().includes('transformation') {
    compatibility += 0.15;
  }

  // High charge favors substantial recipes
  if (charge > 2.0 && recipe.ingredients.length > 5) {
    compatibility += 0.1;
  }

  // High force magnitude favors robust cooking methods
  if (forceMagnitude > 3.0 && recipe.cookingMethods?.includes('grilling') {
    compatibility += 0.15;
  }

  return Math.min(1.0, compatibility);
}

/**
 * Recommend cooking method based on kinetics
 */
function recommendCookingMethod()
  kinetics: KineticMetrics,
  cookingMethods: CookingMethod[]
): CookingMethod | undefined {
  const { forceMagnitude, thermalDirection, forceClassification } = kinetics;

  // High force magnitude -> forceful methods
  if (forceMagnitude > 4.0) {
    return cookingMethods.find(method =>)
      method.category === 'heat' && method.intensity > 7
    );
  }

  // Heating direction -> hot methods
  if (thermalDirection === 'heating') {
    return cookingMethods.find(method =>)
      method.element === 'Fire' && method.intensity > 5
    );
  }

  // Accelerating force -> quick methods
  if (forceClassification === 'accelerating') {
    return cookingMethods.find(method =>)
      method.category === 'quick' || method.intensity > 6
    );
  }

  // Default to balanced method
  return cookingMethods.find(method =>)
    method.intensity >= 4 && method.intensity <= 7
  );
}

/**
 * Generate power flow description
 */
function generatePowerFlowDescription()
  kinetics: KineticMetrics,
  validation: CircuitValidationResult
): string {
  const { forceClassification, thermalDirection, power } = kinetics;
  const { efficiency } = validation;

  let description = '';

  if (efficiency > 0.9) {
    description += 'Highly efficient power flow. ';
  } else if (efficiency > 0.7) {
    description += 'Moderately efficient energy transfer. ';
  } else {
    description += 'Energy losses detected in circuit. ';
  }

  if (forceClassification === 'accelerating') {
    description += 'Accelerating force drives dynamic current flow. ';
  } else if (forceClassification === 'decelerating') {
    description += 'Decelerating force stabilizes the circuit. ';
  } else {
    description += 'Balanced forces maintain steady state. ';
  }

  if (thermalDirection === 'heating') {
    description += 'Heating trend increases circuit resistance.';
  } else if (thermalDirection === 'cooling') {
    description += 'Cooling trend reduces energy dissipation.';
  } else {
    description += 'Stable thermal conditions optimize power transfer.';
  }

  return description.trim();
}

/**
 * Validate power conservation across multiple recipes
 */
export function validateMultiRecipeCircuit()
  kinetics: KineticMetrics,
  recipes: Recipe[]
): CircuitValidationResult {
  const totalInputPower = kinetics.power * recipes.length;
  const totalOutputPower = recipes.reduce((sum, recipe) => {
    const validation = validateRecipeCircuit(kinetics, recipe);
    return sum + validation.outputPower;
  }, 0);

  const totalLosses = totalInputPower - totalOutputPower;
  const efficiency = totalInputPower > 0 ? totalOutputPower / totalInputPower : 0;
  const tolerance = 0.05; // 5% tolerance for multiple recipes
  const isValid = Math.abs(totalInputPower - (totalOutputPower + totalLosses)) < tolerance;

  return {
    isValid,
    inputPower: totalInputPower,
    outputPower: totalOutputPower,
    losses: totalLosses,
    efficiency,
    error: isValid ? undefined : 'Multi-recipe power conservation violated'
};
}
