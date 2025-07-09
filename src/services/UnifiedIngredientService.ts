import { 
  ElementalProperties, 
  ThermodynamicProperties,
  Season,
  PlanetName,
  ZodiacSign,
  Element,
  RecipeIngredient
} from '../types';

import { UnifiedIngredient } from '../types/ingredient';
import { Recipe } from '../types/recipe';
// Fix import - getCurrentSeason is likely in a different location
import { getCurrentSeason as getSeasonFromUtils } from '@/utils/dateUtils';
import { alchemicalEngine } from '@/utils/alchemyInitializer';

/**
 * UnifiedIngredientService
 * 
 * A consolidated service for all ingredient-related operations.
 * Implements the IngredientServiceInterface and follows the singleton pattern.
 */

// Missing interface definitions
export interface IngredientServiceInterface {
  getAllIngredients(): Record<string, UnifiedIngredient[]>;
  getIngredientByName(name: string): UnifiedIngredient | undefined;
  getIngredientsByCategory(category: string): UnifiedIngredient[];
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]>;
}

export interface IngredientFilter {
  nutritional?: NutritionalFilter;
  elemental?: ElementalFilter;
  dietary?: DietaryFilter;
  currentSeason?: string;
  searchQuery?: string;
  excludeIngredients?: string[];
  currentZodiacSign?: ZodiacSign;
  planetaryInfluence?: PlanetName;
}

export interface ElementalFilter {
  element?: Element;
  minThreshold?: number;
  maxThreshold?: number;
  dominantElement?: Element;
  // Extended properties for elemental filtering
  minfire?: number;
  maxfire?: number;
  minwater?: number;
  maxwater?: number;
  minearth?: number;
  maxearth?: number;
  minAir?: number;
  maxAir?: number;
}

export interface NutritionalFilter {
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  minFiber?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  // Extended properties for nutritional filtering
  maxFiber?: number;
  vitamins?: string[];
  minerals?: string[];
  highProtein?: boolean;
  lowCarb?: boolean;
  lowFat?: boolean;
}

export interface DietaryFilter {
  restrictions: string[];
  preferences: string[];
  allergies?: string[];
  // Extended properties for dietary filtering
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDAiryFree?: boolean;
  isNutFree?: boolean;
  isLowSodium?: boolean;
  isLowSugar?: boolean;
}

export interface IngredientRecommendationOptions {
  maxResults?: number;
  includeAlternatives?: boolean;
  seasonalPreference?: boolean;
  elementalBalance?: boolean;
}

export class UnifiedIngredientService implements IngredientServiceInterface {
  private static instance: UnifiedIngredientService;
  private ingredientCache: Map<string, UnifiedIngredient[]> = new Map();
  
  private constructor() {
    // Initialize the ingredient cache
    this.loadIngredients();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): UnifiedIngredientService {
    if (!UnifiedIngredientService.instance) {
      UnifiedIngredientService.instance = new UnifiedIngredientService();
    }
    return UnifiedIngredientService.instance;
  }
  
  /**
   * Load ingredients from data sources
   */
  private loadIngredients(): void {
    // This would load ingredients from data files or APIs
    // For now, we'll use a mock implementation with an empty cache
    this.ingredientCache.set('vegetables', []);
    this.ingredientCache.set('fruits', []);
    this.ingredientCache.set('grains', []);
    this.ingredientCache.set('proteins', []);
    this.ingredientCache.set('herbs', []);
    this.ingredientCache.set('spices', []);
    this.ingredientCache.set('oils', []);
  }
  
  /**
   * Get all ingredients organized by category
   */
  getAllIngredients(): Record<string, UnifiedIngredient[]> {
    const result: Record<string, UnifiedIngredient[]> = {};
    
    for (const [category, ingredients] of this.ingredientCache.entries()) {
      result[category] = [...ingredients];
    }
    
    return result;
  }
  
  /**
   * Get all ingredients as a flat array
   */
  getAllIngredientsFlat(): UnifiedIngredient[] {
    const allIngredients: UnifiedIngredient[] = [];
    
    for (const ingredients of this.ingredientCache.values()) {
      allIngredients?.push(...ingredients);
    }
    
    return allIngredients;
  }
  
