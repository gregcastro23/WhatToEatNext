/**
 * Recommendation Bridge
 * Connects planetary day recommendations with existing recipe/ingredient recommenders
 * Now includes user chart personalization for tailored recommendations
 *
 * @file src/utils/menuPlanner/recommendationBridge.ts
 * @created 2026-01-11 (Phase 3)
 * @updated 2026-02-03 - Added user chart personalization support
 */

import type { AlchemicalProfile } from "@/contexts/UserContext";
import {
    UnifiedRecipeBuildingSystem,
    type MonicaOptimizedRecipe,
} from "@/data/unified/recipeBuilding";
import type { ChartComparison } from "@/services/ChartComparisonService";
import type { LunarPhase } from "@/types/celestial";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { NatalChart } from "@/types/natalChart";
import type { ElementalProperties } from "@/types/recipe";
import { calculateConstitutionalCompatibility } from "@/utils/alchemy/constitutionalBalancing";
import {
    getRecipeKAlchm,
    getUserTargetKAlchm,
} from "@/utils/alchemy/derivedStats";
import { calculateTransitScoreModifier } from "@/utils/astrology/transits";
import { createLogger } from "@/utils/logger";
import {
    calculateDayFoodCompatibility,
    getPlanetaryDayCharacteristics,
    type PlanetaryDayCharacteristics,
} from "@/utils/planetaryDayRecommendations";

const logger = createLogger("RecommendationBridge");

/**
 * Astrological state interface for recommendations
 * Simplified interface that matches what we get from useAstrologicalState
 */
export interface AstrologicalState {
  currentZodiac: string;
  lunarPhase: LunarPhase;
  activePlanets: string[];
  domElements: ElementalProperties;
  currentPlanetaryHour?: string;
}

/**
 * User personalization context for recommendations
 */
export interface UserPersonalizationContext {
  natalChart: NatalChart;
  chartComparison?: ChartComparison;
  prioritizeHarmony?: boolean;
  stats?: AlchemicalProfile;
}

/**
 * Day recommendation options
 */
export interface DayRecommendationOptions {
  mealTypes?: MealType[];
  dietaryRestrictions?: string[];
  useCurrentPlanetary?: boolean;
  maxRecipesPerMeal?: number;
  preferredCuisines?: string[];
  excludeIngredients?: string[];
  /** Required ingredients to include in generated recipes */
  requiredIngredients?: string[];
  /** Preferred cooking methods to guide recipe generation */
  preferredCookingMethods?: string[];
  /** Flavor preferences to guide ingredient and cuisine selection */
  flavorPreferences?: string[];
  /** User personalization context for chart-based recommendations */
  userContext?: UserPersonalizationContext;
}

/**
 * Recommended meal result
 */
export interface RecommendedMeal {
  mealType: MealType;
  recipe: MonicaOptimizedRecipe;
  score: number;
  reasons: string[];
  dayAlignment: number;
  planetaryAlignment: number;
  /** Personalized score after applying user chart boost */
  personalizedScore?: number;
  /** Personalization boost multiplier (0.7-1.3) */
  personalizationBoost?: number;
  /** Whether recommendation was personalized for user */
  isPersonalized?: boolean;
}

/**
 * Generate meal recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Current astrological state
 * @param options - Recommendation options (including optional user personalization)
 * @returns Array of recommended meals
 */
