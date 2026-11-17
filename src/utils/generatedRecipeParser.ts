/**
 * Wire parser for GET /api/recipes/custom?id=..., read by the generated-recipe
 * page (`src/app/(alchm)/generated-recipe/[id]/page.tsx`).
 *
 * Producer: `src/app/api/recipes/custom/route.ts:39-47` answers
 * `{ success: true, recipe: { id, name, cuisine?, notes?, ...row.payload } }`;
 * 400 / 404 / 500 answer `{ error }` and are non-ok, so the page throws before
 * parsing. `payload` is the JSONB column of `user_custom_recipes`, written by
 * several producers (`users/me/recipes/custom/route.ts`, `internal/agent-recipes/route.ts`,
 * `lib/recipes/savedAdaptationPersistence.ts`, scanned recipes). Only the
 * generator (`CosmicRecipeGenerator.tsx` `mapCosmicToStoreRecipe`, and the recipe
 * builder's suggestions) writes the whole `MonicaOptimizedRecipe` shape.
 *
 * Validated: exactly what the page reads. The page reads `monicaOptimization`,
 * `seasonalAdaptation` and `cuisineIntegration` WITHOUT guards (page.tsx, the
 * "Derived data" block), so a payload without them cannot render; it throws here,
 * into the page's catch, and the page shows not-found instead of a render-time
 * TypeError.
 *
 * NOTHING ELSE IS DROPPED. The page's Like handler POSTs the whole recipe back
 * (`payload: recipe`), so a copy narrowed to the validated fields would silently
 * truncate saved recipes. Every record here spreads the raw object first and lays
 * the validated fields over it; unvalidated keys stay in the value, typed away.
 * `null` is accepted wherever the page already tolerates it (`??`, `&&`).
 */

import { isJsonRecord } from "@/lib/api/json";
import {
  elementValues,
  invalid,
  isFiniteNumber,
  optionalCount,
  optionalNumber,
  optionalText,
  requireId,
  requireRecord,
  requireText,
  stringList,
  type ElementValues,
} from "@/utils/generatedRecipePrimitives";

export interface GeneratedIngredient {
  /** `null` is kept as sent (the page keys rows by `id ?? index`). */
  id?: string | number | null;
  name: string;
  amount?: number | string | null;
  unit?: string | null;
  elementalProperties?: ElementValues | null;
}

export interface GeneratedNutrition {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
}

export interface GeneratedRecipeView {
  id: string | number;
  name: string;
  cuisine?: string | null;
  description?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
  numberOfServings?: number | string | null;
  mealType?: string | string[] | null;
  ingredients: GeneratedIngredient[];
  instructions: string[];
  elementalProperties: ElementValues;
  nutrition?: GeneratedNutrition | null;
  alchemicalProperties?: { monicaConstant?: number | null } | null;
  monicaOptimization: {
    optimizedMonica: number;
    planetaryTimingRecommendations: string[];
    intensityModifications: string[];
  };
  seasonalAdaptation: {
    seasonalCookingMethodAdjustments: Array<{ method: string; adjustment: string; reason: string }>;
  };
  cuisineIntegration: { culturalNotes: string[] };
}

type OptionalFields = Partial<
  Pick<
    GeneratedRecipeView,
    | "cuisine"
    | "description"
    | "prepTime"
    | "cookTime"
    | "numberOfServings"
    | "mealType"
    | "nutrition"
    | "alchemicalProperties"
  >
>;

function parseIngredient(value: unknown, index: number): GeneratedIngredient {
  const path = `ingredients[${index}]`;
  const row = requireRecord(value, path);
  const id = row.id === undefined || row.id === null ? undefined : requireId(row.id, `${path}.id`);
  const amount = optionalCount(row.amount, `${path}.amount`);
  const unit = optionalText(row.unit, `${path}.unit`);
  const props = row.elementalProperties === undefined || row.elementalProperties === null
    ? row.elementalProperties
    : elementValues(row.elementalProperties, `${path}.elementalProperties`);
  return {
    ...row,
    name: requireText(row.name, `${path}.name`),
    ...(id !== undefined ? { id } : {}),
    ...(amount !== undefined ? { amount } : {}),
    ...(unit !== undefined ? { unit } : {}),
    ...(props !== undefined ? { elementalProperties: props } : {}),
  };
}

function parseIngredients(value: unknown): GeneratedIngredient[] {
  if (!Array.isArray(value)) throw invalid("ingredients must be an array");
  const rows: readonly unknown[] = value;
  return rows.map((row, index) => parseIngredient(row, index));
}

function parseMonicaOptimization(value: unknown): GeneratedRecipeView["monicaOptimization"] {
  const block = requireRecord(value, "monicaOptimization");
  const { optimizedMonica } = block;
  if (!isFiniteNumber(optimizedMonica)) throw invalid("monicaOptimization.optimizedMonica must be a finite number");
  return {
    ...block,
    optimizedMonica,
    planetaryTimingRecommendations: stringList(block.planetaryTimingRecommendations, "monicaOptimization.planetaryTimingRecommendations"),
    intensityModifications: stringList(block.intensityModifications, "monicaOptimization.intensityModifications"),
  };
}

