import { RulingPlanet } from '../constants/planets';
import {
  ElementalCharacter,
  AlchemicalProperty,
} from '../constants/planetaryElements';
import {
  ElementalItem,
  AlchemicalItem,
} from '../calculations/alchemicalTransformation';
import {
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  sortByAlchemicalCompatibility,
  filterByAlchemicalCompatibility,
  getTopCompatibleItems,
} from '../utils/alchemicalTransformationUtils';
import {
  ZodiacSign,
  LunarPhase,
  PlanetaryAspect,
  LunarPhaseWithSpaces,
} from '../types/alchemy';
import type { Recipe } from '../types/recipe';
import { createLogger } from '../utils/logger';
import { ElementalCalculator } from './ElementalCalculator';

const logger = createLogger('AlchemicalTransformationService');

/**
 * Interface for alchemical recommendations
 */
export interface AlchemicalRecommendations {
  topIngredients: AlchemicalItem[];
  topMethods: AlchemicalItem[];
  topCuisines: AlchemicalItem[];
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}

/**
 * Interface for optimized recipe results
 */
export interface OptimizedRecipeResult {
  recipe: Recipe;
  compatibility: number;
  dominantElement: ElementalCharacter;
  dominantAlchemicalProperty: AlchemicalProperty;
  alchemicalScore: number;
  seasonalScore: number;
  ingredientMatchScore: number;
  cookingMethodScore: number;
  lunarPhaseScore?: number;
  zodiacScore?: number;
}

/**
 * Service for handling alchemical transformations and recommendations
 */
export class AlchemicalTransformationService {
  private ingredients: ElementalItem[] = [];
  private cookingMethods: ElementalItem[] = [];
  private cuisines: ElementalItem[] = [];
  private planetPositions: Record<RulingPlanet, number> = {
    Sun: 0,
    Venus: 0,
    Mercury: 0,
    Moon: 0,
    Saturn: 0,
    Jupiter: 0,
    Mars: 0,
    Uranus: 0,
    Neptune: 0,
    Pluto: 0,
  };
  private isDaytime = true;
  private currentZodiac: ZodiacSign | null = null;
  private lunarPhase: LunarPhase | null = null;
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: Record<string, number>;
  private aspects: PlanetaryAspect[] = [];
  private elementalCalculator: ElementalCalculator;

  /**
   * Initialize the service with data
   */
  constructor(
    ingredients: ElementalItem[] = [],
    cookingMethods: ElementalItem[] = [],
    cuisines: ElementalItem[] = []
  ) {
    this.ingredients = ingredients;
    this.cookingMethods = cookingMethods;
    this.cuisines = cuisines;
    this.elementalCalculator = new ElementalCalculator();
  }

  /**
   * Set planetary positions
   */
  setPlanetaryPositions(positions: Record<RulingPlanet, number>): void {
    this.planetPositions = positions;
  }

  /**
   * Set whether it's currently day or night
   */
  setDaytime(isDaytime: boolean): void {
    this.isDaytime = isDaytime;
  }

  /**
   * Set current zodiac sign
   */
  setCurrentZodiac(zodiac: ZodiacSign | null): void {
    this.currentZodiac = zodiac;
  }

  /**
   * Set lunar phase
   */
  setLunarPhase(phase: LunarPhase | null): void {
    this.lunarPhase = phase;
  }

  /**
   * Set tarot element boosts
   */
  setTarotElementBoosts(
    boosts: Record<ElementalCharacter, number> | undefined
  ): void {
    this.tarotElementBoosts = boosts;
  }

  /**
   * Set tarot planetary boosts
   */
  setTarotPlanetaryBoosts(boosts: Record<string, number> | undefined): void {
    this.tarotPlanetaryBoosts = boosts;
  }

  /**
   * Set planetary aspects
   */
  setAspects(aspects: PlanetaryAspect[]): void {
    this.aspects = aspects;
  }

