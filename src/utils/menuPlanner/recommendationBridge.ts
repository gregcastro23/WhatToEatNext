/**
 * Recommendation Bridge
 * Connects planetary day recommendations with existing recipe/ingredient recommenders
 * Now includes user chart personalization for tailored recommendations
 *
 * @file src/utils/menuPlanner/recommendationBridge.ts
 * @created 2026-01-11 (Phase 3)
 * @updated 2026-02-03 - Added user chart personalization support
 */

import {
  getServerRecipeIndex,
  getServerRecipes,
} from "@/actions/recipes";
import type { AlchemicalProfile } from "@/contexts/UserContext";
import type { MonicaOptimizedRecipe } from "@/data/unified/recipeBuilding";
import type { ChartComparison } from "@/services/ChartComparisonService";
import type { LunarPhase } from "@/types/celestial";
import type { IndexedRecipe } from "@/types/indexedRecipe";
import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { NatalChart } from "@/types/natalChart";
import type { ElementalProperties, Recipe } from "@/types/recipe";
import { calculateConstitutionalCompatibility } from "@/utils/alchemy/constitutionalBalancing";
import {
  getRecipeKAlchm,
  getUserTargetKAlchm,
} from "@/utils/alchemy/derivedStats";
import { calculateTransitScoreModifier } from "@/utils/astrology/transits";
import {
  getCuisineEntry,
  getDominantElementForCuisine,
} from "@/utils/cuisine/cuisineIndex";
import { calculateRecipeEstimatedCost, calculateBangForBuck } from "@/utils/instacart/priceEstimator";
import { createLogger } from "@/utils/logger";
import { isSuitableForMealType } from "@/utils/menuPlanner/mealTypeMatching";
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
  /** Meals already planned for the week, used to avoid repetition */
  existingMeals?: Array<{
    recipeId: string;
    recipeName: string;
    cuisine?: string;
    primaryProtein?: string;
  }>;
  /** Budget limit per meal in USD. When set, expensive recipes are penalised. */
  budgetPerMeal?: number;
  /** Maximum prep time in minutes. Recipes exceeding this are filtered out. */
  maxPrepTimeMinutes?: number | null;
  /** Nutritional gap context for gap-aware scoring. When provided, recipes that
   *  fill current nutritional deficits are scored higher. */
  nutritionalContext?: {
    /** Remaining daily macro budget (target minus already-planned totals) */
    remainingCalories?: number;
    remainingProteinG?: number;
    remainingCarbsG?: number;
    remainingFatG?: number;
    remainingFiberG?: number;
    /** Whether to heavily prioritize protein-rich recipes */
    prioritizeProtein?: boolean;
    /** Whether to heavily prioritize fiber-rich recipes */
    prioritizeFiber?: boolean;
  };
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
      existingMeals = [],
      budgetPerMeal,
      maxPrepTimeMinutes,
      nutritionalContext,
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
          existingMeals,
          budgetPerMeal,
          maxPrepTimeMinutes,
          nutritionalContext,
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
    existingMeals?: Array<{
      recipeId: string;
      recipeName: string;
      cuisine?: string;
      primaryProtein?: string;
    }>;
    budgetPerMeal?: number;
    maxPrepTimeMinutes?: number | null;
    nutritionalContext?: DayRecommendationOptions["nutritionalContext"];
  },
): Promise<RecommendedMeal[]> {
  try {
    // Get candidate recipes from the real recipe database
    const candidateRecipes = await searchRecipesForDay(
      dayChar,
      mealType,
      options,
    );

    // Score each recipe
    const scoredRecipes = candidateRecipes.map((recipe) => {
      const { score, reasons, dayAlignment, planetaryAlignment } =
        scoreRecipeForDay(recipe, dayChar, mealType, astroState, options.nutritionalContext);

      // Add small randomization (e.g., +/- 10% to score) to prevent identical
      // deterministic top choices spreading across similar days, causing repetitive menus.
      const jitteredScore = score * (0.9 + Math.random() * 0.2);

      return {
        mealType,
        recipe,
        score: jitteredScore,
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

// ===== SEASON HELPER =====

/**
 * Get the current season based on the month.
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

// ===== RECIPE ADAPTER =====

/**
 * Adapt a database Recipe into the MonicaOptimizedRecipe shape
 * expected by the scoring and personalization pipeline.
 * Uses stub metadata since the recipe is already a real, curated recipe.
 */
function adaptRecipeToMonicaOptimized(recipe: Recipe): MonicaOptimizedRecipe {
  return {
    ...recipe,
    alchemicalProperties: (recipe as any).alchemicalProperties ?? undefined,
    cookingOptimization: undefined,
    monicaOptimization: {
      originalMonica: null,
      optimizedMonica: 1.0,
      optimizationScore: 0.5,
      temperatureAdjustments: [],
      timingAdjustments: [],
      intensityModifications: [],
      planetaryTimingRecommendations: [],
    },
    seasonalAdaptation: {
      currentSeason: getCurrentSeason() as any,
      seasonalScore: 0.7,
      seasonalIngredientSubstitutions: [],
      seasonalCookingMethodAdjustments: [],
    },
    cuisineIntegration: {
      authenticity: 0.9,
      fusionPotential: 0.5,
      culturalNotes: [],
      traditionalVariations: [],
      modernAdaptations: [],
    },
    nutritionalOptimization: {
      alchemicalNutrition: {
        spiritNutrients: [],
        essenceNutrients: [],
        matterNutrients: [],
        substanceNutrients: [],
      },
      elementalNutrition: recipe.elementalProperties,
      kalchmNutritionalBalance: 0.5,
      monicaNutritionalHarmony: 0.5,
    },
  } as MonicaOptimizedRecipe;
}

// ===== DIETARY FILTER HELPERS =====

/**
 * Check if a recipe satisfies all dietary restrictions.
 */
function matchesDietaryRestrictions(
  recipe: Recipe,
  restrictions: string[],
): boolean {
  for (const restriction of restrictions) {
    const r = restriction.toLowerCase();
    if (r === "vegetarian" && !recipe.isVegetarian) return false;
    if (r === "vegan" && !recipe.isVegan) return false;
    if (r === "gluten-free" && !recipe.isGlutenFree) return false;
    if (r === "dairy-free" && !recipe.isDairyFree) return false;
    if (r === "nut-free" && !recipe.isNutFree) return false;
    if (r === "low-carb" && !recipe.isLowCarb) return false;
    if (r === "keto" && !recipe.isKeto) return false;
    if (r === "paleo" && !recipe.isPaleo) return false;
  }
  return true;
}

/**
 * Check if a recipe contains any excluded ingredients.
 */
function containsExcludedIngredient(
  recipe: Recipe,
  excludeIngredients: string[],
): boolean {
  if (excludeIngredients.length === 0) return false;
  const excluded = new Set(excludeIngredients.map((i) => i.toLowerCase()));
  return recipe.ingredients.some((ing) => {
    const name = (typeof ing === "string" ? ing : ing.name ?? "").toLowerCase();
    return excluded.has(name) || [...excluded].some((e) => name.includes(e));
  });
}

/**
 * Get the primary protein from a recipe's ingredients.
 */
function getPrimaryProtein(recipe: Recipe): string | undefined {
  const proteinIng = recipe.ingredients?.find(
    (ing: any) => ing.category === "protein",
  );
  return proteinIng ? (proteinIng as any).name?.toLowerCase() : undefined;
}

/**
 * Search for recipes from the curated database appropriate for a specific day and meal type.
 * Filters by meal type, season, dietary restrictions, and weekly context,
 * then scores by planetary/elemental alignment and cuisine match.
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
    existingMeals?: Array<{
      recipeId: string;
      recipeName: string;
      cuisine?: string;
      primaryProtein?: string;
    }>;
    budgetPerMeal?: number;
    maxPrepTimeMinutes?: number | null;
  },
): Promise<MonicaOptimizedRecipe[]> {
  try {
    logger.debug("Searching recipes from database", {
      planet: dayChar.planet,
      mealType,
      recommendedCuisines: dayChar.recommendedCuisines,
    });

    // Pull the prebuilt mealType × season index rather than scanning all
    // 351 recipes on every generation request. The `recipes` variable is
    // kept around for the relaxed-filter fallback paths below.
    const recipeIndex = await getServerRecipeIndex();
    const allRecipes = await getServerRecipes();
    const recipes = allRecipes as unknown as IndexedRecipe[];
    const currentSeason = getCurrentSeason();
    const existingMeals = options.existingMeals || [];
    const existingRecipeIds = new Set(existingMeals.map((m) => m.recipeId));
    const existingCuisines = existingMeals
      .map((m) => m.cuisine?.toLowerCase())
      .filter(Boolean) as string[];
    const existingProteins = existingMeals
      .map((m) => m.primaryProtein?.toLowerCase())
      .filter(Boolean) as string[];

    const planetProfile =
      PLANET_CULINARY_PROFILES[dayChar.planet] ||
      PLANET_CULINARY_PROFILES["Sun"];

    // ── Step 1: Filter pipeline ──
    //
    // Start from the `${mealType}-${season}` bucket (+ season-agnostic
    // "all" bucket) in the prebuilt index instead of scanning every recipe.
    const primaryBucket = recipeIndex.get(`${mealType}-${currentSeason}`) ?? [];
    const allSeasonBucket = recipeIndex.get(`${mealType}-all`) ?? [];
    const seed: IndexedRecipe[] = [];
    const seedSeen = new Set<string>();
    for (const r of primaryBucket) {
      if (r.id && !seedSeen.has(r.id)) {
        seed.push(r);
        seedSeen.add(r.id);
      }
    }
    for (const r of allSeasonBucket) {
      if (r.id && !seedSeen.has(r.id)) {
        seed.push(r);
        seedSeen.add(r.id);
      }
    }

    let candidates = seed.filter((recipe) => {
      // Hard-exclude recipes already in the weekly plan
      if (existingRecipeIds.has(recipe.id)) return false;

      // Dietary restrictions
      if (
        options.dietaryRestrictions.length > 0 &&
        !matchesDietaryRestrictions(recipe, options.dietaryRestrictions)
      )
        return false;

      // Excluded ingredients
      if (containsExcludedIngredient(recipe, options.excludeIngredients))
        return false;

      // Required ingredients (if specified, must contain at least one)
      if (options.requiredIngredients && options.requiredIngredients.length > 0) {
        const required = options.requiredIngredients.map((i) => i.toLowerCase());
        const recipeIngNames = recipe.ingredients.map((ing) =>
          (typeof ing === "string" ? ing : ing.name ?? "").toLowerCase(),
        );
        const hasRequired = required.some((req) =>
          recipeIngNames.some((name) => name.includes(req)),
        );
        if (!hasRequired) return false;
      }

      // Max prep time filter
      if (options.maxPrepTimeMinutes) {
        const maxTime = options.maxPrepTimeMinutes;
        const recipeTime = (recipe as any).prepTime
          || parseInt(String((recipe as any).timeToMake || "0"), 10)
          || 0;
        if (recipeTime > 0 && recipeTime > maxTime) return false;
      }

      return true;
    });

    // ── Step 2: Progressive fallback if filters are too restrictive ──

    if (candidates.length === 0) {
      // Relax: drop season filter (scan any season for this meal type)
      candidates = recipes.filter((recipe) => {
        if (existingRecipeIds.has(recipe.id)) return false;
        if (!isSuitableForMealType(recipe, mealType)) return false;
        if (
          options.dietaryRestrictions.length > 0 &&
          !matchesDietaryRestrictions(recipe, options.dietaryRestrictions)
        )
          return false;
        if (containsExcludedIngredient(recipe, options.excludeIngredients))
          return false;
        return true;
      });
    }

    if (candidates.length === 0) {
      // Relax further: drop meal type filter, keep dietary only
      candidates = recipes.filter((recipe) => {
        if (existingRecipeIds.has(recipe.id)) return false;
        if (
          options.dietaryRestrictions.length > 0 &&
          !matchesDietaryRestrictions(recipe, options.dietaryRestrictions)
        )
          return false;
        return true;
      });
    }

    if (candidates.length === 0) {
      logger.warn("No recipes found even after relaxing all filters");
      return [];
    }

    // ── Step 3: Score each candidate ──

    const recommendedCuisinesLower = dayChar.recommendedCuisines.map((c) =>
      c.toLowerCase(),
    );
    const preferredCuisinesLower = options.preferredCuisines.map((c) =>
      c.toLowerCase(),
    );

    // Precompute lowercased planetary cooking methods once per call rather
    // than once per candidate-per-method inside the inner loops.
    const planetCookingMethodsLc = planetProfile.cookingMethods.map((pm) =>
      pm.toLowerCase(),
    );
    const preferredCookingMethodsLc = (options.preferredCookingMethods ?? []).map(
      (pm) => pm.toLowerCase(),
    );
    const budget = options.budgetPerMeal;
    const budgetEnabled = typeof budget === "number" && budget > 0;

    const scored = candidates.map((recipe) => {
      let score = 0;

      // Elemental alignment (weight: 0.4)
      if (recipe.elementalProperties) {
        const elementalScore = calculateDayFoodCompatibility(
          dayChar,
          recipe.elementalProperties,
        );
        score += elementalScore * 0.4;
      }

      // Cuisine match with day's recommended cuisines (weight: 0.2)
      const recipeCuisine = recipe._lcCuisine ?? recipe.cuisine?.toLowerCase() ?? "";
      if (
        recipeCuisine &&
        recommendedCuisinesLower.some(
          (c) => recipeCuisine.includes(c) || c.includes(recipeCuisine),
        )
      ) {
        score += 0.2;
      }

      // Cooking method alignment with planetary profile (weight: 0.15)
      const lcCookingMethods = recipe._lcCookingMethod;
      if (lcCookingMethods && lcCookingMethods.length > 0) {
        const methodMatch = lcCookingMethods.some((m) =>
          planetCookingMethodsLc.some((pm) => m.includes(pm)),
        );
        if (methodMatch) score += 0.15;
      }

      // Preferred cuisine match (weight: 0.1)
      if (
        recipeCuisine &&
        preferredCuisinesLower.length > 0 &&
        preferredCuisinesLower.some(
          (c) => recipeCuisine.includes(c) || c.includes(recipeCuisine),
        )
      ) {
        score += 0.1;
      }

      // Preferred cooking methods match (weight: 0.05)
      if (
        preferredCookingMethodsLc.length > 0 &&
        lcCookingMethods &&
        lcCookingMethods.some((m) =>
          preferredCookingMethodsLc.some((pm) => m.includes(pm)),
        )
      ) {
        score += 0.05;
      }

      // Weekly variety penalties
      // Same cuisine as existing meal: -0.15
      if (
        recipeCuisine &&
        existingCuisines.some(
          (c) => recipeCuisine.includes(c) || c.includes(recipeCuisine),
        )
      ) {
        score -= 0.15;
      }

      // Same primary protein as existing meal: -0.10
      const protein = getPrimaryProtein(recipe);
      if (protein && existingProteins.includes(protein)) {
        score -= 0.10;
      }

      // ── Budget-aware scoring (weight: ±0.2) ──
      // Early return when no budget is set — avoids the per-recipe call to
      // `calculateRecipeEstimatedCost`, which is the hottest branch in this
      // loop when pricing is enabled.
      let costPerServing = 0;
      if (budgetEnabled) {
        const ingredients = recipe.ingredients.map((ing: any) => ({
          name: typeof ing === "string" ? ing : ing.name ?? "",
          amount: typeof ing === "string" ? 1 : ing.amount ?? 1,
          unit: typeof ing === "string" ? "each" : ing.unit ?? "each",
          category: typeof ing === "string" ? undefined : ing.category,
          optional: typeof ing === "string" ? false : ing.optional,
        }));
        const estimate = calculateRecipeEstimatedCost(
          ingredients,
          (recipe as { servings?: number }).servings ?? 4,
        );
        costPerServing = estimate.costPerServing;

        const budgetRatio = costPerServing / (budget);

        if (budgetRatio > 1.5) {
          // Way over budget → heavy penalty
          score -= 0.25;
        } else if (budgetRatio > 1.0) {
          // Slightly over budget → moderate penalty
          score -= (0.15 * (budgetRatio - 1.0)) / 0.5;
        } else if (budgetRatio < 0.6) {
          // Well under budget → bonus for value
          const nutrition =
            (recipe as any).nutrition ??
            (recipe as any).nutritionalProfile;
          const bfb = calculateBangForBuck(nutrition, costPerServing);
          score += Math.min(0.2, bfb.score / 500);
        }
      }

      return { recipe, score, protein, costPerServing };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // ── Step 4: Greedy diversity-aware selection ──

    const selected: MonicaOptimizedRecipe[] = [];
    const selectedProteins = new Set<string>();
    const selectedCuisines = new Set<string>();
    const maxCandidates = 6;

    for (const entry of scored) {
      if (selected.length >= maxCandidates) break;

      const recipeCuisine =
        entry.recipe._lcCuisine ?? entry.recipe.cuisine?.toLowerCase() ?? "";
      const recipeProtein = entry.protein || "";

      // Prefer recipes that don't duplicate protein or cuisine within this batch
      if (recipeProtein && selectedProteins.has(recipeProtein)) continue;
      if (recipeCuisine && selectedCuisines.has(recipeCuisine)) continue;

      if (recipeProtein) selectedProteins.add(recipeProtein);
      if (recipeCuisine) selectedCuisines.add(recipeCuisine);
      selected.push(adaptRecipeToMonicaOptimized(entry.recipe));
    }

    // Fill remaining slots if diversity constraints were too strict
    if (selected.length < maxCandidates) {
      for (const entry of scored) {
        if (selected.length >= maxCandidates) break;
        if (selected.some((s) => s.id === entry.recipe.id)) continue;
        selected.push(adaptRecipeToMonicaOptimized(entry.recipe));
      }
    }

    logger.info(
      `Selected ${selected.length} database recipes for ${mealType} on ${dayChar.planet} day`,
    );

    return selected;
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
  nutritionalContext?: DayRecommendationOptions["nutritionalContext"],
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

    // 2a. Indexed cuisine signature boost.
    // Only applies when the cuisine's dominant element matches the day's
    // dominant element — i.e. the statistical signature of the cuisine is
    // actually in phase with today's planetary mood. Capped at +0.1 so it
    // never dominates the weighted sum.
    const cuisineDominant = getDominantElementForCuisine(recipe.cuisine);
    if (cuisineDominant && cuisineDominant === dayChar.element) {
      const entry = getCuisineEntry(recipe.cuisine);
      const signatureCount = entry?.signatures?.length ?? 0;
      if (signatureCount > 0) {
        const boost = Math.min(0.1, 0.03 + signatureCount * 0.015);
        score += boost;
        reasons.push(
          `${recipe.cuisine} statistically favours ${cuisineDominant} (${signatureCount} signature${signatureCount === 1 ? "" : "s"})`,
        );
      }
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

  // 4. Meal type appropriateness
  const mealTypeScore = isSuitableForMealType(recipe, mealType) ? 1.0 : 0.5;
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

  // 7. Nutritional gap scoring — boost recipes that fill current deficits
  if (nutritionalContext) {
    const nutrition = recipe.nutrition as Record<string, number | undefined> | undefined;
    if (nutrition) {
      let gapScore = 0;
      const gapReasons: string[] = [];

      // Protein gap filling
      const recipeProtein = nutrition.protein ?? 0;
      if (nutritionalContext.prioritizeProtein && recipeProtein >= 15) {
        gapScore += 0.15;
        gapReasons.push("High protein — fills nutritional priority");
      } else if (nutritionalContext.remainingProteinG && nutritionalContext.remainingProteinG > 10 && recipeProtein >= 12) {
        gapScore += 0.08;
        gapReasons.push("Good protein content for daily target");
      }

      // Fiber gap filling
      const recipeFiber = nutrition.fiber ?? 0;
      if (nutritionalContext.prioritizeFiber && recipeFiber >= 5) {
        gapScore += 0.12;
        gapReasons.push("High fiber — fills nutritional priority");
      } else if (nutritionalContext.remainingFiberG && nutritionalContext.remainingFiberG > 5 && recipeFiber >= 4) {
        gapScore += 0.06;
        gapReasons.push("Good fiber for daily target");
      }

      // Calorie alignment (prefer recipes that fit within remaining budget)
      const recipeCals = nutrition.calories ?? 0;
      if (nutritionalContext.remainingCalories && recipeCals > 0) {
        const mealBudget = nutritionalContext.remainingCalories / 3; // split across remaining meals
        if (recipeCals <= mealBudget * 1.15 && recipeCals >= mealBudget * 0.5) {
          gapScore += 0.06;
          gapReasons.push("Calories align with remaining daily budget");
        }
      }

      score += gapScore;
      reasons.push(...gapReasons);
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
  _astroState: AstrologicalState,
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
