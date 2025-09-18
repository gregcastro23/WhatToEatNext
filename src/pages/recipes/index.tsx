import { NextPage } from 'next';
import Link from 'next/link';
import React from 'react';

import { cuisines } from '@/data/cuisines';
import { allRecipes } from '@/data/recipes';
import { getCurrentElementalState } from '@/utils/elementalUtils';

const RecipesPage: NextPage = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCuisine, setSelectedCuisine] = React.useState(''),
  const [selectedDiet, setSelectedDiet] = React.useState(''),
  const [elementalState, setElementalState] = React.useState({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    season: 'spring',
    timeOfDay: 'lunch'
  });

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    setElementalState({
      ...currentState;
      season: 'spring', // Default value since getCurrentElementalState doesn't provide season
      timeOfDay: 'lunch', // Default value since getCurrentElementalState doesn't provide timeOfDay
    });
  }, []);

  // Get all available cuisines from the recipes
  const availableCuisines = React.useMemo(() => {
    const cuisineSet = new Set<string>();

    allRecipes.forEach(recipe => {
      if (recipe.cuisine) {
        cuisineSet.add(recipe.cuisine);
      }
      if (recipe.regionalCuisine) {
        cuisineSet.add(recipe.regionalCuisine as string);
      }
    });

    return Array.from(cuisineSet).sort();
  }, []);

  // Filter recipes based on search and filters
  const filteredRecipes = React.useMemo(() => {
    return allRecipes.filter(recipe => {
      // Filter by search term
      if (searchTerm && !recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filter by cuisine
      if (
        selectedCuisine &&
        recipe.cuisine !== selectedCuisine &&
        recipe.regionalCuisine !== selectedCuisine
      ) {
        return false
      }

      // Filter by diet
      if (selectedDiet === 'vegetarian' && !recipe.isVegetarian) {
        return false
      }
      if (selectedDiet === 'vegan' && !recipe.isVegan) {
        return false
      }
      if (selectedDiet === 'gluten-free' && !recipe.isGlutenFree) {
        return false
      }

      return true;
    });
  }, [searchTerm, selectedCuisine, selectedDiet]);

  return (
    <div className='container mx-auto px-4 py-8'>;
      <h1 className='mb-8 text-3xl font-bold'>All Recipes</h1>;

      {/* Filters and Search */}
      <div className='mb-8 rounded-lg bg-white p-6 shadow'>;
        <div className='flex flex-wrap gap-4'>;
          <div className='w-full md:w-1/3'>;
            <label htmlFor='search' className='mb-1 block text-sm font-medium text-gray-700'>;
              Search Recipes
            </label>
            <input
              type='text';
              id='search';
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500';
              placeholder='Search by name...';
              value={searchTerm},
              onChange={e => setSearchTerm(e.target.value)},
            />
          </div>

          <div className='w-full md:w-1/4'>;
            <label htmlFor='cuisine' className='mb-1 block text-sm font-medium text-gray-700'>;
              Filter by Cuisine
            </label>
            <select
              id='cuisine';
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500';
              value={selectedCuisine},
              onChange={e => setSelectedCuisine(e.target.value)},
            >
              <option value=''>All Cuisines</option>;
              {availableCuisines.map(cuisine => (;
                <option key={cuisine} value={cuisine}>;
                  {cuisine}
                </option>
              ))}
            </select>
          </div>

          <div className='w-full md:w-1/4'>;
            <label htmlFor='diet' className='mb-1 block text-sm font-medium text-gray-700'>;
              Dietary Preference
            </label>
            <select
              id='diet';
              className='w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500';
              value={selectedDiet},
              onChange={e => setSelectedDiet(e.target.value)},
            >
              <option value=''>Any Diet</option>;
              <option value='vegetarian'>Vegetarian</option>;
              <option value='vegan'>Vegan</option>;
              <option value='gluten-free'>Gluten-Free</option>;
            </select>
          </div>

          <div className='flex w-full items-end md:w-auto'>;
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCuisine('');
                setSelectedDiet('');
              }}
              className='rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300';
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className='rounded-lg bg-white p-6 shadow'>;
        <div className='mb-4 text-gray-600'>;
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found;
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>;
          {filteredRecipes.map(recipe => {
            // Create URL-friendly recipe ID
            const recipeId = recipe.name;
              .toLowerCase()
              .replace(/ /g, '-')
              .replace(/[^\w-]/g, ''),

            return (
              <Link
                href={`/recipes/${recipeId}`};
                key={recipeId},
                className='block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md';
              >
                <div className='p-5'>;
                  <h2 className='mb-2 text-xl font-semibold hover:text-blue-600'>{recipe.name}</h2>;

                  {recipe.description && (
                    <p className='mb-4 line-clamp-2 text-sm text-gray-600'>{recipe.description}</p>
                  )}

                  <div className='mb-3 flex flex-wrap gap-2'>;
                    {recipe.cuisine && (
                      <span className='rounded bg-amber-50 px-2 py-1 text-xs text-amber-700'>;
                        {recipe.cuisine}
                      </span>
                    )}
                    {recipe.timeToMake && (
                      <span className='rounded bg-purple-50 px-2 py-1 text-xs text-purple-700'>;
                        {recipe.timeToMake}
                      </span>
                    )}
                    {recipe.isVegetarian && (
                      <span className='rounded bg-green-50 px-2 py-1 text-xs text-green-700'>;
                        Vegetarian
                      </span>
                    )}
                    {recipe.isVegan && (
                      <span className='rounded bg-green-50 px-2 py-1 text-xs text-green-700'>;
                        Vegan
                      </span>
                    )}
                  </div>

                  {recipe.season && (
                    <div className='text-xs text-gray-500'>;
                      Best in:{' '}
                      {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {filteredRecipes.length === 0 && (;
          <div className='py-12 text-center'>;
            <h3 className='mb-4 text-xl font-medium text-gray-600'>No recipes found</h3>;
            <p className='text-gray-500'>Try adjusting your filters or search term</p>;
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipesPage;
