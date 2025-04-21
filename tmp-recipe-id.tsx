import React from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Link from 'next/link';
import { allRecipes } from '@/data/recipes';
import type { Recipe, RecipeIngredient } from '@/types/recipe';
import RecipeComponent from '@/components/Recipe';
import { ElementalCalculator } from '@/services/ElementalCalculator';

// Define constants for element IDs and strings
const ELEMENT_IDS = {
  INGREDIENT_LIST: 'ingredient-list',
  INSTRUCTION_LIST: 'instruction-list',
  PROCEDURE_LIST: 'procedure-list',
  NUTRITIONAL_INFO: 'nutritional-info'
};

// Define meal types and nutritional constants
const NUTRITION_LABELS = {
  CALORIES: 'Calories',
  PROTEIN: 'Protein',
  CARBS: 'Carbs',
  FAT: 'Fat',
  FIBER: 'Fiber',
  VITAMINS: 'Vitamins',
  MINERALS: 'Minerals'
};

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
    timeOfDay: 'lunch',
  });
  const [selectedIngredient, setSelectedIngredient] = React.useState<RecipeIngredient | string | null>(null);

  React.useEffect(() => {
    // Get current elemental state based on time, date, etc.
    const currentState = ElementalCalculator.getCurrentElementalState();
    setElementalState({
      ...currentState,
      season: 'spring',
      timeOfDay: 'lunch',
    });
  }, []);

  React.useEffect(() => {
    if (id) {
      // Find the recipe by URL-friendly ID
      const foundRecipe = allRecipes.find(recipe => {
        const recipeId = recipe.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        return recipeId === id;
      });
      
      setRecipe(foundRecipe || null);
      setLoading(false);
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Recipe not found
  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Recipe not found</h1>
        <p className="text-lg mb-8">The recipe you're looking for doesn't exist or may have been removed.</p>
        <Link href="/recipes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Browse all recipes
        </Link>
      </div>
    );
  }

  // Handle ingredient click to display ingredient details
  const handleIngredientClick = (ingredient: RecipeIngredient | string) => {
    setSelectedIngredient(ingredient === selectedIngredient ? null : ingredient);
  };

  // Update servings
  const increaseServings = () => {
    setServingsMultiplier(prev => prev + 0.5);
  };

  const decreaseServings = () => {
    setServingsMultiplier(prev => Math.max(0.5, prev - 0.5));
  };

  // Calculate nutritional values based on servings
  const calculateNutritionalValue = (value: number | undefined): number | undefined => {
    if (value === undefined) return undefined;
    // Simplify the calculation to avoid type issues
    const result = value * servingsMultiplier;
    return Math.round(result * 10) / 10; // Round to 1 decimal place
  };

  // Helper function to get name with type check
  const getIngredientName = (ingredient: RecipeIngredient | string): string => {
    return typeof ingredient === 'string' ? ingredient : ingredient.name;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6">
        <Link href="/recipes" className="text-blue-600 hover:text-blue-800">
          ← Back to recipes
        </Link>
        {recipe.cuisine && (
          <Link 
            href={`/cuisines/${recipe.cuisine.toLowerCase().replace(/ /g, '-')}`}
            className="ml-4 text-blue-600 hover:text-blue-800"
          >
            Browse {recipe.cuisine} cuisine
          </Link>
        )}
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-3">{recipe.name}</h1>
          {recipe.description && (
            <p className="text-lg text-gray-700">{recipe.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.cuisine && (
              <span className="text-sm px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
                {recipe.cuisine}
              </span>
            )}
            {recipe.season && (
              <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {Array.isArray(recipe.season) ? recipe.season.join(', ') : recipe.season}
              </span>
            )}
            {recipe.timeToMake && (
              <span className="text-sm px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                {recipe.timeToMake}
              </span>
            )}
            {recipe.isVegetarian && (
              <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                Vegetarian
              </span>
            )}
            {recipe.isVegan && (
              <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                Vegan
              </span>
            )}
          </div>
        </header>

        <div className="flex flex-wrap items-center mb-6">
          <span className="mr-4 font-medium">Servings:</span>
          <button 
            onClick={decreaseServings}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-l"
            aria-label="Decrease servings"
          >
            -
          </button>
          <span className="bg-gray-100 py-1 px-4">{Math.round(recipe.numberOfServings * servingsMultiplier)}</span>
          <button 
            onClick={increaseServings}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded-r"
            aria-label="Increase servings"
          >
            +
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <span className="text-xs text-gray-500 italic">Click an ingredient for details</span>
            </div>
            <ul id={ELEMENT_IDS.INGREDIENT_LIST} className="space-y-2">
              {recipe.ingredients?.map((ingredient, idx) => {
                const isSelected = selectedIngredient && 
                  (typeof ingredient === 'string' 
                    ? ingredient === selectedIngredient 
                    : ingredient.name === getIngredientName(selectedIngredient));
                
                return (
                  <li 
                    key={`ingredient-${idx}`} 
                    className={`flex justify-between py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition duration-150 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500 pl-2' : ''}`}
                    onClick={() => handleIngredientClick(ingredient)}
                  >
                    <span>{getIngredientName(ingredient)}</span>
                    {typeof ingredient !== 'string' && (
                      <span className="text-gray-600">
                        {ingredient.amount * servingsMultiplier} {ingredient.unit}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Ingredient Details Section */}
            {selectedIngredient && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    {getIngredientName(selectedIngredient)}
                  </h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Ingredient Details</span>
                </div>
                {typeof selectedIngredient === 'string' ? (
                  <p className="text-gray-600">Basic ingredient with no additional details available.</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedIngredient.amount && (
                      <li><span className="font-medium">Amount:</span> {selectedIngredient.amount * servingsMultiplier} {selectedIngredient.unit}</li>
                    )}
                    {selectedIngredient.notes && (
                      <li><span className="font-medium">Notes:</span> {selectedIngredient.notes}</li>
                    )}
                    {selectedIngredient.category && (
                      <li><span className="font-medium">Category:</span> {selectedIngredient.category}</li>
                    )}
                    {/* Display preparation if available */}
                    {selectedIngredient.preparation && (
                      <li><span className="font-medium">Preparation:</span> {selectedIngredient.preparation}</li>
                    )}
                    {/* Display optional status if true */}
                    {selectedIngredient.optional && (
                      <li><span className="font-medium">Optional:</span> Yes</li>
                    )}
                    {/* Display seasonality if available */}
                    {selectedIngredient.seasonality && selectedIngredient.seasonality.length > 0 && (
                      <li>
                        <span className="font-medium">Seasonality:</span> {selectedIngredient.seasonality.join(', ')}
                      </li>
                    )}
                    {/* Display elemental properties if available */}
                    {selectedIngredient.elementalProperties && (
                      <li>
                        <details className="mt-2">
                          <summary className="font-medium cursor-pointer">Elemental Properties</summary>
                          <div className="pl-4 mt-2 space-y-1 text-sm">
                            <div>Fire: {Math.round(selectedIngredient.elementalProperties.Fire * 100)}%</div>
                            <div>Water: {Math.round(selectedIngredient.elementalProperties.Water * 100)}%</div>
                            <div>Earth: {Math.round(selectedIngredient.elementalProperties.Earth * 100)}%</div>
                            <div>Air: {Math.round(selectedIngredient.elementalProperties.Air * 100)}%</div>
                          </div>
                        </details>
                      </li>
                    )}
                  </ul>
                )}
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => setSelectedIngredient(null)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 bg-white rounded shadow-sm hover:shadow transition"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Instructions Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol id={ELEMENT_IDS.INSTRUCTION_LIST} className="list-decimal pl-5 space-y-2">
              {recipe.instructions?.map((step, idx) => (
                <li key={`instruction-${idx}`} className="py-1">
                  <span className="ml-2">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Procedure Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Procedure</h2>
            <ol id={ELEMENT_IDS.PROCEDURE_LIST} className="list-decimal pl-5 space-y-2">
              {recipe.instructions?.map((step, idx) => (
                <li key={`procedure-${idx}`} className="py-1">
                  <span className="ml-2">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutritional Information */}
        {recipe.nutrition && (
          <section id={ELEMENT_IDS.NUTRITIONAL_INFO} className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Nutritional Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recipe.nutrition.calories !== undefined && (
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="text-lg font-bold">{calculateNutritionalValue(recipe.nutrition.calories)}</div>
                  <div className="text-sm text-gray-600">{NUTRITION_LABELS.CALORIES}</div>
                </div>
              )}
              {recipe.nutrition.protein !== undefined && (
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="text-lg font-bold">{calculateNutritionalValue(recipe.nutrition.protein)}g</div>
                  <div className="text-sm text-gray-600">{NUTRITION_LABELS.PROTEIN}</div>
                </div>
              )}
              {recipe.nutrition.carbs !== undefined && (
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="text-lg font-bold">{calculateNutritionalValue(recipe.nutrition.carbs)}g</div>
                  <div className="text-sm text-gray-600">{NUTRITION_LABELS.CARBS}</div>
                </div>
              )}
              {recipe.nutrition.fat !== undefined && (
                <div className="text-center p-3 bg-white rounded shadow-sm">
                  <div className="text-lg font-bold">{calculateNutritionalValue(recipe.nutrition.fat)}g</div>
                  <div className="text-sm text-gray-600">{NUTRITION_LABELS.FAT}</div>
                </div>
              )}
            </div>

            {/* Additional Nutritional Information - Vitamins and Minerals */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.nutrition.vitamins && recipe.nutrition.vitamins.length > 0 && (
                <div className="p-3 bg-white rounded shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{NUTRITION_LABELS.VITAMINS}</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.nutrition.vitamins.map((vitamin, idx) => (
                      <span key={`vitamin-${idx}`} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                        {vitamin}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {recipe.nutrition.minerals && recipe.nutrition.minerals.length > 0 && (
                <div className="p-3 bg-white rounded shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{NUTRITION_LABELS.MINERALS}</h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.nutrition.minerals.map((mineral, idx) => (
                      <span key={`mineral-${idx}`} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        {mineral}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Per Serving Note */}
            <div className="mt-4 text-xs text-gray-500 text-right">
              *Nutritional values shown are per serving and adjust with the serving multiplier.
            </div>
          </section>
        )}

        {/* Notes Section */}
        {recipe.notes && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="p-4 bg-yellow-50 rounded-lg text-gray-800">
              {typeof recipe.notes === 'string' ? recipe.notes : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailsPage; 