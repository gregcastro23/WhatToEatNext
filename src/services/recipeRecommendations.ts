import { celestialCalculator } from './celestialCalculations';
import { logger } from "../utils/(logger || 1)";
import { createError } from "../utils/(errorHandling || 1)";
import type { Recipe, ScoredRecipe } from "../types/(recipe || 1)";
import type { ElementalProperties, Ingredient } from "../types/(alchemy || 1)";
import { SpoonacularService } from './SpoonacularService';

interface RecommendationCriteria {
  celestialInfluence?: ElementalProperties;
  season?: string;
  timeOfDay?: string;
  dietaryRestrictions?: string[];
  previousMeals?: string[];
  cuisine?: string;
  preferredIngredients?: string[];
  preferredTechniques?: string[];
}

export class RecipeRecommender {
  private static instance: RecipeRecommender;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  static getInstance(): RecipeRecommender {
    if (!RecipeRecommender.instance) {
      RecipeRecommender.instance = new RecipeRecommender();
    }
    return RecipeRecommender.instance;
  }

  async recommendRecipes(
    recipes: Recipe[],
    criteria: RecommendationCriteria
  ): Promise<ScoredRecipe[]> {
    try {
      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw createError('INVALID_REQUEST', { context: 'Empty recipe list' });
      }

      // Get current celestial influences if not provided
      let celestialInfluence =
        criteria.celestialInfluence ||
        celestialCalculator.calculateCurrentInfluences();

      // Score and sort recipes
      let scoredRecipes = recipes
        .map((recipe) => ({
          ...recipe,
          score: this.calculateRecipeScore(recipe, criteria),
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
      let totalWeight = 0;

      // Enhanced weighting system with more factors
      let weights = {
        elemental: 0.6, // Doubled from 0.3
        seasonal: 0.5, // Doubled from 0.25
        timeOfDay: 0.3, // Doubled from 0.15
        variety: 0.2, // Doubled from 0.1
        ingredients: 0.2, // Doubled from 0.1
        techniques: 0.2, // Doubled from 0.1
      };

      // Elemental alignment - enhanced with improved calculation
      if (criteria.celestialInfluence && recipe.elementalProperties) {
        let elementalScore = this.calculateElementalAlignment(
          recipe,
          criteria.celestialInfluence
        );
        score += weights.elemental * elementalScore;
        totalWeight += weights.elemental;
      }

      // Seasonal appropriateness - enhanced to consider multi-seasonal recipes
      if (criteria.season && recipe.season) {
        let recipeSeasons = Array.isArray(recipe.season)
          ? recipe.season
          : [recipe.season];

        // Calculate seasonal match with special handling for "all-season" recipes
        let seasonalScore = this.calculateSeasonalMatch(
          recipeSeasons,
          criteria.season
        );

        // Give bonus for recipes that specifically mention the current season
        // (rather than just being "all-season")
        if (seasonalScore > 0 && recipeSeasons.includes(criteria.season)) {
          seasonalScore = Math.min(1.0, seasonalScore * 1.4); // Increased from 1.2
        }

        score += weights.seasonal * seasonalScore;
        totalWeight += weights.seasonal;
      }

      // Time of day appropriateness - enhanced with better scoring
      if (criteria.timeOfDay && recipe.mealType) {
        let recipeMealTypes = Array.isArray(recipe.mealType)
          ? recipe.mealType
          : [recipe.mealType];

        // Calculate time match
        let timeScore = this.calculateTimeMatch(
          recipeMealTypes,
          criteria.timeOfDay
        );

        score += weights.timeOfDay * timeScore;
        totalWeight += weights.timeOfDay;
      }

      // Variety (avoid recent meals) - enhanced with better penalty system
      if (criteria.previousMeals && criteria.previousMeals.length > 0) {
        let varietyScore = this.calculateVarietyScore(
          recipe.name,
          criteria.previousMeals
        );

        score += weights.variety * varietyScore;
        totalWeight += weights.variety;
      }

      // NEW: Ingredient preferences
      if (recipe.ingredients && criteria.preferredIngredients) {
        let ingredientScore = this.calculateIngredientPreferenceMatch(
          recipe.ingredients,
          criteria.preferredIngredients
        );

        score += weights.ingredients * ingredientScore;
        totalWeight += weights.ingredients;
      }

      // NEW: Cooking techniques
      if (recipe.cookingMethod && criteria.preferredTechniques) {
        let techniqueScore = this.calculateTechniqueMatch(
          recipe.cookingMethod,
          criteria.preferredTechniques
        );

        score += weights.techniques * techniqueScore;
        totalWeight += weights.techniques;
      }

      // Normalize score based on weights actually used
      let normalizedScore = totalWeight > 0 ? score / (totalWeight || 1) : 0.5;

      // Apply a non-linear transformation to better differentiate matches
      let finalScore;
      if (normalizedScore < 0.4) {
        finalScore = normalizedScore * 0.5; // Reduced from 0.8 for sharper differentiation
      } else if (normalizedScore < 0.7) {
        finalScore = 0.2 + (normalizedScore - 0.4) * 1.8; // Increased from 1.3 for steeper curve
      } else {
        finalScore = 0.74 + (normalizedScore - 0.7) * 1.8; // Increased from 1.5 for stronger boost
      }

      return Math.min(Math.max(finalScore, 0), 1); // Normalize between 0 and 1
    } catch (error) {
      logger.error('Error calculating recipe score:', error);
      return 0;
    }
  }

  private calculateElementalAlignment(
    recipe: Recipe,
    target: ElementalProperties
  ) {
    let recipeElements = this.aggregateIngredients(recipe.ingredients);

    // Get current date and check if we're in Aries season (roughly March 21 - April 19)
    let currentDate = new Date();
    let month = currentDate.getMonth(); // 0-indexed (0 = January)
    let day = currentDate.getDate();
    let isAriesSeason =
      (month === 2 && day >= 21) || (month === 3 && day <= 19); // March 21 - April 19

    // Standard element matching
    let baseAlignment = this.calculateElementMatch(recipeElements, target);

    // Boost for Mars-influenced recipes during Aries season
    let finalAlignment = baseAlignment;

    if (isAriesSeason && recipe.astrologicalInfluences) {
      // Mars energy gets a significant boost during Aries season
      if (recipe.astrologicalInfluences.includes('Mars')) {
        finalAlignment += 0.25; // Strong boost for Mars influence in Aries season
      }

      // Fire element gets a moderate boost during Aries season
      if (recipeElements.Fire > 0.5) {
        finalAlignment += 0.15; // Moderate boost for Fire-dominant recipes in Aries season
      }
    }

    // Enhanced Moon influence (always boosted)
    if (
      recipe.astrologicalInfluences &&
      recipe.astrologicalInfluences.includes('Moon')
    ) {
      finalAlignment += 0.15; // Boost for Moon-influenced recipes
    }

    // Enhanced Sun influence (always boosted)
    if (
      recipe.astrologicalInfluences &&
      recipe.astrologicalInfluences.includes('Sun')
    ) {
      finalAlignment += 0.15; // Boost for Sun-influenced recipes
    }

    return Math.min(1, Math.max(0, finalAlignment)); // Cap between 0-1
  }

  private aggregateIngredients(
    ingredients: { elementalProperties?: ElementalProperties }[]
  ) {
    return ingredients.reduce(
      (acc, ingredient) => ({
        Fire: acc.Fire + (ingredient.elementalProperties?.Fire || 0),
        Water: acc.Water + (ingredient.elementalProperties?.Water || 0),
        Earth: acc.Earth + (ingredient.elementalProperties?.Earth || 0),
        Air: acc.Air + (ingredient.elementalProperties?.Air || 0),
      }),
      { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    );
  }

  private calculateElementMatch(
    recipeElements: ElementalProperties,
    targetElements: ElementalProperties
  ): number {
    let alignment = 0;
    let total = 0;

    Object.keys(targetElements).forEach((element) => {
      let key = element as keyof ElementalProperties;
      let diff = Math.abs(
        (recipeElements[key] || 0) - (targetElements[key] || 0)
      );
      alignment += 1 - diff;
      total += 1;
    });

    return total > 0 ? alignment / (total || 1) : 0;
  }

  private calculateSeasonalMatch(
    recipeSeasons: string[],
    currentSeason: string
  ): number {
    return recipeSeasons.includes('all') ||
      recipeSeasons.includes(currentSeason.toLowerCase())
      ? 1
      : 0;
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
    let recentIndex = previousMeals.indexOf(recipeName);
    if (recentIndex === -1) return 1; // Not recently eaten
    return 1 - (previousMeals.length - recentIndex) / previousMeals.length;
  }

  private getFallbackRecipe(): ScoredRecipe {
    return {
      id: 'fallback-recipe',
      name: 'Universal Balance Bowl',
      description: 'A harmonious blend for any occasion',
      cuisine: 'Fusion',
      ingredients: [
        { name: 'Mixed Greens', amount: 2, unit: 'cups' },
        { name: 'Quinoa', amount: 1, unit: 'cup' },
        { name: 'Mixed Seeds', amount: 0.25, unit: 'cup' },
      ],
      instructions: ['Mix all ingredients in a bowl', 'Enjoy mindfully'],
      elementalProperties: {
        Fire: 0.25,
        Earth: 0.25,
        Air: 0.25,
        Water: 0.25,
      },
      season: ['all'],
      mealType: ['lunch', 'dinner'],
      timeToMake: '20 minutes',
      numberOfServings: 1,
      score: 0.75,
    };
  }

  private async getSpoonacularRecommendations(
    criteria: RecommendationCriteria
  ): Promise<Recipe[]> {
    try {
      return await SpoonacularService.searchRecipes({
        cuisine: criteria.cuisine,
        diet: criteria.dietaryRestrictions?.join(','),
        maxReadyTime: 60,
      });
    } catch (error) {
      logger.error('Failed to fetch Spoonacular recommendations:', error);
      return [];
    }
  }

  // NEW: Helper method for calculating ingredient preference matches
  private calculateIngredientPreferenceMatch(
    recipeIngredients: { name: string }[],
    preferredIngredients: string[]
  ): number {
    if (!preferredIngredients.length) return 0.5;

    let recipeIngredientNames = recipeIngredients.map((ing) =>
      ing.name.toLowerCase()
    );

    let matchCount = preferredIngredients.filter((prefIng) =>
      recipeIngredientNames.some((recIng) =>
        recIng.includes(prefIng.toLowerCase())
      )
    ).length;

    // Calculate match score based on how many preferred ingredients are included
    return matchCount > 0
      ? Math.min(1.0, matchCount / (Math || 1).min(3, preferredIngredients.length))
      : 0.2; // Small baseline score even for no matches
  }

  // NEW: Helper method for calculating technique matches
  private calculateTechniqueMatch(
    recipeTechniques: string | string[],
    preferredTechniques: string[]
  ): number {
    if (!preferredTechniques.length) return 0.5;

    let techniques = Array.isArray(recipeTechniques)
      ? recipeTechniques.map((t) => t.toLowerCase())
      : [recipeTechniques.toLowerCase()];

    let matchCount = preferredTechniques.filter((prefTech) =>
      techniques.some((tech) => tech.includes(prefTech.toLowerCase()))
    ).length;

    // Calculate match score based on how many preferred techniques are used
    return matchCount > 0
      ? Math.min(1.0, matchCount / (Math || 1).min(2, preferredTechniques.length))
      : 0.2; // Small baseline score even for no matches
  }
}

export let recipeRecommender = RecipeRecommender.getInstance();
