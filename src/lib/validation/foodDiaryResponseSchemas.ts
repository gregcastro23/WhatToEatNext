/**
 * Client-side validators for /api/food-diary responses.
 *
 * Replaces predicate-less `z.custom<FoodDiaryEntry>()` casts with schemas covering
 * consumed fields, drift-guarded against the server types.
 *
 * Stored database inspection notes (Phase 44 Target 4):
 * - `food_source`: DB enum (`02-food-diary-schema.sql`, `89-food-source-restaurant-search.sql`)
 *   carries quick, recipe, manual, barcode, favorite, custom, restaurant, search.
 *   Uses `FOOD_SOURCES` enum with fallback to "custom" on unreadable legacy values (e.g. 'manual').
 * - `meal_type`: DB enum carries breakfast, lunch, dinner, snack.
 *   Matches `MealType` ("breakfast" | "lunch" | "dinner" | "snack") 1-to-1.
 * - `serving_unit`: DB column is `VARCHAR(50) NOT NULL DEFAULT 'serving'`.
 *   Uses `SERVING_UNITS` with fallback to "serving" on unreadable/unstandardized units.
 *
 * @file src/lib/validation/foodDiaryResponseSchemas.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  FoodDiaryEntry,
  FoodDiaryNutrition,
  FoodRating,
  MoodTag,
  ServingSize,
  ServingUnit,
} from "@/types/foodDiary";
import { FOOD_SOURCES } from "@/types/foodSource";

// ─── Enums & Helpers ───────────────────────────────────────────────────────

export const SERVING_UNITS: readonly [ServingUnit, ...ServingUnit[]] = [
  "g",
  "oz",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "slice",
  "serving",
  "ml",
  "fl_oz",
];

export const FoodDiaryServingUnitSchema = z.enum(SERVING_UNITS).catch("serving");

export const FoodDiaryFoodSourceSchema = z.enum(FOOD_SOURCES).catch("custom");

// ─── Serving & Nutrition ───────────────────────────────────────────────────

export const FoodDiaryServingSchema = z.object({
  amount: z.number(),
  unit: FoodDiaryServingUnitSchema,
  grams: z.number(),
  description: z.string().exactOptional(),
});

type _ServingDrift = AssertTrue<ServerSatisfies<ServingSize, z.infer<typeof FoodDiaryServingSchema>>>;
type _ServingReader = AssertTrue<ServerSatisfies<z.infer<typeof FoodDiaryServingSchema>, ServingSize>>;

export const FoodDiaryNutritionSchema = z.custom<FoodDiaryNutrition>(
  (val): val is FoodDiaryNutrition =>
    typeof val === "object" &&
    val !== null &&
    !Array.isArray(val) &&
    Object.values(val).every(
      (v) => v === undefined || (typeof v === "number" && !Number.isNaN(v)),
    ),
  { message: "Expected valid nutrition object with numeric values" },
);

// ─── Core Entry ────────────────────────────────────────────────────────────

export const FoodDiaryEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  foodName: z.string(),
  foodSource: FoodDiaryFoodSourceSchema,
  sourceId: z.string().exactOptional(),
  brandName: z.string().exactOptional(),
  date: z.coerce.date(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  time: z.string(),
  serving: FoodDiaryServingSchema,
  quantity: z.number(),
  nutrition: FoodDiaryNutritionSchema,
  nutritionConfidence: z.enum(["high", "medium", "low"]).default("medium"),
  elementalProperties: z.object({
    Fire: z.number(),
    Water: z.number(),
    Earth: z.number(),
    Air: z.number(),
  }).exactOptional(),
  alchemicalProperties: z.object({
    Spirit: z.number(),
    Essence: z.number(),
    Matter: z.number(),
    Substance: z.number(),
  }).exactOptional(),
  rating: z.custom<FoodRating>((val) => typeof val === "number" && val >= 0 && val <= 5).exactOptional(),
  moodTags: z.array(z.custom<MoodTag>((val) => typeof val === "string")).exactOptional(),
  notes: z.string().exactOptional(),
  wouldEatAgain: z.boolean().exactOptional(),
  price: z.number().exactOptional(),
  store: z.string().exactOptional(),
  quality: z.string().exactOptional(),
  astrologicalContext: z.custom<NonNullable<FoodDiaryEntry["astrologicalContext"]>>(
    (val) => typeof val === "object" && val !== null,
  ).exactOptional(),
  isFavorite: z.boolean(),
  tags: z.array(z.string()).exactOptional(),
  imageUrl: z.string().exactOptional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FoodDiaryEntryView = z.infer<typeof FoodDiaryEntrySchema>;

// Two-way compile-time drift assertions
type _FoodDiaryEntryDrift = AssertTrue<ServerSatisfies<FoodDiaryEntry, FoodDiaryEntryView>>;
type _FoodDiaryEntryReader = AssertTrue<ServerSatisfies<FoodDiaryEntryView, FoodDiaryEntry>>;

// ─── Route Responses ───────────────────────────────────────────────────────

export const FoodDiaryListResponseSchema = z.object({
  success: z.boolean().exactOptional(),
  entries: z.array(FoodDiaryEntrySchema).exactOptional(),
  count: z.number().exactOptional(),
  summary: z.object({
    totalCalories: z.number(),
    totalProtein: z.number(),
    totalCarbs: z.number(),
    totalFat: z.number(),
  }).exactOptional(),
  message: z.string().exactOptional(),
});

export type FoodDiaryListResponseView = z.infer<typeof FoodDiaryListResponseSchema>;

export const FoodDiaryMutationResponseSchema = z.object({
  success: z.boolean().exactOptional(),
  entry: FoodDiaryEntrySchema.exactOptional(),
  message: z.string().exactOptional(),
});

export type FoodDiaryMutationResponseView = z.infer<typeof FoodDiaryMutationResponseSchema>;
