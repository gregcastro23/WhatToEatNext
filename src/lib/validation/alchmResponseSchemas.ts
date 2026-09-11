import { z } from "zod";
import { AlchemicalElementalPropertiesSchema } from "./alchemicalBackendSchemas";

/**
 * Alchm API Client Thermodynamics Result Schema
 */
export const AlchemicalThermodynamicsResultSchema = z.object({
  heat: z.number(),
  entropy: z.number(),
  reactivity: z.number(),
  gregsEnergy: z.number(),
  kalchm: z.number(),
  monica: z.number().nullable(),
});

export type AlchemicalThermodynamicsResult = z.infer<
  typeof AlchemicalThermodynamicsResultSchema
>;

/**
 * Alchm API Client Token Rates Result Schema
 */
export const AlchemicalTokenRatesResultSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
  kalchm: z.number(),
  monica: z.number().nullable(),
});

export type AlchemicalTokenRatesResult = z.infer<
  typeof AlchemicalTokenRatesResultSchema
>;

/**
 * Alchm API Client Rune Guidance Result Schema
 */
export const AlchemicalRuneGuidanceResultSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  meaning: z.string(),
  influence: z.object({
    elemental: AlchemicalElementalPropertiesSchema,
    energy: z.object({
      Spirit: z.number(),
      Essence: z.number(),
      Matter: z.number(),
      Substance: z.number(),
    }),
    guidance: z.string(),
  }),
});

export type AlchemicalRuneGuidanceResult = z.infer<
  typeof AlchemicalRuneGuidanceResultSchema
>;

/**
 * Alchm API Client Planetary Hour Result Schema
 */
export const AlchemicalPlanetaryHourResultSchema = z.object({
  planet: z.string(),
  hourNumber: z.number().optional(),
  isDaytime: z.boolean(),
  start: z.string().optional(),
  end: z.string().optional(),
});

export type AlchemicalPlanetaryHourResult = z.infer<
  typeof AlchemicalPlanetaryHourResultSchema
>;

/**
 * Alchm API Client Recipe Recommendation Schema
 */
export const AlchmRecipeRecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional(),
});

export type AlchmRecipeRecommendation = z.infer<
  typeof AlchmRecipeRecommendationSchema
>;

/**
 * External Data Service Schemas
 */
export const AlchmCuisineSchema = z
  .object({
    name: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
  })
  .passthrough();

export type AlchmCuisine = z.infer<typeof AlchmCuisineSchema>;

export const AlchmCuisinesRecordSchema = z.record(
  z.string(),
  AlchmCuisineSchema,
);

export type AlchmCuisinesRecord = z.infer<typeof AlchmCuisinesRecordSchema>;

export const AlchmSaucesRecordSchema = z.record(
  z.string(),
  z.record(z.string(), z.unknown()),
);

export type AlchmSaucesRecord = z.infer<typeof AlchmSaucesRecordSchema>;

export const AlchmIngredientsRecordSchema = z.record(
  z.string(),
  z.record(z.string(), z.unknown()),
);

export type AlchmIngredientsRecord = z.infer<
  typeof AlchmIngredientsRecordSchema
>;
