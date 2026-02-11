// Type imports
import type { AstrologicalState, ElementalProperties } from "@/types/alchemy";

// Internal imports
import { createLogger } from "@/utils/logger";
import { compatibilityToMatchPercentage } from "@/utils/enhancedCompatibilityScoring";
import { calculateKineticProperties } from "@/utils/kineticCalculations";
import type { ThermodynamicMetrics } from "@/utils/kineticCalculations";

// Logger
const logger = createLogger("EnhancedCuisineRecommender");

// Recipe interface for internal use in enhanced recommender
interface RecipeData {
  name?: string;
  id?: string;
  tags?: string[];
  description?: string;
  ingredients?: unknown[];
  season?: string[];
  mealType?: string[];
  dietaryInfo?: string[];
  planetary?: string[];
  zodiac?: string[];
  lunar?: string[];
  flavorProfile?: Record<string, number>;
  timeToMake?: number;
  spiceLevel?: number | string;
  preparationSteps?: string[];
  instructions?: string[];
  elementalProperties?: ElementalProperties | Record<string, number>;
  astrologicalAffinities?: {
    planets?: string[];
    zodiac?: string[];
    lunar?: string[];
  };
  zodiacInfluences?: string[];
  lunarPhaseInfluences?: string[];
  allergens?: string[];
}

interface EnhancedRecipeMatch {
  cuisine: string;
  recipeName: string;
  recipeId: string;
  matchPercentage: number;
  seasonalScore: number;
  planetaryDayScore: number;
  planetaryHourScore: number;
  elementalScore: number;
  astrologicalScore: number;
  timeOfDayScore: number;
  kineticScore: number;
  tags: string[];
  description: string;
  ingredients: unknown[];
  season: string[];
  mealType: string[];
}

interface TimeFactors {
  planetaryDay: PlanetaryDay;
  planetaryHour: PlanetaryHour;
  timeOfDay: TimeOfDay;
  currentSeason: Season;
  currentDate: Date;
}

type PlanetaryDay =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn";
type PlanetaryHour = PlanetaryDay;
type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
type Season = "spring" | "summer" | "autumn" | "winter";
/**
 * Enhanced cuisine-specific recipe recommender that incorporates:
 * - Day of week (planetary day)
 * - Hour and minute (planetary hours)
 * - Astrological matching
 * - Seasonal factors
 * - Uniform recipe structure across cuisine files
 */
export class EnhancedCuisineRecommender {
  private static instance: EnhancedCuisineRecommender;

  private constructor() {}

  public static getInstance(): EnhancedCuisineRecommender {
    if (!EnhancedCuisineRecommender.instance) {
      EnhancedCuisineRecommender.instance = new EnhancedCuisineRecommender();
    }
    return EnhancedCuisineRecommender.instance;
  }

