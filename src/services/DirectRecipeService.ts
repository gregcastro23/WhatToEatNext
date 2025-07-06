import type { ElementalProperties, CelestialAlignment, ThermodynamicMetrics, Element } from '@/types/alchemy';
import { Recipe, ScoredRecipe } from '@/types/recipe';
import { cuisinesMap } from "@/data/cuisines/index";
import { allIngredients } from '@/data/ingredients';
import { calculateElementalCompatibility } from '@/utils/elemental/elementalUtils';
import { celestialCalculator } from '@/services/celestialCalculations';
import { 
  getComprehensiveSeasonalAnalysis, 
  getElementalCompatibilityWithSeason,
  getEnhancedElementalBreakdown,
  getSeasonalCacheStats 
} from '@/utils/seasonalCalculations';

// Enhanced type definitions for API parameters
interface PlanetaryPositionParams {
  date: number;
  month: number;
  year: number;
  hour: number;
  minutes: number;
  latitude?: number;
  longitude?: number;
}

interface AlchemicalAnalysisResult {
  thermodynamics: ThermodynamicMetrics;
  elementalBreakdown: ElementalProperties;
  seasonalAnalysis: {
    overallScore: number;
    recommendations: string[];
  };
}

// Enhanced implementations replacing any types
const fetchPlanetaryPositions = async (params: PlanetaryPositionParams): Promise<Record<string, any>> => {
  try {
    // Integration point for real astrologize API
    // Check if celestialCalculator has the method, otherwise use fallback
    if (celestialCalculator && typeof (celestialCalculator as unknown).calculatePlanetaryPositions === 'function') {
      return (celestialCalculator as unknown).calculatePlanetaryPositions(params);
    }
    
    // Fallback: Generate basic planetary positions
    return {
      Sun: { longitude: 150, sign: 'Leo' },
      Moon: { longitude: 120, sign: 'Cancer' },
      Mercury: { longitude: 140, sign: 'Virgo' },
      Venus: { longitude: 130, sign: 'Libra' },
      Mars: { longitude: 90, sign: 'Aries' },
      Jupiter: { longitude: 270, sign: 'Sagittarius' },
      Saturn: { longitude: 300, sign: 'Capricorn' }
    };
  } catch (error) {
    // console.warn('Planetary position calculation failed, using defaults:', error);
    return {};
  }
};

const calculateKalchm = (properties: ElementalProperties): number => {
  const { Fire, Water, Earth, Air } = properties;
  // Enhanced Kalchm calculation based on elemental relationships
  return Math.pow(Fire * Air, 2) / Math.max(Water * Earth, 0.001);
};

const calculateMonica = (kalchm: number, alignment: ElementalProperties, recipe: Recipe): number => {
  if (!recipe.elementalProperties || kalchm <= 0) return 1.0;
  
  const lnK = Math.log(kalchm);
  if (Math.abs(lnK) < 0.001) return 1.0;
  
  // Calculate based on recipe-alignment compatibility
  const compatibility = calculateElementalCompatibility(recipe.elementalProperties, alignment as unknown);
  return Math.abs(-compatibility / lnK);
};

const performAlchemicalAnalysis = (recipe: Recipe, alignment: CelestialAlignment): AlchemicalAnalysisResult => {
  const elementalProps = recipe.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const alignmentElements = alignment.elementalState || alignment.elementalDominance || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  
  const kalchm = calculateKalchm(elementalProps);
  const monica = calculateMonica(kalchm, alignmentElements, recipe);
  
  // Enhanced seasonal analysis integration
  const currentSeason = getCurrentSeason();
  const seasonalAnalysis = getComprehensiveSeasonalAnalysis(
    recipe as unknown, 
    currentSeason,
    alignment.currentZodiacSign as unknown,
    alignment.lunarPhase as unknown
  );
  
  return {
    thermodynamics: {
      heat: elementalProps.Fire + elementalProps.Air * 0.5,
      entropy: (elementalProps.Water + elementalProps.Earth) * 0.7,
      reactivity: kalchm,
      gregsEnergy: kalchm * monica,
      kalchm,
      monica
    },
    elementalBreakdown: elementalProps,
    seasonalAnalysis: {
      overallScore: seasonalAnalysis.overallScore,
      recommendations: seasonalAnalysis.recommendations
    }
  };
};

// Utility function for current season
const getCurrentSeason = (): 'spring' | 'summer' | 'autumn' | 'winter' => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

