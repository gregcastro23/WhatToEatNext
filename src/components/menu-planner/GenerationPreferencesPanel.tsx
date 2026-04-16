"use client";

/**
 * Generation Preferences Panel
 * Collapsible panel for customizing meal generation preferences.
 * Persists via MenuPlannerContext to localStorage.
 *
 * @file src/components/menu-planner/GenerationPreferencesPanel.tsx
 * @created 2026-04-16
 */

import React, { useState, useCallback } from "react";
import { useMenuPlanner, type FlavorPreference } from "@/contexts/MenuPlannerContext";

const AVAILABLE_CUISINES = [
  "Italian", "Mexican", "Japanese", "Chinese", "Indian", "Thai",
  "French", "Greek", "Middle-Eastern", "Vietnamese", "Korean",
  "American", "African", "Russian",
] as const;

const DIETARY_OPTIONS = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
  { id: "nut-free", label: "Nut-Free" },
  { id: "low-carb", label: "Low-Carb" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
] as const;

const COOKING_METHODS = [
  "Grill", "Roast", "Bake", "Steam", "Stir-Fry", "Braise",
  "Slow Cook", "Saute", "Poach", "Raw/No-Cook", "Ferment", "Smoke",
] as const;

const FLAVOR_OPTIONS: { id: FlavorPreference; label: string }[] = [
  { id: "spicy", label: "Spicy" },
  { id: "sweet", label: "Sweet" },
  { id: "savory", label: "Savory" },
  { id: "bitter", label: "Bitter" },
  { id: "sour", label: "Sour" },
  { id: "umami", label: "Umami" },
];

const PREP_TIME_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
  { value: null, label: "No Limit" },
] as const;