  /**
   * Get ingredient by name
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined {
    const normalizedName = name?.toLowerCase()?.trim();
    
    for (const ingredients of this.ingredientCache.values()) {
      const ingredient = ingredients.find(
        ing => ing.name?.toLowerCase() === normalizedName
      );
      
      if (ingredient) {
        return ingredient;
      }
    }
    
    return undefined;
  }
  
  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[] {
    const normalizedCategory = category?.toLowerCase()?.trim();
    
    for (const [cat, ingredients] of this.ingredientCache.entries()) {
      if (cat?.toLowerCase() === normalizedCategory) {
        return [...ingredients];
      }
    }
    
    return [];
  }
  
  /**
   * Get ingredients by subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    const normalizedSubcategory = subcategory?.toLowerCase()?.trim();
    const result: UnifiedIngredient[] = [];
    
    for (const ingredients of this.ingredientCache.values()) {
      const matching = (ingredients || []).filter(ing => {
        const ingredient = ing as UnifiedIngredient;
        return ingredient.subCategory?.toLowerCase() === normalizedSubcategory;
      });
      result.push(...matching);
    }
    
    return result;
  }
  
  /**
   * Filter ingredients based on various criteria
   */
  filterIngredients(filter: IngredientFilter): Record<string, UnifiedIngredient[]> {
    let allIngredients = this.getAllIngredientsFlat();
    
    // Apply nutritional filter
    if (filter.nutritional) {
      allIngredients = this.applyNutritionalFilter(allIngredients, filter.nutritional);
    }
    
    // Apply elemental filter
    if (filter.elemental) {
      allIngredients = this.applyElementalFilter(allIngredients, filter.elemental);
    }
    
    // Apply dietary filter
    if (filter.dietary) {
      allIngredients = this.applyDietaryFilter(allIngredients, filter.dietary);
    }
    
    // Apply seasonal filter
    if (filter.currentSeason) {
      allIngredients = this.applySeasonalFilter(allIngredients, [filter.currentSeason]);
    }
    
    // Apply search filter
    if (filter.searchQuery) {
      allIngredients = this.applySearchFilter(allIngredients, filter.searchQuery);
    }
    
    // Apply exclusion filter
    if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
      allIngredients = this.applyExclusionFilter(allIngredients, filter.excludeIngredients);
    }
    
    // Apply zodiac filter
    if (filter.currentZodiacSign) {
      allIngredients = this.applyZodiacFilter(allIngredients, filter.currentZodiacSign);
    }
    
    // Apply planetary filter
    if (filter.planetaryInfluence) {
      allIngredients = this.applyPlanetaryFilter(allIngredients, filter.planetaryInfluence);
    }
    
    // Group by category
    const result: Record<string, UnifiedIngredient[]> = {};
    for (const ingredient of allIngredients) {
      const category = ingredient.category || 'unknown';
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(ingredient);
    }
    
