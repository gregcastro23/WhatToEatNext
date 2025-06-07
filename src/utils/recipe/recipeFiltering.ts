import { logger } from '../logger';
import { Recipe } from '@/types/recipe';

import type { ElementalProperties,
  DietaryRestriction,
  IngredientMapping } from "@/types/alchemy";
import { cuisinesMap } from '../../data/cuisines';
import { CuisineType } from "@/types/cuisine";
import { calculateMatchScore } from './recipeMatching';

import { Element } from "@/types/alchemy";

// ===== INTERFACES =====

interface FilterOptions {
  season?: string;
  mealType?: string[];
  maxPrepTime?: number;
  dietaryRestrictions?: DietaryRestriction[];
  ingredients?: string[];
  elementalState?: ElementalProperties;
  searchQuery?: string;
}

interface SortOptions {
  by: 'relevance' | 'prepTime' | 'elementalState' | 'seasonal';
  direction: 'asc' | 'desc';
}

interface EnhancedFilterOptions extends FilterOptions {
  cuisineTypes?: CuisineType[];
  spiciness?: 'mild' | 'medium' | 'hot';
  temperature?: 'hot' | 'cold' | 'room';
  complexity?: 'simple' | 'moderate' | 'complex';
  cookingMethod?: string[];
  servingSize?: number;
  nutritionalPreferences?: {
    highProtein?: boolean;
    lowCarb?: boolean;
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dAiryFree?: boolean;
  };
  excludedIngredients?: string[];
  favoriteIngredients?: string[];
  cookingTime?: {
    min?: number;
    max?: number;
  };
}

interface ScoredRecipe extends Recipe {
  score: number;
}

// ===== MAIN RECIPE FILTER CLASS =====

export class RecipeFilter {
  private static instance: RecipeFilter;

  private constructor() {
    // Intentionally empty - initialization happens in methods
  }

  static getInstance(): RecipeFilter {
    if (!RecipeFilter.instance) {
      RecipeFilter.instance = new RecipeFilter();
    }
    return RecipeFilter.instance;
  }

  /**
   * Main filtering and sorting method
   */
  filterAndSortRecipes(
    recipes: Recipe[],
    filterOptions: FilterOptions,
    sortOptions: SortOptions,
  ): ScoredRecipe[] {
    try {
      const filtered = this.applyFilters(recipes, filterOptions);
      const scored = this.enhancedScoreRecipes(filtered, filterOptions);
      return this.sortRecipes(scored, sortOptions);
    } catch (error) {
      logger.error('Error filtering recipes:', error);
      return this.getFallbackRecipes(recipes);
    }
  }

