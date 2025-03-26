'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Loading from '@/components/ui/Loading'
import { Recipe, CuisineType } from '@/types/recipe'
import { recipes } from '@/data/recipes'
import { cuisines } from '@/data/cuisines'
import { Clock, Users, ChefHat } from 'lucide-react'

export default function RecipeList() {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All')

  const cuisineTypes = ['All', ...Object.keys(cuisines)]
  const filteredRecipes = selectedCuisine === 'All' 
    ? recipes 
    : recipes.filter(recipe => recipe.cuisine.toLowerCase() === selectedCuisine.toLowerCase())

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {cuisineTypes.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-full transition-colors
              ${selectedCuisine === cuisine 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredRecipes.map((recipe) => {
          const fullRecipeData = cuisines[recipe.cuisine]?.dishes?.breakfast?.all?.find(
            dish => dish.name === recipe.name
          ) || cuisines[recipe.cuisine]?.dishes?.lunch?.all?.find(
            dish => dish.name === recipe.name
          ) || cuisines[recipe.cuisine]?.dishes?.dinner?.all?.find(
            dish => dish.name === recipe.name
          );

          return (
            <div 
              key={recipe.id}
              className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800"
            >
              <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <span className="flex items-center gap-1">
                  <ChefHat className="w-4 h-4" />
                  {recipe.cuisine}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.prepTime}
                </span>
                <span className={`
                  ${recipe.difficulty === 'Easy' ? 'text-green-500' : ''}
                  ${recipe.difficulty === 'Medium' ? 'text-yellow-500' : ''}
                  ${recipe.difficulty === 'Hard' ? 'text-red-500' : ''}
                `}>
                  Difficulty: {recipe.difficulty}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-400 mb-6">
                {recipe.description}
              </p>

              {fullRecipeData && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {fullRecipeData.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">
                          {ingredient.amount} {ingredient.unit} {ingredient.name}
                          {ingredient.swaps && ingredient.swaps.length > 0 && (
                            <span className="text-gray-500 text-sm">
                              {' '}(or {ingredient.swaps.join(', ')})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {fullRecipeData.nutrition && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Nutrition Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
                          <div className="font-medium">{fullRecipeData.nutrition.calories}</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Protein</div>
                          <div className="font-medium">{fullRecipeData.nutrition.protein}g</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Carbs</div>
                          <div className="font-medium">{fullRecipeData.nutrition.carbs}g</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Fat</div>
                          <div className="font-medium">{fullRecipeData.nutrition.fat}g</div>
                        </div>
                      </div>
                      {fullRecipeData.nutrition.vitamins && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Vitamins: {fullRecipeData.nutrition.vitamins.join(', ')}
                        </div>
                      )}
                      {fullRecipeData.nutrition.minerals && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Minerals: {fullRecipeData.nutrition.minerals.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {fullRecipeData.season && (
                      <div className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full">
                        Season: {fullRecipeData.season.join(', ')}
                      </div>
                    )}
                    {fullRecipeData.mealType && (
                      <div className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full">
                        Meal: {fullRecipeData.mealType.join(', ')}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 