  /**
   * Update ingredients data
   */
  setIngredients(ingredients: ElementalItem[]): void {
    this.ingredients = ingredients;
  }

  /**
   * Update cooking methods data
   */
  setCookingMethods(methods: ElementalItem[]): void {
    this.cookingMethods = methods;
  }

  /**
   * Update cuisines data
   */
  setCuisines(cuisines: ElementalItem[]): void {
    this.cuisines = cuisines;
  }

  /**
   * Get transformed ingredients based on current settings
   */
  getTransformedIngredients(): AlchemicalItem[] {
    return transformIngredients(
      this.ingredients,
      this.planetPositions,
      this.isDaytime,
      this.currentZodiac,
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    );
  }

  /**
   * Get transformed cooking methods based on current settings
   */
  getTransformedCookingMethods(): AlchemicalItem[] {
    return transformCookingMethods(
      this.cookingMethods,
      this.planetPositions,
      this.isDaytime,
      this.currentZodiac,
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    );
  }

  /**
   * Get transformed cuisines based on current settings
   */
  getTransformedCuisines(): AlchemicalItem[] {
    return transformCuisines(
      this.cuisines,
      this.planetPositions,
      this.isDaytime,
      this.currentZodiac,
      this.lunarPhase as unknown as LunarPhaseWithSpaces
    );
  }

  /**
   * Get alchemical recommendations based on current planetary positions
   */
  getRecommendations(count = 5): AlchemicalRecommendations {
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();
    let transformedCuisines = this.getTransformedCuisines();

    let topIngredients = getTopCompatibleItems(transformedIngredients, count);
    let topMethods = getTopCompatibleItems(transformedMethods, count);
    let topCuisines = getTopCompatibleItems(transformedCuisines, count);

    // Determine overall dominant element and alchemical property
    // This is based on the first ingredients as they typically have the strongest influence
    let dominantElement =
      topIngredients.length > 0 ? topIngredients[0].dominantElement : 'Fire';

    let dominantAlchemicalProperty =
      topIngredients.length > 0
        ? topIngredients[0].dominantAlchemicalProperty
        : 'Spirit';

    // Calculate average energy values across top ingredients
    let calculateAverage = (
      items: AlchemicalItem[],
      property: keyof AlchemicalItem
    ): number => {
      if (items.length === 0) return 0;
      let sum = items.reduce(
        (acc, item) => acc + (item[property] as number),
        0
      );
      return parseFloat((sum /items.length).toFixed(2));
    };

    return {
      topIngredients,
      topMethods,
      topCuisines,
      dominantElement,
      dominantAlchemicalProperty,
      heat: calculateAverage(topIngredients, 'heat'),
      entropy: calculateAverage(topIngredients, 'entropy'),
      reactivity: calculateAverage(topIngredients, 'reactivity'),
      gregsEnergy: calculateAverage(topIngredients, 'gregsEnergy'),
    };
  }

