import { NextResponse } from 'next/server';

import { _logger } from '@/lib/logger';
import type { RecipeQuery } from '@/services/PlanetaryRecipeScorer';
import { planetaryRecipeScorer } from '@/services/PlanetaryRecipeScorer';
import { calculateRecipeAlchemicalQuantities } from '@/utils/recipeAlchemicalQuantities';

/**
 * GET /api/recipes — Smart planetary recipe recommendations
 *
 * Query params:
 *   count    – number of recipes to return (default 5)
 *   cuisine  – filter by cuisine (e.g. "Italian")
 *   mealType – filter by meal type (e.g. "dinner")
 *   dietary  – comma-separated restrictions (e.g. "vegetarian,gluten-free")
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query: RecipeQuery = {
      count: parseInt(searchParams.get('count') || '5', 10),
      cuisine: searchParams.get('cuisine') || undefined,
      mealType: searchParams.get('mealType') || undefined,
      dietary: searchParams.get('dietary')
        ? searchParams.get('dietary')!.split(',').map(d => d.trim())
        : undefined,
    };

    const result = await planetaryRecipeScorer.scoreRecipes(query);

    return NextResponse.json({
      recipes: result.recipes.map(r => {
        const ingredientNames: string[] = Array.isArray(r.ingredients)
          ? r.ingredients.map((ing: any) => (typeof ing === 'string' ? ing : (ing.name ?? ''))).filter(Boolean)
          : [];
        const ingredientAlchemicalSummary = ingredientNames.length > 0
          ? calculateRecipeAlchemicalQuantities(ingredientNames)
          : undefined;

        return {
          id: r.id,
          name: r.name,
          description: r.description,
          cuisine: r.cuisine,
          ingredients: r.ingredients,
          instructions: r.instructions,
          timeToMake: r.timeToMake,
          prepTime: (r as any).prepTime,
          cookTime: (r as any).cookTime,
          numberOfServings: r.numberOfServings,
          elementalProperties: r.elementalProperties,
          season: r.season,
          mealType: r.mealType,
          isVegetarian: r.isVegetarian,
          isVegan: r.isVegan,
          isGlutenFree: r.isGlutenFree,
          isDairyFree: r.isDairyFree,
          flavorProfile: (r as any).flavorProfile,
          nutrition: (r as any).nutrition,
          cookingMethod: (r as any).cookingMethod,
          cookingMethods: (r as any).cookingMethods,
          astrologicalInfluences: (r as any).astrologicalInfluences,
          monicaScore: (r as any).monicaScore,
          monicaScoreLabel: (r as any).monicaScoreLabel,
          // Ingredient-summed alchemical quantities
          ingredientAlchemicalSummary,
          // Scoring data
          score: r.score,
          scoreBreakdown: r.scoreBreakdown,
        };
      }),
      meta: {
        total: result.recipes.length,
        totalRecipesInDatabase: result.totalRecipesInDatabase,
        celestialContext: result.celestialContext,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    _logger.error('Recipe API GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/recipes — Personalized recommendations (for signed-in users)
 *
 * Body:
 *   count       – number of recipes (default 5)
 *   cuisine     – filter by cuisine
 *   mealType    – filter by meal type
 *   dietary     – array of dietary restrictions
 *   birthChart  – optional birth chart data for personalization
 *     { elementalState, planetaryPositions, ascendant, lunarPhase, aspects }
 *   preferredIngredients – optional array of preferred ingredients
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate body
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const query: RecipeQuery = {
      count: body.count || 5,
      cuisine: body.cuisine,
      mealType: body.mealType,
      dietary: Array.isArray(body.dietary) ? body.dietary : undefined,
      preferredIngredients: Array.isArray(body.preferredIngredients) ? body.preferredIngredients : undefined,
      birthChart: body.birthChart || undefined,
    };

    const result = await planetaryRecipeScorer.scoreRecipes(query);

    const hasPersonalization = !!query.birthChart;

    return NextResponse.json({
      recipes: result.recipes.map(r => {
        const ingredientNames: string[] = Array.isArray(r.ingredients)
          ? r.ingredients.map((ing: any) => (typeof ing === 'string' ? ing : (ing.name ?? ''))).filter(Boolean)
          : [];
        const ingredientAlchemicalSummary = ingredientNames.length > 0
          ? calculateRecipeAlchemicalQuantities(ingredientNames)
          : undefined;

        return {
          id: r.id,
          name: r.name,
          description: r.description,
          cuisine: r.cuisine,
          ingredients: r.ingredients,
          instructions: r.instructions,
          timeToMake: r.timeToMake,
          prepTime: (r as any).prepTime,
          cookTime: (r as any).cookTime,
          numberOfServings: r.numberOfServings,
          elementalProperties: r.elementalProperties,
          season: r.season,
          mealType: r.mealType,
          isVegetarian: r.isVegetarian,
          isVegan: r.isVegan,
          isGlutenFree: r.isGlutenFree,
          isDairyFree: r.isDairyFree,
          flavorProfile: (r as any).flavorProfile,
          nutrition: (r as any).nutrition,
          cookingMethod: (r as any).cookingMethod,
          cookingMethods: (r as any).cookingMethods,
          astrologicalInfluences: (r as any).astrologicalInfluences,
          monicaScore: (r as any).monicaScore,
          monicaScoreLabel: (r as any).monicaScoreLabel,
          // Ingredient-summed alchemical quantities
          ingredientAlchemicalSummary,
          // Scoring
          score: r.score,
          scoreBreakdown: r.scoreBreakdown,
        };
      }),
      meta: {
        total: result.recipes.length,
        totalRecipesInDatabase: result.totalRecipesInDatabase,
        celestialContext: result.celestialContext,
        personalized: hasPersonalization,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    _logger.error('Recipe API POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process recipe request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
