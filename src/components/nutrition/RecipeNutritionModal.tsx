"use client";

/**
 * RecipeNutritionModal
 * Full nutrition facts modal with FDA-style layout, DV%, ingredient breakdowns,
 * and compliance impact analysis.
 */

import React, { useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import type { NutritionalSummary, WeeklyNutritionResult } from "@/types/nutrition";
import { createEmptyNutritionalSummary } from "@/types/nutrition";
import { formatNutrientName } from "@/utils/nutritionAggregation";

interface RecipeNutritionModalProps {
  recipe: Recipe;
  servings?: number;
  isOpen: boolean;
  onClose: () => void;
  weeklyResult?: WeeklyNutritionResult | null;
}

/** FDA Daily Values (2000 cal reference diet) */
const DAILY_VALUES: Partial<Record<keyof NutritionalSummary, { value: number; unit: string }>> = {
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

const MACRO_DISPLAY: Array<{ key: keyof NutritionalSummary; label: string; unit: string; bold?: boolean; indent?: boolean }> = [
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

const MICRO_DISPLAY: Array<{ key: keyof NutritionalSummary; label: string; unit: string }> = [
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

function extractFullNutrition(recipe: Recipe, servings: number): NutritionalSummary {
  const base = createEmptyNutritionalSummary();
  const n = recipe.nutrition;
  if (!n) return base;

  base.calories = (n.calories ?? 0) * servings;
  base.protein = (n.protein ?? n.macronutrients?.protein ?? 0) * servings;
  base.carbs = (n.carbs ?? n.macronutrients?.carbs ?? 0) * servings;
  base.fat = (n.fat ?? n.macronutrients?.fat ?? 0) * servings;
  base.fiber = (n.macronutrients?.fiber ?? 0) * servings;

  if (n.micronutrients?.vitamins) {
    const v = n.micronutrients.vitamins;
    base.vitaminA = (v['vitaminA'] ?? v['A'] ?? 0) * servings;
    base.vitaminC = (v['vitaminC'] ?? v['C'] ?? 0) * servings;
    base.vitaminD = (v['vitaminD'] ?? v['D'] ?? 0) * servings;
    base.vitaminE = (v['vitaminE'] ?? v['E'] ?? 0) * servings;
    base.vitaminK = (v['vitaminK'] ?? v['K'] ?? 0) * servings;
    base.thiamin = (v['thiamin'] ?? v['B1'] ?? 0) * servings;
    base.riboflavin = (v['riboflavin'] ?? v['B2'] ?? 0) * servings;
    base.niacin = (v['niacin'] ?? v['B3'] ?? 0) * servings;
    base.vitaminB6 = (v['vitaminB6'] ?? v['B6'] ?? 0) * servings;
    base.folate = (v['folate'] ?? 0) * servings;
    base.vitaminB12 = (v['vitaminB12'] ?? v['B12'] ?? 0) * servings;
  }

  if (n.micronutrients?.minerals) {
    const m = n.micronutrients.minerals;
    base.calcium = (m['calcium'] ?? 0) * servings;
    base.iron = (m['iron'] ?? 0) * servings;
    base.magnesium = (m['magnesium'] ?? 0) * servings;
    base.phosphorus = (m['phosphorus'] ?? 0) * servings;
    base.potassium = (m['potassium'] ?? 0) * servings;
    base.sodium = (m['sodium'] ?? 0) * servings;
    base.zinc = (m['zinc'] ?? 0) * servings;
  }

  return base;
}

function dvPercent(actual: number, key: keyof NutritionalSummary): number | null {
  const dv = DAILY_VALUES[key];
  if (!dv || dv.value <= 0) return null;
  return Math.round((actual / dv.value) * 100);
}

function dvColor(pct: number): string {
  if (pct >= 20) return "text-green-700 font-semibold";
  if (pct >= 10) return "text-yellow-700";
  return "text-gray-500";
}

export default function RecipeNutritionModal({
  recipe,
  servings = 1,
  isOpen,
  onClose,
  weeklyResult,
}: RecipeNutritionModalProps) {
  const nutrition = useMemo(() => extractFullNutrition(recipe, servings), [recipe, servings]);

  if (!isOpen) return null;

  const hasNutrition = nutrition.calories > 0 || nutrition.protein > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="p-4 border-b-2 border-gray-800 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
            {recipe.cuisine && <p className="text-sm text-gray-500">{recipe.cuisine}</p>}
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
              <p className="text-sm">Nutrition information has not been added to this recipe yet.</p>
            </div>
          ) : (
            <>
              {/* FDA-style Nutrition Facts */}
              <div className="border-2 border-gray-900 p-3 mb-4">
                <h3 className="text-2xl font-black text-gray-900 mb-1">Nutrition Facts</h3>
                {servings > 1 && (
                  <p className="text-sm text-gray-600 mb-1">{servings} servings</p>
                )}
                {recipe.nutrition?.servingSize && (
                  <p className="text-sm text-gray-600">Serving size: {recipe.nutrition.servingSize}</p>
                )}

                <div className="border-t-8 border-gray-900 mt-2 pt-1">
                  {/* Calories */}
                  <div className="flex justify-between items-baseline border-b border-gray-300 py-1">
                    <span className="text-lg font-black">Calories</span>
                    <span className="text-2xl font-black font-mono">{Math.round(nutrition.calories)}</span>
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
                          {label} <span className="font-mono">{Math.round(val)}{unit}</span>
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
                      <div key={key} className="flex justify-between py-0.5 border-b border-gray-100">
                        <span className="text-sm">
                          {label} <span className="font-mono text-gray-600">{val < 1 ? val.toFixed(1) : Math.round(val)}{unit}</span>
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
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Ingredients ({recipe.ingredients.length})</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {recipe.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{ing.amount * servings} {ing.unit} {ing.name}</span>
                        {ing.optional && <span className="text-xs text-gray-400">(optional)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Compliance Impact */}
              {weeklyResult && (
                <ComplianceImpact nutrition={nutrition} weeklyResult={weeklyResult} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Shows how adding this recipe would impact weekly compliance */
function ComplianceImpact({
  nutrition,
  weeklyResult,
}: {
  nutrition: NutritionalSummary;
  weeklyResult: WeeklyNutritionResult;
}) {
  const deficiencies = weeklyResult.weeklyCompliance.deficiencies;
  if (deficiencies.length === 0) return null;

  const helpsWith = deficiencies
    .filter((d) => {
      const val = nutrition[d.nutrient];
      return typeof val === "number" && val > 0;
    })
    .map((d) => {
      const provided = nutrition[d.nutrient] as number;
      const gap = d.targetDaily * 7 - d.averageDaily * 7;
      const fillPct = gap > 0 ? Math.min(100, Math.round((provided / gap) * 100)) : 0;
      return { nutrient: d.nutrient, fillPct, provided };
    })
    .filter((h) => h.fillPct > 0)
    .sort((a, b) => b.fillPct - a.fillPct)
    .slice(0, 5);

  if (helpsWith.length === 0) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <h4 className="text-sm font-semibold text-green-800 mb-2">Fills Nutritional Gaps</h4>
      <div className="space-y-1.5">
        {helpsWith.map((h) => (
          <div key={h.nutrient} className="flex items-center gap-2">
            <span className="text-sm text-green-700 w-24 shrink-0">
              {formatNutrientName(h.nutrient)}
            </span>
            <div className="flex-1 h-2 bg-green-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, h.fillPct)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-green-700 w-10 text-right">
              {h.fillPct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
