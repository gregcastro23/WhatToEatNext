import @/types  from 'cuisine ';
import @/types  from 'alchemy ';
import @/data  from 'cuisines ';

export type PlanetaryDay =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';
export type PlanetaryHour =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type MealType =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Dessert'
  | null;

export interface TimeFactors {
  planetaryDay: PlanetaryDay;
  planetaryHour: PlanetaryHour;
  timeOfDay: TimeOfDay;
  season: Season;
  date: Date;
}

export interface EnhancedRecipeMatch {
  dish: Dish;
  matchPercentage: number;
  seasonalScore: number;
  planetaryDayScore: number;
  planetaryHourScore: number;
  astrologicalScore: number;
  timeOfDayScore: number;
  elementalScore: number;
}

interface DetailedScores {
  seasonal: number;
  planetaryDay: number;
  planetaryHour: number;
  astrological: number;
  timeOfDay: number;
  elemental: number;
}

export class EnhancedCuisineRecommender {
  private static instance: EnhancedCuisineRecommender;

  // Private constructor for singleton pattern - intentionally empty
  private constructor() {
    // No initialization needed
  }

  public static getInstance(): EnhancedCuisineRecommender {
    if (!EnhancedCuisineRecommender.instance) {
      EnhancedCuisineRecommender.instance = new EnhancedCuisineRecommender();
    }
    return EnhancedCuisineRecommender.instance;
  }

