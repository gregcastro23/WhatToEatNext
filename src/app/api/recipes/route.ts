import { NextResponse } from 'next/server';
import { recipeData } from '@/services/recipeData';
import { celestialCalculator } from '@/services/celestialCalculations';

export async function GET() {
  try {
    // Get base recipes - this will always work due to our core recipes
    const recipes = await recipeData.getAllRecipes();
    
    // Get current celestial influences - has fallback
    const celestialInfluence = celestialCalculator.calculateCurrentInfluences();

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
      { status: 500 }
    );
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
  return {
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
    score: 1
  };
}

function isValidRecipeSubmission(data: any): boolean {
  try {
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

  // Construct the recipe
  return {
    id,
    ...data,
    elementalProperties,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
} 