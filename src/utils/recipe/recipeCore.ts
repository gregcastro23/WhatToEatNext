import { AstrologicalState } from '@/types/alchemy';
import type { ZodiacSign } from '@/types/celestial';
import type { Recipe } from '@/types/recipe';
import type {
  PlanetaryDay,
  PlanetaryHour,
  Season,
  TimeFactors,
  TimeOfDay,
  WeekDay,
} from '@/types/time';

import {
  calculateDominantElement,
  calculateElementalCompatibility,
  calculateElementalProfile,
  getZodiacElementalInfluence,
} from '../astrologyUtils';
import { createLogger } from '../logger';

const logger = createLogger('RecipeCore');

// ===== RECIPE MATCHING UTILITIES =====

/**
 * Checks if a recipe is appropriate for the current time of day
 */
export function isAppropriateForTimeOfDay(recipe: Recipe, timeOfDay: string): boolean {
  const mealTypes = Array.isArray(recipe.mealType)
    ? recipe.mealType
    : typeof recipe.mealType === 'string'
      ? [recipe.mealType]
      : [];

  switch (timeOfDay) {
    case 'night':
    case 'evening':
      return (mealTypes || []).some(type =>
        ['dinner', 'supper', 'evening', 'all'].includes(type.toLowerCase()),
      );
    case 'morning':
      return (mealTypes || []).some(type =>
        ['breakfast', 'brunch', 'all'].includes(type.toLowerCase()),
      );
    case 'afternoon':
      return (mealTypes || []).some(type =>
        ['lunch', 'brunch', 'all'].includes(type.toLowerCase()),
      );
    default:
      return true;
  }
}

/**
 * Calculate how well a recipe's elemental properties match a target state
 */
export function calculateElementalMatch(
  recipeElements: { [key: string]: number },
  targetElements: { [key: string]: number },
): number {
  if (!recipeElements || !targetElements) return 0.6;

  let totalSimilarity = 0;
  let count = 0;

  // Only use the elemental properties
  const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;

  for (const element of elements) {
    if (
      typeof recipeElements[element] === 'number' &&
      typeof targetElements[element] === 'number'
    ) {
      const difference = Math.abs(recipeElements[element] - targetElements[element]);
      const similarity = 1 - difference;
      totalSimilarity += similarity;
      count++;
    }
  }

  return count > 0 ? totalSimilarity / count : 0.6;
}

