import { NextResponse } from 'next/server';
import { recipeData } from '@/services/recipeData';
import { celestialCalculator } from '@/services/celestialCalculations';
import { logger } from '@/utils/logger';
import { handleApiError } from '@/app/api/error';
import { cache } from '@/utils/cache';
import { cuisinesMap } from '@/data/cuisines';
import type { Recipe } from '@/types/recipe';

// Define CACHE_KEY as a constant
const CACHE_KEY = 'recipe_cache';

/**
 * Utility function to ensure a recipe has all required properties
 */
function ensureRecipeProperties(recipe: Partial<Recipe>): Recipe {
  if (!recipe) {
    throw new Error('Recipe cannot be null or undefined');
  }

  // Core required properties
  const safeRecipe: Recipe = {
    id: recipe.id || `recipe-${Date.now()}`,
    name: recipe.name || 'Unnamed Recipe',
    description: recipe.description || '',
    cuisine: recipe.cuisine || '',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    timeToMake: recipe.timeToMake || '30 minutes', // Required by Recipe interface
    numberOfServings: recipe.numberOfServings || 2,
    elementalProperties: recipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    }
  };

  // Optional properties - only add if they exist in the input
  if (recipe.mealType) safeRecipe.mealType = recipe.mealType;
  if (recipe.season) safeRecipe.season = recipe.season;
  if (recipe.isVegetarian !== undefined) safeRecipe.isVegetarian = recipe.isVegetarian;
  if (recipe.isVegan !== undefined) safeRecipe.isVegan = recipe.isVegan;
  if (recipe.isGlutenFree !== undefined) safeRecipe.isGlutenFree = recipe.isGlutenFree;
  if (recipe.isDairyFree !== undefined) safeRecipe.isDairyFree = recipe.isDairyFree;
  if (recipe.astrologicalInfluences) safeRecipe.astrologicalInfluences = recipe.astrologicalInfluences;
  if (recipe.nutrition) safeRecipe.nutrition = recipe.nutrition;
  if (recipe.createdAt) safeRecipe.createdAt = recipe.createdAt;
  if (recipe.updatedAt) safeRecipe.updatedAt = recipe.updatedAt;

  return safeRecipe;
}

