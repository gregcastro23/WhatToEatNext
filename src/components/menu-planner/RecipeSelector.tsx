"use client";

/**
 * Recipe Selector Modal
 * Full-featured recipe search and selection interface
 *
 * @file src/components/menu-planner/RecipeSelector.tsx
 * @created 2026-01-10 (Phase 2)
 */

import React, { useState, useEffect, useMemo } from "react";
import type { Recipe } from "@/types/recipe";
import type { MealType, DayOfWeek, PlanetarySnapshot } from "@/types/menuPlanner";
import { getMealTypeCharacteristics, getPlanetaryDayCharacteristics } from "@/types/menuPlanner";
import {
  searchRecipes,
  type RecipeSearchOptions,
  type ScoredRecipe,
} from "@/utils/recipeSearchEngine";
import { UnifiedRecipeService } from "@/services/UnifiedRecipeService";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import { createLogger } from "@/utils/logger";

const logger = createLogger("RecipeSelector");

interface RecipeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  filters?: {
    mealType?: MealType;
    dayOfWeek?: DayOfWeek;
    planetarySnapshot?: PlanetarySnapshot;
  };
}

/**
 * Recipe Card Component
 */
function RecipeCard({
  recipe,
  onSelect,
  isSelected,
}: {
  recipe: ScoredRecipe;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Get elemental properties
  const elements = recipe.elementalProperties
    ? Object.entries(recipe.elementalProperties).filter(
        ([_, value]) => typeof value === "number"
      )
    : [];

  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
        ${
          isSelected
            ? "border-purple-500 bg-purple-50 shadow-lg scale-105"
            : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
        }
      `}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Recipe Name */}
      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
        {recipe.name}
      </h3>

      {/* Cuisine Badge */}
      {recipe.cuisine && (
        <p className="text-xs text-gray-600 mb-2">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
            {recipe.cuisine}
          </span>
        </p>
      )}

      {/* Description */}
      {recipe.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {recipe.description}
        </p>
      )}

      {/* Quick Info */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
        {recipe.prepTime && (
          <span className="flex items-center gap-1">
            <span>⏱️</span>
            {recipe.prepTime}
          </span>
        )}
        {recipe.nutrition?.calories && (
          <span className="flex items-center gap-1">
            <span>🔥</span>
            {recipe.nutrition.calories} cal
          </span>
        )}
        {recipe.servingSize && (
          <span className="flex items-center gap-1">
            <span>🍽️</span>
            {recipe.servingSize} servings
          </span>
        )}
      </div>

      {/* Dietary Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {recipe.isVegetarian && (
          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            Vegetarian
          </span>
        )}
        {recipe.isVegan && (
          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
            Vegan
          </span>
        )}
        {recipe.isGlutenFree && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
            GF
          </span>
        )}
        {recipe.isDairyFree && (
          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            DF
          </span>
        )}
      </div>

      {/* Elemental Properties */}
      {elements.length > 0 && (
        <div className="flex gap-0.5 mb-2">
          {elements.map(([element, value]) => {
            const width = Math.round((value as number) * 100);
            const elementColors: Record<string, { bg: string }> = {
              Fire: { bg: "bg-orange-400" },
              Water: { bg: "bg-blue-400" },
              Earth: { bg: "bg-amber-400" },
              Air: { bg: "bg-sky-400" },
            };
            const color = elementColors[element] || { bg: "bg-gray-400" };
            return (
              <div
                key={element}
                className={`h-1 rounded-full ${color.bg}`}
                style={{ width: `${width}%` }}
                title={`${element}: ${Math.round((value as number) * 100)}%`}
              />
            );
          })}
        </div>
      )}

      {/* Match Score (only show if search is active) */}
      {recipe.searchScore > 0 && isHovered && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {Math.round(recipe.searchScore)}% match
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-4 border-purple-500 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}

/**
 * Main Recipe Selector Component
 */
export default function RecipeSelector({
  isOpen,
  onClose,
  onSelectRecipe,
  filters,
}: RecipeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Recipe Queue
  const { addToQueue, isInQueue } = useRecipeQueue();

  // Filter states
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [maxPrepTime, setMaxPrepTime] = useState<number | undefined>();

  // Load recipes on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true);
        const recipeService = UnifiedRecipeService.getInstance();
        const recipes = await recipeService.getAllRecipes();
        setAllRecipes(recipes as unknown as Recipe[]);
        logger.info(`Loaded ${recipes.length} recipes`);
      } catch (error) {
        logger.error("Failed to load recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadRecipes();
    }
  }, [isOpen]);

  // Apply search and filters
  const filteredRecipes = useMemo(() => {
    const options: RecipeSearchOptions = {
      query: searchQuery,
      cuisine: cuisineFilter.length > 0 ? cuisineFilter : undefined,
      isVegetarian: dietaryFilters.vegetarian || undefined,
      isVegan: dietaryFilters.vegan || undefined,
      isGlutenFree: dietaryFilters.glutenFree || undefined,
      isDairyFree: dietaryFilters.dairyFree || undefined,
      mealType: filters?.mealType ? [filters.mealType] : undefined,
      planetaryDay: filters?.dayOfWeek,
      prepTimeMax: maxPrepTime,
      limit: 50,
    };

    return searchRecipes(allRecipes, options);
  }, [
    allRecipes,
    searchQuery,
    cuisineFilter,
    dietaryFilters,
    maxPrepTime,
    filters,
  ]);

  // Get available cuisines from recipes
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    allRecipes.forEach((recipe) => {
      if (recipe.cuisine) {
        cuisines.add(recipe.cuisine);
      }
    });
    return Array.from(cuisines).sort();
  }, [allRecipes]);

  // Handle recipe selection
  const handleSelectRecipe = () => {
    if (selectedRecipe) {
      onSelectRecipe(selectedRecipe);
      onClose();
    }
  };

  // Handle add to queue
  const handleAddToQueue = () => {
    if (selectedRecipe) {
      addToQueue(selectedRecipe, {
        suggestedMealTypes: filters?.mealType ? [filters.mealType] : undefined,
        suggestedDays: filters?.dayOfWeek !== undefined ? [filters.dayOfWeek] : undefined,
      });
      logger.info(`Added "${selectedRecipe.name}" to queue`);
      setSelectedRecipe(null); // Clear selection after adding
    }
  };

  // Reset on close
  const handleClose = () => {
    setSearchQuery("");
    setSelectedRecipe(null);
    setCuisineFilter([]);
    setDietaryFilters({
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    });
    setMaxPrepTime(undefined);
    onClose();
  };

  // Get context info
  const mealTypeInfo = filters?.mealType
    ? getMealTypeCharacteristics(filters.mealType)
    : null;
  const planetaryInfo =
    filters?.dayOfWeek !== undefined
      ? getPlanetaryDayCharacteristics(filters.dayOfWeek)
      : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Select Recipe
              </h2>
              {(mealTypeInfo || planetaryInfo) && (
                <p className="text-sm text-gray-600 mt-1">
                  {mealTypeInfo &&
                    `${filters!.mealType!.charAt(0).toUpperCase()}${filters!.mealType!.slice(1)}: ${mealTypeInfo.guidance}`}
                  {planetaryInfo &&
                    ` • ${planetaryInfo.planet} day: ${planetaryInfo.description}`}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by name, ingredient, cuisine..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            autoFocus
          />
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            {/* Cuisine Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuisine
              </label>
              <select
                multiple
                value={cuisineFilter}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value,
                  );
                  setCuisineFilter(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm max-h-20 overflow-y-auto"
              >
                {availableCuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Filters */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(dietaryFilters).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-1 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setDietaryFilters((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prep Time Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Prep Time
              </label>
              <select
                value={maxPrepTime || ""}
                onChange={(e) =>
                  setMaxPrepTime(
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Any</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(cuisineFilter.length > 0 ||
            Object.values(dietaryFilters).some((v) => v) ||
            maxPrepTime) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cuisineFilter.map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1"
                >
                  {cuisine}
                  <button
                    onClick={() =>
                      setCuisineFilter((prev) =>
                        prev.filter((c) => c !== cuisine),
                      )
                    }
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
              {Object.entries(dietaryFilters).map(
                ([key, value]) =>
                  value && (
                    <span
                      key={key}
                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded flex items-center gap-1 capitalize"
                    >
                      {key}
                      <button
                        onClick={() =>
                          setDietaryFilters((prev) => ({
                            ...prev,
                            [key]: false,
                          }))
                        }
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ),
              )}
              {maxPrepTime && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded flex items-center gap-1">
                  ≤ {maxPrepTime} min
                  <button
                    onClick={() => setMaxPrepTime(undefined)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin text-4xl mb-2">⏳</div>
                <p className="text-gray-600">Loading recipes...</p>
              </div>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-600 text-lg mb-2">No recipes found</p>
                <p className="text-gray-500 text-sm">
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={() => setSelectedRecipe(recipe)}
                  isSelected={selectedRecipe?.id === recipe.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} found
            {selectedRecipe && (
              <>
                {" • Selected: "}
                <span className="font-medium">{selectedRecipe.name}</span>
                {isInQueue(selectedRecipe.id) && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                    In Queue
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            {selectedRecipe && !isInQueue(selectedRecipe.id) && (
              <button
                onClick={handleAddToQueue}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                📋 Add to Queue
              </button>
            )}
            <button
              onClick={handleSelectRecipe}
              disabled={!selectedRecipe}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${
                  selectedRecipe
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              Add to Meal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
