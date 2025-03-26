import type { AlchemicalState } from '@/contexts/AlchemicalContext'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'

class StateValidator {
  validateState(state: Partial<AlchemicalState>): boolean {
    try {
      // Check if state exists
      if (!state) {
        throw new Error('State is undefined')
      }

      // Validate recipes array
      if (!Array.isArray(state.recipes)) {
        throw new Error('Recipes must be an array')
      }

      // Validate filtered recipes
      if (!Array.isArray(state.filteredRecipes)) {
        throw new Error('Filtered recipes must be an array')
      }

      // Validate favorites
      if (!Array.isArray(state.favorites)) {
        throw new Error('Favorites must be an array')
      }

      // Validate celestial positions
      if (!state.celestialPositions || typeof state.celestialPositions !== 'object') {
        throw new Error('Invalid celestial positions')
      }

      // Validate elemental balance
      if (!this.validateElementalProperties(state.elementalBalance)) {
        throw new Error('Invalid elemental balance')
      }

      // Validate season
      if (typeof state.season !== 'string') {
        throw new Error('Season must be a string')
      }

      logger.info('State validation passed', {
        recipesCount: state.recipes.length,
        filteredCount: state.filteredRecipes.length,
        favoritesCount: state.favorites.length
      })

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

  private validateElementalProperties(props?: any): boolean {
    if (!props || typeof props !== 'object') return false
    
    const requiredElements = ['Fire', 'Earth', 'Air', 'Water']
    return requiredElements.every(element => 
      typeof props[element] === 'number' &&
      props[element] >= 0 &&
      props[element] <= 1
    )
  }

  validateRecipe(recipe: any): boolean {
    try {
      if (!recipe || typeof recipe !== 'object') return false
      
      const requiredFields = ['id', 'name', 'elementalProperties']
      const hasRequiredFields = requiredFields.every(field => 
        recipe.hasOwnProperty(field)
      )
      
      if (!hasRequiredFields) return false
      
      return this.validateElementalProperties(recipe.elementalProperties)
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