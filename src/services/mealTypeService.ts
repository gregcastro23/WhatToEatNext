/**
 * Meal Type Service
 *
 * Provides intelligent meal type matching based on time of day,
 * planetary hours, and recipe characteristics.
 */

import type { Recipe } from '@/types/recipe';
import type { Planet } from '@/types/celestial';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealTypeProfile {
  label: string;
  hourRange: [number, number]; // start hour, end hour (24h)
  favoredPlanets: Planet[];
  elementBias: { Fire: number; Water: number; Earth: number; Air: number };
  maxPrepTimeMinutes: number;
  preferLight: boolean;
}

const MEAL_PROFILES: Record<MealType, MealTypeProfile> = {
  breakfast: {
    label: 'Breakfast',
    hourRange: [5, 11],
    favoredPlanets: ['Sun', 'Mercury'],
    elementBias: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    maxPrepTimeMinutes: 30,
    preferLight: true,
  },
  lunch: {
    label: 'Lunch',
    hourRange: [11, 15],
    favoredPlanets: ['Sun', 'Mars', 'Jupiter'],
    elementBias: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    maxPrepTimeMinutes: 60,
    preferLight: false,
  },
  dinner: {
    label: 'Dinner',
    hourRange: [17, 22],
    favoredPlanets: ['Moon', 'Venus', 'Jupiter'],
    elementBias: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    maxPrepTimeMinutes: 120,
    preferLight: false,
  },
  snack: {
    label: 'Snack',
    hourRange: [0, 24], // anytime
    favoredPlanets: ['Mercury', 'Venus'],
    elementBias: { Fire: 0.2, Water: 0.2, Earth: 0.3, Air: 0.3 },
    maxPrepTimeMinutes: 15,
    preferLight: true,
  },
};

export class MealTypeService {
  private static instance: MealTypeService;

  static getInstance(): MealTypeService {
    if (!this.instance) {
      this.instance = new MealTypeService();
    }
    return this.instance;
  }

  /**
   * Determine the current meal type based on time of day.
   */
  getCurrentMealType(date?: Date): MealType {
    const hour = (date ?? new Date()).getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 17) return 'snack';
    if (hour >= 17 && hour < 22) return 'dinner';
    return 'snack';
  }

  /**
   * Score a recipe's suitability for a given meal type (0-100).
   */
  scoreMealTypeFit(recipe: Recipe, mealType?: MealType): number {
    const type = mealType ?? this.getCurrentMealType();
    const profile = MEAL_PROFILES[type];
    let score = 50; // base

    // Check explicit mealType on recipe
    const recipeMealTypes = this.normalizeMealTypes(recipe.mealType);
    if (recipeMealTypes.length > 0) {
      if (recipeMealTypes.includes(type)) {
        score += 30;
      } else {
        score -= 20;
      }
    }

    // Check tags and course
    const tags = recipe.tags?.map((t) => t.toLowerCase()) ?? [];
    const courses = recipe.course?.map((c) => c.toLowerCase()) ?? [];
    const combined = [...tags, ...courses];

    if (combined.includes(type)) {
      score += 15;
    }

    // Prep time fit
    const prepMinutes = this.parsePrepTime(recipe);
    if (prepMinutes !== null) {
      if (prepMinutes <= profile.maxPrepTimeMinutes) {
        score += 10;
      } else {
        score -= Math.min(15, Math.floor((prepMinutes - profile.maxPrepTimeMinutes) / 10));
      }
    }

    // Light/heavy preference
    if (profile.preferLight) {
      if (combined.includes('light') || combined.includes('quick') || combined.includes('simple')) {
        score += 10;
      }
      if (combined.includes('heavy') || combined.includes('rich') || combined.includes('feast')) {
        score -= 10;
      }
    }

    // Elemental alignment
    if (recipe.elementalProperties) {
      const total = recipe.elementalProperties.Fire + recipe.elementalProperties.Water +
        recipe.elementalProperties.Earth + recipe.elementalProperties.Air;
      if (total > 0) {
        let alignment = 0;
        for (const elem of ['Fire', 'Water', 'Earth', 'Air'] as const) {
          const normalized = recipe.elementalProperties[elem] / total;
          alignment += 1 - Math.abs(normalized - profile.elementBias[elem]);
        }
        score += Math.round((alignment / 4) * 10);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Check if a recipe's ruling planet is favored for the meal type.
   */
  isPlanetFavoredForMeal(planet: Planet, mealType?: MealType): boolean {
    const type = mealType ?? this.getCurrentMealType();
    return MEAL_PROFILES[type].favoredPlanets.includes(planet);
  }

  /**
   * Get the profile for a meal type.
   */
  getMealProfile(mealType: MealType): MealTypeProfile {
    return MEAL_PROFILES[mealType];
  }

  // --- Helpers ---

  private normalizeMealTypes(mealType: string | string[] | undefined): MealType[] {
    if (!mealType) return [];
    const types = Array.isArray(mealType) ? mealType : [mealType];
    return types
      .map((t) => t.toLowerCase().trim())
      .filter((t): t is MealType => ['breakfast', 'lunch', 'dinner', 'snack'].includes(t));
  }

  private parsePrepTime(recipe: Recipe): number | null {
    const timeStr = recipe.totalTime ?? recipe.prepTime ?? recipe.timeToMake;
    if (!timeStr) return null;

    const hourMatch = timeStr.match(/(\d+)\s*h/i);
    const minMatch = timeStr.match(/(\d+)\s*m/i);
    let minutes = 0;
    if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
    if (minMatch) minutes += parseInt(minMatch[1], 10);

    // Try plain number (assume minutes)
    if (minutes === 0) {
      const plain = parseInt(timeStr, 10);
      if (!isNaN(plain)) minutes = plain;
    }

    return minutes > 0 ? minutes : null;
  }
}
