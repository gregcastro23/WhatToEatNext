import type { Recipe } from '../types/recipe'
import { logger } from '../utils/logger'
import { errorHandler } from './errorHandler'
import { recipeElementalMappings } from '../data/recipes/elementalMappings'
import { spices } from '../data/ingredients/spices'
import { herbs } from '../data/ingredients/herbs'
import { fruits } from '../data/ingredients/fruits'
import { vegetables } from '../data/ingredients/vegetables'
import { seasonings } from '../data/ingredients/seasonings'
import { cache } from '../utils/cache'
import { validateElementalProperties } from '../types/recipe'
import { RecipeIngredient } from '../types/recipeIngredient'
import { recipeElementalService } from './RecipeElementalService'
import { createDataLoader, dataTransformers, DataLoaderOptions } from '../utils/dataLoader'
import { AppError, errorCodes, errorMessages } from '../utils/errorHandling'
import { hasRequiredProperties, isArrayOf } from '../utils/enhancedTypeGuards'

// Define interface for nutrition data
export interface NutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  vitamins?: string[];
  minerals?: string[];
  [key: string]: unknown; // Allow other properties
}

// Sample cuisines for initial data
const CUISINES = [
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Chinese',
  'French',
  'Greek',
  'Thai'
]

// Cache key for recipes
const RECIPE_CACHE_KEY = 'all_recipes'

/**
 * Type guard for Recipe objects
 */
export function isRecipe(obj: unknown): obj is Recipe {
  if (typeof obj !== 'object' || obj === null) return false;
  
  return hasRequiredProperties<Recipe>(obj, [
    'id',
    'name',
    'ingredients',
    'instructions',
    'elementalProperties'
  ]);
}

/**
 * Type guard for RecipeIngredient objects
 */
export function isRecipeIngredient(obj: unknown): obj is RecipeIngredient {
  if (typeof obj !== 'object' || obj === null) return false;
  
  return hasRequiredProperties<RecipeIngredient>(obj, [
    'name',
    'amount',
    'unit'
  ]);
}

/**
 * Ensures a recipe has all required properties with defaults as needed
 * This is the single source of truth for recipe validation and normalization
 */
function ensureRecipeProperties(recipe: Partial<Recipe>): Recipe {
  if (!recipe) {
    throw new AppError(
      'Recipe cannot be null or undefined',
      'VALIDATION_ERROR',
      errorCodes.VALIDATION_ERROR
    );
  }

  try {
    // Validate name format
    if (recipe.name) {
      if (recipe.name.length < 3 || recipe.name.length > 100) {
        throw new AppError(
          'Recipe name must be between 3 and 100 characters',
          'VALIDATION_ERROR',
          errorCodes.VALIDATION_ERROR,
          { name: recipe.name }
        );
      }
    }

    // Core required properties with enhanced validation
    const safeRecipe: Recipe = {
      id: recipe.id || `recipe-${Date.now()}`,
      name: recipe.name || 'Unnamed Recipe',
      description: recipe.description || '',
      cuisine: recipe.cuisine || '',
      ingredients: validateAndNormalizeIngredients(recipe.ingredients || []),
      instructions: validateAndNormalizeInstructions(recipe.instructions || []),
      timeToMake: validateAndNormalizeTime(recipe.timeToMake) || '30 minutes',
      numberOfServings: validateServings(recipe.numberOfServings) || 2,
      // Use the new recipe elemental service to ensure proper elemental properties
      elementalProperties: recipeElementalService.standardizeRecipe(recipe).elementalProperties
    };

    // Optional properties with validation
    if (recipe.mealType) {
      safeRecipe.mealType = validateMealType(recipe.mealType);
    }
    if (recipe.season) {
      safeRecipe.season = validateSeason(recipe.season);
    }
    
    // Boolean properties
    safeRecipe.isVegetarian = dataTransformers.normalizeBoolean(recipe.isVegetarian);
    safeRecipe.isVegan = dataTransformers.normalizeBoolean(recipe.isVegan);
    safeRecipe.isGlutenFree = dataTransformers.normalizeBoolean(recipe.isGlutenFree);
    safeRecipe.isDairyFree = dataTransformers.normalizeBoolean(recipe.isDairyFree);

    // Optional complex properties
    if (recipe.astrologicalInfluences) {
      safeRecipe.astrologicalInfluences = validateAstrologicalInfluences(recipe.astrologicalInfluences);
    }
    if (recipe.nutrition) {
      safeRecipe.nutrition = validateAndNormalizeNutrition(recipe.nutrition);
    }

    // Timestamp handling
    safeRecipe.createdAt = recipe.createdAt || new Date().toISOString();
    safeRecipe.updatedAt = new Date().toISOString();

    return safeRecipe;
  } catch (error) {
    // Log the error and provide fallback
    logger.error('Error standardizing recipe:', error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      'Failed to process recipe data',
      'DATA_ERROR',
      errorCodes.DATA_ERROR,
      { 
        recipe: recipe?.id || 'unknown',
        error: error instanceof Error ? error.message : String(error)
      }
    );
  }
}

