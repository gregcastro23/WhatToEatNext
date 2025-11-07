import type { Recipe } from "@/types/recipe";
import type { AstrologicalState, ElementalProperties } from "../../types";

// Re-export types and functions from ingredient recommendation
export type {
  EnhancedIngredient,
  GroupedIngredientRecommendations,
  IngredientRecommendation,
  RecommendationOptions,
} from "./ingredientRecommendation";

export {
  calculateElementalInfluences,
  _formatFactorName,
  getAllIngredients,
  getIngredientRecommendations,
  getRecommendedIngredients,
  _getTopIngredientMatches,
  recommendIngredients,
} from "./ingredientRecommendation";

// ===== TYPES AND INTERFACES =====

type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Anytime";
type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
interface TimeFactors {
  season: Season;
  weekDay: WeekDay;
  mealType: MealType;
  isDaytime: boolean;
}

interface RecommendationScore {
  recipe: Recipe;
  score: number;
  reasons: string[];
}

interface RecommendationExplanation {
  recipe: Recipe;
  explanation: string;
}

// ===== CORE RECOMMENDATION ENGINE =====

/**
 * Calculate recommendation score for a recipe based on astrological state and time factors
 */
export function calculateRecommendationScore(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors,
): number {
  let totalScore = 0;
  let weightSum = 0;

  // Elemental compatibility (40% weight)
  const elementalWeight = 0.4;
  const elementalScore = calculateElementalScore(
    recipe,
    astrologicalState.dominantElement as any,
  );
  totalScore += elementalScore * elementalWeight;
  weightSum += elementalWeight;

  // Planetary compatibility (25% weight)
  const planetaryWeight = 0.25;
  const planetaryScore = calculatePlanetaryScore(
    recipe,
    astrologicalState.activePlanets?.[0] as PlanetName,
  );
  totalScore += planetaryScore * planetaryWeight;
  weightSum += planetaryWeight;

  // Seasonal compatibility (15% weight)
  const seasonalWeight = 0.15;
  const seasonalScore = calculateSeasonalScore(recipe, timeFactors.season);
  totalScore += seasonalScore * seasonalWeight;
  weightSum += seasonalWeight;

  // Weekday compatibility (10% weight)
  const weekdayWeight = 0.1;
  const weekdayScore = calculateWeekdayScore(recipe, timeFactors.weekDay);
  totalScore += weekdayScore * weekdayWeight;
  weightSum += weekdayWeight;

  // Meal type compatibility (10% weight)
  const mealTypeWeight = 0.1;
  const mealTypeScore = calculateMealTypeScore(recipe, timeFactors.mealType);
  totalScore += mealTypeScore * mealTypeWeight;
  weightSum += mealTypeWeight;

  return weightSum > 0 ? totalScore / weightSum : 0.5;
}

/**
 * Get recommended recipes based on astrological state
 */
export function getRecommendedRecipes(
  recipes: Recipe[],
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors = getTimeFactors(),
  count = 3,
): Recipe[] {
  const scoredRecipes = (recipes || []).map((recipe) => ({
    recipe,
    score: calculateRecommendationScore(recipe, astrologicalState, timeFactors),
  }));

  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.recipe);
}

/**
 * Explain why a recipe was recommended
 */
export function explainRecommendation(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors = getTimeFactors(),
): string {
  const explanations: string[] = [];

  // Elemental explanation
  if (astrologicalState.dominantElement && recipe.elementalState) {
    const elementValue =
      recipe.elementalState[astrologicalState.dominantElement as any] || 0;
    if (elementValue > 0.3) {
      explanations.push(
        `Strong ${astrologicalState.dominantElement} element alignment`,
      );
    }
  }

  // Planetary explanation
  if (
    astrologicalState.activePlanets &&
    astrologicalState.activePlanets.length > 0
  ) {
    const activePlanet = astrologicalState.activePlanets[0];
    explanations.push(`Harmonizes with ${activePlanet} energy`);
  }

  // Seasonal explanation
  if (
    recipe.season &&
    Array.isArray(recipe.season) &&
    recipe.season.includes(timeFactors.season)
  ) {
    explanations.push(`Perfect for ${timeFactors.season} season`);
  }

  // Meal type explanation
  if (
    recipe.mealType &&
    Array.isArray(recipe.mealType) &&
    recipe.mealType.includes(timeFactors.mealType)
  ) {
    explanations.push(`Ideal for ${timeFactors.mealType.toLowerCase()}`);
  }

  return explanations.length > 0
    ? `This recipe is recommended because it ${explanations.join(", ")}.`
    : "This recipe provides balanced elemental properties for your current astrological state.";
}

