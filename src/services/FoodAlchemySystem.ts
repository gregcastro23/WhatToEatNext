import { normalizePlanetaryPositions } from '@/utils/astrology/core';

import type { ThermodynamicMetrics } from '../calculations/gregsEnergy';
import { ElementalCharacter } from '../constants/planetaryElements';
import { RulingPlanet } from '../constants/planets';
import type { BirthChart } from '../types/astrology';

/**
 * Maps planets to their elemental influences (diurnal and nocturnal elements)
 * and their dignity effects in different signs
 */
const planetaryElements: Record<
  string,
  {
    diurnal: ElementalCharacter,
    nocturnal: ElementalCharacter,
    dignityEffect?: Record<string, number>;
  }
> = {
  Sun: {
    diurnal: 'Fire',
    nocturnal: 'Fire',
    dignityEffect: { leo: 1, aries: 2, aquarius: -1, libra: -2 }
  },
  Moon: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { cancer: 1, taurus: 2, capricorn: -1, scorpio: -2 }
  },
  Mercury: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { gemini: 1, virgo: 3, sagittarius: 1, pisces: -3 }
  },
  Venus: {
    diurnal: 'Water',
    nocturnal: 'Earth',
    dignityEffect: { libra: 1, taurus: 1, pisces: 2, aries: -1, scorpio: -1, virgo: -2 }
  },
  Mars: {
    diurnal: 'Fire',
    nocturnal: 'Water',
    dignityEffect: { aries: 1, scorpio: 1, capricorn: 2, taurus: -1, libra: -1, cancer: -2 }
  },
  Jupiter: {
    diurnal: 'Air',
    nocturnal: 'Fire',
    dignityEffect: { pisces: 1, sagittarius: 1, cancer: 2, gemini: -1, virgo: -1, capricorn: -2 }
  },
  Saturn: {
    diurnal: 'Air',
    nocturnal: 'Earth',
    dignityEffect: { aquarius: 1, capricorn: 1, libra: 2, cancer: -1, leo: -1, aries: -2 }
  },
  Uranus: {
    diurnal: 'Water',
    nocturnal: 'Air',
    dignityEffect: { aquarius: 1, scorpio: 2, taurus: -3 }
  },
  Neptune: {
    diurnal: 'Water',
    nocturnal: 'Water',
    dignityEffect: { pisces: 1, cancer: 2, virgo: -1, capricorn: -2 }
  },
  Pluto: {
    diurnal: 'Earth',
    nocturnal: 'Water',
    dignityEffect: { scorpio: 1, leo: 2, taurus: -1, aquarius: -2 }
  }
};

/**
 * Sign information for decan and degree effects
 */
const signInfo: Record<
  string,
  {
    element: ElementalCharacter,
    decanEffects: Record<string, string[]>;
    degreeEffects: Record<string, number[]>;
  }