// Helper validation functions
function validateAndNormalizeIngredients(ingredients: Array<Partial<RecipeIngredient>>): RecipeIngredient[] {
  if (!Array.isArray(ingredients)) {
    throw new AppError(
      'Ingredients must be an array',
      'VALIDATION_ERROR',
      errorCodes.VALIDATION_ERROR
    );
  }
  
  if (ingredients.length === 0) {
    throw new AppError(
      'Recipe must have at least one ingredient',
      'VALIDATION_ERROR',
      errorCodes.VALIDATION_ERROR
    );
  }

  try {
    return ingredients.map(ing => ({
      name: ing.name || 'Unknown Ingredient',
      amount: dataTransformers.normalizeNumber(ing.amount, 1),
      unit: ing.unit || 'piece',
      category: ing.category || 'other',
      optional: dataTransformers.normalizeBoolean(ing.optional),
      preparation: ing.preparation || '',
      notes: ing.notes || '',
      // Standardize ingredient elemental properties too
      elementalProperties: ing.elementalProperties 
        ? recipeElementalService.standardizeRecipe({elementalProperties: ing.elementalProperties}).elementalProperties 
        : undefined
    }));
  } catch (error) {
    logger.error('Error normalizing ingredients:', error);
    throw new AppError(
      'Failed to normalize recipe ingredients',
      'DATA_ERROR',
      errorCodes.DATA_ERROR,
      { error: error instanceof Error ? error.message : String(error) }
    );
  }
}

function validateAndNormalizeInstructions(instructions: string[] | unknown[]): string[] {
  if (!Array.isArray(instructions)) {
    return ['Prepare ingredients', 'Cook until done'];
  }
  
  if (instructions.length === 0) {
    return ['Prepare ingredients', 'Cook until done'];
  }
  
  try {
    return instructions.map(step => 
      typeof step === 'string' ? step : 'Prepare according to preference'
    );
  } catch (error) {
    logger.warn('Error normalizing instructions, using defaults:', error);
    return ['Prepare ingredients', 'Cook until done'];
  }
}

function validateAndNormalizeTime(time: string | number | unknown): string {
  if (!time) return '30 minutes';
  
  try {
    if (typeof time === 'number') {
      return `${time} minutes`;
    }
    
    if (typeof time === 'string') {
      // Check if already has time units
      if (/minutes|mins|hours|hrs/i.test(time)) {
        return time;
      }
      
      // Try to parse as number
      const timeNum = parseInt(time, 10);
      if (!isNaN(timeNum)) {
        return `${timeNum} minutes`;
      }
    }
    
    return '30 minutes';
  } catch (error) {
    logger.warn('Error normalizing time, using default:', error);
    return '30 minutes';
  }
}

function validateServings(servings: number | string | unknown): number {
  try {
    if (typeof servings === 'number') {
      return Math.max(1, Math.min(12, Math.round(servings)));
    }
    
    if (typeof servings === 'string') {
      const num = parseInt(servings, 10);
      if (!isNaN(num)) {
        return Math.max(1, Math.min(12, num));
      }
    }
    
    return 2;
  } catch (error) {
    logger.warn('Error normalizing servings, using default:', error);
    return 2;
  }
}