/**
 * Calculate a comprehensive match score for a recipe based on elemental properties,
 * time of day, season, and nutritional balance
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
    currentSeason?: string;
  },
): number {
  if (!recipe.elementalState) return 0;
  if (!isAppropriateForTimeOfDay(recipe, elementalState.timeOfDay)) return 0;

  try {
    const baseScore = calculateElementalMatch(
      recipe.elementalState as { [key: string]: number },
      elementalState as { [key: string]: number },
    );
    let score = baseScore * 100;

    // Enhanced scoring factors
    const bonusFactors = {
      seasonMatch: 10, // Season matching bonus
      timeMatch: 15, // Perfect time of day match
      balancedNutrition: 8, // Well-balanced nutritional profile
      quickPrep: 5, // Quick preparation time bonus
      traditionalMatch: 7, // Traditional for the time/season
    };

    // Season matching with more nuanced scoring
    const seasons = Array.isArray(recipe.season)
      ? recipe.season
      : typeof recipe.season === 'string'
        ? [recipe.season]
        : [];

    // Perfect season match
    if ((seasons || []).some(s => s === elementalState.currentSeason)) {
      score += bonusFactors.seasonMatch;
    }
    // 'All' season partial bonus
    else if ((seasons || []).some(s => s.toLowerCase() === 'all')) {
      score += ((bonusFactors as any)?.seasonMatch || 0) * 0.2;
    }

    // Time of day matching with granular scoring
    const timeOfDay = elementalState.timeOfDay;
    const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];

    if (
      timeOfDay === 'morning' &&
      (Array.isArray(mealTypes) ? mealTypes.includes('breakfast') : mealTypes === 'breakfast')
    ) {
      score += bonusFactors.timeMatch;
    } else if (
      timeOfDay === 'afternoon' &&
      (Array.isArray(mealTypes) ? mealTypes.includes('lunch') : mealTypes === 'lunch')
    ) {
      score += bonusFactors.timeMatch;
    } else if (
      ['evening', 'night'].includes(timeOfDay) &&
      (Array.isArray(mealTypes) ? mealTypes.includes('dinner') : mealTypes === 'dinner')
    ) {
      score += bonusFactors.timeMatch;
    }

    // Nutrition assessment
    if (recipe.nutrition) {
      // Calculate nutrition ratios rather than absolute values
      const totalMacros =
        (recipe.nutrition.protein ?? 0) +
        (recipe.nutrition.carbs ?? 0) +
        (recipe.nutrition.fat ?? 0);

      if (totalMacros > 0) {
        const proteinRatio = (recipe.nutrition.protein ?? 0) / totalMacros;
        const carbsRatio = (recipe.nutrition.carbs ?? 0) / totalMacros;
        const fatRatio = (recipe.nutrition.fat ?? 0) / totalMacros;

        // Score based on how close ratios are to ideal targets
        const idealProtein = 0.25; // 25% as target
        const idealCarbs = 0.55; // 55% as target
        const idealFat = 0.2; // 20% as target

        const proteinDeviation = Math.abs(proteinRatio - idealProtein);
        const carbsDeviation = Math.abs(carbsRatio - idealCarbs);
        const fatDeviation = Math.abs(fatRatio - idealFat);

        // Lower deviation means better balance
        const totalDeviation = proteinDeviation + carbsDeviation + fatDeviation;
        const balanceScore = Math.max(0, bonusFactors.balancedNutrition * (1 - totalDeviation));

        score += balanceScore;
      }

      // Caloric appropriateness
      const calories = recipe.nutrition.calories ?? 0;
      const isAppropriateCalories =
        (timeOfDay === 'morning' && calories >= 300 && calories <= 500) ||
        (timeOfDay === 'afternoon' && calories >= 400 && calories <= 700) ||
        (timeOfDay === 'evening' && calories >= 400 && calories <= 800);

      if (isAppropriateCalories) {
        score += 5;
      }
    }

    // Preparation time bonus for quick meals during busy times
    const prepTime = parseInt(recipe.timeToMake || '0') || 0;
    if (prepTime <= 30) {
      score += bonusFactors.quickPrep;
    } else if (prepTime <= 45) {
      score += ((bonusFactors as any)?.quickPrep || 0) * 0.2;
    }

    // Traditional/Cultural appropriateness for time and season
    if (
      recipe.traditional_time_of_day === elementalState.timeOfDay ||
      recipe.traditional_season === elementalState.currentSeason
    ) {
      score += bonusFactors.traditionalMatch;
    }

    // Normalize score between 60 and 100
    return Math.min(100, Math.max(60, Math.round(score)));
  } catch (error) {
    logger.error(`Error scoring ${recipe.name}:`, error);
    return 0;
  }
}

/**
 * Generate a CSS class for match score visualization
 */
