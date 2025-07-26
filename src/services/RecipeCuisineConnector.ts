// Recipe Database Connector Service
// Bridges the extensive cuisine database with the recipe builder system
// Enables import, search, and optimization of existing recipes

import cuisinesMap from '@/data/cuisines';
import { generateMonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import type { Season, ElementalProperties } from '@/types/alchemy';
import type { Cuisine, CuisineDishes, SeasonalDishes } from '@/types/cuisine';
import type { Recipe } from '@/types/recipe';

// Interface for cuisine recipe with builder compatibility
export interface CuisineRecipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  ingredients: Array<{
    name: string;
    amount: string | number;
    unit: string;
    category?: string;
    swaps?: string[];
  }>;
  instructions?: string[];
  preparationSteps?: string[];
  cookingMethods?: string[];
  tools?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins?: string[];
    minerals?: string[];
  };
  servingSize?: number;
  prepTime?: string;
  cookTime?: string;
  allergens?: string[];
  dietaryInfo?: string[];
  season?: string[];
  mealType?: string[];
  substitutions?: Record<string, string[]>;
  culturalNotes?: string;
  pairingSuggestions?: string[];
  spiceLevel?: string;
  astrologicalAffinities?: {
    planets?: string[];
    signs?: string[];
    lunarPhases?: string[];
  };
  elementalProperties?: ElementalProperties;
}

// Search filters for cuisine recipes
export interface RecipeSearchFilters {
  cuisine?: string;
  mealType?: string;
  season?: Season;
  dietaryRestrictions?: string[];
  maxPrepTime?: number;
  maxCookTime?: number;
  allergenFree?: string[];
  ingredients?: string[];
  cookingMethods?: string[];
  spiceLevel?: string;
  maxCalories?: number;
  minProtein?: number;
}

// Recipe import result
export interface RecipeImportResult {
  success: boolean;
  recipe?: Recipe;
  warnings?: string[];
  errors?: string[];
  suggestions?: string[];
}

export class RecipeCuisineConnector {
  private cuisineDatabase: Record<string, Cuisine>;
  private recipeCache: Map<string, CuisineRecipe>;

  constructor() {
    this.cuisineDatabase = cuisinesMap;
    this.recipeCache = new Map();
    this.buildRecipeCache();
  }

  /**
   * Build cache of all recipes from cuisine database for fast searching
   */
  private buildRecipeCache(): void {
    Object.entries(this.cuisineDatabase).forEach(([cuisineName, cuisine]) => {
      this.extractRecipesFromCuisine(cuisine).forEach(recipe => {
        const recipeId = this.generateRecipeId(recipe.name, cuisine.name);
        this.recipeCache.set(recipeId, {
          ...recipe,
          id: recipeId,
          cuisine: cuisine.name,
          elementalProperties: cuisine.elementalProperties
        });
      });
    });
  }

  /**
   * Extract all recipes from a cuisine object
   */
  private extractRecipesFromCuisine(cuisine: Cuisine): CuisineRecipe[] {
    const recipes: CuisineRecipe[] = [];
    
    if (cuisine.dishes) {
      Object.entries(cuisine.dishes).forEach(([mealType, seasonalDishes]) => {
        this.extractRecipesFromSeasonalDishes(seasonalDishes as SeasonalDishes, mealType, recipes);
      });
    }

    return recipes;
  }

  /**
   * Extract recipes from seasonal dishes structure
   */
  private extractRecipesFromSeasonalDishes(
    seasonalDishes: SeasonalDishes, 
    mealType: string, 
    recipes: CuisineRecipe[]
  ): void {
    Object.entries(seasonalDishes).forEach(([season, dishArray]) => {
      if (Array.isArray(dishArray)) {
        dishArray.forEach((dish: any) => {
          if (dish && typeof dish === 'object') {
            const recipe: CuisineRecipe = {
              id: '',
              name: dish.name || 'Unnamed Recipe',
              description: dish.description || '',
              cuisine: dish.cuisine || '',
              ingredients: this.normalizeIngredients(dish.ingredients || []),
              instructions: dish.instructions || dish.preparationSteps || [],
              preparationSteps: dish.preparationSteps || [],
              cookingMethods: dish.cookingMethods || [],
              tools: dish.tools || [],
              nutrition: dish.nutrition,
              servingSize: dish.servingSize || 1,
              prepTime: dish.prepTime,
              cookTime: dish.cookTime,
              allergens: dish.allergens || [],
              dietaryInfo: dish.dietaryInfo || [],
              season: dish.season || [season],
              mealType: dish.mealType || [mealType],
              substitutions: dish.substitutions || {},
              culturalNotes: dish.culturalNotes,
              pairingSuggestions: dish.pairingSuggestions || [],
              spiceLevel: dish.spiceLevel,
              astrologicalAffinities: dish.astrologicalAffinities,
              elementalProperties: dish.elementalProperties
            };
            recipes.push(recipe);
          }
        });
      }
    });
  }

