// Celestial calculations service not yet implemented
import { Recipe } from '@/types/recipe';
import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';
import { logger } from '../utils/logger';
import { createError } from '../utils/errorHandling';
import { calculateLunarPhase } from '../utils/astrologyUtils';
import { calculatePlanetaryPositions } from '../utils/astrology/core';
import { transformItemsWithPlanetaryPositions } from '../utils/astrologyUtils';
import { ScoredRecipe } from '@/types/recipe';
import { AstrologicalState } from '@/types/alchemy';
import { convertToLunarPhase } from '@/utils/lunarPhaseUtils';

import type { ElementalProperties, 
  ElementalItem, 
  AlchemicalItem,
  LunarPhaseWithSpaces,
  PlanetaryAspect } from '@/types/alchemy';
import { ElementalCharacter } from '@/constants/planetaryElements';
import { Element } from "@/types/alchemy";
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
      const lunarPhase = await calculateLunarPhase(new Date());
      
      // Convert to format expected by adapter
      const lunarPhaseFormatted = convertToLunarPhase(lunarPhase);
      
      // Calculate if it's currently daytime
      const now = new Date();
      const hours = now.getHours();
      const isDaytime = hours >= 6 && hours < 18;
      
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
        // Sort by compatibility score (higher is better)
        return (b.compatibilityScore || 0) - (a.compatibilityScore || 0);
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
      if (item.dominantElement) {
        elementCounts[item.dominantElement]++;
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
      const props = ingredient.elementalPropertiesState || { Fire: 0, Water: 0, Earth: 0, Air: 0  };
      return { Fire: acc.Fire + (props.Fire || 0), Water: acc.Water + (props.Water || 0), Earth: acc.Earth + (props.Earth || 0), Air: acc.Air + (props.Air || 0)
       };
    }, { Fire: 0, Water: 0, Earth: 0, Air: 0  });
    
    // Calculate averages
    const count = (topIngredients || []).length;
    return { Fire: totalProperties.Fire / count, Water: totalProperties.Water / count, Earth: totalProperties.Earth / count, Air: totalProperties.Air / count
     };
  }

  /**
   * Enhanced recipe scoring that uses all available alchemical data
   */
  private calculateRecipeScore(
    recipe: Recipe,
    criteria: RecommendationCriteria
  ): number {
    try {
      let score = 0;
      let totalWeight = 0;
      const weights = {
        alchemicalCompatibility: 0.35,  // Enhanced alchemical scoring
        elementalMatch: 0.25,           // Traditional elemental matching
        nutritional: 0.15,              // Nutritional alignment
        seasonal: 0.10,                 // Seasonal appropriateness
        timeOfDay: 0.08,                // Time-based compatibility
        variety: 0.07                   // Variety from recent meals
      };

      // Enhanced alchemical compatibility using our new system
      if (criteria.astrologicalState && criteria.currentLocation) {
        const alchemicalScore = this.calculateEnhancedAlchemicalScore(
          recipe,
          criteria.astrologicalState,
          criteria.currentLocation
        );
        
        score += weights.alchemicalCompatibility * alchemicalScore;
        totalWeight += weights.alchemicalCompatibility;
      }

      // Traditional elemental matching (for backward compatibility)
      if (criteria.astrologicalState?.elementalProperties && recipe.elementalProperties) {
        const elementalScore = this.calculateElementalMatch(
          recipe.elementalProperties,
          criteria.astrologicalState.elementalProperties
        );
        
        score += weights.elementalMatch * elementalScore;
        totalWeight += weights.elementalMatch;
      }

      // Nutritional alignment
      if (recipe.nutrition && criteria.nutritionalGoals) {
        const nutritionalScore = this.calculateNutritionalMatch(
          recipe.nutrition as Record<string, any>,
          criteria.nutritionalGoals
        );
        
        score += weights.nutritional * nutritionalScore;
        totalWeight += weights.nutritional;
      }

      // Seasonal alignment
      if (criteria.season && recipe.season) {
        const seasonalScore = this.calculateSeasonalMatch(recipe.season, criteria.season);
        score += weights.seasonal * seasonalScore;
        totalWeight += weights.seasonal;
      }

      // Time of day appropriateness
      if (criteria.timeOfDay && recipe.mealType) {
        const timeScore = this.calculateTimeMatch(
          Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType],
          criteria.timeOfDay
        );
        
        score += weights.timeOfDay * timeScore;
        totalWeight += weights.timeOfDay;
      }

      // Variety (avoid recent meals)
      if (criteria.previousMeals && criteria.previousMeals.length > 0) {
        const varietyScore = this.calculateVarietyScore(
          recipe.name,
          criteria.previousMeals
        );
        
        score += weights.variety * varietyScore;
        totalWeight += weights.variety;
      }

      // Normalize score based on weights actually used
      const normalizedScore = totalWeight > 0 ? score / totalWeight : 0.5;
      
      // Apply a non-linear transformation to better differentiate matches
      return this.applyScoreTransformation(normalizedScore);
      
    } catch (error) {
      logger.error('Error calculating recipe score:', error);
      return 0;
    }
  }

  /**
   * Enhanced alchemical scoring using cached astrologize data and kalchm/monica constants
   */
  private calculateEnhancedAlchemicalScore(
    recipe: Recipe,
    astrologicalState: AstrologicalState,
    location: { lat: number; lng: number }
  ): number {
    try {
      // Try to get cached alchemical data
      const currentDate = new Date();
      const cachedData = astrologizeCache.getMatchingData(
        location.lat,
        location.lng,
        currentDate
      );

      if (cachedData && recipe.elementalProperties) {
        // Use our enhanced matching algorithm
        const currentMomentKalchmResult = {
          elementalValues: astrologicalState.elementalProperties || {
            Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
          },
          alchemicalProperties: {
            Spirit: cachedData.thermodynamics.gregsEnergy || 0,
            Essence: cachedData.thermodynamics.entropy || 0,
            Matter: cachedData.thermodynamics.heat || 0,
            Substance: cachedData.thermodynamics.reactivity || 0
          },
          thermodynamics: {
            heat: cachedData.thermodynamics.heat,
            entropy: cachedData.thermodynamics.entropy,
            reactivity: cachedData.thermodynamics.reactivity,
            energy: cachedData.thermodynamics.gregsEnergy,
            gregsEnergy: cachedData.thermodynamics.gregsEnergy
          },
          kalchm: cachedData.thermodynamics.kalchm,
          monica: cachedData.thermodynamics.monica
        };

        const compatibility = calculateRecipeCompatibility(
          recipe.elementalProperties,
          currentMomentKalchmResult
        );

        // Weight different aspects of compatibility
        const enhancedScore = (
          compatibility.absoluteElementalMatch * 0.25 +
          compatibility.relativeElementalMatch * 0.20 +
          compatibility.kalchmAlignment * 0.25 +
          compatibility.monicaAlignment * 0.15 +
          compatibility.energeticResonance * 0.10 +
          compatibility.thermodynamicAlignment * 0.05
        );

        // Boost score based on data quality
        const qualityMultiplier = cachedData.quality === 'high' ? 1.0 : 
                                 cachedData.quality === 'medium' ? 0.9 : 0.8;

        return enhancedScore * qualityMultiplier;
      }

      // Fallback to traditional elemental matching if no cached data
      if (recipe.elementalProperties && astrologicalState.elementalProperties) {
        return this.calculateElementalMatch(
          recipe.elementalProperties,
          astrologicalState.elementalProperties
        );
      }

      return 0.5; // Neutral score if no data available

    } catch (error) {
      logger.error('Error calculating enhanced alchemical score:', error);
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
    alchemicalResult: any,
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
        { name: 'Mixed vegetables', quantity: '2 cups' },
        { name: 'Protein of choice', quantity: '4 oz' },
        { name: 'Whole grains', quantity: '1/2 cup' },
        { name: 'Healthy fats', quantity: '1 tbsp' }
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