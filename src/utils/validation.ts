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