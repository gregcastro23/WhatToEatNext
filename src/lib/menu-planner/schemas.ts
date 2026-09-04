/**
 * Shared Menu Planner Schemas
 *
 * Runtime validation and type inference for Menu Planner payloads across
 * API boundaries (routes, database serialization, client rehydration).
 *
 * @file src/lib/menu-planner/schemas.ts
 */

import { z } from "zod";
import {
  ELEMENT_TYPES,
  LUNAR_PHASES,
  ZODIAC_SIGNS,
  type CelestialPosition,
  type DailyNutritionTotals,
  type DayOfWeek,
  type ElementalProperties,
  type EnhancedRecipe,
  type GroceryItem,
  type MealSlot,
  type MealSlotSauce,
  type PlanetarySnapshot,
} from "@/types";
import type { WeeklyMenu } from "@/types/menuPlanner";

export const isoDateSchema = z.union([
  z.date(),
  z
    .string()
    .datetime({ offset: true })
    .transform((value) => new Date(value)),
]);

export const elementalPropertiesSchema: z.ZodType<ElementalProperties> = z
  .object({
    Fire: z.number().finite(),
    Water: z.number().finite(),
    Earth: z.number().finite(),
    Air: z.number().finite(),
  })
  .catchall(z.number().finite());

export const recipeIngredientSchema = z.union([
  z
    .string()
    .min(1)
    .transform((name) => ({
      name,
      amount: 1,
      unit: "each",
    })),
  z
    .object({
      name: z.string().min(1),
      amount: z.number().finite().optional().default(1),
      unit: z.string().optional().default("each"),
    })
    .passthrough(),
]);

export const enhancedRecipeSchema: z.ZodType<EnhancedRecipe> = z
  .object({
    id: z.string(),
    name: z.string(),
    title: z.string().optional(),
    ingredients: z.array(recipeIngredientSchema),
    instructions: z.array(z.string()),
    elementalProperties: elementalPropertiesSchema,
  })
  .passthrough()
  .transform((recipe) => ({
    ...recipe,
    title: recipe.title ?? recipe.name,
  }));

export const celestialPositionSchema: z.ZodType<CelestialPosition> = z.object({
  sign: z.string().optional(),
  degree: z.number().finite().optional(),
  exactLongitude: z.number().finite().optional(),
  isRetrograde: z.boolean().optional(),
  retrogradeSymbol: z.string().optional(),
  minute: z.number().finite().optional(),
  minutes: z.number().finite().optional(),
  speed: z.number().finite().optional(),
  longitudeSpeed: z.number().finite().optional(),
  arcminutesPerDay: z.number().finite().optional(),
  speedDisplay: z.string().optional(),
  element: z.enum(ELEMENT_TYPES).optional(),
  dignity: z
    .enum(["Domicile", "Exaltation", "Detriment", "Fall", "Neutral"])
    .optional(),
});

export const planetaryPositionsSchema: z.ZodType<
  NonNullable<PlanetarySnapshot["planetaryPositions"]>
> = z
  .object({
    dominantPlanet: z.string().optional(),
  })
  .catchall(celestialPositionSchema);

export const planetarySnapshotSchema: z.ZodType<PlanetarySnapshot> = z.object({
  dominantPlanet: z.string(),
  zodiacSign: z.enum(ZODIAC_SIGNS),
  lunarPhase: z.enum(LUNAR_PHASES),
  elementalState: elementalPropertiesSchema,
  planetaryPositions: planetaryPositionsSchema.optional(),
  timestamp: isoDateSchema,
});

export const mealSlotSauceSchema: z.ZodType<MealSlotSauce> = z.object({
  id: z.string(),
  name: z.string(),
  servings: z.number().finite(),
  nutritionalProfile: z
    .object({
      calories: z.number().finite().optional(),
      protein: z.number().finite().optional(),
      carbs: z.number().finite().optional(),
      fat: z.number().finite().optional(),
      fiber: z.number().finite().optional(),
    })
    .optional(),
  elementalProperties: elementalPropertiesSchema.optional(),
  ingredients: z.array(z.string()).optional(),
});