export async function generateDayRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
  options: DayRecommendationOptions = {},
): Promise<RecommendedMeal[]> {
  try {
    const {
      mealTypes = ["breakfast", "lunch", "dinner"],
      maxRecipesPerMeal = 3,
      dietaryRestrictions = [],
      preferredCuisines = [],
      excludeIngredients = [],
      requiredIngredients = [],
      preferredCookingMethods = [],
      flavorPreferences = [],
      userContext,
    } = options;

    const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);
    const hasPersonalization = !!userContext?.natalChart;

    logger.info(`Generating recommendations for ${dayChar.planet} day`, {
      dayOfWeek,
      mealTypes,
      personalized: hasPersonalization,
    });

    const recommendations: RecommendedMeal[] = [];

    // Generate recommendations for each meal type
    for (const mealType of mealTypes) {
      const mealRecs = await generateMealRecommendations(
        dayOfWeek,
        mealType,
        dayChar,
        astroState,
        {
          maxRecipes: maxRecipesPerMeal,
          dietaryRestrictions,
          preferredCuisines,
          excludeIngredients,
          requiredIngredients,
          preferredCookingMethods,
          flavorPreferences,
        },
      );

      recommendations.push(...mealRecs);
    }

    // Apply personalization if user context is provided
    if (hasPersonalization) {
      const personalizedRecs = applyUserPersonalization(
        recommendations,
        userContext,
        astroState,
      );

      logger.info(
        `Generated ${personalizedRecs.length} personalized recommendations`,
      );
      return personalizedRecs;
    }

    logger.info(`Generated ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    logger.error("Failed to generate day recommendations:", error);
    return [];
  }
}

/**
 * Apply user chart personalization to recommendations
 *
 * @param recommendations - Base recommendations
 * @param userContext - User personalization context
 * @param astroState - The current astrological state for transit calculations
 * @returns Personalized recommendations sorted by personalized score
 */
function applyUserPersonalization(
  recommendations: RecommendedMeal[],
  userContext: UserPersonalizationContext,
  astroState: AstrologicalState,
): RecommendedMeal[] {
  const { natalChart, chartComparison, prioritizeHarmony = true, stats } =
    userContext;

  const personalized = recommendations.map((rec) => {
    // Calculate personalization boost based on elemental alignment with user's chart
    const boost = calculatePersonalizationBoost(
      rec.recipe,
      natalChart,
      chartComparison,
    );

    // NEW: Calculate transit score modifier
    const transitModifier = calculateTransitScoreModifier(
      natalChart,
      astroState,
      rec.recipe,
    );

    // NEW: Constitutional Balancing
    let constitutionalModifier = 1.0;
    if (stats) {
      constitutionalModifier = calculateConstitutionalCompatibility(
        stats,
        rec.recipe,
      );
    }

    // NEW: Equilibrium Score
    const recipeKAlchm = getRecipeKAlchm(rec.recipe);
    const userTargetKAlchm = getUserTargetKAlchm(astroState);
    const equilibriumScore =
      1 /
      (1 +
        Math.abs(Math.log(recipeKAlchm) - Math.log(userTargetKAlchm)));

    const personalizedScore =
      rec.score *
      boost *
      transitModifier *
      constitutionalModifier *
      equilibriumScore;
    const reasons = [...rec.reasons];

    // Add personalization reasons
    if (boost > 1.05) {
      reasons.push(
        `Aligned with your ${natalChart.dominantElement} dominant element`,
      );
    }
    if (boost > 1.15) {
      reasons.push("Strong cosmic harmony with your birth chart");
    }
    if (transitModifier > 1.0) {
      reasons.push("Enhanced by current planetary transits.");
    }
    if (constitutionalModifier > 1.1) {
      reasons.push("Provides excellent constitutional balance.");
    }
    if (equilibriumScore > 0.8) {
      reasons.push("Excellent KAlchm equilibrium for your current state.");
    }

    return {
      ...rec,
      personalizedScore,
      personalizationBoost: boost,
      isPersonalized: true,
      reasons,
    };
  });

  // Sort by personalized score if prioritizing harmony
  if (prioritizeHarmony) {
    personalized.sort(
      (a, b) =>
        (b.personalizedScore || b.score) - (a.personalizedScore || a.score),
    );
  }

  return personalized;
}

/**
 * Calculate personalization boost based on user's natal chart
 *
 * @param recipe - Recipe to evaluate
 * @param natalChart - User's natal chart
 * @param chartComparison - Optional chart comparison with current moment
 * @returns Boost multiplier (0.7 to 1.3)
 */
function calculatePersonalizationBoost(
  recipe: MonicaOptimizedRecipe,
  natalChart: NatalChart,
  chartComparison?: ChartComparison,
): number {
  let boost = 1.0;

  // 1. Elemental alignment with user's dominant element (±15%)
  if (recipe.elementalProperties && natalChart.elementalBalance) {
    const dominantElement = natalChart.dominantElement;
    const recipeElementValue = recipe.elementalProperties[dominantElement] || 0;

    // Higher recipe value for user's dominant element = higher boost
    boost += (recipeElementValue - 0.25) * 0.6; // -0.15 to +0.45 range compressed to ±0.15
  }

  // 2. Chart comparison harmony (if available) (±10%)
  if (chartComparison) {
    const harmonyBoost = (chartComparison.overallHarmony - 0.5) * 0.2;
    boost += harmonyBoost;

    // Extra boost for favorable elements
    if (
      chartComparison.insights?.favorableElements &&
      recipe.elementalProperties
    ) {
      const favorableMatch = chartComparison.insights.favorableElements.some(
        (el) => {
          const elementKey = el as keyof ElementalProperties;
          return (recipe.elementalProperties?.[elementKey] || 0) > 0.3;
        },
      );
      if (favorableMatch) {
        boost += 0.05;
      }
    }
  }

  // 3. Alchemical property alignment (±5%)
  if (natalChart.alchemicalProperties && (recipe as any).alchemicalProperties) {
    const recipeAlch = (recipe as any).alchemicalProperties;
    const userAlch = natalChart.alchemicalProperties;

    // Simple dot product similarity for alchemical properties
    let similarity = 0;
    const props = ["Spirit", "Essence", "Matter", "Substance"] as const;
    let userTotal = 0;
    let recipeTotal = 0;

    for (const prop of props) {
      similarity += (userAlch[prop] || 0) * (recipeAlch[prop] || 0);
      userTotal += (userAlch[prop] || 0) ** 2;
      recipeTotal += (recipeAlch[prop] || 0) ** 2;
    }

    if (userTotal > 0 && recipeTotal > 0) {
      const cosineSim =
        similarity / (Math.sqrt(userTotal) * Math.sqrt(recipeTotal));
      boost += (cosineSim - 0.5) * 0.1; // ±0.05
    }
  }

  // Clamp to valid range
  return Math.max(0.7, Math.min(1.3, boost));
}

/**
 * Generate recommendations for a specific meal
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @param dayChar - Planetary day characteristics
 * @param astroState - Astrological state
 * @param options - Options for meal recommendations
 * @returns Array of recommended meals
 */
async function generateMealRecommendations(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
  dayChar: PlanetaryDayCharacteristics,
  astroState: AstrologicalState,
  options: {
    maxRecipes: number;
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    excludeIngredients: string[];
    requiredIngredients?: string[];
    preferredCookingMethods?: string[];
    flavorPreferences?: string[];
  },
): Promise<RecommendedMeal[]> {
  try {
    // Get candidate recipes
    const candidateRecipes = await searchRecipesForDay(
      dayChar,
      mealType,
      options,
    );

    // Score each recipe
    const scoredRecipes = candidateRecipes.map((recipe) => {
      const { score, reasons, dayAlignment, planetaryAlignment } =
        scoreRecipeForDay(recipe, dayChar, mealType, astroState);

      return {
        mealType,
        recipe,
        score,
        reasons,
        dayAlignment,
        planetaryAlignment,
      };
    });

    // Sort by score and select top N while enforcing protein diversity.
    // We greedily pick the highest-scored recipe that doesn't reuse a protein
    // already selected, falling back to duplicates only when necessary.
    scoredRecipes.sort((a, b) => b.score - a.score);

    const selected: typeof scoredRecipes = [];
    const selectedProteins = new Set<string>();

    for (const rec of scoredRecipes) {
      if (selected.length >= options.maxRecipes) break;

      // Identify the recipe's primary protein
      const proteinIng = rec.recipe.ingredients?.find(
        (ing: any) => ing.category === "protein",
      );
      const proteinKey = proteinIng?.name?.toLowerCase() || "";

      // Prefer recipes with a protein we haven't used yet
      if (proteinKey && selectedProteins.has(proteinKey)) continue;

      if (proteinKey) selectedProteins.add(proteinKey);
      selected.push(rec);
    }

    // If we couldn't fill the slots due to diversity constraints, add remaining top-scored
    if (selected.length < options.maxRecipes) {
      for (const rec of scoredRecipes) {
        if (selected.length >= options.maxRecipes) break;
        if (!selected.includes(rec)) selected.push(rec);
      }
    }

    return selected;
  } catch (error) {
    logger.error(`Failed to generate ${mealType} recommendations:`, error);
    return [];
  }
}

// ===== PLANETARY INFLUENCE PROFILES =====
// Each planet emphasises different culinary elements, flavour profiles, and cooking methods.
// We cycle through these to ensure each generated recipe has a distinct personality.

const PLANET_CULINARY_PROFILES: Record<string, {
  flavorBias: string[];
  cookingMethods: string[];
  elementalEmphasis: Partial<ElementalProperties>;
  proteinAffinity: string[];
}> = {
  Sun: {
    flavorBias: ["bold", "warm", "citrusy", "golden"],
    cookingMethods: ["Roast", "Grill"],
    elementalEmphasis: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    proteinAffinity: ["Chicken", "Lamb", "Salmon"],
  },
  Moon: {
    flavorBias: ["creamy", "comforting", "mild", "delicate"],
    cookingMethods: ["Stew", "Steam", "Poach"],
    elementalEmphasis: { Water: 0.5, Earth: 0.2, Air: 0.2, Fire: 0.1 },
    proteinAffinity: ["Fish", "Crab", "Tofu", "Egg"],
  },
  Mercury: {
    flavorBias: ["tangy", "herbal", "bright", "zesty"],
    cookingMethods: ["Stir-Fry", "Sauté", "Quick Pickle"],
    elementalEmphasis: { Air: 0.45, Fire: 0.25, Water: 0.2, Earth: 0.1 },
    proteinAffinity: ["Shrimp", "Chicken", "Tempeh"],
  },
  Venus: {
    flavorBias: ["sweet", "floral", "luxurious", "honeyed"],
    cookingMethods: ["Bake", "Braise", "Caramelize"],
    elementalEmphasis: { Water: 0.35, Earth: 0.3, Air: 0.2, Fire: 0.15 },
    proteinAffinity: ["Duck", "Scallops", "Pork"],
  },
  Mars: {
    flavorBias: ["spicy", "smoky", "charred", "bold"],
    cookingMethods: ["Grill", "Roast", "Sear"],
    elementalEmphasis: { Fire: 0.55, Earth: 0.2, Air: 0.15, Water: 0.1 },
    proteinAffinity: ["Beef", "Lamb", "Venison", "Chorizo"],
  },
  Jupiter: {
    flavorBias: ["rich", "abundant", "hearty", "festive"],
    cookingMethods: ["Roast", "Braise", "Bake"],
    elementalEmphasis: { Fire: 0.3, Earth: 0.3, Water: 0.2, Air: 0.2 },
    proteinAffinity: ["Turkey", "Beef", "Pork Loin", "Chickpeas"],
  },
  Saturn: {
    flavorBias: ["earthy", "umami", "aged", "rustic"],
    cookingMethods: ["Braise", "Slow Cook", "Ferment"],
    elementalEmphasis: { Earth: 0.5, Water: 0.2, Fire: 0.15, Air: 0.15 },
    proteinAffinity: ["Lentils", "Mushrooms", "Goat", "Root Vegetables"],
  },
  Uranus: {
    flavorBias: ["unexpected", "fusion", "electric", "innovative"],
    cookingMethods: ["Stir-Fry", "Ceviche", "Smoke"],
    elementalEmphasis: { Air: 0.45, Fire: 0.25, Water: 0.2, Earth: 0.1 },
    proteinAffinity: ["Octopus", "Jackfruit", "Seitan", "Tuna"],
  },
  Neptune: {
    flavorBias: ["briny", "ethereal", "delicate", "oceanic"],
    cookingMethods: ["Poach", "Steam", "Raw"],
    elementalEmphasis: { Water: 0.55, Air: 0.2, Earth: 0.15, Fire: 0.1 },
    proteinAffinity: ["Cod", "Mussels", "Seaweed", "White Fish"],
  },
  Pluto: {
    flavorBias: ["intense", "transformative", "dark", "fermented"],
    cookingMethods: ["Char", "Braise", "Ferment"],
    elementalEmphasis: { Fire: 0.3, Earth: 0.3, Water: 0.25, Air: 0.15 },
    proteinAffinity: ["Bone Marrow", "Miso", "Black Beans", "Squid"],
  },
};

// All planets in order for cycling through different recipe angles
const ALL_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

/**
 * Search for recipes appropriate for a specific day and meal type.
 * Now generates diverse recipes by cycling through planetary influence
 * profiles, ensuring different proteins, cooking methods, and flavour angles.
 */
async function searchRecipesForDay(
  dayChar: PlanetaryDayCharacteristics,
  mealType: MealType,
  options: {
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    excludeIngredients: string[];
    requiredIngredients?: string[];
    preferredCookingMethods?: string[];
    flavorPreferences?: string[];
  },
): Promise<MonicaOptimizedRecipe[]> {
  try {
    logger.debug("Searching recipes for day (diversity mode)", {
      planet: dayChar.planet,
      mealType,
      cuisines: dayChar.recommendedCuisines,
      requiredIngredients: options.requiredIngredients,
    });

    const recipeBuilder = new UnifiedRecipeBuildingSystem();
    const results: MonicaOptimizedRecipe[] = [];
    const usedProteinNames = new Set<string>();
    const usedCookingMethods = new Set<string>();

    // Build the list of planetary influences to explore.
    // Start with the day's ruling planet, then add active planets and fill with others.
    const dayPlanet = dayChar.planet;
    const explorationPlanets: string[] = [dayPlanet];

    // Add recommended cuisines' natural planetary affinity
    for (const p of ALL_PLANETS) {
      if (!explorationPlanets.includes(p)) {
        explorationPlanets.push(p);
      }
      if (explorationPlanets.length >= 6) break; // Generate up to 6 diverse recipes
    }

    // Determine cuisines to explore
    const cuisinePool = options.preferredCuisines.length > 0
      ? options.preferredCuisines
      : dayChar.recommendedCuisines.slice(0, 5);

    // Generate a diverse recipe for each planetary influence
    for (let i = 0; i < explorationPlanets.length; i++) {
      const planet = explorationPlanets[i];
      const profile = PLANET_CULINARY_PROFILES[planet] || PLANET_CULINARY_PROFILES["Sun"];

      // Rotate through cuisines so each recipe explores a different cuisine
      const cuisine = cuisinePool[i % cuisinePool.length] || cuisinePool[0];

      // Determine cooking methods: use user preference if provided, otherwise
      // draw from the planetary profile to ensure variety
      let cookingMethods = options.preferredCookingMethods && options.preferredCookingMethods.length > 0
        ? options.preferredCookingMethods
        : profile.cookingMethods.filter((m) => !usedCookingMethods.has(m));

      // Fallback: if all methods were used, allow reuse
      if (cookingMethods.length === 0) cookingMethods = profile.cookingMethods;

      const criteria = {
        cuisine,
        mealType: [mealType],
        dietaryRestrictions: options.dietaryRestrictions,
        excludedIngredients: [
          ...options.excludeIngredients,
          // Exclude proteins already used by previous recipes to force variety
          ...Array.from(usedProteinNames),
        ],
        requiredIngredients:
          options.requiredIngredients && options.requiredIngredients.length > 0
            ? options.requiredIngredients
            : undefined,
        cookingMethods,
        planetaryHour: planet as any,
        elementalPreference: profile.elementalEmphasis,
      };

      try {
        const result = recipeBuilder.generateMonicaOptimizedRecipe(criteria);

        if (result.recipe) {
          // Track the primary protein to prevent reuse
          const proteinIngredient = result.recipe.ingredients?.find(
            (ing: any) =>
              ing.category === "protein" ||
              profile.proteinAffinity.some((p) =>
                ing.name?.toLowerCase().includes(p.toLowerCase()),
              ),
          );
          if (proteinIngredient) {
            usedProteinNames.add(proteinIngredient.name);
          }

          // Track cooking methods used
          for (const m of result.recipe.cookingMethod || []) {
            usedCookingMethods.add(m);
          }

          results.push(result.recipe);
        }
      } catch {
        // Skip failed generation for this planetary angle
      }
    }

    // If we didn't generate enough, add alternatives from the primary recipe
    if (results.length < 3) {
      const baseCuisine = cuisinePool[0] || "fusion";
      try {
        const fallbackResult = recipeBuilder.generateMonicaOptimizedRecipe({
          cuisine: baseCuisine,
          mealType: [mealType],
          dietaryRestrictions: options.dietaryRestrictions,
          excludedIngredients: options.excludeIngredients,
          planetaryHour: dayPlanet as any,
        });
        if (fallbackResult.recipe) results.push(fallbackResult.recipe);
        results.push(...fallbackResult.alternatives);
      } catch {
        // Skip
      }
    }

    logger.info(
      `Generated ${results.length} diverse recipes for ${mealType} on ${dayChar.planet} day`,
    );

    return results;
  } catch (error) {
    logger.error("Failed to search recipes:", error);
    return [];
  }
}

/**
 * Score a recipe for alignment with a specific day
 *
 * @param recipe - Recipe to score
 * @param dayChar - Planetary day characteristics
 * @param mealType - Type of meal
 * @param astroState - Astrological state
 * @returns Score and reasons
 */
function scoreRecipeForDay(
  recipe: MonicaOptimizedRecipe,
  dayChar: PlanetaryDayCharacteristics,
  mealType: MealType,
  astroState: AstrologicalState,
): {
  score: number;
  reasons: string[];
  dayAlignment: number;
  planetaryAlignment: number;
} {
  const reasons: string[] = [];
  let score = 0;
  const weights = {
    elemental: 0.3,
    cuisine: 0.2,
    nutritional: 0.15,
    mealType: 0.15,
    planetary: 0.2,
  };

  // 1. Elemental alignment
  if (recipe.elementalProperties) {
    const elementalScore = calculateDayFoodCompatibility(
      dayChar,
      recipe.elementalProperties,
    );
    score += elementalScore * weights.elemental;

    if (elementalScore > 0.7) {
      reasons.push(`Strong elemental alignment with ${dayChar.planet} energy`);
    }
  }

  // 2. Cuisine match
  if (recipe.cuisine) {
    const cuisineMatch = dayChar.recommendedCuisines.some((c) =>
      recipe.cuisine?.toLowerCase().includes(c.toLowerCase()),
    );
    if (cuisineMatch) {
      score += weights.cuisine;
      reasons.push(
        `${recipe.cuisine} cuisine aligned with ${dayChar.planet} day`,
      );
    }
  }

  // 3. Nutritional emphasis
  const nutritionalScore = scoreNutritionalAlignment(
    recipe,
    dayChar.nutritionalEmphasis,
  );
  score += nutritionalScore * weights.nutritional;

  if (nutritionalScore > 0.7) {
    reasons.push(`Matches ${dayChar.nutritionalEmphasis} emphasis`);
  }

  // 4. Meal type appropriateness - THIS NEEDS TO BE RE-IMPLEMENTED FOR MONICAOPTIMIZEDRECIPE
  // For now, setting a placeholder score
  const mealTypeScore = 0.8; // Placeholder
  score += mealTypeScore * weights.mealType;

  // 5. Planetary hour alignment — use a gradient instead of binary
  let planetaryScore = 0.5; // Default neutral score
  if (astroState.currentPlanetaryHour) {
    const currentHour = astroState.currentPlanetaryHour;
    const profile = PLANET_CULINARY_PROFILES[currentHour];
    if (currentHour.toLowerCase() === dayChar.planet.toLowerCase()) {
      planetaryScore = 1.0;
      reasons.push(
        `Perfect timing with ${currentHour} planetary hour`,
      );
    } else if (profile) {
      // Partial alignment: check if the recipe's cooking method matches the hour's affinity
      const methodMatch = recipe.cookingMethod?.some((m: string) =>
        profile.cookingMethods.some((pm) => m.toLowerCase().includes(pm.toLowerCase())),
      );
      planetaryScore = methodMatch ? 0.75 : 0.45;
      if (methodMatch) {
        reasons.push(`Cooking method aligns with ${currentHour} hour energy`);
      }
    }
  }
  score += planetaryScore * weights.planetary;

  // 6. Flavor preference alignment (bonus, not weighted against others)
  if (astroState.activePlanets && astroState.activePlanets.length > 0) {
    const activeFlavors = astroState.activePlanets.flatMap(
      (p) => PLANET_CULINARY_PROFILES[p]?.flavorBias || [],
    );
    const recipeQualities = ((recipe as any).qualities || []) as string[];
    const flavorOverlap = recipeQualities.filter((q: string) =>
      activeFlavors.some((f) => q.toLowerCase().includes(f.toLowerCase())),
    ).length;
    if (flavorOverlap > 0) {
      score += Math.min(0.1, flavorOverlap * 0.03);
      reasons.push("Flavour profile resonates with active planetary energies");
    }
  }

  // Normalize score to 0-1 range
  const normalizedScore = Math.max(0, Math.min(1, score));

  return {
    score: normalizedScore,
    reasons,
    dayAlignment:
      score /
      (weights.elemental +
        weights.cuisine +
        weights.nutritional +
        weights.mealType),
    planetaryAlignment: planetaryScore,
  };
}

/**
 * Score nutritional alignment with day's emphasis
 *
 * @param recipe - Recipe to score
 * @param emphasis - Nutritional emphasis
 * @returns Score (0-1)
 */
function scoreNutritionalAlignment(
  recipe: MonicaOptimizedRecipe,
  emphasis: "protein" | "carbs" | "fats" | "balanced",
): number {
  if (!recipe.nutritionalProfile) return 0.5;

  const nutritionProfile = recipe.nutritionalProfile as any;
  const protein = nutritionProfile.protein || 0;
  const carbs = nutritionProfile.carbs || 0;
  const fat = nutritionProfile.fat || 0;
  const total = protein + carbs + fat;

  if (total === 0) return 0.5;

  const proteinRatio = protein / total;
  const carbsRatio = carbs / total;
  const fatRatio = fat / total;

  switch (emphasis) {
    case "protein":
      return proteinRatio > 0.35 ? 1.0 : proteinRatio / 0.35;
    case "carbs":
      return carbsRatio > 0.45 ? 1.0 : carbsRatio / 0.45;
    case "fats":
      return fatRatio > 0.3 ? 1.0 : fatRatio / 0.3;
    case "balanced": {
      // Check if ratios are reasonably balanced (none too high or too low)
      const balance =
        1 -
        Math.abs(proteinRatio - 0.3) -
        Math.abs(carbsRatio - 0.4) -
        Math.abs(fatRatio - 0.3);
      return Math.max(0, Math.min(1, balance));
    }
    default:
      return 0.5;
  }
}

/**
 * Get ingredient recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Astrological state
 * @param limit - Maximum number of ingredients
 * @returns Array of recommended ingredient names
 */
export function getDailyIngredientRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
  limit: number = 20,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // Return day-specific recommended foods
  return dayChar.recommendedFoods.slice(0, limit);
}

/**
 * Get cuisine recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param astroState - Astrological state
 * @returns Array of recommended cuisines with scores
 */
export function getDailyCuisineRecommendations(
  dayOfWeek: DayOfWeek,
  astroState: AstrologicalState,
): Array<{ cuisine: string; score: number; reason: string }> {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  return dayChar.recommendedCuisines.map((cuisine, index) => ({
    cuisine,
    score: 1.0 - index * 0.1, // Decrease score for later cuisines
    reason: `Aligned with ${dayChar.planet} (${dayChar.element} element) energy`,
  }));
}

/**
 * Get cooking method recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @returns Array of recommended cooking methods
 */
export function getDailyCookingMethods(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // Filter methods appropriate for meal type
  const breakfastMethods = ["steaming", "poaching", "baking", "quick-cooking"];
  const lunchMethods = ["grilling", "roasting", "stir-frying", "searing"];
  const dinnerMethods = [
    "slow-cooking",
    "braising",
    "roasting",
    "multi-course",
  ];
  const snackMethods = ["assembly", "raw preparations"];

  let appropriateMethods: string[] = [];

  switch (mealType) {
    case "breakfast":
      appropriateMethods = breakfastMethods;
      break;
    case "lunch":
      appropriateMethods = lunchMethods;
      break;
    case "dinner":
      appropriateMethods = dinnerMethods;
      break;
    case "snack":
      appropriateMethods = snackMethods;
      break;
  }

  // Return methods that appear in both day recommendations and meal-appropriate methods
  return dayChar.cookingMethods.filter((method) =>
    appropriateMethods.some((am) =>
      method.toLowerCase().includes(am.toLowerCase()),
    ),
  );
} // Dummy comment to force re-compile
