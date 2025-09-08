import { ElementalItem, AlchemicalItem } from '../calculations/alchemicalTransformation';
import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { RulingPlanet } from '../constants/planets';
import {
  ZodiacSign,
  LunarPhase,
  PlanetaryAspect,
  LunarPhaseWithSpaces,
  CookingMethod,
} from '../types/alchemy';
import type { Recipe } from '../types/recipe';
import {
  transformIngredients,
  transformCookingMethods,
  transformCuisines,
  sortByAlchemicalCompatibility,
  filterByAlchemicalCompatibility,
  getTopCompatibleItems,
} from '../utils/alchemicalTransformationUtils';

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
  private currentZodiac: any | null = null;
  private lunarPhase: LunarPhase | null = null;
  private tarotElementBoosts?: Record<ElementalCharacter, number>;
  private tarotPlanetaryBoosts?: Record<string, number>;
  private aspects: PlanetaryAspect[] = [];

  /**
   * Initialize the service with data
   */
  constructor(
    ingredients: ElementalItem[] = [],
    cookingMethods: ElementalItem[] = [],
    cuisines: ElementalItem[] = [],
  ) {
    this.ingredients = ingredients;
    this.cookingMethods = cookingMethods;
    this.cuisines = cuisines;
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
  setCurrentZodiac(zodiac: any | null): void {
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
  setTarotElementBoosts(boosts: Record<ElementalCharacter, number> | undefined): void {
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
      this.lunarPhase as unknown as LunarPhaseWithSpaces,
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
      this.lunarPhase as unknown as LunarPhaseWithSpaces,
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
      this.lunarPhase as unknown as LunarPhaseWithSpaces,
    );
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
    const topCuisines = getTopCompatibleItems(transformedCuisines, count);

    // Determine overall dominant element and alchemical property
    // This is based on the first ingredients as they typically have the strongest influence
    const dominantElement = topIngredients.length > 0 ? topIngredients[0].dominantElement : 'Fire';

    const dominantAlchemicalProperty =
      topIngredients.length > 0 ? topIngredients[0].dominantAlchemicalProperty : 'Spirit';

    // Calculate average energy values across top ingredients
    const calculateAverage = (items: AlchemicalItem[], property: keyof AlchemicalItem): number => {
      if (items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + (item[property] as number), 0);
      return parseFloat((sum / items.length).toFixed(2));
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
    const recommendations = this.getRecommendations();

    // Get the transformed data we need for calculations
    const transformedIngredients = this.getTransformedIngredients();
    const transformedMethods = this.getTransformedCookingMethods();
    const transformedCuisines = this.getTransformedCuisines();

    // Create lookup maps for faster access
    const ingredientMap = new Map<string, AlchemicalItem>();
    transformedIngredients.forEach(item => {
      ingredientMap.set(item.name.toLowerCase(), item);
    });

    const methodMap = new Map<string, AlchemicalItem>();
    transformedMethods.forEach(item => {
      methodMap.set(item.name.toLowerCase(), item);
    });

    const cuisineMap = new Map<string, AlchemicalItem>();
    transformedCuisines.forEach(item => {
      cuisineMap.set(item.name.toLowerCase(), item);
    });

    // Score each recipe based on its compatibility with the current planetary conditions
    const scoredRecipes = recipes.map(recipe => {
      // Base compatibility score
      let compatibility = 0;

      // Ingredient compatibility
      let ingredientMatch = 0;
      let ingredientCount = 0;

      recipe.ingredients.forEach(ingredient => {
        const ingredientName = ingredient.name.toLowerCase();
        const alchemicalIngredient = ingredientMap.get(ingredientName);

        if (alchemicalIngredient) {
          ingredientCount++;
          ingredientMatch += alchemicalIngredient.gregsEnergy;
        }
      });

      const ingredientMatchScore = ingredientCount > 0 ? ingredientMatch / ingredientCount : 0;

      // Cooking method compatibility
      let methodMatch = 0;
      let methodCount = 0;

      const recipeData = recipe as unknown as any;
      const cookingMethods = (recipeData.cookingMethods as string[]) || [];
      cookingMethods.forEach((method: string) => {
        const methodName = method.toLowerCase();
        const alchemicalMethod = methodMap.get(methodName);

        if (alchemicalMethod) {
          methodCount++;
          methodMatch += alchemicalMethod.gregsEnergy;
        }
      });

      const cookingMethodScore = methodCount > 0 ? methodMatch / methodCount : 0;

      // Cuisine compatibility
      let cuisineMatch = 0;
      if (recipe.cuisine) {
        const cuisineName = recipe.cuisine.toLowerCase();
        const alchemicalCuisine = cuisineMap.get(cuisineName);

        if (alchemicalCuisine) {
          cuisineMatch = alchemicalCuisine.gregsEnergy;
        }
      }

      // Calculate seasonal score
      const seasonalScore = this.calculateSeasonalScore(recipe);

      // Calculate lunar phase score if available
      const lunarPhaseScore = this.lunarPhase ? this.calculateLunarPhaseScore(recipe) : 0;

      // Calculate zodiac score if available
      const zodiacScore = this.currentZodiac ? this.calculateZodiacScore(recipe) : 0;

      // Overall alchemical score is a weighted average of ingredient, method, and cuisine scores
      const alchemicalScore =
        ingredientMatchScore * 0.6 + cookingMethodScore * 0.3 + cuisineMatch * 0.1;

      // Combine all scores for overall compatibility
      compatibility =
        alchemicalScore * 0.5 + seasonalScore * 0.3 + lunarPhaseScore * 0.1 + zodiacScore * 0.1;

      // Determine dominant element and alchemical property for this recipe
      const dominantElement = this.getDominantElement(recipe);
      const dominantAlchemicalProperty = this.getDominantAlchemicalProperty(recipe);

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
    const sortedRecipes = scoredRecipes.sort((a, b) => b.compatibility - a.compatibility);

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
    count = 5,
  ): AlchemicalRecommendations {
    const transformedIngredients = this.getTransformedIngredients();
    const transformedMethods = this.getTransformedCookingMethods();
    const transformedCuisines = this.getTransformedCuisines();

    const filteredIngredients = filterByAlchemicalCompatibility(
      transformedIngredients,
      targetElement,
      targetAlchemicalProperty,
    );

    const filteredMethods = filterByAlchemicalCompatibility(
      transformedMethods,
      targetElement,
      targetAlchemicalProperty,
    );

    const filteredCuisines = filterByAlchemicalCompatibility(
      transformedCuisines,
      targetElement,
      targetAlchemicalProperty,
    );

    const topIngredients = getTopCompatibleItems(filteredIngredients, count);
    const topMethods = getTopCompatibleItems(filteredMethods, count);
    const topCuisines = getTopCompatibleItems(filteredCuisines, count);

    // Use provided targets or default to first ingredient
    const dominantElement =
      targetElement || (topIngredients.length > 0 ? topIngredients[0].dominantElement : 'Fire');

    const dominantAlchemicalProperty =
      targetAlchemicalProperty ||
      (topIngredients.length > 0 ? topIngredients[0].dominantAlchemicalProperty : 'Spirit');

    // Calculate average energy values
    const calculateAverage = (items: AlchemicalItem[], property: keyof AlchemicalItem): number => {
      if (items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + (item[property] as number), 0);
      return parseFloat((sum / items.length).toFixed(2));
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

    const currentMonth = new Date().getMonth();
    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];

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

    const currentSeason = monthToSeason[currentMonth];
    if (seasons.includes(currentSeason) || seasons.includes('all')) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to calculate lunar phase score for a recipe
  private calculateLunarPhaseScore(recipe: Recipe): number {
    const recipeData = recipe as unknown as any;
    const astrologicalAffinities = recipeData.astrologicalAffinities as unknown;
    const lunarPhases = (astrologicalAffinities.lunarPhases as string[]) || [];

    if (lunarPhases.length === 0 || !this.lunarPhase) {
      return 0.5;
    }

    const lunarPhaseLower = this.lunarPhase.toLowerCase();

    // Check if the recipe's lunar phases include the current lunar phase
    const lunarPhasesLower = lunarPhases.map((phase: string) => phase.toLowerCase());

    if (lunarPhasesLower.includes(lunarPhaseLower)) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to calculate zodiac score for a recipe
  private calculateZodiacScore(recipe: Recipe): number {
    const recipeData = recipe as unknown as any;
    const astrologicalAffinities = recipeData.astrologicalAffinities as unknown;
    const signs = (astrologicalAffinities.signs as string[]) || [];

    if (signs.length === 0 || !this.currentZodiac) {
      return 0.5;
    }

    const zodiacLower = this.currentZodiac.toLowerCase();

    // Check if the recipe's zodiac signs include the current zodiac sign
    const zodiacSigns = signs.map((sign: string) => sign.toLowerCase());

    if (zodiacSigns.includes(zodiacLower)) {
      return 0.8;
    }

    return 0.3;
  }

  // Helper method to determine the dominant element for a recipe
  private getDominantElement(recipe: Recipe): ElementalCharacter {
    if (!recipe.elementalProperties) return 'Fire';

    const elements = recipe.elementalProperties;
    const dominantValue = Math.max(
      elements.Fire || 0,
      elements.Water || 0,
      elements.Earth || 0,
      elements.Air || 0,
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
    const dominantElement = this.getDominantElement(recipe);

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
}
