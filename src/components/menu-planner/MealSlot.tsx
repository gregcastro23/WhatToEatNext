"use client";

/**
 * Meal Slot Component
 * Individual meal slot for the weekly menu planner
 * Supports drag-and-drop, recipe display, and empty state
 *
 * @file src/components/menu-planner/MealSlot.tsx
 * @created 2026-01-10
 * @updated 2026-01-10 (Phase 2 - Added Recipe Selector)
 */

import React, { useState } from "react";
import Link from "next/link";
import RecipeSelector from "./RecipeSelector";
import { RecipeNutritionQuickView } from "@/components/nutrition/RecipeNutritionQuickView";
import { RecipeNutritionModal } from "@/components/nutrition/RecipeNutritionModal";

import type { MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import { getMealTypeCharacteristics } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import type { WeeklyNutritionResult } from "@/types/nutrition";

interface MealSlotProps {
  mealSlot: MealSlotType;
  onAddRecipe?: (recipe: Recipe) => void;
  onRemoveRecipe?: () => void;
  onUpdateServings?: (servings: number) => void;
  onMoveMeal?: (targetSlotId: string) => void;
  onSwapMeals?: (targetSlotId: string) => void;
  onCopyMeal?: () => void;
  onGenerateMeal?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  isDropValid?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  weeklyNutrition?: WeeklyNutritionResult | null;
}

/**
 * Get meal type icon
 */
function getMealTypeIcon(mealType: MealType): string {
  const icons: Record<MealType, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return icons[mealType];
}

/**
 * Get meal type colors
 */
function getMealTypeColors(mealType: MealType): {
  bg: string;
  border: string;
  text: string;
} {
  const colors: Record<MealType, { bg: string; border: string; text: string }> =
    {
      breakfast: {
        bg: "bg-gradient-to-br from-orange-50 to-yellow-50",
        border: "border-orange-300",
        text: "text-orange-700",
      },
      lunch: {
        bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
        border: "border-blue-300",
        text: "text-blue-700",
      },
      dinner: {
        bg: "bg-gradient-to-br from-purple-50 to-indigo-50",
        border: "border-purple-300",
        text: "text-purple-700",
      },
      snack: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-50",
        border: "border-green-300",
        text: "text-green-700",
      },
    };
  return colors[mealType];
}

/**
 * Empty State Component
 */