function validateMealType(mealType: string | string[] | unknown): string[] {
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side'];
  
  try {
    if (typeof mealType === 'string') {
      if (validMealTypes.includes(mealType.toLowerCase())) {
        return [mealType.toLowerCase()];
      }
      return ['dinner'];
    }
    
    if (Array.isArray(mealType)) {
      const validEntries = mealType
        .filter(type => typeof type === 'string')
        .map(type => type.toLowerCase())
        .filter(type => validMealTypes.includes(type));
      
      return validEntries.length > 0 ? validEntries : ['dinner'];
    }
    
    return ['dinner'];
  } catch (error) {
    logger.warn('Error validating meal type, using default:', error);
    return ['dinner'];
  }
}

function validateSeason(season: string | string[] | unknown): string[] {
  const validSeasons = ['spring', 'summer', 'fall', 'winter', 'all'];
  
  if (typeof season === 'string') {
    if (validSeasons.includes(season.toLowerCase())) {
      return [season.toLowerCase()];
    }
    return ['all'];
  }
  
  if (Array.isArray(season)) {
    const validEntries = season
      .filter(s => typeof s === 'string')
      .map(s => s.toLowerCase())
      .filter(s => validSeasons.includes(s));
    
    return validEntries.length > 0 ? validEntries : ['all'];
  }
  
  return ['all'];
}

function validateAstrologicalInfluences(influences: string | string[] | unknown): string[] {
  if (typeof influences === 'string') {
    return [influences];
  }
  
  if (Array.isArray(influences)) {
    const validEntries = influences
      .filter(i => typeof i === 'string')
      .filter(i => i.length > 0);
    
    return validEntries.length > 0 ? validEntries : ['all'];
  }
  
  return ['all'];
}

function validateAndNormalizeNutrition(nutrition: NutritionData): NutritionData {
  if (!nutrition || typeof nutrition !== 'object') {
    return {};
  }

  const safeNutrition: NutritionData = {};

  // Validate numeric fields
  ['calories', 'protein', 'carbs', 'fat'].forEach(field => {
    if (typeof nutrition[field] === 'number') {
      safeNutrition[field] = nutrition[field];
    }
  });

  // Validate array fields (vitamins, minerals)
  if (Array.isArray(nutrition.vitamins)) {
    safeNutrition.vitamins = nutrition.vitamins
      .filter((v: unknown) => typeof v === 'string')
      .slice(0, 10);  // Limit to 10 items
  }
  
  if (Array.isArray(nutrition.minerals)) {
    safeNutrition.minerals = nutrition.minerals
      .filter((m: unknown) => typeof m === 'string')
      .slice(0, 10);  // Limit to 10 items
  }

  return safeNutrition;
}

class RecipeData {
  private recipes: Recipe[] = []
  private initialized = false
  private initPromise: Promise<void> | null = null
  private recipeLoader: ReturnType<typeof createDataLoader<Recipe[]>>;

  constructor() {
    // Create a loader for recipe data with retry and caching
    this.recipeLoader = createDataLoader<Recipe[]>({
      cacheKey: RECIPE_CACHE_KEY,
      cacheTtl: 3600000, // 1 hour
      validator: (data) => {
        return Array.isArray(data) && data.length > 0;
      },
      transformer: (data) => {
        if (!Array.isArray(data)) {
          return [];
        }
        return this.standardizeRecipes(data as Partial<Recipe>[]);
      },
      fallback: [this.getFallbackRecipe()],
      retry: {
        attempts: 3,
        delay: 1000,
      }
    });
    
    // Initialize on construction
    this.initialize();
  }