  /**
   * Apply basic filters to recipes
   */
  private applyFilters(recipes: Recipe[], options: FilterOptions): Recipe[] {
    return (recipes || []).filter((recipe) => {
      try {
        // Season filter
        if (
          options.currentSeason &&
          !(recipe.currentSeason && (Array.isArray(recipe.currentSeason) ? recipe.currentSeason.includes(options.currentSeason) : recipe.currentSeason === options.currentSeason)) &&
          !(recipe.currentSeason && (Array.isArray(recipe.currentSeason) ? recipe.currentSeason.includes(options.currentSeason) : recipe.currentSeason === options.currentSeason))
        ) {
          return false;
        }

        // Meal type filter
        if (
          options.mealType?.length &&
          !options.mealType?.some((type) => recipe.mealType?.includes(type))
        ) {
          return false;
        }

        // Prep time filter
        if (
          options.maxPrepTime &&
          this.parseTime(recipe.timeToMake) > options.maxPrepTime
        ) {
          return false;
        }

        // Dietary restrictions filter
        if (options.dietaryRestrictions && options.dietaryRestrictions.length > 0) {
          const meetsRestrictions = options.dietaryRestrictions.every(
            (restriction) => this.meetsRestriction(recipe, restriction)
          );
          if (!meetsRestrictions) return false;
        }

        // Ingredients filter
        if (options.ingredients && options.ingredients.length > 0) {
          const hasIngredients = options.ingredients.every((ingredient) =>
            (recipe.ingredients || []).some((ri) =>
              ri.name?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          );
          if (!hasIngredients) return false;
        }

        // Search query filter
        if (options.searchQuery) {
          const query = options.searchQuery?.toLowerCase();
          const matchesSearch =
            recipe.name?.toLowerCase()?.includes(query) ||
            recipe.description?.toLowerCase()?.includes(query) ||
            (recipe.ingredients || []).some((i) =>
              i.name?.toLowerCase()?.includes(query)
            );
          if (!matchesSearch) return false;
        }

        return true;
      } catch (error) {
        logger.error('Error filtering recipe:', { recipe, error });
        return false;
      }
    });
  }

  /**
   * Apply enhanced filters with more complex criteria
   */
  private applyEnhancedFilters(
    recipes: Recipe[],
    options: EnhancedFilterOptions,
  ): Recipe[] {
    return (recipes || []).filter((recipe) => {
      try {
        // Spiciness filter
        if (options.spiciness && recipe.spiciness !== options.spiciness) {
          return false;
        }

        // Temperature filter
        if (options.temperature && recipe.temperature !== options.temperature) {
          return false;
        }

        // Complexity filter
        if (options.complexity && recipe.complexity !== options.complexity) {
          return false;
        }

        // Cooking method filter
        if ((options.cookingMethod && options.cookingMethod.length > 0)) {
          const hasMethod = (options.cookingMethod || []).some((method) =>
            recipe.cookingMethods?.toLowerCase()?.includes(method?.toLowerCase())
          );
          if (!hasMethod) return false;
        }

        // Serving size filter
        if (options.servingSize && recipe.numberOfServings !== options.servingSize) {
          return false;
        }

        // Nutritional preferences
        if (options.nutritionalPreferences) {
          const prefs = options.nutritionalPreferences;
          
          if (prefs.highProtein && !this.hasHighProtein(recipe)) return false;
          if (prefs.lowCarb && !this.hasLowCarb(recipe)) return false;
          if (prefs.vegetarian && !recipe.isVegetarian) return false;
          if (prefs.vegan && !recipe.isVegan) return false;
          if (prefs.glutenFree && !recipe.isGlutenFree) return false;
          if (prefs.dAiryFree && !recipe.isDAiryFree) return false;
        }

        // Excluded ingredients
        if ((options.excludedIngredients && options.excludedIngredients.length > 0)) {
          const hasExcluded = (options.excludedIngredients || []).some((excluded) =>
            (recipe.ingredients || []).some((ingredient) =>
              ingredient.name?.toLowerCase()?.includes(ingredientRequirements?.avoided.toLowerCase())
            )
          );
          if (hasExcluded) return false;
        }

        // Cooking time range
        if (options.cookingTime) {
          const totalTime = this.parseTime(recipe.timeToMake);
          if (options.cookingTime.min && totalTime < options.cookingTime.min) return false;
          if (options.cookingTime.max && totalTime > options.cookingTime.max) return false;
        }

        return true;
      } catch (error) {
        logger.error('Error applying enhanced filters:', { recipe, error });
        return false;
      }
    });
  }

  /**
   * Score recipes based on various criteria
   */
  private enhancedScoreRecipes(
    recipes: Recipe[],
    options: EnhancedFilterOptions,
  ): ScoredRecipe[] {
    return (recipes || []).map((recipe) => {
      try {
        let score = 1;

        // Elemental balance score
        if (options.elementalState) {
          score *= this.calculateElementalScore(
            recipe.elementalState,
            options.elementalState
          );
        }

        // Seasonal score
        if (options.currentSeason) {
          score *= (recipe.season && recipe.season.includes(options.currentSeason)) ? 1 : 0.5;
        }

        // Search relevance score
        if (options.searchQuery) {
          score *= this.calculateSearchRelevance(recipe, options.searchQuery);
        }

        // Cuisine score
        if ((options.cuisineTypes && options.cuisineTypes.length > 0)) {
          score *= this.calculateCuisineScore(recipe, options.cuisineTypes);
        }

        // Favorite ingredients boost
        if (recipe.favoriteScore) {
          score *= recipe.favoriteScore;
        }

        // Complexity preference boost
        if (options.complexity && recipe.complexity === options.complexity) {
          score *= 1.2;
        }

        return { ...recipe,
          score };
      } catch (error) {
        logger.error('Error scoring recipe:', { recipe, error });
        return { ...recipe, score: 0 };
      }
    });
  }

  /**
   * Sort recipes based on specified criteria
   */
  private sortRecipes(
    recipes: ScoredRecipe[],
    options: SortOptions,
  ): ScoredRecipe[] {
    return recipes.sort((a, b) => {
      let comparison = 0;

      switch (options.by) {
        case 'relevance':
          comparison = (b.score || 0) - (a.score || 0);
          break;
        case 'prepTime':
          comparison = this.parseTime(a.timeToMake) - this.parseTime(b.timeToMake);
          break;
        case 'elementalState':
          comparison = this.getelementalState(b) - this.getelementalState(a);
          break;
        case 'seasonal':
          comparison = this.getSeasonalScore(b) - this.getSeasonalScore(a);
          break;
        default:
          comparison = (b.score || 0) - (a.score || 0);
      }

      return options.direction === 'desc' ? comparison : -comparison;
    });
  }

  // ===== HELPER METHODS =====

  /**
   * Parse time string to minutes
   */
  private parseTime(timeString: string): number {
    if (!timeString) return 0;
    
    const match = timeString.match(/(\d+)/);
    if (match) {
      const time = parseInt(match[1]);
      if (timeString?.toLowerCase()?.includes('hour')) {
        return time * 60;
      }
      return time;
    }
    return 0;
  }

  /**
   * Check if recipe meets dietary restriction
   */
  private meetsRestriction(
    recipe: Recipe,
    restriction: DietaryRestriction,
  ): boolean {
    switch (restriction) {
      case 'vegetarian':
        return recipe.isVegetarian || false;
      case 'vegan':
        return recipe.isVegan || false;
      case 'gluten-free':
        return recipe.isGlutenFree || false;
      case 'dAiry-free':
        return recipe.isDAiryFree || false;
      case 'keto':
        return this.hasKetoAttributes(recipe);
      case 'paleo':
        return this.hasPaleoAttributes(recipe);
      default:
        return true;
    }
  }

  /**
   * Check if recipe has keto-friendly attributes
   */
  private hasKetoAttributes(recipe: Recipe): boolean {
    if (!recipe.nutrition) return false;
    
    const carbs = recipe.nutrition.carbs || 0;
    const fat = recipe.nutrition.fat || 0;
    const protein = recipe.nutrition.protein || 0;
    
    // Keto typically requires <20g carbs and high fat
    if (carbs > 20) return false;
    if (fat < protein) return false; // Fat should be higher than protein
    
    // Check for keto-unfriendly ingredients
    const ketoUnfriendly = ['sugar', 'flour', 'bread', 'pasta', 'rice', 'potato'];
    const hasUnfriendlyIngredients = (recipe.ingredients || []).some(ingredient =>
      ketoUnfriendly.some(unfriendly => 
        ingredient.name?.toLowerCase()?.includes(unfriendly)
      )
    );
    
    return !hasUnfriendlyIngredients;
  }

  /**
   * Check if recipe has paleo-friendly attributes
   */
  private hasPaleoAttributes(recipe: Recipe): boolean {
    // Check for paleo-unfriendly ingredients
    const paleoUnfriendly = [
      'dAiry', 'milk', 'cheese', 'yogurt', 'butter',
      'grain', 'wheat', 'rice', 'oats', 'quinoa',
      'legume', 'bean', 'lentil', 'peanut',
      'sugar', 'artificial'
    ];
    
    const hasUnfriendlyIngredients = (recipe.ingredients || []).some(ingredient =>
      paleoUnfriendly.some(unfriendly => 
        ingredient.name?.toLowerCase()?.includes(unfriendly)
      )
    );
    
    return !hasUnfriendlyIngredients;
  }

  /**
   * Calculate elemental compatibility score
   */
  private calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties
  ): number {
    if (!recipeElements || !targetElements) return 1;

    let totalDifference = 0;
    let elementCount = 0;

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      if (recipeElements[element] !== undefined && targetElements[element] !== undefined) {
        totalDifference += Math.abs(recipeElements[element] - targetElements[element]);
        elementCount++;
      }
    }

