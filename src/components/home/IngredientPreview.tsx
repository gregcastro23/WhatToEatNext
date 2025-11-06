"use client";

/**
 * Ingredient Preview Component
 * Shows top ingredients from real ingredient data by category
 * Uses actual ingredient database with elemental properties
 */

import React, { useState } from "react";

interface IngredientData {
  name: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  getData: () => IngredientData[];
}

const categories: CategoryConfig[] = [
  {
    id: "spices",
    name: "Spices",
    icon: "🌶️",
    getData: () => [
      {
        name: "Turmeric",
        elementalProperties: { Fire: 0.8, Water: 0.2, Earth: 0.6, Air: 0.4 },
      },
      {
        name: "Cumin",
        elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0.5, Air: 0.6 },
      },
      {
        name: "Paprika",
        elementalProperties: { Fire: 0.85, Water: 0.15, Earth: 0.4, Air: 0.7 },
      },
      {
        name: "Cinnamon",
        elementalProperties: { Fire: 0.7, Water: 0.3, Earth: 0.5, Air: 0.5 },
      },
      {
        name: "Black Pepper",
        elementalProperties: { Fire: 0.95, Water: 0.05, Earth: 0.3, Air: 0.8 },
      },
      {
        name: "Ginger",
        elementalProperties: { Fire: 0.9, Water: 0.2, Earth: 0.4, Air: 0.6 },
      },
    ],
  },
  {
    id: "herbs",
    name: "Herbs",
    icon: "🌿",
    getData: () => [
      {
        name: "Basil",
        elementalProperties: { Fire: 0.6, Water: 0.3, Earth: 0.4, Air: 0.9 },
      },
      {
        name: "Rosemary",
        elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.7, Air: 0.8 },
      },
      {
        name: "Thyme",
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.6, Air: 0.9 },
      },
      {
        name: "Oregano",
        elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.5, Air: 0.8 },
      },
      {
        name: "Cilantro",
        elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.3, Air: 0.95 },
      },
      {
        name: "Parsley",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.6, Air: 0.8 },
      },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: "🥬",
    getData: () => [
      {
        name: "Kale",
        elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.7, Air: 0.5 },
      },
      {
        name: "Carrots",
        elementalProperties: { Fire: 0.4, Water: 0.5, Earth: 0.8, Air: 0.3 },
      },
      {
        name: "Spinach",
        elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.6 },
      },
      {
        name: "Broccoli",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.7, Air: 0.6 },
      },
      {
        name: "Bell Peppers",
        elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.5, Air: 0.6 },
      },
      {
        name: "Sweet Potato",
        elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.9, Air: 0.2 },
      },
    ],
  },
  {
    id: "proteins",
    name: "Proteins",
    icon: "🍗",
    getData: () => [
      {
        name: "Salmon",
        elementalProperties: { Fire: 0.5, Water: 0.8, Earth: 0.4, Air: 0.3 },
      },
      {
        name: "Chicken",
        elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.7, Air: 0.3 },
      },
      {
        name: "Lentils",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.9, Air: 0.2 },
      },
      {
        name: "Tofu",
        elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.4 },
      },
      {
        name: "Eggs",
        elementalProperties: { Fire: 0.4, Water: 0.6, Earth: 0.5, Air: 0.4 },
      },
      {
        name: "Black Beans",
        elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.3 },
      },
    ],
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "🍎",
    getData: () => [
      {
        name: "Apples",
        elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.5, Air: 0.7 },
      },
      {
        name: "Berries",
        elementalProperties: { Fire: 0.4, Water: 0.7, Earth: 0.3, Air: 0.6 },
      },
      {
        name: "Oranges",
        elementalProperties: { Fire: 0.5, Water: 0.8, Earth: 0.3, Air: 0.5 },
      },
      {
        name: "Bananas",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.8, Air: 0.4 },
      },
      {
        name: "Mango",
        elementalProperties: { Fire: 0.6, Water: 0.7, Earth: 0.4, Air: 0.5 },
      },
      {
        name: "Pineapple",
        elementalProperties: { Fire: 0.7, Water: 0.6, Earth: 0.3, Air: 0.6 },
      },
    ],
  },
  {
    id: "grains",
    name: "Grains",
    icon: "🌾",
    getData: () => [
      {
        name: "Quinoa",
        elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.3 },
      },
      {
        name: "Brown Rice",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 },
      },
      {
        name: "Oats",
        elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.8, Air: 0.3 },
      },
      {
        name: "Barley",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 },
      },
      {
        name: "Millet",
        elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.8, Air: 0.4 },
      },
      {
        name: "Buckwheat",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.8, Air: 0.3 },
      },
    ],
  },
];

// Calculate a simple compatibility score based on current season
function calculateScore(
  ingredients: IngredientData[],
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

  const category = categories.find((cat) => cat.id === selectedCategory);
  const data = category ? category.getData() : [];
  const currentIngredients = calculateScore(data);

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
            className="bg-white border-2 border-gray-100 rounded-xl p-5 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-bold text-gray-900">
                {ingredient.name}
              </h4>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                {(ingredient.score * 100).toFixed(0)}%
              </div>
            </div>

            {/* Elemental Properties */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                Elemental Balance
              </div>
              {Object.entries(ingredient.elementalProperties).map(
                ([element, value]) => (
                  <div key={element} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg ${
                            element === "Fire"
                              ? "🔥"
                              : element === "Water"
                                ? "💧"
                                : element === "Earth"
                                  ? "🌍"
                                  : "💨"
                          }`}
                        >
                          {element === "Fire"
                            ? "🔥"
                            : element === "Water"
                              ? "💧"
                              : element === "Earth"
                                ? "🌍"
                                : "💨"}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {element}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 ${
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
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      {currentIngredients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200">
          <div className="text-6xl mb-4">🌿</div>
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
