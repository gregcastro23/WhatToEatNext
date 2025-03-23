import React from 'react';
import type { Recipe } from '@/types/recipe';
import styles from './CuisineSection.module.css';

interface CuisineSectionProps {
  cuisine: string;
  recipes?: Recipe[];
  elementalState: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    season: string;
    timeOfDay: string;
  };
}

export const CuisineSection: React.FC<CuisineSectionProps> = ({
  cuisine,
  recipes = [],
  elementalState
}) => {
  const [expandedRecipe, setExpandedRecipe] = React.useState<string | null>(null);

  const cuisineRecipes = React.useMemo(() => {
    if (!Array.isArray(recipes)) return [];
    
    return recipes
      .filter(recipe => recipe?.cuisine?.toLowerCase() === cuisine.toLowerCase())
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, 4);
  }, [recipes, cuisine]);

  if (!cuisineRecipes.length) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold capitalize">
            {cuisine.replace('_', ' ')} Cuisine
          </h2>
          <span className="text-sm text-gray-600">
            No recipes available
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          No recipes available for this cuisine at the moment
        </div>
      </div>
    );
  }

  const renderIngredientsList = (recipe: Recipe) => (
    <div className="mt-3 space-y-2">
      <h4 className="font-medium">Ingredients:</h4>
      <ul className="text-sm space-y-1">
        {recipe.ingredients?.map((ingredient: { name: string, amount: string, unit: string }, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{ingredient.name}</span>
            <span className="text-gray-600">
              {ingredient.amount} {ingredient.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderNutritionalInfo = (recipe: Recipe) => (
    <div className="mt-3 space-y-2">
      <h4 className="font-medium">Nutritional Information:</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {recipe.nutrition?.calories && (
          <div>Calories: {recipe.nutrition.calories}</div>
        )}
        {recipe.nutrition?.protein && (
          <div>Protein: {recipe.nutrition.protein}g</div>
        )}
        {recipe.nutrition?.carbs && (
          <div>Carbs: {recipe.nutrition.carbs}g</div>
        )}
        {recipe.nutrition?.fat && (
          <div>Fat: {recipe.nutrition.fat}g</div>
        )}
      </div>
      {recipe.nutrition?.vitamins && (
        <div className="text-sm">
          <span className="font-medium">Vitamins: </span>
          {recipe.nutrition.vitamins.join(', ')}
        </div>
      )}
      {recipe.nutrition?.minerals && (
        <div className="text-sm">
          <span className="font-medium">Minerals: </span>
          {recipe.nutrition.minerals.join(', ')}
        </div>
      )}
    </div>
  );

  const renderElementalProperties = (recipe: Recipe) => (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <h4 className="font-medium mb-2">Elemental Balance:</h4>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(recipe.elementalProperties || {}).map(([element, value]) => (
          <div key={element} className={`${styles.elementalBadge} ${styles[element.toLowerCase()]}`}>
            <div className="text-xs">{element}</div>
            <div className="font-medium">{Math.round(value * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSeasonalInfo = (recipe: Recipe) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {recipe.season && (
        <span className="text-sm px-2 py-1 bg-green-50 text-green-700 rounded">
          {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
        </span>
      )}
      {recipe.mealType && (
        <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded">
          {Array.isArray(recipe.mealType) ? recipe.mealType.join(', ') : recipe.mealType}
        </span>
      )}
      {recipe.timeToMake && (
        <span className="text-sm px-2 py-1 bg-purple-50 text-purple-700 rounded">
          {recipe.timeToMake}
        </span>
      )}
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">
          {cuisine.replace('_', ' ')} Cuisine
        </h2>
        <span className="text-sm text-gray-600">
          {cuisineRecipes.length} recipes available
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cuisineRecipes.map((recipe, index) => (
          <div 
            key={`${recipe.name}-${index}`}
            className={`${styles.recipeCard} bg-white p-4 rounded-lg shadow-md`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{recipe.name}</h3>
              {recipe.matchScore && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  {Math.round(recipe.matchScore)}% match
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
            
            {renderSeasonalInfo(recipe)}
            
            <button
              onClick={() => setExpandedRecipe(expandedRecipe === recipe.name ? null : recipe.name)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {expandedRecipe === recipe.name ? 'Show less' : 'Show more'}
            </button>

            {expandedRecipe === recipe.name && (
              <div className="mt-4 space-y-4">
                {renderIngredientsList(recipe)}
                {renderNutritionalInfo(recipe)}
                {renderElementalProperties(recipe)}
                
                {recipe.preparation && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-medium">Preparation:</h4>
                    <p className="text-sm text-gray-700">{recipe.preparation}</p>
                  </div>
                )}
                
                {recipe.notes && (
                  <div className="mt-3 space-y-2">
                    <h4 className="font-medium">Notes:</h4>
                    <p className="text-sm text-gray-700">{recipe.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 