// ===== SCORING FUNCTIONS =====

function calculateElementalScore(
  recipe: Recipe,
  userElement?: Element,
): number {
  if (!recipe.elementalState || !userElement) return 0.5;
  const recipeElementValue = recipe.elementalState[userElement as unknown] || 0;
  // Higher values indicate better compatibility (following elemental principles)
  return Math.min(1, 0.3 + recipeElementValue * 0.7);
}

function calculatePlanetaryScore(
  recipe: Recipe,
  planetName?: PlanetName,
): number {
  if (!recipe.astrologicalPropertiesInfluences || !planetName) return 0.5;
  // Apply Pattern, H: Safe unknown type array casting
  const planetaryMatch = safeSome(
    recipe.astrologicalPropertiesInfluences as unknown[],
    (influence) => {
      // Apply surgical type casting with variable extraction
      const influenceData = influence as any;
      const influenceLower = String(influenceData).toLowerCase();
      const planetNameLower = planetName.toLowerCase();

      return influenceLower.includes(planetNameLower);
    },
  );
  return planetaryMatch ? 0.8 : 0.4;
}

function calculateSeasonalScore(recipe: Recipe, season: Season): number {
  if (!recipe.season) return 0.6;

  // Apply Pattern, _I: Safe union type array casting
  const seasonMatch = safeSome(
    Array.isArray(recipe.season)
      ? recipe.season
      : ([recipe.season] as string[]),
    (recipeSeason) => recipeSeason.toLowerCase() === season.toLowerCase(),
  );
  return seasonMatch ? 0.9 : 0.4;
}

function calculateWeekdayScore(recipe: Recipe, day: WeekDay): number {
  // Simple weekday scoring - could be enhanced with more sophisticated logic
  const weekdayPreferences: Record<WeekDay, string[]> = {
    Monday: ["energizing", "fresh", "light"],
    Tuesday: ["strengthening", "protein-rich"],
    Wednesday: ["balanced", "versatile"],
    Thursday: ["abundant", "satisfying"],
    Friday: ["celebratory", "indulgent"],
    Saturday: ["comfort", "hearty"],
    Sunday: ["nourishing", "traditional"],
  };

  const dayPreferences = weekdayPreferences[day] || [];
  const recipeQualities = recipe.qualities || [];

  const matches = safeFilter(dayPreferences, (pref) =>
    // Apply Pattern, H: Safe unknown type array casting
    safeSome(recipeQualities as unknown[], (quality) =>
      String(quality).toLowerCase().includes(pref),
    ),
  );

  return Math.min(1, 0.5 + ((matches as any)?.length || 0) * 0.2);
}

function calculateMealTypeScore(recipe: Recipe, mealType: MealType): number {
  if (!recipe.mealType) return 0.6;

  const mealTypeMatch = safeSome(
    Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType],
    (recipeMealType) => recipeMealType.toLowerCase() === mealType.toLowerCase(),
  );
  return mealTypeMatch ? 0.9 : 0.3;
}

function _calculateZodiacScore(recipe: Recipe, sunSign: any): number {
  if (!recipe.astrologicalPropertiesInfluences) return 0.5;

  // Apply Pattern, H: Safe unknown type array casting
  // Check if recipe has zodiac-specific influences
  const zodiacMatch = safeSome(
    recipe.astrologicalPropertiesInfluences as unknown[],
    (influence) => {
      // Apply surgical type casting with variable extraction
      const influenceDataZodiac = influence as any;
      const influenceLowerZodiac = String(influenceDataZodiac).toLowerCase();
      const sunSignLower = sunSign.toLowerCase();

      return influenceLowerZodiac.includes(sunSignLower);
    },
  );

  if (zodiacMatch) return 0.8;
  // Check elemental compatibility with zodiac sign
  const zodiacElement = getZodiacElement(sunSign);
  if (zodiacElement && recipe.elementalState) {
    const elementValue = recipe.elementalState[zodiacElement as any] || 0;
    return Math.min(1, 0.4 + elementValue * 0.4);
  }

  return 0.5;
}

