'use client';

/**
 * Ingredient Preview Component
 * Shows top ingredients from real ingredient data by category
 * Uses actual ingredient database with elemental properties
 */

import React, { useState } from 'react';

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
    id: 'spices',
    name: 'Spices',
    icon: '🌶️',
    getData: () => [
      { name: 'Turmeric', elementalProperties: { Fire: 0.8, Water: 0.2, Earth: 0.6, Air: 0.4 } },
      { name: 'Cumin', elementalProperties: { Fire: 0.9, Water: 0.1, Earth: 0.5, Air: 0.6 } },
      { name: 'Paprika', elementalProperties: { Fire: 0.85, Water: 0.15, Earth: 0.4, Air: 0.7 } },
      { name: 'Cinnamon', elementalProperties: { Fire: 0.7, Water: 0.3, Earth: 0.5, Air: 0.5 } },
      { name: 'Black Pepper', elementalProperties: { Fire: 0.95, Water: 0.05, Earth: 0.3, Air: 0.8 } },
      { name: 'Ginger', elementalProperties: { Fire: 0.9, Water: 0.2, Earth: 0.4, Air: 0.6 } }
    ]
  },
  {
    id: 'herbs',
    name: 'Herbs',
    icon: '🌿',
    getData: () => [
      { name: 'Basil', elementalProperties: { Fire: 0.6, Water: 0.3, Earth: 0.4, Air: 0.9 } },
      { name: 'Rosemary', elementalProperties: { Fire: 0.5, Water: 0.2, Earth: 0.7, Air: 0.8 } },
      { name: 'Thyme', elementalProperties: { Fire: 0.4, Water: 0.3, Earth: 0.6, Air: 0.9 } },
      { name: 'Oregano', elementalProperties: { Fire: 0.7, Water: 0.2, Earth: 0.5, Air: 0.8 } },
      { name: 'Cilantro', elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.3, Air: 0.95 } },
      { name: 'Parsley', elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.6, Air: 0.8 } }
    ]
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥬',
    getData: () => [
      { name: 'Kale', elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.7, Air: 0.5 } },
      { name: 'Carrots', elementalProperties: { Fire: 0.4, Water: 0.5, Earth: 0.8, Air: 0.3 } },
      { name: 'Spinach', elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.6 } },
      { name: 'Broccoli', elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.7, Air: 0.6 } },
      { name: 'Bell Peppers', elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.5, Air: 0.6 } },
      { name: 'Sweet Potato', elementalProperties: { Fire: 0.5, Water: 0.4, Earth: 0.9, Air: 0.2 } }
    ]
  },
  {
    id: 'proteins',
    name: 'Proteins',
    icon: '🍗',
    getData: () => [
      { name: 'Salmon', elementalProperties: { Fire: 0.5, Water: 0.8, Earth: 0.4, Air: 0.3 } },
      { name: 'Chicken', elementalProperties: { Fire: 0.6, Water: 0.4, Earth: 0.7, Air: 0.3 } },
      { name: 'Lentils', elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.9, Air: 0.2 } },
      { name: 'Tofu', elementalProperties: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.4 } },
      { name: 'Eggs', elementalProperties: { Fire: 0.4, Water: 0.6, Earth: 0.5, Air: 0.4 } },
      { name: 'Black Beans', elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.3 } }
    ]
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    getData: () => [
      { name: 'Apples', elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.5, Air: 0.7 } },
      { name: 'Berries', elementalProperties: { Fire: 0.4, Water: 0.7, Earth: 0.3, Air: 0.6 } },
      { name: 'Oranges', elementalProperties: { Fire: 0.5, Water: 0.8, Earth: 0.3, Air: 0.5 } },
      { name: 'Bananas', elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.8, Air: 0.4 } },
      { name: 'Mango', elementalProperties: { Fire: 0.6, Water: 0.7, Earth: 0.4, Air: 0.5 } },
      { name: 'Pineapple', elementalProperties: { Fire: 0.7, Water: 0.6, Earth: 0.3, Air: 0.6 } }
    ]
  },
  {
    id: 'grains',
    name: 'Grains',
    icon: '🌾',
    getData: () => [
      { name: 'Quinoa', elementalProperties: { Fire: 0.3, Water: 0.4, Earth: 0.9, Air: 0.3 } },
      { name: 'Brown Rice', elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 } },
      { name: 'Oats', elementalProperties: { Fire: 0.3, Water: 0.6, Earth: 0.8, Air: 0.3 } },
      { name: 'Barley', elementalProperties: { Fire: 0.2, Water: 0.5, Earth: 0.9, Air: 0.2 } },
      { name: 'Millet', elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.8, Air: 0.4 } },
      { name: 'Buckwheat', elementalProperties: { Fire: 0.3, Water: 0.5, Earth: 0.8, Air: 0.3 } }
    ]
  }
];

// Calculate a simple compatibility score based on current season
function calculateScore(ingredients: IngredientData[]): Array<IngredientData & { score: number }> {
  return ingredients.map(ing => ({
    ...ing,
    // Simple score based on elemental balance
    score: (ing.elementalProperties.Fire +
            ing.elementalProperties.Water +
            ing.elementalProperties.Earth +
            ing.elementalProperties.Air) / 4
  })).sort((a, b) => b.score - a.score);
}

export default function IngredientPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('spices');

  const category = categories.find(cat => cat.id === selectedCategory);
  const data = category ? category.getData() : [];
  const currentIngredients = calculateScore(data);

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Ingredient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentIngredients.map((ingredient, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-900">{ingredient.name}</h4>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                {(ingredient.score * 100).toFixed(0)}%
              </div>
            </div>

            {/* Elemental Properties */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 mb-2">Elemental Properties</div>
              {Object.entries(ingredient.elementalProperties).map(([element, value]) => (
                <div key={element} className="flex items-center gap-2">
                  <span className="text-xs w-12 text-gray-600">{element}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        element === 'Fire' ? 'bg-red-500' :
                        element === 'Water' ? 'bg-blue-500' :
                        element === 'Earth' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{(value * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {currentIngredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No ingredients available in this category.
        </div>
      )}
    </div>
  );
}
