import { CuisineType } from '@/types/cuisine';
import type { DietaryRestriction, ElementalProperties } from '@/types/recipe';
import { Recipe } from '@/types/recipe';

import { createLogger } from '../logger';

const _logger = createLogger('RecipeFiltering');

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
  cuisineTypes?: CuisineType[],
  spiciness?: 'mild' | 'medium' | 'hot'
  temperature?: 'hot' | 'cold' | 'room'
  complexity?: 'simple' | 'moderate' | 'complex'
  cookingMethod?: string[],
  servingSize?: number,
  nutritionalPreferences?: {
    highProtein?: boolean,
    lowCarb?: boolean,
    vegetarian?: boolean,
    vegan?: boolean,
    glutenFree?: boolean,
    dairyFree?: boolean;
  };
  excludedIngredients?: string[],
  favoriteIngredients?: string[],
  cookingTime?: {
    min?: number,
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
    // Singleton pattern - private constructor
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
      _logger.error('Error filtering recipes:', error);
      return this.getFallbackRecipes(recipes);
    }
  }

  /**
   * Apply basic filters to recipes
   */
  private applyFilters(recipes: Recipe[], options: FilterOptions): Recipe[] {
    if (!isNonEmptyArray(recipes)) {
      return [];
    }

    return recipes.filter(recipe => {
      try {
        // Season filter
        if (options.currentSeason) {
          const recipeSeason = recipe.season;
          if (recipeSeason) {
            const seasonMatches = Array.isArray(recipeSeason)
              ? recipeSeason.includes(options.currentSeason)
              : recipeSeason === options.currentSeason;
            if (!seasonMatches) return false;
          }
        }

        // Meal type filter
        if (isNonEmptyArray(options.mealType)) {
          const recipeMealType = recipe.mealType;
          if (recipeMealType) {
            const mealTypeMatches = Array.isArray(recipeMealType)
              ? options.mealType.some(type => recipeMealType.includes(type))
              : options.mealType.includes(String(recipeMealType));
            if (!mealTypeMatches) return false;
          }
        }

        // Prep time filter
        if (options.maxPrepTime) {
          const recipeTime = this.parseTime(String(recipe.timeToMake || ''));
          if (recipeTime > options.maxPrepTime) return false;
        }

        // Dietary restrictions filter
        if (isNonEmptyArray(options.dietaryRestrictions)) {
          const meetsRestrictions = options.dietaryRestrictions.every(restriction =>
            this.meetsRestriction(recipe, restriction),
          );
          if (!meetsRestrictions) return false;
        }

        // Ingredients filter
        if (isNonEmptyArray(options.ingredients)) {
          const recipeIngredients = recipe.ingredients || [];
          const hasIngredients = options.ingredients.every(ingredient =>
            recipeIngredients.some(
              ri => ri.name && ri.name.toLowerCase().includes(ingredient.toLowerCase()),
            ),
          );
          if (!hasIngredients) return false;
        }

        // Search query filter
        if (options.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          const matchesSearch =
            (recipe.name || '').toLowerCase().includes(query) ||
            (recipe.description || '').toLowerCase().includes(query) ||
            (recipe.ingredients || []).some(
              ingredient => ingredient.name && ingredient.name.toLowerCase().includes(query),
            );
          if (!matchesSearch) return false;
        }

        return true;
      } catch (error) {
        _logger.error('Error filtering recipe:', { recipe, error });
        return false;
      }
    });
  }

  /**
   * Apply enhanced filters with more complex criteria
   */
  private applyEnhancedFilters(recipes: Recipe[], options: EnhancedFilterOptions): Recipe[] {
    if (!isNonEmptyArray(recipes)) {
      return [];
    }

    return recipes.filter(recipe => {
      try {
        // Spiciness filter
        if (options.spiciness && recipe.spiceLevel !== options.spiciness) {
          return false;
        }

        // Temperature filter (based on cooking method)
        if (options.temperature) {
          const cookingMethods = recipe.cookingMethod || [];
          const methodStr = cookingMethods.join(' ').toLowerCase();
          const isHot =
            methodStr.includes('bake') ||
            methodStr.includes('fry') ||
            methodStr.includes('grill') ||
            methodStr.includes('roast');
          const isCold =
            methodStr.includes('raw') ||
            methodStr.includes('cold') ||
            methodStr.includes('fresh') ||
            methodStr.includes('salad');

          if (options.temperature === 'hot' && !isHot) return false;
          if (options.temperature === 'cold' && !isCold) return false;
          if (options.temperature === 'room' && (isHot || isCold)) return false;
        }

        // Complexity filter (based on ingredient count and techniques)
        if (options.complexity) {
          const ingredientCount = recipe.ingredients?.length || 0;
          const techniqueCount = recipe.cookingTechniques?.length || 0;
          const isSimple = ingredientCount <= 5 && techniqueCount <= 2;
          const isModerate = ingredientCount <= 10 && techniqueCount <= 4;
          const isComplex = ingredientCount > 10 || techniqueCount > 4;

          if (options.complexity === 'simple' && !isSimple) return false;
          if (options.complexity === 'moderate' && !isModerate) return false;
          if (options.complexity === 'complex' && !isComplex) return false;
        }

        // Cooking method filter
        if (isNonEmptyArray(options.cookingMethod)) {
          const recipeMethods = recipe.cookingMethod || [];
          const hasMethod = options.cookingMethod.some(method =>
            recipeMethods.some(recipeMethod =>
              recipeMethod.toLowerCase().includes(method.toLowerCase()),
            ),
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
          if (prefs.dairyFree && !recipe.isDairyFree) return false;
        }

        // Excluded ingredients
        if (isNonEmptyArray(options.excludedIngredients)) {
          const recipeIngredients = recipe.ingredients || [];
          const hasExcluded = options.excludedIngredients.some(excluded =>
            recipeIngredients.some(
              ingredient =>
                ingredient.name && ingredient.name.toLowerCase().includes(excluded.toLowerCase()),
            ),
          );
          if (hasExcluded) return false;
        }

        // Cooking time range
        if (options.cookingTime) {
          const totalTime = this.parseTime(String(recipe.timeToMake || ''));
          if (options.cookingTime.min && totalTime < options.cookingTime.min) return false;
          if (options.cookingTime.max && totalTime > options.cookingTime.max) return false;
        }

        return true;
      } catch (error) {
        _logger.error('Error applying enhanced filters:', { recipe, error });
        return false;
      }
    });
  }

  /**
   * Score recipes based on various criteria
   */
  private enhancedScoreRecipes(recipes: Recipe[], options: EnhancedFilterOptions): ScoredRecipe[] {
    if (!isNonEmptyArray(recipes)) {
      return [];
    }

    return recipes.map(recipe => {
      try {
        let score = 1;

        // Elemental balance score
        if (options.elementalState) {
          score *= this.calculateElementalScore(recipe.elementalProperties, options.elementalState);
        }

        // Search relevance score
        if (options.searchQuery) {
          score *= this.calculateSearchRelevance(recipe, options.searchQuery);
        }

        // Seasonal relevance score
        if (options.currentSeason) {
          const seasonalScore = this.getSeasonalScore(recipe);
          score *= seasonalScore;
        }

        // Cuisine preference score
        if (isNonEmptyArray(options.cuisineTypes)) {
          score *= this.calculateCuisineScore(recipe, options.cuisineTypes);
        }

        // Favorite ingredients bonus
        if (isNonEmptyArray(options.favoriteIngredients)) {
          const recipeIngredients = recipe.ingredients || [];
          const favoriteCount = options.favoriteIngredients.filter(favorite =>
            recipeIngredients.some(
              ri => ri.name && ri.name.toLowerCase().includes(favorite.toLowerCase()),
            ),
          ).length;
          score *= 1 + favoriteCount * 0.1; // 10% bonus per favorite ingredient
        }

        return {
          ...recipe,
          score: Math.max(0.1, Math.min(2.0, score)), // Clamp score between 0.1 and 2.0
        } as ScoredRecipe;
      } catch (error) {
        _logger.error('Error scoring recipe:', { recipe, error });
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
  private sortRecipes(recipes: ScoredRecipe[], options: SortOptions): ScoredRecipe[] {
    return recipes.sort((a, b) => {
      let comparison = 0;

      switch (options.by) {
        case 'relevance':
        comparison = b.score - a.score;
        break;
      case 'prepTime':
        comparison =
          this.parseTime(String(a.timeToMake || '')) - this.parseTime(String(b.timeToMake || ''));
        break;
      case 'elementalState':
        comparison = this.getElementalScore(b) - this.getElementalScore(a);
        break;
      case 'seasonal':
        comparison = this.getSeasonalScore(a) - this.getSeasonalScore(b);
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
        const hours = parseFloat(timeStr.match(/(\d+(?: \.\d+)?)\s*hour/)?.[1] || '0');
        const minutes = parseFloat(timeStr.match(/(\d+)\s*min/)?.[1] || '0');
        return hours * 60 + minutes;
      } else if (timeStr.includes('min')) {
        return parseFloat(timeStr.match(/(\d+)\s*min/)?.[1] || '0');
      } else {
        // Try to parse as plain number (assume minutes)
        return parseFloat(timeStr) || 0;
      }
    } catch (error) {
      _logger.error('Error parsing time:', { timeString, error });
      return 0;
    }
  }

  /**
   * Check if recipe meets dietary restriction
   */
  private meetsRestriction(recipe: Recipe, restriction: DietaryRestriction): boolean {
    try {
      switch (restriction) {
        case 'Vegetarian':
          return (
            Boolean(recipe.isVegetarian) ||
            (isNonEmptyArray(recipe.tags) && recipe.tags.includes('vegetarian'))
          );
        case 'Vegan':
          return (
            Boolean(recipe.isVegan) ||
            (isNonEmptyArray(recipe.tags) && recipe.tags.includes('vegan'))
          );
        case 'Gluten-Free':
          return (
            Boolean(recipe.isGlutenFree) ||
            (isNonEmptyArray(recipe.tags) && recipe.tags.includes('gluten-free'))
          );
        case 'Dairy-Free':
          return (
            Boolean(recipe.isDairyFree) ||
            (isNonEmptyArray(recipe.tags) && recipe.tags.includes('dairy-free'))
          );
        case 'Keto': return this.hasKetoAttributes(recipe);
        case 'Paleo': return this.hasPaleoAttributes(recipe);
        default:
          return true;
      }
    } catch (error) {
      _logger.error('Error checking restriction:', { recipe, restriction, error });
      return false;
    }
  }

  /**
   * Check if recipe has keto-friendly attributes
   */
  private hasKetoAttributes(recipe: Recipe): boolean {
    try {
      const ingredients = recipe.ingredients || [];
      if (!isNonEmptyArray(ingredients)) return false;

      // Check for low-carb ingredients
      const lowCarbIngredients = [
        'chicken',
        'beef',
        'fish',
        'eggs',
        'cheese',
        'butter',
        'oil',
        'avocado',
      ];
      const hasLowCarb = ingredients.some(ingredient =>
        lowCarbIngredients.some(
          carb => ingredient.name && ingredient.name.toLowerCase().includes(carb),
        ),
      );

      // Check for high-carb ingredients (should not have)
      const highCarbIngredients = ['rice', 'pasta', 'bread', 'potato', 'sugar'];
      const hasHighCarb = ingredients.some(ingredient =>
        highCarbIngredients.some(
          carb => ingredient.name && ingredient.name.toLowerCase().includes(carb),
        ),
      );

      return hasLowCarb && !hasHighCarb;
    } catch (error) {
      _logger.error('Error checking keto attributes:', { recipe, error });
      return false;
    }
  }

  /**
   * Check if recipe has paleo-friendly attributes
   */
  private hasPaleoAttributes(recipe: Recipe): boolean {
    try {
      const ingredients = recipe.ingredients || [];
      if (!isNonEmptyArray(ingredients)) return false;

      const paleoIngredients = ['meat', 'fish', 'vegetables', 'fruits', 'nuts', 'seeds'];
      const nonPaleoIngredients = ['dairy', 'grains', 'legumes', 'processed'];

      const hasPaleo = ingredients.some(ingredient =>
        paleoIngredients.some(
          paleo => ingredient.name && ingredient.name.toLowerCase().includes(paleo),
        ),
      );

      const hasNonPaleo = ingredients.some(ingredient =>
        nonPaleoIngredients.some(
          nonPaleo => ingredient.name && ingredient.name.toLowerCase().includes(nonPaleo),
        ),
      );

      return hasPaleo && !hasNonPaleo;
    } catch (error) {
      _logger.error('Error checking paleo attributes:', { recipe, error });
      return false;
    }
  }

  /**
   * Calculate elemental compatibility score
   */
  calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties,
  ): number {
    if (!recipeElements || !targetElements) return 0.5;

    try {
      const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
      let totalScore = 0;

      elements.forEach(element => {
        const recipeValue = recipeElements[element] || 0;
        const targetValue = targetElements[element] || 0;
        const difference = Math.abs(recipeValue - targetValue);
        const similarity = 1 - difference;
        totalScore += Math.max(0, similarity);
      });

      return totalScore / elements.length;
    } catch (error) {
      _logger.error('Error calculating elemental score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate search relevance score
   */
  private calculateSearchRelevance(recipe: Recipe, query: string): number {
    if (!query) return 1;

    try {
      const searchQuery = query.toLowerCase();
      let relevanceScore = 0;

      // Name match (highest weight)
      if ((recipe.name || '').toLowerCase().includes(searchQuery)) {
        relevanceScore += 0.4;
      }

      // Description match
      if ((recipe.description || '').toLowerCase().includes(searchQuery)) {
        relevanceScore += 0.3;
      }

      // Ingredient match
      const ingredients = recipe.ingredients || [];
      const hasIngredientMatch = ingredients.some(
        ingredient => ingredient.name && ingredient.name.toLowerCase().includes(searchQuery),
      );
      if (hasIngredientMatch) {
        relevanceScore += 0.2;
      }

      // Cuisine match
      if ((recipe.cuisine || '').toLowerCase().includes(searchQuery)) {
        relevanceScore += 0.1;
      }

      return Math.min(1, relevanceScore + 0.1); // Base score of 0.1
    } catch (error) {
      _logger.error('Error calculating search relevance:', { recipe, query, error });
      return 0.5;
    }
  }

  /**
   * Get elemental state score for recipe
   */
  private getElementalScore(recipe: Recipe): number {
    try {
      const elementalState = recipe.elementalProperties;
      if (!elementalState) return 0;

      // Simple calculation: sum of all elemental values
      return (
        (elementalState.Fire || 0) +
        (elementalState.Water || 0) +
        (elementalState.Earth || 0) +
        (elementalState.Air || 0)
      );
    } catch (error) {
      _logger.error('Error getting elemental score:', { recipe, error });
      return 0;
    }
  }

  /**
   * Get seasonal relevance score
   */
  private getSeasonalScore(recipe: Recipe): number {
    try {
      const season = recipe.season;
      // Simple heuristic: recipes with season data get higher score
      return season ? 1.0 : 0.5;
    } catch (error) {
      _logger.error('Error getting seasonal score:', { recipe, error });
      return 0.5;
    }
  }

  /**
   * Get fallback recipes when filtering fails
   */
  private getFallbackRecipes(recipes: Recipe[]): ScoredRecipe[] {
    if (!isNonEmptyArray(recipes)) {
      return [];
    }

    return recipes.slice(0, 10).map(recipe => ({
      ...recipe,
      score: 0.5
    }));
  }

  /**
   * Filter recipes by cuisine type
   */
  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    if (!isNonEmptyArray(recipes) || !isNonEmptyArray(cuisineTypes)) {
      return recipes;
    }

    return recipes.filter(recipe => {
      try {
        const recipeName = (recipe.name || '').toLowerCase();
        const recipeCuisine = (recipe.cuisine || '').toLowerCase();

        return cuisineTypes.some(cuisineType => {
          const normalizedCuisine = cuisineType.toLowerCase();
          return (
            recipeName.includes(normalizedCuisine) || recipeCuisine.includes(normalizedCuisine)
          );
        });
      } catch (error) {
        _logger.error('Error filtering recipe by cuisine:', error);
        return false;
      }
    });
  }

  /**
   * Calculate cuisine compatibility score
   */
  private calculateCuisineScore(recipe: Recipe, cuisineTypes?: CuisineType[]): number {
    if (!isNonEmptyArray(cuisineTypes)) return 0.5;

    try {
      let score = 0;
      let matches = 0;

      // Check recipe name
      if (
        cuisineTypes.some(cuisine =>
          (recipe.name || '').toLowerCase().includes(cuisine.toLowerCase()),
        )
      ) {
        score += 0.4;
        matches++;
      }

      // Check cuisine property
      if (
        cuisineTypes.some(cuisine =>
          (recipe.cuisine || '').toLowerCase().includes(cuisine.toLowerCase()),
        )
      ) {
        score += 0.3;
        matches++;
      }

      // Check ingredients
      const ingredients = recipe.ingredients || [];
      if (isNonEmptyArray(ingredients)) {
        const cuisineIngredients = ingredients.filter(ingredient =>
          cuisineTypes.some(
            cuisine =>
              ingredient.name && ingredient.name.toLowerCase().includes(cuisine.toLowerCase()),
          ),
        );

        if (cuisineIngredients.length > 0) {
          score += 0.2 * (cuisineIngredients.length / ingredients.length);
          matches++;
        }
      }

      return matches > 0 ? score : 0.1;
    } catch (error) {
      _logger.error('Error calculating cuisine score:', error);
      return 0.1;
    }
  }

  /**
   * Check if recipe has high protein content
   */
  private hasHighProtein(recipe: Recipe): boolean {
    try {
      const ingredients = recipe.ingredients || [];
      if (!isNonEmptyArray(ingredients)) return false;

      const highProteinFoods = [
        'chicken',
        'beef',
        'pork',
        'lamb',
        'turkey',
        'duck',
        'fish',
        'salmon',
        'tuna',
        'cod',
        'shrimp',
        'crab',
        'eggs',
        'tofu',
        'tempeh',
        'beans',
        'lentils',
        'chickpeas',
        'quinoa',
        'greek yogurt',
        'cottage cheese',
        'protein powder',
      ];

      return ingredients.some(ingredient =>
        highProteinFoods.some(
          food => ingredient.name && ingredient.name.toLowerCase().includes(food),
        ),
      );
    } catch (error) {
      _logger.error('Error checking high protein:', error);
      return false;
    }
  }

  /**
   * Check if recipe has low carb content
   */
  private hasLowCarb(recipe: Recipe): boolean {
    try {
      const ingredients = recipe.ingredients || [];
      if (!isNonEmptyArray(ingredients)) return false;

      const highCarbFoods = [
        'rice',
        'pasta',
        'bread',
        'corn',
        'potato',
        'wheat',
        'flour',
        'sugar',
        'honey',
        'syrup',
        'cereal',
        'oatmeal',
      ];

      return !ingredients.some(ingredient =>
        highCarbFoods.some(carb => ingredient.name && ingredient.name.toLowerCase().includes(carb)),
      );
    } catch (error) {
      _logger.error('Error checking low carb:', error);
      return false;
    }
  }

  /**
   * Get recipes for specific cuisine
   */
  getRecipesForCuisine(cuisine: string, recipes: Recipe[]): Recipe[] {
    if (!cuisine || !isNonEmptyArray(recipes)) {
      return [];
    }

    try {
      const normalizedCuisine = cuisine.toLowerCase();
      return recipes.filter(recipe => {
        const recipeName = (recipe.name || '').toLowerCase();
        const recipeCuisine = (recipe.cuisine || '').toLowerCase();
        return recipeName.includes(normalizedCuisine) || recipeCuisine.includes(normalizedCuisine);
      });
    } catch (error) {
      _logger.error('Error getting recipes for cuisine:', error);
      return [];
    }
  }
}

// ===== EXPORTED UTILITY FUNCTIONS =====

export function filterRecipesByIngredientMappings(recipes: Recipe[],
  elementalTarget?: ElementalProperties,
  ingredientRequirements?: {
    required?: string[],
    preferred?: string[],
    avoided?: string[],
  },
): Recipe[] {
  if (!isNonEmptyArray(recipes)) {
    return [];
  }

  return recipes.filter(recipe => {
    try {
      const ingredients = recipe.ingredients || [];

      // Check required ingredients
      if (isNonEmptyArray(ingredientRequirements?.required)) {
        const hasAllRequired = ingredientRequirements!.required!.every(required =>
          ingredients.some(
            ingredient =>
              ingredient.name && ingredient.name.toLowerCase().includes(required.toLowerCase()),
          ),
        );
        if (!hasAllRequired) return false;
      }

      // Check avoided ingredients
      if (isNonEmptyArray(ingredientRequirements?.avoided)) {
        const hasAvoided = ingredientRequirements!.avoided!.some(avoided =>
          ingredients.some(
            ingredient =>
              ingredient.name && ingredient.name.toLowerCase().includes(avoided.toLowerCase()),
          ),
        );
        if (hasAvoided) return false;
      }

      // Check elemental compatibility
      if (elementalTarget) {
        const recipeElemental = recipe.elementalProperties;
        if (recipeElemental) {
          const compatibility = RecipeFilter.getInstance().calculateElementalScore(
            recipeElemental,
            elementalTarget,
          );
          if (compatibility < 0.3) return false; // Minimum 30% compatibility
        }
      }

      return true;
    } catch (error) {
      _logger.error('Error filtering recipe by ingredient mappings:', { recipe, error });
      return false;
    }
  });
}

// ===== SINGLETON EXPORT =====
export const _recipeFilter = RecipeFilter.getInstance();
