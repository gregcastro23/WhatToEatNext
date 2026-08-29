/**
 * Batch Recipe Enrichment Utilities
 *
 * Provides functionality to batch process and enrich all recipes in the system.
 * Can be used to update recipe data with authentic elemental properties,
 * planetary influences, seasonal alignment, and nutritional estimates.
 *
 * @file src/utils/recipe/batchEnrichment.ts
 * @created 2026-01-29
 */

import { z } from "zod";
import type { Recipe } from "@/types";
import { createLogger } from "../logger";
import {
  RecipeDataEnricher,
  type EnrichmentResult,
} from "./RecipeDataEnricher";

const logger = createLogger("BatchEnrichment");

// ============================================================================
// Types
// ============================================================================

export interface BatchEnrichmentResult {
  totalProcessed: number;
  enriched: number;
  skipped: number;
  errors: number;
  results: Map<string, EnrichmentResult>;
  errorDetails: Map<string, string>;
  stats: EnrichmentStats;
}

export interface EnrichmentStats {
  avgConfidenceScore: number;
  elementalDistribution: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  planetaryInfluenceCounts: Record<string, number>;
  seasonalCounts: Record<string, number>;
  cuisineCounts: Record<string, number>;
  mealTypeCounts: Record<string, number>;
}

export interface BatchEnrichmentOptions {
  skipExisting?: boolean;
  forceReenrich?: boolean;
  validateAfter?: boolean;
  includeDefaultElementals?: boolean;
  logProgress?: boolean;
}

const elementalPropertiesSchema = z
  .object({
    Fire: z.number().finite(),
    Water: z.number().finite(),
    Earth: z.number().finite(),
    Air: z.number().finite(),
  })
  .catchall(z.number().finite());

const recipeIngredientSchema = z
  .object({
    name: z.string(),
    amount: z.number().finite(),
    unit: z.string(),
  })
  .passthrough();

const enrichmentRecipeSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    cuisine: z.string().optional(),
    ingredients: z.array(recipeIngredientSchema).optional(),
    cookingMethod: z.array(z.string()).optional(),
    elementalProperties: elementalPropertiesSchema.optional(),
    mealType: z.union([z.string(), z.array(z.string())]).optional(),
    season: z.union([z.string(), z.array(z.string())]).optional(),
    astrologicalInfluences: z.array(z.string()).optional(),
    numberOfServings: z.number().finite().optional(),
    spiceLevel: z
      .union([
        z.number().finite(),
        z.enum(["mild", "medium", "hot", "very hot"]),
      ])
      .optional(),
  })
  .passthrough();

