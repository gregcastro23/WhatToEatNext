"use client";

/**
 * Recipe Builder Queue - The Alchemical Crucible
 * Displays selected cuisines, ingredients, and cooking methods as removable chips,
 * along with real-time category summaries, clear-all functionality, and live
 * elemental quad-spectrum balance.
 *
 * @file src/components/recipe-builder/RecipeBuilderQueue.tsx
 */

import React, { useMemo } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";

// ===== Chip Component =====

interface SelectionChipProps {
  label: string;
  category: "cuisine" | "ingredient" | "method";
  onRemove: () => void;
}

const SelectionChip: React.FC<SelectionChipProps> = ({ label, category, onRemove }) => {
  const colorMap = {
    cuisine: "bg-purple-500/15 text-purple-200 border-purple-500/30 hover:border-purple-400/60 shadow-[0_0_8px_rgba(168,85,247,0.15)]",
    ingredient: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30 hover:border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]",
    method: "bg-amber-500/15 text-amber-200 border-amber-500/30 hover:border-amber-400/60 shadow-[0_0_8px_rgba(245,158,11,0.15)]",
  };

  const iconMap = {
    cuisine: "🌍",
    ingredient: "🌿",
    method: "🔥",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-all ${colorMap[category]}`}
    >
      <span className="text-[10px]" aria-hidden>{iconMap[category]}</span>
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white transition-colors cursor-pointer"
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

const CategorySummary: React.FC<CategorySummaryProps> = ({
  cuisineCount,
  ingredientCount,
  methodCount,
}) => {
  const total = cuisineCount + ingredientCount + methodCount;
  if (total === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
      <span className="font-semibold text-white t-mono">
        {total} item{total !== 1 ? "s" : ""} queued
      </span>
      <span className="text-white/20">&bull;</span>
      {ingredientCount > 0 && (
        <span className="flex items-center gap-1.5 text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}
        </span>
      )}
      {cuisineCount > 0 && (
        <span className="flex items-center gap-1.5 text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {cuisineCount} cuisine{cuisineCount !== 1 ? "s" : ""}
        </span>
      )}
      {methodCount > 0 && (
        <span className="flex items-center gap-1.5 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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

  // Compute live elemental quad-spectrum balance across queued ingredients
  const elementalBalance = useMemo(() => {
    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    let scoredCount = 0;

    for (const ing of selectedIngredients) {
      if (ing.elementalProperties) {
        totals.Fire += ing.elementalProperties.Fire ?? 0;
        totals.Water += ing.elementalProperties.Water ?? 0;
        totals.Earth += ing.elementalProperties.Earth ?? 0;
        totals.Air += ing.elementalProperties.Air ?? 0;
        scoredCount++;
      }
    }

    const sum = totals.Fire + totals.Water + totals.Earth + totals.Air;
    if (sum <= 0) return null;

    return {
      Fire: Math.round((totals.Fire / sum) * 100),
      Water: Math.round((totals.Water / sum) * 100),
      Earth: Math.round((totals.Earth / sum) * 100),
      Air: Math.round((totals.Air / sum) * 100),
      count: scoredCount,
    };
  }, [selectedIngredients]);

  const hasAnything =
    Boolean(mealType) ||
    flavors.length > 0 ||
    dietaryPreferences.length > 0 ||
    allergies.length > 0 ||
    totalItems > 0;

  if (!hasAnything) {
    return (
      <div
        className={`glass-card-premium rounded-2xl border border-dashed border-white/10 p-6 sm:p-8 text-center ${className}`}
      >
        <div className="text-3xl mb-2 opacity-50" aria-hidden>🌌</div>
        <p className="text-sm font-semibold text-white/90">
          The Alchemical Crucible is Empty
        </p>
        <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
          Search ingredients, select pantry staples, or choose cuisine traditions and cooking methods above to begin formulating your recipe.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`glass-card-premium rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#120e24] to-[#0a0714] p-5 sm:p-6 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden>⚗️</span>
          <h3 className="t-display text-lg font-medium text-white tracking-wide">
            Alchemical Crucible
          </h3>
        </div>
        <button
          type="button"
          onClick={clearQueue}
          className="text-xs text-white/40 hover:text-red-400 hover:bg-red-950/20 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          Clear Crucible
        </button>
      </div>

      {/* Category Summary */}
      <CategorySummary
        cuisineCount={selectedCuisines.length}
        ingredientCount={selectedIngredients.length}
        methodCount={selectedCookingMethods.length}
      />

      {/* Live Elemental Quad-Spectrum Gauge */}
      {elementalBalance && (
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="t-label text-[10px] text-white/60">
              Crucible Elemental Balance ({elementalBalance.count} indexed ingredients)
            </span>
            <div className="flex items-center gap-2 t-mono text-[11px]">
              <span className="text-orange-400">🔥 {elementalBalance.Fire}%</span>
              <span className="text-sky-400">💧 {elementalBalance.Water}%</span>
              <span className="text-emerald-400">🌍 {elementalBalance.Earth}%</span>
              <span className="text-indigo-400">💨 {elementalBalance.Air}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
            {elementalBalance.Fire > 0 && (
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${elementalBalance.Fire}%` }}
                title={`Fire: ${elementalBalance.Fire}%`}
              />
            )}
            {elementalBalance.Water > 0 && (
              <div
                className="h-full bg-sky-400 transition-all"
                style={{ width: `${elementalBalance.Water}%` }}
                title={`Water: ${elementalBalance.Water}%`}
              />
            )}
            {elementalBalance.Earth > 0 && (
              <div
                className="h-full bg-emerald-400 transition-all"
                style={{ width: `${elementalBalance.Earth}%` }}
                title={`Earth: ${elementalBalance.Earth}%`}
              />
            )}
            {elementalBalance.Air > 0 && (
              <div
                className="h-full bg-indigo-400 transition-all"
                style={{ width: `${elementalBalance.Air}%` }}
                title={`Air: ${elementalBalance.Air}%`}
              />
            )}
          </div>
        </div>
      )}

      {/* Meal Type */}
      {mealType && (
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Meal Target</div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-400/40">
            <span>🍽️ {mealType}</span>
            <button
              type="button"
              onClick={() => setMealType(null)}
              className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white cursor-pointer"
              aria-label="Clear meal type"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      {/* Flavors */}
      {flavors.length > 0 && (
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Flavor Notes</div>
          <div className="flex flex-wrap gap-1.5">
            {flavors.map((flavor) => (
              <span
                key={flavor}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-pink-500/15 text-pink-200 border border-pink-400/30 capitalize"
              >
                <span>{flavor}</span>
                <button
                  type="button"
                  onClick={() => removeFlavor(flavor)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white cursor-pointer"
                  aria-label={`Remove ${flavor}`}
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
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Dietary Regimens</div>
          <div className="flex flex-wrap gap-1.5">
            {dietaryPreferences.map((pref) => (
              <span
                key={pref}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-teal-500/15 text-teal-200 border border-teal-400/30"
              >
                <span>{pref}</span>
                <button
                  type="button"
                  onClick={() => removeDietaryPreference(pref)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white cursor-pointer"
                  aria-label={`Remove ${pref}`}
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
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Exclusions</div>
          <div className="flex flex-wrap gap-1.5">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-red-500/15 text-red-200 border border-red-400/30"
              >
                <span>🚫 {allergy}</span>
                <button
                  type="button"
                  onClick={() => removeAllergy(allergy)}
                  className="ml-0.5 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/50 hover:text-white cursor-pointer"
                  aria-label={`Remove ${allergy}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Ingredients</div>
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

      {/* Cuisines */}
      {selectedCuisines.length > 0 && (
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Cuisines</div>
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

      {/* Cooking Methods */}
      {selectedCookingMethods.length > 0 && (
        <div className="mt-3.5">
          <div className="t-label text-[10px] text-white/50 mb-1.5">Techniques</div>
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
