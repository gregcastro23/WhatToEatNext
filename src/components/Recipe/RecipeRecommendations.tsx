import React from 'react';
import Recipe from './Recipe';
import { cuisines } from '@/data/cuisines';
import { findBestMatches } from '@/utils/recipeMatching';
import type { Dish } from '@/data/cuisines';
import type { ElementalProperties } from '@/types/alchemy';
import { useAlchemical } from '@/contexts/AlchemicalContext';

interface RecipeRecommendationsProps {
  filters: {
    servingSize: string;
    dietaryPreference: string;
    cookingTime: string;
  };
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  filters,
}) => {
  const { engine, state } = useAlchemical();
  
  // Get all recipes
  const allRecipes = Object.entries(cuisines).flatMap(([_, cuisine]) =>
    Object.entries(cuisine.dishes).flatMap(([mealType, mealTypeData]) =>
      Object.entries(mealTypeData).flatMap(([season, recipes]) =>
        recipes.map((recipe: Dish) => ({
          ...recipe,
          mealType,
          season
        }))
      )
    )
  );

  // Apply basic filters
  const filteredRecipes = allRecipes.filter(recipe => {
    if (filters.cookingTime !== 'all' && 
        parseInt(recipe.timeToMake) > parseInt(filters.cookingTime)) {
      return false;
    }
    // Add other filters
    return true;
  });

  // Get optimal recipes using the engine
  const recommendations = engine.findOptimalRecipes(filteredRecipes);

  const getElementalDisplay = (elements: ElementalProperties) => {
    return Object.entries(elements)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [_, b]) => b - a)
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Current Elemental Balance */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-2">Current Elemental Balance</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {Object.entries(state.elementalBalance).map(([element, value]) => (
            <div key={element} className="flex items-center">
              <span className="mr-2">
                {element === 'Fire' && '🔥'}
                {element === 'Water' && '💧'}
                {element === 'Air' && '💨'}
                {element === 'Earth' && '🌍'}
              </span>
              <span>{element}: {Math.round(value * 100)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.map(({ recipe, score, elements }) => (
          <Recipe 
            key={`${recipe.cuisine}-${recipe.name}`}
            recipe={recipe}
            score={score}
            elements={elements}
            dominantElements={getElementalDisplay(elements)}
          />
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No recipes match your current criteria. Try adjusting the elemental balance or filters.
        </div>
      )}
    </div>
  );
};

export default RecipeRecommendations;