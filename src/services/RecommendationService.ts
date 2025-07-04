// Celestial calculations service not yet implemented
import { Recipe } from '@/types/recipe';
import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';
import { logger } from ../utils/logger';
import { createError } from '../utils/errorHandling';
import { _calculateLunarPhase , transformItemsWithPlanetaryPositions } from '../utils/astrologyUtils';
import { _calculatePlanetaryPositions } from '../utils/astrology/core';
import { ScoredRecipe } from '@/types/recipe';
import { AstrologicalState , _Element } from '@/types/alchemy';
import { convertToLunarPhase } from '@/utils/lunarPhaseUtils';

import type { ElementalProperties, 
  ElementalItem, 
  AlchemicalItem,
  LunarPhaseWithSpaces,
  PlanetaryAspect } from '@/types/alchemy';
import { ElementalCharacter } from '@/constants/planetaryElements';
import astrologizeCache from '@/services/AstrologizeApiCache';
import { calculateRecipeCompatibility } from '@/calculations/culinary/recipeMatching';

/**
 * Interface for recommendation criteria
 */
interface RecommendationCriteria {
  celestialInfluence?: ElementalProperties;
  season?: string;
  timeOfDay?: string;
  dietaryRestrictions?: string[];
  previousMeals?: string[];
  cuisine?: string;
  preferredIngredients?: string[];
  preferredTechniques?: string[];
  astrologicalState?: AstrologicalState;
  currentLocation?: { lat: number; lng: number };
  nutritionalGoals?: Record<string, number>;
}

/**
 * Interface for transformation item
 */
interface TransformedItem extends AlchemicalItem {
  elementalProperties: { Fire: number; Water: number; Earth: number; Air: number; };
  id: string;
}

/**
 * Interface for planet data
 */
interface PlanetData {
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  speed?: number;
}

/**
 * Consolidated service for recipe and ingredient recommendations based on astrological and elemental data
 */
export class RecommendationService {
  private static instance: RecommendationService;
  private ingredients: ElementalItem[];
  private methods: ElementalItem[];
  private cuisines: ElementalItem[];
  private planetaryPositions: { [key: string]: PlanetData };
  private isDaytime: boolean;
  private currentZodiac: string | null;
  private lunarPhase: LunarPhaseWithSpaces | null;
  private transformedIngredients: AlchemicalItem[] = [];
  private transformedMethods: AlchemicalItem[] = [];
  private transformedCuisines: AlchemicalItem[] = [];
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: { [key: string]: number };
  private aspects: PlanetaryAspect[] = [];
  private retrogradeStatus: { [key: string]: boolean } = {};
  private convertedPositions: { [key: string]: PlanetData } = {};

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(
    ingredients: ElementalItem[] = [],
    methods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ) {
    this.ingredients = ingredients;
    this.methods = methods;
    this.cuisines = cuisines;
    this.planetaryPositions = {};
    this.isDaytime = true;
    this.currentZodiac = null;
    this.lunarPhase = null;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(
    ingredients: ElementalItem[] = [],
    methods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService(
        ingredients, methods, cuisines
      );
    }
    return RecommendationService.instance;
  }

  // ===== INITIALIZATION METHODS =====

  /**
   * Initialize the service with planetary positions, daytime status, and other context
   */
  initialize(
    planetaryPositions: { [key: string]: PlanetData },
    isDaytime = true,
    currentZodiac: string | null = null,
    lunarPhase: LunarPhaseWithSpaces | null = null,
    tarotElementBoosts?: Record<ElementalCharacter, number>,
    tarotPlanetaryBoosts?: { [key: string]: number },
    aspects: PlanetaryAspect[] = []
  ): RecommendationService {
    this.planetaryPositions = planetaryPositions;
    this.isDaytime = isDaytime;
    this.currentZodiac = currentZodiac;
    this.lunarPhase = lunarPhase;
    this.tarotElementBoosts = tarotElementBoosts;
    this.tarotPlanetaryBoosts = tarotPlanetaryBoosts;
    this.aspects = aspects;
    
    // Track retrograde planets
    if (planetaryPositions) {
      Object.entries(planetaryPositions || {}).forEach(([planet, data]) => {
        if (typeof data === 'object' && data !== null && 'isRetrograde' in data) {
          this.retrogradeStatus[planet] = !!data.isRetrograde;
        }
      });
    }
    
    // Convert planetary positions to the format expected by the alchemical engine
    this.convertedPositions = {};
    if (planetaryPositions) {
      Object.entries(planetaryPositions || {}).forEach(([planet, data]) => {
        if (typeof data === 'object' && data !== null) {
          this.convertedPositions[planet] = {
            sign: data.sign || '',
            degree: data.degree || 0,
            ...(data.isRetrograde !== undefined ? { isRetrograde: data.isRetrograde } : {})
          };
        } else if (typeof data === 'number') {
          this.convertedPositions[planet] = {
            degree: data
          };
        }
      });
    }
    
    // Transform ingredients, methods, and cuisines
    this.transformItems();
    
    return this;
  }

