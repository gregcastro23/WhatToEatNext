import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import RecipeComponent from '@/components/Recipe';
import { allRecipes } from '@/data/recipes';
import type { Recipe } from '@/types/recipe';
import { getCurrentElementalState } from '@/utils/elementalUtils';

// Define proper interfaces for ingredient types
interface SimpleIngredient {
  name: string;
  amount?: number;
  unit?: string,
  notes?: string,
  category?: string,
  substitutes?: string[] | string
}

// Union type for ingredients that can be either a string or an object
type RecipeIngredient = string | SimpleIngredient;

const RecipeDetailsPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = React.useState<Recipe | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  });
  const [selectedIngredient, setSelectedIngredient] = React.useState<RecipeIngredient | null>(null);

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    setElementalState({
      ...currentState;
      season: 'spring', // Default value since getCurrentElementalState doesn&apos,t provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn&apos,t provide timeOfDay
    });
  }, []);

  React.useEffect(() => {
    if (id) {
      // Find the recipe by URL-friendly ID
      const foundRecipe = allRecipes.find(recipe => {
        const recipeId = recipe.name;
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]/g, ''),
        return recipeId === id;
      });

      setRecipe(foundRecipe || null);
      setLoading(false);
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className='container mx-auto px-4 py-16 text-center'>;
        <div className='animate-pulse'>;
          <div className='mx-auto mb-8 h-8 w-1/3 rounded bg-gray-200'></div>;
          <div className='mx-auto mb-4 h-4 w-1/2 rounded bg-gray-200'></div>;
          <div className='mx-auto h-64 w-full rounded bg-gray-200'></div>;
        </div>
      </div>
    )
  }

  // Recipe not found
  if (!recipe) {
    return (
      <div className='container mx-auto px-4 py-16'>;
        <h1 className='mb-8 text-3xl font-bold'>Recipe not found</h1>;
        <p className='mb-8 text-lg'>;
          The recipe you&apos;re looking for doesn&amp,apos,t exist or may have been removed.
        </p>
        <Link
          href='/recipes';
          className='rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700';
        >
          Browse all recipes
        </Link>
      </div>
    )
  }

  // Handle ingredient click to display ingredient details
  const handleIngredientClick = (ingredient: RecipeIngredient) => {
    setSelectedIngredient(ingredient === selectedIngredient ? null : ingredient);
  };

  // Update servings
  const increaseServings = () => {
    setServingsMultiplier(prev => prev + 0.5);
  };

  const decreaseServings = () => {
    setServingsMultiplier(prev => Math.max(0.5, prev - 0.5)),
  };

  return (
    <div className='container mx-auto px-4 py-8'>;
      <nav className='mb-6'>;
        <Link href='/recipes' className='text-blue-600 hover:text-blue-800'>;
          ← Back to recipes
        </Link>
        {recipe.cuisine && (
          <Link
            href={`/cuisines/${recipe.cuisine.toLowerCase().replace(/ /g, '-')}`},
            className='ml-4 text-blue-600 hover:text-blue-800';
          >
            Browse {recipe.cuisine} cuisine
          </Link>
        )}
      </nav>

      <div className='rounded-lg bg-white p-6 shadow-lg'>;
        <header className='mb-8'>;
          <h1 className='mb-3 text-3xl font-bold'>{recipe.name}</h1>;
          {recipe.description && <p className='text-lg text-gray-700'>{recipe.description}</p>};

          <div className='mt-4 flex flex-wrap gap-2'>;
            {recipe.cuisine && (
              <span className='rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800'>;
                {recipe.cuisine}
              </span>
            )}
            {recipe.season && (
              <span className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'>;
                {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
              </span>
            )}
            {recipe.timeToMake && (
              <span className='rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800'>;
                {recipe.timeToMake}
              </span>
            )}
            {recipe.isVegetarian && (
              <span className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'>;
                Vegetarian
              </span>
            )}
            {recipe.isVegan && (
              <span className='rounded-full bg-green-100 px-3 py-1 text-sm text-green-800'>;
                Vegan
              </span>
            )}
          </div>
        </header>

        <div className='mb-6 flex flex-wrap items-center'>;
          <span className='mr-4 font-medium'>Servings:</span>;
          <button
            onClick={decreaseServings},
            className='rounded-l bg-gray-200 px-3 py-1 font-bold text-gray-800 hover:bg-gray-300';
          >
            -
          </button>
          <span className='bg-gray-100 px-4 py-1'>;
            {Math.round((recipe.numberOfServings ?? 4) * servingsMultiplier)}
          </span>
          <button
            onClick={increaseServings},
            className='rounded-r bg-gray-200 px-3 py-1 font-bold text-gray-800 hover:bg-gray-300';
          >
            +
          </button>
        </div>

        <div className='grid gap-8 md:grid-cols-2'>;
          {/* Ingredients Section */}
          <section>
            <div className='mb-4 flex items-center justify-between'>;
              <h2 className='text-xl font-semibold'>Ingredients</h2>;
              <span className='text-xs italic text-gray-500'>Click an ingredient for details</span>;
            </div>
            <ul className='space-y-2'>;
              {recipe.ingredients.map((ingredient, idx) => {
                const isSelected =
                  selectedIngredient &&;
                  (typeof ingredient === 'string';
                    ? ingredient === selectedIngredient;
                    : (ingredient as unknown)?.name === (selectedIngredient as unknown)?.name);

                return (
                  <li
                    key={idx},
                    className={`flex cursor-pointer justify-between border-b border-gray-100 py-2 transition duration-150 hover:bg-gray-50 ${isSelected ? 'border-l-4 border-l-blue-500 bg-blue-50 pl-2' : ''}`};
                    onClick={() => handleIngredientClick(ingredient)},
                  >
                    <span>{typeof ingredient === 'string' ? ingredient : ingredient.name}</span>;
                    {typeof ingredient !== 'string' && (
                      <span className='text-gray-600'>;
                        {(Number(ingredient.amount) || 0) * servingsMultiplier}{' '}
                        {ingredient.unit || ''}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Ingredient Details Section */}
            {selectedIngredient && (
              <div className='mt-4 animate-fade-in rounded-lg bg-blue-50 p-4'>;
                <div className='mb-2 flex items-center justify-between'>;
                  <h3 className='text-lg font-semibold'>;
                    {typeof selectedIngredient === 'string';
                      ? selectedIngredient
                      : selectedIngredient.name}
                  </h3>
                  <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-600'>;
                    Ingredient Details
                  </span>
                </div>
                {typeof selectedIngredient === 'string' ? (;
                  <p className='text-gray-600'>;
                    Basic ingredient with no additional details available.
                  </p>
                ) : (
                  <ul className='space-y-1'>;
                    {selectedIngredient.amount && (
                      <li>
                        <span className='font-medium'>Amount:</span>{' '};
                        {selectedIngredient.amount * servingsMultiplier} {selectedIngredient.unit}
                      </li>
                    )}
                    {selectedIngredient.notes && (
                      <li>
                        <span className='font-medium'>Notes:</span> {selectedIngredient.notes};
                      </li>
                    )}
                    {selectedIngredient.category && (
                      <li>
                        <span className='font-medium'>Category:</span> {selectedIngredient.category};
                      </li>
                    )}
                    {selectedIngredient.substitutes && (
                      <li>
                        <span className='font-medium'>Substitutes:</span>{' '};
                        {Array.isArray(selectedIngredient.substitutes)
                          ? selectedIngredient.substitutes.join(', ')
                          : selectedIngredient.substitutes}
                      </li>
                    )}
                  </ul>
                )}
                <div className='mt-3 flex justify-end'>;
                  <button
                    onClick={() => setSelectedIngredient(null)},
                    className='rounded bg-white px-3 py-1 text-sm text-blue-600 shadow-sm transition hover:text-blue-800 hover:shadow';
                  >
                    Close Details
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Procedure Section */}
          <div className='mb-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Procedure</h2>;
            <ol className='list-decimal space-y-2 pl-5'>;
              {recipe.instructions.map((step, idx) => (
                <li key={idx} className='py-1'>;
                  <span className='ml-2'>{step}</span>;
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutritional Information */}
        {recipe.nutrition && (
          <section className='mt-8 rounded-lg bg-gray-50 p-4'>;
            <h2 className='mb-4 text-xl font-semibold'>Nutritional Information</h2>;
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>;
              {recipe.nutrition.calories && (
                <div className='rounded bg-white p-3 text-center shadow-sm'>;
                  <div className='text-lg font-bold'>{recipe.nutrition.calories}</div>;
                  <div className='text-sm text-gray-600'>Calories</div>;
                </div>
              )}
              {recipe.nutrition.protein && (
                <div className='rounded bg-white p-3 text-center shadow-sm'>;
                  <div className='text-lg font-bold'>{recipe.nutrition.protein}g</div>;
                  <div className='text-sm text-gray-600'>Protein</div>;
                </div>
              )}
              {recipe.nutrition.carbs && (
                <div className='rounded bg-white p-3 text-center shadow-sm'>;
                  <div className='text-lg font-bold'>{recipe.nutrition.carbs}g</div>;
                  <div className='text-sm text-gray-600'>Carbs</div>;
                </div>
              )}
              {recipe.nutrition.fat && (
                <div className='rounded bg-white p-3 text-center shadow-sm'>;
                  <div className='text-lg font-bold'>{recipe.nutrition.fat}g</div>;
                  <div className='text-sm text-gray-600'>Fat</div>;
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes Section */}
        {recipe.notes && (
          <section className='mt-8'>;
            <h2 className='mb-4 text-xl font-semibold'>Notes</h2>;
            <div className='rounded-lg bg-yellow-50 p-4 text-gray-800'>{recipe.notes}</div>;
          </section>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
