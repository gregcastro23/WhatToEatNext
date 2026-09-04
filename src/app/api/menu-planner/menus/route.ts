import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import {
  LUNAR_PHASES,
  ZODIAC_SIGNS,
  type DailyNutritionTotals,
  type DayOfWeek,
  type CelestialPosition,
  ELEMENT_TYPES,
  type ElementalProperties,
  type EnhancedRecipe,
  type GroceryItem,
  type MealSlot,
  type MealSlotSauce,
  type PlanetarySnapshot,
} from "@/types";
import type { NextRequest } from "next/server";

const isoDateSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

const elementalPropertiesSchema: z.ZodType<ElementalProperties> = z
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

const enhancedRecipeSchema: z.ZodType<EnhancedRecipe> = z
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

const celestialPositionSchema: z.ZodType<CelestialPosition> = z.object({
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

const planetaryPositionsSchema: z.ZodType<
  NonNullable<PlanetarySnapshot["planetaryPositions"]>
> = z
  .object({
    dominantPlanet: z.string().optional(),
  })
  .catchall(celestialPositionSchema);

const planetarySnapshotSchema: z.ZodType<PlanetarySnapshot> = z.object({
  dominantPlanet: z.string(),
  zodiacSign: z.enum(ZODIAC_SIGNS),
  lunarPhase: z.enum(LUNAR_PHASES),
  elementalState: elementalPropertiesSchema,
  planetaryPositions: planetaryPositionsSchema.optional(),
  timestamp: isoDateSchema,
});

const mealSlotSauceSchema: z.ZodType<MealSlotSauce> = z.object({
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

const mealSlotSchema: z.ZodType<MealSlot> = z.object({
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

const dailyNutritionTotalsSchema: z.ZodType<DailyNutritionTotals> = z.object({
  calories: z.number().finite(),
  protein: z.number().finite(),
  carbs: z.number().finite(),
  fat: z.number().finite(),
  fiber: z.number().finite(),
  sodium: z.number().finite(),
  sugar: z.number().finite(),
  gregsEnergy: z.number().finite(),
  monicaConstant: z.number().finite(),
  kalchm: z.number().finite(),
  elementalBalance: elementalPropertiesSchema,
});

// The refine proves every key present is a DayOfWeek; it does not prove all
// seven are present, so the honest output type is a Partial record.
const nutritionalTotalsSchema = z
  .record(z.string(), dailyNutritionTotalsSchema)
  .refine(
    (totals) => Object.keys(totals).every((day) => /^[0-6]$/.test(day)),
    "Nutrition totals contain an invalid day",
  )
  .transform(
    (totals): Partial<Record<DayOfWeek, DailyNutritionTotals>> => totals,
  );

const groceryItemSchema: z.ZodType<GroceryItem> = z.object({
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

const menuPutBodySchema = z.object({
  weekStartDate: isoDateSchema,
  meals: z.array(mealSlotSchema).default([]),
  nutritionalTotals: nutritionalTotalsSchema.default(() => ({})),
  groceryList: z.array(groceryItemSchema).default([]),
  inventory: z.array(z.string()).default([]),
  weeklyBudget: z.number().finite().nullable().default(null),
});

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const weekStartDateParam = searchParams.get("weekStartDate");
    if (!weekStartDateParam) {
      return NextResponse.json(
        { success: false, message: "weekStartDate is required" },
        { status: 400 },
      );
    }

    const weekStartDate = new Date(weekStartDateParam);
    if (Number.isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid weekStartDate" },
        { status: 400 },
      );
    }

    const menu = await menuPersistenceService.getMenu(userId, weekStartDate);
    return NextResponse.json({ success: true, menu });
  } catch (error) {
    _logger.error("Menu persistence GET error", error);
    return NextResponse.json(
      { success: false, message: "Failed to load weekly menu" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const parsedBody = menuPutBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }
    const {
      weekStartDate,
      meals,
      nutritionalTotals,
      groceryList,
      inventory,
      weeklyBudget,
    } = parsedBody.data;

    const persisted = await menuPersistenceService.upsertMenu(userId, {
      weekStartDate,
      meals,
      // UpsertMenuInput/PersistedWeeklyMenu/WeeklyMenu all declare a *total*
      // Record; widening is load-bearing until those three become Partial.
      nutritionalTotals: nutritionalTotals as unknown as Record<DayOfWeek, DailyNutritionTotals>,
      groceryList,
      inventory,
      weeklyBudget,
    });

    return NextResponse.json({ success: true, menu: persisted });
  } catch (error) {
    _logger.error("Menu persistence PUT error", error);
    return NextResponse.json(
      { success: false, message: "Failed to save weekly menu" },
      { status: 500 },
    );
  }
}
