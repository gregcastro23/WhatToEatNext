/**
 * PlanetaryRecipeScorer.ts
 *
 * Core scoring engine that ranks recipes from the full 14-cuisine database
 * against the current celestial state (planetary positions, zodiac season,
 * lunar phase, elemental balance) and optional user birth chart data for
 * personalized recommendations.
 */

import { allRecipes } from '@/data/recipes/index';
import type { ElementalProperties } from '@/types/alchemy';
import type { BirthChartData } from '@/types/astrology';
import type { Recipe } from '@/types/recipe';
import { createLogger } from '@/utils/logger';
import { _celestialCalculator as celestialCalculator } from './celestialCalculations';

 

const logger = createLogger('PlanetaryRecipeScorer');

// ─── Scoring Weight Configuration ─────────────────────────────────────────────

interface ScoringWeights {
  elemental: number;
  zodiac: number;
  lunarPhase: number;
  planetary: number;
  seasonal: number;
  timeOfDay: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  elemental: 0.30,
  zodiac: 0.20,
  lunarPhase: 0.15,
  planetary: 0.15,
  seasonal: 0.10,
  timeOfDay: 0.10,
};

// ─── Zodiac-Element Mapping ───────────────────────────────────────────────────

const ZODIAC_ELEMENT_MAP: Record<string, string> = {
  aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
  taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
  gemini: 'Air', libra: 'Air', aquarius: 'Air',
  cancer: 'Water', scorpio: 'Water', pisces: 'Water',
};

// ─── Lunar Phase to Element Affinity ──────────────────────────────────────────

const LUNAR_ELEMENT_AFFINITY: Record<string, Partial<ElementalProperties>> = {
  'new moon':       { Water: 0.4, Earth: 0.3, Fire: 0.1, Air: 0.2 },
  'new_moon':       { Water: 0.4, Earth: 0.3, Fire: 0.1, Air: 0.2 },
  'waxing crescent':{ Fire: 0.3, Air: 0.3, Water: 0.2, Earth: 0.2 },
  'waxing_crescent':{ Fire: 0.3, Air: 0.3, Water: 0.2, Earth: 0.2 },
  'first quarter':  { Fire: 0.4, Air: 0.2, Earth: 0.2, Water: 0.2 },
  'first_quarter':  { Fire: 0.4, Air: 0.2, Earth: 0.2, Water: 0.2 },
  'waxing gibbous': { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
  'waxing_gibbous': { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
  'full moon':      { Fire: 0.3, Water: 0.3, Air: 0.2, Earth: 0.2 },
  'full_moon':      { Fire: 0.3, Water: 0.3, Air: 0.2, Earth: 0.2 },
  'waning gibbous': { Earth: 0.3, Water: 0.3, Fire: 0.2, Air: 0.2 },
  'waning_gibbous': { Earth: 0.3, Water: 0.3, Fire: 0.2, Air: 0.2 },
  'last quarter':   { Earth: 0.4, Water: 0.2, Fire: 0.2, Air: 0.2 },
  'last_quarter':   { Earth: 0.4, Water: 0.2, Fire: 0.2, Air: 0.2 },
  'waning crescent':{ Water: 0.4, Earth: 0.2, Fire: 0.2, Air: 0.2 },
  'waning_crescent':{ Water: 0.4, Earth: 0.2, Fire: 0.2, Air: 0.2 },
};

// ─── Planet-Element Mapping ───────────────────────────────────────────────────

const PLANET_ELEMENT: Record<string, string> = {
  Sun: 'Fire',
  Moon: 'Water',
  Mercury: 'Air',
  Venus: 'Earth',
  Mars: 'Fire',
  Jupiter: 'Fire',
  Saturn: 'Earth',
  Uranus: 'Air',
  Neptune: 'Water',
  Pluto: 'Water',
};

// ─── Season Determination ─────────────────────────────────────────────────────

function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 21) return 'dinner';
  return 'dinner'; // Late night defaults to dinner
}

// ─── Query Parameters ─────────────────────────────────────────────────────────

export interface RecipeQuery {
  count?: number;
  cuisine?: string;
  mealType?: string;
  dietary?: string[];
  preferredIngredients?: string[];
  birthChart?: BirthChartData;
}

// ─── Score Breakdown ──────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  elemental: number;
  zodiac: number;
  lunarPhase: number;
  planetary: number;
  seasonal: number;
  timeOfDay: number;
  birthChartModifier?: number;
  finalScore: number;
}

// ─── Celestial Context (returned to API consumers) ────────────────────────────

