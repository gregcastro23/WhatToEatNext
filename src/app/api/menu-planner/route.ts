
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateDayRecommendations, type AstrologicalState, type UserPersonalizationContext } from '@/utils/menuPlanner/recommendationBridge';
import { calculateMethodScore } from '@/utils/cookingMethodRecommender';
import { allCookingMethods } from '@/data/cooking';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import type { CookingMethod, CookingMethodProfile } from '@/types/cooking';
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

      if (recipe.cookingMethods && recipe.cookingMethods.length > 0) {
        const primaryMethodName = recipe.cookingMethods[0];
        const primaryMethod = allCookingMethods[primaryMethodName as keyof typeof allCookingMethods] as unknown as CookingMethodProfile;
        
        if (primaryMethod) {
            const score = calculateMethodScore(primaryMethod, currentChart);

            // 3. If the score is low, find better alternatives
            if (score < LOW_SCORE_THRESHOLD) {
                const alternatives: Array<{ method: CookingMethod; score: number }> = [];
                
                for (const methodName in allCookingMethods) {
                    const potentialMethod = allCookingMethods[methodName as keyof typeof allCookingMethods] as unknown as CookingMethodProfile;
                    if (potentialMethod) {
                        const alternativeScore = calculateMethodScore(potentialMethod, currentChart);
                        if (alternativeScore > score) {
                            alternatives.push({ method: potentialMethod as unknown as CookingMethod, score: alternativeScore });
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
