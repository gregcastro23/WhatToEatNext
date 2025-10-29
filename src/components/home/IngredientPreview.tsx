'use client';

/**
 * Ingredient Preview Component
 * Shows a preview of ingredient recommendations by category
 * Simplified version of the full IngredientRecommender
 */

import React, { useState } from 'react';

interface IngredientCategory {
  id: string;
  name: string;
  icon: string;
  ingredients: Array<{
    name: string;
    score: number;
    elements: {
      Fire: number;
      Water: number;
      Earth: number;
      Air: number;
    };
  }>;
}

const mockCategories: IngredientCategory[] = [
  {
    id: 'spices',
    name: 'Spices & Herbs',
    icon: '🌿',
    ingredients: [
      { name: 'Turmeric', score: 0.92, elements: { Fire: 0.8, Water: 0.2, Earth: 0.6, Air: 0.4 } },
      { name: 'Cinnamon', score: 0.88, elements: { Fire: 0.7, Water: 0.3, Earth: 0.5, Air: 0.5 } },
      { name: 'Ginger', score: 0.85, elements: { Fire: 0.9, Water: 0.2, Earth: 0.4, Air: 0.6 } }
    ]
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥬',
    ingredients: [
      { name: 'Kale', score: 0.90, elements: { Fire: 0.3, Water: 0.6, Earth: 0.7, Air: 0.5 } },
      { name: 'Carrots', score: 0.87, elements: { Fire: 0.4, Water: 0.5, Earth: 0.8, Air: 0.3 } },
      { name: 'Spinach', score: 0.84, elements: { Fire: 0.2, Water: 0.7, Earth: 0.6, Air: 0.6 } }
    ]
  },
  {
    id: 'proteins',
    name: 'Proteins',
    icon: '🍗',
    ingredients: [
      { name: 'Salmon', score: 0.91, elements: { Fire: 0.5, Water: 0.8, Earth: 0.4, Air: 0.3 } },
      { name: 'Lentils', score: 0.89, elements: { Fire: 0.3, Water: 0.5, Earth: 0.9, Air: 0.2 } },
      { name: 'Chicken', score: 0.86, elements: { Fire: 0.6, Water: 0.4, Earth: 0.7, Air: 0.3 } }
    ]
  }
];

export default function IngredientPreview() {
  const [selectedCategory, setSelectedCategory] = useState<string>('spices');

  const currentCategory = mockCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {mockCategories.map(category => (
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
      {currentCategory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentCategory.ingredients.map((ingredient, index) => (
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
                {Object.entries(ingredient.elements).map(([element, value]) => (
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
      )}
    </div>
  );
}