  /**
   * Get enhanced recipe recommendations for a specific cuisine
   */
  public getRecommendationsForCuisine(
    cuisineName: string,
    astroState: AstrologicalState,
    count = 5,
    mealType: MealType = null,
    dietaryRestrictions: string[] = []
  ): EnhancedRecipeMatch[] {
    // Get the cuisine data
    let cuisine = cuisinesMap[cuisineName];
    if (!cuisine) {
      throw new Error(`Cuisine "${cuisineName}" not found`);
    }

    // Get current time factors
    let timeFactors = this.getCurrentTimeFactors();

    // Filter recipes based on meal type and dietary restrictions
    let filteredDishes = cuisine.dishes.filter((dish) => {
      // Filter by meal type if specified
      if (mealType && !dish.tags?.includes(mealType)) {
        return false;
      }

      // Filter by dietary restrictions
      if (dietaryRestrictions.length > 0) {
        // Check if dish has any of the restricted ingredients or tags
        for (const restriction of dietaryRestrictions) {
          // Check if the restriction is in the tags
          if (dish.tags && dish.tags.includes(restriction)) {
            return false;
          }

          // Check if any key ingredient contains the restriction
          if (
            dish.keyIngredients &&
            dish.keyIngredients.some((ing) =>
              ing.toLowerCase().includes(restriction.toLowerCase())
            )
          ) {
            return false;
          }
        }
      }

      return true;
    });

    // Calculate match score for each dish
    const matches: EnhancedRecipeMatch[] = filteredDishes.map((dish) => {
      let scores = this.calculateDetailedScores(
        dish,
        timeFactors,
        astroState
      );

      // Calculate total match percentage (weighted average of all scores)
      let totalScore =
        (scores.seasonal * 1.5 +
          scores.planetaryDay * 1.0 +
          scores.planetaryHour * 1.2 +
          scores.astrological * 2.0 +
          scores.timeOfDay * 1.0 +
          scores.elemental * 1.3) /
        8.0; // Sum of weights

      let matchPercentage = Math.min(Math.round(totalScore * 100), 100);

      return {
        dish,
        matchPercentage,
        seasonalScore: Math.round(scores.seasonal * 100),
        planetaryDayScore: Math.round(scores.planetaryDay * 100),
        planetaryHourScore: Math.round(scores.planetaryHour * 100),
        astrologicalScore: Math.round(scores.astrological * 100),
        timeOfDayScore: Math.round(scores.timeOfDay * 100),
        elementalScore: Math.round(scores.elemental * 100),
      };
    });

    // Sort by match percentage (descending) and return top matches
    return matches
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, count);
  }

  /**
   * Get current time factors (day of week, planetary hour, season)
   */
  private getCurrentTimeFactors(): TimeFactors {
    let now = new Date();

    // Get day of week (planetary day)
    let dayOfWeek = now.getDay();
    const planetaryDays: PlanetaryDay[] = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    let planetaryDay = planetaryDays[dayOfWeek];

    // Calculate planetary hour (based on traditional astrology)
    // This is a simplified implementation
    let hour = now.getHours();
    const planetaryRulers: PlanetaryHour[] = [
      'Sun',
      'Venus',
      'Mercury',
      'Moon',
      'Saturn',
      'Jupiter',
      'Mars',
    ];
    let dayRulerIndex = dayOfWeek % planetaryRulers.length;
    let hourRulerIndex = (dayRulerIndex + hour) % planetaryRulers.length;
    let planetaryHour = planetaryRulers[hourRulerIndex];

    // Get time of day
    let timeOfDay: TimeOfDay;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'Morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeOfDay = 'Evening';
    } else {
      timeOfDay = 'Night';
    }

    // Calculate season based on month (simplified for Northern Hemisphere)
    let month = now.getMonth(); // 0-indexed (0 = January)
    let season: Season;
    if (month >= 2 && month <= 4) {
      season = 'Spring';
    } else if (month >= 5 && month <= 7) {
      season = 'Summer';
    } else if (month >= 8 && month <= 10) {
      season = 'Fall';
    } else {
      season = 'Winter';
    }

    return {
      planetaryDay,
      planetaryHour,
      timeOfDay,
      season,
      date: now,
    };
  }

  /**
   * Calculate detailed scores for a dish based on all factors
   */
  private calculateDetailedScores(
    dish: Dish,
    timeFactors: TimeFactors,
    astroState: AstrologicalState
  ): DetailedScores {
    return {
      seasonal: this.calculateSeasonalScore(dish, timeFactors.season),
      planetaryDay: this.calculatePlanetaryDayScore(
        dish,
        timeFactors.planetaryDay
      ),
      planetaryHour: this.calculatePlanetaryHourScore(
        dish,
        timeFactors.planetaryHour
      ),
      astrological: this.calculateAstrologicalScore(dish, astroState),
      timeOfDay: this.calculateTimeOfDayScore(dish, timeFactors.timeOfDay),
      elemental: this.calculateElementalScore(dish, astroState.dominantElement),
    };
  }

  /**
   * Calculate seasonal relevance score (0-1)
   */
  private calculateSeasonalScore(dish: Dish, currentSeason: Season): number {
    if (!dish.tags) return 0.5; // Default score if no seasonal information

    // Check if dish has explicit seasonal tags
    let seasonTags = ['Spring', 'Summer', 'Fall', 'Winter'];
    let dishSeasons = dish.tags.filter((tag) => seasonTags.includes(tag));

    if (dishSeasons.length === 0) {
      // No season specified, could be year-round dish
      return 0.7;
    }

    // If current season is explicitly mentioned in tags, high score
    if (dishSeasons.includes(currentSeason)) {
      return 1.0;
    }

    // Otherwise, mild penalty for out-of-season dish
    return 0.3;
  }

  /**
   * Calculate planetary day match score (0-1)
   */
  private calculatePlanetaryDayScore(
    dish: Dish,
    planetaryDay: PlanetaryDay
  ): number {
    // Map each planetary day to its ruling planet
    const dayToPlanetMap: Record<PlanetaryDay, string> = {
      Sunday: 'Sun',
      Monday: 'Moon',
      Tuesday: 'Mars',
      Wednesday: 'Mercury',
      Thursday: 'Jupiter',
      Friday: 'Venus',
      Saturday: 'Saturn',
    };

    let rulingPlanet = dayToPlanetMap[planetaryDay];

    // Check if dish has astrological affinities to this planet
    if (dish.astrologicalAffinities?.includes(rulingPlanet)) {
      return 1.0;
    }

    // If no specific match, give a default score
    return 0.5;
  }

  /**
   * Calculate planetary hour match score (0-1)
   */
  private calculatePlanetaryHourScore(
    dish: Dish,
    planetaryHour: PlanetaryHour
  ): number {
    // Check if dish has astrological affinities to this hour's planet
    if (dish.astrologicalAffinities?.includes(planetaryHour)) {
      return 1.0;
    }

    // If no specific match, give a default score
    return 0.5;
  }

  /**
   * Calculate astrological match score (0-1)
   */
  private calculateAstrologicalScore(
    dish: Dish,
    astroState: AstrologicalState
  ): number {
    let score = 0.5; // Default score

    // Check for zodiac sign influences
    if (dish.zodiacInfluences?.includes(astroState.sunSign)) {
      score += 0.25;
    }

    // Check for lunar phase influences
    if (dish.lunarPhaseInfluences?.includes(astroState.lunarPhase)) {
      score += 0.25;
    }

    // Check for ruling planet affinities
    for (const planet of astroState.dominantPlanets) {
      if (dish.astrologicalAffinities?.includes(planet.name)) {
        score += 0.15 * planet.influence;
      }
    }

    // Cap score at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Calculate time of day appropriateness score (0-1)
   */
  private calculateTimeOfDayScore(dish: Dish, timeOfDay: TimeOfDay): number {
    if (!dish.tags) return 0.5;

    // Map times of day to appropriate meal types
    const timeToMealMap: Record<TimeOfDay, string[]> = {
      Morning: ['Breakfast'],
      Afternoon: ['Lunch', 'Snack'],
      Evening: ['Dinner'],
      Night: ['Dinner', 'Dessert', 'Snack'],
    };

    let appropriateMeals = timeToMealMap[timeOfDay];

    // Check if dish tags include appropriate meal type for this time
    for (const meal of appropriateMeals) {
      if (dish.tags.includes(meal)) {
        return 1.0;
      }
    }

    // If dish has a meal type tag that doesn't match current time
    let allMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];
    for (const mealType of allMealTypes) {
      if (dish.tags.includes(mealType)) {
        return 0.3; // Significant penalty for wrong time
      }
    }

    // If no meal type specified, moderate score
    return 0.6;
  }

  /**
   * Calculate elemental balance score (0-1)
   */
  private calculateElementalScore(dish: Dish, dominantElement: string): number {
    if (!dish.elementalProperties) return 0.5;

    let properties = dish.elementalProperties as ElementalProperties;

    // Get score based on dominant element
    const elementMap: Record<string, keyof ElementalProperties> = {
      Fire: 'fire',
      Earth: 'earth',
      Air: 'air',
      Water: 'water',
      Aether: 'aether',
    };

    let elementKey = elementMap[dominantElement];
    if (!elementKey) return 0.5;

    // Return the elemental score, normalized to 0-1 range
    return Math.min(properties[elementKey] / 10, 1.0);
  }
}

// Export singleton instance
export let enhancedCuisineRecommender =
  EnhancedCuisineRecommender.getInstance();
