/**
 * Generated sauce catalogue contract — public/data/sauce-catalogue.json.
 *
 * Mirrors src/lib/baking/recipes/catalogueFile.ts: the heavy per-cuisine
 * sauce/regional/pairing definitions live in a generated static JSON fetched
 * once on demand so client entry bundles stay light while unlocking all 15
 * traditions, 80+ native sauces, 60+ regions, and ingredient dossier links.
 *
 * @file src/lib/sauces/catalogueFile.ts
 */
import { z } from "zod";

export const SAUCE_CATALOGUE_URL = "/data/sauce-catalogue.json";

/**
 * Canonical cross-module sauce node / result identifier.
 * Shared by cuisineSauceProfiler.ts and sauceLineage.ts so "Phylogeny ->"
 * deep-links match forest node IDs identically across every cuisine.
 */
export function makeSauceId(parts: readonly string[]): string {
  return parts
    .map((part) =>
      part
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .join(":");
}

const finiteNum = z.number().finite();

export const sauceElementalSchema = z.object({
  Fire: finiteNum,
  Water: finiteNum,
  Earth: finiteNum,
  Air: finiteNum,
});
export type SauceElemental = z.infer<typeof sauceElementalSchema>;

export const sauceAlchemicalSchema = z.object({
  Spirit: finiteNum,
  Essence: finiteNum,
  Matter: finiteNum,
  Substance: finiteNum,
});
export type SauceAlchemical = z.infer<typeof sauceAlchemicalSchema>;

export const sauceThermodynamicSchema = z.object({
  heat: finiteNum,
  entropy: finiteNum,
  reactivity: finiteNum,
  gregsEnergy: finiteNum,
});
export type SauceThermodynamic = z.infer<typeof sauceThermodynamicSchema>;

export const sauceNutritionSchema = z.object({
  calories: finiteNum.optional(),
  protein: finiteNum.optional(),
  carbs: finiteNum.optional(),
  fat: finiteNum.optional(),
  fiber: finiteNum.optional(),
  sodium: finiteNum.optional(),
  sugar: finiteNum.optional(),
  servingSize: z.string().optional(),
});
export type SauceNutrition = z.infer<typeof sauceNutritionSchema>;

export const catalogueSauceEntrySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  base: z.string().optional(),
  thickener: z.string().optional(),
  keyIngredients: z.array(z.string()).optional(),
  culinaryUses: z.array(z.string()).optional(),
  variants: z.array(z.string()).optional(),
  derivatives: z.array(z.string()).optional(),
  elementalProperties: sauceElementalSchema.optional(),
  astrologicalInfluences: z.array(z.string()).optional(),
  seasonality: z.string().optional(),
  preparationNotes: z.string().optional(),
  technicalTips: z.string().optional(),
  difficulty: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  yield: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  preparationSteps: z.array(z.string()).optional(),
  storageInstructions: z.string().optional(),
  alchemicalProperties: sauceAlchemicalSchema.optional(),
  thermodynamicProperties: sauceThermodynamicSchema.optional(),
  nutritionalProfile: sauceNutritionSchema.optional(),
});
export type CatalogueSauceEntry = z.infer<typeof catalogueSauceEntrySchema>;

export const catalogueRegionalEntrySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  signature: z.array(z.string()).optional(),
  elementalProperties: sauceElementalSchema.optional(),
});
export type CatalogueRegionalEntry = z.infer<typeof catalogueRegionalEntrySchema>;

export const cataloguePairingMapSchema = z.object({
  forProtein: z.record(z.string(), z.array(z.string())),
  forVegetable: z.record(z.string(), z.array(z.string())),
  forCookingMethod: z.record(z.string(), z.array(z.string())),
  byAstrological: z.record(z.string(), z.array(z.string())),
  byDietary: z.record(z.string(), z.array(z.string())),
  byRegion: z.record(z.string(), z.array(z.string())),
});
export type CataloguePairingMap = z.infer<typeof cataloguePairingMapSchema>;

export const catalogueCuisineEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  elementalProperties: sauceElementalSchema,
  motherSauces: z.record(z.string(), catalogueSauceEntrySchema),
  traditionalSauces: z.record(z.string(), catalogueSauceEntrySchema),
  sauceRecommender: cataloguePairingMapSchema,
  regionalCuisines: z.array(catalogueRegionalEntrySchema),
  astrologicalInfluences: z.array(z.string()),
});
export type CatalogueCuisineEntry = z.infer<typeof catalogueCuisineEntrySchema>;

export const sauceCatalogueFileSchema = z.object({
  source: z.string().min(1),
  cuisineCount: z.number().int().nonnegative(),
  sauceCount: z.number().int().nonnegative(),
  cuisines: z.record(z.string(), catalogueCuisineEntrySchema),
  ingredientSlugs: z.record(z.string(), z.string()),
});
export type SauceCatalogueFile = z.infer<typeof sauceCatalogueFileSchema>;

/**
 * Validate a parsed JSON payload against the sauce catalogue contract.
 * Throws on null, non-finite numbers, or malformed entries rather than
 * returning a partially populated catalogue.
 */
export function parseSauceCatalogueFile(json: unknown): SauceCatalogueFile {
  return sauceCatalogueFileSchema.parse(json);
}