type EnrichmentRecipeInput = z.infer<typeof enrichmentRecipeSchema>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEnrichmentRecipe(value: unknown): EnrichmentRecipeInput | null {
  const parsed = enrichmentRecipeSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function addCuisineDefaults(
  value: unknown,
  cuisine: string,
  mealType?: string,
): EnrichmentRecipeInput | null {
  const recipe = parseEnrichmentRecipe(value);
  if (!recipe) return null;

  return {
    ...recipe,
    cuisine: recipe.cuisine ?? cuisine,
    mealType: recipe.mealType ?? (mealType ? [mealType] : undefined),
  };
}

// ============================================================================
// Batch Enrichment Functions
// ============================================================================

/**
 * Batch enrich multiple recipes
 */
export function batchEnrichRecipes(
  recipes: Array<Partial<Recipe>>,
  options: BatchEnrichmentOptions = {},
): BatchEnrichmentResult {
  const {
    skipExisting = false,
    forceReenrich = false,
    validateAfter = true,
    logProgress = true,
  } = options;

  const enricher = RecipeDataEnricher.getInstance();
  const results = new Map<string, EnrichmentResult>();
  const errorDetails = new Map<string, string>();

  let totalProcessed = 0;
  let enriched = 0;
  let skipped = 0;
  let errors = 0;

  for (const recipe of recipes) {
    totalProcessed++;
    const recipeId = recipe.id ?? recipe.name ?? `recipe-${totalProcessed}`;

    try {
      // Check if recipe needs enrichment
      if (skipExisting && !forceReenrich && !enricher.needsEnrichment(recipe)) {
        skipped++;
        if (logProgress && totalProcessed % 50 === 0) {
          logger.debug(`Progress: ${totalProcessed}/${recipes.length}`);
        }
        continue;
      }

      // Enrich the recipe
      const enrichment = enricher.enrichRecipe(recipe);
      results.set(recipeId, enrichment);
      enriched++;

      // Validate if requested
      if (validateAfter) {
        const isValid = validateEnrichment(enrichment);
        if (!isValid) {
          logger.warn(`Enrichment validation failed for ${recipeId}`);
        }
      }

      if (logProgress && totalProcessed % 50 === 0) {
        logger.info(
          `Progress: ${totalProcessed}/${recipes.length} (${enriched} enriched)`,
        );
      }
    } catch (error) {
      errors++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errorDetails.set(recipeId, errorMsg);
      logger.error(`Failed to enrich recipe ${recipeId}: ${errorMsg}`);
    }
  }

  // Calculate statistics
  const stats = calculateEnrichmentStats(results);

  if (logProgress) {
    logger.info(`Batch enrichment complete:
      Total processed: ${totalProcessed}
      Enriched: ${enriched}
      Skipped: ${skipped}
      Errors: ${errors}
      Avg confidence: ${stats.avgConfidenceScore.toFixed(1)}%
    `);
  }

  return {
    totalProcessed,
    enriched,
    skipped,
    errors,
    results,
    errorDetails,
    stats,
  };
}

/**
 * Validate an enrichment result
 */
function validateEnrichment(enrichment: EnrichmentResult): boolean {
  // Check elemental properties sum to ~1
  const elementalSum =
    enrichment.elementalProperties.Fire +
    enrichment.elementalProperties.Water +
    enrichment.elementalProperties.Earth +
    enrichment.elementalProperties.Air;

  if (elementalSum < 0.99 || elementalSum > 1.01) {
    return false;
  }

  // Check for valid planetary influences
  if (enrichment.planetaryInfluences.length === 0) {
    return false;
  }

  // Check for valid seasonal alignment
  if (enrichment.seasonalAlignment.length === 0) {
    return false;
  }

  return true;
}

/**
 * Calculate statistics from enrichment results
 */
function calculateEnrichmentStats(
  results: Map<string, EnrichmentResult>,
): EnrichmentStats {
  const stats: EnrichmentStats = {
    avgConfidenceScore: 0,
    elementalDistribution: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    planetaryInfluenceCounts: {},
    seasonalCounts: {},
    cuisineCounts: {},
    mealTypeCounts: {},
  };

  let totalConfidence = 0;
  let count = 0;

  for (const [_, enrichment] of results) {
    count++;
    totalConfidence += enrichment.enrichmentMetadata.confidenceScore;

    // Aggregate elemental distribution
    stats.elementalDistribution.Fire += enrichment.elementalProperties.Fire;
    stats.elementalDistribution.Water += enrichment.elementalProperties.Water;
    stats.elementalDistribution.Earth += enrichment.elementalProperties.Earth;
    stats.elementalDistribution.Air += enrichment.elementalProperties.Air;

    // Count planetary influences
    for (const planet of enrichment.planetaryInfluences) {
      stats.planetaryInfluenceCounts[planet] =
        (stats.planetaryInfluenceCounts[planet] || 0) + 1;
    }

    // Count seasons
    for (const season of enrichment.seasonalAlignment) {
      stats.seasonalCounts[season] = (stats.seasonalCounts[season] || 0) + 1;
    }

    // Count meal types
    for (const mealType of enrichment.mealTypes) {
      stats.mealTypeCounts[mealType] =
        (stats.mealTypeCounts[mealType] || 0) + 1;
    }
  }

  if (count > 0) {
    stats.avgConfidenceScore = totalConfidence / count;
    stats.elementalDistribution.Fire /= count;
    stats.elementalDistribution.Water /= count;
    stats.elementalDistribution.Earth /= count;
    stats.elementalDistribution.Air /= count;
  }

  return stats;
}

// ============================================================================
// Recipe Application
// ============================================================================

/**
 * Apply enrichment results to recipes, returning updated recipes
 */
export function applyBatchEnrichment(
  recipes: Array<Partial<Recipe>>,
  enrichmentResults: BatchEnrichmentResult,
): Recipe[] {
  const enricher = RecipeDataEnricher.getInstance();
  const enrichedRecipes: Recipe[] = [];

  for (const recipe of recipes) {
    const recipeId = recipe.id ?? recipe.name ?? "";
    const enrichment = enrichmentResults.results.get(recipeId);

    if (enrichment) {
      enrichedRecipes.push(enricher.applyEnrichment(recipe, enrichment));
    } else {
      // Keep original recipe with minimal defaults
      enrichedRecipes.push({
        id: recipeId,
        name: recipe.name ?? "Unnamed Recipe",
        description: recipe.description ?? "",
        cuisine: recipe.cuisine ?? "Various",
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
        elementalProperties: recipe.elementalProperties ?? {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
        },
        ...recipe,
      });
    }
  }

  return enrichedRecipes;
}

// ============================================================================
// Cuisine File Processing
// ============================================================================

/**
 * Extract recipes from a cuisine object structure
 */
export function extractRecipesFromCuisine(
  cuisineData: unknown,
): Array<Partial<Recipe>> {
  if (!isRecord(cuisineData)) return [];

  const recipes: Array<Partial<Recipe>> = [];
  const cuisineName =
    typeof cuisineData.name === "string"
      ? cuisineData.name
      : typeof cuisineData.id === "string"
        ? cuisineData.id
        : "Unknown";

  // Handle dishes object structure (breakfast, lunch, dinner, etc.)
  if (isRecord(cuisineData.dishes)) {
    for (const [mealType, mealData] of Object.entries(cuisineData.dishes)) {
      const dishArray =
        isRecord(mealData) && Array.isArray(mealData.all)
          ? mealData.all
          : mealData;
      if (!Array.isArray(dishArray)) continue;

      for (const dish of dishArray) {
        const recipe = addCuisineDefaults(dish, cuisineName, mealType);
        if (recipe) recipes.push(recipe);
      }
    }
  }

  // Handle direct recipes array
  if (Array.isArray(cuisineData.recipes)) {
    for (const recipeData of cuisineData.recipes) {
      const recipe = addCuisineDefaults(recipeData, cuisineName);
      if (recipe) recipes.push(recipe);
    }
  }

  return recipes;
}

/**
 * Convert enriched recipe back to cuisine dish format
 */
export function convertToDisheFormat(
  recipe: Recipe,
  enrichment: EnrichmentResult,
): Record<string, unknown> {
  return {
    name: recipe.name,
    description: recipe.description,
    cuisine: recipe.cuisine,
    cookingMethods: recipe.cookingMethod,
    tools: recipe.equipmentNeeded,
    preparationSteps: recipe.instructions,
    ingredients: recipe.ingredients,
    substitutions: recipe.substitutions,
    servingSize: recipe.numberOfServings,
    allergens: recipe.allergens,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    culturalNotes: recipe.culturalNotes,
    pairingSuggestions: recipe.pairingSuggestions,
    dietaryInfo: recipe.dietaryInfo,
    spiceLevel: recipe.spiceLevel,
    nutrition: {
      calories: enrichment.nutritionEstimate.calories,
      protein: enrichment.nutritionEstimate.protein,
      carbs: enrichment.nutritionEstimate.carbs,
      fat: enrichment.nutritionEstimate.fat,
      fiber: enrichment.nutritionEstimate.fiber,
      ...recipe.nutrition,
    },
    season: enrichment.seasonalAlignment,
    mealType: enrichment.mealTypes,
    elementalProperties: enrichment.elementalProperties,
    astrologicalInfluences: enrichment.planetaryInfluences,
    flavorProfile: enrichment.flavorProfile,
  };
}

// ============================================================================
// Progress Reporter
// ============================================================================

export type ProgressCallback = (progress: {
  current: number;
  total: number;
  percent: number;
  currentRecipe?: string;
}) => void;

/**
 * Batch enrich with progress reporting
 */
export async function batchEnrichWithProgress(
  recipes: Array<Partial<Recipe>>,
  options: BatchEnrichmentOptions = {},
  onProgress?: ProgressCallback,
): Promise<BatchEnrichmentResult> {
  const {
    skipExisting = false,
    forceReenrich = false,
    validateAfter = true,
  } = options;

  const enricher = RecipeDataEnricher.getInstance();
  const results = new Map<string, EnrichmentResult>();
  const errorDetails = new Map<string, string>();

  let totalProcessed = 0;
  let enriched = 0;
  let skipped = 0;
  let errors = 0;
  const total = recipes.length;

  for (const recipe of recipes) {
    totalProcessed++;
    const recipeId = recipe.id ?? recipe.name ?? `recipe-${totalProcessed}`;

    // Report progress
    if (onProgress) {
      onProgress({
        current: totalProcessed,
        total,
        percent: Math.round((totalProcessed / total) * 100),
        currentRecipe: recipe.name,
      });
    }

    try {
      if (skipExisting && !forceReenrich && !enricher.needsEnrichment(recipe)) {
        skipped++;
        continue;
      }

      const enrichment = enricher.enrichRecipe(recipe);
      results.set(recipeId, enrichment);
      enriched++;

      if (validateAfter && !validateEnrichment(enrichment)) {
        logger.warn(`Enrichment validation failed for ${recipeId}`);
      }
    } catch (error) {
      errors++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      errorDetails.set(recipeId, errorMsg);
    }

    // Yield to event loop periodically
    if (totalProcessed % 100 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  const stats = calculateEnrichmentStats(results);

  return {
    totalProcessed,
    enriched,
    skipped,
    errors,
    results,
    errorDetails,
    stats,
  };
}

// ============================================================================
// Exports
// ============================================================================

export { validateEnrichment, calculateEnrichmentStats };