  /**
   * Initialize from current planetary positions
   * Uses astrologyUtils to calculate positions automatically
   */
  async initializeFromCurrentPositions(): Promise<RecommendationService> {
    try {
      // Calculate real-time planetary positions
      const positions = await calculatePlanetaryPositions();
      
      // Calculate current lunar phase
      const _lunarPhase = await calculateLunarPhase(new Date());
      
      // Convert to format expected by adapter
      const lunarPhaseFormatted = convertToLunarPhase(lunarPhase);
      
      // Calculate if it's currently daytime
      const now = new Date();
      const hours = now.getHours();
      const _isDaytime = hours >= 6 && hours < 18;
      
      // Get current Sun sign as current zodiac
      const sunPosition = positions['Sun'];
      const currentZodiac = sunPosition?.sign || null;
      
      // Initialize with calculated values
      this.initialize(
        positions,
        isDaytime,
        currentZodiac,
        lunarPhaseFormatted
      );
      
      logger.info('Initialized service with current planetary positions');
    } catch (error) {
      logger.error('Error initializing from current positions:', error);
    }
    
    return this;
  }

  /**
   * Set ingredients data
   */
  setIngredients(ingredients: ElementalItem[]): RecommendationService {
    this.ingredients = ingredients;
    this.transformItems();
    return this;
  }

  /**
   * Set cooking methods data
   */
  setCookingMethods(methods: ElementalItem[]): RecommendationService {
    this.methods = methods;
    this.transformItems();
    return this;
  }

  /**
   * Set cuisines data
   */
  setCuisines(cuisines: ElementalItem[]): RecommendationService {
    this.cuisines = cuisines;
    this.transformItems();
    return this;
  }

  // ===== TRANSFORMATION METHODS =====

