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
    // If recipe is undefined or null, return a minimal valid recipe
    return {
      id: `fallback-recipe-${Date.now()}`,
      name: 'Fallback Recipe',
      ingredients: [],
      instructions: [],
      timeToMake: '30 minutes',
      servings: 2,
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      astrologicalInfluences: ["all"]
    };
  }

  // Start with basic defaults for required properties
  const safeRecipe: Recipe = {
    id: recipe.id || `recipe-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: recipe.name || 'Unnamed Recipe',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    timeToMake: recipe.timeToMake || '30 minutes',
    servings: recipe.servings || 2,
    elementalProperties: recipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    // Explicitly ensure astrologicalInfluences is always present
    astrologicalInfluences: Array.isArray(recipe.astrologicalInfluences) ? recipe.astrologicalInfluences : ["all"],
    // Copy all other properties
    ...recipe
  };
  
  // Double-check critical properties after applying spread operator
  // as spreading might override our explicit defaults
  if (!safeRecipe.astrologicalInfluences || !Array.isArray(safeRecipe.astrologicalInfluences)) {
    safeRecipe.astrologicalInfluences = ["all"];
  }
  
  if (!safeRecipe.elementalProperties) {
    safeRecipe.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  return safeRecipe;
}

export async function GET() {
  try {
    // Get base recipes - this will always work due to our core recipes
    const recipes = await recipeData.getAllRecipes();
    
    // Ensure all recipes have required properties including astrologicalInfluences
    const safeRecipes = Array.isArray(recipes) 
      ? recipes.map(recipe => ensureRecipeProperties(recipe))
      : [];
    
    // Extract recipes from cuisines as backup
    const cuisineRecipes = extractRecipesFromCuisines();
    
    // Combine recipes, ensuring no duplicates by ID
    const allRecipes = [...safeRecipes];
    
    // Add cuisine recipes only if they don't already exist
    cuisineRecipes.forEach(recipe => {
      if (!allRecipes.some(r => r.id === recipe.id)) {
        allRecipes.push(recipe);
      }
    });
    
    // Final safety check to ensure ALL recipes have all required properties
    const finalRecipes = allRecipes.map(recipe => ensureRecipeProperties(recipe));
    
    // Get current celestial influences - has fallback
    let celestialInfluence;
    try {
      celestialInfluence = celestialCalculator.calculateCurrentInfluences();
    } catch (error) {
      logger.error('Error calculating celestial influences:', error);
      // Provide a minimal fallback if the calculation fails
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

    // Ensure celestialInfluence.astrologicalInfluences is defined
    if (!celestialInfluence.astrologicalInfluences || !Array.isArray(celestialInfluence.astrologicalInfluences)) {
      celestialInfluence.astrologicalInfluences = ['Sun', 'Moon', 'libra', 'all'];
    }

    return NextResponse.json({
      recipes: finalRecipes,
      meta: {
        total: finalRecipes.length,
        celestialInfluence,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Recipe API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
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
                  timeToMake: dish.prepTime || "30 minutes",
                  servings: dish.servingSize || 2,
                  difficulty: dish.prepTime ? (parseInt(dish.prepTime) > 30 ? "hard" : parseInt(dish.prepTime) > 15 ? "medium" : "easy") : "medium",
                  elementalProperties: {
                    Fire: cuisine.elementalState?.Fire || 0.25,
                    Water: cuisine.elementalState?.Water || 0.25,
                    Earth: cuisine.elementalState?.Earth || 0.25,
                    Air: cuisine.elementalState?.Air || 0.25
                  },
                  season: season === 'all' ? ['all'] : [season],
                  mealType: [mealType],
                  nutrition: dish.nutrition || {
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
    
    // Validate request body
    if (!isValidRecipeSubmission(body)) {
      return NextResponse.json(
        { error: 'Invalid recipe data' },
        { status: 400 }
      );
    }

    // Process and store the new recipe
    const newRecipe = await processNewRecipe(body);
    
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
      { name: "Quinoa", amount: 1, unit: "cup", category: "grains" },
      { name: "Mixed Seeds", amount: 0.25, unit: "cup", category: "garnish" }
    ],
    instructions: [
      "Combine all ingredients in a bowl",
      "Season to taste",
      "Enjoy mindfully"
    ],
    timeToMake: "15 minutes",
    servings: 2,
    difficulty: "easy",
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
    // Add safety check for null/undefined
    if (!data) return false;
    
    return (
      typeof data === 'object' &&
      typeof data.name === 'string' &&
      Array.isArray(data.ingredients) &&
      data.ingredients.length > 0 &&
      Array.isArray(data.instructions) &&
      data.instructions.length > 0 &&
      typeof data.timeToMake === 'string' &&
      typeof data.servings === 'number'
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