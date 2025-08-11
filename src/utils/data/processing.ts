import { AstrologicalProfile, ElementalAffinity, ElementalProperties } from '@/types/alchemy';
import { Ingredient, Recipe, RecipeIngredient } from '@/types/recipe';
import type { UnifiedIngredient } from '@/types/unified';

/**
 * Data Processing Module
 *
 * Consolidates data standardization, validation, and database cleanup functions
 * for ingredients, recipes, and other culinary data.
 */

// --- Types ---

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface DataCleanupResult {
  processed: number;
  cleaned: number;
  errors: number;
  warnings: string[];
}

export interface StandardizationOptions {
  normalizeElemental?: boolean;
  validateAstrological?: boolean;
  cleanupNulls?: boolean;
  enforceTypes?: boolean;
}

// --- Core Functions ---

/**
 * Standardize elemental affinity data
 * @param value Raw elemental affinity value
 * @returns Standardized elemental affinity
 */
export function standardizeElementalAffinity(
  value: string | { base: string; decanModifiers?: { [key: string]: unknown } },
): ElementalAffinity {
  if (typeof value === 'string') {
    return {
      primary: value as 'Fire' | 'Water' | 'Earth' | 'Air',
      strength: 1.0,
      compatibility: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 },
    };
  }

  if (value && typeof value === 'object' && 'base' in value) {
    return {
      primary: (value.base || 'Fire') as 'Fire' | 'Water' | 'Earth' | 'Air',
      strength: 1.0,
      compatibility: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 },
    };
  }

  return {
    primary: 'Fire',
    strength: 1.0,
    compatibility: { Fire: 0.7, Water: 0.7, Earth: 0.7, Air: 0.7 },
  };
}

/**
 * Standardize ingredient data
 * @param ingredient Raw ingredient data
 * @returns Standardized ingredient
 */
export function standardizeIngredient(ingredient: unknown): Ingredient {
  if (!ingredient || typeof ingredient !== 'object') {
    return createDefaultIngredient('unknown');
  }

  const raw = ingredient as Record<string, unknown>;

  return {
    id: String(raw.id || 'unknown'),
    name: String(raw.name || 'Unknown Ingredient'),
    category: String(raw.category || 'other'),
    subcategory: raw.subCategory ? String(raw.subCategory) : undefined,
    elementalProperties: standardizeElementalProperties(raw.elementalState),
    flavorProfile: standardizeFlavorProfile(raw.flavorProfile),
    nutritionalProfile: standardizeNutritionalProfile(raw.nutritionalProfile),
    season: standardizeSeasons(raw.currentSeason),
    description: raw.description ? String(raw.description) : undefined,
    qualities: Array.isArray(raw.qualities) ? raw.qualities || [].map(String) : [],
    cookingMethods: Array.isArray(raw.cookingMethods) ? raw.cookingMethods || [].map(String) : [],
    pairings: Array.isArray(raw.pairings) ? raw.pairings || [].map(String) : [],
    storage: raw.storage ? String(raw.storage) : undefined,
    preparationTips: Array.isArray(raw.preparationTips)
      ? raw.preparationTips || [].map(String)
      : [],
  } as Ingredient;
}

/**
 * Standardize recipe data
 * @param recipe Raw recipe data
 * @returns Standardized recipe
 */
export function standardizeRecipe(recipe: unknown): Recipe {
  if (!recipe || typeof recipe !== 'object') {
    return createDefaultRecipe('unknown');
  }

  const raw = recipe as Record<string, unknown>;

  return {
    id: String(raw.id || 'unknown'),
    name: String(raw.name || 'Unknown Recipe'),
    description: raw.description ? String(raw.description) : undefined,
    cuisine: String(raw.cuisine || 'international'),
    mealType: Array.isArray(raw.mealType) ? raw.mealType || [].map(String) : ['dinner'],
    servings: typeof raw.servings === 'number' ? raw.servings : 4,
    prepTime:
      typeof raw.prepTime === 'number'
        ? `${raw.prepTime} minutes`
        : typeof raw.prepTime === 'string'
          ? raw.prepTime
          : '30 minutes',
    cookTime:
      typeof raw.cookTime === 'number'
        ? `${raw.cookTime} minutes`
        : typeof raw.cookTime === 'string'
          ? raw.cookTime
          : '30 minutes',
    difficulty: validateDifficulty(raw.difficulty)
      ? (raw.difficulty as Record<string, unknown>)
      : 'medium',
    ingredients: standardizeRecipeIngredients(raw.ingredients),
    instructions: Array.isArray(raw.instructions) ? raw.instructions || [].map(String) : [],
    elementalProperties: standardizeElementalProperties(raw.elementalState),
    astrologicalInfluences: Array.isArray(raw.astrologicalInfluences)
      ? raw.astrologicalInfluences || [].map(String)
      : [],
    seasons: standardizeSeasons(raw.seasons),
    tags: Array.isArray(raw.tags) ? raw.tags || [].map(String) : [],
    nutritionalInfo: standardizeNutritionalInfo(raw.nutritionalInfo),
    equipment: Array.isArray(raw.equipment) ? raw.equipment || [].map(String) : [],
    tips: Array.isArray(raw.tips) ? raw.tips || [].map(String) : [],
  };
}

