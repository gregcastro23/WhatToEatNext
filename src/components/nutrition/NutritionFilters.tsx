"use client";

/**
 * NutritionFilters
 * Filter and sort controls for recipe browsing based on nutritional criteria.
 */

import React, { useState, useCallback } from "react";

export interface NutritionFilterValues {
  calorieRange?: [number, number];
  minProtein?: number;
  maxCarbs?: number;
  maxFat?: number;
  highFiber?: boolean;
  highProtein?: boolean;
  lowSodium?: boolean;
  fillsDeficiency?: string[];
}

export type NutritionSortOption =
  | "relevance"
  | "calories-asc"
  | "calories-desc"
  | "protein-desc"
  | "fiber-desc"
  | "compliance-impact";

interface NutritionFiltersProps {
  filters: NutritionFilterValues;
  onFiltersChange: (filters: NutritionFilterValues) => void;
  sortBy: NutritionSortOption;
  onSortChange: (sort: NutritionSortOption) => void;
  deficientNutrients?: string[];
  totalRecipes?: number;
  filteredCount?: number;
}

export function NutritionFilters({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  deficientNutrients = [],
  totalRecipes,
  filteredCount,
}: NutritionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof NutritionFilterValues>(
      key: K,
      value: NutritionFilterValues[K],
    ) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({});
    onSortChange("relevance");
  }, [onFiltersChange, onSortChange]);

  const hasActiveFilters =
    filters.highFiber ||
    filters.highProtein ||
    filters.lowSodium ||
    filters.minProtein !== undefined ||
    filters.maxCarbs !== undefined ||
    filters.maxFat !== undefined ||
    filters.calorieRange !== undefined ||
    (filters.fillsDeficiency && filters.fillsDeficiency.length > 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
        >
          <span>Nutrition Filters</span>
          <span className="text-xs">{isExpanded ? "▲" : "▼"}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Count */}
      {totalRecipes !== undefined && filteredCount !== undefined && (
        <p className="text-xs text-gray-500 mb-2">
          Showing {filteredCount} of {totalRecipes} recipes
        </p>
      )}

      {/* Sort */}
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-600">Sort:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as NutritionSortOption)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="relevance">Relevance</option>
          <option value="calories-asc">Calories (low to high)</option>
          <option value="calories-desc">Calories (high to low)</option>
          <option value="protein-desc">Protein (highest)</option>
          <option value="fiber-desc">Fiber (highest)</option>
          <option value="compliance-impact">Best for compliance</option>
        </select>
      </div>

      {/* Quick toggles (always visible) */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {[
          {
            key: "highProtein" as const,
            label: "High Protein",
            active: filters.highProtein,
          },
          {
            key: "highFiber" as const,
            label: "High Fiber",
            active: filters.highFiber,
          },
          {
            key: "lowSodium" as const,
            label: "Low Sodium",
            active: filters.lowSodium,
          },
        ].map(({ key, label, active }) => (
          <button
            key={key}
            onClick={() => updateFilter(key, !active)}
            className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${
              active
                ? "bg-amber-100 border-amber-400 text-amber-800"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          {/* Calorie Range */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Calorie Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.calorieRange?.[0] ?? ""}
                onChange={(e) => {
                  const min = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  const max = filters.calorieRange?.[1];
                  if (min !== undefined || max !== undefined) {
                    updateFilter("calorieRange", [min ?? 0, max ?? 9999]);
                  } else {
                    updateFilter("calorieRange", undefined);
                  }
                }}
                className="w-20 text-xs border border-gray-300 rounded px-2 py-1"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.calorieRange?.[1] ?? ""}
                onChange={(e) => {
                  const max = e.target.value
                    ? Number(e.target.value)
                    : undefined;
                  const min = filters.calorieRange?.[0];
                  if (min !== undefined || max !== undefined) {
                    updateFilter("calorieRange", [min ?? 0, max ?? 9999]);
                  } else {
                    updateFilter("calorieRange", undefined);
                  }
                }}
                className="w-20 text-xs border border-gray-300 rounded px-2 py-1"
              />
              <span className="text-xs text-gray-400">cal</span>
            </div>
          </div>

          {/* Min Protein */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Min Protein (g)
            </label>
            <input
              type="number"
              placeholder="e.g. 20"
              value={filters.minProtein ?? ""}
              onChange={(e) =>
                updateFilter(
                  "minProtein",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-24 text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>

          {/* Max Carbs */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Max Carbs (g)
            </label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={filters.maxCarbs ?? ""}
              onChange={(e) =>
                updateFilter(
                  "maxCarbs",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-24 text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>

          {/* Max Fat */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Max Fat (g)
            </label>
            <input
              type="number"
              placeholder="e.g. 30"
              value={filters.maxFat ?? ""}
              onChange={(e) =>
                updateFilter(
                  "maxFat",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-24 text-xs border border-gray-300 rounded px-2 py-1"
            />
          </div>

          {/* Deficiency Fillers */}
          {deficientNutrients.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Fill Deficiency
              </label>
              <div className="flex flex-wrap gap-1">
                {deficientNutrients.map((nutrient) => {
                  const isActive = filters.fillsDeficiency?.includes(nutrient);
                  return (
                    <button
                      key={nutrient}
                      onClick={() => {
                        const current = filters.fillsDeficiency ?? [];
                        const updated = isActive
                          ? current.filter((n) => n !== nutrient)
                          : [...current, nutrient];
                        updateFilter(
                          "fillsDeficiency",
                          updated.length > 0 ? updated : undefined,
                        );
                      }}
                      className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                        isActive
                          ? "bg-green-100 border-green-400 text-green-800"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {nutrient}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Apply nutrition filters to a recipe list.
 * Exported utility for use by parent components.
 */
export function applyNutritionFilters(
  recipes: Array<{
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      fiber?: number;
      macronutrients?: {
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
      };
    };
    [key: string]: unknown;
  }>,
  filters: NutritionFilterValues,
): typeof recipes {
  return recipes.filter((recipe) => {
    const n = recipe.nutrition;
    if (!n) return !hasAnyFilter(filters);

    const cal = n.calories ?? 0;
    const protein = n.protein ?? n.macronutrients?.protein ?? 0;
    const carbs = n.carbs ?? n.macronutrients?.carbs ?? 0;
    const fat = n.fat ?? n.macronutrients?.fat ?? 0;
    const fiber = n.macronutrients?.fiber ?? 0;

    if (filters.calorieRange) {
      if (cal < filters.calorieRange[0] || cal > filters.calorieRange[1])
        return false;
    }
    if (filters.minProtein !== undefined && protein < filters.minProtein)
      return false;
    if (filters.maxCarbs !== undefined && carbs > filters.maxCarbs)
      return false;
    if (filters.maxFat !== undefined && fat > filters.maxFat) return false;
    if (filters.highProtein && protein < 20) return false;
    if (filters.highFiber && fiber < 5) return false;
    if (filters.lowSodium) {
      // Can't filter sodium without micronutrient data - pass through
    }

    return true;
  });
}

function hasAnyFilter(filters: NutritionFilterValues): boolean {
  return !!(
    filters.highFiber ||
    filters.highProtein ||
    filters.lowSodium ||
    filters.minProtein !== undefined ||
    filters.maxCarbs !== undefined ||
    filters.maxFat !== undefined ||
    filters.calorieRange !== undefined
  );
}

/**
 * Sort recipes by nutrition criteria
 */
export function sortByNutrition(
  recipes: Array<{
    nutrition?: {
      calories?: number;
      protein?: number;
      macronutrients?: { protein?: number; fiber?: number };
    };
    [key: string]: unknown;
  }>,
  sortBy: NutritionSortOption,
): typeof recipes {
  const sorted = [...recipes];
  switch (sortBy) {
    case "calories-asc":
      return sorted.sort(
        (a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0),
      );
    case "calories-desc":
      return sorted.sort(
        (a, b) => (b.nutrition?.calories ?? 0) - (a.nutrition?.calories ?? 0),
      );
    case "protein-desc":
      return sorted.sort(
        (a, b) =>
          (b.nutrition?.protein ?? b.nutrition?.macronutrients?.protein ?? 0) -
          (a.nutrition?.protein ?? a.nutrition?.macronutrients?.protein ?? 0),
      );
    case "fiber-desc":
      return sorted.sort(
        (a, b) =>
          (b.nutrition?.macronutrients?.fiber ?? 0) -
          (a.nutrition?.macronutrients?.fiber ?? 0),
      );
    default:
      return sorted;
  }
}