// ===== UTILITY FUNCTIONS =====

// Safe array operations to handle undefined/null arrays
function safeSome<T>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean,
): boolean {
  return Array.isArray(array) ? array.some(predicate) : false;
}

function safeFilter<T>(
  array: T[] | undefined | null,
  predicate: (item: T) => boolean,
): T[] {
  return Array.isArray(array) ? array.filter(predicate) : [];
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring" as Season;
  if (month >= 5 && month <= 7) return "summer" as Season;
  if (month >= 8 && month <= 10) return "fall" as Season;
  return "winter" as Season;
}

function getZodiacElement(sign: any): Element | null {
  const fireSigns = ["aries", "leo", "sagittarius"];
  const earthSigns = ["taurus", "virgo", "capricorn"];
  const airSigns = ["gemini", "libra", "aquarius"];
  const waterSigns = ["cancer", "scorpio", "pisces"];

  const signLower = sign.toLowerCase();

  if (fireSigns.includes(signLower)) return "Fire" as Element;
  if (earthSigns.includes(signLower)) return "Earth" as Element;
  if (airSigns.includes(signLower)) return "Air" as Element;
  if (waterSigns.includes(signLower)) return "Water" as Element;

  return null;
}

function getTimeFactors(): TimeFactors {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Determine meal type based on time
  let mealType: MealType = "Anytime";
  if (hour >= 6 && hour < 11) mealType = "Breakfast";
  else if (hour >= 11 && hour < 16) mealType = "Lunch";
  else if (hour >= 16 && hour < 22) mealType = "Dinner";
  else mealType = "Snack";

  // Map day of week
  const weekDays: WeekDay[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekDay = weekDays[dayOfWeek];

  return {
    season: getCurrentSeason(),
    weekDay,
    mealType,
    isDaytime: hour >= 6 && hour < 18,
  };
}

// ===== ENHANCED RECOMMENDATION FUNCTIONS =====

/**
 * Get detailed recipe recommendations with explanations
 */
export function getDetailedRecipeRecommendations(
  recipes: Recipe[],
  astrologicalState: AstrologicalState,
  limit = 3,
): RecommendationExplanation[] {
  const timeFactors = getTimeFactors();
  const scoredRecipes: RecommendationScore[] = recipes.map((recipe) => {
    const score = calculateRecommendationScore(
      recipe,
      astrologicalState,
      timeFactors,
    );
    const reasons: string[] = [];

    // Collect reasons for the score
    if (astrologicalState.dominantElement && recipe.elementalState) {
      const elementValue =
        recipe.elementalState[astrologicalState.dominantElement as any] || 0;
      if (elementValue > 0.3) {
        reasons.push(`Strong ${astrologicalState.dominantElement} element`);
      }
    }

    if (
      recipe.season &&
      Array.isArray(recipe.season) &&
      recipe.season.includes(timeFactors.season)
    ) {
      reasons.push(`Seasonal match for ${timeFactors.season}`);
    }

    if (
      recipe.mealType &&
      Array.isArray(recipe.mealType) &&
      recipe.mealType.includes(timeFactors.mealType)
    ) {
      reasons.push(`Perfect for ${timeFactors.mealType.toLowerCase()}`);
    }

    return { recipe, score, reasons };
  });

  return scoredRecipes
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((scoredRecipe) => ({
      recipe: scoredRecipe.recipe,
      explanation: generateExplanation(scoredRecipe),
    }));
}

function generateExplanation(scoredRecipe: RecommendationScore): string {
  const { recipe, score, reasons } = scoredRecipe;

  let explanation = `${recipe.name} (${Math.round(score * 100)}% match)`;

  if (reasons.length > 0) {
    explanation += ` - ${reasons.join(", ")}`;
  }

  if (recipe.description) {
    explanation += `. ${recipe.description}`;
  }

  return explanation;
}

/**
 * Calculate elemental match between recipe and user preferences
 */
export function calculateElementalMatch(
  recipeElements: ElementalProperties,
  userElements: ElementalProperties,
): number {
  if (!recipeElements || !userElements) return 0.5;
  let totalMatch = 0;
  let elementCount = 0;

  Object.entries(recipeElements).forEach(([element, recipeValue]) => {
    const userValue = userElements[element as unknown] || 0;
    // Calculate compatibility (higher values for similar elements)
    const compatibility = 1 - Math.abs(recipeValue - userValue);
    totalMatch += compatibility;
    elementCount++;
  });

  return elementCount > 0 ? totalMatch / elementCount : 0.5;
}

/**
 * Get match score CSS class for styling
 */
export function getMatchScoreClass(score: number): string {
  if (score >= 0.8) return "match-excellent";
  if (score >= 0.6) return "match-good";
  if (score >= 0.4) return "match-fair";
  return "match-poor";
}

/**
 * Get match rating with stars and tooltip
 */
export function getMatchRating(score: number): {
  stars: string;
  tooltip;
  string;
} {
  if (score >= 0.9) {
    return { stars: "★★★★★", tooltip: "Excellent match - highly recommended" };
  } else if (score >= 0.7) {
    return { stars: "★★★★☆", tooltip: "Very good match - recommended" };
  } else if (score >= 0.5) {
    return { stars: "★★★☆☆", tooltip: "Good match - suitable" };
  } else if (score >= 0.3) {
    return { stars: "★★☆☆☆", tooltip: "Fair match - consider alternatives" };
  } else {
    return { stars: "★☆☆☆☆", tooltip: "Poor match - not recommended" };
  }
}

/**
 * Check if recipe is appropriate for current time of day
 */
export function isAppropriateForTimeOfDay(
  recipe: Recipe,
  timeOfDay: string,
): boolean {
  if (
    !recipe.mealType ||
    (Array.isArray(recipe.mealType) && recipe.mealType.length === 0)
  ) {
    return true; // If no meal type specified, assume it's appropriate anytime
  }

  const timeMapping: Record<string, string[]> = {
    morning: ["Breakfast"],
    afternoon: ["Lunch", "Snack"],
    evening: ["Dinner"],
    night: ["Snack"],
  };

  const appropriateMealTypes = timeMapping[timeOfDay.toLowerCase()] || [];

  return safeSome(
    Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType],
    (mealType) => appropriateMealTypes.includes(mealType),
  );
}