interface GenerationPreferencesPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function GenerationPreferencesPanel({
  isOpen,
  onToggle,
}: GenerationPreferencesPanelProps) {
  const {
    generationPreferences,
    updateGenerationPreference,
    resetGenerationPreferences,
  } = useMenuPlanner();

  const [excludeInput, setExcludeInput] = useState("");
  const [includeInput, setIncludeInput] = useState("");

  // Count active preferences
  const activeCount =
    generationPreferences.preferredCuisines.length +
    generationPreferences.dietaryRestrictions.length +
    generationPreferences.preferredCookingMethods.length +
    generationPreferences.flavorPreferences.length +
    generationPreferences.excludeIngredients.length +
    generationPreferences.requiredIngredients.length +
    (generationPreferences.maxPrepTimeMinutes !== null ? 1 : 0);

  // Toggle helpers
  const toggleArrayItem = useCallback(
    <K extends "preferredCuisines" | "dietaryRestrictions" | "preferredCookingMethods" | "flavorPreferences">(
      key: K,
      item: string,
    ) => {
      const current = generationPreferences[key] as string[];
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item];
      updateGenerationPreference(key, updated as any);
    },
    [generationPreferences, updateGenerationPreference],
  );

  const addChipItem = useCallback(
    (key: "excludeIngredients" | "requiredIngredients", value: string) => {
      const trimmed = value.trim().toLowerCase();
      if (!trimmed) return;
      const current = generationPreferences[key];
      if (!current.includes(trimmed)) {
        updateGenerationPreference(key, [...current, trimmed]);
      }
    },
    [generationPreferences, updateGenerationPreference],
  );

  const removeChipItem = useCallback(
    (key: "excludeIngredients" | "requiredIngredients", value: string) => {
      const current = generationPreferences[key];
      updateGenerationPreference(key, current.filter((i) => i !== value));
    },
    [generationPreferences, updateGenerationPreference],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    key: "excludeIngredients" | "requiredIngredients",
    inputValue: string,
    setInputValue: (v: string) => void,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChipItem(key, inputValue);
      setInputValue("");
    }
  };

  // Build compact summary for collapsed view
  const summaryParts: string[] = [];
  if (generationPreferences.preferredCuisines.length > 0) {
    summaryParts.push(generationPreferences.preferredCuisines.slice(0, 3).join(", ") +
      (generationPreferences.preferredCuisines.length > 3 ? ` +${generationPreferences.preferredCuisines.length - 3}` : ""));
  }
  if (generationPreferences.dietaryRestrictions.length > 0) {
    summaryParts.push(generationPreferences.dietaryRestrictions.slice(0, 2).join(", ") +
      (generationPreferences.dietaryRestrictions.length > 2 ? ` +${generationPreferences.dietaryRestrictions.length - 2}` : ""));
  }
  if (generationPreferences.maxPrepTimeMinutes !== null) {
    summaryParts.push(`< ${generationPreferences.maxPrepTimeMinutes}min`);
  }
  if (generationPreferences.flavorPreferences.length > 0) {
    summaryParts.push(generationPreferences.flavorPreferences.join(", "));
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 mt-3 overflow-hidden">
      {/* Collapsed Header Bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <span className="text-sm font-semibold text-gray-700">
            Generation Preferences
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 text-purple-700">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isOpen && activeCount > 0 && summaryParts.length > 0 && (
            <span className="text-xs text-gray-500 hidden sm:inline truncate max-w-xs">
              {summaryParts.join(" | ")}
            </span>
          )}
          <span className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Expanded Panel */}
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Reset Button */}
          {activeCount > 0 && (
            <div className="flex justify-end pt-3">
              <button
                onClick={resetGenerationPreferences}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Cuisine Preferences */}
          <div className="pt-3">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Preferred Cuisines
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CUISINES.map((cuisine) => {
                const isSelected = generationPreferences.preferredCuisines.includes(cuisine);
                return (
                  <button
                    key={cuisine}
                    onClick={() => toggleArrayItem("preferredCuisines", cuisine)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cuisine}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Dietary Restrictions
            </h4>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => {
                const isSelected = generationPreferences.dietaryRestrictions.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleArrayItem("dietaryRestrictions", option.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cooking Methods */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Cooking Methods
            </h4>
            <div className="flex flex-wrap gap-2">
              {COOKING_METHODS.map((method) => {
                const isSelected = generationPreferences.preferredCookingMethods.includes(method);
                return (
                  <button
                    key={method}
                    onClick={() => toggleArrayItem("preferredCookingMethods", method)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Flavor Profile */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Flavor Profile
            </h4>
            <div className="flex flex-wrap gap-2">
              {FLAVOR_OPTIONS.map((flavor) => {
                const isSelected = generationPreferences.flavorPreferences.includes(flavor.id);
                return (
                  <button
                    key={flavor.id}
                    onClick={() => toggleArrayItem("flavorPreferences", flavor.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-pink-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {flavor.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredient Preferences */}
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Must Include */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Must Include Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {generationPreferences.requiredIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                  >
                    {ing}
                    <button
                      onClick={() => removeChipItem("requiredIngredients", ing)}
                      className="text-blue-400 hover:text-blue-700 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "requiredIngredients", includeInput, setIncludeInput)}
                onBlur={() => {
                  if (includeInput.trim()) {
                    addChipItem("requiredIngredients", includeInput);
                    setIncludeInput("");
                  }
                }}
                placeholder="Type ingredient, press Enter"
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
            </div>

            {/* Exclude */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Exclude Ingredients
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {generationPreferences.excludeIngredients.map((ing) => (
                  <span
                    key={ing}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"
                  >
                    {ing}
                    <button
                      onClick={() => removeChipItem("excludeIngredients", ing)}
                      className="text-red-400 hover:text-red-700 ml-0.5"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "excludeIngredients", excludeInput, setExcludeInput)}
                onBlur={() => {
                  if (excludeInput.trim()) {
                    addChipItem("excludeIngredients", excludeInput);
                    setExcludeInput("");
                  }
                }}
                placeholder="Type ingredient, press Enter"
                className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
              />
            </div>
          </div>

          {/* Max Prep Time */}
          <div className="pt-4">
            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Max Prep Time
            </h4>
            <div className="flex flex-wrap gap-2">
              {PREP_TIME_OPTIONS.map((option) => {
                const isSelected = generationPreferences.maxPrepTimeMinutes === option.value;
                return (
                  <button
                    key={option.label}
                    onClick={() => updateGenerationPreference("maxPrepTimeMinutes", option.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