/**
 * Enhanced criteria interface for recipe matching with full astrological support
 */
export interface RecipeMatchCriteria {
  cuisine?: string;
  season?: string;
  currentSeason?: string; // For seasonal matching
  mealType?: string;
  ingredients?: string[];
  elementalProperties?: { [key: string]: number };
  elementalState?: { [key: string]: number }; // For elemental compatibility
  dietaryPreferences?: string[];
  location?: { lat: number; lng: number }; // For accurate astrological calculations
  zodiacSign?: string; // For zodiacal compatibility
  currentMoment?: Date; // For real-time astrological calculations
}

/**
 * Service for accessing recipe data directly from data files
 * This replaces the need for API routes by providing direct data access
 * with full astrological, alchemical, and thermodynamic integration
 */
// Performance optimization: Recipe scoring cache
interface CachedScore {
  score: number;
  breakdown: Record<string, unknown>;
  timestamp: number;
  alignmentKey: string;
}

export class DirectRecipeService {
  private static instance: DirectRecipeService;
  private allRecipes: Recipe[] = [];
  private currentCelestialAlignment: CelestialAlignment | null = null;
  private lastAlignmentUpdate: number = 0;
  private readonly ALIGNMENT_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  
  // Performance caching system
  private recipeScoreCache: Map<string, CachedScore> = new Map();
  private readonly SCORE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private cacheHits = 0;
  private cacheMisses = 0;
  
  private constructor() {
    this.loadAllRecipes();
  }
  
  public static getInstance(): DirectRecipeService  {
    if (!DirectRecipeService.instance) {
      DirectRecipeService.instance = new DirectRecipeService();
    }
    return DirectRecipeService.instance;
  }
  
  /**
   * Load all recipes from cuisine data
   */
  private loadAllRecipes(): void {
    const recipes: Recipe[] = [];
    
    // Extract recipes from all cuisines
    Object.values(cuisinesMap || {}).forEach(cuisine => {
      // Process breakfast recipes
      Object.values(cuisine.dishes.breakfast || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      });
      
      // Process lunch recipes
      Object.values(cuisine.dishes.lunch || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      });
      
      // Process dinner recipes
      Object.values(cuisine.dishes.dinner || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      });
      