  /**
   * Transform items based on current settings
   */
  private transformItems(): void {
    try {
      // Transform ingredients directly
      this.transformedIngredients = transformItemsWithPlanetaryPositions(
        this.ingredients,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      // Transform cooking methods
      this.transformedMethods = transformItemsWithPlanetaryPositions(
        this.methods,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      // Transform cuisines
      this.transformedCuisines = transformItemsWithPlanetaryPositions(
        this.cuisines,
        this.planetaryPositions,
        this.isDaytime,
        this.currentZodiac || undefined
      );
      
      // Apply tarot element boosts if available
      if (this.tarotElementBoosts) {
        this.applyTarotElementBoosts();
      }
      
      // Apply tarot planetary boosts if available
      if (this.tarotPlanetaryBoosts) {
        this.applyTarotPlanetaryBoosts();
      }
      
      logger.info('Items transformed using planetary positions');
    } catch (error) {
      logger.error('Error transforming items:', error);
    }
  }

  /**
   * Apply tarot element boosts to transformed items
   */
  private applyTarotElementBoosts(): void {
    if (!this.tarotElementBoosts) return;
    
    // Apply boosts to each ingredient
    this.transformedIngredients = this.transformedIngredients  || [].map(item => {
      const properties = item.elementalState || { Fire: 0, Water: 0, Earth: 0, Air: 0  };
      
      // Apply boosts to each element
      Object.entries(this.tarotElementBoosts || []).forEach(([element, boost]) => {
        if (element in properties) {
          properties[element as keyof typeof properties] += boost;
        }
      });
      
      return {
        ...item,
        elementalProperties: properties
      };
    });
    
    // Similarly apply to methods and cuisines
    // (Implementation similar to ingredients)
  }

  /**
   * Apply tarot planetary boosts to transformed items
   */
  private applyTarotPlanetaryBoosts(): void {
    if (!this.tarotPlanetaryBoosts) return;
    
    // Apply planetary boosts to items (simplified implementation)
    // Real implementation would map planets to alchemical properties
  }

  // ===== RECOMMENDATION METHODS =====

  /**
   * Get recommended ingredients based on current planetary positions
   */
  getRecommendedIngredients(limit = 10): AlchemicalItem[] {
    return this.getSortedItems(this.transformedIngredients, limit);
  }

  /**
   * Get recommended cooking methods based on current planetary positions
   */
  getRecommendedCookingMethods(limit = 5): AlchemicalItem[] {
    return this.getSortedItems(this.transformedMethods, limit);
  }

  /**
   * Get recommended cuisines based on current planetary positions
   */
  getRecommendedCuisines(limit = 5): AlchemicalItem[] {
    return this.getSortedItems(this.transformedCuisines, limit);
  }

  /**
   * Get sorted items by compatibility score
   */
  private getSortedItems(items: AlchemicalItem[], limit: number): AlchemicalItem[] {
    return [...items]
      .sort((a, b) => {
        // Sort by compatibility score (higher is better) - safe property access
        return ((b as unknown)?.compatibilityScore || 0) - ((a as unknown)?.compatibilityScore || 0);
      })
      .slice(0, limit);
  }

  /**
   * Get all transformed ingredients
   */
  getAllTransformedIngredients(): AlchemicalItem[] {
    return this.transformedIngredients;
  }

  /**
   * Get all transformed cooking methods
   */
  getAllTransformedMethods(): AlchemicalItem[] {
    return this.transformedMethods;
  }

  /**
   * Get all transformed cuisines
   */
  getAllTransformedCuisines(): AlchemicalItem[] {
    return this.transformedCuisines;
  }

  /**
   * Get ingredient by ID
   */
  getIngredientById(id: string): ElementalItem | undefined {
    return this.ingredients.find(item => item.id === id);
  }

  /**
   * Get cooking method by ID
   */
  getMethodById(id: string): ElementalItem | undefined {
    return this.methods.find(item => item.id === id);
  }

  /**
   * Get cuisine by ID
   */
  getCuisineById(id: string): ElementalItem | undefined {
    return this.cuisines.find(item => item.id === id);
  }

  /**
   * Get dominant element based on transformed ingredients
   */
  getDominantElement(): ElementalCharacter | null {
    if (this.transformedIngredients  || [].length === 0) return null;
    
    // Get top ingredient and return its dominant element
    const topItems = this.getSortedItems(this.transformedIngredients, 3);
    if ((topItems || []).length === 0) return null;
    
    // Use the most common dominant element among top items
    const elementCounts: Record<ElementalCharacter, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0
     };
    
    (topItems || []).forEach(item => {
      // Safe property access for dominantElement
      const dominantElement = (item as unknown)?.dominantElement;
      if (dominantElement && elementCounts[dominantElement as ElementalCharacter] !== undefined) {
        elementCounts[dominantElement as ElementalCharacter]++;
      }
    });
    
    // Find the element with the highest count
    return Object.entries(elementCounts)
      .reduce((max, [element, count]) => 
        count > max.count ? { element: element as ElementalCharacter, count } : max, 
        { element: 'Fire' as ElementalCharacter, count: 0 }
      ).element;
  }

  /**
   * Recommend recipes based on current planetary and elemental influences
   */
  async recommendRecipes(
    recipes: Recipe[],
    criteria: RecommendationCriteria = {}
  ): Promise<ScoredRecipe[]> {
    try {
      if (!Array.isArray(recipes) || (recipes || []).length === 0) {
        throw createError('INVALID_REQUEST', { context: 'Empty recipe list' });
      }

      // If celestial influence not provided, calculate from current settings
      const celestialInfluence = criteria.celestialInfluence || this.getCurrentElementalInfluence();

      // Score and sort recipes
      const scoredRecipes = (recipes || []).map(recipe => ({
        ...recipe,
        score: this.calculateRecipeScore(recipe, {
          ...criteria,
          celestialInfluence
        })
      }))
      .sort((a, b) => b.score - a.score);

      // Always ensure at least one recommendation
      if ((scoredRecipes || []).length === 0) {
        logger.warn('No recipes matched criteria, using fallback');
        return [this.getFallbackRecipe()];
      }

      return scoredRecipes;
    } catch (error) {
      logger.error('Error recommending recipes:', error);
      return [this.getFallbackRecipe()];
    }
  }

  /**
   * Calculate current elemental influence from planetary positions
   */
  private getCurrentElementalInfluence(): ElementalProperties {
    // Calculate elemental influence based on transformed ingredients
    const topIngredients = this.getRecommendedIngredients(5);
    
    // If no transformed ingredients, use default balanced values
    if ((topIngredients || []).length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25  };
    }
    
    // Calculate average elemental values
    const totalProperties = topIngredients.reduce((acc, ingredient) => {
      const props = ingredient.elementalProperties || { Fire: 0, Water: 0, Earth: 0, Air: 0  };
      return { Fire: acc.Fire + (props.Fire || 0), Water: acc.Water + (props.Water || 0), Earth: acc.Earth + (props.Earth || 0), Air: acc.Air + (props.Air || 0)
       };
    }, { Fire: 0, Water: 0, Earth: 0, Air: 0  });
    
    // Calculate averages
    const count = (topIngredients || []).length;
    return { Fire: totalProperties.Fire / count, Water: totalProperties.Water / count, Earth: totalProperties.Earth / count, Air: totalProperties.Air / count
     };
  }

