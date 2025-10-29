'use client';

/**
 * Ingredient Preview Component
 * Shows top ingredients from real ingredient data by category
 * Uses actual ingredient database with elemental properties
 */

import React, { useState, useMemo } from 'react';
import { spices } from '@/data/ingredients/spices';
import { enhancedVegetables } from '@/data/ingredients/vegetables';
import { proteins } from '@/data/ingredients';
import { fruits } from '@/data/ingredients/fruits';
import { allGrains } from '@/data/ingredients/grains';
import { allHerbs } from '@/data/ingredients/herbs';

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
    getData: () => Object.values(spices).slice(0, 6)
  },
  {
    id: 'herbs',
    name: 'Herbs',
    icon: '🌿',
    getData: () => Object.values(allHerbs).slice(0, 6)
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥬',
    getData: () => Object.values(enhancedVegetables).slice(0, 6)
  },
  {
    id: 'proteins',
    name: 'Proteins',
    icon: '🍗',
    getData: () => Object.values(proteins).slice(0, 6)
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: '🍎',
    getData: () => Object.values(fruits).slice(0, 6)
  },
  {
    id: 'grains',
    name: 'Grains',
    icon: '🌾',
    getData: () => Object.values(allGrains).slice(0, 6)
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

  const currentIngredients = useMemo(() => {
    const category = categories.find(cat => cat.id === selectedCategory);
    if (!category) return [];

    const data = category.getData();
    return calculateScore(data);
  }, [selectedCategory]);

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
