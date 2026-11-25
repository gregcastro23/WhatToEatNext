/** Wire contract for GET /api/ingredients/[name]/culinary. */
import { z } from "zod";
import { FoodGuideSchema } from "@/lib/cooking/foodGuides/schema";

export const CardSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(z.string()).min(1),
});

export const CulinaryCardSchema = z.object({
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  /** The ingredient's own page. */
  href: z.string(),
  origin: z.array(z.string()),
  seasons: z.array(z.string()),
  qualities: z.array(z.string()),
  /** What the catalog card records about this ingredient, filler left out. */
  sections: z.array(CardSectionSchema),
  /** Topics neither the card nor a guide covers yet. */
  missing: z.array(z.string()),
  /** Researched, cited guides for this ingredient (one per cut for meats). */
  guides: z.array(FoodGuideSchema),
  recipes: z.array(z.object({ name: z.string(), href: z.string(), cuisine: z.string().nullable() })),
  recipeCount: z.number().int().nonnegative(),
});

export const CulinaryCardResponseSchema = z.object({ success: z.literal(true), card: CulinaryCardSchema });

export type CulinaryCardResponse = z.infer<typeof CulinaryCardResponseSchema>;
export type CardSection = z.infer<typeof CardSectionSchema>;
export type CulinaryCard = z.infer<typeof CulinaryCardSchema>;
