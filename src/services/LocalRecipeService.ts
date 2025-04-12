import { cuisinesMap } from '@/data/cuisines';
import type { Recipe } from '@/types/recipe';
import type { Cuisine, SeasonalDishes } from '@/types/cuisine';
import { logger } from '@/utils/logger';

/**
 * LocalRecipeService extracts recipes from cuisine files
 * This helps reduce API calls by using local data first
 */
export class LocalRecipeService {
  // Main cache of all extracted recipes
  private static _allRecipes: Recipe[] | null = null;
  
  /**
   * Get all recipes from all cuisines
   * @returns Array of recipes
   */
  static getAllRecipes(): Recipe[] {
    // Use cached recipes if available
    if (this._allRecipes) {
      return this._allRecipes;
    }
    
    const recipes: Recipe[] = [];
    
    try {
      // Extract recipes from each cuisine
      Object.values(cuisinesMap).forEach(cuisine => {
        if (!cuisine) return;
        const cuisineRecipes = this.getRecipesFromCuisine(cuisine);
        recipes.push(...cuisineRecipes);
      });
      
      // Cache for future use
      this._allRecipes = recipes;
      return recipes;
    } catch (error) {
      logger.error('Error loading all recipes:', error);
      return [];
    }
  }
  
  /**
   * Get recipes for a specific cuisine
   * @param cuisineName The name of the cuisine
   * @returns Array of recipes for that cuisine
   */
  static getRecipesByCuisine(cuisineName: string): Recipe[] {
    if (!cuisineName) {
      logger.warn('No cuisine name provided to getRecipesByCuisine');
      return [];
    }
    
    try {
      // First normalize the cuisine name
      const normalizedName = cuisineName.trim().toLowerCase();
      
      // Find the cuisine object
      const cuisine = Object.values(cuisinesMap).find(
        c => c?.name?.toLowerCase() === normalizedName
      );
      
      if (!cuisine) {
        logger.info(`Cuisine not found: ${cuisineName}`);
        return [];
      }
      
      return this.getRecipesFromCuisine(cuisine);
    } catch (error) {
      logger.error(`Error getting recipes for cuisine ${cuisineName}:`, error);
      return [];
    }
  }
  
  /**
   * Extract all recipes from a cuisine object
   * @param cuisine The cuisine object
   * @returns Array of recipes
   */
  private static getRecipesFromCuisine(cuisine: Cuisine): Recipe[] {
    if (!cuisine) return [];
    
    const recipes: Recipe[] = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks'];
    
    try {
      console.log(`Extracting recipes from cuisine: ${cuisine.name}`);
      console.log(`Dishes structure:`, Object.keys(cuisine.dishes || {}));
      
      // Loop through each meal type
      mealTypes.forEach(mealType => {
        if (!cuisine.dishes || !cuisine.dishes[mealType]) {
          console.log(`No dishes for meal type: ${mealType}`);
          return;
        }
        
        // Check if mealType has season-specific recipes
        const seasonalDishes = cuisine.dishes[mealType] as SeasonalDishes;
        console.log(`Seasonal dishes for ${mealType}:`, Object.keys(seasonalDishes || {}));
        
        // Process "all" season recipes
        if (seasonalDishes.all && Array.isArray(seasonalDishes.all)) {
          console.log(`Found ${seasonalDishes.all.length} dishes for 'all' season in ${mealType}`);
          seasonalDishes.all.forEach(dish => {
            // Add to recipes if it's valid
            if (dish && dish.name) {
              recipes.push(this.standardizeRecipe(dish, cuisine.name, ['all'], [mealType]));
            }
          });
        }
        
        // Process seasonal recipes
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        seasons.forEach(season => {
          // Use both season and its alternative name (autumn/fall)
          const seasonalKey = season === 'autumn' ? 'fall' : (season === 'fall' ? 'autumn' : season);
          
          // Get recipes for the season
          const seasonRecipes = 
            (seasonalDishes[season] && Array.isArray(seasonalDishes[season])) ? seasonalDishes[season] : 
            (seasonalDishes[seasonalKey] && Array.isArray(seasonalDishes[seasonalKey])) ? seasonalDishes[seasonalKey] : 
            [];
          
          if (seasonRecipes.length > 0) {
            console.log(`Found ${seasonRecipes.length} dishes for ${season} in ${mealType}`);
          }
          
          // Process each recipe
          seasonRecipes.forEach(dish => {
            if (dish && dish.name) {
              recipes.push(this.standardizeRecipe(dish, cuisine.name, [season], [mealType]));
            }
          });
        });
      });
      
      console.log(`Extracted ${recipes.length} total recipes from ${cuisine.name} cuisine`);
      return recipes;
    } catch (error) {
      logger.error(`Error extracting recipes from cuisine ${cuisine.name}:`, error);
      return [];
    }
  }
  