export function getMatchScoreClass(score: number): string {
  if (score >= 96)
    return 'bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow-sm';
  if (score >= 90)
    return 'bg-gradient-to-r from-green-400 to-green-300 text-green-900 font-bold shadow-sm';
  if (score >= 85) return 'bg-green-200 text-green-800 font-semibold';
  if (score >= 80) return 'bg-green-100 text-green-700 font-medium';
  if (score >= 75) return 'bg-yellow-200 text-yellow-800 font-medium';
  if (score >= 70) return 'bg-yellow-100 text-yellow-700';
  if (score >= 65) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

/**
 * Get match rating with stars and tooltip
 */
export function getMatchRating(score: number): { stars: string; tooltip: string } {
  if (score >= 95) {
    return { stars: '★★★★★', tooltip: 'Perfect match - highly recommended ?? undefined' };
  } else if (score >= 85) {
    return { stars: '★★★★☆', tooltip: 'Excellent match - great choice ?? undefined' };
  } else if (score >= 75) {
    return { stars: '★★★☆☆', tooltip: 'Good match - worth trying ?? undefined' };
  } else if (score >= 65) {
    return { stars: '★★☆☆☆', tooltip: 'FAir match - might work for you' };
  } else {
    return { stars: '★☆☆☆☆', tooltip: 'Poor match - consider other options' };
  }
}

// ===== RECIPE RECOMMENDATION INTERFACES =====

export interface RecommendationScore {
  recipe: Recipe;
  score: number;
  reasons: string[];
}

export interface RecommendationExplanation {
  recipe: Recipe;
  explanation: string;
}

// ===== RECIPE RECOMMENDATION ENGINE =====

/**
 * Get recommended recipes based on astrological state and time factors
 */
export function getRecommendedRecipes(
  recipes: Recipe[],
  astrologicalState: AstrologicalState,
  limit = 3,
): RecommendationExplanation[] {
  // Get current time factors to enhance recipe scoring
  const timeFactors = getTimeFactors();

  // Score each recipe
  const scoredRecipes: RecommendationScore[] = (recipes || []).map(recipe => {
    const { score, reasons } = scoreRecipe(recipe, astrologicalState, timeFactors);

    return {
      recipe,
      score,
      reasons,
    };
  });

  // Sort recipes by score (descending)
  const sortedRecipes = scoredRecipes.sort((a, b) => b.score - a.score);

  // Take top N recipes
  const topRecipes = sortedRecipes.slice(0, limit);

  // Generate human-readable explanations
  return (topRecipes || []).map(scoredRecipe => ({
    recipe: scoredRecipe.recipe,
    explanation: generateExplanation(scoredRecipe),
  }));
}

/**
 * Score a recipe based on astrological state and time factors
 */
function scoreRecipe(
  recipe: Recipe,
  astrologicalState: AstrologicalState,
  timeFactors: TimeFactors,
): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Time of day suitability
  const timeOfDay = timeFactors.timeOfDay;

  if (recipe.mealType) {
    const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];

    if (
      timeOfDay === 'Morning' &&
      (mealTypes || []).some(type => type.toLowerCase().includes('breakfast'))
    ) {
      score += 15;
      reasons.push(`Perfect for morning meals`);
    } else if (
      timeOfDay === 'Afternoon' &&
      (mealTypes || []).some(type => type.toLowerCase().includes('lunch'))
    ) {
      score += 15;
      reasons.push(`Ideal for lunch time`);
    } else if (
      timeOfDay === 'Evening' &&
      (mealTypes || []).some(type => type.toLowerCase().includes('dinner'))
    ) {
      score += 15;
      reasons.push(`Great dinner option`);
    }
  }

  // Season appropriateness
  const currentSeason = timeFactors.season;
  if (recipe.season) {
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];

    if ((seasons || []).some(season => season.toLowerCase() === currentSeason.toLowerCase())) {
      score += 15;
      reasons.push(`Perfect for ${currentSeason}`);
    }
  }

  // Planetary influences
  const isDaytimeNow = isDaytime(new Date());
  const planetaryDay = timeFactors.planetaryDay;
  const planetaryDayInfluence = calculatePlanetaryDayInfluence(recipe, planetaryDay.planet);
  const planetaryDayScore = planetaryDayInfluence.score;

  // Add reason if provided
  if (planetaryDayInfluence.reason) {
    reasons.push(planetaryDayInfluence.reason);
  }

  // Calculate planetary hour influence
  const planetaryHour = timeFactors.planetaryHour;
  const planetaryHourInfluence = calculatePlanetaryHourInfluence(
    recipe,
    planetaryHour.planet,
    isDaytimeNow,
  );
  const planetaryHourScore = planetaryHourInfluence.score;

  // Add reason if provided
  if (planetaryHourInfluence.reason) {
    reasons.push(planetaryHourInfluence.reason);
  }

  // Calculate elemental match score
  let elementalMatchScore = 0.5; // Default neutral score

  if (recipe.elementalState) {
    // Get the recipe's elemental profile
    const elementalProfile = calculateElementalProfile(astrologicalState, timeFactors);

    // Calculate elemental match
    let matchSum = 0;
    let weightSum = 0;

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const recipeValue = recipe.elementalState[element] || 0;
      const profileValue = elementalProfile[element];
      const weight = profileValue; // Weight by the strength of the element in current profile

      // Higher score for matching strong elements
      if (recipeValue > 0.3 && profileValue > 0.3) {
        matchSum += weight * 2;
      } else {
        matchSum += weight * (1 - Math.abs(recipeValue - profileValue));
      }

      weightSum += weight;
    }

    // Normalize match score (0-1)
    elementalMatchScore = weightSum > 0 ? matchSum / (weightSum || 1) : 0.5;

    if (elementalMatchScore > 0.7) {
      reasons.push(`Exceptional elemental compatibility with current conditions`);
    } else if (elementalMatchScore > 0.5) {
      reasons.push(`Good elemental compatibility with current conditions`);
    }
  }

  // Apply planetary / elemental score to total score
  // Weights: Elemental match (45%), Planetary day (35%), Planetary hour (20%)
  const planetaryElementalScore =
    elementalMatchScore * 0.45 + planetaryDayScore * 0.35 + planetaryHourScore * 0.2;

  // Convert to points (0-40 scale for this component)
  const planetaryPoints = Math.floor(planetaryElementalScore * 40);
  score += planetaryPoints;

  // Zodiac influences from Sun sign
  // Apply safe type casting for astrological state access
  const astrologicalData = astrologicalState as any;
  const sunSign = astrologicalData.sign || astrologicalData.sunSign;

  if (
    recipe.zodiacInfluences &&
    (Array.isArray(recipe.zodiacInfluences)
      ? recipe.zodiacInfluences.includes(sunSign as any)
      : recipe.zodiacInfluences === sunSign)
  ) {
    score += 12;
    reasons.push(`Aligned with your Sun sign (${sunSign})`);

    // Add zodiac elemental influence check
    const sunSignElement = getZodiacElementalInfluence(sunSign as any);

    if (recipe.elementalState && recipe.elementalState[sunSignElement] > 0.5) {
      score += 8;
      reasons.push(`Strong in ${sunSignElement} energy from your Sun sign`);
    }
  }

  // Moon sign influences
  const moonSign = astrologicalData.moonSign;
  if (
    moonSign &&
    recipe.zodiacInfluences &&
    (Array.isArray(recipe.zodiacInfluences)
      ? recipe.zodiacInfluences.includes(moonSign as any)
      : recipe.zodiacInfluences === moonSign)
  ) {
    score += 10;
    reasons.push(`Harmonious with your Moon sign (${moonSign})`);

    // Add zodiac elemental influence check for Moon sign
    const moonSignElement = getZodiacElementalInfluence(moonSign as any);

    if (recipe.elementalState && recipe.elementalState[moonSignElement] > 0.5) {
      score += 6;
      reasons.push(`Resonates with ${moonSignElement} energy from your Moon sign`);
    }
  }

  // Lunar phase alignment
  if (
    recipe.lunarPhaseInfluences &&
    astrologicalState.lunarPhase &&
    (Array.isArray(recipe.lunarPhaseInfluences)
      ? recipe.lunarPhaseInfluences.includes(astrologicalState.lunarPhase)
      : recipe.lunarPhaseInfluences === astrologicalState.lunarPhase)
  ) {
    score += 10;
    reasons.push(`In sync with the current lunar phase (${astrologicalState.lunarPhase})`);
  }

  // Elemental affinities with recipe's properties
  if (recipe.elementalState && astrologicalState.dominantElement) {
    const dominantElement = astrologicalState.dominantElement;
    const elementalValue = recipe.elementalState[dominantElement] || 0;

    if (elementalValue > 0.4) {
      const points = Math.floor(elementalValue * 20);
      score += points;
      reasons.push(`Strong in ${dominantElement} energy (${points} points)`);
    }
  }

  // Enhanced elemental compatibility calculation using new utilities
  if (recipe.elementalState) {
    // Calculate dominant element based on current time factors
    const calculatedDominantElement = calculateDominantElement(astrologicalState, timeFactors);

    // Get recipe's dominant element
    const recipeElements = Object.entries(recipe.elementalState)
      .sort((a, b) => b[1] - a[1])
      .map(([element]) => element as 'Fire' | 'Water' | 'Earth' | 'Air');

    const recipeDominantElement = recipeElements[0];

    // Calculate compatibility between recipe's element and current dominant element
    const compatibilityScore = calculateElementalCompatibility(
      recipeDominantElement,
      calculatedDominantElement,
    );

    const points = Math.floor(compatibilityScore * 15);
    score += points;

    if (compatibilityScore > 0.7) {
      reasons.push(
        `Excellent elemental compatibility between recipe (${recipeDominantElement}) and current influences (${calculatedDominantElement})`,
      );
    } else if (compatibilityScore > 0.4) {
      reasons.push(`Good elemental compatibility between recipe and current influences`);
    }
  }

  // Preparation time consideration - adjust score based on time available in planetary hour
  if (recipe.timeToMake) {
    let prepTime = 0;
    // Extract preparation time in minutes from the recipe
    const timeMatch = recipe.timeToMake.match(/(\d+)\s*min/);

    if (timeMatch) {
      prepTime = parseInt(timeMatch[1], 10);
    } else {
      // If there's no explicit "min" pattern, try to parse just a number
      const justNumberMatch = recipe.timeToMake.match(/(\d+)/);

      if (justNumberMatch) {
        prepTime = parseInt(justNumberMatch[1], 10);
      }
    }

    // Calculate time remaining in current planetary hour (approximation)
    const now = new Date();
    const minutes = now.getMinutes();
    const minutesRemaining = 60 - minutes;

    // Adjust score based on whether recipe can be completed in current planetary hour
    if (prepTime <= minutesRemaining) {
      score += 5;
      reasons.push(`Can be prepared within this planetary hour`);
    } else if (prepTime > 120) {
      score -= 5;
      reasons.push(`Lengthy preparation time`);
    }
  }

  return { score, reasons };
}