    return result;
  }
  
  /**
   * Get ingredients by element
   */
  getIngredientsByElement(elementalFilter: ElementalFilter): UnifiedIngredient[] {
    return this.applyElementalFilter(this.getAllIngredientsFlat(), elementalFilter);
  }
  
  /**
   * Get ingredients with high Kalchm values
   */
  getHighKalchmIngredients(threshold: number = 1.5): UnifiedIngredient[] {
    return this.getAllIngredientsFlat().filter(ingredient => {
      const kalchm = ingredient.kalchm;
      return kalchm !== undefined && (kalchm as number) > threshold;
    });
  }
  
  /**
   * Find complementary ingredients
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults: number = 10
  ): UnifiedIngredient[] {
    const targetIngredient = typeof ingredient === 'string' 
      ? this.getIngredientByName(ingredient)
      : ingredient;
    
    if (!targetIngredient) {
      return [];
    }
    
    const allIngredients = this.getAllIngredientsFlat();
    const complementary: Array<{ ingredient: UnifiedIngredient; score: number }> = [];
    
    for (const otherIngredient of allIngredients) {
      if (otherIngredient.id === targetIngredient.id) continue;
      
      const compatibility = this.calculateIngredientCompatibility(
        targetIngredient,
        otherIngredient
      );
      
      complementary.push({
        ingredient: otherIngredient,
        score: compatibility.score
      });
    }
    
    return complementary
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.ingredient);
  }
  
  /**
   * Calculate elemental properties for an ingredient
   */
  calculateElementalProperties(ingredient: Partial<UnifiedIngredient>): ElementalProperties {
    // Default elemental properties
    const elementalState = ingredient.elementalPropertiesState as ElementalProperties | undefined;
    return {
      Fire: elementalState?.Fire || 0.25,
      Water: elementalState?.Water || 0.25,
      Earth: elementalState?.Earth || 0.25,
      Air: elementalState?.Air || 0.25
    };
  }
  
  /**
   * Get ingredients by flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore: number = 0.7
  ): UnifiedIngredient[] {
    return this.getAllIngredientsFlat().filter(ingredient => {
      const ingredientFlavor = ingredient.flavorProfile as { [key: string]: number } | undefined;
      if (!ingredientFlavor) return false;
      
      const similarity = this.calculateFlavorSimilarity(flavorProfile, ingredientFlavor);
      return similarity >= minMatchScore;
    });
  }
  
  /**
   * Get ingredients by season
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    const seasons = Array.isArray(season) ? season : [season];
    return this.applySeasonalFilter(this.getAllIngredientsFlat(), seasons);
  }
  
  /**
   * Get ingredients by planet
   */
  getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[] {
    return this.applyPlanetaryFilter(this.getAllIngredientsFlat(), planet);
  }
  
  /**
   * Get ingredients by zodiac sign
   */
  getIngredientsByZodiacSign(sign: ZodiacSign): UnifiedIngredient[] {
    return this.applyZodiacFilter(this.getAllIngredientsFlat(), sign);
  }
  
  /**
   * Get recommended ingredients based on elemental state
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {}
  ): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat();
    const recommendations: Array<{ ingredient: UnifiedIngredient; score: number }> = [];
    
    for (const ingredient of allIngredients) {
      const elemental = ingredient.elementalPropertiesState as ElementalProperties | undefined;
      if (!elemental) continue;
      
      // Calculate elemental compatibility
      const engine = alchemicalEngine as { calculateElementalCompatibility?: (elem1: ElementalProperties, elem2: ElementalProperties) => number };
      const compatibilityMethod = engine?.calculateElementalCompatibility || this.fallbackElementalCompatibility;
      const compatibility = compatibilityMethod(elementalState, elemental);
      
      // Calculate seasonal bonus
      let seasonalBonus = 0;
      if (options.seasonalPreference) {
        const currentSeason = this.getCurrentSeason();
        const ingredientSeasons = ingredient.seasonality;
        if (ingredientSeasons && ingredientSeasons.includes(currentSeason)) {
          seasonalBonus = 0.2;
        }
      }
      
      // Calculate elemental balance bonus
      let balanceBonus = 0;
      if (options.elementalBalance) {
        const dominantElement = this.getDominantElement(ingredient);
        const stateDominant = this.getDominantElementFromProperties(elementalState);
        if (dominantElement === stateDominant) {
          balanceBonus = 0.1;
        }
      }
      
      const totalScore = compatibility + seasonalBonus + balanceBonus;
      recommendations.push({ ingredient, score: totalScore });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, options.maxResults || 10)
      .map(item => item.ingredient);
  }
  
  /**
   * Calculate compatibility between two ingredients
   */
  calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
    ingredient2: string | UnifiedIngredient
  ): { 
    score: number; 
    elementalCompatibility: number;
    flavorCompatibility: number;
    seasonalCompatibility: number;
    energeticCompatibility: number;
  } {
    const ing1 = typeof ingredient1 === 'string' 
      ? this.getIngredientByName(ingredient1)
      : ingredient1;
    const ing2 = typeof ingredient2 === 'string' 
      ? this.getIngredientByName(ingredient2)
      : ingredient2;
    
    if (!ing1 || !ing2) {
      return {
        score: 0,
        elementalCompatibility: 0,
        flavorCompatibility: 0,
        seasonalCompatibility: 0,
        energeticCompatibility: 0
      };
    }
    
    // Calculate elemental compatibility
    const engine = alchemicalEngine as { calculateElementalCompatibility?: (elem1: ElementalProperties, elem2: ElementalProperties) => number };
    const compatibilityMethod = engine?.calculateElementalCompatibility || this.fallbackElementalCompatibility;
    const elementalCompatibility = compatibilityMethod(
      ing1.elementalState as ElementalProperties,
      ing2.elementalState as ElementalProperties
    );
    
    // Calculate flavor compatibility
    const flavorCompatibility = this.calculateFlavorSimilarity(
      ing1.flavorProfile as { [key: string]: number } || {},
      ing2.flavorProfile as { [key: string]: number } || {}
    );
    
    // Calculate seasonal compatibility
    const seasonalCompatibility = this.calculateSeasonalCompatibility(ing1, ing2);
    
    // Calculate energetic compatibility
    const energeticCompatibility = this.calculateEnergeticCompatibility(ing1, ing2);
    
    // Calculate overall score
    const score = (
      elementalCompatibility * 0.4 +
      flavorCompatibility * 0.3 +
      seasonalCompatibility * 0.2 +
      energeticCompatibility * 0.1
    );
    
    return {
      score,
      elementalCompatibility,
      flavorCompatibility,
      seasonalCompatibility,
      energeticCompatibility
    };
  }
  
  /**
   * Analyze recipe ingredients for harmony
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number;
    flavorProfile: { [key: string]: number };
    strongPAirings: Array<{ ingredients: string[]; score: number }>;
    weakPAirings: Array<{ ingredients: string[]; score: number }>;
  } {
    const ingredients = recipe.ingredients || [];
    const ingredientNames = ingredients.map(ing => typeof ing === 'string' ? ing : ing.name);
    
    let totalHarmony = 0;
    let pairCount = 0;
    const pairings: Array<{ ingredients: string[]; score: number }> = [];
    
    // Analyze all ingredient pairs
    for (let i = 0; i < ingredientNames.length; i++) {
      for (let j = i + 1; j < ingredientNames.length; j++) {
        const compatibility = this.calculateIngredientCompatibility(
          ingredientNames[i],
          ingredientNames[j]
        );
        
        totalHarmony += compatibility.score;
        pairCount++;
        
        pairings.push({
          ingredients: [ingredientNames[i], ingredientNames[j]],
          score: compatibility.score
        });
      }
    }
    
    const overallHarmony = pairCount > 0 ? totalHarmony / pairCount : 0;
    
    // Sort pairings by score
    const sortedPairings = pairings.sort((a, b) => b.score - a.score);
    const strongPAirings = sortedPairings.filter(p => p.score >= 0.7);
    const weakPAirings = sortedPairings.filter(p => p.score < 0.4);
    
    // Calculate overall flavor profile
    const flavorProfile: { [key: string]: number } = {};
    for (const ingredientName of ingredientNames) {
      const ingredient = this.getIngredientByName(ingredientName);
      if (ingredient && ingredient.flavorProfile) {
        const profile = ingredient.flavorProfile as { [key: string]: number };
        for (const [flavor, intensity] of Object.entries(profile)) {
          flavorProfile[flavor] = (flavorProfile[flavor] || 0) + intensity;
        }
      }
    }
    
    return {
      overallHarmony,
      flavorProfile,
      strongPAirings,
      weakPAirings
    };
  }
  
  /**
   * Enhance ingredient with elemental properties
   */
  enhanceIngredientWithElementalProperties(ingredient: Partial<UnifiedIngredient>): UnifiedIngredient {
    const enhanced = { ...ingredient } as UnifiedIngredient;
    
    // Calculate elemental properties if not present
    if (!enhanced.elementalPropertiesState) {
      enhanced.elementalPropertiesState = this.calculateElementalProperties(ingredient);
    }
    
    // Calculate thermodynamic properties
    enhanced.thermodynamicProperties = this.calculateThermodynamicMetrics(enhanced);
    
    return enhanced;
  }
  
  /**
   * Calculate thermodynamic metrics for an ingredient
   */
  calculateThermodynamicMetrics(ingredient: UnifiedIngredient): ThermodynamicProperties {
    const elemental = ingredient.elementalPropertiesState as ElementalProperties | undefined;
    if (!elemental) {
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0.5
      };
    }
    
    // Calculate heat based on Fire element
    const heat = elemental.Fire || 0.25;
    
    // Calculate entropy based on Air element
    const entropy = elemental.Air || 0.25;
    
    // Calculate reactivity based on Water element
    const reactivity = elemental.Water || 0.25;
    
    // Calculate gregsEnergy based on Earth element
    const gregsEnergy = elemental.Earth || 0.25;
    
    return { heat, entropy, reactivity, gregsEnergy };
  }
  
  /**
   * Clear the ingredient cache
   */
  clearCache(): void {
    this.ingredientCache.clear();
    this.loadIngredients();
  }
  
  /**
   * Fallback elemental compatibility calculation
   */
  private fallbackElementalCompatibility = (
    elem1: ElementalProperties, 
    elem2: ElementalProperties
  ): number => {
    if (!elem1 || !elem2) return 0.5;
    
    let compatibility = 0;
    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
    
    for (const element of elements) {
      const val1 = elem1[element] || 0;
      const val2 = elem2[element] || 0;
      compatibility += Math.min(val1, val2);
    }
    
    return compatibility / elements.length;
  };
  
  /**
   * Apply nutritional filter
   */
  private applyNutritionalFilter(
    ingredients: UnifiedIngredient[], 
    filter: NutritionalFilter
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const nutrition = ingredient.nutritionalProfile as { 
        protein?: number; 
        carbohydrates?: number; 
        fiber?: number; 
        calories?: number; 
        vitamins?: string[] | Record<string, number>;
        minerals?: string[] | Record<string, number>;
        fat?: number;
      } | undefined;
      
      if (!nutrition) return true; // Skip if no nutritional data
      
      // Check protein
      if (filter.minProtein !== undefined && 
          (nutrition.protein || 0) < filter.minProtein) {
        return false;
      }
      
      // Check carbs
      if (filter.maxCarbs !== undefined && 
          (nutrition.carbohydrates || 0) > filter.maxCarbs) {
        return false;
      }
      
      // Check fiber
      if (filter.minFiber !== undefined && 
          (nutrition.fiber || 0) < filter.minFiber) {
        return false;
      }
      
      // Check maxFiber
      if (filter.maxFiber !== undefined && 
          (nutrition.fiber || 0) > filter.maxFiber) {
        return false;
      }
      
      // Check calories
      if (filter.maxCalories !== undefined && 
          (nutrition.calories || 0) > filter.maxCalories) {
        return false;
      }
      
      // Check vitamins
      if (filter.vitamins && Array.isArray(filter.vitamins)) {
        if (!nutrition.vitamins) {
          return false;
        }
        
        const hasAllVitamins = filter.vitamins.every(vitamin => 
          nutrition.vitamins && Array.isArray(nutrition.vitamins) 
            ? nutrition.vitamins.includes(vitamin) 
            : nutrition.vitamins === vitamin
        );
        
        if (!hasAllVitamins) {
          return false;
        }
      }
      
      // Check minerals
      if (filter.minerals && Array.isArray(filter.minerals)) {
        if (!nutrition.minerals) {
          return false;
        }
        
        const hasAllMinerals = filter.minerals.every(mineral => 
          nutrition.minerals && Array.isArray(nutrition.minerals) 
            ? nutrition.minerals.includes(mineral) 
            : nutrition.minerals === mineral
        );
        
        if (!hasAllMinerals) {
          return false;
        }
      }
      
      // Check high protein flag
      if (filter.highProtein && (nutrition.protein || 0) < 15) {
        return false;
      }
      
      // Check low carb flag
      if (filter.lowCarb && (nutrition.carbohydrates || 0) > 10) {
        return false;
      }
      
      // Check low fat flag
      if (filter.lowFat && (nutrition.fat || 0) > 3) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Apply elemental filter
   */
  private applyElementalFilter(
    ingredients: UnifiedIngredient[], 
    filter: ElementalFilter
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const elemental = ingredient.elementalPropertiesState as ElementalProperties | undefined;
      if (!elemental) return true; // Skip if no elemental data
      
      // Check Fire
      if (filter.minfire !== undefined && elemental.Fire < filter.minfire) {
        return false;
      }
      
      if (filter.maxfire !== undefined && elemental.Fire > filter.maxfire) {
        return false;
      }
      
      // Check Water
      if (filter.minwater !== undefined && elemental.Water < filter.minwater) {
        return false;
      }
      
      if (filter.maxwater !== undefined && elemental.Water > filter.maxwater) {
        return false;
      }
      
      // Check Earth
      if (filter.minearth !== undefined && elemental.Earth < filter.minearth) {
        return false;
      }
      
      if (filter.maxearth !== undefined && elemental.Earth > filter.maxearth) {
        return false;
      }
      
      // Check Air
      if (filter.minAir !== undefined && elemental.Air < filter.minAir) {
        return false;
      }
      
      if (filter.maxAir !== undefined && elemental.Air > filter.maxAir) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Apply dietary filter
   */
  private applyDietaryFilter(
    ingredients: UnifiedIngredient[], 
    filter: DietaryFilter
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      // Check vegetarian
      if (filter.isVegetarian && !ingredient.dietary?.includes('vegetarian')) {
        return false;
      }
      
      // Check vegan
      if (filter.isVegan && !ingredient.dietary?.includes('vegan')) {
        return false;
      }
      
      // Check gluten free
      if (filter.isGlutenFree && !ingredient.dietary?.includes('gluten-free')) {
        return false;
      }
      
      // Check dairy free
      if (filter.isDAiryFree && !ingredient.dietary?.includes('dairy-free')) {
        return false;
      }
      
      // Check nut free
      if (filter.isNutFree && !ingredient.dietary?.includes('nut-free')) {
        return false;
      }
      
      // Check low sodium
      if (filter.isLowSodium && !ingredient.dietary?.includes('low-sodium')) {
        return false;
      }
      
      // Check low sugar
      if (filter.isLowSugar && !ingredient.dietary?.includes('low-sugar')) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Apply seasonal filter
   */
  private applySeasonalFilter(
    ingredients: UnifiedIngredient[], 
    seasons: string[] | Season[]
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      if (!ingredient.seasonality) return true;
      
      const ingredientSeasons = Array.isArray(ingredient.seasonality) 
        ? ingredient.seasonality 
        : [ingredient.seasonality];
      
      return seasons.some(season => 
        ingredientSeasons.includes(season as string)
      );
    });
  }
  
  /**
   * Apply search filter
   */
  private applySearchFilter(
    ingredients: UnifiedIngredient[], 
    query: string
  ): UnifiedIngredient[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return (ingredients || []).filter(ingredient => {
      return ingredient.name.toLowerCase().includes(normalizedQuery) ||
             ingredient.description?.toLowerCase().includes(normalizedQuery) ||
             ingredient.category.toLowerCase().includes(normalizedQuery);
    });
  }
  
  /**
   * Apply exclusion filter
   */
  private applyExclusionFilter(
    ingredients: UnifiedIngredient[], 
    excludedIngredients: string[]
  ): UnifiedIngredient[] {
    const normalizedExclusions = excludedIngredients.map(name => name.toLowerCase());
    
    return (ingredients || []).filter(ingredient => {
      return !normalizedExclusions.includes(ingredient.name.toLowerCase());
    });
  }
  
  /**
   * Apply zodiac filter
   */
  private applyZodiacFilter(
    ingredients: UnifiedIngredient[],
    currentZodiacSign: ZodiacSign
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const energyProfile = ingredient.energyProfile;
      if (!energyProfile?.zodiac) return true;
      
      return energyProfile.zodiac.includes(currentZodiacSign);
    });
  }
  
  /**
   * Apply planetary filter
   */
  private applyPlanetaryFilter(
    ingredients: UnifiedIngredient[],
    planet: PlanetName
  ): UnifiedIngredient[] {
    return (ingredients || []).filter(ingredient => {
      const energyProfile = ingredient.energyProfile;
      if (!energyProfile?.planetary) return true;
      
      return energyProfile.planetary.includes(planet);
    });
  }
  
  /**
   * Get current season
   */
  private getCurrentSeason(): Season {
    try {
      return getSeasonFromUtils();
    } catch {
      return 'Spring' as Season;
    }
  }
  
  /**
   * Get dominant element from ingredient
   */
  private getDominantElement(ingredient: UnifiedIngredient): Element {
    const elemental = ingredient.elementalPropertiesState as ElementalProperties | undefined;
    if (!elemental) return 'Fire';
    
    return this.getDominantElementFromProperties(elemental);
  }
  
  /**
   * Get dominant element from properties
   */
  private getDominantElementFromProperties(elemental: ElementalProperties): Element {
    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
    let maxValue = 0;
    let dominantElement: Element = 'Fire';
    
    for (const element of elements) {
      const value = elemental[element] || 0;
      if (value > maxValue) {
        maxValue = value;
        dominantElement = element;
      }
    }
    
    return dominantElement;
  }
  
  /**
   * Calculate flavor similarity between two profiles
   */
  private calculateFlavorSimilarity(
    profile1: { [key: string]: number },
    profile2: { [key: string]: number }
  ): number {
    const allFlavors = new Set([...Object.keys(profile1), ...Object.keys(profile2)]);
    let totalSimilarity = 0;
    let flavorCount = 0;
    
    for (const flavor of allFlavors) {
      const val1 = profile1[flavor] || 0;
      const val2 = profile2[flavor] || 0;
      
      const similarity = 1 - Math.abs(val1 - val2);
      totalSimilarity += similarity;
      flavorCount++;
    }
    
    return flavorCount > 0 ? totalSimilarity / flavorCount : 0;
  }
  
  /**
   * Calculate seasonal compatibility
   */
  private calculateSeasonalCompatibility(
    ing1: UnifiedIngredient,
    ing2: UnifiedIngredient
  ): number {
    const seasons1 = ing1.seasonality || [];
    const seasons2 = ing2.seasonality || [];
    
    if (seasons1.length === 0 || seasons2.length === 0) {
      return 0.5; // Neutral compatibility
    }
    
    const commonSeasons = seasons1.filter(season => seasons2.includes(season));
    return commonSeasons.length / Math.max(seasons1.length, seasons2.length);
  }
  
  /**
   * Calculate energetic compatibility
   */
  private calculateEnergeticCompatibility(
    ing1: UnifiedIngredient,
    ing2: UnifiedIngredient
  ): number {
    const energy1 = ing1.energyProfile;
    const energy2 = ing2.energyProfile;
    
    if (!energy1 || !energy2) {
      return 0.5; // Neutral compatibility
    }
    
    // Compare zodiac affinities
    const zodiac1 = energy1.zodiac || [];
    const zodiac2 = energy2.zodiac || [];
    const zodiacCompatibility = zodiac1.length > 0 && zodiac2.length > 0
      ? zodiac1.filter(z => zodiac2.includes(z)).length / Math.max(zodiac1.length, zodiac2.length)
      : 0.5;
    
    // Compare planetary affinities
    const planetary1 = energy1.planetary || [];
    const planetary2 = energy2.planetary || [];
    const planetaryCompatibility = planetary1.length > 0 && planetary2.length > 0
      ? planetary1.filter(p => planetary2.includes(p)).length / Math.max(planetary1.length, planetary2.length)
      : 0.5;
    
    return (zodiacCompatibility + planetaryCompatibility) / 2;
  }
  
  /**
   * Calculate recipe elemental balance
   */
  private calculateRecipeElementalBalance(ingredients: UnifiedIngredient[]): ElementalProperties {
    const balance: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };
    
    for (const ingredient of ingredients) {
      const elemental = ingredient.elementalPropertiesState as ElementalProperties | undefined;
      if (elemental) {
        balance.Fire += elemental.Fire || 0;
        balance.Water += elemental.Water || 0;
        balance.Earth += elemental.Earth || 0;
        balance.Air += elemental.Air || 0;
      }
    }
    
    const total = balance.Fire + balance.Water + balance.Earth + balance.Air;
    if (total > 0) {
      balance.Fire /= total;
      balance.Water /= total;
      balance.Earth /= total;
      balance.Air /= total;
    }
    
    return balance;
  }
  
  /**
   * Calculate recipe flavor profile
   */
  private calculateRecipeFlavorProfile(ingredients: UnifiedIngredient[]): { [key: string]: number } {
    const profile: { [key: string]: number } = {};
    
    for (const ingredient of ingredients) {
      const flavorProfile = ingredient.flavorProfile as { [key: string]: number } | undefined;
      if (flavorProfile) {
        for (const [flavor, intensity] of Object.entries(flavorProfile)) {
          profile[flavor] = (profile[flavor] || 0) + intensity;
        }
      }
    }
    
    return profile;
  }
}

// Export a singleton instance for use across the application
export const unifiedIngredientService = UnifiedIngredientService.getInstance();

// Export default for compatibility with existing code
export default unifiedIngredientService; 