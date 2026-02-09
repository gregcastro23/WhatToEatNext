"use client";

/**
 * RecipeNutritionModal
 * Full nutrition facts modal with FDA-style layout, DV%, ingredient breakdowns,
 * and compliance impact analysis.
 */

import React, { useMemo } from "react";
import type { Recipe, IngredientMapping } from "@/types/recipe";
import type {
  NutritionalSummary,
  WeeklyNutritionResult,
} from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";
import { formatNutrientName } from "@/utils/nutritionAggregation";

interface RecipeNutritionModalProps {
  recipe: Recipe;
  servings?: number;
  isOpen: boolean;
  onClose: () => void;
  ingredientMapping: IngredientMapping;
}

/** FDA Daily Values (2000 cal reference diet) */
const DAILY_VALUES: Partial<
  Record<keyof NutritionalSummary, { value: number; unit: string }>
> = {
  calories: { value: 2000, unit: "kcal" },
  fat: { value: 78, unit: "g" },
  saturatedFat: { value: 20, unit: "g" },
  transFat: { value: 0, unit: "g" },
  cholesterol: { value: 300, unit: "mg" },
  sodium: { value: 2300, unit: "mg" },
  carbs: { value: 275, unit: "g" },
  fiber: { value: 28, unit: "g" },
  sugar: { value: 50, unit: "g" },
  protein: { value: 50, unit: "g" },
  vitaminA: { value: 900, unit: "mcg" },
  vitaminC: { value: 90, unit: "mg" },
  vitaminD: { value: 20, unit: "mcg" },
  vitaminE: { value: 15, unit: "mg" },
  vitaminK: { value: 120, unit: "mcg" },
  thiamin: { value: 1.2, unit: "mg" },
  riboflavin: { value: 1.3, unit: "mg" },
  niacin: { value: 16, unit: "mg" },
  vitaminB6: { value: 1.7, unit: "mg" },
  folate: { value: 400, unit: "mcg" },
  vitaminB12: { value: 2.4, unit: "mcg" },
  calcium: { value: 1300, unit: "mg" },
  iron: { value: 18, unit: "mg" },
  magnesium: { value: 420, unit: "mg" },
  phosphorus: { value: 1250, unit: "mg" },
  potassium: { value: 4700, unit: "mg" },
  zinc: { value: 11, unit: "mg" },
};

const MACRO_DISPLAY: Array<{
  key: keyof NutritionalSummary;
  label: string;
  unit: string;
  bold?: boolean;
  indent?: boolean;
}> = [
  { key: "fat", label: "Total Fat", unit: "g", bold: true },
  { key: "saturatedFat", label: "Saturated Fat", unit: "g", indent: true },
  { key: "transFat", label: "Trans Fat", unit: "g", indent: true },
  { key: "cholesterol", label: "Cholesterol", unit: "mg", bold: true },
  { key: "sodium", label: "Sodium", unit: "mg", bold: true },
  { key: "carbs", label: "Total Carbohydrate", unit: "g", bold: true },
  { key: "fiber", label: "Dietary Fiber", unit: "g", indent: true },
  { key: "sugar", label: "Total Sugars", unit: "g", indent: true },
  { key: "protein", label: "Protein", unit: "g", bold: true },
];

const MICRO_DISPLAY: Array<{
  key: keyof NutritionalSummary;
  label: string;
  unit: string;
}> = [
  { key: "vitaminA", label: "Vitamin A", unit: "mcg" },
  { key: "vitaminC", label: "Vitamin C", unit: "mg" },
  { key: "vitaminD", label: "Vitamin D", unit: "mcg" },
  { key: "vitaminE", label: "Vitamin E", unit: "mg" },
  { key: "vitaminK", label: "Vitamin K", unit: "mcg" },
  { key: "thiamin", label: "Thiamin", unit: "mg" },
  { key: "riboflavin", label: "Riboflavin", unit: "mg" },
  { key: "niacin", label: "Niacin", unit: "mg" },
  { key: "vitaminB6", label: "Vitamin B6", unit: "mg" },
  { key: "folate", label: "Folate", unit: "mcg" },
  { key: "vitaminB12", label: "Vitamin B12", unit: "mcg" },
  { key: "calcium", label: "Calcium", unit: "mg" },
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "magnesium", label: "Magnesium", unit: "mg" },
  { key: "phosphorus", label: "Phosphorus", unit: "mg" },
  { key: "potassium", label: "Potassium", unit: "mg" },
  { key: "zinc", label: "Zinc", unit: "mg" },
];

