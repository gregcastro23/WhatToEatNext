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
        flavorProfile: "Earthy, slightly bitter, warm",
        culinaryUses: ["Curries", "Golden milk", "Rice dishes", "Marinades"],
        pairings: ["Ginger", "Black pepper", "Coconut", "Lentils"],
        seasonality: "Available year-round",
        nutrition: ["Anti-inflammatory", "Antioxidants", "Vitamin C", "Iron"],
      },
      {
        name: "Cumin",
        elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0.5, Air: 0.6 },
        flavorProfile: "Warm, earthy, slightly nutty",
        culinaryUses: ["Tacos", "Chili", "Roasted vegetables", "Rice pilaf"],
        pairings: ["Coriander", "Paprika", "Garlic", "Beans"],
        seasonality: "Available year-round",
        nutrition: ["Iron", "Digestive aid", "Antioxidants"],
      },
      {
        name: "Paprika",
        elementalProperties: { Fire: 0.85, Water: 0.15, Earth: 0.4, Air: 0.7 },
        flavorProfile: "Sweet, smoky, mild heat",
        culinaryUses: ["Stews", "Rubs", "Deviled eggs", "Roasted potatoes"],
        pairings: ["Garlic", "Onion", "Cumin", "Chicken"],
        seasonality: "Available year-round",
        nutrition: ["Vitamin A", "Vitamin E", "Antioxidants"],
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
        flavorProfile: "Sweet, peppery, slightly minty",
        culinaryUses: ["Caprese salad", "Pesto", "Tomato sauces", "Thai curries"],
        pairings: ["Tomatoes", "Mozzarella", "Garlic", "Pine nuts"],
        seasonality: "Summer",
        nutrition: ["Vitamin K", "Antioxidants", "Anti-inflammatory", "Iron"],
      },
      {
        name: "Rosemary",
        elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.7, Air: 0.8 },
        flavorProfile: "Piney, woodsy, lemon-like",
        culinaryUses: ["Roasted meats", "Focaccia", "Potatoes", "Grilled fish"],
        pairings: ["Lamb", "Chicken", "Potatoes", "Lemon"],
        seasonality: "Available year-round",
        nutrition: ["Memory support", "Antioxidants", "Iron", "Calcium"],
      },
      {
        name: "Thyme",
        elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.6, Air: 0.9 },
        flavorProfile: "Earthy, subtle mint, lemony",
        culinaryUses: ["Stocks", "Roasted chicken", "Mushroom dishes", "Bread"],
        pairings: ["Chicken", "Mushrooms", "Lemon", "Garlic"],
        seasonality: "Available year-round",
        nutrition: ["Vitamin C", "Vitamin A", "Antimicrobial", "Iron"],
      },
      {
        name: "Oregano",
        elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.5, Air: 0.8 },
        flavorProfile: "Pungent, slightly bitter, peppery",
        culinaryUses: ["Pizza", "Greek salads", "Tomato sauces", "Grilled meats"],
        pairings: ["Tomatoes", "Olive oil", "Feta", "Lemon"],
        seasonality: "Summer",
        nutrition: ["Antioxidants", "Antimicrobial", "Vitamin K", "Iron"],
      },
      {
        name: "Cilantro",
        elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.3, Air: 0.95 },
        flavorProfile: "Bright, citrusy, slightly soapy",
        culinaryUses: ["Salsas", "Curries", "Tacos", "Ceviche"],
        pairings: ["Lime", "Jalapeño", "Cumin", "Avocado"],
        seasonality: "Spring/Fall",
        nutrition: ["Vitamin K", "Vitamin A", "Detoxifying", "Antioxidants"],
      },
      {
        name: "Parsley",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.6, Air: 0.8 },
        flavorProfile: "Fresh, slightly peppery, clean",
        culinaryUses: ["Chimichurri", "Tabbouleh", "Garnish", "Sauces"],
        pairings: ["Lemon", "Garlic", "Olive oil", "Tomatoes"],
        seasonality: "Available year-round",
        nutrition: ["Vitamin C", "Vitamin K", "Iron", "Folate"],
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
        flavorProfile: "Earthy, slightly bitter, robust",
        culinaryUses: ["Salads", "Smoothies", "Sautéed greens", "Chips"],
        pairings: ["Lemon", "Garlic", "Olive oil", "Bacon"],
        seasonality: "Fall/Winter",
        nutrition: ["Vitamin K", "Vitamin A", "Calcium", "Antioxidants"],
      },
      {
        name: "Carrots",
        elementalProperties: { Fire: 0.4, Water: 0.5, Earth: 0.8, Air: 0.3 },
        flavorProfile: "Sweet, earthy, crunchy",
        culinaryUses: ["Roasted", "Soups", "Salads", "Juice"],
        pairings: ["Ginger", "Honey", "Thyme", "Butter"],
        seasonality: "Available year-round",
        nutrition: ["Vitamin A", "Beta-carotene", "Fiber", "Vision support"],
      },
      {
        name: "Spinach",
        elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.6 },
        flavorProfile: "Mild, slightly metallic, tender",
        culinaryUses: ["Salads", "Sautéed", "Smoothies", "Quiche"],
        pairings: ["Garlic", "Lemon", "Nutmeg", "Feta"],
        seasonality: "Spring/Fall",
        nutrition: ["Iron", "Folate", "Vitamin K", "Magnesium"],
      },
      {
        name: "Broccoli",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.7, Air: 0.6 },
        flavorProfile: "Slightly bitter, grassy, nutty when roasted",
        culinaryUses: ["Steamed", "Roasted", "Stir-fry", "Soup"],
        pairings: ["Garlic", "Lemon", "Cheese", "Soy sauce"],
        seasonality: "Fall/Winter",
        nutrition: ["Vitamin C", "Vitamin K", "Fiber", "Sulforaphane"],
      },
      {
        name: "Bell Peppers",
        elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.5, Air: 0.6 },
        flavorProfile: "Sweet, crisp, mild",
        culinaryUses: ["Stuffed", "Roasted", "Stir-fry", "Salads"],
        pairings: ["Onions", "Tomatoes", "Garlic", "Cheese"],
        seasonality: "Summer",
        nutrition: ["Vitamin C", "Vitamin A", "Antioxidants", "Fiber"],
      },
      {
        name: "Sweet Potato",
        elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.9, Air: 0.2 },
        flavorProfile: "Sweet, creamy, earthy",
        culinaryUses: ["Baked", "Mashed", "Fries", "Casseroles"],
        pairings: ["Cinnamon", "Maple syrup", "Butter", "Pecans"],
        seasonality: "Fall/Winter",
        nutrition: ["Vitamin A", "Fiber", "Potassium", "Beta-carotene"],
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
        flavorProfile: "Rich, buttery, slightly sweet",
        culinaryUses: ["Grilled", "Baked", "Pan-seared", "Sushi"],
        pairings: ["Lemon", "Dill", "Capers", "Asparagus"],
        seasonality: "Available year-round",
        nutrition: ["Omega-3", "Protein", "Vitamin D", "B vitamins"],
      },
      {
        name: "Chicken",
        elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.7, Air: 0.3 },
        flavorProfile: "Mild, savory, versatile",
        culinaryUses: ["Roasted", "Grilled", "Stir-fry", "Soup"],
        pairings: ["Garlic", "Lemon", "Rosemary", "Mushrooms"],
        seasonality: "Available year-round",
        nutrition: ["Lean protein", "B vitamins", "Selenium", "Phosphorus"],
      },
      {
        name: "Lentils",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.9, Air: 0.2 },
        flavorProfile: "Earthy, nutty, mild",
        culinaryUses: ["Soups", "Curries", "Salads", "Veggie burgers"],
        pairings: ["Cumin", "Tomatoes", "Spinach", "Garlic"],
        seasonality: "Available year-round",
        nutrition: ["Plant protein", "Fiber", "Iron", "Folate"],
      },
      {
        name: "Tofu",
        elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.4 },
        flavorProfile: "Neutral, slightly nutty, absorbs flavors",
        culinaryUses: ["Stir-fry", "Grilled", "Scrambled", "Marinated"],
        pairings: ["Soy sauce", "Ginger", "Sesame", "Vegetables"],
        seasonality: "Available year-round",
        nutrition: ["Plant protein", "Calcium", "Iron", "Isoflavones"],
      },
      {
        name: "Eggs",
        elementalProperties: { Fire: 0.4, Water: 0.6, Earth: 0.5, Air: 0.4 },
        flavorProfile: "Rich, creamy, versatile",
        culinaryUses: ["Scrambled", "Boiled", "Baked", "Poached"],
        pairings: ["Cheese", "Herbs", "Toast", "Vegetables"],
        seasonality: "Available year-round",
        nutrition: ["Complete protein", "Choline", "Vitamin B12", "Vitamin D"],
      },
      {
        name: "Black Beans",
        elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.3 },
        flavorProfile: "Earthy, slightly sweet, creamy",
        culinaryUses: ["Tacos", "Soups", "Rice bowls", "Refried"],
        pairings: ["Cumin", "Lime", "Cilantro", "Rice"],
        seasonality: "Available year-round",
        nutrition: ["Protein", "Fiber", "Folate", "Antioxidants"],
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
        flavorProfile: "Sweet, tart, crisp",
        culinaryUses: ["Pies", "Salads", "Sauces", "Baked"],
        pairings: ["Cinnamon", "Pork", "Cheese", "Caramel"],
        seasonality: "Fall",
        nutrition: ["Fiber", "Vitamin C", "Antioxidants", "Pectin"],
      },
      {
        name: "Berries",
        elementalProperties: { Fire: 0.4, Water: 0.7, Earth: 0.3, Air: 0.6 },
        flavorProfile: "Sweet, tart, juicy",
        culinaryUses: ["Smoothies", "Desserts", "Jams", "Salads"],
        pairings: ["Cream", "Yogurt", "Lemon", "Mint"],
        seasonality: "Summer",
        nutrition: ["Antioxidants", "Vitamin C", "Fiber", "Polyphenols"],
      },
      {
        name: "Oranges",
        elementalProperties: { Fire: 0.5, Water: 0.8, Earth: 0.3, Air: 0.5 },
        flavorProfile: "Sweet, tangy, citrusy",
        culinaryUses: ["Juice", "Salads", "Marmalade", "Desserts"],
        pairings: ["Chocolate", "Fennel", "Avocado", "Seafood"],
        seasonality: "Winter",
        nutrition: ["Vitamin C", "Folate", "Potassium", "Flavonoids"],
      },
      {
        name: "Bananas",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.8, Air: 0.4 },
        flavorProfile: "Sweet, creamy, mild",
        culinaryUses: ["Smoothies", "Bread", "Pancakes", "Desserts"],
        pairings: ["Peanut butter", "Chocolate", "Cinnamon", "Oats"],
        seasonality: "Available year-round",
        nutrition: ["Potassium", "Vitamin B6", "Fiber", "Magnesium"],
      },
      {
        name: "Mango",
        elementalProperties: { Fire: 0.6, Water: 0.7, Earth: 0.4, Air: 0.5 },
        flavorProfile: "Sweet, tropical, juicy",
        culinaryUses: ["Salsas", "Smoothies", "Curries", "Desserts"],
        pairings: ["Lime", "Chili", "Coconut", "Avocado"],
        seasonality: "Spring/Summer",
        nutrition: ["Vitamin C", "Vitamin A", "Fiber", "Enzymes"],
      },
      {
        name: "Pineapple",
        elementalProperties: { Fire: 0.7, Water: 0.6, Earth: 0.3, Air: 0.6 },
        flavorProfile: "Sweet, tangy, tropical",
        culinaryUses: ["Grilled", "Salsas", "Smoothies", "Sweet & sour"],
        pairings: ["Ham", "Jalapeño", "Coconut", "Ginger"],
        seasonality: "Available year-round",
        nutrition: ["Vitamin C", "Bromelain", "Manganese", "B vitamins"],
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
        flavorProfile: "Nutty, slightly earthy, fluffy",
        culinaryUses: ["Salads", "Bowls", "Pilaf", "Breakfast porridge"],
        pairings: ["Vegetables", "Lemon", "Herbs", "Feta"],
        seasonality: "Available year-round",
        nutrition: ["Complete protein", "Fiber", "Iron", "Magnesium"],
      },
      {
        name: "Brown Rice",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 },
        flavorProfile: "Nutty, chewy, wholesome",
        culinaryUses: ["Stir-fry", "Bowls", "Pilaf", "Sushi"],
        pairings: ["Vegetables", "Soy sauce", "Sesame", "Beans"],
        seasonality: "Available year-round",
        nutrition: ["Fiber", "Manganese", "Selenium", "B vitamins"],
      },
      {
        name: "Oats",
        elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.8, Air: 0.3 },
        flavorProfile: "Mild, slightly sweet, creamy",
        culinaryUses: ["Oatmeal", "Granola", "Cookies", "Smoothies"],
        pairings: ["Berries", "Honey", "Nuts", "Cinnamon"],
        seasonality: "Available year-round",
        nutrition: ["Fiber", "Beta-glucan", "Iron", "B vitamins"],
      },
      {
        name: "Barley",
        elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 },
        flavorProfile: "Nutty, chewy, mild",
        culinaryUses: ["Soups", "Salads", "Risotto", "Stews"],
        pairings: ["Mushrooms", "Root vegetables", "Herbs", "Broth"],
        seasonality: "Available year-round",
        nutrition: ["Fiber", "Selenium", "B vitamins", "Copper"],
      },
      {
        name: "Millet",
        elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.8, Air: 0.4 },
        flavorProfile: "Mild, slightly sweet, fluffy",
        culinaryUses: ["Porridge", "Pilaf", "Flatbreads", "Salads"],
        pairings: ["Vegetables", "Curry", "Nuts", "Dried fruits"],
        seasonality: "Available year-round",
        nutrition: ["Magnesium", "Phosphorus", "Antioxidants", "Protein"],
      },
      {
        name: "Buckwheat",
        elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.8, Air: 0.3 },
        flavorProfile: "Earthy, nutty, robust",
        culinaryUses: ["Soba noodles", "Pancakes", "Porridge", "Granola"],
        pairings: ["Mushrooms", "Eggs", "Vegetables", "Honey"],
        seasonality: "Available year-round",
        nutrition: ["Complete protein", "Rutin", "Magnesium", "Fiber"],
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
  const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());

  const category = categories.find((cat) => cat.id === selectedCategory);
  const data = category ? category.getData() : [];
  const currentIngredients = calculateScore(data);

  const toggleIngredient = (ingredientName: string) => {
    setExpandedIngredients(prev => {
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
              className="p-4 cursor-pointer hover:bg-green-50 transition-colors"
              onClick={() => toggleIngredient(ingredient.name)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {ingredient.name}
                  <span className="text-lg">{expandedIngredients.has(ingredient.name) ? "−" : "+"}</span>
                </h4>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                  {(ingredient.score * 100).toFixed(0)}%
                </div>
              </div>

              {/* Flavor Profile - Always Visible */}
              {ingredient.flavorProfile && (
                <div className="mb-2">
                  <span className="text-sm text-gray-600 italic">{ingredient.flavorProfile}</span>
                </div>
              )}

              {/* Quick Info Badges */}
              <div className="flex flex-wrap gap-2">
                {ingredient.seasonality && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    {ingredient.seasonality}
                  </span>
                )}
                {ingredient.culinaryUses && ingredient.culinaryUses.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {ingredient.culinaryUses.length} uses
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedIngredients.has(ingredient.name) && (
              <div className="border-t border-gray-200 p-4 bg-gradient-to-br from-green-50 to-white space-y-4">
                {/* Culinary Uses */}
                {ingredient.culinaryUses && ingredient.culinaryUses.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                      <span>👨‍🍳</span>
                      <span>Culinary Uses</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.culinaryUses.map((use, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pairings */}
                {ingredient.pairings && ingredient.pairings.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                      <span>🤝</span>
                      <span>Pairs Well With</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.pairings.map((pairing, idx) => (
                        <span key={idx} className="text-xs bg-purple-50 text-purple-800 px-2 py-1 rounded-full">
                          {pairing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition */}
                {ingredient.nutrition && ingredient.nutrition.length > 0 && (
                  <div>
                    <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                      <span>💪</span>
                      <span>Health Benefits</span>
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ingredient.nutrition.map((benefit, idx) => (
                        <span key={idx} className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elemental Properties - De-emphasized, at bottom */}
                <div className="pt-3 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    ⚗️ Elemental Balance
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ingredient.elementalProperties).map(
                      ([element, value]) => (
                        <div key={element} className="flex items-center gap-2">
                          <span className="text-sm">
                            {element === "Fire" ? "🔥" : element === "Water" ? "💧" : element === "Earth" ? "🌍" : "💨"}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
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
                          <span className="text-xs text-gray-500 w-10 text-right">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
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
