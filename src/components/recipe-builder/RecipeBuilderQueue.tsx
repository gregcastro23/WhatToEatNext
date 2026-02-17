"use client";

/**
 * Recipe Builder Queue
 * Displays selected cuisines, ingredients, and cooking methods as removable chips,
 * along with a real-time category summary and clear-all functionality.
 *
 * @file src/components/recipe-builder/RecipeBuilderQueue.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";

// ===== Chip Component =====

interface SelectionChipProps {
  label: string;
  category: "cuisine" | "ingredient" | "method";
  onRemove: () => void;
}

const SelectionChip: React.FC<SelectionChipProps> = ({ label, category, onRemove }) => {
  const colorMap = {
    cuisine: "bg-purple-100 text-purple-800 border-purple-200",
    ingredient: "bg-green-100 text-green-800 border-green-200",
    method: "bg-orange-100 text-orange-800 border-orange-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${colorMap[category]}`}
    >
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>
    </span>
  );
};

// ===== Category Summary =====

interface CategorySummaryProps {
  cuisineCount: number;
  ingredientCount: number;
  methodCount: number;
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ cuisineCount, ingredientCount, methodCount }) => {
  const total = cuisineCount + ingredientCount + methodCount;

  if (total === 0) return null;

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500">
      <span className="font-medium text-gray-700">{total} item{total !== 1 ? "s" : ""}</span>
      <span className="text-gray-300">|</span>
      {cuisineCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          {cuisineCount} cuisine{cuisineCount !== 1 ? "s" : ""}
        </span>
      )}
      {ingredientCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          {ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}
        </span>
      )}
      {methodCount > 0 && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          {methodCount} method{methodCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
};

// ===== Main Queue Component =====

interface RecipeBuilderQueueProps {
  className?: string;
}

export default function RecipeBuilderQueue({
  className = "",
}: RecipeBuilderQueueProps) {
  const {
    mealType,
    flavors,
    dietaryPreferences,
    allergies,
    selectedCuisines,
    selectedIngredients,
    selectedCookingMethods,
    setMealType,
    removeFlavor,
    removeDietaryPreference,
    removeAllergy,
    removeCuisine,
    removeIngredient,
    removeCookingMethod,
    clearQueue,
    totalItems,
  } = useRecipeBuilder();

  const hasAnything =
    mealType ||
    flavors.length > 0 ||
    dietaryPreferences.length > 0 ||
    allergies.length > 0 ||
    totalItems > 0;

  if (!hasAnything) {
    return (
      <div className={`rounded-xl border-2 border-dashed border-gray-200 p-6 text-center ${className}`}>
        <div className="text-3xl mb-2 opacity-30">&#x2615;</div>
        <p className="text-sm text-gray-500">Your recipe builder is empty</p>
        <p className="text-xs text-gray-400 mt-1">
          Search for ingredients, double-click cuisines or cooking methods to add them
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-purple-900">Recipe Builder Queue</h3>
        <button
          onClick={clearQueue}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Clear All
        </button>
      </div>

      {/* Category Summary */}
      <CategorySummary
        cuisineCount={selectedCuisines.length}
        ingredientCount={selectedIngredients.length}
        methodCount={selectedCookingMethods.length}
      />

      {/* Meal Type */}
      {mealType && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Meal Type</div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            {mealType}
            <button
              onClick={() => setMealType(null)}
              className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10"
              aria-label="Clear meal type"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      {/* Flavors */}
      {flavors.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Flavors</div>
          <div className="flex flex-wrap gap-1.5">
            {flavors.map((flavor) => (
              <span
                key={flavor}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 border border-pink-200"
              >
                {flavor}
                <button
                  onClick={() => removeFlavor(flavor)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dietary */}
      {dietaryPreferences.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Dietary</div>
          <div className="flex flex-wrap gap-1.5">
            {dietaryPreferences.map((pref) => (
              <span
                key={pref}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200"
              >
                {pref}
                <button
                  onClick={() => removeDietaryPreference(pref)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Allergies */}
      {allergies.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Allergies</div>
          <div className="flex flex-wrap gap-1.5">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"
              >
                {allergy}
                <button
                  onClick={() => removeAllergy(allergy)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cuisines */}
      {selectedCuisines.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Cuisines</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCuisines.map((cuisine) => (
              <SelectionChip
                key={cuisine}
                label={cuisine}
                category="cuisine"
                onRemove={() => removeCuisine(cuisine)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Ingredients</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedIngredients.map((ing) => (
              <SelectionChip
                key={ing.name}
                label={ing.name}
                category="ingredient"
                onRemove={() => removeIngredient(ing.name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cooking Methods */}
      {selectedCookingMethods.length > 0 && (
        <div className="mt-3">
          <div className="text-xs font-medium text-gray-500 mb-1">Cooking Methods</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedCookingMethods.map((method) => (
              <SelectionChip
                key={method}
                label={method}
                category="method"
                onRemove={() => removeCookingMethod(method)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