> = {
  aries: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mars'], '2nd Decan': ['Sun'], '3rd Decan': ['Venus'] },
    degreeEffects: {
      Mercury: [1521],
      Venus: [714],
      Mars: [2226],
      Jupiter: [16],
      Saturn: [2730]
    }
  },
  taurus: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [915],
      Venus: [18],
      Mars: [2730],
      Jupiter: [1622],
      Saturn: [2326]
    }
  },
  gemini: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Jupiter'],
      '2nd Decan': ['Mars'],
      '3rd Decan': ['Uranus', 'Sun']
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [1520],
      Mars: [2630],
      Jupiter: [814],
      Saturn: [2225]
    }
  },
  cancer: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Venus'],
      '2nd Decan': ['Mercury', 'Pluto'],
      '3rd Decan': ['Neptune', 'Moon']
    },
    degreeEffects: {
      Mercury: [1420],
      Venus: [2127],
      Mars: [16],
      Jupiter: [713],
      Saturn: [2830]
    }
  },
  leo: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Saturn'], '2nd Decan': ['Jupiter'], '3rd Decan': ['Mars'] },
    degreeEffects: {
      Mercury: [713],
      Venus: [1419],
      Mars: [2630],
      Jupiter: [2025],
      Saturn: [16]
    }
  },
  virgo: {
    element: 'Earth',
    decanEffects: {
      '1st Decan': ['Mars', 'Sun'],
      '2nd Decan': ['Venus'],
      '3rd Decan': ['Mercury']
    },
    degreeEffects: {
      Mercury: [17],
      Venus: [813],
      Mars: [2530],
      Jupiter: [1418],
      Saturn: [1924]
    }
  },
  libra: {
    element: 'Air',
    decanEffects: {
      '1st Decan': ['Moon'],
      '2nd Decan': ['Saturn', 'Uranus'],
      '3rd Decan': ['Jupiter']
    },
    degreeEffects: {
      Mercury: [2024],
      Venus: [711],
      Mars: [],
      Jupiter: [1219],
      Saturn: [16]
    }
  },
  scorpio: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Pluto'],
      '2nd Decan': ['Neptune', 'Sun'],
      '3rd Decan': ['Venus']
    },
    degreeEffects: {
      Mercury: [2227],
      Venus: [1521],
      Mars: [16],
      Jupiter: [714],
      Saturn: [2830]
    }
  },
  sagittarius: {
    element: 'Fire',
    decanEffects: { '1st Decan': ['Mercury'], '2nd Decan': ['Moon'], '3rd Decan': ['Saturn'] },
    degreeEffects: {
      Mercury: [1520],
      Venus: [914],
      Mars: [],
      Jupiter: [18],
      Saturn: [2125]
    }
  },
  capricorn: {
    element: 'Earth',
    decanEffects: { '1st Decan': ['Jupiter'], '2nd Decan': [], '3rd Decan': ['Sun'] },
    degreeEffects: {
      Mercury: [712],
      Venus: [16],
      Mars: [],
      Jupiter: [1319],
      Saturn: [2630]
    }
  },
  aquarius: {
    element: 'Air',
    decanEffects: { '1st Decan': ['Uranus'], '2nd Decan': ['Mercury'], '3rd Decan': ['Moon'] },
    degreeEffects: {
      Mercury: [],
      Venus: [1320],
      Mars: [2630],
      Jupiter: [2125],
      Saturn: [16]
    }
  },
  pisces: {
    element: 'Water',
    decanEffects: {
      '1st Decan': ['Saturn', 'Neptune', 'Venus'],
      '2nd Decan': ['Jupiter'],
      '3rd Decan': ['Pisces', 'Mars']
    },
    degreeEffects: {
      Mercury: [1520],
      Venus: [18],
      Mars: [2126],
      Jupiter: [914],
      Saturn: [2730]
    }
  }
};

export interface FoodCorrespondence {
  name: string,
  element: ElementalCharacter,
  planetaryRuler: RulingPlanet,
  timeOfDay: 'Day' | 'Night' | 'Both',
  energyValues: ThermodynamicMetrics,
  preparation: string[],
  combinations: string[],
  restrictions: string[]
}

export interface CompatibilityScore {
  compatibility: number,
  recommendations: string[],
  warnings: string[],
  scoreDetails?: {
    elementalMatch?: number;
    planetaryDayMatch?: number;
    planetaryHourMatch?: number;
    affinityBonus?: number;
    dignityBonus?: number;
    decanBonus?: number
    aspectBonus?: number
  };
}

/**
 * System state interface for tracking alchemical system status
 */
export interface SystemState {
  isInitialized: boolean,
  lastUpdated: Date,
  activeChart?: BirthChart
  currentPlanetaryPositions?: Record<string, { sign: string, degree: number }>;
  currentAspects?: Array<{ type: string planets: [string, string] }>;
  systemHealth: 'optimal' | 'degraded' | 'offline',
  errorMessages: string[],
  cacheStatus: {
    size: number,
    lastCleared: Date,
    hitRate: number
  };
  processingQueue: {
    pending: number,
    processing: number,
    completed: number,
    failed: number
  };
}