  /**
   * Get recipes optimized for current planetary positions
   * Analyzes recipes based on their ingredients, cooking methods, and cuisine
   * to find the ones most compatible with the current astrological conditions
   */
  getOptimizedRecipes(recipes: Recipe[], count = 3): OptimizedRecipeResult[] {
    // Get alchemical recommendations to determine optimal elements and properties
    let recommendations = this.getRecommendations();

    // Get the transformed data we need for calculations
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();
    let transformedCuisines = this.getTransformedCuisines();

    // Create lookup maps for faster access
    let ingredientMap = new Map<string, AlchemicalItem>();
    transformedIngredients.forEach((item) => {
      ingredientMap.set(item.name.toLowerCase(), item);
    });

    let methodMap = new Map<string, AlchemicalItem>();
    transformedMethods.forEach((item) => {
      methodMap.set(item.name.toLowerCase(), item);
    });

    let cuisineMap = new Map<string, AlchemicalItem>();
    transformedCuisines.forEach((item) => {
      cuisineMap.set(item.name.toLowerCase(), item);
    });

    // Score each recipe based on its compatibility with the current planetary conditions
    let scoredRecipes = recipes.map((recipe) => {
      // Base compatibility score
      let compatibility = 0;

      // Ingredient compatibility
      let ingredientMatch = 0;
      let ingredientCount = 0;

      recipe.ingredients?.forEach((ingredient) => {
        let ingredientName = ingredient.name.toLowerCase();
        let alchemicalIngredient = ingredientMap.get(ingredientName);

        if (alchemicalIngredient) {
          ingredientCount++;
          ingredientMatch += alchemicalIngredient.gregsEnergy;
        }
      });

      let ingredientMatchScore =
        ingredientCount > 0 ? ingredientMatch /ingredientCount : 0;

      // Cooking method compatibility
      let methodMatch = 0;
      let methodCount = 0;

      recipe.cookingMethods?.forEach((method: string) => {
        let methodName = method.toLowerCase();
        let alchemicalMethod = methodMap.get(methodName);

        if (alchemicalMethod) {
          methodCount++;
          methodMatch += alchemicalMethod.gregsEnergy;
        }
      });

      let cookingMethodScore =
        methodCount > 0 ? methodMatch /methodCount : 0;

      // Cuisine compatibility
      let cuisineMatch = 0;
      if (recipe.cuisine) {
        let cuisineName = recipe.cuisine.toLowerCase();
        let alchemicalCuisine = cuisineMap.get(cuisineName);

        if (alchemicalCuisine) {
          cuisineMatch = alchemicalCuisine.gregsEnergy;
        }
      }

      // Calculate seasonal score
      let seasonalScore = this.calculateSeasonalScore(recipe);

      // Calculate lunar phase score if available
      let lunarPhaseScore = this.lunarPhase
        ? this.calculateLunarPhaseScore(recipe)
        : 0;

      // Calculate zodiac score if available
      let zodiacScore = this.currentZodiac
        ? this.calculateZodiacScore(recipe)
        : 0;

      // Overall alchemical score is a weighted average of ingredient, method, and cuisine scores
      let alchemicalScore =
        ingredientMatchScore * 0.6 +
        cookingMethodScore * 0.3 +
        cuisineMatch * 0.1;

      // Combine all scores for overall compatibility
      compatibility =
        alchemicalScore * 0.5 +
        seasonalScore * 0.3 +
        lunarPhaseScore * 0.1 +
        zodiacScore * 0.1;

      // Determine dominant element and alchemical property for this recipe
      let dominantElement = this.getDominantElement(recipe);
      let dominantAlchemicalProperty =
        this.getDominantAlchemicalProperty(recipe);

      return {
        recipe,
        compatibility: parseFloat(compatibility.toFixed(2)),
        dominantElement,
        dominantAlchemicalProperty,
        alchemicalScore: parseFloat(alchemicalScore.toFixed(2)),
        seasonalScore: parseFloat(seasonalScore.toFixed(2)),
        ingredientMatchScore: parseFloat(ingredientMatchScore.toFixed(2)),
        cookingMethodScore: parseFloat(cookingMethodScore.toFixed(2)),
        lunarPhaseScore: parseFloat(lunarPhaseScore.toFixed(2)),
        zodiacScore: parseFloat(zodiacScore.toFixed(2)),
      };
    });

    // Sort by compatibility score
    let sortedRecipes = scoredRecipes.sort(
      (a, b) => b.compatibility - a.compatibility
    );

    // Return top N recipes
    return sortedRecipes.slice(0, count);
  }