export async function GET() {
  try {
    // Get base recipes - this will already be validated by recipeData service
    const recipes = await recipeData.getAllRecipes();
    
    // Get current celestial influences
    let celestialInfluence;
    try {
      celestialInfluence = celestialCalculator.calculateCurrentInfluences();
    } catch (error) {
      logger.error('Error calculating celestial influences:', error);
      celestialInfluence = {
        date: new Date().toISOString(),
        zodiacSign: 'libra',
        dominantPlanets: [{ name: 'Sun', influence: 0.5 }, { name: 'Moon', influence: 0.5 }],
        lunarPhase: 'full',
        elementalBalance: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
        aspectInfluences: [],
        astrologicalInfluences: ['Sun', 'Moon', 'libra', 'all']
      };
    }

    return NextResponse.json({
      recipes,
      meta: {
        total: recipes.length,
        celestialInfluence,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Recipe API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 400 }
    );
  }
}

/**
 * Extract recipes from the cuisines dataset and format them to match the Recipe type
 */
function extractRecipesFromCuisines(): Recipe[] {
  try {
    const recipes: Recipe[] = [];
    
    // Loop through each cuisine
    Object.entries(cuisinesMap).forEach(([cuisineName, cuisine]) => {
      // Loop through each meal type (breakfast, lunch, dinner, dessert)
      Object.entries(cuisine.dishes || {}).forEach(([mealType, seasons]) => {
        // Loop through each season (all, spring, summer, autumn, winter)
        if (seasons && typeof seasons === 'object') {
          Object.entries(seasons).forEach(([season, dishArray]) => {
            // Loop through each dish in the array
            if (Array.isArray(dishArray)) {
              dishArray.forEach((dish: any, index: number) => {
                if (!dish) return; // Skip if dish is undefined
                
                // Create a unique ID
                const id = `${cuisineName.toLowerCase()}-${mealType.toLowerCase()}-${season.toLowerCase()}-${index}`;
                
                // Map dish to Recipe interface (incomplete - will be fixed by ensureRecipeProperties)
                const recipeBase: Partial<Recipe> = {
                  id,
                  name: dish.name || `${cuisineName} dish`,
                  description: dish.description || '',
                  cuisine: cuisineName,
                  ingredients: dish.ingredients?.map((ing: any) => ({
                    name: ing?.name || '',
                    amount: parseFloat(ing?.amount) || 1,
                    unit: ing?.unit || 'piece',
                    category: ing?.category || ''
                  })) || [],
                  instructions: dish.preparationSteps || [],
                  numberOfServings: dish.servingSize || 2,
                  cookTime: dish.cookTime || '30 minutes',
                  elementalProperties: {
                    Fire: cuisine.elementalProperties?.Fire || 0.25,
                    Water: cuisine.elementalProperties?.Water || 0.25,
                    Earth: cuisine.elementalProperties?.Earth || 0.25,
                    Air: cuisine.elementalProperties?.Air || 0.25
                  },
                  season: season === 'all' ? ['all'] : [season],
                  mealType: [mealType],
                  nutrition: dish.nutrition ? {
                    calories: dish.nutrition.calories || 0,
                    protein: dish.nutrition.protein || 0,
                    carbs: dish.nutrition.carbs || 0,
                    fat: dish.nutrition.fat || 0,
                    vitamins: dish.nutrition.vitamins || [],
                    minerals: dish.nutrition.minerals || []
                  } : {
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0
                  },
                  // Ensure astrologicalInfluences is an array
                  astrologicalInfluences: Array.isArray(dish.astrologicalInfluences) 
                    ? dish.astrologicalInfluences 
                    : (dish.astrologicalInfluences ? [dish.astrologicalInfluences] : ["all"]),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                
                // Ensure all required properties are present
                const recipe = ensureRecipeProperties(recipeBase);
                recipes.push(recipe);
              });
            }
          });
        }
      });
    });
    
    logger.info(`Extracted ${recipes.length} recipes from cuisines dataset`);
    return recipes;
  } catch (error) {
    logger.error('Error extracting recipes from cuisines:', error);
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic request validation
    if (!isValidRecipeSubmission(body)) {
      return NextResponse.json(
        { error: 'Invalid recipe data' },
        { status: 400 }
      );
    }

    // Use recipeData service to add and validate recipe
    const newRecipe = await recipeData.addRecipe(body);
    
    // Clear relevant caches
    cache.delete(CACHE_KEY);

    return NextResponse.json({
      recipe: newRecipe,
      message: 'Recipe added successfully'
    });

  } catch (error) {
    logger.error('Recipe submission error:', error);
    return handleApiError(error);
  }
}

async function getFallbackRecipe(): Promise<Recipe> {
  return ensureRecipeProperties({
    id: 'universal-balance',
    name: "Universal Balance Bowl",
    description: "A harmonious blend for any occasion",
    ingredients: [
      { name: "Mixed Greens", amount: 2, unit: "cups", category: "vegetables" },
      { name: "Mixed Seeds", amount: 0.25, unit: "cup", category: "garnish" },
      { name: "Quinoa", amount: 1, unit: "cup", category: "grains" }
    ],
    instructions: [
      "Combine all ingredients in a bowl",
      "Season to taste",
      "Enjoy mindfully"
    ],
    cookTime: "15 minutes",
    numberOfServings: 2,
    elementalProperties: {
      Fire: 0.25,
      Earth: 0.25,
      Air: 0.25,
      Water: 0.25
    },
    season: ["all"],
    mealType: ["lunch", "dinner"],
    cuisine: "international",
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    score: 1,
    astrologicalInfluences: ["all"]
  });
}

function isValidRecipeSubmission(data: any): boolean {
  try {
    if (!data) return false;
    
    return (
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      Array.isArray(data.ingredients) &&
      Array.isArray(data.instructions)
    );
  } catch (error) {
    return false;
  }
}

async function processNewRecipe(data: any): Promise<Recipe> {
  // Generate unique ID
  const id = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  // Calculate elemental properties if not provided
  const elementalProperties = data.elementalProperties || {
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25,
    Water: 0.25
  };

  // Construct a safe recipe with all required properties
  const recipeData: Partial<Recipe> = {
    id,
    ...data,
    elementalProperties,
    // Always ensure astrologicalInfluences is set
    astrologicalInfluences: data.astrologicalInfluences || ["all"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Use our utility function to ensure all properties are properly set
  return ensureRecipeProperties(recipeData);
} 