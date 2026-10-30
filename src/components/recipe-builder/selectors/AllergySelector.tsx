"use client";

/**
 * Exclusions and allergies — the common allergens as chips, plus free-text
 * entry for anything else.
 *
 * @file src/components/recipe-builder/selectors/AllergySelector.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { CustomEntryInput } from "./CustomEntryInput";
import { ToggleChipGroup } from "./ToggleChipGroup";

const COMMON_ALLERGIES: readonly string[] = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
];

export default function AllergySelector(): React.JSX.Element {
  const { allergies, addAllergy, removeAllergy } = useRecipeBuilder();

  return (
    <ToggleChipGroup
      label="Exclusions & Allergies"
      options={COMMON_ALLERGIES}
      tone="red"
      isSelected={(allergy) => allergies.includes(allergy)}
      onToggle={(allergy) =>
        allergies.includes(allergy) ? removeAllergy(allergy) : addAllergy(allergy)
      }
    >
      <CustomEntryInput
        label="Custom allergy or exclusion"
        placeholder="Add custom exclusion..."
        tone="red"
        existing={allergies}
        onAdd={addAllergy}
      />
    </ToggleChipGroup>
  );
}
