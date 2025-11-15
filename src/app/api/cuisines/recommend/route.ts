import { NextResponse } from "next/server";
import { createLogger } from "@/utils/logger";
import { italian } from "@/data/cuisines/italian";
import { mexican } from "@/data/cuisines/mexican";
import { american } from "@/data/cuisines/american";

const logger = createLogger("CuisinesRecommendAPI");

/**
 * Cuisine Recommendations API Endpoint
 *
 * GET /api/cuisines/recommend
 *
 * Returns cuisine recommendations based on current astrological moment,
 * including nested recipes and sauce pairings from real culinary data.
 *
 * This endpoint can be called by external frontends from the alchm-kitchen backend.
 */

interface CurrentMoment {
  zodiac_sign: string;
  season: string;
  meal_type?: string;
  timestamp: string;
}

interface NestedRecipe {
  recipe_id: string;
  name: string;
  description: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  ingredients: Array<{
    name: string;
    amount?: string;
    unit?: string;
    notes?: string;
  }>;
  instructions: string[];
  meal_type: string;
  seasonal_fit: string;
}

interface SauceRecommendation {
  sauce_name: string;
  description: string;
  key_ingredients?: string[];
  elemental_properties?: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  compatibility_score: number;
  reason: string;
}

interface CuisineRecommendation {
  cuisine_id: string;
  name: string;
  description: string;
  elemental_properties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  nested_recipes: NestedRecipe[];
  recommended_sauces: SauceRecommendation[];
  seasonal_context: string;
  astrological_score: number;
  compatibility_reason: string;
}

/**
 * Calculate current astrological moment
 */
function getCurrentMoment(): CurrentMoment {
  const now = new Date();
  const month = now.getMonth();

  // Determine zodiac sign based on date
  const zodiacSigns = [
    "Capricorn",
    "Aquarius",
    "Pisces",
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
  ];

  // Simplified zodiac calculation (day 20 is typical cutoff)
  const day = now.getDate();
  let zodiacIndex = month;
  if (day >= 20 && day <= 31) {
    zodiacIndex = (month + 1) % 12;
  }

  // Determine season (Northern Hemisphere)
  let season = "Spring";
  if (month >= 2 && month <= 4) season = "Spring";
  else if (month >= 5 && month <= 7) season = "Summer";
  else if (month >= 8 && month <= 10) season = "Autumn";
  else season = "Winter";

  // Determine meal type based on time
  const hour = now.getHours();
  let meal_type = "Dinner";
  if (hour >= 5 && hour < 11) meal_type = "Breakfast";
  else if (hour >= 11 && hour < 15) meal_type = "Lunch";
  else if (hour >= 15 && hour < 18) meal_type = "Snack";

  return {
    zodiac_sign: zodiacSigns[zodiacIndex],
    season,
    meal_type,
    timestamp: now.toISOString(),
  };
}

/**
 * Get recipes from cuisine data based on season and meal type
 */
function getRecipesForCuisine(
  cuisineData: any,
  moment: CurrentMoment,
  maxRecipes: number = 5,
): NestedRecipe[] {
  const season = moment.season.toLowerCase() as "spring" | "summer" | "autumn" | "winter";
  const mealType = moment.meal_type?.toLowerCase() || "dinner";

  // Get all recipes for the meal type and season
  let recipes: any[] = [];

  if (cuisineData.dishes && cuisineData.dishes[mealType]) {
    // Get seasonal recipes
    const seasonalRecipes = cuisineData.dishes[mealType][season] || [];
    // Get "all season" recipes
    const allSeasonRecipes = cuisineData.dishes[mealType].all || [];

    recipes = [...allSeasonRecipes, ...seasonalRecipes];
  }

  // If not enough recipes for this meal type, try other meal types
  if (recipes.length < maxRecipes) {
    const mealTypes = ["breakfast", "lunch", "dinner", "dessert"];
    for (const mt of mealTypes) {
      if (mt !== mealType && cuisineData.dishes[mt]) {
        const additionalRecipes = [
          ...(cuisineData.dishes[mt][season] || []),
          ...(cuisineData.dishes[mt].all || []),
        ];
        recipes = [...recipes, ...additionalRecipes];
        if (recipes.length >= maxRecipes) break;
      }
    }
  }

  // Convert to NestedRecipe format
  return recipes.slice(0, maxRecipes).map((recipe, idx) => ({
    recipe_id: recipe.id || `${cuisineData.name}-${idx}`,
    name: recipe.name,
    description: recipe.description,
    prep_time: recipe.prepTime,
    cook_time: recipe.cookTime,
    servings: recipe.servingSize,
    difficulty: recipe.difficulty || "Medium",
    ingredients: recipe.ingredients.map((ing: any) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      notes: ing.notes,
    })),
    instructions: recipe.instructions || recipe.preparationSteps || [],
    meal_type: recipe.mealType ? recipe.mealType.join(", ") : mealType,
    seasonal_fit: recipe.season?.includes("all") ? "Available year-round" : `Best in ${season}`,
  }));
}

