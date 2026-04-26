/**
 * API Response Zod Schemas
 *
 * Runtime validation schemas for internal Next.js API routes.
 * Use these at API boundaries to catch shape mismatches between
 * services at the earliest possible point rather than deep inside
 * React components.
 *
 * Usage:
 *   const result = RecipeApiResponseSchema.safeParse(await res.json());
 *   if (!result.success) throw new Error("Malformed recipe response");
 *   const { recipe } = result.data; // fully typed, no cast needed
 */

import { z } from "zod";

// ─── Elemental properties ────────────────────────────────────────────────────

export const ElementalPropertiesSchema = z.object({
  Fire: z.number().min(0).max(1),
  Water: z.number().min(0).max(1),
  Earth: z.number().min(0).max(1),
  Air: z.number().min(0).max(1),
});

// ─── Recipe ingredient ───────────────────────────────────────────────────────

export const RecipeIngredientSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  amount: z.number(),
  unit: z.string(),
  category: z.string().optional(),
  optional: z.boolean().optional(),
  preparation: z.string().optional(),
  notes: z.string().optional(),
  function: z.string().optional(),
  substitutes: z.array(z.string()).optional(),
  elementalProperties: ElementalPropertiesSchema.optional(),
}).passthrough(); // allow extra fields from alchemical data

// ─── Core Recipe schema ───────────────────────────────────────────────────────
// Validates the fields that route handlers and client components rely on.
// Uses .passthrough() so that additional alchemical/astrological fields
// from the database don't cause false-positive parse failures.

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema),
  instructions: z.array(z.string()),
  elementalProperties: ElementalPropertiesSchema,
  // Cooking methods exist under two possible keys in the wild
  cookingMethod: z.union([z.string(), z.array(z.string())]).optional(),
  cookingMethods: z.array(z.string()).optional(),
  mealType: z.union([z.string(), z.array(z.string())]).optional(),
  season: z.union([z.string(), z.array(z.string())]).optional(),
  timeToMake: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  servingSize: z.number().optional(),
  numberOfServings: z.number().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
}).passthrough();

export type ParsedRecipe = z.infer<typeof RecipeSchema>;

// ─── Recipe API response (/api/recipes/[recipeId]) ───────────────────────────

export const RecipeDetailResponseSchema = z.object({
  success: z.literal(true),
  recipe: RecipeSchema,
  recommendedSauces: z.array(z.unknown()).optional(),
  recommendedRecipes: z.array(RecipeSchema).optional(),
});

export type RecipeDetailResponse = z.infer<typeof RecipeDetailResponseSchema>;

// ─── Generic API error ────────────────────────────────────────────────────────

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─── Food Diary ───────────────────────────────────────────────────────────────

export const ServingSizeSchema = z.object({
  amount: z.number(),
  unit: z.string(),
  grams: z.number(),
  description: z.string().optional(),
});

export const CreateFoodDiaryEntrySchema = z.object({
  userId: z.string().optional(),
  foodName: z.string().min(1),
  foodSource: z.enum(["recipe", "custom", "barcode", "search", "quick", "favorite"]),
  sourceId: z.string().optional(),
  brandName: z.string().optional(),
  date: z.coerce.date(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  time: z.string(),
  serving: ServingSizeSchema,
  quantity: z.number().positive(),
  nutrition: z.record(z.string(), z.unknown()).optional(),
  elementalProperties: ElementalPropertiesSchema.optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type ParsedCreateFoodDiaryEntry = z.infer<typeof CreateFoodDiaryEntrySchema>;

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const BirthDataSchema = z.object({
  dateTime: z.string(), // ISO 8601 format
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional()
});

export const OnboardingRequestSchema = z.object({
  name: z.string().optional(),
  birthData: BirthDataSchema
});

export type ParsedOnboardingRequest = z.infer<typeof OnboardingRequestSchema>;

// ─── Alchm Quantities API (/api/alchm-quantities) ───────────────────────────

const EsmsQuantitiesSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

const EsmsKineticsSchema = z.object({
  Spirit: z.number(),
  Essence: z.number(),
  Matter: z.number(),
  Substance: z.number(),
});

const StatSummarySchema = z.object({
  mean: z.number(),
  variance: z.number(),
  stdDev: z.number()
});

const HistoricalContextSchema = z.object({
  timeframeDays: z.number(),
  dataPoints: z.number(),
  metrics: z.object({
    Spirit: StatSummarySchema,
    Essence: StatSummarySchema,
    Matter: StatSummarySchema,
    Substance: StatSummarySchema,
    heat: StatSummarySchema,
    entropy: StatSummarySchema,
    reactivity: StatSummarySchema,
    kalchm: StatSummarySchema,
    monica: StatSummarySchema,
    charge: StatSummarySchema,
    power: StatSummarySchema,
    currentFlow: StatSummarySchema,
  })
});

export const AlchmQuantitiesApiResponseSchema = z.object({
  success: z.literal(true),
  timestamp: z.string(),
  quantities: EsmsQuantitiesSchema.extend({
    ANumber: z.number(),
    DayEssence: z.number(),
    NightEssence: z.number(),
  }),
  dominantElement: z.string(),
  isDiurnal: z.boolean(),
  heat: z.number(),
  entropy: z.number(),
  reactivity: z.number(),
  energy: z.number(),
  kalchm: z.number(),
  monica: z.number(),
  kinetics: z.object({
    velocity: EsmsKineticsSchema,
    acceleration: EsmsKineticsSchema,
    momentum: EsmsKineticsSchema,
    reactivity: z.number(),
    entropy: z.number(),
    power: z.number(),
  }),
  circuit: z.object({
    charge: z.number(),
    potentialDifference: z.number(),
    currentFlow: z.number(),
    power: z.number(),
    inertia: z.number(),
    forceMagnitude: z.number(),
    forceClassification: z.enum(["accelerating", "decelerating", "balanced"]),
    thermalDirection: z.enum(["heating", "cooling", "stable"]),
    primaryElement: z.string(),
    elementalBalance: ElementalPropertiesSchema,
    esmsBalance: EsmsQuantitiesSchema,
  }),
  alchemical: EsmsQuantitiesSchema,
  planetaryMomentum: z.record(z.string(), z.number()),
  historicalContext: HistoricalContextSchema.optional(),
});

export type AlchmQuantitiesApiResponse = z.infer<
  typeof AlchmQuantitiesApiResponseSchema
>;

// ─── Helper: extract cooking methods normalised to string[] ──────────────────
// Replaces the `as unknown as Record<string, unknown>` dance in route handlers.

export function extractCookingMethods(recipe: ParsedRecipe): string[] {
  const raw = recipe.cookingMethods ?? recipe.cookingMethod;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr
    .map((m) =>
      typeof m === "string"
        ? m
        : typeof m === "object" && m !== null && "name" in m
          ? String((m as { name: unknown }).name)
          : "",
    )
    .filter(Boolean);
}
