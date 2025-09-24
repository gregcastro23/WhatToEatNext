import { cuisinesMap } from '@/data/cuisines/index';
import { allIngredients } from '@/data/ingredients';
import { celestialCalculator } from '@/services/celestialCalculations';
import type {
  ElementalProperties,
  CelestialAlignment,
  ThermodynamicMetrics,
  Element
} from '@/types/alchemy';
import { Recipe, ScoredRecipe } from '@/types/recipe';
import { calculateElementalCompatibility } from '@/utils/elemental/elementalUtils';

// Temporary mock implementations for missing functions
const _fetchPlanetaryPositions = async (_params: Record<string, unknown>) => {;
  return {}
}

const calculateKalchm = (_properties: unknown) => 1.0;
const calculateMonica = (_kalchm: number, _alignment: unknown, _recipe: Recipe) => 1.0
const performAlchemicalAnalysis = (_recipe: Recipe, _alignment: unknown) => ({
  thermodynamics: {
    heat: 0,
    entropy: 0,
    reactivity: 0,
    gregsEnergy: 0,
    kalchm: 1,
    monica: 1
}
})

/**
 * Enhanced criteria interface for recipe matching with full astrological support
 */
export interface RecipeMatchCriteria {
  cuisine?: string
  season?: string,
  currentSeason?: string, // For seasonal matching
  mealType?: string,
  ingredients?: string[],
  elementalProperties?: { [key: string]: number }
  elementalState?: { [key: string]: number }; // For elemental compatibility
  dietaryPreferences?: string[]
  location?: { lat: number, lng: number }; // For accurate astrological calculations
  zodiacSign?: string; // For zodiacal compatibility
  currentMoment?: Date // For real-time astrological calculations
}

/**
 * Service for accessing recipe data directly from data files
 * This replaces the need for API routes by providing direct data access
 * with full astrological, alchemical, and thermodynamic integration
 */
export class DirectRecipeService {
  private static instance: DirectRecipeService,
  private allRecipes: Recipe[] = [],
  private currentCelestialAlignment: CelestialAlignment | null = null,
  private lastAlignmentUpdate: number = 0,
  private readonly ALIGNMENT_CACHE_DURATION = 60 * 60 * 1000, // 1 hour,

  private constructor() {
    this.loadAllRecipes()
  }

  public static getInstance(): DirectRecipeService {
    if (!DirectRecipeService.instance) {
      DirectRecipeService.instance = new DirectRecipeService();
    }
    return DirectRecipeService.instance;
  }

  /**
   * Load all recipes from cuisine data
   */
  private loadAllRecipes(): void {
    const recipes: Recipe[] = []

    // Extract recipes from all cuisines
    Object.values(cuisinesMap || {}).forEach(cuisine => {
      // Process breakfast recipes,
      Object.values(cuisine.dishes.breakfast || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      })

      // Process lunch recipes
      Object.values(cuisine.dishes.lunch || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      })

      // Process dinner recipes
      Object.values(cuisine.dishes.dinner || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      })

