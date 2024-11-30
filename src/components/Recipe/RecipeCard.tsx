// src/components/recipe/RecipeCard.tsx

import React, { useState } from 'react';
import { Recipe } from '@/data/recipes'; // Adjust the import path as necessary
import { getElementalColor, getElementalSymbol } from '@/utils/elemental';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dominantElement = 'Fire'; // Replace with actual logic to determine dominant element

  return (
    <div className={`h-full ${getElementalColor(dominantElement, 'bg')} hover:shadow-lg transition-all`}>
      {/* Recipe Header - Always Visible */}
      <div 
        className="p-4 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{recipe.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Ingredients</span>
            <button 
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{recipe.description}</p>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Ingredients Section */}
          <div>
            <h4 className="font-medium text-sm mb-2">Ingredients:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700">
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                  {ingredient.swaps && ingredient.swaps.length > 0 && (
                    <span className="text-gray-500 text-xs">
                      {" "}(or {ingredient.swaps.join(", ")})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition Section */}
          <div>
            <h4 className="font-medium text-sm mb-2">Nutrition:</h4>
            <div className="text-sm text-gray-700">
              <p>Calories: {recipe.nutrition.calories}</p>
              <p>Protein: {recipe.nutrition.protein}g</p>
              <p>Carbs: {recipe.nutrition.carbs}g</p>
              <p>Fat: {recipe.nutrition.fat}g</p>
              {recipe.nutrition.vitamins && (
                <p>Vitamins: {recipe.nutrition.vitamins.join(", ")}</p>
              )}
              {recipe.nutrition.minerals && (
                <p>Minerals: {recipe.nutrition.minerals.join(", ")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Only shows cook time now */}
      <div className="px-4 py-2 bg-gray-50 border-t">
        <span className="text-sm text-gray-600">⏱️ {recipe.timeToMake}</span>
      </div>
    </div>
  );
};

export default RecipeCard;