/**
 * Generate a human-readable explanation for why a recipe is recommended
 */
function generateExplanation(scoredRecipe: RecommendationScore): string {
  const { recipe, score, reasons } = scoredRecipe;

  // Start with a positive introduction based on the score
  let explanation = '';

  if (score >= 90) {
    explanation = `${recipe.name} is a perfect choice right now ?? undefined `;
  } else if (score >= 75) {
    explanation = `${recipe.name} is highly recommended at this time. `;
  } else if (score >= 60) {
    explanation = `${recipe.name} would be a good option now. `;
  } else {
    explanation = `${recipe.name} is worth considering. `;
  }

  // Add the top 3 reasons (or all if less than 3)
  const topReasons = reasons.slice(0, 3);

  if ((topReasons || []).length > 0) {
    explanation += topReasons.join('. ') + '.';
  }

  return explanation;
}

/**
 * Helper function to determine if it's currently daytime (6 AM to 6 PM)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 18; // Simple daytime check (6 AM to 6 PM)
}

/**
 * Calculate planetary day influence on a recipe
 * The day's ruling planet contributes BOTH its diurnal and nocturnal elements all day
 */
function calculatePlanetaryDayInfluence(
  recipe: Recipe,
  planetaryDay: string,
): { score: number; reason?: string } {
  // Planetary day associations with cooking styles and ingredients
  const planetaryAssociations: Record<
    string,
    {
      styles: string[];
      ingredients: string[];
      flavor: string;
    }
  > = {
    Sun: {
      styles: ['roasting', 'grilling', 'baking'],
      ingredients: ['citrus', 'sunflower', 'saffron', 'cinnamon', 'honey'],
      flavor: 'bright and vibrant',
    },
    moon: {
      styles: ['steaming', 'poaching', 'simmering'],
      ingredients: ['dairy', 'coconut', 'cucumber', 'mushroom', 'vanilla'],
      flavor: 'subtle and soothing',
    },
    Mars: {
      styles: ['frying', 'searing', 'spicy'],
      ingredients: ['peppers', 'garlic', 'onion', 'red meat', 'ginger'],
      flavor: 'bold and spicy',
    },
    Mercury: {
      styles: ['stir-frying', 'quick cooking', 'diverse'],
      ingredients: ['seeds', 'nuts', 'herbs', 'leafy greens', 'berries'],
      flavor: 'complex and varied',
    },
    Jupiter: {
      styles: ['slow cooking', 'feasting', 'abundance'],
      ingredients: ['fruits', 'rich meats', 'wine', 'sage', 'nutmeg'],
      flavor: 'generous and expansive',
    },
    Venus: {
      styles: ['sweet', 'artistic', 'delicate'],
      ingredients: ['berries', 'flowers', 'chocolate', 'honey', 'butter'],
      flavor: 'sweet and pleasing',
    },
    Saturn: {
      styles: ['traditional', 'preserved', 'aged'],
      ingredients: ['root vegetables', 'beans', 'aged cheese', 'dried fruits'],
      flavor: 'structured and grounding',
    },
  };

  // Get the associations for the current planetary day
  const associations = planetaryAssociations[planetaryDay];
  if (!associations) return { score: 0.5 }; // Unknown planet

  // Check for cooking style matches
  let styleMatch = false;
  if (recipe.cookingMethod) {
    const cookingMethodStr = recipe.cookingMethod as unknown as any;
    if (typeof cookingMethodStr === 'string') {
      for (const style of associations.styles) {
        if (String(cookingMethodStr).toLowerCase().includes(style.toLowerCase())) {
          styleMatch = true;
          break;
        }
      }
    }
  }

  // Check for ingredient matches with enhanced type safety
  let ingredientMatch = false;
  if (recipe.ingredients) {
    // Apply safe type casting for ingredients access
    const ingredientsData = recipe.ingredients as unknown as any;
    let ingredientText = '';

    if (Array.isArray(ingredientsData)) {
      // Handle array of ingredients
      ingredientText = ingredientsData
        .map(ingredient => {
          if (typeof ingredient === 'string') {
            return ingredient.toLowerCase();
          } else if (ingredient && typeof ingredient === 'object' && (ingredient as any).name) {
            return String((ingredient as any).name).toLowerCase();
          }
          return '';
        })
        .join(' ');
    } else if (typeof ingredientsData === 'string') {
      // Handle string ingredients
      ingredientText = String(ingredientsData).toLowerCase();
    }

    for (const ingredient of associations.ingredients) {
      if (ingredientText.includes(ingredient.toLowerCase())) {
        ingredientMatch = true;
        break;
      }
    }
  }

  // Calculate score based on matches
  let score = 0.5; // Base score
  if (styleMatch && ingredientMatch) {
    score = 0.9; // Perfect match
  } else if (styleMatch || ingredientMatch) {
    score = 0.7; // Partial match
  }

  // Generate reason based on score
  let reason: string | undefined;
  if (score >= 0.9) {
    reason = `Perfect for ${planetaryDay}'s day with its ${associations.flavor} qualities`;
  } else if (score >= 0.7) {
    reason = `Harmonizes well with ${planetaryDay}'s energy`;
  }

  return { score, reason };
}

