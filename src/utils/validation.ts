import { z } from 'zod';
import type { Recipe } from '@/types/recipe';

export const recipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  regionalCuisine: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    unit: z.string(),
    category: z.string(),
  })),
  mealType: z.array(z.string()),
  season: z.array(z.string()).optional(),
  timeToMake: z.string(),
  elementalProperties: z.object({
    Fire: z.number(),
    Earth: z.number(),
    Air: z.number(),
    Water: z.number(),
  }).optional(),
  properties: z.object({
    light: z.boolean().optional(),
    festive: z.boolean().optional(),
    grounding: z.boolean().optional(),
    comforting: z.boolean().optional(),
    luxurious: z.boolean().optional(),
    transformative: z.boolean().optional(),
  }).optional(),
  nutrition: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    balanced: z.boolean().optional(),
  }).optional(),
  traditional: z.number().optional(),
  popularity: z.number().optional(),
});

export function validateRecipe(recipe: Recipe) {
  return recipeSchema.safeParse(recipe);
}

// Re-export validation functions from elemental utilities
export { isElementalProperties } from './elemental/elementalUtils';

// Type guard to check if a string is a valid elemental property key
export function isElementalPropertyKey(key: unknown): key is keyof import('@/types/alchemy').ElementalProperties {
  return typeof key === 'string' && (['Fire', 'Water', 'Earth', 'Air'] as const).includes(key as any);
}

// Logs unexpected values for debugging purposes
export function logUnexpectedValue(context: string, details: unknown): void {
  // console.warn(`Unexpected value in ${context}:`, details);
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
  validator?: (val: unknown) => val is T
): T {
  try {
    // If no validator provided, just check if value is not null/undefined
    if (!validator) {
      return value !== null && value !== undefined ? (value as T) : defaultValue;
    }
    
    // Use the provided validator
    return validator(value) ? value : defaultValue;
  } catch (error) {
    logUnexpectedValue('validateOrDefault', { value, error });
    return defaultValue;
  }
} 