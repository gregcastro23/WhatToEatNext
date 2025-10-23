/**
 * UnifiedScoringAdapter.ts
 *
 * This adapter provides a bridge between existing recommendation components
 * and the UnifiedScoringService. It handles the conversion of existing
 * data structures to the format expected by the UnifiedScoringService.
 */

import type { ElementalProperties, Season } from '../types/alchemy';
import type { Planet } from '../types/celestial';
import type { CookingMethod } from '../types/cooking';
import type { UnifiedIngredient } from '../types/ingredient';
import type { Recipe } from '../types/recipe';

import { scoreRecommendation, ScoringContext } from './UnifiedScoringService';

// ==================== INTERFACES ====================

export interface ScoringAdapterOptions {
  debugMode?: boolean;
  weights?: Record<string, number>;
  location?: {
    latitude: number;
    longitude: number;
    timezone: string;
    name: string;
  };
}

export interface ScoredItem<T> {
  item: T;
  score: number;
  confidence: number;
  breakdown: Record<string, number>;
  dominantEffects: string[];
  notes: string[];
  warnings: string[];
}

// ==================== ADAPTER CLASS ====================

export class UnifiedScoringAdapter {
  private static instance: UnifiedScoringAdapter;

  private constructor() {}

  public static getInstance(): UnifiedScoringAdapter {
    if (!UnifiedScoringAdapter.instance) {
      UnifiedScoringAdapter.instance = new UnifiedScoringAdapter();
    }
    return UnifiedScoringAdapter.instance;
  }

  /**
   * Score a single ingredient using the unified scoring system
   */
  async scoreIngredient(
    ingredient: UnifiedIngredient,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<UnifiedIngredient>> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: options.location || {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        name: 'New York City'
      },
      item: {
        name: ingredient.name,
        type: 'ingredient',
        elementalProperties: ingredient.elementalProperties || ingredient.elementalPropertiesState,
        seasonality: ingredient.seasonality || [],
        planetaryRulers: (ingredient.astrologicalProfile?.rulingPlanets || []) as Planet[],
        flavorProfile: (ingredient.flavorProfile as Record<string, number>) || {},
        culturalOrigins: (ingredient.culturalOrigins as string[]) || []
      },
      options: {
        debugMode: options.debugMode,
        weights: options.weights
      }
    };

    const result = await scoreRecommendation(context);