function EmptyMealSlot({
  mealType,
  onClick,
  onGenerate,
}: {
  mealType: MealType;
  onClick: () => void;
  onGenerate?: () => void;
}) {
  const colors = getMealTypeColors(mealType);
  const characteristics = getMealTypeCharacteristics(mealType);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="text-4xl mb-2 opacity-30">
        {getMealTypeIcon(mealType)}
      </div>
      <p className={`text-sm font-medium mb-1 ${colors.text}`}>
        Add {mealType}
      </p>
      <p className="text-xs text-gray-500 mb-2">{characteristics.guidance}</p>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-xs rounded-lg border-2 ${colors.border} ${colors.bg} hover:shadow-md transition-all duration-200`}
          onClick={onClick}
        >
          + Add Recipe
        </button>
        {onGenerate && (
          <button
            className="px-3 py-1 text-xs rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 hover:shadow-md hover:border-amber-400 transition-all duration-200"
            onClick={onGenerate}
            title={`Auto-generate ${mealType} suggestion`}
          >
            ✨ Generate
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Recipe Display Component
 */
function RecipeDisplay({
  recipe,
  servings,
  mealType,
  onRemove,
  onUpdateServings,
  onCopyMeal,
  weeklyNutrition,
}: {
  recipe: Recipe;
  servings: number;
  mealType: MealType;
  onRemove?: () => void;
  onUpdateServings?: (servings: number) => void;
  onCopyMeal?: () => void;
  weeklyNutrition?: WeeklyNutritionResult | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const colors = getMealTypeColors(mealType);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm truncate ${colors.text}`}>
            {recipe.name}
          </h4>
          {recipe.cuisine && (
            <p className="text-xs text-gray-500 truncate">{recipe.cuisine}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCopyMeal}
            className="text-gray-400 hover:text-purple-600 transition-colors text-sm"
            title="Copy/Move to other slots"
          >
            📋
          </button>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-600 transition-colors"
            title="Remove recipe"
          >
            ×
          </button>
        </div>
      </div>
      {/* Servings Control */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-600">Servings:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateServings?.(Math.max(1, servings - 1))}
            className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
            disabled={servings <= 1}
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium">
            {servings}
          </span>
          <button
            onClick={() => onUpdateServings?.(servings + 1)}
            className="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs"
          >
            +
          </button>
        </div>
      </div>
      {/* Quick Info */}
      <div className="text-xs text-gray-600 space-y-1 mb-2">
        {recipe.prepTime && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{recipe.prepTime}</span>
          </div>
        )}
      </div>
      {/* Nutrition Quick View */}
      <div className="mb-2">
        <RecipeNutritionQuickView
          recipe={recipe}
          servings={servings}
          compact
          onShowDetails={() => setShowNutritionModal(true)}
        />
      </div>
      {/* Nutrition Details Modal */}
      <RecipeNutritionModal
        recipe={recipe}
        servings={servings}
        isOpen={showNutritionModal}
        onClose={() => setShowNutritionModal(false)}
        ingredientMapping={{}} // Placeholder
      />{" "}
      {/* Elemental Properties */}
      {recipe.elementalProperties && (
        <div className="mb-2">
          <div className="flex gap-1">
            {Object.entries(recipe.elementalProperties).map(
              ([element, value]) => {
                if (typeof value !== "number") return null;
                const width = Math.round(value * 100);
                const elementColors: Record<
                  string,
                  { bg: string; text: string }
                > = {
                  Fire: { bg: "bg-orange-400", text: "text-orange-700" },
                  Water: { bg: "bg-blue-400", text: "text-blue-700" },
                  Earth: { bg: "bg-amber-400", text: "text-amber-700" },
                  Air: { bg: "bg-sky-400", text: "text-sky-700" },
                };
                const color = elementColors[element] || {
                  bg: "bg-gray-400",
                  text: "text-gray-700",
                };
                return (
                  <div
                    key={element}
                    className={`h-1.5 rounded-full ${color.bg}`}
                    style={{ width: `${width}%` }}
                    title={`${element}: ${Math.round(value * 100)}%`}
                  />
                );
              },
            )}
          </div>
        </div>
      )}
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-gray-500 hover:text-gray-700 mt-auto"
      >
        {isExpanded ? "Show less ↑" : "Show more ↓"}
      </button>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
          {recipe.description && (
            <p className="mb-2 line-clamp-3">{recipe.description}</p>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-1 text-gray-700">
                Ingredients ({recipe.ingredients.length}):
              </p>
              <ul className="list-none space-y-0.5 max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                {recipe.ingredients.slice(0, 6).map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="text-purple-500">•</span>
                    <span className="truncate">
                      {ing.amount
                        ? `${ing.amount * servings} ${ing.unit || ""} `
                        : ""}
                      {ing.name}
                    </span>
                  </li>
                ))}
                {recipe.ingredients.length > 6 && (
                  <li className="text-purple-600 font-medium">
                    +{recipe.ingredients.length - 6} more ingredients...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Instructions Preview */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-1 text-gray-700">
                Steps ({recipe.instructions.length}):
              </p>
              <ol className="list-decimal list-inside space-y-0.5 bg-gray-50 rounded p-2">
                {recipe.instructions.slice(0, 2).map((step, idx) => (
                  <li key={idx} className="truncate text-gray-600">
                    {step}
                  </li>
                ))}
                {recipe.instructions.length > 2 && (
                  <li className="text-purple-600 font-medium list-none">
                    +{recipe.instructions.length - 2} more steps...
                  </li>
                )}
              </ol>
            </div>
          )}

          {/* View Full Recipe Link */}
          <Link
            href={`/recipes/${recipe.id || encodeURIComponent(recipe.name)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-all"
          >
            <span>📖</span>
            View Full Recipe
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Main Meal Slot Component
 */
export default function MealSlot({
  mealSlot,
  onAddRecipe,
  onRemoveRecipe,
  onUpdateServings,
  onMoveMeal,
  onSwapMeals,
  onCopyMeal,
  onGenerateMeal,
  isDragging = false,
  isDropTarget = false,
  isDropValid = true,
  onDragStart,
  onDragEnd,
  weeklyNutrition,
}: MealSlotProps) {
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = getMealTypeColors(mealSlot.mealType);
  const hasRecipe = !!mealSlot.recipe;

  // Handle recipe selection
  const handleRecipeSelect = (recipe: Recipe) => {
    onAddRecipe?.(recipe);
    setShowRecipeSelector(false);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (!hasRecipe) return;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "meal-slot",
        slotId: mealSlot.id,
        recipe: mealSlot.recipe,
        servings: mealSlot.servings,
      }),
    );

    // Set drag image
    const target = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(target, 50, 50);

    onDragStart?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));

      if (data.type === "meal-slot") {
        // Dropping from another meal slot
        if (data.slotId === mealSlot.id) {
          // Same slot, do nothing
          return;
        }

        if (hasRecipe) {
          // Target slot is occupied - ask to swap
          if (
            confirm(
              "This slot already has a recipe. Would you like to swap the meals?",
            )
          ) {
            onSwapMeals?.(data.slotId);
          }
        } else {
          // Target slot is empty - move
          onMoveMeal?.(data.slotId);
        }
      } else if (data.type === "queue-recipe") {
        // Dropping from recipe queue
        if (!hasRecipe) {
          onAddRecipe?.(data.recipe);
        } else {
          if (
            confirm(
              "This slot already has a recipe. Would you like to replace it?",
            )
          ) {
            onAddRecipe?.(data.recipe);
          }
        }
      }
    } catch (error) {
      console.error("Drop failed:", error);
    }
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
    onDragEnd?.();
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 p-3
        ${colors.bg} ${colors.border}
        ${hasRecipe ? "hover:shadow-lg" : "hover:shadow-md"}
        transition-all duration-200
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isDragOver || isDropTarget ? (isDropValid ? "border-green-500 scale-[1.02] shadow-lg bg-green-50/30" : "border-red-400 bg-red-50/30") : ""}
        min-h-[200px] h-full
      `}
      draggable={hasRecipe}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      {/* Meal Type Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getMealTypeIcon(mealSlot.mealType)}</span>
          <span className={`text-sm font-semibold capitalize ${colors.text}`}>
            {mealSlot.mealType}
          </span>
        </div>
      </div>

      {/* Content */}
      {hasRecipe ? (
        <RecipeDisplay
          recipe={mealSlot.recipe!}
          servings={mealSlot.servings}
          mealType={mealSlot.mealType}
          onRemove={onRemoveRecipe}
          onUpdateServings={onUpdateServings}
          onCopyMeal={onCopyMeal}
          weeklyNutrition={weeklyNutrition}
        />
      ) : (
        <EmptyMealSlot
          mealType={mealSlot.mealType}
          onClick={() => setShowRecipeSelector(true)}
          onGenerate={onGenerateMeal}
        />
      )}

      {/* Planetary Indicator (subtle) */}
      <div
        className="absolute top-2 right-2 text-xs text-gray-400"
        title={`Ruled by ${mealSlot.planetarySnapshot.dominantPlanet}`}
      >
        {mealSlot.planetarySnapshot.dominantPlanet === "Sun" && "☉"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Moon" && "☽"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Mars" && "♂"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Mercury" && "☿"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Jupiter" && "♃"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Venus" && "♀"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Saturn" && "♄"}
      </div>

      {/* Recipe Selector Modal */}
      <RecipeSelector
        isOpen={showRecipeSelector}
        onClose={() => setShowRecipeSelector(false)}
        onSelectRecipe={handleRecipeSelect}
        filters={{
          mealType: mealSlot.mealType,
          dayOfWeek: mealSlot.dayOfWeek,
          planetarySnapshot: mealSlot.planetarySnapshot,
        }}
      />
    </div>
  );
}
