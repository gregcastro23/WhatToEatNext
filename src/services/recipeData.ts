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

// Define interface for nutrition data
export interface NutritionData {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  vitamins?: string[];
  minerals?: string[];
  [key: string]: any; // Allow other properties
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
 * Ensures a recipe has all required properties with defaults as needed
 * This is the single source of truth for recipe validation and normalization
 */
function ensureRecipeProperties(recipe: Partial<Recipe>): Recipe {
  if (!recipe) {
    throw new Error('Recipe cannot be null or undefined');
  }

  // Validate name format
  if (recipe.name) {
    if (recipe.name.length < 3 || recipe.name.length > 100) {
      throw new Error('Recipe name must be between 3 and 100 characters');
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
  safeRecipe.isVegetarian = recipe.isVegetarian ?? false;
  safeRecipe.isVegan = recipe.isVegan ?? false;
  safeRecipe.isGlutenFree = recipe.isGlutenFree ?? false;
  safeRecipe.isDairyFree = recipe.isDairyFree ?? false;

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
}

// Helper validation functions
function validateAndNormalizeIngredients(ingredients: Array<Partial<RecipeIngredient>>): RecipeIngredient[] {
  if (!Array.isArray(ingredients)) {
    throw new Error('Ingredients must be an array');
  }
  
  if (ingredients.length === 0) {
    throw new Error('Recipe must have at least one ingredient');
  }

  return ingredients.map(ing => ({
    name: ing.name || 'Unknown Ingredient',
    amount: typeof ing.amount === 'number' ? ing.amount : 1,
    unit: ing.unit || 'piece',
    category: ing.category || 'other',
    optional: ing.optional || false,
    preparation: ing.preparation || '',
    notes: ing.notes || '',
    // Standardize ingredient elemental properties too
    elementalProperties: ing.elementalProperties ? recipeElementalService.standardizeRecipe({elementalProperties: ing.elementalProperties}).elementalProperties : undefined
  }));
}

function validateAndNormalizeInstructions(instructions: string[] | unknown[]): string[] {
  if (!Array.isArray(instructions)) {
    return ['Prepare ingredients', 'Cook until done'];
  }
  
  if (instructions.length === 0) {
    return ['Prepare ingredients', 'Cook until done'];
  }
  
  return instructions.map(step => 
    typeof step === 'string' ? step : 'Prepare according to preference'
  );
}

function validateAndNormalizeTime(time: string | number | unknown): string {
  if (!time) return '30 minutes';
  
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
}

function validateServings(servings: number | string | unknown): number {
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
}

function validateMealType(mealType: string | string[] | unknown): string[] {
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'drink', 'appetizer', 'side'];
  
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

  constructor() {
    // Start loading data immediately
    this.initPromise = this.loadRecipeData()
  }

  private async loadRecipeData(): Promise<void> {
    try {
      logger.info('Loading recipe data...')
      
      // Create recipes from mappings safely
      if (!recipeElementalMappings) {
        logger.error('recipeElementalMappings not found or invalid');
        this.recipes = [];
        this.initialized = true;
        return;
      }
      
      // Handle different formats of recipeElementalMappings
      const mappingsEntries = Array.isArray(recipeElementalMappings) 
        ? recipeElementalMappings 
        : Object.entries(recipeElementalMappings).map(([id, mapping]) => ({
            id,
            ...mapping
          }));
      
      this.recipes = mappingsEntries.map((mapping: any) => {
        let elementalProps = mapping.elementalProperties || mapping.elementalProfile;
        
        // If no elemental properties, derive them from cuisine or other attributes
        if (!elementalProps) {
          elementalProps = recipeElementalService.deriveElementalProperties({
            cuisine: mapping.cuisine?.name || mapping.cuisine,
            cookingMethod: mapping.cookingMethod
          });
        }
        
        // Create a partial recipe object with safe defaults
        const partialRecipe: Partial<Recipe> = {
          id: mapping.id || `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: mapping.name || mapping.id || 'Unknown Recipe',
          cuisine: mapping.cuisine?.name || mapping.cuisine || 'Unknown',
          description: mapping.description || mapping.cuisine?.description || '',
          elementalProperties: elementalProps,
          ingredients: Array.isArray(mapping.ingredients) 
            ? mapping.ingredients.map((ing: any) => ({
                name: ing.name || 'Unknown Ingredient',
                amount: typeof ing.amount === 'number' ? ing.amount : 1,
                unit: ing.unit || 'piece',
                category: ing.category || 'other'
              }))
            : [],
          instructions: Array.isArray(mapping.instructions) ? mapping.instructions : [],
          timeToMake: mapping.timeToMake || '30 minutes',
          energyProfile: mapping.energyProfile || {},
          // Critical field: always ensure astrologicalInfluences is set
          astrologicalInfluences: (mapping.astrologicalInfluences ? 
                                  (Array.isArray(mapping.astrologicalInfluences) ? 
                                    mapping.astrologicalInfluences : 
                                    [mapping.astrologicalInfluences]) : 
                                  (mapping.astrologicalProfile?.rulingPlanets ? 
                                    (Array.isArray(mapping.astrologicalProfile.rulingPlanets) ? 
                                      mapping.astrologicalProfile.rulingPlanets : 
                                      [mapping.astrologicalProfile.rulingPlanets]) : 
                                    ["all"])),
          season: mapping.seasonalProperties || mapping.season || ['all'],
          mealType: mapping.mealType || ['dinner'],
          numberOfServings: mapping.servings || 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Ensure all properties are properly set with defaults as needed
        return ensureRecipeProperties(partialRecipe)
      })
      
      // Mark as initialized
      this.initialized = true
      logger.info(`Loaded ${this.recipes.length} recipes successfully`)
      
      // Cache the recipes
      cache.set(RECIPE_CACHE_KEY, this.recipes)
      
    } catch (error) {
      logger.error('Error loading recipes:', error)
      // Initialize with an empty array to prevent further errors
      this.recipes = []
      this.initialized = true
    }
  }

  // Add a method to standardize recipes after they've been loaded from anywhere
  private standardizeRecipes(recipes: Recipe[]): Recipe[] {
    return recipes.map(recipe => {
      // First ensure elemental properties are properly set
      const withElementalProps = recipeElementalService.standardizeRecipe(recipe);
      
      // Then ensure all other properties are valid
      return ensureRecipeProperties({
        ...recipe,
        elementalProperties: withElementalProps.elementalProperties
      });
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