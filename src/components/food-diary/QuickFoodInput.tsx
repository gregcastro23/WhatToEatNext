"use client";

/**
 * QuickFoodInput Component
 * Fast food entry with preset common foods and search functionality
 *
 * @file src/components/food-diary/QuickFoodInput.tsx
 * @created 2026-02-02
 */

import React, { useState, useMemo } from "react";
import type {
  QuickFoodPreset,
  QuickFoodCategory,
  FoodSearchResult,
  ServingSize,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";

interface QuickFoodInputProps {
  presets: QuickFoodPreset[];
  onAddFood: (
    presetId: string,
    mealType: MealType,
    quantity?: number,
    time?: string,
  ) => Promise<any>;
  onSearch: (query: string) => Promise<FoodSearchResult[]>;
  selectedDate: Date;
  isLoading?: boolean;
}

const CATEGORY_LABELS: Record<QuickFoodCategory, string> = {
  fruits: "Fruits",
  vegetables: "Vegetables",
  proteins: "Proteins",
  dairy: "Dairy",
  grains: "Grains",
  snacks: "Snacks",
  beverages: "Beverages",
  sweets: "Sweets",
  nuts_seeds: "Nuts & Seeds",
  condiments: "Condiments",
  prepared_foods: "Prepared Foods",
};

const CATEGORY_ICONS: Record<QuickFoodCategory, string> = {
  fruits: "fruit",
  vegetables: "veg",
  proteins: "protein",
  dairy: "dairy",
  grains: "grain",
  snacks: "snack",
  beverages: "beverage",
  sweets: "sweet",
  nuts_seeds: "nut",
  condiments: "condiment",
  prepared_foods: "prepared",
};

const MEAL_TIMES: { type: MealType; label: string; icon: string }[] = [
  { type: "breakfast", label: "Breakfast", icon: "sunrise" },
  { type: "lunch", label: "Lunch", icon: "sun" },
  { type: "dinner", label: "Dinner", icon: "moon" },
  { type: "snack", label: "Snack", icon: "cookie" },
];

export default function QuickFoodInput({
  presets,
  onAddFood,
  onSearch,
  selectedDate,
  isLoading = false,
}: QuickFoodInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    QuickFoodCategory | "all"
  >("all");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("snack");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<QuickFoodPreset | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPresets = useMemo(() => {
    if (selectedCategory === "all") return presets;
    return presets.filter((p) => p.category === selectedCategory);
  }, [presets, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(presets.map((p) => p.category));
    return Array.from(cats) as QuickFoodCategory[];
  }, [presets]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setIsSearching(true);
      const results = await onSearch(query);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectFood = (preset: QuickFoodPreset) => {
    setSelectedFood(preset);
    setQuantity(1);
    setShowAddModal(true);
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    await onAddFood(selectedFood.id, selectedMealType, quantity);
    setShowAddModal(false);
    setSelectedFood(null);
    setQuantity(1);
  };

  const handleQuickAdd = async (preset: QuickFoodPreset) => {
    await onAddFood(preset.id, selectedMealType, 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Add Food</h3>
        <span className="text-sm text-gray-500">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Meal Type Selector */}
      <div className="flex gap-2 mb-4">
        {MEAL_TIMES.map((meal) => (
          <button
            key={meal.type}
            onClick={() => setSelectedMealType(meal.type)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              selectedMealType === meal.type
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {meal.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search foods..."
          className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => {
                const preset = presets.find((p) => p.id === result.id);
                if (preset) handleSelectFood(preset);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
            >
              <div>
                <span className="font-medium text-gray-900">{result.name}</span>
                {result.brandName && (
                  <span className="text-sm text-gray-500 ml-2">
                    {result.brandName}
                  </span>
                )}
              </div>
              {result.nutritionPer100g?.calories && (
                <span className="text-sm text-gray-500">
                  {result.nutritionPer100g.calories} cal/100g
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            selectedCategory === "all"
              ? "bg-amber-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {filteredPresets.slice(0, 12).map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectFood(preset)}
            onDoubleClick={() => handleQuickAdd(preset)}
            disabled={isLoading}
            className="p-3 bg-gray-50 hover:bg-amber-50 rounded-lg transition-colors text-left group"
            title="Click to customize, double-click to quick add"
          >
            <div className="font-medium text-gray-900 text-sm truncate">
              {preset.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {preset.defaultServing.description}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              {Math.round(
                ((preset.nutritionPer100g.calories || 0) *
                  preset.defaultServing.grams) /
                  100,
              )}{" "}
              cal
            </div>
          </button>
        ))}
      </div>

      {filteredPresets.length > 12 && (
        <button className="w-full mt-2 py-2 text-sm text-amber-600 hover:text-amber-700">
          Show all {filteredPresets.length} items...
        </button>
      )}

      {/* Add Modal */}
      {showAddModal && selectedFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Add {selectedFood.name}
            </h4>

            {/* Serving Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Serving Size</span>
                <span className="font-medium">
                  {selectedFood.defaultServing.description}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Calories per serving
                </span>
                <span className="font-medium">
                  {Math.round(
                    ((selectedFood.nutritionPer100g.calories || 0) *
                      selectedFood.defaultServing.grams) /
                      100,
                  )}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(0.5, parseFloat(e.target.value) || 0.5),
                    )
                  }
                  step={0.5}
                  min={0.5}
                  className="w-20 text-center border border-gray-200 rounded-lg py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 0.5)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Nutrition Preview */}
            <div className="bg-amber-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-amber-800 font-medium mb-2">
                Total Nutrition
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">
                    {Math.round(
                      ((selectedFood.nutritionPer100g.calories || 0) *
                        selectedFood.defaultServing.grams *
                        quantity) /
                        100,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">
                    {Math.round(
                      ((selectedFood.nutritionPer100g.protein || 0) *
                        selectedFood.defaultServing.grams *
                        quantity) /
                        100,
                    )}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">
                    {Math.round(
                      ((selectedFood.nutritionPer100g.carbs || 0) *
                        selectedFood.defaultServing.grams *
                        quantity) /
                        100,
                    )}
                    g
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">
                    {Math.round(
                      ((selectedFood.nutritionPer100g.fat || 0) *
                        selectedFood.defaultServing.grams *
                        quantity) /
                        100,
                    )}
                    g
                  </span>
                </div>
              </div>
            </div>

            {/* Meal Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal
              </label>
              <div className="flex gap-2">
                {MEAL_TIMES.map((meal) => (
                  <button
                    key={meal.type}
                    onClick={() => setSelectedMealType(meal.type)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedMealType === meal.type
                        ? "bg-amber-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {meal.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFood}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50"
              >
                {isLoading ? "Adding..." : "Add Food"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
