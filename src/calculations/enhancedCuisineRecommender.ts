import type { Cuisine } from '@/types/cuisine';
import type {
  AstrologicalState,
  ElementalProperties,
  LunarPhase,
  ZodiacSign,
} from '@/types/alchemy';
import { cuisinesMap } from '@/data/cuisines';

// Recipe interface for internal use in enhanced recommender
interface RecipeData {
  name?: string;
  id?: string;
  tags?: string[];
  description?: string;
  ingredients?: unknown[];
  season?: string[];
  mealType?: string[];
  dietaryInfo?: string[];
  planetary?: string[];
  zodiac?: string[];
  lunar?: string[];
  flavorProfile?: Record<string, number>;
  timeToMake?: number;
  spiceLevel?: number | string;
  preparationSteps?: string[];
  instructions?: string[];
  // Additional properties that are accessed in the code
  elementalProperties?: ElementalProperties | Record<string, number>;
  astrologicalAffinities?: {
    planets?: string[];
    zodiac?: string[];
    lunar?: string[];
  };
  zodiacInfluences?: string[];
  lunarPhaseInfluences?: string[];
  allergens?: string[];
}

interface EnhancedRecipeMatch {
  cuisine: string;
  recipeName: string;
  recipeId: string;
  matchPercentage: number;
  seasonalScore: number;
  planetaryDayScore: number;
  planetaryHourScore: number;
  elementalScore: number;
  astrologicalScore: number;
  timeOfDayScore: number;
  tags: string[];
  description: string;
  ingredients: unknown[];
  season: string[];
  mealType: string[];
}

interface TimeFactors {
  planetaryDay: PlanetaryDay;
  planetaryHour: PlanetaryHour;
  timeOfDay: TimeOfDay;
  currentSeason: Season;
  currentDate: Date;
}

type PlanetaryDay =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn';
type PlanetaryHour = PlanetaryDay;
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type _Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * Enhanced cuisine-specific recipe recommender that incorporates:
 * - Day of week (planetary day)
 * - Hour and minute (planetary hours)
 * - Astrological matching
 * - Seasonal factors
 * - Uniform recipe structure across cuisine files
 */
export class EnhancedCuisineRecommender {
  private static instance: EnhancedCuisineRecommender;

  private constructor() {}

  public static getInstance(): EnhancedCuisineRecommender {
    if (!EnhancedCuisineRecommender.instance) {
      EnhancedCuisineRecommender.instance = new EnhancedCuisineRecommender();
    }
    return EnhancedCuisineRecommender.instance;
  }

