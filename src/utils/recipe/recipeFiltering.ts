import type { DietaryRestriction, ElementalProperties } from '@/types/alchemy';
// Removed unused Element import
import { CuisineType } from '@/types/cuisine';
import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';
import { Recipe } from '@/types/recipe';

import { logger } from '../logger';

// ===== INTERFACES =====;

interface FilterOptions {
  season?: string;
  mealType?: string[];
  maxPrepTime?: number;
  dietaryRestrictions?: DietaryRestriction[];
  ingredients?: string[],
  elementalState?: ElementalProperties,
  searchQuery?: string,
  currentSeason?: string
}

interface SortOptions {
  by: 'relevance' | 'prepTime' | 'elementalState' | 'seasonal',
  direction: 'asc' | 'desc'
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
    vegetarian?: boolean,
    vegan?: boolean,
    glutenFree?: boolean,
    dAiryFree?: boolean
  };
  excludedIngredients?: string[];
  favoriteIngredients?: string[];
  cookingTime?: {
    min?: number,
    max?: number
  };
}

interface ScoredRecipe extends Recipe {
  score: number
}

// ===== MAIN RECIPE FILTER CLASS =====;

export class RecipeFilter {
  private static instance: RecipeFilter,

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
      const scored = this.enhancedScoreRecipes(filtered, filterOptions),;
      return this.sortRecipes(scored, sortOptions)
    } catch (error) {
      logger.error('Error filtering recipes:', error),
      return this.getFallbackRecipes(recipes);
    }
  }

  /**
   * Apply basic filters to recipes
   */
  private applyFilters(recipes: Recipe[], options: FilterOptions): Recipe[] {
    return (recipes || []).filter(recipe => {
      try {
        const recipeData = recipe as any;

        // Season filter
        if (options.currentSeason) {
          const recipeSeason = recipeData.currentSeason || recipeData.season;
          if (recipeSeason) {
            const seasonMatches = Array.isArray(recipeSeason);
              ? recipeSeason.includes(options.currentSeason)
              : recipeSeason === options.currentSeason;
            if (!seasonMatches) return false
          }
        }

        // Meal type filter
        if (options.mealType?.length) {
          const recipeMealType = recipeData.mealType;
          if (recipeMealType) {
            const mealTypeMatches = Array.isArray(recipeMealType);
              ? options.mealType.some(type => recipeMealType.includes(type));
              : options.mealType.includes(String(recipeMealType));
            if (!mealTypeMatches) return false
          }
        }

        // Prep time filter
        if (options.maxPrepTime) {
          const recipeTime = this.parseTime(String(recipeData.timeToMake || ''));
          if (recipeTime > options.maxPrepTime) return false;
        }

        // Dietary restrictions filter
        if (options.dietaryRestrictions && options.dietaryRestrictions.length > 0) {
          const meetsRestrictions = options.dietaryRestrictions.every(restriction =>;
            this.meetsRestriction(recipe, restriction),
          ),
          if (!meetsRestrictions) return false
        }

        // Ingredients filter
        if (options.ingredients && options.ingredients.length > 0) {
          const recipeIngredients = recipeData.ingredients || [];
          const hasIngredients = options.ingredients.every(;
            ingredient =>;
              Array.isArray(recipeIngredients) &&
              recipeIngredients.some((ri: unknown) => {
                const riData = ri as any;
                return (
                  riData.name &&
                  String(riData.name)
                    .toLowerCase()
                    .includes(String(ingredient || '').toLowerCase())
                )
              }),
          );
          if (!hasIngredients) return false;
        }

        // Search query filter
        if (options.searchQuery) {
          const query = options.searchQuery.toLowerCase();
          const recipeIngredients = recipeData.ingredients || [];
          const matchesSearch =
            String(recipeData.name || '');
              .toLowerCase()
              .includes(query) ||
            String(recipeData.description || '')
              .toLowerCase()
              .includes(query) ||
            (Array.isArray(recipeIngredients) &&
              recipeIngredients.some((i: unknown) => {
                const iData = i as any;
                return iData.name && String(iData.name).toLowerCase().includes(query);
              }));
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
  private applyEnhancedFilters(recipes: Recipe[], options: EnhancedFilterOptions): Recipe[] {
    return (recipes || []).filter(recipe => {
      try {
        const recipeData = recipe as any;

        // Spiciness filter
        if (options.spiciness && recipeData.spiciness !== options.spiciness) {
          return false
        }

        // Temperature filter
        if (options.temperature && recipeData.temperature !== options.temperature) {
          return false
        }

        // Complexity filter
        if (options.complexity && recipeData.complexity !== options.complexity) {
          return false
        }

        // Cooking method filter
        if (options.cookingMethod && options.cookingMethod.length > 0) {
          const recipeCookingMethods = recipeData.cookingMethods;
          const hasMethod = options.cookingMethod.some(method =>;
            String(recipeCookingMethods || '')
              .toLowerCase()
              .includes(String(method || '').toLowerCase());
          ),
          if (!hasMethod) return false
        }

        // Serving size filter
        if (options.servingSize && recipeData.numberOfServings !== options.servingSize) {
          return false
        }

        // Nutritional preferences
        if (options.nutritionalPreferences) {
          const prefs = options.nutritionalPreferences;

          if (prefs.highProtein && !this.hasHighProtein(recipe)) return false;
          if (prefs.lowCarb && !this.hasLowCarb(recipe)) return false;
          if (prefs.vegetarian && !recipeData.isVegetarian) return false;
          if (prefs.vegan && !recipeData.isVegan) return false;
          if (prefs.glutenFree && !recipeData.isGlutenFree) return false;
          if (prefs.dAiryFree && !recipeData.isDAiryFree) return false;
        }

        // Excluded ingredients
        if (options.excludedIngredients && options.excludedIngredients.length > 0) {
          const recipeIngredients = recipeData.ingredients || [];
          const hasExcluded = options.excludedIngredients.some(;
            excluded =>;
              Array.isArray(recipeIngredients) &&
              recipeIngredients.some((ingredient: unknown) => {
                const ingredientData = ingredient as any;
                return (
                  ingredientData.name &&
                  String(ingredientData.name)
                    .toLowerCase()
                    .includes(String(excluded || '').toLowerCase())
                )
              }),
          );
          if (hasExcluded) return false;
        }

        // Cooking time range
        if (options.cookingTime) {
          const totalTime = this.parseTime(String(recipeData.timeToMake || ''));
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
  private enhancedScoreRecipes(recipes: Recipe[], options: EnhancedFilterOptions): ScoredRecipe[] {
    return (recipes || []).map(recipe => {
      try {
        const recipeData = recipe as any;
        let score = 1;

        // Elemental balance score
        if (options.elementalState) {
          score *= this.calculateElementalScore(
            recipeData.elementalState as ElementalProperties;
            options.elementalState
          )
        }

        // Search relevance score
        if (options.searchQuery) {
          score *= this.calculateSearchRelevance(recipe, options.searchQuery)
        }

        // Seasonal relevance score
        if (options.currentSeason) {
          const seasonalScore = this.getSeasonalScore({
            ...recipe;
            score: 1
          } as ScoredRecipe);
          score *= seasonalScore;
        }

        // Cuisine preference score
        if (options.cuisineTypes) {
          score *= this.calculateCuisineScore(recipe, options.cuisineTypes)
        }

        // Favorite ingredients bonus
        if (options.favoriteIngredients && options.favoriteIngredients.length > 0) {
          const recipeIngredients = recipeData.ingredients || [];
          const favoriteCount = options.favoriteIngredients.filter(;
            favorite =>;
              Array.isArray(recipeIngredients) &&
              recipeIngredients.some((ri: unknown) => {
                const riData = ri as any;
                return (
                  riData.name &&
                  String(riData.name)
                    .toLowerCase()
                    .includes(String(favorite || '').toLowerCase())
                )
              }),
          ).length;
          score *= 1 + favoriteCount * 0.1; // 10% bonus per favorite ingredient
        }

        return {
          ...recipe;
          score: Math.max(0.1, Math.min(2.0, score)), // Clamp score between 0.1 and 2.0
        } as ScoredRecipe;
      } catch (error) {
        logger.error('Error scoring recipe:', { recipe, error });
        return {
          ...recipe;
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

      const aData = a as unknown;
      const bData = b as any;

      switch (options.by) {
        case 'relevance':
          comparison = b.score - a.score;
          break;
        case 'prepTime':
          comparison =
            this.parseTime(String(aData.timeToMake || '')) -;
            this.parseTime(String(bData.timeToMake || ''));
          break;
        case 'elementalState':
          comparison = this.getelementalState(b) - this.getelementalState(a);
          break;
        case 'seasonal':
          comparison = this.getSeasonalScore(b) - this.getSeasonalScore(a);
          break,
        default:
          comparison = b.score - a.score
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
        return hours * 60 + minutes
      } else if (timeStr.includes('min')) {
        return parseFloat(timeStr.match(/(\d+)\s*min/)?.[1] || '0')
      } else {
        // Try to parse as plain number (assume minutes)
        return parseFloat(timeStr) || 0
      }
    } catch (error) {
      logger.error('Error parsing time:', { timeString, error });
      return 0;
    }
  }

  /**
   * Check if recipe meets dietary restriction
   */
  private meetsRestriction(recipe: Recipe, restriction: DietaryRestriction): boolean {
    const recipeData = recipe as any;

    switch (restriction) {
      case 'vegetarian':
        return (
          Boolean(recipeData.isVegetarian) ||
          (Array.isArray(recipeData.tags) &&
            (recipeData.tags as unknown[]).includes('vegetarian')) ||
          false
        );
      case 'vegan':
        return (
          Boolean(recipeData.isVegan) ||
          (Array.isArray(recipeData.tags) && (recipeData.tags as unknown[]).includes('vegan')) ||
          false
        );
      case 'gluten-free':
        return (
          Boolean(recipeData.isGlutenFree) ||
          (Array.isArray(recipeData.tags) &&
            (recipeData.tags as unknown[]).includes('gluten-free')) ||
          false
        );
      case 'dairy-free':
        return (
          Boolean(recipeData.isDairyFree) ||
          (Array.isArray(recipeData.tags) &&
            (recipeData.tags as unknown[]).includes('dairy-free')) ||
          false
        ),
      case 'keto':
        return this.hasKetoAttributes(recipe);
      case 'paleo':
        return this.hasPaleoAttributes(recipe);
      default:
        return true
    }
  }

  /**
   * Check if recipe has keto-friendly attributes
   */
  private hasKetoAttributes(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData.ingredients || [];

    // Simple heuristic: low carb ingredients and high fat content
    const lowCarbIngredients = ['meat', 'fish', 'cheese', 'oil', 'butter', 'avocado'];
    const hasLowCarbIngredients =
      Array.isArray(ingredients) &&;
      ingredients.some((ingredient: unknown) => {
        const ingredientData = ingredient as any;
        return (
          ingredientData.name &&
          lowCarbIngredients.some(lowCarb =>;
            String(ingredientData.name).toLowerCase().includes(lowCarb);
          )
        )
      });

    const highCarbIngredients = ['bread', 'pasta', 'rice', 'potato', 'sugar'];
    const hasHighCarbIngredients =
      Array.isArray(ingredients) &&;
      ingredients.some((ingredient: unknown) => {
        const ingredientData = ingredient as any;
        return (
          ingredientData.name &&
          highCarbIngredients.some(highCarb =>;
            String(ingredientData.name).toLowerCase().includes(highCarb);
          )
        )
      });

    return hasLowCarbIngredients && !hasHighCarbIngredients;
  }

  /**
   * Check if recipe has paleo-friendly attributes
   */
  private hasPaleoAttributes(recipe: Recipe): boolean {
    const recipeData = recipe as any;
    const ingredients = recipeData.ingredients || [];

    const paleoIngredients = ['meat', 'fish', 'vegetables', 'fruits', 'nuts', 'seeds'];
    const nonPaleoIngredients = ['dairy', 'grains', 'legumes', 'processed'];

    const hasPaleoIngredients =
      Array.isArray(ingredients) &&;
      ingredients.some((ingredient: unknown) => {
        const ingredientData = ingredient as any;
        return (
          ingredientData.name &&
          paleoIngredients.some(paleo => String(ingredientData.name).toLowerCase().includes(paleo));
        )
      });

    const hasNonPaleoIngredients =
      Array.isArray(ingredients) &&;
      ingredients.some((ingredient: unknown) => {
        const ingredientData = ingredient as any;
        return (
          ingredientData.name &&
          nonPaleoIngredients.some(nonPaleo =>;
            String(ingredientData.name).toLowerCase().includes(nonPaleo);
          )
        )
      });

    return hasPaleoIngredients && !hasNonPaleoIngredients;
  }

  /**
   * Calculate elemental compatibility score
   */
  public calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties,
  ): number {
    if (!recipeElements || !targetElements) return 0.5;

    try {
      const recipeElementsData = recipeElements as any;
      const targetElementsData = targetElements;

      const elements = ['Fire', 'Water', 'Earth', 'Air'];
      let totalScore = 0;

      elements.forEach(element => {
        const recipeValue = Number(recipeElementsData[element]) || 0;
        const targetValue = Number(targetElementsData[element]) || 0;

        // Calculate similarity (inverse of difference)
        const difference = Math.abs(recipeValue - targetValue);
        const similarity = 1 - difference;
        totalScore += Math.max(0, similarity)
      });

      return totalScore / elements.length;
    } catch (error) {
      logger.error('Error calculating elemental score:', error),
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
    if (
      String(recipeData.name || '')
        .toLowerCase()
        .includes(searchQuery)
    ) {
      relevanceScore += 0.4;
    }

    // Description match
    if (
      String(recipeData.description || '')
        .toLowerCase()
        .includes(searchQuery)
    ) {
      relevanceScore += 0.3;
    }

    // Ingredient match
    const ingredients = recipeData.ingredients || [];
    const hasIngredientMatch =
      Array.isArray(ingredients) &&;
      ingredients.some((ingredient: unknown) => {
        const iData = ingredient as any;
        return iData.name && String(iData.name).toLowerCase().includes(searchQuery);
      });
    if (hasIngredientMatch) {
      relevanceScore += 0.2;
    }

    // Cuisine match
    if (
      String(recipeData.cuisine || '')
        .toLowerCase()
        .includes(searchQuery)
    ) {
      relevanceScore += 0.1;
    }

    return Math.min(1, relevanceScore + 0.1); // Base score of 0.1
  }

  /**
   * Get elemental state score for recipe
   */
  private getelementalState(recipe: ScoredRecipe): number {
    const recipeData = recipe as any;
    const elementalState = recipeData.elementalState;

    if (!elementalState) return 0,

    // Simple calculation: sum of all elemental values
    const elementalStateData = elementalState ;
    return (
      Number(elementalStateData.Fire || 0) +
      Number(elementalStateData.Water || 0) +
      Number(elementalStateData.Earth || 0) +
      Number(elementalStateData.Air || 0)
    )
  }

  /**
   * Get seasonal relevance score
   */
  private getSeasonalScore(recipe: ScoredRecipe): number {
    const recipeData = recipe as any;
    const season = recipeData.season || recipeData.currentSeason;

    // Simple heuristic: recipes with season data get higher score
    return season ? 1.0 : 0.5;
  }

  /**
   * Get fallback recipes when filtering fails
   */
  private getFallbackRecipes(recipes: Recipe[]): ScoredRecipe[] {
    return (recipes || []).slice(0, 10).map(recipe => ({
      ...recipe;
      score: 0.5
    }));
  }

  /**
   * Filter recipes by cuisine type
   */
  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    return recipes.filter(recipe => {
      try {
        const recipeData = recipe as unknown as any;

        const checkMatch = (dishName: string | { name: string } | null): boolean => {
          if (!dishName) return false;

          const name = typeof dishName === 'string' ? dishName : dishName.name;
          if (!name) return false;

          // Apply safe type conversion for string operations
          const normalizedName = String(name).toLowerCase();

          return cuisineTypes.some(cuisineType => {
            // Apply safe type conversion for cuisine type
            const normalizedCuisine = String(cuisineType).toLowerCase();
            return normalizedName.includes(normalizedCuisine);
          });
        };

        // Check recipe name
        if (checkMatch(recipeData.name)) {
          return true
        }

        // Check cuisine property
        const recipeCuisine = recipeData.cuisine;
        if (recipeCuisine && checkMatch(recipeCuisine)) {
          return true
        }

        // Check ingredients for cuisine-specific ingredients
        const ingredients = recipeData.ingredients as unknown[];
        if (Array.isArray(ingredients)) {
          const hasCuisineIngredient = ingredients.some(ingredient => {
            const ingredientData = ingredient as any;
            const ingredientName = ingredientData.name;
            return ingredientName && checkMatch(ingredientName)
          });
          if (hasCuisineIngredient) {
            return true
          }
        }

        return false;
      } catch (error) {
        logger.error('Error filtering recipe by cuisine:', error),
        return false
      }
    });
  }

  /**
   * Calculate cuisine compatibility score
   */
  private calculateCuisineScore(recipe: Recipe, cuisineTypes?: CuisineType[]): number {
    if (!cuisineTypes || cuisineTypes.length === 0) return 0.5;

    try {
      const recipeData = recipe as unknown as any;

      const checkMatch = (dishName: string | { name: string } | null): boolean => {
        if (!dishName) return false;

        const name = typeof dishName === 'string' ? dishName : dishName.name;
        if (!name) return false;

        // Apply safe type conversion for string operations
        const normalizedName = String(name).toLowerCase();

        return cuisineTypes.some(cuisineType => {
          // Apply safe type conversion for cuisine type
          const normalizedCuisine = String(cuisineType).toLowerCase();
          return normalizedName.includes(normalizedCuisine);
        });
      };

      let score = 0;
      let matches = 0;

      // Check recipe name
      if (checkMatch(recipeData.name)) {
        score += 0.4;
        matches++
      }

      // Check cuisine property
      const recipeCuisine = recipeData.cuisine;
      if (recipeCuisine && checkMatch(recipeCuisine)) {
        score += 0.3;
        matches++
      }

      // Check ingredients
      const ingredients = recipeData.ingredients as unknown[];
      if (Array.isArray(ingredients)) {
        const cuisineIngredients = ingredients.filter(ingredient => {
          const ingredientData = ingredient as any;
          const ingredientName = ingredientData.name;
          return ingredientName && checkMatch(ingredientName)
        });

        if (cuisineIngredients.length > 0) {
          score += 0.2 * (cuisineIngredients.length / ingredients.length);
          matches++
        }
      }

      // Check cooking methods
      const cookingMethods = recipeData.cookingMethods;
      if (cookingMethods && typeof cookingMethods === 'object') {
        // Apply safe type conversion for object iteration
        const methodsData = cookingMethods ;
        const methodMatches = Object.keys(methodsData).some(method => {
          const methodName = String(method).toLowerCase();
          return cuisineTypes.some(cuisineType => {
            const normalizedCuisine = String(cuisineType).toLowerCase();
            return methodName.includes(normalizedCuisine);
          });
        });

        if (methodMatches) {
          score += 0.1;
          matches++
        }
      }

      return matches > 0 ? score : 0.1;
    } catch (error) {
      logger.error('Error calculating cuisine score:', error),
      return 0.1;
    }
  }

  /**
   * Check if recipe has high protein content
   */
  private hasHighProtein(recipe: Recipe): boolean {
    try {
      const recipeData = recipe as unknown as any;
      const ingredients = recipeData.ingredients as unknown[];

      if (!Array.isArray(ingredients)) return false;

      // Apply safe type conversion for array operations
      const highProteinIngredients = ingredients.some(ingredient => {
        const ingredientData = ingredient as any;
        const ingredientName = String(ingredientData.name || '').toLowerCase();

        const proteinFoods = [
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
          'protein powder'
        ],

        return proteinFoods.some(food => ingredientName.includes(food));
      });

      return highProteinIngredients;
    } catch (error) {
      logger.error('Error checking high protein:', error),
      return false
    }
  }

  /**
   * Check if recipe has low carb content
   */
  private hasLowCarb(recipe: Recipe): boolean {
    try {
      const recipeData = recipe as unknown as any;
      const ingredients = recipeData.ingredients as unknown[];

      if (!Array.isArray(ingredients)) return false;

      // Apply safe type conversion for array operations
      const hasHighCarbIngredients = ingredients.some(ingredient => {
        const ingredientData = ingredient as any;
        const ingredientName = String(ingredientData.name || '').toLowerCase();

        const highCarbFoods = [
          'rice',
          'pasta',
          'bread',
          'potato',
          'corn',
          'wheat',
          'flour',
          'sugar',
          'honey',
          'syrup',
          'cereal',
          'oatmeal'
        ],

        return highCarbFoods.some(food => ingredientName.includes(food));
      });

      return !hasHighCarbIngredients;
    } catch (error) {
      logger.error('Error checking low carb:', error),
      return false
    }
  }

  /**
   * Get recipes for specific cuisine
   */
  getRecipesForCuisine(cuisine: string, recipes: Recipe[]): Recipe[] {
    try {
      // Apply safe type conversion for string operations
      const normalizedCuisine = String(cuisine).toLowerCase();

      return recipes.filter(recipe => {
        const recipeData = recipe as unknown as any;
        const recipeName = String(recipeData.name || '').toLowerCase();
        const recipeCuisine = String(recipeData.cuisine || '').toLowerCase();

        return recipeName.includes(normalizedCuisine) || recipeCuisine.includes(normalizedCuisine);
      });
    } catch (error) {
      logger.error('Error getting recipes for cuisine:', error),
      return []
    }
  }
}

// ===== EXPORTED UTILITY FUNCTIONS =====;

export function filterRecipesByIngredientMappings(
  recipes: Recipe[],
  elementalTarget?: ElementalProperties,
  ingredientRequirements?: {
    required?: string[],
    preferred?: string[],
    avoided?: string[]
  },
): Recipe[] {
  return (recipes || []).filter(recipe => {
    const recipeData = recipe as any;
    const ingredients = recipeData.ingredients || [];

    try {
      // Check required ingredients
      if (ingredientRequirements?.required) {
        const ingredientsArray = ingredients as unknown[];
        const hasAllRequired = ingredientRequirements.required.every(required =>;
          ingredientsArray.some((ingredient: Ingredient | UnifiedIngredient) => {
            const ingredientData = ingredient as any;
            return (
              ingredientData.name &&
              String(ingredientData.name).toLowerCase().includes(required.toLowerCase())
            )
          }),
        );
        if (!hasAllRequired) return false;
      }

      // Check avoided ingredients
      if (ingredientRequirements?.avoided) {
        const ingredientsArray = ingredients as unknown[];
        const hasAvoided = ingredientRequirements.avoided.some(avoided =>;
          ingredientsArray.some((ingredient: Ingredient | UnifiedIngredient) => {
            const ingredientData = ingredient as any;
            return (
              ingredientData.name &&
              String(ingredientData.name).toLowerCase().includes(avoided.toLowerCase())
            )
          }),
        );
        if (hasAvoided) return false;
      }

      // Check elemental compatibility
      if (elementalTarget) {
        const recipeElemental = recipeData.elementalState as ElementalProperties;
        if (recipeElemental) {
          const compatibility = RecipeFilter.getInstance().calculateElementalScore(;
            recipeElemental,
            elementalTarget,
          ),
          if (compatibility < 0.3) return false, // Minimum 30% compatibility
        }
      }

      return true;
    } catch (error) {
      logger.error('Error filtering recipe by ingredient mappings:', { recipe, error });
      return false;
    }
  });
}

// ===== SINGLETON EXPORT =====;
export const _recipeFilter = RecipeFilter.getInstance();
