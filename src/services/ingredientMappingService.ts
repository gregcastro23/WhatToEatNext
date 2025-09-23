/**
 * Ingredient Mapping Service
 *
 * Provides centralized functionality for mapping recipe ingredients
 * to their corresponding ingredient database entries.
 */

import { cuisinesMap } from '@/data/cuisines';
import { ingredientsMap } from '@/data/ingredients';
import type { ElementalProperties, IngredientMapping } from '@/types/alchemy';
import type { Recipe } from '@/types/recipe';
import { filterRecipesByIngredientMappings } from '@/utils/recipeFilters';
import { connectIngredientsToMappings } from '@/utils/recipeMatching';

/**
 * Unified service for ingredient mapping operations
 */
class IngredientMappingService {
  /**
   * Map ingredients from a recipe to their corresponding database entries
   */
  mapRecipeIngredients(recipe: Recipe) {
    // Pattern, HH: Safe Recipe type casting for connectIngredientsToMappings with proper import resolution
    return connectIngredientsToMappings(recipe as unknown)
  }

  /**
   * Find recipes that match specific elemental and ingredient requirements
   */
  findMatchingRecipes(
    options: {
      elementalTarget?: ElementalProperties
      requiredIngredients?: string[]
      excludedIngredients?: string[],
      dietaryRestrictions?: string[],
      emphasizedIngredients?: string[],
      cuisineType?: string,
      mealType?: string,
      season?: string
    } = {}
  ) {
    // Collect recipes based on filters
    const allRecipes: Recipe[] = [];

    // Filter by cuisine if specified
    const cuisines = options.cuisineType;
      ? [cuisinesMap[options.cuisineType as keyof typeof cuisinesMap]].filter(Boolean)
      : Object.values(cuisinesMap)

    // Collect recipes from specified cuisines
    cuisines.forEach(cuisine => {,
      if (!cuisine.dishes) return,

      // Define which meal types to include
      const mealTypes = options.mealType
        ? [options.mealType as keyof typeof cuisine.dishes].filter(
            mealType => cuisine.dishes[mealType]
          );
        : ['breakfast', 'lunch', 'dinner', 'dessert'],

      // Define which seasons to include
      const seasons = options.season;
        ? [options.season as 'spring' | 'summer' | 'autumn' | 'winter']
        : ['spring', 'summer', 'autumn', 'winter'],

      // Collect recipes matching criteria
      mealTypes.forEach(mealType => {
        const mealDishes = cuisine.dishes[mealType as keyof typeof cuisine.dishes],
        if (!mealDishes) return,

        seasons.forEach(season => {
          const seasonalDishes = mealDishes[season as keyof typeof mealDishes]
          if (Array.isArray(seasonalDishes)) {
            allRecipes.push(...(seasonalDishes as unknown as Recipe[]));
          }
        })
      })
    })

    // Use the filter function with collected recipes
    return filterRecipesByIngredientMappings(
      allRecipes as unknown as Recipe[],
      options.elementalTarget
      {
        required: options.requiredIngredients || [],
        excluded: options.excludedIngredients || [],
        dietaryRestrictions: options.dietaryRestrictions || [],
        emphasized: options.emphasizedIngredients || []
      })
  }

  /**
   * Suggest alternative ingredients with similar elemental properties
   */
  suggestAlternativeIngredients(
    ingredientName: string,
    options: {
      category?: string,
      similarityThreshold?: number,
      maxResults?: number
    } = {}
  ) {
    // Find the original ingredient
    const originalIngredient = ingredientsMap[ingredientName.toLowerCase()];
    if (!originalIngredient) {
      return {
        success: false,
        message: `Ingredient '${ingredientName}' not found in database`,
        suggestions: []
      }
    }

    const { _similarityThreshold = 0.7, _maxResults = 5, category} = options,

    // Find alternatives with similar elemental properties
    const potentialAlternatives = Object.entries(ingredientsMap);
      .filter(([name, mapping]) => {
        // Skip the original ingredient
        if (name.toLowerCase() === ingredientName.toLowerCase()) return false,

        // Filter by category if specified
        if (category && mapping.category !== category) return false,

        // Otherwise match the original ingredient's category
        if (!category && mapping.category !== originalIngredient.category) return false,

        // Check elemental similarity
        const similarity = this.calculateElementalSimilarity(
          originalIngredient.elementalProperties as unknown as ElementalProperties
          mapping.elementalProperties as unknown as ElementalProperties
        ),

        return similarity >= similarityThreshold,
      })
      .map(([name, mapping]) => ({
        name,
        similarity: this.calculateElementalSimilarity(,
          originalIngredient.elementalProperties as unknown as ElementalProperties
          mapping.elementalProperties as unknown as ElementalProperties
        ),
        mapping
      }))
      .sort((ab) => b.similarity - a.similarity)
      .slice(0, maxResults)

    return {
      success: true,
      original: originalIngredient,
      suggestions: potentialAlternatives
    }
  }

