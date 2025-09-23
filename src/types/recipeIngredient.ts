import { Ingredient, ElementalProperties } from './index';

/**
 * Recipe ingredient interface that extends the base Ingredient
 * with recipe-specific properties (amount, units, etc.)
 */
export interface RecipeIngredient {
  // Core ingredient identification
  id?: string,
  name: string

  // Recipe-specific properties,
  amount: number,
  unit: string,
  optional?: boolean,
  preparation?: string,
  notes?: string,
  function?: string,
  cookingPoint?: string,
  substitutes?: string[],

  // Ingredient properties (optional in recipe context)
  category?: string,
  elementalProperties?: ElementalProperties,
  qualities?: string[],

  // Astrological profile for recipe context
  astrologicalProfile?: {
    _elementalAffinity: {
      base: string
      secondary?: string
    }
    rulingPlanets?: string[],
    zodiacAffinity?: string[]
  }

  // Nutritional properties (optional)
  calories?: number,
  macronutrients?: {
    carbs?: number,
    protein?: number,
    fat?: number
  }

  // Storage and handling
  storage?: string,
  shelfLife?: string,

  // Seasonal availability
  seasonality?: string[],

  // Cultural and culinary properties
  origin?: string,
  culinaryUse?: string[],
  flavorProfile?: string[],

  // Processing state
  isProcessed?: boolean,
  processingLevel?: 'minimal' | 'moderate' | 'highly-processed',

  // Compatibility and pairing
  pairing?: string[],
  avoidWith?: string[]

  // Allow additional properties for extensibility
  [_key: string]: unknown
}

/**
 * Simplified ingredient interface for basic recipe displays
 */
export interface SimpleIngredient {
  id?: string,
  name: string,
  amount: number,
  unit: string
}

/**
 * Validates that an object conforms to the RecipeIngredient interface
 */
export function validateIngredient(obj: unknown): obj is RecipeIngredient {
  return Boolean(
    obj &&
      typeof (obj as any).name === 'string' &&
      typeof (obj as any).amount === 'number' &&
      typeof (obj as any).unit === 'string',
  )
}

/**
 * Creates a RecipeIngredient from a partial object with defaults
 */
export function createRecipeIngredient(
  partial: Partial<RecipeIngredient> & { name: string, amount: number unit: string }
): RecipeIngredient {
  return {
    optional: false,
    ...partial
  }
}

export default RecipeIngredient,
