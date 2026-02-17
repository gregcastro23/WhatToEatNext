"use client";

/**
 * Recipe Builder Panel
 * Main integrated panel combining ingredient search, preference selectors,
 * the builder queue, and the generate button.
 *
 * @file src/components/recipe-builder/RecipeBuilderPanel.tsx
 */

import React, { useState } from "react";
import {
  useRecipeBuilder,
  type MealType,
  type FlavorPreference,
} from "@/contexts/RecipeBuilderContext";
import IngredientSearchBar from "./IngredientSearchBar";
import IngredientSuggestions from "./IngredientSuggestions";
import RecipeBuilderQueue from "./RecipeBuilderQueue";
import GenerateRecipeButton from "./GenerateRecipeButton";

// ===== Constants =====

const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const FLAVOR_OPTIONS: FlavorPreference[] = [
  "spicy",
  "sweet",
  "savory",
  "bitter",
  "sour",
  "umami",
];

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Sodium",
  "Nut-Free",
];

const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk",
  "Eggs",
  "Wheat",
  "Soy",
  "Fish",
  "Shellfish",
];

// ===== Sub-Components =====

function MealTypeSelector() {
  const { mealType, setMealType } = useRecipeBuilder();

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Meal Type
      </label>
      <div className="flex flex-wrap gap-2">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setMealType(mealType === type ? null : type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              mealType === type
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

function FlavorSelector() {
  const { flavors, toggleFlavor } = useRecipeBuilder();

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Flavor Preferences
      </label>
      <div className="flex flex-wrap gap-2">
        {FLAVOR_OPTIONS.map((flavor) => (
          <button
            key={flavor}
            onClick={() => toggleFlavor(flavor)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${
              flavors.includes(flavor)
                ? "bg-pink-600 text-white border-pink-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
            }`}
          >
            {flavor}
          </button>
        ))}
      </div>
    </div>
  );
}

function DietarySelector() {
  const { dietaryPreferences, addDietaryPreference, removeDietaryPreference } =
    useRecipeBuilder();

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Dietary Preferences
      </label>
      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((pref) => {
          const isSelected = dietaryPreferences.includes(pref);
          return (
            <button
              key={pref}
              onClick={() =>
                isSelected
                  ? removeDietaryPreference(pref)
                  : addDietaryPreference(pref)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
              }`}
            >
              {pref}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AllergySelector() {
  const { allergies, addAllergy, removeAllergy } = useRecipeBuilder();
  const [customAllergy, setCustomAllergy] = useState("");

  const handleAddCustom = () => {
    const trimmed = customAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      addAllergy(trimmed);
      setCustomAllergy("");
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Allergies / Exclusions
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {COMMON_ALLERGIES.map((allergy) => {
          const isSelected = allergies.includes(allergy);
          return (
            <button
              key={allergy}
              onClick={() =>
                isSelected ? removeAllergy(allergy) : addAllergy(allergy)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:bg-red-50"
              }`}
            >
              {allergy}
            </button>
          );
        })}
      </div>
      {/* Custom allergy input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customAllergy}
          onChange={(e) => setCustomAllergy(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          placeholder="Add custom..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-red-300 focus:ring-1 focus:ring-red-100 outline-none"
        />
        <button
          onClick={handleAddCustom}
          disabled={!customAllergy.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ===== Collapsible Section =====

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-gray-400 text-xs">{isOpen ? "\u25B2" : "\u25BC"}</span>
      </button>
      {isOpen && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

// ===== Main Panel =====

interface RecipeBuilderPanelProps {
  className?: string;
}

export default function RecipeBuilderPanel({
  className = "",
}: RecipeBuilderPanelProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
          Recipe Builder
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Search ingredients, set preferences, and generate cosmically-aligned recipes
        </p>
      </div>

      {/* Ingredient Search */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">
          Search Ingredients
        </label>
        <IngredientSearchBar />
      </div>

      {/* Smart Ingredient Suggestions */}
      <IngredientSuggestions />

      {/* Preferences */}
      <CollapsibleSection title="Meal & Flavor Preferences" defaultOpen>
        <MealTypeSelector />
        <FlavorSelector />
      </CollapsibleSection>

      <CollapsibleSection title="Dietary & Allergies">
        <DietarySelector />
        <AllergySelector />
      </CollapsibleSection>

      {/* Queue Display */}
      <RecipeBuilderQueue />

      {/* Generate Button */}
      <GenerateRecipeButton />
    </div>
  );
}