    if (elementCount === 0) return 1;

    // Convert difference to similarity score (0-1)
    const averageDifference = totalDifference / elementCount;
    return Math.max(0, 1 - averageDifference);
  }

  /**
   * Calculate search relevance score
   */
  private calculateSearchRelevance(recipe: Recipe, query: string): number {
    let score = 0;
    const queryLower = query?.toLowerCase();

    // Name match (highest weight)
    if (recipe.name?.toLowerCase()?.includes(queryLower)) {
      score += 1;
    }

    // Description match (medium weight)
    if (recipe.description?.toLowerCase()?.includes(queryLower)) {
      score += 0.5;
    }

    // Ingredient match (lower weight)
    const ingredientMatches = (recipe.ingredients || []).filter(ingredient => ingredient.name?.toLowerCase()?.includes(queryLower)).length;
    score += ingredientMatches * 0.2;

    // Cuisine match
    if (recipe.cuisine?.toLowerCase()?.includes(queryLower)) {
      score += 0.3;
    }

    return Math.min(2, score); // Cap at 2x multiplier
  }

  /**
   * Get elemental state score for sorting
   */
  private getelementalState(recipe: ScoredRecipe): number {
    // Simple implementation - could be enhanced
    return recipe.score || 0;
  }

  /**
   * Get seasonal score for sorting
   */
  private getSeasonalScore(recipe: ScoredRecipe): number {
    return recipe.score || 0;
  }

  /**
   * Get fallback recipes if filtering fails
   */
  private getFallbackRecipes(recipes: Recipe[]): ScoredRecipe[] {
    return recipes?.slice(0, 10).map(recipe => ({ ...recipe, score: 0.5 }));
  }

  /**
   * Filter recipes by cuisine type
   */
  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    return (recipes || []).filter((recipe) => {
      if (!recipe.cuisine) return false;

      return (cuisineTypes || []).some((cuisineType) => {
        if (cuisinesMap[cuisineType]?.dishes) {
          const checkMatch = (
            dishName: string | { name: string } | null
          ): boolean => {
            if (!dishName) return false;
            const name = typeof dishName === 'string' ? dishName : dishName.name;
            return name?.toLowerCase() === recipe.name?.toLowerCase();
          };

          const dishes = cuisinesMap[cuisineType].dishes;
          return Object.values(dishes || {}).some((mealType) =>
            Object.values(mealType || {}).some((seasonDishes) => {
              if (Array.isArray(seasonDishes)) {
                return (seasonDishes || []).some(checkMatch);
              } else if (seasonDishes && typeof seasonDishes === 'object') {
                return checkMatch(seasonDishes);
              }
              return false;
            })
          );
        }
        return false;
      });
    });
  }

  /**
   * Calculate cuisine compatibility score
   */
  private calculateCuisineScore(
    recipe: Recipe,
    cuisineTypes?: CuisineType[]
  ): number {
    if (!(cuisineTypes && cuisineTypes.length > 0) || !recipe.cuisine) return 1;

    return (cuisineTypes || []).some((cuisineType) => {
      if (cuisinesMap[cuisineType]?.dishes) {
        const checkMatch = (
          dishName: string | { name: string } | null
        ): boolean => {
          if (!dishName) return false;
          const name = typeof dishName === 'string' ? dishName : dishName.name;
          return name?.toLowerCase() === recipe.name?.toLowerCase();
        };

        const dishes = cuisinesMap[cuisineType].dishes;
        return Object.values(dishes || {}).some((mealType) =>
          Object.values(mealType || {}).some((seasonDishes) => {
            if (Array.isArray(seasonDishes)) {
              return (seasonDishes || []).some(checkMatch);
            } else if (seasonDishes && typeof seasonDishes === 'object') {
              return checkMatch(seasonDishes);
            }
            return false;
          })
        );
      }
      return false;
    }) ? 1.2 : 0.8;
  }

  /**
   * Check if recipe has high protein content
   */
  private hasHighProtein(recipe: Recipe): boolean {
    if (!recipe.nutrition?.protein) return false;
    return recipe.nutrition.protein > 20; // >20g protein
  }

  /**
   * Check if recipe has low carb content
   */
  private hasLowCarb(recipe: Recipe): boolean {
    if (!recipe.nutrition?.carbs) return false;
    return recipe.nutrition.carbs < 30; // <30g carbs
  }

  /**
   * Get recipes for a specific cuisine
   */
  getRecipesForCuisine(
    cuisine: string,
    recipes: Recipe[],
  ): Recipe[] {
    return (recipes || []).filter((recipe) => {
      if (!recipe.cuisine) return false;
      return recipe.cuisine?.toLowerCase() === cuisine?.toLowerCase();
    });
  }
}