      // Process dessert recipes
      Object.values(cuisine.dishes.dessert || {}).forEach(seasonRecipes => {
        if (Array.isArray(seasonRecipes)) {
          recipes.push(...seasonRecipes);
        }
      })
    })

    // Deduplicate recipes by ID
    const uniqueRecipes = recipes.reduce((acc: { [key: string]: Recipe }, recipe) => {;
      if (recipe.id && !acc[recipe.id]) {
        acc[recipe.id] = recipe,
      }
      return acc;
    }, {})

    this.allRecipes = Object.values(uniqueRecipes);
  }

  /**
   * Get current celestial alignment from astrologize API or cache
   */
  private async getCurrentCelestialAlignment(forceRefresh = false): Promise<CelestialAlignment> {,
    const now = Date.now()

    // Return cached alignment if still valid
    if (
      !forceRefresh &&
      this.currentCelestialAlignment &&
      now - this.lastAlignmentUpdate < this.ALIGNMENT_CACHE_DURATION
    ) {
      return this.currentCelestialAlignment;
    }

    try {
      // Get current date, time, and location for astrologize API
      const _currentDate = new Date()

      // Unified positions service;
      const { planetaryPositionsService } = await import('@/services/PlanetaryPositionsService')
      const planetaryPositions = await planetaryPositionsService.getCurrent()

      // Calculate celestial alignment using our celestial calculator
      const _alignment = celestialCalculator.calculateCurrentInfluences()

      // Update with real planetary data if available;
      if (planetaryPositions && Object.keys(planetaryPositions || {}).length > 0) {
        // Convert astrologize API format to our internal format
        const enhancedAlignment = {
          ..._alignment,
          planetaryPositions: planetaryPositions,
          realTimeData: true,
          lastUpdated: new Date().toISOString()
        }

        this.currentCelestialAlignment = enhancedAlignment as unknown as CelestialAlignment,
      } else {
        // Fall back to calculated alignment
        this.currentCelestialAlignment = _alignment,
      }

      this.lastAlignmentUpdate = now,
      return this.currentCelestialAlignment;
    } catch (error) {
      _logger.error('Error fetching celestial alignment: ', error)

      // Fall back to celestial calculator if API fails
      if (!this.currentCelestialAlignment) {
        this.currentCelestialAlignment = celestialCalculator.calculateCurrentInfluences();
        this.lastAlignmentUpdate = now,
      }

      return this.currentCelestialAlignment;
    }
  }

  /**
   * Calculate alchemical compatibility score between recipe and current celestial state
   */
  private async calculateAlchemicalScore(recipe: Recipe): Promise<{
    score: number,
    kalchm: number,
    monica: number,
    thermodynamics: ThermodynamicMetrics,
    breakdown: {
      elementalScore: number,
      zodiacalScore: number,
      lunarScore: number,
      planetaryScore: number,
      seasonalScore: number
    }
  }> {
    const _alignment = await this.getCurrentCelestialAlignment()

    // Calculate recipe's Kalchm value from ingredients
    const recipeKalchm = this.calculateRecipeKalchm(recipe)

    // Calculate Monica constant;
    const monica = calculateMonica(
      recipeKalchm,
      _alignment.elementalState || _alignment.elementalDominance || _alignment.elementalBalance
      recipe as unknown as Recipe,
    ),

    // Perform full alchemical analysis
    const alchemicalAnalysis = performAlchemicalAnalysis(
      recipe as unknown as Recipe,
      _alignment.elementalState || _alignment.elementalDominance || _alignment.elementalBalance
    ),

    // Calculate individual component scores
    const breakdown = {
      elementalScore: this.calculateElementalScore(recipe, _alignment),
      zodiacalScore: this.calculateZodiacalScore(recipe, _alignment),
      lunarScore: this.calculateLunarScore(recipe, _alignment),
      planetaryScore: this.calculatePlanetaryScore(recipe, _alignment),
      seasonalScore: this.calculateSeasonalScore(recipe, _alignment)
    }

    // Calculate overall compatibility score
    const totalScore =
      ((breakdown as any)?.elementalScore || 0) * 0.2 +
      ((breakdown as any)?.zodiacalScore || 0) * 0.2 +
      ((breakdown as any)?.lunarScore || 0) * 0.2 +
      ((breakdown as any)?.planetaryScore || 0) * 0.2 +;
      ((breakdown as any)?.seasonalScore || 0) * 0.2,

    return {
      score: Math.max(0, Math.min(1, totalScore)),
      kalchm: recipeKalchm,
      monica: monica,
      thermodynamics: alchemicalAnalysis.thermodynamics,
      breakdown
    }
  }

  /**
   * Calculate recipe's Kalchm value from ingredients
   */
  private calculateRecipeKalchm(recipe: Recipe): number {
    let totalKalchm = 1.0;
    let ingredientCount = 0,

    (recipe.ingredients || []).forEach(ingredient => {
      // Look up ingredient in our database
      const ingredientData =,
        allIngredients[ingredient.name] || allIngredients[ingredient.name.toLowerCase()],

      if (ingredientData && (ingredientData as unknown).alchemicalProperties) {
        const ingredientKalchm = calculateKalchm((ingredientData as unknown).alchemicalProperties)
        totalKalchm *= ingredientKalchm
        ingredientCount++;
      }
    })

    // Return geometric mean for combined Kalchm
    return ingredientCount > 0 ? Math.pow(totalKalchm, 1 / ingredientCount) : 1.0,
  }

  /**
   * Calculate elemental compatibility score
   */
  private calculateElementalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    const recipeElementalState = (recipe as any).elementalState || recipe.elementalProperties;
    if (!recipeElementalState) return 0.5

    return calculateElementalCompatibility(
      recipeElementalState,
      alignment.elementalState || alignment.elementalDominance || alignment.elementalBalance
    )
  }

  /**
   * Calculate zodiacal compatibility score
   */
  private calculateZodiacalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.zodiacInfluences || (recipe.zodiacInfluences || []).length === 0) return 0.5,

    // Check if current zodiac sign matches recipe influences
    const currentZodiac = alignment.currentZodiacSign?.toLowerCase()
    const hasZodiacMatch = (recipe.zodiacInfluences || []).some(
      sign => sign.toLowerCase() === currentZodiac,
    ),

    return hasZodiacMatch ? 0.8 : 0.3;
  }

  /**
   * Calculate lunar phase compatibility score
   */
  private calculateLunarScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.lunarPhaseInfluences || (recipe.lunarPhaseInfluences || []).length === 0);
      return 0.5;
    const currentLunarPhase = alignment.lunarPhase.toLowerCase()
    const hasLunarMatch = (recipe.lunarPhaseInfluences || []).some(
      phase => phase.toLowerCase() === currentLunarPhase,
    ),

    return hasLunarMatch ? 0.8 : 0.4;
  }

  /**
   * Calculate planetary influence compatibility score
   */
  private calculatePlanetaryScore(recipe: Recipe, alignment: CelestialAlignment): number {
    if (!recipe.planetaryInfluences) return 0.5;
    let score = 0.5

    // Check favorable planets
    if (recipe.planetaryInfluences.favorable) {
      const favorableMatches = (recipe.planetaryInfluences.favorable || []).filter(planet =>
        (alignment.dominantPlanets || []).some(
          dp => dp.name.toLowerCase() === planet.toLowerCase(),
        ),
      ),
      score +=
        ((favorableMatches || []).length / (recipe.planetaryInfluences.favorable || []).length) *
        0.3,
    }

    // Check unfavorable planets (reduce score)
    if (recipe.planetaryInfluences.unfavorable) {
      const unfavorableMatches = (recipe.planetaryInfluences.unfavorable || []).filter(planet =>
        (alignment.dominantPlanets || []).some(
          dp => dp.name.toLowerCase() === planet.toLowerCase(),
        ),
      ),
      score -=
        ((unfavorableMatches || []).length /
          (recipe.planetaryInfluences.unfavorable || []).length) *
        0.2,
    }

    return Math.max(0, Math.min(1, score))
  }

  /**
   * Calculate seasonal compatibility score
   */
  private calculateSeasonalScore(recipe: Recipe, alignment: CelestialAlignment): number {
    // Apply safe type casting for currentSeason access
    const recipeData = recipe as any;
    const currentSeason = recipeData.currentSeason;

    if (!currentSeason || (Array.isArray(currentSeason) && currentSeason.length === 0)) return 0.5,

    // Determine current season from date
    const currentMonth = new Date().getMonth();
    let currentSeasonName = 'spring',

    if (currentMonth >= 2 && currentMonth <= 4) currentSeasonName = 'spring',
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeasonName = 'summer',
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeasonName = 'autumn',
    else currentSeasonName = 'winter',

    const seasonArray = Array.isArray(currentSeason) ? currentSeason : [currentSeason]
    const hasSeasonMatch = seasonArray.some(
      season => season?.toLowerCase() === currentSeasonName || season?.toLowerCase() === 'all',
    ),

    return hasSeasonMatch ? 0.8 : 0.3;
  }

  /**
   * Get all recipes
   */
  public getAllRecipes(): Recipe[] {
    return this.allRecipes
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
  public async getRecipesByCuisine(
    cuisine: string,
    limit = 20,,
    offset = 0
  ): Promise<ScoredRecipe[]> {
    const normalizedCuisine = cuisine.toLowerCase()
    const filteredRecipes = (this.allRecipes || []).filter(
      recipe => recipe.cuisine?.toLowerCase() === normalizedCuisine,
    ),

    // Score each recipe with current astrological influences
    const scoredRecipes: ScoredRecipe[] = []

    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe)
      scoredRecipes.push({,
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      })
    }

    // Sort by astrological compatibility score
    return scoredRecipes.sort((ab) => b.score - a.score)
  }

  /**
   * Get recipes by season with astrological scoring
   */
  public async getRecipesBySeason(season: string, limit = 20, offset = 0): Promise<ScoredRecipe[]> {,
    const normalizedSeason = season.toLowerCase()
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      if (Array.isArray(recipe.currentSeason)) {
        return (recipe.currentSeason || []).some(s => s?.toLowerCase() === normalizedSeason);
      } else if (typeof recipe.currentSeason === 'string') {,
        return recipe.currentSeason.toLowerCase() === normalizedSeason;
      }
      return false;
    })

    // Score with astrological influences
    const scoredRecipes: ScoredRecipe[] = []

    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe)
      scoredRecipes.push({,
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      })
    }

    return scoredRecipes.sort((ab) => b.score - a.score)
  }

  /**
   * Get recipes by meal type with astrological scoring
   */
  public async getRecipesByMealType(
    mealType: string,
    limit = 20,,
    offset = 0
  ): Promise<ScoredRecipe[]> {
    const normalizedMealType = mealType.toLowerCase()
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      if (Array.isArray(recipe.mealType)) {
        return (recipe.mealType || []).some(m => m.toLowerCase() === normalizedMealType);
      } else if (typeof recipe.mealType === 'string') {,
        return recipe.mealType.toLowerCase() === normalizedMealType;
      }
      return false;
    })

    // Score with astrological influences
    const scoredRecipes: ScoredRecipe[] = []

    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe)
      scoredRecipes.push({,
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      })
    }

    return scoredRecipes.sort((ab) => b.score - a.score)
  }

  /**
   * Get recipes by zodiac sign with full astrological integration
   */
  public async getRecipesByZodiacSign(
    currentZodiacSign: string,
    limit = 20,,
    offset = 0
  ): Promise<ScoredRecipe[]> {
    const normalizedZodiacSign = currentZodiacSign.toLowerCase()
    const filteredRecipes = (this.allRecipes || []).filter(recipe => {
      return (recipe.zodiacInfluences || []).some(
        sign => sign.toLowerCase() === normalizedZodiacSign,,
      )
    })

    // Score with full astrological analysis
    const scoredRecipes: ScoredRecipe[] = []

    for (const recipe of filteredRecipes.slice(offset, offset + limit)) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe)
      scoredRecipes.push({,
        ...recipe,
        score: alchemicalScore.score,
        alchemicalScores: alchemicalScore.breakdown
      })
    }

    return scoredRecipes.sort((ab) => b.score - a.score)
  }

  /**
   * Get best recipe matches based on provided criteria with full astrological integration
   */
  public async getBestRecipeMatches(options: {
    criteria: RecipeMatchCriteria,
    limit?: number,
    offset?: number
  }): Promise<ScoredRecipe[]> {
    const { criteria, _limit = 10, offset = 0} = options,

    // Get current celestial alignment (this will use real astrologize API data)
    const _alignment = await this.getCurrentCelestialAlignment()

    // Start with all recipes;
    let candidateRecipes = [...this.allRecipes],

    // Apply basic filters based on criteria
    if (criteria.cuisine) {
      candidateRecipes = candidateRecipes.filter(
        r => r.cuisine?.toLowerCase() === criteria.cuisine?.toLowerCase(),,
      )
    }

    // Enhanced seasonal filtering with safe type casting
    if (criteria.currentSeason || criteria.season) {
      const seasonCriteria = criteria.currentSeason || criteria.season;
      candidateRecipes = candidateRecipes.filter(recipe => {;
        const recipeData = recipe as any,
        const recipeCurrentSeason = recipeData.currentSeason

        if (Array.isArray(recipeCurrentSeason)) {
          return recipeCurrentSeason.some(s => s?.toLowerCase() === seasonCriteria?.toLowerCase());
        } else if (typeof recipeCurrentSeason === 'string') {,
          return recipeCurrentSeason.toLowerCase() === seasonCriteria?.toLowerCase()
        }
        return false;
      })
    }

    if (criteria.mealType) {
      candidateRecipes = candidateRecipes.filter(recipe => {
        if (Array.isArray(recipe.mealType)) {
          return (recipe.mealType || []).some(
            m => m.toLowerCase() === criteria.mealType?.toLowerCase(),,
          )
        } else if (typeof recipe.mealType === 'string') {,
          return recipe.mealType.toLowerCase() === criteria.mealType?.toLowerCase()
        }
        return false;
      })
    }

    // Apply dietary filters
    if (
      Array.isArray(criteria.dietaryPreferences)
        ? criteria.dietaryPreferences.includes('vegetarian')
        : criteria.dietaryPreferences === 'vegetarian',
    ) {
      candidateRecipes = candidateRecipes.filter(r => r.isVegetarian);
    }

    if (
      Array.isArray(criteria.dietaryPreferences)
        ? criteria.dietaryPreferences.includes('vegan')
        : criteria.dietaryPreferences === 'vegan',
    ) {
      candidateRecipes = candidateRecipes.filter(r => r.isVegan);
    }

    if (
      Array.isArray(criteria.dietaryPreferences)
        ? criteria.dietaryPreferences.includes('glutenFree')
        : criteria.dietaryPreferences === 'glutenFree',
    ) {
      candidateRecipes = candidateRecipes.filter(r => r.isGlutenFree);
    }

    if (
      Array.isArray(criteria.dietaryPreferences)
        ? criteria.dietaryPreferences.includes('dairyFree')
        : criteria.dietaryPreferences === 'dairyFree',
    ) {
      candidateRecipes = candidateRecipes.filter(r => r.isDairyFree);
    }

    // Score recipes with full astrological, alchemical, and thermodynamic analysis
    const scoredRecipes: ScoredRecipe[] = [],

    for (const recipe of candidateRecipes) {
      const alchemicalScore = await this.calculateAlchemicalScore(recipe);
      let finalScore = alchemicalScore.score,

      // Enhanced elemental compatibility scoring with safe type casting
      if (criteria.elementalState && recipe.elementalState) {
        const criteriaElementalState = criteria.elementalState;
        const recipeElementalState = recipe.elementalState

        const criteriaCompatibility = calculateElementalCompatibility(
          criteriaElementalState as unknown as ElementalProperties,
          recipeElementalState as unknown as ElementalProperties,
        ),
        finalScore = (finalScore + criteriaCompatibility) / 2,
      }

      // Score based on ingredients match
      if ((criteria.ingredients || []).length) {
        const matchingIngredients = (recipe.ingredients || []).filter(i =>,
          (criteria.ingredients || []).some(ci => i.name.toLowerCase().includes(ci.toLowerCase())),
        )

        const ingredientMatchRatio =
          (matchingIngredients || []).length / (criteria.ingredients || []).length,
        finalScore *= 1 + ingredientMatchRatio * 0.2,
      }

      scoredRecipes.push({
        ...recipe,
        score: Math.min(1, finalScore),
        alchemicalScores: alchemicalScore.breakdown
      })
    }

    // Sort by score (descending) and apply pagination
    return scoredRecipes.sort((ab) => b.score - a.score).slice(offset, offset + limit)
  }

  /**
   * Get current celestial influence data for display
   */
  public async getCurrentCelestialInfluence(): Promise<CelestialAlignment> {
    return await this.getCurrentCelestialAlignment()
  }

  /**
   * Force refresh of astrological data
   */
  public async refreshAstrologicalData(): Promise<void> {
    await this.getCurrentCelestialAlignment(true)
  }
}

export default DirectRecipeService,