/**
 * Calculate planetary hour influence on a recipe
 * Planetary hour influences are more subtle than daily influences
 */
function calculatePlanetaryHourInfluence(
  recipe: Recipe,
  planetaryHour: string,
  isDaytimeNow: boolean,
): { score: number; reason?: string } {
  // Planetary hour associations with cooking qualities
  const hourlyAssociations: Record<
    string,
    {
      daytime: string[];
      nighttime: string[];
      flavor: string;
    }
  > = {
    Sun: {
      daytime: ['energizing', 'warming', 'bright'],
      nighttime: ['comforting', 'golden', 'radiant'],
      flavor: 'invigorating',
    },
    moon: {
      daytime: ['cooling', 'refreshing', 'hydrating'],
      nighttime: ['soothing', 'calming', 'comforting'],
      flavor: 'nurturing',
    },
    Mars: {
      daytime: ['stimulating', 'spicy', 'lively'],
      nighttime: ['warming', 'passionate', 'deep'],
      flavor: 'energetic',
    },
    Mercury: {
      daytime: ['light', 'varied', 'clever'],
      nighttime: ['thoughtful', 'diverse', 'balanced'],
      flavor: 'stimulating',
    },
    Jupiter: {
      daytime: ['abundant', 'expansive', 'celebratory'],
      nighttime: ['rich', 'festive', 'indulgent'],
      flavor: 'abundant',
    },
    Venus: {
      daytime: ['beautiful', 'harmonious', 'balanced'],
      nighttime: ['sensual', 'sweet', 'indulgent'],
      flavor: 'pleasing',
    },
    Saturn: {
      daytime: ['structured', 'traditional', 'disciplined'],
      nighttime: ['grounding', 'earthy', 'practical'],
      flavor: 'satisfying',
    },
  };

  // Get the associations for the current planetary hour
  const associations = hourlyAssociations[planetaryHour];
  if (!associations) return { score: 0.5 }; // Unknown planet

  // Choose appropriate qualities based on day or night
  const qualities = isDaytimeNow ? associations.daytime : associations.nighttime;

  // Check for quality matches in recipe
  let matchCount = 0;
  const recipeText = JSON.stringify(recipe).toLowerCase();

  for (const quality of qualities) {
    if (recipeText.includes(quality.toLowerCase())) {
      matchCount++;
    }
  }

  // Calculate score based on matches
  let score = 0.5; // Base score
  if (matchCount >= 2) {
    score = 0.8; // Strong match
  } else if (matchCount === 1) {
    score = 0.65; // Partial match
  }

  // Generate reason based on score
  let reason: string | undefined;
  if (score >= 0.8) {
    reason = `Excellent choice for the current ${planetaryHour} hour with its ${associations.flavor} qualities`;
  } else if (score >= 0.65) {
    reason = `Complements the ${planetaryHour} hour energy`;
  }

  return { score, reason };
}

