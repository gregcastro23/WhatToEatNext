import React, { useState } from 'react';
import { getRecipesForCuisine } from '../utils/recipeFilters';
import { allRecipes } from '../data/recipes';
import type { Recipe } from '../types/recipe';

interface CuisineSelectorProps {
  onRecipesChange: (recipes: Recipe[]) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string) => void;
}

function CuisineSelector({ 
  onRecipesChange, 
  selectedCuisine, 
  onCuisineChange 
}: CuisineSelectorProps) {
  const availableCuisines = [
    'Italian',
    'Mexican',
    'Chinese',
  ];

  const handleCuisineSelect = (cuisine: string) => {
    const recipes = getRecipesForCuisine(cuisine, allRecipes);
    onRecipesChange(recipes);
    onCuisineChange(cuisine);
  };

  return (
    <div className="cuisine-selector">
      <h2 className="text-xl font-bold mb-4">Select a Cuisine</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {availableCuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => handleCuisineSelect(cuisine.toLowerCase())}
            className={`
              p-4 rounded-lg shadow-md transition-all
              ${selectedCuisine === cuisine.toLowerCase()
                ? 'bg-primary text-white'
                : 'bg-white hover:bg-gray-50'
              }
            `}
          >
            <span className="text-lg font-medium">{cuisine}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CuisineSelector; 