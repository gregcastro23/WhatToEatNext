"use client";

/**
 * RecipeNutritionModal
 * Full nutrition facts modal with FDA-style layout, DV%, ingredient breakdowns,
 * and compliance impact analysis.
 */

import React from "react";
import type {
  NutritionalSummary,
  WeeklyNutritionResult as _WeeklyNutritionResult,
} from "@/types/nutrition";
import type { Recipe, IngredientMapping } from "@/types/recipe";
import { DailyValueFootnote, DailyValueLabelRows } from "./DailyValueRows";

interface RecipeNutritionModalProps {
  recipe: Recipe;
  servings?: number;
  isOpen: boolean;
  onClose: () => void;
  ingredientMapping: IngredientMapping;
}

/**
 * FDA Daily Values (2000 cal reference diet) for the rows shown as amounts.
 * Vitamins and minerals come as %DV from the ingredient data instead
 * (`DailyValueLabelRows`), because it records no amounts for them.
 */
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
  potassium: { value: 4700, unit: "mg" },
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

/** The recipe's published value for `servings`, or null: absent is not 0. */
function published(
  recipe: Recipe,
  key: keyof NutritionalSummary,
  servings: number,
): number | null {
  const value = recipe.nutrition?.[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value * servings
    : null;
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

/** One label row: "Sodium 480mg  21%", or "Cholesterol —" when unpublished. */
function AmountRow({ nutrient, label, unit, value, bold, indent }: {
  nutrient: keyof NutritionalSummary;
  label: string;
  unit: string;
  value: number | null;
  bold?: boolean;
  indent?: boolean;
}): React.JSX.Element {
  const pct = value === null ? null : dvPercent(value, nutrient);
  return (
    <div
      className={`flex justify-between py-0.5 border-b border-gray-200 ${indent ? "pl-4" : ""}`}
    >
      <span className={`text-sm ${bold ? "font-bold" : ""}`}>
        {label}{" "}
        <span className="font-mono">
          {value === null ? "—" : `${Math.round(value)}${unit}`}
        </span>
      </span>
      {pct !== null && (
        <span className={`text-sm font-mono ${dvColor(pct)}`}>{pct}%</span>
      )}
    </div>
  );
}

export function RecipeNutritionModal({
  recipe,
  servings = 1,
  isOpen,
  onClose,
  ingredientMapping,
}: RecipeNutritionModalProps) {
  if (!isOpen) return null;

  const calories = published(recipe, "calories", servings) ?? 0;
  const hasNutrition =
    calories > 0 || (published(recipe, "protein", servings) ?? 0) > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
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
                      {Math.round(calories)}
                    </span>
                  </div>

                  <div className="text-right text-xs font-semibold text-gray-600 py-0.5 border-b border-gray-900">
                    % Daily Value*
                  </div>

                  {/* Macronutrients */}
                  {MACRO_DISPLAY.map(({ key, label, unit, bold, indent }) => (
                    <AmountRow
                      key={key}
                      nutrient={key}
                      label={label}
                      unit={unit}
                      value={published(recipe, key, servings)}
                      bold={bold ?? false}
                      indent={indent ?? false}
                    />
                  ))}
                </div>

                {/* Vitamins & Minerals */}
                <div className="border-t-4 border-gray-900 mt-1 pt-1">
                  <AmountRow
                    nutrient="potassium"
                    label="Potassium"
                    unit="mg"
                    value={published(recipe, "potassium", servings)}
                  />
                  <div className="text-xs font-semibold text-gray-600 pt-1">
                    Vitamins &amp; minerals, % Daily Value†
                  </div>
                  <DailyValueLabelRows
                    nutrition={recipe.nutrition}
                    servings={servings}
                  />
                </div>

                <div className="mt-2 space-y-1">
                  <DailyValueFootnote />
                  <p className="text-xs text-gray-500">
                    * Percent Daily Values based on a 2,000 calorie diet.
                  </p>
                </div>
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
                            Number(ing.amount) *
                            servings) /
                          (masterIngredient?.servingSize ?? 1)
                        : 0;
                      const totalIngredientProtein = ingredientNutrition
                        ? (ingredientNutrition.protein *
                            Number(ing.amount) *
                            servings) /
                          (masterIngredient?.servingSize ?? 1)
                        : 0;
                      const totalIngredientSodium = ingredientNutrition
                        ? (ingredientNutrition.sodium *
                            Number(ing.amount) *
                            servings) /
                          (masterIngredient?.servingSize ?? 1)
                        : 0;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>
                            {Number(ing.amount) * servings} {ing.unit}{" "}
                            {ing.name}
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