  /**
   * Initialize the recipe data service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.loadRecipeData();
    
    try {
      await this.initPromise;
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize recipe data service:', error);
      // Reset for retry
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Load recipe data from all sources with enhanced error handling
   */
  private async loadRecipeData(): Promise<void> {
    try {
      // Attempt to load from cache first
      const cachedRecipes = cache.get<Recipe[]>(RECIPE_CACHE_KEY);
      
      if (cachedRecipes && cachedRecipes.length > 0) {
        logger.info(`Loaded ${cachedRecipes.length} recipes from cache`);
        this.recipes = cachedRecipes;
        return;
      }

      // If no cached data, load from various sources
      logger.info('No cached recipes found, loading from sources...');
      
      // Load recipe mappings
      const result = await this.recipeLoader.loadData(async () => {
        // Simulate loading from various data sources
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
        
        const combinedRecipes = [
          ...Object.values(recipeElementalMappings),
          // Other recipe sources could be added here
        ];
        
        if (combinedRecipes.length === 0) {
          throw new AppError(
            'No recipes found in data sources',
            'DATA_ERROR',
            errorCodes.DATA_ERROR
          );
        }
        
        return combinedRecipes;
      });

      this.recipes = result.data;
      logger.info(`Loaded ${this.recipes.length} recipes from ${result.source}`);
      
      // Cache for future use
      cache.set(RECIPE_CACHE_KEY, this.recipes);
      
    } catch (error) {
      logger.error('Error loading recipe data:', error);
      
      // Use fallback recipe
      this.recipes = [this.getFallbackRecipe()];
      
      // Rethrow as AppError for consistent error handling
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        'Failed to load recipe data',
        'DATA_ERROR',
        errorCodes.DATA_ERROR,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Ensure recipe data is standardized and valid
   */
  private standardizeRecipes(recipes: Partial<Recipe>[]): Recipe[] {
    try {
      return recipes
        .map(recipe => {
          try {
            return ensureRecipeProperties(recipe);
          } catch (error) {
            logger.warn(`Skipping invalid recipe (${recipe?.id || 'unknown'}):`, error);
            return null;
          }
        })
        .filter((recipe): recipe is Recipe => recipe !== null);
    } catch (error) {
      logger.error('Error standardizing recipes:', error);
      return [this.getFallbackRecipe()];
    }
  }

  // Rest of the class methods with enhanced error handling
  // ... existing methods with improved error handling using the new utilities

  private getFallbackRecipe(): Recipe {
    return ensureRecipeProperties({
      id: 'universal-balance',
      name: "Universal Balance Bowl",
      description: "A harmonious blend for any occasion",
      ingredients: [
        { name: "Mixed Greens", amount: 2, unit: "cups", category: "vegetables" },
        { name: "Quinoa", amount: 1, unit: "cup", category: "grains" },
        { name: "Mixed Seeds", amount: 0.25, unit: "cup", category: "garnish" }
      ],
      instructions: [
        "Combine all ingredients in a bowl",
        "Season to taste",
        "Enjoy mindfully"
      ],
      timeToMake: "15 minutes",
      numberOfServings: 2,
      elementalProperties: {
        Fire: 0.25, Earth: 0.25, Air: 0.25, Water: 0.25
      },
      season: ["all"],
      mealType: ["lunch", "dinner"],
      cuisine: "international",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isDairyFree: true,
      score: 1,
      astrologicalInfluences: ["all"]
    });
  }

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Check cache first
      const cachedRecipes = cache.get(RECIPE_CACHE_KEY) as Recipe[] | undefined;
      if (cachedRecipes) {
        // Standardize all cached recipes
        return this.standardizeRecipes(cachedRecipes);
      }
      
      // If not initialized, wait for initialization
      if (!this.initialized) {
        logger.info('Waiting for recipe data to initialize...');
        if (this.initPromise) {
          await this.initPromise;
        } else {
          await this.loadRecipeData();
        }
      }
      
      // If we still have no recipes, return at least a fallback recipe
      if (!this.recipes.length) {
        const fallbackRecipe = this.getFallbackRecipe();
        return [fallbackRecipe];
      }
      
      // Standardize all recipes
      const safeRecipes = this.standardizeRecipes(this.recipes);
      
      // Update cache
      cache.set(RECIPE_CACHE_KEY, safeRecipes);
      
      return safeRecipes;
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getAllRecipes'
      });
      
