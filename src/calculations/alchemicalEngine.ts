import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState,
  AlchemicalCalculationResult,
  ElementalAffinity,
  AstrologicalInfluence
} from '@/types/alchemy';

interface Decan {
    ruler: string;
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

  private readonly decanModifiers: Record<string, number> = {
    Mars: 0.4,
    Sun: 0.35,
    Jupiter: 0.3,
    Venus: 0.25,
    Mercury: 0.2,
    Saturn: 0.15,
    Uranus: 0.3,
    Neptune: 0.25,
    Pluto: 0.2,
    Moon: 0.35
  };

  calculateElementalHarmony(
    recipeElements?: ElementalProperties,
    userElements?: ElementalProperties,
    astrologicalState?: AstrologicalState,
    season?: string
  ): AlchemicalCalculationResult {
    const defaultElements: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    };

    const safeRecipeElements = recipeElements || { ...defaultElements };
    const safeUserElements = userElements || { ...defaultElements };
    const safeSeason = season || 'spring';

    const astroModifiers = this.getAstrologicalModifiers(astrologicalState);
    const seasonModifiers = this.seasonalModifiers[safeSeason.toLowerCase()] || { ...defaultElements };

    let elementalHarmony = 0;
    let astrologicalPower = 0;
    let seasonalAlignment = 0;
    let totalFactors = 0;

    Object.entries(safeRecipeElements).forEach(([element, value]) => {
      if (safeUserElements[element as keyof ElementalProperties] !== undefined) {
        const userValue = safeUserElements[element as keyof ElementalProperties];
        const astroValue = astroModifiers[element as keyof ElementalProperties] || 0.25;
        const seasonValue = seasonModifiers[element as keyof ElementalProperties] || 0.25;

        const baseHarmony = 1 - Math.abs(value - userValue);
        const astroHarmony = baseHarmony * astroValue;
        const seasonHarmony = baseHarmony * seasonValue;

        elementalHarmony += baseHarmony;
        astrologicalPower += astroHarmony;
        seasonalAlignment += seasonHarmony;
        totalFactors++;
      }
    });

    const normalizedFactors = Math.max(totalFactors, 1);

    return {
      elementalHarmony: elementalHarmony / normalizedFactors,
      astrologicalPower: astrologicalPower / normalizedFactors,
      seasonalAlignment: seasonalAlignment / normalizedFactors,
      totalScore: (elementalHarmony + astrologicalPower + seasonalAlignment) / (3 * normalizedFactors)
    };
  }

  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    let power = 0;

    const recipeElement = this.zodiacElements[recipeSunSign];
    const sunElement = this.zodiacElements[astrologicalState.sunSign];
    const moonElement = this.zodiacElements[astrologicalState.moonSign];

    if (recipeElement === sunElement) power += 0.4;

    if (this.elementalAffinities[recipeElement]?.includes(String(moonElement))) {
      power += 0.3;
    }

    const lunarModifier = this.lunarPhaseModifiers[astrologicalState.lunarPhase];
    power += lunarModifier[recipeElement] || 0;

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

    const sunElement = this.zodiacElements[astrologicalState.sunSign] || 'Fire';
    const moonElement = this.zodiacElements[astrologicalState.moonSign] || 'Water';
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

    baseModifiers[sunElement] += 0.2;
    baseModifiers[moonElement] += 0.1;

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
      element: element2,
      strength: element1 === element2 ? 1 : 
                this.elementalAffinities[element1]?.includes(element2) ? 0.5 : 0
    };
  }

  getAstrologicalInfluence(
    element: keyof ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): AstrologicalInfluence {
    return {
      zodiacElement: this.zodiacElements[astrologicalState.sunSign],
      lunarModifier: this.lunarPhaseModifiers[astrologicalState.lunarPhase][element],
      seasonalModifier: this.seasonalModifiers[season][element]
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
} 