/**
 * Calculate recipe match score based on elemental state
 */
export function calculateRecipeMatchScore(
  recipe: Recipe,
  elementalState: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
    timeOfDay: string;
    season: string;
  },
): number {
  let score = 0;
  let factors = 0;

  // Elemental compatibility (60% weight)
  if (recipe.elementalState) {
    // Apply Pattern, J: Safe interface property extraction for ElementalProperties compatibility
    const userElementalProperties: ElementalProperties = {
      Fire: elementalState.Fire,
      Water: elementalState.Water,
      Earth: elementalState.Earth,
      Air: elementalState.Air,
    };
    // Apply Pattern, J: Safe type casting for recipe.elementalState
    const recipeElementalProperties =
      recipe.elementalState as unknown as ElementalProperties;
    const elementalMatch = calculateElementalMatch(
      recipeElementalProperties,
      userElementalProperties,
    );
    score += elementalMatch * 0.6;
    factors += 0.6;
  }

  // Time of day appropriateness (20% weight)
  if (isAppropriateForTimeOfDay(recipe, elementalState.timeOfDay)) {
    score += 0.8 * 0.2;
  } else {
    score += 0.3 * 0.2;
  }
  factors += 0.2;

  // Seasonal appropriateness (20% weight)
  if (
    recipe.season &&
    Array.isArray(recipe.season) &&
    recipe.season.includes(elementalState.season)
  ) {
    score += 0.9 * 0.2;
  } else {
    score += 0.5 * 0.2;
  }
  factors += 0.2;

  return factors > 0 ? score / factors : 0.5;
}

// ===== MODALITY FUNCTIONS =====

export function getModalityElementAffinity(
  modality: string,
  element: string,
): number {
  const modalityAffinities: Record<string, Record<string, number>> = {
    cardinal: { Fire: 0.9, Water: 0.8, Earth: 0.7, Air: 0.8 },
    fixed: { Fire: 0.8, Water: 0.9, Earth: 0.9, Air: 0.7 },
    mutable: { Fire: 0.7, Water: 0.8, Earth: 0.7, Air: 0.9 },
  };

  return modalityAffinities[modality.toLowerCase()][element] || 0.5;
}