export interface CelestialContext {
  currentZodiac: string;
  lunarPhase: string;
  dominantElement: string;
  dominantPlanets: string[];
  season: string;
  timestamp: string;
}

export interface ScoredRecipeResult extends Recipe {
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

// ─── Main Scoring Class ───────────────────────────────────────────────────────

export class PlanetaryRecipeScorer {
  private static instance: PlanetaryRecipeScorer;
  private weights: ScoringWeights;

  private constructor() {
    this.weights = { ...DEFAULT_WEIGHTS };
  }

  static getInstance(): PlanetaryRecipeScorer {
    if (!PlanetaryRecipeScorer.instance) {
      PlanetaryRecipeScorer.instance = new PlanetaryRecipeScorer();
    }
    return PlanetaryRecipeScorer.instance;
  }

  /**
   * Get the current celestial context for metadata output.
   */
  getCelestialContext(): CelestialContext {
    try {
      const alignment = celestialCalculator.calculateCurrentInfluences();
      const zodiac = String(alignment.zodiacSign || 'libra').toLowerCase();
      const lunarPhase = String(alignment.lunarPhase || 'full moon');
      const dominantElement = ZODIAC_ELEMENT_MAP[zodiac] || 'Fire';
      const dominantPlanets = (alignment.dominantPlanets || []).map((p: any) => p.name || String(p));

      return {
        currentZodiac: zodiac,
        lunarPhase,
        dominantElement,
        dominantPlanets,
        season: getCurrentSeason(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error getting celestial context', error);
      return {
        currentZodiac: 'pisces',
        lunarPhase: 'waxing crescent',
        dominantElement: 'Water',
        dominantPlanets: ['Neptune', 'Jupiter'],
        season: getCurrentSeason(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Score and rank all recipes from the full 14-cuisine database.
   */
  async scoreRecipes(query: RecipeQuery = {}): Promise<{
    recipes: ScoredRecipeResult[];
    celestialContext: CelestialContext;
    totalRecipesInDatabase: number;
  }> {
    try {
      // 1. Load all recipes from the flattened cuisine database
      let recipes: Recipe[] = [...allRecipes];
      const totalInDb = recipes.length;
      logger.info(`Loaded ${totalInDb} recipes from 14-cuisine database`);

      // 2. Apply pre-filters (cuisine, mealType, dietary)
      recipes = this.applyFilters(recipes, query);
      logger.info(`${recipes.length} recipes after filters`);

      // 3. Get current celestial state
      const celestialContext = this.getCelestialContext();
      const alignment = celestialCalculator.calculateCurrentInfluences();

      // 4. Score each recipe
      const scored: ScoredRecipeResult[] = recipes.map(recipe => {
        const breakdown = this.calculateScoreBreakdown(recipe, alignment, celestialContext, query.birthChart);
        return {
          ...recipe,
          score: breakdown.finalScore,
          scoreBreakdown: breakdown,
        };
      });

      // 5. Sort by score descending
      scored.sort((a, b) => b.score - a.score);

      // 6. Return top-N
      const count = query.count || 5;
      return {
        recipes: scored.slice(0, count),
        celestialContext,
        totalRecipesInDatabase: totalInDb,
      };
    } catch (error) {
      logger.error('Error scoring recipes', error);
      return {
        recipes: [],
        celestialContext: this.getCelestialContext(),
        totalRecipesInDatabase: allRecipes.length,
      };
    }
  }

  // ─── Pre-Filters ──────────────────────────────────────────────────────

  private applyFilters(recipes: Recipe[], query: RecipeQuery): Recipe[] {
    let filtered = [...recipes];

    // Cuisine filter
    if (query.cuisine) {
      const cuisineLower = query.cuisine.toLowerCase();
      const cuisineFiltered = filtered.filter(r =>
        String(r.cuisine || '').toLowerCase().includes(cuisineLower)
      );
      if (cuisineFiltered.length > 0) {
        filtered = cuisineFiltered;
      }
    }

    // Meal type filter
    if (query.mealType) {
      const mealLower = query.mealType.toLowerCase();
      const mealFiltered = filtered.filter(r => {
        const mealTypes = Array.isArray(r.mealType) ? r.mealType : [r.mealType];
        return mealTypes.some(m => String(m || '').toLowerCase() === mealLower);
      });
      if (mealFiltered.length > 0) {
        filtered = mealFiltered;
      }
    }

    // Dietary restrictions filter
    if (query.dietary && query.dietary.length > 0) {
      const dietaryFiltered = filtered.filter(r => {
        return query.dietary!.every(restriction => {
          const lower = restriction.toLowerCase();
          if (lower === 'vegetarian') return r.isVegetarian;
          if (lower === 'vegan') return r.isVegan;
          if (lower === 'gluten-free' || lower === 'glutenfree') return r.isGlutenFree;
          if (lower === 'dairy-free' || lower === 'dairyfree') return r.isDairyFree;
          return true;
        });
      });
      if (dietaryFiltered.length > 0) {
        filtered = dietaryFiltered;
      }
    }

    // Preferred ingredients filter (soft match — boosts but doesn't exclude)
    // This is handled in scoring, not filtering

    return filtered;
  }

  // ─── Multi-Factor Score Calculation ────────────────────────────────────

  private calculateScoreBreakdown(
    recipe: Recipe,
    alignment: any,
    context: CelestialContext,
    birthChart?: BirthChartData,
  ): ScoreBreakdown {
    const elementalScore = this.scoreElementalAlignment(recipe, alignment);
    const zodiacScore = this.scoreZodiacResonance(recipe, context.currentZodiac);
    const lunarScore = this.scoreLunarPhase(recipe, context.lunarPhase);
    const planetaryScore = this.scorePlanetaryHarmony(recipe, context.dominantPlanets, alignment);
    const seasonalScore = this.scoreSeasonalFit(recipe, context.season);
    const timeScore = this.scoreTimeOfDay(recipe);

    // Weighted sum
    let finalScore =
      this.weights.elemental * elementalScore +
      this.weights.zodiac * zodiacScore +
      this.weights.lunarPhase * lunarScore +
      this.weights.planetary * planetaryScore +
      this.weights.seasonal * seasonalScore +
      this.weights.timeOfDay * timeScore;

    // Apply birth chart modifier if provided
    let birthChartModifier: number | undefined;
    if (birthChart) {
      birthChartModifier = this.calculateBirthChartModifier(recipe, birthChart, context);
      finalScore *= birthChartModifier;
    }

    // Clamp between 0 and 1
    finalScore = Math.min(1, Math.max(0, finalScore));

    return {
      elemental: Math.round(elementalScore * 1000) / 1000,
      zodiac: Math.round(zodiacScore * 1000) / 1000,
      lunarPhase: Math.round(lunarScore * 1000) / 1000,
      planetary: Math.round(planetaryScore * 1000) / 1000,
      seasonal: Math.round(seasonalScore * 1000) / 1000,
      timeOfDay: Math.round(timeScore * 1000) / 1000,
      birthChartModifier: birthChartModifier ? Math.round(birthChartModifier * 1000) / 1000 : undefined,
      finalScore: Math.round(finalScore * 1000) / 1000,
    };
  }

  // ─── Individual Scoring Functions ─────────────────────────────────────

  /**
   * Score elemental alignment: how well the recipe's Fire/Water/Earth/Air
   * matches the current celestial elemental balance.
   */
  private scoreElementalAlignment(recipe: Recipe, alignment: any): number {
    const recipeElements = recipe.elementalProperties;
    if (!recipeElements) return 0.5;

    // Get target elemental balance from celestial alignment
    const target = alignment.elementalBalance || alignment.elementalDominance || {
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25,
    };

    // Calculate cosine similarity between recipe elements and target
    let dotProduct = 0;
    let normRecipe = 0;
    let normTarget = 0;

    for (const element of ['Fire', 'Water', 'Earth', 'Air'] as const) {
      const rv = (recipeElements as any)[element] || 0;
      const tv = (target as Record<string, number>)[element] || 0;
      dotProduct += rv * tv;
      normRecipe += rv * rv;
      normTarget += tv * tv;
    }

    if (normRecipe === 0 || normTarget === 0) return 0.5;

    return dotProduct / (Math.sqrt(normRecipe) * Math.sqrt(normTarget));
  }

  /**
   * Score zodiac resonance: does the recipe's astrological profile
   * match the current zodiac season?
   */
  private scoreZodiacResonance(recipe: Recipe, currentZodiac: string): number {
    const zodiacLower = currentZodiac.toLowerCase();
    const currentElement = ZODIAC_ELEMENT_MAP[zodiacLower] || 'Fire';
    let score = 0.3; // Base score

    // Check zodiac and astrological influences from recipe
    const zodiacInfluences = (recipe as any).zodiacInfluences || [];
    const astroInfluences = (recipe as any).astrologicalInfluences || [];

    // Direct zodiac sign match
    if (Array.isArray(zodiacInfluences) && zodiacInfluences.some((z: string) => z?.toLowerCase() === zodiacLower)) {
      score += 0.5;
    }

    // Zodiac sign mentioned in astrological influences
    if (Array.isArray(astroInfluences) && astroInfluences.some((a: string) => a?.toLowerCase() === zodiacLower)) {
      score += 0.3;
    }

    // Element match: recipe's dominant element aligns with zodiac element
    if (recipe.elementalProperties) {
      const recipeElement = this.getDominantElement(recipe.elementalProperties as ElementalProperties);
      if (recipeElement === currentElement) {
        score += 0.2;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Score lunar phase compatibility.
   */
  private scoreLunarPhase(recipe: Recipe, lunarPhase: string): number {
    const phaseLower = lunarPhase.toLowerCase();
    let score = 0.3;

    // Check direct lunar phase match
    const lunarInfluences = (recipe as any).lunarPhaseInfluences || [];
    if (Array.isArray(lunarInfluences) &&
      lunarInfluences.some((l: string) => l?.toLowerCase().replace(/[_\s]/g, ' ') === phaseLower.replace(/[_\s]/g, ' '))) {
      score += 0.5;
    }

    // Check element affinity of current lunar phase against recipe elements
    const phaseAffinity = LUNAR_ELEMENT_AFFINITY[phaseLower];
    if (phaseAffinity && recipe.elementalProperties) {
      const recipeElement = this.getDominantElement(recipe.elementalProperties as ElementalProperties);
      const affinityElement = this.getDominantElement(phaseAffinity as ElementalProperties);
      if (recipeElement === affinityElement) {
        score += 0.2;
      }
    }

    return Math.min(1, score);
  }

  /**
   * Score planetary harmony: do the recipe's planetary associations
   * align with the currently dominant planets?
   */
  private scorePlanetaryHarmony(
    recipe: Recipe,
    dominantPlanets: string[],
    alignment: any,
  ): number {
    let score = 0.3;

    const astroInfluences = (recipe as any).astrologicalInfluences || [];
    const planetaryInfluences = (recipe as any).planetaryInfluences;

    // Check if recipe's favorable planets match dominant planets
    const favorablePlanets = planetaryInfluences?.favorable || [];
    const unfavorablePlanets = planetaryInfluences?.unfavorable || [];

    for (const planet of dominantPlanets) {
      const planetLower = planet.toLowerCase();

      // Direct planet match in astrological influences
      if (Array.isArray(astroInfluences) && astroInfluences.some((a: string) => a?.toLowerCase() === planetLower)) {
        score += 0.15;
      }

      // Favorable planet match
      if (Array.isArray(favorablePlanets) && favorablePlanets.some((p: string) => p?.toLowerCase() === planetLower)) {
        score += 0.2;
      }

      // Unfavorable planet match (penalty)
      if (Array.isArray(unfavorablePlanets) && unfavorablePlanets.some((p: string) => p?.toLowerCase() === planetLower)) {
        score -= 0.1;
      }
    }

    // Aspect influences: harmonious aspects boost, challenging suggest balance
    const aspects = alignment.aspectInfluences || [];
    for (const aspect of aspects) {
      const aspectType = String(aspect.type || '');
      if (aspectType === 'trine' || aspectType === 'sextile') {
        const aspectPlanets = aspect.planets || [];
        for (const ap of aspectPlanets) {
          if (Array.isArray(astroInfluences) && astroInfluences.some((a: string) => a?.toLowerCase() === ap.toLowerCase())) {
            score += 0.05 * (aspect.influence || 0.5);
          }
        }
      } else if (aspectType === 'square' || aspectType === 'opposition') {
        const aspectElement = PLANET_ELEMENT[aspect.planets?.[0] || ''];
        if (aspectElement && recipe.elementalProperties) {
          const recipeElement = this.getDominantElement(recipe.elementalProperties as ElementalProperties);
          if (this.isComplementaryElement(recipeElement, aspectElement)) {
            score += 0.05;
          }
        }
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Score seasonal fitness.
   */
  private scoreSeasonalFit(recipe: Recipe, currentSeason: string): number {
    if (!recipe.season) return 0.5;

    const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
    const seasonLower = currentSeason.toLowerCase();

    // Map 'autumn' <-> 'fall' equivalence
    const seasonAliases: Record<string, string[]> = {
      autumn: ['autumn', 'fall'],
      fall: ['autumn', 'fall'],
    };
    const equivalents = seasonAliases[seasonLower] || [seasonLower];

    if (seasons.some(s => equivalents.includes(String(s || '').toLowerCase()))) return 1.0;
    if (seasons.some(s => String(s || '').toLowerCase() === 'all')) return 0.7;

    return 0.2; // Off-season
  }

  /**
   * Score time-of-day match.
   */
  private scoreTimeOfDay(recipe: Recipe): number {
    const currentMeal = getTimeOfDay();
    if (!recipe.mealType) return 0.5;

    const mealTypes = Array.isArray(recipe.mealType) ? recipe.mealType : [recipe.mealType];

    if (mealTypes.some(m => String(m || '').toLowerCase() === currentMeal)) return 1.0;

    // Adjacent meal type gets partial credit
    const adjacentMeals: Record<string, string[]> = {
      breakfast: ['brunch', 'snack'],
      lunch: ['brunch', 'appetizer', 'snack'],
      dinner: ['supper', 'main', 'appetizer'],
    };
    const adjacent = adjacentMeals[currentMeal] || [];
    if (mealTypes.some(m => adjacent.includes(String(m || '').toLowerCase()))) return 0.6;

    return 0.2;
  }

  // ─── Birth Chart Personalization ──────────────────────────────────────

  /**
   * Calculate a birth chart modifier (0.5x to 1.5x) that personalizes
   * the base planetary score for a signed-in user.
   */
  private calculateBirthChartModifier(
    recipe: Recipe,
    birthChart: BirthChartData,
    context: CelestialContext,
  ): number {
    let modifier = 1.0;

    // 1. Natal elemental complementing
    if (birthChart.elementalState && recipe.elementalProperties) {
      const natalElements = birthChart.elementalState;
      const recipeElements = recipe.elementalProperties;

      // Find user's weakest element
      let weakestElement = 'Fire';
      let weakestValue = Infinity;
      for (const [element, value] of Object.entries(natalElements)) {
        if (typeof value === 'number' && value < weakestValue) {
          weakestValue = value;
          weakestElement = element;
        }
      }

      // If recipe provides the user's weakest element, boost
      const recipeValue = (recipeElements as Record<string, number>)[weakestElement] || 0;
      if (recipeValue > 0.3) {
        modifier += 0.15;
      } else if (recipeValue > 0.2) {
        modifier += 0.08;
      }

      // If recipe's dominant element matches user's dominant, slight penalty
      const userDominant = this.getDominantElement(natalElements as unknown as ElementalProperties);
      const recipeDominant = this.getDominantElement(recipeElements as ElementalProperties);
      if (userDominant === recipeDominant) {
        modifier -= 0.05;
      }
    }

    // 2. Natal planet emphasis
    if (birthChart.planetaryPositions) {
      const astroInfluences = (recipe as any).astrologicalInfluences || [];

      for (const [planet, position] of Object.entries(birthChart.planetaryPositions)) {
        const strength = typeof position === 'number' ? position : 0;
        if (strength > 10) {
          if (Array.isArray(astroInfluences) && astroInfluences.some((a: string) => a?.toLowerCase() === planet.toLowerCase())) {
            modifier += 0.08;
          }
        }
      }
    }

    // 3. Transit-to-natal: ascendant element matching
    if (birthChart.ascendant) {
      const ascElement = ZODIAC_ELEMENT_MAP[birthChart.ascendant.toLowerCase()];
      if (ascElement && recipe.elementalProperties) {
        const recipeElement = this.getDominantElement(recipe.elementalProperties as ElementalProperties);
        if (recipeElement === ascElement) {
          modifier += 0.1;
        }
      }
    }

    // Clamp modifier between 0.5 and 1.5
    return Math.min(1.5, Math.max(0.5, modifier));
  }

  // ─── Utility Functions ────────────────────────────────────────────────

  private getDominantElement(elements: ElementalProperties): string {
    let dominant = 'Fire';
    let maxVal = 0;
    for (const [element, value] of Object.entries(elements)) {
      if (typeof value === 'number' && value > maxVal) {
        maxVal = value;
        dominant = element;
      }
    }
    return dominant;
  }

  private isComplementaryElement(a: string, b: string): boolean {
    const complements: Record<string, string> = {
      Fire: 'Water',
      Water: 'Fire',
      Earth: 'Air',
      Air: 'Earth',
    };
    return complements[a] === b;
  }
}

// Export singleton instance
export const planetaryRecipeScorer = PlanetaryRecipeScorer.getInstance();
