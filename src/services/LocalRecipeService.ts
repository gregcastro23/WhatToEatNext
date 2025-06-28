import { cuisinesMap } from '@/data/cuisines';
import type { Recipe } from '@/types/recipe';
import type { Cuisine, SeasonalDishes } from '@/types/cuisine';
import type { ZodiacSign, LunarPhase } from '@/types/alchemy';
import { logger } from '@/utils/logger';

// Define a more specific type for dish objects
interface RawDish {
  id?: string;
  name: string;
  description?: string;
  ingredients?: Array<{
    name?: string;
    amount?: number | string;
    unit?: string;
    preparation?: string;
    category?: string;
    optional?: boolean;
    notes?: string;
    swaps?: string[] | string;
    substitutes?: string[] | string;
  }>;
  preparationSteps?: string[] | string;
  instructions?: string[] | string;
  prepTime?: string | number;
  cookTime?: string | number;
  timeToMake?: string;
  elementalProperties?: Record<string, number>;
  elementalState?: Record<string, number>;
  season?: string[];
  mealType?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  dietaryInfo?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    vitamins?: string[];
    minerals?: string[];
  };
  servingSize?: number | string;
  servings?: number | string;
  numberOfServings?: number | string;
  astrologicalInfluences?: string[];
  zodiacInfluences?: string[];
  lunarPhaseInfluences?: string[];
  planetaryInfluences?: {
    favorable?: string[];
    unfavorable?: string[];
  };
  cookingMethods?: string[];
  substitutions?: Record<string, string[] | string>;
  tools?: string[];
  spiceLevel?: string;
  preparationNotes?: string;
  culturalNotes?: string;
  technicalTips?: string[] | string;
}

// Define a type for the seasonal dishes structure
interface SeasonalDishCollection {
  all?: RawDish[];
  spring?: RawDish[];
  summer?: RawDish[];
  fall?: RawDish[];
  autumn?: RawDish[];
  winter?: RawDish[];
  [key: string]: RawDish[] | undefined;
}

// Add missing array indexer to MealCollection
interface MealCollection {
  breakfast?: SeasonalDishCollection;
  lunch?: SeasonalDishCollection;
  dinner?: SeasonalDishCollection;
  dessert?: SeasonalDishCollection;
  snacks?: SeasonalDishCollection;
  [key: string]: SeasonalDishCollection | undefined;
}

// Add dishes property to Cuisine
interface ExtendedCuisine extends Cuisine {
  dishes?: MealCollection | {
    dishes?: MealCollection;
  };
}

/**
 * LocalRecipeService extracts recipes from cuisine files
 * This helps reduce API calls by using local data first
 */
export class LocalRecipeService {
  // Main cache of all extracted recipes
  private static _allRecipes: Recipe[] | null = null;
  
  /**
   * Get all available recipes
   * @returns Array of all recipes
   */
  static async getAllRecipes(): Promise<Recipe[]> {
    // Return cached recipes if available
    if (this._allRecipes) {
      return this._allRecipes;
    }
    
    try {
      const recipes: Recipe[] = [];
      
      // Get recipes from all available cuisines
      for (const cuisine of Object.values(cuisinesMap)) {
        if (cuisine) {
          const cuisineRecipes = await this.getRecipesFromCuisine(cuisine as any);
          recipes.push(...cuisineRecipes);
        }
      }
      
      console.log(`Loaded ${recipes.length} total recipes`);
      
      // Cache the recipes for future use
      this._allRecipes = recipes;
      
      return recipes;
    } catch (error) {
      console.error("Error getting all recipes:", error);
      return [];
    }
  }
  