  /**
   * Calculates a numeric score for how well a recipe fits the given criteria
   */
  private calculateRecipeScore(
    recipe: Recipe,
    criteria: RecommendationCriteria
  ): number {
    let score = 0.5; // Start with neutral score
    
    // Enhanced alchemical score calculation using the current state and location
    if (criteria.astrologicalState && criteria.currentLocation) {
      const alchemicalScore = this.calculateEnhancedAlchemicalScore(
        recipe, 
        criteria.astrologicalState, 
        criteria.currentLocation
      );
      score += alchemicalScore * 0.4; // 40% weight for alchemical compatibility
    } else if (criteria.astrologicalState) {
      // Fallback without location
      const fallbackLocation = { lat: 40.7128, lng: -74.0060 }; // Default to NYC
      const alchemicalScore = this.calculateEnhancedAlchemicalScore(
        recipe, 
        criteria.astrologicalState, 
        fallbackLocation
      );
      score += alchemicalScore * 0.35; // Slightly lower weight without location
    } else if (criteria.astrologicalState) {
      // Basic compatibility check using simple elemental matching
      const currentElements = this.getCurrentElementalInfluence();
      const recipeElements = recipe.elementalProperties || {
        Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
      };
      const elementalMatch = this.calculateElementalMatch(recipeElements, currentElements);
      score += elementalMatch * 0.3; // 30% weight for basic elemental matching
    }
    
    // Nutritional scoring
    if (criteria.nutritionalGoals) {
      // Simple nutritional scoring based on available recipe data
      let nutritionalScore = 0.5; // Default neutral score
      if (recipe.nutrition) {
        // Basic nutritional matching logic here
        nutritionalScore = 0.7; // Placeholder - could be enhanced
      }
      score += nutritionalScore * 0.2; // 20% weight for nutritional matching
    }
    
    // Seasonal matching
    if (criteria.season) {
      // Simple seasonal scoring based on recipe season data
      let seasonalScore = 0.5; // Default neutral score
      if (recipe.season && Array.isArray(recipe.season)) {
        seasonalScore = recipe.season.includes(criteria.season) ? 0.9 : 0.3;
      } else if (recipe.season === criteria.season) {
        seasonalScore = 0.9;
      }
      score += seasonalScore * 0.15; // 15% weight for seasonal matching
    }
    
    // Time of day matching
    if (criteria.timeOfDay) {
      // Simple time-based scoring
      let timeScore = 0.5; // Default neutral score
      if (recipe.mealType) {
        const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];
        // Basic time matching logic
        if (criteria.timeOfDay === 'morning' && mealTypes.includes('breakfast')) timeScore = 0.9;
        else if (criteria.timeOfDay === 'afternoon' && mealTypes.includes('lunch')) timeScore = 0.9;
        else if (criteria.timeOfDay === 'evening' && mealTypes.includes('dinner')) timeScore = 0.9;
      }
      score += timeScore * 0.1; // 10% weight for time matching
    }
    
