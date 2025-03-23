import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState,
  AlchemicalCalculationResult,
  ElementalAffinity,
  AstrologicalInfluence,
  Season,
  Element,
  RecipeHarmonyResult
} from '@/types/alchemy';
import { seasonalPatterns } from '@/data/integrations/seasonalPatterns';
import { culinaryTraditions } from '@/data/cuisines/culinaryTraditions';
import { recipeElementalMappings } from '@/data/recipes/elementalMappings';
import { recipeCalculations } from '@/utils/recipeCalculations';
import { PLANETARY_MODIFIERS, RulingPlanet } from '@/constants/planets';
import { getZodiacElementalInfluence } from '@/utils/zodiacUtils';

// Define the default elemental properties when none are provided
const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25
};

interface Decan {
    ruler: RulingPlanet;
    element: keyof ElementalProperties;
    degree: number;
}

export class AlchemicalEngine {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire']
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1
  };

  private readonly zodiacElements: Record<ZodiacSign, keyof ElementalProperties> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water'
  };

  private readonly lunarPhaseModifiers: Record<LunarPhase, ElementalProperties> = {
    new_moon: { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    waxing_crescent: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    first_quarter: { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    waxing_gibbous: { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
    full_moon: { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    waning_gibbous: { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    last_quarter: { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    waning_crescent: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly decans: Record<ZodiacSign, Decan[]> = {
    aries: [
      { ruler: 'Mars', element: 'Fire', degree: 0 },
      { ruler: 'Sun', element: 'Fire', degree: 10 },
      { ruler: 'Jupiter', element: 'Fire', degree: 20 }
    ],
    taurus: [
      { ruler: 'Venus', element: 'Earth', degree: 0 },
      { ruler: 'Mercury', element: 'Earth', degree: 10 },
      { ruler: 'Saturn', element: 'Earth', degree: 20 }
    ],
    gemini: [
      { ruler: 'Mercury', element: 'Air', degree: 0 },
      { ruler: 'Venus', element: 'Air', degree: 10 },
      { ruler: 'Uranus', element: 'Air', degree: 20 }
    ],
    cancer: [
      { ruler: 'Moon', element: 'Water', degree: 0 },
      { ruler: 'Pluto', element: 'Water', degree: 10 },
      { ruler: 'Neptune', element: 'Water', degree: 20 }
    ],
    leo: [
      { ruler: 'Sun', element: 'Fire', degree: 0 },
      { ruler: 'Jupiter', element: 'Fire', degree: 10 },
      { ruler: 'Mars', element: 'Fire', degree: 20 }
    ],
    virgo: [
      { ruler: 'Mercury', element: 'Earth', degree: 0 },
      { ruler: 'Saturn', element: 'Earth', degree: 10 },
      { ruler: 'Venus', element: 'Earth', degree: 20 }
    ],
    libra: [
      { ruler: 'Venus', element: 'Air', degree: 0 },
      { ruler: 'Uranus', element: 'Air', degree: 10 },
      { ruler: 'Mercury', element: 'Air', degree: 20 }
    ],
    scorpio: [
      { ruler: 'Pluto', element: 'Water', degree: 0 },
      { ruler: 'Neptune', element: 'Water', degree: 10 },
      { ruler: 'Moon', element: 'Water', degree: 20 }
    ],
    sagittarius: [
      { ruler: 'Jupiter', element: 'Fire', degree: 0 },
      { ruler: 'Mars', element: 'Fire', degree: 10 },
      { ruler: 'Sun', element: 'Fire', degree: 20 }
    ],
    capricorn: [
      { ruler: 'Saturn', element: 'Earth', degree: 0 },
      { ruler: 'Venus', element: 'Earth', degree: 10 },
      { ruler: 'Mercury', element: 'Earth', degree: 20 }
    ],
    aquarius: [
      { ruler: 'Uranus', element: 'Air', degree: 0 },
      { ruler: 'Mercury', element: 'Air', degree: 10 },
      { ruler: 'Venus', element: 'Air', degree: 20 }
    ],
    pisces: [
      { ruler: 'Neptune', element: 'Water', degree: 0 },
      { ruler: 'Moon', element: 'Water', degree: 10 },
      { ruler: 'Pluto', element: 'Water', degree: 20 }
    ]
  };

  private readonly decanModifiers = PLANETARY_MODIFIERS;

  calculateAstroCuisineMatch(
    recipeElements?: ElementalProperties,
    astrologicalState?: AstrologicalState,
    season?: string,
    cuisine?: string
  ): AlchemicalCalculationResult {
    const dominantElement = Object.entries(recipeElements || DEFAULT_ELEMENTAL_PROPERTIES)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    // Safely access the seasonalPatterns by ensuring the season is a valid key
    const defaultSeason: Season = 'winter';
    const normalizedSeason = season?.toLowerCase();
    const validSeason = (normalizedSeason === 'spring' || 
                         normalizedSeason === 'summer' || 
                         normalizedSeason === 'autumn' || 
                         normalizedSeason === 'winter' || 
                         normalizedSeason === 'fall') 
                         ? (normalizedSeason === 'fall' ? 'autumn' : normalizedSeason) as Season 
                         : defaultSeason;
    
    const seasonalData = seasonalPatterns[validSeason];
    
    // Function to check if string is a valid RulingPlanet
    const isRulingPlanet = (planet: string): planet is RulingPlanet => {
      return Object.keys(PLANETARY_MODIFIERS).includes(planet);
    };
    
    // Simple matching score based on astrological state only
    const astronomicalScore = astrologicalState?.activePlanets
      ? astrologicalState.activePlanets
          .filter(p => isRulingPlanet(p) && PLANETARY_MODIFIERS[p] > 0)
          .length * 10
      : 0;
      
    // Aspect match score
    const aspectScore = 0;
    
    // Cuisine compatibility
    const cuisineScore = cuisine
      ? this.getCuisineCompatibility(cuisine, astrologicalState, season)
      : 0;
      
    // Calculate total score without elemental balance
    const totalScore = astronomicalScore + aspectScore + cuisineScore;
    
    return {
      score: totalScore,
      elementalMatch: 0, // We don't calculate elemental match here
      seasonalMatch: 0, // We don't calculate seasonal match here
      astrologicalMatch: astronomicalScore + aspectScore,
      dominantElement: dominantElement as keyof ElementalProperties,
      recommendations: [],
      warnings: []
    };
  }

  private getCuisineCompatibility(cuisine: string, astroState?: AstrologicalState, season?: string): number {
    if (!astroState || !cuisine) return 0;
    
    const traditions = culinaryTraditions[cuisine];
    if (!traditions) return 0;
    
    let score = 0;
    
    // Match cuisine to zodiac sign
    if (astroState.zodiacSign && 
        traditions.astrologicalProfile.favorableZodiac.includes(astroState.zodiacSign.toLowerCase())) {
      score += 20;
    }
    
    // Match cuisine to planets
    if (astroState.activePlanets) {
      const planetMatches = traditions.astrologicalProfile.rulingPlanets
        .filter((p: RulingPlanet) => astroState.activePlanets.includes(p));
      score += planetMatches.length * 10;
    }
    
    // Season bonus
    if (season && traditions.seasonalPreference.includes(season.toLowerCase())) {
      score += 15;
    }
    
    return score;
  }

  private calculateDominantHarmony(dominantElement: string, userElements: ElementalProperties): number {
    // Focus only on the dominant element match
    return Math.min(userElements[dominantElement] * 2, 1); // Aggressive scaling
  }

  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    let power = 0;

    // Using properties that exist in AstrologicalState
    const recipeElement = this.zodiacElements[recipeSunSign];
    const currentZodiacElement = this.zodiacElements[astrologicalState.currentZodiac];
    const moonSignElement = this.zodiacElements[astrologicalState.zodiacSign];

    if (recipeElement === currentZodiacElement) power += 0.4;

    if (this.elementalAffinities[recipeElement]?.includes(String(moonSignElement))) {
      power += 0.3;
    }

    // Use the lunarPhase that exists in AstrologicalState
    if (astrologicalState.lunarPhase && this.lunarPhaseModifiers[astrologicalState.lunarPhase]) {
      const lunarModifier = this.lunarPhaseModifiers[astrologicalState.lunarPhase];
      power += lunarModifier[recipeElement] || 0;
    }

    return Math.min(power, 1);
  }

  private getAstrologicalModifiers(astrologicalState: AstrologicalState): ElementalProperties {
    if (!astrologicalState) {
        return {
            Fire: 0.25,
            Water: 0.25,
            Air: 0.25,
            Earth: 0.25
        };
    }

    const currentZodiacElement = this.zodiacElements[astrologicalState.currentZodiac] || 'Fire';
    const moonSignElement = this.zodiacElements[astrologicalState.zodiacSign] || 'Water';
    const lunarModifiers = this.lunarPhaseModifiers[astrologicalState.lunarPhase] || {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25
    };

    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    };

    baseModifiers[currentZodiacElement] += 0.2;
    baseModifiers[moonSignElement] += 0.1;

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    const total = Object.values(baseModifiers).reduce((sum, val) => sum + val, 0);
    Object.keys(baseModifiers).forEach(element => {
      baseModifiers[element as keyof ElementalProperties] /= total;
    });

    return baseModifiers;
  }

  getElementalAffinity(element1: keyof ElementalProperties, element2: keyof ElementalProperties): ElementalAffinity {
    return {
      element: element2 as Element,
      strength: element1 === element2 ? 1 : 
                this.elementalAffinities[element1]?.includes(String(element2)) ? 0.5 : 0,
      source: 'element-compatibility'
    };
  }

  getAstrologicalInfluence(
    element: keyof ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): AstrologicalInfluence {
    return {
      planet: 'Sun', // Default to Sun as primary influence
      sign: astrologicalState.currentZodiac,
      element: element as Element,
      strength: this.seasonalModifiers[season]?.[element] || 0.5
    };
  }

  calculateNaturalInfluences({ 
    season, 
    moonPhase, 
    timeOfDay,
    sunSign,
    degreesInSign = 0 
  }: { 
    season: string; 
    moonPhase: LunarPhase; 
    timeOfDay: string;
    sunSign?: ZodiacSign;
    degreesInSign?: number;
  }): ElementalProperties {
    const result = this.getBaseNaturalInfluences(season, moonPhase, timeOfDay);

    if (sunSign) {
      const currentDecan = this.getCurrentDecan(sunSign, degreesInSign);
      if (currentDecan) {
        const decanInfluence = this.decanModifiers[currentDecan.ruler];
        result[currentDecan.element] *= (1 + decanInfluence);
      }
    }

    const total = Object.values(result).reduce((sum, val) => sum + val, 0);
    Object.keys(result).forEach(element => {
      result[element as keyof ElementalProperties] /= total;
    });

    return result;
  }

  private getCurrentDecan(sign: ZodiacSign, degrees: number): Decan | null {
    const signDecans = this.decans[sign];
    if (!signDecans) return null;

    return signDecans.find((decan, index) => {
      const nextDegree = index < 2 ? signDecans[index + 1].degree : 30;
      return degrees >= decan.degree && degrees < nextDegree;
    }) || null;
  }

  private getBaseNaturalInfluences(
    season: string,
    moonPhase: LunarPhase,
    timeOfDay: string
  ): ElementalProperties {
    const seasonBase = this.seasonalModifiers[season.toLowerCase()];
    const lunarBase = this.lunarPhaseModifiers[moonPhase];

    const result: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    };

    Object.keys(result).forEach((element) => {
      const key = element as keyof ElementalProperties;
      result[key] = (seasonBase[key] + lunarBase[key]) / 2;
    });

    switch(timeOfDay.toLowerCase()) {
      case 'morning':
        result.Fire *= 1.2;
        result.Air *= 1.1;
        break;
      case 'afternoon':
        result.Fire *= 1.3;
        result.Earth *= 1.1;
        break;
      case 'evening':
        result.Water *= 1.2;
        result.Air *= 1.1;
        break;
      case 'night':
        result.Water *= 1.3;
        result.Earth *= 1.2;
        break;
    }

    return result;
  }

  calculateRecipeHarmony(
    recipeName: string,
    userElements: ElementalProperties,
    astroState: AstrologicalState
  ): RecipeHarmonyResult {
    const recipe = recipeElementalMappings[recipeName];
    
    // For now we'll just pass a default season until we fix the calculateAstroCuisineMatch method
    const currentSeason: Season = 'winter'; // Default to winter
    
    const baseHarmony = this.calculateAstroCuisineMatch(
      recipe.elementalProperties,
      astroState,
      currentSeason,
      recipe.cuisine
    );

    const cuisineAlignment = recipeCalculations.calculateCuisineAlignment(recipe);
    
    // Since AstrologicalState doesn't have an 'aspects' property, we'll use a fallback
    const aspectBonus = recipe.astrologicalProfile && recipe.astrologicalProfile.optimalAspects ? 
      recipe.astrologicalProfile.optimalAspects.length * 0.05 : 0; // Use a small constant multiplier

    return {
      ...baseHarmony,
      recipeSpecificBoost: cuisineAlignment + aspectBonus,
      optimalTimingWindows: recipe.astrologicalProfile?.optimalAspects?.map(a => `Optimal with ${a}`) || [],
      elementalMultipliers: {} // Return an empty object for now
    };
  }

  private calculateAstrologicalInfluence(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    // Updated to use correct properties from AstrologicalState
    const sunInfluence = getZodiacElementalInfluence(astrologicalState.currentZodiac);
    const moonInfluence = getZodiacElementalInfluence(astrologicalState.zodiacSign);
    
    return {
      Fire: (sunInfluence.Fire + moonInfluence.Fire) / 2,
      Water: (sunInfluence.Water + moonInfluence.Water) / 2,
      Earth: (sunInfluence.Earth + moonInfluence.Earth) / 2,
      Air: (sunInfluence.Air + moonInfluence.Air) / 2
    };
  }
} 