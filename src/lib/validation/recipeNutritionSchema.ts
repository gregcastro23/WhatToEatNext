import { z } from "zod";
import type { NutritionalSummaryBase } from "@/types/nutrition";

/**
 * Preprocessor that converts null, empty string, or coercible numeric strings
 * into a number or undefined. Prevents legacy database rows with `null` or string-valued
 * optional metrics from failing the entire recipe's nutrition parse.
 */
const optionalMetric = z.preprocess((val) => {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string" && val.trim() !== "" && !Number.isNaN(Number(val))) {
    return Number(val);
  }
  return undefined;
}, z.number().optional());

export const RecipeNutritionSchema = z
  .object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: optionalMetric,
    sugar: optionalMetric,
    addedSugar: optionalMetric,
    sodium: optionalMetric,
    saturatedFat: optionalMetric,
    transFat: optionalMetric,
    monounsaturatedFat: optionalMetric,
    polyunsaturatedFat: optionalMetric,
    omega3: optionalMetric,
    omega6: optionalMetric,
    cholesterol: optionalMetric,
    vitaminA: optionalMetric,
    vitaminD: optionalMetric,
    vitaminE: optionalMetric,
    vitaminK: optionalMetric,
    vitaminC: optionalMetric,
    thiamin: optionalMetric,
    riboflavin: optionalMetric,
    niacin: optionalMetric,
    pantothenicAcid: optionalMetric,
    vitaminB6: optionalMetric,
    biotin: optionalMetric,
    folate: optionalMetric,
    vitaminB12: optionalMetric,
    choline: optionalMetric,
    calcium: optionalMetric,
    phosphorus: optionalMetric,
    magnesium: optionalMetric,
    potassium: optionalMetric,
    chloride: optionalMetric,
    iron: optionalMetric,
    zinc: optionalMetric,
    copper: optionalMetric,
    manganese: optionalMetric,
    selenium: optionalMetric,
    iodine: optionalMetric,
    chromium: optionalMetric,
    molybdenum: optionalMetric,
    fluoride: optionalMetric,
    alcohol: optionalMetric,
    caffeine: optionalMetric,
    water: optionalMetric,
    vitamins: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
    minerals: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
  })
  .passthrough();

export type RecipeNutritionWire = z.infer<typeof RecipeNutritionSchema>;

export type OptionalNutritionKey = keyof Omit<
  NutritionalSummaryBase,
  "calories" | "protein" | "carbs" | "fat"
>;

function isOptionalNutritionKey(k: string): k is OptionalNutritionKey {
  return (
    k in RecipeNutritionSchema.shape &&
    k !== "calories" &&
    k !== "protein" &&
    k !== "carbs" &&
    k !== "fat" &&
    k !== "vitamins" &&
    k !== "minerals"
  );
}

/**
 * Derived list of optional micronutrient keys dynamically read from
 * the schema shape to prevent hand-maintained duplicate lists from drifting.
 */
export const OPTIONAL_NUTRITION_KEYS: OptionalNutritionKey[] = Object.keys(
  RecipeNutritionSchema.shape,
).filter(isOptionalNutritionKey);

export function toDomainRecipeNutrition(wire: RecipeNutritionWire): NutritionalSummaryBase {
  const result: NutritionalSummaryBase = {
    calories: wire.calories,
    protein: wire.protein,
    carbs: wire.carbs,
    fat: wire.fat,
  };
  for (const k of OPTIONAL_NUTRITION_KEYS) {
    const val = wire[k];
    if (typeof val === "number") {
      result[k] = val;
    }
  }
  return result;
}