function extractFullNutrition(
  recipe: Recipe,
  servings: number,
): NutritionalSummary {
  const base = createEmptyNutritionalSummary();
  const n = recipe.nutrition;
  if (!n) return base;

  base.calories = (n.calories ?? 0) * servings;
  base.protein = (n.protein ?? 0) * servings;
  base.carbs = (n.carbs ?? 0) * servings;
  base.fat = (n.fat ?? 0) * servings;
  base.fiber = (n.fiber ?? 0) * servings;

  base.vitaminA = (n.vitaminA ?? 0) * servings;
  base.vitaminD = (n.vitaminD ?? 0) * servings;
  base.vitaminE = (n.vitaminE ?? 0) * servings;
  base.vitaminK = (n.vitaminK ?? 0) * servings;
  base.vitaminC = (n.vitaminC ?? 0) * servings;
  base.thiamin = (n.thiamin ?? 0) * servings;
  base.riboflavin = (n.riboflavin ?? 0) * servings;
  base.niacin = (n.niacin ?? 0) * servings;
  base.pantothenicAcid = (n.pantothenicAcid ?? 0) * servings;
  base.vitaminB6 = (n.vitaminB6 ?? 0) * servings;
  base.biotin = (n.biotin ?? 0) * servings;
  base.folate = (n.folate ?? 0) * servings;
  base.vitaminB12 = (n.vitaminB12 ?? 0) * servings;
  base.choline = (n.choline ?? 0) * servings;

  base.calcium = (n.calcium ?? 0) * servings;
  base.phosphorus = (n.phosphorus ?? 0) * servings;
  base.magnesium = (n.magnesium ?? 0) * servings;
  base.sodium = (n.sodium ?? 0) * servings;
  base.potassium = (n.potassium ?? 0) * servings;
  base.iron = (n.iron ?? 0) * servings;
  base.zinc = (n.zinc ?? 0) * servings;
  base.chloride = (n.chloride ?? 0) * servings;
  base.copper = (n.copper ?? 0) * servings;
  base.manganese = (n.manganese ?? 0) * servings;
  base.selenium = (n.selenium ?? 0) * servings;
  base.iodine = (n.iodine ?? 0) * servings;
  base.chromium = (n.chromium ?? 0) * servings;
  base.molybdenum = (n.molybdenum ?? 0) * servings;
  base.fluoride = (n.fluoride ?? 0) * servings;

  return base;
}

function dvPercent(
  actual: number,
  key: keyof NutritionalSummary,
): number | null {
  const dv = DAILY_VALUES[key];
  if (!dv || dv.value <= 0) return null;
  return Math.round((actual / dv.value) * 100);
}

function dvColor(pct: number): string {
  if (pct >= 20) return "text-green-700 font-semibold";
  if (pct >= 10) return "text-yellow-700";
  return "text-gray-500";
}

