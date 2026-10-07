"use client";

/**
 * Flavor profiles — any number of the six, toggled independently.
 *
 * @file src/components/recipe-builder/selectors/FlavorSelector.tsx
 */

import React from "react";
import { useRecipeBuilder, type FlavorPreference } from "@/contexts/RecipeBuilderContext";
import { ToggleChipGroup } from "./ToggleChipGroup";

const FLAVOR_OPTIONS: readonly FlavorPreference[] = [
  "spicy",
  "sweet",
  "savory",
  "bitter",
  "sour",
  "umami",
];

const FLAVOR_ICONS: Record<FlavorPreference, string> = {
  spicy: "🌶️",
  sweet: "🍯",
  savory: "🧂",
  bitter: "🌿",
  sour: "🍋",
  umami: "🍄",
};

export default function FlavorSelector(): React.JSX.Element {
  const { flavors, toggleFlavor } = useRecipeBuilder();

  return (
    <ToggleChipGroup
      label="Flavor Profiles"
      options={FLAVOR_OPTIONS}
      tone="pink"
      chipClassName="capitalize"
      iconFor={(flavor) => FLAVOR_ICONS[flavor]}
      isSelected={(flavor) => flavors.includes(flavor)}
      onToggle={toggleFlavor}
    />
  );
}
