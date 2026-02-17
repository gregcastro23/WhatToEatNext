"use client";

/**
 * Recipe Builder Queue
 * Sticky, prominent selection bar that shows selected items as removable chips
 * with elemental property indicators. Feels like a shopping cart.
 *
 * @file src/components/recipe-builder/RecipeBuilderQueue.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";

// Element color dots
const ELEMENT_DOT_COLORS: Record<string, string> = {
  Fire: "bg-red-500",
  Water: "bg-blue-500",
  Earth: "bg-green-600",
  Air: "bg-cyan-400",
};

// ===== Ingredient Chip with Elemental Dots =====

interface IngredientChipProps {
  name: string;
  elementalProperties?: {
    Fire?: number;
    Water?: number;
    Earth?: number;
    Air?: number;
  };
  onRemove: () => void;
}

const IngredientChip: React.FC<IngredientChipProps> = ({
  name,
  elementalProperties,
  onRemove,
}) => {
  // Find top 2 elements for dot indicators
  const elements = elementalProperties
    ? Object.entries(elementalProperties)
        .filter(([, v]) => typeof v === "number" && v > 0.1)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 2)
    : [];

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 transition-all hover:shadow-sm">
      {/* Elemental dots */}
      {elements.length > 0 && (
        <span className="flex gap-0.5 mr-0.5">
          {elements.map(([el]) => (
            <span
              key={el}
              className={`w-2 h-2 rounded-full ${ELEMENT_DOT_COLORS[el] || "bg-gray-400"}`}
              title={el}
            />
          ))}
        </span>
      )}
      {name}
      <button
        onClick={onRemove}
        className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-black hover:bg-opacity-10 transition-colors"
        aria-label={`Remove ${name}`}
      >
        &times;
      </button>
    </span>
  );
};

// ===== Simple Chip =====

interface SimpleChipProps {
  label: string;
  colorClass: string;
  onRemove: () => void;
}

const SimpleChip: React.FC<SimpleChipProps> = ({ label, colorClass, onRemove }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${colorClass}`}
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
    prepTime,
    servings,
    setMealType,
    removeFlavor,
    removeDietaryPreference,
    removeAllergy,
    removeCuisine,
    removeIngredient,
    removeCookingMethod,
    setPrepTime,
    setServings,
    clearQueue,
    totalItems,
  } = useRecipeBuilder();

  const hasAnything =
    mealType ||
    flavors.length > 0 ||
    dietaryPreferences.length > 0 ||
    allergies.length > 0 ||
    prepTime ||
    servings ||
    totalItems > 0;

  if (!hasAnything) {
    return (
      <div
        className={`rounded-xl border-2 border-dashed border-gray-200 p-4 text-center ${className}`}
      >
        <p className="text-sm text-gray-400">
          Your selection is empty. Add ingredients, cuisines, or cooking methods above.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`sticky top-20 z-40 rounded-xl border-2 border-purple-200 bg-white bg-opacity-95 backdrop-blur-sm shadow-lg p-3 ${className}`}
    >
      {/* Header with summary and clear */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-bold text-purple-900">Your Selection</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">
            {selectedIngredients.length > 0 && (
              <span className="mr-2">
                <span className="font-semibold">{selectedIngredients.length}</span> ingredient{selectedIngredients.length !== 1 ? "s" : ""}
              </span>
            )}
            {selectedCuisines.length > 0 && (
              <span className="mr-2">
                <span className="font-semibold">{selectedCuisines.length}</span> cuisine{selectedCuisines.length !== 1 ? "s" : ""}
              </span>
            )}
            {selectedCookingMethods.length > 0 && (
              <span>
                <span className="font-semibold">{selectedCookingMethods.length}</span> method{selectedCookingMethods.length !== 1 ? "s" : ""}
              </span>
            )}
            {totalItems === 0 && mealType && "Meal type set"}
          </span>
        </div>
        <button
          onClick={clearQueue}
          className="text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Clear All
        </button>
      </div>

      {/* All chips in a single flow */}
      <div className="flex flex-wrap gap-1.5">
        {/* Meal type */}
        {mealType && (
          <SimpleChip
            label={mealType}
            colorClass="bg-indigo-100 text-indigo-800 border-indigo-200"
            onRemove={() => setMealType(null)}
          />
        )}

        {/* Prep time */}
        {prepTime && (
          <SimpleChip
            label={`${prepTime} min`}
            colorClass="bg-gray-100 text-gray-700 border-gray-200"
            onRemove={() => setPrepTime(null)}
          />
        )}

        {/* Servings */}
        {servings && (
          <SimpleChip
            label={`${servings} servings`}
            colorClass="bg-gray-100 text-gray-700 border-gray-200"
            onRemove={() => setServings(null)}
          />
        )}

        {/* Cuisines */}
        {selectedCuisines.map((cuisine) => (
          <SimpleChip
            key={`c-${cuisine}`}
            label={cuisine}
            colorClass="bg-purple-100 text-purple-800 border-purple-200"
            onRemove={() => removeCuisine(cuisine)}
          />
        ))}

        {/* Cooking methods */}
        {selectedCookingMethods.map((method) => (
          <SimpleChip
            key={`m-${method}`}
            label={method}
            colorClass="bg-orange-100 text-orange-800 border-orange-200"
            onRemove={() => removeCookingMethod(method)}
          />
        ))}

        {/* Ingredients with elemental dots */}
        {selectedIngredients.map((ing) => (
          <IngredientChip
            key={`i-${ing.name}`}
            name={ing.name}
            elementalProperties={ing.elementalProperties}
            onRemove={() => removeIngredient(ing.name)}
          />
        ))}

        {/* Flavors */}
        {flavors.map((flavor) => (
          <SimpleChip
            key={`f-${flavor}`}
            label={flavor}
            colorClass="bg-pink-100 text-pink-800 border-pink-200"
            onRemove={() => removeFlavor(flavor)}
          />
        ))}

        {/* Dietary */}
        {dietaryPreferences.map((pref) => (
          <SimpleChip
            key={`d-${pref}`}
            label={pref}
            colorClass="bg-teal-100 text-teal-800 border-teal-200"
            onRemove={() => removeDietaryPreference(pref)}
          />
        ))}

        {/* Allergies */}
        {allergies.map((allergy) => (
          <SimpleChip
            key={`a-${allergy}`}
            label={allergy}
            colorClass="bg-red-100 text-red-800 border-red-200"
            onRemove={() => removeAllergy(allergy)}
          />
        ))}
      </div>
    </div>
  );
}
