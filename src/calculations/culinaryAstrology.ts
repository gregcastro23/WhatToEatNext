// Culinary Astrology calculations (type-safe, minimal, rule-aligned)

import { cookingMethods } from '@/data/cooking/cookingMethods';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import { _meats } from '@/data/ingredients/proteins/meat';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import type { AstrologicalState, Season } from '@/types/alchemy';
import type { RecipeElementalMapping } from '@/types/recipes';

interface AstrologicalCulinaryGuidance {
  dominantElement: string;
  technique: {
    name: string;
    rationale: string;
    optimalTiming: string;
  };
  ingredientFocus: {
    element: string;
    examples: string[];
    pairingTip: string;
  };
  cuisineRecommendation: CuisineRecommendation;
}

interface CuisineRecommendation {
  style: string;
  modification: string;
  astrologicalBoost: number;
}

interface CookingMethodData {
  name: string;
  elementalEffect: Record<string, number>;
  benefits: string[];
  astrologicalInfluences?: {
    dominantPlanets?: string[];
    lunarPhaseEffect?: Record<string, number>;
  };
}

interface CuisineProfile {
  elementalAlignment: Record<string, number>;
  signatureModifications: Record<string, string>;
  astrologicalProfile: {
    rulingPlanets: string[];
    aspectEnhancers: string[];
    seasonalPreference?: string[];
  };
  seasonalPreferences?: string[];
}

interface RecipeRecommendation {
  name: string;
  alignmentScore: number;
  elementDistribution: Record<string, number>;
  planetaryActivators: string[];
}

interface MaybePlanets {
  activePlanets?: string[];
  dominantPlanets?: Array<{ name?: string; effect?: string; influence?: number }>;
  planetaryHour?: string;
  zodiacSign?: string;
}

export class CulinaryAstrologer {
  private readonly ELEMENTAL_HARMONY_FACTORS = {
    zodiac: 0.4,
    lunar: 0.3,
    planetary: 0.2,
    seasonal: 0.1
  };

  private currentSeason: Season = 'spring';

  getGuidance(astroState: AstrologicalState, season: Season): AstrologicalCulinaryGuidance {
    this.currentSeason = season;
    const dominant = this.getDominantElementFromAstro(astroState);

    return {
      dominantElement: dominant,
      technique: this.getOptimalTechnique(astroState, dominant),
      ingredientFocus: this.getIngredientFocus(astroState, dominant),
      cuisineRecommendation: this.getCuisineRecommendation(astroState, season, dominant)
    };
  }

  private getDominantElementFromAstro(astroState: AstrologicalState): string {
    const { zodiacSign } = (astroState as unknown as MaybePlanets);
    const sign = (zodiacSign || '').toLowerCase();
    const map: Record<string, string> = {
      aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
      taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
      gemini: 'Air', libra: 'Air', aquarius: 'Air',
      cancer: 'Water', scorpio: 'Water', pisces: 'Water'
    };
    return map[sign] || 'Fire';
  }

  private getOptimalTechnique(astroState: AstrologicalState, dominant: string) {
    const methods = Object.values((cookingMethods || {}) as Record<string, CookingMethodData>);
    const viable = methods.filter(m => (m.elementalEffect[dominant] ?? 0) > 0.3);
    const picked = (viable[0] || methods[0]) as CookingMethodData | undefined;
    const name = picked?.name || 'balanced-preparation';
    const benefits = picked?.benefits.slice(0, 2).join(' and ') || 'balanced expression';
    return {
      name,
      rationale: `Aligns with ${dominant} through ${benefits}`,
      optimalTiming: this.calculateOptimalTiming(picked, astroState)
    };
  }

  private getAstrologicalAffinity(method: CookingMethodData | undefined, astroState: AstrologicalState): number {
    if (!method) return 0;
    const { activePlanets } = (astroState as unknown as MaybePlanets);
    const actives = Array.isArray(activePlanets) ? activePlanets : [];
    const planets = method.astrologicalInfluences?.dominantPlanets ?? [];
    return planets.reduce((sum, p) => sum + (actives.includes(p) ? 0.2 : 0), 0);
  }

  private calculateOptimalTiming(method: CookingMethodData | undefined, astroState: AstrologicalState): string {
    const lunar = method?.astrologicalInfluences?.lunarPhaseEffect || {};
    const bestPhase = Object.entries(lunar).sort((a, b) => b[1] - a[1])[0]?.[0] || 'full moon';
    const { planetaryHour } = (astroState as unknown as MaybePlanets);
    const hour = planetaryHour || 'Sun';
    const firstPlanet = method?.astrologicalInfluences?.dominantPlanets?.[0] || 'Sun';
    return `Best during ${bestPhase.replace(/_/g, ' ')} when ${hour} or ${firstPlanet} is dominant`;
  }

