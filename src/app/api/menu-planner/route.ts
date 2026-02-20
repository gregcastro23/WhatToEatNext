
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateDayRecommendations, type AstrologicalState, type UserPersonalizationContext } from '@/utils/menuPlanner/recommendationBridge';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';
import { allCookingMethods } from '@/data/cooking';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import type { CookingMethod } from '@/types/cooking';
import { CookingMethodData } from '@/types/cookingMethod';
import { CookingMethodModifier, Element } from '@/types/alchemy';
import type { DayOfWeek, MealType } from '@/types/menuPlanner';

// Define the structure of the incoming request body
interface MenuPlannerRequestBody {
  userPreferences: UserPersonalizationContext;
  availableIngredients: string[];
  currentChart: AstrologicalState;
  dayOfWeek: DayOfWeek;
  mealTypes: MealType[];
}

// Extend the recipe type to include alternative cooking methods
interface ExtendedRecipe extends MonicaOptimizedRecipe {
  alternativeCookingMethods?: Array<{
    method: CookingMethod;
    score: number;
  }>;
}

// The threshold for a "low" score, prompting a search for alternatives
const LOW_SCORE_THRESHOLD = 0.6;

function cookingMethodDataToModifier(method: CookingMethodData): CookingMethodModifier {
  const dominantElement = Object.keys(method.elementalEffect).reduce((a, b) => method.elementalEffect[a] > method.elementalEffect[b] ? a : b) as Element;
  const intensity = Object.values(method.elementalEffect).reduce((a, b) => a + b, 0) / 4;

  return {
    element: dominantElement,
    intensity: intensity,
    effect: 'enhance', // default
    applicableTo: method.suitable_for || [],
    duration: method.duration,
    notes: method.description,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userPreferences, 
      availableIngredients, 
      currentChart,
      dayOfWeek,
      mealTypes,
    }: MenuPlannerRequestBody = await request.json();

    // 1. Generate base recipe recommendations
    const recommendations = await generateDayRecommendations(
      dayOfWeek,
      currentChart,
      {
        userContext: userPreferences,
        excludeIngredients: availableIngredients, // Assuming we want to use available ingredients, not exclude them. This might need adjustment based on intended logic.
        mealTypes
      }
    );

    const enhancedRecipes: ExtendedRecipe[] = [];

    // 2. Enhance each recipe with cooking method scores and alternatives
    for (const recommendedMeal of recommendations) {
      const recipe = recommendedMeal.recipe;
      const extendedRecipe: ExtendedRecipe = { ...recipe, alternativeCookingMethods: [] };

      if (recipe.cookingMethod && recipe.cookingMethod.length > 0) {
        const primaryMethodName = recipe.cookingMethod[0];
        const primaryMethodData = allCookingMethods[primaryMethodName as keyof typeof allCookingMethods] as unknown as CookingMethodData;
        
        if (primaryMethodData) {
            const primaryMethodModifier = cookingMethodDataToModifier(primaryMethodData);
            const score = calculateMethodScore(primaryMethodModifier, currentChart);

            // 3. If the score is low, find better alternatives
            if (score < LOW_SCORE_THRESHOLD) {
                const alternatives: Array<{ method: CookingMethod; score: number }> = [];
                
                for (const methodName in allCookingMethods) {
                    const potentialMethodData = allCookingMethods[methodName as keyof typeof allCookingMethods] as unknown as CookingMethodData;
                    if (potentialMethodData) {
                        const potentialMethodModifier = cookingMethodDataToModifier(potentialMethodData);
                        const alternativeScore = calculateMethodScore(potentialMethodModifier, currentChart);
                        if (alternativeScore > score) {
                            alternatives.push({ method: potentialMethodData as unknown as CookingMethod, score: alternativeScore });
                        }
                    }
                }

                // Sort alternatives by score and add the top 3
                alternatives.sort((a, b) => b.score - a.score);
                extendedRecipe.alternativeCookingMethods = alternatives.slice(0, 3);
            }
        }
      }
      enhancedRecipes.push(extendedRecipe);
    }

    // 4. Return the fully enhanced recipes
    return NextResponse.json(enhancedRecipes);

  } catch (error) {
    console.error('Menu Planner API Error:', error);
    // Return a 500 internal server error response
    return new NextResponse(
      JSON.stringify({ success: false, message: 'An internal server error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
