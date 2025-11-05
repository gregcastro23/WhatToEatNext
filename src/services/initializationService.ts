import { ElementalProperties } from '@/types/alchemy';

import type { Recipe, ScoredRecipe } from '../types/recipe';
import { logger } from '../utils/logger';
import { stateManager } from '../utils/stateManager';
import { stateValidator } from '../utils/stateValidator';

import { celestialCalculator } from './celestialCalculations';
import { errorHandler } from './errorHandler';
import { recipeData } from './recipeData';

// Interface for celestial data
export interface CelestialData {
  sun?: {
    sign?: string;
    degree?: number;
    exactLongitude?: number
  };
  moon?: {
    sign?: string;
    degree?: number;
    exactLongitude?: number
  };
  // Include elemental values
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
  [key: string]: unknown; // Allow other properties
}

interface InitializationResult {
  success: boolean;
  data?: {
    recipes: ScoredRecipe[];
    favorites: string[];
    celestialData: CelestialData
  };
  error?: string
}

class InitializationService {
  private isInitializing = false;
  private initPromise: Promise<InitializationResult> | null = null;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  async initialize(): Promise<InitializationResult> {
    if (this.isInitializing) {
      return this.initPromise ?? Promise.reject(new Error('Initialization promise not found'));
}

    this.isInitializing = true;
    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private async performInitialization(): Promise<InitializationResult> {
    try {
      logger.info('Starting application initialization', {
        attempt: this.retryCount + 1
      })

      // Ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100))

      // Initialize services in sequence
      const recipes = await this.initializeRecipes();
      const userState = await this.initializeUserState();
      const celestialData = await this.initializeCelestialData();

      // Process and validate recipes
      const processedRecipes = this.processRecipes(recipes, celestialData);

      // Get the actual stateManager instance
      const manager = await stateManager;

      // Convert celestial data to elemental properties format
      const elementalPreference = this.convertToElementalProperties(celestialData);

      // Update the state with the elemental preference - safe method access
      const managerObj = manager as any;
      if (typeof managerObj.updateState === 'function') {
        await managerObj.updateState({
          elementalPreference,
          lastUpdated: new Date()
        })
      } else if (typeof managerObj.setState === 'function') {
        await managerObj.setState({
          elementalPreference,
          lastUpdated: new Date()
        })
      }

      // Validate final state - only using properties that exist in AlchemicalState
      const isValid = stateValidator.validateState({
        celestialPositions: this.formatCelestialData(celestialData),
        elementalPreference,
        currentSeason: this.getCurrentSeason(),
        error: false,
        lastUpdated: new Date(),
        timeOfDay: this.getTimeOfDay(),
        astrologicalState: null,
        currentEnergy: {
          zodiacEnergy: '',
          lunarEnergy: '',
          planetaryEnergy: []
        },
        errorMessage: '',
        errors: [],
        zodiacEnergy: '',
        lunarEnergy: '',
        planetaryEnergy: [],
        alchemicalValues: {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
},
        lunarPhase: 'new moon',
        currentTime: new Date()
      } as unknown)

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
        this.retryCount++;
        logger.info(`Retrying initialization (${this.retryCount}/${this.MAX_RETRIES})`)
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * this.retryCount))
        return this.performInitialization();
}

      return {
        success: false,
        error: 'Failed to initialize application after multiple attempts'
      }
    } finally {
      this.isInitializing = false;
    }
  }

  private async initializeRecipes(): Promise<Recipe[]> {
    try {
      const recipes = await recipeData.getAllRecipes();
      if (!recipes.every(recipe => stateValidator.validateRecipe(recipe))) {
        throw new Error('Invalid recipe data received')
      }
      return recipes;
    } catch (error) {
      logger.error('Failed to initialize recipes: ', error)
      throw error;
    }
  }

  private async initializeUserState() {
    try {
      // Get the actual stateManager instance first
      const manager = await stateManager;
      return await manager.getState();
} catch (error) {
      logger.warn('Failed to load user state, using defaults: ', error)
      return { recipes: { favorites: [] } };
}
  }

  private async initializeCelestialData(): Promise<CelestialData> {
    try {
      const alignment = celestialCalculator.calculateCurrentInfluences();

      // Convert CelestialAlignment to CelestialData format with safe property access
      const alignmentData = alignment as any;
      return {
        sun: alignmentData?.sun || { sign: '', degree: 0, exactLongitude: 0 },
        moon: alignmentData?.moon || { sign: '', degree: 0, exactLongitude: 0 },
        Fire: alignmentData?.Fire || 0.25,
        Water: alignmentData?.Water || 0.25,
        Earth: alignmentData?.Earth || 0.25,
        Air: alignmentData?.Air || 0.25
      } as CelestialData;
    } catch (error) {
      logger.error('Failed to calculate celestial influences: ', error)
      throw error;
    }
  }

  private processRecipes(recipes: Recipe[], celestialData: CelestialData): ScoredRecipe[] {
    return recipes.map(recipe => ({
      ...recipe,
      score: this.calculateRecipeScore(recipe, celestialData)
    }))
  }

  private calculateRecipeScore(recipe: Recipe, celestialData: CelestialData): number {
    // Implement your scoring logic here
    // Pattern KK-9: Cross-Module Arithmetic Safety for service calculations
    const score = Object.entries(recipe.elementalProperties).reduce((acc, [element, value]) => {
      const numericAcc = Number(acc) || 0;
      const numericValue = Number(value) || 0;
      const celestialValue = Number(celestialData[element]) || 0;
      return numericAcc + numericValue * celestialValue;
    }, 0)
    const numericScore = Number(score) || 0;
    const elementCount = Object.keys(recipe.elementalProperties).length;
    const numericElementCount = Number(elementCount) || 1;
    return numericScore / numericElementCount;
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private formatCelestialData(celestialData: CelestialData) {
    return {
      sun: {
        sign: celestialData.sun?.sign || '',
        degree: celestialData.sun?.degree,
        exactLongitude: celestialData.sun?.exactLongitude
      },
      moon: {
        sign: celestialData.moon?.sign || '',
        degree: celestialData.moon?.degree,
        exactLongitude: celestialData.moon?.exactLongitude
      }
    }
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  reset() {
    this.isInitializing = false;
    this.initPromise = null;
    this.retryCount = 0;
  }

  // Add new helper method to convert celestial data to ElementalProperties
  private convertToElementalProperties(celestialData: CelestialData): ElementalProperties {
    // Default balanced elemental properties
    return {
      Fire: celestialData.Fire || 0.25,
      Water: celestialData.Water || 0.25,
      Earth: celestialData.Earth || 0.25,
      Air: celestialData.Air || 0.25
    }
  }
}

export const _initializationService = new InitializationService();