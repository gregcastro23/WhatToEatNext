import { ElementalCharacter, AlchemicalProperty } from '@/constants/planetaryElements';
import { RulingPlanet } from '@/constants/planets';
import {
  DefaultElementalProperties,
  DefaultAlchemicalProperties,
  DefaultThermodynamicMetrics,
  createSuccessResponse,
  createErrorResponse
} from '@/constants/typeDefaults';
import type {
  ElementalPropertiesType,
  AlchemicalPropertiesType,
  ThermodynamicMetricsType,
  ZodiacSignType,
  LunarPhaseType,
  PlanetaryPositionsType,
  ServiceResponseType,
  ElementalProperties,
  ZodiacSign,
  LunarPhase,
  LunarPhaseWithSpaces,
  PlanetaryAspect,
  IngredientMapping,
  PlanetaryPosition
} from '@/types/alchemy';
import { Recipe } from '@/types/recipe';
import { convertToLunarPhase } from '@/utils/lunarPhaseUtils';

import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import type { BirthChart } from '../types/astrology';
import {
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  getTopCompatibleItems
} from '../utils/alchemicalTransformationUtils';
import { calculateLunarPhase, calculatePlanetaryPositions } from '../utils/astrologyUtils';
import { logger } from '../utils/logger';

// ========== PHASE 3: UPDATED IMPORTS TO USE TYPE ALIASES ==========;

// ========== PHASE 3: UPDATED INTERFACES USING TYPE ALIASES ==========;

/**
 * Interface for alchemical recommendations - Updated to use type aliases
 */
export interface AlchemicalRecommendations {
  topIngredients: AlchemicalItem[],
  topMethods: AlchemicalItem[],
  topCuisines: AlchemicalItem[],
  dominantElement: ElementalCharacter,
  dominantAlchemicalProperty: AlchemicalProperty,
  elementalBalance: ElementalPropertiesType,
  alchemicalState: AlchemicalPropertiesType,
  thermodynamicMetrics: ThermodynamicMetricsType,
  compatibility: number,
  reasoning: string[]
}

/**
 * Interface for optimized recipe results - Updated to use type aliases
 */
export interface OptimizedRecipeResult {
  recipe: Recipe,
  compatibility: number,
  dominantElement: ElementalCharacter,
  dominantAlchemicalProperty: AlchemicalProperty,
  alchemicalScore: number,
  seasonalScore: number,
  ingredientMatchScore: number,
  cookingMethodScore: number,
  lunarPhaseScore?: number,
  zodiacScore?: number,
  elementalProfile: ElementalPropertiesType,
  thermodynamicProfile: ThermodynamicMetricsType
}

/**
 * Comprehensive elemental recommendation type - Updated to use type aliases
 */
export interface ElementalRecommendation {
  dominantElement: string,
  elementalProfile: ElementalPropertiesType,
  cookingTechniques: string[],
  complementaryIngredients: string[],
  flavorProfiles: string[],
  healthBenefits: string[],
  timeOfDay: string[],
  seasonalBest: string[],
  moodEffects: string[],
  culinaryHerbs: string[],
  compatibility: number
}

/**
 * Interface for food correspondence - Updated to use type aliases
 */
export interface FoodCorrespondence {
  name: string,
  element: ElementalCharacter,
  planetaryRuler: RulingPlanet,
  timeOfDay: 'Day' | 'Night' | 'Both',
  elementalProperties: ElementalPropertiesType,
  energyValues: ThermodynamicMetricsType,
  preparation: string[],
  combinations: string[],
  restrictions: string[]
}

/**
 * Interface for compatibility score - Updated to use type aliases
 */
export interface CompatibilityScore {
  compatibility: number,
  elementalMatch: ElementalPropertiesType,
  recommendations: string[],
  warnings: string[],
  scoreDetails?: {
    elementalMatch?: number;
    planetaryDayMatch?: number;
    planetaryHourMatch?: number;
    affinityBonus?: number,
    dignityBonus?: number,
    decanBonus?: number,
    aspectBonus?: number
  };
}

// ========== PHASE 3: STANDARDIZED RESPONSE TYPES ==========;

/**
 * Standardized Alchemical Recommendation Response
 */
export type AlchemicalServiceResponse = ServiceResponseType<AlchemicalRecommendations>;

/**
 * Standardized Recipe Optimization Response
 */
export type RecipeOptimizationResponse = ServiceResponseType<{
  optimizedRecipes: OptimizedRecipeResult[],
  totalAnalyzed: number,
  averageCompatibility: number,
  recommendationCriteria: Record<string, Record<string, number>>
}>;

/**
 * Standardized Compatibility Analysis Response
 */
export type CompatibilityAnalysisResponse = ServiceResponseType<CompatibilityScore>;

