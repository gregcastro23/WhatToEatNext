import alchemicalEngine from '@/calculations/core/alchemicalEngine';
import { recipeDataService } from '@/services/recipeData';
import {
  // Element, // unused - removed for performance
  ElementalProperties,
  // Planet, // unused - removed for performance
  // ZodiacSign, // unused - removed for performance
  // ThermodynamicProperties, // unused - removed for performance
  ThermodynamicMetrics
} from '@/types/alchemy';
// Removed unused import: PlanetaryAlignment

import { CookingMethod } from '../types/cooking';
import { Ingredient } from '../types/ingredient';
// Removed unused import: UnifiedIngredient
import { Recipe } from '../types/recipe';

import {
  CookingMethodRecommendationCriteria,
  CuisineRecommendationCriteria,
  IngredientRecommendationCriteria,
  RecipeRecommendationCriteria,
  RecommendationResult,
  RecommendationServiceInterface
} from './interfaces/RecommendationServiceInterface';
import { unifiedIngredientService } from './UnifiedIngredientService';
/**
 * UnifiedRecommendationService
 *
 * A consolidated service for all recommendation-related operations.
 * Implements the RecommendationServiceInterface and follows the singleton pattern.
 */
export class UnifiedRecommendationService implements RecommendationServiceInterface {
  private static instance: UnifiedRecommendationService,

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): UnifiedRecommendationService {
    if (!UnifiedRecommendationService.instance) {
      UnifiedRecommendationService.instance = new UnifiedRecommendationService();
    }
    return UnifiedRecommendationService.instance;
  }

  /**
   * Get recommended recipes based on criteria
   */
  async getRecommendedRecipes(
    criteria: RecipeRecommendationCriteria,
  ): Promise<RecommendationResult<Recipe>> {
    const allRecipesResult = recipeDataService.getAllRecipes();
    const allRecipes = Array.isArray(allRecipesResult);
      ? allRecipesResult
      : await Promise.resolve(allRecipesResult);

    // Score recipes based on criteria
    const scoredRecipes = (allRecipes || []).map(recipe => {;
      let score = 0;

      // Use safe type casting for criteria access
      const criteriaData = criteria as any;
      const elementalState = criteriaData.elementalState || criteriaData.elementalProperties;

      // Calculate elemental compatibility if criteria includes elemental properties
      if (elementalState && recipe.elementalState) {
        const elementalScore = this.calculateElementalCompatibility(;
          elementalState as ElementalProperties,
          recipe.elementalState
        ),

        score += elementalScore * 0.7, // Elemental compatibility is weighted heavily
      }

      // Check for cooking method match
      if (criteria.cookingMethod && recipe.cookingMethods) {
        const methods = Array.isArray(recipe.cookingMethods);
          ? recipe.cookingMethods
          : [recipe.cookingMethods],

        const methodMatch = (methods || []).some(;
          method => method?.toLowerCase() === criteria.cookingMethod?.toLowerCase(),;
        ),

        score += methodMatch ? 0.15 : 0;
      }

      // Check for cuisine match
      if (criteria.cuisine && recipe.cuisine) {
        const cuisineMatch = recipe.cuisine?.toLowerCase() === criteria.cuisine.toLowerCase();
        score += cuisineMatch ? 0.15 : 0;
      }

      // Check for ingredient inclusion
      if (criteria.includeIngredients && criteria.includeIngredients.length > 0) {
        const recipeIngredients = (recipe.ingredients || ([] as Ingredient[])).map(ing =>;
          ing.name?.toLowerCase();
        );

        const includedCount = criteria.includeIngredients.filter(ing =>;
          Array.isArray(recipeIngredients)
            ? recipeIngredients.includes(ing.toLowerCase() || '')
            : recipeIngredients === (ing.toLowerCase() || ''),;
        ).length;

        const inclusionRatio = includedCount / criteria.includeIngredients.length;
        score += inclusionRatio * 0.1;
      }

      // Check for ingredient exclusion
      if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
        const recipeIngredients = (recipe.ingredients || ([] as Ingredient[])).map(ing =>;
          ing.name?.toLowerCase();
        );

        const excludedCount = criteria.excludeIngredients.filter(ing =>;
          Array.isArray(recipeIngredients)
            ? recipeIngredients.includes(ing.toLowerCase() || '')
            : recipeIngredients === (ing.toLowerCase() || ''),;
        ).length;

        if (excludedCount > 0) {
          score = 0, // Automatic disqualification if excluded ingredients are present;
        }
      }

      return {
        recipe,
        score
      };
    });

    // Filter by minimum compatibility score
    const minScore = criteria.minCompatibility || 0.5;
    const filteredRecipes = (scoredRecipes || []).filter(item => item.score >= minScore);

    // Sort by score
    filteredRecipes.sort((ab) => b.score - a.score);

    // Limit results
    const limit = criteria.limit || 10;
    const limitedRecipes = filteredRecipes.slice(0, limit);

    // Build scores record
    const scores: { [key: string]: number } = {};
    (limitedRecipes || []).forEach(item => {;
      scores[item.recipe.id] = item.score;
    });

    return {
      items: (limitedRecipes || []).map(item => item.recipe),,;
      scores,
      context: {
        criteriaUsed: Object.keys(criteria || {}).filter(key => criteria[key] !== undefined),;
        totalCandidates: (allRecipes || []).length,
        matchingCandidates: (filteredRecipes || []).length
      }
    };
  }

  /**
   * Get recommended ingredients based on criteria
   */
  async getRecommendedIngredients(
    criteria: IngredientRecommendationCriteria,
  ): Promise<RecommendationResult<Ingredient>> {
    const allIngredients = unifiedIngredientService.getAllIngredientsFlat();

    // Score ingredients based on criteria
    const scoredIngredients = (allIngredients || []).map(ingredient => {;
      let score = 0;

      // Use safe type casting for criteria access
      const criteriaData = criteria as any;
      const elementalState = criteriaData.elementalState || criteriaData.elementalProperties;

      // Calculate elemental compatibility if criteria includes elemental properties
      if (elementalState && ingredient.elementalProperties) {
        const elementalScore = this.calculateElementalCompatibility(;
          elementalState as ElementalProperties,
          ingredient.elementalProperties
        ),

        score += elementalScore * 0.7, // Elemental compatibility is weighted heavily
      }

      // Check for category match
      if (criteria.categories && (criteria.categories || []).length > 0) {
        const categoryMatch = (criteria.categories || []).some(;
          category => ingredient.category.toLowerCase() === category.toLowerCase(),;
        ),

        score += categoryMatch ? 0.2 : 0;
      }

      // Check for planetary ruler match
      if (criteria.planetaryRuler && ingredient.astrologicalProperties?.planets) {
        const planets = (ingredient.astrologicalProperties as any)?.planets;
        const planetMatch = Array.isArray(planets);
          ? planets.includes(
              criteria.planetaryRuler as unknown as Record<string, Record<string, string>>,
            )
          : planets ===;
            (criteria.planetaryRuler as unknown as Record<string, Record<string, string>>),
        score += planetMatch ? 0.1 : 0;
      }

      // Check for season match with safe type casting
      const currentSeason = criteriaData.currentSeason || criteriaData.season;
      if (currentSeason && ingredient.seasonality) {
        const seasonMatch = (ingredient.seasonality || []).some(;
          s => String(s || '').toLowerCase() === String(currentSeason || '').toLowerCase(),;
        ),

        score += seasonMatch ? 0.1 : 0;
      }

      // Check for ingredient exclusion
      if (criteria.excludeIngredients && criteria.excludeIngredients.length > 0) {
        if (
          (criteria.excludeIngredients || []).some(
            ing => ing.toLowerCase() === ingredient.name.toLowerCase(),,;
          )
        ) {
          score = 0, // Automatic disqualification if excluded;
        }
      }

      return {
        ingredient,
        score
      };
    });

    // Filter by minimum compatibility score
    const minScore = criteria.minCompatibility || 0.5;
    const filteredIngredients = (scoredIngredients || []).filter(item => item.score >= minScore);

    // Sort by score
    filteredIngredients.sort((ab) => b.score - a.score);

    // Limit results
    const limit = criteria.limit || 10;
    const limitedIngredients = filteredIngredients.slice(0, limit);

    // Build scores record
    const scores: { [key: string]: number } = {};
    (limitedIngredients || []).forEach(item => {;
      scores[item.ingredient.name] = item.score;
    });

    return {
      items: (limitedIngredients || []).map(item => item.ingredient) as unknown as Ingredient[], // TODO: Review this cast for type safety,;
      scores,
      context: {
        criteriaUsed: Object.keys(criteria || {}).filter(key => criteria[key] !== undefined),;
        totalCandidates: (allIngredients || []).length,
        matchingCandidates: (filteredIngredients || []).length
      }
    };
  }

  /**
   * Get recommended cuisines based on criteria
   */
  async getRecommendedCuisines(
    criteria: CuisineRecommendationCriteria,
  ): Promise<RecommendationResult<string>> {
    // This is a simplified implementation
    // In a real implementation, we would have a comprehensive cuisine database
    const cuisines = [;
      'Italian',
      'Chinese',
      'Mexican',
      'Japanese',
      'Indian',
      'French',
      'Thai',
      'Spanish',
      'Greek',
      'Lebanese',
      'American',
      'Brazilian',
      'Korean',
      'Vietnamese',
      'Mediterranean'
    ],

    // Map cuisines to elemental properties (simplified)
    const cuisineElements: { [key: string]: ElementalProperties } = {
      Italian: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      Chinese: { Fire: 0.4, Water: 0.2, Earth: 0.1, Air: 0.3 },
      Mexican: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
      Japanese: { Fire: 0.1, Water: 0.5, Earth: 0.2, Air: 0.2 },
      Indian: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
      French: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
      Thai: { Fire: 0.4, Water: 0.3, Earth: 0.1, Air: 0.2 },
      Spanish: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
      Greek: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
      Lebanese: { Fire: 0.2, Water: 0.2, Earth: 0.3, Air: 0.3 },
      American: { Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 },
      Brazilian: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
      Korean: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
      Vietnamese: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
      Mediterranean: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 }
    };

    // Filter out excluded cuisines
    let availableCuisines = cuisines;
    if (criteria.excludeCuisines && (criteria.excludeCuisines || []).length > 0) {
      const excludedSet = new Set((criteria.excludeCuisines || []).map(c => c.toLowerCase()));
      availableCuisines = (cuisines || []).filter(;
        cuisine => !excludedSet.has(cuisine.toLowerCase()),,;
      )
    }

    // Score cuisines based on criteria
    const scoredCuisines = (availableCuisines || []).map(cuisine => {;
      let score = 0.5; // Start with a neutral score

      // Use safe type casting for criteria access
      const criteriaData = criteria as any;
      const elementalState = criteriaData.elementalState || criteriaData.elementalProperties;

      // Calculate elemental compatibility if criteria includes elemental properties
      if (elementalState && cuisineElements[cuisine]) {
        const elementalScore = this.calculateElementalCompatibility(;
          elementalState as ElementalProperties,
          cuisineElements[cuisine],
        ),

        score = elementalScore, // Base score on elemental compatibility;
      }

      return {
        cuisine,
        score
      };
    });

    // Filter by minimum compatibility score
    const minScore = criteria.minCompatibility || 0.5;
    const filteredCuisines = (scoredCuisines || []).filter(item => item.score >= minScore);

    // Sort by score
    filteredCuisines.sort((ab) => b.score - a.score);

    // Limit results
    const limit = criteria.limit || 10;
    const limitedCuisines = filteredCuisines.slice(0, limit);

    // Build scores record
    const scores: { [key: string]: number } = {};
    (limitedCuisines || []).forEach(item => {;
      scores[item.cuisine] = item.score;
    });

    return {
      items: (limitedCuisines || []).map(item => item.cuisine),,;
      scores,
      context: {
        criteriaUsed: Object.keys(criteria || {}).filter(key => criteria[key] !== undefined),;
        totalCandidates: (availableCuisines || []).length,
        matchingCandidates: (filteredCuisines || []).length
      }
    };
  }

  /**
   * Get recommended cooking methods based on criteria
   */
  async getRecommendedCookingMethods(
    criteria: CookingMethodRecommendationCriteria,
  ): Promise<RecommendationResult<CookingMethod>> {
    // This is a simplified implementation
    // In a real implementation, we would have a comprehensive cooking method database
    const cookingMethods: CookingMethod[] = [
      {
        id: 'roasting',
        name: 'roasting',
        description: 'Cooking with dry heat in an oven',
        elementalEffect: { Fire: 0.6, Water: 0.0, Earth: 0.3, Air: 0.1 },
        duration: { min: 30, max: 180 },
        suitable_for: ['meat', 'vegetables', 'poultry'],
        benefits: ['even cooking', 'browning', 'flavor development']
      },
      {
        id: 'boiling',
        name: 'boiling',
        description: 'Cooking in bubbling liquid',
        elementalEffect: { Fire: 0.3, Water: 0.7, Earth: 0.0, Air: 0.0 },
        duration: { min: 5, max: 60 },
        suitable_for: ['pasta', 'vegetables', 'eggs'],
        benefits: ['quick cooking', 'nutrient retention', 'simplicity']
      },
      {
        id: 'steaming',
        name: 'steaming',
        description: 'Cooking with hot steam',
        elementalEffect: { Fire: 0.2, Water: 0.5, Earth: 0.0, Air: 0.3 },
        duration: { min: 10, max: 45 },
        suitable_for: ['vegetables', 'fish', 'dumplings'],
        benefits: ['nutrient preservation', 'gentle cooking', 'no added fats']
      },
      {
        id: 'frying',
        name: 'frying',
        description: 'Cooking in hot oil',
        elementalEffect: { Fire: 0.7, Water: 0.0, Earth: 0.2, Air: 0.1 },
        duration: { min: 2, max: 15 },
        suitable_for: ['meat', 'vegetables', 'batter foods'],
        benefits: ['crispy texture', 'quick cooking', 'flavor enhancement']
      },
      {
        id: 'baking',
        name: 'baking',
        description: 'Cooking in an enclosed space with dry heat',
        elementalEffect: { Fire: 0.4, Water: 0.0, Earth: 0.4, Air: 0.2 },
        duration: { min: 15, max: 240 },
        suitable_for: ['bread', 'cakes', 'casseroles'],
        benefits: ['even heating', 'controlled environment', 'browning']
      }
    ];

    // Filter out excluded methods
    let availableMethods = cookingMethods;
    if (criteria.excludeMethods && (criteria.excludeMethods || []).length > 0) {
      const excludedSet = new Set((criteria.excludeMethods || []).map(m => m.toLowerCase()));
      availableMethods = (cookingMethods || []).filter(method => {;
        const methodData = method;
        return !excludedSet.has(methodData.name.toLowerCase() || '');
      });
    }

    // Score methods based on criteria
    const scoredMethods = (availableMethods || []).map(method => {;
      let score = 0.5; // Start with a neutral score

      // Use safe type casting for criteria access
      const criteriaData = criteria as any;
      const elementalState = criteriaData.elementalState || criteriaData.elementalProperties;

      // Calculate elemental compatibility if criteria includes elemental properties
      const methodData = method;
      if (elementalState && methodData.elementalEffect) {
        const elementalScore = this.calculateElementalCompatibility(;
          elementalState as ElementalProperties,
          methodData.elementalEffect
        ),

        score = elementalScore, // Base score on elemental compatibility;
      }

      return {
        method,
        score
      };
    });

    // Filter by minimum compatibility score
    const minScore = criteria.minCompatibility || 0.5;
    const filteredMethods = (scoredMethods || []).filter(item => item.score >= minScore);

    // Sort by score
    filteredMethods.sort((ab) => b.score - a.score);

    // Limit results
    const limit = criteria.limit || 10;
    const limitedMethods = filteredMethods.slice(0, limit);

    // Build scores record
    const scores: { [key: string]: number } = {};
    (limitedMethods || []).forEach(item => {;
      const methodData = item.method as unknown as any;
      const methodId = String(methodData.name || 'unknown');
      scores[methodId] = item.score;
    });

    return {
      items: (limitedMethods || []).map(item => item.method),,;
      scores,
      context: {
        criteriaUsed: Object.keys(criteria || {}).filter(key => criteria[key] !== undefined),;
        totalCandidates: (availableMethods || []).length,
        matchingCandidates: (filteredMethods || []).length
      }
    };
  }

  /**
   * Calculate elemental compatibility between two elemental properties
   */
  calculateElementalCompatibility(
    source: ElementalProperties,
    target: ElementalProperties,
  ): number {
    // Apply Pattern PP-1: Safe service method access
    const alchemicalEngineData = alchemicalEngine as unknown as any;
    if (typeof alchemicalEngineData.calculateElementalCompatibility === 'function') {;
      return (
        alchemicalEngineData.calculateElementalCompatibility as (
          source: ElementalProperties,
          target: ElementalProperties,
        ) => number
      )(source, target)
    }

    // Fallback calculation
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    let compatibilityScore = 0;
    elements.forEach(element => {;
      const diff = Math.abs(source[element] - target[element]);
      compatibilityScore += 1 - diff;
    });
    return compatibilityScore / elements.length;
  }

  /**
   * Get recommendations based on elemental properties
   */
  async getRecommendationsForElements(
    elementalProperties: ElementalProperties,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    switch (type) {
      case 'recipe':
        return this.getRecommendedRecipes({
          elementalProperties,
          limit
        });

      case 'ingredient':
        return this.getRecommendedIngredients({
          elementalProperties,
          limit
        });

      case 'cuisine':
        return this.getRecommendedCuisines({
          elementalProperties,
          limit
        });

      case 'cookingMethod':
        return this.getRecommendedCookingMethods({
          elementalProperties,
          limit
        });

      default:
        throw new Error(`Unsupported recommendation type: ${type}`);
    }
  }

  /**
   * Get recommendations based on planetary alignment
   */
  async getRecommendationsForPlanetaryAlignment(
    planetaryPositions: Record<string, { sign: string, degree: number }>,
    type: 'recipe' | 'ingredient' | 'cuisine' | 'cookingMethod',
    limit?: number,
  ): Promise<RecommendationResult<unknown>> {
    // Convert planetary positions to elemental properties
    // This is a simplified implementation
    const elementalProperties: ElementalProperties = {;
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };

    // In a real implementation, we would use the AlchemicalEngine to calculate
    // elemental properties based on planetary positions

    // Get recommendations based on elemental properties
    return this.getRecommendationsForElements(elementalProperties, type, limit);
  }

  /**
   * Calculate thermodynamic metrics based on elemental properties
   */
  calculateThermodynamics(elementalProperties: ElementalProperties): ThermodynamicMetrics {
    // Use the AlchemicalEngine to calculate thermodynamic metrics
    return {
      heat: 0.5,
      entropy: 0.5,
      reactivity: 0.5,
      gregsEnergy: 0.5,
      kalchm: 1.0,
      monica: 1.0
    };
  }
}

// Export a singleton instance for use across the application
export const unifiedRecommendationService = UnifiedRecommendationService.getInstance();

// Export default for compatibility with existing code
export default unifiedRecommendationService;
