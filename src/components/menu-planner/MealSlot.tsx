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

import Link from "next/link";
import React, { useState } from "react";
import { RecipeNutritionModal } from "@/components/nutrition/RecipeNutritionModal";
import { RecipeNutritionQuickView } from "@/components/nutrition/RecipeNutritionQuickView";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { MealSlot as MealSlotType, MealType } from "@/types/menuPlanner";
import { getMealTypeCharacteristics } from "@/types/menuPlanner";
import type { WeeklyNutritionResult } from "@/types/nutrition";
import type { Recipe } from "@/types/recipe";
import RecipeRitualModal from "./RecipeRitualModal";
import RecipeSelector from "./RecipeSelector";
import SauceSelector from "./SauceSelector";

interface MealSlotProps {
  mealSlot: MealSlotType;
  onAddRecipe?: (recipe: MonicaOptimizedRecipe) => void;
  onRemoveRecipe?: () => void;
  onUpdateServings?: (servings: number) => void;
  onMoveMeal?: (targetSlotId: string) => void;
  onSwapMeals?: (targetSlotId: string) => void;
  onCopyMeal?: () => void;
  onGenerateMeal?: () => void;
  onAddSauce?: (sauceId: string, servings?: number) => void;
  onRemoveSauce?: () => void;
  onUpdateSauceServings?: (servings: number) => void;
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
  // On-brand element-aligned tokens (was off-brand amber/emerald/purple/cyan
  // marketing gradients). Breakfast→Fire, Lunch→Earth, Dinner→Air/violet,
  // Snack→Water, keeping text on the neutral surface ramp for legibility.
  const colors: Record<MealType, { bg: string; border: string; text: string }> =
    {
      breakfast: {
        bg: "bg-fire-spirit/5",
        border: "border-fire-spirit/20",
        text: "text-on-surface",
      },
      lunch: {
        bg: "bg-earth-matter/5",
        border: "border-earth-matter/20",
        text: "text-on-surface",
      },
      dinner: {
        bg: "bg-active-violet/5",
        border: "border-active-violet/20",
        text: "text-on-surface",
      },
      snack: {
        bg: "bg-water-essence/5",
        border: "border-water-essence/20",
        text: "text-on-surface",
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
      <p className="text-xs text-purple-200/50 mb-2">{characteristics.guidance}</p>
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 text-xs rounded-lg border ${colors.border} ${colors.bg} ${colors.text} hover:shadow-[0_0_16px_rgba(251,191,36,0.15)] transition-all duration-200`}
          onClick={onClick}
        >
          + Add Recipe
        </button>
        {onGenerate && (
          <button
            className="px-3 py-1 text-xs rounded-lg border border-amber-300/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 hover:border-amber-300/60 transition-all duration-200"
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
  weeklyNutrition: _weeklyNutrition,
}: {
  recipe: MonicaOptimizedRecipe;
  servings: number;
  mealType: MealType;
  onRemove?: () => void;
  onUpdateServings?: (servings: number) => void;
  onCopyMeal?: () => void;
  weeklyNutrition?: WeeklyNutritionResult | null;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [ritualInstruction, setRitualInstruction] = useState("");
  const [dominantTransit, setDominantTransit] = useState<string | null>(null);
  const [totalPotencyScore, setTotalPotencyScore] = useState<number | null>(
    null,
  );
  const [alchemicalQuantities, setAlchemicalQuantities] = useState<any>(null); // TODO: Define proper type
  const colors = getMealTypeColors(mealType);

  const handleEnvironmentalMatchClick = async () => {
    if (!recipe.id) return;
    try {
      const response = await fetch(
        "/api/rituals/generate-cooking-instruction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recipe_id: recipe.id }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch ritual instruction");
      }
      const data = await response.json();
      setRitualInstruction(data.ritual_instruction);
      setDominantTransit(data.dominant_transit);
      setTotalPotencyScore(data.total_potency_score);
      setAlchemicalQuantities(data.alchemical_quantities);
      setIsRitualModalOpen(true);
    } catch (error) {
      console.error(error);
      // Handle error, e.g., show a default message
      setRitualInstruction("Cook with mindfulness and enjoy the moment.");
      setDominantTransit(null);
      setTotalPotencyScore(null);
      setAlchemicalQuantities(null);
      setIsRitualModalOpen(true);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm truncate ${colors.text}`}>
            <Link
              href={`/recipes/${recipe.id || encodeURIComponent(recipe.name)}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="hover:underline"
            >
              {recipe.name}
            </Link>
          </h4>
          {recipe.cuisine && (
            <p className="text-xs text-purple-200/50 truncate">{recipe.cuisine}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCopyMeal}
            className="text-purple-200/50 hover:text-amber-300 transition-colors text-sm"
            title="Copy/Move to other slots"
          >
            📋
          </button>
          <button
            onClick={onRemove}
            className="text-purple-200/50 hover:text-red-400 transition-colors"
            title="Remove recipe"
          >
            ×
          </button>
        </div>
      </div>
      {/* Servings Control */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-purple-200/60">Servings:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateServings?.(Math.max(1, servings - 1))}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-purple-100 flex items-center justify-center text-xs"
            disabled={servings <= 1}
          >
            −
          </button>
          <span className="w-6 text-center text-sm font-medium text-purple-100">
            {servings}
          </span>
          <button
            onClick={() => onUpdateServings?.(servings + 1)}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-purple-100 flex items-center justify-center text-xs"
          >
            +
          </button>
        </div>
      </div>
      {/* Quick Info */}
      <div className="text-xs text-purple-200/60 space-y-1 mb-2">
        {recipe.prepTime && recipe.prepTime !== "0" && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{recipe.prepTime}</span>
          </div>
        )}
      </div>
      {/* Environmental Match Indicator */}
      {recipe.isEnvironmentalMatch && (
        <div
          className="flex items-center gap-1 text-xs text-emerald-300 mb-2 cursor-pointer"
          title={
            recipe.environmentalMatchDetails ||
            "This recipe aligns with current environmental energies!"
          }
          onClick={() => { void handleEnvironmentalMatchClick(); }}
        >
          <span>🌍✨</span>
          <span className="font-medium">Environmental Match!</span>
        </div>
      )}
      {/* Lunar Oracle Badge */}
      {recipe.optimal_cooking_window && (
        <div
          className="flex items-center gap-1 text-xs text-sky-300 mb-2"
          title={`Best cooked between ${recipe.optimal_cooking_window.start_time} - ${parseInt(recipe.optimal_cooking_window.start_time, 10) + 3}:00 for maximum Lunar affinity.`}
        >
          <span>🌕</span>
          <span className="font-medium">Optimal Cooking Window!</span>
        </div>
      )}
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
      />
      <RecipeRitualModal
        isOpen={isRitualModalOpen}
        onClose={() => setIsRitualModalOpen(false)}
        recipeId={recipe.id}
        ritualInstruction={ritualInstruction}
        dominantTransit={dominantTransit}
        totalPotencyScore={totalPotencyScore}
        elementalProperties={recipe.elementalProperties}
        alchemicalQuantities={alchemicalQuantities}
      />
      {/* Sauce Section - rendered by parent, injected here as children would be complex,
          so sauce display is handled in the main MealSlot component below */}

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
        className="text-xs text-purple-300/60 hover:text-purple-200 mt-auto"
      >
        {isExpanded ? "Show less ↑" : "Show more ↓"}
      </button>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 pt-2 border-t border-white/10 text-xs text-purple-200/70">
          {recipe.description && (
            <p className="mb-2 line-clamp-3">{recipe.description}</p>
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-1 text-purple-100">
                Ingredients ({recipe.ingredients.length}):
              </p>
              <ul className="list-none space-y-0.5 max-h-32 overflow-y-auto bg-white/5 rounded p-2">
                {recipe.ingredients.slice(0, 6).map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span className="text-amber-300/80">•</span>
                    <span className="truncate">
                      {ing.amount
                        ? `${Number(ing.amount) * servings} ${ing.unit || ""} `
                        : ""}
                      {ing.name}
                    </span>
                  </li>
                ))}
                {recipe.ingredients.length > 6 && (
                  <li className="text-purple-300 font-medium">
                    +{recipe.ingredients.length - 6} more ingredients...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Instructions Preview */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="mb-3">
              <p className="font-medium mb-1 text-purple-100">
                Steps ({recipe.instructions.length}):
              </p>
              <ol className="list-decimal list-inside space-y-0.5 bg-white/5 rounded p-2">
                {recipe.instructions.slice(0, 2).map((step, idx) => (
                  <li key={idx} className="truncate text-purple-200/70">
                    {step}
                  </li>
                ))}
                {recipe.instructions.length > 2 && (
                  <li className="text-purple-300 font-medium list-none">
                    +{recipe.instructions.length - 2} more steps...
                  </li>
                )}
              </ol>
            </div>
          )}

          {/* View Full Recipe Link */}
          <Link
            href={`/recipes/${recipe.id || encodeURIComponent(recipe.name)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-400/15 text-purple-200 rounded-lg font-medium hover:bg-purple-400/25 transition-all"
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
  onAddSauce,
  onRemoveSauce,
  onUpdateSauceServings,
  isDragging = false,
  isDropTarget = false,
  isDropValid = true,
  onDragStart,
  onDragEnd,
  weeklyNutrition,
}: MealSlotProps) {
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [showSauceSelector, setShowSauceSelector] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const colors = getMealTypeColors(mealSlot.mealType);
  const hasRecipe = !!mealSlot.recipe;
  const hasSauce = !!mealSlot.sauce;

  // Handle recipe selection
  const handleRecipeSelect = (recipe: Recipe) => {
    onAddRecipe?.(recipe as MonicaOptimizedRecipe);
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
            // eslint-disable-next-line no-alert
            window.confirm(
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
            // eslint-disable-next-line no-alert
            window.confirm(
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
        relative rounded-xl border-2 p-3 backdrop-blur-md
        ${colors.bg} ${colors.border}
        ${hasRecipe ? "hover:shadow-[0_0_24px_rgba(251,191,36,0.12)]" : "hover:shadow-[0_0_18px_rgba(168,85,247,0.12)]"}
        transition-all duration-200
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isDragOver || isDropTarget ? (isDropValid ? "border-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.25)] bg-emerald-400/10" : "border-red-400 bg-red-400/10") : ""}
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
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/10">
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
          recipe={mealSlot.recipe as unknown as MonicaOptimizedRecipe}
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

      {/* Sauce Section */}
      {hasRecipe && (
        <div className="mt-2 pt-2 border-t border-white/10">
          {hasSauce ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs text-amber-300 font-medium truncate">
                  + {mealSlot.sauce!.name}
                </span>
                {mealSlot.sauce!.nutritionalProfile?.calories && (
                  <span className="text-[10px] text-purple-300/50">
                    +{Math.round((mealSlot.sauce!.nutritionalProfile.calories || 0) * (mealSlot.sauce!.servings || 1))} cal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateSauceServings?.(Math.max(0.5, (mealSlot.sauce!.servings || 1) - 0.5))}
                  className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 text-purple-100 flex items-center justify-center text-[10px]"
                >
                  -
                </button>
                <span className="w-6 text-center text-[10px] font-medium text-purple-100">
                  {mealSlot.sauce!.servings || 1}x
                </span>
                <button
                  onClick={() => onUpdateSauceServings?.((mealSlot.sauce!.servings || 1) + 0.5)}
                  className="w-4 h-4 rounded bg-white/10 hover:bg-white/20 text-purple-100 flex items-center justify-center text-[10px]"
                >
                  +
                </button>
                <button
                  onClick={onRemoveSauce}
                  className="text-purple-300/50 hover:text-red-400 ml-1 text-xs"
                  title="Remove sauce"
                >
                  x
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSauceSelector(true)}
              className="w-full text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 py-1 rounded transition-colors"
            >
              + Add Sauce
            </button>
          )}
        </div>
      )}

      {/* Planetary Indicator (subtle) */}
      <div
        className="absolute top-2 right-2 text-xs text-amber-300/60"
        title={`Ruled by ${mealSlot.planetarySnapshot.dominantPlanet}`}
      >
        {mealSlot.planetarySnapshot.dominantPlanet === "Sun" && "🝇"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Moon" && "🝑"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Mars" && "♂"}
        {mealSlot.planetarySnapshot.dominantPlanet === "Mercury" && "🝉"}
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

      {/* Sauce Selector Modal */}
      <SauceSelector
        isOpen={showSauceSelector}
        onClose={() => setShowSauceSelector(false)}
        onSelectSauce={(sauceId) => {
          onAddSauce?.(sauceId);
          setShowSauceSelector(false);
        }}
        recipeElementalProperties={mealSlot.recipe?.elementalProperties}
        recipeAlchemicalProperties={mealSlot.recipe?.alchemicalProperties as any}
      />
    </div>
  );
}
