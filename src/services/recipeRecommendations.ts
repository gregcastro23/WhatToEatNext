import { celestialCalculator } from './celestialCalculations';
import { logger } from '@/utils/logger';
import { createError } from '@/utils/errorHandling';
import type { Recipe, ScoredRecipe } from '@/types/recipe';
import type { ElementalProperties } from '@/types/alchemy';

interface RecommendationCriteria {
  celestialInfluence?: ElementalProperties;
  season?: string;
  timeOfDay?: string;
  dietaryRestrictions?: string[];
  previousMeals?: string[];
}

export class RecipeRecommender {
  private static instance: RecipeRecommender;

  private constructor() {}

  static getInstance(): RecipeRecommender {
    if (!RecipeRecommender.instance) {
      RecipeRecommender.instance = new RecipeRecommender();
    }
    return RecipeRecommender.instance;
  }

  recommendRecipes(
    recipes: Recipe[],
    criteria: RecommendationCriteria
  ): ScoredRecipe[] {
    try {
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw createError('INVALID_REQUEST', { context: 'Empty recipe list' });
      }

      // Get current celestial influences if not provided
      const celestialInfluence = criteria.celestialInfluence || 
        celestialCalculator.calculateCurrentInfluences();

      // Score and sort recipes
      const scoredRecipes = recipes.map(recipe => ({
        ...recipe,
        score: this.calculateRecipeScore(recipe, criteria)
      }))
      .sort((a, b) => b.score - a.score);

      // Always ensure at least one recommendation
      if (scoredRecipes.length === 0) {
        logger.warn('No recipes matched criteria, using fallback');
        return [this.getFallbackRecipe()];
      }

      return scoredRecipes;
    } catch (error) {
      logger.error('Error recommending recipes:', error);
      return [this.getFallbackRecipe()];
    }
  }

  private calculateRecipeScore(
    recipe: Recipe,
    criteria: RecommendationCriteria
  ): number {
    try {
      let score = 0;
      const weights = {
        elemental: 0.4,
        seasonal: 0.3,
        timeOfDay: 0.2,
        variety: 0.1
      };

      // Elemental alignment
      if (criteria.celestialInfluence && recipe.elementalProperties) {
        score += weights.elemental * this.calculateElementalAlignment(
          recipe.elementalProperties,
          criteria.celestialInfluence
        );
      }

      // Seasonal appropriateness
      if (criteria.season && recipe.season) {
        score += weights.seasonal * this.calculateSeasonalMatch(
          recipe.season,
          criteria.season
        );
      }

      // Time of day appropriateness
      if (criteria.timeOfDay && recipe.mealType) {
        score += weights.timeOfDay * this.calculateTimeMatch(
          recipe.mealType,
          criteria.timeOfDay
        );
      }

      // Variety (avoid recent meals)
      if (criteria.previousMeals) {
        score += weights.variety * this.calculateVarietyScore(
          recipe.name,
          criteria.previousMeals
        );
      }

      return Math.min(Math.max(score, 0), 1); // Normalize between 0 and 1
    } catch (error) {
      logger.error('Error calculating recipe score:', error);
      return 0;
    }
  }

  private calculateElementalAlignment(
    recipeElements: ElementalProperties,
    targetElements: ElementalProperties
  ): number {
    let alignment = 0;
    let total = 0;

    Object.keys(targetElements).forEach(element => {
      const key = element as keyof ElementalProperties;
      const diff = Math.abs(
        (recipeElements[key] || 0) - (targetElements[key] || 0)
      );
      alignment += 1 - diff;
      total += 1;
    });

    return total > 0 ? alignment / total : 0;
  }

  private calculateSeasonalMatch(
    recipeSeasons: string[],
    currentSeason: string
  ): number {
    return recipeSeasons.includes('all') || 
           recipeSeasons.includes(currentSeason.toLowerCase()) ? 1 : 0;
  }

  private calculateTimeMatch(
    recipeMealTypes: string[],
    currentTime: string
  ): number {
    return recipeMealTypes.includes(currentTime.toLowerCase()) ? 1 : 0;
  }

  private calculateVarietyScore(
    recipeName: string,
    previousMeals: string[]
  ): number {
    const recentIndex = previousMeals.indexOf(recipeName);
    if (recentIndex === -1) return 1; // Not recently eaten
    return 1 - ((previousMeals.length - recentIndex) / previousMeals.length);
  }

  private getFallbackRecipe(): ScoredRecipe {
    return {
      name: "Universal Balance Bowl",
      description: "A harmonious blend for any occasion",
      ingredients: [
        { name: "Mixed Greens", amount: 2, unit: "cups" },
        { name: "Quinoa", amount: 1, unit: "cup" },
        { name: "Mixed Seeds", amount: 0.25, unit: "cup" }
      ],
      elementalProperties: {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25
      },
      season: ["all"],
      mealType: ["lunch", "dinner"],
      timeToMake: "20 minutes",
      score: 0.75
    };
  }
}

export const recipeRecommender = RecipeRecommender.getInstance(); 