/**
 * Validate ingredient data
 * @param ingredient Ingredient to validate
 * @returns Validation result
 */
export function validateIngredient(ingredient: Partial<Ingredient>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!ingredient.id) {
    errors.push('Ingredient ID is required');
  }

  if (!ingredient.name) {
    errors.push('Ingredient name is required');
  }

  if (!ingredient.category) {
    errors.push('Ingredient category is required');
  }

  // Elemental properties validation
  if (ingredient.elementalProperties) {
    const elementalValidation = validateElementalProperties(ingredient.elementalProperties);
    if (!elementalValidation.isValid) {
      errors.push(...elementalValidation.errors);
    }
  } else {
    warnings.push('Missing elemental properties');
  }

  // Astrological profile validation
  const ingredientData = ingredient as Record<string, unknown>;
  if (ingredientData.astrologicalPropertiesProfile || ingredientData.astrologicalProfile) {
    const astroProfile =
      ingredientData.astrologicalPropertiesProfile || ingredientData.astrologicalProfile;
    const astroValidation = validateAstrologicalProfile(astroProfile as AstrologicalProfile);
    if (!astroValidation.isValid) {
      warnings.push(...astroValidation.errors);
    }
  }

  return {
    isValid: (errors || []).length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate recipe data
 * @param recipe Recipe to validate
 * @returns Validation result
 */
export function validateRecipe(recipe: Partial<Recipe>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!recipe.id) {
    errors.push('Recipe ID is required');
  }

  if (!recipe.name) {
    errors.push('Recipe name is required');
  }

  if (
    !recipe.ingredients ||
    !Array.isArray(recipe.ingredients) ||
    recipe.ingredients ||
    [].length === 0
  ) {
    errors.push('Recipe must have at least one ingredient');
  }

  if (
    !recipe.instructions ||
    !Array.isArray(recipe.instructions) ||
    recipe.instructions ||
    [].length === 0
  ) {
    errors.push('Recipe must have instructions');
  }

  // Validate ingredients
  if (recipe.ingredients) {
    recipe.ingredients ||
      [].forEach((ingredient, index) => {
        const ingredientValidation = validateRecipeIngredient(ingredient);
        if (!ingredientValidation.isValid) {
          errors.push(`Ingredient ${index + 1}: ${ingredientValidation.errors.join(', ')}`);
        }
      });
  }

  // Validate timing
  if (recipe.preparationTime && Number(recipe.preparationTime) < 0) {
    errors.push('Prep time cannot be negative');
  }

  if (recipe.cookingTime && Number(recipe.cookingTime) < 0) {
    errors.push('Cook time cannot be negative');
  }

  if (recipe.servings && Number(recipe.servings) <= 0) {
    errors.push('Servings must be greater than 0');
  }

  // Elemental properties validation
  if (recipe.elementalState) {
    const elementalValidation = validateElementalProperties(
      recipe.elementalState as unknown as ElementalProperties,
    );
    if (!elementalValidation.isValid) {
      warnings.push(...elementalValidation.errors);
    }
  } else {
    warnings.push('Missing elemental properties');
  }

  return {
    isValid: (errors || []).length === 0,
    errors,
    warnings,
  };
}

/**
 * Clean up ingredients database
 * @param ingredients Array of ingredients to clean
 * @param options Cleanup options
 * @returns Cleanup result
 */
