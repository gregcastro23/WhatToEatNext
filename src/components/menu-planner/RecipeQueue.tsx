"use client";

/**
 * Recipe Queue Sidebar Component
 * Displays saved recipes for easy access and planning
 *
 * @file src/components/menu-planner/RecipeQueue.tsx
 * @created 2026-01-10 (Phase 2)
 */

import React, { useState } from "react";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import type { QueuedRecipe } from "@/contexts/RecipeQueueContext";
import type { MealType } from "@/types/menuPlanner";

interface RecipeQueueProps {
  onSelectRecipe?: (recipe: QueuedRecipe) => void;
  className?: string;
}

/**
 * Get meal type icon
 */
function getMealTypeIcon(mealType: string): string {
  const icons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return icons[mealType.toLowerCase()] || "🍽️";
}

/**
 * Queue Item Card Component
 */
function QueueItemCard({
  item,
  onRemove,
  onSelect,
}: {
  item: QueuedRecipe;
  onRemove: () => void;
  onSelect: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const recipe = item.recipe;

  // Calculate days since added
  const daysSinceAdded = Math.floor(
    (Date.now() - new Date(item.addedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "queue-recipe",
        recipe,
        queueItemId: item.id,
      }),
    );

    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`
        bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-all p-3 mb-2 cursor-move
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate text-gray-800">
            {recipe.name}
          </h4>
          {recipe.cuisine && (
            <p className="text-xs text-gray-500">{recipe.cuisine}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="ml-2 text-gray-400 hover:text-red-600 transition-colors text-lg"
          title="Remove from queue"
        >
          ×
        </button>
      </div>

      {/* Quick Info */}
      <div className="flex items-center gap-3 mb-2 text-xs text-gray-600">
        {recipe.prepTime && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{recipe.prepTime}</span>
          </div>
        )}
        {recipe.nutrition?.calories && (
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span>{recipe.nutrition.calories} cal</span>
          </div>
        )}
      </div>

      {/* Suggested Meal Types */}
      {item.suggestedMealTypes && item.suggestedMealTypes.length > 0 && (
        <div className="flex gap-1 mb-2">
          {item.suggestedMealTypes.map((mealType) => (
            <span
              key={mealType}
              className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
              title={`Suggested for ${mealType}`}
            >
              {getMealTypeIcon(mealType)}
            </span>
          ))}
        </div>
      )}

      {/* Elemental Properties Bar */}
      {recipe.elementalProperties && (
        <div className="mb-2">
          <div className="flex gap-1 h-1.5">
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
                    className={`${color.bg} rounded-full`}
                    style={{ width: `${width}%` }}
                    title={`${element}: ${Math.round(value * 100)}%`}
                  />
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {item.notes && (
        <div className="mb-2 text-xs text-gray-600 italic">"{item.notes}"</div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? "Show less ↑" : "Show more ↓"}
        </button>
        <button
          onClick={onSelect}
          className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Use Recipe
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {recipe.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-3">
              {recipe.description}
            </p>
          )}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">
                Ingredients:
              </p>
              <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                  <li key={idx} className="truncate">
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-gray-400">
                    +{recipe.ingredients.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          <div className="mt-2 text-xs text-gray-400">
            Added {daysSinceAdded === 0 ? "today" : `${daysSinceAdded}d ago`}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main Recipe Queue Sidebar Component
 */
export default function RecipeQueue({
  onSelectRecipe,
  className = "",
}: RecipeQueueProps) {
  const { queue, queueSize, removeFromQueue, clearQueue } = useRecipeQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`bg-gradient-to-b from-purple-50 to-white border-2 border-purple-200 rounded-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg text-purple-900">Recipe Queue</h3>
          {queueSize > 0 && (
            <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
              {queueSize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {queueSize > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              title="Clear queue"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-purple-700 hover:text-purple-900 transition-colors"
            title={isCollapsed ? "Expand queue" : "Collapse queue"}
          >
            {isCollapsed ? "▶" : "▼"}
          </button>
        </div>
      </div>

      {/* Queue Content */}
      {!isCollapsed && (
        <div className="p-4">
          {queueSize === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-30">📋</div>
              <p className="text-sm text-gray-500 mb-1">No recipes in queue</p>
              <p className="text-xs text-gray-400">
                Add recipes from the selector to plan later
              </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {queue.map((item) => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromQueue(item.id)}
                  onSelect={() => onSelectRecipe?.(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      {!isCollapsed && queueSize > 0 && (
        <div className="px-4 pb-3 text-xs text-gray-500 text-center">
          💡 Tip: Click "Use Recipe" to add to your meal plan
        </div>
      )}
    </div>
  );
}
