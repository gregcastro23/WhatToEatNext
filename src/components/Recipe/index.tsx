import React from 'react';
import type { Recipe } from '@/types/recipe';

interface RecipeComponentProps {
  recipe: Recipe;
  showDetails?: boolean;
}

export default function RecipeComponent({ recipe, showDetails = true }: RecipeComponentProps) {
  return (
    <div className="recipe-component">
      <h2>{recipe.name}</h2>
      <p>{recipe.description}</p>
      
      {showDetails && (
        <div className="recipe-details">
          <div className="ingredients">
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients?.map((ingredient, index) => (
                <li key={index}>{typeof ingredient === 'string' ? ingredient : ingredient.name || String(ingredient)}</li>
              ))}
            </ul>
          </div>
          
          <div className="instructions">
            <h3>Instructions</h3>
            <ol>
              {recipe.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>
          
          {recipe.nutrition && (
            <div className="nutrition">
              <h3>Nutrition</h3>
              <p>Calories: {recipe.nutrition.calories}</p>
              <p>Protein: {recipe.nutrition.protein}g</p>
              <p>Carbs: {recipe.nutrition.carbs}g</p>
              <p>Fat: {recipe.nutrition.fat}g</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
