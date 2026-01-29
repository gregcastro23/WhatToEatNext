"use client";

/**
 * RecipeQuickView Component
 * Compact recipe cards with nutrition snapshot for menu planner
 *
 * Provides a quick overview of recipe details without opening a modal.
 * Perfect for drag-and-drop interfaces and inline recipe browsing.
 *
 * @file src/components/menu-planner/RecipeQuickView.tsx
 * @created 2026-01-29
 */

import React, { useState, useCallback } from "react";
import type { Recipe } from "@/types/recipe";

// ============================================================================
// Types
// ============================================================================

interface RecipeQuickViewProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
  onViewDetails?: (recipe: Recipe) => void;
  selected?: boolean;
  compact?: boolean;
  showNutrition?: boolean;
  showElemental?: boolean;
  className?: string;
}

interface ElementalBadgeProps {
  element: string;
  value: number;
}

// ============================================================================
// Helper Components
// ============================================================================

function ElementalBadge({ element, value }: ElementalBadgeProps) {
  const config: Record<string, { emoji: string; color: string; bgColor: string }> = {
    Fire: { emoji: "🔥", color: "text-red-700", bgColor: "bg-red-50" },
    Water: { emoji: "💧", color: "text-blue-700", bgColor: "bg-blue-50" },
    Earth: { emoji: "🌿", color: "text-green-700", bgColor: "bg-green-50" },
    Air: { emoji: "💨", color: "text-purple-700", bgColor: "bg-purple-50" },
  };

  const { emoji, color, bgColor } = config[element] || { emoji: "?", color: "text-gray-700", bgColor: "bg-gray-50" };
  const percentage = Math.round(value * 100);

  return (
    <div
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${bgColor} ${color}`}
      title={`${element}: ${percentage}%`}
    >
      <span>{emoji}</span>
      <span className="font-medium">{percentage}%</span>
    </div>
  );
}

function NutritionSnippet({ recipe }: { recipe: Recipe }) {
  const nutrition = recipe.nutrition;
  if (!nutrition) {
    return (
      <div className="text-xs text-gray-400 italic">
        Nutrition data unavailable
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1">
        <span className="text-purple-600 font-medium">{nutrition.calories || 0}</span>
        <span className="text-gray-400">kcal</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-red-600 font-medium">{nutrition.protein || 0}g</span>
        <span className="text-gray-400">P</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-yellow-600 font-medium">{nutrition.carbs || 0}g</span>
        <span className="text-gray-400">C</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-green-600 font-medium">{nutrition.fat || 0}g</span>
        <span className="text-gray-400">F</span>
      </div>
    </div>
  );
}

function CuisineBadge({ cuisine }: { cuisine: string }) {
  const cuisineEmojis: Record<string, string> = {
    thai: "🇹🇭",
    indian: "🇮🇳",
    mexican: "🇲🇽",
    italian: "🇮🇹",
    japanese: "🇯🇵",
    chinese: "🇨🇳",
    korean: "🇰🇷",
    vietnamese: "🇻🇳",
    french: "🇫🇷",
    greek: "🇬🇷",
    american: "🇺🇸",
    russian: "🇷🇺",
    african: "🌍",
    "middle-eastern": "🌙",
  };

  const emoji = cuisineEmojis[cuisine.toLowerCase()] || "🍽️";

  return (
    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
      <span>{emoji}</span>
      <span className="capitalize">{cuisine}</span>
    </span>
  );
}

function MealTypeBadge({ mealType }: { mealType: string }) {
  const typeConfig: Record<string, { color: string; icon: string }> = {
    breakfast: { color: "bg-yellow-100 text-yellow-700", icon: "🌅" },
    lunch: { color: "bg-blue-100 text-blue-700", icon: "☀️" },
    dinner: { color: "bg-purple-100 text-purple-700", icon: "🌙" },
    snack: { color: "bg-green-100 text-green-700", icon: "🍿" },
    dessert: { color: "bg-pink-100 text-pink-700", icon: "🍰" },
  };

  const config = typeConfig[mealType.toLowerCase()] || { color: "bg-gray-100 text-gray-700", icon: "🍽️" };

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.color}`}>
      <span>{config.icon}</span>
      <span className="capitalize">{mealType}</span>
    </span>
  );
}