/**
 * Generate cuisine recommendations based on current moment
 * Uses real culinary data from cuisine files
 */
function generateRecommendations(
  moment: CurrentMoment,
): CuisineRecommendation[] {
  // Real cuisine data from imported files
  const cuisineDataSources = [
    { id: "italian", data: italian, score: 0.88 },
    { id: "mexican", data: mexican, score: 0.82 },
    { id: "american", data: american, score: 0.75 },
  ];

  const recommendations: CuisineRecommendation[] = cuisineDataSources.map(({ id, data, score }) => {
    const recipes = getRecipesForCuisine(data, moment, 5);

    return {
      cuisine_id: id,
      name: data.name,
      description: data.description || `Traditional ${data.name} cuisine`,
      elemental_properties: data.elementalProperties || {
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.35,
        Air: 0.15,
      },
      nested_recipes: recipes,
      recommended_sauces: getSaucesForCuisine(data, 5),
      seasonal_context: `Perfect for ${moment.season} - ingredients at peak freshness`,
      astrological_score: score,
      compatibility_reason: `Aligns with ${moment.zodiac_sign}'s ${getZodiacElement(moment.zodiac_sign)} energy and current ${moment.season} season`,
    };
  });

  return recommendations;
}

/**
 * Get zodiac element for compatibility reasons
 */
function getZodiacElement(zodiacSign: string): string {
  const elements: Record<string, string> = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water",
  };
  return elements[zodiacSign] || "balanced";
}

/**
 * Get sauces from cuisine data
 */
function getSaucesForCuisine(cuisineData: any, maxSauces: number = 5): SauceRecommendation[] {
  const sauces: SauceRecommendation[] = [];

  // Get from motherSauces
  if (cuisineData.motherSauces) {
    Object.entries(cuisineData.motherSauces).forEach(([name, sauce]: [string, any]) => {
      sauces.push({
        sauce_name: name,
        description: sauce.description || `Classic ${cuisineData.name} sauce`,
        key_ingredients: sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
        elemental_properties: sauce.elementalProperties,
        compatibility_score: 0.85 + Math.random() * 0.15,
        reason: sauce.culturalNotes || `Traditional sauce that enhances ${cuisineData.name} dishes`,
      });
    });
  }

  // Get from traditionalSauces
  if (cuisineData.traditionalSauces) {
    Object.entries(cuisineData.traditionalSauces).forEach(([name, sauce]: [string, any]) => {
      sauces.push({
        sauce_name: name,
        description: sauce.description || `Traditional ${cuisineData.name} sauce`,
        key_ingredients: sauce.ingredients?.slice(0, 5).map((ing: any) => ing.name) || [],
        elemental_properties: sauce.elementalProperties,
        compatibility_score: 0.80 + Math.random() * 0.20,
        reason: sauce.pairingNotes || `Versatile sauce from ${cuisineData.name} tradition`,
      });
    });
  }

  return sauces.slice(0, maxSauces);
}

/**
 * Legacy mock data structure (kept for reference)
 */