  /**
   * Get recommendation for a specific alchemical goal
   * @param targetElement Target element to emphasize
   * @param targetProperty Target alchemical property to emphasize
   */
  getTargetedRecommendations(
    targetElement?: ElementalCharacter,
    targetAlchemicalProperty?: AlchemicalProperty,
    count = 5
  ): AlchemicalRecommendations {
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();
    let transformedCuisines = this.getTransformedCuisines();

    let filteredIngredients = filterByAlchemicalCompatibility(
      transformedIngredients,
      targetElement,
      targetAlchemicalProperty
    );

    let filteredMethods = filterByAlchemicalCompatibility(
      transformedMethods,
      targetElement,
      targetAlchemicalProperty
    );

    let filteredCuisines = filterByAlchemicalCompatibility(
      transformedCuisines,
      targetElement,
      targetAlchemicalProperty
    );

    let topIngredients = getTopCompatibleItems(filteredIngredients, count);
    let topMethods = getTopCompatibleItems(filteredMethods, count);
    let topCuisines = getTopCompatibleItems(filteredCuisines, count);

    // Use provided targets or default to first ingredient
    let dominantElement =
      targetElement ||
      (topIngredients.length > 0 ? topIngredients[0].dominantElement : 'Fire');

    let dominantAlchemicalProperty =
      targetAlchemicalProperty ||
      (topIngredients.length > 0
        ? topIngredients[0].dominantAlchemicalProperty
        : 'Spirit');

    // Calculate average energy values
    let calculateAverage = (
      items: AlchemicalItem[],
      property: keyof AlchemicalItem
    ): number => {
      if (items.length === 0) return 0;
      let sum = items.reduce(
        (acc, item) => acc + (item[property] as number),
        0
      );
      return parseFloat((sum /items.length).toFixed(2));
    };

    return {
      topIngredients,
      topMethods,
      topCuisines,
      dominantElement,
      dominantAlchemicalProperty,
      heat: calculateAverage(topIngredients, 'heat'),
      entropy: calculateAverage(topIngredients, 'entropy'),
      reactivity: calculateAverage(topIngredients, 'reactivity'),
      gregsEnergy: calculateAverage(topIngredients, 'gregsEnergy'),
    };
  }