  /**
   * Get enhanced recipe recommendations for a specific cuisine
   *
   * @param cuisineName Name of the cuisine
   * @param astroState Current astrological state
   * @param count Number of recommendations to return
   * @param mealType Optional meal type filter (breakfast, lunch, dinner, dessert)
   * @param dietaryRestrictions Optional dietary restrictions
   * @returns Array of recipe matches with detailed match scores
   */
  public getRecommendationsForCuisine(
    cuisineName: string,
    astroState: AstrologicalState,
    count: number = 5,
    mealType?: string,
    dietaryRestrictions?: string[]
  ): EnhancedRecipeMatch[] {
    // Get current time factors
    const _timeFactors = this.getCurrentTimeFactors();

    // Get cuisine data
    const cuisine = this.getCuisine(cuisineName);
    if (!cuisine) {
      return [];
    }

    // Get all recipes from the specified cuisine
    const allRecipes = this.getAllRecipesFromCuisine(
      cuisine,
      timeFactors.currentSeason
    );

    // Filter by meal type if specified
    const filteredRecipes = mealType
      ? allRecipes.filter((recipe) => recipe.mealType?.includes(mealType))
      : allRecipes;

    // Filter by dietary restrictions if specified
    const dietaryFilteredRecipes = dietaryRestrictions?.length
      ? filteredRecipes.filter((recipe) => {
          const recipeDietary = recipe.dietaryInfo || [];
          return dietaryRestrictions.every(
            (restriction) =>
              recipeDietary.includes(restriction) ||
              !this.conflictsWithRestriction(recipe, restriction)
          );
        })
      : filteredRecipes;

    // Calculate match scores for each recipe
    const matches = dietaryFilteredRecipes.map((recipe) => {
      const seasonalScore = this.calculateSeasonalScore(recipe, timeFactors);
      const planetaryDayScore = this.calculatePlanetaryDayScore(
        recipe,
        timeFactors,
        astroState
      );
      const planetaryHourScore = this.calculatePlanetaryHourScore(
        recipe,
        timeFactors,
        astroState
      );
      const elementalScore = this.calculateElementalScore(recipe, astroState);
      const astrologicalScore = this.calculateAstrologicalScore(
        recipe,
        astroState
      );
      const timeOfDayScore = this.calculateTimeOfDayScore(recipe, timeFactors);

      // Overall match percentage - weighted combination of all scores
      const matchPercentage = this.calculateOverallMatch(
        seasonalScore,
        planetaryDayScore,
        planetaryHourScore,
        elementalScore,
        astrologicalScore,
        timeOfDayScore
      );

      return {
        cuisine: cuisineName,
        recipeName: recipe.name || 'Unknown Recipe',
        recipeId: recipe.id || recipe.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        matchPercentage,
        seasonalScore,
        planetaryDayScore,
        planetaryHourScore,
        elementalScore,
        astrologicalScore,
        timeOfDayScore,
        tags: recipe.tags || [],
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        season: recipe.season || [],
        mealType: recipe.mealType || [],
      };
    });

    // Sort by match percentage and return top count
    return matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, count);
  }

  /**
   * Get current planetary day, hour, season and time of day
   */
  private getCurrentTimeFactors(): TimeFactors {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Map day of week to planetary day
    const planetaryDays: PlanetaryDay[] = [
      'Sun',
      'Moon',
      'Mars',
      'Mercury',
      'Jupiter',
      'Venus',
      'Saturn',
    ];
    const planetaryDay = planetaryDays[dayOfWeek];

    // Calculate planetary hour (simplified implementation)
    // In traditional planetary hours, daylight is divided into 12 equal parts, as is night
    // For simplicity, we'll use a 24-hour approximation
    const hourIndex = (dayOfWeek * 24 + hours) % 7;
    const planetaryHour = planetaryDays[hourIndex];

    // Determine time of day
    let timeOfDay: TimeOfDay;
    if (hours >= 5 && hours < 12) {
      timeOfDay = 'morning';
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = 'afternoon';
    } else if (hours >= 17 && hours < 22) {
      timeOfDay = 'evening';
    } else {
      timeOfDay = 'night';
    }

    // Determine current season based on month in Northern Hemisphere
    // (This could be improved to account for Southern Hemisphere)
    const month = now.getMonth(); // 0 = January, 11 = December
    let currentSeason: Season;
    if (month >= 2 && month <= 4) {
      currentSeason = 'spring';
    } else if (month >= 5 && month <= 7) {
      currentSeason = 'summer';
    } else if (month >= 8 && month <= 10) {
      currentSeason = 'autumn';
    } else {
      currentSeason = 'winter';
    }

    return {
      planetaryDay,
      planetaryHour,
      timeOfDay,
      currentSeason,
      currentDate: now,
    };
  }

  /**
   * Get cuisine data by name
   */
  private getCuisine(cuisineName: string): Cuisine | null {
    const cuisineKey = Object.keys(cuisinesMap).find(
      (key) => key.toLowerCase() === cuisineName.toLowerCase()
    );

    return cuisineKey
      ? cuisinesMap[cuisineKey as keyof typeof cuisinesMap]
      : null;
  }

  /**
   * Extract all recipes from a cuisine, combining seasonal and non-seasonal recipes
   */
  private getAllRecipesFromCuisine(
    cuisine: Cuisine,
    currentSeason: Season
  ): RecipeData[] {
    const allRecipes: RecipeData[] = [];

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];

    mealTypes.forEach((mealType) => {
      // Add current season recipes
      if (
        cuisine.dishes[mealType as keyof typeof cuisine.dishes][currentSeason]
      ) {
        allRecipes.push(
          ...cuisine.dishes[mealType as keyof typeof cuisine.dishes][
            currentSeason
          ]
        );
      }

      // Add "all" season recipes if they exist
      if (cuisine.dishes[mealType as keyof typeof cuisine.dishes].all) {
        allRecipes.push(
          ...cuisine.dishes[mealType as keyof typeof cuisine.dishes].all
        );
      }
    });

    return allRecipes;
  }

  /**
   * Calculate seasonal match score (0-1)
   */
  private calculateSeasonalScore(
    recipe: RecipeData,
    timeFactors: TimeFactors
  ): number {
    // If recipe has no seasonal information, give it a neutral score
    if (!recipe.season || recipe.season.length === 0) {
      return 0.5;
    }

    // If recipe is good for all seasons, give it a good but not perfect score
    if (recipe.season.includes('all')) {
      return 0.8;
    }

    // If recipe is specifically for the current season, perfect score
    if (recipe.season.includes(timeFactors.currentSeason)) {
      return 1.0;
    }

    // Otherwise, lower score - recipe is out of season
    return 0.3;
  }

  /**
   * Calculate match based on planetary day (0-1)
   * The planetary day influences the entire day with both its diurnal and nocturnal elements
   */
  private calculatePlanetaryDayScore(
    recipe: RecipeData,
    timeFactors: TimeFactors,
    astroState: AstrologicalState
  ): number {
    const { planetaryDay, currentDate } = timeFactors;
    const _isDaytime = this.isDaytime(currentDate);

    // If recipe has no elemental properties, give it a neutral score
    if (!recipe.elementalProperties) {
      return 0.5;
    }

    // Map planets to their elemental influences (diurnal and nocturnal elements)
    const planetaryElements: Record<
      string,
      { diurnal: string; nocturnal: string }
    > = {
      Sun: { diurnal: 'Fire', nocturnal: 'Fire' },
      Moon: { diurnal: 'Water', nocturnal: 'Water' },
      Mercury: { diurnal: 'Air', nocturnal: 'Earth' },
      Venus: { diurnal: 'Water', nocturnal: 'Earth' },
      Mars: { diurnal: 'Fire', nocturnal: 'Water' },
      Jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
      Saturn: { diurnal: 'Air', nocturnal: 'Earth' },
      Uranus: { diurnal: 'Water', nocturnal: 'Air' },
      Neptune: { diurnal: 'Water', nocturnal: 'Water' },
      Pluto: { diurnal: 'Earth', nocturnal: 'Water' },
    };

    // Get the elements associated with the current planetary day
    const dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return 0.5; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    // regardless of whether it's day or night
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Calculate how much of each planetary element is present in the recipe
    const recipeElementals = recipe.elementalProperties as Record<
      string,
      number
    >;
    const diurnalMatch = recipeElementals[diurnalElement] || 0;
    const nocturnalMatch = recipeElementals[nocturnalElement] || 0;

    // Calculate a weighted score - both elements are equally important for planetary day
    let elementalScore = (diurnalMatch + nocturnalMatch) / 2;

    // If the recipe has a direct planetary affinity, give bonus points
    if (
      recipe.astrologicalAffinities?.planets &&
      recipe.astrologicalAffinities.planets.some(
        (p: string) => p.toLowerCase() === planetaryDay.toLowerCase()
      )
    ) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  }

  /**
   * Calculate match based on planetary hour (0-1)
   * The planetary hour influences with its diurnal element during day, and nocturnal element at night
   */
  private calculatePlanetaryHourScore(
    recipe: RecipeData,
    timeFactors: TimeFactors,
    astroState: AstrologicalState
  ): number {
    const { planetaryHour, currentDate } = timeFactors;
    const _isDaytime = this.isDaytime(currentDate);

    // If recipe has no elemental properties, give it a neutral score
    if (!recipe.elementalProperties) {
      return 0.5;
    }

    // Map planets to their elemental influences (diurnal and nocturnal elements)
    const planetaryElements: Record<
      string,
      { diurnal: string; nocturnal: string }
    > = {
      Sun: { diurnal: 'Fire', nocturnal: 'Fire' },
      Moon: { diurnal: 'Water', nocturnal: 'Water' },
      Mercury: { diurnal: 'Air', nocturnal: 'Earth' },
      Venus: { diurnal: 'Water', nocturnal: 'Earth' },
      Mars: { diurnal: 'Fire', nocturnal: 'Water' },
      Jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
      Saturn: { diurnal: 'Air', nocturnal: 'Earth' },
      Uranus: { diurnal: 'Water', nocturnal: 'Air' },
      Neptune: { diurnal: 'Water', nocturnal: 'Water' },
      Pluto: { diurnal: 'Earth', nocturnal: 'Water' },
    };

    // Get the elements associated with the current planetary hour
    const hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return 0.5; // Unknown planet

    // For planetary hour, use diurnal element during the day and nocturnal element at night
    const relevantElement = isDaytime
      ? hourElements.diurnal
      : hourElements.nocturnal;

    // Calculate how much of the relevant planetary element is present in the recipe
    const recipeElementals = recipe.elementalProperties as Record<
      string,
      number
    >;
    const elementalMatch = recipeElementals[relevantElement] || 0;

    // Calculate a score based on how well the recipe matches the planetary hour's element
    let elementalScore = elementalMatch;

    // If the recipe has a direct planetary affinity, give bonus points
    if (
      recipe.astrologicalAffinities?.planets &&
      recipe.astrologicalAffinities.planets.some(
        (p: string) => p.toLowerCase() === planetaryHour.toLowerCase()
      )
    ) {
      elementalScore = Math.min(1.0, elementalScore + 0.3);
    }

    return elementalScore;
  }

  /**
   * Calculate elemental match score (0-1)
   */
  private calculateElementalScore(
    recipe: RecipeData,
    astroState: AstrologicalState
  ): number {
    // If recipe has no elemental properties, give it a neutral score
    if (!recipe.elementalProperties) {
      return 0.5;
    }

    // Get dominant element from astro state
    const dominantElement = this.getDominantElementFromAstro(astroState);

    // Calculate score based on how much of the dominant element is in the recipe
    const elementValue = recipe.elementalProperties[dominantElement] || 0;

    // Scale value (typical values range from 0 to 1)
    return Math.min(1.0, elementValue * 1.5); // Scale up slightly to reward recipes with strong elemental alignment
  }

  /**
   * Calculate astrological match score based on signs and lunar phases (0-1)
   */
  private calculateAstrologicalScore(
    recipe: RecipeData,
    astroState: AstrologicalState
  ): number {
    let score = 0.5; // Start with neutral score

    // Check zodiac influences
    if (
      recipe.zodiacInfluences &&
      recipe.zodiacInfluences.length > 0 &&
      astroState.sunSign
    ) {
      const matchingSigns = recipe.zodiacInfluences.filter(
        (sign: string) =>
          sign.toLowerCase() === astroState.sunSign?.toLowerCase()
      );

      if (matchingSigns.length > 0) {
        score += 0.3; // Significant boost for sun sign match
      }
    }

    // Check lunar phase influences
    if (
      recipe.lunarPhaseInfluences &&
      recipe.lunarPhaseInfluences.length > 0 &&
      astroState.lunarPhase
    ) {
      const matchingPhases = recipe.lunarPhaseInfluences.filter(
        (phase: string) =>
          phase.toLowerCase() === astroState.lunarPhase?.toLowerCase()
      );

      if (matchingPhases.length > 0) {
        score += 0.2; // Moderate boost for lunar phase match
      }
    }

    return Math.min(1.0, score); // Cap at 1.0
  }

  /**
   * Calculate match based on time of day (0-1)
   */
  private calculateTimeOfDayScore(
    recipe: RecipeData,
    timeFactors: TimeFactors
  ): number {
    const { timeOfDay } = timeFactors;

    // Map meal types to appropriate times of day
    const mealTypeToTimeMap: Record<string, TimeOfDay[]> = {
      breakfast: ['morning'],
      brunch: ['morning', 'afternoon'],
      lunch: ['afternoon'],
      dinner: ['evening'],
      dessert: ['afternoon', 'evening'],
      snack: ['morning', 'afternoon', 'evening'],
    };

    // If recipe has no meal type, give it a neutral score
    if (!recipe.mealType || recipe.mealType.length === 0) {
      return 0.5;
    }

    // Check if any of the recipe's meal types are appropriate for the current time of day
    for (const mealType of recipe.mealType) {
      const appropriateTimes = mealTypeToTimeMap[mealType.toLowerCase()];
      if (appropriateTimes && appropriateTimes.includes(timeOfDay)) {
        return 1.0; // Perfect match for time of day
      }
    }

    // If we get here, there's no direct match for time of day
    return 0.4; // Lower score for inappropriate time
  }

  /**
   * Calculate overall match percentage (0-100)
   */
  private calculateOverallMatch(
    seasonalScore: number,
    planetaryDayScore: number,
    planetaryHourScore: number,
    elementalScore: number,
    astrologicalScore: number,
    timeOfDayScore: number
  ): number {
    // Weight the different factors - increased planetary influence
    const weights = {
      seasonal: 0.15, // Reduced from 0.25
      planetaryDay: 0.3, // Doubled from 0.15
      planetaryHour: 0.2, // Doubled from 0.10
      elemental: 0.15, // Reduced from 0.20
      astrological: 0.1, // Reduced from 0.15
      timeOfDay: 0.1, // Reduced from 0.15
    };

    // Calculate weighted score with stronger emphasis on planetary factors
    const weightedScore =
      seasonalScore * weights.seasonal +
      planetaryDayScore * weights.planetaryDay +
      planetaryHourScore * weights.planetaryHour +
      elementalScore * weights.elemental +
      astrologicalScore * weights.astrological +
      timeOfDayScore * weights.timeOfDay;

    // Convert to percentage
    return Math.round(weightedScore * 100);
  }

  /**
   * Extract dominant element from astrological state
   */
  private getDominantElementFromAstro(astroState: AstrologicalState): string {
    // If astroState has already calculated dominant element, use that
    if (astroState.dominantElement) {
      return astroState.dominantElement;
    }

    // Otherwise, calculate based on Sun sign
    const elementMap: Record<ZodiacSign, string> = {
      aries: 'Fire',
      taurus: 'Earth',
      gemini: 'Air',
      cancer: 'Water',
      leo: 'Fire',
      virgo: 'Earth',
      libra: 'Air',
      scorpio: 'Water',
      sagittarius: 'Fire',
      capricorn: 'Earth',
      aquarius: 'Air',
      pisces: 'Water',
    };

    return astroState.sunSign
      ? elementMap[astroState.sunSign as ZodiacSign] || 'Fire'
      : 'Fire';
  }

  /**
   * Check if a recipe conflicts with a dietary restriction
   */
  private conflictsWithRestriction(
    recipe: RecipeData,
    restriction: string
  ): boolean {
    // Check allergens if restriction is an allergy
    if (recipe.allergens && recipe.allergens.length > 0) {
      // Common restriction mappings
      const restrictionMap: Record<string, string[]> = {
        vegetarian: ['beef', 'pork', 'chicken', 'fish', 'meat'],
        vegan: [
          'beef',
          'pork',
          'chicken',
          'fish',
          'meat',
          'dairy',
          'eggs',
          'honey',
        ],
        'gluten-free': ['gluten', 'wheat'],
        'dairy-free': ['dairy', 'milk', 'cream', 'cheese'],
        'nut-free': ['nuts', 'peanuts', 'almonds', 'walnuts'],
      };

      const restrictedItems = restrictionMap[restriction.toLowerCase()];
      if (restrictedItems) {
        return recipe.allergens.some((allergen: string) =>
          restrictedItems.includes(allergen.toLowerCase())
        );
      }
    }

    // Default to no conflict if we can't determine
    return false;
  }

  /**
   * Determine if the current time is during daylight hours
   */
  private isDaytime(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  }
}

// Export singleton instance
export const enhancedCuisineRecommender =
  EnhancedCuisineRecommender.getInstance();