function _generateMockRecommendations(
  moment: CurrentMoment,
): CuisineRecommendation[] {
  const recommendations: CuisineRecommendation[] = [
    {
      cuisine_id: "italian-001",
      name: "Italian",
      description:
        "Mediterranean cuisine emphasizing fresh ingredients, olive oil, and balanced flavors",
      elemental_properties: {
        Fire: 0.3,
        Water: 0.2,
        Earth: 0.35,
        Air: 0.15,
      },
      nested_recipes: [
        {
          recipe_id: "recipe-001",
          name: "Margherita Pizza",
          description:
            "Classic Neapolitan pizza with tomatoes, mozzarella, and basil",
          prep_time: "20 min",
          cook_time: "15 min",
          servings: 4,
          difficulty: "Medium",
          ingredients: [
            { name: "Pizza dough", amount: "500", unit: "g" },
            {
              name: "San Marzano tomatoes",
              amount: "400",
              unit: "g",
              notes: "crushed",
            },
            { name: "Fresh mozzarella", amount: "250", unit: "g" },
            { name: "Fresh basil", amount: "1", unit: "bunch" },
            { name: "Extra virgin olive oil", amount: "3", unit: "tbsp" },
            { name: "Sea salt", notes: "to taste" },
          ],
          instructions: [
            "Preheat oven to 500°F (260°C) with pizza stone",
            "Roll out pizza dough to 12-inch circle",
            "Spread crushed tomatoes evenly over dough",
            "Add torn mozzarella pieces",
            "Bake for 12-15 minutes until crust is golden",
            "Top with fresh basil and drizzle with olive oil",
          ],
          meal_type: moment.meal_type || "Dinner",
          seasonal_fit: "High - fresh ingredients peak in current season",
        },
      ],
      recommended_sauces: [
        {
          sauce_name: "Pesto Genovese",
          description:
            "Bright, herbaceous sauce made with fresh basil, pine nuts, garlic, and Parmesan",
          key_ingredients: ["Basil", "Pine nuts", "Parmesan", "Garlic"],
          elemental_properties: {
            Fire: 0.2,
            Water: 0.15,
            Earth: 0.45,
            Air: 0.2,
          },
          compatibility_score: 0.92,
          reason:
            "Earth-dominant profile complements current planetary alignment",
        },
      ],
      seasonal_context: `Perfect for ${moment.season} - ingredients are at peak freshness`,
      astrological_score: 0.88,
      compatibility_reason: `Strong Earth element aligns with ${moment.zodiac_sign}'s grounding energy`,
    },
    {
      cuisine_id: "mexican-001",
      name: "Mexican",
      description:
        "Vibrant cuisine featuring bold spices, fresh vegetables, and ancient cooking techniques",
      elemental_properties: {
        Fire: 0.45,
        Water: 0.15,
        Earth: 0.25,
        Air: 0.15,
      },
      nested_recipes: [
        {
          recipe_id: "recipe-002",
          name: "Chicken Tacos al Pastor",
          description:
            "Marinated chicken with pineapple, cilantro, and warming spices",
          prep_time: "30 min",
          cook_time: "20 min",
          servings: 6,
          difficulty: "Medium",
          ingredients: [
            { name: "Chicken thighs", amount: "800", unit: "g" },
            { name: "Pineapple", amount: "1", unit: "cup", notes: "diced" },
            { name: "White onion", amount: "1", unit: "large" },
            { name: "Cilantro", amount: "1", unit: "bunch" },
            { name: "Chipotle peppers", amount: "2", unit: "peppers" },
            { name: "Corn tortillas", amount: "12", unit: "tortillas" },
          ],
          instructions: [
            "Marinate chicken in chipotle sauce for 2 hours",
            "Grill chicken until charred and cooked through",
            "Slice chicken thinly",
            "Warm tortillas on griddle",
            "Assemble tacos with chicken, pineapple, onion, and cilantro",
            "Serve with lime wedges",
          ],
          meal_type: moment.meal_type || "Dinner",
          seasonal_fit: "Medium - adaptable across seasons",
        },
      ],
      recommended_sauces: [
        {
          sauce_name: "Salsa Verde",
          description:
            "Tangy tomatillo-based sauce with jalapeños and fresh herbs",
          key_ingredients: ["Tomatillos", "Jalapeños", "Cilantro", "Lime"],
          elemental_properties: {
            Fire: 0.5,
            Water: 0.2,
            Earth: 0.2,
            Air: 0.1,
          },
          compatibility_score: 0.85,
          reason: "Fire element harmonizes with current cosmic heat",
        },
      ],
      seasonal_context: `Good for ${moment.season} with seasonal ingredient adjustments`,
      astrological_score: 0.82,
      compatibility_reason: `Fire energy complements ${moment.zodiac_sign}'s dynamic nature`,
    },
  ];

  return recommendations;
}

/**
 * GET /api/cuisines/recommend
 *
 * Returns cuisine recommendations for the current astrological moment
 */
export async function GET(request: Request) {
  try {
    logger.info("Cuisine recommendations API called");

    // Get current astrological moment
    const currentMoment = getCurrentMoment();

    // Generate recommendations
    const recommendations = generateRecommendations(currentMoment);

    const response = {
      success: true,
      current_moment: currentMoment,
      cuisine_recommendations: recommendations,
      total_recommendations: recommendations.length,
      timestamp: new Date().toISOString(),
      metadata: {
        api_version: "1.0.0",
        data_source: "local-calculation",
        can_be_called_externally: true,
      },
    };

    logger.info(`Returning ${recommendations.length} cuisine recommendations`);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error generating cuisine recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cuisine recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cuisines/recommend
 *
 * Returns cuisine recommendations for a specific datetime or with custom filters
 *
 * Body parameters:
 * - datetime (optional): ISO datetime string
 * - dietary_restrictions (optional): array of dietary restrictions
 * - preferred_cuisines (optional): array of preferred cuisine types
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    logger.info(
      "Cuisine recommendations API called with custom parameters",
      body,
    );

    // Get current moment (or use provided datetime)
    const currentMoment = getCurrentMoment();

    // TODO: Apply filters from body
    // - body.dietary_restrictions
    // - body.preferred_cuisines
    // - body.datetime (parse and use for astrological calculations)

    // Generate recommendations
    const recommendations = generateRecommendations(currentMoment);

    const response = {
      success: true,
      current_moment: currentMoment,
      cuisine_recommendations: recommendations,
      total_recommendations: recommendations.length,
      applied_filters: {
        dietary_restrictions: body.dietary_restrictions || [],
        preferred_cuisines: body.preferred_cuisines || [],
      },
      timestamp: new Date().toISOString(),
      metadata: {
        api_version: "1.0.0",
        data_source: "local-calculation",
        can_be_called_externally: true,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error generating cuisine recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate cuisine recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