  // Helper method to calculate seasonal score for a recipe
  private calculateSeasonalScore(recipe: Recipe): number {
    if (!recipe.season || recipe.season.length === 0) return 0.5;

    let currentMonth = new Date().getMonth();
    let seasons = Array.isArray(recipe.season)
      ? recipe.season
      : [recipe.season];

    // Map months to seasons
    const monthToSeason: Record<number, string> = {
      0: 'winter',
      1: 'winter', // Jan, Feb
      2: 'spring',
      3: 'spring',
      4: 'spring', // Mar, Apr, May
      5: 'summer',
      6: 'summer',
      7: 'summer', // Jun, Jul, Aug
      8: 'fall',
      9: 'fall',
      10: 'fall', // Sep, Oct, Nov
      11: 'winter', // Dec
    };

    let currentSeason = monthToSeason[currentMonth];
    if (seasons.includes(currentSeason) || seasons.includes('all')) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to calculate lunar phase score for a recipe
  private calculateLunarPhaseScore(recipe: Recipe): number {
    if (
      !recipe.astrologicalAffinities?.lunarPhases ||
      recipe.astrologicalAffinities.lunarPhases.length === 0 ||
      !this.lunarPhase
    ) {
      return 0.5;
    }

    let lunarPhaseLower = this.lunarPhase.toLowerCase();

    // Check if the recipe's lunar phases include the current lunar phase
    let lunarPhases = recipe.astrologicalAffinities.lunarPhases.map(
      (phase: string) => phase.toLowerCase()
    );

    if (lunarPhases.includes(lunarPhaseLower)) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to calculate zodiac score for a recipe
  private calculateZodiacScore(recipe: Recipe): number {
    if (
      !recipe.astrologicalAffinities?.signs ||
      recipe.astrologicalAffinities.signs.length === 0 ||
      !this.currentZodiac
    ) {
      return 0.5;
    }

    let zodiacLower = this.currentZodiac.toLowerCase();

    // Check if the recipe's zodiac signs include the current zodiac sign
    let zodiacSigns = recipe.astrologicalAffinities.signs.map(
      (sign: string) => sign.toLowerCase()
    );

    if (zodiacSigns.includes(zodiacLower)) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to determine the dominant element for a recipe
  private getDominantElement(recipe: Recipe): ElementalCharacter {
    if (!recipe.elementalProperties) return 'Fire';

    let elements = recipe.elementalProperties;
    let dominantValue = Math.max(
      elements.Fire || 0,
      elements.Water || 0,
      elements.Earth || 0,
      elements.Air || 0
    );

    if (dominantValue === elements.Fire) return 'Fire';
    if (dominantValue === elements.Water) return 'Water';
    if (dominantValue === elements.Earth) return 'Earth';
    if (dominantValue === elements.Air) return 'Air';

    return 'Fire'; // Default
  }

  // Helper method to determine the dominant alchemical property for a recipe
  private getDominantAlchemicalProperty(recipe: Recipe): AlchemicalProperty {
    // This is a simplified version; in a real implementation, you would analyze
    // the recipe ingredients and cooking methods to determine alchemical properties

    // For now, use a simple mapping from dominant element to an alchemical property
    let dominantElement = this.getDominantElement(recipe);

    switch (dominantElement) {
      case 'Fire':
        return 'Spirit';
      case 'Water':
        return 'Essence';
      case 'Earth':
        return 'Matter';
      case 'Air':
        return 'Substance';
      default:
        return 'Spirit';
    }
  }

  scoreRecipe(recipe: any): number {
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();

    let count = 5; // Default value
    let topIngredients = getTopCompatibleItems(transformedIngredients, count);
    let topMethods = getTopCompatibleItems(transformedMethods, count);
    
    // Return a default score since implementation is incomplete
    return 0.5;
  }

  findCompatibleRecipes(recipes: any[], count = 5): any[] {
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();
    
    // Return empty array since implementation is incomplete
    return [];
  }

  scoreSingleRecipe(recipe: any): number {
    // Need to define recipes variable before using it
    let recipes = [recipe];
    
    // Create lookup maps for faster access
    let transformedIngredients = this.getTransformedIngredients();
    let transformedMethods = this.getTransformedCookingMethods();
    let transformedCuisines = this.getTransformedCuisines();

    let ingredientMap = new Map<string, AlchemicalItem>();
    transformedIngredients.forEach((item) => {
      ingredientMap.set(item.name.toLowerCase(), item);
    });

    let methodMap = new Map<string, AlchemicalItem>();
    transformedMethods.forEach((item) => {
      methodMap.set(item.name.toLowerCase(), item);
    });

    let cuisineMap = new Map<string, AlchemicalItem>();
    transformedCuisines.forEach((item) => {
      cuisineMap.set(item.name.toLowerCase(), item);
    });
    
    let finalScore = 0;
    
    // Basic implementation to prevent errors
    if (recipe && recipe.ingredients) {
      let ingredientMatch = 0;
      let ingredientCount = 0;
      
      recipe.ingredients.forEach((ingredient: any) => {
        if (ingredient && ingredient.name) {
          let ingredientName = ingredient.name.toLowerCase();
          let alchemicalIngredient = ingredientMap.get(ingredientName);
          
          if (alchemicalIngredient) {
            ingredientCount++;
            ingredientMatch += alchemicalIngredient.gregsEnergy || 0;
          }
        }
      });
      
      if (ingredientCount > 0) {
        finalScore = ingredientMatch /ingredientCount;
      }
    }
    
    return finalScore;
  }

  // Fix the isRecipeCompatible method
  isRecipeCompatible(recipe: any, threshold = 0.5): boolean {
    if (!recipe) return false;
    
    let currentMonth = new Date().getMonth();
    let compatible = false;
    
    // Check if season is compatible
    if (recipe.season) {
      let seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
      
      // Map months to seasons
      const monthToSeason: Record<number, string> = {
        0: 'winter',
        1: 'winter', // Jan, Feb
        2: 'spring',
        3: 'spring',
        4: 'spring', // Mar, Apr, May
        5: 'summer',
        6: 'summer',
        7: 'summer', // Jun, Jul, Aug
        8: 'fall',
        9: 'fall',
        10: 'fall', // Sep, Oct, Nov
        11: 'winter', // Dec
      };
      
      let currentSeason = monthToSeason[currentMonth];
      if (seasons.includes(currentSeason) || seasons.includes('all')) {
        compatible = true;
      }
    }
    
    // Add basic element check if elementalProperties exist
    if (recipe.elementalProperties) {
      let elements = recipe.elementalProperties;
      if (elements.Fire > threshold || elements.Water > threshold || 
          elements.Earth > threshold || elements.Air > threshold) {
        compatible = true;
      }
    }
    
    return compatible;
  }

  /**
   * Transforms astrological data into elemental properties
   * @param astroData Astrological data to transform
   * @returns Elemental properties (Fire, Water, Air, Earth)
   */
  transformAstroToElemental(astroData: any): Record<string, number> {
    if (!astroData) {
      logger.warn('No astrological data provided to transform');
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    try {
      // Extract celestial bodies data
      const celestialBodies = astroData?.tropical?.CelestialBodies;
      
      if (!celestialBodies) {
        logger.warn('No celestial bodies found in astrological data');
        return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      }
      
      // Process the celestial bodies to get elemental effects
      let elementalEffects = this.elementalCalculator.processCelestialBodies(celestialBodies);
      
      // Normalize the values to ensure they sum to 1.0
      const normalizedElements = this.elementalCalculator.normalizeElementalValues(elementalEffects);
      
      return normalizedElements;
    } catch (error) {
      logger.error('Error transforming astrological data to elemental properties', error);
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
  }

  /**
   * Gets the dominant element from astrological data
   * @param astroData Astrological data to analyze
   * @returns Dominant element (Fire, Water, Air, Earth)
   */
  getDominantElementFromAstro(astroData: any): string {
    if (!astroData) {
      return 'Fire'; // Default to Fire if no data
    }
    
    try {
      const elementalProperties = this.transformAstroToElemental(astroData);
      return this.elementalCalculator.getDominantElement(elementalProperties);
    } catch (error) {
      logger.error('Error determining dominant element', error);
      return 'Fire'; // Default to Fire on error
    }
  }

  /**
   * Calculates compatibility between two elemental properties
   * @param elements1 First set of elemental properties
   * @param elements2 Second set of elemental properties
   * @returns Compatibility score (0-1)
   */
  calculateElementalCompatibility(
    elements1: Record<string, number>,
    elements2: Record<string, number>
  ): number {
    if (!elements1 || !elements2) {
      return 0.5; // Default to moderate compatibility
    }
    
    try {
      // Calculate dot product of the two elemental vectors
      let dotProduct = 0;
      let magnitude1 = 0;
      let magnitude2 = 0;
      
      for (const element of ['Fire', 'Water', 'Earth', 'Air']) {
        const val1 = elements1[element] || 0;
        const val2 = elements2[element] || 0;
        
        dotProduct += val1 * val2;
        magnitude1 += val1 * val1;
        magnitude2 += val2 * val2;
      }
      
      // Prevent division by zero
      if (magnitude1 === 0 || magnitude2 === 0) {
        return 0.5;
      }
      
      // Calculate cosine similarity
      const similarity = dotProduct / ((Math.sqrt(magnitude1 || 1)) * Math.sqrt(magnitude2));
      
      // Convert to 0-1 scale (cosine similarity is -1 to 1)
      return (similarity + 1) / 2;
    } catch (error) {
      logger.error('Error calculating elemental compatibility', error);
      return 0.5; // Default to moderate compatibility on error
    }
  }
}