  /**
   * Standardize a recipe to match our Recipe type
   * @param dish The dish object from cuisine data
   * @param cuisineName The cuisine name
   * @param seasons The seasons for this dish
   * @param mealTypes The meal types for this dish
   * @returns Standardized recipe
   */
  private static standardizeRecipe(
    dish: any, 
    cuisineName: string, 
    seasons: string[] = ['all'],
    mealTypes: string[] = ['any']
  ): Recipe {
    try {
      if (!dish) {
        throw new Error('Dish object is null or undefined');
      }
      
      // Generate a deterministic ID if none exists
      const id = dish.id || `${cuisineName.toLowerCase()}-${dish.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Map cuisine ingredients to our RecipeIngredient type
      const ingredients = (Array.isArray(dish.ingredients) ? dish.ingredients : []).map(ing => {
        if (!ing) return {
          name: 'unknown ingredient',
          amount: 1,
          unit: 'unit'
        };
        
        return {
          name: ing.name || '',
          amount: parseFloat(ing.amount) || 1,
          unit: ing.unit || '',
          preparation: ing.preparation || '',
          category: ing.category || '',
          optional: ing.optional || false,
          notes: ing.notes || '',
          substitutes: ing.swaps || ing.substitutes || []
        };
      });
      
      // Ensure elementalProperties exist
      const elementalProperties = dish.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
      
      // Standardize timing information
      const prepTime = dish.prepTime || '';
      const cookTime = dish.cookTime || '';
      
      // Parse timeToMake from prepTime and cookTime if available
      let timeToMake = dish.timeToMake || '';
      if (!timeToMake && prepTime && cookTime) {
        const prepMinutes = parseInt(prepTime.split(' ')[0]) || 0;
        const cookMinutes = parseInt(cookTime.split(' ')[0]) || 0;
        timeToMake = `${prepMinutes + cookMinutes} minutes`;
      }
      if (!timeToMake) {
        timeToMake = '30 minutes'; // Default
      }
      
      // Get instructions from preparationSteps or instructions field
      let instructions = [];
      if (Array.isArray(dish.preparationSteps) && dish.preparationSteps.length > 0) {
        instructions = dish.preparationSteps;
      } else if (Array.isArray(dish.instructions) && dish.instructions.length > 0) {
        instructions = dish.instructions;
      } else if (typeof dish.instructions === 'string' && dish.instructions.trim() !== '') {
        instructions = [dish.instructions];
      } else if (typeof dish.preparationSteps === 'string' && dish.preparationSteps.trim() !== '') {
        instructions = [dish.preparationSteps];
      } else {
        instructions = [`Prepare the ingredients and cook this ${cuisineName} dish according to traditional methods.`];
      }
      
      // Process cooking methods
      let cookingMethods = [];
      if (Array.isArray(dish.cookingMethods) && dish.cookingMethods.length > 0) {
        cookingMethods = dish.cookingMethods;
      } else if (typeof dish.cookingMethod === 'string' && dish.cookingMethod.trim() !== '') {
        cookingMethods = [dish.cookingMethod];
      } else if (typeof dish.cookingMethods === 'string' && dish.cookingMethods.trim() !== '') {
        cookingMethods = [dish.cookingMethods];
      }
      
      // Process tools
      let tools = [];
      if (Array.isArray(dish.tools) && dish.tools.length > 0) {
        tools = dish.tools;
      } else if (typeof dish.tools === 'string' && dish.tools.trim() !== '') {
        tools = [dish.tools];
      }
      
      // Process nutrition information
      const nutrition = dish.nutrition || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: [],
        minerals: []
      };
      
      // Process substitutions
      let substitutions = {};
      if (dish.substitutions && typeof dish.substitutions === 'object') {
        substitutions = dish.substitutions;
      }
      
      // Ensure dietary information is consistent
      const dietaryInfo = Array.isArray(dish.dietaryInfo) ? dish.dietaryInfo : [];
      const isVegetarian = dietaryInfo.includes('vegetarian') || dish.isVegetarian || false;
      const isVegan = dietaryInfo.includes('vegan') || dish.isVegan || false;
      const isGlutenFree = dietaryInfo.includes('gluten-free') || dish.isGlutenFree || false;
      const isDairyFree = dietaryInfo.includes('dairy-free') || dish.isDairyFree || false;
      
      // Process pairing suggestions
      let pairingSuggestions = [];
      if (Array.isArray(dish.pairingSuggestions) && dish.pairingSuggestions.length > 0) {
        pairingSuggestions = dish.pairingSuggestions;
      } else if (typeof dish.pairingSuggestions === 'string' && dish.pairingSuggestions.trim() !== '') {
        pairingSuggestions = [dish.pairingSuggestions];
      }
      
      return {
        id,
        name: dish.name || `${cuisineName} dish`,
        description: dish.description || `A delicious ${cuisineName} dish.`,
        cuisine: cuisineName,
        regionalCuisine: dish.regionalCuisine || '',
        ingredients,
        instructions,
        prepTime,
        cookTime,
        timeToMake,
        numberOfServings: dish.servingSize || dish.numberOfServings || 4,
        elementalProperties,
        season: seasons,
        mealType: mealTypes,
        
        // Dietary information
        isVegetarian,
        isVegan,
        isGlutenFree,
        isDairyFree,
        dietaryInfo,
        
        // Additional useful properties
        cookingMethods,
        tools,
        culturalNotes: dish.culturalNotes || '',
        pairingSuggestions,
        spiceLevel: dish.spiceLevel || 'medium',
        substitutions,
        nutrition,
        allergens: dish.allergens || [],
        tips: dish.tips || [],
        chefNotes: dish.chefNotes || [],
        
        // Source information
        source: 'Local Cuisine Database',
        matchScore: 0.9 // Default high match score for local recipes
      };
    } catch (error) {
      logger.error(`Error standardizing recipe: ${error}`, { dish, cuisineName });
      // Return a placeholder recipe rather than failing completely
      return {
        id: `error-${Date.now()}`,
        name: dish?.name || 'Error Recipe',
        description: 'There was an error processing this recipe',
        cuisine: cuisineName,
        ingredients: [],
        instructions: [],
        timeToMake: '0 minutes',
        numberOfServings: 1,
        elementalProperties: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        season: seasons,
        mealType: mealTypes,
        source: 'Error',
        matchScore: 0
      };
    }
  }
  
  /**
   * Search recipes with a query
   * @param query Search query string
   * @returns Matching recipes
   */
  static searchRecipes(query: string): Recipe[] {
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return [];
    
    try {
      return this.getAllRecipes().filter(recipe => {
        if (!recipe) return false;
        
        // Create a single searchable text from various recipe fields
        const searchText = [
          recipe.name,
          recipe.description,
          recipe.cuisine,
          ...(Array.isArray(recipe.ingredients) ? recipe.ingredients.map(i => i?.name || '') : []),
          ...(Array.isArray(recipe.cookingMethods) ? recipe.cookingMethods : []),
          ...(Array.isArray(recipe.mealType) ? recipe.mealType : 
             typeof recipe.mealType === 'string' ? [recipe.mealType] : []),
          ...(Array.isArray(recipe.season) ? recipe.season : 
             typeof recipe.season === 'string' ? [recipe.season] : [])
        ].join(' ').toLowerCase();
        
        // Recipe matches if it contains ALL search terms
        return searchTerms.every(term => searchText.includes(term));
      });
    } catch (error) {
      logger.error('Error searching recipes:', error);
      return [];
    }
  }
  
  /**
   * Get recipes by meal type
   * @param mealType Meal type (breakfast, lunch, dinner, dessert)
   * @returns Matching recipes
   */
  static getRecipesByMealType(mealType: string): Recipe[] {
    if (!mealType) return [];
    const normalizedMealType = mealType.toLowerCase().trim();
    
    try {
      return this.getAllRecipes().filter(recipe => {
        if (!recipe) return false;
        
        const recipeMealTypes = Array.isArray(recipe.mealType) 
          ? recipe.mealType.map(m => m?.toLowerCase() || '')
          : [recipe.mealType?.toLowerCase() || ''];
        
        return recipeMealTypes.includes(normalizedMealType);
      });
    } catch (error) {
      logger.error(`Error getting recipes by meal type ${mealType}:`, error);
      return [];
    }
  }
  
  /**
   * Get recipes by season
   * @param season Season (spring, summer, fall/autumn, winter)
   * @returns Matching recipes
   */
  static getRecipesBySeason(season: string): Recipe[] {
    if (!season) return [];
    const normalizedSeason = season.toLowerCase().trim();
    const alternativeSeason = normalizedSeason === 'autumn' ? 'fall' : 
                             (normalizedSeason === 'fall' ? 'autumn' : normalizedSeason);
    
    try {
      return this.getAllRecipes().filter(recipe => {
        if (!recipe) return false;
        
        const recipeSeasons = Array.isArray(recipe.season) 
          ? recipe.season.map(s => s?.toLowerCase() || '')
          : [recipe.season?.toLowerCase() || ''];
        
        return recipeSeasons.includes(normalizedSeason) || 
               recipeSeasons.includes(alternativeSeason) ||
               recipeSeasons.includes('all');
      });
    } catch (error) {
      logger.error(`Error getting recipes by season ${season}:`, error);
      return [];
    }
  }
  
  /**
   * Clear the recipe cache to force a reload
   */
  static clearCache(): void {
    this._allRecipes = null;
  }
} 