  private getIngredientFocus(_astroState: AstrologicalState, dominant: string) {
    const entries = Object.entries((meats || {}) as Record<string, { astrologicalProfile?: { elementalAffinity?: string | { base?: string } } }>)
      .filter(([, data]) => {
        const affinity = data.astrologicalProfile?.elementalAffinity;
        return typeof affinity === 'string' ? affinity === dominant : affinity?.base === dominant;
      });

    return {
      element: dominant,
      examples: entries.slice(0, 3).map(([name]) => name),
      pairingTip: `Combine with ${this.getComplementaryElement(dominant)}-dominant preparations`
    };
  }

  private getComplementaryElement(element: string): string {
    // Per workspace rules, elements reinforce themselves most strongly
    return element;
  }

  private getCuisineRecommendation(
    _astroState: AstrologicalState,
    _season: Season,
    dominant: string
  ): CuisineRecommendation {
    const traditions = (culinaryTraditions || {}) as Record<string, CuisineProfile>;
    const viable = Object.entries(traditions).filter(([, profile]) => (profile.elementalAlignment[dominant] ?? 0) > 0.3);
    const best = viable.sort((a, b) => (b[1].elementalAlignment[dominant] ?? 0) - (a[1].elementalAlignment[dominant] ?? 0))[0];
    const style = best[0] || 'Fusion';
    const modKey = `${dominant}_dominant`;
    const modification = best[1].signatureModifications[modKey] || 'Emphasize dominant element techniques';
    return {
      style,
      modification,
      astrologicalBoost: this.calculateCuisineBoost((best[1] || ({
        elementalAlignment: {},
        signatureModifications: {},
        astrologicalProfile: { rulingPlanets: [], aspectEnhancers: [] }
      }) as CuisineProfile))
    };
  }

  private calculateCuisineBoost(cuisine: CuisineProfile): number {
    const seasonalBoost = cuisine.seasonalPreferences?.includes(this.currentSeason) ? 0.2 : 0;
    const dominant = 'Fire'; // default reference
    const elementalBoost = cuisine.elementalAlignment[dominant] ?? 0;
    const rulingCount = cuisine.astrologicalProfile.rulingPlanets.length ?? 0;
    const planetaryBoost = Math.min(0.1 * rulingCount, 0.3);
    const total = 1.0 + seasonalBoost * 0.5 + elementalBoost * 0.3 + planetaryBoost * 0.2;
    return Math.max(0.8, Math.min(1.5, total));
  }

  getRecipeRecommendations(astroState: AstrologicalState, cuisineFilter?: string): RecipeRecommendation[] {
    const dominant = this.getDominantElementFromAstro(astroState);
    const mappings = (recipeElementalMappings || {}) as Record<string, RecipeElementalMapping & { cuisine?: string; astrologicalProfile: { rulingPlanets: string[] } }>;
    const filtered = Object.entries(mappings).filter(([, recipe]) => !cuisineFilter || recipe.cuisine === cuisineFilter);
    const { activePlanets } = (astroState as unknown as MaybePlanets);
    const actives = Array.isArray(activePlanets) ? activePlanets : [];

    return filtered
      .map(([name, recipe]) => {
        const planetaryActivators = [...(recipe.astrologicalProfile.rulingPlanets || [])];
        if (!planetaryActivators.includes('Sun') && actives.includes('Sun')) {
          planetaryActivators.push('Sun');
        }
        return {
          name,
          alignmentScore: this.calculateRecipeAlignment(recipe, astroState, dominant),
          elementDistribution: recipe.elementalProperties as unknown as Record<string, number>,
          planetaryActivators
        };
      })
      .sort((a, b) => b.alignmentScore - a.alignmentScore);
  }

  private calculateRecipeAlignment(
    recipe: RecipeElementalMapping & { astrologicalProfile: { rulingPlanets: string[] } },
    astroState: AstrologicalState,
    dominant: string
  ): number {
    const { activePlanets } = (astroState as unknown as MaybePlanets);
    const actives = Array.isArray(activePlanets) ? activePlanets : [];
    const ruling = recipe.astrologicalProfile.rulingPlanets || [];
    const planetScore = ruling.reduce((sum, p) => sum + (actives.includes(p) ? 0.2 : 0), 0);
    const elementMatch = (recipe.elementalProperties as unknown as Record<string, number>)[dominant] ?? 0;
    const base = elementMatch * this.ELEMENTAL_HARMONY_FACTORS.zodiac + planetScore * this.ELEMENTAL_HARMONY_FACTORS.planetary;
    return Math.max(0, Math.min(1, base));
  }
}
