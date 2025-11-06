/**
 * Recipe Validation System for Hierarchical Culinary Data
 *
 * Comprehensive validation for recipe quality assurance, ingredient resolution,
 * and computational integrity in the hierarchical culinary system.
 */

import type { Recipe, RecipeIngredient } from '@/types/recipe';
import type { EnhancedRecipe, RecipeValidationResult } from '@/types/recipe/enhancedRecipe';

// Mock ingredient database - replace with actual database integration
const INGREDIENT_DATABASE: Record<string, any> = {};

/**
 * Validate complete recipe structure and data integrity
 *
 * @param recipe - Recipe to validate
 * @param options - Validation options
 * @returns Comprehensive validation result
 */
export function validateRecipe(recipe: Partial<Recipe>,
  options: {
    checkIngredients?: boolean;
    checkComputations?: boolean;
    strictMode?: boolean
  } = {}
): RecipeValidationResult {
  const {
    checkIngredients = true,
    checkComputations = false,
    strictMode = false
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Required fields
  const hasRequiredFields = checkRequiredFields(recipe, errors);

  // Check 2: Ingredient resolution
  const ingredientsResolved = checkIngredients ? validateIngredientResolution(recipe.ingredients || [], errors) : true;

  // Check 3: Elemental properties
  const elementalsNormalized = validateElementalProperties(recipe, errors, warnings);

  // Check 4: Cooking methods
  const cookingMethodsValid = validateCookingMethods(recipe, errors, warnings);

  // Check 5: Astrological timing (for enhanced recipes)
  const astrologicalTimingComplete = validateAstrologicalTiming(recipe as Partial<EnhancedRecipe>, warnings);

  // Check 6: Computational integrity (if computed properties present)
  const computationIntegrity = checkComputations ? validateComputationIntegrity(recipe as Partial<EnhancedRecipe>, errors) : true;

  // Calculate quality metrics
  const qualityMetrics = calculateQualityMetrics(recipe, {
    hasRequiredFields,
    ingredientsResolved,
    elementalsNormalized,
    cookingMethodsValid,
    astrologicalTimingComplete,
    computationIntegrity
  });

  // Generate recommendations
  const recommendations = generateRecommendations({
    errors,
    warnings,
    qualityMetrics
  });

  const isValid = errors.length === 0 && (!strictMode || warnings.length === 0);

  return {
    isValid,
    checks: {
      hasRequiredFields,
      ingredientsResolved,
      elementalsNormalized,
      cookingMethodsValid,
      astrologicalTimingComplete,
      computationIntegrity
    },
    errors,
    warnings,
    qualityMetrics,
    recommendations
  };
}

/**
 * Check for required recipe fields
 */
function checkRequiredFields(recipe: Partial<Recipe>, errors: string[]): boolean {
  const requiredFields = ['id', 'name', 'ingredients', 'instructions', 'elementalProperties'];
  let isValid = true;

  for (const field of requiredFields) {
    if (!recipe[field as keyof Recipe]) {
      errors.push(`Missing required field: ${field}`);
      isValid = false;
    }
  }

  // Validate ingredients array
  if (recipe.ingredients && !Array.isArray(recipe.ingredients)) {
    errors.push('Ingredients must be an array');
    isValid = false;
  }

  // Validate instructions array
  if (recipe.instructions && !Array.isArray(recipe.instructions) {
    errors.push('Instructions must be an array');
    isValid = false;
  }

  return isValid;
}

/**
 * Validate that all recipe ingredients exist in the ingredient database
 */
function validateIngredientResolution(ingredients: RecipeIngredient[], errors: string[]): boolean {
  let resolved = 0;
  const total = ingredients.length;

  for (const ingredient of ingredients) {
    if (!ingredient.name) {
      errors.push('Ingredient missing name');
      continue;
    }

    // Check if ingredient exists in database
    const ingredientId = generateIngredientId(ingredient.name);
    if (!INGREDIENT_DATABASE[ingredientId]) {
      errors.push(`Ingredient not found in database: ${ingredient.name}`);
    } else {
      resolved++;
    }

    // Validate ingredient structure
    if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
      errors.push(`Invalid ingredient amount for ${ingredient.name}: ${ingredient.amount}`);
    }

    if (!ingredient.unit || typeof ingredient.unit !== 'string') {
      errors.push(`Invalid ingredient unit for ${ingredient.name}: ${ingredient.unit}`);
    }
  }

  return resolved === total && total > 0;
}

/**
 * Validate elemental properties normalization
 */
function validateElementalProperties(
  recipe: Partial<Recipe>,
  errors: string[],
  warnings: string[]
): boolean {
  const elementals = recipe.elementalProperties;
  if (!elementals) return false;

  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  let total = 0;
  let validElements = 0;

  for (const element of elements) {
    const value = elementals[element as keyof typeof elementals];
    if (typeof value !== 'number') {
      errors.push(`Elemental property ${element} is not a number: ${value}`);
    } else if (value < 0 || value > 1) {
      warnings.push(`Elemental property ${element} out of range [0,1]: ${value}`);
    } else {
      total += value;
      validElements++;
    }
  }

  if (validElements !== 4) {
    errors.push('Missing or invalid elemental properties');
    return false;
  }

  // Check normalization (should sum to approximately 1.0)
  if (Math.abs(total - 1.0) > 0.01) {
    warnings.push(`Elemental properties not normalized (sum: ${total.toFixed(3)}, expected: 1.000)`);
  }

  return validElements === 4;
}

/**
 * Validate cooking methods
 */
function validateCookingMethods(
  recipe: Partial<Recipe>,
  errors: string[],
  warnings: string[]
): boolean {
  const cookingMethod = recipe.cookingMethod;
  if (!cookingMethod || !Array.isArray(cookingMethod) || cookingMethod.length === 0) {
    warnings.push('No cooking methods specified');
    return true; // Not required for basic validity
  }

  // Validate each cooking method exists
  for (const method of cookingMethod) {
    if (typeof method !== 'string') {
      errors.push(`Invalid cooking method type: ${typeof method}`);
    } else if (!isValidCookingMethod(method) {
      warnings.push(`Unknown cooking method: ${method}`);
    }
  }

  return true;
}

/**
 * Validate astrological timing for enhanced recipes
 */
function validateAstrologicalTiming(
  recipe: Partial<EnhancedRecipe>,
  warnings: string[]
): boolean {
  const timing = recipe.astrologicalTiming;
  if (!timing) {
    warnings.push('No astrological timing specified');
    return false;
  }

  let complete = true;

  if (!timing.optimalPositions || Object.keys(timing.optimalPositions).length === 0) {
    warnings.push('No optimal planetary positions specified');
    complete = false;
  }

  return complete;
}

/**
 * Validate computational integrity of recipe properties
 */
function validateComputationIntegrity(
  recipe: Partial<EnhancedRecipe>,
  errors: string[]
): boolean {
  const computed = recipe._computed;
  if (!computed) {
    errors.push('No computed properties found');
    return false;
  }

  let integrity = true;

  // Check alchemical properties
  const alchemical = computed.alchemicalProperties;
  if (!alchemical || typeof alchemical.Spirit !== 'number') {
    errors.push('Invalid alchemical properties in computed data');
    integrity = false;
  }

  // Check elemental properties
  const elementals = computed.elementalProperties;
  if (!elementals || typeof elementals.Fire !== 'number') {
    errors.push('Invalid elemental properties in computed data');
    integrity = false;
  }

  // Check thermodynamic metrics
  const thermo = computed.thermodynamicProperties;
  if (!thermo || typeof thermo.heat !== 'number') {
    errors.push('Invalid thermodynamic properties in computed data');
    integrity = false;
  }

  // Check kinetic properties
  const kinetics = computed.kineticProperties;
  if (!kinetics || typeof kinetics.power !== 'number') {
    errors.push('Invalid kinetic properties in computed data');
    integrity = false;
  }

  // Validate computation metadata
  const metadata = computed.computationMetadata;
  if (!metadata || !metadata.planetaryPositionsUsed) {
    errors.push('Missing computation metadata');
    integrity = false;
  }

  return integrity;
}

/**
 * Calculate quality metrics for the recipe
 */
function calculateQualityMetrics(
  recipe: Partial<Recipe>,
  checks: Record<string, boolean>
): RecipeValidationResult['qualityMetrics'] {
  // Completeness score based on available data
  let completenessScore = 0;
  const completenessFactors = [;
    checks.hasRequiredFields ? 30 : 0,
    checks.ingredientsResolved ? 20 : 0,
    checks.elementalsNormalized ? 15 : 0,
    checks.cookingMethodsValid ? 10 : 0,
    checks.astrologicalTimingComplete ? 15 : 0,
    checks.computationIntegrity ? 10 : 0
  ];
  completenessScore = completenessFactors.reduce((sum, factor) => sum + factor, 0);

  // Ingredient coverage
  const ingredientCoverage = recipe.ingredients ?;
    Math.min(100, (recipe.ingredients.length / 10) * 100) : 0;

  // Elemental balance (0-1 based on how close elements are to equal distribution)
  const elementals = recipe.elementalProperties;
  let elementalBalance = 0;
  if (elementals) {
    const values = [elementals.Fire, elementals.Water, elementals.Earth, elementals.Air];
    const mean = values.reduce((sum, val) => sum + val, 0) / 4;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 4;
    elementalBalance = Math.max(0, 1 - variance * 4); // Higher balance = lower variance
  }

  // Cooking method diversity
  const cookingMethods = recipe.cookingMethod;
  const cookingMethodDiversity = cookingMethods ?;
    Math.min(1, cookingMethods.length / 5) : 0;

  return {
    completenessScore,
    ingredientCoverage,
    elementalBalance,
    cookingMethodDiversity
  };
}

/**
 * Generate recommendations for improving recipe quality
 */
function generateRecommendations(context: {
  errors: string[],
  warnings: string[],
  qualityMetrics: RecipeValidationResult['qualityMetrics']
}): string[] {
  const recommendations: string[] = [];

  const { errors, warnings, qualityMetrics } = context;

  // Critical errors first
  if (errors.some(e => e.includes('required field')) {
    recommendations.push('Add missing required fields (id, name, ingredients, instructions, elementalProperties)');
  }

  if (errors.some(e => e.includes('not found in database')) {
    recommendations.push('Resolve missing ingredients by adding them to the ingredient database');
  }

  if (errors.some(e => e.includes('elemental properties')) {
    recommendations.push('Normalize elemental properties to sum to 1.0');
  }

  // Quality improvements
  if (qualityMetrics.completenessScore < 70) {
    recommendations.push('Improve recipe completeness by adding cooking methods and astrological timing');
  }

  if (qualityMetrics.elementalBalance < 0.7) {
    recommendations.push('Balance elemental properties for better harmony');
  }

  if (qualityMetrics.cookingMethodDiversity < 0.5) {
    recommendations.push('Add diverse cooking methods for richer transformations');
  }

  if (warnings.some(w => w.includes('astrological timing')) {
    recommendations.push('Add astrological timing for optimal preparation windows');
  }

  return recommendations;
}

/**
 * Generate a unique ingredient ID from name
 */
function generateIngredientId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Check if cooking method is valid
 */
function isValidCookingMethod(method: string): boolean {
  // This should integrate with the actual cooking methods database
  const validMethods = [;
    'grilling', 'baking', 'boiling', 'steaming', 'frying', 'sautéing',
    'roasting', 'broiling', 'poaching', 'simmering', 'braising', 'stewing',
    'fermenting', 'pickling', 'curing', 'smoking', 'blending', 'pureeing'
  ];
  return validMethods.includes(method.toLowerCase());
}

/**
 * Batch validate multiple recipes
 */
export function validateRecipes(
  recipes: Partial<Recipe>[],
  options?: Parameters<typeof validateRecipe>[1]
): RecipeValidationResult[] {
  return recipes.map(recipe => validateRecipe(recipe, options));
}

/**
 * Get overall validation statistics for a recipe collection
 */
export function getValidationStatistics(
  validationResults: RecipeValidationResult[]
): {
  totalRecipes: number;
  validRecipes: number;
  averageQualityScore: number;
  commonErrors: Array<{ error: string; count, number }>;
  commonWarnings: Array<{ warning: string; count, number }>;
} {
  const totalRecipes = validationResults.length;
  const validRecipes = validationResults.filter(r => r.isValid).length;

  const totalQualityScore = validationResults.reduce((sum, r) => sum + r.qualityMetrics.completenessScore, 0);
  const averageQualityScore = totalQualityScore / totalRecipes;

  // Count common errors and warnings
  const errorCounts: Record<string, number> = {};
  const warningCounts: Record<string, number> = {};

  for (const result of validationResults) {
    for (const error of result.errors) {
      errorCounts[error] = (errorCounts[error] || 0) + 1;
    }
    for (const warning of result.warnings) {
      warningCounts[warning] = (warningCounts[warning] || 0) + 1;
    }
  }

  const commonErrors = Object.entries(errorCounts);
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([error, count]) => ({ error, count }));

  const commonWarnings = Object.entries(warningCounts);
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([warning, count]) => ({ warning, count }));

  return {
    totalRecipes,
    validRecipes,
    averageQualityScore,
    commonErrors,
    commonWarnings
  };
}