/**
 * Get current time factors for recipe scoring
 */
function getTimeFactors(): TimeFactors {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Determine time of day
  const timeOfDay: TimeOfDay =
    hour >= 5 && hour < 12
      ? 'Morning'
      : hour >= 12 && hour < 17
        ? 'Afternoon'
        : hour >= 17 && hour < 22
          ? 'Evening'
          : 'Night';

  // Determine season
  const season: Season = getCurrentSeason() as unknown as Season;

  // Determine weekday
  const weekDays: WeekDay[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const weekDay = weekDays[dayOfWeek];

  // Create planetary day object
  const planetaryDay: PlanetaryDay = {
    day: weekDay,
    planet: getDayPlanet(dayOfWeek) as unknown as PlanetName,
  };

  // Create planetary hour object
  const planetaryHour: PlanetaryHour = {
    planet: getHourPlanet(hour) as unknown as PlanetName,
    hourOfDay: hour,
  };

  return {
    currentDate: now,
    season,
    timeOfDay,
    planetaryDay,
    planetaryHour,
    weekDay,
  };
}

/**
 * Get current season based on month
 */
function getCurrentSeason(): string {
  const month = new Date().getMonth();

  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';

  return 'winter';
}

/**
 * Get planetary ruler for a day of the week
 */
function getDayPlanet(dayOfWeek: number): string {
  const dayPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  return dayPlanets[dayOfWeek];
}

/**
 * Get planetary ruler for an hour
 */
function getHourPlanet(hour: number): string {
  const hourPlanets = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];
  return hourPlanets[hour % 7];
}
