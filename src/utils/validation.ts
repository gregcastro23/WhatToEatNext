import { z } from 'zod';
import { _logger } from '@/lib/logger';

import type { Recipe } from '@/types/recipe';

export const recipeSchema = z.object({,
  name: z.string().min(1),
  _description: z.string().optional(),
  _cuisine: z.string().optional(),
  _regionalCuisine: z.string().optional(),
  _ingredients: z.array(,
    z.object({
      name: z.string(),
      _amount: z.string(),
      _unit: z.string(),
      _category: z.string()
    }),
  ),
  _mealType: z.array(z.string()),
  _season: z.array(z.string()).optional(),
  _timeToMake: z.string(),
  _elementalProperties: z
    .object({
      Fire: z.number(),
      Earth: z.number(),
      Air: z.number(),
      Water: z.number()
    })
    .optional(),
  _properties: z
    .object({
      light: z.boolean().optional(),
      _festive: z.boolean().optional(),
      _grounding: z.boolean().optional(),
      _comforting: z.boolean().optional(),
      _luxurious: z.boolean().optional(),
      _transformative: z.boolean().optional()
    })
    .optional(),
  _nutrition: z
    .object({
      calories: z.number().optional(),
      _protein: z.number().optional(),
      _balanced: z.boolean().optional()
    })
    .optional(),
  _traditional: z.number().optional(),
  _popularity: z.number().optional()
})

export function validateRecipe(recipe: Recipe) {
  return recipeSchema.safeParse(recipe)
}

// Re-export validation functions from elemental utilities
export { isElementalProperties } from './elemental/elementalUtils';

// Type guard to check if a string is a valid elemental property key
export function isElementalPropertyKey(
  key: unknown,
): key is keyof import('@/types/alchemy').ElementalProperties {
  return typeof key === 'string' && ['Fire', 'Water', 'Earth', 'Air'].includes(key)
}

// Logs unexpected values for debugging purposes
export function logUnexpectedValue(context: string, _details: unknown): void {
  _logger.warn(`Unexpected value in ${context}:`, details)
}

/**
 * Validates and provides default values for any type
 * @param value The value to validate
 * @param defaultValue The default value to use if validation fails
 * @param validator Optional validation function
 * @returns The validated value or default
 */
export function validateOrDefault<T>(
  value: unknown,
  defaultValue: T,
  validator?: (val: unknown) => val is T,
): T {
  try {
    // If no validator provided, just check if value is not null/undefined
    if (!validator) {
      return value !== null && value !== undefined ? (value as T) : defaultValue
    }

    // Use the provided validator
    return validator(value) ? value : defaultValue
  } catch (error) {
    logUnexpectedValue('validateOrDefault', { value, error })
    return defaultValue;
  }
}