      // Return at least one fallback recipe to prevent application errors
      return [this.getFallbackRecipe()];
    }
  }

  async getRecipeByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      if (this.initPromise) {
        await this.initPromise;
      }
      
      const allRecipes = await this.getAllRecipes();
      return allRecipes.filter(recipe => 
        recipe.cuisine?.toLowerCase() === cuisine.toLowerCase()
      );
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecipeByCuisine',
        cuisine
      });
      return [this.getFallbackRecipe()];
    }
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      if (this.initPromise) {
        await this.initPromise;
      }
      const lowercaseQuery = query.toLowerCase();
      const recipes = await this.getAllRecipes();
      return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(lowercaseQuery) ||
        recipe.cuisine?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'searchRecipes',
        query
      });
      return [this.getFallbackRecipe()];
    }
  }

  async getRecommendedRecipes(count = 3): Promise<Recipe[]> {
    try {
      if (this.initPromise) {
        await this.initPromise;
      }
      const recipes = await this.getAllRecipes();
      
      // For now, just return random recipes
      return recipes
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecommendedRecipes'
      });
      return [this.getFallbackRecipe()];
    }
  }

  async addRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
    // Ensure the recipe has all required properties
    const newRecipe = ensureRecipeProperties(recipe);
    
    // Add to recipes array
    this.recipes.push(newRecipe);
    
    // Clear cache
    cache.delete(RECIPE_CACHE_KEY);
    
    return newRecipe;
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const recipes = await this.getAllRecipes();
      const recipe = recipes.find(r => r.id === id);
      
      return recipe || null;
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecipeById',
        id
      });
      return null;
    }
  }

  async filterRecipes(filters: {
    cuisine?: string;
    mealType?: string[];
    season?: string[];
    astrologicalInfluences?: string[];
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
  }): Promise<Recipe[]> {
    try {
      if (this.initPromise) {
        await this.initPromise;
      }
      
      const recipes = await this.getAllRecipes();
      
      const filteredRecipes = recipes.filter(recipe => {
        // Filter by cuisine
        if (filters.cuisine && recipe.cuisine) {
          const recipeCuisine = recipe.cuisine.toLowerCase();
          const targetCuisine = filters.cuisine.toLowerCase();
          
          if (!recipeCuisine.includes(targetCuisine)) {
            return false;
          }
        }
        
        // Filter by meal type
        if (filters.mealType && filters.mealType.length > 0 && recipe.mealType) {
          const mealTypes = Array.isArray(recipe.mealType) 
            ? recipe.mealType.map(mt => mt.toLowerCase())
            : [recipe.mealType.toLowerCase()];
          
          const targetMealTypes = filters.mealType.map(mt => mt.toLowerCase());
          
          if (!targetMealTypes.some(target => mealTypes.includes(target))) {
            return false;
          }
        }
        
        // Filter by season
        if (filters.season && filters.season.length > 0 && recipe.season) {
          const seasons = Array.isArray(recipe.season)
            ? recipe.season.map(s => s.toLowerCase())
            : [recipe.season.toLowerCase()];
          
          // Special case: if 'all' is included in recipe seasons, it matches any season
          if (!seasons.includes('all')) {
            const targetSeasons = filters.season.map(s => s.toLowerCase());
            
            if (!targetSeasons.some(target => seasons.includes(target))) {
              return false;
            }
          }
        }
        
        // Filter by astrological influences
        if (filters.astrologicalInfluences && filters.astrologicalInfluences.length > 0) {
          const influences = recipe.astrologicalInfluences || [];
          
          // Special case: if 'all' is included, it matches any influence
          if (!influences.includes('all')) {
            const hasMatch = filters.astrologicalInfluences.some(influence => 
              influences.some(recipeInfluence => 
                recipeInfluence.toLowerCase() === influence.toLowerCase()
              )
            );
            
            if (!hasMatch) {
              return false;
            }
          }
        }
        
        // Filter by dietary restrictions
        if (filters.isVegetarian && recipe.isVegetarian === false) {
          return false;
        }
        
        if (filters.isVegan && recipe.isVegan === false) {
          return false;
        }
        
        if (filters.isGlutenFree && recipe.isGlutenFree === false) {
          return false;
        }
        
        if (filters.isDairyFree && recipe.isDairyFree === false) {
          return false;
        }
        
        return true;
      });
      
      return filteredRecipes;
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'filterRecipes'
      });
      return [this.getFallbackRecipe()];
    }
  }
}

export const recipeData = new RecipeData(); 