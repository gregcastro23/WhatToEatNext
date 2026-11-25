/** Wire contract for GET /api/search/pantry: recipes that use the typed ingredients. */
import { z } from "zod";
import { SEARCH_QUERY_MAX_LENGTH } from "./searchSchemas";

export const PANTRY_MAX_INGREDIENTS = 12;
export const PANTRY_DIETS = ["vegan", "vegetarian"] as const;

export const PantryQuerySchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(SEARCH_QUERY_MAX_LENGTH)).min(1).max(PANTRY_MAX_INGREDIENTS),
  diet: z.enum(PANTRY_DIETS).nullable(),
});

export const PantryResponseSchema = z.object({
  success: z.literal(true),
  ingredients: z.array(
    z.object({
      /** As typed. */
      term: z.string(),
      /** The catalog card it names; null when none does. */
      name: z.string().nullable(),
      href: z.string().nullable(),
    }),
  ),
  recipes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      href: z.string(),
      cuisine: z.string().nullable(),
      uses: z.array(z.string()),
      missing: z.array(z.string()),
    }),
  ),
  total: z.number().int().nonnegative(),
});

export type PantryQuery = z.infer<typeof PantryQuerySchema>;
export type PantryResponse = z.infer<typeof PantryResponseSchema>;