    // Additional scoring factors can be added here...
    
    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Enhanced alchemical score calculation that takes into account current astrological state
   */
  private calculateEnhancedAlchemicalScore(
    recipe: Recipe,
    astrologicalState: AstrologicalState,
    location: { lat: number; lng: number }
  ): number {
    try {
      // Get recipe elemental properties, defaulting if not available
      const recipeElements: ElementalProperties = recipe.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      };
      
      // Get current moment's elemental influence
      const astroStateData = astrologicalState as unknown;
      const currentMomentElements: ElementalProperties = astroStateData?.elementalProperties || 
        astroStateData?.elementalState || this.getCurrentElementalInfluence();
      
      // Calculate elemental compatibility
      const elementalScore = this.calculateElementalMatch(recipeElements, currentMomentElements);
      
      // Calculate advanced compatibility using the culinary recipe matching system
      let advancedScore = 0.5; // Default neutral score
      try {
        const compatibilityResult = (calculateRecipeCompatibility as unknown)(
          recipe,
          astrologicalState
        );
        // Extract numerical score from the result object
        advancedScore = typeof compatibilityResult === 'number' 
          ? compatibilityResult 
          : (compatibilityResult as unknown)?.score || (compatibilityResult as unknown)?.compatibility || 0.5;
      } catch (error) {
        logger.warn('Advanced compatibility calculation failed, using basic elemental match:', error);
        advancedScore = elementalScore;
      }
      
      // Combine scores with weighted average
      const combinedScore = (elementalScore * 0.4) + (advancedScore * 0.6);
      
      return Math.max(0, Math.min(1, combinedScore));
    } catch (error) {
      logger.error('Error in enhanced alchemical score calculation:', error);
      // Return neutral score on error
      return 0.5;
    }
  }

  /**
   * Enhanced elemental matching using both absolute and relative values
   */
  private calculateElementalMatch(
    recipeElements: ElementalProperties,
    currentMomentElements: ElementalProperties
  ): number {
    // Calculate absolute elemental similarity
    const absoluteMatch = this.calculateAbsoluteElementalMatch(recipeElements, currentMomentElements);
    
    // Calculate relative elemental similarity
    const relativeMatch = this.calculateRelativeElementalMatch(recipeElements, currentMomentElements);
    
    // Calculate dominant element compatibility
    const dominantMatch = this.calculateDominantElementMatch(recipeElements, currentMomentElements);
    
    // Weighted combination
    return (
      absoluteMatch * 0.4 +
      relativeMatch * 0.35 +
      dominantMatch * 0.25
    );
  }

  /**
   * Calculate absolute elemental match (direct comparison)
   */
  private calculateAbsoluteElementalMatch(
    recipeElements: ElementalProperties,
    currentMomentElements: ElementalProperties
  ): number {
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    let totalSimilarity = 0;
    let totalWeight = 0;

    for (const element of elements) {
      const recipeValue = recipeElements[element] || 0;
      const currentMomentValue = currentMomentElements[element] || 0;
      
      // Weight by element importance
      const weight = Math.max(recipeValue, currentMomentValue) + 0.1; // +0.1 to prevent zero weights
      
      // Calculate similarity
      const similarity = 1 - Math.abs(recipeValue - currentMomentValue);
      
      totalSimilarity += similarity * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalSimilarity / totalWeight : 0.5;
  }

  /**
   * Calculate relative elemental match (using ratios)
   */
  private calculateRelativeElementalMatch(
    recipeElements: ElementalProperties,
    currentMomentElements: ElementalProperties
  ): number {
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const;
    let totalSimilarity = 0;
    let count = 0;

    for (const element of elements) {
      // Calculate relative values: element / sum of other three
      const otherElements = elements.filter(e => e !== element);
      
      const recipeOthersSum = otherElements.reduce((sum, e) => sum + (recipeElements[e] || 0), 0);
      const currentMomentOthersSum = otherElements.reduce((sum, e) => sum + (currentMomentElements[e] || 0), 0);
      
      const recipeRelative = recipeOthersSum > 0 ? (recipeElements[element] || 0) / recipeOthersSum : 0;
      const currentMomentRelative = currentMomentOthersSum > 0 ? (currentMomentElements[element] || 0) / currentMomentOthersSum : 0;
      
      // Calculate similarity between relative values
      const maxRelative = Math.max(recipeRelative, currentMomentRelative, 0.1); // Prevent division by zero
      const similarity = 1 - Math.abs(recipeRelative - currentMomentRelative) / maxRelative;
      
      totalSimilarity += similarity;
      count++;
    }

    return count > 0 ? totalSimilarity / count : 0.5;
  }

  /**
   * Calculate dominant element compatibility
   */
  private calculateDominantElementMatch(
    recipeElements: ElementalProperties,
    currentMomentElements: ElementalProperties
  ): number {
    // Get dominant elements
    const recipeDominant = this.getDominantElement(recipeElements);
    const currentMomentDominant = this.getDominantElement(currentMomentElements);
    
    // Perfect match for same element
    if (recipeDominant === currentMomentDominant) {
      return 1.0;
    }
    
    // Check elemental harmony (elements that work well together)
    const elementalHarmony = {
      'Fire': ['Air', 'Fire'], // Fire enhances with Air
      'Water': ['Earth', 'Water'], // Water nourishes Earth
      'Earth': ['Water', 'Earth'], // Earth grounds Water
      'Air': ['Fire', 'Air'] // Air feeds Fire
    };
    
    const isHarmonious = elementalHarmony[recipeDominant]?.includes(currentMomentDominant) || false;
    return isHarmonious ? 0.8 : 0.4;
  }

  /**
   * Get dominant element from elemental properties
   */
  private getDominantElement(elements: ElementalProperties): keyof ElementalProperties {
    const entries = Object.entries(elements) as [keyof ElementalProperties, number][];
    return entries.reduce((dominant, [element, value]) => 
      value > (elements[dominant] || 0) ? element : dominant
    , 'Fire');
  }

  /**
   * Apply non-linear score transformation for better differentiation
   */
  private applyScoreTransformation(normalizedScore: number): number {
    if (normalizedScore >= 0.85) {
      return 0.85 + (normalizedScore - 0.85) * 2; // Boost excellent matches
    } else if (normalizedScore >= 0.7) {
      return 0.7 + (normalizedScore - 0.7) * 1.5; // Boost good matches
    } else if (normalizedScore >= 0.5) {
      return 0.5 + (normalizedScore - 0.5) * 1.2; // Slightly boost average matches
    } else {
      return normalizedScore * 0.9; // Slightly penalize poor matches
    }
  }

  /**
   * Store successful recommendation in cache for future use
   */
  public storeRecommendationResult(
    lat: number,
    lng: number,
    astrologicalState: AstrologicalState,
    alchemicalResult: Record<string, unknown>,
    planetaryPositions: Record<string, any>
  ): void {
    try {
      astrologizeCache.store(
        lat,
        lng,
        new Date(),
        astrologicalState,
        alchemicalResult,
        planetaryPositions
      );
    } catch (error) {
      logger.error('Error storing recommendation result in cache:', error);
    }
  }

  /**
   * Get fallback recipe when no recommendations are available
   */
  private getFallbackRecipe(): ScoredRecipe {
    return {
      id: 'fallback-recipe',
      name: 'Universal Balanced Meal',
      description: 'A well-balanced meal that works with any elemental influence.',
      ingredients: [
        { 
          id: 'mixed-vegetables',
          name: 'Mixed vegetables', 
          amount: 2,
          unit: 'cups',
          category: 'vegetable',
          elementalProperties: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 }
        },
        { 
          id: 'protein-choice',
          name: 'Protein of choice', 
          amount: 4,
          unit: 'oz',
          category: 'protein',
          elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 }
        },
        { 
          id: 'whole-grains',
          name: 'Whole grains', 
          amount: 0.5,
          unit: 'cup',
          category: 'grain',
          elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 }
        },
        { 
          id: 'healthy-fats',
          name: 'Healthy fats', 
          amount: 1,
          unit: 'tbsp',
          category: 'oil',
          elementalProperties: { Fire: 0.2, Water: 0.1, Earth: 0.3, Air: 0.4 }
        }
      ],
      instructions: [
        'Combine all ingredients in a balanced way.',
        'Cook using your preferred method.',
        'Season to taste with herbs and spices.'
      ],
      cookingMethod: ['balanced', 'flexible'],
      elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
       },
      score: 0.5,
      mealType: 'any',
      season: 'any',
      difficulty: 'medium',
      preparationTime: 30,
      servings: 2
    };
  }

  /**
   * Get Spoonacular recommendations as a fallback
   */
  private async getSpoonacularRecommendations(
    criteria: RecommendationCriteria
  ): Promise<Recipe[]> {
    try {
      // This would be implemented to call Spoonacular API
      // For example: using SpoonacularService
      return [];
    } catch (error) {
      logger.error('Error getting Spoonacular recommendations:', error);
      return [];
    }
  }
}

export default RecommendationService; 