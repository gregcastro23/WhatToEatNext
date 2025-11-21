"use client";

/**
 * Ingredient Preview Component
 * Shows top ingredients from real ingredient database by category
 * Uses actual ingredient data with elemental properties
 */

import React, { useState, useMemo } from "react";
import {
  getAllSpices,
  getAllHerbs,
  getAllVegetables,
  getAllProteins,
  getAllGrains,
  allIngredients,
} from "@/data/ingredients";
import type { Ingredient } from "@/types";

interface IngredientData {
  name: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  culinaryUses?: string[];
  flavorProfile?: string;
  pairings?: string[];
  seasonality?: string;
  nutrition?: string[];
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  getData: () => Ingredient[];
}

const categories: CategoryConfig[] = [
  {
    id: "spices",
    name: "Spices",
    icon: "🌶️",
    getData: getAllSpices,
  },
  {
    id: "herbs",
    name: "Herbs",
    icon: "🌿",
    getData: getAllHerbs,
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "🥬",
    getData: getAllVegetables,
  },
  {
    id: "proteins",
    name: "Proteins",
    icon: "🍗",
    getData: getAllProteins,
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍎",
    getData: () => Object.values(allIngredients).filter(
      (ing) => ing.category === "fruit"
    ),
  },
  {
    id: "grains",
    name: "Grains",
    icon: "🌾",
    getData: getAllGrains,
  },
];

// Convert Ingredient to IngredientData format
function convertToIngredientData(ingredient: Ingredient): IngredientData {
  return {
    name: ingredient.name,
    elementalProperties: ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    },
    culinaryUses: (ingredient as any).culinaryUses || (ingredient as any).uses,
    flavorProfile: (ingredient as any).flavorProfile || (ingredient as any).flavor,
    pairings: (ingredient as any).pairings || (ingredient as any).pairingRecommendations,
    seasonality: (ingredient as any).seasonality,
    nutrition: (ingredient as any).nutrition || (ingredient as any).nutritionalBenefits,
  };
}

// Calculate a simple compatibility score based on elemental balance
function calculateScore(
  ingredients: IngredientData[]
): Array<IngredientData & { score: number }> {
  return ingredients
    .map((ing) => ({
      ...ing,
      // Simple score based on elemental balance
      score:
        (ing.elementalProperties.Fire +
          ing.elementalProperties.Water +
          ing.elementalProperties.Earth +
          ing.elementalProperties.Air) /
        4,
    }))
    .sort((a, b) => b.score - a.score);
}

export default function IngredientPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>("spices");
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());

  const currentIngredients = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    const rawIngredients = category.getData();
    const ingredientData = rawIngredients.map(convertToIngredientData);
    return calculateScore(ingredientData).slice(0, 12); // Show top 12
  }, [selectedCategory]);

  const category = categories.find((cat) => cat.id === selectedCategory);

  const toggleIngredient = (ingredientName: string) => {
    setExpandedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  // Get dominant element for selected category
  const getDominantElement = (): string => {
    if (!currentIngredients.length) return "Fire";
    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    currentIngredients.forEach((ing) => {
      Object.entries(ing.elementalProperties).forEach(([element, value]) => {
        totals[element as keyof typeof totals] += value;
      });
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  };

  const dominantElement = getDominantElement();

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
              selectedCategory === cat.id
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white scale-105"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300"
            }`}
          >
            <span className="text-2xl mr-2">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Category Info Banner */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{category?.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {category?.name} Collection
              </h3>
              <p className="text-sm text-gray-600">
                Dominant element:{" "}
                <span className="font-bold text-green-700">
                  {dominantElement}
                </span>{" "}
                {dominantElement === "Fire"
                  ? "🔥"
                  : dominantElement === "Water"
                    ? "💧"
                    : dominantElement === "Earth"
                      ? "🌍"
                      : "💨"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-700">
              {currentIngredients.length}
            </div>
            <div className="text-xs text-gray-600">ingredients</div>
          </div>
        </div>
      </div>

      {/* Ingredient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentIngredients.map((ingredient, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:shadow-2xl hover:border-green-300 transition-all duration-300"
          >
            {/* Card Header - Clickable */}
            <div
              onClick={() => toggleIngredient(ingredient.name)}
              className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-4 cursor-pointer hover:from-green-100 hover:via-emerald-100 hover:to-teal-100 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-1">
                    {ingredient.name}
                  </h4>
                  {ingredient.flavorProfile && (
                    <p className="text-xs text-gray-600 mb-2">
                      {ingredient.flavorProfile}
                    </p>
                  )}
                  <div className="flex gap-1">
                    {Object.entries(ingredient.elementalProperties)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 2)
                      .map(([element, value]) => (
                        <span
                          key={element}
                          className="text-xs bg-white bg-opacity-70 text-gray-700 px-2 py-1 rounded-full font-medium border border-gray-200"
                        >
                          {element === "Fire"
                            ? "🔥"
                            : element === "Water"
                              ? "💧"
                              : element === "Earth"
                                ? "🌍"
                                : "💨"}{" "}
                          {element}
                        </span>
                      ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 ml-4">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    {(ingredient.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-2xl text-gray-400 font-light">
                    {expandedIngredients.has(ingredient.name) ? "−" : "+"}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedIngredients.has(ingredient.name) && (
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-t-2 border-green-100 space-y-4">
                {/* Elemental Properties */}
                <div>
                  <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">⚗️</span>
                    <span>Elemental Properties</span>
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(ingredient.elementalProperties)
                      .sort((a, b) => b[1] - a[1])
                      .map(([element, value]) => (
                        <div key={element} className="flex items-center gap-2">
                          <span className="text-sm w-16">
                            {element === "Fire"
                              ? "🔥 Fire"
                              : element === "Water"
                                ? "💧 Water"
                                : element === "Earth"
                                  ? "🌍 Earth"
                                  : "💨 Air"}
                          </span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                element === "Fire"
                                  ? "bg-gradient-to-r from-red-400 to-orange-500"
                                  : element === "Water"
                                    ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                    : element === "Earth"
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                      : "bg-gradient-to-r from-purple-400 to-indigo-500"
                              }`}
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-12 text-right">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Culinary Uses */}
                {ingredient.culinaryUses && ingredient.culinaryUses.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">👨‍🍳</span>
                      <span>Culinary Uses</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.culinaryUses.slice(0, 6).map((use, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-50 text-green-800 px-3 py-1.5 rounded-full border border-green-200"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pairings */}
                {ingredient.pairings && ingredient.pairings.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">🤝</span>
                      <span>Pairs Well With</span>
                    </h5>
                    <div className="space-y-1">
                      {ingredient.pairings.slice(0, 4).map((pairing, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-600">•</span>
                          <span>{pairing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {ingredient.nutrition && ingredient.nutrition.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">💊</span>
                      <span>Nutritional Benefits</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.nutrition.slice(0, 6).map((nutrient, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200"
                        >
                          {nutrient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seasonality */}
                {ingredient.seasonality && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <span>Seasonality</span>
                    </h5>
                    <p className="text-sm text-gray-700 bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded">
                      {ingredient.seasonality}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {currentIngredients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200">
          <div className="text-6xl mb-4">🥗</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            No ingredients available
          </p>
          <p className="text-sm text-gray-500">
            Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