    return {
      item: ingredient,
      score: result.score,
      confidence: result.confidence,
      breakdown: result.breakdown,
      dominantEffects: result.metadata.dominantEffects,
      notes: result.notes,
      warnings: result.metadata.warnings
    };
  }

  /**
   * Score multiple ingredients and return sorted results
   */
  async scoreIngredients(
    ingredients: UnifiedIngredient[],
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<UnifiedIngredient>[]> {
    const scoredIngredients = await Promise.all(
      ingredients.map(ingredient => this.scoreIngredient(ingredient, options))
    );

    // Sort by score descending
    return scoredIngredients.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a recipe using the unified scoring system
   */
  async scoreRecipe(
    recipe: Recipe,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<Recipe>> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: options.location || {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        name: 'New York City'
      },
      item: {
        name: recipe.name,
        type: 'recipe',
        elementalProperties: (recipe.elementalState as ElementalProperties) ||
          recipe.elementalProperties || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
        seasonality: (recipe.seasonality as Season[]) || [],
        planetaryRulers: ((recipe as any).planetaryRulers as Planet[]) || [],
        flavorProfile: ((recipe as any).flavorProfile as Record<string, number>) || {},
        culturalOrigins: ((recipe as unknown as any).culturalOrigins as string[]) ||
          [String((recipe as unknown as any).cuisine || '')].filter(Boolean)
      },
      options: {
        debugMode: options.debugMode,
        weights: options.weights
      }
    };

    const result = await scoreRecommendation(context);

    return {
      item: recipe,
      score: result.score,
      confidence: result.confidence,
      breakdown: result.breakdown,
      dominantEffects: result.metadata.dominantEffects,
      notes: result.notes,
      warnings: result.metadata.warnings
    };
  }

  /**
   * Score a cooking method using the unified scoring system
   */
  async scoreCookingMethod(
    method: CookingMethod,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<CookingMethod>> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: options.location || {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        name: 'New York City'
      },
      item: {
        name: method.name,
        type: 'cooking_method',
        elementalProperties: ((method as unknown as any)
          .elementalEffect as ElementalProperties) || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        seasonality: ((method as unknown as any).seasonality as Season[]) || [],
        planetaryRulers: ((method as unknown as any).planetaryRulers as Planet[]) || [],
        flavorProfile: ((method as unknown as any).flavorProfile as Record<string, number>) || {},
        culturalOrigins: ((method as unknown as any).culturalOrigins as string[]) || []
      },
      options: {
        debugMode: options.debugMode,
        weights: options.weights
      }
    };

    const result = await scoreRecommendation(context);

    return {
      item: method,
      score: result.score,
      confidence: result.confidence,
      breakdown: result.breakdown,
      dominantEffects: result.metadata.dominantEffects,
      notes: result.notes,
      warnings: result.metadata.warnings
    };
  }

  /**
   * Score a cuisine type using the unified scoring system
   */
  async scoreCuisine(
    cuisineName: string,
    cuisineElementalProperties: ElementalProperties,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<string>> {
    const context: ScoringContext = {
      dateTime: new Date(),
      location: options.location || {
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
        name: 'New York City'
      },
      item: {
        name: cuisineName,
        type: 'cuisine',
        elementalProperties: cuisineElementalProperties,
        seasonality: [] as Season[],
        planetaryRulers: [] as Planet[],
        flavorProfile: {} as Record<string, number>,
        culturalOrigins: [cuisineName]
      },
      options: {
        debugMode: options.debugMode,
        weights: options.weights
      }
    };

    const result = await scoreRecommendation(context);

    return {
      item: cuisineName,
      score: result.score,
      confidence: result.confidence,
      breakdown: result.breakdown,
      dominantEffects: result.metadata.dominantEffects,
      notes: result.notes,
      warnings: result.metadata.warnings
    };
  }

  /**
   * Get recommended ingredients with unified scoring
   */
  async getRecommendedIngredients(
    ingredients: UnifiedIngredient[],
    minScore: number = 0.5,
    limit: number = 10,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<UnifiedIngredient>[]> {
    const scoredIngredients = await this.scoreIngredients(ingredients, options);

    return scoredIngredients.filter(item => item.score >= minScore).slice(0, limit);
  }

  /**
   * Get recommended recipes with unified scoring
   */
  async getRecommendedRecipes(
    recipes: Recipe[],
    minScore: number = 0.5,
    limit: number = 10,
    options: ScoringAdapterOptions = {}): Promise<ScoredItem<Recipe>[]> {
    const scoredRecipes = await Promise.all(
      recipes.map(recipe => this.scoreRecipe(recipe, options))
    );

    return scoredRecipes
      .filter(item => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

// Export convenience functions
export const scoreIngredient = (ingredient: UnifiedIngredient, options?: ScoringAdapterOptions) =>
  UnifiedScoringAdapter.getInstance().scoreIngredient(ingredient, options)

export const scoreIngredients = (
  ingredients: UnifiedIngredient[],
  options?: ScoringAdapterOptions,
) => UnifiedScoringAdapter.getInstance().scoreIngredients(ingredients, options)

export const scoreRecipe = (recipe: Recipe, options?: ScoringAdapterOptions) =>
  UnifiedScoringAdapter.getInstance().scoreRecipe(recipe, options)

export const getRecommendedIngredients = (
  ingredients: UnifiedIngredient[],
  minScore?: number,
  limit?: number,
  options?: ScoringAdapterOptions,
) =>
  UnifiedScoringAdapter.getInstance().getRecommendedIngredients(
    ingredients,
    minScore,
    limit,
    options,
  )

export const getRecommendedRecipes = (
  recipes: Recipe[],
  minScore?: number,
  limit?: number,
  options?: ScoringAdapterOptions,
) => UnifiedScoringAdapter.getInstance().getRecommendedRecipes(recipes, minScore, limit, options)
