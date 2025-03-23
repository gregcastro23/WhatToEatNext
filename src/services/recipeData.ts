import type { ElementalProperties } from '@/types/alchemy'
import type { Recipe } from '@/types/recipe'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'
import { recipeElementalMappings } from '@/data/recipes/elementalMappings'
import { spices } from '@/data/ingredients/spices'
import { herbs } from '@/data/ingredients/herbs'
import { fruits } from '@/data/ingredients/fruits'
import { vegetables } from '@/data/ingredients/vegetables'
import { seasonings } from '@/data/ingredients/seasonings'
import { cache } from '@/utils/cache'

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
 * @param recipe Partial recipe object
 * @returns Complete Recipe object with all required properties
 */
function ensureRecipeProperties(recipe: Partial<Recipe>): Recipe {
  if (!recipe) {
    // If recipe is undefined or null, return a minimal valid recipe
    return {
      id: `fallback-recipe-${Date.now()}`,
      name: 'Fallback Recipe',
      ingredients: [],
      instructions: [],
      timeToMake: '30 minutes',
      servings: 2,
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      astrologicalInfluences: ["all"]
    };
  }

  // Start with basic defaults for required properties
  const safeRecipe: Recipe = {
    id: recipe.id || `recipe-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: recipe.name || 'Unnamed Recipe',
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    timeToMake: recipe.timeToMake || '30 minutes',
    servings: recipe.servings || 2,
    elementalProperties: recipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    },
    // Explicitly ensure astrologicalInfluences is always present
    astrologicalInfluences: recipe.astrologicalInfluences || ["all"],
    // Copy all other properties
    ...recipe
  }
  
  // Double-check critical properties after applying spread operator
  // as spreading might override our explicit defaults
  if (!safeRecipe.astrologicalInfluences || !Array.isArray(safeRecipe.astrologicalInfluences)) {
    safeRecipe.astrologicalInfluences = ["all"];
  }
  
  if (!safeRecipe.elementalProperties) {
    safeRecipe.elementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  
  return safeRecipe
}

class RecipeData {
  private recipes: Recipe[] = []
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Initialize with real data but do not block constructor
    this.initPromise = this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    try {
      logger.info('Initializing RecipeData service')
      
      // Load real recipe data from our data files
      await this.loadRecipeData()

      this.initialized = true
      logger.info('RecipeData service initialized successfully', {
        recipeCount: this.recipes.length
      })
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'initialize'
      })
      throw error
    }
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
        // Create a partial recipe object with safe defaults
        const partialRecipe: Partial<Recipe> = {
          id: mapping.id || `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: mapping.name || mapping.id || 'Unknown Recipe',
          cuisine: mapping.cuisine?.name || mapping.cuisine || 'Unknown',
          description: mapping.description || mapping.cuisine?.description || '',
          elementalProperties: mapping.elementalProperties || mapping.elementalProfile || {
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          },
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
          difficulty: mapping.difficulty || 'medium',
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
          servings: mapping.servings || 2,
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
  
  private getIngredientsFromBalance(ingredientBalance: any): any[] {
    const ingredients: any[] = []
    
    // Process base ingredients
    if (ingredientBalance.base) {
      ingredientBalance.base.forEach((ingredientId: string) => {
        const ingredient = this.findIngredient(ingredientId)
        if (ingredient) {
          ingredients.push({
            name: ingredient.name,
            amount: 1,
            unit: ingredient.unit || 'piece',
            category: ingredient.category || 'base',
            astrologicalProfile: ingredient.astrologicalProfile
          })
        }
      })
    }
    
    // Process elemental ingredients (earth, fire, water, air)
    ['earth', 'fire', 'water', 'air'].forEach(element => {
      if (ingredientBalance[element]) {
        ingredientBalance[element].forEach((ingredientId: string) => {
          const ingredient = this.findIngredient(ingredientId)
          if (ingredient) {
            ingredients.push({
              name: ingredient.name,
              amount: 1,
              unit: ingredient.unit || 'piece',
              category: ingredient.category || element,
              astrologicalProfile: ingredient.astrologicalProfile
            })
          }
        })
      }
    })
    
    return ingredients
  }
  
  private findIngredient(ingredientId: string): any {
    if (!ingredientId) return null;
    
    // Try to find the ingredient in our various ingredient collections
    const collections = [spices, herbs, fruits, vegetables, seasonings]
    
    for (const collection of collections) {
      if (collection && collection[ingredientId]) {
        return {
          ...collection[ingredientId],
          name: ingredientId
        }
      }
    }
    
    // Return default if not found
    return {
      name: ingredientId,
      elementalProperties: { Earth: 0.25, Fire: 0.25, Water: 0.25, Air: 0.25 }
    }
  }
  
  private generateInstructions(recipeId: string, mapping: any): string[] {
    if (!mapping) return ["Prepare ingredients and cook according to your preference."];
    
    // Generate basic instructions based on recipe data
    const instructions: string[] = []
    
    // Add preparation steps
    instructions.push(`Prepare all ingredients, measuring according to the recipe.`)
    
    // Add cooking technique based on the cuisine and techniques
    if (mapping.astrologicalProfile?.techniqueEnhancers && 
        mapping.astrologicalProfile.techniqueEnhancers.length > 0) {
      const technique = mapping.astrologicalProfile.techniqueEnhancers[0]
      instructions.push(`Cook using the ${technique.name || 'recommended'} technique.`)
    }
    
    // Add flavor combination instruction
    if (mapping.ingredientBalance?.base) {
      instructions.push(`Combine the base ingredients: ${mapping.ingredientBalance.base.join(', ').replace(/_/g, ' ')}.`)
    }
    
    // Add elemental ingredients instructions
    ['earth', 'fire', 'water', 'air'].forEach(element => {
      if (mapping.ingredientBalance?.[element] && mapping.ingredientBalance[element].length > 0) {
        instructions.push(`Add the ${element} ingredients: ${mapping.ingredientBalance[element].join(', ').replace(/_/g, ' ')}.`)
      }
    })
    
    // Add final instruction
    instructions.push(`Serve according to the traditional method for ${mapping.cuisine?.name || 'this cuisine'}.`)
    
    return instructions
  }
  
  private estimateCookingTime(mapping: any): string {
    if (!mapping) return '30-45';
    
    // Estimate cooking time based on techniques and ingredients
    const technique = mapping.astrologicalProfile?.techniqueEnhancers?.[0]?.name?.toLowerCase() || ''
    
    if (technique.includes('brais') || technique.includes('simmer') || technique.includes('slow')) {
      return '60-90'
    } else if (technique.includes('roast') || technique.includes('bake')) {
      return '45-60'
    } else if (technique.includes('grill') || technique.includes('sauté')) {
      return '20-30'
    } else {
      return '30-45' // Default
    }
  }
  
  private estimateDifficulty(mapping: any): 'easy' | 'medium' | 'hard' {
    if (!mapping) return 'medium';
    
    // Estimate difficulty based on techniques and ingredient count
    const techniqueCount = mapping.astrologicalProfile?.techniqueEnhancers?.length || 0
    const ingredientCount = 
      (mapping.ingredientBalance?.base?.length || 0) +
      (mapping.ingredientBalance?.earth?.length || 0) +
      (mapping.ingredientBalance?.fire?.length || 0) +
      (mapping.ingredientBalance?.water?.length || 0) +
      (mapping.ingredientBalance?.air?.length || 0)
    
    const complexityScore = techniqueCount + (ingredientCount / 3)
    
    if (complexityScore > 5) {
      return 'hard'
    } else if (complexityScore > 3) {
      return 'medium'
    } else {
      return 'easy'
    }
  }
  
  private determineSeason(elementalProperties: ElementalProperties): string[] {
    if (!elementalProperties) return ['all'];
    
    // Determine appropriate seasons based on elemental properties
    const entries = Object.entries(elementalProperties);
    if (!entries.length) return ['all'];
    
    const dominant = entries
      .sort(([, a], [, b]) => (b as number) - (a as number))[0][0]
    
    switch (dominant) {
      case 'Fire':
        return ['summer']
      case 'Earth':
        return ['autumn', 'fall']
      case 'Water':
        return ['winter']
      case 'Air':
        return ['spring']
      default:
        return ['all']
    }
  }

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Check cache first
      const cachedRecipes = cache.get(RECIPE_CACHE_KEY) as Recipe[] | undefined;
      if (cachedRecipes) {
        // Double-check that all cached recipes have astrologicalInfluences
        return cachedRecipes.map(recipe => ensureRecipeProperties(recipe));
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
      
      // Double-check that all recipes have astrologicalInfluences
      const safeRecipes = this.recipes.map(recipe => ensureRecipeProperties(recipe));
      
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
      servings: 2,
      difficulty: "easy",
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
      ).map(recipe => ensureRecipeProperties(recipe));
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
      const results = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(lowercaseQuery) ||
        recipe.cuisine?.toLowerCase().includes(lowercaseQuery)
      );
      
      // Always ensure all recipes have required properties
      return results.map(recipe => ensureRecipeProperties(recipe));
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'searchRecipes',
        query
      });
      return [this.getFallbackRecipe()];
    }
  }

  async getRecipesByAstrologicalProfile(zodiac: string, planets: string[]): Promise<Recipe[]> {
    try {
      if (this.initPromise) {
        await this.initPromise;
      }
      
      const recipes = await this.getAllRecipes();
      
      return recipes.filter(recipe => {
        // Check zodiac compatibility
        const zodiacMatch = recipe.astrologicalProfile?.favorableZodiac?.some(
          (zodiacSign: string) => zodiacSign.toLowerCase() === zodiac.toLowerCase()
        );
        
        // Check planetary compatibility - first ensure astrologicalInfluences exists
        const influences = recipe.astrologicalInfluences || ["all"];
        const planetMatch = planets.some(planet => influences.includes(planet));
        
        return zodiacMatch || planetMatch;
      }).map(recipe => ensureRecipeProperties(recipe));
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecipesByAstrologicalProfile'
      });
      return [this.getFallbackRecipe()];
    }
  }

  async getRecipesByElementalProfile(profile: ElementalProperties): Promise<Recipe[]> {
    try {
      const recipes = await this.getAllRecipes();
      
      // Calculate similarity with each recipe
      const recipesWithSimilarity = recipes.map(recipe => {
        const similarity = this.calculateElementalSimilarity(recipe.elementalProperties, profile);
        return { recipe: ensureRecipeProperties(recipe), similarity };
      });
      
      // Sort by similarity (highest first)
      recipesWithSimilarity.sort((a, b) => b.similarity - a.similarity);
      
      // Return recipes sorted by similarity
      return recipesWithSimilarity.map(item => item.recipe);
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecipesByElementalProfile'
      });
      return [this.getFallbackRecipe()];
    }
  }

  private calculateElementalSimilarity(profile1: ElementalProperties, profile2: ElementalProperties): number {
    if (!profile1 || !profile2) return 0;
    
    // Calculate Euclidean distance between the profiles
    const distanceSquared =
      Math.pow((profile1.Fire || 0) - (profile2.Fire || 0), 2) +
      Math.pow((profile1.Water || 0) - (profile2.Water || 0), 2) +
      Math.pow((profile1.Earth || 0) - (profile2.Earth || 0), 2) +
      Math.pow((profile1.Air || 0) - (profile2.Air || 0), 2);
    
    const distance = Math.sqrt(distanceSquared);
    
    // Convert distance to similarity (1 is perfect match, 0 is furthest)
    // Max distance in normalized space (0-1 for each dimension) is 2
    return 1 - (distance / 2);
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
      
      // Ensure the recipe has all required properties before returning
      return recipe ? ensureRecipeProperties(recipe) : null;
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
    difficulty?: string;
    astrologicalInfluences?: string[];
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
  }): Promise<Recipe[]> {
    try {
      const recipes = await this.getAllRecipes();
      
      const filteredRecipes = recipes.filter(recipe => {
        // Filter by cuisine
        if (filters.cuisine && recipe.cuisine !== filters.cuisine) {
          return false;
        }
        
        // Filter by meal type (any match)
        if (filters.mealType && filters.mealType.length > 0) {
          if (!recipe.mealType?.some(mt => filters.mealType?.includes(mt))) {
            return false;
          }
        }
        
        // Filter by season (any match)
        if (filters.season && filters.season.length > 0) {
          if (!recipe.season?.some(s => filters.season?.includes(s))) {
            return false;
          }
        }
        
        // Filter by difficulty
        if (filters.difficulty && recipe.difficulty !== filters.difficulty) {
          return false;
        }
        
        // Filter by astrological influences (any match)
        if (filters.astrologicalInfluences && filters.astrologicalInfluences.length > 0) {
          // Ensure recipe has astrologicalInfluences
          const influences = recipe.astrologicalInfluences || ["all"];
          
          // If recipe has "all" or any matching influence, include it
          if (!influences.includes("all") && 
              !influences.some(ai => filters.astrologicalInfluences?.includes(ai))) {
            return false;
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
      
      // Always ensure all recipes have required properties
      return filteredRecipes.map(recipe => ensureRecipeProperties(recipe));
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'filterRecipes'
      });
      return [this.getFallbackRecipe()];
    }
  }
}

// Export singleton instance
export const recipeData = new RecipeData(); 