  /**
   * Get recipes for a specific cuisine
   * @param cuisineName The name of the cuisine
   * @returns Array of recipes for that cuisine
   */
  static async getRecipesByCuisine(cuisineName: string): Promise<Recipe[]> {
    if (!cuisineName) {
      logger.warn('No cuisine name provided to getRecipesByCuisine');
      return [];
    }
    
    try {
      console.log(`Getting recipes for cuisine: ${cuisineName}`);
      
      // Normalize cuisine name for comparison
      const normalizedName = cuisineName.toLowerCase().trim();
      
      // Handle special cases for African and American cuisines
      if (normalizedName === 'african' || normalizedName === 'american') {
        console.log(`Special handling for: ${normalizedName}`);
        
        // Try different ways to access the cuisine data
        let directCuisine: ExtendedCuisine | null = null;
        
        try {
          // Try importing the cuisine directly from its file using dynamic imports
          if (normalizedName === 'african') {
            const africanModule = await import('../data/cuisines/african');
            directCuisine = africanModule.african as ExtendedCuisine;
          } else {
            const americanModule = await import('../data/cuisines/american');
            directCuisine = americanModule.american as ExtendedCuisine;
          }
          
          console.log(`Direct import successful for ${normalizedName}`);
        } catch (error) {
          console.error(`Error importing ${normalizedName} cuisine directly:`, error);
          
          // If direct import fails, try the cuisinesMap object (various cases)
          directCuisine = (cuisinesMap[normalizedName] || 
                         cuisinesMap[normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)] ||
                         cuisinesMap[normalizedName.toUpperCase()]) as ExtendedCuisine;
        }
        
        if (directCuisine) {
          console.log(`Found ${normalizedName} cuisine data`);
          
          // Additional debug information to help diagnose issues
          console.log(`Cuisine structure: ${JSON.stringify({
            id: directCuisine.id,
            name: directCuisine.name,
            hasDishes: !!directCuisine.dishes,
            dishTypes: directCuisine.dishes ? Object.keys(directCuisine.dishes).join(', ') : 'none',
            breakfast: ((directCuisine.dishes as any)?.breakfast?.all?.length || (directCuisine.dishes as any)?.dishes?.breakfast?.all?.length) || 0,
            lunch: ((directCuisine.dishes as any)?.lunch?.all?.length || (directCuisine.dishes as any)?.dishes?.lunch?.all?.length) || 0,
            dinner: ((directCuisine.dishes as any)?.dinner?.all?.length || (directCuisine.dishes as any)?.dishes?.dinner?.all?.length) || 0,
            dessert: ((directCuisine.dishes as any)?.dessert?.all?.length || (directCuisine.dishes as any)?.dishes?.dessert?.all?.length) || 0
          })}`);
          
          return await this.getRecipesFromCuisine(directCuisine);
        } else {
          console.warn(`Could not find ${normalizedName} in cuisinesMap keys:`, Object.keys(cuisinesMap));
        }
      }
      
      // Find the cuisine object in the regular way
      const cuisine = Object.values(cuisinesMap).find(
        c => c?.name?.toLowerCase() === normalizedName
      );
      
      if (!cuisine) {
        // Try finding the cuisine by ID or variations of the name
        const byIdMatch = Object.entries(cuisinesMap).find(
          ([id, c]) => id.toLowerCase() === normalizedName ||
                    c?.name?.toLowerCase() === normalizedName ||
                    c?.name?.toLowerCase().includes(normalizedName) ||
                    normalizedName.includes(c?.name?.toLowerCase())
        );
        
        if (byIdMatch && byIdMatch[1]) {
          return await this.getRecipesFromCuisine(byIdMatch[1] as any);
        }
        
        logger.info(`Cuisine not found: ${cuisineName}`);
        return [];
      }
      
      return await this.getRecipesFromCuisine(cuisine as ExtendedCuisine);
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
  private static async getRecipesFromCuisine(cuisine: ExtendedCuisine): Promise<Recipe[]> {
    if (!cuisine) return [];
    
    const recipes: Recipe[] = [];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert', 'snacks'];
    
    try {
      console.log(`Extracting recipes from cuisine: ${cuisine.name}`);
      
      // Special handling for American and African cuisines
      const isSpecialCase = cuisine.name.toLowerCase() === 'american' || cuisine.name.toLowerCase() === 'african';
      
      // Log specific debug info for African cuisine
      if (cuisine.name.toLowerCase() === 'african') {
        console.log('AFRICAN CUISINE DETAILED DEBUG INFO:');
        console.log('Full cuisine structure:', JSON.stringify({
          id: cuisine.id,
          name: cuisine.name,
          dishesKeys: Object.keys(cuisine.dishes || {}),
          breakfastAllLength: ((cuisine.dishes as any)?.breakfast?.all?.length || (cuisine.dishes as any)?.dishes?.breakfast?.all?.length) || 0,
          lunchAllLength: ((cuisine.dishes as any)?.lunch?.all?.length || (cuisine.dishes as any)?.dishes?.lunch?.all?.length) || 0,
          dinnerAllLength: ((cuisine.dishes as any)?.dinner?.all?.length || (cuisine.dishes as any)?.dishes?.dinner?.all?.length) || 0,
          dessertAllLength: ((cuisine.dishes as any)?.dessert?.all?.length || (cuisine.dishes as any)?.dishes?.dessert?.all?.length) || 0,
        }));
        
        // Check if "all" arrays actually contain recipes with safe type casting
        const dishesData = cuisine.dishes as any;
        const breakfastAll = dishesData?.breakfast?.all || dishesData?.dishes?.breakfast?.all;
        if (breakfastAll?.length > 0) {
          console.log('Sample breakfast recipe:', JSON.stringify(breakfastAll[0]));
        }
      }
      
      // Check if dishes structure exists
      if (!cuisine.dishes) {
        console.log(`No dishes found for cuisine: ${cuisine.name}`);
        
        if (isSpecialCase) {
          console.warn(`Special case (${cuisine.name}) has no dishes property:`, cuisine);
        }
        
        return [];
      }
      
      console.log(`Dishes structure:`, Object.keys(cuisine.dishes || {}));
      
      // Quick check for all season recipes in each meal type
      mealTypes.forEach(mealType => {
        if (cuisine.dishes && cuisine.dishes[mealType] && 
            typeof cuisine.dishes[mealType] === 'object' && 
            cuisine.dishes[mealType].all && 
            Array.isArray(cuisine.dishes[mealType].all)) {
          console.log(`Found ${cuisine.dishes[mealType].all.length} ${mealType} recipes in 'all' season for ${cuisine.name}`);
        } else if (isSpecialCase) {
          // Debug problematic cuisine
          console.warn(`No '${mealType}.all' array found for ${cuisine.name}`);
          if (cuisine.dishes && cuisine.dishes[mealType]) {
            console.log(`Structure of ${mealType}:`, Object.keys(cuisine.dishes[mealType]));
          }
        }
      });
      
      // Loop through each meal type
      mealTypes.forEach(mealType => {
        if (!cuisine.dishes || !cuisine.dishes[mealType]) {
          console.log(`No dishes for meal type: ${mealType}`);
          return;
        }
        
        const seasonalDishes = cuisine.dishes[mealType] as SeasonalDishCollection;
        console.log(`Meal type ${mealType} structure:`, JSON.stringify(Object.keys(seasonalDishes || {})));
        
        // Process seasonal recipes (spring, summer, autumn, winter)
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        seasons.forEach(season => {
          // Use both season and its alternative name (autumn/fall)
          const seasonalKey = season === 'autumn' ? 'fall' : (season === 'fall' ? 'autumn' : season);
          
          // Get recipes for the season
          let seasonRecipes: RawDish[] = [];
          if (seasonalDishes[season] && Array.isArray(seasonalDishes[season])) {
            seasonRecipes = seasonalDishes[season] || [];
          } else if (seasonalDishes[seasonalKey] && Array.isArray(seasonalDishes[seasonalKey])) {
            seasonRecipes = seasonalDishes[seasonalKey] || [];
          }
          
          if (seasonRecipes.length > 0) {
            console.log(`Found ${seasonRecipes.length} dishes for ${season} in ${mealType}`);
            // Add only unique recipes based on name to avoid duplicates from 'all' merging
            seasonRecipes.forEach(dish => {
              if (dish && dish.name && !recipes.some(r => r.name === dish.name)) {
                recipes.push(this.standardizeRecipe(dish, cuisine.name, [season], [mealType]));
              }
            });
          } else if (isSpecialCase) {
            console.warn(`No recipes found for ${season} in ${mealType} for ${cuisine.name}`);
          }
        });
      });
      
      console.log(`Extracted ${recipes.length} total recipes from ${cuisine.name} cuisine`);
      
      // If no recipes were found, log cuisine structure to help debug
      if (recipes.length === 0) {
        console.warn(`No recipes extracted for ${cuisine.name}. Cuisine structure:`, 
          JSON.stringify({
            id: cuisine.id,
            name: cuisine.name,
            dishesKeys: Object.keys(cuisine.dishes || {}),
            hasDishes: !!cuisine.dishes,
            dishesStructure: Object.entries(cuisine.dishes || {}).map(([key, value]) => ({
              mealType: key,
              hasValue: !!value,
              seasonKeys: value ? Object.keys(value) : [],
              hasAll: !!(value && value.all),
              allIsArray: !!(value && value.all && Array.isArray(value.all)),
              allLength: value && value.all && Array.isArray(value.all) ? value.all.length : 0
            }))
          }, null, 2)
        );
        
        // Check if the dishes property might be nested incorrectly
        if (cuisine.dishes && typeof cuisine.dishes.dishes === 'object') {
          console.log('Found nested dishes property, trying to extract from there instead');
          return this.getRecipesFromCuisine({...cuisine, dishes: cuisine.dishes.dishes as any});
        }
      }
      
      return recipes;
    } catch (error) {
      logger.error(`Error extracting recipes from cuisine ${cuisine.name}:`, error);
      console.error(`Error extracting recipes from cuisine ${cuisine.name}:`, error);
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
    dish: RawDish, 
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
          amount: ing.amount ? (typeof ing.amount === 'string' ? parseFloat(ing.amount) || 1 : ing.amount) : 1,
          unit: ing.unit || '',
          preparation: ing.preparation || '',
          category: ing.category || '',
          optional: ing.optional || false,
          notes: ing.notes || '',
          substitutes: Array.isArray(ing.swaps) ? ing.swaps : 
                      Array.isArray(ing.substitutes) ? ing.substitutes :
                      typeof ing.swaps === 'string' ? [ing.swaps] :
                      typeof ing.substitutes === 'string' ? [ing.substitutes] : []
        };
      });
      
