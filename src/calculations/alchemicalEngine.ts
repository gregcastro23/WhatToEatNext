import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState,
  AlchemicalCalculationResult,
  ElementalAffinity,
  AstrologicalInfluence
} from '@/types/alchemy';

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

  calculateElementalHarmony(
    recipeElements: ElementalProperties,
    userElements: ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): AlchemicalCalculationResult {
    const astroModifiers = this.getAstrologicalModifiers(astrologicalState);
    const seasonModifiers = this.seasonalModifiers[season];
    let elementalHarmony = 0;
    let astrologicalPower = 0;
    let seasonalAlignment = 0;
    let totalFactors = 0;

    Object.entries(recipeElements).forEach(([element, value]) => {
      if (userElements[element as keyof ElementalProperties]) {
        const userValue = userElements[element as keyof ElementalProperties];
        const astroValue = astroModifiers[element as keyof ElementalProperties];
        const seasonValue = seasonModifiers[element as keyof ElementalProperties];

        const baseHarmony = 1 - Math.abs(value - userValue);
        const astroHarmony = baseHarmony * astroValue;
        const seasonHarmony = baseHarmony * seasonValue;

        elementalHarmony += baseHarmony;
        astrologicalPower += astroHarmony;
        seasonalAlignment += seasonHarmony;
        totalFactors++;
      }
    });

    const normalizedFactors = totalFactors > 0 ? totalFactors : 1;
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
    const sunElement = this.zodiacElements[astrologicalState.sunSign];
    const moonElement = this.zodiacElements[astrologicalState.moonSign];
    const lunarModifiers = this.lunarPhaseModifiers[astrologicalState.lunarPhase];

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
} 