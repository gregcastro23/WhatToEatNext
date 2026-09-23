import { z } from "zod";
import type { NutritionalSummaryBase } from "@/types/nutrition";

export const RecipeNutritionSchema = z
  .object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    addedSugar: z.number().optional(),
    sodium: z.number().optional(),
    saturatedFat: z.number().optional(),
    transFat: z.number().optional(),
    monounsaturatedFat: z.number().optional(),
    polyunsaturatedFat: z.number().optional(),
    omega3: z.number().optional(),
    omega6: z.number().optional(),
    cholesterol: z.number().optional(),
    vitaminA: z.number().optional(),
    vitaminD: z.number().optional(),
    vitaminE: z.number().optional(),
    vitaminK: z.number().optional(),
    vitaminC: z.number().optional(),
    thiamin: z.number().optional(),
    riboflavin: z.number().optional(),
    niacin: z.number().optional(),
    pantothenicAcid: z.number().optional(),
    vitaminB6: z.number().optional(),
    biotin: z.number().optional(),
    folate: z.number().optional(),
    vitaminB12: z.number().optional(),
    choline: z.number().optional(),
    calcium: z.number().optional(),
    phosphorus: z.number().optional(),
    magnesium: z.number().optional(),
    potassium: z.number().optional(),
    chloride: z.number().optional(),
    iron: z.number().optional(),
    zinc: z.number().optional(),
    copper: z.number().optional(),
    manganese: z.number().optional(),
    selenium: z.number().optional(),
    iodine: z.number().optional(),
    chromium: z.number().optional(),
    molybdenum: z.number().optional(),
    fluoride: z.number().optional(),
    alcohol: z.number().optional(),
    caffeine: z.number().optional(),
    water: z.number().optional(),
    vitamins: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
    minerals: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
  })
  .passthrough();

export type RecipeNutritionWire = z.infer<typeof RecipeNutritionSchema>;

const OPTIONAL_NUTRITION_KEYS = [
  "fiber", "sugar", "addedSugar", "sodium", "saturatedFat", "transFat",
  "monounsaturatedFat", "polyunsaturatedFat", "omega3", "omega6", "cholesterol",
  "vitaminA", "vitaminD", "vitaminE", "vitaminK", "vitaminC", "thiamin",
  "riboflavin", "niacin", "pantothenicAcid", "vitaminB6", "biotin", "folate",
  "vitaminB12", "choline", "calcium", "phosphorus", "magnesium", "potassium",
  "chloride", "iron", "zinc", "copper", "manganese", "selenium", "iodine",
  "chromium", "molybdenum", "fluoride", "alcohol", "caffeine", "water",
] as const;

export function toDomainRecipeNutrition(wire: RecipeNutritionWire): NutritionalSummaryBase {
  const result: NutritionalSummaryBase = {
    calories: wire.calories,
    protein: wire.protein,
    carbs: wire.carbs,
    fat: wire.fat,
  };
  for (const k of OPTIONAL_NUTRITION_KEYS) {
    const val = wire[k];
    if (val !== undefined) {
      result[k] = val;
    }
  }
  return result;
}