export function RecipeNutritionModal({
  recipe,
  servings = 1,
  isOpen,
  onClose,
  ingredientMapping,
}: RecipeNutritionModalProps) {
  const nutrition = useMemo(
    () => extractFullNutrition(recipe, servings),
    [recipe, servings],
  );

  if (!isOpen) return null;

  const hasNutrition = nutrition.calories > 0 || nutrition.protein > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="p-4 border-b-2 border-gray-800 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
            {recipe.cuisine && (
              <p className="text-sm text-gray-500">{recipe.cuisine}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close nutrition modal"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-4">
          {!hasNutrition ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No nutrition data available</p>
              <p className="text-sm">
                Nutrition information has not been added to this recipe yet.
              </p>
            </div>
          ) : (
            <>
              {/* FDA-style Nutrition Facts */}
              <div className="border-2 border-gray-900 p-3 mb-4">
                <h3 className="text-2xl font-black text-gray-900 mb-1">
                  Nutrition Facts
                </h3>
                {servings > 1 && (
                  <p className="text-sm text-gray-600 mb-1">
                    {servings} servings
                  </p>
                )}
                {recipe.servingSize && (
                  <p className="text-sm text-gray-600">
                    Serving size: {recipe.servingSize}
                  </p>
                )}

                <div className="border-t-8 border-gray-900 mt-2 pt-1">
                  {/* Calories */}
                  <div className="flex justify-between items-baseline border-b border-gray-300 py-1">
                    <span className="text-lg font-black">Calories</span>
                    <span className="text-2xl font-black font-mono">
                      {Math.round(nutrition.calories)}
                    </span>
                  </div>

                  <div className="text-right text-xs font-semibold text-gray-600 py-0.5 border-b border-gray-900">
                    % Daily Value*
                  </div>

                  {/* Macronutrients */}
                  {MACRO_DISPLAY.map(({ key, label, unit, bold, indent }) => {
                    const val = nutrition[key];
                    if (typeof val !== "number") return null;
                    const pct = dvPercent(val, key);
                    return (
                      <div
                        key={key}
                        className={`flex justify-between py-0.5 border-b border-gray-200 ${indent ? "pl-4" : ""}`}
                      >
                        <span className={`text-sm ${bold ? "font-bold" : ""}`}>
                          {label}{" "}
                          <span className="font-mono">
                            {Math.round(val)}
                            {unit}
                          </span>
                        </span>
                        {pct !== null && (
                          <span className={`text-sm font-mono ${dvColor(pct)}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Vitamins & Minerals */}
                <div className="border-t-4 border-gray-900 mt-1 pt-1">
                  {MICRO_DISPLAY.map(({ key, label, unit }) => {
                    const val = nutrition[key];
                    if (typeof val !== "number" || val === 0) return null;
                    const pct = dvPercent(val, key);
                    return (
                      <div
                        key={key}
                        className="flex justify-between py-0.5 border-b border-gray-100"
                      >
                        <span className="text-sm">
                          {label}{" "}
                          <span className="font-mono text-gray-600">
                            {val < 1 ? val.toFixed(1) : Math.round(val)}
                            {unit}
                          </span>
                        </span>
                        {pct !== null && (
                          <span className={`text-sm font-mono ${dvColor(pct)}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  * Percent Daily Values based on a 2,000 calorie diet.
                </p>
              </div>

              {/* Ingredient Contributions */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Ingredients ({recipe.ingredients.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {recipe.ingredients.map((ing, idx) => {
                      const masterIngredient = ingredientMapping[ing.name];
                      const ingredientNutrition =
                        masterIngredient?.nutritionalProfile;
                      const hasIngredientNutrition =
                        ingredientNutrition &&
                        (ingredientNutrition.protein > 0 ||
                          ingredientNutrition.carbs > 0 ||
                          ingredientNutrition.fat > 0 ||
                          ingredientNutrition.calories > 0);

                      const totalIngredientCalories = ingredientNutrition
                        ? (ingredientNutrition.calories *
                            ing.amount *
                            servings) /
                          (masterIngredient?.servingSize || 1)
                        : 0;
                      const totalIngredientProtein = ingredientNutrition
                        ? (ingredientNutrition.protein *
                            ing.amount *
                            servings) /
                          (masterIngredient?.servingSize || 1)
                        : 0;
                      const totalIngredientSodium = ingredientNutrition
                        ? (ingredientNutrition.sodium * ing.amount * servings) /
                          (masterIngredient?.servingSize || 1)
                        : 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>
                            {ing.amount * servings} {ing.unit} {ing.name}
                          </span>
                          {ing.optional && (
                            <span className="text-xs text-gray-400">
                              (optional)
                            </span>
                          )}
                          {hasIngredientNutrition && (
                            <span className="text-xs text-gray-500 ml-auto">
                              ({Math.round(totalIngredientCalories)} kcal,{" "}
                              {Math.round(totalIngredientProtein)}g P,{" "}
                              {Math.round(totalIngredientSodium)}mg Na)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
