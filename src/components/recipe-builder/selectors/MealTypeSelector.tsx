"use client";

/**
 * Meal type — one of four, or none. Pressing the selected meal clears it.
 *
 * @file src/components/recipe-builder/selectors/MealTypeSelector.tsx
 */

import React from "react";
import { useRecipeBuilder, type MealType } from "@/contexts/RecipeBuilderContext";
import { ToggleChipGroup } from "./ToggleChipGroup";

const MEAL_TYPES: readonly MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function MealTypeSelector(): React.JSX.Element {
  const { mealType, setMealType } = useRecipeBuilder();

  return (
    <ToggleChipGroup
      label="Meal Type"
      options={MEAL_TYPES}
      tone="purple"
      isSelected={(type) => mealType === type}
      onToggle={(type) => setMealType(mealType === type ? null : type)}
    />
  );
}
