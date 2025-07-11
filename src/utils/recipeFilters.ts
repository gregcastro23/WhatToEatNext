import { logger } from './logger';
import { Recipe, _RecipeFilters } from '@/types/recipe';
import type { ScoredRecipe } from '@/types/recipe';
import type {
  ElementalProperties,
  DietaryRestriction,
  IngredientMapping,
} from "@/types/alchemy";
import { CuisineType } from '@/types/cuisine';
import { connectIngredientsToMappings } from './recipeMatching';

// Add missing imports for TS2304 fixes
import type { Cuisine } from '@/types/cuisine';
import { cuisines } from '@/data/cuisines';

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

  private constructor() {
    // Intentionally empty - initialization happens in methods
  }

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
    return recipes.filter((recipe) => {
      try {
        // Season filter
        if (
          options.season &&
          !recipe.season?.includes(options.season) &&
          !recipe.season?.includes('all')
        ) {
          return false;
        }

        // Meal type filter
        if (
          options.mealType?.length &&
          !options.mealType.some((type) => recipe.mealType?.includes(type))
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
        if (options.dietaryRestrictions?.length) {
          const meetsRestrictions = options.dietaryRestrictions.every(
            (restriction) => this.meetsRestriction(recipe, restriction)
          );
          if (!meetsRestrictions) return false;
        }

        // Ingredients filter
        if (options.ingredients?.length) {
          const hasIngredients = options.ingredients.every((ingredient) =>
            recipe.ingredients.some((ri) =>
              ri.name.toLowerCase().includes(ingredient.toLowerCase())
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
            recipe.ingredients.some((i) =>
              i.name.toLowerCase().includes(query)
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

  private enhancedScoreRecipes(
    recipes: Recipe[],
    options: EnhancedFilterOptions
  ): ScoredRecipe[] {
    return recipes.map((recipe) => {
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
          // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
          const favoriteScoreValue = Number(recipe.favoriteScore) || 1;
          score *= favoriteScoreValue;
        }

        // Complexity preference boost
        if (options.complexity && recipe.complexity === options.complexity) {
          score *= 1.2;
        }

        return {
          ...recipe,
          score,
        };
      } catch (error) {
        logger.error('Error scoring recipe:', { recipe, error });
        return { ...recipe, score: 0 };
      }
    });
  }

  private sortRecipes(
    recipes: ScoredRecipe[],
    options: SortOptions
  ): ScoredRecipe[] {
    try {
      return [...recipes].sort((a, b) => {
        let comparison = 0;

        switch (options.by) {
          case 'relevance':
            comparison = (b.score || 0) - (a.score || 0);
            break;
          case 'prepTime':
            comparison =
              this.parseTime(a.timeToMake) - this.parseTime(b.timeToMake);
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
      return (
        (hours ? parseInt(hours[1]) * 60 : 0) +
        (minutes ? parseInt(minutes[1]) : 0)
      );
    } catch (error) {
      logger.error('Error parsing time:', { timeString, error });
      return 0;
    }
  }

  private meetsRestriction(
    recipe: Recipe,
    restriction: DietaryRestriction
  ): boolean {
    // Properly check dietary restrictions based on recipe properties
    switch (restriction) {
      case 'Vegetarian':
        return recipe.isVegetarian === true;
      case 'Vegan':
        return recipe.isVegan === true;
      case 'Gluten-Free':
        return recipe.isGlutenFree === true;
      case 'Dairy-Free':
        return recipe.isDairyFree === true;
      case 'Keto':
        return recipe.isKeto === true || this.hasKetoAttributes(recipe);
      case 'Paleo':
        return recipe.isPaleo === true || this.hasPaleoAttributes(recipe);
      case 'Low-Carb':
        return (
          recipe.isLowCarb === true ||
          (recipe.nutrition?.carbs !== undefined && recipe.nutrition.carbs < 20)
        );
      case 'Low-Fat':
        return (
          recipe.isLowFat === true ||
          (recipe.nutrition?.fat !== undefined && recipe.nutrition.fat < 10)
        );
      default:
        return true;
    }
  }

  // Helper functions for inferring dietary patterns when flags aren't explicitly set
  private hasKetoAttributes(recipe: Recipe): boolean {
    // Check if recipe seems keto-friendly based on ingredients and nutritional info
    const carbs = recipe.nutrition?.carbs;
    const fat = recipe.nutrition?.fat;
    const protein = recipe.nutrition?.protein;

    // If we have nutrition info, check for keto macros (high fat, moderate protein, very low carb)
    if (carbs !== undefined && fat !== undefined && protein !== undefined) {
      const totalCals = fat * 9 + protein * 4 + carbs * 4;
      const fatPercent = (fat * 9) / (totalCals || 1);
      const carbPercent = (carbs * 4) / totalCals;

      return carbPercent < 0.1 && fatPercent > 0.7; // Less than 10% carbs, more than 70% fat
    }

    // If no nutrition info, do a basic check of ingredients
    const highCarbIngredients = [
      'sugar',
      'flour',
      'bread',
      'pasta',
      'rice',
      'potato',
      'corn',
    ];
    return !recipe.ingredients.some((ing) =>
      highCarbIngredients.some((carbIng) =>
        ing.name.toLowerCase().includes(carbIng)
      )
    );
  }

  private hasPaleoAttributes(recipe: Recipe): boolean {
    // Check if recipe seems paleo-friendly based on ingredients
    const nonPaleoIngredients = [
      'grain',
      'wheat',
      'cereal',
      'bread',
      'pasta',
      'rice',
      'dairy',
      'milk',
      'cheese',
      'yogurt',
      'sugar',
      'corn syrup',
      'bean',
      'legume',
      'peanut',
      'vegetable oil',
      'canola',
      'soybean oil',
    ];

    return !recipe.ingredients.some((ing) =>
      nonPaleoIngredients.some((nonPaleoIng) =>
        ing.name.toLowerCase().includes(nonPaleoIng)
      )
    );
  }

  private calculateElementalScore(
    recipeElements?: ElementalProperties,
    targetElements?: ElementalProperties
  ): number {
    if (!recipeElements || !targetElements) return 1;

    try {
      let score = 0;
      let total = 0;

      Object.keys(targetElements).forEach((element) => {
        const key = element as keyof ElementalProperties;
        const diff = Math.abs(
          (recipeElements[key] || 0) - (targetElements[key] || 0)
        );
        score += 1 - diff;
        total += 1;
      });

      return total > 0 ? score / (total || 1) : 1;
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
      if (
        recipe.ingredients.some((i) =>
          i.name.toLowerCase().includes(queryLower)
        )
      ) {
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
    return recipes.slice(0, 3).map((recipe) => ({
      ...recipe,
      score: 0.5,
    }));
  }

  filterByCuisine(recipes: Recipe[], cuisineTypes: CuisineType[]): Recipe[] {
    if (!cuisineTypes?.length) return recipes;

    return recipes.filter((recipe) => {
      try {
        return cuisineTypes.some((cuisineType) => {
          const cuisine: Cuisine = cuisines[cuisineType] as unknown as Cuisine;
          if (!cuisine || !cuisine.dishes) return false;

          // Helper function to check if a dish matches the recipe
          const checkMatch = (
            dishName: string | { name: string } | null
          ): boolean => {
            if (!dishName) return false;
            if (typeof dishName === 'string') return dishName === recipe.name;
            if (
              typeof dishName === 'object' &&
              dishName !== null &&
              'name' in dishName
            ) {
              return dishName.name === recipe.name;
            }
            return false;
          };

          // Handle different structures of cuisine.dishes
          if (Array.isArray(cuisine.dishes)) {
            return cuisine.dishes.some((dish) => checkMatch(dish));
          }

          // Handle structured dishes by meal time and season
          return Object.values(cuisine.dishes).some((mealTimeDishes) => {
            if (!mealTimeDishes) return false;

            if (Array.isArray(mealTimeDishes)) {
              return mealTimeDishes.some((dish) => checkMatch(dish));
            }

            // If it's an object with season keys
            return Object.values(mealTimeDishes).some(
              (seasonDishes) =>
                Array.isArray(seasonDishes) &&
                seasonDishes.some((dish) => checkMatch(dish))
            );
          });
        });
      } catch (error) {
        logger.error('Error filtering by cuisine:', error);
        return true; // Include recipe if error occurs
      }
    });
  }

  private applyEnhancedFilters(
    recipes: Recipe[],
    options: EnhancedFilterOptions
  ): Recipe[] {
    return recipes.filter((recipe) => {
      try {
        // Previous filters...

        // Cuisine type filter
        if (options.cuisineTypes?.length) {
          const matchesCuisine =
            this.filterByCuisine([recipe], options.cuisineTypes).length > 0;
          if (!matchesCuisine) return false;
        }

        // Spiciness filter
        if (
          options.spiciness &&
          recipe.spiciness &&
          recipe.spiciness !== options.spiciness
        ) {
          return false;
        }

        // Temperature filter
        if (
          options.temperature &&
          recipe.servedAt &&
          recipe.servedAt !== options.temperature
        ) {
          return false;
        }

        // Complexity filter
        if (
          options.complexity &&
          recipe.complexity &&
          recipe.complexity !== options.complexity
        ) {
          return false;
        }

        // Cooking method filter
        if (
          options.cookingMethod?.length &&
          !options.cookingMethod.includes(recipe.cookingMethod as unknown)
        ) {
          return false;
        }

        // Serving size filter
        if (
          options.servingSize &&
          recipe.numberOfServings &&
          recipe.numberOfServings < options.servingSize
        ) {
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
          const hasExcluded = options.excludedIngredients.some((excluded) =>
            recipe.ingredients.some((ing) =>
              ing.name.toLowerCase().includes(excluded.toLowerCase())
            )
          );
          if (hasExcluded) return false;
        }

        // Favorite ingredients boost
        if (options.favoriteIngredients?.length) {
          const hasFavorite = options.favoriteIngredients.some((favorite) =>
            recipe.ingredients.some((ing) =>
              ing.name.toLowerCase().includes(favorite.toLowerCase())
            )
          );
          recipe.favoriteScore = hasFavorite ? 1.5 : 1;
        }

        // Cooking time range
        if (options.cookingTime) {
          const time = this.parseTime(recipe.timeToMake);
          if (options.cookingTime.min && time < options.cookingTime.min)
            return false;
          if (options.cookingTime.max && time > options.cookingTime.max)
            return false;
        }

        return true;
      } catch (error) {
        logger.error('Error applying enhanced filters:', { recipe, error });
        return true; // Include recipe if error occurs
      }
    });
  }

  private calculateCuisineScore(
    recipe: Recipe,
    cuisineTypes?: CuisineType[]
  ): number {
    if (!cuisineTypes?.length) return 1;

    try {
      const matchingCuisines = cuisineTypes.filter((cuisineType) => {
        const cuisine = cuisines[cuisineType];
        if (!cuisine || !cuisine.dishes) return false;

        // Helper function to check if a dish matches the recipe
        const checkMatch = (
          dishName: string | { name: string } | null
        ): boolean => {
          if (!dishName) return false;
          if (typeof dishName === 'string') return dishName === recipe.name;
          if (
            typeof dishName === 'object' &&
            dishName !== null &&
            'name' in dishName
          ) {
            return dishName.name === recipe.name;
          }
          return false;
        };

        // Handle different structures of cuisine.dishes
        if (Array.isArray(cuisine.dishes)) {
          return cuisine.dishes.some((dish) => checkMatch(dish));
        }

        // Handle structured dishes by meal time and season
        return Object.values(cuisine.dishes).some((mealTimeDishes) => {
          if (!mealTimeDishes) return false;

          if (Array.isArray(mealTimeDishes)) {
            return mealTimeDishes.some((dish) => checkMatch(dish));
          }

          // If it's an object with season keys
          return Object.values(mealTimeDishes).some(
            (seasonDishes) =>
              Array.isArray(seasonDishes) &&
              seasonDishes.some((dish) => checkMatch(dish))
          );
        });
      });

      return matchingCuisines.length > 0 ? 1.5 : 0.5;
    } catch (error) {
      logger.error('Error calculating cuisine score:', error);
      return 1;
    }
  }
}

export const recipeFilter = RecipeFilter.getInstance();

/**
 * Filter recipes by cuisine name
 * @param cuisine The cuisine name to filter by
 * @param recipes The array of recipes to filter
 * @returns Filtered array of recipes matching the cuisine
 */
export function getRecipesForCuisine(
  cuisine: string,
  recipes: Recipe[]
): Recipe[] {
  if (!cuisine || cuisine === 'all') {
    return recipes;
  }

  return recipes.filter(
    (recipe) => recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()
  );
}

/**
 * Performs sophisticated filtering of recipes based on ingredient mappings
 *
 * @param recipes Array of recipes to filter
 * @param elementalTarget Target elemental properties to match
 * @param ingredientRequirements Optional specific ingredients to include / (exclude || 1) / (emphasize || 1)
 * @returns Filtered and scored recipes sorted by match quality
 */
export function filterRecipesByIngredientMappings(
  recipes: Recipe[],
  elementalTarget?: ElementalProperties,
  ingredientRequirements?: {
    required?: string[]; // Ingredients that must be in the recipe
    excluded?: string[]; // Ingredients that must not be in the recipe
    emphasized?: string[]; // Ingredients that should be emphasized (boost score)
    dietaryRestrictions?: string[]; // Dietary restrictions to respect
  }
): {
  recipe: Recipe;
  score: number;
  matchQuality: string;
  matchedIngredients: {
    name: string;
    matchedTo?: IngredientMapping;
    confidence: number;
  }[];
}[] {
  // Default elemental target if none provided
  const targetElements = elementalTarget || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
  };

  // Process each recipe
  const results = recipes.map((recipe) => {
    // Find ingredient mappings
    const mappedIngredients = connectIngredientsToMappings(recipe as unknown);

    // Calculate base match score
    let score = 0.5; // Start with neutral score

    // 1. Check required ingredients
    let hasAllRequired = true;
    if (ingredientRequirements?.required?.length) {
      const requiredIngredientsMapped = mappedIngredients.filter(
        (match) =>
          match.matchedTo &&
          ingredientRequirements.required.some(
            (req) =>
              match.name.toLowerCase().includes(req.toLowerCase()) ||
              match.matchedTo.name?.toLowerCase().includes(req.toLowerCase())
          )
      );

      if (
        requiredIngredientsMapped.length <
        ingredientRequirements.required.length
      ) {
        hasAllRequired = false;
      } else {
        // Boost score for having required ingredients
        score += 0.2;
      }
    }

    // Immediately filter out recipes missing required ingredients
    if (!hasAllRequired) {
              // ← Pattern HH-3: Safe conversion via unknown
        return {
          recipe,
          score: 0,
          matchQuality: 'no-match',
          matchedIngredients: mappedIngredients,
        } as unknown as {
          recipe: Recipe;
          score: number;
          matchQuality: string;
          matchedIngredients: {
            name: string;
            matchedTo?: IngredientMapping;
            confidence: number;
          }[];
        };
    }

    // 2. Check excluded ingredients
    if (ingredientRequirements?.excluded?.length) {
      const hasExcludedIngredient = mappedIngredients.some((match) =>
        ingredientRequirements.excluded.some(
          (excl) =>
            match.name.toLowerCase().includes(excl.toLowerCase()) ||
            (match.matchedTo?.name &&
              match.matchedTo.name.toLowerCase().includes(excl.toLowerCase()))
        )
      );

      if (hasExcludedIngredient) {
        // ← Pattern HH-3: Safe conversion via unknown
        return {
          recipe,
          score: 0,
          matchQuality: 'excluded',
          matchedIngredients: mappedIngredients,
        } as unknown as {
          recipe: Recipe;
          score: number;
          matchQuality: string;
          matchedIngredients: {
            name: string;
            matchedTo?: IngredientMapping;
            confidence: number;
          }[];
        };
      }
    }

    // 3. Check dietary restrictions
    if (
      ingredientRequirements?.dietaryRestrictions?.length &&
      recipe.dietaryInfo
    ) {
      const meetsRestrictions =
        ingredientRequirements.dietaryRestrictions.every((restriction) =>
          Array.isArray(recipe.dietaryInfo) 
            ? recipe.dietaryInfo.includes(restriction)
            : (recipe.dietaryInfo as unknown)?.includes?.(restriction) || false
        );

      if (!meetsRestrictions) {
        // ← Pattern HH-3: Safe conversion via unknown
        return {
          recipe,
          score: 0,
          matchQuality: 'dietary-mismatch',
          matchedIngredients: mappedIngredients,
        } as unknown as {
          recipe: Recipe;
          score: number;
          matchQuality: string;
          matchedIngredients: {
            name: string;
            matchedTo?: IngredientMapping;
            confidence: number;
          }[];
        };
      }

      // Boost score for meeting dietary requirements
      score += 0.1;
    }

    // 4. Calculate mapping quality
    const mappedCount = mappedIngredients.filter((m) => m.matchedTo).length;
    const mappingQuality = mappedCount / Math.max(1, recipe.ingredients.length);

    // Add mapping quality to score (better mappings = better score)
    score += mappingQuality * 0.2;

    // 5. Check for emphasized ingredients
    if (ingredientRequirements?.emphasized?.length) {
      const emphasisMatches = mappedIngredients.filter(
        (match) =>
          match.matchedTo &&
          ingredientRequirements.emphasized.some(
            (emph) =>
              match.name.toLowerCase().includes(emph.toLowerCase()) ||
              (match.matchedTo.name &&
                match.matchedTo.name.toLowerCase().includes(emph.toLowerCase()))
          )
      );

      // Boost score for each emphasized ingredient found
      const emphasizedLength = Array.isArray(ingredientRequirements?.emphasized) 
        ? ingredientRequirements.emphasized.length 
        : 1;
      score +=
        (emphasisMatches.length / emphasizedLength) * 0.2;
    }

    // 6. Calculate elemental alignment with target
    let elementalScore = 0;
    if (recipe.elementalProperties) {
      const diff =
        Math.abs(recipe.elementalProperties.Fire - targetElements.Fire) +
        Math.abs(recipe.elementalProperties.Water - targetElements.Water) +
        Math.abs(recipe.elementalProperties.Earth - targetElements.Earth) +
        Math.abs(recipe.elementalProperties.Air - targetElements.Air);

      elementalScore = 1 - diff / (4 || 1); // Convert to 0-1 score
      score += elementalScore * 0.3; // 30% weight on elemental alignment
    }

    // Ensure score is in valid range
    score = Math.min(1, Math.max(0, score));

    // Determine match quality label
    let matchQuality = 'poor';
    if (score > 0.8) matchQuality = 'excellent';
    else if (score > 0.6) matchQuality = 'good';
    else if (score > 0.4) matchQuality = 'fair';

    // ← Pattern HH-3: Safe conversion via unknown
    return {
      recipe,
      score,
      matchQuality,
      matchedIngredients: mappedIngredients,
    } as unknown as {
      recipe: Recipe;
      score: number;
      matchQuality: string;
      matchedIngredients: {
        name: string;
        matchedTo?: IngredientMapping;
        confidence: number;
      }[];
    };
  });

  // Filter out non-matches and sort by score
  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}
