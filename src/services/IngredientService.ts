import { unifiedIngredients } from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type {
  ElementalProperties,
  PlanetName,
  Season,
  ThermodynamicMetrics,
} from "@/types/alchemy";
import type { Recipe } from "@/types/unified";
import { logger } from "@/utils/logger";
import { calculateFlavorMatch } from "@/data/unified/flavorCompatibilityLayer";
import { calculateSeasonalCompatibility as calcSeasonalCompat } from "@/constants/seasonalCore";
import { calculateThermodynamicCompatibility } from "@/utils/enhancedCompatibilityScoring";

// Import the ingredient service interface
import type {
  ElementalFilter,
  IngredientFilter,
  IngredientRecommendationOptions,
  IngredientServiceInterface,
} from "./interfaces/IngredientServiceInterface";

// Import unified ingredient data

/**
 * Consolidated Ingredient Service
 *
 * A unified service for all ingredient-related operations that implements
 * the IngredientServiceInterface. This service provides access to ingredient
 * data and performs various filtering and analysis operations.
 */
export class IngredientService implements IngredientServiceInterface {
  private static instance: IngredientService;
  private ingredientCache: Map<string, UnifiedIngredient[]> = new Map();
  private flatIngredientCache: UnifiedIngredient[] | null = null;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.loadIngredients();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): IngredientService {
    if (!IngredientService.instance) {
      IngredientService.instance = new IngredientService();
    }
    return IngredientService.instance;
  }

  /**
   * Load ingredients from unified data source
   */
  private loadIngredients(): void {
    try {
      // Use the unified ingredients data - wrap each ingredient in an array
      this.ingredientCache = new Map(
        Object.entries(unifiedIngredients).map(([k, v]) => [k, [v]]),
      );
      this.flatIngredientCache = null; // Reset flat cache
      logger.debug(
        `Loaded ingredients from ${this.ingredientCache.size} categories`,
      );
    } catch (error) {
      logger.error("Error loading ingredients:", error);
    }
  }

  /**
   * Get all available ingredients organized by category
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
    if (this.flatIngredientCache) {
      return [...this.flatIngredientCache];
    }

    const allIngredients: UnifiedIngredient[] = [];
    for (const ingredients of this.ingredientCache.values()) {
      allIngredients.push(...ingredients);
    }

    this.flatIngredientCache = allIngredients;
    return [...allIngredients];
  }

  /**
   * Get ingredient by name (case-insensitive)
   */
  getIngredientByName(name: string): UnifiedIngredient | undefined {
    const normalizedName = name.toLowerCase().trim();
    const allIngredients = this.getAllIngredientsFlat();

    return allIngredients.find((ingredient) =>
      ingredient.name.toLowerCase().includes(normalizedName),
    );
  }

  /**
   * Get ingredients by category
   */
  getIngredientsByCategory(category: string): UnifiedIngredient[] {
    const normalizedCategory = category.toLowerCase().trim();
    return this.ingredientCache.get(normalizedCategory) || [];
  }

  /**
   * Get ingredients by subcategory
   */
  getIngredientsBySubcategory(subcategory: string): UnifiedIngredient[] {
    const normalizedSubcategory = subcategory.toLowerCase().trim();
    const allIngredients = this.getAllIngredientsFlat();

    return allIngredients.filter((ingredient) =>
      ingredient.subcategory?.toLowerCase().includes(normalizedSubcategory),
    );
  }

  /**
   * Filter ingredients based on multiple criteria
   */
  filterIngredients(
    filter: IngredientFilter,
  ): Record<string, UnifiedIngredient[]> {
    let filteredIngredients = this.getAllIngredientsFlat();

    // Apply search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredIngredients = filteredIngredients.filter(
        (ingredient) =>
          ingredient.name.toLowerCase().includes(query) ||
          ingredient.category.toLowerCase().includes(query) ||
          ingredient.subcategory?.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (filter.categories && filter.categories.length > 0) {
      filteredIngredients = filteredIngredients.filter((ingredient) =>
        filter.categories!.some((cat) =>
          ingredient.category.toLowerCase().includes(cat.toLowerCase()),
        ),
      );
    }

    // Apply seasonal filter
    if (filter.season && filter.season.length > 0) {
      filteredIngredients = filteredIngredients.filter((ingredient) => {
        if (!ingredient.season) return false;
        const ingredientSeasons = Array.isArray(ingredient.season)
          ? ingredient.season
          : [ingredient.season];
        return filter.season!.some((season) =>
          ingredientSeasons.some((ingSeason: string) =>
            ingSeason.toLowerCase().includes(season.toLowerCase()),
          ),
        );
      });
    }

    // Apply dietary filters
    if (filter.dietary) {
      filteredIngredients = filteredIngredients.filter((ingredient) => {
        if (filter.dietary!.isVegetarian && !ingredient.isVegetarian)
          return false;
        if (filter.dietary!.isVegan && !ingredient.isVegan) return false;
        if (filter.dietary!.isGlutenFree && !ingredient.isGlutenFree)
          return false;
        if (filter.dietary!.isDAiryFree && !ingredient.isDairyFree)
          return false;
        return true;
      });
    }

    // Apply elemental filters
    if (filter.elemental) {
      filteredIngredients = filteredIngredients.filter((ingredient) => {
        if (!ingredient.elementalProperties) return false;

        const elem = filter.elemental!;
        const props = ingredient.elementalProperties;

        if (elem.minfire !== undefined && props.Fire < elem.minfire)
          return false;
        if (elem.maxfire !== undefined && props.Fire > elem.maxfire)
          return false;
        if (elem.minwater !== undefined && props.Water < elem.minwater)
          return false;
        if (elem.maxwater !== undefined && props.Water > elem.maxwater)
          return false;
        if (elem.minearth !== undefined && props.Earth < elem.minearth)
          return false;
        if (elem.maxearth !== undefined && props.Earth > elem.maxearth)
          return false;
        if (elem.minAir !== undefined && props.Air < elem.minAir) return false;
        if (elem.maxAir !== undefined && props.Air > elem.maxAir) return false;

        return true;
      });
    }

    // Apply exclusions
    if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
      filteredIngredients = filteredIngredients.filter(
        (ingredient) =>
          !filter.excludeIngredients!.some((excluded) =>
            ingredient.name.toLowerCase().includes(excluded.toLowerCase()),
          ),
      );
    }

    // Group by category for return
    const result: Record<string, UnifiedIngredient[]> = {};
    for (const ingredient of filteredIngredients) {
      const category = ingredient.category || "uncategorized";
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(ingredient);
    }

    return result;
  }

  /**
   * Get ingredients by elemental properties
   */
  getIngredientsByElement(
    elementalFilter: ElementalFilter,
  ): UnifiedIngredient[] {
    const filter: IngredientFilter = { elemental: elementalFilter };
    const filtered = this.filterIngredients(filter);

    // Flatten the results
    const result: UnifiedIngredient[] = [];
    for (const ingredients of Object.values(filtered)) {
      result.push(...ingredients);
    }
    return result;
  }

  /**
   * Get ingredients by flavor profile
   */
  getIngredientsByFlavor(
    flavorProfile: { [key: string]: number },
    minMatchScore = 0.5,
  ): UnifiedIngredient[] {
    // Get all ingredients
    const allIngredients = this.getAllIngredientsFlat();

    // If no flavor profile provided, return all ingredients
    if (!flavorProfile) {
      return allIngredients;
    }

    try {
      // Calculate flavor match score for each ingredient using imported function
      const ingredientsWithScores = allIngredients
        .map((ingredient) => {
          if (!ingredient.flavorProfile) {
            return { ingredient, score: 0.5 }; // Default score for ingredients without flavor profile
          }

          const score = calculateFlavorMatch(
            flavorProfile,
            ingredient.flavorProfile,
          );
          return { ingredient, score };
        })
        .filter((item) => item.score >= minMatchScore) // Use provided threshold
        .sort((a, b) => b.score - a.score); // Sort by score descending

      return ingredientsWithScores.map((item) => item.ingredient);
    } catch (error) {
      // Fallback to returning all ingredients if flavor matching fails
      return allIngredients;
    }
  }

  /**
   * Get ingredients by season
   */
  getIngredientsBySeason(season: Season | Season[]): UnifiedIngredient[] {
    const seasons = Array.isArray(season) ? season : [season];
    const filter: IngredientFilter = { season: seasons };
    const filtered = this.filterIngredients(filter);

    const result: UnifiedIngredient[] = [];
    for (const ingredients of Object.values(filtered)) {
      result.push(...ingredients);
    }
    return result;
  }

  /**
   * Get ingredients by planetary influence
   */
  getIngredientsByPlanet(planet: PlanetName): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat();
    return allIngredients.filter(
      (ingredient) => ingredient.planetaryRuler === planet,
    );
  }

  /**
   * Get ingredients by zodiac sign
   */
  getIngredientsByZodiacSign(sign: string): UnifiedIngredient[] {
    const allIngredients = this.getAllIngredientsFlat();
    return allIngredients.filter((ingredient) => {
      const influences = (ingredient.astrologicalInfluences || []) as any[];
      return influences.some((influence: string) =>
        influence.toLowerCase().includes(sign.toLowerCase()),
      );
    });
  }

  /**
   * Get recommended ingredients based on elemental state
   */
  getRecommendedIngredients(
    elementalState: ElementalProperties,
    options: IngredientRecommendationOptions = {},
  ): UnifiedIngredient[] {
    let candidates = this.getAllIngredientsFlat();

    // Filter by elemental compatibility
    candidates = candidates.filter((ingredient) => {
      if (!ingredient.elementalProperties) return false;

      const compatibility = this.calculateElementalCompatibility(
        elementalState,
        ingredient.elementalProperties,
      );
      return compatibility >= 0.5; // Minimum compatibility threshold
    });

    // Apply options
    if (options.categories && options.categories.length > 0) {
      candidates = candidates.filter((ingredient) =>
        options.categories!.some((cat) =>
          ingredient.category.toLowerCase().includes(cat.toLowerCase()),
        ),
      );
    }

    if (options.excludeIngredients && options.excludeIngredients.length > 0) {
      candidates = candidates.filter(
        (ingredient) =>
          !options.excludeIngredients!.some((excluded) =>
            ingredient.name.toLowerCase().includes(excluded.toLowerCase()),
          ),
      );
    }

    // Sort by elemental compatibility
    candidates.sort((a, b) => {
      const compatA = this.calculateElementalCompatibility(
        elementalState,
        a.elementalProperties,
      );
      const compatB = this.calculateElementalCompatibility(
        elementalState,
        b.elementalProperties,
      );
      return compatB - compatA;
    });

    // Apply limit
    if (options.limit && options.limit > 0) {
      candidates = candidates.slice(0, options.limit);
    }

    return candidates;
  }

  /**
   * Calculate compatibility between two ingredients
   */
  calculateIngredientCompatibility(
    ingredient1: string | UnifiedIngredient,
    ingredient2: string | UnifiedIngredient,
  ): {
    score: number;
    elementalCompatibility: number;
    flavorCompatibility: number;
    seasonalCompatibility: number;
    energeticCompatibility: number;
  } {
    const ing1 =
      typeof ingredient1 === "string"
        ? this.getIngredientByName(ingredient1)
        : ingredient1;
    const ing2 =
      typeof ingredient2 === "string"
        ? this.getIngredientByName(ingredient2)
        : ingredient2;

    if (!ing1 || !ing2) {
      return {
        score: 0,
        elementalCompatibility: 0,
        flavorCompatibility: 0,
        seasonalCompatibility: 0,
        energeticCompatibility: 0,
      };
    }

    // Elemental compatibility
    const elementalCompatibility =
      ing1.elementalProperties && ing2.elementalProperties
        ? this.calculateElementalCompatibility(
            ing1.elementalProperties,
            ing2.elementalProperties,
          )
        : 0;

    // Calculate flavor compatibility using available flavor profiles
    let flavorCompatibility = 0.7; // Default value
    try {
      if (ing1.flavorProfile && ing2.flavorProfile) {
        flavorCompatibility = calculateFlavorMatch(
          ing1.flavorProfile,
          ing2.flavorProfile,
        );
      }
    } catch (error) {
      // Fallback to default if calculation fails
      flavorCompatibility = 0.7;
    }

    // Calculate seasonal compatibility
    let seasonalCompatibility = 0.8; // Default value
    try {
      // If both ingredients have seasonal properties, calculate compatibility
      if (
        ing1.seasons &&
        Array.isArray(ing1.seasons) &&
        ing1.seasons.length > 0 &&
        ing2.seasons &&
        Array.isArray(ing2.seasons) &&
        ing2.seasons.length > 0
      ) {
        // Average compatibility across all season combinations
        let totalCompat = 0;
        let count = 0;
        for (const s1 of ing1.seasons) {
          for (const s2 of ing2.seasons) {
            totalCompat += calcSeasonalCompat(s1, s2);
            count++;
          }
        }
        seasonalCompatibility = count > 0 ? totalCompat / count : 0.8;
      }
    } catch (error) {
      // Fallback to default if calculation fails
      seasonalCompatibility = 0.8;
    }

    // Calculate energetic compatibility based on alchemical properties if available
    let energeticCompatibility = 0.75; // Default value
    try {
      // Use thermodynamic properties if available for energetic compatibility
      if (
        (ing1 as any).thermodynamicProperties &&
        (ing2 as any).thermodynamicProperties
      ) {
        const thermoCompat = calculateThermodynamicCompatibility(
          (ing1 as any).thermodynamicProperties,
          (ing2 as any).thermodynamicProperties,
        );
        energeticCompatibility = thermoCompat.overall;
      }
    } catch (error) {
      // Fallback to default if calculation fails
      energeticCompatibility = 0.75;
    }

    const score =
      elementalCompatibility * 0.4 +
      flavorCompatibility * 0.3 +
      seasonalCompatibility * 0.2 +
      energeticCompatibility * 0.1;

    return {
      score,
      elementalCompatibility,
      flavorCompatibility,
      seasonalCompatibility,
      energeticCompatibility,
    };
  }

  /**
   * Suggest alternative ingredients
   */
  suggestAlternativeIngredients(
    ingredientName: string,
    options: {
      category?: string;
      similarityThreshold?: number;
      maxResults?: number;
    } = {},
  ): Array<{ ingredient: UnifiedIngredient; similarityScore: number }> {
    const baseIngredient = this.getIngredientByName(ingredientName);
    if (!baseIngredient) {
      return [];
    }

    let candidates = this.getAllIngredientsFlat();

    // Filter by category if specified
    if (options.category) {
      candidates = candidates.filter((ing) =>
        ing.category.toLowerCase().includes(options.category!.toLowerCase()),
      );
    }

    // Calculate similarity scores
    const alternatives = candidates
      .filter((ing) => ing.name !== baseIngredient.name)
      .map((ingredient) => {
        const compatibility = this.calculateIngredientCompatibility(
          baseIngredient,
          ingredient,
        );
        return {
          ingredient,
          similarityScore: compatibility.score,
        };
      })
      .filter(
        (item) => item.similarityScore >= (options.similarityThreshold || 0.5),
      )
      .sort((a, b) => b.similarityScore - a.similarityScore);

    // Apply limit
    if (options.maxResults && options.maxResults > 0) {
      return alternatives.slice(0, options.maxResults);
    }

    return alternatives;
  }

  /**
   * Analyze recipe ingredients
   */
  analyzeRecipeIngredients(recipe: Recipe): {
    overallHarmony: number;
    flavorProfile: { [key: string]: number };
    strongPairings: Array<{ ingredients: string[]; score: number }>;
    weakPairings: Array<{ ingredients: string[]; score: number }>;
  } {
    // Simplified analysis - in a full implementation this would be more sophisticated
    const ingredients = recipe.ingredients || [];
    const ingredientNames = ingredients
      .map((ing: any) => ing.name || "")
      .filter(Boolean);

    // Calculate overall harmony (simplified)
    const overallHarmony = 0.8; // Placeholder

    // Flavor profile (simplified)
    const flavorProfile: { [key: string]: number } = {
      sweet: 0.2,
      sour: 0.1,
      salty: 0.3,
      bitter: 0.1,
      umami: 0.3,
    };

    // Pairings (simplified)
    const strongPairings: Array<{ ingredients: string[]; score: number }> = [];
    const weakPairings: Array<{ ingredients: string[]; score: number }> = [];

    return {
      overallHarmony,
      flavorProfile,
      strongPairings,
      weakPairings,
    };
  }

  /**
   * Enhance ingredient with elemental properties
   */
  enhanceIngredientWithElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): UnifiedIngredient {
    const enhanced = {
      id: ingredient.id || `ingredient_${Date.now()}`,
      name: ingredient.name || "Unknown Ingredient",
      category: ingredient.category || "uncategorized",
      elementalProperties: ingredient.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      ...ingredient,
    } as UnifiedIngredient;

    return enhanced;
  }

  /**
   * Get ingredients with high Kalchm values
   */
  getHighKalchmIngredients(threshold = 0.5): UnifiedIngredient[] {
    return this.getAllIngredientsFlat().filter(
      (ingredient) =>
        ingredient.kalchm !== undefined && ingredient.kalchm >= threshold,
    );
  }

  /**
   * Find complementary ingredients
   */
  findComplementaryIngredients(
    ingredient: UnifiedIngredient | string,
    maxResults = 5,
  ): UnifiedIngredient[] {
    const baseIngredient =
      typeof ingredient === "string"
        ? this.getIngredientByName(ingredient)
        : ingredient;

    if (!baseIngredient) {
      return [];
    }

    return this.getRecommendedIngredients(
      baseIngredient.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      { limit: maxResults },
    );
  }

  /**
   * Calculate elemental properties for an ingredient
   */
  calculateElementalProperties(
    ingredient: Partial<UnifiedIngredient>,
  ): ElementalProperties {
    // Return existing properties or defaults
    return (
      ingredient.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      }
    );
  }

  /**
   * Calculate thermodynamic metrics
   */
  calculateThermodynamicMetrics(
    ingredient: UnifiedIngredient,
  ): ThermodynamicMetrics {
    // Simplified thermodynamic calculation
    if (!ingredient.elementalProperties) {
      return {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        gregsEnergy: 0,
        kalchm: ingredient.kalchm || 0,
        monica: ingredient.monica || 0,
      };
    }

    const {
      Fire = 0,
      Water = 0,
      Earth = 0,
      Air = 0,
    } = ingredient.elementalProperties;

    // Heat: Fire + Air (active elements)
    const heat = (Fire + Air) / 2;

    // Entropy: Air + Fire (chaotic elements)
    const entropy = (Air + Fire) / 2;

    // Reactivity: Fire + Water (opposing elements create reactivity)
    const reactivity = Math.abs(Fire - Water) / 2;

    // Greg's Energy: Balance between heat and entropy
    const gregsEnergy = heat - entropy * reactivity;

    return {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
      kalchm: ingredient.kalchm || 0,
      monica: ingredient.monica || 0,
    };
  }

  /**
   * Calculate elemental compatibility between two property sets
   */
  private calculateElementalCompatibility(
    props1: ElementalProperties,
    props2: ElementalProperties,
  ): number {
    // Simple compatibility calculation based on elemental balance
    const elements = ["Fire", "Water", "Earth", "Air"] as const;

    let totalCompatibility = 0;
    let elementCount = 0;

    for (const element of elements) {
      const val1 = props1[element] || 0;
      const val2 = props2[element] || 0;

      if (val1 > 0 && val2 > 0) {
        // Same element reinforcement (like strengthens like)
        totalCompatibility += Math.min(val1, val2);
        elementCount++;
      }
    }

    // Return average compatibility or minimum score
    return elementCount > 0 ? totalCompatibility / elementCount : 0.5;
  }

  /**
   * Clear the ingredient cache
   */
  clearCache(): void {
    this.ingredientCache.clear();
    this.flatIngredientCache = null;
    logger.debug("Ingredient cache cleared");
  }
}

// Export singleton instance
export const ingredientService = IngredientService.getInstance();
