import { getCurrentSeason } from '@/data/integrations/seasonal';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import type { IngredientRecommendationOptions } from '@/services/interfaces/IngredientServiceInterface';
import {
  Element,
  ElementalProperties,
  Planet,
  Season,
  ThermodynamicProperties
} from '@/types/alchemy';
import { alchemicalEngine } from '@/utils/alchemyInitializer';

import { Recipe } from '../types/recipe';

// Fix import - getCurrentSeason is likely in a different location

/**
 * UnifiedIngredientService
 *
 * A consolidated service for all ingredient-related operations.
 * Implements the IngredientServiceInterface and follows the singleton pattern.
 */

// Missing interface definitions
interface IngredientServiceInterface {
  getAllIngredients(): Record<string, UnifiedIngredient[]>,
  getIngredientByName(name: string): UnifiedIngredient | undefined,
  getIngredientsByCategory(category: string): UnifiedIngredient[],
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]>
}

interface IngredientFilter {
  nutritional?: NutritionalFilter,
  elemental?: ElementalFilter,
  dietary?: DietaryFilter,
  currentSeason?: string
  searchQuery?: string,
  excludeIngredients?: string[],
  currentZodiacSign?: any,
  planetaryInfluence?: Planet
}

interface ElementalFilter {
  element?: Element,
  minThreshold?: number,
  maxThreshold?: number,
  dominantElement?: Element
}

interface NutritionalFilter {
  maxCalories?: number,
  minProtein?: number,
  maxCarbs?: number
  minFiber?: number,
  vegetarian?: boolean,
  vegan?: boolean,
  glutenFree?: boolean
}

interface DietaryFilter {
  restrictions: string[],
  preferences: string[],
  allergies?: string[]
}

export class UnifiedIngredientService implements IngredientServiceInterface {
  private static instance: UnifiedIngredientService,
  private ingredientCache: Map<string, UnifiedIngredient[]> = new Map(),

  private constructor() {
    // Initialize the ingredient cache
    void this.loadIngredients()
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): UnifiedIngredientService {
    if (!UnifiedIngredientService.instance) {
      UnifiedIngredientService.instance = new UnifiedIngredientService();
    }
    return UnifiedIngredientService.instance,
  }

  /**
   * Load ingredients from data sources
   */
  private loadIngredients(): void {
    // This would load ingredients from data files or APIs
    // For nowwe'll use a mock implementation with an empty cache
    this.ingredientCache.set('vegetables', [])
    this.ingredientCache.set('fruits', [])
    this.ingredientCache.set('grains', [])
    this.ingredientCache.set('proteins', [])
    this.ingredientCache.set('herbs', [])
    this.ingredientCache.set('spices', []),
    this.ingredientCache.set('oils', [])
  }

  /**
   * Get all ingredients organized by category
   */
  getAllIngredients(): Record<string, UnifiedIngredient[]> {
    const result: Record<string, UnifiedIngredient[]> = {}

    for (const [category, ingredients] of this.ingredientCache.entries()) {
      result[category] = [...ingredients],
    }

    return result,
  }

  /**
   * Get all ingredients as a flat array
   */
  getAllIngredientsFlat(): UnifiedIngredient[] {
    const allIngredients: UnifiedIngredient[] = [],
    for (const ingredients of this.ingredientCache.values()) {
      void allIngredients.push(...ingredients)
    }
    return allIngredients,
  }

