import { z } from "zod";

/**
 * Astrologize Planet Data Schema
 */
export const AstrologizePlanetDataSchema = z
  .object({
    key: z.string(),
    label: z.string(),
    Sign: z.object({
      key: z.string(),
      zodiac: z.string(),
      label: z.string(),
    }),
    ChartPosition: z.object({
      Ecliptic: z.object({
        DecimalDegrees: z.number(),
        ArcDegrees: z.object({
          degrees: z.number(),
          minutes: z.number(),
          seconds: z.number(),
        }),
      }),
    }),
    isRetrograde: z.boolean(),
  })
  .passthrough();

export type AstrologizePlanetData = z.infer<typeof AstrologizePlanetDataSchema>;

/**
 * Astrologize Celestial Bodies Schema
 */
export const AstrologizeCelestialBodiesSchema = z
  .object({
    all: z.array(AstrologizePlanetDataSchema),
    sun: AstrologizePlanetDataSchema.optional(),
    moon: AstrologizePlanetDataSchema.optional(),
    mercury: AstrologizePlanetDataSchema.optional(),
    venus: AstrologizePlanetDataSchema.optional(),
    mars: AstrologizePlanetDataSchema.optional(),
    jupiter: AstrologizePlanetDataSchema.optional(),
    saturn: AstrologizePlanetDataSchema.optional(),
    uranus: AstrologizePlanetDataSchema.optional(),
    neptune: AstrologizePlanetDataSchema.optional(),
    pluto: AstrologizePlanetDataSchema.optional(),
  })
  .passthrough();

/**
 * Astrologize Response Schema (astrologizeApi.ts)
 */
export const AstrologizeResponseSchema = z
  .object({
    _celestialBodies: AstrologizeCelestialBodiesSchema.optional(),
    ascendant: z
      .object({
        sign: z.string(),
        degree: z.number().optional(),
        minute: z.number().optional(),
        exactLongitude: z.number().optional(),
      })
      .optional(),
    error: z.string().optional(),
    birth_info: z
      .object({
        year: z.number(),
        month: z.number(),
        date: z.number(),
        hour: z.number(),
        minute: z.number(),
        latitude: z.number(),
        longitude: z.number(),
        ayanamsa: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export type AstrologizeResponse = z.infer<typeof AstrologizeResponseSchema>;

/**
 * Natal Chart Astrologize Response Schema (natalChartService.ts)
 * Requires complete celestialBodies with all planets populated.
 */
export const NatalChartAstrologizeResponseSchema = z
  .object({
    _celestialBodies: z
      .object({
        all: z.array(AstrologizePlanetDataSchema),
        sun: AstrologizePlanetDataSchema,
        moon: AstrologizePlanetDataSchema,
        mercury: AstrologizePlanetDataSchema,
        venus: AstrologizePlanetDataSchema,
        mars: AstrologizePlanetDataSchema,
        jupiter: AstrologizePlanetDataSchema,
        saturn: AstrologizePlanetDataSchema,
        uranus: AstrologizePlanetDataSchema,
        neptune: AstrologizePlanetDataSchema,
        pluto: AstrologizePlanetDataSchema,
      })
      .passthrough(),
    ascendant: z
      .object({
        sign: z.string(),
        degree: z.number().optional(),
        minute: z.number().optional(),
        exactLongitude: z.number().optional(),
      })
      .optional(),
    birth_info: z
      .object({
        year: z.number(),
        month: z.number(),
        date: z.number(),
        hour: z.number(),
        minute: z.number(),
        latitude: z.number(),
        longitude: z.number(),
        ayanamsa: z.string().optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type NatalChartAstrologizeResponse = z.infer<
  typeof NatalChartAstrologizeResponseSchema
>;

/**
 * Astrological Recipe Recommendation Matching Ingredient Schema
 */
export const RecipeRecommendationMatchingIngredientSchema = z
  .object({
    ingredient: z.string(),
    sign: z.string(),
    base_affinity: z.number(),
    lunar_modifier: z.number(),
    seasonal_modifier: z.number(),
    weighted_environmental_score: z.number(),
  })
  .passthrough();

/**
 * Astrological Recipe Recommendation Optimal Window Schema
 */
export const RecipeRecommendationOptimalWindowSchema = z
  .object({
    date: z.string(),
    start_time: z.string(),
    end_time: z.string().optional(),
    food_type: z.string(),
  })
  .passthrough();

/**
 * Astrological Recipe Recommendation Elemental Properties Schema
 */
export const RecipeRecommendationElementalPropertiesSchema = z
  .object({
    Fire: z.number(),
    Water: z.number(),
    Earth: z.number(),
    Air: z.number(),
  })
  .passthrough();

/**
 * Astrological Recipe Recommendation Schema
 */
export const RecipeRecommendationSchema = z
  .object({
    recipe_id: z.string(),
    name: z.string(),
    weighted_environmental_score: z.number(),
    matching_ingredients: z.array(
      RecipeRecommendationMatchingIngredientSchema,
    ),
    isEnvironmentalMatch: z.boolean(),
    environmentalMatchDetails: z.string().optional(),
    optimal_cooking_window:
      RecipeRecommendationOptimalWindowSchema.nullable(),
    elementalProperties:
      RecipeRecommendationElementalPropertiesSchema.nullable(),
    spirit_score: z.number(),
    matter_score: z.number(),
    essence_score: z.number(),
    substance_score: z.number(),
    kinetic_val: z.number(),
    thermo_val: z.number(),
    total_potency_score: z.number(),
    collective_potency_modifier_applied: z.number(),
  })
  .passthrough();

export type RecipeRecommendation = z.infer<typeof RecipeRecommendationSchema>;

/**
 * Full Recipe Recommendation Response Schema
 */
export const RecipeRecommendationResponseSchema = z
  .object({
    request_params: z.record(z.string(), z.unknown()),
    lunar_phase: z
      .object({
        phase_name: z.string(),
      })
      .passthrough()
      .nullable(),
    seasonal_context: z
      .object({
        current_zodiac_season: z.string(),
        boosted_ingredients: z.record(z.string(), z.unknown()),
      })
      .passthrough(),
    recommendations: z.array(RecipeRecommendationSchema),
  })
  .passthrough();

export type RecipeRecommendationResponse = z.infer<
  typeof RecipeRecommendationResponseSchema
>;