  /**
   * Get enhanced recipe recommendations for a specific cuisine
   *
   * @param cuisineName Name of the cuisine
   * @param astroState Current astrological state
   * @param count Number of recommendations to return
   * @param mealType Optional meal type filter
   * @param dietaryRestrictions Optional dietary restrictions
   * @returns Array of recipe matches with detailed match scores
   */
  public getRecommendationsForCuisine(
    cuisineName: string,
    astroState: AstrologicalState,
    count = 5,
    mealType?: string,
    dietaryRestrictions?: string[],
  ): EnhancedRecipeMatch[] {
    try {
      // Get recipes for the specified cuisine
      const recipes = this.getRecipesForCuisine(cuisineName);
      if (!recipes || recipes.length === 0) {
        logger.warn(`No recipes found for cuisine: ${cuisineName}`);
        return [];
      }

      // Calculate matches for each recipe
      const matches = recipes.map((recipe) =>
        this.calculateRecipeMatch(
          recipe,
          cuisineName,
          astroState,
          mealType,
          dietaryRestrictions,
        ),
      );

      // Sort by match percentage and return top results
      return matches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, count);
    } catch (error) {
      logger.error("Error getting recommendations for cuisine:", {
        cuisineName,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Get recipes for a specific cuisine
   */
  private getRecipesForCuisine(cuisineName: string): RecipeData[] {
    // This would typically load recipes from the cuisine data files
    // For now, return empty array - can be expanded
    return [];
  }

  /**
   * Calculate match score for a recipe
   */
  private calculateRecipeMatch(
    recipe: RecipeData,
    cuisineName: string,
    astroState: AstrologicalState,
    mealType?: string,
    dietaryRestrictions?: string[],
  ): EnhancedRecipeMatch {
    try {
      // Calculate individual scores
      const seasonalScore = this.calculateSeasonalScore(recipe);
      const planetaryDayScore = this.calculatePlanetaryDayScore(
        recipe,
        astroState,
      );
      const planetaryHourScore = this.calculatePlanetaryHourScore(
        recipe,
        astroState,
      );
      const elementalScore = this.calculateElementalScore(recipe, astroState);
      const astrologicalScore = this.calculateAstrologicalScore(
        recipe,
        astroState,
      );
      const timeOfDayScore = this.calculateTimeOfDayScore(recipe);
      const kineticScore = this.calculateKineticScore(recipe, astroState);

      // Calculate overall match score (0-1 range) with kinetics integration
      // Adjusted weights to include kinetics (0.13) while maintaining balance
      const overallScore =
        seasonalScore * 0.17 + // Seasonal (reduced from 0.20)
        planetaryDayScore * 0.13 + // Planetary day (reduced from 0.15)
        planetaryHourScore * 0.12 + // Planetary hour (reduced from 0.15)
        elementalScore * 0.22 + // Elemental (reduced from 0.25)
        astrologicalScore * 0.13 + // Astrological (reduced from 0.15)
        timeOfDayScore * 0.1 + // Time of day (same)
        kineticScore * 0.13; // Kinetic (NEW - P=IV circuit model)

      // Convert to match percentage with enhanced differentiation
      const matchPercentage = compatibilityToMatchPercentage(overallScore);

      return {
        cuisine: cuisineName,
        recipeName: recipe.name || "Unknown Recipe",
        recipeId: recipe.id || "unknown",
        matchPercentage,
        seasonalScore,
        planetaryDayScore,
        planetaryHourScore,
        elementalScore,
        astrologicalScore,
        timeOfDayScore,
        kineticScore,
        tags: recipe.tags || [],
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        season: recipe.season || [],
        mealType: recipe.mealType || [],
      };
    } catch (error) {
      logger.error("Error calculating recipe match:", {
        recipe: recipe.name,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return default match with low score
      return {
        cuisine: cuisineName,
        recipeName: recipe.name || "Unknown Recipe",
        recipeId: recipe.id || "unknown",
        matchPercentage: 0.1,
        seasonalScore: 0.5,
        planetaryDayScore: 0.5,
        planetaryHourScore: 0.5,
        elementalScore: 0.5,
        astrologicalScore: 0.5,
        timeOfDayScore: 0.5,
        kineticScore: 0.5,
        tags: recipe.tags || [],
        description: recipe.description || "",
        ingredients: recipe.ingredients || [],
        season: recipe.season || [],
        mealType: recipe.mealType || [],
      };
    }
  }

  /**
   * Calculate seasonal compatibility score
   */
  private calculateSeasonalScore(recipe: RecipeData): number {
    // Simple implementation - can be expanded
    return 0.7;
  }

  /**
   * Calculate planetary day compatibility score
   */
  private calculatePlanetaryDayScore(
    recipe: RecipeData,
    astroState: AstrologicalState,
  ): number {
    // Simple implementation - can be expanded
    return 0.6;
  }

  /**
   * Calculate planetary hour compatibility score
   */
  private calculatePlanetaryHourScore(
    recipe: RecipeData,
    astroState: AstrologicalState,
  ): number {
    // Simple implementation - can be expanded
    return 0.6;
  }

  /**
   * Calculate elemental compatibility score
   */
  private calculateElementalScore(
    recipe: RecipeData,
    astroState: AstrologicalState,
  ): number {
    // Simple implementation - can be expanded
    return 0.7;
  }

  /**
   * Calculate astrological compatibility score
   */
  private calculateAstrologicalScore(
    recipe: RecipeData,
    astroState: AstrologicalState,
  ): number {
    // Simple implementation - can be expanded
    return 0.6;
  }

  /**
   * Calculate time of day compatibility score
   */
  private calculateTimeOfDayScore(recipe: RecipeData): number {
    // Simple implementation - can be expanded
    return 0.8;
  }

  /**
   * Calculate kinetic compatibility score using P=IV circuit model
   * Evaluates temporal power dynamics, force, and transformation potential
   */
  private calculateKineticScore(
    recipe: RecipeData,
    astroState: AstrologicalState,
  ): number {
    try {
      // Extract elemental properties from recipe
      const elementalProps = recipe.elementalProperties || {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };

      const Fire =
        typeof elementalProps.Fire === "number" ? elementalProps.Fire : 0.25;
      const Water =
        typeof elementalProps.Water === "number" ? elementalProps.Water : 0.25;
      const Earth =
        typeof elementalProps.Earth === "number" ? elementalProps.Earth : 0.25;
      const Air =
        typeof elementalProps.Air === "number" ? elementalProps.Air : 0.25;

      // Estimate ESMS from elements (same approach as ingredient recommender)
      const Spirit = (Fire + Air) / 2;
      const Essence = Water;
      const Matter = Earth;
      const Substance = (Fire + Water) / 2;

      // Calculate thermodynamic properties
      const elementSum = Substance + Essence + Matter + Water + Air + Earth;
      const heat =
        elementSum > 0
          ? (Math.pow(Spirit, 2) + Math.pow(Fire, 2)) / Math.pow(elementSum, 2)
          : 0.08;

      const entropyDenom = Essence + Matter + Earth + Water;
      const entropy =
        entropyDenom > 0
          ? (Math.pow(Spirit, 2) +
              Math.pow(Substance, 2) +
              Math.pow(Fire, 2) +
              Math.pow(Air, 2)) /
            Math.pow(entropyDenom, 2)
          : 0.15;

      const reactivityDenom = Matter + Earth;
      const reactivity =
        reactivityDenom > 0
          ? (Math.pow(Spirit, 2) +
              Math.pow(Substance, 2) +
              Math.pow(Essence, 2) +
              Math.pow(Fire, 2) +
              Math.pow(Air, 2) +
              Math.pow(Water, 2)) /
            Math.pow(reactivityDenom, 2)
          : 0.45;

      const gregsEnergy = heat - entropy * reactivity;

      const s = Math.max(0.01, Spirit);
      const e = Math.max(0.01, Essence);
      const m = Math.max(0.01, Matter);
      const sub = Math.max(0.01, Substance);
      const kalchm =
        (Math.pow(s, s) * Math.pow(e, e)) /
        (Math.pow(m, m) * Math.pow(sub, sub));

      let monica = 1.0;
      if (kalchm > 0 && reactivity > 0) {
        const lnKalchm = Math.log(kalchm);
        if (lnKalchm !== 0 && isFinite(lnKalchm)) {
          monica = -gregsEnergy / (reactivity * lnKalchm);
        }
      }

      const thermodynamics: ThermodynamicMetrics = {
        heat,
        entropy,
        reactivity,
        gregsEnergy,
        kalchm,
        monica,
      };

      // Calculate kinetic properties
      const kinetics = calculateKineticProperties(
        { Spirit, Essence, Matter, Substance },
        { Fire, Water, Earth, Air },
        thermodynamics,
      );

      // Score based on kinetic properties for cuisine/recipe matching
      // Power (P=IV) indicates current energy level (normalized -1 to 1 → 0 to 1)
      const powerScore = 0.5 + kinetics.power / 2;

      // Force magnitude for transformation potential (0-10 → 0-1)
      const forceScore = Math.min(1, kinetics.forceMagnitude / 10);

      // Current flow indicates dynamic activity (typical 0-2 → 0-1)
      const currentScore = Math.min(1, kinetics.currentFlow / 2);

      // Combined kinetic score weighted for cuisine matching
      const kineticScore =
        powerScore * 0.4 + // Power is primary indicator
        forceScore * 0.35 + // Force shows transformation
        currentScore * 0.25; // Current shows activity level

      return Math.max(0.1, Math.min(1, kineticScore));
    } catch (error) {
      logger.warn("Error calculating kinetic score", {
        error: error instanceof Error ? error.message : String(error),
      });
      return 0.6; // Default neutral score
    }
  }
}