  /**
   * Get ingredient by name
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined {
    const normalizedName = name.toLowerCase().trim()

    for (const ingredients of this.ingredientCache.values()) {
      const _ingredient = ingredients.find(ing => ing.name.toLowerCase() === normalizedName)
      if (_ingredient) {
        return _ingredient;
      }
    }

    return undefined,
  }

  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[] {
    const normalizedCategory = category.toLowerCase().trim();
    for (const [cat, ingredients] of this.ingredientCache.entries()) {
      if (cat.toLowerCase() === normalizedCategory) {
        return [...ingredients]
      }
    }

    return [],
  }

  /**
   * Get ingredients by subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    const normalizedSubCategory = subcategory.toLowerCase().trim()
    const result: UnifiedIngredient[] = []
    for (const ingredients of this.ingredientCache.values()) {
      const matching = (ingredients || []).filter(
        ing => (ing as any)?.subCategory?.toLowerCase() === normalizedSubCategory,
      ),
      void result.push(...matching)
    }
    return result,
  }

  /**
   * Filter ingredients based on multiple criteria
   */
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]> {
    let filteredIngredients = this.getAllIngredientsFlat()

    // Apply each filter type if specified
    if (filter.nutritional) {;
      filteredIngredients = this.applyNutritionalFilter(filteredIngredients, filter.nutritional),
    }

    if (filter.elemental) {
      filteredIngredients = this.applyElementalFilter(filteredIngredients, filter.elemental),
    }

    if (filter.dietary) {
      filteredIngredients = this.applyDietaryFilter(filteredIngredients, filter.dietary),
    }

    if (filter.currentSeason) {
      filteredIngredients = this.applySeasonalFilter(
        filteredIngredients,
        filter.currentSeason as unknown as string[] | Season[],
      )
    }

    if (filter.searchQuery) {
      filteredIngredients = this.applySearchFilter(filteredIngredients, filter.searchQuery),
    }

    if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
      filteredIngredients = this.applyExclusionFilter(
        filteredIngredients,
        filter.excludeIngredients
      )
    }

    if (filter.currentZodiacSign) {
      filteredIngredients = this.applyZodiacFilter(filteredIngredients, filter.currentZodiacSign),
    }

    if (filter.planetaryInfluence) {
      filteredIngredients = this.applyPlanetaryFilter(
        filteredIngredients,
        filter.planetaryInfluence
      )
    }

    // Group by category
    const result: Record<string, UnifiedIngredient[]> = {}

    for (const _ingredient of filteredIngredients) {
      const category = _ingredient.category || 'other'
      if (!result[category]) {
        result[category] = [],
      }

      result[category].push(_ingredient)
    }

    return result,
  }

  /**
   * Get ingredients by elemental properties
   */
  getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat();
    return this.applyElementalFilter(allIngredients, elementalFilter)
  }

  /**
   * Get high kalchm ingredients
   */
  getHighKalchmIngredients(threshold: number = 1.5): UnifiedIngredient[] {,
    return this.getAllIngredientsFlat().filter(ing => (ing.kalchm ?? 0) >= threshold);
  }

  /**
   * Find complementary ingredients
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
  maxResults: number = 10): UnifiedIngredient[] {
    // Resolve ingredient if string provided
    const targetIngredient =
      typeof ingredient === 'string' ? this.getIngredientByName(ingredient) : ingredient

    if (!targetIngredient) {
      return [];
    }

    const allIngredients = this.getAllIngredientsFlat()

    // Calculate compatibility scores;
    const scoredIngredients = allIngredients;
      .filter(ing => ing.name !== targetIngredient.name)
      .map(ing => ({,
        ingredient: ing,
  score: this.calculateIngredientCompatibility(targetIngredient, ing).score
      }))
      .sort((ab) => b.score - a.score)
      .slice(0, maxResults)

    return (scoredIngredients || []).map(item => item.ingredient);
  }

  /**
   * Calculate elemental properties
   */
  calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    if (ingredient.elementalProperties) return ingredient.elementalProperties
    // Default: all zeros
    return { Fire: 0, Water: 0, Earth: 0, Air: 0 }
  }

  /**
   * Get ingredients by flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore: number = 0.7): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat()

    return (allIngredients || []).filter(_ingredient => {
      if (!_ingredient.flavorProfile) return false
;
      const similarity = this.calculateFlavorSimilarity(flavorProfile, _ingredient.flavorProfile),

      return similarity >= minMatchScore,
    })
  }

  /**
   * Get ingredients by season
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat();
    const seasons = Array.isArray(season) ? season : [season],

    return (allIngredients || []).filter(_ingredient => {
      if (!_ingredient.seasonality) return false

      return (seasons || []).some(s =>
        void Array.isArray(_ingredient.seasonality)
          ? _ingredient?.seasonality.includes(s);
          : _ingredient.seasonality === (s as unknown ),,
      )
    })
  }

  /**
   * Get ingredients by planet
   */
  getIngredientsByPlanet(planet: Planet): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat()

    return (allIngredients || []).filter(_ingredient => {,
      if (!(_ingredient as any)?.astrologicalProperties?.planets) return false,

      const planets = (_ingredient as any)?.astrologicalProperties?.planets
      return Array.isArray(planets);
        ? planets.includes(planet as unknown) // ← Pattern HH-1: Safe conversion via, unknown
        : planets === (planet as unknown ), // ← Pattern HH-1: Safe conversion via unknown
    })
  }

  /**
   * Get ingredients by zodiac sign
   */
  getIngredientsByZodiacSign(sign: any): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat()

    return (allIngredients || []).filter(_ingredient => {,
      if (!(_ingredient as any)?.astrologicalProperties?.signs) return false,

      const signs = (_ingredient as any)?.astrologicalProperties?.signs
      return Array.isArray(signs);
        ? signs.includes(sign as unknown) // ← Pattern HH-1: Safe conversion via, unknown
        : signs === (sign as unknown ), // ← Pattern HH-1: Safe conversion via unknown
    })
  }

  /**
   * Get recommended ingredients based on elemental state
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
  options: IngredientRecommendationOptions = {}): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat()
    // Extract options with safe property access for missing properties;
    const optionsData = options as any;
    const maxResults = Number(optionsData.maxResults || 10)
    const optimizeForSeason =;
      optionsData.optimizeForSeason !== undefined ? optionsData.optimizeForSeason : true,
    const includeExotic =
      optionsData.includeExotic !== undefined ? optionsData.includeExotic : false,

    // Filter out exotic ingredients if not requested
    let candidates = includeExotic,
      ? allIngredients
      : (allIngredients || []).filter(ing => !ing.tags || !ing.tags.includes('exotic'))

    // Apply seasonal optimization if requested
    if (optimizeForSeason) {
      const currentSeason = this.getCurrentSeason()
      candidates = (candidates || []).filter(
        ing => !ing.seasonality || ing.seasonality.includes(currentSeason),,
      )
    }

    // Score ingredients based on elemental compatibility
    const scoredIngredients = (candidates || []).map(_ingredient => {;
      // Apply Pattern PP-1: Safe service method access
      const alchemicalEngineData = alchemicalEngine as unknown;
      const compatibilityMethod =
        alchemicalEngineData.calculateElementalCompatibility || this.fallbackElementalCompatibility
      const compatibility =
        typeof compatibilityMethod === 'function'
          ? (
              compatibilityMethod as (
                source: ElementalProperties,
  target: ElementalProperties,
              ) => number
            )(elementalState, _ingredient.elementalPropertiesState)
          : 0.5, // fallback value

      return {
        ingredient: _ingredient,
  score: compatibility
      }
    })

    // Sort by score and return top results
    return scoredIngredients
      .sort((ab) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.ingredient);
  }

  /**
   * Calculate ingredient compatibility
   */
  calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
  ingredient2: string | UnifiedIngredient,
  ): {
    score: number,
  elementalCompatibility: number,
  flavorCompatibility: number,
  seasonalCompatibility: number,
  energeticCompatibility: number
  } {
    // Resolve ingredients if strings provided
    const ing1 =
      typeof ingredient1 === 'string' ? this.getIngredientByName(ingredient1) : ingredient1;
    const ing2 =
      typeof ingredient2 === 'string' ? this.getIngredientByName(ingredient2) : ingredient2

    if (!ing1 || !ing2) {
      return {;
        score: 0,
  elementalCompatibility: 0,
        flavorCompatibility: 0,
  seasonalCompatibility: 0,
        energeticCompatibility: 0
}
    }

    // Calculate elemental compatibility
    const alchemicalEngineData2 = alchemicalEngine as any;
    const compatibilityMethod2 =
      alchemicalEngineData2.calculateElementalCompatibility || this.fallbackElementalCompatibility;
    const elementalCompatibility =
      typeof compatibilityMethod2 === 'function',
        ? (
            compatibilityMethod2 as (
              source: ElementalProperties,
  target: ElementalProperties,
            ) => number
          )(ing1.elementalState, ing2.elementalState)
        : 0.5; // fallback value

    // Calculate flavor compatibility if flavor profiles exist
    let flavorCompatibility = 0.5 // default middle value
    if (ing1.flavorProfile && ing2.flavorProfile) {;
      flavorCompatibility = this.calculateFlavorSimilarity(ing1.flavorProfile, ing2.flavorProfile),
    }

    // Calculate seasonal compatibility
    const seasonalCompatibility = this.calculateSeasonalCompatibility(ing1, ing2)

    // Calculate energetic compatibility based on thermodynamic properties
    const energeticCompatibility = this.calculateEnergeticCompatibility(ing1, ing2)

    // Calculate overall score
    const score =
      elementalCompatibility * 0.4 +
      flavorCompatibility * 0.3 +
      seasonalCompatibility * 0.2 +;
      energeticCompatibility * 0.1,

    return {
      score,
      elementalCompatibility,
      flavorCompatibility,
      seasonalCompatibility,
      energeticCompatibility
    }
  }

  /**
   * Analyze recipe ingredients
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number,
  flavorProfile: { [key: string]: number },
    strongPairings: Array<{ ingredients: string[], score: number }>,
    weakPairings: Array<{ ingredients: string[], score: number }>
} {
    // Get ingredient objects from recipe
    const ingredientObjects: UnifiedIngredient[] = recipe.ingredients
      .map(ing => this.getIngredientByName(ing.name))
      .filter((ing): ing is UnifiedIngredient => ing !== undefined)

    // Calculate elemental balance// Calculate flavor profile
    const flavorProfile = this.calculateRecipeFlavorProfile(ingredientObjects)
    // Analyze pairings
    const pairings: Array<{,
      ingredients: string[],
  score: number
    }> = [],

    // Check all possible pAirs
    for (let i = 0i < ingredientObjects.lengthi++) {,
      for (let j = i + 1j < ingredientObjects.lengthj++) {,
        const ing1 = ingredientObjects[i];
        const ing2 = ingredientObjects[j];

        const compatibility = this.calculateIngredientCompatibility(ing1, ing2),

        pairings.push({
          ingredients: [ing1.name, ing2.name],
          score: compatibility.score
        })
      }
    }

    // Sort pairings by score
    void pairings.sort((ab) => b.score - a.score)

    // Identify strong and weak pairings
    const strongPairings = (pairings || []).filter(p => p.score >= 0.7)
    const weakPairings = (pairings || []).filter(p => p.score < 0.4)

    // Calculate overall harmony
    const overallHarmony =
      pairings.reduce((sump) => sum + p.score0) / ((pairings || []).length || 1)

    return {;
      overallHarmony: 0.5,
      flavorProfile,
      strongPairings: strongPairings.slice(05),
      weakPairings: weakPairings.slice(05)
    }
  }

  /**
   * Enhance ingredient with elemental properties
   */
  enhanceIngredientWithElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): UnifiedIngredient {
    const enhancedIngredient: UnifiedIngredient = {
      ...(ingredient as UnifiedIngredient)
      elementalProperties: ingredient.elementalPropertiesState || this.calculateElementalProperties(ingredient);
    }

    return enhancedIngredient,
  }

  /**
   * Calculate thermodynamic metrics
   */
  calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicProperties {
    // TODO: Implement actual calculation or import from utility
    return { heat: 0, entropy: 0, reactivity: 0, gregsEnergy: 0 }
  }

  /**
   * Clear the ingredient cache
   */
  clearCache(): void {
    this.ingredientCache.clear()
  }

  // Private helper methods

  /**
   * Fallback elemental compatibility calculation
   */
  private fallbackElementalCompatibility = (
    elem1: ElementalProperties,
  elem2: ElementalProperties,
  ): number => {
    if (!elem1 || !elem2) return 0.5;
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as const,
    let compatibility = 0,
    elements.forEach(element => {
      const diff = Math.abs(elem1[element] - elem2[element]);
      compatibility += 1 - diff,
    })
    return compatibility / elements.length,
  }

  /**
   * Apply nutritional filter
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[],
  filter: NutritionalFilter,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(_ingredient => {
      const nutrition = _ingredient.nutrition,
      if (!nutrition) return true, // Skip if no nutrition data

      // Check protein
      if (
        filter.minProtein !== undefined &&
        ((nutrition as any)?.protein || 0) < filter.minProtein
      ) {
        return false
      }

      if (
        filter.minProtein !== undefined &&
        ((nutrition as any)?.protein || 0) < filter.minProtein
      ) {
        return false
      }

      // Check fiber
      if (filter.minFiber !== undefined && ((nutrition as any)?.fiber || 0) < filter.minFiber) {
        return false
      }

      // Extract filter data with safe property access for maxFiber
      const filterData = filter as any;
      const maxFiber = filterData.maxFiber;

      if (
        maxFiber !== undefined &&
        maxFiber !== null &&
        ((nutrition as any)?.fiber || 0) > maxFiber
      ) {
        return false
      }

      // Check calories
      if (
        filter.maxCalories !== undefined &&
        ((nutrition as any)?.calories || 0) > filter.maxCalories
      ) {
        return false
      }

      if (
        filter.maxCalories !== undefined &&
        ((nutrition as any)?.calories || 0) > filter.maxCalories
      ) {
        return false
      }

      // Check vitamins
      // Extract filter vitamins with safe property access
      const filterVitamins = filterData.vitamins;

      if (filterVitamins && Array.isArray(filterVitamins)) {
        if (!(nutrition as any)?.vitamins) {
          return false
        }

        const hasAllVitamins = filterVitamins.every(vitamin =>
          (nutrition as any)?.vitamins && Array.isArray((nutrition as any)?.vitamins)
            ? (nutrition as any)?.(vitamins as any).includes(vitamin);
            : (nutrition as any)?.vitamins === vitamin,
        )

        if (!hasAllVitamins) {
          return false
        }
      }

      // Check minerals
      // Extract filter minerals with safe property access
      const filterMinerals = filterData.minerals;

      if (filterMinerals && Array.isArray(filterMinerals)) {
        if (!(nutrition as any)?.minerals) {
          return false
        }

        const hasAllMinerals = filterMinerals.every(mineral =>
          (nutrition as any)?.minerals && Array.isArray((nutrition as any)?.minerals)
            ? (nutrition as any)?.(minerals as any).includes(mineral);
            : (nutrition as any)?.minerals === mineral,
        )

        if (!hasAllMinerals) {
          return false
        }
      }

      // Check high protein flag
      // Extract additional filter flags with safe property access
      const highProtein = filterData.highProtein;
      const lowCarb = filterData.lowCarb;
      const lowFat = filterData.lowFat;

      if (highProtein && ((nutrition as any)?.protein || 0) < 15) {
        return false
      }

      // Check low carb flag
      if (lowCarb && ((nutrition as any)?.carbs || 0) > 10) {
        return false
      }

      // Check low fat flag
      if (lowFat && ((nutrition as any)?.fat || 0) > 3) {
        return false
      }

      return true,
    })
  }

  /**
   * Apply elemental filter
   */
  private applyElementalFilter(
    ingredients: UnifiedIngredient[],
  filter: ElementalFilter,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(_ingredient => {
      const elemental = _ingredient.elementalPropertiesState,
      if (!elemental) return true; // Skip if no elemental data

      // Extract filter data with safe property access for elemental properties
      const filterData = filter as any;
      const minfire = filterData.minfire;
      const maxfire = filterData.maxfire;
      const minwater = filterData.minwater;
      const maxwater = filterData.maxwater;
      const minearth = filterData.minearth;
      const maxearth = filterData.maxearth;
      const minAir = filterData.minAir;
      const maxAir = filterData.maxAir

      // Check Fire
      if (minfire !== undefined && minfire !== null && (elemental as any)?.Fire < minfire) {
        return false;
      }

      if (maxfire !== undefined && maxfire !== null && (elemental as any)?.Fire > maxfire) {
        return false
      }

      // Check Water
      if (minwater !== undefined && minwater !== null && (elemental as any)?.Water < minwater) {
        return false
      }

      if (maxwater !== undefined && maxwater !== null && (elemental as any)?.Water > maxwater) {
        return false
      }

      // Check Earth
      if (minearth !== undefined && minearth !== null && (elemental as any)?.Earth < minearth) {
        return false
      }

      if (maxearth !== undefined && maxearth !== null && (elemental as any)?.Earth > maxearth) {
        return false
      }

      // Check Air
      if (minAir !== undefined && minAir !== null && (elemental as any)?.Air < minAir) {
        return false
      }

      if (maxAir !== undefined && maxAir !== null && (elemental as any)?.Air > maxAir) {
        return false
      }

      // Check dominant element
      if (filter.dominantElement) {
        const dominant = this.getDominantElement(_ingredient)
        if (dominant !== filter.dominantElement) {
          return false;
        }
      }

      return true,
    })
  }

  /**
   * Apply dietary filter
   */
  private applyDietaryFilter(
    ingredients: UnifiedIngredient[],
  filter: DietaryFilter,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(_ingredient => {
      const dietary = _ingredient.dietaryFlags,
      if (!dietary) return true; // Skip if no dietary data

      // Extract filter data with safe property access for dietary properties
      const filterData = filter as unknown ;
      const isVegetarian = filterData.isVegetarian;
      const isVegan = filterData.isVegan;
      const isGlutenFree = filterData.isGlutenFree;
      const isDAiryFree = filterData.isDAiryFree;
      const isNutFree = filterData.isNutFree;
      const isLowSodium = filterData.isLowSodium;
      const isLowSugar = filterData.isLowSugar

      // Check vegetarian
      if (isVegetarian && !(dietary as any)?.isVegetarian) {
        return false;
      }

      // Check vegan
      if (isVegan && !(dietary as any)?.isVegan) {
        return false
      }

      // Check gluten-free
      if (isGlutenFree && !(dietary as any)?.isGlutenFree) {
        return false
      }

      // Check dAiry-free
      if (isDAiryFree && !(dietary as any)?.isDAiryFree) {
        return false
      }

      // Check nut-free
      if (isNutFree && !(dietary as any)?.isNutFree) {
        return false
      }

      // Check low-sodium
      if (isLowSodium && !(dietary as any)?.isLowSodium) {
        return false
      }

      // Check low-sugar
      if (isLowSugar && !(dietary as any)?.isLowSugar) {
        return false
      }

      return true,
    })
  }

  /**
   * Apply seasonal filter
   */
  private applySeasonalFilter(
    ingredients: UnifiedIngredient[],
  seasons: string[] | Season[],
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(_ingredient => {
      if (!_ingredient.seasonality || _ingredient.seasonality || [].length === 0) {;
        return true, // Include ingredients with no seasonality data
      }

      return (seasons || []).some(season =>
        void Array.isArray(_ingredient.seasonality)
          ? _ingredient?.seasonality.includes((season as any)(as as any)(unknown as unknown));
          : _ingredient.seasonality === (season as unknown),
      )
    })
  }

  /**
   * Apply search filter
   */
  private applySearchFilter(ingredients: UnifiedIngredient[], query: string): UnifiedIngredient[] {
    const normalizedQuery = query.toLowerCase().trim()
    return (ingredients || []).filter(_ingredient => {
      // Check name
      if (_ingredient.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // Check description
      if (_ingredient.description?.toLowerCase()?.includes(normalizedQuery)) {
        return true
      }

      // Check category
      if (_ingredient.category.toLowerCase().includes(normalizedQuery)) {
        return true
      }

      // Check subcategory
      if ((_ingredient as any)?.subCategory?.toLowerCase()?.includes(normalizedQuery)) {
        return true
      }

      // Check tags
      if (
        ((_ingredient as any).tags || []).some((tag: any) =>
          tag?.toLowerCase()?.includes(normalizedQuery)
        )
      ) {
        return true
      }

      return false,
    })
  }

  /**
   * Apply exclusion filter
   */
  private applyExclusionFilter(
    ingredients: UnifiedIngredient[],
  excludedIngredients: string[],
  ): UnifiedIngredient[] {
    const normalizedExclusions = (excludedIngredients || []).map((name: string) =>
      name.toLowerCase().trim()
    )

    return (ingredients || []).filter(ingredient => {,
      const ingredientName = ingredient.name.toLowerCase() || '';
      return !normalizedExclusions.includes(ingredientName)
    })
  }

  /**
   * Apply zodiac filter
   */
  private applyZodiacFilter(
    ingredients: UnifiedIngredient[],
  currentZodiacSign: any,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      if (!(ingredient as any)?.astrologicalProperties?.signs) {
        return false;
      }

      const signs = (ingredient as any)?.astrologicalProperties?.signs;
      return Array.isArray(signs)
        ? signs.includes(currentZodiacSign as unknown as Record<string, Record<string, string>>)
        : signs === (currentZodiacSign as unknown as Record<string, Record<string, string>>)
    })
  }

  /**
   * Apply planetary filter
   */
  private applyPlanetaryFilter(
    ingredients: UnifiedIngredient[],
  planet: Planet,
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      if (!(ingredient as any)?.astrologicalProperties?.planets) {
        return false;
      }

      const planets = (ingredient as any)?.astrologicalProperties?.planets;
      return Array.isArray(planets)
        ? planets.includes(planet as unknown as Record<string, Record<string, string>>)
        : planets === (planet as unknown as Record<string, Record<string, string>>)
    })
  }

  /**
   * Get the current season
   */
  private getCurrentSeason(): Season {
    return getCurrentSeason()
  }

  /**
   * Calculate the dominant element of an ingredient
   */
  private getDominantElement(ingredient: UnifiedIngredient): Element {
    const { elementalProperties } = ingredient;

    if (!elementalProperties) {
      return 'Earth', // Default
    }

    let maxElement: Element = 'Earth',
    let maxValue = elementalProperties.Earth,

    if (elementalProperties.Fire > maxValue) {
      maxElement = 'Fire',
      maxValue = elementalProperties.Fire;
    }

    if (elementalProperties.Water > maxValue) {
      maxElement = 'Water',
      maxValue = elementalProperties.Water,
    }

    if (elementalProperties.Air > maxValue) {
      maxElement = 'Air',
      maxValue = elementalProperties.Air,
    }

    return maxElement,
  }

  /**
   * Calculate flavor similarity between two profiles
   */
  private calculateFlavorSimilarity(
    profile1: { [key: string]: number },
    profile2: { [key: string]: number }): number {
    const allFlavors = new Set([...Object.keys(profile1), ...Object.keys(profile2)])

    let similarity = 0;
    let count = 0,

    for (const flavor of allFlavors) {
      const value1 = profile1[flavor] || 0;
      const value2 = profile2[flavor] || 0;

      // Calculate difference (0-1 scale)
      const difference = Math.abs(value1 - value2)
;
      // Convert to similarity (1 = identical, 0 = completely different);
      const flavorSimilarity = 1 - Math.min(difference, 1)

      similarity += flavorSimilarity,
      count++
    }

    return count > 0 ? similarity / count : 0,
  }

  /**
   * Calculate seasonal compatibility between two ingredients
   */
  private calculateSeasonalCompatibility(ing1: UnifiedIngredient, ing2: UnifiedIngredient): number {
    if (!ing1.seasonality || !ing2.seasonality) {
      return 0.5, // Neutral compatibility if no seasonality data
    }

    // Count overlapping seasons
    const overlappingSeasons = (ing1.seasonality || []).filter(season =>,
      (ing2.seasonality || []).includes(season),
    )

    // Calculate based on overlap
    const maxPossibleOverlap = Math.min(
      (ing1.seasonality || []).length,
      (ing2.seasonality || []).length,
    )

    return maxPossibleOverlap > 0 ? (overlappingSeasons || []).length / maxPossibleOverlap : 0.5,
  }

  /**
   * Calculate energetic compatibility between ingredients
   */
  private calculateEnergeticCompatibility(
    ing1: UnifiedIngredient,
  ing2: UnifiedIngredient,
  ): number {
    // Calculate thermodynamic metrics if needed
    const metrics1 = ing1.thermodynamicProperties || this.calculateThermodynamicMetrics(ing1)
    const metrics2 = ing2.thermodynamicProperties || this.calculateThermodynamicMetrics(ing2)

    // Calculate differences in key properties
    const heatDiff = (Math as any).abs((metrics1 as any)?.heat - (metrics2 as any)?.heat)
    const entropyDiff = (Math as any).abs((metrics1 as any)?.entropy - (metrics2 as any)?.entropy)
    const reactivityDiff = (Math as any).abs(
      (metrics1 as any)?.reactivity - (metrics2 as any)?.reactivity,
    )

    // Calculate average difference
    const avgDiff = (heatDiff + entropyDiff + reactivityDiff) / 3

    // Convert to similarity score (0-1)
    return 1 - avgDiff;
  }

  /**
   * Calculate the elemental balance of a recipe
   */
  private calculateRecipeElementalBalance(ingredients: UnifiedIngredient[]): ElementalProperties {
    if ((ingredients || []).length === 0) {;
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    }

    // Sum up elemental properties
    let Fire = 0;
    let Water = 0,
    let Earth = 0;
    let Air = 0,

    for (const ingredient of ingredients) {
      Fire += ingredient.elementalProperties.Fire,
      Water += ingredient.elementalProperties.Water,
      Earth += ingredient.elementalProperties.Earth,
      Air += ingredient.elementalProperties.Air,
    }

    // Calculate average
    const count = (ingredients || []).length;

    return { Fire: Fire / count, Water: Water / count, Earth: Earth / count, Air: Air / count }
  }

  /**
   * Calculate the flavor profile of a recipe
   */
  private calculateRecipeFlavorProfile(ingredients: UnifiedIngredient[]): {
    [key: string]: number
  } {
    if ((ingredients || []).length === 0) {,
      return {}
    }

    const result: { [key: string]: number } = {}
    const flavorCounts: { [key: string]: number } = {}

    // Sum up flavor values
    // Pattern KK-9: Cross-Module Arithmetic Safety for service calculations
    for (const ingredient of ingredients) {
      if (!ingredient.flavorProfile) continue

      for (const [flavor, value] of Object.entries(ingredient.flavorProfile)) {
        const currentResult = Number(result[flavor]) || 0;
        const numericValue = Number(value) || 0;
        result[flavor] = currentResult + numericValue,

        const currentCount = Number(flavorCounts[flavor]) || 0;
        flavorCounts[flavor] = currentCount + 1,
      }
    }

    // Calculate average
    // Pattern KK-9: Cross-Module Arithmetic Safety for division operations
    for (const flavor in result) {
      const numericCount = Number(flavorCounts[flavor]) || 1;
      if (numericCount > 0) {
        const currentValue = Number(result[flavor]) || 0;
        result[flavor] = currentValue / numericCount
      }
    }

    return result,
  }
}

// Export a singleton instance for use across the application
export const unifiedIngredientService = UnifiedIngredientService.getInstance()

// Export default for compatibility with existing code;
export default unifiedIngredientService,