// ===== STANDALONE FUNCTIONS =====

/**
 * Filter recipes by ingredient mappings with enhanced scoring
 */
export function filterRecipesByIngredientMappings(
  recipes: Recipe[],
  elementalTarget?: ElementalProperties,
  ingredientRequirements?: {
    required?: string[];
    preferred?: string[];
    avoided?: string[];
  }
): Recipe[] {
  return (recipes || []).map((recipe) => {
    let score = 0.5; // Base score
    let matchedIngredients: {
      name: string;
      matchedTo?: IngredientMapping;
      confidence: number;
    }[] = [];

    try {
      // Connect ingredients to mappings
      const ingredientMappings = connectIngredientsToMappings(recipe);
      matchedIngredients = ingredientMappings;

      // Calculate elemental match if target provided
      if (elementalTarget && recipe.elementalState) {
        let elementalScore = 0;
        let elementCount = 0;

        for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
          if (recipe?.elementalState?.[element] !== undefined && 
              elementalTarget[element] !== undefined) {
            const difference = Math.abs(
              recipe?.elementalState?.[element] - elementalTarget[element]
            );
            elementalScore += 1 - difference;
            elementCount++;
          }
        }

        if (elementCount > 0) {
          score += (elementalScore / elementCount) * 0.4;
        }
      }

      // Check required ingredients
      if (ingredientRequirements?.(required || []).length) {
        const requiredMatches = ingredientRequirements?.(required || []).filter(required =>
          (recipe.ingredients || []).some(ingredient =>
            ingredient.name?.toLowerCase()?.includes(ingredientRequirements?.required.toLowerCase())
          )
        () || []).length;
        
        const requiredRatio = requiredMatches / (ingredientRequirements.required || []).length;
        score += requiredRatio * 0.3;
      }

      // Penalize excluded ingredients
      if (ingredientRequirements?.(excluded || []).length) {
        const excludedFound = ingredientRequirements?.(excluded || []).filter(excluded =>
          (recipe.ingredients || []).some(ingredient =>
            ingredient.name?.toLowerCase()?.includes(ingredientRequirements?.avoided.toLowerCase())
          )
        () || []).length;
        
        score -= excludedFound * 0.2;
      }

      // Boost emphasized ingredients
      if (ingredientRequirements?.(emphasized || []).length) {
        const emphasizedMatches = ingredientRequirements?.(emphasized || []).filter(emphasized =>
          (recipe.ingredients || []).some(ingredient =>
            ingredient.name?.toLowerCase()?.includes(emphasized?.toLowerCase())
          )
        () || []).length;
        
        score += emphasizedMatches * 0.1;
      }

      // Check dietary restrictions
      if (ingredientRequirements?.(dietaryRestrictions || []).length) {
        const meetsRestrictions = ingredientRequirements.dietaryRestrictions.every(restriction => {
          switch (restriction?.toLowerCase()) {
            case 'vegetarian':
              return recipe.isVegetarian || false;
            case 'vegan':
              return recipe.isVegan || false;
            case 'gluten-free':
              return recipe.isGlutenFree || false;
            case 'dAiry-free':
              return recipe.isDAiryFree || false;
            default:
              return true;
          }
        });
        
        if (!meetsRestrictions) {
          score *= 0.5; // Significant penalty for not meeting restrictions
        }
      }

      // Normalize score
      score = Math.max(0, Math.min(1, score));

      // Determine match quality
      let matchQuality = 'poor';
      if (score >= 0.8) matchQuality = 'excellent';
      else if (score >= 0.6) matchQuality = 'good';
      else if (score >= 0.4) matchQuality = 'fAir';

      return {
        recipe,
        score,
        matchQuality,
        matchedIngredients
      };
    } catch (error) {
      logger.error('Error filtering recipe by ingredient mappings:', { recipe, error });
      return {
        recipe,
        score: 0,
        matchQuality: 'error',
        matchedIngredients: [],
      };
    }
  }).sort((a, b) => b.score - a.score);
}

// Export the singleton instance