export function cleanupIngredientsDatabase(
  ingredients: Ingredient | UnifiedIngredient[],
  _options: StandardizationOptions = {},
): DataCleanupResult {
  const result: DataCleanupResult = {
    processed: 0,
    cleaned: 0,
    errors: 0,
    warnings: [],
  };

  const cleanedIngredients: Ingredient[] = [];

  (Array.isArray(ingredients) ? ingredients : []).forEach((rawIngredient, index) => {
    result.processed++;

    try {
      const standardized = standardizeIngredient(rawIngredient);
      const validation = validateIngredient(standardized);

      if (validation.isValid) {
        cleanedIngredients.push(standardized);
        result.cleaned++;
      } else {
        result.errors++;
        result.warnings.push(`Ingredient ${index}: ${validation.errors.join(', ')}`);
      }

      if ((validation.warnings && validation.warnings) || [].length > 0) {
        result.warnings.push(`Ingredient ${index} warnings: ${validation.warnings?.join(', ')}`);
      }
    } catch (error) {
      result.errors++;
      result.warnings.push(
        `Ingredient ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  });

  return result;
}

/**
 * Merge elemental properties safely
 * @param base Base elemental properties
 * @param addition Additional elemental properties
 * @param weight Weight for addition (0-1)
 * @returns Merged elemental properties
 */
export function mergeElementalProperties(
  base: ElementalProperties,
  addition: ElementalProperties,
  weight = 0.5,
): ElementalProperties {
  const merged = {
    Fire: base.Fire * (1 - weight) + addition.Fire * weight,
    Water: base.Water * (1 - weight) + addition.Water * weight,
    Earth: base.Earth * (1 - weight) + addition.Earth * weight,
    Air: base.Air * (1 - weight) + addition.Air * weight,
  };

  // Normalize to ensure sum equals 1
  const total = merged.Fire + merged.Water + merged.Earth + merged.Air;
  if (total > 0) {
    return {
      Fire: merged.Fire / total,
      Water: merged.Water / total,
      Earth: merged.Earth / total,
      Air: merged.Air / total,
    };
  }

  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

// --- Helper Functions ---

function createDefaultIngredient(id: string): Ingredient {
  return {
    id,
    name: 'Unknown Ingredient',
    category: 'other',
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    flavorProfile: { sweet: 0, sour: 0, salty: 0, bitter: 0, umami: 0, spicy: 0 },
    season: [],
    qualities: [],
    cookingMethods: [],
    pairings: [],
    preparationTips: [],
  } as Ingredient;
}

function createDefaultRecipe(id: string): Recipe {
  return {
    id,
    name: 'Unknown Recipe',
    cuisine: 'international',
    mealType: ['dinner'],
    servings: 4,
    prepTime: '30 minutes',
    cookTime: '30 minutes',
    difficulty: 'medium',
    ingredients: [],
    instructions: [],
    elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    astrologicalInfluences: [],
    seasons: [],
    tags: [],
    equipment: [],
    tips: [],
  };
}

function standardizeElementalProperties(properties: unknown): ElementalProperties {
  if (!properties || typeof properties !== 'object') {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const props = properties as Record<string, unknown>;
  const Fire = typeof props.Fire === 'number' ? props.Fire : 0.25;
  const Water = typeof props.Water === 'number' ? props.Water : 0.25;
  const Earth = typeof props.Earth === 'number' ? props.Earth : 0.25;
  const Air = typeof props.Air === 'number' ? props.Air : 0.25;

  // Normalize
  const total = Fire + Water + Earth + Air;
  if (total > 0) {
    return { Fire: Fire / total, Water: Water / total, Earth: Earth / total, Air: Air / total };
  }

  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function _standardizeAstrologicalProfile(profile: unknown): AstrologicalProfile {
  if (!profile || typeof profile !== 'object') {
    return {
      elementalAffinity: {} as ElementalAffinity,
      rulingPlanets: [],
      favorableZodiac: [],
    } as unknown as AstrologicalProfile;
  }
  const prof = profile as Record<string, unknown>;
  return {
    elementalAffinity: standardizeElementalAffinity(
      String((prof.elementalAffinity as Record<string, unknown>).base || ''),
    ),
    rulingPlanets: Array.isArray(prof.rulingPlanets) ? (prof.rulingPlanets || []).map(String) : [],
    favorableZodiac: Array.isArray(prof.favorableZodiac)
      ? (prof.favorableZodiac || []).map(String)
      : [],
  } as unknown as AstrologicalProfile;
}

function standardizeFlavorProfile(profile: unknown): { [key: string]: number } {
  if (!profile || typeof profile !== 'object') {
    return {
      sweet: 0,
      sour: 0,
      salty: 0,
      bitter: 0,
      umami: 0,
      spicy: 0,
    };
  }

  const result: { [key: string]: number } = {};
  const prof = profile as Record<string, unknown>;

  Object.entries(prof || {}).forEach(([key, value]) => {
    if (typeof value === 'number' && value >= 0 && value <= 1) {
      result[key] = value;
    }
  });

  return result;
}

function standardizeNutritionalProfile(profile: unknown): { [key: string]: unknown } | undefined {
  if (!profile || typeof profile !== 'object') {
    return undefined;
  }

  return profile as Record<string, unknown>;
}

function standardizeSeasons(seasons: unknown): string[] {
  if (Array.isArray(seasons)) {
    return (seasons || []).map(String);
  }

  if (typeof seasons === 'string') {
    return [seasons];
  }

  return [];
}

function standardizeRecipeIngredients(ingredients: unknown): RecipeIngredient[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return (ingredients || []).map(ingredient => {
    if (typeof ingredient === 'string') {
      return {
        name: ingredient,
        amount: 1,
        unit: 'item',
      };
    }

    if (ingredient && typeof ingredient === 'object') {
      const ing = ingredient as Record<string, unknown>;
      return {
        name: String(ing.name || 'Unknown'),
        amount: typeof ing.amount === 'number' ? ing.amount : 1,
        unit: String(ing.unit || 'item'),
        preparation: ing.preparation ? String(ing.preparation) : undefined,
        optional: Boolean(ing.optional),
        notes: ing.notes ? String(ing.notes) : undefined,
      };
    }

    return {
      name: 'Unknown',
      amount: 1,
      unit: 'item',
    };
  });
}

function standardizeNutritionalInfo(info: unknown): { [key: string]: unknown } | undefined {
  if (!info || typeof info !== 'object') {
    return undefined;
  }

  return info as Record<string, unknown>;
}

function validateDifficulty(difficulty: unknown): boolean {
  return typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty);
}

function validateElementalProperties(properties: ElementalProperties): ValidationResult {
  const errors: string[] = [];

  if (!properties || typeof properties !== 'object') {
    errors.push('Elemental properties must be an object');
    return { isValid: false, errors };
  }

  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];

  (requiredElements || []).forEach(element => {
    if (typeof properties[element as 'Fire' | 'Water' | 'Earth' | 'Air'] !== 'number') {
      errors.push(`${element} must be a number`);
    } else {
      const value = properties[element as 'Fire' | 'Water' | 'Earth' | 'Air'];
      if (value < 0 || value > 1) {
        errors.push(`${element} must be between 0 and 1`);
      }
    }
  });

  return {
    isValid: (errors || []).length === 0,
    errors,
  };
}

function validateAstrologicalProfile(profile: AstrologicalProfile): ValidationResult {
  const errors: string[] = [];

  if (!profile || typeof profile !== 'object') {
    errors.push('Astrological profile must be an object');
    return { isValid: false, errors };
  }

  // Safe property access for AstrologicalProfile properties
  const elementalAffinity = (profile as Record<string, unknown>).elementalAffinity;
  if (!(elementalAffinity as Record<string, unknown>).base) {
    errors.push('Elemental affinity is required');
  }

  const rulingPlanets = (profile as Record<string, unknown>).rulingPlanets;
  if (!Array.isArray(rulingPlanets)) {
    errors.push('Ruling planets must be an array');
  }

  return {
    isValid: (errors || []).length === 0,
    errors,
  };
}

function validateRecipeIngredient(ingredient: unknown): ValidationResult {
  const errors: string[] = [];

  if (!ingredient || typeof ingredient !== 'object') {
    errors.push('Ingredient must be an object');
    return { isValid: false, errors };
  }

  const ing = ingredient as Record<string, unknown>;

  if (!ing.name || typeof ing.name !== 'string') {
    errors.push('Ingredient name is required');
  }

  if (ing.amount !== undefined && typeof ing.amount !== 'number') {
    errors.push('Ingredient amount must be a number');
  }

  if (ing.unit !== undefined && typeof ing.unit !== 'string') {
    errors.push('Ingredient unit must be a string');
  }

  return {
    isValid: (errors || []).length === 0,
    errors,
  };
}

export default {
  standardizeElementalAffinity,
  standardizeIngredient,
  standardizeRecipe,
  validateIngredient,
  validateRecipe,
  cleanupIngredientsDatabase,
  mergeElementalProperties,
};
