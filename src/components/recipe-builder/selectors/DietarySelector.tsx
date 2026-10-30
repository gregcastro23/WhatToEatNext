"use client";

/**
 * Dietary regimens — toggled independently.
 *
 * @file src/components/recipe-builder/selectors/DietarySelector.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { ToggleChipGroup } from "./ToggleChipGroup";

const DIETARY_OPTIONS: readonly string[] = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Sodium",
  "Nut-Free",
];

export default function DietarySelector(): React.JSX.Element {
  const { dietaryPreferences, addDietaryPreference, removeDietaryPreference } =
    useRecipeBuilder();

  return (
    <ToggleChipGroup
      label="Dietary Regimens"
      options={DIETARY_OPTIONS}
      tone="teal"
      isSelected={(pref) => dietaryPreferences.includes(pref)}
      onToggle={(pref) =>
        dietaryPreferences.includes(pref)
          ? removeDietaryPreference(pref)
          : addDietaryPreference(pref)
      }
    />
  );
}
