/**
 * Wire contract for GET /api/search/recipes: dishes grouped with every version,
 * and the closest dishes from other cuisines.
 */
import { z } from "zod";

export const RecipeVersionSchema = z.object({
  /** Null for a held-back version, which has no page of its own. */
  id: z.string().nullable(),
  name: z.string(),
  href: z.string().nullable(),
  cuisine: z.string().nullable(),
  /** "Vegan", "Shrimp Dumplings": what the name says sets it apart. */
  labels: z.array(z.string()),
  totalMinutes: z.number().nullable(),
  /** The recipe itself, for a version with no page; null when it has one. */
  onFile: z
    .object({
      meal: z.string(),
      description: z.string().nullable(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    })
    .nullable(),
});

export const CrossCuisineSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  cuisine: z.string(),
  /** Cosine similarity of rarity-weighted ingredients, 0 to 1. */
  score: z.number(),
  shared: z.array(z.string()),
});

export const RecipeGroupSchema = z.object({
  key: z.string(),
  title: z.string(),
  matchedBy: z.enum(["name", "ingredient"]),
  /** "uses 2 of 3, missing feta"; null for a name match. */
  matchNote: z.string().nullable(),
  versions: z.array(RecipeVersionSchema).min(1),
  crossCuisine: z.array(CrossCuisineSchema),
});

export const RecipeSearchResponseSchema = z.object({
  success: z.literal(true),
  query: z.string(),
  groups: z.array(RecipeGroupSchema),
  totalGroups: z.number().int().nonnegative(),
});

export type RecipeVersion = z.infer<typeof RecipeVersionSchema>;
export type CrossCuisineMatch = z.infer<typeof CrossCuisineSchema>;
export type RecipeGroup = z.infer<typeof RecipeGroupSchema>;
export type RecipeSearchResponse = z.infer<typeof RecipeSearchResponseSchema>;
