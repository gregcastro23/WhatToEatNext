import { FC } from 'react';
import type { Recipe } from '@/types/recipe';

interface RecipeProps {
  recipe: Recipe;
  servingsMultiplier: number;
  onIngredientClick?: (ingredient: Recipe['ingredients'][0]) => void;
}

const RecipeComponent: FC<RecipeProps> = ({ 
  recipe, 
  servingsMultiplier = 1,
  onIngredientClick 
}) => {
  const calculateAmount = (amount: number): string => {
    return (amount * servingsMultiplier).toFixed(2);
  };

  return (
    <article className="recipe">
      <header>
        <h2 className="recipe-title">{recipe.title}</h2>
        {recipe.description && (
          <p className="recipe-description">{recipe.description}</p>
        )}
      </header>

      <div className="recipe-meta">
        {recipe.prepTime && <span>Prep: {recipe.prepTime}</span>}
        {recipe.cookTime && <span>Cook: {recipe.cookTime}</span>}
        {recipe.servings && (
          <span>Servings: {Math.round(recipe.servings * servingsMultiplier)}</span>
        )}
        {recipe.difficulty && <span>Difficulty: {recipe.difficulty}</span>}
      </div>

      <section className="recipe-ingredients">
        <h3>Ingredients</h3>
        <ul>
          {recipe.ingredients.map((ingredient) => (
            <li 
              key={ingredient.id}
              onClick={() => onIngredientClick?.(ingredient)}
              className="ingredient-item"
            >
              <span className="amount">{calculateAmount(ingredient.amount)}</span>
              <span className="unit">{ingredient.unit}</span>
              <span className="name">{ingredient.name}</span>
              {ingredient.notes && (
                <small className="notes">({ingredient.notes})</small>
              )}
            </li>
          ))}
        </ul>
      </section>

      {recipe.instructions && (
        <section className="recipe-instructions">
          <h3>Instructions</h3>
          <ol>
            {recipe.instructions.map((step, index) => (
              <li key={index} className="instruction-step">
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {recipe.tags && recipe.tags.length > 0 && (
        <footer className="recipe-tags">
          {recipe.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
};

export default RecipeComponent; 