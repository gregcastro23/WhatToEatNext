"use client";

/**
 * Drag and Drop Hook for Menu Planner
 * Manages drag state and validation for recipe placement
 *
 * @file src/hooks/useDragAndDrop.ts
 * @created 2026-01-28
 */

import { useState, useCallback } from "react";
import type { Recipe } from "@/types/recipe";
import type { MealType, DayOfWeek, WeeklyMenu } from "@/types/menuPlanner";

export interface DropTarget {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
}

export interface DragState {
  draggedRecipe: Recipe | null;
  dropTarget: DropTarget | null;
  isDragging: boolean;
}

interface UseDragAndDropConfig {
  currentMenu: WeeklyMenu | null;
  onAddMeal: (dayOfWeek: DayOfWeek, mealType: MealType, recipe: Recipe) => void;
}

export function useDragAndDrop(config: UseDragAndDropConfig) {
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Check if a recipe is already used in the same day
  const isValidDrop = useCallback(
    (dayOfWeek: DayOfWeek, _mealType: MealType, recipe: Recipe): boolean => {
      if (!config.currentMenu) return true;

      const dayMeals = config.currentMenu.meals.filter(
        (m) => m.dayOfWeek === dayOfWeek && m.recipe,
      );

      // Prevent same recipe twice in one day
      return !dayMeals.some((m) => m.recipe?.id === recipe.id);
    },
    [config.currentMenu],
  );

  const handleDragStart = useCallback((recipe: Recipe) => {
    setDraggedRecipe(recipe);
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedRecipe(null);
    setDropTarget(null);
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (dayOfWeek: DayOfWeek, mealType: MealType) => {
      setDropTarget({ dayOfWeek, mealType });
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (dayOfWeek: DayOfWeek, mealType: MealType) => {
      if (draggedRecipe && isValidDrop(dayOfWeek, mealType, draggedRecipe)) {
        config.onAddMeal(dayOfWeek, mealType, draggedRecipe);
      }
      setDraggedRecipe(null);
      setDropTarget(null);
      setIsDragging(false);
    },
    [draggedRecipe, isValidDrop, config],
  );

  return {
    dragState: {
      draggedRecipe,
      dropTarget,
      isDragging,
    } as DragState,
    isValidDrop,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
