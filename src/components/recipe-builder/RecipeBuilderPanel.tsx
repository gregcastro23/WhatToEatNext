"use client";

/**
 * Recipe Builder Panel
 * Main integrated panel combining ingredient search, preference selectors,
 * the builder queue, and the generate button.
 *
 * @file src/components/recipe-builder/RecipeBuilderPanel.tsx
 */

import React, { useMemo, useState } from "react";
import {
  useRecipeBuilder,
  type MealType,
  type FlavorPreference,
} from "@/contexts/RecipeBuilderContext";
import {
  getAllCuisineNames,
  getCuisineEntry,
} from "@/utils/cuisine/cuisineIndex";
import IngredientSearchBar from "./IngredientSearchBar";
import IngredientSuggestions from "./IngredientSuggestions";
import RecipeBuilderQueue from "./RecipeBuilderQueue";

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

const CUISINE_FALLBACK = [
  "American",
  "Chinese",
  "French",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Thai",
  "Vietnamese",
];

function formatSignatureLabel(
  property: string,
  zscore: number,
): string {
  const direction = zscore >= 0 ? "elevated" : "reduced";
  const magnitude = Math.abs(zscore).toFixed(1);
  return `${property} ${direction} ${magnitude}\u03C3`;
}

const COOKING_METHOD_OPTIONS = [
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

// ===== Sub-Components =====

function MealTypeSelector() {
  const { mealType, setMealType } = useRecipeBuilder();

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

function CuisineSelector() {
  const { selectedCuisines, addCuisine, removeCuisine } = useRecipeBuilder();
  const [customCuisine, setCustomCuisine] = useState("");

  const cuisineOptions = useMemo<string[]>(() => {
    const fromIndex = getAllCuisineNames();
    if (fromIndex.length === 0) return CUISINE_FALLBACK;
    // Merge + dedupe so we always show core cuisines even if the
    // generated manifest is missing one (e.g. first-run sandbox).
    const merged = new Set<string>(fromIndex);
    for (const name of CUISINE_FALLBACK) merged.add(name);
    return Array.from(merged);
  }, []);

  const signatureBySelected = useMemo(() => {
    const map = new Map<
      string,
      { signatures: Array<{ property: string; zscore: number; description?: string }>; sampleSize: number }
    >();
    for (const cuisine of selectedCuisines) {
      const entry = getCuisineEntry(cuisine);
      if (!entry) continue;
      const top = [...(entry.signatures ?? [])]
        .sort((a, b) => Math.abs(b.zscore) - Math.abs(a.zscore))
        .slice(0, 2)
        .map((sig) => ({
          property: String(sig.property),
          zscore: sig.zscore,
          description: sig.description,
        }));
      if (top.length > 0) {
        map.set(cuisine, { signatures: top, sampleSize: entry.sampleSize });
      }
    }
    return map;
  }, [selectedCuisines]);

  const handleAddCustomCuisine = () => {
    const trimmed = customCuisine.trim();
    if (trimmed && !selectedCuisines.includes(trimmed)) {
      addCuisine(trimmed);
      setCustomCuisine("");
    }
  };

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Preferred Cuisines
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {cuisineOptions.map((cuisine) => {
          const isSelected = selectedCuisines.includes(cuisine);
          return (
            <button
              key={cuisine}
              onClick={() => (isSelected ? removeCuisine(cuisine) : addCuisine(cuisine))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              {cuisine}
            </button>
          );
        })}
      </div>
      {signatureBySelected.size > 0 && (
        <div className="mb-2 space-y-1.5">
          {Array.from(signatureBySelected.entries()).map(([cuisine, info]) => (
            <div
              key={cuisine}
              className="rounded-lg border border-purple-100 bg-purple-50/50 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-purple-800">
                  {cuisine}
                </span>
                <span className="text-[10px] text-purple-500">
                  n={info.sampleSize}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {info.signatures.map((sig, i) => (
                  <span
                    key={`${cuisine}-${sig.property}-${i}`}
                    title={sig.description}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-200"
                  >
                    <span aria-hidden>{"\u2728"}</span>
                    {formatSignatureLabel(sig.property, sig.zscore)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={customCuisine}
          onChange={(e) => setCustomCuisine(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustomCuisine()}
          placeholder="Add custom cuisine..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-purple-300 focus:ring-1 focus:ring-purple-100 outline-none"
        />
        <button
          onClick={handleAddCustomCuisine}
          disabled={!customCuisine.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function CookingMethodSelector() {
  const {
    selectedCookingMethods,
    addCookingMethod,
    removeCookingMethod,
  } = useRecipeBuilder();
  const [customMethod, setCustomMethod] = useState("");

  const handleAddCustomMethod = () => {
    const trimmed = customMethod.trim();
    if (trimmed && !selectedCookingMethods.includes(trimmed)) {
      addCookingMethod(trimmed);
      setCustomMethod("");
    }
  };

  return (
    <div>
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
        Cooking Methods
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {COOKING_METHOD_OPTIONS.map((method) => {
          const isSelected = selectedCookingMethods.includes(method);
          return (
            <button
              key={method}
              onClick={() =>
                isSelected ? removeCookingMethod(method) : addCookingMethod(method)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isSelected
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              {method}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customMethod}
          onChange={(e) => setCustomMethod(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustomMethod()}
          placeholder="Add custom method..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-orange-300 focus:ring-1 focus:ring-orange-100 outline-none"
        />
        <button
          onClick={handleAddCustomMethod}
          disabled={!customMethod.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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

      <CollapsibleSection title="Cuisine & Cooking Method">
        <CuisineSelector />
        <CookingMethodSelector />
      </CollapsibleSection>

      {/* Queue Display */}
      <RecipeBuilderQueue />
    </div>
  );
}