function SeasonBadge({ seasons }: { seasons: string[] }) {
  const seasonEmojis: Record<string, string> = {
    spring: "🌸",
    summer: "☀️",
    autumn: "🍂",
    fall: "🍂",
    winter: "❄️",
    all: "🌍",
  };

  if (!seasons || seasons.length === 0) {
    return null;
  }

  // Show first 2 seasons
  const displaySeasons = seasons.slice(0, 2);

  return (
    <div className="flex items-center gap-0.5">
      {displaySeasons.map((season, idx) => (
        <span key={idx} title={season} className="text-xs">
          {seasonEmojis[season.toLowerCase()] || "📅"}
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function RecipeQuickView({
  recipe,
  onSelect,
  onViewDetails,
  selected = false,
  compact = false,
  showNutrition = true,
  showElemental = true,
  className = "",
}: RecipeQuickViewProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = useCallback(() => {
    onSelect?.(recipe);
  }, [onSelect, recipe]);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails?.(recipe);
  }, [onViewDetails, recipe]);

  const elementalProperties = recipe.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Get dominant element
  const dominantElement = Object.entries(elementalProperties).reduce(
    (max, [key, value]) => (value > max[1] ? [key, value] : max),
    ["Fire", 0]
  )[0] as string;

  const dominantConfig: Record<string, string> = {
    Fire: "border-l-red-400",
    Water: "border-l-blue-400",
    Earth: "border-l-green-400",
    Air: "border-l-purple-400",
  };

  if (compact) {
    return (
      <div
        className={`
          bg-white rounded-lg p-2 shadow-sm border border-gray-200
          border-l-4 ${dominantConfig[dominantElement] || "border-l-gray-400"}
          cursor-pointer transition-all duration-200
          ${selected ? "ring-2 ring-purple-500 ring-offset-1" : ""}
          ${isHovered ? "shadow-md" : ""}
          ${className}
        `}
        onClick={handleSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-800 truncate">
              {recipe.name}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              {recipe.cuisine && (
                <span className="text-xs text-gray-500">{recipe.cuisine}</span>
              )}
              {recipe.nutrition?.calories && (
                <span className="text-xs text-purple-600 font-medium">
                  {recipe.nutrition.calories}kcal
                </span>
              )}
            </div>
          </div>
          <SeasonBadge seasons={recipe.season as string[]} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md border border-gray-200
        border-l-4 ${dominantConfig[dominantElement] || "border-l-gray-400"}
        overflow-hidden cursor-pointer transition-all duration-200
        ${selected ? "ring-2 ring-purple-500 ring-offset-2" : ""}
        ${isHovered ? "shadow-lg transform -translate-y-0.5" : ""}
        ${className}
      `}
      onClick={handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800 truncate">
              {recipe.name}
            </h3>
            {recipe.description && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              className="shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
              title="View details"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {recipe.cuisine && <CuisineBadge cuisine={recipe.cuisine} />}
          {recipe.mealType && Array.isArray(recipe.mealType) && recipe.mealType.length > 0 && (
            <MealTypeBadge mealType={recipe.mealType[0]} />
          )}
          <SeasonBadge seasons={recipe.season as string[]} />
        </div>
      </div>

      {/* Elemental properties */}
      {showElemental && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(elementalProperties).map(([element, value]) => (
              <ElementalBadge key={element} element={element} value={value} />
            ))}
          </div>
        </div>
      )}

      {/* Nutrition summary */}
      {showNutrition && (
        <div className="px-3 py-2 border-t border-gray-100">
          <NutritionSnippet recipe={recipe} />
        </div>
      )}

      {/* Quick info footer */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {recipe.prepTime && (
              <span title="Prep time">🕐 {recipe.prepTime}</span>
            )}
            {recipe.cookTime && (
              <span title="Cook time">🍳 {recipe.cookTime}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {recipe.numberOfServings && (
              <span title="Servings">🍽️ {recipe.numberOfServings}</span>
            )}
            {recipe.spiceLevel !== undefined && (
              <span title={`Spice level: ${recipe.spiceLevel}`}>
                {"🌶️".repeat(Math.min(3, Math.ceil(Number(recipe.spiceLevel) / 3)))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Recipe Grid Component
// ============================================================================

interface RecipeGridProps {
  recipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  onViewDetails?: (recipe: Recipe) => void;
  selectedRecipeId?: string;
  compact?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function RecipeGrid({
  recipes,
  onSelectRecipe,
  onViewDetails,
  selectedRecipeId,
  compact = false,
  columns = 3,
  className = "",
}: RecipeGridProps) {
  const gridCols: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {recipes.map((recipe) => (
        <RecipeQuickView
          key={recipe.id}
          recipe={recipe}
          onSelect={onSelectRecipe}
          onViewDetails={onViewDetails}
          selected={selectedRecipeId === recipe.id}
          compact={compact}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Recipe List Component (horizontal scroll)
// ============================================================================

interface RecipeListProps {
  recipes: Recipe[];
  onSelectRecipe?: (recipe: Recipe) => void;
  onViewDetails?: (recipe: Recipe) => void;
  selectedRecipeId?: string;
  className?: string;
}

export function RecipeList({
  recipes,
  onSelectRecipe,
  onViewDetails,
  selectedRecipeId,
  className = "",
}: RecipeListProps) {
  return (
    <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
      {recipes.map((recipe) => (
        <div key={recipe.id} className="shrink-0 w-64">
          <RecipeQuickView
            recipe={recipe}
            onSelect={onSelectRecipe}
            onViewDetails={onViewDetails}
            selected={selectedRecipeId === recipe.id}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Mini Recipe Card (for drag-and-drop)
// ============================================================================

interface MiniRecipeCardProps {
  recipe: Recipe;
  onClick?: (recipe: Recipe) => void;
  className?: string;
}

export function MiniRecipeCard({ recipe, onClick, className = "" }: MiniRecipeCardProps) {
  const handleClick = useCallback(() => {
    onClick?.(recipe);
  }, [onClick, recipe]);

  return (
    <div
      className={`
        flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200
        shadow-sm hover:shadow-md cursor-pointer transition-all
        ${className}
      `}
      onClick={handleClick}
      draggable
    >
      {/* Elemental indicator dot */}
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: getElementalColor(recipe.elementalProperties || {}),
        }}
      />

      {/* Recipe info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 truncate">
          {recipe.name}
        </p>
        <p className="text-xs text-gray-500">
          {recipe.nutrition?.calories || 0} kcal
        </p>
      </div>
    </div>
  );
}

// Helper function
function getElementalColor(elementalProperties: { Fire?: number; Water?: number; Earth?: number; Air?: number }): string {
  const colors = {
    Fire: "#ef4444",
    Water: "#3b82f6",
    Earth: "#22c55e",
    Air: "#a855f7",
  };

  const entries = Object.entries(elementalProperties) as [keyof typeof colors, number][];
  if (entries.length === 0) return "#6b7280";

  const dominant = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
  return colors[dominant[0]] || "#6b7280";
}