export const mealSlotSchema: z.ZodType<MealSlot> = z.object({
  id: z.string(),
  dayOfWeek: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  recipe: enhancedRecipeSchema.optional(),
  servings: z.number().finite(),
  sauce: mealSlotSauceSchema.optional(),
  planetarySnapshot: planetarySnapshotSchema,
  notes: z.string().optional(),
  isLocked: z.boolean().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const dailyNutritionTotalsSchema: z.ZodType<DailyNutritionTotals> = z.object({
  calories: z.number().finite(),
  protein: z.number().finite(),
  carbs: z.number().finite(),
  fat: z.number().finite(),
  fiber: z.number().finite(),
  sodium: z.number().finite(),
  sugar: z.number().finite(),
  gregsEnergy: z.number().finite(),
  monicaConstant: z.number().finite().optional(),
  kalchm: z.number().finite(),
  elementalBalance: elementalPropertiesSchema,
});

// The refine proves every key present is a DayOfWeek; it does not prove all
// seven are present, so the honest output type is a Partial record.
export const nutritionalTotalsSchema = z
  .record(z.string(), dailyNutritionTotalsSchema)
  .refine(
    (totals) => Object.keys(totals).every((day) => /^[0-6]$/.test(day)),
    "Nutrition totals contain an invalid day",
  )
  .transform(
    (totals): Partial<Record<DayOfWeek, DailyNutritionTotals>> => totals,
  );

export const groceryItemSchema: z.ZodType<GroceryItem> = z.object({
  id: z.string(),
  ingredient: z.string(),
  quantity: z.number().finite(),
  unit: z.string(),
  category: z.string(),
  inPantry: z.boolean(),
  purchased: z.boolean(),
  usedInRecipes: z.array(z.string()),
  notes: z.string().optional(),
});

export const menuPutBodySchema = z.object({
  weekStartDate: isoDateSchema,
  meals: z.array(mealSlotSchema).default([]),
  nutritionalTotals: nutritionalTotalsSchema.default(() => ({})),
  groceryList: z.array(groceryItemSchema).default([]),
  inventory: z.array(z.string()).default([]),
  weeklyBudget: z.number().finite().nullable().default(null),
});

export const savedMenuSchema = z
  .object({
    id: z.string(),
    weekStartDate: isoDateSchema,
    weekEndDate: isoDateSchema.optional(),
    meals: z.array(mealSlotSchema).default([]),
    nutritionalTotals: z
      .record(z.string(), dailyNutritionTotalsSchema)
      .default({}),
    groceryList: z.array(groceryItemSchema).default([]),
    inventory: z.array(z.string()).default([]),
    weeklyBudget: z.number().finite().nullable().default(null),
    isTemplate: z.boolean().optional(),
    savedAsTemplate: z.boolean().optional(),
    templateName: z.string().nullable().optional(),
    createdAt: isoDateSchema.optional(),
    updatedAt: isoDateSchema.optional(),
  })
  .passthrough()
  .transform(
    (
      menu,
    ): WeeklyMenu & {
      weeklyBudget: number | null;
      inventory: string[];
      isTemplate?: boolean;
      templateName?: string | null;
    } => {
      const { weekStartDate } = menu;
      const weekEndDate =
        menu.weekEndDate ??
        new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      return {
        ...menu,
        weekStartDate,
        weekEndDate,
        savedAsTemplate: menu.savedAsTemplate ?? menu.isTemplate ?? false,
        templateName: menu.templateName ?? undefined,
        createdAt: menu.createdAt ?? new Date(),
        updatedAt: menu.updatedAt ?? new Date(),
        weeklyBudget: menu.weeklyBudget ?? null,
        nutritionalTotals:
          menu.nutritionalTotals as Record<DayOfWeek, DailyNutritionTotals>,
      };
    },
  );

export const savedMenuApiDataSchema = z.object({
  success: z.boolean().optional(),
  menu: savedMenuSchema.nullable().optional(),
  message: z.string().optional(),
});

export type SavedMenuApiData = z.infer<typeof savedMenuApiDataSchema>;