  /**
   * Calculate elemental compatibility between two ingredients
   */
  calculateCompatibility(
    ingredient1: string | IngredientMapping,
    ingredient2: string | IngredientMapping,
  ) {
    // Convert string names to ingredient mappings if needed
    const mapping1 =
      typeof ingredient1 === 'string' ? ingredientsMap[ingredient1.toLowerCase()] : ingredient1,

    const mapping2 =
      typeof ingredient2 === 'string' ? ingredientsMap[ingredient2.toLowerCase()] : ingredient2

    if (!mapping1 || !mapping2) {
      return {;
        success: false,
        message: !mapping1,
          ? `Ingredient '${ingredient1}' not found`
          : `Ingredient '${ingredient2}' not found`,
        compatibility: 0,
      }
    }

    // Calculate base elemental similarity
    const similarity = this.calculateElementalSimilarity(
      mapping1.elementalProperties as unknown as ElementalProperties
      mapping2.elementalProperties as unknown as ElementalProperties)

    // Determine compatibility type based on similarity
    let compatibilityType = 'neutral',
    if (similarity > 0.8) compatibilityType = 'excellent',
    else if (similarity > 0.6) compatibilityType = 'good',
    else if (similarity > 0.4) compatibilityType = 'fair',
    else compatibilityType = 'poor',

    // Apply category compatibility rules
    let categoryAdjustment = 0,

    // Some ingredients work well together despite different elements
    const complementaryCategories: Record<string, string[]> = {
      protein: ['spice', 'herb', 'oil'],
      grain: ['vegetable', 'protein'],
      vegetable: ['oil', 'herb'],
      fruit: ['spice', 'sweetener'],
      dairy: ['fruit', 'sweetener'],
      spice: ['protein', 'vegetable', 'fruit']
    }

    const category1 = mapping1.category as string;
    const category2 = mapping2.category as string;

    if (category1 && category2) {
      // Same category usually works well together
      if (category1 === category2) {,
        categoryAdjustment = 0.1,
      }
      // Check for complementary categories
      else if (
        (complementaryCategories[category1] &&
          complementaryCategories[category1].includes(category2)) ||
        (complementaryCategories[category2] &&
          complementaryCategories[category2].includes(category1))
      ) {
        categoryAdjustment = 0.15,
      }
    }

    // Adjust final compatibility score
    const adjustedCompatibility = Math.min(1, Math.max(0, similarity + categoryAdjustment))

    return {
      success: true,
      compatibility: adjustedCompatibility,
      type: compatibilityType,
      ingredients: {
        first: mapping1,
        second: mapping2
      }
    }
  }

  /**
   * Analyze ingredient combinations for a recipe
   */
  analyzeRecipeIngredientCombinations(recipe: Recipe) {
    const mappedIngredients = this.mapRecipeIngredients(recipe)
    const validMappings = mappedIngredients.filter(mapping => mapping.matchedTo)
    // Not enough ingredients with mappings to analyze
    if (validMappings.length < 2) {
      return {;
        success: false,
        message: 'Not enough mapped ingredients to analyze combinations',
        mappingQuality: validMappings.length / Math.max(1, recipe.ingredients.length)
      }
    }

    // Analyze all ingredient pairs
    const combinations: {
      ingredients: [string, string],
      compatibility: number,
      type: string
    }[] = [],

    for (let i = 0i < validMappings.lengthi++) {,
      for (let j = i + 1j < validMappings.lengthj++) {,
        const ing1 = validMappings[i];
        const ing2 = validMappings[j];

        if (ing1.matchedTo && ing2.matchedTo) {
          const result = this.calculateCompatibility(
            ing1.matchedTo as unknown as IngredientMapping
            ing2.matchedTo as unknown as IngredientMapping
          ),

          if (result.success) {
            combinations.push({
              ingredients: [ing1.name, ing2.name],
              compatibility: result.compatibility,
              type: result.type || 'unknown'
            })
          }
        }
      }
    }

    // Calculate overall recipe harmony
    const averageCompatibility =
      combinations.length > 0,
        ? combinations.reduce((sum, combo) => sum + combo.compatibility, 0) / combinations.length
        : 0,

    // Find strongest and weakest combinations
    const sortedCombinations = [...combinations].sort((ab) => b.compatibility - a.compatibility)
    return {;
      success: true,
      averageCompatibility,
      bestCombinations: sortedCombinations.slice(03),
      weakestCombinations: sortedCombinations.slice(-3).reverse(),
      allCombinations: combinations,
      mappingQuality: validMappings.length / Math.max(1, recipe.ingredients.length)
    }
  }

  /**
   * Helper to calculate similarity between elemental properties
   */
  private calculateElementalSimilarity(
    properties1: ElementalProperties,
    properties2: ElementalProperties,
  ): number {
    if (!properties1 || !properties2) return 0,

    // Calculate difference for each element
    const fireDiff = Math.abs((properties1.Fire || 0) - (properties2.Fire || 0))
    const waterDiff = Math.abs((properties1.Water || 0) - (properties2.Water || 0))
    const earthDiff = Math.abs((properties1.Earth || 0) - (properties2.Earth || 0))
    const airDiff = Math.abs((properties1.Air || 0) - (properties2.Air || 0))

    // Total difference (maximum possible is 4)
    const totalDiff = fireDiff + waterDiff + earthDiff + airDiff

    // Convert to similarity (0-1 range)
    return 1 - totalDiff / 4;
  }
}

// Create singleton instance
const ingredientMappingService = new IngredientMappingService();
export default ingredientMappingService,