function parseAdjustment(value: unknown, index: number): { method: string; adjustment: string; reason: string } {
  const path = `seasonalAdaptation.seasonalCookingMethodAdjustments[${index}]`;
  const row = requireRecord(value, path);
  return {
    ...row,
    method: requireText(row.method, `${path}.method`),
    adjustment: requireText(row.adjustment, `${path}.adjustment`),
    reason: requireText(row.reason, `${path}.reason`),
  };
}

function parseSeasonalAdaptation(value: unknown): GeneratedRecipeView["seasonalAdaptation"] {
  const block = requireRecord(value, "seasonalAdaptation");
  const rows = block.seasonalCookingMethodAdjustments;
  if (!Array.isArray(rows)) throw invalid("seasonalAdaptation.seasonalCookingMethodAdjustments must be an array");
  const list: readonly unknown[] = rows;
  return { ...block, seasonalCookingMethodAdjustments: list.map((row, index) => parseAdjustment(row, index)) };
}

function parseCuisineIntegration(value: unknown): GeneratedRecipeView["cuisineIntegration"] {
  const block = requireRecord(value, "cuisineIntegration");
  return { ...block, culturalNotes: stringList(block.culturalNotes, "cuisineIntegration.culturalNotes") };
}

function parseMealType(value: unknown): string | string[] | null | undefined {
  if (value === undefined || value === null || typeof value === "string") return value;
  return stringList(value, "mealType");
}

function parseNutrition(value: unknown): GeneratedNutrition | null | undefined {
  if (value === undefined || value === null) return value;
  const block = requireRecord(value, "nutrition");
  const calories = optionalNumber(block.calories, "nutrition.calories");
  const protein = optionalNumber(block.protein, "nutrition.protein");
  const carbs = optionalNumber(block.carbs, "nutrition.carbs");
  const fat = optionalNumber(block.fat, "nutrition.fat");
  return {
    ...block,
    ...(calories !== undefined ? { calories } : {}),
    ...(protein !== undefined ? { protein } : {}),
    ...(carbs !== undefined ? { carbs } : {}),
    ...(fat !== undefined ? { fat } : {}),
  };
}

function parseAlchemicalProperties(value: unknown): { monicaConstant?: number | null } | null | undefined {
  if (value === undefined || value === null) return value;
  const block = requireRecord(value, "alchemicalProperties");
  const monicaConstant = optionalNumber(block.monicaConstant, "alchemicalProperties.monicaConstant");
  return { ...block, ...(monicaConstant !== undefined ? { monicaConstant } : {}) };
}

function parseOptionalFields(raw: Record<string, unknown>): OptionalFields {
  const cuisine = optionalText(raw.cuisine, "cuisine");
  const description = optionalText(raw.description, "description");
  const prepTime = optionalText(raw.prepTime, "prepTime");
  const cookTime = optionalText(raw.cookTime, "cookTime");
  const numberOfServings = optionalCount(raw.numberOfServings, "numberOfServings");
  const mealType = parseMealType(raw.mealType);
  const nutrition = parseNutrition(raw.nutrition);
  const alchemicalProperties = parseAlchemicalProperties(raw.alchemicalProperties);
  return {
    ...(cuisine !== undefined ? { cuisine } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(prepTime !== undefined ? { prepTime } : {}),
    ...(cookTime !== undefined ? { cookTime } : {}),
    ...(numberOfServings !== undefined ? { numberOfServings } : {}),
    ...(mealType !== undefined ? { mealType } : {}),
    ...(nutrition !== undefined ? { nutrition } : {}),
    ...(alchemicalProperties !== undefined ? { alchemicalProperties } : {}),
  };
}

function parseGeneratedRecipe(raw: Record<string, unknown>): GeneratedRecipeView {
  return {
    ...raw,
    id: requireId(raw.id, "id"),
    name: requireText(raw.name, "name"),
    ingredients: parseIngredients(raw.ingredients),
    instructions: stringList(raw.instructions, "instructions"),
    elementalProperties: elementValues(raw.elementalProperties, "elementalProperties"),
    monicaOptimization: parseMonicaOptimization(raw.monicaOptimization),
    seasonalAdaptation: parseSeasonalAdaptation(raw.seasonalAdaptation),
    cuisineIntegration: parseCuisineIntegration(raw.cuisineIntegration),
    ...parseOptionalFields(raw),
  };
}

/**
 * `parse` for `readJson`. `null` means "the answer holds no recipe" (a body that
 * is not `success: true`, or has no `recipe`), which the page treats as not found.
 * A recipe the page cannot render throws.
 */
export function parseCustomRecipeResponse(value: unknown): GeneratedRecipeView | null {
  if (!isJsonRecord(value)) throw invalid("expected a JSON object");
  if (value.success !== true || value.recipe === undefined || value.recipe === null) return null;
  return parseGeneratedRecipe(requireRecord(value.recipe, "recipe"));
}

/**
 * `parse` for `safeReadJson` on `POST /api/users/me/recipes/custom`
 * (`src/app/api/users/me/recipes/custom/route.ts:268-273`). Never throws: a 2xx
 * POST has already written the row to `user_custom_recipes`.
 */
export function parseLikeCustomRecipeResponse(value: unknown): { wasExisting: boolean } {
  if (!isJsonRecord(value)) return { wasExisting: false };
  return { wasExisting: value.wasExisting === true };
}
