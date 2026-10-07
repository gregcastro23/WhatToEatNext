"use client";

/**
 * Thermal and cooking techniques — common methods as chips, plus free-text
 * entry for anything else (sous-vide, confit).
 *
 * @file src/components/recipe-builder/selectors/CookingMethodSelector.tsx
 */

import React from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { CustomEntryInput } from "./CustomEntryInput";
import { ToggleChipGroup } from "./ToggleChipGroup";

const COOKING_METHOD_OPTIONS: readonly string[] = [
  "Baked",
  "Blended",
  "Braised",
  "Fried",
  "Grilled",
  "Poached",
  "Roasted",
  "Sauteed",
  "Slow-Cooked",
  "Steamed",
  "Stir-Fried",
];

export default function CookingMethodSelector(): React.JSX.Element {
  const { selectedCookingMethods, addCookingMethod, removeCookingMethod } =
    useRecipeBuilder();

  return (
    <ToggleChipGroup
      label="Thermal & Cooking Techniques"
      options={COOKING_METHOD_OPTIONS}
      tone="amber"
      isSelected={(method) => selectedCookingMethods.includes(method)}
      onToggle={(method) =>
        selectedCookingMethods.includes(method)
          ? removeCookingMethod(method)
          : addCookingMethod(method)
      }
    >
      <CustomEntryInput
        label="Custom cooking method"
        placeholder="Add custom method (e.g. Sous-Vide, Confit)..."
        tone="amber"
        existing={selectedCookingMethods}
        onAdd={addCookingMethod}
      />
    </ToggleChipGroup>
  );
}