      // Ensure elementalProperties exist - checking all possible property names
      let elementalProperties = dish.elementalProperties || dish.elementalState || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
      
      // Make sure all elemental properties are numbers
      elementalProperties = {
        Fire: typeof elementalProperties.Fire === 'number' ? elementalProperties.Fire : 0.25,
        Water: typeof elementalProperties.Water === 'number' ? elementalProperties.Water : 0.25,
        Earth: typeof elementalProperties.Earth === 'number' ? elementalProperties.Earth : 0.25,
        Air: typeof elementalProperties.Air === 'number' ? elementalProperties.Air : 0.25
      };
      
      // Standardize timing information
      const prepTime = dish.prepTime || '';
      const cookTime = dish.cookTime || '';
      
      // Parse timeToMake from prepTime and cookTime if available
      let timeToMake = dish.timeToMake || '';
      if (!timeToMake && prepTime && cookTime) {
        const prepMinutes = parseInt(prepTime.toString().split(' ')[0]) || 0;
        const cookMinutes = parseInt(cookTime.toString().split(' ')[0]) || 0;
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
      } else if (typeof dish.preparationSteps === 'string') {
        instructions = [dish.preparationSteps];
      } else if (typeof dish.instructions === 'string') {
        instructions = [dish.instructions];
      } else {
        instructions = ['Place all ingredients in a pot and cook until done.'];
      }
      
