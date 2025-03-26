import { recipeData } from './recipeData'
import { stateManager } from '@/utils/stateManager'
import { stateValidator } from '@/utils/stateValidator'
import { celestialCalculator } from './celestialCalculations'
import { errorHandler } from './errorHandler'
import { logger } from '@/utils/logger'
import type { Recipe, ScoredRecipe } from '@/types/recipe'

interface InitializationResult {
  success: boolean
  data?: {
    recipes: ScoredRecipe[]
    favorites: string[]
    celestialData: any
  }
  error?: string
}

class InitializationService {
  private isInitializing = false
  private initPromise: Promise<InitializationResult> | null = null
  private retryCount = 0
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000

  async initialize(): Promise<InitializationResult> {
    if (this.isInitializing) {
      return this.initPromise!
    }

    this.isInitializing = true
    this.initPromise = this.performInitialization()

    return this.initPromise
  }

  private async performInitialization(): Promise<InitializationResult> {
    try {
      logger.info('Starting application initialization', {
        attempt: this.retryCount + 1
      })

      // Ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100))

      // Initialize services in sequence
      const recipes = await this.initializeRecipes()
      const userState = await this.initializeUserState()
      const celestialData = await this.initializeCelestialData()

      // Process and validate recipes
      const processedRecipes = this.processRecipes(recipes, celestialData)

      // Validate final state
      const isValid = stateValidator.validateState({
        recipes: processedRecipes,
        filteredRecipes: processedRecipes,
        favorites: userState.recipes.favorites,
        celestialPositions: celestialData,
        elementalBalance: celestialData,
        season: this.getCurrentSeason(),
        loading: false,
        error: null,
        lastUpdate: Date.now()
      })

      if (!isValid) {
        throw new Error('State validation failed after initialization')
      }

      logger.info('Initialization completed successfully')

      return {
        success: true,
        data: {
          recipes: processedRecipes,
          favorites: userState.recipes.favorites,
          celestialData
        }
      }

    } catch (error) {
      errorHandler.handleError(error, {
        context: 'InitializationService',
        action: 'initialize',
        attempt: this.retryCount + 1
      })

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++
        logger.info(`Retrying initialization (${this.retryCount}/${this.MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * this.retryCount))
        return this.performInitialization()
      }

      return {
        success: false,
        error: 'Failed to initialize application after multiple attempts'
      }
    } finally {
      this.isInitializing = false
    }
  }

  private async initializeRecipes(): Promise<Recipe[]> {
    try {
      const recipes = await recipeData.getAllRecipes()
      if (!recipes.every(recipe => stateValidator.validateRecipe(recipe))) {
        throw new Error('Invalid recipe data received')
      }
      return recipes
    } catch (error) {
      logger.error('Failed to initialize recipes:', error)
      throw error
    }
  }

  private async initializeUserState() {
    try {
      return await stateManager.getState()
    } catch (error) {
      logger.warn('Failed to load user state, using defaults:', error)
      return { recipes: { favorites: [] } }
    }
  }

  private async initializeCelestialData() {
    try {
      return celestialCalculator.calculateCurrentInfluences()
    } catch (error) {
      logger.error('Failed to calculate celestial influences:', error)
      throw error
    }
  }

  private processRecipes(recipes: Recipe[], celestialData: any): ScoredRecipe[] {
    return recipes.map(recipe => ({
      ...recipe,
      score: this.calculateRecipeScore(recipe, celestialData)
    }))
  }

  private calculateRecipeScore(recipe: Recipe, celestialData: any): number {
    // Implement your scoring logic here
    const score = Object.entries(recipe.elementalProperties).reduce(
      (acc, [element, value]) => acc + (value * (celestialData[element] || 0)),
      0
    )
    return score / Object.keys(recipe.elementalProperties).length
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  reset() {
    this.isInitializing = false
    this.initPromise = null
    this.retryCount = 0
  }
}

export const initializationService = new InitializationService() 