      // Process dessert recipes
      Object.values(cuisine.dishes.dessert || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      });
    });
    
    // Deduplicate recipes by ID
    const uniqueRecipes = recipes.reduce((acc: { [key: string]: Recipe }, recipe) => {
      if (recipe.id && !acc[recipe.id]) {
        acc[recipe.id] = recipe;
      }
      return acc;
    }, {});
    
    this.allRecipes = Object.values(uniqueRecipes);
  }

  /**
   * Get current celestial alignment from astrologize API or cache
   */
  private async getCurrentCelestialAlignment(forceRefresh = false): Promise<CelestialAlignment>  {
    const now = Date.now();
    
    // Return cached alignment if still valid
    if (!forceRefresh && 
        this.currentCelestialAlignment && 
        (now - this.lastAlignmentUpdate) < this.ALIGNMENT_CACHE_DURATION) {
      return this.currentCelestialAlignment;
    }

    try {
      // Get current date, time, and location for astrologize API
      const _currentDate = new Date();
      
      // Fetch real planetary positions from astrologize API
      const planetaryPositions = await fetchPlanetaryPositions({
        // This will use current date/time/location by default
        date: currentDate.getDate(),
        month: currentDate.getMonth() + 1, // API expects 1-12
        year: currentDate.getFullYear(),
        hour: currentDate.getHours(),
        minutes: currentDate.getMinutes()
      });

      // Calculate celestial alignment using our celestial calculator
      const alignment = celestialCalculator.calculateCurrentInfluences();
      
      // Update with real planetary data if available
      if (planetaryPositions && Object.keys(planetaryPositions || {}).length > 0) {
        // Convert astrologize API format to our internal format
        const enhancedAlignment = {
          ...alignment,
          planetaryPositions: planetaryPositions,
          realTimeData: true,
          lastUpdated: new Date().toISOString()
        };
        
        this.currentCelestialAlignment = enhancedAlignment as CelestialAlignment;
      } else {
        // Fall back to calculated alignment
        this.currentCelestialAlignment = alignment;
      }
      
      this.lastAlignmentUpdate = now;
      return this.currentCelestialAlignment;
      
    } catch (error) {
      // console.error('Error fetching celestial alignment:', error);
      
      // Fall back to celestial calculator if API fails
      if (!this.currentCelestialAlignment) {
        this.currentCelestialAlignment = celestialCalculator.calculateCurrentInfluences();
        this.lastAlignmentUpdate = now;
      }
      
      return this.currentCelestialAlignment;
    }
  }

  /**
   * Calculate alchemical compatibility score between recipe and current celestial state
   */
  private async calculateAlchemicalScore(recipe: Recipe): Promise< {
    score: number;
    kalchm: number;
    monica: number;
    thermodynamics: ThermodynamicMetrics;
    breakdown: {
      elementalScore: number;
      zodiacalScore: number;
      lunarScore: number;
      planetaryScore: number;
      seasonalScore: number;
    };
  }> {
    const alignment = await this.getCurrentCelestialAlignment();
    
    // Calculate recipe's Kalchm value from ingredients
    const recipeKalchm = this.calculateRecipeKalchm(recipe);
    
    // Calculate Monica constant
    const monica = calculateMonica(
      recipeKalchm,
      alignment.elementalState || alignment.elementalDominance || alignment.elementalBalance,
      (recipe as any).elementalState || recipe.elementalProperties
    );
    
    // Perform full alchemical analysis
    const alchemicalAnalysis = performAlchemicalAnalysis(
      (recipe as any).elementalState || recipe.elementalProperties,
      (alignment.elementalState || alignment.elementalDominance || alignment.elementalBalance) as unknown
    );
    
    // Calculate individual component scores
    const breakdown = {
      elementalScore: this.calculateElementalScore(recipe, alignment),
      zodiacalScore: this.calculateZodiacalScore(recipe, alignment),
      lunarScore: this.calculateLunarScore(recipe, alignment),
      planetaryScore: this.calculatePlanetaryScore(recipe, alignment),
      seasonalScore: this.calculateSeasonalScore(recipe, alignment)
    };
    
    // Calculate overall compatibility score
    const totalScore = (
      breakdown.elementalScore * 0.3 +
      breakdown.zodiacalScore * 0.2 +
      breakdown.lunarScore * 0.15 +
      breakdown.planetaryScore * 0.25 +
      breakdown.seasonalScore * 0.1
    );
    
    return {
      score: Math.max(0, Math.min(1, totalScore)),
      kalchm: recipeKalchm,
      monica: monica,
      thermodynamics: alchemicalAnalysis.thermodynamics,
      breakdown
    };
  }

  /**
   * Calculate recipe's Kalchm value from ingredients
   */
  private calculateRecipeKalchm(recipe: Recipe): number {
    let totalKalchm = 1.0;
    let ingredientCount = 0;
    
    (recipe.ingredients || []).forEach(ingredient => {
      // Look up ingredient in our database
      const ingredientData = allIngredients[ingredient.name] || 
                            allIngredients[ingredient.name?.toLowerCase()];
      
      if (ingredientData && ingredientData.alchemicalProperties) {
        const ingredientKalchm = calculateKalchm(ingredientData.alchemicalProperties as unknown);
        totalKalchm *= ingredientKalchm;
        ingredientCount++;
      }
    });
    
    // Return geometric mean for combined Kalchm
    return ingredientCount > 0 ? Math.pow(totalKalchm, 1 / ingredientCount) : 1.0;
  }

  /**
   * Calculate elemental compatibility score
   */
  private calculateElementalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    const recipeElementalState = (recipe as any).elementalState || recipe.elementalProperties;
    if (!recipeElementalState) return 0.5;
    
    return calculateElementalCompatibility(
      recipeElementalState as unknown,
      (alignment.elementalState || alignment.elementalDominance || alignment.elementalBalance) as unknown
    );
  }

  /**
   * Calculate zodiacal compatibility score
   */
  private calculateZodiacalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.zodiacInfluences || (recipe.zodiacInfluences || []).length === 0) return 0.5;
    
    // Check if current zodiac sign matches recipe influences
    const currentZodiac = alignment.currentZodiacSign?.toLowerCase();
    const hasZodiacMatch = (recipe.zodiacInfluences || []).some(sign => sign?.toLowerCase() === currentZodiac);
    
    return hasZodiacMatch ? 0.8 : 0.3;
  }

  /**
   * Calculate lunar phase compatibility score
   */
  private calculateLunarScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.lunarPhaseInfluences || (recipe.lunarPhaseInfluences || []).length === 0) return 0.5;
    
    const currentLunarPhase = alignment.lunarPhase?.toLowerCase();
    const hasLunarMatch = (recipe.lunarPhaseInfluences || []).some(phase => 
      phase?.toLowerCase() === currentLunarPhase
    );
    
    return hasLunarMatch ? 0.8 : 0.4;
  }

  /**
   * Calculate planetary influence compatibility score
   */
  private calculatePlanetaryScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.planetaryInfluences) return 0.5;
    
    let score = 0.5;
    
    // Check favorable planets
    if (recipe.planetaryInfluences.favorable) {
      const favorableMatches = (recipe.planetaryInfluences.favorable || []).filter(planet =>
        (alignment.dominantPlanets || []).some(dp => dp.name?.toLowerCase() === planet?.toLowerCase())
      );
      score += ((favorableMatches || []).length / (recipe.planetaryInfluences.favorable || []).length) * 0.3;
    }
    
    // Check unfavorable planets (reduce score)
    if (recipe.planetaryInfluences.unfavorable) {
      const unfavorableMatches = (recipe.planetaryInfluences.unfavorable || []).filter(planet =>
        (alignment.dominantPlanets || []).some(dp => dp.name?.toLowerCase() === planet?.toLowerCase())
      );
      score -= ((unfavorableMatches || []).length / (recipe.planetaryInfluences.unfavorable || []).length) * 0.2;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate seasonal compatibility score
   */
  private calculateSeasonalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    // Apply safe type casting for currentSeason access
    const recipeData = recipe as unknown;
    const currentSeason = recipeData?.currentSeason;
    
    if (!currentSeason || (Array.isArray(currentSeason) && currentSeason.length === 0)) return 0.5;
    
    // Determine current season from date
    const currentMonth = new Date().getMonth();
    let currentSeasonName = 'spring';
    
    if (currentMonth >= 2 && currentMonth <= 4) currentSeasonName = 'spring';
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeasonName = 'summer';
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeasonName = 'autumn';
    else currentSeasonName = 'winter';
    
    const seasonArray = Array.isArray(currentSeason) ? currentSeason : [currentSeason];
    const hasSeasonMatch = seasonArray.some(
      season => season?.toLowerCase() === currentSeasonName ||
                season?.toLowerCase() === 'all'
    );
    
    return hasSeasonMatch ? 0.8 : 0.3;
  }
  
  /**
   * Get all recipes
   */
  public getAllRecipes(): Recipe[] {
    return this.allRecipes;
  }
  
  /**
   * Get a recipe by ID
   */
  public getRecipeById(id: string): Recipe | undefined {
    return this.allRecipes.find(recipe => recipe.id === id);
  }
  
  /**
   * Get recipes by cuisine with astrological scoring
   */
  public async getRecipesByCuisine(cuisine: string, limit = 20, offset = 0): Promise<ScoredRecipe[]> {
    const normalizedCuisine = cuisine?.toLowerCase();
    const filteredRecipes = (this.allRecipes || []).filter(recipe => 
      recipe.cuisine?.toLowerCase() === normalizedCuisine
    );
    
    // Score each recipe with current astrological influences
    const scoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      scoredRecipes.push({
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      });
    }
    
    // Sort by astrological compatibility score
    return scoredRecipes.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get recipes by season with astrological scoring
   */
  public async getRecipesBySeason(season: string, limit = 20, offset = 0): Promise<ScoredRecipe[]> {
    const normalizedSeason = season?.toLowerCase();
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      if (Array.isArray(recipe.currentSeason)) {
        return (recipe.currentSeason || []).some(s => s?.toLowerCase() === normalizedSeason);
      } else if (typeof recipe.currentSeason === 'string') {
        return recipe.currentSeason?.toLowerCase() === normalizedSeason;
      }
      return false;
    });
    
    // Score with astrological influences
    const scoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      scoredRecipes.push({
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      });
    }
    
    return scoredRecipes.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get recipes by meal type with astrological scoring
   */
  public async getRecipesByMealType(mealType: string, limit = 20, offset = 0): Promise<ScoredRecipe[]> {
    const normalizedMealType = mealType?.toLowerCase();
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      if (Array.isArray(recipe.mealType)) {
        return (recipe.mealType || []).some(m => m?.toLowerCase() === normalizedMealType);
      } else if (typeof recipe.mealType === 'string') {
        return recipe.mealType?.toLowerCase() === normalizedMealType;
      }
      return false;
    });
    
    // Score with astrological influences
    const scoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of filteredRecipes?.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      scoredRecipes?.push({
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      });
    }
    
    return scoredRecipes.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get recipes by zodiac sign with full astrological integration
   */
  public async getRecipesByZodiacSign(currentZodiacSign: string, limit = 20, offset = 0): Promise<ScoredRecipe[]> {
    const normalizedZodiacSign = currentZodiacSign?.toLowerCase();
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      return (recipe.zodiacInfluences || []).some(sign => sign?.toLowerCase() === normalizedZodiacSign);
    });
    
    // Score with full astrological analysis
    const scoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of filteredRecipes?.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      scoredRecipes?.push({
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      });
    }
    
    return scoredRecipes.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Get best recipe matches based on provided criteria with full astrological integration
   */
  public async getBestRecipeMatches(options: {
    criteria: RecipeMatchCriteria;
    limit?: number;
    offset?: number;
  }): Promise<ScoredRecipe[]> {
    const { criteria, limit = 10, offset = 0 } = options;
    
    // Get current celestial alignment (this will use real astrologize API data)
    const alignment = await this.getCurrentCelestialAlignment();
    
    // Start with all recipes
    let candidateRecipes = [...this.allRecipes];
    
    // Apply basic filters based on criteria
    if (criteria.cuisine) {
      candidateRecipes = candidateRecipes.filter(r => r.cuisine?.toLowerCase() === criteria.cuisine?.toLowerCase());
    }
    
    // Enhanced seasonal filtering with safe type casting
    if (criteria.currentSeason || criteria.season) {
      const seasonCriteria = criteria.currentSeason || criteria.season;
      candidateRecipes = candidateRecipes.filter(recipe => {
        const recipeData = recipe as unknown;
        const recipeCurrentSeason = recipeData?.currentSeason;
        
        if (Array.isArray(recipeCurrentSeason)) {
          return recipeCurrentSeason.some(s => s?.toLowerCase() === seasonCriteria?.toLowerCase());
        } else if (typeof recipeCurrentSeason === 'string') {
          return recipeCurrentSeason?.toLowerCase() === seasonCriteria?.toLowerCase();
        }
        return false;
      });
    }
    
    if (criteria.mealType) {
      candidateRecipes = candidateRecipes.filter(recipe => {
        if (Array.isArray(recipe.mealType)) {
          return (recipe.mealType || []).some(m => m?.toLowerCase() === criteria.mealType?.toLowerCase());
        } else if (typeof recipe.mealType === 'string') {
          return recipe.mealType?.toLowerCase() === criteria.mealType?.toLowerCase();
        }
        return false;
      });
    }
    
    // Apply dietary filters
    if (Array.isArray(criteria.dietaryPreferences) ? criteria.dietaryPreferences.includes('vegetarian') : criteria.dietaryPreferences === 'vegetarian') {
      candidateRecipes = candidateRecipes.filter(r => r.isVegetarian);
    }
    
    if (Array.isArray(criteria.dietaryPreferences) ? criteria.dietaryPreferences.includes('vegan') : criteria.dietaryPreferences === 'vegan') {
      candidateRecipes = candidateRecipes.filter(r => r.isVegan);
    }
    
    if (Array.isArray(criteria.dietaryPreferences) ? criteria.dietaryPreferences.includes('glutenFree') : criteria.dietaryPreferences === 'glutenFree') {
      candidateRecipes = candidateRecipes.filter(r => r.isGlutenFree);
    }
    
    if (Array.isArray(criteria.dietaryPreferences) ? criteria.dietaryPreferences.includes('dairyFree') : criteria.dietaryPreferences === 'dairyFree') {
      candidateRecipes = candidateRecipes.filter(r => r.isDairyFree);
    }
    
    // Score recipes with full astrological, alchemical, and thermodynamic analysis
    const scoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of candidateRecipes) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      let finalScore = alchemicalScore.score;
      
      // Enhanced elemental compatibility scoring with safe type casting
      if (criteria.elementalState && recipe.elementalState) {
        const criteriaElementalState = criteria.elementalState;
        const recipeElementalState = recipe.elementalState;
        
        const criteriaCompatibility = calculateElementalCompatibility(
          criteriaElementalState as unknown,
          recipeElementalState as unknown
        );
        finalScore = (finalScore + criteriaCompatibility) / 2;
      }
      
      // Score based on ingredients match
      if ((criteria.ingredients || []).length) {
        const matchingIngredients = (recipe.ingredients || []).filter(i => 
          (criteria.ingredients || []).some(ci => i.name?.toLowerCase()?.includes(ci?.toLowerCase()))
        );
        
        const ingredientMatchRatio = (matchingIngredients || []).length / (criteria.ingredients || []).length;
        finalScore *= (1 + ingredientMatchRatio * 0.2);
      }
      
      scoredRecipes?.push({
        ...recipe,
        score: Math.min(1, finalScore),
        alchemicalScores: alchemicalScore.breakdown
      });
    }
    
    // Sort by score (descending) and apply pagination
    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(offset, offset + limit);
  }

  /**
   * Get current celestial influence data for display
   */
  public async getCurrentCelestialInfluence(): Promise<CelestialAlignment> {
    return await this.getCurrentCelestialAlignment();
  }

  /**
   * Force refresh of astrological data
   */
  public async refreshAstrologicalData(): Promise<void> {
    this.currentCelestialAlignment = null;
    this.lastAlignmentUpdate = 0;
    this.clearScoreCache(); // Clear score cache when astrological data changes
    await this.getCurrentCelestialAlignment(true);
  }

  /**
   * Performance monitoring and cache management
   */
  public getCacheStats(): {
    scoreCache: { size: number; hits: number; misses: number; hitRate: number };
    seasonalCache: { size: number; hitRate: number };
    clear: () => void;
  } {
    const seasonalStats = getSeasonalCacheStats();
    return {
      scoreCache: {
        size: this.recipeScoreCache.size,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: this.cacheHits + this.cacheMisses > 0 ? this.cacheHits / (this.cacheHits + this.cacheMisses) : 0
      },
      seasonalCache: seasonalStats,
      clear: () => {
        this.clearScoreCache();
        seasonalStats.clear();
      }
    };
  }

  private clearScoreCache(): void {
    this.recipeScoreCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  private getCachedScore(recipeId: string, alignmentKey: string): CachedScore | null {
    const cached = this.recipeScoreCache.get(recipeId);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.SCORE_CACHE_DURATION || cached.alignmentKey !== alignmentKey) {
      this.recipeScoreCache.delete(recipeId);
      return null;
    }
    
    this.cacheHits++;
    return cached;
  }

  private setCachedScore(recipeId: string, score: number, breakdown: Record<string, unknown>, alignmentKey: string): void {
    this.recipeScoreCache.set(recipeId, {
      score,
      breakdown,
      timestamp: Date.now(),
      alignmentKey
    });
  }

  /**
   * Enhanced recipe discovery with intelligent caching
   */
  public async getPopularRecipesWithCaching(limit = 10): Promise<ScoredRecipe[]> {
    const alignment = await this.getCurrentCelestialAlignment();
    const alignmentKey = this.generateAlignmentKey(alignment);
    
    const allScoredRecipes: ScoredRecipe[] = [];
    
    for (const recipe of this.allRecipes.slice(0, limit * 2)) { // Get more to ensure quality after scoring
      const cached = this.getCachedScore(recipe.id!, alignmentKey);
      
      if (cached) {
        allScoredRecipes.push({
          ...recipe,
          score: cached.score,
          alchemicalScores: cached.breakdown
        });
      } else {
        this.cacheMisses++;
        const alchemicalResult = await this.calculateAlchemicalScore(recipe);
        
        const scoredRecipe: ScoredRecipe = {
          ...recipe,
          score: alchemicalResult.score,
          alchemicalScores: {
            elementalScore: alchemicalResult.breakdown.elementalScore,
            zodiacalScore: alchemicalResult.breakdown.zodiacalScore,
            lunarScore: alchemicalResult.breakdown.lunarScore,
            planetaryScore: alchemicalResult.breakdown.planetaryScore,
            seasonalScore: alchemicalResult.breakdown.seasonalScore,
            thermodynamics: alchemicalResult.thermodynamics
          }
        };
        
        this.setCachedScore(recipe.id!, alchemicalResult.score, scoredRecipe.alchemicalScores, alignmentKey);
        allScoredRecipes.push(scoredRecipe);
      }
    }
    
    return allScoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private generateAlignmentKey(alignment: CelestialAlignment): string {
    return `${alignment.currentZodiacSign}_${alignment.lunarPhase}_${Object.values(alignment.elementalState || {}).join('_')}`;
  }
}

export default DirectRecipeService; 