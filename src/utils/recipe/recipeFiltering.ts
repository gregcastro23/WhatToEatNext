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
  currentSeason?: string;
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
        const recipeData = recipe as any;
        
        // Season filter
        if (options.currentSeason) {
          const recipeSeason = recipeData?.currentSeason || recipeData?.season;
          if (recipeSeason) {
            const seasonMatches = Array.isArray(recipeSeason) 
              ? recipeSeason.includes(options.currentSeason)
              : recipeSeason === options.currentSeason;
            if (!seasonMatches) return false;
          }
        }

        // Meal type filter
        if (options.mealType?.length) {
          const recipeMealType = recipeData?.mealType;
          if (recipeMealType) {
            const mealTypeMatches = Array.isArray(recipeMealType)
              ? options.mealType.some(type => recipeMealType.includes(type))
              : options.mealType.includes(recipeMealType);
            if (!mealTypeMatches) return false;
          }
        }

        // Prep time filter
        if (options.maxPrepTime) {
          const recipeTime = this.parseTime(recipeData?.timeToMake || '');
          if (recipeTime > options.maxPrepTime) return false;
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
          const recipeIngredients = recipeData?.ingredients || [];
          const hasIngredients = options.ingredients.every((ingredient) =>
            recipeIngredients.some((ri: any) =>
              ri?.name?.toLowerCase()?.includes(ingredient?.toLowerCase())
            )
          );
          if (!hasIngredients) return false;
        }

        // Search query filter
        if (options.searchQuery) {
          const query = options.searchQuery?.toLowerCase();
          const recipeIngredients = recipeData?.ingredients || [];
          const matchesSearch =
            recipeData?.name?.toLowerCase()?.includes(query) ||
            recipeData?.description?.toLowerCase()?.includes(query) ||
            recipeIngredients.some((i: any) =>
              i?.name?.toLowerCase()?.includes(query)
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
        const recipeData = recipe as any;
        
        // Spiciness filter
        if (options.spiciness && recipeData?.spiciness !== options.spiciness) {
          return false;
        }

        // Temperature filter
        if (options.temperature && recipeData?.temperature !== options.temperature) {
          return false;
        }

        // Complexity filter
        if (options.complexity && recipeData?.complexity !== options.complexity) {
          return false;
        }

        // Cooking method filter
        if (options.cookingMethod && options.cookingMethod.length > 0) {
          const recipeCookingMethods = recipeData?.cookingMethods;
          const hasMethod = options.cookingMethod.some((method) =>
            recipeCookingMethods?.toLowerCase()?.includes(method?.toLowerCase())
          );
          if (!hasMethod) return false;
        }

        // Serving size filter
        if (options.servingSize && recipeData?.numberOfServings !== options.servingSize) {
          return false;
        }

        // Nutritional preferences
        if (options.nutritionalPreferences) {
          const prefs = options.nutritionalPreferences;
          
          if (prefs.highProtein && !this.hasHighProtein(recipe)) return false;
          if (prefs.lowCarb && !this.hasLowCarb(recipe)) return false;
          if (prefs.vegetarian && !recipeData?.isVegetarian) return false;
          if (prefs.vegan && !recipeData?.isVegan) return false;
          if (prefs.glutenFree && !recipeData?.isGlutenFree) return false;
          if (prefs.dAiryFree && !recipeData?.isDAiryFree) return false;
        }

        // Excluded ingredients
        if (options.excludedIngredients && options.excludedIngredients.length > 0) {
          const recipeIngredients = recipeData?.ingredients || [];
          const hasExcluded = options.excludedIngredients.some((excluded) =>
            recipeIngredients.some((ingredient: any) =>
              ingredient?.name?.toLowerCase()?.includes(excluded?.toLowerCase())
            )
          );
          if (hasExcluded) return false;
        }

        // Cooking time range
        if (options.cookingTime) {
          const totalTime = this.parseTime(recipeData?.timeToMake || '');
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
        const recipeData = recipe as any;
        let score = 1;

        // Elemental balance score
        if (options.elementalState) {
          score *= this.calculateElementalScore(
            recipeData?.elementalState,
            options.elementalState
          );
        }

        // Search relevance score
        if (options.searchQuery) {
          score *= this.calculateSearchRelevance(recipe, options.searchQuery);
        }

        // Seasonal relevance score
        if (options.currentSeason) {
          const seasonalScore = this.getSeasonalScore({
            ...recipe,
            score: 1
          } as ScoredRecipe);
          score *= seasonalScore;
        }

        // Cuisine preference score
        if (options.cuisineTypes) {
          score *= this.calculateCuisineScore(recipe, options.cuisineTypes);
        }

        // Favorite ingredients bonus
        if (options.favoriteIngredients && options.favoriteIngredients.length > 0) {
          const recipeIngredients = recipeData?.ingredients || [];
          const favoriteCount = options.favoriteIngredients.filter(favorite =>
            recipeIngredients.some((ri: any) =>
              ri?.name?.toLowerCase()?.includes(favorite?.toLowerCase())
            )
          ).length;
          score *= (1 + favoriteCount * 0.1); // 10% bonus per favorite ingredient
        }

        return {
          ...recipe,
          score: Math.max(0.1, Math.min(2.0, score)) // Clamp score between 0.1 and 2.0
        } as ScoredRecipe;
      } catch (error) {
        logger.error('Error scoring recipe:', { recipe, error });
        return {
          ...recipe,
          score: 0.5
        } as ScoredRecipe;
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
      
      const aData = a as any;
      const bData = b as any;

      switch (options.by) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'prepTime':
          comparison = this.parseTime(aData?.timeToMake || '') - this.parseTime(bData?.timeToMake || '');
          break;
        case 'elementalState':
          comparison = this.getelementalState(b) - this.getelementalState(a);
          break;
        case 'seasonal':
          comparison = this.getSeasonalScore(b) - this.getSeasonalScore(a);
          break;
        default:
          comparison = b.score - a.score;
      }

      return options.direction === 'desc' ? comparison : -comparison;
    });
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeString: string): number {
    if (!timeString) return 0;
    
    try {
      const timeStr = timeString.toLowerCase();
      
      // Handle various time formats
      if (timeStr.includes('hour')) {
        const hours = parseFloat(timeStr.match(/(\d+(?:\.\d+)?)\s*hour/)?.[1] || '0');
        const minutes = parseFloat(timeStr.match(/(\d+)\s*min/)?.[1] || '0');
        return hours * 60 + minutes;
      } else if (timeStr.includes('min')) {
        return parseFloat(timeStr.match(/(\d+)\s*min/)?.[1] || '0');
      } else {
        // Try to parse as plain number (assume minutes)
        return parseFloat(timeStr) || 0;
      }
    } catch (error) {
      logger.error('Error parsing time:', { timeString, error });
      return 0;
    }
  }

  /**
   * Check if recipe meets dietary restriction
   */
  private meetsRestriction(
    recipe: Recipe,
    restriction: DietaryRestriction,
  ): boolean {
    const recipeData = recipe as any;
    
    switch (restriction) {
      case 'Vegetarian':
      case 'Vegan':
      case 'Gluten-Free':
      case 'Dairy-Free':
      case 'Keto':
      case 'Paleo':
        return recipeData?.tags?.includes(restriction.toLowerCase()) || false;
      default:
        return true;
    }
  }

  /**
   * Check if recipe has keto-friendly attributes
   */
  private hasKetoAttributes(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData?.ingredients || [];
    
    // Simple heuristic: low carb ingredients and high fat content
    const lowCarbIngredients = ['meat', 'fish', 'cheese', 'oil', 'butter', 'avocado'];
    const hasLowCarbIngredients = ingredients.some((ingredient: any) =>
      lowCarbIngredients.some(lowCarb => 
        ingredient?.name?.toLowerCase()?.includes(lowCarb)
      )
    );
    
    const highCarbIngredients = ['bread', 'pasta', 'rice', 'potato', 'sugar'];
    const hasHighCarbIngredients = ingredients.some((ingredient: any) =>
      highCarbIngredients.some(highCarb => 
        ingredient?.name?.toLowerCase()?.includes(highCarb)
      )
    );
    
    return hasLowCarbIngredients && !hasHighCarbIngredients;
  }

  /**
   * Check if recipe has paleo-friendly attributes
   */
  private hasPaleoAttributes(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData?.ingredients || [];
    
    const paleoIngredients = ['meat', 'fish', 'vegetables', 'fruits', 'nuts', 'seeds'];
    const nonPaleoIngredients = ['dairy', 'grains', 'legumes', 'processed'];
    
    const hasPaleoIngredients = ingredients.some((ingredient: any) =>
      paleoIngredients.some(paleo => 
        ingredient?.name?.toLowerCase()?.includes(paleo)
      )
    );
    
    const hasNonPaleoIngredients = ingredients.some((ingredient: any) =>
      nonPaleoIngredients.some(nonPaleo => 
        ingredient?.name?.toLowerCase()?.includes(nonPaleo)
      )
    );
    
    return hasPaleoIngredients && !hasNonPaleoIngredients;
  }

  /**
   * Calculate elemental compatibility score
   */
  private calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties
  ): number {
    if (!recipeElements || !targetElements) return 0.5;

    try {
      const recipeElementsData = recipeElements as any;
      const targetElementsData = targetElements as any;
      
      const elements = ['Fire', 'Water', 'Earth', 'Air'];
      let totalScore = 0;

      elements.forEach(element => {
        const recipeValue = recipeElementsData?.[element] || 0;
        const targetValue = targetElementsData?.[element] || 0;
        
        // Calculate similarity (inverse of difference)
        const difference = Math.abs(recipeValue - targetValue);
        const similarity = 1 - difference;
        totalScore += Math.max(0, similarity);
      });

      return totalScore / elements.length;
    } catch (error) {
      logger.error('Error calculating elemental score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate search relevance score
   */
  private calculateSearchRelevance(recipe: Recipe, query: string): number {
    if (!query) return 1;

    const recipeData = recipe as any;
    const searchQuery = query.toLowerCase();
    let relevanceScore = 0;

    // Name match (highest weight)
    if (recipeData?.name?.toLowerCase()?.includes(searchQuery)) {
      relevanceScore += 0.4;
    }

    // Description match
    if (recipeData?.description?.toLowerCase()?.includes(searchQuery)) {
      relevanceScore += 0.3;
    }

    // Ingredient match
    const ingredients = recipeData?.ingredients || [];
    const hasIngredientMatch = ingredients.some((ingredient: any) =>
      ingredient?.name?.toLowerCase()?.includes(searchQuery)
    );
    if (hasIngredientMatch) {
      relevanceScore += 0.2;
    }

    // Cuisine match
    if (recipeData?.cuisine?.toLowerCase()?.includes(searchQuery)) {
      relevanceScore += 0.1;
    }

    return Math.min(1, relevanceScore + 0.1); // Base score of 0.1
  }

  /**
   * Get elemental state score for recipe
   */
  private getelementalState(recipe: ScoredRecipe): number {
    const recipeData = recipe as any;
    const elementalState = recipeData?.elementalState;
    
    if (!elementalState) return 0;
    
    // Simple calculation: sum of all elemental values
    return (elementalState.Fire || 0) + (elementalState.Water || 0) + 
           (elementalState.Earth || 0) + (elementalState.Air || 0);
  }

  /**
   * Get seasonal relevance score
   */
  private getSeasonalScore(recipe: ScoredRecipe): number {
    const recipeData = recipe as any;
    const season = recipeData?.season || recipeData?.currentSeason;
    
    // Simple heuristic: recipes with season data get higher score
    return season ? 1.0 : 0.5;
  }

  /**
   * Get fallback recipes when filtering fails
   */
  private getFallbackRecipes(recipes: Recipe[]): ScoredRecipe[] {
    return (recipes || []).slice(0, 10).map(recipe => ({
      ...recipe,
      score: 0.5
    }));
  }

  /**
   * Filter recipes by cuisine type
   */
  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    return (recipes || []).filter(recipe => {
      const recipeData = recipe as any;
      
      return cuisineTypes.some(cuisineType => {
        const checkMatch = (
          dishName: string | { name: string } | null
        ): boolean => {
          if (!dishName) return false;
          
          const dishNameStr = typeof dishName === 'string' ? dishName : dishName.name;
          const recipeName = recipeData?.name || '';
          
          return dishNameStr.toLowerCase().includes(recipeName.toLowerCase()) ||
                 recipeName.toLowerCase().includes(dishNameStr.toLowerCase());
        };

        // Check if recipe matches any dishes in this cuisine
        const cuisineData = cuisinesMap[cuisineType];
        if (!cuisineData) return false;

        // Check against all dishes in all meal types and seasons
        const dishes = cuisineData as any;
        for (const mealType in dishes.dishes || {}) {
          for (const season in dishes.dishes[mealType] || {}) {
            const dishList = dishes.dishes[mealType][season];
            if (Array.isArray(dishList) && dishList.some(checkMatch)) {
              return true;
            }
          }
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
    if (!cuisineTypes || cuisineTypes.length === 0) return 1;

    const recipeData = recipe as any;
    return cuisineTypes.some(cuisineType => {
      const checkMatch = (
        dishName: string | { name: string } | null
      ): boolean => {
        if (!dishName) return false;
        
        const dishNameStr = typeof dishName === 'string' ? dishName : dishName.name;
        const recipeName = recipeData?.name || '';
        
        return dishNameStr.toLowerCase().includes(recipeName.toLowerCase()) ||
               recipeName.toLowerCase().includes(dishNameStr.toLowerCase());
      };

      // Check if recipe matches any dishes in this cuisine
      const cuisineData = cuisinesMap[cuisineType];
      if (!cuisineData) return false;

      // Check against all dishes in all meal types and seasons
      const dishes = cuisineData as any;
      for (const mealType in dishes.dishes || {}) {
        for (const season in dishes.dishes[mealType] || {}) {
          const dishList = dishes.dishes[mealType][season];
          if (Array.isArray(dishList) && dishList.some(checkMatch)) {
            return true;
          }
        }
      }

      return false;
    }) ? 1.5 : 0.8; // Boost matching cuisines, slightly penalize non-matching
  }

  /**
   * Check if recipe has high protein content
   */
  private hasHighProtein(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData?.ingredients || [];
    
    const proteinIngredients = ['meat', 'fish', 'chicken', 'beef', 'pork', 'eggs', 'beans', 'tofu'];
    return ingredients.some((ingredient: any) =>
      proteinIngredients.some(protein => 
        ingredient?.name?.toLowerCase()?.includes(protein)
      )
    );
  }

  /**
   * Check if recipe has low carb content
   */
  private hasLowCarb(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData?.ingredients || [];
    
    const highCarbIngredients = ['bread', 'pasta', 'rice', 'potato', 'sugar', 'flour'];
    return !ingredients.some((ingredient: any) =>
      highCarbIngredients.some(carb => 
        ingredient?.name?.toLowerCase()?.includes(carb)
      )
    );
  }

  /**
   * Get recipes for specific cuisine
   */
  getRecipesForCuisine(
    cuisine: string,
    recipes: Recipe[],
  ): Recipe[] {
    return (recipes || []).filter(recipe => {
      const recipeData = recipe as any;
      return recipeData?.cuisine?.toLowerCase() === cuisine.toLowerCase() ||
             recipeData?.regionalCuisine?.toLowerCase() === cuisine.toLowerCase();
    });
  }
}

// ===== EXPORTED UTILITY FUNCTIONS =====

export function filterRecipesByIngredientMappings(
  recipes: Recipe[],
  elementalTarget?: ElementalProperties,
  ingredientRequirements?: {
    required?: string[];
    preferred?: string[];
    avoided?: string[];
  }
): Recipe[] {
  return (recipes || []).filter(recipe => {
    const recipeData = recipe as any;
    const ingredients = recipeData?.ingredients || [];
    
    try {
      // Check required ingredients
      if (ingredientRequirements?.required) {
        const hasAllRequired = ingredientRequirements.required.every(required =>
          ingredients.some((ingredient: any) =>
            ingredient?.name?.toLowerCase()?.includes(required.toLowerCase())
          )
        );
        if (!hasAllRequired) return false;
      }

      // Check avoided ingredients
      if (ingredientRequirements?.avoided) {
        const hasAvoided = ingredientRequirements.avoided.some(avoided =>
          ingredients.some((ingredient: any) =>
            ingredient?.name?.toLowerCase()?.includes(avoided.toLowerCase())
          )
        );
        if (hasAvoided) return false;
      }

      // Check elemental compatibility
      if (elementalTarget) {
        const recipeElemental = recipeData?.elementalState;
        if (recipeElemental) {
          const compatibility = RecipeFilter.getInstance().calculateElementalScore(
            recipeElemental,
            elementalTarget
          );
          if (compatibility < 0.3) return false; // Minimum 30% compatibility
        }
      }

      return true;
    } catch (error) {
      logger.error('Error filtering recipe by ingredient mappings:', { recipe, error });
      return false;
    }
  });
}

// ===== SINGLETON EXPORT =====
export const recipeFilter = RecipeFilter.getInstance();
