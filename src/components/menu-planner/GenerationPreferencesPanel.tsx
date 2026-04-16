"use client";

/**
 * Generation Preferences Panel
 * Collapsible panel for customizing meal generation preferences
 * including nutritional goals, cuisines, dietary restrictions, and more.
 * Persists via MenuPlannerContext to localStorage.
 *
 * @file src/components/menu-planner/GenerationPreferencesPanel.tsx
 * @created 2026-04-16
 */

import React, { useState, useCallback } from "react";
import {
  useMenuPlanner,
  type FlavorPreference,
  type NutritionalTargets,
} from "@/contexts/MenuPlannerContext";

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

const CALORIE_PRESETS = [
  { value: 1500, label: "1500" },
  { value: 1800, label: "1800" },
  { value: 2000, label: "2000" },
  { value: 2200, label: "2200" },
  { value: 2500, label: "2500" },
  { value: null, label: "Custom" },
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

  const nutTargets = generationPreferences.nutritionalTargets;

  // Count active preferences
  const nutritionActiveCount =
    (nutTargets.dailyCalories !== null ? 1 : 0) +
    (nutTargets.dailyProteinG !== null ? 1 : 0) +
    (nutTargets.dailyCarbsG !== null ? 1 : 0) +
    (nutTargets.dailyFatG !== null ? 1 : 0) +
    (nutTargets.dailyFiberG !== null ? 1 : 0) +
    (nutTargets.prioritizeProtein ? 1 : 0) +
    (nutTargets.prioritizeFiber ? 1 : 0);

  const otherActiveCount =
    generationPreferences.preferredCuisines.length +
    generationPreferences.dietaryRestrictions.length +
    generationPreferences.preferredCookingMethods.length +
    generationPreferences.flavorPreferences.length +
    generationPreferences.excludeIngredients.length +
    generationPreferences.requiredIngredients.length +
    (generationPreferences.maxPrepTimeMinutes !== null ? 1 : 0);

  const activeCount = nutritionActiveCount + otherActiveCount;

  // Nutritional target updater
  const updateNutTarget = useCallback(
    <K extends keyof NutritionalTargets>(key: K, value: NutritionalTargets[K]) => {
      updateGenerationPreference("nutritionalTargets", {
        ...nutTargets,
        [key]: value,
      });
    },
    [nutTargets, updateGenerationPreference],
  );

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
  if (nutTargets.dailyCalories !== null) {
    summaryParts.push(`${nutTargets.dailyCalories} cal`);
  }
  if (nutTargets.dailyProteinG !== null || nutTargets.prioritizeProtein) {
    const label = nutTargets.dailyProteinG !== null ? `${nutTargets.dailyProteinG}g protein` : "Hi-protein";
    summaryParts.push(label);
  }
  if (generationPreferences.preferredCuisines.length > 0) {
    summaryParts.push(generationPreferences.preferredCuisines.slice(0, 2).join(", ") +
      (generationPreferences.preferredCuisines.length > 2 ? ` +${generationPreferences.preferredCuisines.length - 2}` : ""));
  }
  if (generationPreferences.dietaryRestrictions.length > 0) {
    summaryParts.push(generationPreferences.dietaryRestrictions.slice(0, 2).join(", ") +
      (generationPreferences.dietaryRestrictions.length > 2 ? ` +${generationPreferences.dietaryRestrictions.length - 2}` : ""));
  }
  if (generationPreferences.maxPrepTimeMinutes !== null) {
    summaryParts.push(`< ${generationPreferences.maxPrepTimeMinutes}min`);
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
          {nutritionActiveCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
              Nutrition
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

          {/* ─── NUTRITIONAL GOALS ─── */}
          <div className="pt-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">N</span>
                Daily Nutritional Goals
                {nutritionActiveCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-200 text-emerald-800">
                    {nutritionActiveCount} set
                  </span>
                )}
              </h4>

              {/* Calorie Target */}
              <div className="mb-3">
                <label className="text-[11px] font-semibold text-emerald-700 mb-1.5 block">
                  Daily Calories
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CALORIE_PRESETS.map((preset) => {
                    const isSelected = preset.value !== null
                      ? nutTargets.dailyCalories === preset.value
                      : nutTargets.dailyCalories !== null && !CALORIE_PRESETS.some(p => p.value === nutTargets.dailyCalories);
                    return (
                      <button
                        key={preset.label}
                        onClick={() => {
                          if (preset.value !== null) {
                            updateNutTarget("dailyCalories", preset.value);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                  {nutTargets.dailyCalories !== null && (
                    <button
                      onClick={() => updateNutTarget("dailyCalories", null)}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {/* Custom calorie input */}
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min="800"
                    max="5000"
                    step="50"
                    value={nutTargets.dailyCalories ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : null;
                      updateNutTarget("dailyCalories", val && val >= 800 ? val : null);
                    }}
                    placeholder="e.g. 2000"
                    className="w-24 px-2 py-1 text-xs border border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white text-gray-800"
                  />
                  <span className="text-[10px] text-emerald-600">kcal/day</span>
                </div>
              </div>

              {/* Macro Targets Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <MacroInput
                  label="Protein"
                  value={nutTargets.dailyProteinG}
                  onChange={(v) => updateNutTarget("dailyProteinG", v)}
                  placeholder="50"
                  unit="g"
                  color="blue"
                />
                <MacroInput
                  label="Carbs"
                  value={nutTargets.dailyCarbsG}
                  onChange={(v) => updateNutTarget("dailyCarbsG", v)}
                  placeholder="275"
                  unit="g"
                  color="amber"
                />
                <MacroInput
                  label="Fat"
                  value={nutTargets.dailyFatG}
                  onChange={(v) => updateNutTarget("dailyFatG", v)}
                  placeholder="78"
                  unit="g"
                  color="orange"
                />
                <MacroInput
                  label="Fiber"
                  value={nutTargets.dailyFiberG}
                  onChange={(v) => updateNutTarget("dailyFiberG", v)}
                  placeholder="28"
                  unit="g"
                  color="green"
                />
              </div>

              {/* Macro Summary Bar */}
              {nutTargets.dailyCalories !== null && (
                <MacroSummaryBar targets={nutTargets} />
              )}

              {/* Priority Toggles */}
              <div className="flex flex-wrap gap-3 mt-3">
                <PriorityToggle
                  label="Prioritize Protein"
                  description="Boost high-protein recipes in generation"
                  active={nutTargets.prioritizeProtein}
                  onChange={(v) => updateNutTarget("prioritizeProtein", v)}
                  color="blue"
                />
                <PriorityToggle
                  label="Prioritize Fiber"
                  description="Boost high-fiber recipes in generation"
                  active={nutTargets.prioritizeFiber}
                  onChange={(v) => updateNutTarget("prioritizeFiber", v)}
                  color="green"
                />
              </div>
            </div>
          </div>

          {/* ─── CUISINE PREFERENCES ─── */}
          <div className="pt-4">
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

          {/* ─── DIETARY RESTRICTIONS ─── */}
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

          {/* ─── COOKING METHODS + FLAVOR + PREP TIME ─── */}
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cooking Methods */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Cooking Methods
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {COOKING_METHODS.map((method) => {
                  const isSelected = generationPreferences.preferredCookingMethods.includes(method);
                  return (
                    <button
                      key={method}
                      onClick={() => toggleArrayItem("preferredCookingMethods", method)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
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
            <div>
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Flavor Profile
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {FLAVOR_OPTIONS.map((flavor) => {
                  const isSelected = generationPreferences.flavorPreferences.includes(flavor.id);
                  return (
                    <button
                      key={flavor.id}
                      onClick={() => toggleArrayItem("flavorPreferences", flavor.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
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

              {/* Prep Time */}
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 mt-3">
                Max Prep Time
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {PREP_TIME_OPTIONS.map((option) => {
                  const isSelected = generationPreferences.maxPrepTimeMinutes === option.value;
                  return (
                    <button
                      key={option.label}
                      onClick={() => updateGenerationPreference("maxPrepTimeMinutes", option.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
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

          {/* ─── INGREDIENT PREFERENCES ─── */}
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
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function MacroInput({
  label,
  value,
  onChange,
  placeholder,
  unit,
  color,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
  unit: string;
  color: "blue" | "amber" | "orange" | "green";
}) {
  const colorMap = {
    blue: { bg: "bg-blue-50", border: "border-blue-200", focus: "focus:border-blue-500 focus:ring-blue-500", text: "text-blue-700", label: "text-blue-800" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", focus: "focus:border-amber-500 focus:ring-amber-500", text: "text-amber-700", label: "text-amber-800" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", focus: "focus:border-orange-500 focus:ring-orange-500", text: "text-orange-700", label: "text-orange-800" },
    green: { bg: "bg-green-50", border: "border-green-200", focus: "focus:border-green-500 focus:ring-green-500", text: "text-green-700", label: "text-green-800" },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-lg p-2.5 ${c.border} border`}>
      <label className={`text-[10px] font-bold ${c.label} uppercase tracking-wider block mb-1`}>
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min="0"
          max="1000"
          step="5"
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value ? parseInt(e.target.value, 10) : null;
            onChange(v && v > 0 ? v : null);
          }}
          placeholder={placeholder}
          className={`w-full px-2 py-1 text-xs border ${c.border} rounded-md ${c.focus} focus:ring-1 bg-white text-gray-800`}
        />
        <span className={`text-[10px] ${c.text} font-medium whitespace-nowrap`}>{unit}</span>
      </div>
    </div>
  );
}

function MacroSummaryBar({ targets }: { targets: NutritionalTargets }) {
  const cal = targets.dailyCalories ?? 0;
  if (cal === 0) return null;

  const proteinCal = (targets.dailyProteinG ?? 0) * 4;
  const carbsCal = (targets.dailyCarbsG ?? 0) * 4;
  const fatCal = (targets.dailyFatG ?? 0) * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  if (totalMacroCal === 0) return null;

  const proteinPct = Math.round((proteinCal / cal) * 100);
  const carbsPct = Math.round((carbsCal / cal) * 100);
  const fatPct = Math.round((fatCal / cal) * 100);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[10px] text-gray-500 font-medium">Macro split:</span>
        {totalMacroCal > cal * 1.05 && (
          <span className="text-[10px] text-amber-600 font-medium">
            (macros exceed calorie target by {Math.round(totalMacroCal - cal)} cal)
          </span>
        )}
      </div>
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-gray-200">
        {proteinCal > 0 && (
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(proteinPct, 100)}%` }}
            title={`Protein: ${proteinPct}% (${targets.dailyProteinG}g)`}
          />
        )}
        {carbsCal > 0 && (
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${Math.min(carbsPct, 100)}%` }}
            title={`Carbs: ${carbsPct}% (${targets.dailyCarbsG}g)`}
          />
        )}
        {fatCal > 0 && (
          <div
            className="h-full bg-orange-500 transition-all duration-300"
            style={{ width: `${Math.min(fatPct, 100)}%` }}
            title={`Fat: ${fatPct}% (${targets.dailyFatG}g)`}
          />
        )}
      </div>
      <div className="flex gap-3 mt-1">
        {targets.dailyProteinG !== null && (
          <span className="text-[10px] text-blue-600 font-medium">Protein {proteinPct}%</span>
        )}
        {targets.dailyCarbsG !== null && (
          <span className="text-[10px] text-amber-600 font-medium">Carbs {carbsPct}%</span>
        )}
        {targets.dailyFatG !== null && (
          <span className="text-[10px] text-orange-600 font-medium">Fat {fatPct}%</span>
        )}
      </div>
    </div>
  );
}

function PriorityToggle({
  label,
  description,
  active,
  onChange,
  color,
}: {
  label: string;
  description: string;
  active: boolean;
  onChange: (v: boolean) => void;
  color: "blue" | "green";
}) {
  const activeClasses = color === "blue"
    ? "bg-blue-600 text-white border-blue-700"
    : "bg-green-600 text-white border-green-700";
  const inactiveClasses = "bg-white text-gray-600 border-gray-200 hover:bg-gray-50";

  return (
    <button
      onClick={() => onChange(!active)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
        active ? activeClasses : inactiveClasses
      }`}
      title={description}
    >
      <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
        active
          ? "border-white bg-white"
          : "border-gray-400"
      }`}>
        {active && <span className={`w-1.5 h-1.5 rounded-full ${color === "blue" ? "bg-blue-600" : "bg-green-600"}`} />}
      </span>
      {label}
    </button>
  );
}
