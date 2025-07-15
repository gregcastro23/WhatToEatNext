import type { AlchemicalState } from '@/contexts/alchemicalTypes'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'

// Define type for recipe objects
interface Recipe {
  id: string;
  name: string;
  elementalProperties: ElementalProperties;
  [key: string]: unknown; // Allow additional properties
}

// Define type for elemental properties
interface ElementalProperties {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
  [key: string]: number; // Allow additional elements
}

// Define an interface extending AlchemicalState with the additional properties we need to validate
interface ValidatableState extends Partial<AlchemicalState> {
  recipes?: Recipe[];
  filteredRecipes?: Recipe[];
  /**
   * NOTE: In most app states, 'favorites' is an array of IDs (string[]), not Recipe[].
   * Adjust here if needed for consistency with the rest of the app.
   */
  favorites?: Recipe[]; // or string[]
  season?: string;
}

class StateValidator {
  validateState(state: ValidatableState): boolean {
    try {
      // Check if state exists
      if (!state) {
        throw new Error('State is undefined')
      }

      // Validate recipes array if it exists
      if (state.recipes !== undefined && !Array.isArray(state.recipes)) {
        throw new Error('Recipes must be an array')
      }

      // Validate filtered recipes if it exists
      if (state.filteredRecipes !== undefined && !Array.isArray(state.filteredRecipes)) {
        throw new Error('Filtered recipes must be an array')
      }

      // Validate favorites if it exists
      if (state.favorites !== undefined && !Array.isArray(state.favorites)) {
        throw new Error('Favorites must be an array')
      }

      // Validate celestial positions
      // Apply surgical type casting with variable extraction
      const stateData = state as any;
      const celestialPositions = stateData?.celestialPositions;
      
      if (!celestialPositions || typeof celestialPositions !== 'object') {
        throw new Error('Invalid celestial positions')
      }

      // Validate elemental balance
      if (!this.validateElementalProperties(state.elementalState)) {
        throw new Error('Invalid elemental balance')
      }

      // Validate season if it exists
      if (state.season !== undefined && typeof state.season !== 'string') {
        throw new Error('Season must be a string')
      }

      // Only log details if the properties exist
      const logInfo: Record<string, number> = {};
      if (state.recipes) logInfo.recipesCount = state.recipes.length;
      if (state.filteredRecipes) logInfo.filteredCount = state.filteredRecipes.length;
      if (state.favorites) logInfo.favoritesCount = state.favorites.length;
      
      logger.info('State validation passed', logInfo);

      return true
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'StateValidator',
        action: 'validateState',
        state: JSON.stringify(state)
      })
      return false
    }
  }

  private validateElementalProperties(props?: ElementalProperties): boolean {
    if (!props || typeof props !== 'object') return false
    
    const requiredElements = ['Fire', 'Earth', 'Air', 'Water']
    // Type guard: ensure all required keys exist and are numbers
    for (const element of requiredElements) {
      if (!(element in props) || typeof props[element] !== 'number') {
        return false;
      }
    }
    return requiredElements.every(element => 
      typeof props[element] === 'number' &&
      props[element] >= 0 &&
      props[element] <= 1
    )
  }

  validateRecipe(recipe: Record<string, unknown>): boolean {
    try {
      if (!recipe || typeof recipe !== 'object') return false
      
      const requiredFields = ['id', 'name', 'elementalProperties']
      const hasRequiredFields = requiredFields.every(field => 
        Object.prototype.hasOwnProperty.call(recipe, field)
      )
      
      if (!hasRequiredFields) return false
      
      // Runtime type guard for elementalProperties
      const elemProps = recipe.elementalProperties;
      if (!elemProps || typeof elemProps !== 'object') return false;
      const requiredElements = ['Fire', 'Earth', 'Air', 'Water'];
      for (const element of requiredElements) {
        if (!(element in elemProps) || typeof elemProps[element] !== 'number') {
          return false;
        }
      }
      return this.validateElementalProperties(elemProps as ElementalProperties)
    } catch (error) {
      errorHandler.handleError(error, {
        context: 'StateValidator',
        action: 'validateRecipe',
        recipe: JSON.stringify(recipe)
      })
      return false
    }
  }
}

export const stateValidator = new StateValidator() 