      // Process nutrition information
      const nutrition = dish.nutrition ? {
        calories: dish.nutrition.calories,
        protein: dish.nutrition.protein,
        carbs: dish.nutrition.carbs,
        fat: dish.nutrition.fat,
        vitamins: dish.nutrition.vitamins || [],
        minerals: dish.nutrition.minerals || []
      } : undefined;
      
      // Process substitutions
      let substitutions = [];
      if (dish.substitutions && typeof dish.substitutions === 'object') {
        // Convert from {ingredient: [alternatives]} format
        substitutions = Object.entries(dish.substitutions).map(([original, alternatives]) => ({
          original,
          alternatives: Array.isArray(alternatives) ? alternatives : [alternatives as string]
        }));
      }
      
      // Get number of servings
      const servingSize = dish.servingSize || dish.numberOfServings || dish.servings || 4;
      
      // Create standardized recipe
      return {
        id,
        name: dish.name,
        description: dish.description || '',
        cuisine: cuisineName,
        ingredients: ingredients,
        instructions: instructions,
        timeToMake: timeToMake,
        numberOfServings: typeof servingSize === 'number' ? servingSize : parseInt(servingSize) || 4,
        elementalProperties: elementalProperties,
        season: Array.isArray(dish.season) ? dish.season : seasons,
        mealType: Array.isArray(dish.mealType) ? dish.mealType : mealTypes,
        isVegetarian: dish.isVegetarian || dish.dietaryInfo?.includes('vegetarian') || false,
        isVegan: dish.isVegan || dish.dietaryInfo?.includes('vegan') || false,
        isGlutenFree: dish.isGlutenFree || dish.dietaryInfo?.includes('gluten-free') || false,
        isDairyFree: dish.isDairyFree || dish.dietaryInfo?.includes('dairy-free') || false,
        nutrition: nutrition,
        astrologicalInfluences: Array.isArray(dish.astrologicalInfluences) ? dish.astrologicalInfluences : [],
        zodiacInfluences: Array.isArray(dish.zodiacInfluences) ? dish.zodiacInfluences as ZodiacSign[] : [],
        lunarPhaseInfluences: Array.isArray(dish.lunarPhaseInfluences) ? dish.lunarPhaseInfluences as LunarPhase[] : [],
        planetaryInfluences: {
          favorable: dish.planetaryInfluences?.favorable || [],
          unfavorable: dish.planetaryInfluences?.unfavorable || []
        },
        cookingMethods: Array.isArray(dish.cookingMethods) ? dish.cookingMethods : [],
        // New fields
        substitutions: substitutions,
        tools: Array.isArray(dish.tools) ? dish.tools : [],
        servingSize: typeof servingSize === 'number' ? servingSize : parseInt(servingSize) || 4, 
        spiceLevel: (dish.spiceLevel === 'hot' || dish.spiceLevel === 'mild' || dish.spiceLevel === 'medium' || dish.spiceLevel === 'very hot') ? dish.spiceLevel : 'mild',
        preparationNotes: dish.preparationNotes || dish.culturalNotes || '',
        technicalTips: Array.isArray(dish.technicalTips) ? dish.technicalTips : []
      };
    } catch (error) {
      console.error('Error standardizing recipe:', error);
      return {
        id: `error-${Math.random().toString(36).substring(2, 11)}`,
        name: dish?.name || 'Unknown Recipe',
        description: 'Error loading recipe details',
        cuisine: cuisineName,
        ingredients: [],
        instructions: ['Recipe details unavailable'],
        timeToMake: '0 minutes',
        numberOfServings: 0,
        elementalProperties: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        }
      };
    }
  }
  
  /**
   * Search recipes by query string
   * @param query Search query
   * @returns Array of recipes matching the query
   */
  static async searchRecipes(query: string): Promise<Recipe[]> {
    if (!query) return [];
    
    try {
      const normalizedQuery = query.toLowerCase().trim();
      const recipes = await this.getAllRecipes();
      
      return recipes.filter(recipe => {
        // Search in recipe name
        if (recipe.name && recipe.name.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Search in recipe description
        if (recipe.description && recipe.description.toLowerCase().includes(normalizedQuery)) {
          return true;
        }
        
        // Search in ingredients
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          for (const ingredient of recipe.ingredients) {
            const ingredientName = typeof ingredient === 'string' 
              ? ingredient 
              : ingredient.name;
            
            if (ingredientName && ingredientName.toLowerCase().includes(normalizedQuery)) {
              return true;
            }
          }
        }
        
        return false;
      });
    } catch (error) {
      console.error(`Error searching recipes for query "${query}":`, error);
      return [];
    }
  }
  
  /**
   * Get recipes by meal type
   * @param mealType The meal type to filter by
   * @returns Array of recipes for the specified meal type
   */
  static async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    if (!mealType) return [];
    
    try {
      const normalizedMealType = mealType.toLowerCase().trim();
      const recipes = await this.getAllRecipes();
      
      return recipes.filter(recipe => 
        recipe.mealType && 
        (Array.isArray(recipe.mealType) 
          ? recipe.mealType.some(m => m.toLowerCase() === normalizedMealType)
          : recipe.mealType.toLowerCase() === normalizedMealType)
      );
    } catch (error) {
      console.error(`Error getting recipes for meal type "${mealType}":`, error);
      return [];
    }
  }
  
  /**
   * Get recipes by season
   * @param season The season to filter by
   * @returns Array of recipes for the specified season
   */
  static async getRecipesBySeason(season: string): Promise<Recipe[]> {
    if (!season) return [];
    
    try {
      const normalizedSeason = season.toLowerCase().trim();
      const recipes = await this.getAllRecipes();
      
      return recipes.filter(recipe => 
        recipe.season && 
        (Array.isArray(recipe.season) 
          ? recipe.season.some(s => s.toLowerCase() === normalizedSeason)
          : recipe.season.toLowerCase() === normalizedSeason)
      );
    } catch (error) {
      console.error(`Error getting recipes for season "${season}":`, error);
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