  /**
   * Normalize ingredient format for consistency
   */
  private normalizeIngredients(ingredients: any[]): CuisineRecipe['ingredients'] {
    return ingredients.map(ingredient => ({
      name: ingredient.name || '',
      amount: ingredient.amount || 1,
      unit: ingredient.unit || '',
      category: ingredient.category,
      swaps: ingredient.swaps || []
    }));
  }

  /**
   * Generate unique recipe ID
   */
  private generateRecipeId(recipeName: string, cuisineName: string): string {
    const cleanName = recipeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const cleanCuisine = cuisineName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${cleanCuisine}-${cleanName}`;
  }

  /**
   * Get all available cuisines
   */
  getCuisineList(): string[] {
    return Object.values(this.cuisineDatabase).map(cuisine => cuisine.name);
  }

  /**
   * Get total recipe count
   */
  getTotalRecipeCount(): number {
    return this.recipeCache.size;
  }

  /**
   * Get recipe count by cuisine
   */
  getRecipeCountByCuisine(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.recipeCache.forEach(recipe => {
      counts[recipe.cuisine] = (counts[recipe.cuisine] || 0) + 1;
    });
    return counts;
  }

  /**
   * Search recipes with filters
   */
  searchRecipes(filters: RecipeSearchFilters = {}): CuisineRecipe[] {
    let results = Array.from(this.recipeCache.values());

    // Filter by cuisine
    if (filters.cuisine) {
      results = results.filter(recipe => 
        recipe.cuisine.toLowerCase().includes(filters.cuisine!.toLowerCase())
      );
    }

    // Filter by meal type
    if (filters.mealType) {
      results = results.filter(recipe =>
        recipe.mealType?.some(type => 
          type.toLowerCase().includes(filters.mealType!.toLowerCase())
        )
      );
    }

    // Filter by season
    if (filters.season) {
      results = results.filter(recipe =>
        recipe.season?.includes(filters.season!) || recipe.season?.includes('all')
      );
    }

    // Filter by dietary restrictions
    if (filters.dietaryRestrictions?.length) {
      results = results.filter(recipe =>
        filters.dietaryRestrictions!.every(restriction =>
          recipe.dietaryInfo?.includes(restriction)
        )
      );
    }

    // Filter by allergen-free
    if (filters.allergenFree?.length) {
      results = results.filter(recipe =>
        !filters.allergenFree!.some(allergen =>
          recipe.allergens?.includes(allergen)
        )
      );
    }

    // Filter by ingredients
    if (filters.ingredients?.length) {
      results = results.filter(recipe =>
        filters.ingredients!.some(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
            recipeIngredient.name.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      );
    }

    // Filter by cooking methods
    if (filters.cookingMethods?.length) {
      results = results.filter(recipe =>
        filters.cookingMethods!.some(method =>
          recipe.cookingMethods?.includes(method)
        )
      );
    }

    // Filter by spice level
    if (filters.spiceLevel) {
      results = results.filter(recipe =>
        recipe.spiceLevel === filters.spiceLevel
      );
    }

    // Filter by max calories
    if (filters.maxCalories) {
      results = results.filter(recipe =>
        !recipe.nutrition?.calories || recipe.nutrition.calories <= filters.maxCalories!
      );
    }

    // Filter by min protein
    if (filters.minProtein) {
      results = results.filter(recipe =>
        recipe.nutrition?.protein && recipe.nutrition.protein >= filters.minProtein!
      );
    }

    return results;
  }

  /**
   * Get recipe by ID
   */
  getRecipeById(id: string): CuisineRecipe | undefined {
    return this.recipeCache.get(id);
  }

  /**
   * Get random recipes
   */
  getRandomRecipes(count: number = 5, filters: RecipeSearchFilters = {}): CuisineRecipe[] {
    const filteredRecipes = this.searchRecipes(filters);
    const shuffled = filteredRecipes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Convert cuisine recipe to recipe builder format
   */
  convertToBuilderFormat(cuisineRecipe: CuisineRecipe): Recipe {
    return {
      id: `cuisine-${cuisineRecipe.cuisine}-${cuisineRecipe.name}`.toLowerCase().replace(/\s+/g, '-'),
      name: cuisineRecipe.name,
      description: cuisineRecipe.description,
      cuisine: cuisineRecipe.cuisine,
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      ingredients: cuisineRecipe.ingredients.map(ingredient => ({
        name: ingredient.name,
        amount: Number(ingredient.amount) || 1,
        unit: ingredient.unit,
        swaps: ingredient.swaps || []
      })),
      instructions: cuisineRecipe.instructions || cuisineRecipe.preparationSteps || [],
      nutrition: cuisineRecipe.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: [],
        minerals: []
      },
      timeToMake: this.formatTimeToMake(cuisineRecipe.prepTime, cuisineRecipe.cookTime),
      season: cuisineRecipe.season || ['all'],
      mealType: cuisineRecipe.mealType || ['lunch'],
      elementalBalance: cuisineRecipe.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      }
    };
  }

  /**
   * Import recipe for modification in builder
   */
  importRecipeForBuilder(recipeId: string): RecipeImportResult {
    const cuisineRecipe = this.getRecipeById(recipeId);
    
    if (!cuisineRecipe) {
      return {
        success: false,
        errors: [`Recipe with ID ${recipeId} not found`]
      };
    }

    try {
      const builderRecipe = this.convertToBuilderFormat(cuisineRecipe);
      
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Generate warnings for missing data
      if (!cuisineRecipe.nutrition) {
        warnings.push('Nutritional information not available - will need to be calculated');
      }

      if (!cuisineRecipe.instructions?.length && !cuisineRecipe.preparationSteps?.length) {
        warnings.push('No cooking instructions available - will need to be added');
      }

      // Generate suggestions for optimization
      if (cuisineRecipe.substitutions && Object.keys(cuisineRecipe.substitutions).length > 0) {
        suggestions.push('Recipe has suggested ingredient substitutions available');
      }

      if (cuisineRecipe.culturalNotes) {
        suggestions.push('Cultural notes available for authentic preparation guidance');
      }

      return {
        success: true,
        recipe: builderRecipe,
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Failed to convert recipe: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Get recipe suggestions based on ingredients
   */
  getRecipeSuggestionsByIngredients(ingredients: string[]): CuisineRecipe[] {
    return this.searchRecipes({
      ingredients
    }).slice(0, 10);
  }

  /**
   * Get recipe suggestions for fusion cuisine
   */
  getFusionSuggestions(primaryCuisine: string, secondaryCuisine: string): CuisineRecipe[] {
    const primaryRecipes = this.searchRecipes({ cuisine: primaryCuisine });
    const secondaryRecipes = this.searchRecipes({ cuisine: secondaryCuisine });
    
    // Return a mix of recipes from both cuisines for fusion inspiration
    return [
      ...primaryRecipes.slice(0, 3),
      ...secondaryRecipes.slice(0, 3)
    ];
  }

  /**
   * Format time display
   */
  private formatTimeToMake(prepTime?: string, cookTime?: string): string {
    const prep = prepTime || '0 minutes';
    const cook = cookTime || '0 minutes';
    
    if (cook === '0 minutes' || cook === '0') {
      return prep;
    }
    
    if (prep === '0 minutes' || prep === '0') {
      return cook;
    }
    
    return `${prep} prep + ${cook} cook`;
  }

  /**
   * Get recipe statistics
   */
  getRecipeStatistics() {
    const stats = {
      totalRecipes: this.getTotalRecipeCount(),
      byCuisine: this.getRecipeCountByCuisine(),
      byMealType: {} as Record<string, number>,
      bySeason: {} as Record<string, number>,
      byDietaryInfo: {} as Record<string, number>
    };

    // Calculate meal type distribution
    this.recipeCache.forEach(recipe => {
      recipe.mealType?.forEach(type => {
        stats.byMealType[type] = (stats.byMealType[type] || 0) + 1;
      });
    });

    // Calculate seasonal distribution
    this.recipeCache.forEach(recipe => {
      recipe.season?.forEach(season => {
        stats.bySeason[season] = (stats.bySeason[season] || 0) + 1;
      });
    });

    // Calculate dietary info distribution
    this.recipeCache.forEach(recipe => {
      recipe.dietaryInfo?.forEach(info => {
        stats.byDietaryInfo[info] = (stats.byDietaryInfo[info] || 0) + 1;
      });
    });

    return stats;
  }
}

// Singleton instance
export const recipeCuisineConnector = new RecipeCuisineConnector();

// Export convenience functions
export const searchCuisineRecipes = (filters: RecipeSearchFilters = {}) => 
  recipeCuisineConnector.searchRecipes(filters);

export const importCuisineRecipe = (recipeId: string) => 
  recipeCuisineConnector.importRecipeForBuilder(recipeId);

export const getRandomCuisineRecipes = (count: number = 5, filters: RecipeSearchFilters = {}) => 
  recipeCuisineConnector.getRandomRecipes(count, filters);

export const getCuisineRecipeStats = () => 
  recipeCuisineConnector.getRecipeStatistics();