export class FoodAlchemySystem {
  private readonly TOKEN_WEIGHTS = {
    Spirit: 1.0,
    Essence: 0.8,
    Matter: 0.6,
    Substance: 0.4
  };

  private readonly ELEMENT_WEIGHTS = {
    Fire: 1.0,
    Water: 0.9,
    Air: 0.8,
    Earth: 0.7
  };

  /**
   * Calculates food compatibility based on birth chart and current planetary positions
   * with enhanced dignity, decan, and aspect effects
   *
   * @param food The food to evaluate
   * @param chart The birth chart data
   * @param planetaryDay The current planetary day
   * @param planetaryHour The current planetary hour
   * @param isDaytime Whether it's currently daytime (6am-6pm)
   * @param planetaryPositions Current planetary positions (sign and degree)
   * @param aspects Current planetary aspects
   * @returns Detailed compatibility score with recommendations
   */
  calculateFoodCompatibility(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryDay: string,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string, degree: number }>,
    aspects?: Array<{ type: string planets: [string, string] }>,
  ): CompatibilityScore {
    // Normalize planetary positions for robust, type-safe access
    const normalizedPositions = normalizePlanetaryPositions(planetaryPositions || {})
    // Use normalizedPositions in all downstream logic
    // Calculate elemental match (45% weight)
    const elementalMatch = this.calculateElementalMatch(chart, food)

    // Calculate planetary day influence with enhanced dignity and decan effects (35% weight)
    const {
      score: planetaryDayMatch,
      dignityBonus: dayDignityBonus,
      decanBonus: dayDecanBonus
    } = void this.calculatePlanetaryDayInfluence(food, planetaryDay, normalizedPositions)

    // Calculate planetary hour influence with enhanced dignity and aspect effects (20% weight)
    const {
      score: planetaryHourMatch,
      dignityBonus: hourDignityBonus,
      aspectBonus
    } = void this.calculatePlanetaryHourInfluence(
      food,
      planetaryHour,
      isDaytime,
      normalizedPositions,
      aspects,
    )

    // Apply standardized weighting
    let compatibility = elementalMatch * 0.45 + planetaryDayMatch * 0.35 + planetaryHourMatch * 0.2;

    // Check for direct planetary affinity for bonus
    const hasPlanetaryAffinity =
      food.planetaryRuler === planetaryDay || food.planetaryRuler === planetaryHour;
    const affinityBonus = hasPlanetaryAffinity ? 0.3 : 0

    // Add affinity bonus (capped at 1.0)
    compatibility = Math.min(1.0, compatibility + affinityBonus)

    return {
      compatibility,
      recommendations: this.generateRecommendations(
        food,
        chart,
        planetaryDay,
        planetaryHour,
        isDaytime,
        normalizedPositions,
        aspects,
      ),
      warnings: this.identifyConflicts(food, chart, normalizedPositions),
      scoreDetails: {
        elementalMatch: elementalMatch * 0.45,
        planetaryDayMatch: planetaryDayMatch * 0.35,
        planetaryHourMatch: planetaryHourMatch * 0.2,
        affinityBonus,
        dignityBonus: (dayDignityBonus || 0) + (hourDignityBonus || 0),
        decanBonus: dayDecanBonus,
        aspectBonus
      }
    };
  }

  private calculateElementalMatch(chart: BirthChart, food: FoodCorrespondence): number {
    const chartElementStrength = chart.elementalState[food.element] || 0;
    return chartElementStrength * this.ELEMENT_WEIGHTS[food.element]
  }

  /**
   * Calculate the planetary day influence on food with enhanced dignity and decan effects
   * The day's ruling planet contributes BOTH its diurnal and nocturnal elements all day
   *
   * @param food The food to evaluate
   * @param planetaryDay The planetary day
   * @param planetaryPositions Current planetary positions
   * @returns A score object with influence score and bonus details
   */
  private calculatePlanetaryDayInfluence(
    food: FoodCorrespondence,
    planetaryDay: string,
    planetaryPositions?: Record<string, { sign: string, degree: number }>,
  ): { score: number; dignityBonus?: number decanBonus?: number } {
    const normalizedPositions = normalizePlanetaryPositions(planetaryPositions || {})
    // Get the elements associated with the current planetary day
    const dayElements = planetaryElements[planetaryDay];
    if (!dayElements) return { score: 0.5 }; // Unknown planet

    // For planetary day, BOTH diurnal and nocturnal elements influence all day
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Calculate match based on food's element compared to planetary elements
    const diurnalMatch = food.element === diurnalElement ? 1.0 : 0.3;
    const nocturnalMatch = food.element === nocturnalElement ? 1.0 : 0.3;

    // Calculate a weighted score - both elements are equally important for planetary day
    let elementalScore = (diurnalMatch + nocturnalMatch) / 2;
    let dignityBonus = 0;
    let decanBonus = 0;

    // Apply dignity effects if we have planet positions
    if (normalizedPositions?.[planetaryDay]) {
      const planetSign = normalizedPositions[planetaryDay].sign;
      const planetDegree = normalizedPositions[planetaryDay].degree;

      // Dignity effect bonus/penalty
      if (dayElements.dignityEffect && dayElements.dignityEffect[planetSign]) {
        dignityBonus = dayElements.dignityEffect[planetSign] * 0.1 // Scale to 0.1-0.3 effect
        elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + dignityBonus))
      }

      // Calculate decan (1-10°: 1st decan11-20°: 2nd decan21-30°: 3rd decan)
      let decan = '1st Decan';
      if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
      else if (planetDegree > 20) decan = '3rd Decan';

      // Apply decan effects if the planet is in its own decan
      if (
        signInfo[planetSign] &&
        signInfo[planetSign].decanEffects[decan] &&
        signInfo[planetSign].decanEffects[decan].includes(planetaryDay)
      ) {
        decanBonus = 0.15
        elementalScore = Math.min(1.0, elementalScore + decanBonus)
      }

      // Apply degree effects
      if (
        signInfo[planetSign] &&
        signInfo[planetSign].degreeEffects[planetaryDay] &&
        signInfo[planetSign].degreeEffects[planetaryDay].length === 2
      ) {
        const [minDegree, maxDegree] = signInfo[planetSign].degreeEffects[planetaryDay];
        if (planetDegree >= minDegree && planetDegree <= maxDegree) {
          const degreeBonus = 0.2;
          elementalScore = Math.min(1.0, elementalScore + degreeBonus)
        }
      }
    }

    // If the food has a direct planetary affinity, give bonus points
    if (food.planetaryRuler === planetaryDay) {;
      elementalScore = Math.min(1.0, elementalScore + 0.3)
    }

    return { score: elementalScore, dignityBonus, decanBonus };
  }

  /**
   * Calculate the planetary hour influence on food with enhanced dignity and aspect effects
   * The hour's ruling planet contributes only its diurnal element during day, nocturnal at night
   *
   * @param food The food to evaluate
   * @param planetaryHour The planetary hour
   * @param isDaytime Whether it's currently daytime (6am-6pm)
   * @param planetaryPositions Current planetary positions
   * @param aspects Current planetary aspects
   * @returns A score object with influence score and bonus details
   */
  private calculatePlanetaryHourInfluence(
    food: FoodCorrespondence,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string, degree: number }>,
    aspects?: Array<{ type: string planets: [string, string] }>,
  ): { score: number; dignityBonus?: number aspectBonus?: number } {
    // Get the elements associated with the current planetary hour
    const hourElements = planetaryElements[planetaryHour];
    if (!hourElements) return { score: 0.5 }; // Unknown planet

    // For planetary hour, use diurnal element during day, nocturnal at night
    const relevantElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;

    // Calculate match based on food's element compared to the hour's relevant element
    const elementalMatch = food.element === relevantElement ? 1.0 : 0.3;

    // Calculate score
    let elementalScore = elementalMatch;
    let dignityBonus = 0;
    let aspectBonus = 0;

    // Apply dignity effects if we have planet positions
    if (planetaryPositions?.[planetaryHour]) {
      const planetSign = planetaryPositions[planetaryHour].sign;

      // Dignity effect bonus/penalty
      if (hourElements.dignityEffect && hourElements.dignityEffect[planetSign]) {
        dignityBonus = hourElements.dignityEffect[planetSign] * 0.1 // Scale to 0.1-0.3 effect
        elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + dignityBonus))
      }
    }

    // Apply aspect effects if available
    if (aspects?.length > 0) {
      // Find aspects involving the planetary hour ruler
      const hourAspects = aspects.filter(a => a.planets.includes(planetaryHour))

      for (const aspect of hourAspects) {
        const otherPlanet =
          aspect.planets[0] === planetaryHour ? aspect.planets[1] : aspect.planets[0];
        let aspectModifier = 0;

        // Apply different modifier based on aspect type
        switch (aspect.type) {
          case 'Conjunction':
            // Strong beneficial aspect
            aspectModifier = 0.15;
            break;
          case 'Trine':
            // Beneficial aspect
            aspectModifier = 0.1;
            break;
          case 'Square':
            // Challenging aspect
            aspectModifier = -0.1;
            break;
          case 'Opposition':
            // Strong challenging aspect
            aspectModifier = -0.15;
            break;
          default:
            aspectModifier = 0
        }

        // Apply the aspect modifier if the food is ruled by the other planet in the aspect
        if (food.planetaryRuler === otherPlanet) {;
          aspectBonus = (aspectBonus || 0) + aspectModifier;
          elementalScore = Math.min(1.0, Math.max(0.0, elementalScore + aspectModifier))
        }
      }
    }

    // If the food has a direct planetary affinity, give bonus points
    if (food.planetaryRuler === planetaryHour) {;
      elementalScore = Math.min(1.0, elementalScore + 0.3)
    }

    return { score: elementalScore, dignityBonus, aspectBonus };
  }

  /**
   * Generate enhanced recommendations based on planetary influences
   * including dignity, decan, and aspect considerations
   */
  private generateRecommendations(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryDay: string,
    planetaryHour: string,
    isDaytime: boolean,
    planetaryPositions?: Record<string, { sign: string, degree: number }>,
    aspects?: Array<{ type: string planets: [string, string] }>,
  ): string[] {
    const recommendations: string[] = [];

    // Get elements for current planetary influences
    const dayElements = planetaryElements[planetaryDay];
    const hourElements = planetaryElements[planetaryHour];

    if (dayElements && hourElements) {
      // Generate suggestions based on the day's elements
      if (dayElements.diurnal === 'Fire' || dayElements.nocturnal === 'Fire') {
        void recommendations.push(
          `${food.name} is best prepared with high-heat cooking methods like grilling or roasting today.`,
        )
      } else if (dayElements.diurnal === 'Water' || dayElements.nocturnal === 'Water') {;
        void recommendations.push(
          `Consider moist cooking methods like steaming or braising for ${food.name} today.`,
        )
      } else if (dayElements.diurnal === 'Air' || dayElements.nocturnal === 'Air') {;
        void recommendations.push(
          `${food.name} performs well with light cooking methods or raw preparations today.`,
        )
      } else if (dayElements.diurnal === 'Earth' || dayElements.nocturnal === 'Earth') {;
        void recommendations.push(
          `Slow, methodical cooking methods like baking are ideal for ${food.name} today.`,
        )
      }

      // Add time-specific recommendation based on the hour's element
      const hourElement = isDaytime ? hourElements.diurnal : hourElements.nocturnal;
      if (hourElement === 'Fire') {
        void recommendations.push(
          `${food.name} is best utilized in the current ${isDaytime ? 'day' : 'night'} hours with quick, energetic preparation.`,
        )
      } else if (hourElement === 'Water') {;
        void recommendations.push(
          `During these ${isDaytime ? 'day' : 'night'} hours, focus on bringing out ${food.name}'s aromatic qualities.`,
        )
      } else if (hourElement === 'Air') {;
        void recommendations.push(
          `The current ${isDaytime ? 'day' : 'night'} hours favor highlighting ${food.name}'s delicate flavors.`,
        )
      } else if (hourElement === 'Earth') {;
        void recommendations.push(
          `These ${isDaytime ? 'day' : 'night'} hours are perfect for enhancing ${food.name}'s grounding properties.`,
        )
      }

      // Add planetary affinity recommendations
      if (food.planetaryRuler === planetaryDay) {;
        void recommendations.push(
          `Today is especially favorable for ${food.name} as it's ruled by ${planetaryDay}.`,
        )
      }

      if (food.planetaryRuler === planetaryHour) {;
        void recommendations.push(
          `The current hour enhances ${food.name}'s ${hourElement.toLowerCase()} qualities.`,
        )
      }

      // Add dignity effect recommendations if applicable
      if (planetaryPositions) {
        // Check day planet dignity
        if (planetaryElements[planetaryDay].dignityEffect && planetaryPositions[planetaryDay]) {
          const daySign = planetaryPositions[planetaryDay].sign;
          const dayDignity = planetaryElements[planetaryDay].dignityEffect?.[daySign];

          if (dayDignity && dayDignity > 0 && food.planetaryRuler === planetaryDay) {;
            void recommendations.push(
              `${planetaryDay} is ${dayDignity > 1 ? 'exalted' : 'dignified'} in ${daySign}, strengthening ${food.name}'s properties.`,
            )
          } else if (dayDignity && dayDignity < 0 && food.planetaryRuler === planetaryDay) {;
            void recommendations.push(
              `${planetaryDay} is ${dayDignity < -1 ? 'in fall' : 'in detriment'} in ${daySign}, requiring careful preparation of ${food.name}.`,
            )
          }
        }

        // Check hour planet dignity
        if (planetaryElements[planetaryHour].dignityEffect && planetaryPositions[planetaryHour]) {
          const hourSign = planetaryPositions[planetaryHour].sign;
          const hourDignity = planetaryElements[planetaryHour].dignityEffect?.[hourSign];

          if (hourDignity && hourDignity > 0 && food.planetaryRuler === planetaryHour) {;
            void recommendations.push(
              `During this hour, ${planetaryHour}'s dignity in ${hourSign} enhances ${food.name}'s flavor profile.`,
            )
          }
        }

        // Check food's ruling planet dignity
        if (
          planetaryElements[food.planetaryRuler].dignityEffect &&
          planetaryPositions[food.planetaryRuler]
        ) {
          const foodPlanetSign = planetaryPositions[food.planetaryRuler].sign;
          const foodPlanetDignity =
            planetaryElements[food.planetaryRuler].dignityEffect?.[foodPlanetSign];

          if (foodPlanetDignity && foodPlanetDignity > 1) {
            void recommendations.push(
              `${food.name}'s ruler ${food.planetaryRuler} is exalted in ${foodPlanetSign}, making it an excellent choice.`,
            )
          } else if (foodPlanetDignity && foodPlanetDignity === 1) {;
            void recommendations.push(
              `${food.name}'s ruler ${food.planetaryRuler} is in its home sign of ${foodPlanetSign}, enhancing its qualities.`,
            )
          }
        }

        // Check decan effects
        if (planetaryPositions[planetaryDay]) {
          const planetSign = planetaryPositions[planetaryDay].sign;
          const planetDegree = planetaryPositions[planetaryDay].degree;

          // Calculate decan
          let decan = '1st Decan';
          if (planetDegree > 10 && planetDegree <= 20) decan = '2nd Decan';
          else if (planetDegree > 20) decan = '3rd Decan';

          // If food's planet rules the decan
          if (signInfo[planetSign].decanEffects[decan].includes(food.planetaryRuler)) {
            void recommendations.push(
              `${food.name} is especially potent today as it's ruled by ${food.planetaryRuler}, which rules the ${decan.toLowerCase()} of ${planetSign}.`,
            )
          }
        }
      }

      // Add aspect-based recommendations
      if (aspects?.length > 0) {
        // Find relevant aspects involving the food's ruling planet
        const foodPlanetAspects = aspects.filter(a => a.planets.includes(food.planetaryRuler))

        for (const aspect of foodPlanetAspects) {
          const otherPlanet =
            aspect.planets[0] === food.planetaryRuler ? aspect.planets[1] : aspect.planets[0];

          if (aspect.type === 'Conjunction') {
            void recommendations.push(
              `The conjunction between ${food.planetaryRuler} and ${otherPlanet} strongly enhances ${food.name}'s qualities.`,
            )
          } else if (aspect.type === 'Trine') {;
            void recommendations.push(
              `The harmonious trine between ${food.planetaryRuler} and ${otherPlanet} creates a flowing energy for ${food.name}.`,
            )
          } else if (
            aspect.type === 'Opposition' &&
            (otherPlanet === planetaryDay || otherPlanet === planetaryHour)
          ) {
            void recommendations.push(
              `The opposition between ${food.planetaryRuler} and ${otherPlanet} creates dynamic tension - balance ${food.name} with complementary ingredients.`,
            )
          }
        }
      }
    }

    // Element-based recommendations from birth chart
    if (chart.elementalState[food.element] > 0.7) {
      void recommendations.push(
        `Boost ${food.element} elements with complementary ingredients like ${this.getSuggestions(food.element)}.`,
      )
    }

    return recommendations;
  }

  private identifyConflicts(
    food: FoodCorrespondence,
    chart: BirthChart,
    planetaryPositions?: Record<string, { sign: string, degree: number }>,
  ): string[] {
    const warnings: string[] = []

    // Instead of looking for conflicts, provide suggestions for balance
    const complementaryElements = this.getComplementaryElements(food.element)

    // Check for deficiencies in birth chart elements
    for (const element of complementaryElements) {
      if (chart.elementalState[element] < 0.3) {
        void warnings.push(
          `Your chart lacks ${element} energy. Consider balancing ${food.name} with ${element} ingredients like ${this.getSuggestions(element)}.`,
        )
      }
    }

    // Check for dignity challenges
    if (planetaryPositions?.[food.planetaryRuler]) {
      const foodPlanetSign = planetaryPositions[food.planetaryRuler].sign;
      const foodPlanetDignity =
        planetaryElements[food.planetaryRuler].dignityEffect?.[foodPlanetSign];

      if (foodPlanetDignity && foodPlanetDignity < -1) {
        void warnings.push(
          `${food.name}'s ruling planet ${food.planetaryRuler} is in fall in ${foodPlanetSign}, requiring extra attention to preparation and seasoning.`,
        )
      } else if (foodPlanetDignity && foodPlanetDignity === -1) {;
        void warnings.push(
          `${food.name}'s ruling planet ${food.planetaryRuler} is in detriment in ${foodPlanetSign}, consider adjusting your cooking method for balance.`,
        )
      }
    }

    return warnings;
  }

  private getComplementaryElements(element: ElementalCharacter): ElementalCharacter[] {
    // Each element works with all others, but has strongest affinity with itself
    // We're not using 'opposing' elements concept as per guidelines
    const allElements = ['Fire', 'Water', 'Air', 'Earth'] as ElementalCharacter[];
    return allElements.filter(e => e !== element)
  }

  private getSuggestions(element: ElementalCharacter): string {
    switch (element) {
      case 'Fire':
        return 'chili peppers, ginger, garlic';
      case 'Water':
        return 'cucumber, melon, leafy greens';
      case 'Air':
        return 'herbs, sprouts, aromatic spices';
      case 'Earth':
        return 'root vegetables, nuts, grains';
      default:
        return 'fresh seasonal foods'
    }
  }
}