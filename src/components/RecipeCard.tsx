import React from 'react';
import @/types  from 'recipe ';
import next  from 'image ';

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  return (
    <div
      className="max-w-sm border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transition-transform hover:scale-102"
      onClick={onClick}
    >
      {recipe.image && (
        <div className="relative h-[200px] w-full">
          <Image 
            src={recipe.image} 
            alt={recipe.name} 
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-row gap-2 mb-2">
          {recipe.cuisine && (
            <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
              {recipe.cuisine}
            </span>
          )}
          {recipe.cookingTime && (
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {recipe.cookingTime} min
            </span>
          )}
        </div>

        <h3 className="text-lg font-medium mb-2">{recipe.name}</h3>
        
        {recipe.description && (
          <p className="text-gray-600 mb-2 overflow-hidden text-ellipsis whitespace-nowrap max-h-[2.4em]">
            {recipe.description}
          </p>
        )}
        
        {recipe.rating && (
          <p className="text-sm text-yellow-500">
            {'★'.repeat(Math.floor(recipe.rating))}
            {recipe.rating % 1 >= 0.5 ? '☆' : ''}
            {' '}
            ({recipe.rating.toFixed(1)})
          </p>
        )}
      </div>
    </div>
  );
};

export default RecipeCard; 