import { z } from "zod";

/**
 * Alchemical Elemental Properties Schema
 * Capitalized keys (Fire, Water, Earth, Air) matching the Python backend contract.
 * Values are non-negative floats (can be > 1 before normalization).
 */
export const AlchemicalElementalPropertiesSchema = z.object({
  Fire: z.number().nonnegative(),
  Water: z.number().nonnegative(),
  Earth: z.number().nonnegative(),
  Air: z.number().nonnegative(),
});

export type AlchemicalElementalProperties = z.infer<
  typeof AlchemicalElementalPropertiesSchema
>;

/**
 * Thermodynamics Result Schema
 */
export const ThermodynamicsResultSchema = z
  .object({
    heat: z.number(),
    entropy: z.number(),
    reactivity: z.number(),
    gregsEnergy: z.number(),
    equilibrium: z.number(),
  })
  .passthrough();

export type ThermodynamicsResult = z.infer<typeof ThermodynamicsResultSchema>;

/**
 * Planetary Influence Response Schema
 */
export const PlanetaryInfluenceResponseSchema = z
  .object({
    current_time: z.string(),
    dominant_planet: z.string(),
    influence_strength: z.number(),
    all_influences: z.record(z.string(), z.number()),
  })
  .passthrough();

export type PlanetaryInfluenceResponse = z.infer<
  typeof PlanetaryInfluenceResponseSchema
>;

/**
 * Planetary Positions Response Schema
 */
export const PlanetaryPositionsResponseSchema = z
  .object({
    primary_chart: z.record(z.string(), z.unknown()),
    secondary_charts: z.array(z.record(z.string(), z.unknown())).optional(),
    collective_synastry: z
      .object({
        participant_count: z.number(),
        average_elemental_distribution: z.record(z.string(), z.number()),
        elemental_deficits: z.record(z.string(), z.number()),
        group_smes_scores: z.record(z.string(), z.number()),
        is_collective: z.boolean(),
      })
      .optional(),
    is_collective: z.boolean(),
    participant_count: z.number(),
  })
  .passthrough();

export type PlanetaryPositionsResponse = z.infer<
  typeof PlanetaryPositionsResponseSchema
>;

/**
 * Recipe Recommendations Response Schema
 */
export const RecipeRecommendationsResponseSchema = z
  .object({
    recommendations: z.array(z.unknown()),
    total_count: z.number(),
    request_context: z
      .object({
        timestamp: z.string(),
        elemental_state: AlchemicalElementalPropertiesSchema.optional(),
      })
      .passthrough(),
  })
  .passthrough();

export type RecipeRecommendationsResponse = z.infer<
  typeof RecipeRecommendationsResponseSchema
>;

/**
 * ESMS (Spirit, Essence, Matter, Substance) Result Schema
 */
export const ESMSResultSchema = z
  .object({
    Spirit: z.number(),
    Essence: z.number(),
    Matter: z.number(),
    Substance: z.number(),
  })
  .passthrough();

export type ESMSResult = z.infer<typeof ESMSResultSchema>;

/**
 * Balance Optimization Result Schema
 */
export const BalanceOptimizationResultSchema = z
  .object({
    optimization: z.string(),
    recommendations: z.array(z.unknown()),
  })
  .passthrough();

export type BalanceOptimizationResult = z.infer<
  typeof BalanceOptimizationResultSchema
>;
