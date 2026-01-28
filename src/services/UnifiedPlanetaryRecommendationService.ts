/**
 * Unified Recommendation Service
 *
 * Combines planetary scoring, meal type matching, nutritional goals,
 * seasonal relevance, and user preferences into a single recommendation engine.
 *
 * Scoring weights:
 *   Planetary: 30% | Nutrition: 30% | Preferences: 20% | Seasonal: 10% | Meal Timing: 10%
 */

import type { Recipe } from '@/types/recipe';
import type { Planet } from '@/types/celestial';
import { PlanetaryScoringService, type BirthChart, type PlanetaryScoringResult } from './planetaryScoring';
import { MealTypeService, type MealType } from './mealTypeService';

// --- Public interfaces ---

export interface UserPreferences {
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
    lowCarb?: boolean;
    keto?: boolean;
    paleo?: boolean;
  };
  allergies?: string[];
  favoriteCuisines?: string[];
  excludeCuisines?: string[];
  maxCookTimeMinutes?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredIngredients?: string[];
  excludedIngredients?: string[];
}

export interface NutritionGoals {
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  targetFiber?: number;
}

export interface RecommendationRequest {
  recipes: Recipe[];
  mealType?: MealType;
  userPreferences?: UserPreferences;
  nutritionGoals?: NutritionGoals;
  birthChart?: BirthChart;
  currentSeason?: string;
  limit?: number;
}

export interface ScoredRecommendation {
  recipe: Recipe;
  totalScore: number;
  breakdown: {
    planetary: number;
    nutrition: number;
    preferences: number;
    seasonal: number;
    mealTiming: number;
  };
  planetaryResult: PlanetaryScoringResult;
  reasons: string[];
}

// --- Scoring weights ---

const WEIGHTS = {
  planetary: 0.30,
  nutrition: 0.30,
  preferences: 0.20,
  seasonal: 0.10,
  mealTiming: 0.10,
} as const;

// --- Season data ---

const SEASON_MONTHS: Record<string, number[]> = {
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
  fall: [9, 10, 11],
  winter: [12, 1, 2],
};

export class UnifiedRecommendationService {
  private static instance: UnifiedRecommendationService;
  private planetaryService: PlanetaryScoringService;
  private mealTypeService: MealTypeService;

  constructor() {
    this.planetaryService = PlanetaryScoringService.getInstance();
    this.mealTypeService = MealTypeService.getInstance();
  }

  static getInstance(): UnifiedRecommendationService {
    if (!this.instance) {
      this.instance = new UnifiedRecommendationService();
    }
    return this.instance;
  }

  /**
   * Get ranked recipe recommendations.
   */
  async getRecommendations(request: RecommendationRequest): Promise<ScoredRecommendation[]> {
    const {
      recipes,
      mealType,
      userPreferences,
      nutritionGoals,
      birthChart,
      currentSeason,
      limit = 10,
    } = request;

    const effectiveMealType = mealType ?? this.mealTypeService.getCurrentMealType();
    const effectiveSeason = currentSeason ?? this.getCurrentSeason();

    // Filter out recipes that violate hard constraints
    const eligible = this.applyHardFilters(recipes, userPreferences);

    // Score all eligible recipes
    const scored: ScoredRecommendation[] = [];

    for (const recipe of eligible) {
      const planetaryResult = await this.planetaryService.scoreRecipe(recipe, birthChart);
      const planetaryScore = planetaryResult.overallScore;
      const nutritionScore = this.scoreNutrition(recipe, nutritionGoals);
      const preferencesScore = this.scorePreferences(recipe, userPreferences);
      const seasonalScore = this.scoreSeasonal(recipe, effectiveSeason);
      const mealTimingScore = this.mealTypeService.scoreMealTypeFit(recipe, effectiveMealType);

      // Planetary hour bonus for matching ruling planet
      const rulingPlanet = planetaryResult.rulingPlanet;
      const planetFavored = this.mealTypeService.isPlanetFavoredForMeal(rulingPlanet, effectiveMealType);

      const breakdown = {
        planetary: planetaryScore,
        nutrition: nutritionScore,
        preferences: preferencesScore,
        seasonal: seasonalScore,
        mealTiming: mealTimingScore + (planetFavored ? 5 : 0),
      };

      const totalScore = Math.round(
        breakdown.planetary * WEIGHTS.planetary +
        breakdown.nutrition * WEIGHTS.nutrition +
        breakdown.preferences * WEIGHTS.preferences +
        breakdown.seasonal * WEIGHTS.seasonal +
        breakdown.mealTiming * WEIGHTS.mealTiming,
      );

      const reasons = this.collectReasons(breakdown, planetaryResult, effectiveMealType, effectiveSeason);

      scored.push({ recipe, totalScore, breakdown, planetaryResult, reasons });
    }

    // Sort descending by total score and return top N
    scored.sort((a, b) => b.totalScore - a.totalScore);
    return scored.slice(0, limit);
  }

  // --- Hard filters (pass/fail) ---

