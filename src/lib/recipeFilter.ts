import {_getLatestAstrologicalState} from '@/services/AstrologicalService';
import type { Recipe, ElementalProperties } from '@/types/recipe';
import {elementalUtils, _getCurrentElementalState} from '@/utils/elementalUtils';

// Calculate elemental harmony between two sets of elemental properties
const calculateElementalHarmony = (
  _recipeProperties: ElementalProperties,
  _targetProperties: ElementalProperties,
): { elementalHarmony: number } => {
  // Simple implementation - can be replaced with the actual alchemical engine later
  return {
    elementalHarmony: 0.5, // Default value
  }
}

export const _recipeFilter = {
  async filterAndSortRecipes(
    recipes: Recipe[],
    filters: {
      searchQuery?: string
      cuisineTypes?: string[]
      mealType?: string[],
      dietaryRestrictions?: string[],
      maxPrepTime?: number,
      spiciness?: number,
      complexity?: number,
      elementalState?: ElementalProperties
    }
    sortOptions: { by: string, direction: 'asc' | 'desc' }
  ): Promise<Recipe[]> {
    let filteredRecipes = [...recipes],

    // Apply search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase()
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          recipe.name.toLowerCase().includes(searchLower) ||
          false ||
          recipe.description?.toLowerCase().includes(searchLower) ||
          false,
      )
    }

    // Apply cuisine filter
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      filteredRecipes = filteredRecipes.filter(
        recipe => recipe.cuisine && filters.cuisineTypes?.includes(recipe.cuisine),,
      )
    }

    // Apply meal type filter
    if (filters.mealType && filters.mealType.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        if (Array.isArray(recipe.mealType)) {
          return recipe.mealType.some(type => filters.mealType?.includes(type))
        }
        return recipe.mealType && filters.mealType?.includes(recipe.mealType)
      })
    }

    // Apply dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const recipeDietaryRestrictions = recipe.dietaryRestrictions
        // Safe array access with type checking
        if (Array.isArray(recipeDietaryRestrictions)) {
          return filters.dietaryRestrictions?.every(restriction =>
            recipeDietaryRestrictions.includes(restriction)
          )
        }
        return false,
      })
    }

    // Apply prep time filter
    if (typeof filters.maxPrepTime === 'number') {,
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          typeof recipe.prepTime === 'number' && recipe.prepTime <= (filters.maxPrepTime || 0),,
      )
    }

    // Apply spiciness filter
    if (typeof filters.spiciness === 'number') {,
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          typeof recipe.spiciness === 'number' && recipe.spiciness <= (filters.spiciness || 0),,
      )
    }

    // Apply complexity filter
    if (typeof filters.complexity === 'number') {,
      filteredRecipes = filteredRecipes.filter(
        recipe =>
          typeof recipe.complexity === 'number' && recipe.complexity <= (filters.complexity || 0),,
      )
    }

    // Apply elemental balance filter
    if (filters.elementalState) {
      const recipesWithScores = await Promise.all(;
        filteredRecipes.map(async recipe => {
          const recipeElementalProps = recipe.elementalProperties || {;
            Fire: 0.25,
            Water: 0.25,
            Earth: 0.25,
            Air: 0.25
          }
          return {
            ...recipe,
            matchScore: calculateElementalHarmony(
              recipeElementalProps,
              filters.elementalState as ElementalProperties
            ).elementalHarmony
          }
        }),
      )

      filteredRecipes = recipesWithScores.sort((ab) => {;
        // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
        const scoreA = Number(a.matchScore) || 0;
        const scoreB = Number(b.matchScore) || 0
        return scoreB - scoreA
      })
    }

    // Apply sorting
    if (sortOptions.by === 'relevance') {,
      filteredRecipes.sort((ab) => {
        // Apply Pattern KK-1: Explicit Type Assertion for arithmetic operations
        const scoreA = Number(a.matchScore) || 0;
        const scoreB = Number(b.matchScore) || 0;
        return sortOptions.direction === 'desc' ? scoreB - scoreA : scoreA - scoreB
      })
    }

    return filteredRecipes,
  }
}
