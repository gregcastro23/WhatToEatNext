"use client";

/**
 * Ingredient Suggestions
 * Shows complementary ingredient suggestions after a user selects an ingredient.
 * Uses alchemical pairing logic: protein→vegetables/spices, Fire→Water balance, etc.
 *
 * @file src/components/recipe-builder/IngredientSuggestions.tsx
 */

import React, { useMemo } from "react";
import type { SelectedIngredient } from "@/contexts/RecipeBuilderContext";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { getAllIngredients } from "@/utils/foodRecommender";
import type { EnhancedIngredient } from "@/utils/foodRecommender";

// Category groupings for pairing logic
const PROTEIN_CATEGORIES = new Set([
  "meats",
  "poultry",
  "seafood",
  "eggs",
  "dairy",
  "plant-based proteins",
  "legumes",
]);
const VEGETABLE_CATEGORIES = new Set(["vegetables"]);
const SPICE_HERB_CATEGORIES = new Set(["spices", "herbs", "seasonings"]);
const GRAIN_CATEGORIES = new Set(["grains"]);

// Element complementary pairs (not opposing - per project rules, elements reinforce)
// But we suggest balancing items for Monica Score optimization
const ELEMENT_COMPLEMENTS: Record<string, string[]> = {
  Fire: ["Water", "Earth"],
  Water: ["Fire", "Air"],
  Earth: ["Air", "Water"],
  Air: ["Earth", "Fire"],
};

// Planetary associations for suggestion flavor text
const PLANET_ELEMENTS: Record<string, string> = {
  Sun: "Fire",
  Moon: "Water",
  Mercury: "Air",
  Venus: "Earth",
  Mars: "Fire",
  Jupiter: "Air",
  Saturn: "Earth",
};

interface SuggestionItem {
  ingredient: EnhancedIngredient;
  reason: string;
  score: number;
}

function getDominantElement(
  props: Record<string, number> | undefined,
): { element: string; value: number } {
  if (!props) return { element: "Earth", value: 0.25 };
  let maxEl = "Earth";
  let maxVal = 0;
  for (const [el, val] of Object.entries(props)) {
    if (typeof val === "number" && val > maxVal) {
      maxVal = val;
      maxEl = el;
    }
  }
  return { element: maxEl, value: maxVal };
}

function getCategoryType(
  category: string | undefined,
): "protein" | "vegetable" | "spice" | "grain" | "other" {
  if (!category) return "other";
  const lower = category.toLowerCase();
  if (PROTEIN_CATEGORIES.has(lower)) return "protein";
  if (VEGETABLE_CATEGORIES.has(lower)) return "vegetable";
  if (SPICE_HERB_CATEGORIES.has(lower)) return "spice";
  if (GRAIN_CATEGORIES.has(lower)) return "grain";
  return "other";
}