/**
 * Consolidated service for alchemical transformations, recommendations, and compatibility
 */
export class AlchemicalService {
  private static instance: AlchemicalService,
  private ingredients: ElementalItem[] = [];
  private cookingMethods: ElementalItem[] = [];
  private cuisines: ElementalItem[] = [];
  private planetPositions: PlanetaryPositionsType = {};
  private isDaytime = true;
  private currentZodiac: anyType | null = null;
  private lunarPhase: LunarPhaseType | null = null;
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: { [key: string]: number };
  private aspects: PlanetaryAspect[] = [];
  private retrogradeStatus: { [key: string]: boolean } = {};

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AlchemicalService {
    if (!AlchemicalService.instance) {
      AlchemicalService.instance = new AlchemicalService();
    }
    return AlchemicalService.instance;
  }

  /**
   * Initialize the service with data
   */
  initialize(
    ingredients: ElementalItem[] = [],
    cookingMethods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ): AlchemicalService {
    this.ingredients = ingredients;
    this.cookingMethods = cookingMethods;
    this.cuisines = cuisines;
    return this
  }

  /**
   * Initialize from current planetary positions - Updated with standardized response
   */
  async initializeFromCurrentPositions(): Promise<ServiceResponseType<boolean>> {
    try {
      // Calculate real-time planetary positions
      const positions = await calculatePlanetaryPositions();

      // Calculate current lunar phase
      const lunarPhase = await calculateLunarPhase(new Date());

      // Convert to format expected by adapter
      const lunarPhaseFormatted = convertToLunarPhase(;
        lunarPhase as unknown,
      ) as LunarPhaseWithSpaces;

      // Calculate if it's currently daytime
      const now = new Date();
      const hours = now.getHours();
      const _isDaytime = hours >= 6 && hours < 18;

      // Get current Sun sign as current zodiac
      const sunPosition = positions['Sun'];
      const currentZodiac = sunPosition.sign || null;

      // Set properties
      this.planetPositions = positions as unknown as PlanetaryPositionsType;
      this.isDaytime = _isDaytime;
      this.currentZodiac = currentZodiac as anyType;
      this.lunarPhase = lunarPhaseFormatted as LunarPhaseType;

      // Track retrograde planets
      Object.entries(positions || {}).forEach(([planet, data]) => {
        if (typeof data === 'object' && data !== null && 'isRetrograde' in data) {
          this.retrogradeStatus[planet] = !!data.isRetrograde;
        }
      });

      return createSuccessResponse(true);
    } catch (error) {
      logger.error('Failed to initialize from current positions:', error),
      return createErrorResponse(
        `Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Set planetary positions
   */
  setPlanetaryPositions(positions: { [key: string]: PlanetaryPosition }): AlchemicalService {
    // Convert PlanetaryPosition objects to strings for PlanetaryPositionsType
    const convertedPositions: PlanetaryPositionsType = {};
    Object.entries(positions).forEach(([planet, position]) => {
      convertedPositions[planet] = `${position.sign}:${position.degree}`;
    });
    this.planetPositions = convertedPositions;
    return this;
  }

  /**
   * Set whether it's currently day or night
   */
  setDaytime(isDaytime: boolean): AlchemicalService {
    this.isDaytime = isDaytime;
    return this
  }

  /**
   * Set current zodiac sign
   */
  setCurrentZodiac(zodiac: any | null): AlchemicalService {
    this.currentZodiac = zodiac;
    return this
  }

  /**
   * Set lunar phase
   */
  setLunarPhase(phase: LunarPhase | null): AlchemicalService {
    this.lunarPhase = phase;
    return this
  }

  /**
   * Set tarot element boosts
   */
  setTarotElementBoosts(boosts: Record<ElementalCharacter, number> | undefined): AlchemicalService {
    this.tarotElementBoosts = boosts;
    return this
  }

  /**
   * Set tarot planetary boosts
   */
  setTarotPlanetaryBoosts(boosts: { [key: string]: number } | undefined): AlchemicalService {
    this.tarotPlanetaryBoosts = boosts;
    return this
  }

  /**
   * Set planetary aspects
   */
  setAspects(aspects: PlanetaryAspect[]): AlchemicalService {
    this.aspects = aspects;
    return this
  }

  /**
   * Update ingredients data
   */
  setIngredients(ingredients: ElementalItem[]): AlchemicalService {
    this.ingredients = ingredients;
    return this
  }

  /**
   * Update cooking methods data
   */
  setCookingMethods(methods: ElementalItem[]): AlchemicalService {
    this.cookingMethods = methods;
    return this
  }

  /**
   * Update cuisines data
   */
  setCuisines(cuisines: ElementalItem[]): AlchemicalService {
    this.cuisines = cuisines;
    return this
  }

  /**
   * Get transformed ingredients based on current settings
   */
  getTransformedIngredients(): AlchemicalItem[] {
    return transformIngredients(
      this.ingredients;
      this.planetPositions as unknown as Record<RulingPlanet, number>,
      this.isDaytime;
      this.currentZodiac;
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    )
  }

  /**
   * Get transformed cooking methods based on current settings
   */
  getTransformedCookingMethods(): AlchemicalItem[] {
    return transformCookingMethods(
      this.cookingMethods;
      this.planetPositions as unknown as Record<RulingPlanet, number>,
      this.isDaytime;
      this.currentZodiac;
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    )
  }

  /**
   * Get transformed cuisines based on current settings
   */
  getTransformedCuisines(): AlchemicalItem[] {
    return transformCuisines(
      this.cuisines;
      this.planetPositions as unknown as Record<RulingPlanet, number>,
      this.isDaytime;
      this.currentZodiac;
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    )
  }

  /**
   * Get alchemical recommendations based on current planetary positions
   */
  getRecommendations(count = 5): AlchemicalRecommendations {
    const transformedIngredients = this.getTransformedIngredients();
    const transformedMethods = this.getTransformedCookingMethods();
    const transformedCuisines = this.getTransformedCuisines();

    const topIngredients = getTopCompatibleItems(transformedIngredients, count);
    const topMethods = getTopCompatibleItems(transformedMethods, count);
    const topCuisines = getTopCompatibleItems(transformedCuisines, count),;

    // Determine overall dominant element and alchemical property
    const dominantElement =
      (topIngredients || []).length > 0 ? topIngredients[0].dominantElement : 'Fire';

    const dominantAlchemicalProperty =
      (topIngredients || []).length > 0 ? topIngredients[0].dominantAlchemicalProperty : 'Spirit';

    return {
      topIngredients,
      topMethods,
      topCuisines,
      dominantElement,
      dominantAlchemicalProperty,
      elementalBalance: DefaultElementalProperties,
      alchemicalState: DefaultAlchemicalProperties,
      thermodynamicMetrics: DefaultThermodynamicMetrics,
      compatibility: 0.5,
      reasoning: []
    };
  }

  /**
   * Get recipes optimized for current planetary positions
   */
  getOptimizedRecipes(recipes: Recipe[], count = 3): OptimizedRecipeResult[] {
    // Implementation from AlchemicalTransformationService
    // Would go here - simplified for brevity
    return recipes.slice(0, count).map(recipe => ({
      recipe,
      compatibility: 0.5,
      dominantElement: 'Fire',
      dominantAlchemicalProperty: 'Spirit',
      alchemicalScore: 0.5,
      seasonalScore: 0.5,
      ingredientMatchScore: 0.5,
      cookingMethodScore: 0.5,
      elementalProfile: DefaultElementalProperties,
      thermodynamicProfile: DefaultThermodynamicMetrics
    }));
  }

  /**
   * Generates a complete recommendation based on elemental properties
   * @param properties The elemental properties to base recommendations on
   * @returns A comprehensive recommendation object
   */
  generateElementalRecommendation(properties: ElementalProperties): ElementalRecommendation {
    const profile = {}; // elementalUtils.getElementalProfile(properties);
    const dominantElement = this.getDominantElement(properties);

    // Apply safe type casting for profile property access
    const profileData = profile as any;

    return {
      dominantElement,
      elementalProfile: DefaultElementalProperties,
      cookingTechniques: [], // elementalUtils.getSuggestedCookingTechniques(properties),
      complementaryIngredients: [], // elementalUtils.getComplementaryElement(properties),
      flavorProfiles: ((profileData.characteristics ).flavorProfiles as string[]) || [],
      healthBenefits: ((profileData.characteristics ).healthBenefits as string[]) || [],
      timeOfDay: ((profileData.characteristics ).timeOfDay as string[]) || [],
      seasonalBest: this.getSeasonalRecommendations(dominantElement as unknown as Element),
      moodEffects: ((profileData.characteristics ).moodEffects as string[]) || [],
      culinaryHerbs: ((profileData.characteristics ).culinaryHerbs as string[]) || [],
      compatibility: 0.5
    };
  }

  /**
   * Generates zodiac-specific recommendations
   * @param zodiacSign The zodiac sign to generate recommendations for
   * @returns A recommendation tailored to the zodiac sign
   */
  generateZodiacRecommendation(currentZodiacSign: any): ElementalRecommendation {
    const ZODIAC_ELEMENTS: { [key: string]: ElementalCharacter } = {
      aries: 'Fire',
      leo: 'Fire',
      sagittarius: 'Fire',
      taurus: 'Earth',
      virgo: 'Earth',
      capricorn: 'Earth',
      gemini: 'Air',
      libra: 'Air',
      aquarius: 'Air',
      cancer: 'Water',
      scorpio: 'Water',
      pisces: 'Water'
    };

    const element = ZODIAC_ELEMENTS[currentZodiacSign];
    const properties = {
      Fire: element === 'Fire' ? 0.6 : 0.1,;
      Water: element === 'Water' ? 0.6 : 0.1,;
      Earth: element === 'Earth' ? 0.6 : 0.1,,;
      Air: element === 'Air' ? 0.6 : 0.1,,;
    };

    return this.generateElementalRecommendation(properties); // elementalUtils.normalizeProperties(properties));
  }

  /**
   * Calculate food compatibility based on birth chart and current planetary positions
   */
  calculateFoodCompatibility(
    _food: FoodCorrespondence,
    _chart: BirthChart,
    _planetaryDay: string,
    _planetaryHour: string,
    _isDaytime: boolean,
    _planetaryPositions?: Record<string, { sign: string, degree: number }>,
    _aspects?: Array<{ type: string, planets: [string, string] }>,
  ): CompatibilityScore {
    // Implementation from FoodAlchemySystem
    // Would go here - simplified for brevity
    return {
      compatibility: 0.5,
      elementalMatch: DefaultElementalProperties,
      recommendations: [],
      warnings: []
    };
  }

  /**
   * Calculate elemental compatibility between two ingredients
   */
  calculateIngredientCompatibility(
    ingredient1: IngredientMapping,
    ingredient2: IngredientMapping,
  ): number {
    return this.calculateElementalSimilarity(
      (ingredient1.elementalState as unknown as ElementalProperties) || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
      (ingredient2.elementalState as unknown as ElementalProperties) || {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
      },
    );
  }

  /**
   * Calculate elemental similarity between two sets of properties
   * Following our elemental principles where:
   * 1. Elements reinforce themselves most strongly
   * 2. All element combinations have good compatibility
   * 3. No opposing elements
   */
  private calculateElementalSimilarity(
    properties1: ElementalProperties,
    properties2: ElementalProperties,
  ): number {
    // Define element compatibility scores (same elements have highest compatibility)
    const compatibilityScores = {
      Fire: { Fire: 0.9, Water: 0.7, Earth: 0.7, Air: 0.8 },
      Water: { Water: 0.9, Fire: 0.7, Earth: 0.8, Air: 0.7 },
      Earth: { Earth: 0.9, Fire: 0.7, Water: 0.8, Air: 0.7 },
      Air: { Air: 0.9, Fire: 0.8, Water: 0.7, Earth: 0.7 }
    };

    // Calculate weighted compatibility across all elements
    let weightedSum = 0;
    let totalWeight = 0;

    // Compare each element
    for (const sourceElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const sourceValue = properties1[sourceElement] || 0;
      if (sourceValue <= 0) continue; // Skip elements with no presence

      // Weight by the element's prominence in the source
      const weight = sourceValue;

      // For each source element, calculate its compatibility with each target element
      let bestCompatibility = 0;
      for (const targetElement of ['Fire', 'Water', 'Earth', 'Air'] as const) {
        const targetValue = properties2[targetElement] || 0;
        if (targetValue <= 0) continue; // Skip elements with no presence

        // Get compatibility between these two elements
        const elementCompatibility = compatibilityScores[sourceElement][targetElement] || 0.7;

        // Scale by the target element's prominence
        const scaledCompatibility = elementCompatibility * targetValue;
        bestCompatibility = Math.max(bestCompatibility, scaledCompatibility),;
      }

      weightedSum += bestCompatibility * weight;
      totalWeight += weight;
    }

    // Calculate final score - ensure minimum of 0.7 following our principles
    return totalWeight > 0 ? Math.max(0.7, weightedSum / totalWeight) : 0.7;
  }

  /**
   * Gets the dominant element from elemental properties
   */
  private getDominantElement(properties: ElementalProperties): string {
    return Object.entries(properties).reduce(
      (max, [element, value]) => (value > max.value ? { element, value } : max),
      { element: '', value: 0 },
    ).element;
  }

  /**
   * Gets seasonal recommendations based on element
   */
  private getSeasonalRecommendations(element: Element): string[] {
    const seasonalMap: Record<string, string[]> = {
      Fire: ['summer', 'Late Spring'],
      Water: ['winter', 'Late Autumn'],
      Earth: ['autumn', 'Late Summer'],
      Air: ['spring', 'Early Summer']
    };

    return seasonalMap[element as unknown as string] || ['Any season'];
  }
}

export default AlchemicalService;
