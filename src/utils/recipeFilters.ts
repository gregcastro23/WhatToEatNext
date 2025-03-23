import { logger } from './logger';
import type { Recipe, ScoredRecipe } from '@/types/recipe';
import type { ElementalProperties, DietaryRestriction } from '@/types/alchemy';
import { cuisines } from '@/data/cuisines';
import type { Cuisine, CuisineType } from '@/types/cuisine';

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
    dairyFree?: boolean;
  };
  excludedIngredients?: string[];
  favoriteIngredients?: string[];
  cookingTime?: {
    min?: number;
    max?: number;
  };
}

export class RecipeFilter {
  private static instance: RecipeFilter;

  private constructor() {}

  static getInstance(): RecipeFilter {
    if (!RecipeFilter.instance) {
      RecipeFilter.instance = new RecipeFilter();
    }
    return RecipeFilter.instance;
  }

  filterAndSortRecipes(
    recipes: Recipe[],
    filterOptions: FilterOptions,
    sortOptions: SortOptions
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

  private applyFilters(recipes: Recipe[], options: FilterOptions): Recipe[] {
    return recipes.filter(recipe => {
      try {
        // Season filter
        if (options.season && 
            !recipe.season?.includes(options.season) && 
            !recipe.season?.includes('all')) {
          return false;
        }

        // Meal type filter
        if (options.mealType?.length && 
            !options.mealType.some(type => recipe.mealType?.includes(type))) {
          return false;
        }

        // Prep time filter
        if (options.maxPrepTime && 
            this.parseTime(recipe.timeToMake) > options.maxPrepTime) {
          return false;
        }

        // Dietary restrictions filter
        if (options.dietaryRestrictions?.length) {
          const meetsRestrictions = options.dietaryRestrictions.every(
            restriction => this.meetsRestriction(recipe, restriction)
          );
          if (!meetsRestrictions) return false;
        }

        // Ingredients filter
        if (options.ingredients?.length) {
          const hasIngredients = options.ingredients.every(
            ingredient => recipe.ingredients.some(
              ri => ri.name.toLowerCase().includes(ingredient.toLowerCase())
            )
          );
          if (!hasIngredients) return false;
        }

        // Search query filter
        if (options.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          const matchesSearch = 
            recipe.name.toLowerCase().includes(query) ||
            recipe.description?.toLowerCase().includes(query) ||
            recipe.ingredients.some(
              i => i.name.toLowerCase().includes(query)
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

  private enhancedScoreRecipes(recipes: Recipe[], options: EnhancedFilterOptions): ScoredRecipe[] {
    return recipes.map(recipe => {
      try {
        let score = 1;

        // Elemental balance score
        if (options.elementalState) {
          score *= this.calculateElementalScore(
            recipe.elementalProperties,
            options.elementalState
          );
        }

        // Seasonal score
        if (options.season) {
          score *= recipe.season?.includes(options.season) ? 1 : 0.5;
        }

        // Search relevance score
        if (options.searchQuery) {
          score *= this.calculateSearchRelevance(recipe, options.searchQuery);
        }

        // Cuisine score
        if (options.cuisineTypes?.length) {
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

        return {
          ...recipe,
          score
        };
      } catch (error) {
        logger.error('Error scoring recipe:', { recipe, error });
        return { ...recipe, score: 0 };
      }
    });
  }

  private sortRecipes(recipes: ScoredRecipe[], options: SortOptions): ScoredRecipe[] {
    try {
      return [...recipes].sort((a, b) => {
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
        }

        return options.direction === 'desc' ? comparison : -comparison;
      });
    } catch (error) {
      logger.error('Error sorting recipes:', error);
      return recipes;
    }
  }

  private parseTime(timeString: string): number {
    try {
      const minutes = timeString.match(/(\d+)\s*min/i);
      const hours = timeString.match(/(\d+)\s*h/i);
      return (hours ? parseInt(hours[1]) * 60 : 0) + 
             (minutes ? parseInt(minutes[1]) : 0);
    } catch (error) {
      logger.error('Error parsing time:', { timeString, error });
      return 0;
    }
  }

  private meetsRestriction(recipe: Recipe, restriction: DietaryRestriction): boolean {
    // Implementation depends on your dietary restriction system
    return true; // Placeholder
  }

  private calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties
  ): number {
    if (!recipeElements || !targetElements) return 1;

    try {
      let score = 0;
      let total = 0;

      Object.keys(targetElements).forEach(element => {
        const key = element as keyof ElementalProperties;
        const diff = Math.abs(
          (recipeElements[key] || 0) - (targetElements[key] || 0)
        );
        score += 1 - diff;
        total += 1;
      });

      return total > 0 ? score / total : 1;
    } catch (error) {
      logger.error('Error calculating elemental score:', error);
      return 1;
    }
  }

  private calculateSearchRelevance(recipe: Recipe, query: string): number {
    try {
      const queryLower = query.toLowerCase();
      let score = 0;

      // Name match (highest weight)
      if (recipe.name.toLowerCase().includes(queryLower)) score += 0.5;

      // Description match
      if (recipe.description?.toLowerCase().includes(queryLower)) score += 0.3;

      // Ingredient match
      if (recipe.ingredients.some(i => i.name.toLowerCase().includes(queryLower))) {
        score += 0.2;
      }

      return Math.min(score + 0.1, 1); // Minimum score of 0.1
    } catch (error) {
      logger.error('Error calculating search relevance:', error);
      return 0.1;
    }
  }

  private getelementalState(recipe: ScoredRecipe): number {
    try {
      if (!recipe.elementalProperties) return 0;
      const values = Object.values(recipe.elementalProperties);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      return values.reduce((sum, val) => sum + Math.abs(val - avg), 0);
    } catch (error) {
      logger.error('Error calculating elemental balance:', error);
      return 0;
    }
  }

  private getSeasonalScore(recipe: ScoredRecipe): number {
    return recipe.season?.includes('all') ? 1 : 0;
  }

  private getFallbackRecipes(recipes: Recipe[]): ScoredRecipe[] {
    return recipes.slice(0, 3).map(recipe => ({
      ...recipe,
      score: 0.5
    }));
  }

  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    if (!cuisineTypes?.length) return recipes;

    return recipes.filter(recipe => {
      try {
        return cuisineTypes.some(cuisineType => {
          const cuisine = cuisines[cuisineType];
          return cuisine?.dishes.some(dish => 
            dish.name === recipe.name || 
            dish.variants?.includes(recipe.name)
          );
        });
      } catch (error) {
        logger.error('Error filtering by cuisine:', error);
        return true; // Include recipe if error occurs
      }
    });
  }

  private applyEnhancedFilters(recipes: Recipe[], options: EnhancedFilterOptions): Recipe[] {
    return recipes.filter(recipe => {
      try {
        // Previous filters...

        // Cuisine type filter
        if (options.cuisineTypes?.length) {
          const matchesCuisine = this.filterByCuisine([recipe], options.cuisineTypes).length > 0;
          if (!matchesCuisine) return false;
        }

        // Spiciness filter
        if (options.spiciness && recipe.spiciness && 
            recipe.spiciness !== options.spiciness) {
          return false;
        }

        // Temperature filter
        if (options.temperature && recipe.servedAt && 
            recipe.servedAt !== options.temperature) {
          return false;
        }

        // Complexity filter
        if (options.complexity && recipe.complexity && 
            recipe.complexity !== options.complexity) {
          return false;
        }

        // Cooking method filter
        if (options.cookingMethod?.length && 
            !options.cookingMethod.includes(recipe.cookingMethod)) {
          return false;
        }

        // Serving size filter
        if (options.servingSize && recipe.servings && 
            recipe.servings < options.servingSize) {
          return false;
        }

        // Nutritional preferences
        if (options.nutritionalPreferences) {
          const np = options.nutritionalPreferences;
          if (np.vegetarian && !recipe.isVegetarian) return false;
          if (np.vegan && !recipe.isVegan) return false;
          if (np.glutenFree && !recipe.isGlutenFree) return false;
          if (np.dairyFree && !recipe.isDairyFree) return false;
          if (np.highProtein && !recipe.isHighProtein) return false;
          if (np.lowCarb && !recipe.isLowCarb) return false;
        }

        // Excluded ingredients
        if (options.excludedIngredients?.length) {
          const hasExcluded = options.excludedIngredients.some(excluded =>
            recipe.ingredients.some(ing => 
              ing.name.toLowerCase().includes(excluded.toLowerCase())
            )
          );
          if (hasExcluded) return false;
        }

        // Favorite ingredients boost
        if (options.favoriteIngredients?.length) {
          const hasFavorite = options.favoriteIngredients.some(favorite =>
            recipe.ingredients.some(ing => 
              ing.name.toLowerCase().includes(favorite.toLowerCase())
            )
          );
          recipe.favoriteScore = hasFavorite ? 1.5 : 1;
        }

        // Cooking time range
        if (options.cookingTime) {
          const time = this.parseTime(recipe.timeToMake);
          if (options.cookingTime.min && time < options.cookingTime.min) return false;
          if (options.cookingTime.max && time > options.cookingTime.max) return false;
        }

        return true;
      } catch (error) {
        logger.error('Error applying enhanced filters:', { recipe, error });
        return true; // Include recipe if error occurs
      }
    });
  }

  private calculateCuisineScore(recipe: Recipe, cuisineTypes?: CuisineType[]): number {
    if (!cuisineTypes?.length) return 1;

    try {
      const matchingCuisines = cuisineTypes.filter(cuisineType => {
        const cuisine = cuisines[cuisineType];
        return cuisine?.dishes.some(dish => 
          dish.name === recipe.name || 
          dish.variants?.includes(recipe.name)
        );
      });

      return matchingCuisines.length > 0 ? 1.5 : 0.5;
    } catch (error) {
      logger.error('Error calculating cuisine score:', error);
      return 1;
    }
  }
}

export const recipeFilter = RecipeFilter.getInstance(); 