function computeSuggestions(
  selectedIngredients: SelectedIngredient[],
  allIngredients: EnhancedIngredient[],
): SuggestionItem[] {
  if (selectedIngredients.length === 0) return [];

  const selectedNames = new Set(
    selectedIngredients.map((i) => i.name.toLowerCase()),
  );

  // Analyze what's selected
  const selectedCategories = new Set<string>();
  const selectedElements: Record<string, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  for (const sel of selectedIngredients) {
    if (sel.category) selectedCategories.add(getCategoryType(sel.category));
    if (sel.elementalProperties) {
      for (const [el, val] of Object.entries(sel.elementalProperties)) {
        if (typeof val === "number") {
          selectedElements[el] = (selectedElements[el] || 0) + val;
        }
      }
    }
  }

  // Find dominant element in the selection
  const { element: dominantEl } = getDominantElement(selectedElements);
  const complementElements = ELEMENT_COMPLEMENTS[dominantEl] || ["Earth"];

  // Determine which categories to suggest
  const suggestCategories: Set<string> = new Set();
  if (selectedCategories.has("protein")) {
    suggestCategories.add("vegetable");
    suggestCategories.add("spice");
    suggestCategories.add("grain");
  }
  if (selectedCategories.has("vegetable")) {
    suggestCategories.add("protein");
    suggestCategories.add("spice");
  }
  if (selectedCategories.has("grain")) {
    suggestCategories.add("vegetable");
    suggestCategories.add("spice");
  }
  if (selectedCategories.has("spice")) {
    suggestCategories.add("protein");
    suggestCategories.add("vegetable");
  }
  // Default: suggest everything complementary
  if (suggestCategories.size === 0) {
    suggestCategories.add("vegetable");
    suggestCategories.add("spice");
    suggestCategories.add("protein");
  }

  const suggestions: SuggestionItem[] = [];

  for (const ing of allIngredients) {
    if (selectedNames.has(ing.name.toLowerCase())) continue;

    const ingCategory = getCategoryType(ing.category);
    if (!suggestCategories.has(ingCategory)) continue;

    const ingDominant = getDominantElement(
      ing.elementalProperties as Record<string, number>,
    );

    let score = 0;
    let reason = "";

    // Category synergy bonus
    if (suggestCategories.has(ingCategory)) {
      score += 3;
    }

    // Elemental complement bonus (for Monica Score balancing)
    if (complementElements.includes(ingDominant.element)) {
      score += 2;
      reason = `Balances ${dominantEl} with ${ingDominant.element}`;
    }

    // Same element reinforcement (smaller bonus)
    if (ingDominant.element === dominantEl) {
      score += 1;
      reason = reason || `Reinforces ${dominantEl} energy`;
    }

    // Category-specific reasons
    if (!reason) {
      if (ingCategory === "vegetable") reason = "Adds freshness";
      else if (ingCategory === "spice") reason = "Adds flavor depth";
      else if (ingCategory === "protein") reason = "Adds protein";
      else if (ingCategory === "grain") reason = "Adds substance";
      else reason = "Complements your selection";
    }

    if (score > 0) {
      suggestions.push({ ingredient: ing, reason, score });
    }
  }

  // Sort by score and return top 8
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions.slice(0, 8);
}

// ===== Component =====

interface IngredientSuggestionsProps {
  className?: string;
}

export default function IngredientSuggestions({
  className = "",
}: IngredientSuggestionsProps) {
  const { selectedIngredients, addIngredient, hasIngredient } =
    useRecipeBuilder();

  const allIngredients = useMemo(() => {
    try {
      return getAllIngredients();
    } catch {
      return [];
    }
  }, []);

  const suggestions = useMemo(
    () => computeSuggestions(selectedIngredients, allIngredients),
    [selectedIngredients, allIngredients],
  );

  if (selectedIngredients.length === 0 || suggestions.length === 0) {
    return null;
  }

  const handleAdd = (ing: EnhancedIngredient) => {
    addIngredient({
      name: ing.name,
      category: ing.category,
      elementalProperties: ing.elementalProperties as SelectedIngredient["elementalProperties"],
    });
  };

  // Build a context message based on what's selected
  const lastSelected = selectedIngredients[selectedIngredients.length - 1];
  const lastCategory = getCategoryType(lastSelected.category);
  const lastDominant = getDominantElement(
    lastSelected.elementalProperties as Record<string, number>,
  );

  const planetKey = Object.entries(PLANET_ELEMENTS).find(
    ([, el]) => el === lastDominant.element,
  );
  const planetName = planetKey ? planetKey[0] : null;

  return (
    <div className={`rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 ${className}`}>
      <div className="mb-2">
        <p className="text-xs text-indigo-700 font-medium">
          Pairs well with {lastSelected.name}
          {planetName && (
            <span className="text-indigo-500">
              {" "}
              ({planetName} energy)
            </span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((s) => {
          const isAlready = hasIngredient(s.ingredient.name);
          return (
            <button
              key={s.ingredient.name}
              onClick={() => !isAlready && handleAdd(s.ingredient)}
              disabled={isAlready}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all
                ${isAlready
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 cursor-pointer"
                }
              `}
              title={s.reason}
            >
              <span>{s.ingredient.name}</span>
              {!isAlready && (
                <span className="text-indigo-400">+</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-indigo-400 mt-1.5">
        Click to add. Suggestions based on elemental harmony and category balance.
      </p>
    </div>
  );
}
