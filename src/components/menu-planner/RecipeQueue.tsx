"use client";

/**
 * Recipe Queue Sidebar Component
 * Displays saved recipes for easy access and planning
 *
 * @file src/components/menu-planner/RecipeQueue.tsx
 * @created 2026-01-10 (Phase 2)
 */

import Link from "next/link";
import React, { useState } from "react";
import { useRecipeQueue } from "@/contexts/RecipeQueueContext";
import type { QueuedRecipe } from "@/contexts/RecipeQueueContext";
import { roundedCalories } from "@/utils/roundedCalories";

interface RecipeQueueProps {
  onSelectRecipe?: (recipe: QueuedRecipe) => void;
  className?: string;
  compact?: boolean;
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
  const { recipe } = item;

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

  const calories = roundedCalories(recipe.nutrition?.calories);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Native drag events belong to this focusable list item; its nested controls provide the keyboard actions.
    <div
      className={`
        bg-surface-container-low/70 rounded-lg border border-muted hover:border-active-violet transition-all p-3 mb-2 cursor-grab active:cursor-grabbing
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="listitem"
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate text-primary">
            <Link
              href={`/recipes/${recipe.id}`}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="hover:text-active-violet hover:underline"
            >
              {recipe.name}
            </Link>
          </h4>
          {recipe.cuisine && (
            <p className="text-xs text-on-surface-variant">{recipe.cuisine}</p>
          )}
        </div>
        <button
          onClick={onRemove}
          className="ml-2 text-on-surface-variant/40 hover:text-error transition-colors text-lg"
          title="Remove from queue"
        >
          ×
        </button>
      </div>

      {/* Quick Info */}
      <div className="flex items-center gap-3 mb-2 text-xs text-on-surface-variant font-mono">
        {recipe.prepTime && recipe.prepTime !== "0" && (
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{recipe.prepTime}</span>
          </div>
        )}
        {calories !== null && (
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span>{calories} cal</span>
          </div>
        )}
      </div>

      {/* Suggested Meal Types */}
      {item.suggestedMealTypes && item.suggestedMealTypes.length > 0 && (
        <div className="flex gap-1 mb-2">
          {item.suggestedMealTypes.map((mealType) => (
            <span
              key={mealType}
              className="text-xs px-2 py-0.5 bg-active-violet/10 text-active-violet border border-active-violet/20 rounded"
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
                  Fire: { bg: "bg-fire-spirit", text: "text-fire-spirit" },
                  Water: { bg: "bg-water-essence", text: "text-water-essence" },
                  Earth: { bg: "bg-earth-matter", text: "text-earth-matter" },
                  Air: { bg: "bg-air-substance", text: "text-air-substance" },
                };
                const color = elementColors[element] ?? {
                  bg: "bg-muted",
                  text: "text-on-surface-variant",
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
        <div className="mb-2 text-xs text-on-surface-variant italic">&quot;{item.notes}&quot;</div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          {isExpanded ? "Show less ↑" : "Show more ↓"}
        </button>
        <button
          onClick={onSelect}
          className="px-3 py-1 text-xs rounded bg-active-violet text-background font-semibold hover:bg-white transition-colors cursor-pointer"
        >
          Place Recipe
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-muted">
          {recipe.description && (
            <p className="text-xs text-on-surface-variant mb-2 line-clamp-3">
              {recipe.description}
            </p>
          )}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div>
              <p className="text-xs font-medium text-primary mb-1">
                Ingredients:
              </p>
              <ul className="text-xs text-on-surface-variant list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                  <li key={idx} className="truncate">
                    {ing.amount} {ing.unit} {ing.name}
                  </li>
                ))}
                {recipe.ingredients.length > 5 && (
                  <li className="text-on-surface-variant/60">
                    +{recipe.ingredients.length - 5} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[10px] text-on-surface-variant/60 font-mono">
              Added {daysSinceAdded === 0 ? "today" : `${daysSinceAdded}d ago`}
            </div>
            <Link
              href={`/recipes/${recipe.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-active-violet hover:underline font-medium"
            >
              View Full Recipe ↗
            </Link>
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
  compact = false,
}: RecipeQueueProps) {
  const { queue, queueSize, removeFromQueue, clearQueue } = useRecipeQueue();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={
        compact
          ? `flex flex-col h-full overflow-hidden ${className}`
          : `alchm-panel border border-muted rounded-xl ${className}`
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted bg-surface-container-low/30">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-primary">Recipe Queue</h3>
          {queueSize > 0 && (
            <span className="px-2 py-0.5 bg-active-violet text-background text-xs rounded-full font-bold">
              {queueSize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {queueSize > 0 && (
            <button
              onClick={clearQueue}
              className="text-xs text-on-surface-variant hover:text-error transition-colors cursor-pointer"
              title="Clear queue"
            >
              Clear All
            </button>
          )}
          {!compact && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              title={isCollapsed ? "Expand queue" : "Collapse queue"}
            >
              {isCollapsed ? "▶" : "▼"}
            </button>
          )}
        </div>
      </div>

      {/* Queue Content */}
      {(!isCollapsed || compact) && (
        <div className="p-4 flex-1 overflow-y-auto">
          {queueSize === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-30">📋</div>
              <p className="text-sm text-primary mb-1">No recipes in queue</p>
              <p className="text-xs text-on-surface-variant">
                Click &quot;Save for later&quot; on recipes in Browse to queue them here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
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
      {(!isCollapsed || compact) && queueSize > 0 && (
        <div className="p-3 border-t border-muted text-xs text-on-surface-variant text-center font-mono">
          Drag recipes into calendar slots or click Place
        </div>
      )}
    </div>
  );
}