  private applyHardFilters(recipes: Recipe[], prefs?: UserPreferences): Recipe[] {
    if (!prefs) return recipes;

    return recipes.filter((r) => {
      // Dietary restrictions
      if (prefs.dietary?.vegetarian && !r.isVegetarian) return false;
      if (prefs.dietary?.vegan && !r.isVegan) return false;
      if (prefs.dietary?.glutenFree && !r.isGlutenFree) return false;
      if (prefs.dietary?.dairyFree && !r.isDairyFree) return false;
      if (prefs.dietary?.nutFree && !r.isNutFree) return false;
      if (prefs.dietary?.keto && !r.isKeto) return false;
      if (prefs.dietary?.paleo && !r.isPaleo) return false;

      // Allergens
      if (prefs.allergies?.length && r.allergens?.length) {
        const recipeAllergens = r.allergens.map((a) => a.toLowerCase());
        if (prefs.allergies.some((a) => recipeAllergens.includes(a.toLowerCase()))) {
          return false;
        }
      }

      // Excluded cuisines
      if (prefs.excludeCuisines?.length && r.cuisine) {
        if (prefs.excludeCuisines.some((c) => c.toLowerCase() === r.cuisine!.toLowerCase())) {
          return false;
        }
      }

      // Excluded ingredients
      if (prefs.excludedIngredients?.length && r.ingredients) {
        const ingredientNames = r.ingredients.map((i) => i.name.toLowerCase());
        if (prefs.excludedIngredients.some((ex) =>
          ingredientNames.some((n) => n.includes(ex.toLowerCase())),
        )) {
          return false;
        }
      }

      // Max cook time
      if (prefs.maxCookTimeMinutes) {
        const totalMin = this.parseTimeToMinutes(r.totalTime ?? r.cookTime ?? r.timeToMake);
        if (totalMin !== null && totalMin > prefs.maxCookTimeMinutes) {
          return false;
        }
      }

      return true;
    });
  }

  // --- Soft scoring (0-100) ---

  private scoreNutrition(recipe: Recipe, goals?: NutritionGoals): number {
    if (!goals || !recipe.nutrition) return 50;

    let score = 50;
    let factors = 0;

    const check = (actual: number | undefined, target: number | undefined, weight: number) => {
      if (actual == null || target == null) return;
      factors++;
      const ratio = actual / target;
      // Perfect is 1.0; penalize deviation
      const deviation = Math.abs(1 - ratio);
      score += (1 - Math.min(deviation, 1)) * weight;
    };

    const n = recipe.nutrition;
    check(n.calories, goals.targetCalories, 15);
    check(n.protein ?? n.macronutrients?.protein, goals.targetProtein, 12);
    check(n.carbs ?? n.macronutrients?.carbs, goals.targetCarbs, 10);
    check(n.fat ?? n.macronutrients?.fat, goals.targetFat, 8);
    check(n.fiber ?? n.macronutrients?.fiber, goals.targetFiber, 5);

    if (factors === 0) return 50;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private scorePreferences(recipe: Recipe, prefs?: UserPreferences): number {
    if (!prefs) return 50;
    let score = 50;

    // Favorite cuisines bonus
    if (prefs.favoriteCuisines?.length && recipe.cuisine) {
      if (prefs.favoriteCuisines.some((c) => c.toLowerCase() === recipe.cuisine!.toLowerCase())) {
        score += 25;
      }
    }

    // Preferred ingredients bonus
    if (prefs.preferredIngredients?.length && recipe.ingredients) {
      const ingredientNames = recipe.ingredients.map((i) => i.name.toLowerCase());
      const matches = prefs.preferredIngredients.filter((p) =>
        ingredientNames.some((n) => n.includes(p.toLowerCase())),
      ).length;
      score += Math.min(25, matches * 8);
    }

    // Skill level match
    if (prefs.skillLevel && recipe.skillsRequired?.length) {
      const levels = ['beginner', 'intermediate', 'advanced'];
      const userLevel = levels.indexOf(prefs.skillLevel);
      const hasAdvanced = recipe.skillsRequired.some((s) => s.toLowerCase().includes('advanced'));
      if (hasAdvanced && userLevel < 2) score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private scoreSeasonal(recipe: Recipe, season: string): number {
    let score = 50;

    // Check recipe season field
    const recipeSeason = recipe.season;
    if (recipeSeason) {
      const seasons = Array.isArray(recipeSeason) ? recipeSeason : [recipeSeason];
      const normalized = seasons.map((s) => s.toLowerCase());
      if (normalized.includes(season.toLowerCase())) {
        score += 30;
      } else if (normalized.includes('all') || normalized.includes('year-round')) {
        score += 10;
      }
    }

    // Check seasonal ingredients
    if (recipe.seasonalIngredients?.length) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // --- Reason collection ---

  private collectReasons(
    breakdown: ScoredRecommendation['breakdown'],
    planetaryResult: PlanetaryScoringResult,
    mealType: MealType,
    season: string,
  ): string[] {
    const reasons: string[] = [];

    if (breakdown.planetary >= 70) {
      reasons.push(planetaryResult.planetaryReason);
    }
    if (breakdown.nutrition >= 70) {
      reasons.push('Aligns well with your nutrition goals');
    }
    if (breakdown.preferences >= 70) {
      reasons.push('Matches your cuisine and ingredient preferences');
    }
    if (breakdown.seasonal >= 70) {
      reasons.push(`Great choice for ${season}`);
    }
    if (breakdown.mealTiming >= 70) {
      reasons.push(`Well-suited for ${mealType}`);
    }

    if (planetaryResult.recommendedTiming !== 'Favorable any time today') {
      reasons.push(planetaryResult.recommendedTiming);
    }

    if (reasons.length === 0) {
      reasons.push('A solid choice based on current conditions');
    }

    return reasons;
  }

  // --- Helpers ---

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    if ([9, 10, 11].includes(month)) return 'autumn';
    return 'winter';
  }

  private parseTimeToMinutes(time?: string): number | null {
    if (!time) return null;
    const h = time.match(/(\d+)\s*h/i);
    const m = time.match(/(\d+)\s*m/i);
    let mins = 0;
    if (h) mins += parseInt(h[1], 10) * 60;
    if (m) mins += parseInt(m[1], 10);
    if (mins === 0) {
      const plain = parseInt(time, 10);
      if (!isNaN(plain)) mins = plain;
    }
    return mins > 0 ? mins : null;
  }
}
