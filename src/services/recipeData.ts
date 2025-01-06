import type { Recipe } from '@/types/recipe'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'

// Sample cuisines for initial data
const CUISINES = [
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'Chinese',
  'French',
  'Mediterranean',
  'Thai'
]

class RecipeData {
  private recipes: Recipe[] = []
  private initialized: boolean = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Initialize with mock data but don't block constructor
    this.initPromise = this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    try {
      logger.info('Initializing RecipeData service')
      
      // Generate some sample recipes if we don't have any
      if (this.recipes.length === 0) {
        this.recipes = this.generateSampleRecipes()
      }

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

  private generateSampleRecipes(): Recipe[] {
    logger.info('Generating sample recipes')
    return CUISINES.flatMap(cuisine => {
      // Generate 3 recipes per cuisine
      return Array.from({ length: 3 }, (_, i) => ({
        id: `${cuisine.toLowerCase()}-${i + 1}`,
        name: `${cuisine} Recipe ${i + 1}`,
        cuisine,
        elementalProperties: {
          Fire: Math.random(),
          Earth: Math.random(),
          Air: Math.random(),
          Water: Math.random(),
        }
      }))
    })
  }

  async getAllRecipes(): Promise<Recipe[]> {
    try {
      // Ensure initialization is complete
      if (this.initPromise) {
        await this.initPromise
      }

      if (!this.initialized) {
        throw new Error('RecipeData service not properly initialized')
      }

      // Simulate network delay in development
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      logger.info('Fetching all recipes', {
        count: this.recipes.length
      })

      return this.recipes
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getAllRecipes'
      })
      throw error
    }
  }

  async getRecipeByCuisine(cuisine: string): Promise<Recipe[]> {
    try {
      await this.initPromise
      return this.recipes.filter(recipe => recipe.cuisine === cuisine)
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'getRecipeByCuisine',
        cuisine
      })
      throw error
    }
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    try {
      await this.initPromise
      const lowercaseQuery = query.toLowerCase()
      return this.recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(lowercaseQuery) ||
        recipe.cuisine?.toLowerCase().includes(lowercaseQuery)
      )
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'RecipeData',
        action: 'searchRecipes',
        query
      })
      throw error
    }
  }
}

export const recipeData = new RecipeData() 